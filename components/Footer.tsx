"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer
      id="contact"
      className="bg-black/80 border-t border-green-900/20 py-14"
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-2xl">🌿</span>
              <div className="flex flex-col leading-none">
                <span className="text-green-400 font-bold text-base">
                  Sanatan Krishi
                </span>
                <span className="text-green-700 text-xs">सनातन कृषि</span>
              </div>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
              {t.footer.tagline}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm tracking-wide uppercase">
              {t.footer.links}
            </h4>
            <div className="flex flex-col gap-2.5">
              {[
                { href: "/", label: t.nav.home },
                { href: "#about", label: t.nav.about },
                { href: "#training", label: t.nav.training },
                { href: "/register", label: t.nav.register },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-zinc-500 hover:text-green-400 text-sm transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm tracking-wide uppercase">
              {t.footer.contact}
            </h4>
            <div className="flex flex-col gap-3 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <span>📺</span>
                <span>YouTube: Sanatan Krishi</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📱</span>
                <span>WhatsApp / Call</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📧</span>
                <span>contact@sanatankrishi.in</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-zinc-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-zinc-600 text-xs">{t.footer.copyright}</p>
          <div className="flex items-center gap-4 text-zinc-700 text-xs">
            <span>Made with 💚 for India&apos;s Farmers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
