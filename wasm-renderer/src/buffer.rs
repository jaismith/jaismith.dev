use wasm_bindgen::prelude::*;

/// A single character cell with its properties
#[derive(Clone, Copy, Debug)]
pub struct CharCell {
    /// The character to display
    pub ch: char,
    /// Foreground color as RGBA packed into u32
    pub fg_color: u32,
    /// Background color as RGBA packed into u32 (0 = transparent)
    pub bg_color: u32,
    /// Flags: bit 0 = bold, bit 1 = underline, bit 2 = clickable
    pub flags: u8,
}

impl Default for CharCell {
    fn default() -> Self {
        Self {
            ch: ' ',
            fg_color: 0xFF000000, // Black, fully opaque
            bg_color: 0,          // Transparent
            flags: 0,
        }
    }
}

impl CharCell {
    pub fn new(ch: char, fg_color: u32) -> Self {
        Self {
            ch,
            fg_color,
            bg_color: 0,
            flags: 0,
        }
    }

    pub fn with_bg(mut self, bg_color: u32) -> Self {
        self.bg_color = bg_color;
        self
    }

    pub fn bold(mut self) -> Self {
        self.flags |= 0x01;
        self
    }

    pub fn underline(mut self) -> Self {
        self.flags |= 0x02;
        self
    }

    pub fn clickable(mut self) -> Self {
        self.flags |= 0x04;
        self
    }

    pub fn is_bold(&self) -> bool {
        self.flags & 0x01 != 0
    }

    pub fn is_underline(&self) -> bool {
        self.flags & 0x02 != 0
    }

    pub fn is_clickable(&self) -> bool {
        self.flags & 0x04 != 0
    }
}

/// Color utilities
pub fn rgba(r: u8, g: u8, b: u8, a: u8) -> u32 {
    ((a as u32) << 24) | ((b as u32) << 16) | ((g as u32) << 8) | (r as u32)
}

pub fn rgb(r: u8, g: u8, b: u8) -> u32 {
    rgba(r, g, b, 255)
}

pub fn unpack_rgba(color: u32) -> (u8, u8, u8, u8) {
    let r = (color & 0xFF) as u8;
    let g = ((color >> 8) & 0xFF) as u8;
    let b = ((color >> 16) & 0xFF) as u8;
    let a = ((color >> 24) & 0xFF) as u8;
    (r, g, b, a)
}

/// The main character buffer
#[wasm_bindgen]
pub struct CharBuffer {
    width: u32,
    height: u32,
    cells: Vec<CharCell>,
    /// Dirty region tracking (min_x, min_y, max_x, max_y)
    dirty_region: Option<(u32, u32, u32, u32)>,
}

#[wasm_bindgen]
impl CharBuffer {
    /// Create a new buffer with given dimensions
    #[wasm_bindgen(constructor)]
    pub fn new(width: u32, height: u32) -> Self {
        let size = (width * height) as usize;
        Self {
            width,
            height,
            cells: vec![CharCell::default(); size],
            dirty_region: None,
        }
    }

    /// Get buffer width
    pub fn width(&self) -> u32 {
        self.width
    }

    /// Get buffer height
    pub fn height(&self) -> u32 {
        self.height
    }

    /// Resize the buffer
    pub fn resize(&mut self, width: u32, height: u32) {
        if self.width == width && self.height == height {
            return;
        }
        self.width = width;
        self.height = height;
        let size = (width * height) as usize;
        self.cells = vec![CharCell::default(); size];
        self.dirty_region = Some((0, 0, width, height));
    }

    /// Clear the entire buffer
    pub fn clear(&mut self) {
        for cell in &mut self.cells {
            *cell = CharCell::default();
        }
        self.dirty_region = Some((0, 0, self.width, self.height));
    }

    /// Get the index for a position
    #[inline]
    fn index(&self, x: u32, y: u32) -> Option<usize> {
        if x < self.width && y < self.height {
            Some((y * self.width + x) as usize)
        } else {
            None
        }
    }

    /// Mark a region as dirty
    fn mark_dirty(&mut self, x: u32, y: u32) {
        if let Some((min_x, min_y, max_x, max_y)) = self.dirty_region {
            self.dirty_region = Some((
                min_x.min(x),
                min_y.min(y),
                max_x.max(x + 1),
                max_y.max(y + 1),
            ));
        } else {
            self.dirty_region = Some((x, y, x + 1, y + 1));
        }
    }

    /// Clear dirty region tracking
    pub fn clear_dirty(&mut self) {
        self.dirty_region = None;
    }

    /// Check if buffer has dirty regions
    pub fn is_dirty(&self) -> bool {
        self.dirty_region.is_some()
    }

    /// Get packed buffer data for JavaScript
    /// Returns array of [char_code, fg_color, bg_color, flags] for each cell
    pub fn get_data(&self) -> Vec<u32> {
        let mut data = Vec::with_capacity(self.cells.len() * 4);
        for cell in &self.cells {
            data.push(cell.ch as u32);
            data.push(cell.fg_color);
            data.push(cell.bg_color);
            data.push(cell.flags as u32);
        }
        data
    }
}

// Non-wasm methods
impl CharBuffer {
    /// Set a character at position
    pub fn set_cell(&mut self, x: u32, y: u32, cell: CharCell) {
        if let Some(idx) = self.index(x, y) {
            self.cells[idx] = cell;
            self.mark_dirty(x, y);
        }
    }

    /// Get a character at position
    pub fn get_cell(&self, x: u32, y: u32) -> Option<&CharCell> {
        self.index(x, y).map(|idx| &self.cells[idx])
    }

    /// Get mutable reference to a cell
    pub fn get_cell_mut(&mut self, x: u32, y: u32) -> Option<&mut CharCell> {
        if let Some(idx) = self.index(x, y) {
            self.mark_dirty(x, y);
            Some(&mut self.cells[idx])
        } else {
            None
        }
    }

    /// Set a character with default styling
    pub fn set_char(&mut self, x: u32, y: u32, ch: char, fg_color: u32) {
        self.set_cell(x, y, CharCell::new(ch, fg_color));
    }

    /// Fill a region with a character
    pub fn fill_region(&mut self, x: u32, y: u32, w: u32, h: u32, cell: CharCell) {
        for dy in 0..h {
            for dx in 0..w {
                self.set_cell(x + dx, y + dy, cell);
            }
        }
    }

    /// Fill region with a single color background
    pub fn fill_bg(&mut self, x: u32, y: u32, w: u32, h: u32, bg_color: u32) {
        for dy in 0..h {
            for dx in 0..w {
                if let Some(cell) = self.get_cell_mut(x + dx, y + dy) {
                    cell.bg_color = bg_color;
                }
            }
        }
    }

    /// Clear a region
    pub fn clear_region(&mut self, x: u32, y: u32, w: u32, h: u32) {
        self.fill_region(x, y, w, h, CharCell::default());
    }

    /// Get dirty region bounds
    pub fn dirty_bounds(&self) -> Option<(u32, u32, u32, u32)> {
        self.dirty_region
    }
}
