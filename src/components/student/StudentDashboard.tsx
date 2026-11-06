import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { SubmitTitleModal } from './SubmitTitleModal';
import {
  getStudentGroupLabel,
  getGroupMembers,
  getSchedulesForStudentGroup,
  getTitlesForStudentGroup
} from '../../utils/studentGroups';
import { formatTimeRange } from '../../utils/timeFormat';
import {
  CalendarDays,
  GraduationCap,
  FileText,
  Bell,
  PlusCircle,
  ShieldCheck,
  Clock,
  MapPin
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const {
    currentUser,
    students,
    advisers,
    titles,
    schedules,
    setActiveTab,
    notifications,
    markNotificationAsRead,
    settings
  } = useApp();

  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  const student = students.find(s => s.userId === currentUser.id) || students[0];
  const groupName = getStudentGroupLabel(student);
  const groupMembers = getGroupMembers(students, groupName, student.program);
  const chosenAdviser = advisers.find(a => a.id === student.adviserId);

  const groupTitles = getTitlesForStudentGroup(student, titles, students);
  const submittedTitle = groupTitles[0] || null;

  const groupSchedules = getSchedulesForStudentGroup(student, schedules, students);
  const activeSchedule =
    groupSchedules.find(
      s =>
        s.status === 'Scheduled' ||
        s.status === 'Upcoming' ||
        s.status === 'Ongoing' ||
        s.status === 'Rescheduled' ||
        s.status === 'For Re-Defense'
    ) || groupSchedules[0] || null;

  const currentDefenseStatus = activeSchedule ? activeSchedule.status : 'For Scheduling';

  const studentNotifications = notifications.filter(
    n =>
      n.userId === 'all' ||
      n.userId === currentUser.id ||
      n.roleTarget === 'student' ||
      n.roleTarget === 'all'
  );

  return (
    <div className="space-y-6">
      {/* Clean Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#002847] via-[#004478] to-[#005696] text-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/15 text-[#FED100]">
                {groupName}
              </span>
              <span className="text-xs text-blue-100 font-mono-numbers">
                {student.program} · {student.section}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome, {student.name}</h1>
            <p className="text-xs text-blue-100 mt-1">
              Group Members: {groupMembers.map(m => m.name).join(', ')}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {settings.allowSubmissions && (
              <button
                type="button"
                onClick={() => setIsSubmitOpen(true)}
                className="px-4 py-2 text-xs font-bold text-slate-900 bg-[#FED100] hover:bg-[#e6bd00] rounded-xl cursor-pointer flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit Endorsed Title</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('Defense Schedule')}
              className="px-4 py-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl cursor-pointer flex items-center gap-1.5"
            >
              <CalendarDays className="w-4 h-4 text-[#FED100]" />
              <span>Defense Schedule</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Cards: Brief Defense Status, Chosen Adviser, Submitted Endorsed Title, Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Brief Defense Status + Submitted Endorsed Title + Chosen Adviser */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Brief Defense Status */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#005696]" />
                <h2 className="text-base font-bold text-slate-900">Brief Defense Status</h2>
              </div>
              <StatusBadge status={currentDefenseStatus} />
            </div>

            {activeSchedule ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono-numbers">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase block">Defense Date</span>
                  <strong className="text-slate-900 text-sm mt-0.5 block">
                    {activeSchedule.date}
                  </strong>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" /> Time
                  </span>
                  <strong className="text-slate-900 text-sm mt-0.5 block">
                    {formatTimeRange(activeSchedule.startTime, activeSchedule.endTime)}
                  </strong>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-600" /> Room
                  </span>
                  <strong className="text-slate-900 text-sm mt-0.5 truncate block">
                    {activeSchedule.roomName}
                  </strong>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
                Your group (<strong>{groupName}</strong>) is currently marked as{' '}
                <strong>For Scheduling</strong>. Your defense slot will be assigned by the Capstone Coordinator and shown in the{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('Defense Schedule')}
                  className="font-bold text-[#005696] hover:underline cursor-pointer"
                >
                  Defense Schedule (Table &amp; Calendar)
                </button>
                .
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => setActiveTab('Defense Schedule')}
                className="text-xs font-semibold text-[#005696] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>View Schedule &amp; Calendar</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('Defense Status')}
                className="text-xs font-semibold text-[#005696] hover:underline cursor-pointer"
              >
                Open Full Defense Status →
              </button>
            </div>
          </div>

          {/* 2. Submitted Endorsed Title */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#005696]" />
                <h2 className="text-base font-bold text-slate-900">Submitted Endorsed Title</h2>
              </div>
              {submittedTitle && <StatusBadge status={submittedTitle.status} size="sm" />}
            </div>

            {submittedTitle ? (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#005696] font-mono-numbers">
                    {submittedTitle.defenseStage}
                  </span>
                  {submittedTitle.status === 'Approved' && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Endorsed
                    </span>
                  )}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  {submittedTitle.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {submittedTitle.abstract}
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-xs text-slate-600 flex items-center justify-between gap-3">
                <span>No endorsed capstone title submitted yet for {groupName}.</span>
                {settings.allowSubmissions && (
                  <button
                    type="button"
                    onClick={() => setIsSubmitOpen(true)}
                    className="px-3 py-1.5 font-bold text-white bg-[#005696] rounded-lg cursor-pointer shrink-0"
                  >
                    Submit Now
                  </button>
                )}
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setActiveTab('Capstone Titles')}
                className="text-xs font-semibold text-[#005696] hover:underline cursor-pointer"
              >
                Browse & Manage Capstone Titles →
              </button>
            </div>
          </div>

          {/* 3. Chosen Adviser */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#005696]" />
                <h2 className="text-base font-bold text-slate-900">Chosen Adviser</h2>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Supervising Faculty
              </span>
            </div>

            {chosenAdviser ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <p className="text-sm font-bold text-slate-900">{chosenAdviser.name}</p>
                  <p className="text-slate-500 mt-0.5">{chosenAdviser.department}</p>
                </div>
                <div className="font-mono-numbers text-slate-600 sm:text-right">
                  <div>{chosenAdviser.email}</div>
                  <div className="text-slate-400">{chosenAdviser.employeeId}</div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Adviser: <strong>{student.adviserName || 'Not yet assigned'}</strong>
              </p>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): 4. Notifications */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#005696]" />
              <h2 className="text-base font-bold text-slate-900">Notifications</h2>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('Notifications')}
              className="text-xs font-semibold text-[#005696] hover:underline cursor-pointer"
            >
              View All →
            </button>
          </div>

          {studentNotifications.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No announcements or updates at this time.
            </div>
          ) : (
            <div className="space-y-3">
              {studentNotifications.slice(0, 5).map(notif => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationAsRead(notif.id)}
                  className={`p-3.5 rounded-xl border text-xs transition-colors cursor-pointer ${
                    !notif.isRead
                      ? 'bg-blue-50/50 border-blue-200'
                      : 'bg-slate-50/50 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-900">{notif.title}</span>
                    <span className="text-[10px] font-mono-numbers text-slate-400 shrink-0">
                      {notif.date}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <SubmitTitleModal isOpen={isSubmitOpen} onClose={() => setIsSubmitOpen(false)} />
    </div>
  );
};
