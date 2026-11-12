// 経歴のケーブルボード（CableBoard.astro）の 1 件
export interface BoardJob {
  period: string;
  short: string;
  industry: string;
  phase: string;
  techs: string[];
  ongoing: boolean;
}
