import { useState, useEffect, useCallback } from "react";


const STORAGE_KEY = "read_chapters";


export function useReadChapters() {
  const [readChapters, setReadChapters] = useState<Set<number>>(new Set());

  // Load from localStorage once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw) as number[];
        setReadChapters(new Set(arr));
      }
    } catch {
      setReadChapters(new Set());
    }
  }, []);

  // Save Set to localStorage as array
  const saveToStorage = useCallback((setValue: Set<number>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...setValue]));
    } catch {
      /* ignore */
    }
  }, []);

  // Add a chapter if not present
  const markAsRead = useCallback(
    (id: number) => {
      setReadChapters(prev => {
        if (prev.has(id)) return prev;

        const updated = new Set(prev);
        updated.add(id);

        saveToStorage(updated);
        return updated;
      });
    },
    [saveToStorage]
  );

  // Check if chapter is already read
  const isRead = useCallback(
    (id: number) => readChapters.has(id),
    [readChapters]
  );

  // Sync across tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const arr = JSON.parse(e.newValue) as number[];
        setReadChapters(new Set(arr));
      }
    };

    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return {
    readChapters,
    markAsRead,
    isRead,
  };
}
