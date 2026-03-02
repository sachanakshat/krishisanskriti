"use client";

import React, { useState, useEffect, useCallback, createContext, useContext } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Lock, Users, Youtube, LayoutDashboard, Search, ChevronDown, ChevronUp,
  Plus, Trash2, ExternalLink, Sparkles, Phone, MapPin, Landmark,
  CheckCircle, Clock, XCircle, RefreshCw, LogOut, Calendar, MoveRight,
} from "lucide-react";

const AdminBatchCalendar = dynamic(() => import("@/components/AdminBatchCalendar"), { ssr: false });

// ─── Theme context (admin-local) ──────────────────────────────────────────────
const AdminThemeCtx = createContext<{ dark: boolean; toggleDark: () => void }>({ dark: false, toggleDark: () => {} });
const useAdminTheme = () => useContext(AdminThemeCtx);

// ─── Theme-aware class helpers ────────────────────────────────────────────────
function bg(dark: boolean)       { return dark ? "bg-[#050a05]" : "bg-slate-50"; }
function bgCard(dark: boolean)   { return dark ? "bg-zinc-900/60 border-zinc-800/60" : "bg-white border-slate-200"; }
function bgRow(dark: boolean)    { return dark ? "bg-zinc-900/50 border-zinc-800/50" : "bg-white border-slate-200"; }
function bgHover(dark: boolean)  { return dark ? "hover:bg-zinc-800/20" : "hover:bg-slate-50"; }
function txt(dark: boolean)      { return dark ? "text-white" : "text-slate-800"; }
function txtMuted(dark: boolean) { return dark ? "text-zinc-500" : "text-slate-500"; }
function txtFaint(dark: boolean) { return dark ? "text-zinc-600" : "text-slate-400"; }
function border(dark: boolean)   { return dark ? "border-zinc-800/60" : "border-slate-200"; }
function topbar(dark: boolean)   { return dark ? "bg-[#050a05]/90 border-zinc-800/60" : "bg-white/90 border-slate-200 shadow-sm"; }
function inputCls(dark: boolean) {
  return dark
    ? "w-full bg-zinc-800/70 border border-zinc-700/60 text-white placeholder:text-zinc-600 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-green-600/70 transition-colors"
    : "w-full bg-white border border-slate-300 text-slate-800 placeholder:text-slate-400 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/30 transition-colors";
}
function selectCls(dark: boolean) { return inputCls(dark); }

// ─── Auth Gate ────────────────────────────────────────────────────────────────
function LoginGate({ onAuth, dark }: { onAuth: () => void; dark: boolean }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErr("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (res.ok) { sessionStorage.setItem("admin_authed", "1"); onAuth(); }
      else setErr("❌ गलत पासवर्ड / Wrong password");
    } catch { setErr("❌ Connection error"); }
    finally { setLoading(false); }
  };

  return (
    <div className={`min-h-screen ${bg(dark)} flex items-center justify-center px-4 transition-colors duration-300`}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 text-2xl ${dark ? "bg-green-900/40 border border-green-800/50" : "bg-green-50 border border-green-200"}`}>🌿</div>
          <h1 className={`text-2xl font-black ${txt(dark)}`}>Krishi Sanskriti</h1>
          <p className={`${txtMuted(dark)} text-sm mt-1`}>Admin Panel</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="relative">
            <Lock size={14} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${txtFaint(dark)}`} />
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)}
              placeholder="Enter admin password" required autoFocus
              className={`${inputCls(dark)} pl-9`} />
          </div>
          {err && <p className="text-red-500 text-sm">{err}</p>}
          <button type="submit" disabled={loading}
            className={`w-full py-3 bg-green-600 hover:bg-green-500 disabled:${dark ? "bg-zinc-700" : "bg-slate-300"} text-white font-bold rounded-xl transition-all`}>
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
  batchId?: string | null;
  batchWeekStart?: string | null;
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
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 border border-green-300 text-green-700 dark-admin:bg-green-950/60 dark-admin:border-green-800/40 dark-admin:text-green-400 text-xs font-semibold">
      <CheckCircle size={10} /> Paid
    </span>
  );
  if (status === "failed") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 border border-red-300 text-red-700 text-xs font-semibold">
      <XCircle size={10} /> Failed
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 border border-yellow-300 text-yellow-700 text-xs font-semibold">
      <Clock size={10} /> Pending
    </span>
  );
}

// ─── Dashboard Tab ─────────────────────────────────────────────────────────────
function DashboardTab({ regs, videos }: { regs: Registration[]; videos: VideoPost[] }) {
  const { dark } = useAdminTheme();
  const paid = regs.filter((r) => r.paymentStatus === "paid").length;
  const pending = regs.filter((r) => r.paymentStatus === "pending").length;
  const states = [...new Set(regs.map((r) => r.state))].length;
  const totalLand = regs.reduce((s, r) => s + (r.land || 0), 0);

  const stats = [
    { label: "Total Registrations", value: regs.length, icon: "👥", color: dark ? "text-blue-400" : "text-blue-600" },
    { label: "Paid", value: paid, icon: "✅", color: dark ? "text-green-400" : "text-green-600" },
    { label: "Pending Payment", value: pending, icon: "⏳", color: dark ? "text-yellow-400" : "text-yellow-600" },
    { label: "States Covered", value: states, icon: "🗺️", color: dark ? "text-purple-400" : "text-purple-600" },
    { label: "Total Land (acres)", value: totalLand.toFixed(1), icon: "🌾", color: dark ? "text-orange-400" : "text-orange-600" },
    { label: "Video Posts", value: videos.length, icon: "🎬", color: dark ? "text-red-400" : "text-red-600" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-2xl border p-5 ${bgCard(dark)}`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className={`${txtMuted(dark)} text-xs mt-1`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent registrations */}
      <div>
        <h3 className={`text-sm font-bold ${txtMuted(dark)} mb-3`}>Recent Registrations</h3>
        <div className="space-y-2">
          {regs.slice(0, 5).map((r) => (
            <div key={r._id} className={`flex items-center gap-3 p-3 rounded-xl border ${bgRow(dark)}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${dark ? "bg-green-900/40 border border-green-800/40 text-green-400" : "bg-green-100 border border-green-200 text-green-700"}`}>
                {r.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`${txt(dark)} text-sm font-semibold truncate`}>{r.name}</p>
                <p className={`${txtFaint(dark)} text-xs truncate`}>{r.village}, {r.district}</p>
              </div>
              <PayBadge status={r.paymentStatus} />
            </div>
          ))}
          {regs.length === 0 && <p className={`${txtFaint(dark)} text-sm text-center py-6`}>No registrations yet.</p>}
        </div>
      </div>
    </div>
  );
}


// ─── Registrations Tab ─────────────────────────────────────────────────────────
function RegistrationsTab() {
  const { dark } = useAdminTheme();
  const [regs, setRegs] = useState<Registration[]>([]);
  const [batches, setBatches] = useState<{ _id: string; title: string; weekStart: string; seatsLeft: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterPayment, setFilterPayment] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  // per-row batch assign state
  const [batchPick, setBatchPick] = useState<Record<string, string>>({});
  const [batchSaving, setBatchSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterState) params.set("state", filterState);
    if (filterDistrict) params.set("district", filterDistrict);
    if (filterPayment) params.set("payment", filterPayment);
    const [regsRes, batchRes] = await Promise.all([
      fetch(`/api/admin/registrations?${params}`).then((r) => r.json()),
      fetch("/api/batches").then((r) => r.json()),
    ]);
    if (Array.isArray(regsRes)) setRegs(regsRes);
    if (Array.isArray(batchRes)) setBatches(batchRes);
    setLoading(false);
  }, [search, filterState, filterDistrict, filterPayment]);

  useEffect(() => { load(); }, [load]);

  const updatePayment = async (id: string, paymentStatus: string) => {
    await fetch("/api/admin/registrations", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, paymentStatus }),
    });
    load();
  };

  const assignBatch = async (reg: Registration) => {
    const newBatchId = batchPick[reg._id] ?? "";
    setBatchSaving(reg._id);
    if (newBatchId === "") {
      // unassign
      await fetch("/api/admin/registrations", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reg._id, batchId: null, batchWeekStart: null }),
      });
    } else {
      const batch = batches.find((b) => b._id === newBatchId);
      await fetch("/api/admin/registrations", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reg._id, batchId: newBatchId, batchWeekStart: batch?.weekStart ?? null }),
      });
    }
    setBatchSaving(null);
    load();
  };

  const deleteReg = async (id: string, name: string) => {
    if (!confirm(`Delete registration for "${name}"?`)) return;
    await fetch(`/api/admin/registrations?id=${id}`, { method: "DELETE" });
    load();
  };

  const allStates = [...new Set(regs.map((r) => r.state).filter(Boolean))].sort();
  const allDistricts = [...new Set(regs.map((r) => r.district).filter(Boolean))].sort();

  const ic = `${inputCls(dark)} text-xs`;
  const sc = `${selectCls(dark)} text-xs`;

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 ${txtFaint(dark)}`} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, village, phone…" className={`${ic} pl-8`} />
        </div>
        <select value={filterState} onChange={(e) => setFilterState(e.target.value)} className={sc}>
          <option value="">All States</option>
          {allStates.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)} className={sc}>
          <option value="">All Districts</option>
          {allDistricts.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)} className={sc}>
          <option value="">All Payment Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Count + refresh */}
      <div className="flex items-center justify-between">
        <p className={`${txtMuted(dark)} text-xs`}>{regs.length} result{regs.length !== 1 ? "s" : ""}</p>
        <button onClick={load} className={`flex items-center gap-1.5 text-xs ${txtFaint(dark)} hover:text-green-500 transition-colors`}>
          <RefreshCw size={11} /> Refresh
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className={`flex items-center justify-center gap-2 py-16 ${txtMuted(dark)} text-sm`}>
          <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
          Loading…
        </div>
      ) : regs.length === 0 ? (
        <p className={`${txtFaint(dark)} text-sm text-center py-16`}>No registrations found.</p>
      ) : (
        <div className="space-y-3">
          {regs.map((r) => {
            const currentBatch = batches.find((b) => b._id === r.batchId);
            const pickVal = batchPick[r._id] ?? r.batchId ?? "";
            return (
              <div key={r._id} className={`rounded-2xl border overflow-hidden transition-colors ${bgRow(dark)}`}>
                {/* Row */}
                <div className={`flex items-center gap-3 p-4 cursor-pointer ${bgHover(dark)} transition-colors`}
                  onClick={() => setExpanded(expanded === r._id ? null : r._id)}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${dark ? "bg-green-900/40 border border-green-800/40 text-green-400" : "bg-green-100 border border-green-200 text-green-700"}`}>
                    {r.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`${txt(dark)} font-semibold text-sm truncate`}>{r.name}</p>
                    <p className={`${txtFaint(dark)} text-xs truncate`}>
                      {r.village}, {r.district}, {r.state}
                      {currentBatch && <span className="ml-2 text-green-600 font-medium">· {currentBatch.title}</span>}
                    </p>
                  </div>
                  <PayBadge status={r.paymentStatus} />
                  {expanded === r._id
                    ? <ChevronUp size={14} className={`${txtFaint(dark)} shrink-0`} />
                    : <ChevronDown size={14} className={`${txtFaint(dark)} shrink-0`} />}
                </div>

                {/* Expanded detail */}
                {expanded === r._id && (
                  <div className={`border-t ${border(dark)} px-4 pb-4 pt-3 space-y-4`}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      {[
                        { icon: <Phone size={12} />, label: "Phone", val: r.phone },
                        { icon: <MapPin size={12} />, label: "Village", val: r.village },
                        { icon: <Landmark size={12} />, label: "District", val: r.district },
                        { icon: <MapPin size={12} />, label: "State", val: r.state },
                        { icon: <span className="text-xs">🌾</span>, label: "Land", val: `${r.land} acres` },
                        { icon: <Clock size={12} />, label: "Registered", val: new Date(r.createdAt).toLocaleDateString("en-IN") },
                      ].map(({ icon, label, val }) => (
                        <div key={label} className="flex items-start gap-2">
                          <span className={`${txtFaint(dark)} mt-0.5 shrink-0`}>{icon}</span>
                          <div>
                            <p className={txtMuted(dark)}>{label}</p>
                            <p className={`${txt(dark)} font-medium`}>{val}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* ── Batch assign/move ── */}
                    <div className={`rounded-xl border p-3 space-y-2.5 ${dark ? "bg-zinc-800/40 border-zinc-700/40" : "bg-slate-50 border-slate-200"}`}>
                      <p className={`text-xs font-bold ${txtMuted(dark)} flex items-center gap-1.5`}>
                        <Calendar size={11} /> Batch Assignment
                      </p>
                      {r.batchId && currentBatch ? (
                        <p className="text-xs text-green-600 font-medium">
                          Currently: <strong>{currentBatch.title}</strong>
                          {currentBatch.weekStart && (
                            <span className={`ml-1 ${txtFaint(dark)}`}>
                              ({new Date(currentBatch.weekStart + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })})
                            </span>
                          )}
                        </p>
                      ) : (
                        <p className={`text-xs ${txtFaint(dark)}`}>No batch assigned</p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <select
                          value={pickVal}
                          onChange={(e) => setBatchPick((p) => ({ ...p, [r._id]: e.target.value }))}
                          className={`${selectCls(dark)} text-xs flex-1 min-w-0`}
                        >
                          <option value="">— Unassign / No batch —</option>
                          {batches.map((b) => {
                            const mon = new Date(b.weekStart + "T00:00:00");
                            const thu = new Date(mon); thu.setDate(thu.getDate() + 3);
                            return (
                              <option key={b._id} value={b._id} disabled={b.seatsLeft <= 0 && b._id !== r.batchId}>
                                {b.title} — {mon.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}–{thu.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                {b.seatsLeft <= 0 ? " (Full)" : ` (${b.seatsLeft} seats)`}
                              </option>
                            );
                          })}
                        </select>
                        <button
                          onClick={() => assignBatch(r)}
                          disabled={batchSaving === r._id || pickVal === (r.batchId ?? "")}
                          className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-all shrink-0"
                        >
                          {batchSaving === r._id
                            ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : <MoveRight size={11} />}
                          {pickVal === "" ? "Unassign" : (r.batchId ? "Move" : "Assign")}
                        </button>
                      </div>
                    </div>

                    {/* Payment control + delete */}
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <span className={`${txtMuted(dark)} text-xs shrink-0`}>Payment:</span>
                      {(["pending", "paid", "failed"] as const).map((s) => (
                        <button key={s} onClick={() => updatePayment(r._id, s)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                            r.paymentStatus === s
                              ? s === "paid" ? "bg-green-600 border-green-500 text-white"
                                : s === "failed" ? "bg-red-600 border-red-500 text-white"
                                : "bg-yellow-500 border-yellow-400 text-white"
                              : dark
                                ? "bg-zinc-800/50 border-zinc-700/40 text-zinc-500 hover:text-white"
                                : "bg-slate-100 border-slate-300 text-slate-500 hover:text-slate-800"
                          }`}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                      <div className="flex-1" />
                      <button onClick={() => deleteReg(r._id, r.name)}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs transition-colors">
                        <Trash2 size={11} /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Videos Tab ────────────────────────────────────────────────────────────────
function VideosTab() {
  const { dark } = useAdminTheme();
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

  const lbl = `block text-xs font-semibold ${txtMuted(dark)} mb-1`;
  const ic = inputCls(dark);

  return (
    <div className="space-y-6">
      {/* Add / Edit form */}
      <div className={`rounded-2xl border overflow-hidden ${bgCard(dark)}`}>
        <button type="button" onClick={() => setExpanded((p) => !p)}
          className={`w-full flex items-center justify-between px-6 py-4 ${bgHover(dark)} transition-colors`}>
          <span className={`flex items-center gap-2 font-bold text-base ${txt(dark)}`}>
            <Plus size={16} className="text-green-500" />
            {form.videoId ? `Editing: ${form.videoId}` : "Add New Video Post"}
          </span>
          {expanded ? <ChevronUp size={16} className={txtFaint(dark)} /> : <ChevronDown size={16} className={txtFaint(dark)} />}
        </button>

        {expanded && (
          <form onSubmit={handleSubmit} className={`px-6 pb-6 space-y-5 border-t ${border(dark)} pt-5`}>
            <div>
              <label className={lbl}>YouTube Video ID or URL <span className="text-red-500">*</span></label>
              <input name="videoId" value={form.videoId} onChange={handleVideoIdChange}
                placeholder="e.g. dQw4w9WgXcQ or full YouTube URL" required className={ic} />
              {form.videoId && (
                <div className="mt-3 space-y-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://img.youtube.com/vi/${form.videoId}/mqdefault.jpg`} alt="thumb"
                      className={`w-28 rounded-xl border ${dark ? "border-zinc-700" : "border-slate-300"}`} />
                    <div className="flex flex-col gap-2">
                      <a href={`https://www.youtube.com/watch?v=${form.videoId}`} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-green-500 flex items-center gap-1 hover:underline">
                        <ExternalLink size={11} /> Preview on YouTube
                      </a>
                      <p className={`${txtFaint(dark)} text-xs`}>ID: {form.videoId}</p>
                    </div>
                  </div>
                  <button type="button" onClick={generateWithAI} disabled={generating}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-linear-to-r from-purple-900/50 to-green-900/40 hover:from-purple-800/60 hover:to-green-800/50 border border-purple-700/40 text-purple-300 hover:text-purple-200 font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                    {generating ? (
                      <><div className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                        {generateMsg?.text ?? "Generating…"}</>
                    ) : (
                      <><Sparkles size={14} /> Auto-fill all fields with Gemini AI</>
                    )}
                  </button>
                  {generateMsg && !generating && (
                    <div className={`text-xs rounded-lg px-3 py-2 ${
                      generateMsg.type === "ok" ? "bg-green-50 text-green-700 border border-green-200"
                      : generateMsg.type === "err" ? "bg-red-50 text-red-600 border border-red-200"
                      : dark ? "bg-zinc-900 text-zinc-400 border border-zinc-700/40" : "bg-slate-100 text-slate-600 border border-slate-200"}`}>
                      {generateMsg.text}
                    </div>
                  )}
                </div>
              )}
            </div>

            {[
              { type: "date" as const, name: "publishedAt", label: "Published Date", val: form.publishedAt, req: false },
            ].map(({ type, name, label, val, req }) => (
              <div key={name}>
                <label className={lbl}>{label}{req && <span className="text-red-500 ml-1">*</span>}</label>
                <input type={type} name={name} value={val} onChange={handleChange} required={req} className={ic} />
              </div>
            ))}
            <div>
              <label className={lbl}>Title (English) <span className="text-red-500">*</span></label>
              <input name="title" value={form.title} onChange={handleChange} required placeholder="Video title in English" className={ic} />
            </div>
            <div>
              <label className={lbl}>शीर्षक (हिंदी)</label>
              <input name="titleHi" value={form.titleHi} onChange={handleChange} placeholder="हिंदी में शीर्षक" className={ic} />
            </div>
            <div>
              <label className={lbl}>Short Description (English) <span className="text-red-500">*</span></label>
              <input name="description" value={form.description} onChange={handleChange} required placeholder="1-2 sentence summary" className={ic} />
            </div>
            <div>
              <label className={lbl}>संक्षिप्त विवरण (हिंदी)</label>
              <input name="descriptionHi" value={form.descriptionHi} onChange={handleChange} placeholder="हिंदी में संक्षिप्त विवरण" className={ic} />
            </div>
            <div>
              <label className={lbl}>Blog Post — Markdown (English) <span className="text-red-500">*</span></label>
              <textarea name="blogContent" value={form.blogContent} onChange={handleChange} required rows={10}
                placeholder={"## Introduction\n\nIn this video we discuss..."} className={`${ic} resize-y font-mono text-xs`} />
            </div>
            <div>
              <label className={lbl}>ब्लॉग पोस्ट — Markdown (हिंदी)</label>
              <textarea name="blogContentHi" value={form.blogContentHi} onChange={handleChange} rows={8}
                placeholder={"## परिचय\n\nइस वीडियो में..."} className={`${ic} resize-y font-mono text-xs`} />
            </div>

            {msg && (
              <div className={`text-sm rounded-xl px-4 py-3 ${msg.type === "ok"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-600 border border-red-200"}`}>
                {msg.text}
              </div>
            )}
            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className={`flex-1 py-3 bg-green-600 hover:bg-green-500 disabled:${dark ? "bg-zinc-700" : "bg-slate-300"} text-white font-bold rounded-xl transition-all`}>
                {saving ? "Saving…" : "Save Video Post"}
              </button>
              <button type="button" onClick={() => { setForm(emptyVideo); setExpanded(false); setMsg(null); }}
                className={`px-5 py-3 rounded-xl font-semibold transition-all ${dark ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300" : "bg-slate-100 hover:bg-slate-200 text-slate-600"}`}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Saved posts */}
      <h3 className={`text-sm font-bold ${txtMuted(dark)}`}>Saved Posts ({videos.length})</h3>
      {videos.length === 0 ? (
        <p className={`${txtFaint(dark)} text-sm text-center py-10`}>No video posts yet.</p>
      ) : (
        <div className="space-y-3">
          {videos.map((v) => (
            <div key={v.videoId}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-colors ${bgRow(dark)} ${bgHover(dark)}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`} alt={v.title}
                className={`w-24 aspect-video rounded-lg object-cover shrink-0 border ${dark ? "border-zinc-800" : "border-slate-200"}`} />
              <div className="flex-1 min-w-0">
                <p className={`${txt(dark)} font-semibold text-sm truncate`}>{v.title}</p>
                {v.titleHi && <p className={`${txtMuted(dark)} text-xs truncate`}>{v.titleHi}</p>}
                <p className={`${txtFaint(dark)} text-xs mt-1`}>{v.videoId}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/blog/${v.videoId}`}
                  className={`p-2 rounded-lg transition-colors text-green-600 ${dark ? "bg-green-900/30 hover:bg-green-800/40" : "bg-green-50 hover:bg-green-100"}`} title="View post">
                  <ExternalLink size={14} />
                </Link>
                <button onClick={() => prefill(v)}
                  className={`p-2 rounded-lg transition-colors ${dark ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300" : "bg-slate-100 hover:bg-slate-200 text-slate-600"}`} title="Edit">
                  ✏️
                </button>
                <button onClick={() => handleDelete(v.videoId)}
                  className={`p-2 rounded-lg transition-colors text-red-500 ${dark ? "bg-red-950/40 hover:bg-red-900/40" : "bg-red-50 hover:bg-red-100"}`} title="Delete">
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
type Tab = "dashboard" | "registrations" | "videos" | "batches";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [dark, setDark] = useState(false); // default light
  const [tab, setTab] = useState<Tab>("dashboard");
  const [regs, setRegs] = useState<Registration[]>([]);
  const [videos, setVideos] = useState<VideoPost[]>([]);

  useEffect(() => {
    if (sessionStorage.getItem("admin_authed") === "1") setAuthed(true);
    const saved = localStorage.getItem("admin_theme");
    if (saved) setDark(saved === "dark");
  }, []);

  const toggleDark = () => setDark((d) => {
    const next = !d;
    localStorage.setItem("admin_theme", next ? "dark" : "light");
    return next;
  });

  useEffect(() => {
    if (!authed) return;
    fetch("/api/admin/registrations").then((r) => r.json()).then((d) => Array.isArray(d) && setRegs(d));
    fetch("/api/videos").then((r) => r.json()).then((d) => Array.isArray(d) && setVideos(d));
  }, [authed]);

  if (!authed) return <LoginGate onAuth={() => setAuthed(true)} dark={dark} />;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={15} /> },
    { id: "registrations", label: `Registrations (${regs.length})`, icon: <Users size={15} /> },
    { id: "videos", label: `Videos (${videos.length})`, icon: <Youtube size={15} /> },
    { id: "batches", label: "Batches", icon: <Calendar size={15} /> },
  ];

  return (
    <AdminThemeCtx.Provider value={{ dark, toggleDark }}>
      <div className={`min-h-screen ${bg(dark)} ${txt(dark)} transition-colors duration-300`}>
        {/* Top bar */}
        <div className={`sticky top-0 z-30 border-b backdrop-blur-sm ${topbar(dark)}`}>
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">🌿</span>
              <div>
                <p className={`${txt(dark)} font-black text-sm leading-none`}>Krishi Sanskriti</p>
                <p className={`${txtFaint(dark)} text-xs`}>Admin Panel</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Theme toggle */}
              <button onClick={toggleDark} title={dark ? "Switch to Light" : "Switch to Dark"}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  dark
                    ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-yellow-300 hover:border-yellow-700/50"
                    : "bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-800 hover:border-slate-300"
                }`}>
                {dark ? <>☀️ Light</> : <>🌙 Dark</>}
              </button>
              <Link href="/" className={`text-xs ${txtFaint(dark)} hover:text-green-500 transition-colors`}>
                ← Site
              </Link>
              <button
                onClick={() => { sessionStorage.removeItem("admin_authed"); setAuthed(false); }}
                className={`flex items-center gap-1.5 text-xs ${txtFaint(dark)} hover:text-red-500 transition-colors`}
              >
                <LogOut size={12} /> Logout
              </button>
            </div>
          </div>

          {/* Tab nav */}
          <div className="max-w-5xl mx-auto px-4 flex gap-1 pb-0 overflow-x-auto">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
                  tab === t.id
                    ? "border-green-500 text-green-600"
                    : `border-transparent ${txtFaint(dark)} hover:${txt(dark)}`
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
          {tab === "batches" && <AdminBatchCalendar dark={dark} />}
        </div>
      </div>
    </AdminThemeCtx.Provider>
  );
}
