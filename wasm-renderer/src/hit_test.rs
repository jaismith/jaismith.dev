//! Hit testing for interactive elements

use crate::layout::Rect;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Types of actions that can be triggered
#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum HitAction {
    /// Navigate to an internal route
    Navigate(String),
    /// Open an external URL
    OpenUrl(String),
    /// Scroll to a section
    ScrollTo(String),
    /// Custom action with ID
    Custom(String),
}

/// A clickable region
#[derive(Clone, Debug)]
pub struct HitRegion {
    pub rect: Rect,
    pub action: HitAction,
    pub hover_effect: bool,
}

/// Manages hit testing for the entire document
#[derive(Default)]
pub struct HitTestMap {
    regions: Vec<HitRegion>,
    /// Cached grid for fast lookups (optional optimization)
    grid: Option<HitGrid>,
}

impl HitTestMap {
    pub fn new() -> Self {
        Self {
            regions: Vec::new(),
            grid: None,
        }
    }

    /// Clear all regions
    pub fn clear(&mut self) {
        self.regions.clear();
        self.grid = None;
    }

    /// Register a clickable region
    pub fn register(&mut self, rect: Rect, action: HitAction, hover_effect: bool) {
        self.regions.push(HitRegion {
            rect,
            action,
            hover_effect,
        });
        // Invalidate grid cache
        self.grid = None;
    }

    /// Register a link (common case)
    pub fn register_link(&mut self, rect: Rect, url: &str) {
        let action = if url.starts_with('/') {
            HitAction::Navigate(url.to_string())
        } else {
            HitAction::OpenUrl(url.to_string())
        };
        self.register(rect, action, true);
    }

    /// Test a point and return the action if any
    pub fn test(&self, x: u32, y: u32) -> Option<&HitAction> {
        // Simple linear search for now
        // Could use grid for optimization if needed
        for region in self.regions.iter().rev() {
            if region.rect.contains(x, y) {
                return Some(&region.action);
            }
        }
        None
    }

    /// Check if a point is hovering over a clickable region
    pub fn is_hovering(&self, x: u32, y: u32) -> bool {
        self.regions.iter().any(|r| r.hover_effect && r.rect.contains(x, y))
    }

    /// Get all regions that overlap with a given rect (for hover highlighting)
    pub fn get_hover_regions(&self, x: u32, y: u32) -> Vec<&Rect> {
        self.regions
            .iter()
            .filter(|r| r.hover_effect && r.rect.contains(x, y))
            .map(|r| &r.rect)
            .collect()
    }

    /// Get number of registered regions
    pub fn len(&self) -> usize {
        self.regions.len()
    }

    pub fn is_empty(&self) -> bool {
        self.regions.is_empty()
    }
}

/// Grid-based optimization for hit testing (for many regions)
struct HitGrid {
    cell_size: u32,
    width: u32,
    height: u32,
    cells: HashMap<(u32, u32), Vec<usize>>,
}

impl HitGrid {
    fn new(width: u32, height: u32, cell_size: u32) -> Self {
        Self {
            cell_size,
            width: (width / cell_size) + 1,
            height: (height / cell_size) + 1,
            cells: HashMap::new(),
        }
    }

    fn add_region(&mut self, idx: usize, rect: &Rect) {
        let start_cx = rect.x / self.cell_size;
        let end_cx = (rect.x + rect.width) / self.cell_size;
        let start_cy = rect.y / self.cell_size;
        let end_cy = (rect.y + rect.height) / self.cell_size;

        for cy in start_cy..=end_cy {
            for cx in start_cx..=end_cx {
                self.cells.entry((cx, cy)).or_default().push(idx);
            }
        }
    }

    fn get_candidates(&self, x: u32, y: u32) -> &[usize] {
        let cx = x / self.cell_size;
        let cy = y / self.cell_size;
        self.cells.get(&(cx, cy)).map(|v| v.as_slice()).unwrap_or(&[])
    }
}

/// Serialize hit action to JSON string for JavaScript
pub fn action_to_json(action: &HitAction) -> String {
    serde_json::to_string(action).unwrap_or_else(|_| "null".to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hit_test() {
        let mut map = HitTestMap::new();
        map.register_link(Rect::new(0, 0, 10, 2), "/projects");
        map.register_link(Rect::new(0, 5, 10, 2), "https://github.com");

        assert!(matches!(
            map.test(5, 1),
            Some(HitAction::Navigate(ref s)) if s == "/projects"
        ));
        assert!(matches!(
            map.test(5, 6),
            Some(HitAction::OpenUrl(ref s)) if s == "https://github.com"
        ));
        assert!(map.test(5, 3).is_none());
    }
}
