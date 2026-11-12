// 重力の向き（specs/physics-2026.spec.md「共通」）。
// 既定は下向き。ジャイロ（スマホの傾き）・傾きのつまみ（PC）・キーから変える。全部の物理がこれを読む。
import { poke, motion } from './loop';

export const G = { x: 0, y: 1 };
const listeners = new Set<() => void>();

export function onGravity(fn: () => void): void {
  listeners.add(fn);
}

export function setGravity(x: number, y: number): void {
  const m = Math.hypot(x, y);
  if (m > 1) {
    x /= m;
    y /= m;
  }
  // ジャイロは止まっていても届き続けるので、ほとんど変わらないときは起こさない（休めるように）
  if (Math.abs(x - G.x) < 0.02 && Math.abs(y - G.y) < 0.02) return;
  G.x = x;
  G.y = y;
  listeners.forEach((f) => f());
  poke();
}

type PermissionFn = () => Promise<'granted' | 'denied'>;
const requestPermission = (): PermissionFn | undefined => {
  if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) return undefined;
  const fn = (DeviceOrientationEvent as unknown as { requestPermission?: PermissionFn }).requestPermission;
  return typeof fn === 'function' ? fn : undefined;
};

/** none: 傾きを読めない（PC など） / auto: 許可なしで読める（Android） / permission: ボタンで許可が要る（iPhone） */
export type GyroSupport = 'none' | 'auto' | 'permission';

export function gyroSupport(): GyroSupport {
  if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) return 'none';
  if (!window.matchMedia('(pointer: coarse)').matches) return 'none';
  return requestPermission() ? 'permission' : 'auto';
}

let listening = false;
const clamp = (v: number): number => Math.max(-1, Math.min(1, v));

function onOrient(e: DeviceOrientationEvent): void {
  if (e.beta === null || e.gamma === null) return;
  // 端末を立てて持つと beta ≈ 60〜90°（下向き）。画面の向き（縦・横）に合わせて回す
  const a = (screen.orientation?.angle ?? 0) % 360;
  const gx0 = e.gamma / 40;
  const gy0 = e.beta / 40;
  let gx = gx0;
  let gy = gy0;
  if (a === 90) {
    gx = gy0;
    gy = -gx0;
  } else if (a === 270 || a === -90) {
    gx = -gy0;
    gy = gx0;
  } else if (a === 180) {
    gx = -gx0;
    gy = -gy0;
  }
  setGravity(clamp(gx), clamp(gy));
}

function listen(): void {
  if (listening) return;
  listening = true;
  window.addEventListener('deviceorientation', onOrient);
}

/** ボタンから呼ぶ。許可が取れたら true */
export async function enableGyro(): Promise<boolean> {
  const ask = requestPermission();
  if (!ask) {
    listen();
    return true;
  }
  try {
    const state = await ask();
    if (state === 'granted') {
      listen();
      return true;
    }
  } catch {
    // ボタン以外から呼ばれた・許可の窓が出せない
  }
  return false;
}

export const gyroActive = (): boolean => listening;

/** Android（許可が要らない端末）は、動きを減らす設定でなければ最初から傾きを拾う */
export function autoGyro(): void {
  if (gyroSupport() === 'auto' && !motion.reduce) listen();
}
