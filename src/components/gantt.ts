// 経歴の帯グラフの 1 行（CareerGantt.astro）
export interface GanttItem {
  label: string;
  /** 始まり（年。2016.5 = 2016 年の半ば） */
  start: number;
  /** 終わり（年）。null は進行中（ビルドした日まで） */
  end: number | null;
  /** 帯の右に添える長さの文字 */
  note: string;
}
