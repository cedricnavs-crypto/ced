import React, { useState, useMemo } from 'react';
import { DefenseSchedule } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  formatStandardTime,
  formatTimeRange,
  getStandardTimeOptionsWithCurrent
} from '../../utils/timeFormat';
import { X, Calendar, Clock, MapPin, AlertTriangle, CheckCircle2, ArrowLeft, Check, Monitor } from 'lucide-react';

interface RescheduleCancelModalProps {
  schedule: DefenseSchedule | null;
  mode: 'reschedule' | 'cancel' | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RescheduleCancelModal: React.FC<RescheduleCancelModalProps> = ({
  schedule,
  mode,
  isOpen,
  onClose
}) => {
  const { rooms, schedules, rescheduleDefense, cancelSchedule } = useApp();

  const [newDate, setNewDate] = useState(schedule?.date || '2026-10-12');
  const [newStartTime, setNewStartTime] = useState(schedule?.startTime || '13:30');
  const [newEndTime, setNewEndTime] = useState(schedule?.endTime || '15:00');
  const [newRoomId, setNewRoomId] = useState(schedule?.roomId || rooms[0]?.id || '');
  const [reason, setReason] = useState('Faculty examination committee requested adjustment.');
  const [isSuccess, setIsSuccess] = useState(false);
  const [autoAssignToast, setAutoAssignToast] = useState<string | null>(null);

  // Compute live availability and occupancy for every room during newDate & newStartTime/newEndTime
  const roomStatusMap = useMemo(() => {
    const map: Record<string, { isOccupied: boolean; occupant?: string; timeslot?: string }> = {};
    rooms.forEach(r => {
      const conflict = schedules.find(s =>
        s.roomId === r.id &&
        s.date === newDate &&
        s.status !== 'Cancelled' &&
        s.id !== schedule?.id &&
        s.startTime < newEndTime &&
        s.endTime > newStartTime
      );
      if (conflict) {
        map[r.id] = {
          isOccupied: true,
          occupant: conflict.studentName,
          timeslot: formatTimeRange(conflict.startTime, conflict.endTime)
        };
      } else {
        map[r.id] = { isOccupied: false };
      }
    });
    return map;
  }, [rooms, schedules, newDate, newStartTime, newEndTime, schedule]);

  const handleAutoSuggestRoom = () => {
    const freeRoom = rooms.find(r => r.isAvailable && !roomStatusMap[r.id]?.isOccupied) ||
                     rooms.find(r => !roomStatusMap[r.id]?.isOccupied);
    if (freeRoom) {
      setNewRoomId(freeRoom.id);
      setAutoAssignToast(
        `Assigned ${freeRoom.name} — Free from ${formatStandardTime(newStartTime)} to ${formatStandardTime(newEndTime)}!`
      );
      setTimeout(() => setAutoAssignToast(null), 3500);
    } else {
      setAutoAssignToast('⚠️ All campus rooms have conflicts or are in maintenance for this timeslot.');
      setTimeout(() => setAutoAssignToast(null), 4000);
    }
  };

  const selectedRoomObj = rooms.find(r => r.id === newRoomId);
  const selectedRoomStatus = selectedRoomObj ? roomStatusMap[selectedRoomObj.id] : null;

  if (!isOpen || !schedule || !mode) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'reschedule') {
      rescheduleDefense(schedule.id, newDate, newStartTime, newEndTime, newRoomId, reason);
    } else {
      cancelSchedule(schedule.id, reason);
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {mode === 'reschedule' ? 'Reschedule Defense Hearing' : 'Cancel Defense Schedule'}
              </h3>
              <p className="text-xs text-slate-500">
                Candidate: {schedule.studentName} ({schedule.program})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-900">
              {mode === 'reschedule' ? 'Defense Successfully Rescheduled!' : 'Defense Cancelled'}
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Cancellation/Reschedule notices dispatched to participants.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Timetable</span>
              <p className="font-bold text-slate-900 mt-0.5">{schedule.capstoneTitle}</p>
              <div className="flex items-center gap-3 text-slate-600 font-mono-numbers mt-1 text-[11px]">
                <span>{schedule.date}</span>
                <span>·</span>
                <span>{formatTimeRange(schedule.startTime, schedule.endTime)}</span>
                <span>·</span>
                <span>{schedule.roomName}</span>
              </div>
            </div>

            {mode === 'reschedule' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">New Date *</label>
                    <input
                      type="date"
                      required
                      value={newDate}
                      onChange={e => setNewDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005696] font-mono-numbers"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">New Start Time *</label>
                    <select
                      required
                      value={newStartTime}
                      onChange={e => setNewStartTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#005696] font-mono-numbers"
                    >
                      {getStandardTimeOptionsWithCurrent(newStartTime).map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">New End Time *</label>
                    <select
                      required
                      value={newEndTime}
                      onChange={e => setNewEndTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#005696] font-mono-numbers"
                    >
                      {getStandardTimeOptionsWithCurrent(newEndTime).map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-semibold text-slate-700">New Defense Room *</label>
                    <button
                      type="button"
                      onClick={handleAutoSuggestRoom}
                      className="px-2 py-0.5 text-[11px] font-bold text-[#005696] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                      title="Automatically find and assign a clash-free room"
                    >
                      <Check className="w-3 h-3 text-[#005696]" />
                      <span>Auto-Suggest Free Room</span>
                    </button>
                  </div>

                  {autoAssignToast && (
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs font-semibold text-blue-900 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#005696] shrink-0" />
                      <span>{autoAssignToast}</span>
                    </div>
                  )}

                  <select
                    value={newRoomId}
                    onChange={e => setNewRoomId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005696] bg-white font-medium"
                  >
                    {rooms.map(r => {
                      const status = roomStatusMap[r.id];
                      let statusPrefix = '🟢 [Available]';
                      if (status?.isOccupied) {
                        statusPrefix = `🔴 [Occupied: ${status.occupant} (${status.timeslot})]`;
                      } else if (!r.isAvailable) {
                        statusPrefix = '⚠️ [Maintenance / Unavailable]';
                      }

                      return (
                        <option key={r.id} value={r.id}>
                          {statusPrefix} {r.name}
                        </option>
                      );
                    })}
                  </select>

                  {/* Selected room overview */}
                  {selectedRoomObj && (
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-[#005696]" />
                          <span>{selectedRoomObj.name}</span>
                        </div>

                        {selectedRoomStatus?.isOccupied ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Occupied by {selectedRoomStatus.occupant}
                          </span>
                        ) : !selectedRoomObj.isAvailable ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            Under Maintenance
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Available
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  Are you sure you want to cancel this defense? All assigned panelists and the student will be notified immediately.
                </span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Reason / Justification *
              </label>
              <textarea
                required
                rows={2}
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Reason for rescheduling or cancellation..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005696]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                className={`px-4 py-2 text-xs font-bold text-white rounded-lg shadow-sm cursor-pointer ${
                  mode === 'reschedule'
                    ? 'bg-[#005696] hover:bg-[#00477d]'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {mode === 'reschedule' ? 'Confirm Reschedule' : 'Confirm Cancellation'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
