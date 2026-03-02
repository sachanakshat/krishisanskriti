"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Calendar, Users, AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { BatchWithCount } from "@/types/batch";

function BatchPicker({
  batches, selected, onSelect, lang,
}: { batches: BatchWithCount[]; selected: string; onSelect: (id: string) => void; lang: "en" | "hi"; }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcoming = batches.filter((b) => {
    const thu = new Date(b.weekStart + "T00:00:00"); thu.setDate(thu.getDate() + 3);
    return thu >= today;
  });
  if (upcoming.length === 0) return (
    <div className="rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/60 p-6 text-center mb-6">
      <div className="text-3xl mb-2">📅</div>
      <p className="text-slate-500 dark:text-zinc-400 text-sm mb-3">{lang === "hi" ? "अभी कोई उपलब्ध बैच नहीं" : "No upcoming batches available"}</p>
      <Link href="/#calendar" className="text-green-600 dark:text-green-400 text-xs hover:underline">{lang === "hi" ? "कैलेंडर देखें →" : "Check calendar →"}</Link>
    </div>
  );
  return (
    <div className="mb-6">
      <label className="block text-slate-700 dark:text-zinc-300 text-sm font-semibold mb-3">
        {lang === "hi" ? "बैच चुनें" : "Select Batch"}<span className="text-green-600 ml-1">*</span>
      </label>
      <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5">
        {upcoming.map((b) => {
          const mon = new Date(b.weekStart + "T00:00:00");
          const thu = new Date(mon); thu.setDate(thu.getDate() + 3);
          const full = b.seatsLeft <= 0; const urgent = !full && b.seatsLeft <= 5;
          return (
            <button key={b._id} type="button" disabled={full} onClick={() => onSelect(b._id)}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                selected === b._id ? "bg-green-100 dark:bg-green-900/40 border-green-500 dark:border-green-600/60 text-green-900 dark:text-white"
                : full ? "opacity-40 cursor-not-allowed bg-slate-100 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-700/40 text-slate-400 dark:text-zinc-500"
                : "bg-white dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-700/40 hover:border-green-400 dark:hover:border-green-700/60 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"}`}>
              <div>
                <p className="font-semibold text-sm">{b.title}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">
                  {mon.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { weekday: "short", day: "numeric", month: "short" })}
                  {" – "}{thu.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <div className="text-right shrink-0 ml-3">
                {full
                  ? <span className="text-xs text-slate-400 dark:text-zinc-600">{lang === "hi" ? "भरा" : "Full"}</span>
                  : <><span className={`text-lg font-black ${urgent ? "text-red-500" : "text-green-600 dark:text-green-400"}`}>{b.seatsLeft}</span>
                     <p className="text-[10px] text-slate-400 dark:text-zinc-600">{lang === "hi" ? "सीट बचीं" : "seats left"}</p></>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RegisterForm() {
  const { t, lang } = useLanguage();
  const searchParams = useSearchParams();
  const batchIdParam = searchParams.get("batchId") ?? "";
  const weekStartParam = searchParams.get("weekStart") ?? "";
  const [batches, setBatches] = useState<BatchWithCount[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState(batchIdParam);
  const [selectedBatch, setSelectedBatch] = useState<BatchWithCount | null>(null);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [formData, setFormData] = useState({ name: "", village: "", district: "", state: "", phone: "", land: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "full">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch("/api/batches").then(r => r.json()).then((d: BatchWithCount[]) => {
      if (Array.isArray(d)) {
        setBatches(d);
        const found = d.find(b => b._id === (batchIdParam || selectedBatchId));
        if (found) setSelectedBatch(found);
      }
    }).finally(() => setLoadingBatches(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchIdParam]);

  useEffect(() => {
    setSelectedBatch(batches.find(b => b._id === selectedBatchId) ?? null);
  }, [selectedBatchId, batches]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId) { setStatus("error"); setErrorMsg(lang === "hi" ? "कृपया एक बैच चुनें" : "Please select a batch"); return; }
    if (selectedBatch && selectedBatch.seatsLeft <= 0) { setStatus("full"); return; }
    setStatus("loading"); setErrorMsg("");
    try {
      const res = await fetch("/api/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, batchId: selectedBatchId, batchWeekStart: selectedBatch?.weekStart ?? weekStartParam }),
      });
      const data = await res.json();
      if (!res.ok) { if (res.status === 409) { setStatus("full"); return; } throw new Error(data.error ?? "Failed"); }
      setStatus("success");
      setFormData({ name: "", village: "", district: "", state: "", phone: "", land: "" });
    } catch (err: unknown) { setStatus("error"); setErrorMsg(err instanceof Error ? err.message : t.register.error); }
  };

  const fields = [
    { key: "name", type: "text", label: t.register.name, placeholder: t.register.namePlaceholder },
    { key: "village", type: "text", label: t.register.village, placeholder: t.register.villagePlaceholder },
    { key: "district", type: "text", label: t.register.district, placeholder: t.register.districtPlaceholder },
    { key: "state", type: "text", label: t.register.state, placeholder: t.register.statePlaceholder },
    { key: "phone", type: "tel", label: t.register.phone, placeholder: t.register.phonePlaceholder },
    { key: "land", type: "number", label: t.register.land, placeholder: t.register.landPlaceholder },
  ];

  const BatchInfoCard = () => {
    if (!selectedBatch) return null;
    const mon = new Date(selectedBatch.weekStart + "T00:00:00");
    const thu = new Date(mon); thu.setDate(thu.getDate() + 3);
    const full = selectedBatch.seatsLeft <= 0;
    const urgent = !full && selectedBatch.seatsLeft <= 5;
    return (
      <div className={`rounded-2xl p-4 mb-5 border ${full ? "bg-slate-100 dark:bg-zinc-900/50 border-slate-300 dark:border-zinc-700/50" : urgent ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30" : "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30"}`}>
        <div className="flex items-start gap-3">
          <Calendar size={16} className={`mt-0.5 shrink-0 ${full ? "text-slate-400 dark:text-zinc-600" : urgent ? "text-red-500" : "text-green-600 dark:text-green-400"}`} />
          <div className="flex-1 min-w-0">
            <p className={`font-bold text-sm ${full ? "text-slate-500 dark:text-zinc-400" : "text-slate-800 dark:text-white"}`}>{selectedBatch.title}</p>
            <p className="text-slate-500 dark:text-zinc-500 text-xs mt-0.5">
              {mon.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { weekday: "long", day: "numeric", month: "long" })}
              {" – "}
              {thu.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <Users size={11} className={full ? "text-zinc-600" : urgent ? "text-red-400" : "text-green-500"} />
              <span className={`text-xs font-semibold ${full ? "text-slate-400 dark:text-zinc-500" : urgent ? "text-red-500" : "text-green-600 dark:text-green-400"}`}>
                {full
                  ? (lang === "hi" ? "यह बैच भर चुका है" : "This batch is full")
                  : urgent
                    ? (lang === "hi" ? `⚡ सिर्फ ${selectedBatch.seatsLeft} सीट बची हैं!` : `⚡ Only ${selectedBatch.seatsLeft} seats left — hurry!`)
                    : (lang === "hi" ? `${selectedBatch.seatsLeft} सीटें उपलब्ध` : `${selectedBatch.seatsLeft} seats available`)}
              </span>
            </div>
          </div>
          <Link href="/#calendar" className="text-xs text-slate-400 dark:text-zinc-500 hover:text-green-600 dark:hover:text-green-400 transition-colors shrink-0">
            {lang === "hi" ? "बदलें" : "Change"}
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050a05]">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-lg mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 dark:text-zinc-500 hover:text-green-600 dark:hover:text-green-400 text-sm mb-8 transition-colors group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            {lang === "hi" ? "होम पर वापस जाएं" : "Back to Home"}
          </Link>
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">📝</div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-2">{t.register.title}</h1>
            <p className="text-slate-500 dark:text-zinc-500 text-sm sm:text-base">{t.register.subtitle}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/60 rounded-3xl p-6 sm:p-8 backdrop-blur-sm">
            {status === "success" ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700/50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Check size={28} className="text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{lang === "hi" ? "पंजीकरण सफल!" : "Registration Successful!"}</h3>
                <p className="text-slate-500 dark:text-zinc-400 text-sm mb-4 leading-relaxed">{t.register.success}</p>
                {selectedBatch && (
                  <p className="text-green-600/80 dark:text-green-400/70 text-xs mb-6">
                    {lang === "hi" ? "बैच:" : "Batch:"}{" "}
                    <strong className="text-green-600 dark:text-green-400">{selectedBatch.title}</strong>
                  </p>
                )}
                <Link href="/" className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 text-sm font-medium transition-colors">
                  <ArrowLeft size={14} />{lang === "hi" ? "होम पर वापस जाएं" : "Back to Home"}
                </Link>
              </div>
            ) : status === "full" ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/40 rounded-full flex items-center justify-center mx-auto mb-5">
                  <AlertCircle size={28} className="text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{lang === "hi" ? "बैच भर गया है!" : "Batch is Full!"}</h3>
                <p className="text-slate-500 dark:text-zinc-400 text-sm mb-6">{lang === "hi" ? "यह बैच भर चुका है। कृपया दूसरा बैच चुनें।" : "This batch is full. Please choose a different batch."}</p>
                <Link href="/#calendar" className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-full text-sm transition-all">
                  <Calendar size={14} />{lang === "hi" ? "दूसरा बैच चुनें" : "Choose Another Batch"}
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {loadingBatches ? (
                  <div className="flex items-center gap-2 py-5 text-slate-400 dark:text-zinc-600 text-sm">
                    <div className="w-3.5 h-3.5 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
                    {lang === "hi" ? "बैच लोड हो रहे हैं..." : "Loading batches..."}
                  </div>
                ) : batchIdParam ? <BatchInfoCard /> : (
                  <BatchPicker batches={batches} selected={selectedBatchId} onSelect={setSelectedBatchId} lang={lang} />
                )}

                {fields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-slate-700 dark:text-zinc-300 text-sm font-semibold mb-2">
                      {field.label}<span className="text-green-600 ml-1">*</span>
                    </label>
                    <input
                      type={field.type} name={field.key}
                      value={formData[field.key as keyof typeof formData]}
                      onChange={(e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }))}
                      placeholder={field.placeholder} required
                      min={field.type === "number" ? "0" : undefined}
                      step={field.type === "number" ? "0.1" : undefined}
                      className="w-full bg-white dark:bg-zinc-800/70 border border-slate-300 dark:border-zinc-700/60 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-600 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-green-500/70 dark:focus:border-green-600/70 focus:ring-1 focus:ring-green-500/40 dark:focus:ring-green-600/40 transition-all hover:border-slate-400 dark:hover:border-zinc-600"
                    />
                  </div>
                ))}

                <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/25 p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">🔒</span>
                    <div>
                      <p className="text-amber-600 dark:text-amber-400 text-xs font-semibold mb-1">{t.payment.title}</p>
                      <p className="text-slate-500 dark:text-zinc-500 text-xs leading-relaxed">{t.payment.description}</p>
                    </div>
                  </div>
                </div>

                {status === "error" && (
                  <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30 px-4 py-3">
                    <p className="text-red-600 dark:text-red-400 text-sm">{errorMsg || t.register.error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "loading" || (!!selectedBatch && selectedBatch.seatsLeft <= 0)}
                  className="w-full py-4 bg-green-600 hover:bg-green-500 disabled:bg-slate-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-bold text-base rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-green-950/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {status === "loading" ? t.register.submitting
                    : selectedBatch?.seatsLeft === 0 ? (lang === "hi" ? "बैच भर गया है" : "Batch Full")
                    : t.register.submit}
                </button>
                <p className="text-center text-slate-400 dark:text-zinc-600 text-xs">{t.training.seats}</p>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-[#050a05] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
