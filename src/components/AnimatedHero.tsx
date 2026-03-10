import { useTrail, animated, useSpring } from '@react-spring/web';
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

  useEffect(() => {
    setReady(true);
  }, []);

  const items = [
    { key: 'name' },
    { key: 'role' },
    { key: 'desc' },
    { key: 'link' },
  ];

  const trail = useTrail(items.length, {
    opacity: ready ? 1 : 0,
    transform: ready ? 'translateY(0px)' : 'translateY(30px)',
    config: { tension: 120, friction: 14 },
    delay: 200,
  });

  const avatarSpring = useSpring({
    opacity: ready ? 1 : 0,
    transform: ready ? 'scale(1) rotate(0deg)' : 'scale(0.8) rotate(-6deg)',
    config: { tension: 100, friction: 12 },
    delay: 500,
  });

  const decorSpring = useSpring({
    opacity: ready ? 0.3 : 0,
    transform: ready ? 'translate(0px, 0px)' : 'translate(16px, 16px)',
    config: { tension: 80, friction: 14 },
    delay: 700,
  });

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div className="flex flex-col md:flex-row items-start gap-8 md:gap-16">
        {/* テキストブロック */}
        <div className="flex-1">
          <animated.h1
            style={trail[0]}
            className="font-sans text-7xl sm:text-8xl lg:text-9xl text-constructivist-cream tracking-tight leading-none mb-4"
          >
            {name}
          </animated.h1>
          <animated.div style={trail[1]} className="inline-block bg-constructivist-red px-4 py-2 mb-8">
            <p className="font-sans text-xl sm:text-2xl text-constructivist-cream tracking-widest">
              {role}
            </p>
          </animated.div>
          <animated.p
            style={trail[2]}
            className="text-constructivist-gray text-base sm:text-lg leading-relaxed max-w-lg font-body"
          >
            {description}
          </animated.p>
          <animated.div style={trail[3]} className="mt-8">
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 text-constructivist-cream hover:text-constructivist-red transition-colors font-body text-sm tracking-wider"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              GITHUB.COM/NIGOH
            </a>
          </animated.div>
        </div>

        {/* 幾何学的アバター */}
        <div className="shrink-0 relative">
          <animated.div style={avatarSpring} className="w-40 h-40 sm:w-52 sm:h-52 bg-constructivist-red p-1">
            <img
              src={avatarUrl}
              alt={name}
              width="200"
              height="200"
              className="w-full h-full object-cover grayscale contrast-125"
              loading="eager"
            />
          </animated.div>
          {/* 装飾的な正方形 */}
          <animated.div
            style={decorSpring}
            className="absolute -bottom-4 -right-4 w-40 h-40 sm:w-52 sm:h-52 border-2 border-constructivist-cream"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}
