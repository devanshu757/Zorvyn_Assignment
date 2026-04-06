import { useState, useEffect } from 'react';

// Simulates a real API call with network latency.
// In production this would be replaced with a fetch/axios call to a real endpoint.
export function useMockApi<T>(data: T, delayMs = 900): { data: T | null; loading: boolean; error: string | null } {
  const [result, setResult] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      setResult(data);
      setLoading(false);
    }, delayMs);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data: result, loading, error };
}
