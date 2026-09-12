import { motion } from 'motion/react';
import { skillGroups, skills } from '@/data/site';
import type { SkillGroup } from '@/types';
import { EASE, fadeUp, staggerContainer, viewportOnce } from '@/lib/motion';
import SectionHead from '@/components/ui/SectionHead';
import { cursorProps } from '@/lib/cursor';

const GROUP_COPY: Record<SkillGroup, string> = {
  Frontend: 'Interfaces, motion and design systems',
  Backend: 'APIs, services and application logic',
  Data: 'Databases, models and persistence',
  Tools: 'Workflow, version control and deployment',
};

export default function Skills() {
  return (
    <section id="skills" className="section skills">
      <div className="skills__glow" aria-hidden="true" />
      <div className="container">
        <SectionHead
          eyebrow="Capabilities"
          title={<>My tech stack</>}
          lede="The languages, frameworks, databases and tools I use to design, build and ship software."
        />

        <div className="skills__groups">
          {skillGroups.map((group, groupIndex) => {
            const items = skills.filter((skill) => skill.group === group);

            return (
              <motion.article
                className="skill-group"
                key={group}
                variants={staggerContainer(groupIndex * 0.05, 0.04)}
                initial="hidden"
                whileInView="show"
                viewport={viewportOnce}
              >
                <motion.header className="skill-group__head" variants={fadeUp}>
                  <span className="skill-group__index">{String(groupIndex + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{group}</h3>
                    <p>{GROUP_COPY[group]}</p>
                  </div>
                  <span className="skill-group__count">{items.length}</span>
                </motion.header>

                <motion.ul className="skill-group__list" variants={fadeUp}>
                  {items.map((skill) => (
                    <li key={skill.name}>
                      <motion.span
                        className="skill-chip"
                        whileHover={{ y: -3 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                        {...cursorProps('link')}
                      >
                        <i aria-hidden="true" />
                        {skill.name}
                      </motion.span>
                    </li>
                  ))}
                </motion.ul>
              </motion.article>
            );
          })}
        </div>

        <motion.p
          className="skills__note"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          Always learning — currently going deeper on system design, cloud infrastructure and
          machine-learning deployment.
        </motion.p>
      </div>
    </section>
  );
}
