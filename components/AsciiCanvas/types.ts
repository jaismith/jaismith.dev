// TypeScript types for the ASCII renderer

export interface ActivityPoint {
  x: number;
  y: number;
  name?: string;
}

export interface ProjectData {
  name: string;
  link: string | null;
  org: string;
  date: string;
  blurb: string;
  imageId: string;
}

export interface ExperienceData {
  workplace: string;
  location: string;
  position: string;
  timeframe: string;
  description: string;
}

export interface EducationData {
  name: string;
  location: string;
  details: string;
}

export interface HeaderData {
  name: string;
  title: string;
  location: string;
  profileImageId: string;
  activity: ActivityPoint[];
}

export interface NavItem {
  label: string;
  path: string;
}

export interface FooterData {
  credits: string;
  socialLinks: string[];
  sourceUrl: string;
}

export type PageType = 'projects' | 'resume';

export interface SiteContent {
  page: PageType;
  header: HeaderData;
  navigation: NavItem[];
  activePath: string;
  projects?: ProjectData[];
  education?: EducationData[];
  experiences?: ExperienceData[];
  footer: FooterData;
}

export interface HitAction {
  Navigate?: string;
  OpenUrl?: string;
  ScrollTo?: string;
  Custom?: string;
}

// WASM module interface
export interface AsciiRenderer {
  new(cols: number, rows: number): AsciiRenderer;
  resize(cols: number, rows: number): void;
  set_scroll(scroll_y: number): void;
  get_scroll(): number;
  get_content_height(): number;
  set_hover(x: number, y: number): void;
  set_content(json: string): void;
  load_image(id: string, data: Uint8Array, width: number, height: number): void;
  hit_test(x: number, y: number): string | undefined;
  is_hoverable(x: number, y: number): boolean;
  render(): Uint32Array;
  get_width(): number;
  get_height(): number;
}

export interface WasmModule {
  default: () => Promise<void>;
  Renderer: new(cols: number, rows: number) => AsciiRenderer;
  create_renderer: (cols: number, rows: number) => AsciiRenderer;
}
