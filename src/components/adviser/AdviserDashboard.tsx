import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  getStudentGroupLabel,
  getGroupMembers,
  resolveScheduleGroupName,
  resolveTitleGroupName
} from '../../utils/studentGroups';
import { formatTimeRange } from '../../utils/timeFormat';
import {
  Users,
  CalendarDays,
  FileText,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const AdviserDashboard: React.FC = () => {
  const {
    currentUser,
    advisers,
    students,
    titles,
    schedules,
    setActiveTab
  } = useApp();

  const adviser = advisers.find(a => a.userId === currentUser.id) || advisers[0];
  const myStudents = students.filter(s => s.adviserId === adviser.id);

  // Distinct Handled Groups
  const handledGroups = useMemo(() => {
    const map = new Map<string, typeof myStudents>();
    myStudents.forEach(s => {
      const grp = getStudentGroupLabel(s);
      const list = map.get(grp) || [];
      list.push(s);
      map.set(grp, list);
    });
    return Array.from(map.entries()).map(([groupName, members]) => ({
      groupName,
      members
    }));
  }, [myStudents]);

  const mySchedules = schedules.filter(s => s.adviserId === adviser.id);
  const upcomingDefenses = mySchedules.filter(
    s =>
      s.status === 'Scheduled' ||
      s.status === 'Upcoming' ||
      s.status === 'Ongoing' ||
      s.status === 'Rescheduled'
  );
  const completedDefenses = mySchedules.filter(s => s.status === 'Completed');

  // Submitted & Endorsed Titles for handled groups
  const mySubmittedTitles = titles.filter(t => t.adviserId === adviser.id);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#002847] via-[#004478] to-[#005696] text-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome, {adviser.name}</h1>
            <p className="text-xs text-blue-100 mt-1">
              Capstone Faculty Adviser · {adviser.department} ({adviser.employeeId})
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('Handled Groups')}
              className="px-4 py-2 text-xs font-bold text-slate-900 bg-[#FED100] hover:bg-[#e6bd00] rounded-xl cursor-pointer flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              <span>Handled Groups</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('Defense Schedule')}
              className="px-4 py-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl cursor-pointer flex items-center gap-1.5"
            >
              <CalendarDays className="w-4 h-4" />
              <span>Defense Schedule</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Required KPI Cards: Handled Groups, Upcoming Defense, Completed Defense */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Handled Groups
            </span>
            <span className="text-3xl font-extrabold text-[#005696] font-mono-numbers mt-1 block">
              {handledGroups.length}
            </span>
            <span className="text-xs text-slate-500 mt-1 block">
              {myStudents.length} supervised student(s)
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
            <span className="text-xs text-slate-500 mt-1 block">Scheduled group hearings</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Clock className="w-6 h-6" />
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
            <span className="text-xs text-slate-500 mt-1 block">Concluded oral defenses</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Grid: Brief Upcoming Defense Details & Submitted Endorsed Titles */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Brief Upcoming Defense Details */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Upcoming Defense Details</h2>
              <p className="text-xs text-slate-500">Scheduled hearings for your handled groups</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('Defense Schedule')}
              className="text-xs font-semibold text-[#005696] hover:underline cursor-pointer"
            >
              View All →
            </button>
          </div>

          {upcomingDefenses.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No upcoming defenses scheduled for your handled groups yet.
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingDefenses.map(sched => {
                const grpName = resolveScheduleGroupName(sched, students);
                return (
                  <div
                    key={sched.id}
                    className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#005696] uppercase">
                          {grpName}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                          Assigned to You
                        </span>
                      </div>
                      <StatusBadge status={sched.status} size="sm" />
                    </div>
                    <p className="text-xs font-semibold text-slate-800 line-clamp-2">
                      {sched.capstoneTitle}
                    </p>
                    <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] font-mono-numbers text-slate-600 border-t border-slate-200/70">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Date</span>
                        <strong className="text-slate-900">{sched.date}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Time</span>
                        <strong className="text-slate-900">
                          {formatTimeRange(sched.startTime, sched.endTime)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Room</span>
                        <strong className="text-slate-900 truncate block">{sched.roomName}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Submitted Endorsed Titles & Brief Details (Group Name, Members, Brief Details) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Submitted & Endorsed Titles</h2>
              <p className="text-xs text-slate-500">
                Group name, members, and brief proposal details under your supervision
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('Capstone Titles')}
              className="text-xs font-semibold text-[#005696] hover:underline cursor-pointer"
            >
              Manage Titles →
            </button>
          </div>

          {mySubmittedTitles.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No capstone titles submitted by your handled groups yet.
            </div>
          ) : (
            <div className="space-y-3">
              {mySubmittedTitles.map(item => {
                const grpName = resolveTitleGroupName(item, students);
                const owner = students.find(s => s.id === item.studentId);
                const members = getGroupMembers(students, grpName, owner?.program);

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#005696]" />
                        <span className="text-xs font-bold text-[#005696] uppercase">
                          {grpName}
                        </span>
                        {item.status === 'Approved' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Endorsed
                          </span>
                        )}
                      </div>
                      <StatusBadge status={item.status} size="sm" />
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.abstract}
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="font-semibold text-slate-500">Group Members:</span>
                      {members.length > 0 ? (
                        members.map(m => (
                          <span
                            key={m.id}
                            className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
                          >
                            {m.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-700 font-medium">{item.studentName}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
