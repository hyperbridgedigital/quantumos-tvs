'use client';
import { useState, useCallback, useRef } from 'react';

export function useKynetra() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const sendMessage = useCallback(async ({ message, context = {} }) => {
    setIsLoading(true);
    setError(null);

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const res = await fetch('/api/kynetra/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error(`Kynetra error: ${res.status}`);
      const data = await res.json();
      return data;
    } catch (err) {
      if (err.name === 'AbortError') return null;
      setError(err.message);
      return {
        message: 'I encountered an issue processing your request. Please try again.',
        suggestedActions: [],
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const executeAction = useCallback(async (action) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/kynetra/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) throw new Error(`Action error: ${res.status}`);
      return await res.json();
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getInsights = useCallback(async (type = 'all') => {
    try {
      const res = await fetch(`/api/kynetra/insights?type=${type}`);
      if (!res.ok) throw new Error(`Insights error: ${res.status}`);
      return await res.json();
    } catch (err) {
      setError(err.message);
      return { insights: [] };
    }
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
  }, []);

  return { sendMessage, executeAction, getInsights, isLoading, error, cancel };
}
