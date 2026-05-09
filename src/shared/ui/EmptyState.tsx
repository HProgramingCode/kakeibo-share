"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

type Props = {
  icon: ReactNode;
  title: string;
  description?: string;
};

export function EmptyState({ icon, title, description }: Props) {
  const reduceMotion = useReducedMotion();

  const variants: Variants = reduceMotion
    ? { hidden: {}, show: {} }
    : {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
      };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 px-8 py-12 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-card">
        {icon}
      </div>
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{title}</p>
      {description ? (
        <p className="max-w-xs text-xs leading-relaxed text-slate-400">{description}</p>
      ) : null}
    </motion.div>
  );
}
