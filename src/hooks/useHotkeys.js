import { useEffect, useRef } from 'react';

// bindings: [{ ctrl?, shift?, alt?, key, handler }, ...]
export function useHotkeys(bindings) {
  const ref = useRef(bindings);
  ref.current = bindings;

  useEffect(() => {
    const onKey = (e) => {
      for (const b of ref.current) {
        const wantsMod = !!b.ctrl;
        if (wantsMod && !(e.ctrlKey || e.metaKey)) continue;
        if (!wantsMod && (e.ctrlKey || e.metaKey)) continue;
        if (b.shift && !e.shiftKey) continue;
        if (b.alt && !e.altKey) continue;
        if (e.key.toLowerCase() !== b.key.toLowerCase()) continue;
        e.preventDefault();
        b.handler(e);
        return;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
