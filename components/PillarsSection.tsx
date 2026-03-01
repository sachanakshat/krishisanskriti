"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function PillarsSection() {
  const { t } = useLanguage();

  return (
    <section id="about" className="py-24 bg-[#050a05] relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-75 bg-green-900/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 mb-5 rounded-full bg-green-950/50 border border-green-800/40 text-green-400 text-xs sm:text-sm font-semibold tracking-wide">
            {t.about.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
            {t.about.title}
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            {t.about.description}
          </p>
        </div>

        {/* Pillar title */}
        <div className="text-center mb-10">
          <h3 className="text-amber-400 text-base sm:text-lg font-semibold tracking-wide">
            ✦ {t.pillars.title} ✦
          </h3>
        </div>

        {/* 3 Pillar cards */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
          {t.pillars.items.map((pillar, i) => (
            <div
              key={i}
              className="card-hover group relative p-7 rounded-2xl bg-zinc-900/60 border border-zinc-800/60 hover:border-green-800/60 backdrop-blur-sm overflow-hidden"
            >
              {/* Card glow on hover */}
              <div className="absolute inset-0 bg-linear-to-br from-green-900/0 to-green-900/0 group-hover:from-green-900/10 group-hover:to-transparent transition-all duration-500 rounded-2xl" />

              <div className="relative z-10">
                <div className="text-5xl mb-5 group-hover:scale-110 transition-transform duration-300">
                  {pillar.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3 group-hover:text-green-400 transition-colors duration-300">
                  {pillar.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
