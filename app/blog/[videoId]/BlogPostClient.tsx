"use client";

import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Youtube } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface VideoPost {
  videoId: string;
  title: string;
  titleHi?: string;
  description: string;
  descriptionHi?: string;
  blogContent: string;
  blogContentHi?: string;
  publishedAt: string;
}

export default function BlogPostClient({ video }: { video: VideoPost }) {
  const [lang, setLang] = useState<"en" | "hi">("hi");

  const title = lang === "hi" && video.titleHi ? video.titleHi : video.title;
  const content =
    lang === "hi" && video.blogContentHi ? video.blogContentHi : video.blogContent;
  const description =
    lang === "hi" && video.descriptionHi ? video.descriptionHi : video.description;

  const publishDate = new Date(video.publishedAt).toLocaleDateString("hi-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#050a05]">
      <Navbar />

      <article className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Back link */}
          <Link
            href="/#videos"
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-green-400 text-sm mb-8 transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            सभी वीडियो / All Videos
          </Link>

          {/* Lang toggle */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setLang((p) => (p === "en" ? "hi" : "en"))}
              className="px-3 py-1.5 rounded-full border border-green-800/60 bg-green-950/30 text-xs font-semibold hover:bg-green-900/40 transition-all"
            >
              {lang === "en" ? "हिंदी में पढ़ें" : "Read in English"}
            </button>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3">
            {title}
          </h1>
          <p className="text-zinc-500 text-sm mb-8">{publishDate}</p>

          {/* YouTube Embed */}
          <div className="relative w-full mb-10 rounded-2xl overflow-hidden border border-zinc-800/60 shadow-2xl shadow-black/60">
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${video.videoId}?rel=0&modestbranding=1`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <a
              href={`https://www.youtube.com/watch?v=${video.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-full transition-colors shadow-lg"
            >
              <Youtube size={12} />
              YouTube पर देखें
            </a>
          </div>

          {/* Short description */}
          <p className="text-zinc-400 text-base leading-relaxed mb-8 p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/40 italic">
            {description}
          </p>

          {/* Blog content */}
          <div className="prose prose-invert prose-green max-w-none">
            <div className="text-zinc-300 leading-relaxed space-y-5 [&_h2]:text-green-400 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-green-300 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-2 [&_li]:text-zinc-400 [&_strong]:text-white [&_strong]:font-semibold [&_blockquote]:border-l-4 [&_blockquote]:border-green-700 [&_blockquote]:pl-4 [&_blockquote]:text-zinc-400 [&_blockquote]:italic [&_hr]:border-zinc-800 [&_p]:text-zinc-300 [&_p]:leading-relaxed">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>

          {/* Subscribe CTA */}
          <div className="mt-14 p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/40 text-center">
            <p className="text-zinc-400 text-sm mb-4">
              और अधिक वीडियो के लिए हमारा YouTube चैनल सब्सक्राइब करें
            </p>
            <a
              href="https://www.youtube.com/@Krishisanskritiofficial"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-full transition-all text-sm"
            >
              <Youtube size={16} />
              Subscribe on YouTube
            </a>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
