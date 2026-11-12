// 流れ（目次）の 7 段。index.astro のセクション id と一致させる（specs/plug-2026.spec.md「構図」）。
export interface FlowSection {
  n: string;
  id: string;
  label: string;
  en: string;
}

export const flowSections: FlowSection[] = [
  { n: '01', id: 'hero', label: 'はじめ', en: 'start' },
  { n: '02', id: 'about', label: '自己紹介', en: 'about' },
  { n: '03', id: 'skills', label: 'スキル', en: 'skills' },
  { n: '04', id: 'ai', label: 'AI と開発', en: 'ai' },
  { n: '05', id: 'career', label: '経歴', en: 'career' },
  { n: '06', id: 'portfolio', label: '作品', en: 'portfolio' },
  { n: '07', id: 'contact', label: '連絡', en: 'end' },
];
