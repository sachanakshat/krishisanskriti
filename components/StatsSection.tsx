"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function StatsSection() {
  const { t } = useLanguage();

  const stats = [
    { value: t.stats.farmers, label: t.stats.farmersLabel, icon: "👨‍🌾" },
    { value: t.stats.villages, label: t.stats.villagesLabel, icon: "🏡" },
    { value: t.stats.states, label: t.stats.statesLabel, icon: "🗺️" },
    { value: t.stats.years, label: t.stats.yearsLabel, icon: "🌱" },
  ];

  return (
    <section className="bg-green-50/80 dark:bg-black/60 border-y border-green-200/60 dark:border-green-900/20 py-14">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center group">
              <div className="text-2xl mb-2 group-hover:scale-125 transition-transform duration-300">
                {stat.icon}
              </div>
              <div className="text-3xl sm:text-4xl font-black text-gradient-green mb-1">
                {stat.value}
              </div>
              <div className="text-slate-500 dark:text-zinc-500 text-xs sm:text-sm font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
