import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { CreateScheduleModal } from './CreateScheduleModal';
import { resolveScheduleGroupName } from '../../utils/studentGroups';
import { formatTimeRange } from '../../utils/timeFormat';
import {
  Users,
  CalendarDays,
  Building2,
  Plus,
  Bell,
  Clock,
  ArrowRight
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    students,
    rooms,
    schedules,
    setActiveTab
  } = useApp();

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const enrolledStudentsCount = students.filter(s => s.isActive).length;
  const scheduledDefenses = schedules.filter(
    s => s.status !== 'Cancelled' && s.status !== 'Completed'
  );
  const availableRoomsCount = rooms.filter(r => r.isAvailable).length;

  const currentTimetable = [...schedules]
    .filter(s => s.status !== 'Cancelled')
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl bg-[#002847] text-white p-6 sm:p-7 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              STI College Global City · Capstone Defense Scheduling & Title Coordination
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-[#FED100] hover:bg-[#e8bf00] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Defense Schedule</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('Notifications')}
              className="px-4 py-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 rounded-lg border border-white/15 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Bell className="w-4 h-4 text-[#FED100]" />
              <span>Post Note / Update</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Primary Dashboard Metrics: Enrolled Students, Scheduled Defenses, Available Rooms */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('Students / Programs')}
          className="text-left bg-white p-5 rounded-xl border border-slate-200 hover:border-[#005696] transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Enrolled Students</span>
            <Users className="w-4 h-4 text-[#005696]" />
          </div>
          <div className="text-3xl font-bold text-slate-900 tabular-nums mt-2">
            {enrolledStudentsCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {students.length} total registered student accounts
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('Defense Schedule')}
          className="text-left bg-white p-5 rounded-xl border border-slate-200 hover:border-[#005696] transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Scheduled Defenses</span>
            <CalendarDays className="w-4 h-4 text-[#005696]" />
          </div>
          <div className="text-3xl font-bold text-[#005696] tabular-nums mt-2">
            {scheduledDefenses.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Active & upcoming group oral defenses
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('Room Availability')}
          className="text-left bg-white p-5 rounded-xl border border-slate-200 hover:border-[#005696] transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Available Rooms</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-emerald-700 tabular-nums mt-2">
            {availableRoomsCount} <span className="text-lg font-medium text-slate-400">/ {rooms.length}</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Active capstone presentation rooms
          </div>
        </button>
      </div>

      {/* Current Defense Timetable */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Current Defense Timetable</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Scheduled group defense sessions across STI College Global City rooms
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('Defense Schedule')}
            className="text-xs font-semibold text-[#005696] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Open Full Schedule</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                <th className="py-3 px-4">Group Name</th>
                <th className="py-3 px-4">Endorsed Title</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Room</th>
                <th className="py-3 px-4">Adviser</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {currentTimetable.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No defense sessions scheduled yet.
                  </td>
                </tr>
              ) : (
                currentTimetable.map(sch => {
                  const groupName = resolveScheduleGroupName(sch, students);
                  return (
                    <tr key={sch.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{groupName}</div>
                        <div className="text-[11px] text-slate-500">
                          {sch.program} · {sch.defenseStage}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-medium text-slate-800 line-clamp-1">
                          {sch.capstoneTitle}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 tabular-nums whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{sch.date}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimeRange(sch.startTime, sch.endTime)}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {sch.roomName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {sch.adviserName}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={sch.status} size="sm" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateScheduleModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
};
