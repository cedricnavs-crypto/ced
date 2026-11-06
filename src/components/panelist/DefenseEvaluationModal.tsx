import React, { useState, useEffect, useMemo } from 'react';
import { DefenseSchedule } from '../../types';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { resolveScheduleGroupName, getGroupMembers } from '../../utils/studentGroups';
import { formatTimeRange, getStandardTimeOptionsWithCurrent } from '../../utils/timeFormat';
import {
  X,
  CheckCircle2,
  ArrowLeft,
  RotateCcw,
  Calendar,
  Clock,
  Building2,
  AlertTriangle
} from 'lucide-react';

interface DefenseEvaluationModalProps {
  schedule: DefenseSchedule | null;
  isOpen: boolean;
  onClose: () => void;
}

type FinalVerdictOption = 'Passed' | 'Passed with Revisions' | 'For Re-Defense';

const VERDICT_OPTIONS: {
  value: FinalVerdictOption;
  label: string;
  description: string;
}[] = [
  {
    value: 'Passed',
    label: 'Passed (Completed)',
    description: 'Group passed the oral defense without major revisions.'
  },
  {
    value: 'Passed with Revisions',
    label: 'Passed with Revisions (Completed)',
    description: 'Group passed the oral defense subject to required revisions.'
  },
  {
    value: 'For Re-Defense',
    label: 'For Re-Defense',
    description: 'Group is required to undergo another oral defense session.'
  }
];

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export const DefenseEvaluationModal: React.FC<DefenseEvaluationModalProps> = ({
  schedule,
  isOpen,
  onClose
}) => {
  const {
    updateSchedule,
    scheduleReDefense,
    checkConflicts,
    currentUser,
    panelists,
    students,
    rooms
  } = useApp();

  const [verdict, setVerdict] = useState<FinalVerdictOption>('Passed');
  const [setReDefenseSlotNow, setSetReDefenseSlotNow] = useState<boolean>(false);
  const [reDefDate, setReDefDate] = useState<string>('2026-10-16');
  const [reDefStart, setReDefStart] = useState<string>('13:00');
  const [reDefEnd, setReDefEnd] = useState<string>('14:30');
  const [reDefRoomId, setReDefRoomId] = useState<string>('');
  const [slotError, setSlotError] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);

  const availableRooms = useMemo(() => rooms.filter(r => r.isAvailable), [rooms]);

  useEffect(() => {
    setSlotError('');
    setSetReDefenseSlotNow(false);
    if (schedule?.status === 'For Re-Defense') {
      setVerdict('For Re-Defense');
    } else {
      setVerdict('Passed');
    }
    if (schedule) {
      setReDefDate(schedule.date || '2026-10-16');
      setReDefStart(schedule.startTime || '13:00');
      setReDefEnd(schedule.endTime || '14:30');
      setReDefRoomId(schedule.roomId || availableRooms[0]?.id || rooms[0]?.id || '');
    }
  }, [schedule, availableRooms, rooms]);

  const sanitizedConflicts = useMemo(() => {
    if (!schedule || verdict !== 'For Re-Defense' || !setReDefenseSlotNow) return [];
    if (!reDefDate || !reDefStart || !reDefEnd || !reDefRoomId) return [];
    if (timeToMinutes(reDefEnd) <= timeToMinutes(reDefStart)) return [];

    const rawWarnings = checkConflicts({
      id: schedule.id,
      studentId: schedule.studentId,
      roomId: reDefRoomId,
      date: reDefDate,
      startTime: reDefStart,
      endTime: reDefEnd,
      panelistIds: schedule.panelists.map(p => p.panelistId)
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
          `Panel availability conflict: An assigned panel member already has a defense during ${formatTimeRange(
            reDefStart,
            reDefEnd
          )} on ${reDefDate}.`
        );
      }
    }
    return messages;
  }, [
    schedule,
    verdict,
    setReDefenseSlotNow,
    reDefDate,
    reDefStart,
    reDefEnd,
    reDefRoomId,
    checkConflicts
  ]);

  if (!isOpen || !schedule) return null;

  const panelist = panelists.find(p => p.userId === currentUser.id) || panelists[0];
  const myRole =
    schedule.panelists.find(p => p.panelistId === panelist?.id)?.role || 'Panelist';
  const groupName = resolveScheduleGroupName(schedule, students);
  const members = getGroupMembers(students, groupName, schedule.program);

  const handleSaveVerdict = (e: React.FormEvent) => {
    e.preventDefault();
    setSlotError('');

    if (verdict === 'For Re-Defense' && setReDefenseSlotNow) {
      if (timeToMinutes(reDefEnd) <= timeToMinutes(reDefStart)) {
        setSlotError('Re-defense end time must be after start time.');
        return;
      }
      if (sanitizedConflicts.length > 0) {
        setSlotError('Please resolve the schedule conflict before saving.');
        return;
      }
      scheduleReDefense(schedule.id, reDefDate, reDefStart, reDefEnd, reDefRoomId);
    } else {
      const nextStatus = verdict === 'For Re-Defense' ? 'For Re-Defense' : 'Completed';
      updateSchedule(schedule.id, {
        verdictScore: undefined,
        remarks: '',
        status: nextStatus
      });
    }

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 my-8">
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
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#005696] bg-blue-50 px-2 py-0.5 rounded font-mono-numbers">
                  {schedule.defenseStage}
                </span>
                <StatusBadge status={schedule.status} size="sm" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                Final Verdict — {groupName}
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
            <h4 className="text-base font-bold text-slate-900">Final Verdict Recorded</h4>
            <p className="text-xs text-slate-500 mt-1">
              Recorded <strong>{verdict}</strong> for {groupName}
              {verdict === 'For Re-Defense' && setReDefenseSlotNow
                ? ` and scheduled re-defense on ${reDefDate} (${formatTimeRange(reDefStart, reDefEnd)}).`
                : '.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSaveVerdict} className="space-y-4 pt-4 text-xs">
            {schedule.status === 'For Re-Defense' && (
              <div className="p-3 rounded-xl bg-orange-50 border border-orange-300 text-orange-900 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-orange-600 shrink-0" />
                <span className="font-semibold">
                  Note: This group is currently flagged For Re-Defense.
                </span>
              </div>
            )}

            {/* Group & Schedule Info (No Endorsed Title, No Co-Panelists) */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono-numbers">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Group</span>
                  <strong className="text-slate-900">{groupName}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Program</span>
                  <strong className="text-slate-900">{schedule.program}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Schedule</span>
                  <strong className="text-slate-900">
                    {schedule.date} ({formatTimeRange(schedule.startTime, schedule.endTime)})
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Your Role</span>
                  <strong className="text-[#005696]">{myRole}</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 text-slate-600">
                <span className="font-semibold text-slate-700">Members: </span>
                {members.length > 0 ? members.map(m => m.name).join(', ') : schedule.studentName}
              </div>
            </div>

            {/* Final Verdict Selection Only */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-800">Final Verdict</label>
              <div className="space-y-2">
                {VERDICT_OPTIONS.map(opt => {
                  const selected = verdict === opt.value;
                  const isReDef = opt.value === 'For Re-Defense';
                  return (
                    <label
                      key={opt.value}
                      className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                        selected
                          ? isReDef
                            ? 'bg-orange-50/70 border-orange-400 text-orange-950'
                            : 'bg-blue-50/70 border-[#005696] text-slate-900'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="finalVerdict"
                        value={opt.value}
                        checked={selected}
                        onChange={() => setVerdict(opt.value)}
                        className="mt-0.5 accent-[#005696]"
                      />
                      <div>
                        <span className="font-bold block">{opt.label}</span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {opt.description}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Optional Re-Defense Scheduling Right When Marking For Re-Defense */}
            {verdict === 'For Re-Defense' && (
              <div className="p-3.5 rounded-xl bg-orange-50/60 border border-orange-300 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-orange-950">
                  <input
                    type="checkbox"
                    checked={setReDefenseSlotNow}
                    onChange={e => {
                      setSetReDefenseSlotNow(e.target.checked);
                      setSlotError('');
                    }}
                    className="accent-orange-600 rounded"
                  />
                  <span>Schedule Re-Defense Date, Time &amp; Room Now</span>
                </label>

                {setReDefenseSlotNow && (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="flex items-center gap-1 font-semibold text-slate-700 mb-1">
                          <Calendar className="w-3 h-3 text-orange-600" />
                          <span>Date *</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={reDefDate}
                          onChange={e => setReDefDate(e.target.value)}
                          className="w-full px-2.5 py-2 rounded-lg border border-slate-300 bg-white font-mono-numbers"
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-1 font-semibold text-slate-700 mb-1">
                          <Clock className="w-3 h-3 text-orange-600" />
                          <span>Start Time *</span>
                        </label>
                        <select
                          required
                          value={reDefStart}
                          onChange={e => setReDefStart(e.target.value)}
                          className="w-full px-2.5 py-2 rounded-lg border border-slate-300 bg-white font-mono-numbers"
                        >
                          {getStandardTimeOptionsWithCurrent(reDefStart).map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="flex items-center gap-1 font-semibold text-slate-700 mb-1">
                          <Clock className="w-3 h-3 text-orange-600" />
                          <span>End Time *</span>
                        </label>
                        <select
                          required
                          value={reDefEnd}
                          onChange={e => setReDefEnd(e.target.value)}
                          className="w-full px-2.5 py-2 rounded-lg border border-slate-300 bg-white font-mono-numbers"
                        >
                          {getStandardTimeOptionsWithCurrent(reDefEnd).map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-1 font-semibold text-slate-700 mb-1">
                        <Building2 className="w-3 h-3 text-orange-600" />
                        <span>Defense Room *</span>
                      </label>
                      <select
                        required
                        value={reDefRoomId}
                        onChange={e => setReDefRoomId(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-lg border border-slate-300 bg-white"
                      >
                        {(availableRooms.length > 0 ? availableRooms : rooms).map(r => (
                          <option key={r.id} value={r.id}>
                            {r.name} ({r.location})
                          </option>
                        ))}
                      </select>
                    </div>

                    {sanitizedConflicts.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-amber-100/80 border border-amber-300 text-amber-950 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          <span>Conflict Detected</span>
                        </div>
                        {sanitizedConflicts.map((msg, i) => (
                          <p key={i} className="pl-5 text-[11px]">
                            {msg}
                          </p>
                        ))}
                      </div>
                    )}

                    {slotError && (
                      <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-medium">
                        {slotError}
                      </div>
                    )}
                  </div>
                )}
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
                  verdict === 'For Re-Defense' &&
                  setReDefenseSlotNow &&
                  (timeToMinutes(reDefEnd) <= timeToMinutes(reDefStart) ||
                    sanitizedConflicts.length > 0)
                }
                className="px-4 py-2 font-bold text-white bg-[#005696] hover:bg-[#004478] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg cursor-pointer"
              >
                {verdict === 'For Re-Defense' && setReDefenseSlotNow
                  ? 'Save Verdict & Re-Defense Schedule'
                  : 'Save Final Verdict'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
