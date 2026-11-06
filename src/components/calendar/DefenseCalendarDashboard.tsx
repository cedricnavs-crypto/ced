import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DefenseSchedule } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { BackButton } from '../common/BackButton';
import { CreateScheduleModal } from '../admin/CreateScheduleModal';
import { ScheduleReDefenseModal } from '../panelist/ScheduleReDefenseModal';
import {
  getGroupMembers,
  getStudentGroupLabel,
  resolveScheduleGroupName
} from '../../utils/studentGroups';
import {
  formatStandardTime,
  formatTimeRange,
  getStandardTimeOptionsWithCurrent
} from '../../utils/timeFormat';
import {
  Calendar as CalendarIcon,
  Table2,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  Building2,
  RefreshCw,
  XCircle,
  X,
  Users,
  RotateCcw
} from 'lucide-react';

interface DefenseCalendarDashboardProps {
  defaultScope?: 'all' | 'my';
  initialDisplayMode?: 'table' | 'calendar';
  onDisplayModeChange?: (mode: 'table' | 'calendar') => void;
  focusDate?: string | null;
  topBanner?: React.ReactNode;
  onBackToDashboard?: () => void;
}

export const DefenseCalendarDashboard: React.FC<DefenseCalendarDashboardProps> = ({
  initialDisplayMode = 'table',
  onDisplayModeChange,
  focusDate,
  topBanner,
  onBackToDashboard
}) => {
  const {
    currentRole,
    currentUser,
    schedules,
    students,
    panelists,
    advisers,
    rooms,
    cancelSchedule,
    rescheduleDefense
  } = useApp();

  // Primary View Switcher: Table vs Calendar
  const [displayMode, setDisplayMode] = useState<'table' | 'calendar'>(initialDisplayMode);
  const [searchTerm, setSearchTerm] = useState('');
  const [programFilter, setProgramFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [onlyMyAssigned, setOnlyMyAssigned] = useState<boolean>(false);

  // Calendar Month State (default October 2026 where sample defenses are scheduled)
  const [calendarYear, setCalendarYear] = useState(2026);
  const [calendarMonth, setCalendarMonth] = useState(9); // 0-indexed: 9 = October

  useEffect(() => {
    setDisplayMode(initialDisplayMode);
  }, [initialDisplayMode]);

  useEffect(() => {
    if (!focusDate) return;
    const [yr, mo] = focusDate.split('-').map(Number);
    if (yr && mo >= 1 && mo <= 12) {
      setCalendarYear(yr);
      setCalendarMonth(mo - 1);
    }
  }, [focusDate]);

  const handleSwitchDisplayMode = (mode: 'table' | 'calendar') => {
    setDisplayMode(mode);
    onDisplayModeChange?.(mode);
  };

  // Admin & Panelist Re-Defense Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<DefenseSchedule | null>(null);
  const [isReDefenseModalOpen, setIsReDefenseModalOpen] = useState(false);
  const [reDefenseTarget, setReDefenseTarget] = useState<DefenseSchedule | null>(null);
  const [reschedulingTarget, setReschedulingTarget] = useState<DefenseSchedule | null>(null);
  const [cancellingTarget, setCancellingTarget] = useState<DefenseSchedule | null>(null);
  const [viewingSchedule, setViewingSchedule] = useState<DefenseSchedule | null>(null);

  // Reschedule form state
  const [reschedDate, setReschedDate] = useState('');
  const [reschedStart, setReschedStart] = useState('');
  const [reschedEnd, setReschedEnd] = useState('');
  const [reschedRoomId, setReschedRoomId] = useState('');
  const [reschedReason, setReschedReason] = useState('');

  // Cancel form state
  const [cancelReason, setCancelReason] = useState('');

  // Resolve current faculty/student profile for highlighting & privacy rules
  const currentPanelist = panelists.find(
    p => p.userId === currentUser.id || p.email === currentUser.email
  );
  const currentAdviser = advisers.find(
    a => a.userId === currentUser.id || a.email === currentUser.email
  );
  const currentStudent = students.find(
    s => s.userId === currentUser.id || s.email === currentUser.email
  );
  const currentStudentGroup = currentStudent ? getStudentGroupLabel(currentStudent) : '';

  // Strict Role Privacy Rules:
  // - Panelist: CANNOT see group's endorsed title AND CANNOT see co-panels
  // - Student: CANNOT see other groups' titles AND CANNOT see panelists
  const canSeePanelists = currentRole === 'admin' || currentRole === 'adviser';
  const canSeeTitleForSchedule = (sch: DefenseSchedule) => {
    if (currentRole === 'admin' || currentRole === 'adviser') return true;
    if (currentRole === 'panelist') return false;
    if (currentRole === 'student') {
      const grp = resolveScheduleGroupName(sch, students);
      return Boolean(currentStudent && grp === currentStudentGroup && sch.program === currentStudent.program);
    }
    return false;
  };

  const isAssignedToCurrentPanelist = (sch: DefenseSchedule) => {
    if (currentRole !== 'panelist' || !currentPanelist) return false;
    return sch.panelists.some(p => p.panelistId === currentPanelist.id);
  };

  const isHandledByCurrentAdviser = (sch: DefenseSchedule) => {
    if (currentRole !== 'adviser' || !currentAdviser) return false;
    if (sch.adviserId === currentAdviser.id) return true;
    const grp = resolveScheduleGroupName(sch, students);
    return students.some(
      s =>
        s.adviserId === currentAdviser.id &&
        (s.id === sch.studentId ||
          (getStudentGroupLabel(s) === grp && s.program === sch.program))
    );
  };

  const isOwnStudentGroup = (sch: DefenseSchedule) => {
    if (currentRole !== 'student' || !currentStudent) return false;
    const grp = resolveScheduleGroupName(sch, students);
    return (
      sch.studentId === currentStudent.id ||
      (grp === currentStudentGroup && sch.program === currentStudent.program)
    );
  };

  // Filtered schedules
  const filteredSchedules = useMemo(() => {
    return schedules
      .filter(sch => {
        const grp = resolveScheduleGroupName(sch, students);
        if (programFilter !== 'All' && sch.program !== programFilter) return false;
        if (statusFilter !== 'All' && sch.status !== statusFilter) return false;
        if (onlyMyAssigned) {
          if (currentRole === 'panelist' && !isAssignedToCurrentPanelist(sch)) return false;
          if (currentRole === 'adviser' && !isHandledByCurrentAdviser(sch)) return false;
          if (currentRole === 'student' && !isOwnStudentGroup(sch)) return false;
        }
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchesBase =
            grp.toLowerCase().includes(q) ||
            sch.roomName.toLowerCase().includes(q) ||
            sch.date.toLowerCase().includes(q) ||
            sch.program.toLowerCase().includes(q) ||
            (currentRole !== 'student' && sch.adviserName.toLowerCase().includes(q));
          const matchesTitle =
            canSeeTitleForSchedule(sch) && sch.capstoneTitle.toLowerCase().includes(q);
          if (!matchesBase && !matchesTitle) return false;
        }
        return true;
      })
      .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
  }, [
    schedules,
    students,
    programFilter,
    statusFilter,
    onlyMyAssigned,
    searchTerm,
    currentRole,
    currentPanelist,
    currentAdviser,
    currentStudent,
    currentStudentGroup
  ]);

  // Calendar grid generation
  const monthDays = useMemo(() => {
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const cells: { day: number | null; dateStr: string }[] = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: null, dateStr: '' });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const mm = String(calendarMonth + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      cells.push({ day: d, dateStr: `${calendarYear}-${mm}-${dd}` });
    }
    return cells;
  }, [calendarYear, calendarMonth]);

  const monthLabel = new Date(calendarYear, calendarMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(y => y - 1);
    } else {
      setCalendarMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(y => y + 1);
    } else {
      setCalendarMonth(m => m + 1);
    }
  };

  const openRescheduleModal = (sch: DefenseSchedule) => {
    setReschedulingTarget(sch);
    setReschedDate(sch.date);
    setReschedStart(sch.startTime);
    setReschedEnd(sch.endTime);
    setReschedRoomId(sch.roomId);
    setReschedReason('');
  };

  const submitReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingTarget) return;
    rescheduleDefense(
      reschedulingTarget.id,
      reschedDate,
      reschedStart,
      reschedEnd,
      reschedRoomId,
      reschedReason || 'Updated by Capstone Coordinator'
    );
    setReschedulingTarget(null);
  };

  const submitCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingTarget) return;
    cancelSchedule(cancellingTarget.id, cancelReason || 'Cancelled by Capstone Coordinator');
    setCancellingTarget(null);
    setCancelReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        {onBackToDashboard && (
          <BackButton label="Back to Dashboard" variant="subtle" />
        )}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Defense Schedule</h1>
            <p className="text-xs text-slate-500 mt-1">
              {currentRole === 'admin'
                ? 'Manage group defense schedules, view as table or calendar, edit details, reschedule, or cancel.'
                : currentRole === 'panelist'
                ? 'Campus defense schedules by group in table or calendar view. Sessions assigned to you are highlighted.'
                : currentRole === 'adviser'
                ? 'Campus defense schedules by group in table or calendar view. Groups and students assigned to you are highlighted.'
                : 'View all campus group defense schedules as a table or monthly calendar (group name, date, time, and room). Other groups’ titles and panelists are kept confidential.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Table vs Calendar View Switcher */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200/80">
              <button
                type="button"
                onClick={() => handleSwitchDisplayMode('table')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                  displayMode === 'table'
                    ? 'bg-[#005696] text-white shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Table2 className="w-3.5 h-3.5" />
                <span>Table View</span>
              </button>
              <button
                type="button"
                onClick={() => handleSwitchDisplayMode('calendar')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                  displayMode === 'calendar'
                    ? 'bg-[#005696] text-white shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Calendar View</span>
              </button>
            </div>

            {currentRole === 'admin' && (
              <button
                type="button"
                onClick={() => {
                  setEditingSchedule(null);
                  setIsCreateOpen(true);
                }}
                className="px-4 py-2 text-xs font-semibold bg-[#005696] hover:bg-[#004478] text-white rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Defense Schedule</span>
              </button>
            )}

            {currentRole === 'panelist' && (
              <button
                type="button"
                onClick={() => {
                  setReDefenseTarget(null);
                  setIsReDefenseModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Schedule Re-Defense</span>
              </button>
            )}
          </div>
        </div>

        {topBanner}

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by group name, room, program, or date..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005696]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={programFilter}
              onChange={e => setProgramFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#005696]"
            >
              <option value="All">All Programs</option>
              <option value="BSIT">BSIT</option>
              <option value="BSCS">BSCS</option>
              <option value="BSCpE">BSCpE</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#005696]"
            >
              <option value="All">All Statuses</option>
              <option value="For Scheduling">For Scheduling</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="For Re-Defense">For Re-Defense</option>
              <option value="Rescheduled">Rescheduled</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {(currentRole === 'panelist' || currentRole === 'adviser' || currentRole === 'student') && (
              <button
                type="button"
                onClick={() => setOnlyMyAssigned(v => !v)}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                  onlyMyAssigned
                    ? 'bg-[#005696] text-white border-[#005696]'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {currentRole === 'panelist'
                  ? 'Only Assigned to Me'
                  : currentRole === 'adviser'
                  ? 'Only My Handled Groups'
                  : 'Only My Group'}
              </button>
            )}
          </div>
        </div>

        {/* Panelist, Adviser & Student Highlight Legend */}
        {currentRole === 'panelist' && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 pt-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-amber-100 border border-amber-400 inline-block" />
              <span className="font-medium text-slate-800">Highlighted = Assigned to You</span>
            </div>
            <span>·</span>
            <span>All campus group schedules are listed below for conflict visibility.</span>
          </div>
        )}
        {currentRole === 'adviser' && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 pt-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-amber-100 border border-amber-400 inline-block" />
              <span className="font-medium text-slate-800">
                Highlighted = Students / Group Assigned to You
              </span>
            </div>
            <span>·</span>
            <span>All campus group schedules are listed below for full timetable visibility.</span>
          </div>
        )}
        {currentRole === 'student' && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 pt-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-amber-100 border border-amber-400 inline-block" />
              <span className="font-medium text-slate-800">
                Highlighted = Your Group ({currentStudentGroup})
              </span>
            </div>
            <span>·</span>
            <span>Switch between Table View and Calendar View anytime above.</span>
          </div>
        )}
      </div>

      {/* TABLE VIEW */}
      {displayMode === 'table' ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                  <th className="py-3.5 px-4">Group Name</th>
                  {currentRole === 'admin' && <th className="py-3.5 px-4">Endorsed Title</th>}
                  {currentRole === 'admin' && <th className="py-3.5 px-4">Adviser & Panelists</th>}
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Room</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">
                    {currentRole === 'admin' ? 'Actions' : 'Details'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredSchedules.length === 0 ? (
                  <tr>
                    <td
                      colSpan={currentRole === 'admin' ? 7 : 5}
                      className="py-12 text-center text-slate-400"
                    >
                      No defense schedules match your current filter.
                    </td>
                  </tr>
                ) : (
                  filteredSchedules.map(sch => {
                    const groupName = resolveScheduleGroupName(sch, students);
                    const isPanelistAssigned = isAssignedToCurrentPanelist(sch);
                    const isAdviserAssigned = isHandledByCurrentAdviser(sch);
                    const isStudentGroupRow = isOwnStudentGroup(sch);
                    const isAssignedRow =
                      isPanelistAssigned || isAdviserAssigned || isStudentGroupRow;
                    const panelistRole = currentPanelist
                      ? sch.panelists.find(p => p.panelistId === currentPanelist.id)?.role
                      : undefined;

                    return (
                      <tr
                        key={sch.id}
                        className={`transition-colors ${
                          isAssignedRow
                            ? 'bg-amber-50/70 hover:bg-amber-50'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900">{groupName}</span>
                            {isPanelistAssigned && (
                              <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                                Assigned to You{panelistRole ? ` (${panelistRole})` : ''}
                              </span>
                            )}
                            {isAdviserAssigned && (
                              <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded">
                                Assigned to You (Adviser)
                              </span>
                            )}
                            {isStudentGroupRow && (
                              <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded">
                                Your Group
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {sch.program} · {sch.defenseStage}
                          </div>
                          {isAdviserAssigned && (
                            <div className="text-[11px] font-medium text-amber-900 mt-1">
                              Students:{' '}
                              {getGroupMembers(students, groupName, sch.program)
                                .map(m => m.name)
                                .join(', ') || sch.studentName}
                            </div>
                          )}
                        </td>

                        {currentRole === 'admin' && (
                          <td className="py-3.5 px-4 max-w-xs">
                            <p className="font-medium text-slate-800 line-clamp-2 leading-snug">
                              {sch.capstoneTitle}
                            </p>
                          </td>
                        )}

                        {currentRole === 'admin' && (
                          <td className="py-3.5 px-4">
                            <div className="text-slate-800 font-medium">
                              Adv: {sch.adviserName}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                              Panel: {sch.panelists.map(p => p.name).join(', ')}
                            </div>
                          </td>
                        )}

                        <td className="py-3.5 px-4 tabular-nums whitespace-nowrap">
                          <div className="font-semibold text-slate-900">{sch.date}</div>
                          <div className="text-[11px] text-slate-500">
                            {formatTimeRange(sch.startTime, sch.endTime)}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-medium text-slate-800">{sch.roomName}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <StatusBadge status={sch.status} size="sm" />
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {currentRole === 'admin' ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingSchedule(sch);
                                  setIsCreateOpen(true);
                                }}
                                className="px-2.5 py-1.5 text-xs font-semibold text-[#005696] hover:bg-blue-50 rounded-lg cursor-pointer"
                                title="Edit schedule details"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => openRescheduleModal(sch)}
                                className="px-2.5 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 rounded-lg cursor-pointer"
                                title="Reschedule defense"
                              >
                                Resched
                              </button>
                              {sch.status !== 'Cancelled' && (
                                <button
                                  type="button"
                                  onClick={() => setCancellingTarget(sch)}
                                  className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                                  title="Cancel defense"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1">
                              {currentRole === 'panelist' &&
                                isPanelistAssigned &&
                                sch.status === 'For Re-Defense' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setReDefenseTarget(sch);
                                      setIsReDefenseModalOpen(true);
                                    }}
                                    className="px-2.5 py-1.5 text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg cursor-pointer"
                                  >
                                    Schedule Re-Defense
                                  </button>
                                )}
                              <button
                                type="button"
                                onClick={() => setViewingSchedule(sch)}
                                className="px-3 py-1.5 text-xs font-semibold text-[#005696] hover:bg-blue-50 rounded-lg cursor-pointer"
                              >
                                View
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CALENDAR VIEW */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <CalendarIcon className="w-4 h-4 text-[#005696]" />
              <h2 className="text-base font-bold text-slate-900">{monthLabel}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setCalendarYear(2026);
                  setCalendarMonth(9);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer"
              >
                Oct 2026 Defense Window
              </button>
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="py-2.5">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 divide-x divide-y divide-slate-200">
                {monthDays.map((cell, idx) => {
                  const daySchedules = cell.dateStr
                    ? filteredSchedules.filter(s => s.date === cell.dateStr)
                    : [];

                  return (
                    <div
                      key={idx}
                      className={`min-h-[120px] p-2 ${
                        cell.day ? 'bg-white' : 'bg-slate-50/60'
                      }`}
                    >
                      {cell.day && (
                        <>
                          <div className="text-xs font-semibold text-slate-500 tabular-nums mb-1.5">
                            {cell.day}
                          </div>
                          <div className="space-y-1.5">
                            {daySchedules.map(sch => {
                              const grp = resolveScheduleGroupName(sch, students);
                              const isPanelHighlighted = isPanelistAssignedForCard(
                                currentRole,
                                currentPanelist?.id,
                                sch
                              );
                              const isAdviserHighlighted = isHandledByCurrentAdviser(sch);
                              const isStudentHighlighted = isOwnStudentGroup(sch);
                              const isHighlighted =
                                isPanelHighlighted || isAdviserHighlighted || isStudentHighlighted;
                              return (
                                <button
                                  key={sch.id}
                                  type="button"
                                  onClick={() => {
                                    if (currentRole === 'admin') {
                                      setEditingSchedule(sch);
                                      setIsCreateOpen(true);
                                    } else {
                                      setViewingSchedule(sch);
                                    }
                                  }}
                                  className={`w-full text-left p-2 rounded-lg border text-[11px] transition-colors cursor-pointer ${
                                    isHighlighted
                                      ? 'bg-amber-50 border-amber-400 text-amber-950 ring-1 ring-amber-300'
                                      : sch.status === 'Cancelled'
                                      ? 'bg-rose-50/60 border-rose-200 text-rose-800'
                                      : 'bg-blue-50/60 border-blue-200 text-slate-900 hover:bg-blue-50'
                                  }`}
                                >
                                  <div className="font-bold truncate">{grp}</div>
                                  <div className="text-[10px] text-slate-600 tabular-nums truncate">
                                    {formatTimeRange(sch.startTime, sch.endTime, '–')} · {sch.roomName}
                                  </div>
                                  {isHighlighted && (
                                    <div className="text-[10px] font-bold text-amber-800 mt-0.5">
                                      {isAdviserHighlighted
                                        ? 'Assigned to You (Adviser)'
                                        : isStudentHighlighted
                                        ? 'Your Group'
                                        : 'Assigned to You'}
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal (Admin) */}
      <CreateScheduleModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingSchedule(null);
        }}
        initialData={editingSchedule}
      />

      {/* Re-Defense Only Schedule Modal (Panelist) */}
      <ScheduleReDefenseModal
        isOpen={isReDefenseModalOpen}
        onClose={() => {
          setIsReDefenseModalOpen(false);
          setReDefenseTarget(null);
        }}
        initialSchedule={reDefenseTarget}
      />

      {/* Reschedule Modal (Admin) */}
      {reschedulingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">Reschedule Defense</h3>
              </div>
              <button
                type="button"
                onClick={() => setReschedulingTarget(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={submitReschedule} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-900">
                  {resolveScheduleGroupName(reschedulingTarget, students)}
                </div>
                <div className="text-slate-500 mt-0.5">
                  {reschedulingTarget.program} · {reschedulingTarget.defenseStage}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Date *</label>
                <input
                  type="date"
                  required
                  value={reschedDate}
                  onChange={e => setReschedDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 tabular-nums"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Time *</label>
                  <select
                    required
                    value={reschedStart}
                    onChange={e => setReschedStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white tabular-nums"
                  >
                    {getStandardTimeOptionsWithCurrent(reschedStart).map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Time *</label>
                  <select
                    required
                    value={reschedEnd}
                    onChange={e => setReschedEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white tabular-nums"
                  >
                    {getStandardTimeOptionsWithCurrent(reschedEnd).map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Defense Room *</label>
                <select
                  value={reschedRoomId}
                  onChange={e => setReschedRoomId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Rescheduling *</label>
                <input
                  type="text"
                  required
                  value={reschedReason}
                  onChange={e => setReschedReason(e.target.value)}
                  placeholder="e.g., Faculty conflict or facility maintenance"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReschedulingTarget(null)}
                  className="px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg cursor-pointer"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Modal (Admin) */}
      {cancellingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900">Cancel Defense Schedule</h3>
              </div>
              <button
                type="button"
                onClick={() => setCancellingTarget(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={submitCancel} className="space-y-3 text-xs">
              <p className="text-slate-600">
                Cancel the scheduled defense for{' '}
                <span className="font-bold text-slate-900">
                  {resolveScheduleGroupName(cancellingTarget, students)}
                </span>{' '}
                on {cancellingTarget.date} ({formatStandardTime(cancellingTarget.startTime)})?
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cancellation Reason *</label>
                <input
                  type="text"
                  required
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  placeholder="Provide reason for cancellation..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCancellingTarget(null)}
                  className="px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Keep Schedule
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer"
                >
                  Confirm Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Read-Only Schedule Detail Modal (Respecting Strict Role Privacy) */}
      {viewingSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {resolveScheduleGroupName(viewingSchedule, students)}
                </h3>
                <p className="text-xs text-slate-500">
                  {viewingSchedule.program} · {viewingSchedule.defenseStage}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingSchedule(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Defense Status</span>
                <StatusBadge status={viewingSchedule.status} size="sm" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-[#005696] shrink-0" />
                  <div>
                    <div className="text-[11px] text-slate-500">Date</div>
                    <div className="font-semibold text-slate-900 tabular-nums">{viewingSchedule.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#005696] shrink-0" />
                  <div>
                    <div className="text-[11px] text-slate-500">Time</div>
                    <div className="font-semibold text-slate-900 tabular-nums">
                      {formatTimeRange(viewingSchedule.startTime, viewingSchedule.endTime)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#005696] shrink-0" />
                  <div>
                    <div className="text-[11px] text-slate-500">Room</div>
                    <div className="font-semibold text-slate-900">{viewingSchedule.roomName}</div>
                  </div>
                </div>
              </div>

              {/* Group Members (visible to Admin, Adviser, Panelist, and own Student group) */}
              {(currentRole !== 'student' ||
                resolveScheduleGroupName(viewingSchedule, students) === currentStudentGroup) && (
                <div className="p-3 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <Users className="w-3.5 h-3.5 text-[#005696]" />
                    <span>Group Members</span>
                  </div>
                  <p className="text-slate-600">
                    {getGroupMembers(
                      students,
                      resolveScheduleGroupName(viewingSchedule, students),
                      viewingSchedule.program
                    )
                      .map(m => m.name)
                      .join(', ') || viewingSchedule.studentName}
                  </p>
                </div>
              )}

              {/* Endorsed Title — STRICTLY HIDDEN from Panelists and other Student groups */}
              {canSeeTitleForSchedule(viewingSchedule) && (
                <div className="p-3 rounded-lg border border-slate-200 space-y-1">
                  <div className="font-semibold text-slate-700">Endorsed Title</div>
                  <p className="text-slate-800 font-medium">{viewingSchedule.capstoneTitle}</p>
                </div>
              )}

              {/* Panelists — STRICTLY HIDDEN from Panelists (co-panels hidden) and Students */}
              {canSeePanelists && (
                <div className="p-3 rounded-lg border border-slate-200 space-y-1">
                  <div className="font-semibold text-slate-700">Adviser & Assigned Panelists</div>
                  <p className="text-slate-700">Adviser: {viewingSchedule.adviserName}</p>
                  <p className="text-slate-600">
                    Panelists: {viewingSchedule.panelists.map(p => `${p.name} (${p.role})`).join(', ')}
                  </p>
                </div>
              )}

              {currentRole === 'panelist' && isAssignedToCurrentPanelist(viewingSchedule) && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-medium">
                  You are assigned to evaluate this group (
                  {viewingSchedule.panelists.find(p => p.panelistId === currentPanelist?.id)?.role}
                  ).
                </div>
              )}

              {currentRole === 'adviser' && isHandledByCurrentAdviser(viewingSchedule) && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-medium">
                  These students ({resolveScheduleGroupName(viewingSchedule, students)}) are assigned to you as their Capstone Adviser.
                </div>
              )}

              {currentRole === 'student' && isOwnStudentGroup(viewingSchedule) && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-medium">
                  This is your group&apos;s scheduled capstone defense session (Adviser: {viewingSchedule.adviserName}).
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              {currentRole === 'panelist' &&
                isAssignedToCurrentPanelist(viewingSchedule) &&
                viewingSchedule.status === 'For Re-Defense' && (
                  <button
                    type="button"
                    onClick={() => {
                      const target = viewingSchedule;
                      setViewingSchedule(null);
                      setReDefenseTarget(target);
                      setIsReDefenseModalOpen(true);
                    }}
                    className="px-4 py-2 text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-lg cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Schedule Re-Defense</span>
                  </button>
                )}
              <button
                type="button"
                onClick={() => setViewingSchedule(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function isPanelistAssignedForCard(
  role: string,
  panelistId: string | undefined,
  sch: DefenseSchedule
): boolean {
  if (role !== 'panelist' || !panelistId) return false;
  return sch.panelists.some(p => p.panelistId === panelistId);
}
