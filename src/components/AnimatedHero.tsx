import { useTrail, animated, useSpring, useReducedMotion } from '@react-spring/web';
import { useEffect, useState } from 'react';

interface AnimatedHeroProps {
  name: string;
  role: string;
  description: string;
  githubUrl: string;
  avatarUrl: string;
}

export default function AnimatedHero({
  name,
  role,
  description,
  githubUrl,
  avatarUrl,
}: AnimatedHeroProps) {
  const [ready, setReady] = useState(false);
  // prefers-reduced-motion: reduce 時は trail/scale-rotate の派手な動きを抑え、最終状態を即時表示
  const reduceMotion = useReducedMotion() ?? false;

  useEffect(() => {
    setReady(true);
  }, []);

  // テキストブロック — 左からスライドイン
  const trail = useTrail(6, {
    opacity: ready ? 1 : 0,
    transform: ready ? 'translateX(0px)' : 'translateX(-40px)',
    config: { tension: 100, friction: 18 },
    delay: 100,
    immediate: reduceMotion,
  });

  // 赤い大ブロック（Proun背景）
  const redBlockSpring = useSpring({
    opacity: ready ? 1 : 0,
    transform: ready ? 'scale(1) rotate(-6deg)' : 'scale(0.5) rotate(-30deg)',
    config: { tension: 70, friction: 14 },
    delay: 900,
    immediate: reduceMotion,
  });

  // 黒い小ブロック
  const blackBlockSpring = useSpring({
    opacity: ready ? 0.9 : 0,
    transform: ready ? 'translate(0px,0px) rotate(12deg)' : 'translate(-30px,30px) rotate(50deg)',
    config: { tension: 80, friction: 16 },
    delay: 1100,
    immediate: reduceMotion,
  });

  // 輪郭円
  const circleOpacity = useSpring({
    opacity: ready ? 0.25 : 0,
    config: { tension: 60, friction: 14 },
    delay: 1300,
    immediate: reduceMotion,
  });

  // アバター
  const avatarSpring = useSpring({
    opacity: ready ? 1 : 0,
    transform: ready ? 'scale(1)' : 'scale(0.7)',
    config: { tension: 90, friction: 14 },
    delay: 600,
    immediate: reduceMotion,
  });

  // 下部区切り線
  const ruleSpring = useSpring({
    opacity: ready ? 0.2 : 0,
    config: { tension: 60, friction: 14 },
    delay: 1500,
    immediate: reduceMotion,
  });

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">

      {/* Proun的な幾何学コンポジション — 右端へ寄せ、avatar と別重心に（余白の谷を作る） */}
      <div className="absolute top-24 right-0 w-56 h-56 sm:top-0 sm:w-80 sm:h-80 pointer-events-none" aria-hidden="true">
        <animated.div
          style={redBlockSpring}
          className="absolute top-4 right-0 w-36 h-36 sm:w-52 sm:h-52 bg-constructivist-red origin-center"
        />
        <animated.div
          style={blackBlockSpring}
          className="absolute top-12 right-8 w-16 h-16 sm:top-20 sm:right-12 sm:w-24 sm:h-24 bg-constructivist-black origin-center"
        />
        <animated.div
          style={circleOpacity}
          className="absolute top-0 right-0 w-28 h-28 sm:w-40 sm:h-40 rounded-full border-4 border-constructivist-cream"
        />
      </div>

      <div className="flex flex-col md:flex-row items-start gap-0 md:gap-20">

        {/* テキストブロック */}
        <div className="flex-1 relative">

          {/* 小ラベル — 赤い横線 + キャプション */}
          <animated.div style={trail[0]} className="flex items-center gap-3 mb-6">
            <div className="w-8 h-0.5 bg-constructivist-red" />
            <span className="font-body text-xs text-constructivist-cream tracking-[0.3em] uppercase">
              Software Engineer — Sapporo, Japan
            </span>
          </animated.div>

          {/* 名前 — 極大 */}
          <animated.div style={trail[1]} className="relative">
            {/* 背景の薄い番号（Lissitzky的装飾） */}
            <div
              className="absolute -left-2 -top-6 font-sans text-[9rem] text-constructivist-red leading-none select-none pointer-events-none"
              style={{ opacity: 0.05 }}
              aria-hidden="true"
            >
              01
            </div>
            <h1 className="font-sans text-[5.5rem] sm:text-[8rem] lg:text-[10rem] text-constructivist-cream tracking-tighter leading-none relative z-10">
              {name}
            </h1>
          </animated.div>

          {/* ROLE — 楔 + 赤帯 */}
          <animated.div style={trail[2]} className="flex items-center gap-0 my-6">
            <div
              className="shrink-0"
              style={{
                width: 0,
                height: 0,
                borderTop: '22px solid transparent',
                borderBottom: '22px solid transparent',
                borderLeft: '30px solid #D62828',
              }}
              aria-hidden="true"
            />
            <div className="bg-constructivist-red px-6 py-3">
              <p className="font-sans text-xl sm:text-2xl text-constructivist-cream tracking-[0.2em]">
                {role}
              </p>
            </div>
          </animated.div>

          {/* ルール線 */}
          <animated.div
            style={{ opacity: trail[3].opacity.to((o) => o * 0.15) }}
            className="w-full h-px bg-constructivist-cream mb-6"
            aria-hidden="true"
          />

          {/* 説明文 — 左ボーダー付き */}
          <animated.p
            style={trail[4]}
            className="text-constructivist-gray text-base sm:text-lg leading-relaxed max-w-md font-body border-l-2 border-constructivist-red pl-4"
          >
            {description}
          </animated.p>

          {/* リンク — 楔矢印 */}
          <animated.div style={trail[5]} className="mt-10">
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-0 min-h-11"
            >
              <div
                className="shrink-0 group-hover:opacity-70 transition-opacity"
                style={{
                  width: 0,
                  height: 0,
                  borderTop: '9px solid transparent',
                  borderBottom: '9px solid transparent',
                  borderLeft: '15px solid #D62828',
                }}
                aria-hidden="true"
              />
              <span className="font-sans text-base text-constructivist-cream tracking-widest pl-3 group-hover:text-constructivist-red transition-colors">
                GITHUB.COM/NIGOH
              </span>
            </a>
          </animated.div>
        </div>

        {/* アバター — 多重フレーム構成。Proun ブロックより下げて別重心に（余白の谷） */}
        <div className="shrink-0 relative mt-8 md:mt-32">
          {/* 後ろの黒い正方形（ズレた影） */}
          <div className="absolute top-5 left-5 w-44 h-44 sm:w-56 sm:h-56 bg-constructivist-black" aria-hidden="true" />
          {/* 赤い細枠（ズレ） */}
          <div className="absolute -top-3 -right-3 w-44 h-44 sm:w-56 sm:h-56 border-4 border-constructivist-red" aria-hidden="true" />
          {/* 本体 */}
          <animated.div style={avatarSpring} className="relative w-44 h-44 sm:w-56 sm:h-56 z-10">
            <img
              src={avatarUrl}
              alt={`${name} のプロフィール写真`}
              width="224"
              height="224"
              className="w-full h-full object-cover grayscale contrast-[1.3] brightness-90"
              loading="eager"
            />
            {/* 名前プレート — 赤帯 */}
            <div className="absolute bottom-0 left-0 right-0 bg-constructivist-red py-1.5 px-3">
              <p className="font-sans text-xs text-constructivist-cream tracking-widest">H.NIGO / 1984</p>
            </div>
          </animated.div>
        </div>
      </div>

      {/* 下部の区切り装飾 */}
      <animated.div
        style={ruleSpring}
        className="mt-12 flex items-center gap-4"
        aria-hidden="true"
      >
        <div className="h-px flex-1 bg-constructivist-cream" />
        <div className="w-3 h-3 bg-constructivist-red rotate-45 shrink-0" />
        <div className="h-px w-20 bg-constructivist-red" />
      </animated.div>
    </div>
  );
}
