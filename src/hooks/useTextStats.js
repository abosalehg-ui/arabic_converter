import { useMemo } from 'react';

export function useTextStats(text) {
  return useMemo(() => {
    if (!text) return { chars: 0, words: 0, lines: 0 };
    const chars = Array.from(text).length;
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const lines = text.split('\n').length;
    return { chars, words, lines };
  }, [text]);
}
