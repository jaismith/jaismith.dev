// WASM module loader for Next.js
// This file re-exports from the wasm-bindgen generated module

export type { Renderer as AsciiRenderer } from './ascii_renderer_bg.js';
export { create_renderer, Renderer } from './ascii_renderer';

export async function createRenderer(cols: number, rows: number) {
  const { create_renderer } = await import('./ascii_renderer');
  return create_renderer(cols, rows);
}
