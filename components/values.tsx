'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { SiteSettings } from '@/types/content';

export function Values({ settings }: { settings: SiteSettings }) {
  const reduced = useReducedMotion();
  const text = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {[
        ['Our Vision', settings.vision_text],
        ['Our Mission', settings.mission_text],
        ['Our Values', settings.values_text],
      ].map(([title, copy], index) => (
        <motion.div
          key={title}
          className="surface p-7"
          initial={reduced ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: { opacity: 0, y: 28 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{
            duration: reduced ? 0 : 0.55,
            delay: reduced ? 0 : index * 0.12,
            delayChildren: reduced ? 0 : index * 0.12 + 0.15,
            staggerChildren: reduced ? 0 : 0.12,
          }}
        >
          <motion.span variants={text} transition={{ duration: reduced ? 0 : 0.45 }} className="inline-block text-xs font-bold text-gold">0{index + 1} /</motion.span>
          <motion.h3 variants={text} transition={{ duration: reduced ? 0 : 0.45 }} className="mt-5 mb-4 text-xl">{title}</motion.h3>
          <motion.p variants={text} transition={{ duration: reduced ? 0 : 0.45 }} className="text-sm text-slate-500">{copy}</motion.p>
        </motion.div>
      ))}
    </div>
  );
}
