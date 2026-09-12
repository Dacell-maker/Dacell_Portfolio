/**
 * Tiny pub/sub for the custom cursor.
 * Components set a cursor state, <CustomCursor /> subscribes to it.
 * Using a store (not React state) keeps 60fps — no re-render storm.
 */
export type CursorVariant = 'default' | 'link' | 'view' | 'drag' | 'hide' | 'send';

export type CursorState = {
  variant: CursorVariant;
  label?: string;
};

type Listener = (state: CursorState) => void;

const listeners = new Set<Listener>();
let current: CursorState = { variant: 'default' };

export const cursorStore = {
  get(): CursorState {
    return current;
  },
  set(state: CursorState) {
    if (state.variant === current.variant && state.label === current.label) return;
    current = state;
    listeners.forEach((listener) => listener(state));
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function setCursor(variant: CursorVariant, label?: string) {
  cursorStore.set({ variant, label });
}

export function resetCursor() {
  cursorStore.set({ variant: 'default' });
}

/**
 * Attach cursor behaviour to any element.
 *   const bind = useCursor('view', 'VIEW PROJECT');  <div {...bind} />
 */
export function cursorProps(variant: CursorVariant, label?: string) {
  return {
    onMouseEnter: () => setCursor(variant, label),
    onMouseLeave: () => resetCursor(),
    onFocus: () => setCursor(variant, label),
    onBlur: () => resetCursor(),
  };
}
