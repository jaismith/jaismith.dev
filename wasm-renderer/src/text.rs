//! Text rendering utilities

use crate::buffer::{CharBuffer, CharCell};
use crate::fonts::{FigFont, block_font};

/// Text alignment options
#[derive(Clone, Copy, Debug, PartialEq)]
pub enum TextAlign {
    Left,
    Center,
    Right,
}

/// Text style for rendering
#[derive(Clone, Debug)]
pub struct TextStyle {
    pub fg_color: u32,
    pub bg_color: u32,
    pub bold: bool,
    pub underline: bool,
    pub clickable: bool,
}

impl Default for TextStyle {
    fn default() -> Self {
        Self {
            fg_color: 0xFF000000, // Black
            bg_color: 0,          // Transparent
            bold: false,
            underline: false,
            clickable: false,
        }
    }
}

impl TextStyle {
    pub fn new(fg_color: u32) -> Self {
        Self {
            fg_color,
            ..Default::default()
        }
    }

    pub fn with_bg(mut self, bg_color: u32) -> Self {
        self.bg_color = bg_color;
        self
    }

    pub fn bold(mut self) -> Self {
        self.bold = true;
        self
    }

    pub fn underline(mut self) -> Self {
        self.underline = true;
        self
    }

    pub fn clickable(mut self) -> Self {
        self.clickable = true;
        self
    }
}

/// Render plain text at a position
pub fn render_text(
    buffer: &mut CharBuffer,
    x: u32,
    y: u32,
    text: &str,
    style: &TextStyle,
) -> u32 {
    let mut col = x;
    for ch in text.chars() {
        if col >= buffer.width() {
            break;
        }
        let mut cell = CharCell::new(ch, style.fg_color);
        cell.bg_color = style.bg_color;
        if style.bold {
            cell = cell.bold();
        }
        if style.underline {
            cell = cell.underline();
        }
        if style.clickable {
            cell = cell.clickable();
        }
        buffer.set_cell(col, y, cell);
        col += 1;
    }
    col - x
}

/// Render text with word wrapping
pub fn render_text_wrapped(
    buffer: &mut CharBuffer,
    x: u32,
    y: u32,
    width: u32,
    text: &str,
    style: &TextStyle,
) -> u32 {
    let words: Vec<&str> = text.split_whitespace().collect();
    let mut row = y;
    let mut col = x;

    for word in words {
        let word_len = word.chars().count() as u32;
        
        // Check if word fits on current line
        if col > x && col + word_len > x + width {
            // Move to next line
            row += 1;
            col = x;
        }

        // Check if we've exceeded buffer height
        if row >= buffer.height() {
            break;
        }

        // Render the word
        for ch in word.chars() {
            if col >= x + width {
                row += 1;
                col = x;
            }
            if row >= buffer.height() {
                break;
            }
            let mut cell = CharCell::new(ch, style.fg_color);
            cell.bg_color = style.bg_color;
            if style.bold {
                cell = cell.bold();
            }
            if style.underline {
                cell = cell.underline();
            }
            if style.clickable {
                cell = cell.clickable();
            }
            buffer.set_cell(col, row, cell);
            col += 1;
        }

        // Add space after word
        if col < x + width {
            col += 1;
        }
    }

    row - y + 1
}

/// Render FIGlet-style big text
pub fn render_figlet(
    buffer: &mut CharBuffer,
    x: u32,
    y: u32,
    text: &str,
    font: &FigFont,
    style: &TextStyle,
) -> (u32, u32) {
    let mut col = x;
    let height = font.height as u32;

    for ch in text.chars() {
        if let Some(fig_char) = font.get_char(ch) {
            for (line_idx, line) in fig_char.lines.iter().enumerate() {
                let row = y + line_idx as u32;
                if row >= buffer.height() {
                    continue;
                }
                let mut char_col = col;
                for glyph_char in line.chars() {
                    if char_col >= buffer.width() {
                        break;
                    }
                    // Skip hard blank
                    if glyph_char != font.hardblank && glyph_char != ' ' {
                        let mut cell = CharCell::new(glyph_char, style.fg_color);
                        cell.bg_color = style.bg_color;
                        if style.bold {
                            cell = cell.bold();
                        }
                        if style.clickable {
                            cell = cell.clickable();
                        }
                        buffer.set_cell(char_col, row, cell);
                    }
                    char_col += 1;
                }
            }
            col += fig_char.width as u32;
        } else {
            // Unknown character, use space
            col += 1;
        }
    }

    (col - x, height)
}

/// Calculate width of FIGlet text without rendering
pub fn figlet_width(text: &str, font: &FigFont) -> u32 {
    text.chars()
        .filter_map(|ch| font.get_char(ch))
        .map(|fc| fc.width as u32)
        .sum()
}

/// Render a horizontal line
pub fn render_hline(
    buffer: &mut CharBuffer,
    x: u32,
    y: u32,
    width: u32,
    style: &TextStyle,
) {
    for col in x..(x + width).min(buffer.width()) {
        buffer.set_cell(col, y, CharCell::new('─', style.fg_color));
    }
}

/// Render a box border
pub fn render_box(
    buffer: &mut CharBuffer,
    x: u32,
    y: u32,
    width: u32,
    height: u32,
    style: &TextStyle,
) {
    // Corners
    buffer.set_cell(x, y, CharCell::new('┌', style.fg_color));
    buffer.set_cell(x + width - 1, y, CharCell::new('┐', style.fg_color));
    buffer.set_cell(x, y + height - 1, CharCell::new('└', style.fg_color));
    buffer.set_cell(x + width - 1, y + height - 1, CharCell::new('┘', style.fg_color));

    // Horizontal lines
    for col in (x + 1)..(x + width - 1) {
        buffer.set_cell(col, y, CharCell::new('─', style.fg_color));
        buffer.set_cell(col, y + height - 1, CharCell::new('─', style.fg_color));
    }

    // Vertical lines
    for row in (y + 1)..(y + height - 1) {
        buffer.set_cell(x, row, CharCell::new('│', style.fg_color));
        buffer.set_cell(x + width - 1, row, CharCell::new('│', style.fg_color));
    }
}

/// Get the default block font
pub fn get_block_font() -> FigFont {
    block_font()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_render_text() {
        let mut buffer = CharBuffer::new(20, 5);
        let style = TextStyle::default();
        let width = render_text(&mut buffer, 0, 0, "Hello", &style);
        assert_eq!(width, 5);
    }
}
