"use client";

import { useState, useCallback, useEffect } from "react";
import { Calendar, dateFnsLocalizer, type View } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { format, parse, startOfWeek, getDay, addDays } from "date-fns";
import { enUS } from "date-fns/locale";
import { Trash2, Users, Plus, MoveRight, X, Check } from "lucide-react";
import type { BatchWithCount } from "@/types/batch";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Attendee {
  _id: string;
  name: string;
  phone: string;
  village: string;
  district: string;
  state: string;
  land: number;
  paymentStatus: string;
  createdAt: string;
}

interface CalEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: BatchWithCount;
}

// ── Localizer ─────────────────────────────────────────────────────────────────
const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DnDCalendar = withDragAndDrop<CalEvent>(Calendar as any);

// ── Helpers ───────────────────────────────────────────────────────────────────
function toDateStr(d: Date) {
  return d.toISOString().split("T")[0];
}

function getMondayStr(d: Date) {
  const date = new Date(d);
  const dow = date.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  date.setDate(date.getDate() + diff);
  return toDateStr(date);
}

function batchToEvent(b: BatchWithCount): CalEvent {
  const start = new Date(b.weekStart + "T00:00:00");
  const end = addDays(start, 4); // Exclusive end = Friday → shows through Thursday
  return { id: b._id, title: b.title, start, end, allDay: true, resource: b };
}

function seatColor(b: BatchWithCount) {
  if (b.seatsLeft <= 0) return { bg: "#3f3f46", fg: "#a1a1aa", border: "#52525b" };
  if (b.seatsLeft <= 5) return { bg: "#7f1d1d", fg: "#fca5a5", border: "#991b1b" };
  if (b.seatsLeft <= 10) return { bg: "#78350f", fg: "#fcd34d", border: "#92400e" };
  return { bg: "#14532d", fg: "#86efac", border: "#166534" };
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function AdminBatchCalendar({ dark = false }: { dark?: boolean }) {
  const [batches, setBatches] = useState<BatchWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date());
  const [selectedBatch, setSelectedBatch] = useState<BatchWithCount | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ weekStart: "", title: "Batch", maxSeats: "32", notes: "" });
  const [addMsg, setAddMsg] = useState<string | null>(null);
  const [moveRegId, setMoveRegId] = useState<string | null>(null);
  const [moveToBatchId, setMoveToBatchId] = useState("");
  const [moveMsg, setMoveMsg] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editMaxSeats, setEditMaxSeats] = useState("");

  const loadBatches = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/batches");
      const d = await r.json();
      if (Array.isArray(d)) setBatches(d);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBatches(); }, [loadBatches]);

  const loadAttendees = async (batchId: string) => {
    setAttendeesLoading(true);
    setAttendees([]);
    try {
      const r = await fetch(`/api/batches/${batchId}/attendees`);
      const d = await r.json();
      if (Array.isArray(d)) setAttendees(d);
    } finally {
      setAttendeesLoading(false);
    }
  };

  const handleSelectEvent = (event: object) => {
    const e = event as CalEvent;
    setSelectedBatch(e.resource);
    setEditTitle(e.resource.title);
    setEditMaxSeats(String(e.resource.maxSeats));
    setMoveRegId(null);
    setMoveMsg(null);
    loadAttendees(e.resource._id);
  };

  const handleEventDrop = ({ event, start }: { event: object; start: Date | string }) => {
    const e = event as CalEvent;
    const newWeekStart = getMondayStr(new Date(start));
    // Optimistic update
    setBatches((prev) => prev.map((b) => b._id === e.id ? { ...b, weekStart: newWeekStart } : b));
    fetch(`/api/batches/${e.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekStart: newWeekStart }),
    }).then(() => {
      loadBatches();
      if (selectedBatch?._id === e.id)
        setSelectedBatch((p) => p ? { ...p, weekStart: newWeekStart } : null);
    });
  };

  const handleSaveEdit = async () => {
    if (!selectedBatch) return;
    await fetch(`/api/batches/${selectedBatch._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, maxSeats: parseInt(editMaxSeats) }),
    });
    loadBatches();
    setSelectedBatch((p) => p ? { ...p, title: editTitle, maxSeats: parseInt(editMaxSeats) } : null);
  };

  const handleDeleteBatch = async (id: string) => {
    if (!confirm("Delete this batch? All attendees will be unassigned.")) return;
    await fetch(`/api/batches/${id}`, { method: "DELETE" });
    setSelectedBatch(null);
    loadBatches();
  };

  const handleRemoveAttendee = async (regId: string) => {
    if (!selectedBatch) return;
    await fetch(`/api/batches/${selectedBatch._id}/attendees?regId=${regId}`, { method: "DELETE" });
    loadAttendees(selectedBatch._id);
    loadBatches();
  };

  const handleMoveAttendee = async (regId: string) => {
    if (!moveToBatchId || !selectedBatch) return;
    setMoveMsg(null);
    const r = await fetch(`/api/batches/${selectedBatch._id}/attendees`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registrationId: regId, newBatchId: moveToBatchId }),
    });
    const d = await r.json();
    if (r.ok) {
      setMoveMsg("✅ Attendee moved!");
      setMoveRegId(null);
      setMoveToBatchId("");
      loadAttendees(selectedBatch._id);
      loadBatches();
    } else {
      setMoveMsg("❌ " + (d.error ?? "Failed"));
    }
  };

  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddMsg(null);
    const r = await fetch("/api/batches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weekStart: addForm.weekStart,
        title: addForm.title,
        maxSeats: parseInt(addForm.maxSeats) || 32,
        notes: addForm.notes,
      }),
    });
    const d = await r.json();
    if (r.ok) {
      setAddMsg("✅ Batch created!");
      setAddForm({ weekStart: "", title: "Batch", maxSeats: "32", notes: "" });
      setTimeout(() => { setShowAdd(false); setAddMsg(null); }, 1200);
      loadBatches();
    } else {
      setAddMsg("❌ " + (d.error ?? "Failed — make sure the date is a Monday"));
    }
  };

  const events = batches.map(batchToEvent);

  // Theme-aware input class (replaces removed .input-field CSS)
  const inputCls = dark
    ? "w-full text-xs rounded-lg px-3 py-2 border bg-zinc-800/70 border-zinc-700/60 text-white placeholder-zinc-600 outline-none focus:border-green-600/70 focus:ring-1 focus:ring-green-600/40 transition-all"
    : "w-full text-xs rounded-lg px-3 py-2 border bg-white border-slate-300 text-slate-800 placeholder-slate-400 outline-none focus:border-green-500/70 focus:ring-1 focus:ring-green-500/40 transition-all";

  const eventStyleGetter = (event: object) => {
    const e = event as CalEvent;
    const c = seatColor(e.resource);
    return {
      style: {
        backgroundColor: c.bg, color: c.fg, borderColor: c.border,
        borderWidth: "1px", borderStyle: "solid", borderRadius: "4px",
        fontSize: "11px", padding: "1px 4px",
      },
    };
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-5">

        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex flex-wrap gap-4 text-xs">
            {[
              { color: "#166534", label: "Available" },
              { color: "#78350f", label: "≤10 seats" },
              { color: "#7f1d1d", label: "Last 5!" },
              { color: "#3f3f46", label: "Full" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: l.color }} />
                <span className={dark ? "text-zinc-400" : "text-slate-500"}>{l.label}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowAdd((p) => !p)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-xl transition-all"
          >
            <Plus size={14} /> Add Batch
          </button>
        </div>

        {/* Add batch form */}
        {showAdd && (
          <form onSubmit={handleAddBatch} className={`rounded-2xl border p-5 space-y-4 ${dark ? "bg-zinc-900/70 border-zinc-700/50" : "bg-slate-50 border-slate-200"}`}>
            <h4 className={`font-bold text-sm ${dark ? "text-white" : "text-slate-800"}`}>New Batch</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs mb-1.5 ${dark ? "text-zinc-400" : "text-slate-500"}`}>Week Start (Monday) <span className="text-red-500">*</span></label>
                <input type="date" required value={addForm.weekStart}
                  onChange={(e) => setAddForm((p) => ({ ...p, weekStart: e.target.value }))}
                  className={inputCls} />
                <p className={`text-[10px] mt-1 ${dark ? "text-zinc-600" : "text-slate-400"}`}>Must be a Monday</p>
              </div>
              <div>
                <label className={`block text-xs mb-1.5 ${dark ? "text-zinc-400" : "text-slate-500"}`}>Batch Title <span className="text-red-500">*</span></label>
                <input required value={addForm.title}
                  onChange={(e) => setAddForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Batch #5" className={inputCls} />
              </div>
              <div>
                <label className={`block text-xs mb-1.5 ${dark ? "text-zinc-400" : "text-slate-500"}`}>Max Seats</label>
                <input type="number" min="1" max="200" value={addForm.maxSeats}
                  onChange={(e) => setAddForm((p) => ({ ...p, maxSeats: e.target.value }))}
                  className={inputCls} />
              </div>
              <div>
                <label className={`block text-xs mb-1.5 ${dark ? "text-zinc-400" : "text-slate-500"}`}>Notes (optional)</label>
                <input value={addForm.notes}
                  onChange={(e) => setAddForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Internal notes" className={inputCls} />
              </div>
            </div>
            {addMsg && <p className={`text-xs ${addMsg.startsWith("✅") ? "text-green-400" : "text-red-400"}`}>{addMsg}</p>}
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-xl transition-all">
                Create Batch
              </button>
              <button type="button" onClick={() => { setShowAdd(false); setAddMsg(null); }}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${dark ? "bg-zinc-700 hover:bg-zinc-600 text-zinc-300" : "bg-slate-200 hover:bg-slate-300 text-slate-600"}`}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* react-big-calendar */}
        <div className={`${dark ? "rbc-admin-wrapper border-zinc-700/50" : "rbc-admin-light-wrapper border-slate-200"} rounded-2xl overflow-hidden border`} style={{ height: 540 }}>
          {loading ? (
            <div className={`flex items-center justify-center h-full gap-2 text-sm ${dark ? "text-zinc-600 bg-zinc-900/60" : "text-slate-400 bg-slate-50"}`}>
              <div className="w-4 h-4 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
              Loading batches...
            </div>
          ) : (
            <DnDCalendar
              localizer={localizer}
              events={events}
              view={view}
              date={date}
              onView={(v: View) => setView(v)}
              onNavigate={(d: Date) => setDate(d)}
              style={{ height: "100%" }}
              eventPropGetter={eventStyleGetter}
              onEventDrop={handleEventDrop as any}
              onSelectEvent={handleSelectEvent}
              draggableAccessor={() => true}
              resizable={false}
            />
          )}
        </div>

        {/* Selected batch management panel */}
        {selectedBatch && (
          <div className={`rounded-2xl overflow-hidden border ${dark ? "bg-zinc-900/70 border-zinc-700/50" : "bg-white border-slate-200"}`}>
            {/* Header */}
            <div className={`flex items-center justify-between px-5 py-4 border-b ${dark ? "border-zinc-800/60" : "border-slate-200"}`}>
              <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className={`font-bold text-sm bg-transparent border-b focus:border-green-500 outline-none px-0 w-48 ${dark ? "text-white border-zinc-700" : "text-slate-800 border-slate-300"}`}
                  />
                  <span className={`text-xs ${dark ? "text-zinc-600" : "text-slate-400"}`}>Max:</span>
                  <input
                    type="number" min="1" max="200"
                    value={editMaxSeats}
                    onChange={(e) => setEditMaxSeats(e.target.value)}
                    className={`w-14 text-xs bg-transparent border-b focus:border-green-500 outline-none px-0 ${dark ? "border-zinc-700 text-white" : "border-slate-300 text-slate-700"}`}
                  />
                  <button onClick={handleSaveEdit}
                    className="px-2 py-0.5 bg-green-700/50 hover:bg-green-600/60 border border-green-700/40 text-green-300 text-xs rounded-lg transition-all">
                    Save
                  </button>
                </div>
                <p className={`text-xs mt-1 ${dark ? "text-zinc-500" : "text-slate-500"}`}>
                  {(() => {
                    const mon = new Date(selectedBatch.weekStart + "T00:00:00");
                    const thu = new Date(mon); thu.setDate(thu.getDate() + 3);
                    return `${mon.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${thu.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`;
                  })()}
                  {" · "}
                  <span className={selectedBatch.seatsLeft <= 5 ? "text-red-400" : "text-green-400"}>
                    {selectedBatch.seatsLeft} / {selectedBatch.maxSeats} seats left
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => handleDeleteBatch(selectedBatch._id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-900/30 text-red-400 text-xs transition-colors">
                  <Trash2 size={11} /> Delete
                </button>
                <button onClick={() => setSelectedBatch(null)}
                  className={`p-1.5 rounded-lg transition-colors ${dark ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-400" : "bg-slate-100 hover:bg-slate-200 text-slate-500"}`}>
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Attendees */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users size={13} className={dark ? "text-zinc-500" : "text-slate-400"} />
                <h5 className={`text-xs font-bold uppercase tracking-wide ${dark ? "text-zinc-400" : "text-slate-500"}`}>
                  Attendees ({attendees.length} / {selectedBatch.maxSeats})
                </h5>
              </div>

              {attendeesLoading ? (
                <div className={`flex items-center gap-2 py-6 text-sm ${dark ? "text-zinc-600" : "text-slate-400"}`}>
                  <div className="w-3 h-3 border-2 border-green-700 border-t-transparent rounded-full animate-spin" /> Loading…
                </div>
              ) : attendees.length === 0 ? (
                <p className={`text-sm py-4 text-center ${dark ? "text-zinc-700" : "text-slate-400"}`}>No attendees registered for this batch.</p>
              ) : (
                <div className="space-y-2">
                  {moveMsg && (
                    <div className={`text-xs px-3 py-2 rounded-lg ${moveMsg.startsWith("✅") ? "bg-green-950/40 text-green-400" : "bg-red-950/40 text-red-400"}`}>
                      {moveMsg}
                    </div>
                  )}
                  {attendees.map((a) => (
                    <div key={a._id} className={`rounded-xl border p-3 ${dark ? "bg-zinc-800/50 border-zinc-700/40" : "bg-slate-50 border-slate-200"}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-green-900/40 border border-green-800/40 flex items-center justify-center text-xs font-black text-green-400 shrink-0">
                            {a.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className={`text-sm font-semibold leading-none ${dark ? "text-white" : "text-slate-800"}`}>{a.name}</p>
                            <p className={`text-xs mt-0.5 ${dark ? "text-zinc-600" : "text-slate-400"}`}>{a.village}, {a.district} · {a.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => setMoveRegId(moveRegId === a._id ? null : a._id)}
                            className="p-1.5 rounded-lg bg-blue-950/40 hover:bg-blue-900/40 border border-blue-900/30 text-blue-400 text-xs transition-colors"
                            title="Move to another batch"
                          >
                            <MoveRight size={11} />
                          </button>
                          <button
                            onClick={() => handleRemoveAttendee(a._id)}
                            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/40 border border-red-900/30 text-red-400 transition-colors"
                            title="Remove from batch"
                          >
                            <X size={11} />
                          </button>
                        </div>
                      </div>

                      {/* Inline move form */}
                      {moveRegId === a._id && (
                        <div className={`mt-2.5 pt-2.5 border-t flex items-center gap-2 ${dark ? "border-zinc-700/40" : "border-slate-200"}`}>
                          <select
                            value={moveToBatchId}
                            onChange={(e) => setMoveToBatchId(e.target.value)}
                            className={`flex-1 text-xs rounded-lg px-2 py-1.5 outline-none border ${dark ? "bg-zinc-800 border-zinc-700/60 text-white focus:border-green-600/60" : "bg-white border-slate-300 text-slate-800 focus:border-green-500"}`}
                          >
                            <option value="">Select target batch…</option>
                            {batches
                              .filter((b) => b._id !== selectedBatch._id && b.seatsLeft > 0)
                              .map((b) => (
                                <option key={b._id} value={b._id}>
                                  {b.title} — {b.weekStart} ({b.seatsLeft} seats)
                                </option>
                              ))}
                          </select>
                          <button
                            onClick={() => handleMoveAttendee(a._id)}
                            disabled={!moveToBatchId}
                            className="p-1.5 rounded-lg bg-green-700 hover:bg-green-600 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white transition-colors"
                            title="Confirm move"
                          >
                            <Check size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
}
