import { motion } from 'motion/react';
import About from '@/components/sections/About';
import Contact from '@/components/sections/Contact';
import Experience from '@/components/sections/Experience';
import Hero from '@/components/sections/Hero';
import Projects from '@/components/sections/Projects';
import Skills from '@/components/sections/Skills';
import BackToTop from '@/components/ui/BackToTop';
import { EASE } from '@/lib/motion';

export default function Home() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, ease: EASE, delay: 1.4 }}>
      <Hero />
      <About />
      <Projects />
      <Skills />
      <Experience />
      <Contact />
      <BackToTop />
    </motion.div>
  );
}
