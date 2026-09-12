import { motion } from 'motion/react';
import { education, experience } from '@/data/site';
import { EASE, fadeUp, staggerContainer, viewportOnce } from '@/lib/motion';
import SectionHead from '@/components/ui/SectionHead';

export default function Experience() {
  return (
    <section id="experience" className="section experience">
      <div className="container">
        <div className="experience__layout">
          <div className="experience__aside">
            <SectionHead
              eyebrow="My journey"
              title={<>Experience &amp; education</>}
              lede="Where I've applied my skills, and the foundation I'm building on."
            />
            <motion.div
              className="experience__learning"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportOnce}
              transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
            >
              <span className="eyebrow">Currently deepening</span>
              <p>
                Machine learning model deployment, system design and cloud infrastructure pushing
                my projects from &ldquo;it works&rdquo; to &ldquo;it scales&rdquo;.
              </p>
            </motion.div>
          </div>

          <div className="experience__tracks">
            <Track title="Experience" items={experience} />
            <Track title="Education" items={education} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Track({ title, items }: { title: string; items: typeof experience }) {
  return (
    <div className="track">
      <h3 className="track__title">
        <span>{title}</span>
        <i aria-hidden="true" />
      </h3>

      <ol className="track__list">
        {items.map((item, index) => (
          <motion.li
            className="track__item"
            key={item.title}
            variants={staggerContainer(0, 0.08)}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
          >
            <motion.span className="track__index" variants={fadeUp}>
              {String(index + 1).padStart(2, '0')}
            </motion.span>

            <div className="track__content">
              <motion.div className="track__head" variants={fadeUp}>
                <h4>{item.title}</h4>
                <span className="track__period">{item.period}</span>
              </motion.div>
              <motion.p className="track__org" variants={fadeUp}>
                {item.organisation}
              </motion.p>

              <motion.ul className="track__points" variants={fadeUp}>
                {item.points.map((point) => (
                  <li key={point}>
                    <i aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </motion.ul>

              <motion.div className="track__tags" variants={fadeUp}>
                {item.tags.map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </motion.div>
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
