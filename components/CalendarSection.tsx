"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Calendar, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { BatchWithCount } from "@/types/batch";

// ── Helpers ───────────────────────────────────────────────────────────────────

function toDateStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** ISO Monday of the week containing d */
function getMondayStr(d: Date) {
  const date = new Date(d);
  const dow = date.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  date.setDate(date.getDate() + diff);
  return toDateStr(date);
}

/** 6-row × 7-col grid (Mon-start). nulls = padding cells. */
function buildGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  let startDow = first.getDay() - 1;
  if (startDow < 0) startDow = 6;
  const grid: (Date | null)[] = Array(startDow).fill(null);
  for (let d = 1; d <= last.getDate(); d++) grid.push(new Date(year, month, d));
  while (grid.length % 7 !== 0) grid.push(null);
  return grid;
}

function seatStyle(b: BatchWithCount) {
  if (b.seatsLeft <= 0)
    return { bar: "bg-zinc-200 dark:bg-zinc-700/60", text: "text-zinc-500 dark:text-zinc-500", card: "bg-zinc-100 dark:bg-zinc-800/50 border-zinc-300/60 dark:border-zinc-700/40" };
  if (b.seatsLeft <= 5)
    return { bar: "bg-red-200 dark:bg-red-900/60", text: "text-red-700 dark:text-red-400", card: "bg-red-50 dark:bg-red-950/30 border-red-200/60 dark:border-red-900/40" };
  if (b.seatsLeft <= 10)
    return { bar: "bg-amber-200 dark:bg-amber-900/60", text: "text-amber-700 dark:text-amber-400", card: "bg-amber-50 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-900/40" };
  return { bar: "bg-green-200 dark:bg-green-900/60", text: "text-green-700 dark:text-green-400", card: "bg-green-50 dark:bg-green-950/30 border-green-200/60 dark:border-green-900/40" };
}

// ── Constants ─────────────────────────────────────────────────────────────────
const MONTH_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTH_HI = ["जनवरी","फ़रवरी","मार्च","अप्रैल","मई","जून","जुलाई","अगस्त","सितंबर","अक्टूबर","नवंबर","दिसंबर"];

// ── Component ─────────────────────────────────────────────────────────────────
export default function CalendarSection() {
  const router = useRouter();
  const { lang } = useLanguage();

  const [batches, setBatches] = useState<BatchWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/batches")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setBatches(d))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // weekStart → batch lookup map
  const batchMap = new Map<string, BatchWithCount>();
  batches.forEach((b) => batchMap.set(b.weekStart, b));

  const grid = buildGrid(viewYear, viewMonth);
  const todayStr = toDateStr(today);

  /** Returns the batch for this day if it's Mon–Thu and a batch exists */
  const getBatch = (day: Date) => {
    const dow = day.getDay();
    if (dow === 0 || dow >= 5) return null; // Only Mon–Thu
    return batchMap.get(getMondayStr(day)) ?? null;
  };

  const monthNames = lang === "hi" ? MONTH_HI : MONTH_EN;
  const dayHeaders = lang === "hi"
    ? ["सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि", "रवि"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const prevMonth = () => {
    const d = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(d.getFullYear()); setViewMonth(d.getMonth());
  };
  const nextMonth = () => {
    const d = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(d.getFullYear()); setViewMonth(d.getMonth());
  };

  const upcoming = batches.filter((b) => {
    const thu = new Date(b.weekStart + "T00:00:00");
    thu.setDate(thu.getDate() + 3);
    return thu >= today;
  }).slice(0, 6);

  const goRegister = (b: BatchWithCount) => {
    if (b.seatsLeft <= 0) return;
    router.push(`/register?batchId=${b._id}&weekStart=${b.weekStart}`);
  };

  return (
    <section id="calendar" className="py-24 bg-green-50/60 dark:bg-zinc-950 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-green-300/10 dark:bg-green-900/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-5 rounded-full bg-green-100 dark:bg-green-950/50 border border-green-300/50 dark:border-green-800/40 text-green-700 dark:text-green-400 text-xs sm:text-sm font-semibold">
            <Calendar size={13} />
            {lang === "hi" ? "बैच शेड्यूल" : "Batch Schedule"}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-green-900 dark:text-white mb-4 leading-tight">
            {lang === "hi" ? "अपना बैच चुनें" : "Choose Your Batch"}
          </h2>
          <p className="text-slate-600 dark:text-zinc-400 text-sm sm:text-base max-w-xl mx-auto">
            {lang === "hi"
              ? "हर हफ्ते सोमवार–गुरुवार को बैच। प्रति बैच 32 सीटें। उपलब्ध तारीख पर क्लिक करें।"
              : "Weekly batches Mon–Thu, 32 seats per batch. Click an available date to register."}
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-5 mb-8 text-xs font-medium">
          {[
            { cls: "bg-green-200 dark:bg-green-900/60", label: lang === "hi" ? "उपलब्ध" : "Available" },
            { cls: "bg-amber-200 dark:bg-amber-900/60", label: lang === "hi" ? "≤10 सीट" : "≤10 seats" },
            { cls: "bg-red-200 dark:bg-red-900/60", label: lang === "hi" ? "आखिरी 5!" : "Last 5!" },
            { cls: "bg-zinc-200 dark:bg-zinc-700/60", label: lang === "hi" ? "भरा हुआ" : "Full" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-2">
              <div className={`w-5 h-3.5 rounded ${l.cls}`} />
              <span className="text-slate-600 dark:text-zinc-400">{l.label}</span>
            </div>
          ))}
        </div>

        {/* Calendar card */}
        <div className="rounded-3xl bg-white dark:bg-zinc-900/60 border border-green-200/50 dark:border-zinc-800/60 shadow-lg dark:shadow-none overflow-hidden mb-10">
          {/* Month navigation */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-green-100/80 dark:border-zinc-800/60 bg-green-50/50 dark:bg-black/20">
            <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-green-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <h3 className="text-lg font-bold text-green-900 dark:text-white">
              {monthNames[viewMonth]} {viewYear}
            </h3>
            <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-green-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-green-100/80 dark:border-zinc-800/60">
            {dayHeaders.map((d, i) => (
              <div key={d} className={`py-2.5 text-center text-xs font-bold tracking-wide
                ${i < 4 ? "bg-green-50/80 dark:bg-green-950/20 text-green-700 dark:text-green-500" : "text-slate-400 dark:text-zinc-600"}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-slate-400 dark:text-zinc-600 text-sm">
              <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
              {lang === "hi" ? "लोड हो रहा है..." : "Loading..."}
            </div>
          ) : (
            <div className="grid grid-cols-7">
              {grid.map((day, idx) => {
                if (!day) return (
                  <div key={`pad-${idx}`} className="min-h-[68px] sm:min-h-[84px] border-r border-b border-green-50/80 dark:border-zinc-800/30 bg-green-50/20 dark:bg-black/10" />
                );

                const dateStr = toDateStr(day);
                const isToday = dateStr === todayStr;
                const isPast = day < today;
                const dow = day.getDay();
                const isBatchDay = dow >= 1 && dow <= 4;
                const isMonday = dow === 1;
                const isThursday = dow === 4;
                const batch = getBatch(day);
                const style = batch ? seatStyle(batch) : null;
                const clickable = !!batch && !isPast && batch.seatsLeft > 0;

                return (
                  <div
                    key={dateStr}
                    onClick={() => clickable && goRegister(batch!)}
                    className={`min-h-[68px] sm:min-h-[84px] border-r border-b border-green-50/80 dark:border-zinc-800/30 p-1.5 transition-all
                      ${clickable ? "cursor-pointer hover:brightness-95 dark:hover:brightness-125" : ""}`}
                  >
                    {/* Date number */}
                    <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold mx-auto mb-1
                      ${isToday ? "bg-green-600 text-white"
                        : isPast ? "text-slate-300 dark:text-zinc-700"
                        : isBatchDay ? "text-green-800 dark:text-green-300"
                        : "text-slate-400 dark:text-zinc-600"}`}>
                      {day.getDate()}
                    </div>

                    {/* Batch event bar */}
                    {batch && isBatchDay && (
                      <div className={`h-5 sm:h-6 transition-all
                        ${style!.bar}
                        ${isPast ? "opacity-30" : ""}
                        ${isMonday ? "rounded-l-md ml-0.5" : "ml-0"}
                        ${isThursday ? "rounded-r-md mr-0.5" : "mr-0"}`}>
                        {isMonday && (
                          <span className={`hidden sm:block truncate text-[9px] font-bold px-1.5 leading-5 sm:leading-6 ${style!.text}`}>
                            {batch.seatsLeft <= 0
                              ? (lang === "hi" ? "भरा हुआ" : "Full")
                              : batch.seatsLeft <= 5
                                ? `⚡ ${batch.seatsLeft} ${lang === "hi" ? "बचे!" : "left!"}`
                                : batch.title}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming batch cards */}
        <h3 className="text-sm font-bold text-green-900 dark:text-zinc-300 mb-4 flex items-center gap-2">
          <Calendar size={14} className="text-green-600 dark:text-green-500" />
          {lang === "hi" ? "आगामी बैच" : "Upcoming Batches"}
        </h3>

        {loading ? (
          <div className="text-slate-400 dark:text-zinc-600 text-sm text-center py-8">...</div>
        ) : upcoming.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-white/60 dark:bg-zinc-900/40 border border-green-100/60 dark:border-zinc-800/40">
            <div className="text-4xl mb-3">📅</div>
            <p className="text-slate-500 dark:text-zinc-600 text-sm">
              {lang === "hi" ? "फिलहाल कोई आगामी बैच निर्धारित नहीं है" : "No upcoming batches scheduled yet"}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map((b) => {
              const mon = new Date(b.weekStart + "T00:00:00");
              const thu = new Date(mon);
              thu.setDate(thu.getDate() + 3);
              const style = seatStyle(b);
              const full = b.seatsLeft <= 0;
              const urgent = !full && b.seatsLeft <= 5;

              return (
                <div
                  key={b._id}
                  onClick={() => goRegister(b)}
                  className={`rounded-2xl p-4 border transition-all
                    ${full ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:scale-[1.02] active:scale-[0.99]"}
                    ${style.card}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className={`font-bold text-sm ${style.text}`}>{b.title}</p>
                      <p className="text-slate-600 dark:text-zinc-500 text-xs mt-0.5">
                        {mon.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "short" })}
                        {" – "}
                        {thu.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-xl font-black ${style.text}`}>{b.seatsLeft <= 0 ? "0" : b.seatsLeft}</div>
                      <div className="text-slate-500 dark:text-zinc-600 text-[10px]">
                        {lang === "hi" ? "सीट बचीं" : "seats left"}
                      </div>
                    </div>
                  </div>
                  {urgent && (
                    <div className={`flex items-center gap-1 text-[10px] font-bold ${style.text}`}>
                      <Users size={9} />
                      {lang === "hi" ? "⚡ जल्दी करें — सीमित सीटें!" : "⚡ Hurry — very few seats left!"}
                    </div>
                  )}
                  {full && (
                    <p className="text-[10px] text-slate-400 dark:text-zinc-600 mt-1">
                      {lang === "hi" ? "यह बैच भर चुका है" : "This batch is full"}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
