"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#f7fdf7] dark:bg-[#050a05]">
      {/* Background radial glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-175 bg-green-400/10 dark:bg-green-600/8 rounded-full blur-[130px]" />
        <div className="absolute bottom-0 left-1/4 w-100 h-100 bg-green-300/15 dark:bg-green-800/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/4 right-1/4 w-[87.5] h-[87.5] bg-amber-400/8 dark:bg-amber-600/5 rounded-full blur-[90px]" />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,197,94,1) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating decorations */}
      <span className="absolute top-28 left-6 sm:left-20 text-4xl sm:text-5xl opacity-20 float-animation select-none">
        🌾
      </span>
      <span className="absolute top-36 right-6 sm:right-20 text-3xl sm:text-4xl opacity-20 float-animation-slow select-none" style={{ animationDelay: "2s" }}>
        🪔
      </span>
      <span className="absolute bottom-32 left-8 sm:left-28 text-3xl sm:text-4xl opacity-15 float-animation select-none" style={{ animationDelay: "1s" }}>
        🌿
      </span>
      <span className="absolute bottom-28 right-8 sm:right-24 text-4xl sm:text-5xl opacity-15 float-animation-slow select-none" style={{ animationDelay: "3s" }}>
        🧘
      </span>
      <span className="absolute top-1/2 left-3 sm:left-8 text-2xl opacity-10 float-animation select-none">🌱</span>
      <span className="absolute top-1/2 right-3 sm:right-8 text-2xl opacity-10 float-animation-slow select-none" style={{ animationDelay: "1.5s" }}>☀️</span>

      {/* Main content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-20 pb-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-green-100 dark:bg-green-950/60 border border-green-300/60 dark:border-green-800/50 text-green-700 dark:text-green-400 text-xs sm:text-sm font-medium backdrop-blur-sm">
          {t.hero.badge}
        </div>

        {/* Main title */}
        <h1 className="text-gradient-green text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black leading-none mb-5 tracking-tight">
          {t.hero.title}
        </h1>

        {/* Subtitle */}
        <p className="text-amber-600 dark:text-amber-400/90 text-base sm:text-lg md:text-xl font-semibold mb-7 tracking-wide">
          {t.hero.subtitle}
        </p>

        {/* Description */}
        <p className="text-green-800/70 dark:text-zinc-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
          {t.hero.description}
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-full text-base sm:text-lg transition-all duration-300 shadow-xl shadow-green-400/30 dark:shadow-green-950/60 hover:scale-105 active:scale-95"
          >
            {t.hero.cta} →
          </Link>
          <a
            href="#about"
            className="w-full sm:w-auto px-8 py-4 border border-green-400/50 dark:border-zinc-700 hover:border-green-500 dark:hover:border-green-700/70 text-green-700 dark:text-zinc-300 hover:text-green-600 dark:hover:text-green-400 font-semibold rounded-full text-base sm:text-lg transition-all duration-300 hover:bg-green-50 dark:hover:bg-green-950/20"
          >
            {t.hero.ctaSecondary}
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-green-400/40 dark:text-zinc-700">
        <div className="w-px h-10 bg-linear-to-b from-green-500/30 dark:from-zinc-600 to-transparent" />
        <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
