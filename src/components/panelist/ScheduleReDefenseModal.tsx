import React, { useState, useEffect, useMemo } from 'react';
import { DefenseSchedule } from '../../types';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { resolveScheduleGroupName, getGroupMembers } from '../../utils/studentGroups';
import { formatTimeRange, getStandardTimeOptionsWithCurrent } from '../../utils/timeFormat';
import {
  X,
  RotateCcw,
  Calendar,
  Clock,
  Building2,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Info
} from 'lucide-react';

interface ScheduleReDefenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSchedule?: DefenseSchedule | null;
}

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function rangesOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  return (
    Math.max(timeToMinutes(startA), timeToMinutes(startB)) <
    Math.min(timeToMinutes(endA), timeToMinutes(endB))
  );
}

export const ScheduleReDefenseModal: React.FC<ScheduleReDefenseModalProps> = ({
  isOpen,
  onClose,
  initialSchedule
}) => {
  const {
    currentUser,
    panelists,
    schedules,
    students,
    rooms,
    checkConflicts,
    scheduleReDefense
  } = useApp();

  const currentPanelist = useMemo(
    () =>
      panelists.find(p => p.userId === currentUser.id || p.email === currentUser.email) ||
      panelists[0],
    [panelists, currentUser]
  );

  // Strictly restricted to groups assigned to this panelist that are flagged "For Re-Defense"
  const eligibleReDefenseSchedules = useMemo(() => {
    if (!currentPanelist) return [];
    return schedules.filter(
      s =>
        s.status === 'For Re-Defense' &&
        s.panelists.some(p => p.panelistId === currentPanelist.id)
    );
  }, [schedules, currentPanelist]);

  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');
  const [date, setDate] = useState<string>('2026-10-16');
  const [startTime, setStartTime] = useState<string>('13:00');
  const [endTime, setEndTime] = useState<string>('14:30');
  const [roomId, setRoomId] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const availableRooms = useMemo(() => rooms.filter(r => r.isAvailable), [rooms]);

  useEffect(() => {
    if (!isOpen) return;
    setIsSaved(false);
    setFormError('');

    const target =
      (initialSchedule &&
        eligibleReDefenseSchedules.find(s => s.id === initialSchedule.id)) ||
      eligibleReDefenseSchedules[0] ||
      null;

    if (target) {
      setSelectedScheduleId(target.id);
      setDate(target.date || '2026-10-16');
      setStartTime(target.startTime || '13:00');
      setEndTime(target.endTime || '14:30');
      setRoomId(target.roomId || availableRooms[0]?.id || rooms[0]?.id || '');
    } else {
      setSelectedScheduleId('');
      setDate('2026-10-16');
      setStartTime('13:00');
      setEndTime('14:30');
      setRoomId(availableRooms[0]?.id || rooms[0]?.id || '');
    }
  }, [isOpen, initialSchedule, eligibleReDefenseSchedules, availableRooms, rooms]);

  const selectedSchedule = useMemo(
    () => eligibleReDefenseSchedules.find(s => s.id === selectedScheduleId) || null,
    [eligibleReDefenseSchedules, selectedScheduleId]
  );

  const handleGroupChange = (newId: string) => {
    setSelectedScheduleId(newId);
    setFormError('');
    const found = eligibleReDefenseSchedules.find(s => s.id === newId);
    if (found) {
      setDate(found.date || '2026-10-16');
      setStartTime(found.startTime || '13:00');
      setEndTime(found.endTime || '14:30');
      setRoomId(found.roomId || availableRooms[0]?.id || rooms[0]?.id || '');
    }
  };

  // Real-time privacy-safe conflict detection (never leaks co-panelist names or titles)
  const sanitizedConflicts = useMemo(() => {
    if (!selectedSchedule || !date || !startTime || !endTime || !roomId) return [];
    if (timeToMinutes(endTime) <= timeToMinutes(startTime)) return [];

    const rawWarnings = checkConflicts({
      id: selectedSchedule.id,
      studentId: selectedSchedule.studentId,
      roomId,
      date,
      startTime,
      endTime,
      panelistIds: selectedSchedule.panelists.map(p => p.panelistId)
    });

    const messages: string[] = [];
    const seenTypes = new Set<string>();

    for (const w of rawWarnings) {
      if (w.type === 'room' && !seenTypes.has('room')) {
        seenTypes.add('room');
        messages.push(w.message);
      } else if (w.type === 'student' && !seenTypes.has('student')) {
        seenTypes.add('student');
        messages.push(w.message);
      } else if (w.type === 'panelist' && !seenTypes.has('panelist')) {
        seenTypes.add('panelist');
        messages.push(
          `Panel availability conflict: An assigned examination panel member already has a defense session during ${formatTimeRange(
            startTime,
            endTime
          )} on ${date}.`
        );
      }
    }

    return messages;
  }, [selectedSchedule, date, startTime, endTime, roomId, checkConflicts]);

  if (!isOpen) return null;

  const selectedGroupName = selectedSchedule
    ? resolveScheduleGroupName(selectedSchedule, students)
    : '';
  const selectedMembers = selectedSchedule
    ? getGroupMembers(students, selectedGroupName, selectedSchedule.program)
    : [];
  const myRole =
    selectedSchedule?.panelists.find(p => p.panelistId === currentPanelist?.id)?.role ||
    'Panelist';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedSchedule) {
      setFormError('Only assigned groups flagged For Re-Defense can be scheduled.');
      return;
    }

    if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
      setFormError('End time must be later than start time.');
      return;
    }

    if (sanitizedConflicts.length > 0) {
      setFormError('Please resolve the room or time slot conflict before saving the re-defense schedule.');
      return;
    }

    const result = scheduleReDefense(selectedSchedule.id, date, startTime, endTime, roomId);
    if (result.success) {
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer flex items-center gap-1 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-orange-800 bg-orange-100 border border-orange-300 px-2 py-0.5 rounded">
                  <RotateCcw className="w-3 h-3" />
                  Re-Defense Only
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                Schedule Re-Defense Session
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSaved ? (
          <div className="py-10 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-900">Re-Defense Scheduled</h4>
            <p className="text-xs text-slate-500 mt-1">
              Scheduled <strong>{selectedGroupName}</strong> on <strong>{date}</strong> (
              {formatTimeRange(startTime, endTime)}).
            </p>
          </div>
        ) : eligibleReDefenseSchedules.length === 0 ? (
          <div className="py-8 space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block">No Assigned Re-Defense Groups Found</strong>
                <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                  Panelists can only create or set defense schedules for assigned groups whose
                  verdict is <strong>For Re-Defense</strong>. Regular defense schedules are managed
                  by the Capstone Coordinator.
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
            <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200 text-orange-900 flex items-start gap-2">
              <RotateCcw className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <span>
                Restricted to assigned groups flagged <strong>For Re-Defense</strong>. Existing
                examination panel assignments are preserved automatically.
              </span>
            </div>

            {/* Select Eligible Re-Defense Group */}
            <div>
              <label className="block font-bold text-slate-800 mb-1.5">
                Assigned Re-Defense Group *
              </label>
              <select
                required
                value={selectedScheduleId}
                onChange={e => handleGroupChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005696]"
              >
                {eligibleReDefenseSchedules.map(sch => {
                  const grp = resolveScheduleGroupName(sch, students);
                  return (
                    <option key={sch.id} value={sch.id}>
                      {grp} — {sch.program} ({sch.defenseStage})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Selected Group Privacy-Safe Details (No Endorsed Title, No Co-Panelists) */}
            {selectedSchedule && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[#005696] uppercase">{selectedGroupName}</span>
                  <StatusBadge status={selectedSchedule.status} size="sm" />
                </div>
                <div className="grid grid-cols-3 gap-2 font-mono-numbers pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Program</span>
                    <strong className="text-slate-900">{selectedSchedule.program}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Stage</span>
                    <strong className="text-slate-900">{selectedSchedule.defenseStage}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Your Role</span>
                    <strong className="text-[#005696]">{myRole}</strong>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200/80 text-slate-600">
                  <span className="font-semibold text-slate-700">Members: </span>
                  {selectedMembers.length > 0
                    ? selectedMembers.map(m => m.name).join(', ')
                    : selectedSchedule.studentName}
                </div>
              </div>
            )}

            {/* Date & Standard 12-Hour Time Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="flex items-center gap-1 font-bold text-slate-800 mb-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#005696]" />
                  <span>Re-Defense Date *</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => {
                    setDate(e.target.value);
                    setFormError('');
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono-numbers focus:outline-none focus:ring-2 focus:ring-[#005696]"
                />
              </div>

              <div>
                <label className="flex items-center gap-1 font-bold text-slate-800 mb-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Start Time *</span>
                </label>
                <select
                  required
                  value={startTime}
                  onChange={e => {
                    setStartTime(e.target.value);
                    setFormError('');
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono-numbers focus:outline-none focus:ring-2 focus:ring-[#005696]"
                >
                  {getStandardTimeOptionsWithCurrent(startTime).map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-1 font-bold text-slate-800 mb-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>End Time *</span>
                </label>
                <select
                  required
                  value={endTime}
                  onChange={e => {
                    setEndTime(e.target.value);
                    setFormError('');
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono-numbers focus:outline-none focus:ring-2 focus:ring-[#005696]"
                >
                  {getStandardTimeOptionsWithCurrent(endTime).map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Defense Room Selection with Occupancy Indicator */}
            <div>
              <label className="flex items-center gap-1 font-bold text-slate-800 mb-1.5">
                <Building2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Defense Room *</span>
              </label>
              <select
                required
                value={roomId}
                onChange={e => {
                  setRoomId(e.target.value);
                  setFormError('');
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005696]"
              >
                {(availableRooms.length > 0 ? availableRooms : rooms).map(r => {
                  const isOccupiedAtSlot =
                    Boolean(date && startTime && endTime) &&
                    timeToMinutes(endTime) > timeToMinutes(startTime) &&
                    schedules.some(
                      s =>
                        s.status !== 'Cancelled' &&
                        s.id !== selectedSchedule?.id &&
                        s.roomId === r.id &&
                        s.date === date &&
                        rangesOverlap(s.startTime, s.endTime, startTime, endTime)
                    );

                  return (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.location}){isOccupiedAtSlot ? ' — Occupied at selected time' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {timeToMinutes(endTime) <= timeToMinutes(startTime) && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-medium">End time must be after start time.</span>
              </div>
            )}

            {sanitizedConflicts.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Schedule Conflict Detected</span>
                </div>
                {sanitizedConflicts.map((msg, idx) => (
                  <p key={idx} className="pl-5 text-[11px] text-amber-900">
                    {msg}
                  </p>
                ))}
              </div>
            )}

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-medium">
                {formError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  timeToMinutes(endTime) <= timeToMinutes(startTime) ||
                  sanitizedConflicts.length > 0
                }
                className="px-4 py-2 font-bold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Save Re-Defense Schedule</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
