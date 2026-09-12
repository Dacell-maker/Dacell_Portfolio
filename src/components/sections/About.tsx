import { motion } from 'motion/react';
import { aboutFocus, profile, site, stats } from '@/data/site';
import { EASE, fadeUp, staggerContainer, viewportOnce } from '@/lib/motion';
import SectionHead from '@/components/ui/SectionHead';
import CountUp from '@/components/ui/CountUp';

const rows = [
  { label: 'Degree', value: profile.degree },
  { label: 'University', value: profile.university },
  { label: 'Focus', value: profile.focus },
  { label: 'Interests', value: profile.interests },
];

export default function About() {
  return (
    <section id="about" className="section about">
      <div className="container">
        <SectionHead eyebrow="About me" title={<>Turning ideas into working software</>} />

        <div className="about__grid">
          {/* Sticky identity card ------------------------------------------------ */}
          <motion.aside
            className="about__card"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.85, ease: EASE }}
          >
            <div className="about__portrait">
              <svg className="about__portrait-grid" aria-hidden="true">
                <defs>
                  <pattern id="about-grid" width="22" height="22" patternUnits="userSpaceOnUse">
                    <path d="M22 0H0v22" fill="none" stroke="currentColor" strokeWidth="0.6" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#about-grid)" />
              </svg>
              <motion.span
                className="about__monogram"
                initial={{ opacity: 0, scale: 0.8, letterSpacing: '0.4em' }}
                whileInView={{ opacity: 1, scale: 1, letterSpacing: '0.02em' }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 1, ease: EASE }}
              >
                TS
              </motion.span>
              <span className="about__portrait-glow" aria-hidden="true" />
            </div>

            <div className="about__card-body">
              <h3>{site.name}</h3>
              <p className="about__card-role">
                {site.role} · {site.location}
              </p>
              <span className="badge badge--published">{profile.status}</span>

              <dl className="about__rows">
                {rows.map((row, index) => (
                  <motion.div
                    className="about__row"
                    key={row.label}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 0.55, ease: EASE, delay: index * 0.08 }}
                  >
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </motion.div>
                ))}
              </dl>
            </div>
          </motion.aside>

          {/* Narrative ----------------------------------------------------------- */}
          <motion.div
            className="about__body"
            variants={staggerContainer(0, 0.12)}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
          >
            {profile.paragraphs.map((paragraph) => (
              <motion.p className="about__text" key={paragraph.slice(0, 24)} variants={fadeUp}>
                {paragraph}
              </motion.p>
            ))}

            <motion.ul className="about__focus" variants={fadeUp}>
              {aboutFocus.map((focus) => (
                <li key={focus}>{focus}</li>
              ))}
            </motion.ul>

            <motion.div className="about__learning" variants={fadeUp}>
              <span className="eyebrow">Currently deepening</span>
              <p>{profile.currentlyLearning}</p>
            </motion.div>

            <motion.div className="stats" variants={fadeUp}>
              {stats.map((stat, index) => (
                <div className="stats__item" key={stat.label}>
                  <span className="stats__index">{String(index + 1).padStart(2, '0')}</span>
                  <strong className="stats__value">
                    <CountUp value={stat.value} suffix={stat.suffix} />
                  </strong>
                  <span className="stats__label">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
