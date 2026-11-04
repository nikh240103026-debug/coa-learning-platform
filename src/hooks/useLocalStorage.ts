"use client";

import { useCallback, useSyncExternalStore } from "react";

type Cached = { raw: string | null; value: unknown };

const cache = new Map<string, Cached>();
const listeners = new Map<string, Set<() => void>>();

function readValue<T>(key: string, fallback: T): T {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    // Storage blocked: keep whatever we hold in memory for this session.
    const held = cache.get(key);
    return held ? (held.value as T) : fallback;
  }
  const held = cache.get(key);
  if (held && held.raw === raw) return held.value as T;

  let value: T = fallback;
  if (raw !== null) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = fallback;
    }
  }
  cache.set(key, { raw, value });
  return value;
}

function notify(key: string) {
  listeners.get(key)?.forEach((listener) => listener());
}

function subscribe(key: string, listener: () => void) {
  let set = listeners.get(key);
  if (!set) {
    set = new Set();
    listeners.set(key, set);
  }
  set.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === key) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    set?.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * Shared, SSR-safe localStorage state. `fallback` must be a stable reference
 * (a module-level constant or a primitive), because it is also the snapshot.
 */
export function useLocalStorage<T>(key: string, fallback: T) {
  const subscribeToKey = useCallback((listener: () => void) => subscribe(key, listener), [key]);
  const value = useSyncExternalStore(
    subscribeToKey,
    () => readValue(key, fallback),
    () => fallback
  );

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = readValue(key, fallback);
      const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      if (Object.is(resolved, prev)) return;
      const raw = JSON.stringify(resolved);
      try {
        window.localStorage.setItem(key, raw);
      } catch {
        // Quota or privacy mode: the value still lives in memory for this tab.
      }
      cache.set(key, { raw, value: resolved });
      notify(key);
    },
    [key, fallback]
  );

  return [value, setValue] as const;
}

const noopSubscribe = () => () => {};

/** False during SSR and the first client render, true afterwards. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}
