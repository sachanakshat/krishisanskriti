"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function TrainingSection() {
  const { t } = useLanguage();

  return (
    <section id="training" className="py-24 bg-green-50/60 dark:bg-zinc-950 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-125 h-125 bg-green-300/10 dark:bg-green-900/8 rounded-full blur-[100px]" />
        <div className="absolute top-0 left-0 w-100 h-100 bg-amber-300/8 dark:bg-amber-900/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: Content */}
          <div>
            <span className="inline-block px-4 py-1.5 mb-5 rounded-full bg-amber-100/80 dark:bg-amber-950/40 border border-amber-300/50 dark:border-amber-800/40 text-amber-700 dark:text-amber-400 text-xs sm:text-sm font-semibold">
              {t.training.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-green-900 dark:text-white mb-5 leading-tight whitespace-pre-line">
              {t.training.title}
            </h2>
            <p className="text-green-700/70 dark:text-zinc-400 text-sm sm:text-base leading-relaxed mb-9">
              {t.training.description}
            </p>

            <div className="space-y-3">
              {t.training.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3 group">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-green-100 dark:bg-green-950/70 border border-green-400/50 dark:border-green-700/50 flex items-center justify-center shrink-0 group-hover:bg-green-200 dark:group-hover:bg-green-900/70 transition-colors">
                    <Check size={11} className="text-green-600 dark:text-green-400" />
                  </span>
                  <span className="text-green-800/80 dark:text-zinc-300 text-sm sm:text-base leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Pricing card */}
          <div className="md:sticky md:top-24">
            <div className="rounded-3xl bg-linear-to-br from-green-100/80 via-white/90 to-white/80 dark:from-green-950/60 dark:via-zinc-900/80 dark:to-zinc-900/60 border border-green-300/50 dark:border-green-800/30 p-8 shadow-xl shadow-green-200/40 dark:shadow-none dark:glow-green">
              <div className="text-center mb-8">
                <p className="text-green-600/60 dark:text-zinc-500 text-xs mb-2 uppercase tracking-widest">{t.training.feePeriod}</p>
                <div className="text-3xl sm:text-4xl font-black text-green-900 dark:text-white mb-1">{t.training.fee}</div>
                <p className="text-green-600/60 dark:text-zinc-500 text-xs mt-2">{t.training.feeNote}</p>
              </div>
              <div className="border-t border-green-200/60 dark:border-green-900/30 mb-6" />
              <div className="flex items-start gap-3 mb-6 p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/20">
                <span className="text-lg">🔒</span>
                <div>
                  <p className="text-amber-700 dark:text-amber-400 text-xs font-semibold mb-1">{t.payment.title}</p>
                  <p className="text-amber-600/70 dark:text-zinc-500 text-xs leading-relaxed">{t.payment.description}</p>
                </div>
              </div>
              <Link href="/register"
                className="block w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold text-center rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-green-400/30 dark:hover:shadow-green-900/40 hover:scale-[1.02] active:scale-[0.98] text-base">
                {t.training.cta} →
              </Link>
              <p className="text-center text-amber-600 dark:text-amber-400 text-xs mt-4 font-medium">{t.training.seats}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
