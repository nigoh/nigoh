// 構成主義エージェント: グリッドを巡回しタイルを「実装」する。
// 状態: IDLE → MOVING（1セルずつ） → BUILDING（設置アニメ） → IDLE
import Phaser from 'phaser';
import type { Cell, Grid } from './grid';
import { chooseTargetCell, chooseTile } from './grid';
import type { SectionConfig } from './sections';
import { AGENT_TEXTURE } from './tiles';

export interface AgentContext {
  scene: Phaser.Scene;
  grid: Grid;
  section: SectionConfig;
  cellSize: number;
  cellCenter(c: number, r: number): { x: number; y: number };
  /** タイルを設置（ゴースト除去も内部で処理） */
  placeTile(c: number, r: number, cell: Cell): void;
  /** agent 位置に最も近い Issue を取り出して占有（なければ null） */
  takeIssue(c: number, r: number): [number, number] | null;
}

type State = 'IDLE' | 'MOVING' | 'BUILDING';

const MOVE_MS = 380; // 1セル移動の所要時間
const BUILD_MS = 260; // 設置アニメ

export class Agent {
  private ctx: AgentContext;
  private sprite: Phaser.GameObjects.Image;
  private c: number;
  private r: number;
  private state: State = 'IDLE';
  private target: [number, number] | null = null;
  private buildOnArrive = false;
  private cooldown = 0;

  constructor(ctx: AgentContext, startC: number, startR: number) {
    this.ctx = ctx;
    this.c = startC;
    this.r = startR;
    const { x, y } = ctx.cellCenter(startC, startR);
    this.sprite = ctx.scene.add
      .image(x, y, AGENT_TEXTURE)
      .setDisplaySize(ctx.cellSize * 0.86, ctx.cellSize * 0.86)
      .setDepth(100);
  }

  destroy(): void {
    this.sprite.destroy();
  }

  update(_time: number, delta: number): void {
    if (this.cooldown > 0) {
      this.cooldown -= delta;
      return;
    }
    if (this.state === 'MOVING' || this.state === 'BUILDING') return;

    // IDLE: 次の目標を決める
    if (!this.target) {
      this.decideTarget();
      if (!this.target) {
        this.idleBob();
        return;
      }
    }

    const [tc, tr] = this.target;
    if (this.c === tc && this.r === tr) {
      // 到着
      if (this.buildOnArrive && this.ctx.grid.isEmpty(tc, tr)) {
        this.build(tc, tr);
      } else {
        this.target = null;
        this.cooldown = 120;
      }
      return;
    }
    this.stepToward(tc, tr);
  }

  private decideTarget(): void {
    const issue = this.ctx.takeIssue(this.c, this.r);
    if (issue) {
      this.target = issue;
      this.buildOnArrive = true;
      return;
    }
    const grid = this.ctx.grid;
    if (grid.fillRatio() < this.ctx.section.density) {
      this.target = chooseTargetCell(grid);
      this.buildOnArrive = true;
      return;
    }
    // 充填済み: 建てずに徘徊して生命感だけ残す
    const empties = grid.emptyCells();
    this.target = empties.length ? empties[Math.floor(Math.random() * empties.length)] : null;
    this.buildOnArrive = false;
  }

  private stepToward(tc: number, tr: number): void {
    let dc = Math.sign(tc - this.c);
    let dr = Math.sign(tr - this.r);
    // 残距離の大きい軸を優先しつつ、少し揺らす（L字経路）
    const preferH = Math.abs(tc - this.c) >= Math.abs(tr - this.r);
    if (dc !== 0 && dr !== 0) {
      if (preferH ? Math.random() < 0.7 : Math.random() < 0.3) dr = 0;
      else dc = 0;
    }
    const nc = this.c + dc;
    const nr = this.r + dr;

    // 向き
    if (dc > 0) this.sprite.setAngle(0);
    else if (dc < 0) this.sprite.setAngle(180);
    else if (dr > 0) this.sprite.setAngle(90);
    else if (dr < 0) this.sprite.setAngle(-90);

    this.state = 'MOVING';
    const { x, y } = this.ctx.cellCenter(nc, nr);
    this.ctx.scene.tweens.add({
      targets: this.sprite,
      x,
      y,
      duration: MOVE_MS,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.c = nc;
        this.r = nr;
        this.state = 'IDLE';
      },
    });
  }

  private build(c: number, r: number): void {
    this.state = 'BUILDING';
    const cell = chooseTile(this.ctx.grid, this.ctx.section);
    this.ctx.placeTile(c, r, cell);
    this.target = null;
    // 楔をひと押しするモーション
    this.ctx.scene.tweens.add({
      targets: this.sprite,
      scaleX: this.sprite.scaleX * 1.18,
      scaleY: this.sprite.scaleY * 1.18,
      duration: BUILD_MS / 2,
      yoyo: true,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.state = 'IDLE';
        this.cooldown = 200 + Math.random() * 400;
      },
    });
  }

  private idleBob(): void {
    this.cooldown = 500;
    this.ctx.scene.tweens.add({
      targets: this.sprite,
      y: this.sprite.y - this.ctx.cellSize * 0.08,
      duration: 700,
      yoyo: true,
      ease: 'Sine.easeInOut',
    });
  }
}
