"use client";

import { useEffect, useRef } from "react";

/** Chama `onOutside` quando o usuário clica fora do elemento (fecha menus/dropdowns). */
export function useClickOutside<T extends HTMLElement>(onOutside: () => void) {
  const ref = useRef<T>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onOutside]);

  return ref;
}
