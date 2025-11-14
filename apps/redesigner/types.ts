
export type AppMode = 'redesign' | 'apply';
export type SidebarTab = 'controls' | 'history';
export type Viewport = 'desktop' | 'mobile';

export interface DesignVariant {
  id: string;
  name: string;
  html: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  inputHtml: string;
  selectedStyle: string;
  selectedModel: string;
  generatedDesigns: DesignVariant[];
}
