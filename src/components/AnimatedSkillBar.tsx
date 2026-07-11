import { useSpring, animated, useReducedMotion } from '@react-spring/web';
import { useEffect, useRef, useState } from 'react';

interface Skill {
  name: string;
  level: number;
  description: string;
}

interface SkillGroup {
  category: string;
  items: Skill[];
}

interface AnimatedSkillBarProps {
  groups: SkillGroup[];
}

function SkillBar({ skill, delay, index }: { skill: Skill; delay: number; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  // prefers-reduced-motion: reduce 時はバー幅・数値を最終値で即時表示
  const reduceMotion = useReducedMotion() ?? false;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const spring = useSpring({
    width: isVisible ? `${skill.level}%` : '0%',
    opacity: isVisible ? 1 : 0,
    delay,
    config: { tension: 50, friction: 18 },
    immediate: reduceMotion,
  });

  const numberSpring = useSpring({
    val: isVisible ? skill.level : 0,
    delay,
    config: { tension: 50, friction: 18 },
    immediate: reduceMotion,
  });

  return (
    <div ref={ref} className="relative">
      {/* 背景の薄い番号 */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 font-sans text-7xl text-constructivist-red leading-none select-none pointer-events-none"
        style={{ opacity: 0.05 }}
        aria-hidden="true"
      >
        {String(index + 1).padStart(2, '0')}
      </div>

      <div className="flex justify-between items-baseline mb-2 relative z-10">
        {/* 楔 + スキル名 */}
        <div className="flex items-center gap-2">
          <div
            style={{
              width: 0,
              height: 0,
              borderTop: '6px solid transparent',
              borderBottom: '6px solid transparent',
              borderLeft: '10px solid #D62828',
            }}
            aria-hidden="true"
          />
          <span className="font-sans text-lg text-constructivist-cream tracking-wide">{skill.name}</span>
        </div>
        {/* パーセント — 大きく表示 */}
        <div className="flex items-baseline gap-0.5">
          {/* データ数値は mono（trends-2026-refresh.spec F-4。24px red は大テキスト 3:1 OK） */}
          <animated.span className="font-mono text-2xl text-constructivist-red">
            {numberSpring.val.to((v) => `${Math.floor(v)}`)}
          </animated.span>
          <span className="text-sm text-constructivist-gray font-body">%</span>
        </div>
      </div>

      {/* バー本体 — 黒地、高さ増 */}
      <div className="w-full bg-constructivist-black h-5 overflow-hidden relative z-10">
        <animated.div
          className="bg-constructivist-red h-5"
          style={{ width: spring.width }}
        />
      </div>

      <animated.p
        className="text-xs text-constructivist-gray mt-1.5 font-body pl-4 relative z-10"
        style={{ opacity: spring.opacity }}
      >
        {skill.description}
      </animated.p>
    </div>
  );
}

export default function AnimatedSkillBar({ groups }: AnimatedSkillBarProps) {
  // カテゴリ帯は三原色を巡回。黄帯は暗字（cream on yellow は AA 不可のため）。
  const bands = [
    { bg: 'bg-bauhaus-red', ink: 'text-constructivist-cream', accent: 'bg-bauhaus-red', num: 'text-bauhaus-red' },
    { bg: 'bg-bauhaus-blue', ink: 'text-constructivist-cream', accent: 'bg-bauhaus-blue', num: 'text-bauhaus-blue' },
    { bg: 'bg-bauhaus-yellow', ink: 'text-constructivist-black', accent: 'bg-bauhaus-yellow', num: 'text-bauhaus-yellow' },
  ];

  return (
    <div className="space-y-16">
      {groups.map((group, gi) => {
        const band = bands[gi % bands.length];
        return (
        <div key={group.category}>
          {/* カテゴリーヘッダー — 原色帯 + 罫線 + 番号 */}
          <div className="flex items-center gap-0 mb-8">
            <div className={`${band.bg} px-4 py-1.5`}>
              <h3 className={`font-sans text-sm ${band.ink} tracking-[0.25em]`}>
                {group.category}
              </h3>
            </div>
            <div className={`h-px flex-1 ${band.accent}`} style={{ opacity: 0.3 }} />
            <span
              className={`font-sans text-3xl ${band.num} ml-4`}
              style={{ opacity: 0.3 }}
              aria-hidden="true"
            >
              {String(gi + 1).padStart(2, '0')}
            </span>
          </div>

          <div className="space-y-8">
            {group.items.map((skill, i) => (
              <SkillBar key={skill.name} skill={skill} delay={i * 120} index={i} />
            ))}
          </div>
        </div>
        );
      })}
    </div>
  );
}
