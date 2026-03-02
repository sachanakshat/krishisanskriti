"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CtaSection() {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-[#f7fdf7] dark:bg-[#050a05] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-linear-to-b from-green-50/50 via-green-50/20 to-[#f7fdf7] dark:from-zinc-950/50 dark:via-green-950/10 dark:to-[#050a05]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-100 bg-green-300/15 dark:bg-green-800/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
        <div className="text-6xl sm:text-7xl mb-6 float-animation inline-block">🌱</div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-green-900 dark:text-white mb-5 leading-tight">
          {t.training.title.replace("\n", " ")}
        </h2>
        <p className="text-green-700/70 dark:text-zinc-400 text-sm sm:text-base mb-10 max-w-xl mx-auto leading-relaxed">
          {t.training.description}
        </p>
        <Link
          href="/register"
          className="inline-block px-10 sm:px-12 py-4 sm:py-5 bg-green-600 hover:bg-green-500 text-white font-black text-base sm:text-lg rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl shadow-green-400/30 dark:shadow-green-950/50"
        >
          {t.training.cta} →
        </Link>
        <p className="text-green-500/50 dark:text-zinc-600 text-xs mt-6">{t.training.seats}</p>
      </div>
    </section>
  );
}
