import { useState, useEffect, useRef } from 'react';
import type { Renderer } from 'lib/wasm/ascii_renderer';

interface UseWasmResult {
  renderer: Renderer | null;
  loading: boolean;
  error: Error | null;
}

export function useWasm(cols: number, rows: number): UseWasmResult {
  const [renderer, setRenderer] = useState<Renderer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    async function initWasm() {
      try {
        // Dynamic import the WASM loader
        const { create_renderer } = await import('lib/wasm');
        
        // Create renderer instance
        const instance = create_renderer(cols, rows);
        setRenderer(instance);
        setLoading(false);
      } catch (err) {
        console.error('Failed to initialize WASM:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    }

    initWasm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle resize
  useEffect(() => {
    if (renderer && cols > 0 && rows > 0) {
      renderer.resize(cols, rows);
    }
  }, [renderer, cols, rows]);

  return { renderer, loading, error };
}

export default useWasm;
