//! ASCII chart rendering for data visualization

use crate::buffer::{CharBuffer, CharCell};
use crate::text::{render_text, TextStyle};

/// A data point for charts
#[derive(Clone, Debug)]
pub struct DataPoint {
    pub x: f64,
    pub y: f64,
    pub label: Option<String>,
}

/// Chart configuration
#[derive(Clone, Debug)]
pub struct ChartConfig {
    pub width: u32,
    pub height: u32,
    pub show_axes: bool,
    pub show_labels: bool,
    pub fill_area: bool,
    pub title: Option<String>,
}

impl Default for ChartConfig {
    fn default() -> Self {
        Self {
            width: 60,
            height: 15,
            show_axes: true,
            show_labels: true,
            fill_area: true,
            title: None,
        }
    }
}

/// Characters for chart rendering
const CHART_FILL: char = '█';
const CHART_TOP: char = '▀';
const CHART_LINE: char = '─';
const CHART_DOT: char = '●';
const CHART_AXIS_V: char = '│';
const CHART_AXIS_H: char = '─';
const CHART_ORIGIN: char = '└';

/// Render an area chart
pub fn render_area_chart(
    buffer: &mut CharBuffer,
    x: u32,
    y: u32,
    data: &[DataPoint],
    config: &ChartConfig,
    style: &TextStyle,
) -> (u32, u32) {
    if data.is_empty() || config.width == 0 || config.height == 0 {
        return (0, 0);
    }

    let chart_x = if config.show_axes { x + 3 } else { x };
    let chart_y = y;
    let chart_width = if config.show_axes { config.width - 3 } else { config.width };
    let chart_height = if config.show_labels { config.height - 2 } else { config.height };

    // Find data bounds
    let min_y = data.iter().map(|d| d.y).fold(f64::INFINITY, f64::min);
    let max_y = data.iter().map(|d| d.y).fold(f64::NEG_INFINITY, f64::max);
    let y_range = if max_y > min_y { max_y - min_y } else { 1.0 };

    // Normalize data to chart height
    let normalized: Vec<u32> = data.iter().map(|d| {
        let norm = (d.y - min_y) / y_range;
        (norm * (chart_height - 1) as f64).round() as u32
    }).collect();

    // Calculate x positions for each data point
    let x_step = chart_width as f64 / (data.len().max(1) - 1).max(1) as f64;

    // Render the area/line
    for (i, &height) in normalized.iter().enumerate() {
        let px = chart_x + (i as f64 * x_step).round() as u32;
        
        if px >= chart_x + chart_width {
            continue;
        }

        // Fill from bottom to height
        if config.fill_area {
            for h in 0..=height {
                let py = chart_y + chart_height - 1 - h;
                if py >= chart_y && py < chart_y + chart_height {
                    let ch = if h == height { CHART_TOP } else { CHART_FILL };
                    buffer.set_cell(px, py, CharCell::new(ch, style.fg_color));
                }
            }
        } else {
            // Just draw the point
            let py = chart_y + chart_height - 1 - height;
            if py >= chart_y && py < chart_y + chart_height {
                buffer.set_cell(px, py, CharCell::new(CHART_DOT, style.fg_color));
            }
        }
    }

    // Draw axes if enabled
    if config.show_axes {
        // Y axis
        for row in chart_y..(chart_y + chart_height) {
            buffer.set_cell(chart_x - 1, row, CharCell::new(CHART_AXIS_V, style.fg_color));
        }
        // X axis
        for col in chart_x..(chart_x + chart_width) {
            buffer.set_cell(col, chart_y + chart_height, CharCell::new(CHART_AXIS_H, style.fg_color));
        }
        // Origin
        buffer.set_cell(chart_x - 1, chart_y + chart_height, CharCell::new(CHART_ORIGIN, style.fg_color));
    }

    // Draw labels if enabled
    if config.show_labels && !data.is_empty() {
        // First label
        if let Some(ref label) = data[0].label {
            let label_y = chart_y + chart_height + 1;
            render_text(buffer, chart_x, label_y, label, style);
        }
        // Last label
        if data.len() > 1 {
            if let Some(ref label) = data[data.len() - 1].label {
                let label_y = chart_y + chart_height + 1;
                let label_x = (chart_x + chart_width).saturating_sub(label.len() as u32);
                render_text(buffer, label_x, label_y, label, style);
            }
        }
    }

    (config.width, config.height)
}

/// Render a reference dot with label (like for showing current value)
pub fn render_reference_dot(
    buffer: &mut CharBuffer,
    x: u32,
    y: u32,
    label_lines: &[&str],
    style: &TextStyle,
) {
    // Draw the dot
    buffer.set_cell(x, y, CharCell::new(CHART_DOT, style.fg_color));
    
    // Draw label lines to the right
    for (i, line) in label_lines.iter().enumerate() {
        render_text(buffer, x + 2, y + i as u32, line, style);
    }
}

/// Render a simple bar chart (horizontal)
pub fn render_bar_chart(
    buffer: &mut CharBuffer,
    x: u32,
    y: u32,
    data: &[(String, f64)],
    max_width: u32,
    style: &TextStyle,
) -> u32 {
    if data.is_empty() {
        return 0;
    }

    let max_val = data.iter().map(|(_, v)| *v).fold(f64::NEG_INFINITY, f64::max);
    let max_label_len = data.iter().map(|(l, _)| l.len()).max().unwrap_or(0);

    for (i, (label, value)) in data.iter().enumerate() {
        let row = y + i as u32;
        
        // Render label
        render_text(buffer, x, row, label, style);
        
        // Render bar
        let bar_x = x + max_label_len as u32 + 2;
        let bar_width = if max_val > 0.0 {
            ((value / max_val) * (max_width - max_label_len as u32 - 2) as f64) as u32
        } else {
            0
        };
        
        for bx in 0..bar_width {
            buffer.set_cell(bar_x + bx, row, CharCell::new('█', style.fg_color));
        }
    }

    data.len() as u32
}

/// Simple sparkline chart (single line, minimal)
pub fn render_sparkline(
    buffer: &mut CharBuffer,
    x: u32,
    y: u32,
    data: &[f64],
    width: u32,
    style: &TextStyle,
) {
    if data.is_empty() || width == 0 {
        return;
    }

    let chars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
    
    let min_val = data.iter().fold(f64::INFINITY, |a, &b| a.min(b));
    let max_val = data.iter().fold(f64::NEG_INFINITY, |a, &b| a.max(b));
    let range = if max_val > min_val { max_val - min_val } else { 1.0 };

    // Resample data to fit width
    let step = data.len() as f64 / width as f64;
    
    for i in 0..width {
        let data_idx = (i as f64 * step) as usize;
        if data_idx >= data.len() {
            break;
        }
        
        let val = data[data_idx];
        let norm = (val - min_val) / range;
        let char_idx = (norm * 7.0).round() as usize;
        let ch = chars[char_idx.min(7)];
        
        buffer.set_cell(x + i, y, CharCell::new(ch, style.fg_color));
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_area_chart() {
        let mut buffer = CharBuffer::new(80, 20);
        let data = vec![
            DataPoint { x: 0.0, y: 10.0, label: Some("Start".to_string()) },
            DataPoint { x: 1.0, y: 20.0, label: None },
            DataPoint { x: 2.0, y: 15.0, label: None },
            DataPoint { x: 3.0, y: 25.0, label: Some("End".to_string()) },
        ];
        let config = ChartConfig::default();
        let style = TextStyle::default();
        
        let (w, h) = render_area_chart(&mut buffer, 0, 0, &data, &config, &style);
        assert!(w > 0);
        assert!(h > 0);
    }
}
