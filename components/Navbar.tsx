"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function Navbar() {
  const { t, lang, toggleLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "#about", label: t.nav.about },
    { href: "#training", label: t.nav.training },
    { href: "#videos", label: t.nav.videos },
    { href: "#contact", label: t.nav.contact },
  ];

  const isDark = theme === "dark";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? isDark
            ? "bg-black/90 backdrop-blur-xl border-b border-green-900/30 shadow-lg shadow-black/50"
            : "bg-white/90 backdrop-blur-xl border-b border-green-200/60 shadow-lg shadow-green-100/40"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
              🌿
            </span>
            <div className="flex flex-col leading-none">
              <span className="text-green-600 dark:text-green-400 font-bold text-base leading-tight tracking-wide">
                Krishi Sanskriti
              </span>
              <span className="text-green-500/70 dark:text-green-600/70 text-[10px] leading-tight">
                कृषि संस्कृति
              </span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-slate-700 dark:text-zinc-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200 text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full border border-green-200 dark:border-green-800/60 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition-all duration-200"
              aria-label="Toggle theme"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-green-300/60 dark:border-green-800/60 bg-green-50/80 dark:bg-green-950/30 text-xs font-semibold hover:bg-green-100 dark:hover:bg-green-900/40 hover:border-green-400/60 dark:hover:border-green-600/60 transition-all duration-200"
              aria-label="Toggle Language"
            >
              <span className={lang === "en" ? "text-green-600 dark:text-green-400" : "text-green-400/60 dark:text-zinc-500"}>EN</span>
              <span className="text-green-400/40 dark:text-green-800">|</span>
              <span className={lang === "hi" ? "text-green-600 dark:text-green-400" : "text-green-400/60 dark:text-zinc-500"}>हि</span>
            </button>

            {/* CTA — desktop */}
            <Link
              href="/register"
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded-full transition-all duration-200 shadow-lg shadow-green-900/20 dark:shadow-green-900/40"
            >
              {t.nav.register}
            </Link>

            {/* Hamburger — mobile */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-1.5 text-slate-700 dark:text-zinc-400 hover:text-green-600 dark:hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isOpen && (
          <div className="md:hidden bg-white/97 dark:bg-black/95 backdrop-blur-xl border-t border-green-200/40 dark:border-green-900/20 py-5 px-2">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-slate-700 dark:text-zinc-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 px-4 py-3 rounded-xl transition-all text-base"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-3 px-2">
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="block w-full py-3.5 bg-green-600 hover:bg-green-500 text-white font-bold text-center rounded-xl transition-all"
                >
                  {t.nav.register}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
