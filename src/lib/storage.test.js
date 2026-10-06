// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getItem, removeItem, setItem } from './storage';

describe('storage', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('round-trips JSON values', () => {
    expect(setItem('k', { a: [1, 2] })).toBe(true);
    expect(getItem('k')).toEqual({ a: [1, 2] });
    expect(setItem('flag', false)).toBe(true);
    expect(getItem('flag')).toBe(false);
  });

  it('returns raw strings that are not JSON', () => {
    setItem('lang', 'ar');
    expect(getItem('lang')).toBe('ar');
  });

  it('returns the fallback for a missing key', () => {
    expect(getItem('missing', 'fallback')).toBe('fallback');
  });

  it('reports a failed write instead of throwing (quota, private mode)', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });
    expect(setItem('k', 'v')).toBe(false);
  });

  it('returns the fallback when storage cannot be read', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    expect(getItem('k', 42)).toBe(42);
  });

  it('removes keys and ignores failures', () => {
    setItem('k', 'v');
    removeItem('k');
    expect(getItem('k')).toBeNull();
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => removeItem('k')).not.toThrow();
  });
});
