'use client';

import { useState, useEffect, useCallback } from 'react';
import { type LogEntry } from '@/lib/types';

const LOG_STORAGE_KEY = 'commandLog';

export function useCommandLog() {
  const [log, setLog] = useState<LogEntry[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedLog = localStorage.getItem(LOG_STORAGE_KEY);
      if (storedLog) {
        setLog(JSON.parse(storedLog));
      }
    } catch (error) {
      console.error("Failed to load command log from localStorage", error);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(log));
      } catch (error) {
        console.error("Failed to save command log to localStorage", error);
      }
    }
  }, [log, isInitialized]);

  const addLogEntry = useCallback((message: string) => {
    const newEntry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      message,
    };
    setLog(prevLog => [newEntry, ...prevLog].slice(0, 100)); // Keep last 100 entries
  }, []);

  const clearLog = useCallback(() => {
    setLog([]);
  }, []);

  return { log, addLogEntry, clearLog, isInitialized };
}
