// FMCarousel.tsx
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Slide = { id: string | number; content: React.ReactNode };

interface FMCarouselProps {
  slides: Slide[];
  autoPlay?: boolean;
  interval?: number; // мс
  height?: number | string;
  rounded?: number; // px радиус
  pauseOnHover?: boolean;
  showArrows?: boolean;
  showDots?: boolean;
}

const swipeConfidenceThreshold = 8000; // чем больше — тем сложнее «проскроллить»
const swipePower = (offset: number, velocity: number) => Math.abs(offset) * velocity;

// бесконечная пагинация
const wrapIndex = (i: number, len: number) => (i + len) % len;

export function FMCarousel({
  slides,
  autoPlay = true,
  interval = 3000,
  height = 400,
  rounded = 20,
  pauseOnHover = true,
  showArrows = true,
  showDots = true,
}: FMCarouselProps) {
  const [[page, direction], setPage] = useState<[number, number]>([0, 0]);
  const index = wrapIndex(page, slides.length);

  const timerRef = useRef<number | null>(null);
  const hoveredRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const isDraggingRef = useRef(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [w, setW] = useState(0);

  const paginate = (newDirection: number) => {
    if (isAnimatingRef.current || slides.length <= 1) return;
    setPage(([p]) => [p + newDirection, newDirection]);
  };

  // измеряем ширину контейнера => плавный уход «за край»
  useLayoutEffect(() => {
    const update = () => {
      if (containerRef.current) setW(containerRef.current.clientWidth);
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // автоплей
  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;

    const tick = () => {
      if (!hoveredRef.current && !isAnimatingRef.current && !isDraggingRef.current) {
        paginate(1);
      }
    };

    timerRef.current = window.setInterval(tick, interval);

    const clear = () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };

    // пауза, если вкладка скрыта
    const onVisibility = () => {
      if (document.hidden) clear();
      else if (!timerRef.current) timerRef.current = window.setInterval(tick, interval);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clear();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [autoPlay, interval, slides.length]);

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? w : -w, opacity: 0.8 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -w : w, opacity: 0.8 }),
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: typeof height === "number" ? `${height}px` : height,
        overflow: "hidden",
        background: "#0f1111",
        borderRadius: rounded,
      }}
      onMouseEnter={() => { if (pauseOnHover) hoveredRef.current = true; }}
      onMouseLeave={() => { if (pauseOnHover) hoveredRef.current = false; }}
    >
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={page} // важный ключ — чтобы exit/enter работали
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "tween", duration: 0.38, ease: [0.22, 0.61, 0.36, 1] }}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            display: "grid",
            placeItems: "center",
            filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.35))",
            borderRadius: rounded,
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.9}
          dragMomentum={false}
          onDragStart={() => { isDraggingRef.current = true; }}
          onDragEnd={(_, { offset, velocity }) => {
            isDraggingRef.current = false;
            const power = swipePower(offset.x, velocity.x);
            if (power < -swipeConfidenceThreshold) paginate(1);
            else if (power > swipeConfidenceThreshold) paginate(-1);
          }}
          onAnimationStart={() => { isAnimatingRef.current = true; }}
          onAnimationComplete={() => { isAnimatingRef.current = false; }}
        >
          {/* сам слайд */}
          <div
            style={{
              width: "90vw",
              height: "100%",
              display: "grid",
              placeItems: "center",
              color: "#fff",
              fontSize: 28,
              fontWeight: 700,
              userSelect: "none",
              background: "transparent",
              borderRadius: rounded,
            }}
          >
            {slides[index].content}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Стрелки */}
      {showArrows && slides.length > 1 && (
        <>
          <button
            aria-label="Prev"
            onClick={() => paginate(-1)}
            style={arrowStyle("left")}
          >
            ‹
          </button>
          <button
            aria-label="Next"
            onClick={() => paginate(1)}
            style={arrowStyle("right")}
          >
            ›
          </button>
        </>
      )}

      {/* Точки */}
      {showDots && slides.length > 1 && (
        <div style={dotsWrapStyle}>
          {slides.map((_, i) => {
            const active = i === index;
            const diff = i - index;
            return (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => {
                  if (active) return;
                  setPage(([p]) => [p + diff, Math.sign(diff) || 1]);
                }}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  margin: "0 6px",
                  border: "none",
                  cursor: "pointer",
                  background: active ? "#ff6a00" : "rgba(255,255,255,.6)",
                  transform: active ? "scale(1.15)" : "scale(1)",
                  transition: "transform .2s ease, background .2s ease",
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// стили помощники
const arrowStyle = (side: "left" | "right"): React.CSSProperties => ({
  position: "absolute",
  top: "50%",
  [side]: 12,
  transform: "translateY(-50%)",
  width: 44,
  height: 44,
  borderRadius: "50%",
  border: "none",
  background: "rgba(0,0,0,.35)",
  color: "#fff",
  fontSize: 28,
  lineHeight: 0,
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
  zIndex: 10,
  transition: "opacity .2s ease",
});

const dotsWrapStyle: React.CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 10,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 10,
};
