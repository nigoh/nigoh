import { useTrail, animated } from '@react-spring/web';
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
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const trail = useTrail(events.length, {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateX(0px)' : 'translateX(-30px)',
    config: { tension: 120, friction: 16 },
    delay: 200,
  });

  return (
    <div ref={ref} className="relative">
      {/* 垂直ライン */}
      <div className="absolute left-[4.5rem] top-0 bottom-0 w-0.5 bg-constructivist-red" />
      <div className="space-y-12">
        {trail.map((style, i) => (
          <animated.div key={events[i].year} style={style} className="relative pl-28">
            <div className="absolute left-0 top-0 w-16 text-right">
              <span className="font-sans text-2xl text-constructivist-red">{events[i].year}</span>
            </div>
            {/* 赤い正方形マーカー */}
            <div className="absolute left-[4rem] top-2 w-3 h-3 bg-constructivist-red transform rotate-45" />
            <div>
              <h3 className="font-sans text-xl text-constructivist-cream mb-1 tracking-wide">{events[i].title}</h3>
              <p className="text-constructivist-gray text-sm font-body">{events[i].description}</p>
            </div>
          </animated.div>
        ))}
      </div>
    </div>
  );
}
