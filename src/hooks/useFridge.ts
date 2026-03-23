import { useState, useCallback } from 'react';

const STORAGE_KEY = 'myFridge';

function loadFridge(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveFridge(fridge: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...fridge]));
}

/** Global mutable singleton so all useFridge instances stay in sync within one page load */
let _fridge: Set<string> = loadFridge();
const _listeners = new Set<() => void>();

function notify() {
  _listeners.forEach(fn => fn());
}

export function useFridge() {
  const [, forceRender] = useState(0);

  // Subscribe to external updates
  const rerender = useCallback(() => forceRender(n => n + 1), []);
  if (!_listeners.has(rerender)) {
    _listeners.add(rerender);
  }

  const has = (ingredient: string) => _fridge.has(ingredient.trim());

  const toggle = (ingredient: string) => {
    const key = ingredient.trim();
    const next = new Set(_fridge);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    _fridge = next;
    saveFridge(next);
    notify();
  };

  const clear = () => {
    _fridge = new Set();
    saveFridge(_fridge);
    notify();
  };

  /** How many of `ingredients` (array) are in the fridge */
  const matchCount = (ingredients: string[]) =>
    ingredients.filter(i => _fridge.has(i.trim())).length;

  /** 0-100 percentage */
  const matchPct = (ingredients: string[]) =>
    ingredients.length === 0
      ? 0
      : Math.round((matchCount(ingredients) / ingredients.length) * 100);

  return {
    has,
    toggle,
    clear,
    matchCount,
    matchPct,
    size: _fridge.size,
    items: Array.from(_fridge).sort()
  };
}

/** Parse a comma-separated ingredients string or array into trimmed array */
export function parseIngredients(raw: string | string[]): string[] {
  if (Array.isArray(raw)) {
    return raw.map(s => String(s).trim()).filter(Boolean);
  }
  if (typeof raw !== 'string') {
    return [];
  }
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}
