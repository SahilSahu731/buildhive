"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "./hive";
export function useResource<T>(path: string, interval = 0) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState("");
  const [resolvedPath, setResolvedPath] = useState("");
  const request = useRef(0);
  const refresh = useCallback(async () => {
    const id = ++request.current;
    try {
      const result = await api<T>(path);
      if (id === request.current) {
        setData(result);
        setError("");
        setResolvedPath(path);
      }
    } catch (e) {
      if (id === request.current) {
        setData(undefined);
        setError((e as Error).message);
        setResolvedPath(path);
      }
    }
  }, [path]);
  useEffect(() => {
    const initial = setTimeout(() => void refresh(), 0);
    const timer = interval
      ? setInterval(() => void refresh(), interval)
      : undefined;
    return () => {
      clearTimeout(initial);
      if (timer) clearInterval(timer);
    };
  }, [refresh, interval]);
  return {
    data: resolvedPath === path ? data : undefined,
    error: resolvedPath === path ? error : "",
    loading: resolvedPath !== path,
    refresh,
    setData,
  };
}
