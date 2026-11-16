"use client";

import { useCallback, useSyncExternalStore } from "react";

const storageKey = "buildwithme:sidebar-collapsed";
const changeEvent = "buildwithme:sidebar-change";
let memoryPreference = false;

function getSnapshot() {
  try {
    return window.localStorage.getItem(storageKey) === "true";
  } catch {
    return memoryPreference;
  }
}

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === null) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(changeEvent, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(changeEvent, onChange);
  };
}

export function useSidebarPreference() {
  const collapsed = useSyncExternalStore(subscribe, getSnapshot, () => false);
  const toggle = useCallback(() => {
    memoryPreference = !getSnapshot();
    try {
      window.localStorage.setItem(storageKey, String(memoryPreference));
    } catch {
      // Collapsing still works when browser storage is unavailable.
    }
    window.dispatchEvent(new Event(changeEvent));
  }, []);
  return [collapsed, toggle] as const;
}
