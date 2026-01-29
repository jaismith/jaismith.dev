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

// Re-export the Renderer type from the WASM module
export type { Renderer as AsciiRenderer } from 'lib/wasm/ascii_renderer';
