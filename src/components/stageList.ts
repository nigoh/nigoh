// 流れの 7 段（specs/shell-2026.spec.md）。id は出力の面の段（index.astro の StagePane）と、アドレスの #id に使う。
export interface Stage {
  n: string;
  id: string;
  label: string;
  en: string;
}

export const stages: Stage[] = [
  { n: '01', id: 'hero', label: 'はじめ', en: 'start' },
  { n: '02', id: 'about', label: '自己紹介', en: 'about' },
  { n: '03', id: 'skills', label: 'スキル', en: 'skills' },
  { n: '04', id: 'ai', label: 'AI と開発', en: 'ai' },
  { n: '05', id: 'career', label: '経歴', en: 'career' },
  { n: '06', id: 'portfolio', label: '作品', en: 'portfolio' },
  { n: '07', id: 'contact', label: '連絡', en: 'end' },
];
