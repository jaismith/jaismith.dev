import { useState, useEffect, useRef } from 'react';
import type { AsciiRenderer } from './types';

interface UseWasmResult {
  renderer: AsciiRenderer | null;
  loading: boolean;
  error: Error | null;
}

// Global to track if WASM has been loaded
let wasmModule: { create_renderer: (cols: number, rows: number) => AsciiRenderer } | null = null;
let wasmLoadPromise: Promise<typeof wasmModule> | null = null;

async function loadWasmModule(): Promise<typeof wasmModule> {
  if (wasmModule) return wasmModule;
  if (wasmLoadPromise) return wasmLoadPromise;
  
  wasmLoadPromise = (async () => {
    const jsUrl = '/wasm/ascii_renderer.js';
    const wasmUrl = '/wasm/ascii_renderer_bg.wasm';
    
    // Dynamic import the ES module
    const wasmMod = await import(/* webpackIgnore: true */ jsUrl);
    
    // Initialize with WASM URL - the module will fetch it
    await wasmMod.default(wasmUrl);
    
    wasmModule = wasmMod;
    return wasmModule;
  })();
  
  return wasmLoadPromise;
}

export function useWasm(cols: number, rows: number): UseWasmResult {
  const [renderer, setRenderer] = useState<AsciiRenderer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    async function initWasm() {
      try {
        const wasmMod = await loadWasmModule();
        
        if (!wasmMod) {
          throw new Error('WASM module failed to load');
        }
        
        // Create renderer instance
        const instance = wasmMod.create_renderer(cols, rows);
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
