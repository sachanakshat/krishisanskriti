"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, ExternalLink, ChevronDown, ChevronUp, Lock, Sparkles } from "lucide-react";

function LoginGate({ onAuth }: { onAuth: () => void }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (res.ok) {
        sessionStorage.setItem("admin_authed", "1");
        onAuth();
      } else {
        setErr("❌ गलत पासवर्ड / Wrong password");
      }
    } catch {
      setErr("❌ Connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050a05] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-900/40 border border-green-800/50 mb-4">
            <Lock size={22} className="text-green-400" />
          </div>
          <h1 className="text-2xl font-black text-white">Admin Login</h1>
          <p className="text-zinc-500 text-sm mt-1">Krishi Sanskriti · Video Panel</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Enter admin password"
            required
            autoFocus
            className="w-full bg-zinc-900/70 border border-zinc-700/60 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-green-600/70 placeholder:text-zinc-600 transition-colors"
          />
          {err && <p className="text-red-400 text-sm">{err}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 text-white font-bold rounded-xl transition-all"
          >
            {loading ? "Checking..." : "Login"}
          </button>
        </form>
        <p className="text-zinc-700 text-xs text-center mt-6">
          Set <code className="text-zinc-500">ADMIN_PASSWORD</code> in .env.local
        </p>
      </div>
    </div>
  );
}

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

const empty: VideoPost = {
  videoId: "",
  title: "",
  titleHi: "",
  description: "",
  descriptionHi: "",
  blogContent: "",
  blogContentHi: "",
  publishedAt: new Date().toISOString().split("T")[0],
};

export default function AdminVideos() {
  const [authed, setAuthed] = useState(false);
  const [videos, setVideos] = useState<VideoPost[]>([]);
  const [form, setForm] = useState<VideoPost>(empty);
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateMsg, setGenerateMsg] = useState<{ type: "ok" | "err" | "info"; text: string } | null>(null);

  const load = () =>
    fetch("/api/videos")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setVideos(d));

  const generateWithAI = async () => {
    if (!form.videoId) return;
    setGenerating(true);
    setGenerateMsg({ type: "info", text: "🤖 Sending video to Gemini..." });
    try {
      const res = await fetch("/api/admin/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId: form.videoId }),
      });
      setGenerateMsg({ type: "info", text: "✍️ Writing blog content..." });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setForm((p) => ({
        ...p,
        title: data.title ?? p.title,
        titleHi: data.titleHi ?? p.titleHi,
        description: data.description ?? p.description,
        descriptionHi: data.descriptionHi ?? p.descriptionHi,
        blogContent: data.blogContent ?? p.blogContent,
        blogContentHi: data.blogContentHi ?? p.blogContentHi,
      }));
      setGenerateMsg({ type: "ok", text: "✅ All fields filled by AI — review and save!" });
    } catch (e: unknown) {
      setGenerateMsg({
        type: "err",
        text: "❌ " + (e instanceof Error ? e.message : "Failed to generate"),
      });
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem("admin_authed") === "1") {
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (authed) load();
  }, [authed]);

  if (!authed) return <LoginGate onAuth={() => setAuthed(true)} />;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  // Auto-extract videoId from full YouTube URL if pasted
  const handleVideoIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.trim();
    try {
      const url = new URL(val);
      const id =
        url.searchParams.get("v") ||
        (url.hostname === "youtu.be" ? url.pathname.slice(1) : val);
      val = id;
    } catch {
      // val stays as-is
    }
    setForm((p) => ({ ...p, videoId: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");
      setMsg({ type: "ok", text: "✅ Video post saved successfully!" });
      setForm(empty);
      setExpanded(false);
      load();
    } catch {
      setMsg({ type: "err", text: "❌ Failed to save. Check the console." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm(`Delete "${videoId}"?`)) return;
    await fetch(`/api/videos/${videoId}`, { method: "DELETE" });
    load();
  };

  const prefill = (v: VideoPost) => {
    setForm({ ...v });
    setExpanded(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#050a05] text-white px-4 py-10">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-zinc-500 hover:text-green-400 text-sm mb-3 transition-colors group"
            >
              <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" />
              Back to site
            </Link>
            <h1 className="text-3xl font-black">🎬 Video Admin</h1>
            <p className="text-zinc-500 text-sm mt-1">
              Add YouTube videos with AI-generated blog posts
            </p>
          </div>
        </div>

        {/* Add / Edit form */}
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/60 mb-10 overflow-hidden">
          <button
            type="button"
            onClick={() => setExpanded((p) => !p)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-zinc-800/30 transition-colors"
          >
            <span className="flex items-center gap-2 font-bold text-base">
              <Plus size={16} className="text-green-400" />
              {form.videoId ? `Editing: ${form.videoId}` : "Add New Video Post"}
            </span>
            {expanded ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
          </button>

          {expanded && (
            <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5 border-t border-zinc-800/50 pt-5">
              {/* Video ID / URL */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  YouTube Video ID or URL <span className="text-red-400">*</span>
                </label>
                <input
                  name="videoId"
                  value={form.videoId}
                  onChange={handleVideoIdChange}
                  placeholder="e.g. dQw4w9WgXcQ  or full YouTube URL"
                  required
                  className="input-field"
                />
                {form.videoId && (
                  <div className="mt-3 space-y-3">
                    {/* Thumbnail + YouTube link */}
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://img.youtube.com/vi/${form.videoId}/mqdefault.jpg`}
                        alt="thumb"
                        className="w-28 rounded-xl border border-zinc-700"
                      />
                      <div className="flex flex-col gap-2">
                        <a
                          href={`https://www.youtube.com/watch?v=${form.videoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-green-400 flex items-center gap-1 hover:underline"
                        >
                          <ExternalLink size={11} /> Preview on YouTube
                        </a>
                        <p className="text-zinc-600 text-xs">ID: {form.videoId}</p>
                      </div>
                    </div>

                    {/* AI Generate button */}
                    <button
                      type="button"
                      onClick={generateWithAI}
                      disabled={generating}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-purple-900/50 to-green-900/40 hover:from-purple-800/60 hover:to-green-800/50 border border-purple-700/40 hover:border-purple-600/60 text-purple-300 hover:text-purple-200 font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {generating ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                          {generateMsg?.text ?? "Generating..."}
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          Auto-fill all fields with Gemini AI
                        </>
                      )}
                    </button>

                    {/* Status message from AI generation */}
                    {generateMsg && !generating && (
                      <div
                        className={`text-xs rounded-lg px-3 py-2 ${
                          generateMsg.type === "ok"
                            ? "bg-green-950/40 text-green-400 border border-green-800/30"
                            : generateMsg.type === "err"
                            ? "bg-red-950/40 text-red-400 border border-red-900/30"
                            : "bg-zinc-900 text-zinc-400 border border-zinc-700/40"
                        }`}
                      >
                        {generateMsg.text}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Published date */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Published Date</label>
                <input
                  type="date"
                  name="publishedAt"
                  value={form.publishedAt}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              {/* Title EN */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Title (English) <span className="text-red-400">*</span>
                </label>
                <input name="title" value={form.title} onChange={handleChange} required placeholder="Video title in English" className="input-field" />
              </div>

              {/* Title HI */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">शीर्षक (हिंदी)</label>
                <input name="titleHi" value={form.titleHi} onChange={handleChange} placeholder="हिंदी में शीर्षक" className="input-field" />
              </div>

              {/* Description EN */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Short Description (English) <span className="text-red-400">*</span>
                </label>
                <input name="description" value={form.description} onChange={handleChange} required placeholder="1-2 sentence summary" className="input-field" />
              </div>

              {/* Description HI */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">संक्षिप्त विवरण (हिंदी)</label>
                <input name="descriptionHi" value={form.descriptionHi} onChange={handleChange} placeholder="हिंदी में संक्षिप्त विवरण" className="input-field" />
              </div>

              {/* Blog Content EN */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Blog Post Content — Markdown (English) <span className="text-red-400">*</span>
                </label>
                <p className="text-zinc-600 text-xs mb-1">
                  Paste the AI summary from YouTube here. Supports Markdown (## headings, **bold**, - lists).
                </p>
                <textarea
                  name="blogContent"
                  value={form.blogContent}
                  onChange={handleChange}
                  required
                  rows={12}
                  placeholder="## Introduction&#10;&#10;In this video we discuss..."
                  className="input-field resize-y font-mono text-xs"
                />
              </div>

              {/* Blog Content HI */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  ब्लॉग पोस्ट — Markdown (हिंदी)
                </label>
                <textarea
                  name="blogContentHi"
                  value={form.blogContentHi}
                  onChange={handleChange}
                  rows={10}
                  placeholder="## परिचय&#10;&#10;इस वीडियो में..."
                  className="input-field resize-y font-mono text-xs"
                />
              </div>

              {msg && (
                <div className={`text-sm rounded-xl px-4 py-3 ${msg.type === "ok" ? "bg-green-950/40 text-green-400 border border-green-800/30" : "bg-red-950/40 text-red-400 border border-red-900/30"}`}>
                  {msg.text}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 text-white font-bold rounded-xl transition-all"
                >
                  {saving ? "Saving..." : "Save Video Post"}
                </button>
                <button
                  type="button"
                  onClick={() => { setForm(empty); setExpanded(false); setMsg(null); }}
                  className="px-5 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Existing posts */}
        <h2 className="text-lg font-bold mb-4 text-zinc-300">
          Saved Posts ({videos.length})
        </h2>

        {videos.length === 0 ? (
          <p className="text-zinc-600 text-sm text-center py-10">
            No video posts yet. Add your first one above.
          </p>
        ) : (
          <div className="space-y-4">
            {videos.map((v) => (
              <div
                key={v.videoId}
                className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700/50 transition-colors"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`}
                  alt={v.title}
                  className="w-24 aspect-video rounded-lg object-cover shrink-0 border border-zinc-800"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{v.title}</p>
                  {v.titleHi && <p className="text-zinc-500 text-xs truncate">{v.titleHi}</p>}
                  <p className="text-zinc-600 text-xs mt-1">{v.videoId}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/blog/${v.videoId}`}
                    className="p-2 rounded-lg bg-green-900/30 hover:bg-green-800/40 text-green-400 text-xs transition-colors"
                    title="View post"
                  >
                    <ExternalLink size={14} />
                  </Link>
                  <button
                    onClick={() => prefill(v)}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(v.videoId)}
                    className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/40 text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .input-field {
          width: 100%;
          background: rgb(39 39 42 / 0.7);
          border: 1px solid rgb(63 63 70 / 0.6);
          color: white;
          border-radius: 0.75rem;
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-field:focus {
          border-color: rgb(22 163 74 / 0.7);
        }
        .input-field::placeholder {
          color: rgb(82 82 91);
        }
      `}</style>
    </div>
  );
}
