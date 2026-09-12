import { motion } from 'motion/react';
import { site } from '@/data/site';
import { fadeUp, staggerContainer, viewportOnce } from '@/lib/motion';
import { cursorProps } from '@/lib/cursor';

const LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contact' },
];

const SOCIALS = [
  { label: 'GitHub', href: site.github },
  { label: 'LinkedIn', href: site.linkedin },
  { label: 'Email', href: `mailto:${site.email}` },
];

export default function Footer() {
  const year = new Date().getFullYear();

  function goTo(id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - (id === 'home' ? 0 : 64),
      behavior: 'smooth',
    });
  }

  return (
    <footer className="footer">
      <div className="container">
        <motion.div
          className="footer__top"
          variants={staggerContainer(0, 0.08)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
        >
          <motion.div className="footer__brand" variants={fadeUp}>
            <span className="footer__mark">TS</span>
            <div>
              <strong>{site.name}</strong>
              <span>{site.role} · {site.location}</span>
            </div>
          </motion.div>

          <motion.nav className="footer__nav" aria-label="Footer" variants={fadeUp}>
            {LINKS.map((link) => (
              <button key={link.id} type="button" onClick={() => goTo(link.id)} {...cursorProps('link')}>
                {link.label}
              </button>
            ))}
          </motion.nav>

          <motion.div className="footer__socials" variants={fadeUp}>
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target={social.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer noopener"
                {...cursorProps('link')}
              >
                {social.label}
              </a>
            ))}
          </motion.div>
        </motion.div>

        <div className="footer__bottom">
          <span>
            © {year} {site.name}. All rights reserved.
          </span>
          <span className="footer__built">
            Built with React, TypeScript &amp; Motion
          </span>
        </div>
      </div>
    </footer>
  );
}
