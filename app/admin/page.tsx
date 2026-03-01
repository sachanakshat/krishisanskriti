"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Lock, Users, Youtube, LayoutDashboard, Search, ChevronDown, ChevronUp,
  Plus, Trash2, ExternalLink, Sparkles, Phone, MapPin, Landmark,
  CheckCircle, Clock, XCircle, RefreshCw, LogOut,
} from "lucide-react";

// ─── Auth Gate ────────────────────────────────────────────────────────────────
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
      if (res.ok) { sessionStorage.setItem("admin_authed", "1"); onAuth(); }
      else setErr("❌ गलत पासवर्ड / Wrong password");
    } catch { setErr("❌ Connection error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#050a05] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-900/40 border border-green-800/50 mb-4 text-2xl">🌿</div>
          <h1 className="text-2xl font-black text-white">Krishi Sanskriti</h1>
          <p className="text-zinc-500 text-sm mt-1">Admin Panel</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="relative">
            <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input
              type="password" value={pw} onChange={(e) => setPw(e.target.value)}
              placeholder="Enter admin password" required autoFocus
              className="w-full bg-zinc-900/70 border border-zinc-700/60 text-white rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-green-600/70 placeholder:text-zinc-600 transition-colors"
            />
          </div>
          {err && <p className="text-red-400 text-sm">{err}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 text-white font-bold rounded-xl transition-all">
            {loading ? "Checking..." : "Login →"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Registration {
  _id: string;
  name: string;
  village: string;
  district: string;
  state: string;
  phone: string;
  land: number;
  paymentStatus: "pending" | "paid" | "failed";
  createdAt: string;
}

interface VideoPost {
  videoId: string; title: string; titleHi?: string;
  description: string; descriptionHi?: string;
  blogContent: string; blogContentHi?: string;
  publishedAt: string;
}

const emptyVideo: VideoPost = {
  videoId: "", title: "", titleHi: "", description: "",
  descriptionHi: "", blogContent: "", blogContentHi: "",
  publishedAt: new Date().toISOString().split("T")[0],
};

// ─── Payment badge ─────────────────────────────────────────────────────────────
function PayBadge({ status }: { status: string }) {
  if (status === "paid") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-950/60 border border-green-800/40 text-green-400 text-xs font-semibold">
      <CheckCircle size={10} /> Paid
    </span>
  );
  if (status === "failed") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-950/60 border border-red-900/40 text-red-400 text-xs font-semibold">
      <XCircle size={10} /> Failed
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-950/60 border border-yellow-800/40 text-yellow-400 text-xs font-semibold">
      <Clock size={10} /> Pending
    </span>
  );
}

// ─── Dashboard Tab ─────────────────────────────────────────────────────────────
function DashboardTab({ regs, videos }: { regs: Registration[]; videos: VideoPost[] }) {
  const paid = regs.filter((r) => r.paymentStatus === "paid").length;
  const pending = regs.filter((r) => r.paymentStatus === "pending").length;
  const states = [...new Set(regs.map((r) => r.state))].length;
  const totalLand = regs.reduce((s, r) => s + (r.land || 0), 0);

  const stats = [
    { label: "Total Registrations", value: regs.length, icon: "👥", color: "text-blue-400" },
    { label: "Paid", value: paid, icon: "✅", color: "text-green-400" },
    { label: "Pending Payment", value: pending, icon: "⏳", color: "text-yellow-400" },
    { label: "States Covered", value: states, icon: "🗺️", color: "text-purple-400" },
    { label: "Total Land (acres)", value: totalLand.toFixed(1), icon: "🌾", color: "text-orange-400" },
    { label: "Video Posts", value: videos.length, icon: "🎬", color: "text-red-400" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-zinc-900/60 border border-zinc-800/50 p-5">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-zinc-500 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent registrations */}
      <div>
        <h3 className="text-sm font-bold text-zinc-400 mb-3">Recent Registrations</h3>
        <div className="space-y-2">
          {regs.slice(0, 5).map((r) => (
            <div key={r._id} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/40">
              <div className="w-8 h-8 rounded-full bg-green-900/40 border border-green-800/40 flex items-center justify-center text-xs font-bold text-green-400 shrink-0">
                {r.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{r.name}</p>
                <p className="text-zinc-600 text-xs truncate">{r.village}, {r.district}</p>
              </div>
              <PayBadge status={r.paymentStatus} />
            </div>
          ))}
          {regs.length === 0 && <p className="text-zinc-700 text-sm text-center py-6">No registrations yet.</p>}
        </div>
      </div>
    </div>
  );
}

// ─── Registrations Tab ─────────────────────────────────────────────────────────
function RegistrationsTab() {
  const [regs, setRegs] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterPayment, setFilterPayment] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterState) params.set("state", filterState);
    if (filterDistrict) params.set("district", filterDistrict);
    if (filterPayment) params.set("payment", filterPayment);
    const res = await fetch(`/api/admin/registrations?${params}`);
    const data = await res.json();
    if (Array.isArray(data)) setRegs(data);
    setLoading(false);
  }, [search, filterState, filterDistrict, filterPayment]);

  useEffect(() => { load(); }, [load]);

  const updatePayment = async (id: string, paymentStatus: string) => {
    await fetch("/api/admin/registrations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, paymentStatus }),
    });
    load();
  };

  const deleteReg = async (id: string, name: string) => {
    if (!confirm(`Delete registration for "${name}"?`)) return;
    await fetch(`/api/admin/registrations?id=${id}`, { method: "DELETE" });
    load();
  };

  // Unique values for filter dropdowns
  const allStates = [...new Set(regs.map((r) => r.state).filter(Boolean))].sort();
  const allDistricts = [...new Set(regs.map((r) => r.district).filter(Boolean))].sort();

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, village, phone…"
            className="input-field pl-8 text-xs"
          />
        </div>
        <select value={filterState} onChange={(e) => setFilterState(e.target.value)} className="input-field text-xs">
          <option value="">All States</option>
          {allStates.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)} className="input-field text-xs">
          <option value="">All Districts</option>
          {allDistricts.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)} className="input-field text-xs">
          <option value="">All Payment Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Count + refresh */}
      <div className="flex items-center justify-between">
        <p className="text-zinc-500 text-xs">{regs.length} result{regs.length !== 1 ? "s" : ""}</p>
        <button onClick={load} className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-green-400 transition-colors">
          <RefreshCw size={11} /> Refresh
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-zinc-600 text-sm">
          <div className="w-4 h-4 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
          Loading…
        </div>
      ) : regs.length === 0 ? (
        <p className="text-zinc-700 text-sm text-center py-16">No registrations found.</p>
      ) : (
        <div className="space-y-3">
          {regs.map((r) => (
            <div key={r._id} className="rounded-2xl bg-zinc-900/50 border border-zinc-800/50 overflow-hidden">
              {/* Row */}
              <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-zinc-800/20 transition-colors"
                onClick={() => setExpanded(expanded === r._id ? null : r._id)}
              >
                <div className="w-9 h-9 rounded-full bg-green-900/40 border border-green-800/40 flex items-center justify-center text-sm font-black text-green-400 shrink-0">
                  {r.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{r.name}</p>
                  <p className="text-zinc-600 text-xs truncate">{r.village}, {r.district}, {r.state}</p>
                </div>
                <PayBadge status={r.paymentStatus} />
                {expanded === r._id ? <ChevronUp size={14} className="text-zinc-600 shrink-0" /> : <ChevronDown size={14} className="text-zinc-600 shrink-0" />}
              </div>

              {/* Expanded detail */}
              {expanded === r._id && (
                <div className="border-t border-zinc-800/50 px-4 pb-4 pt-3 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="flex items-start gap-2">
                      <Phone size={12} className="text-zinc-600 mt-0.5 shrink-0" />
                      <div><p className="text-zinc-500">Phone</p><p className="text-white font-medium">{r.phone}</p></div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin size={12} className="text-zinc-600 mt-0.5 shrink-0" />
                      <div><p className="text-zinc-500">Village</p><p className="text-white font-medium">{r.village}</p></div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Landmark size={12} className="text-zinc-600 mt-0.5 shrink-0" />
                      <div><p className="text-zinc-500">District</p><p className="text-white font-medium">{r.district}</p></div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin size={12} className="text-zinc-600 mt-0.5 shrink-0" />
                      <div><p className="text-zinc-500">State</p><p className="text-white font-medium">{r.state}</p></div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-zinc-600 text-xs mt-0.5 shrink-0">🌾</span>
                      <div><p className="text-zinc-500">Land</p><p className="text-white font-medium">{r.land} acres</p></div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock size={12} className="text-zinc-600 mt-0.5 shrink-0" />
                      <div><p className="text-zinc-500">Registered</p><p className="text-white font-medium">{new Date(r.createdAt).toLocaleDateString("en-IN")}</p></div>
                    </div>
                  </div>

                  {/* Payment control + delete */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <span className="text-zinc-500 text-xs shrink-0">Payment:</span>
                    {(["pending", "paid", "failed"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => updatePayment(r._id, s)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          r.paymentStatus === s
                            ? s === "paid" ? "bg-green-800/60 border-green-700/60 text-green-300"
                              : s === "failed" ? "bg-red-900/60 border-red-800/60 text-red-300"
                              : "bg-yellow-900/60 border-yellow-800/60 text-yellow-300"
                            : "bg-zinc-800/50 border-zinc-700/40 text-zinc-500 hover:text-white"
                        }`}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                    <div className="flex-1" />
                    <button
                      onClick={() => deleteReg(r._id, r.name)}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-900/30 text-red-400 text-xs transition-colors"
                    >
                      <Trash2 size={11} /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Videos Tab ────────────────────────────────────────────────────────────────
function VideosTab() {
  const [videos, setVideos] = useState<VideoPost[]>([]);
  const [form, setForm] = useState<VideoPost>(emptyVideo);
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateMsg, setGenerateMsg] = useState<{ type: "ok" | "err" | "info"; text: string } | null>(null);

  const load = () =>
    fetch("/api/videos").then((r) => r.json()).then((d) => Array.isArray(d) && setVideos(d));

  useEffect(() => { load(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleVideoIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.trim();
    try {
      const url = new URL(val);
      val = url.searchParams.get("v") || (url.hostname === "youtu.be" ? url.pathname.slice(1) : val);
    } catch { /* val stays */ }
    setForm((p) => ({ ...p, videoId: val }));
  };

  const generateWithAI = async () => {
    if (!form.videoId) return;
    setGenerating(true);
    setGenerateMsg({ type: "info", text: "🤖 Sending video to Gemini…" });
    try {
      const res = await fetch("/api/admin/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId: form.videoId }),
      });
      setGenerateMsg({ type: "info", text: "✍️ Writing blog content…" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setForm((p) => ({
        ...p,
        title: data.title ?? p.title, titleHi: data.titleHi ?? p.titleHi,
        description: data.description ?? p.description, descriptionHi: data.descriptionHi ?? p.descriptionHi,
        blogContent: data.blogContent ?? p.blogContent, blogContentHi: data.blogContentHi ?? p.blogContentHi,
      }));
      setGenerateMsg({ type: "ok", text: "✅ All fields filled by AI — review and save!" });
    } catch (e: unknown) {
      setGenerateMsg({ type: "err", text: "❌ " + (e instanceof Error ? e.message : "Failed") });
    } finally { setGenerating(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMsg(null);
    try {
      const res = await fetch("/api/videos", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");
      setMsg({ type: "ok", text: "✅ Video post saved!" });
      setForm(emptyVideo); setExpanded(false); load();
    } catch { setMsg({ type: "err", text: "❌ Failed to save." }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm(`Delete "${videoId}"?`)) return;
    await fetch(`/api/videos/${videoId}`, { method: "DELETE" });
    load();
  };

  const prefill = (v: VideoPost) => { setForm({ ...v }); setExpanded(true); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <div className="space-y-6">
      {/* Add / Edit form */}
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/60 overflow-hidden">
        <button type="button" onClick={() => setExpanded((p) => !p)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-zinc-800/30 transition-colors">
          <span className="flex items-center gap-2 font-bold text-base">
            <Plus size={16} className="text-green-400" />
            {form.videoId ? `Editing: ${form.videoId}` : "Add New Video Post"}
          </span>
          {expanded ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
        </button>

        {expanded && (
          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5 border-t border-zinc-800/50 pt-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                YouTube Video ID or URL <span className="text-red-400">*</span>
              </label>
              <input name="videoId" value={form.videoId} onChange={handleVideoIdChange}
                placeholder="e.g. dQw4w9WgXcQ or full YouTube URL" required className="input-field" />
              {form.videoId && (
                <div className="mt-3 space-y-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://img.youtube.com/vi/${form.videoId}/mqdefault.jpg`} alt="thumb"
                      className="w-28 rounded-xl border border-zinc-700" />
                    <div className="flex flex-col gap-2">
                      <a href={`https://www.youtube.com/watch?v=${form.videoId}`} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-green-400 flex items-center gap-1 hover:underline">
                        <ExternalLink size={11} /> Preview on YouTube
                      </a>
                      <p className="text-zinc-600 text-xs">ID: {form.videoId}</p>
                    </div>
                  </div>
                  <button type="button" onClick={generateWithAI} disabled={generating}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-linear-to-r from-purple-900/50 to-green-900/40 hover:from-purple-800/60 hover:to-green-800/50 border border-purple-700/40 hover:border-purple-600/60 text-purple-300 hover:text-purple-200 font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                    {generating ? (
                      <><div className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                        {generateMsg?.text ?? "Generating…"}</>
                    ) : (
                      <><Sparkles size={14} /> Auto-fill all fields with Gemini AI</>
                    )}
                  </button>
                  {generateMsg && !generating && (
                    <div className={`text-xs rounded-lg px-3 py-2 ${
                      generateMsg.type === "ok" ? "bg-green-950/40 text-green-400 border border-green-800/30"
                      : generateMsg.type === "err" ? "bg-red-950/40 text-red-400 border border-red-900/30"
                      : "bg-zinc-900 text-zinc-400 border border-zinc-700/40"}`}>
                      {generateMsg.text}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Published Date</label>
              <input type="date" name="publishedAt" value={form.publishedAt} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Title (English) <span className="text-red-400">*</span></label>
              <input name="title" value={form.title} onChange={handleChange} required placeholder="Video title in English" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">शीर्षक (हिंदी)</label>
              <input name="titleHi" value={form.titleHi} onChange={handleChange} placeholder="हिंदी में शीर्षक" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Short Description (English) <span className="text-red-400">*</span></label>
              <input name="description" value={form.description} onChange={handleChange} required placeholder="1-2 sentence summary" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">संक्षिप्त विवरण (हिंदी)</label>
              <input name="descriptionHi" value={form.descriptionHi} onChange={handleChange} placeholder="हिंदी में संक्षिप्त विवरण" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Blog Post — Markdown (English) <span className="text-red-400">*</span></label>
              <textarea name="blogContent" value={form.blogContent} onChange={handleChange} required rows={10}
                placeholder={"## Introduction\n\nIn this video we discuss..."} className="input-field resize-y font-mono text-xs" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">ब्लॉग पोस्ट — Markdown (हिंदी)</label>
              <textarea name="blogContentHi" value={form.blogContentHi} onChange={handleChange} rows={8}
                placeholder={"## परिचय\n\nइस वीडियो में..."} className="input-field resize-y font-mono text-xs" />
            </div>

            {msg && (
              <div className={`text-sm rounded-xl px-4 py-3 ${msg.type === "ok"
                ? "bg-green-950/40 text-green-400 border border-green-800/30"
                : "bg-red-950/40 text-red-400 border border-red-900/30"}`}>
                {msg.text}
              </div>
            )}
            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="flex-1 py-3 bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 text-white font-bold rounded-xl transition-all">
                {saving ? "Saving…" : "Save Video Post"}
              </button>
              <button type="button" onClick={() => { setForm(emptyVideo); setExpanded(false); setMsg(null); }}
                className="px-5 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-xl transition-all">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Saved posts */}
      <h3 className="text-sm font-bold text-zinc-400">Saved Posts ({videos.length})</h3>
      {videos.length === 0 ? (
        <p className="text-zinc-700 text-sm text-center py-10">No video posts yet.</p>
      ) : (
        <div className="space-y-3">
          {videos.map((v) => (
            <div key={v.videoId}
              className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700/50 transition-colors">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`} alt={v.title}
                className="w-24 aspect-video rounded-lg object-cover shrink-0 border border-zinc-800" />
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{v.title}</p>
                {v.titleHi && <p className="text-zinc-500 text-xs truncate">{v.titleHi}</p>}
                <p className="text-zinc-600 text-xs mt-1">{v.videoId}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/blog/${v.videoId}`}
                  className="p-2 rounded-lg bg-green-900/30 hover:bg-green-800/40 text-green-400 transition-colors" title="View post">
                  <ExternalLink size={14} />
                </Link>
                <button onClick={() => prefill(v)}
                  className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors" title="Edit">
                  ✏️
                </button>
                <button onClick={() => handleDelete(v.videoId)}
                  className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/40 text-red-400 transition-colors" title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Admin Page ───────────────────────────────────────────────────────────
type Tab = "dashboard" | "registrations" | "videos";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [regs, setRegs] = useState<Registration[]>([]);
  const [videos, setVideos] = useState<VideoPost[]>([]);

  useEffect(() => {
    if (sessionStorage.getItem("admin_authed") === "1") setAuthed(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
    fetch("/api/admin/registrations").then((r) => r.json()).then((d) => Array.isArray(d) && setRegs(d));
    fetch("/api/videos").then((r) => r.json()).then((d) => Array.isArray(d) && setVideos(d));
  }, [authed]);

  if (!authed) return <LoginGate onAuth={() => setAuthed(true)} />;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={15} /> },
    { id: "registrations", label: `Registrations (${regs.length})`, icon: <Users size={15} /> },
    { id: "videos", label: `Videos (${videos.length})`, icon: <Youtube size={15} /> },
  ];

  return (
    <div className="min-h-screen bg-[#050a05] text-white">
      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b border-zinc-800/60 bg-[#050a05]/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg">🌿</span>
            <div>
              <p className="text-white font-black text-sm leading-none">Krishi Sanskriti</p>
              <p className="text-zinc-600 text-xs">Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-zinc-600 hover:text-green-400 transition-colors">
              ← Site
            </Link>
            <button
              onClick={() => { sessionStorage.removeItem("admin_authed"); setAuthed(false); }}
              className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-red-400 transition-colors"
            >
              <LogOut size={12} /> Logout
            </button>
          </div>
        </div>

        {/* Tab nav */}
        <div className="max-w-5xl mx-auto px-4 flex gap-1 pb-0">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                tab === t.id
                  ? "border-green-500 text-green-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {tab === "dashboard" && <DashboardTab regs={regs} videos={videos} />}
        {tab === "registrations" && <RegistrationsTab />}
        {tab === "videos" && <VideosTab />}
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
        .input-field:focus { border-color: rgb(22 163 74 / 0.7); }
        .input-field::placeholder { color: rgb(82 82 91); }
        select.input-field option { background: #18181b; color: white; }
      `}</style>
    </div>
  );
}
