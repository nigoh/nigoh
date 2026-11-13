// 経歴のケーブルボード（CableBoard.astro）の 1 件
export interface BoardJob {
  period: string;
  short: string;
  industry: string;
  phase: string;
  techs: string[];
  ongoing: boolean;
  /** 年表（スマホ）の左に出す短い年 */
  when: string;
  /** 札の中の小さな帯（目盛りの幅に対する % ）*/
  bar: { left: number; width: number };
}
