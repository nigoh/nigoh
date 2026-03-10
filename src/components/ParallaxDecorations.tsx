import { useScroll, animated } from '@react-spring/web';

interface Shape {
  className: string;
  speed?: number;
  rotate?: number;
}

interface Props {
  shapes: Shape[];
}

export default function ParallaxDecorations({ shapes }: Props) {
  const { scrollY } = useScroll();

  return (
    <>
      {shapes.map((shape, i) => (
        <animated.div
          key={i}
          aria-hidden="true"
          className={shape.className}
          style={{
            transform: scrollY.to((y) => {
              const ty = y * (shape.speed ?? 0.1);
              return shape.rotate !== undefined
                ? `translateY(${ty}px) rotate(${shape.rotate}deg)`
                : `translateY(${ty}px)`;
            }),
          }}
        />
      ))}
    </>
  );
}
