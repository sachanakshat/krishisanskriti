"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Play, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface VideoPost {
  _id: string;
  videoId: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  duration?: string;
  createdAt: string;
}

export default function VideosPage() {
  const { lang } = useLanguage();
  const [videos, setVideos] = useState<VideoPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/videos")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setVideos(d); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-white dark:bg-[#050a05]">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-500 dark:text-zinc-500 hover:text-green-600 dark:hover:text-green-400 text-sm mb-8 transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            {lang === "hi" ? "होम पर वापस जाएं" : "Back to Home"}
          </Link>

          <div className="text-center mb-12">
            <div className="text-5xl mb-4">🎬</div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3">
              {lang === "hi" ? "प्रशिक्षण वीडियो" : "Training Videos"}
            </h1>
            <p className="text-slate-500 dark:text-zinc-500 text-sm sm:text-base max-w-xl mx-auto">
              {lang === "hi"
                ? "कृषि संस्कृति के नवीनतम प्रशिक्षण वीडियो, ट्यूटोरियल और अपडेट देखें।"
                : "Watch the latest training videos, tutorials and updates from Krishi Sanskriti."}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-24 gap-3 text-slate-400 dark:text-zinc-600">
              <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
              {lang === "hi" ? "वीडियो लोड हो रहे हैं..." : "Loading videos..."}
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-slate-400 dark:text-zinc-600 text-sm">
                {lang === "hi" ? "अभी कोई वीडियो उपलब्ध नहीं है।" : "No videos available yet."}
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 mt-6 text-green-600 dark:text-green-400 text-sm hover:underline"
              >
                <ArrowLeft size={13} />
                {lang === "hi" ? "होम पर वापस जाएं" : "Back to Home"}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((v) => (
                <Link
                  key={v._id}
                  href={`/blog/${v.videoId}`}
                  className="group block rounded-2xl overflow-hidden bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/60 hover:border-green-300 dark:hover:border-green-800/60 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-green-100/50 dark:hover:shadow-green-950/30"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                    <img
                      src={`https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`}
                      alt={v.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                        <Play size={18} className="text-green-600 ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                    {v.duration && (
                      <span className="absolute bottom-2 right-2 text-white text-xs bg-black/70 px-1.5 py-0.5 rounded font-mono">
                        {v.duration}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    {v.category && (
                      <span className="text-green-600 dark:text-green-500 text-[10px] font-bold uppercase tracking-wider">
                        {v.category}
                      </span>
                    )}
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm mt-1 mb-1.5 leading-tight line-clamp-2">
                      {v.title}
                    </h3>
                    <p className="text-slate-500 dark:text-zinc-500 text-xs leading-relaxed line-clamp-2">
                      {v.description}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-slate-400 dark:text-zinc-600 text-[10px]">
                        {new Date(v.createdAt).toLocaleDateString(
                          lang === "hi" ? "hi-IN" : "en-IN",
                          { day: "numeric", month: "short", year: "numeric" }
                        )}
                      </span>
                      <span className="text-green-600 dark:text-green-500 text-[10px] font-semibold flex items-center gap-1">
                        {lang === "hi" ? "देखें" : "Watch"} <ExternalLink size={9} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
