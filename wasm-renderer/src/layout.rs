//! Layout engine for positioning content

use serde::{Deserialize, Serialize};

/// A rectangle in character coordinates
#[derive(Clone, Copy, Debug, Default, Serialize, Deserialize)]
pub struct Rect {
    pub x: u32,
    pub y: u32,
    pub width: u32,
    pub height: u32,
}

impl Rect {
    pub fn new(x: u32, y: u32, width: u32, height: u32) -> Self {
        Self { x, y, width, height }
    }

    pub fn contains(&self, px: u32, py: u32) -> bool {
        px >= self.x && px < self.x + self.width && py >= self.y && py < self.y + self.height
    }

    pub fn right(&self) -> u32 {
        self.x + self.width
    }

    pub fn bottom(&self) -> u32 {
        self.y + self.height
    }
}

/// Spacing values
#[derive(Clone, Copy, Debug, Default, Serialize, Deserialize)]
pub struct Spacing {
    pub top: u32,
    pub right: u32,
    pub bottom: u32,
    pub left: u32,
}

impl Spacing {
    pub fn all(value: u32) -> Self {
        Self {
            top: value,
            right: value,
            bottom: value,
            left: value,
        }
    }

    pub fn vertical(v: u32) -> Self {
        Self {
            top: v,
            right: 0,
            bottom: v,
            left: 0,
        }
    }

    pub fn horizontal(h: u32) -> Self {
        Self {
            top: 0,
            right: h,
            bottom: 0,
            left: h,
        }
    }

    pub fn symmetric(v: u32, h: u32) -> Self {
        Self {
            top: v,
            right: h,
            bottom: v,
            left: h,
        }
    }
}

/// Responsive breakpoints
#[derive(Clone, Copy, Debug, PartialEq)]
pub enum Breakpoint {
    Mobile,   // < 60 cols
    Tablet,   // 60-100 cols
    Desktop,  // >= 100 cols
}

impl Breakpoint {
    pub fn from_width(width: u32) -> Self {
        if width < 60 {
            Breakpoint::Mobile
        } else if width < 100 {
            Breakpoint::Tablet
        } else {
            Breakpoint::Desktop
        }
    }
}

/// Layout context for rendering
#[derive(Clone, Debug)]
pub struct LayoutContext {
    /// Total viewport width in characters
    pub viewport_width: u32,
    /// Total viewport height in characters
    pub viewport_height: u32,
    /// Current scroll offset (in characters)
    pub scroll_y: u32,
    /// Current breakpoint
    pub breakpoint: Breakpoint,
    /// Content area (excluding fixed elements)
    pub content_area: Rect,
}

impl LayoutContext {
    pub fn new(viewport_width: u32, viewport_height: u32) -> Self {
        let breakpoint = Breakpoint::from_width(viewport_width);
        Self {
            viewport_width,
            viewport_height,
            scroll_y: 0,
            breakpoint,
            content_area: Rect::new(0, 0, viewport_width, viewport_height),
        }
    }

    pub fn with_scroll(mut self, scroll_y: u32) -> Self {
        self.scroll_y = scroll_y;
        self
    }

    /// Check if a y position is visible in the viewport
    pub fn is_visible(&self, y: u32, height: u32) -> bool {
        let view_start = self.scroll_y;
        let view_end = self.scroll_y + self.viewport_height;
        let item_end = y + height;
        
        // Item is visible if it overlaps with viewport
        y < view_end && item_end > view_start
    }

    /// Convert document y to viewport y
    pub fn to_viewport_y(&self, doc_y: u32) -> i32 {
        doc_y as i32 - self.scroll_y as i32
    }

    /// Get padding based on breakpoint
    pub fn get_padding(&self) -> Spacing {
        match self.breakpoint {
            Breakpoint::Mobile => Spacing::symmetric(1, 1),
            Breakpoint::Tablet => Spacing::symmetric(2, 3),
            Breakpoint::Desktop => Spacing::symmetric(2, 5),
        }
    }

    /// Get content width based on breakpoint (with max-width for desktop)
    pub fn get_content_width(&self) -> u32 {
        let padding = self.get_padding();
        let available = self.viewport_width.saturating_sub(padding.left + padding.right);
        
        match self.breakpoint {
            Breakpoint::Mobile => available,
            Breakpoint::Tablet => available.min(90),
            Breakpoint::Desktop => available.min(120),
        }
    }

    /// Get centered x position for content
    pub fn get_content_x(&self) -> u32 {
        let content_width = self.get_content_width();
        let padding = self.get_padding();
        let available = self.viewport_width.saturating_sub(padding.left + padding.right);
        
        padding.left + (available.saturating_sub(content_width)) / 2
    }
}

/// Layout builder for stacking content vertically
#[derive(Clone, Debug)]
pub struct VerticalLayout {
    pub x: u32,
    pub y: u32,
    pub width: u32,
    pub cursor_y: u32,
    pub spacing: u32,
}

impl VerticalLayout {
    pub fn new(x: u32, y: u32, width: u32) -> Self {
        Self {
            x,
            y,
            width,
            cursor_y: y,
            spacing: 1,
        }
    }

    pub fn with_spacing(mut self, spacing: u32) -> Self {
        self.spacing = spacing;
        self
    }

    /// Reserve space and return the rectangle
    pub fn push(&mut self, height: u32) -> Rect {
        let rect = Rect::new(self.x, self.cursor_y, self.width, height);
        self.cursor_y += height + self.spacing;
        rect
    }

    /// Add vertical space
    pub fn add_space(&mut self, space: u32) {
        self.cursor_y += space;
    }

    /// Get total height consumed
    pub fn total_height(&self) -> u32 {
        self.cursor_y.saturating_sub(self.y)
    }

    /// Get current y position
    pub fn current_y(&self) -> u32 {
        self.cursor_y
    }
}

/// Two-column layout helper
#[derive(Clone, Debug)]
pub struct TwoColumnLayout {
    pub x: u32,
    pub y: u32,
    pub total_width: u32,
    pub left_width: u32,
    pub right_width: u32,
    pub gap: u32,
}

impl TwoColumnLayout {
    pub fn new(x: u32, y: u32, total_width: u32, left_ratio: f32, gap: u32) -> Self {
        let left_width = ((total_width - gap) as f32 * left_ratio) as u32;
        let right_width = total_width - left_width - gap;
        Self {
            x,
            y,
            total_width,
            left_width,
            right_width,
            gap,
        }
    }

    pub fn left_rect(&self, height: u32) -> Rect {
        Rect::new(self.x, self.y, self.left_width, height)
    }

    pub fn right_rect(&self, height: u32) -> Rect {
        Rect::new(self.x + self.left_width + self.gap, self.y, self.right_width, height)
    }

    pub fn left_x(&self) -> u32 {
        self.x
    }

    pub fn right_x(&self) -> u32 {
        self.x + self.left_width + self.gap
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_rect_contains() {
        let rect = Rect::new(10, 10, 20, 20);
        assert!(rect.contains(15, 15));
        assert!(!rect.contains(5, 15));
        assert!(!rect.contains(35, 15));
    }

    #[test]
    fn test_vertical_layout() {
        let mut layout = VerticalLayout::new(0, 0, 100);
        let r1 = layout.push(10);
        let r2 = layout.push(5);
        
        assert_eq!(r1.y, 0);
        assert_eq!(r1.height, 10);
        assert_eq!(r2.y, 11); // 10 + 1 spacing
    }
}
