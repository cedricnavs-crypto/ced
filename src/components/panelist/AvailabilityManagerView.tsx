import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AvailabilitySlot } from '../../types';
import { BackButton } from '../common/BackButton';
import { formatTimeRange, getStandardTimeOptionsWithCurrent } from '../../utils/timeFormat';
import {
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Save,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';

export const AvailabilityManagerView: React.FC = () => {
  const {
    currentUser,
    panelists,
    availability,
    updateAvailabilitySlot,
    addAvailabilitySlot,
    deleteAvailabilitySlot,
    schedules
  } = useApp();

  const panelist = panelists.find(p => p.userId === currentUser.id) || panelists[0];
  const mySlots = availability.filter(a => a.panelistId === panelist.id);

  const [newDay, setNewDay] = useState<AvailabilitySlot['dayOfWeek']>('Monday');
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('12:00');
  const [newStatus, setNewStatus] = useState(true);
  const [newNotes, setNewNotes] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const days: AvailabilitySlot['dayOfWeek'][] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];

  // Conflict evaluation: check if any scheduled defense on this panelist overlaps with an unavailable block
  const mySchedules = schedules.filter(
    s => s.status !== 'Cancelled' && s.panelists.some(p => p.panelistId === panelist.id)
  );

  const conflictsFound: { defenseStage: string; student: string; date: string; time: string; reason: string }[] = [];

  mySchedules.forEach(sched => {
    const dayOfWeek = new Date(sched.date).toLocaleDateString('en-US', { weekday: 'long' });
    const blockedSlot = mySlots.find(s => s.dayOfWeek === dayOfWeek && !s.isAvailable);
    if (blockedSlot) {
      conflictsFound.push({
        defenseStage: sched.defenseStage,
        student: sched.studentName,
        date: sched.date,
        time: formatTimeRange(sched.startTime, sched.endTime),
        reason: blockedSlot.notes || `Marked unavailable on ${dayOfWeek}s`
      });
    }
  });

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    addAvailabilitySlot({
      panelistId: panelist.id,
      dayOfWeek: newDay,
      startTime: newStart,
      endTime: newEnd,
      isAvailable: newStatus,
      notes: newNotes
    });
    setNewNotes('');
    setFeedback('Availability slot added successfully!');
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleToggleSlot = (slot: AvailabilitySlot) => {
    updateAvailabilitySlot({
      ...slot,
      isAvailable: !slot.isAvailable
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <BackButton label="Back to Dashboard" variant="subtle" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#005696]" />
              <h1 className="text-xl font-bold text-slate-900">Faculty Panelist Availability Manager</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Specify your teaching-free blocks and preferred defense windows. The Capstone Admin uses this to prevent scheduling conflicts.
            </p>
          </div>

          <div className="text-xs text-slate-600 font-mono-numbers p-2 bg-slate-50 rounded-lg border border-slate-200">
            Configured Blocks: <strong className="text-slate-900">{mySlots.length}</strong>
          </div>
        </div>

        {/* Live Conflict Alert Banner */}
        {conflictsFound.length > 0 ? (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Identified Scheduling Conflict ({conflictsFound.length})</span>
            </div>
            <p className="text-[11px] text-amber-800">
              A scheduled defense currently coincides with your marked busy/unavailable time:
            </p>
            <div className="space-y-1 pl-4">
              {conflictsFound.map((c, i) => (
                <div key={i} className="text-xs">
                  • <strong>{c.student}</strong> on {c.date} ({c.time}) — Conflict: {c.reason}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>All currently assigned defense sessions align with your available windows. No conflicts detected.</span>
          </div>
        )}
      </div>

      {/* Grid: Day-by-Day Matrix + Add Slot Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Weekly Grid */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Weekly Defense Availability Matrix
            </h2>
            <span className="text-[11px] text-slate-400">Click button to toggle status</span>
          </div>

          <div className="space-y-3">
            {days.map(day => {
              const daySlots = mySlots.filter(s => s.dayOfWeek === day);

              return (
                <div
                  key={day}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{day}</span>
                    <span className="text-[10px] text-slate-400 font-mono-numbers">
                      {daySlots.length} defined time blocks
                    </span>
                  </div>

                  {daySlots.length === 0 ? (
                    <div className="text-[11px] text-slate-400 italic">
                      No availability specified for {day} (Admin will assume standard faculty hours).
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {daySlots.map(slot => (
                        <div
                          key={slot.id}
                          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                            slot.isAvailable
                              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                              : 'bg-rose-50/70 border-rose-200 text-rose-950'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 font-bold font-mono-numbers">
                              {slot.isAvailable ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              )}
                              <span>
                                {formatTimeRange(slot.startTime, slot.endTime)}
                              </span>
                              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-white/80">
                                {slot.isAvailable ? 'Available' : 'Busy'}
                              </span>
                            </div>
                            {slot.notes && (
                              <p className="text-[10px] text-slate-600 truncate max-w-[180px]">
                                {slot.notes}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleToggleSlot(slot)}
                              className="px-2 py-0.5 text-[10px] font-semibold rounded bg-white hover:bg-slate-100 text-slate-700 shadow-2xs"
                              title="Toggle available / busy"
                            >
                              Toggle
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteAvailabilitySlot(slot.id)}
                              className="p-1 text-slate-400 hover:text-rose-600"
                              title="Delete slot"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Add Custom Availability Window */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#005696]" />
              Add Availability Block
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Set available or unavailable hours for scheduling.
            </p>
          </div>

          {feedback && (
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          <form onSubmit={handleAddSlot} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Day of Week</label>
              <select
                value={newDay}
                onChange={e => setNewDay(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005696] bg-white font-medium"
              >
                {days.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
                <select
                  required
                  value={newStart}
                  onChange={e => setNewStart(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#005696] font-mono-numbers"
                >
                  {getStandardTimeOptionsWithCurrent(newStart).map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">End Time</label>
                <select
                  required
                  value={newEnd}
                  onChange={e => setNewEnd(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#005696] font-mono-numbers"
                >
                  {getStandardTimeOptionsWithCurrent(newEnd).map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status Condition</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewStatus(true)}
                  className={`py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                    newStatus
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ✓ Available
                </button>
                <button
                  type="button"
                  onClick={() => setNewStatus(false)}
                  className={`py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                    !newStatus
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ✕ Busy / Locked
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Reason / Internal Note (Optional)
              </label>
              <input
                type="text"
                value={newNotes}
                onChange={e => setNewNotes(e.target.value)}
                placeholder="e.g. Faculty Senate, Thesis Mentorship, Off-Campus"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005696]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-xs font-bold text-white bg-[#005696] hover:bg-[#00477d] rounded-lg shadow-sm transition-colors"
            >
              Add Availability Rule
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
