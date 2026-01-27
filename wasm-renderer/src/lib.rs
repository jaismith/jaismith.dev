mod buffer;
mod chart;
mod fonts;
mod hit_test;
mod image;
mod layout;
mod renderer;
mod text;

use wasm_bindgen::prelude::*;

pub use buffer::{CharBuffer, CharCell, rgb, rgba};
pub use chart::{ChartConfig, DataPoint};
pub use hit_test::{HitAction, HitTestMap};
pub use image::{AsciiImage, image_to_ascii, RAMP_STANDARD, RAMP_EXTENDED, RAMP_BLOCKS};
pub use layout::{LayoutContext, Rect, Breakpoint};
pub use renderer::{Renderer, SiteContent, PageType, Theme};
pub use text::{TextStyle, TextAlign};
pub use fonts::{FigFont, block_font};

/// Initialize panic hook for better error messages in console
#[wasm_bindgen(start)]
pub fn init_panic_hook() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

/// Create a new renderer instance
#[wasm_bindgen]
pub fn create_renderer(cols: u32, rows: u32) -> Renderer {
    Renderer::new(cols, rows)
}
