/* tslint:disable */
/* eslint-disable */

/**
 * The main character buffer
 */
export class CharBuffer {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Clear the entire buffer
     */
    clear(): void;
    /**
     * Clear dirty region tracking
     */
    clear_dirty(): void;
    /**
     * Get packed buffer data for JavaScript
     * Returns array of [char_code, fg_color, bg_color, flags] for each cell
     */
    get_data(): Uint32Array;
    /**
     * Get buffer height
     */
    height(): number;
    /**
     * Check if buffer has dirty regions
     */
    is_dirty(): boolean;
    /**
     * Create a new buffer with given dimensions
     */
    constructor(width: number, height: number);
    /**
     * Resize the buffer
     */
    resize(width: number, height: number): void;
    /**
     * Get buffer width
     */
    width(): number;
}

/**
 * The main renderer
 */
export class Renderer {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Get total content height
     */
    get_content_height(): number;
    /**
     * Get buffer height
     */
    get_height(): number;
    /**
     * Get current scroll position
     */
    get_scroll(): number;
    /**
     * Get buffer width
     */
    get_width(): number;
    /**
     * Hit test at a position (returns JSON action or null)
     */
    hit_test(x: number, y: number): string | undefined;
    /**
     * Check if a position is hoverable
     */
    is_hoverable(x: number, y: number): boolean;
    /**
     * Load an image for ASCII conversion
     */
    load_image(id: string, data: Uint8Array, width: number, height: number): void;
    /**
     * Create a new renderer with given dimensions
     */
    constructor(cols: number, rows: number);
    /**
     * Render and return the buffer data
     */
    render(): Uint32Array;
    /**
     * Resize the viewport
     */
    resize(cols: number, rows: number): void;
    /**
     * Set the page content from JSON
     */
    set_content(json: string): void;
    /**
     * Set hover position
     */
    set_hover(x: number, y: number): void;
    /**
     * Set the current scroll position
     */
    set_scroll(scroll_y: number): void;
}

/**
 * Create a new renderer instance
 */
export function create_renderer(cols: number, rows: number): Renderer;

/**
 * Initialize panic hook for better error messages in console
 */
export function init_panic_hook(): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_renderer_free: (a: number, b: number) => void;
    readonly renderer_new: (a: number, b: number) => number;
    readonly renderer_resize: (a: number, b: number, c: number) => void;
    readonly renderer_set_scroll: (a: number, b: number) => void;
    readonly renderer_get_scroll: (a: number) => number;
    readonly renderer_get_content_height: (a: number) => number;
    readonly renderer_set_hover: (a: number, b: number, c: number) => void;
    readonly renderer_set_content: (a: number, b: number, c: number) => [number, number];
    readonly renderer_load_image: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
    readonly renderer_hit_test: (a: number, b: number, c: number) => [number, number];
    readonly renderer_is_hoverable: (a: number, b: number, c: number) => number;
    readonly renderer_render: (a: number) => [number, number];
    readonly renderer_get_width: (a: number) => number;
    readonly renderer_get_height: (a: number) => number;
    readonly __wbg_charbuffer_free: (a: number, b: number) => void;
    readonly charbuffer_new: (a: number, b: number) => number;
    readonly charbuffer_width: (a: number) => number;
    readonly charbuffer_height: (a: number) => number;
    readonly charbuffer_resize: (a: number, b: number, c: number) => void;
    readonly charbuffer_clear: (a: number) => void;
    readonly charbuffer_clear_dirty: (a: number) => void;
    readonly charbuffer_is_dirty: (a: number) => number;
    readonly charbuffer_get_data: (a: number) => [number, number];
    readonly init_panic_hook: () => void;
    readonly create_renderer: (a: number, b: number) => number;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
