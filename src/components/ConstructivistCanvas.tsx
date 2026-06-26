import { useEffect, useRef, useState, type ReactNode } from 'react';
import { GID_TO_SHAPE, getSection, type ColorName, type ShapeName } from './phaser/sections';
// 型のみ import（実体は遅延 import するので phaser は初期バンドルに載らない）
import type { TiledMap } from './phaser/scenes/DecorationScene';
import type { DecorationHandle } from './phaser/game';

interface Props {
  /** セクションキー（public/tilemaps/<section>.json に対応） */
  section: string;
}

// SVG フォールバック用のローカル配色（tiles.ts は phaser 依存なので import しない）
const SVG_COLORS: Record<ColorName, string> = {
  red: '#D62828',
  black: '#1A1A1A',
  cream: '#F5F0EB',
};
const FIXED_COLOR: Partial<Record<ShapeName, ColorName>> = {
  redSquare: 'red',
  blackSquare: 'black',
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
}

function supportsWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

function cellSizeFor(width: number): number {
  return Math.min(58, Math.max(38, Math.round(width / 16)));
}

export default function ConstructivistCanvas({ section }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [staticFallback, setStaticFallback] = useState(false);
  const [mapData, setMapData] = useState<TiledMap | null>(null);

  // Tiled seed マップを取得（フォールバック描画にも使う）
  useEffect(() => {
    let alive = true;
    const base = import.meta.env.BASE_URL;
    fetch(`${base}tilemaps/${section}.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: TiledMap | null) => {
        if (alive) setMapData(d);
      })
      .catch(() => {
        if (alive) setMapData(null);
      });
    return () => {
      alive = false;
    };
  }, [section]);

  // Phaser 起動（reduced-motion / WebGL 非対応では起動せず静的フォールバック）
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    if (prefersReducedMotion() || !supportsWebGL()) {
      setStaticFallback(true);
      return;
    }

    let handle: DecorationHandle | null = null;
    let io: IntersectionObserver | null = null;
    let ro: ResizeObserver | null = null;
    let lastWidth = 0;
    let resizeTimer: number | undefined;
    let cancelled = false;

    const launch = async () => {
      const rect = host.getBoundingClientRect();
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);
      if (width < 80 || height < 80) return;
      lastWidth = width;

      const res = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
      const { startDecoration } = await import('./phaser/game');
      if (cancelled) return;

      handle = startDecoration({
        parent: host,
        width,
        height,
        sectionKey: section,
        mapData,
        cellSize: cellSizeFor(width),
        res,
      });

      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) handle?.resume();
            else handle?.pause();
          }
        },
        { threshold: 0 }
      );
      io.observe(host);
    };

    void launch();

    // 大きな横幅変化で作り直す（デバウンス）
    ro = new ResizeObserver(() => {
      const w = Math.round(host.getBoundingClientRect().width);
      if (Math.abs(w - lastWidth) < 48) return;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        handle?.destroy();
        handle = null;
        io?.disconnect();
        io = null;
        void launch();
      }, 220);
    });
    ro.observe(host);

    return () => {
      cancelled = true;
      window.clearTimeout(resizeTimer);
      io?.disconnect();
      ro?.disconnect();
      handle?.destroy();
    };
    // mapData が確定してから一度だけ起動したいので依存に含める
  }, [section, mapData]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden"
      // canvas はクリックを拾うがコンテンツは z-10 で上に出す。スクロールは奪わない。
      style={{ touchAction: 'pan-y' }}
    >
      {staticFallback && <StaticComposition section={section} mapData={mapData} />}
    </div>
  );
}

/** reduced-motion / WebGL 非対応時の静的構成（Tiled seed を SVG 化）。 */
function StaticComposition({ section, mapData }: { section: string; mapData: TiledMap | null }) {
  const cfg = getSection(section);
  const layer = mapData?.layers.find((l) => l.type === 'tilelayer' && l.data);
  const mw = layer?.width ?? mapData?.width ?? 12;
  const mh = layer?.height ?? mapData?.height ?? 6;
  const data = layer?.data;
  const accent = (Object.entries(cfg.palette).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    'red') as ColorName;

  const nodes: ReactNode[] = [];
  if (data) {
    for (let r = 0; r < mh; r++) {
      for (let c = 0; c < mw; c++) {
        const gid = data[r * mw + c];
        if (!gid) continue;
        const shape = GID_TO_SHAPE[gid - 1];
        if (!shape) continue;
        const color = SVG_COLORS[FIXED_COLOR[shape] ?? accent];
        nodes.push(<SvgTile key={`${c},${r}`} shape={shape} color={color} cx={c} cy={r} />);
      }
    }
  }

  return (
    <svg
      className="w-full h-full opacity-90"
      viewBox={`0 0 ${mw} ${mh}`}
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
    >
      {nodes}
    </svg>
  );
}

function SvgTile({
  shape,
  color,
  cx,
  cy,
}: {
  shape: ShapeName;
  color: string;
  cx: number;
  cy: number;
}) {
  const p = 0.14;
  const t = 0.16;
  switch (shape) {
    case 'redSquare':
    case 'blackSquare':
      return <rect x={cx + p} y={cy + p} width={1 - 2 * p} height={1 - 2 * p} fill={color} />;
    case 'hollowSquare':
      return (
        <rect
          x={cx + p}
          y={cy + p}
          width={1 - 2 * p}
          height={1 - 2 * p}
          fill="none"
          stroke={color}
          strokeWidth={t * 0.55}
        />
      );
    case 'circle':
      return <circle cx={cx + 0.5} cy={cy + 0.5} r={(1 - 2 * p) / 2} fill={color} />;
    case 'arc':
      return (
        <path
          d={`M ${cx + p} ${cy + p} L ${cx + 1 - p} ${cy + p} A ${1 - 2 * p} ${1 - 2 * p} 0 0 1 ${cx + p} ${cy + 1 - p} Z`}
          fill={color}
        />
      );
    case 'diagonal':
      return (
        <line
          x1={cx + p}
          y1={cy + 1 - p}
          x2={cx + 1 - p}
          y2={cy + p}
          stroke={color}
          strokeWidth={t}
        />
      );
    case 'barV':
      return <rect x={cx + 0.5 - t / 2} y={cy} width={t} height={1} fill={color} />;
    case 'barH':
      return <rect x={cx} y={cy + 0.5 - t / 2} width={1} height={t} fill={color} />;
    case 'dot':
      return <circle cx={cx + 0.5} cy={cy + 0.5} r={0.15} fill={color} />;
    default:
      return null;
  }
}
