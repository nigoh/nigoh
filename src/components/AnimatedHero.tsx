import { useTrail, animated, useReducedMotion } from '@react-spring/web';
import { useEffect, useState } from 'react';

interface AnimatedHeroProps {
  name: string;
  role: string;
  description: string;
  githubUrl: string;
}

// 没入 3D ヒーロー（redesign-2026-bold.spec §6）の本文カラム。
// 3D Proun（ProunCanvas）が主役のため、ここは左カラムに整列した実テキストのみ
// （H1・役割・説明・リンク）。アバターは廃し、コピーに一本化する。
export default function AnimatedHero({
  name,
  role,
  description,
  githubUrl,
}: AnimatedHeroProps) {
  const [ready, setReady] = useState(false);
  // prefers-reduced-motion: reduce 時は entry の派手な動きを抑え、最終状態を即時表示
  const reduceMotion = useReducedMotion() ?? false;

  useEffect(() => {
    setReady(true);
  }, []);

  // コピー各行 — 左からスライドイン（entry。scroll 連動のキネティックとは別レイヤー）
  const trail = useTrail(5, {
    opacity: ready ? 1 : 0,
    transform: ready ? 'translateX(0px)' : 'translateX(-40px)',
    config: { tension: 100, friction: 18 },
    delay: 100,
    immediate: reduceMotion,
  });

  return (
    <div className="relative z-10 w-full max-w-2xl px-6 sm:px-10 lg:pl-[5vw] lg:pr-8">
      {/* 小ラベル — 赤い横線 + キャプション（cream on black 15.37） */}
      <animated.div style={trail[0]} className="flex items-center gap-3 mb-5">
        <div className="w-8 h-0.5 bg-constructivist-red" aria-hidden="true" />
        <span className="font-mono text-xs text-constructivist-cream tracking-[0.3em] uppercase">
          Software Engineer — Sapporo, Japan
        </span>
      </animated.div>

      {/* 名前 — 極大 H1。scroll 連動の letter-spacing 伸縮 + scale ピン（.hero-h1-kinetic） */}
      <animated.div style={trail[1]} className="relative">
        {/* 背景の薄い番号（Lissitzky 的装飾） */}
        <div
          className="absolute -left-2 -top-6 font-sans text-display-fluid text-constructivist-red select-none pointer-events-none"
          style={{ opacity: 0.05 }}
          aria-hidden="true"
        >
          01
        </div>
        <h1 className="hero-h1-kinetic font-sans text-display-fluid text-constructivist-cream relative z-10">
          {name}
        </h1>
      </animated.div>

      {/* ROLE — skew の斜線力線（赤帯）。内側で逆 skew して字は正立・可読 */}
      <animated.div style={trail[2]} className="mt-4">
        <div className="hero-role-skew inline-block bg-constructivist-red px-5 py-2">
          <span className="hero-role-inner block font-sans text-xl sm:text-2xl text-constructivist-cream tracking-[0.14em]">
            {role}
          </span>
        </div>
      </animated.div>

      {/* 説明文 — 左に赤の力線（gray on black 4.82 OK） */}
      <animated.p
        style={trail[3]}
        className="mt-6 text-constructivist-gray text-base leading-relaxed max-w-md font-body border-l-2 border-constructivist-red pl-4"
      >
        {description}
      </animated.p>

      {/* リンク — 楔矢印 + 版ずれ（misprint） */}
      <animated.div style={trail[4]} className="mt-8">
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
          <span className="misprint-text-in-group font-sans text-base text-constructivist-cream tracking-widest pl-3">
            GITHUB.COM/NIGOH
          </span>
        </a>
      </animated.div>
    </div>
  );
}
