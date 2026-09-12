import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { site } from '@/data/site';
import { EASE } from '@/lib/motion';
import { useBodyScrollLock, useIsMobile } from '@/hooks/useMediaQuery';
import { cursorProps } from '@/lib/cursor';
import MagneticButton from '@/components/ui/MagneticButton';

const LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contact' },
];

export default function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('home');
  const isMobile = useIsMobile();
  const { pathname } = useLocation();

  useBodyScrollLock(open);
  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 24);
    setHidden(latest > 420 && latest > (scrollY.getPrevious() ?? 0));
  });

  /* Which section is on screen right now */
  useEffect(() => {
    const sections = LINKS.map((link) => document.getElementById(link.id)).filter(
      (node): node is HTMLElement => Boolean(node),
    );
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.2, 0.6] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  function goTo(id: string) {
    setOpen(false);
    const target = document.getElementById(id);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - (id === 'home' ? 0 : 64);
    window.scrollTo({ top, behavior: 'smooth' });
  }

  return (
    <>
      <motion.header
        className={`nav ${scrolled ? 'nav--scrolled' : ''}`}
        initial={{ y: -90, opacity: 0 }}
        animate={{ y: hidden && !open ? -90 : 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: EASE, delay: 1.55 }}
      >
        <nav className="nav__inner container" aria-label="Primary">
          <button
            type="button"
            className="nav__brand"
            onClick={() => goTo('home')}
            aria-label="Back to top"
            {...cursorProps('link')}
          >
            <span className="nav__mark">TS</span>
            <span className="nav__name">
              Toviho Segun David
              <em>{site.role}</em>
            </span>
          </button>

          <ul className="nav__links">
            {LINKS.map((link) => (
              <li key={link.id}>
                <button
                  type="button"
                  className={`nav__link ${active === link.id ? 'is-active' : ''}`}
                  onClick={() => goTo(link.id)}
                  aria-current={active === link.id ? 'true' : undefined}
                  {...cursorProps('link')}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="nav__cta">
            <MagneticButton
              className="nav__talk"
              variant="primary"
              size="sm"
              onClick={() => goTo('contact')}
              cursor="link"
              magnetic={10}
            >
              Let&rsquo;s Talk
            </MagneticButton>

            <button
              type="button"
              className={`nav__burger ${open ? 'is-open' : ''}`}
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              <span />
              <span />
            </button>
          </div>
        </nav>
        <div className="nav__line" aria-hidden="true" />
      </motion.header>

      <AnimatePresence>
        {open && isMobile ? (
          <motion.div
            id="mobile-menu"
            className="mobile-menu"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <div className="mobile-menu__grid" aria-hidden="true" />
            <ul className="mobile-menu__list">
              {LINKS.map((link, index) => (
                <motion.li
                  key={link.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, ease: EASE, delay: 0.12 + index * 0.07 }}
                >
                  <button type="button" onClick={() => goTo(link.id)}>
                    <span className="mobile-menu__index">{String(index + 1).padStart(2, '0')}</span>
                    {link.label}
                  </button>
                </motion.li>
              ))}
            </ul>

            <motion.div
              className="mobile-menu__foot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <a href={`mailto:${site.email}`}>{site.email}</a>
              <div className="mobile-menu__socials">
                <a href={site.github} target="_blank" rel="noreferrer noopener">
                  GitHub
                </a>
                <a href={site.linkedin} target="_blank" rel="noreferrer noopener">
                  LinkedIn
                </a>
                <a href={site.phoneHref}>{site.phone}</a>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
