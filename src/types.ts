export type Page = 'home' | 'service-charge' | 'desco' | 'emergency' | 'menu' | 'settings';

export interface MenuItem {
  id: string;
  title: string;
  icon: any;
  path: Page;
}
