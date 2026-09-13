import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { site, heroStack } from '@/data/site';
import { EASE, staggerContainer } from '@/lib/motion';
import MagneticButton from '@/components/ui/MagneticButton';
import Marquee from '@/components/ui/Marquee';
import MaskedText from '@/components/ui/MaskedText';

const container = staggerContainer(1.5, 0.09);

const item = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

function scrollTo(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  window.scrollTo({
    top: target.getBoundingClientRect().top + window.scrollY - (id === 'home' ? 0 : 64),
    behavior: 'smooth',
  });
}

export default function Hero() {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  const contentY = useTransform(scrollYProgress, [0, 1], [0, 130]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const gridY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 190]);
  const glowScale = useTransform(scrollYProgress, [0, 1], [1, 1.25]);

  return (
    <section id="home" className="hero" ref={ref}>
      <motion.div className="hero__grid bg-grid" style={{ y: gridY }} aria-hidden="true" />
      <motion.div className="hero__glow" style={{ y: glowY, scale: glowScale }} aria-hidden="true" />
      <div className="hero__noise bg-noise" aria-hidden="true" />
      <div className="hero__vignette" aria-hidden="true" />

      <motion.div className="hero__inner container" style={{ y: contentY, opacity: contentOpacity }}>
        <motion.div className="hero__copy" variants={container} initial="hidden" animate="show">
          <motion.div className="hero__status" variants={item}>
            <span className="pulse" aria-hidden="true" />
            {site.availability}
          </motion.div>

          <h1 className="hero__title">
            <MaskedText text="Building digital" split="words" delay={1.62} stagger={0.07} />
            <span className="hero__line">
              <MaskedText text="experiences that" split="words" delay={1.78} stagger={0.07} />
            </span>
            <span className="hero__line hero__line--accent">
              <MaskedText text="actually work." split="words" delay={1.94} stagger={0.07} />
              <motion.span
                className="hero__underline"
                aria-hidden="true"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.1, ease: EASE, delay: 2.5 }}
              />
            </span>
          </h1>

          <motion.p className="hero__lede" variants={item}>
            I&rsquo;m {site.name} a full-stack developer in {site.location}. I build modern
            websites, web applications, e-commerce platforms and business systems for real products
            and real users.
          </motion.p>

          <motion.div className="hero__actions" variants={item}>
            <MagneticButton variant="primary" onClick={() => scrollTo('projects')} cursor="link">
              View My Work
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M8 2v12M8 14l4.5-4.5M8 14l-4.5-4.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </MagneticButton>
            <MagneticButton onClick={() => scrollTo('contact')} cursor="link">
              Let&rsquo;s Work Together
            </MagneticButton>
          </motion.div>

          <motion.ul className="hero__stack" variants={item}>
            <li className="hero__stack-label">Stack</li>
            {heroStack.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div
          className="hero__aside"
          initial={{ opacity: 0, scale: 0.82, rotate: -12 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.1, ease: EASE, delay: 2.15 }}
        >
          <Dial />
        </motion.div>
      </motion.div>

      <motion.button
        type="button"
        className="hero__scroll"
        onClick={() => scrollTo('about')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.7, duration: 0.6 }}
        aria-label="Scroll to about section"
      >
        <span className="hero__scroll-track">
          <motion.span
            className="hero__scroll-dot"
            animate={{ y: [0, 26, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </span>
        <span>Scroll</span>
      </motion.button>

      <div className="hero__marquee">
        <Marquee />
      </div>
    </section>
  );
}

/** Rotating studio badge — circular type around a lime arrow. */
function Dial() {
  return (
    <div className="dial">
      <motion.svg
        viewBox="0 0 200 200"
        className="dial__ring"
        animate={{ rotate: 360 }}
        transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
        aria-hidden="true"
      >
        <defs>
          <path id="dial-path" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" />
        </defs>
        <text className="dial__text">
          <textPath href="#dial-path" startOffset="0">
            SOFTWARE DEVELOPER · FULL-STACK · REACT · TYPESCRIPT · LAGOS ·
          </textPath>
        </text>
      </motion.svg>

      <div className="dial__core">
        <motion.span
          className="dial__arrow"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 4v16M12 20l6-6M12 20l-6-6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </motion.span>
        <span className="dial__label">Est. 2021</span>
      </div>
    </div>
  );
}
