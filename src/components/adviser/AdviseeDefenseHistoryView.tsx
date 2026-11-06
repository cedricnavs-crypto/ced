import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { BackButton } from '../common/BackButton';
import { resolveScheduleGroupName } from '../../utils/studentGroups';
import { formatTimeRange } from '../../utils/timeFormat';
import { History, Search } from 'lucide-react';

export const AdviseeDefenseHistoryView: React.FC = () => {
  const { currentUser, advisers, students, schedules } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Completed' | 'For Re-Defense' | 'Cancelled'>('All');

  const adviser = advisers.find(a => a.userId === currentUser.id) || advisers[0];

  // Completed, Cancelled, and For Re-Defense defenses
  const historySchedules = schedules.filter(
    s =>
      s.adviserId === adviser.id &&
      (s.status === 'Completed' || s.status === 'Cancelled' || s.status === 'For Re-Defense')
  );

  const filtered = historySchedules.filter(s => {
    const grp = resolveScheduleGroupName(s, students).toLowerCase();
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      grp.includes(q) ||
      s.studentName.toLowerCase().includes(q) ||
      s.capstoneTitle.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <BackButton label="Back to Dashboard" variant="subtle" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#005696]" />
              <h1 className="text-xl font-bold text-slate-900">Defense History</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Completed, cancelled, and re-defense records for groups supervised by {adviser.name}.
            </p>
          </div>

          <div className="text-xs text-slate-600 font-mono-numbers px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
            Total Records: <strong className="text-slate-900">{historySchedules.length}</strong>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search group name, student name, or capstone title..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005696]"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl text-xs">
            {(['All', 'Completed', 'For Re-Defense', 'Cancelled'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-white text-[#005696] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
            <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No completed, cancelled, or re-defense records found.
          </div>
        ) : (
          filtered.map(item => {
            const grpName = resolveScheduleGroupName(item, students);
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-[#005696] uppercase">{grpName}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                      Assigned to You
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono-numbers">
                      {item.defenseStage}
                    </span>
                  </div>
                  <StatusBadge status={item.status} size="sm" />
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {item.capstoneTitle}
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono-numbers">
                  <div>
                    Group: <strong className="text-slate-900">{grpName}</strong>
                  </div>
                  <div>
                    Program: <strong className="text-slate-900">{item.program}</strong>
                  </div>
                  <div>
                    Date & Time:{' '}
                    <strong className="text-slate-900">
                      {item.date} ({formatTimeRange(item.startTime, item.endTime)})
                    </strong>
                  </div>
                  <div>
                    Room: <strong className="text-slate-900">{item.roomName}</strong>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
