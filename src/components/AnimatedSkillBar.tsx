import { useSpring, animated } from '@react-spring/web';
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

function SkillBar({ skill, delay }: { skill: Skill; delay: number }) {
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
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const spring = useSpring({
    width: isVisible ? `${skill.level}%` : '0%',
    opacity: isVisible ? 1 : 0,
    delay,
    config: { tension: 60, friction: 16 },
  });

  const numberSpring = useSpring({
    val: isVisible ? skill.level : 0,
    delay,
    config: { tension: 60, friction: 16 },
  });

  return (
    <div ref={ref}>
      <div className="flex justify-between items-baseline mb-2">
        <span className="font-body font-semibold text-constructivist-cream">{skill.name}</span>
        <animated.span className="text-sm text-constructivist-gray font-mono">
          {numberSpring.val.to((v) => `${Math.floor(v)}%`)}
        </animated.span>
      </div>
      <div className="w-full bg-constructivist-darkgray h-3 overflow-hidden">
        <animated.div
          className="bg-constructivist-red h-3"
          style={{ width: spring.width }}
        />
      </div>
      <animated.p className="text-xs text-constructivist-gray mt-1 font-body" style={{ opacity: spring.opacity }}>
        {skill.description}
      </animated.p>
    </div>
  );
}

export default function AnimatedSkillBar({ groups }: AnimatedSkillBarProps) {
  return (
    <div className="space-y-12">
      {groups.map((group) => (
        <div key={group.category}>
          <h3 className="text-xs font-bold text-constructivist-red uppercase tracking-widest mb-6 font-body">
            {group.category}
          </h3>
          <div className="space-y-6">
            {group.items.map((skill, i) => (
              <SkillBar key={skill.name} skill={skill} delay={i * 150} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
