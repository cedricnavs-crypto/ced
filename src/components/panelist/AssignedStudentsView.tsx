import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { BackButton } from '../common/BackButton';
import { DefenseEvaluationModal } from './DefenseEvaluationModal';
import { ScheduleReDefenseModal } from './ScheduleReDefenseModal';
import { DefenseSchedule } from '../../types';
import { resolveScheduleGroupName, getGroupMembers } from '../../utils/studentGroups';
import { formatTimeRange } from '../../utils/timeFormat';
import {
  Users,
  Search,
  Calendar,
  Clock,
  MapPin,
  RotateCcw
} from 'lucide-react';

export const AssignedStudentsView: React.FC = () => {
  const { currentUser, panelists, schedules, students } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [programFilter, setProgramFilter] = useState('All');
  const [selectedSchedule, setSelectedSchedule] = useState<DefenseSchedule | null>(null);
  const [isEvalOpen, setIsEvalOpen] = useState(false);
  const [reDefenseTarget, setReDefenseTarget] = useState<DefenseSchedule | null>(null);
  const [isReDefenseModalOpen, setIsReDefenseModalOpen] = useState(false);

  const panelist = panelists.find(p => p.userId === currentUser.id) || panelists[0];
  const myAssignedSchedules = schedules.filter(s =>
    s.panelists.some(p => p.panelistId === panelist.id)
  );

  const filtered = myAssignedSchedules.filter(s => {
    const grp = resolveScheduleGroupName(s, students).toLowerCase();
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      grp.includes(q) ||
      s.studentName.toLowerCase().includes(q) ||
      s.studentNumber.toLowerCase().includes(q) ||
      s.roomName.toLowerCase().includes(q);
    const matchesProgram = programFilter === 'All' || s.program === programFilter;
    return matchesSearch && matchesProgram;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <BackButton label="Back to Dashboard" variant="subtle" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#005696]" />
              <h1 className="text-xl font-bold text-slate-900">Assigned Defense</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Capstone groups assigned to your examination schedule. Re-defense sessions are highlighted in each group&apos;s details.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setReDefenseTarget(null);
                setIsReDefenseModalOpen(true);
              }}
              className="px-3.5 py-2 text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Schedule Re-Defense</span>
            </button>
            <div className="text-xs text-slate-600 font-mono-numbers px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
              Assigned Groups: <strong className="text-slate-900">{myAssignedSchedules.length}</strong>
            </div>
          </div>
        </div>

        {/* Search & Program Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search group name, student name, student no., or room..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005696]"
            />
          </div>

          <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
            {['All', 'BSIT', 'BSCS', 'BSCpE'].map(prog => (
              <button
                key={prog}
                type="button"
                onClick={() => setProgramFilter(prog)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  programFilter === prog
                    ? 'bg-white text-[#005696] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {prog}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Assigned Groups Cards (No Endorsed Titles & No Co-Panelists) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
            No assigned defense groups match your search criteria.
          </div>
        ) : (
          filtered.map(schedule => {
            const grpName = resolveScheduleGroupName(schedule, students);
            const members = getGroupMembers(students, grpName, schedule.program);
            const myRole =
              schedule.panelists.find(p => p.panelistId === panelist.id)?.role || 'Panelist';
            const isReDefense = schedule.status === 'For Re-Defense';

            return (
              <div
                key={schedule.id}
                className={`bg-white rounded-2xl border p-5 shadow-2xs space-y-3.5 flex flex-col justify-between transition-colors ${
                  isReDefense
                    ? 'border-orange-300 ring-1 ring-orange-100'
                    : 'border-slate-200 hover:border-[#005696]'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-[#005696] uppercase">
                        {grpName}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono-numbers">
                        {schedule.program}
                      </span>
                    </div>
                    <StatusBadge status={schedule.status} size="sm" />
                  </div>

                  {/* Prominent For Re-Defense Notice in Group Details */}
                  {isReDefense && (
                    <div className="p-3 rounded-xl bg-orange-50 border border-orange-300 text-orange-900 text-xs flex items-start gap-2">
                      <RotateCcw className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold block">Group Flagged For Re-Defense</strong>
                        <p className="text-[11px] text-orange-800 mt-0.5">
                          This group is scheduled for an oral re-defense session.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Group Members */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Group Members ({members.length || 1})
                    </span>
                    {members.length > 0 ? (
                      <div className="space-y-1">
                        {members.map(m => (
                          <div key={m.id} className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900">{m.name}</span>
                            <span className="text-[11px] font-mono-numbers text-slate-500">
                              {m.studentNumber} · {m.section}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{schedule.studentName}</span>
                        <span className="text-[11px] font-mono-numbers text-slate-500">
                          {schedule.studentNumber}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Role & Adviser (Co-panelists strictly hidden) */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase block">Adviser</span>
                      <span className="font-semibold text-slate-800">{schedule.adviserName}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100">
                      <span className="text-[10px] text-slate-500 uppercase block">Your Role</span>
                      <span className="font-bold text-[#005696]">{myRole}</span>
                    </div>
                  </div>

                  {/* Schedule & Venue */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex flex-wrap items-center justify-between gap-2 font-mono-numbers">
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-[#005696]" />
                      {schedule.date}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      {formatTimeRange(schedule.startTime, schedule.endTime)}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-rose-600" />
                      {schedule.roomName}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap justify-end gap-2">
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
            );
          })
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
