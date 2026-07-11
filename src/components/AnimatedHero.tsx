import { useTrail, animated, useReducedMotion } from '@react-spring/web';
import { useEffect, useState } from 'react';

interface AnimatedHeroProps {
  name: string;
  role: string;
  description: string;
  keywords?: string[];
  githubUrl: string;
}

// Bauhaus フラットポスターのヒーロー本文カラム（specs/bauhaus-2026.spec.md）。
// 平面の三原色図形（背面 .hero-poster）を主役に、左カラムへ実テキストを整列する。
// 地はトークン連動（ライト = cream / ダーク = 反転）。色は --c-* とクラス（.hero-name-*）で担う。
export default function AnimatedHero({
  name,
  role,
  description,
  keywords = [],
  githubUrl,
}: AnimatedHeroProps) {
  const [ready, setReady] = useState(false);
  // prefers-reduced-motion: reduce 時は entry の派手な動きを抑え、最終状態を即時表示
  const reduceMotion = useReducedMotion() ?? false;

  useEffect(() => {
    setReady(true);
  }, []);

  // 名前を「H.」＋「NIGO」に分割し、前半=赤 / 後半=青 に刷り分ける（ライト時。ダークは cream で可読性優先）。
  const dot = name.indexOf('.');
  const nameA = dot >= 0 ? name.slice(0, dot + 1) : name;
  const nameB = dot >= 0 ? name.slice(dot + 1) : '';

  // コピー各行 — 左からスライドイン（entry。scroll 連動のキネティックとは別レイヤー）
  const trail = useTrail(6, {
    opacity: ready ? 1 : 0,
    transform: ready ? 'translateX(0px)' : 'translateX(-40px)',
    config: { tension: 100, friction: 18 },
    delay: 100,
    immediate: reduceMotion,
  });

  return (
    <div className="relative z-10 w-full max-w-2xl px-6 sm:px-10 lg:pl-[5vw] lg:pr-8">
      {/* 小ラベル — 赤い横線 + キャプション（ink on page） */}
      <animated.div style={trail[0]} className="flex items-center gap-3 mb-5">
        <div className="w-8 h-0.5 bg-bauhaus-red" aria-hidden="true" />
        <span className="font-mono text-xs text-[var(--c-ink-muted)] tracking-[0.3em] uppercase">
          Software Engineer — Sapporo, Japan
        </span>
      </animated.div>

      {/* 名前 — 極大ブロック体 H1。前半=赤 / 後半=青。scroll 連動の letter-spacing 伸縮（.hero-h1-kinetic） */}
      <animated.div style={trail[1]} className="relative">
        {/* 背景の薄い番号（純装飾のゴースト） */}
        <div
          className="absolute -left-2 -top-6 font-sans text-display-fluid text-[var(--c-ink)] select-none pointer-events-none"
          style={{ opacity: 0.05 }}
          aria-hidden="true"
        >
          01
        </div>
        <h1 className="hero-h1-kinetic font-sans text-display-fluid relative z-10">
          <span className="hero-name-a">{nameA}</span>
          <span className="hero-name-b">{nameB}</span>
        </h1>
      </animated.div>

      {/* ROLE — 黒（ダークは cream）のインクチップ。skew の斜線力線＋内側逆 skew で字は正立・可読 */}
      <animated.div style={trail[2]} className="mt-4">
        <div className="hero-role-skew inline-block px-5 py-2" style={{ background: 'var(--c-ink)' }}>
          <span
            className="hero-role-inner block font-sans text-lg sm:text-2xl tracking-[0.14em]"
            style={{ color: 'var(--c-page)' }}
          >
            {role}
          </span>
        </div>
      </animated.div>

      {/* 説明文 — 左に赤の力線（ink-muted on page で AA 確保） */}
      <animated.p
        style={trail[3]}
        className="mt-6 text-[var(--c-ink-muted)] text-base leading-relaxed max-w-md font-body border-l-2 border-bauhaus-red pl-4"
      >
        {description}
      </animated.p>

      {/* キーワード列（mono・三原色のリズムを句点に） */}
      {keywords.length > 0 && (
        <animated.div style={trail[4]} className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1">
          {keywords.map((kw, i) => (
            <span key={kw} className="flex items-center gap-x-3">
              <span className="font-mono text-xs sm:text-sm tracking-[0.14em] text-[var(--c-ink-muted)]">
                {kw}
              </span>
              {i < keywords.length - 1 && (
                <span className="font-mono text-xs text-bauhaus-red" aria-hidden="true">
                  ／
                </span>
              )}
            </span>
          ))}
        </animated.div>
      )}

      {/* リンク — 楔矢印 + 版ずれ（misprint） */}
      <animated.div style={trail[5]} className="mt-8">
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-0 min-h-11"
        >
          <div
            className="shrink-0"
            style={{
              width: 0,
              height: 0,
              borderTop: '9px solid transparent',
              borderBottom: '9px solid transparent',
              borderLeft: '15px solid #D62828',
            }}
            aria-hidden="true"
          />
          <span className="misprint-text-in-group font-sans text-base text-[var(--c-ink)] tracking-widest pl-3">
            GITHUB.COM/NIGOH
          </span>
        </a>
      </animated.div>
    </div>
  );
}
