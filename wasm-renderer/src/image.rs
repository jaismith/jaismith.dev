//! Image to ASCII conversion

use crate::buffer::{CharBuffer, CharCell};

/// ASCII character ramps from dark to light
pub const RAMP_STANDARD: &str = " .:-=+*#%@";
pub const RAMP_EXTENDED: &str = " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
pub const RAMP_BLOCKS: &str = " ░▒▓█";

/// Processed ASCII image ready for rendering
#[derive(Clone, Debug)]
pub struct AsciiImage {
    /// Width in characters
    pub width: u32,
    /// Height in characters  
    pub height: u32,
    /// Character data
    pub chars: Vec<char>,
    /// Grayscale values (0-255) for potential color mapping
    pub values: Vec<u8>,
}

impl AsciiImage {
    /// Get character at position
    pub fn get(&self, x: u32, y: u32) -> Option<char> {
        if x < self.width && y < self.height {
            Some(self.chars[(y * self.width + x) as usize])
        } else {
            None
        }
    }

    /// Get grayscale value at position
    pub fn get_value(&self, x: u32, y: u32) -> Option<u8> {
        if x < self.width && y < self.height {
            Some(self.values[(y * self.width + x) as usize])
        } else {
            None
        }
    }
}

/// Convert RGBA pixel data to ASCII art
/// 
/// # Arguments
/// * `data` - Raw RGBA pixel data (4 bytes per pixel)
/// * `img_width` - Image width in pixels
/// * `img_height` - Image height in pixels
/// * `target_width` - Target width in characters
/// * `ramp` - Character ramp to use (dark to light)
/// * `invert` - Invert the brightness mapping
pub fn image_to_ascii(
    data: &[u8],
    img_width: u32,
    img_height: u32,
    target_width: u32,
    ramp: &str,
    invert: bool,
) -> AsciiImage {
    let ramp_chars: Vec<char> = ramp.chars().collect();
    let ramp_len = ramp_chars.len();
    
    if ramp_len == 0 || target_width == 0 || img_width == 0 || img_height == 0 {
        return AsciiImage {
            width: 0,
            height: 0,
            chars: vec![],
            values: vec![],
        };
    }

    // Calculate character cell size
    // Characters are typically ~2x taller than wide, so we sample more vertical pixels
    let char_width = img_width as f32 / target_width as f32;
    let char_height = char_width * 2.0; // Adjust for character aspect ratio
    let target_height = (img_height as f32 / char_height).ceil() as u32;

    let mut chars = Vec::with_capacity((target_width * target_height) as usize);
    let mut values = Vec::with_capacity((target_width * target_height) as usize);

    for cy in 0..target_height {
        for cx in 0..target_width {
            // Calculate the pixel region for this character
            let px_start = (cx as f32 * char_width) as u32;
            let py_start = (cy as f32 * char_height) as u32;
            let px_end = ((cx + 1) as f32 * char_width) as u32;
            let py_end = ((cy + 1) as f32 * char_height) as u32;

            // Average the pixel values in this region
            let mut total_gray: u32 = 0;
            let mut count: u32 = 0;

            for py in py_start..py_end.min(img_height) {
                for px in px_start..px_end.min(img_width) {
                    let idx = ((py * img_width + px) * 4) as usize;
                    if idx + 3 < data.len() {
                        let r = data[idx] as u32;
                        let g = data[idx + 1] as u32;
                        let b = data[idx + 2] as u32;
                        let a = data[idx + 3] as u32;

                        // Skip fully transparent pixels
                        if a < 10 {
                            continue;
                        }

                        // Perceptual grayscale conversion
                        // Using BT.709 coefficients
                        let gray = (r * 2126 + g * 7152 + b * 722) / 10000;
                        total_gray += gray;
                        count += 1;
                    }
                }
            }

            // Calculate average grayscale
            let avg_gray = if count > 0 {
                (total_gray / count) as u8
            } else {
                255 // Transparent = white/light
            };

            // Map to character
            let brightness = if invert { 255 - avg_gray } else { avg_gray };
            let char_idx = (brightness as usize * (ramp_len - 1)) / 255;
            let ch = ramp_chars[char_idx.min(ramp_len - 1)];

            chars.push(ch);
            values.push(brightness);
        }
    }

    AsciiImage {
        width: target_width,
        height: target_height,
        chars,
        values,
    }
}

/// Render an ASCII image to the buffer
pub fn render_ascii_image(
    buffer: &mut CharBuffer,
    x: u32,
    y: u32,
    image: &AsciiImage,
    fg_color: u32,
) {
    for iy in 0..image.height {
        for ix in 0..image.width {
            if let Some(ch) = image.get(ix, iy) {
                let bx = x + ix;
                let by = y + iy;
                if bx < buffer.width() && by < buffer.height() {
                    buffer.set_cell(bx, by, CharCell::new(ch, fg_color));
                }
            }
        }
    }
}

/// Render an ASCII image with brightness-based coloring
pub fn render_ascii_image_colored(
    buffer: &mut CharBuffer,
    x: u32,
    y: u32,
    image: &AsciiImage,
    base_color: u32,
) {
    use crate::buffer::unpack_rgba;
    
    let (r, g, b, _) = unpack_rgba(base_color);
    
    for iy in 0..image.height {
        for ix in 0..image.width {
            if let (Some(ch), Some(val)) = (image.get(ix, iy), image.get_value(ix, iy)) {
                let bx = x + ix;
                let by = y + iy;
                if bx < buffer.width() && by < buffer.height() {
                    // Modulate color by brightness
                    let factor = val as f32 / 255.0;
                    let nr = (r as f32 * factor) as u8;
                    let ng = (g as f32 * factor) as u8;
                    let nb = (b as f32 * factor) as u8;
                    let color = crate::buffer::rgba(nr, ng, nb, 255);
                    buffer.set_cell(bx, by, CharCell::new(ch, color));
                }
            }
        }
    }
}

/// Simple resize of image data using nearest neighbor
pub fn resize_image_data(
    data: &[u8],
    src_width: u32,
    src_height: u32,
    dst_width: u32,
    dst_height: u32,
) -> Vec<u8> {
    let mut result = vec![0u8; (dst_width * dst_height * 4) as usize];
    
    let x_ratio = src_width as f32 / dst_width as f32;
    let y_ratio = src_height as f32 / dst_height as f32;
    
    for y in 0..dst_height {
        for x in 0..dst_width {
            let src_x = (x as f32 * x_ratio) as u32;
            let src_y = (y as f32 * y_ratio) as u32;
            
            let src_idx = ((src_y * src_width + src_x) * 4) as usize;
            let dst_idx = ((y * dst_width + x) * 4) as usize;
            
            if src_idx + 3 < data.len() && dst_idx + 3 < result.len() {
                result[dst_idx] = data[src_idx];
                result[dst_idx + 1] = data[src_idx + 1];
                result[dst_idx + 2] = data[src_idx + 2];
                result[dst_idx + 3] = data[src_idx + 3];
            }
        }
    }
    
    result
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_image_to_ascii_basic() {
        // Create a simple 4x4 gradient image
        let mut data = Vec::new();
        for y in 0..4 {
            for x in 0..4 {
                let gray = ((x + y) * 255 / 6) as u8;
                data.extend_from_slice(&[gray, gray, gray, 255]);
            }
        }
        
        let result = image_to_ascii(&data, 4, 4, 4, RAMP_STANDARD, false);
        assert!(result.width == 4);
        assert!(result.height > 0);
    }
}
