
export enum ThemeType {
  MODERN = 'MODERN',
  NEWS = 'NEWS',
  MINIMAL = 'MINIMAL',
  GAMING = 'GAMING'
}

export enum Position {
  BOTTOM_LEFT = 'justify-start items-end',
  BOTTOM_CENTER = 'justify-center items-end',
  BOTTOM_RIGHT = 'justify-end items-end'
}

export enum AnimationType {
  FADE = 'FADE',
  SLIDE = 'SLIDE',
  TYPEWRITER = 'TYPEWRITER'
}

export interface ContentSlot {
  id: number;
  headline: string;
  subheadline: string;
}

export interface LowerThirdConfig {
  headline: string; // Current active headline
  subheadline: string; // Current active subheadline
  theme: ThemeType;
  fontFamily: string; // Font Family name
  animationType: AnimationType;
  primaryColor: string; // Hex code
  secondaryColor: string; // Hex code
  position: Position;
  
  isVisible: boolean; // Controls the "Live" animation in/out
  previewMode: boolean; // Controls the "Preview" visibility (separate from Live)
  
  // Content Management
  contentSlots: ContentSlot[];
  activeSlotId: number;

  // New Features
  tickerText: string;
  showLiveBadge: boolean;
  showClock: boolean;
}

export interface AIResponse {
  headline: string;
  subheadline: string;
}
