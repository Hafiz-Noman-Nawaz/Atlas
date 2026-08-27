import { useCallback, useEffect, useRef } from 'react';

/**
 * Auto-resize a textarea to fit its content.
 * Returns a ref to attach to the textarea element.
 */
export function useAutoResize(maxHeight = 200) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, [maxHeight]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener('input', resize);
    return () => el.removeEventListener('input', resize);
  }, [resize]);

  return { ref, resize };
}
