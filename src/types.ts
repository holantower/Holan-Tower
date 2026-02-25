export type Page = 'home' | 'service-charge' | 'desco' | 'desco-info' | 'desco-rules' | 'emergency' | 'menu' | 'settings';

export interface MenuItem {
  id: string;
  title: string;
  icon: any;
  path: Page;
}
