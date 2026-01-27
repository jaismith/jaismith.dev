/* @ts-self-types="./ascii_renderer.d.ts" */

import * as wasm from "./ascii_renderer_bg.wasm";
import { __wbg_set_wasm } from "./ascii_renderer_bg.js";
__wbg_set_wasm(wasm);
wasm.__wbindgen_start();
export {
    CharBuffer, Renderer, create_renderer, init_panic_hook
} from "./ascii_renderer_bg.js";
