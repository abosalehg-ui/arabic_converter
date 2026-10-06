// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useConverterWorker } from './useConverterWorker';
import { PROCESSORS } from '../lib/arabicConverter';

/** Larger than the hook's synchronous threshold, so the worker path is taken. */
const LARGE = 'مرحبا بكم\n'.repeat(6000);

/** A controllable stand-in for the browser Worker. */
class FakeWorker {
  static instances = [];

  constructor() {
    this.messages = [];
    this.terminated = false;
    FakeWorker.instances.push(this);
  }

  postMessage(message) {
    this.messages.push(message);
  }

  terminate() {
    this.terminated = true;
  }

  /** Answers the last job the way converter.worker.js would. */
  finish() {
    const { id, mode, content } = this.messages.at(-1);
    this.onmessage({ data: { id, type: 'done', result: PROCESSORS[mode](content) } });
  }

  crash() {
    this.onerror(new Event('error'));
  }
}

describe('useConverterWorker', () => {
  afterEach(() => {
    FakeWorker.instances = [];
    vi.unstubAllGlobals();
  });

  it('converts small inputs synchronously without a worker', async () => {
    vi.stubGlobal('Worker', FakeWorker);
    const { result } = renderHook(() => useConverterWorker());

    await expect(result.current.run('مرحبا', 'text')).resolves.toBe(
      PROCESSORS.text('مرحبا')
    );
    expect(FakeWorker.instances).toHaveLength(0);
  });

  it('falls back to synchronous work when workers are unavailable', async () => {
    vi.stubGlobal('Worker', undefined);
    const { result } = renderHook(() => useConverterWorker());

    await expect(result.current.run(LARGE, 'text')).resolves.toBe(PROCESSORS.text(LARGE));
  });

  it('runs large inputs in a worker and reports busy while it works', async () => {
    vi.stubGlobal('Worker', FakeWorker);
    const { result } = renderHook(() => useConverterWorker());

    let promise;
    act(() => {
      promise = result.current.run(LARGE, 'quoted');
    });
    expect(result.current.busy).toBe(true);

    act(() => FakeWorker.instances[0].finish());
    await expect(promise).resolves.toBe(PROCESSORS.quoted(LARGE));
    expect(result.current.busy).toBe(false);
  });

  it('replaces a crashed worker instead of reusing it (regression)', async () => {
    vi.stubGlobal('Worker', FakeWorker);
    const { result } = renderHook(() => useConverterWorker());

    let failed;
    act(() => {
      failed = result.current.run(LARGE, 'text');
    });
    act(() => FakeWorker.instances[0].crash());
    await expect(failed).rejects.toThrow('worker failed');
    expect(FakeWorker.instances[0].terminated).toBe(true);
    expect(result.current.busy).toBe(false);

    let retried;
    act(() => {
      retried = result.current.run(LARGE, 'text');
    });
    expect(FakeWorker.instances).toHaveLength(2);
    act(() => FakeWorker.instances[1].finish());
    await expect(retried).resolves.toBe(PROCESSORS.text(LARGE));
  });
});
