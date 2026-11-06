import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { BackButton } from '../common/BackButton';
import { ScheduleReDefenseModal } from './ScheduleReDefenseModal';
import { DefenseSchedule } from '../../types';
import { resolveScheduleGroupName, getGroupMembers } from '../../utils/studentGroups';
import { formatTimeRange } from '../../utils/timeFormat';
import { History, Search, RotateCcw } from 'lucide-react';

export const PanelDefenseHistoryView: React.FC = () => {
  const { currentUser, panelists, students, schedules } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Completed' | 'For Re-Defense' | 'Cancelled'>('All');
  const [reDefenseTarget, setReDefenseTarget] = useState<DefenseSchedule | null>(null);
  const [isReDefenseModalOpen, setIsReDefenseModalOpen] = useState(false);

  const panelist = panelists.find(p => p.userId === currentUser.id) || panelists[0];

  // Completed, Cancelled, and For Re-Defense defenses for this panelist
  const historySchedules = schedules.filter(
    s =>
      s.panelists.some(p => p.panelistId === panelist.id) &&
      (s.status === 'Completed' || s.status === 'Cancelled' || s.status === 'For Re-Defense')
  );

  const filtered = historySchedules.filter(s => {
    const grp = resolveScheduleGroupName(s, students).toLowerCase();
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      grp.includes(q) ||
      s.studentName.toLowerCase().includes(q) ||
      s.studentNumber.toLowerCase().includes(q) ||
      s.program.toLowerCase().includes(q) ||
      s.roomName.toLowerCase().includes(q);
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
              Completed, cancelled, and re-defense records assigned to {panelist.name}.
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
              placeholder="Search group name, student name, program, or room..."
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

      {/* History List (No Endorsed Titles, No Co-Panelists) */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
            <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No completed, cancelled, or re-defense records found.
          </div>
        ) : (
          filtered.map(item => {
            const grpName = resolveScheduleGroupName(item, students);
            const members = getGroupMembers(students, grpName, item.program);
            const myRole =
              item.panelists.find(p => p.panelistId === panelist.id)?.role || 'Panelist';

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-[#005696] uppercase">{grpName}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono-numbers">
                      {item.program} · {item.defenseStage}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#005696]">
                      Your Role: {myRole}
                    </span>
                  </div>
                  <StatusBadge status={item.status} size="sm" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono-numbers">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Date</span>
                    <strong className="text-slate-900">{item.date}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Time</span>
                    <strong className="text-slate-900">
                      {formatTimeRange(item.startTime, item.endTime)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Venue</span>
                    <strong className="text-slate-900">{item.roomName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Adviser</span>
                    <strong className="text-slate-900">{item.adviserName}</strong>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
                  <div>
                    <span className="font-semibold text-slate-700">Members: </span>
                    {members.length > 0 ? members.map(m => m.name).join(', ') : item.studentName}
                  </div>
                  {item.status === 'For Re-Defense' && (
                    <button
                      type="button"
                      onClick={() => {
                        setReDefenseTarget(item);
                        setIsReDefenseModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 text-xs font-bold text-orange-800 bg-orange-50 hover:bg-orange-100 border border-orange-300 rounded-lg cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-orange-600" />
                      <span>Schedule Re-Defense</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

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
