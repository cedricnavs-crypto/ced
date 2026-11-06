import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { DefenseCalendarDashboard } from '../calendar/DefenseCalendarDashboard';
import {
  getStudentGroupLabel,
  getSchedulesForStudentGroup,
  getTitlesForStudentGroup
} from '../../utils/studentGroups';
import { formatTimeRange } from '../../utils/timeFormat';
import {
  Calendar as CalendarIcon,
  Table2,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const MyDefenseView: React.FC = () => {
  const {
    currentUser,
    students,
    titles,
    schedules,
    activeTab,
    setActiveTab
  } = useApp();

  const [viewMode, setViewMode] = useState<'table' | 'calendar'>(
    activeTab === 'Defense Calendar' ? 'calendar' : 'table'
  );
  const [calendarFocusDate, setCalendarFocusDate] = useState<string | null>(null);

  const student = students.find(s => s.userId === currentUser.id) || students[0];
  const groupName = getStudentGroupLabel(student);

  const groupTitles = getTitlesForStudentGroup(student, titles, students);
  const endorsedTitle = groupTitles.find(t => t.status === 'Approved') || null;

  const groupSchedules = getSchedulesForStudentGroup(student, schedules, students);
  const activeSchedule =
    groupSchedules.find(
      s =>
        s.status === 'Scheduled' ||
        s.status === 'Upcoming' ||
        s.status === 'Ongoing' ||
        s.status === 'Rescheduled' ||
        s.status === 'For Re-Defense'
    ) || null;

  const studentSchedulingBanner = (
    <div className="space-y-2.5">
      {activeSchedule ? (
        <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <strong className="font-bold text-sm">
                  {groupName} Defense Slot Confirmed
                </strong>
                <StatusBadge status={activeSchedule.status} size="sm" />
              </div>
              <p className="mt-1 font-mono-numbers">
                Date: <strong>{activeSchedule.date}</strong> · Time:{' '}
                <strong>
                  {formatTimeRange(activeSchedule.startTime, activeSchedule.endTime)}
                </strong>{' '}
                · Room: <strong>{activeSchedule.roomName}</strong>
              </p>
            </div>
          </div>
          <div className="self-start sm:self-center">
            <button
              type="button"
              onClick={() => {
                if (viewMode === 'table') {
                  setCalendarFocusDate(activeSchedule.date);
                  setViewMode('calendar');
                } else {
                  setViewMode('table');
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              {viewMode === 'table' ? (
                <>
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>View on Calendar</span>
                </>
              ) : (
                <>
                  <Table2 className="w-3.5 h-3.5" />
                  <span>View in Table</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : !endorsedTitle ? (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>{groupName}:</strong> Your group&apos;s capstone title must be endorsed first before a defense schedule is assigned by the Capstone Coordinator.
          </span>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-100 border border-slate-300 text-xs text-slate-800 flex items-start gap-2.5">
          <Clock className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-sm text-slate-900 block">
              Awaiting Coordinator Defense Schedule ({groupName})
            </strong>
            <p className="text-slate-600 mt-0.5">
              Your group&apos;s capstone title is endorsed. Your defense date, time, and room will be scheduled by the Capstone Coordinator and will appear in both the table and calendar views below.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <DefenseCalendarDashboard
        defaultScope="all"
        initialDisplayMode={viewMode}
        onDisplayModeChange={mode => setViewMode(mode)}
        focusDate={calendarFocusDate || activeSchedule?.date || null}
        topBanner={studentSchedulingBanner}
        onBackToDashboard={() => setActiveTab('Dashboard')}
      />
    </div>
  );
};
