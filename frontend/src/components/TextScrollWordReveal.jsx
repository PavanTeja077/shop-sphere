import React, { Fragment, useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

const START_OPACITY = 0.2;
const SPREAD = 0.85;
const WORD_DURATION = 0.2;

function getWordProgressRange(index, count) {
  const start = count <= 1 ? 0 : (index / (count - 1)) * SPREAD;
  return {
    start,
    end: Math.min(1, start + WORD_DURATION),
  };
}

function getWordOpacity(progress, { start, end }, startOpacity = START_OPACITY) {
  if (progress <= start) return startOpacity;
  if (progress >= end) return 1;
  const wordProgress = (progress - start) / (end - start);
  return startOpacity + (1 - startOpacity) * wordProgress;
}

function Word({ children, progress, index, count, reducedMotion }) {
  const range = getWordProgressRange(index, count);
  const opacity = useTransform(progress, (latest) =>
    getWordOpacity(latest, range)
  );

  return (
    <motion.span
      aria-hidden="true"
      style={reducedMotion ? undefined : { opacity }}
      className="inline-block transition-colors duration-200"
    >
      {children}
    </motion.span>
  );
}

export default function TextScrollWordReveal({
  statement = "Animation should never make you wait. It should reveal the next idea at exactly the moment you are ready to read it.",
  kicker = "SELLER PLATFORM HIGHLIGHT",
}) {
  const sectionRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 85%', 'end 25%'],
  });
  const words = statement.split(' ');

  return (
    <div
      ref={sectionRef}
      className="scroll-word-reveal relative my-8 glass-panel p-8 md:p-12 rounded-3xl border border-brand-500/20 shadow-2xl overflow-hidden"
    >
      {/* Subtle background glow */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="scroll-word-reveal__layout flex flex-col md:flex-row items-start gap-8 relative z-10">
        <div className="scroll-word-reveal__progress hidden md:block relative w-[2px] h-28 bg-white/10 rounded-full overflow-hidden shrink-0 mt-2">
          <motion.span
            className="absolute inset-0 bg-gradient-to-b from-brand-400 via-teal-300 to-brand-500 origin-top block w-full"
            style={{ scaleY: reducedMotion ? 1 : scrollYProgress }}
          />
        </div>

        <div className="scroll-word-reveal__content max-w-4xl">
          <p className="scroll-word-reveal__kicker text-xs font-mono font-bold tracking-[0.2em] text-brand-400 uppercase mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-400"></span>
            {kicker}
          </p>
          <h2
            className="scroll-word-reveal__heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.25] text-white select-none"
            aria-label={statement}
          >
            {words.map((word, index) => (
              <Fragment key={`${word}-${index}`}>
                <Word
                  progress={scrollYProgress}
                  index={index}
                  count={words.length}
                  reducedMotion={Boolean(reducedMotion)}
                >
                  {word}
                </Word>
                {index < words.length - 1 ? ' ' : null}
              </Fragment>
            ))}
          </h2>
        </div>
      </div>
    </div>
  );
}

