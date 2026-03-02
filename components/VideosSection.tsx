"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Youtube, BookOpen, Play } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface VideoPost {
  videoId: string;
  title: string;
  titleHi?: string;
  description: string;
  descriptionHi?: string;
  publishedAt: string;
}

function VideoCard({ video, lang }: { video: VideoPost; lang: "en" | "hi" }) {
  const [hovered, setHovered] = useState(false);

  const title = lang === "hi" && video.titleHi ? video.titleHi : video.title;
  const description =
    lang === "hi" && video.descriptionHi ? video.descriptionHi : video.description;
  const thumb = `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`;

  return (
    <div
      className="group rounded-2xl overflow-hidden border border-green-200/60 dark:border-zinc-800/60 bg-white/70 dark:bg-zinc-900/50 hover:border-green-400/60 dark:hover:border-green-800/60 transition-all duration-300 card-hover shadow-sm dark:shadow-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Thumbnail / Embed */}
      <div className="relative aspect-video overflow-hidden bg-zinc-950">
        {hovered ? (
          <iframe
            src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&mute=1&rel=0&modestbranding=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumb}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
              <div className="w-14 h-14 rounded-full bg-red-600/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Play size={22} className="text-white ml-1" fill="white" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Card body */}
      <div className="p-5">
        <h3 className="text-green-900 dark:text-white font-bold text-base leading-snug mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-2">
          {title}
        </h3>
        <p className="text-green-700/60 dark:text-zinc-500 text-xs leading-relaxed mb-4 line-clamp-2">
          {description}
        </p>

        <div className="flex items-center gap-2">
          <Link
            href={`/blog/${video.videoId}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-900/30 hover:bg-green-800/40 border border-green-800/30 hover:border-green-700/50 text-green-400 text-xs font-semibold transition-all"
          >
            <BookOpen size={12} />
            {lang === "hi" ? "ब्लॉग पढ़ें" : "Read Blog"}
          </Link>
          <a
            href={`https://www.youtube.com/watch?v=${video.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-900/20 hover:bg-red-800/30 border border-red-900/30 hover:border-red-700/40 text-red-400 text-xs font-semibold transition-all"
          >
            <Youtube size={12} />
            {lang === "hi" ? "यूट्यूब" : "YouTube"}
          </a>
        </div>
      </div>
    </div>
  );
}

export default function VideosSection() {
  const { lang } = useLanguage();
  const [videos, setVideos] = useState<VideoPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/videos")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setVideos(data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section id="videos" className="py-24 bg-[#050a05]">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-zinc-600 text-sm">
            <div className="w-4 h-4 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
            {lang === "hi" ? "वीडियो लोड हो रहे हैं..." : "Loading videos..."}
          </div>
        </div>
      </section>
    );
  }

  if (videos.length === 0) {
    return (
      <section id="videos" className="py-24 bg-[#050a05]">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-900/60 border border-zinc-800/60 mb-4">
            <Youtube size={22} className="text-zinc-600" />
          </div>
          <h2 className="text-2xl font-black text-zinc-600 mb-2">
            {lang === "hi" ? "वीडियो जल्द आएंगे" : "Videos Coming Soon"}
          </h2>
          <p className="text-zinc-700 text-sm">
            {lang === "hi"
              ? "एडमिन पैनल से वीडियो जोड़ें →"
              : "Add videos from the admin panel →"}
            {" "}
            <a href="/admin/videos" className="text-green-700 hover:text-green-500 underline transition-colors">
              /admin/videos
            </a>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="videos" className="py-24 bg-green-50/60 dark:bg-[#050a05] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-900/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-12">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-5 rounded-full bg-red-950/40 border border-red-900/40 text-red-400 text-xs sm:text-sm font-semibold">
              <Youtube size={13} />
              {lang === "hi" ? "हमारे वीडियो" : "Our Videos"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-green-900 dark:text-white leading-tight">
              {lang === "hi" ? "ताज़े वीडियो और ब्लॉग" : "Latest Videos & Blog Posts"}
            </h2>
          </div>
          <a
            href="https://www.youtube.com/@Krishisanskritiofficial"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-full transition-all hover:scale-105"
          >
            <Youtube size={15} />
            {lang === "hi" ? "चैनल देखें" : "View Channel"}
          </a>
        </div>

        {/* Video grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {videos.map((v) => (
            <VideoCard key={v.videoId} video={v} lang={lang} />
          ))}
        </div>
      </div>
    </section>
  );
}
