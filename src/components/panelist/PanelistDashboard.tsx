import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { DefenseEvaluationModal } from './DefenseEvaluationModal';
import { ScheduleReDefenseModal } from './ScheduleReDefenseModal';
import { DefenseSchedule } from '../../types';
import { resolveScheduleGroupName, getGroupMembers } from '../../utils/studentGroups';
import { formatTimeRange } from '../../utils/timeFormat';
import {
  Calendar,
  CalendarDays,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Users,
  RotateCcw
} from 'lucide-react';

export const PanelistDashboard: React.FC = () => {
  const {
    currentUser,
    panelists,
    students,
    schedules,
    setActiveTab,
    availability
  } = useApp();

  const [selectedSchedule, setSelectedSchedule] = useState<DefenseSchedule | null>(null);
  const [isEvalOpen, setIsEvalOpen] = useState(false);
  const [reDefenseTarget, setReDefenseTarget] = useState<DefenseSchedule | null>(null);
  const [isReDefenseModalOpen, setIsReDefenseModalOpen] = useState(false);

  const panelist = panelists.find(p => p.userId === currentUser.id) || panelists[0];

  const myAssignedSchedules = schedules.filter(s =>
    s.panelists.some(p => p.panelistId === panelist.id)
  );

  const upcomingDefenses = myAssignedSchedules.filter(
    s =>
      s.status === 'Scheduled' ||
      s.status === 'Upcoming' ||
      s.status === 'Ongoing' ||
      s.status === 'Rescheduled' ||
      s.status === 'For Re-Defense'
  );
  const completedDefenses = myAssignedSchedules.filter(s => s.status === 'Completed');

  // Availability conflict warnings
  const potentialConflicts: string[] = [];
  upcomingDefenses.forEach(def => {
    const dayName = new Date(def.date).toLocaleDateString('en-US', { weekday: 'long' });
    const unavailSlot = availability.find(
      a => a.panelistId === panelist.id && a.dayOfWeek === dayName && !a.isAvailable
    );
    if (unavailSlot) {
      const grpName = resolveScheduleGroupName(def, students);
      potentialConflicts.push(
        `You are assigned to ${grpName} on ${def.date} (${formatTimeRange(def.startTime, def.endTime)}), which overlaps with an unavailable block on ${dayName}s.`
      );
    }
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#002847] via-[#004478] to-[#005696] text-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome, {panelist.name}</h1>
            <p className="text-xs text-blue-100 mt-1">
              Examination Panel Board · {panelist.department} ({panelist.employeeId})
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('Defense Schedule')}
              className="px-4 py-2 text-xs font-bold text-slate-900 bg-[#FED100] hover:bg-[#e6bd00] rounded-xl cursor-pointer flex items-center gap-1.5"
            >
              <CalendarDays className="w-4 h-4" />
              <span>Defense Schedule</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setReDefenseTarget(null);
                setIsReDefenseModalOpen(true);
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Schedule Re-Defense</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('Availability')}
              className="px-4 py-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl cursor-pointer flex items-center gap-1.5"
            >
              <Clock className="w-4 h-4" />
              <span>Availability</span>
            </button>
          </div>
        </div>
      </div>

      {potentialConflicts.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Availability Overlap Notice</span>
          </div>
          {potentialConflicts.map((c, i) => (
            <p key={i} className="pl-6">
              {c}
            </p>
          ))}
        </div>
      )}

      {/* 3 Required KPI Cards: Total Assigned Defense, Upcoming Defense, Completed Defense */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Assigned Defense
            </span>
            <span className="text-3xl font-extrabold text-[#005696] font-mono-numbers mt-1 block">
              {myAssignedSchedules.length}
            </span>
            <span className="text-xs text-slate-500 mt-1 block">
              Load limit: {panelist.maxDefenses ?? 8} defenses
            </span>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-[#005696]">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Upcoming Defense
            </span>
            <span className="text-3xl font-extrabold text-amber-600 font-mono-numbers mt-1 block">
              {upcomingDefenses.length}
            </span>
            <span className="text-xs text-slate-500 mt-1 block">Scheduled oral hearings</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Completed Defense
            </span>
            <span className="text-3xl font-extrabold text-emerald-600 font-mono-numbers mt-1 block">
              {completedDefenses.length}
            </span>
            <span className="text-xs text-slate-500 mt-1 block">Final verdicts recorded</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Brief Upcoming Defense Details (No Endorsed Titles, No Co-Panelists) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Brief Upcoming Defense Details</h2>
            <p className="text-xs text-slate-500">
              Assigned group schedules, venue, and your individual panel role.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('Assigned Defense')}
            className="text-xs font-semibold text-[#005696] hover:underline cursor-pointer"
          >
            View All Assigned →
          </button>
        </div>

        {upcomingDefenses.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400">
            No upcoming defense assignments scheduled.
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingDefenses.map(schedule => {
              const grpName = resolveScheduleGroupName(schedule, students);
              const members = getGroupMembers(students, grpName, schedule.program);
              const myRole =
                schedule.panelists.find(p => p.panelistId === panelist.id)?.role || 'Panelist';
              const isReDefense = schedule.status === 'For Re-Defense';

              return (
                <div
                  key={schedule.id}
                  className={`p-4 rounded-xl border transition-colors space-y-3 ${
                    isReDefense
                      ? 'border-orange-300 bg-orange-50/30'
                      : 'border-slate-200 hover:border-[#005696] bg-white'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-[#005696] uppercase">
                        {grpName}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono-numbers">
                        {schedule.program} · {schedule.defenseStage}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#005696]">
                        Your Role: {myRole}
                      </span>
                      {isReDefense && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-300">
                          <RotateCcw className="w-3 h-3" />
                          For Re-Defense
                        </span>
                      )}
                    </div>
                    <StatusBadge status={schedule.status} size="sm" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono-numbers bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-[#005696]" />
                      <span>
                        Date: <strong className="text-slate-900">{schedule.date}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>
                        Time:{' '}
                        <strong className="text-slate-900">
                          {formatTimeRange(schedule.startTime, schedule.endTime)}
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-rose-600" />
                      <span>
                        Room: <strong className="text-slate-900">{schedule.roomName}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
                    <div className="text-slate-600">
                      <span className="font-semibold text-slate-500">Members: </span>
                      {members.length > 0
                        ? members.map(m => m.name).join(', ')
                        : schedule.studentName}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                      {isReDefense && (
                        <button
                          type="button"
                          onClick={() => {
                            setReDefenseTarget(schedule);
                            setIsReDefenseModalOpen(true);
                          }}
                          className="px-3.5 py-1.5 text-xs font-bold text-orange-800 bg-orange-50 hover:bg-orange-100 border border-orange-300 rounded-lg cursor-pointer flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-orange-600" />
                          <span>Schedule Re-Defense</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSchedule(schedule);
                          setIsEvalOpen(true);
                        }}
                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#005696] hover:bg-[#004478] rounded-lg cursor-pointer"
                      >
                        Final Verdict
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <DefenseEvaluationModal
        schedule={selectedSchedule}
        isOpen={isEvalOpen}
        onClose={() => setIsEvalOpen(false)}
      />

      <ScheduleReDefenseModal
        isOpen={isReDefenseModalOpen}
        onClose={() => {
          setIsReDefenseModalOpen(false);
          setReDefenseTarget(null);
        }}
        initialSchedule={reDefenseTarget}
      />
    </div>
  );
};
