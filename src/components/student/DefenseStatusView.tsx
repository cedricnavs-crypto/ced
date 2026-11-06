import React from 'react';
import { useApp } from '../../context/AppContext';
import { DefenseStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { BackButton } from '../common/BackButton';
import {
  getGroupMembers,
  getSchedulesForStudentGroup,
  getStudentGroupLabel,
  getTitlesForStudentGroup
} from '../../utils/studentGroups';
import { formatTimeRange } from '../../utils/timeFormat';
import {
  ShieldCheck,
  Calendar,
  Clock,
  Building2,
  Users,
  GraduationCap,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

const ALL_DEFENSE_STATUSES: {
  status: DefenseStatus;
  description: string;
}[] = [
  { status: 'For Scheduling', description: 'Title is endorsed and awaiting a confirmed defense date, time, and room.' },
  { status: 'Scheduled', description: 'Defense slot and room have been officially booked.' },
  { status: 'Upcoming', description: 'Defense date is approaching; prepare presentation materials and manuscripts.' },
  { status: 'Ongoing', description: 'Oral defense session is currently in progress.' },
  { status: 'Completed', description: 'Defense presentation and panel evaluation have been completed.' },
  { status: 'For Re-Defense', description: 'Panelists requested major revisions and a follow-up re-defense session.' },
  { status: 'Rescheduled', description: 'Defense session was moved to a new date, time, or room.' },
  { status: 'Cancelled', description: 'Scheduled defense session was cancelled by the coordinator.' }
];

export const DefenseStatusView: React.FC = () => {
  const { currentUser, students, schedules, titles, advisers, setActiveTab } = useApp();

  const student = students.find(s => s.userId === currentUser.id) || students[0];
  const groupLabel = getStudentGroupLabel(student);
  const groupMembers = getGroupMembers(students, groupLabel, student.program);
  const groupTitles = getTitlesForStudentGroup(student, titles, students);
  const activeTitle =
    groupTitles.find(t => t.status === 'Approved') ||
    groupTitles.find(t => t.status === 'Pending') ||
    groupTitles[0];

  const groupSchedules = getSchedulesForStudentGroup(student, schedules, students);
  const primarySchedule =
    groupSchedules.find(s =>
      ['Ongoing', 'Upcoming', 'Scheduled', 'Rescheduled', 'For Re-Defense'].includes(s.status)
    ) || groupSchedules[0];

  const resolvedStatus: DefenseStatus = primarySchedule
    ? primarySchedule.status
    : 'For Scheduling';

  const adviser = advisers.find(a => a.id === student.adviserId);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-5">
        <BackButton label="Back to Dashboard" variant="subtle" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#005696]" />
              <h1 className="text-xl font-bold text-slate-900">Defense Status</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Official capstone defense standing for <span className="font-semibold text-slate-700">{groupLabel}</span> ({student.program} · {student.section})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Current Status:</span>
            <StatusBadge status={resolvedStatus} />
          </div>
        </div>

        {/* Highlight Banner for Current Defense Status */}
        <div
          className={`p-5 rounded-xl border ${
            resolvedStatus === 'For Re-Defense'
              ? 'bg-orange-50/70 border-orange-200'
              : resolvedStatus === 'Cancelled'
              ? 'bg-rose-50/70 border-rose-200'
              : resolvedStatus === 'Completed'
              ? 'bg-emerald-50/70 border-emerald-200'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="text-xs text-slate-500 font-medium">
                {groupLabel} · {primarySchedule?.defenseStage || activeTitle?.defenseStage || 'Capstone Oral Defense'}
              </div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                {resolvedStatus === 'For Re-Defense' && (
                  <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0" />
                )}
                {resolvedStatus === 'Completed' && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                <span>Status: {resolvedStatus}</span>
              </h2>
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                {ALL_DEFENSE_STATUSES.find(s => s.status === resolvedStatus)?.description}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('Defense Schedule')}
              className="px-4 py-2 bg-[#005696] hover:bg-[#004478] text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 self-start md:self-center shrink-0 cursor-pointer transition-colors"
            >
              <span>View Defense Schedule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {primarySchedule && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200/70 text-xs">
              <div className="flex items-center gap-2.5 text-slate-700">
                <Calendar className="w-4 h-4 text-[#005696] shrink-0" />
                <div>
                  <div className="text-[11px] text-slate-500">Defense Date</div>
                  <div className="font-semibold tabular-nums">{primarySchedule.date}</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <Clock className="w-4 h-4 text-[#005696] shrink-0" />
                <div>
                  <div className="text-[11px] text-slate-500">Time Slot</div>
                  <div className="font-semibold tabular-nums">
                    {formatTimeRange(primarySchedule.startTime, primarySchedule.endTime)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <Building2 className="w-4 h-4 text-[#005696] shrink-0" />
                <div>
                  <div className="text-[11px] text-slate-500">Assigned Room</div>
                  <div className="font-semibold">{primarySchedule.roomName}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Group Summary Grid (Adviser, Title, Members — No Panelists per Student Privacy Rule) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <FileText className="w-4 h-4 text-[#005696]" />
              <span>Submitted Endorsed Title</span>
            </div>
            {activeTitle ? (
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-slate-900 leading-snug">{activeTitle.title}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Title Status: {activeTitle.status}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                No endorsed title submitted yet. Visit Capstone Titles to submit your group's title.
              </p>
            )}
          </div>

          <div className="p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <GraduationCap className="w-4 h-4 text-[#005696]" />
              <span>Chosen Adviser & Group Members</span>
            </div>
            <div className="text-sm font-semibold text-slate-900">
              {adviser?.name || student.adviserName || 'Unassigned'}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
              <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {groupMembers.map(m => m.name).join(', ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* All Defense Status Definitions Reference */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Defense Status Guide</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            All possible capstone defense statuses tracked by the STI College Global City coordinator office.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ALL_DEFENSE_STATUSES.map(item => {
            const isCurrent = item.status === resolvedStatus;
            return (
              <div
                key={item.status}
                className={`p-3.5 rounded-lg border transition-colors ${
                  isCurrent
                    ? 'border-[#005696] bg-blue-50/40 ring-1 ring-[#005696]/20'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <StatusBadge status={item.status} size="sm" />
                  {isCurrent && (
                    <span className="text-[10px] font-bold text-[#005696]">Current</span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
