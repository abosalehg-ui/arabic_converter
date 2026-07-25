import { useCallback, useEffect, useRef, useState } from 'react';
import converter from '../lib/arabicConverter';

/**
 * Inputs shorter than this are converted synchronously: spawning a worker and
 * round-tripping the message costs more than the conversion itself, and the
 * result should feel instant while typing.
 */
const SYNC_THRESHOLD = 50_000;

const SYNC_PROCESSORS = {
  text: (input) => converter.convertText(input),
  color: (input) => converter.processColorTags(input),
  quoted: (input) => converter.processQuotedText(input),
};

/**
 * Runs conversions in a Web Worker, falling back to synchronous work when
 * workers are unavailable (older browsers, restrictive environments).
 *
 * @returns {{run: (content: string, mode: string) => Promise<string>,
 *            busy: boolean, progress: number}}
 */
export function useConverterWorker() {
  const workerRef = useRef(null);
  const pendingRef = useRef(new Map());
  const nextIdRef = useRef(0);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);

  const getWorker = useCallback(() => {
    if (workerRef.current !== null) return workerRef.current;

    try {
      const worker = new Worker(new URL('../lib/converter.worker.js', import.meta.url), {
        type: 'module',
      });

      worker.onmessage = (event) => {
        const { id, type, value, result, message } = event.data;
        const pending = pendingRef.current.get(id);
        if (!pending) return;

        if (type === 'progress') {
          setProgress(value);
          return;
        }

        pendingRef.current.delete(id);
        if (pendingRef.current.size === 0) setBusy(false);

        if (type === 'done') pending.resolve(result);
        else pending.reject(new Error(message));
      };

      worker.onerror = () => {
        for (const pending of pendingRef.current.values()) {
          pending.reject(new Error('worker failed'));
        }
        pendingRef.current.clear();
        setBusy(false);
      };

      workerRef.current = worker;
      return worker;
    } catch {
      workerRef.current = false; // remembered failure: use the sync path
      return false;
    }
  }, []);

  useEffect(
    () => () => {
      if (workerRef.current) workerRef.current.terminate();
      workerRef.current = null;
      pendingRef.current.clear();
    },
    []
  );

  const run = useCallback(
    (content, mode) => {
      const processSync = SYNC_PROCESSORS[mode];

      if (content.length < SYNC_THRESHOLD) {
        return Promise.resolve(processSync(content));
      }

      const worker = getWorker();
      if (!worker) return Promise.resolve(processSync(content));

      const id = nextIdRef.current++;
      setBusy(true);
      setProgress(0);

      return new Promise((resolve, reject) => {
        pendingRef.current.set(id, { resolve, reject });
        worker.postMessage({ id, mode, content });
      });
    },
    [getWorker]
  );

  return { run, busy, progress };
}
