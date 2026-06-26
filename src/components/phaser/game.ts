// Phaser.Game ブートストラップ。ConstructivistCanvas から遅延 import される。
// ここで初めて phaser 本体が読み込まれ、初期バンドルから切り離される。
import Phaser from 'phaser';
import { DecorationScene, type SceneData, type TiledMap } from './scenes/DecorationScene';

export interface StartOptions {
  parent: HTMLElement;
  width: number;
  height: number;
  sectionKey: string;
  mapData: TiledMap | null;
  cellSize: number;
  res: number;
}

export interface DecorationHandle {
  pause(): void;
  resume(): void;
  destroy(): void;
}

const SCENE_KEY = 'DecorationScene';

export function startDecoration(opts: StartOptions): DecorationHandle {
  const data: SceneData = {
    sectionKey: opts.sectionKey,
    mapData: opts.mapData,
    cellSize: opts.cellSize,
    res: opts.res,
  };

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: opts.parent,
    width: opts.width,
    height: opts.height,
    transparent: true,
    banner: false,
    audio: { noAudio: true },
    fps: { target: 60, min: 30 },
    // touch.capture=false: タップは拾うが preventDefault せず、ページのスクロールを奪わない
    input: { activePointers: 1, touch: { capture: false } },
    scale: { mode: Phaser.Scale.NONE },
    render: { antialias: true, powerPreference: 'low-power' },
  });

  let started = false;
  const boot = () => {
    game.scene.add(SCENE_KEY, DecorationScene, true, data);
    started = true;
  };
  if (game.isBooted) boot();
  else game.events.once(Phaser.Core.Events.READY, boot);

  return {
    pause() {
      if (started && game.scene.isActive(SCENE_KEY)) game.scene.pause(SCENE_KEY);
    },
    resume() {
      if (started && game.scene.isPaused(SCENE_KEY)) game.scene.resume(SCENE_KEY);
    },
    destroy() {
      game.destroy(true);
    },
  };
}
