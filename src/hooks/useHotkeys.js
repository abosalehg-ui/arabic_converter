import { useEffect, useRef } from 'react';

/**
 * Global keyboard shortcuts.
 *
 * Bindings are matched on `event.code` (the physical key) rather than
 * `event.key` (the produced character). With an Arabic keyboard layout the K
 * key produces "ل", so matching on `key` silently disabled every shortcut for
 * exactly the audience this app is built for.
 *
 * @param {Array<{code: string, ctrl?: boolean, shift?: boolean, alt?: boolean,
 *                handler: (event: KeyboardEvent) => void}>} bindings
 */
export function useHotkeys(bindings) {
  const bindingsRef = useRef(bindings);

  // Assigning during render would be a side effect in the render phase; the
  // listener below only ever reads this from an event, after commit.
  useEffect(() => {
    bindingsRef.current = bindings;
  }, [bindings]);

  useEffect(() => {
    const onKeyDown = (event) => {
      for (const binding of bindingsRef.current) {
        const wantsModifier = !!binding.ctrl;
        const hasModifier = event.ctrlKey || event.metaKey;

        if (wantsModifier !== hasModifier) continue;
        if (!!binding.shift !== event.shiftKey) continue;
        if (!!binding.alt !== event.altKey) continue;
        if (event.code !== binding.code) continue;

        event.preventDefault();
        binding.handler(event);
        return;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
