import { useSpring, animated, useReducedMotion } from '@react-spring/web';
import { useEffect, useRef, useState, type ReactNode } from 'react';

const TRANSLATE_DISTANCE = 40;

interface FadeInProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  delay?: number;
  className?: string;
}

export default function FadeIn({
  children,
  direction = 'up',
  delay = 0,
  className = '',
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  // prefers-reduced-motion: reduce 時は translate を無効化し最終状態を即時表示
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

  const getInitialTransform = () => {
    const d = TRANSLATE_DISTANCE;
    switch (direction) {
      case 'up':
        return `translateX(0px) translateY(${d}px)`;
      case 'down':
        return `translateX(0px) translateY(-${d}px)`;
      case 'left':
        return `translateX(${d}px) translateY(0px)`;
      case 'right':
        return `translateX(-${d}px) translateY(0px)`;
      case 'none':
        return 'translateX(0px) translateY(0px)';
    }
  };

  const spring = useSpring({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateX(0px) translateY(0px)' : getInitialTransform(),
    delay,
    config: { tension: 120, friction: 14 },
    immediate: reduceMotion,
  });

  return (
    <animated.div ref={ref} style={spring} className={className}>
      {children}
    </animated.div>
  );
}
