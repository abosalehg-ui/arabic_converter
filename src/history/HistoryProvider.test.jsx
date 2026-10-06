// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { HistoryProvider, useHistory } from './HistoryProvider';

const HISTORY = 'ac-history';
const ENABLED = 'ac-history-enabled';

const renderHistory = () => renderHook(() => useHistory(), { wrapper: HistoryProvider });

const validEntry = (overrides = {}) => ({
  id: 'a',
  ts: 1,
  type: 'text',
  input: 'نص',
  output: 'صن',
  ...overrides,
});

describe('HistoryProvider', () => {
  afterEach(() => localStorage.clear());

  it('does not save to disk by default (opt-in)', () => {
    const { result } = renderHistory();
    expect(result.current.persist).toBe(false);

    act(() => result.current.addEntry({ type: 'text', input: 'نص', output: 'صن' }));

    expect(result.current.entries).toHaveLength(1);
    expect(localStorage.getItem(HISTORY)).toBeNull();
  });

  it('keeps saving for users who already had history from an earlier version', () => {
    localStorage.setItem(HISTORY, JSON.stringify([validEntry()]));
    const { result } = renderHistory();
    expect(result.current.persist).toBe(true);
    expect(result.current.entries).toHaveLength(1);
  });

  it('saves entries once persistence is turned on', () => {
    const { result } = renderHistory();
    act(() => result.current.setPersist(true));
    act(() => result.current.addEntry({ type: 'text', input: 'نص', output: 'صن' }));

    expect(localStorage.getItem(ENABLED)).toBe('true');
    expect(JSON.parse(localStorage.getItem(HISTORY))).toHaveLength(1);
  });

  it('wipes stored history when persistence is turned off', () => {
    localStorage.setItem(ENABLED, 'true');
    localStorage.setItem(HISTORY, JSON.stringify([validEntry()]));
    const { result } = renderHistory();

    act(() => result.current.setPersist(false));

    expect(localStorage.getItem(HISTORY)).toBeNull();
    expect(localStorage.getItem(ENABLED)).toBe('false');
  });

  it('drops malformed entries read from storage', () => {
    localStorage.setItem(ENABLED, 'true');
    localStorage.setItem(
      HISTORY,
      JSON.stringify([
        validEntry(),
        validEntry({ id: 1 }),
        validEntry({ type: 'evil' }),
        validEntry({ input: { html: '<img>' } }),
        validEntry({ ts: 'yesterday' }),
        null,
      ])
    );
    const { result } = renderHistory();
    expect(result.current.entries).toEqual([validEntry()]);
  });

  it('ignores a non-array history value', () => {
    localStorage.setItem(ENABLED, 'true');
    localStorage.setItem(HISTORY, JSON.stringify({ not: 'an array' }));
    const { result } = renderHistory();
    expect(result.current.entries).toEqual([]);
  });

  it('caps the history at 50 entries, newest first', () => {
    const { result } = renderHistory();
    for (let i = 0; i < 55; i++) {
      act(() =>
        result.current.addEntry({ type: 'text', input: `in${i}`, output: `out${i}` })
      );
    }
    expect(result.current.entries).toHaveLength(50);
    expect(result.current.entries[0].input).toBe('in54');
  });

  it('removes a single entry and clears all', () => {
    const { result } = renderHistory();
    act(() => result.current.addEntry({ type: 'text', input: 'a', output: 'b' }));
    act(() => result.current.addEntry({ type: 'text', input: 'c', output: 'd' }));

    act(() => result.current.removeEntry(result.current.entries[0].id));
    expect(result.current.entries.map((e) => e.input)).toEqual(['a']);

    act(() => result.current.clearAll());
    expect(result.current.entries).toEqual([]);
  });
});
