"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer
      id="contact"
      className="bg-green-950/20 dark:bg-black/80 border-t border-green-200/40 dark:border-green-900/20 py-14"
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-2xl">🌿</span>
              <div className="flex flex-col leading-none">
                <span className="text-green-700 dark:text-green-400 font-bold text-base">
                  Krishi Sanskriti
                </span>
                <span className="text-green-700 text-xs">कृषि संस्कृति</span>
              </div>
            </div>
            <p className="text-slate-500 dark:text-zinc-500 text-sm leading-relaxed max-w-xs">
              {t.footer.tagline}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-green-900 dark:text-white font-bold mb-4 text-sm tracking-wide uppercase">
              {t.footer.links}
            </h4>
            <div className="flex flex-col gap-2.5">
              {[
                { href: "/", label: t.nav.home },
                { href: "#about", label: t.nav.about },
                { href: "#training", label: t.nav.training },
                { href: "#videos", label: t.nav.videos },
                { href: "/register", label: t.nav.register },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-slate-500 dark:text-zinc-500 hover:text-green-600 dark:hover:text-green-400 text-sm transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-green-900 dark:text-white font-bold mb-4 text-sm tracking-wide uppercase">
              {t.footer.contact}
            </h4>
            <div className="flex flex-col gap-3 text-sm">
              <a href="https://www.youtube.com/@Krishisanskritiofficial" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-500 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                <span>📺</span><span>YouTube: Krishi Sanskriti</span>
              </a>
              <a href="https://wa.me/918707673442" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-500 dark:text-zinc-500 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                <span>💬</span><span>WhatsApp: +91 8707673442</span>
              </a>
              <a href="tel:+918707673442"
                className="flex items-center gap-2 text-slate-500 dark:text-zinc-500 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                <span>📞</span><span>+91 8707673442</span>
              </a>
              <a href="mailto:sachanjhansi@gmail.com"
                className="flex items-center gap-2 text-slate-500 dark:text-zinc-500 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                <span>📧</span><span>sachanjhansi@gmail.com</span>
              </a>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="mb-10">
          <h4 className="text-slate-800 dark:text-white font-bold mb-4 text-sm tracking-wide uppercase">
            📍 {t.footer.contact === "Contact" ? "Our Location" : "हमारा स्थान"}
          </h4>
          <div className="rounded-2xl overflow-hidden border border-zinc-800/60 w-full aspect-video sm:aspect-[16/6]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d2957.9623398853364!2d78.48869068194244!3d25.4044026620663!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3977700f45f12a13%3A0x9f155c996265d006!2sJaivik%20Kheti%20Prashikshan%20Kendra!5e0!3m2!1sen!2sin!4v1772393349713!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Jaivik Kheti Prashikshan Kendra"
            />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-green-200/40 dark:border-zinc-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-400 dark:text-zinc-600 text-xs">{t.footer.copyright}</p>
          <div className="flex items-center gap-4 text-slate-400 dark:text-zinc-700 text-xs">
            <span>Made with 💚 for India&apos;s Farmers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
