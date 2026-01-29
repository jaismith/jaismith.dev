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
