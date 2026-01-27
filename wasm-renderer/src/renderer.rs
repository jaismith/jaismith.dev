//! Main renderer that orchestrates all components

use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::buffer::{CharBuffer, CharCell, rgb, rgba};
use crate::chart::{render_area_chart, render_reference_dot, ChartConfig, DataPoint};
use crate::fonts::block_font;
use crate::hit_test::{HitTestMap, HitAction, action_to_json};
use crate::image::{image_to_ascii, AsciiImage, RAMP_STANDARD};
use crate::layout::{LayoutContext, VerticalLayout, TwoColumnLayout, Rect, Breakpoint};
use crate::text::{render_text, render_text_wrapped, render_figlet, TextStyle, render_hline};

/// Page types
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum PageType {
    Projects,
    Resume,
}

/// Activity data point
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ActivityPoint {
    pub x: f64,
    pub y: f64,
    #[serde(default)]
    pub name: Option<String>,
}

/// Project data
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ProjectData {
    pub name: String,
    pub link: Option<String>,
    pub org: String,
    pub date: String,
    pub blurb: String,
    #[serde(rename = "imageId")]
    pub image_id: String,
}

/// Experience data
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ExperienceData {
    pub workplace: String,
    pub location: String,
    pub position: String,
    pub timeframe: String,
    pub description: String,
}

/// Education data
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EducationData {
    pub name: String,
    pub location: String,
    pub details: String,
}

/// Header data
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct HeaderData {
    pub name: String,
    pub title: String,
    pub location: String,
    #[serde(rename = "profileImageId")]
    pub profile_image_id: String,
    pub activity: Vec<ActivityPoint>,
}

/// Navigation item
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct NavItem {
    pub label: String,
    pub path: String,
}

/// Site content
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SiteContent {
    pub page: PageType,
    pub header: HeaderData,
    pub navigation: Vec<NavItem>,
    #[serde(rename = "activePath")]
    pub active_path: String,
    #[serde(default)]
    pub projects: Vec<ProjectData>,
    #[serde(default)]
    pub education: Vec<EducationData>,
    #[serde(default)]
    pub experiences: Vec<ExperienceData>,
    #[serde(default)]
    pub footer: FooterData,
}

/// Footer data
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct FooterData {
    #[serde(default)]
    pub credits: String,
    #[serde(default, rename = "socialLinks")]
    pub social_links: Vec<String>,
    #[serde(default, rename = "sourceUrl")]
    pub source_url: String,
}

/// Color themes
#[derive(Clone, Copy)]
pub struct Theme {
    pub bg_color: u32,
    pub text_color: u32,
    pub text_secondary: u32,
    pub link_color: u32,
    pub accent_color: u32,
    pub border_color: u32,
}

impl Theme {
    pub fn light() -> Self {
        Self {
            bg_color: rgb(255, 255, 255),
            text_color: rgb(0, 0, 0),
            text_secondary: rgb(100, 100, 100),
            link_color: rgb(0, 84, 180),
            accent_color: rgb(136, 132, 216),
            border_color: rgb(211, 211, 211),
        }
    }

    pub fn dark() -> Self {
        Self {
            bg_color: rgb(24, 26, 27),
            text_color: rgba(249, 249, 249, 204),
            text_secondary: rgba(255, 255, 255, 102),
            link_color: rgb(128, 229, 255),
            accent_color: rgb(96, 182, 255),
            border_color: rgb(100, 100, 100),
        }
    }
}

/// The main renderer
#[wasm_bindgen]
pub struct Renderer {
    buffer: CharBuffer,
    layout: LayoutContext,
    hit_map: HitTestMap,
    content: Option<SiteContent>,
    images: HashMap<String, AsciiImage>,
    theme: Theme,
    hover_x: i32,
    hover_y: i32,
    total_content_height: u32,
    font: crate::fonts::FigFont,
}

#[wasm_bindgen]
impl Renderer {
    /// Create a new renderer with given dimensions
    #[wasm_bindgen(constructor)]
    pub fn new(cols: u32, rows: u32) -> Renderer {
        Renderer {
            buffer: CharBuffer::new(cols, rows),
            layout: LayoutContext::new(cols, rows),
            hit_map: HitTestMap::new(),
            content: None,
            images: HashMap::new(),
            theme: Theme::light(),
            hover_x: -1,
            hover_y: -1,
            total_content_height: 0,
            font: block_font(),
        }
    }

    /// Resize the viewport
    pub fn resize(&mut self, cols: u32, rows: u32) {
        self.buffer.resize(cols, rows);
        self.layout = LayoutContext::new(cols, rows).with_scroll(self.layout.scroll_y);
        self.render_content();
    }

    /// Set the current scroll position
    pub fn set_scroll(&mut self, scroll_y: u32) {
        let max_scroll = self.total_content_height.saturating_sub(self.layout.viewport_height);
        let clamped = scroll_y.min(max_scroll);
        if self.layout.scroll_y != clamped {
            self.layout.scroll_y = clamped;
            self.render_content();
        }
    }

    /// Get current scroll position
    pub fn get_scroll(&self) -> u32 {
        self.layout.scroll_y
    }

    /// Get total content height
    pub fn get_content_height(&self) -> u32 {
        self.total_content_height
    }

    /// Set hover position
    pub fn set_hover(&mut self, x: i32, y: i32) {
        self.hover_x = x;
        self.hover_y = y;
    }

    /// Set the page content from JSON
    pub fn set_content(&mut self, json: &str) -> Result<(), JsValue> {
        let content: SiteContent = serde_json::from_str(json)
            .map_err(|e| JsValue::from_str(&format!("JSON parse error: {}", e)))?;
        
        // Set theme based on page
        self.theme = match content.page {
            PageType::Projects => Theme::light(),
            PageType::Resume => Theme::dark(),
        };
        
        self.content = Some(content);
        self.render_content();
        Ok(())
    }

    /// Load an image for ASCII conversion
    pub fn load_image(&mut self, id: &str, data: &[u8], width: u32, height: u32) {
        // Convert to ASCII with appropriate width based on breakpoint
        let target_width = match self.layout.breakpoint {
            Breakpoint::Mobile => 30,
            Breakpoint::Tablet => 40,
            Breakpoint::Desktop => 50,
        };
        
        let ascii = image_to_ascii(data, width, height, target_width, RAMP_STANDARD, false);
        self.images.insert(id.to_string(), ascii);
    }

    /// Hit test at a position (returns JSON action or null)
    pub fn hit_test(&self, x: u32, y: u32) -> Option<String> {
        // Convert viewport coords to document coords
        let doc_y = y + self.layout.scroll_y;
        self.hit_map.test(x, doc_y).map(action_to_json)
    }

    /// Check if a position is hoverable
    pub fn is_hoverable(&self, x: u32, y: u32) -> bool {
        let doc_y = y + self.layout.scroll_y;
        self.hit_map.is_hovering(x, doc_y)
    }

    /// Render and return the buffer data
    pub fn render(&mut self) -> Vec<u32> {
        self.buffer.get_data()
    }

    /// Get buffer width
    pub fn get_width(&self) -> u32 {
        self.buffer.width()
    }

    /// Get buffer height
    pub fn get_height(&self) -> u32 {
        self.buffer.height()
    }
}

// Internal rendering methods
impl Renderer {
    /// Main render function
    fn render_content(&mut self) {
        self.buffer.clear();
        self.hit_map.clear();
        
        let Some(content) = &self.content.clone() else {
            return;
        };

        // Calculate total content first
        self.total_content_height = self.calculate_content_height(&content);
        
        // Render based on page type
        match content.page {
            PageType::Projects => self.render_projects_page(&content),
            PageType::Resume => self.render_resume_page(&content),
        }
    }

    fn calculate_content_height(&self, content: &SiteContent) -> u32 {
        // Estimate height based on content
        let nav_height = 3;
        let header_height = match self.layout.breakpoint {
            Breakpoint::Mobile => 35,
            _ => 25,
        };
        
        let content_height = match content.page {
            PageType::Projects => {
                content.projects.len() as u32 * 25 // rough estimate per project
            }
            PageType::Resume => {
                content.experiences.len() as u32 * 12 + 20
            }
        };
        
        let footer_height = 5;
        
        nav_height + header_height + content_height + footer_height + 10
    }

    fn render_projects_page(&mut self, content: &SiteContent) {
        let scroll_y = self.layout.scroll_y;
        let view_height = self.layout.viewport_height;
        
        let content_x = self.layout.get_content_x();
        let content_width = self.layout.get_content_width();
        
        let mut y: i32 = -(scroll_y as i32);
        
        // Navbar (fixed at top - always render at y=0 in viewport)
        self.render_navbar(content, 0);
        let nav_height = 3;
        
        // Adjust starting position for content (below navbar)
        y += nav_height as i32;
        
        // Header
        let header_height = self.render_header(&content.header, content_x, &mut y, content_width);
        
        // Projects
        for (i, project) in content.projects.iter().enumerate() {
            let flipped = i % 2 == 1;
            let project_height = self.render_project(project, content_x, &mut y, content_width, flipped);
        }
        
        // Footer
        y += 3;
        self.render_footer(&content.footer, content_x, &mut y, content_width);
        
        // Update total height
        self.total_content_height = (y + scroll_y as i32) as u32;
    }

    fn render_resume_page(&mut self, content: &SiteContent) {
        let scroll_y = self.layout.scroll_y;
        let content_x = self.layout.get_content_x();
        let content_width = self.layout.get_content_width();
        
        let mut y: i32 = -(scroll_y as i32);
        
        // Navbar
        self.render_navbar(content, 0);
        let nav_height = 3;
        y += nav_height as i32;
        
        // Header
        let header_height = self.render_header(&content.header, content_x, &mut y, content_width);
        
        // Two column layout for resume
        y += 2;
        
        if self.layout.breakpoint == Breakpoint::Mobile {
            // Single column on mobile
            self.render_education(&content.education, content_x, &mut y, content_width);
            y += 2;
            self.render_experiences(&content.experiences, content_x, &mut y, content_width);
        } else {
            // Two columns on larger screens
            let sidebar_width = content_width / 4;
            let main_width = content_width - sidebar_width - 3;
            
            let sidebar_x = content_x;
            let main_x = content_x + sidebar_width + 3;
            
            let start_y = y;
            
            // Sidebar (education)
            let mut sidebar_y = y;
            self.render_education(&content.education, sidebar_x, &mut sidebar_y, sidebar_width);
            
            // Main content (experiences)
            let mut main_y = y;
            self.render_experiences(&content.experiences, main_x, &mut main_y, main_width);
            
            y = sidebar_y.max(main_y);
        }
        
        // Footer
        y += 3;
        self.render_footer(&content.footer, content_x, &mut y, content_width);
        
        self.total_content_height = (y + scroll_y as i32) as u32;
    }

    fn render_navbar(&mut self, content: &SiteContent, y: u32) {
        let style = TextStyle::new(self.theme.text_color);
        let link_style = TextStyle::new(self.theme.link_color).clickable();
        let active_style = TextStyle::new(self.theme.text_color).underline();
        
        // Background for navbar
        self.buffer.fill_bg(0, y, self.buffer.width(), 2, self.theme.bg_color);
        
        // Render nav items on the right
        let mut x = self.buffer.width() - 2;
        
        for item in content.navigation.iter().rev() {
            let is_active = item.path == content.active_path;
            let item_style = if is_active { &active_style } else { &link_style };
            
            let label_width = item.label.len() as u32;
            x = x.saturating_sub(label_width + 2);
            
            if !is_active {
                // Register hit region for non-active items
                self.hit_map.register_link(
                    Rect::new(x, y, label_width, 1),
                    &item.path,
                );
            }
            
            render_text(&mut self.buffer, x, y, &item.label, item_style);
        }
    }

    fn render_header(&mut self, header: &HeaderData, x: u32, y: &mut i32, width: u32) -> u32 {
        let start_y = *y;
        
        // Skip if completely above viewport
        if *y + 30 < 0 {
            *y += 30;
            return 30;
        }
        
        let style = TextStyle::new(self.theme.text_color);
        let secondary_style = TextStyle::new(self.theme.text_secondary);
        
        *y += 3; // Top padding
        
        // Profile image (if loaded)
        let img_width;
        let img_height;
        if let Some(img) = self.images.get(&header.profile_image_id) {
            img_width = img.width;
            img_height = img.height;
            
            if *y >= 0 {
                let img_x = if self.layout.breakpoint == Breakpoint::Mobile {
                    x + (width - img_width) / 2
                } else {
                    x + (width - img_width) / 2 - 20
                };
                
                for iy in 0..img_height {
                    for ix in 0..img_width {
                        if let Some(ch) = img.get(ix, iy) {
                            let buf_y = (*y + iy as i32) as u32;
                            if buf_y < self.buffer.height() {
                                self.buffer.set_cell(img_x + ix, buf_y, CharCell::new(ch, self.theme.text_color));
                            }
                        }
                    }
                }
            }
        } else {
            img_width = 20;
            img_height = 10;
        }
        
        // Name (FIGlet)
        let name_y = *y + img_height as i32 + 2;
        if name_y >= 0 && name_y < self.buffer.height() as i32 {
            let name_upper = header.name.to_uppercase();
            let figlet_width = crate::text::figlet_width(&name_upper, &self.font);
            let name_x = x + (width.saturating_sub(figlet_width)) / 2;
            render_figlet(&mut self.buffer, name_x, name_y as u32, &name_upper, &self.font, &style);
        }
        
        *y = name_y + self.font.height as i32 + 1;
        
        // Title
        if *y >= 0 && *y < self.buffer.height() as i32 {
            let title_x = x + (width - header.title.len() as u32) / 2;
            render_text(&mut self.buffer, title_x, *y as u32, &header.title, &style);
        }
        *y += 1;
        
        // Location
        if *y >= 0 && *y < self.buffer.height() as i32 {
            let loc_x = x + (width - header.location.len() as u32) / 2;
            render_text(&mut self.buffer, loc_x, *y as u32, &header.location, &secondary_style);
        }
        *y += 3;
        
        // Activity chart
        if !header.activity.is_empty() {
            let chart_width = width.min(60);
            let chart_height = 8;
            let chart_x = x + (width - chart_width) / 2;
            
            if *y >= -(chart_height as i32) && *y < self.buffer.height() as i32 {
                let data: Vec<DataPoint> = header.activity.iter().enumerate().map(|(i, a)| {
                    DataPoint {
                        x: a.x,
                        y: a.y,
                        label: if i == 0 || i == header.activity.len() - 1 {
                            a.name.clone()
                        } else {
                            None
                        },
                    }
                }).collect();
                
                let chart_style = TextStyle::new(self.theme.accent_color);
                let config = ChartConfig {
                    width: chart_width,
                    height: chart_height,
                    show_axes: true,
                    show_labels: true,
                    fill_area: true,
                    title: None,
                };
                
                if *y >= 0 {
                    render_area_chart(&mut self.buffer, chart_x, *y as u32, &data, &config, &chart_style);
                    
                    // Contribution count label
                    let total: f64 = header.activity.iter().map(|a| a.y).sum();
                    let label = format!("{} contributions", total as u32);
                    let label_x = chart_x + chart_width + 2;
                    if label_x + label.len() as u32 <= self.buffer.width() {
                        render_text(&mut self.buffer, label_x, *y as u32 + 2, &label, &TextStyle::new(self.theme.text_color));
                    }
                }
            }
            
            *y += chart_height as i32 + 4;
        }
        
        // Separator line
        if *y >= 0 && *y < self.buffer.height() as i32 {
            render_hline(&mut self.buffer, x, *y as u32, width, &TextStyle::new(self.theme.border_color));
        }
        *y += 2;
        
        (*y - start_y) as u32
    }

    fn render_project(&mut self, project: &ProjectData, x: u32, y: &mut i32, width: u32, flipped: bool) -> u32 {
        let start_y = *y;
        
        // Skip if completely outside viewport
        if *y > self.buffer.height() as i32 + 5 || *y + 25 < 0 {
            *y += 20;
            return 20;
        }
        
        let style = TextStyle::new(self.theme.text_color);
        let secondary_style = TextStyle::new(self.theme.text_secondary);
        let link_style = TextStyle::new(self.theme.link_color).clickable();
        
        // Background for flipped projects
        if flipped && *y >= 0 {
            let bg_color = rgba(248, 248, 248, 255);
            let start_row = (*y).max(0) as u32;
            let height = 20.min(self.buffer.height().saturating_sub(start_row));
            self.buffer.fill_bg(0, start_row, self.buffer.width(), height, bg_color);
        }
        
        *y += 2;
        
        // Project title
        if *y >= 0 && *y < self.buffer.height() as i32 {
            let title_style = if project.link.is_some() { &link_style } else { &style };
            let title_x = if flipped { x + width - project.name.len() as u32 } else { x };
            render_text(&mut self.buffer, title_x, *y as u32, &project.name, title_style);
            
            if let Some(ref link) = project.link {
                self.hit_map.register_link(
                    Rect::new(title_x, *y as u32, project.name.len() as u32, 1),
                    link,
                );
            }
        }
        *y += 1;
        
        // Org and date
        if *y >= 0 && *y < self.buffer.height() as i32 {
            let org_date = format!("{} | {}", project.org, project.date);
            let od_x = if flipped { x + width - org_date.len() as u32 } else { x };
            render_text(&mut self.buffer, od_x, *y as u32, &org_date, &secondary_style);
        }
        *y += 2;
        
        // Content: image and blurb
        let img_width = match self.layout.breakpoint {
            Breakpoint::Mobile => width,
            _ => width * 55 / 100,
        };
        let blurb_width = match self.layout.breakpoint {
            Breakpoint::Mobile => width,
            _ => width * 40 / 100,
        };
        
        let (img_x, blurb_x) = if self.layout.breakpoint == Breakpoint::Mobile {
            (x, x)
        } else if flipped {
            (x + width - img_width, x)
        } else {
            (x, x + img_width + 5)
        };
        
        let img_start_y = *y;
        
        // Render image if loaded
        if let Some(img) = self.images.get(&project.image_id) {
            if *y >= 0 {
                for iy in 0..img.height.min(15) {
                    for ix in 0..img.width.min(img_width) {
                        if let Some(ch) = img.get(ix, iy) {
                            let buf_y = (*y + iy as i32) as u32;
                            if buf_y < self.buffer.height() {
                                self.buffer.set_cell(img_x + ix, buf_y, CharCell::new(ch, self.theme.text_color));
                            }
                        }
                    }
                }
            }
            
            if self.layout.breakpoint == Breakpoint::Mobile {
                *y += img.height.min(15) as i32 + 1;
            }
        }
        
        // Render blurb
        let blurb_y = if self.layout.breakpoint == Breakpoint::Mobile { *y } else { img_start_y };
        if blurb_y >= 0 && blurb_y < self.buffer.height() as i32 {
            let lines = render_text_wrapped(&mut self.buffer, blurb_x, blurb_y as u32, blurb_width, &project.blurb, &style);
            
            if self.layout.breakpoint == Breakpoint::Mobile {
                *y += lines as i32;
            } else {
                *y = img_start_y + (lines as i32).max(15);
            }
        } else {
            *y += 10;
        }
        
        *y += 3;
        
        (*y - start_y) as u32
    }

    fn render_education(&mut self, education: &[EducationData], x: u32, y: &mut i32, width: u32) {
        let style = TextStyle::new(self.theme.text_color);
        let secondary_style = TextStyle::new(self.theme.text_secondary);
        let link_style = TextStyle::new(self.theme.link_color).clickable();
        
        if *y >= 0 && *y < self.buffer.height() as i32 {
            render_text(&mut self.buffer, x, *y as u32, "Education", &style.clone().bold());
        }
        *y += 2;
        
        for edu in education {
            if *y >= 0 && *y < self.buffer.height() as i32 {
                render_text(&mut self.buffer, x, *y as u32, &edu.name, &style);
            }
            *y += 1;
            
            if *y >= 0 && *y < self.buffer.height() as i32 {
                render_text(&mut self.buffer, x, *y as u32, &edu.location, &secondary_style);
            }
            *y += 1;
            
            if *y >= 0 && *y < self.buffer.height() as i32 {
                let lines = render_text_wrapped(&mut self.buffer, x, *y as u32, width, &edu.details, &secondary_style);
                *y += lines as i32;
            }
            *y += 1;
        }
        
        // Request full resume link
        *y += 1;
        if *y >= 0 && *y < self.buffer.height() as i32 {
            let link_text = "Request full resume";
            render_text(&mut self.buffer, x, *y as u32, link_text, &link_style);
            self.hit_map.register_link(
                Rect::new(x, *y as u32, link_text.len() as u32, 1),
                "mailto:jksmithnyc@gmail.com",
            );
        }
        *y += 2;
    }

    fn render_experiences(&mut self, experiences: &[ExperienceData], x: u32, y: &mut i32, width: u32) {
        let style = TextStyle::new(self.theme.text_color);
        let secondary_style = TextStyle::new(self.theme.text_secondary);
        
        if *y >= 0 && *y < self.buffer.height() as i32 {
            render_text(&mut self.buffer, x, *y as u32, "Experience", &style.clone().bold());
        }
        *y += 2;
        
        for exp in experiences {
            // Skip if way above viewport
            if *y > self.buffer.height() as i32 + 5 {
                break;
            }
            
            if *y >= 0 && *y < self.buffer.height() as i32 {
                let header = format!("{}, {}", exp.workplace, exp.location);
                render_text(&mut self.buffer, x, *y as u32, &header, &style.clone().bold());
            }
            *y += 1;
            
            if *y >= 0 && *y < self.buffer.height() as i32 {
                let summary = format!("{}, {}", exp.position, exp.timeframe);
                render_text(&mut self.buffer, x, *y as u32, &summary, &secondary_style);
            }
            *y += 1;
            
            // Description (handle markdown bullet points)
            for line in exp.description.lines() {
                let trimmed = line.trim();
                if trimmed.is_empty() {
                    continue;
                }
                
                let display = if trimmed.starts_with("- ") {
                    format!("• {}", &trimmed[2..])
                } else {
                    trimmed.to_string()
                };
                
                if *y >= 0 && *y < self.buffer.height() as i32 {
                    let lines = render_text_wrapped(&mut self.buffer, x + 2, *y as u32, width - 2, &display, &secondary_style);
                    *y += lines as i32;
                } else {
                    *y += 1;
                }
            }
            
            *y += 2;
            
            // Separator
            if *y >= 0 && *y < self.buffer.height() as i32 {
                render_hline(&mut self.buffer, x, *y as u32, width, &TextStyle::new(self.theme.border_color));
            }
            *y += 1;
        }
    }

    fn render_footer(&mut self, footer: &FooterData, x: u32, y: &mut i32, width: u32) {
        if *y < 0 || *y >= self.buffer.height() as i32 {
            return;
        }
        
        let style = TextStyle::new(self.theme.text_color);
        let link_style = TextStyle::new(self.theme.link_color).clickable();
        
        // Credits
        let credits = if footer.credits.is_empty() {
            "Jai K. Smith (2020)".to_string()
        } else {
            footer.credits.clone()
        };
        render_text(&mut self.buffer, x, *y as u32, &credits, &style);
        
        // Social links (simplified - just show domain)
        let socials_text: Vec<&str> = footer.social_links.iter()
            .filter_map(|url| {
                if url.contains("github") { Some("GitHub") }
                else if url.contains("linkedin") { Some("LinkedIn") }
                else { None }
            })
            .collect();
        
        let social_x = x + width / 2 - socials_text.join(" | ").len() as u32 / 2;
        let mut sx = social_x;
        for (i, (name, url)) in socials_text.iter().zip(footer.social_links.iter()).enumerate() {
            if i > 0 {
                render_text(&mut self.buffer, sx, *y as u32, " | ", &style);
                sx += 3;
            }
            render_text(&mut self.buffer, sx, *y as u32, name, &link_style);
            self.hit_map.register_link(Rect::new(sx, *y as u32, name.len() as u32, 1), url);
            sx += name.len() as u32;
        }
        
        // Source code link
        let source_text = "Source Code";
        let source_url = if footer.source_url.is_empty() {
            "https://github.com/jaismith/jaismith.dev"
        } else {
            &footer.source_url
        };
        let source_x = x + width - source_text.len() as u32;
        render_text(&mut self.buffer, source_x, *y as u32, source_text, &link_style);
        self.hit_map.register_link(Rect::new(source_x, *y as u32, source_text.len() as u32, 1), source_url);
        
        *y += 2;
    }
}
