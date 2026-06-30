import { useTrail, useSpring, animated, useReducedMotion } from '@react-spring/web';
import { useEffect, useRef, useState } from 'react';

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}

interface AnimatedTimelineProps {
  events: TimelineEvent[];
}

export default function AnimatedTimeline({ events }: AnimatedTimelineProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  // prefers-reduced-motion: reduce 時は trail/ライン伸長を無効化し最終状態を即時表示
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

  const trail = useTrail(events.length, {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateX(0px)' : 'translateX(-50px)',
    config: { tension: 100, friction: 18 },
    delay: 150,
    immediate: reduceMotion,
  });

  const lineSpring = useSpring({
    scaleY: isVisible ? 1 : 0,
    config: { tension: 40, friction: 14 },
    delay: 100,
    immediate: reduceMotion,
  });

  // 楔形のインラインスタイルを生成
  const wedgeStyle = (isEven: boolean): React.CSSProperties => ({
    width: 0,
    height: 0,
    borderTop: '14px solid transparent',
    borderBottom: '14px solid transparent',
    borderLeft: `18px solid ${isEven ? '#D62828' : '#1A1A1A'}`,
    flexShrink: 0,
    alignSelf: 'center',
  });

  return (
    <div ref={ref} className="relative">
      {/* 背景の大きな薄い「T」文字（Lissitzky的装飾） */}
      <div
        className="absolute -right-4 top-0 font-sans text-[18rem] text-constructivist-red leading-none select-none pointer-events-none"
        style={{ opacity: 0.04 }}
        aria-hidden="true"
      >
        T
      </div>

      {/* 垂直ライン — 上から伸びるアニメーション */}
      <animated.div
        style={{ scaleY: lineSpring.scaleY, transformOrigin: 'top' }}
        className="absolute left-[88px] top-0 bottom-0 w-px bg-constructivist-red"
        aria-hidden="true"
      />

      <div className="space-y-0">
        {trail.map((style, i) => (
          <animated.div
            key={events[i].year}
            style={style}
            className="relative flex items-stretch"
          >
            {/* 年号ブロック — 赤/黒交互 */}
            <div
              className={`w-[88px] shrink-0 flex items-center justify-center py-10 ${
                i % 2 === 0
                  ? 'bg-constructivist-red'
                  : 'bg-constructivist-black border border-constructivist-red'
              }`}
            >
              <span
                className="font-sans text-base text-constructivist-cream tracking-widest"
                style={{ writingMode: 'vertical-rl', letterSpacing: '0.12em' }}
              >
                {events[i].year}
              </span>
            </div>

            {/* 楔形コネクター */}
            <div style={wedgeStyle(i % 2 === 0)} aria-hidden="true" />

            {/* コンテンツ */}
            <div className="flex-1 border-b border-constructivist-red py-8 px-6 relative opacity-90">
              {/* 背後の大きなインデックス番号 */}
              <div
                className="absolute right-4 top-1/2 -translate-y-1/2 font-sans text-[4.5rem] text-constructivist-red leading-none select-none pointer-events-none"
                style={{ opacity: 0.06 }}
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, '0')}
              </div>
              <h3 className="font-sans text-2xl sm:text-3xl text-constructivist-cream mb-2 tracking-wide relative z-10">
                {events[i].title}
              </h3>
              <p className="text-constructivist-gray text-sm font-body relative z-10 max-w-lg">
                {events[i].description}
              </p>
            </div>
          </animated.div>
        ))}
      </div>

      {/* 下部締め装飾 */}
      <div className="flex items-center gap-3 mt-6" aria-hidden="true">
        <div className="h-px flex-1 bg-constructivist-red" style={{ opacity: 0.4 }} />
        <div
          style={{
            width: 0,
            height: 0,
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderLeft: '14px solid #D62828',
          }}
        />
      </div>
    </div>
  );
}
