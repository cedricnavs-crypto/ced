import React from 'react';
import { useApp } from '../../context/AppContext';
import { BackButton } from '../common/BackButton';
import { getStudentGroupLabel } from '../../utils/studentGroups';
import {
  BarChart3,
  Printer,
  GraduationCap,
  UserCheck
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { students, advisers, panelists, rooms, programs, titles, schedules } = useApp();

  const totalScheduled = schedules.filter(
    s => s.status !== 'Cancelled' && s.status !== 'Completed'
  ).length;
  const totalCompleted = schedules.filter(s => s.status === 'Completed').length;
  const totalCancelled = schedules.filter(s => s.status === 'Cancelled').length;

  const pendingTitles = titles.filter(t => t.status === 'Pending').length;
  const approvedTitles = titles.filter(t => t.status === 'Approved').length;
  const rejectedTitles = titles.filter(t => t.status === 'Rejected').length;

  // Defenses by program distribution
  const defensesByProgram = programs.map(prog => {
    const count = schedules.filter(s => s.program === prog.code && s.status !== 'Cancelled').length;
    return {
      code: prog.code,
      name: prog.name,
      count
    };
  });

  // Defense room utilization
  const roomUsage = rooms.map(room => {
    const sessions = schedules.filter(s => s.roomId === room.id && s.status !== 'Cancelled').length;
    return {
      name: room.name,
      isAvailable: room.isAvailable,
      sessions
    };
  });

  // Advisers Workload & Handled Groups (Separated)
  const adviserWorkload = advisers.map(adv => {
    const advStudents = students.filter(s => s.adviserId === adv.id);
    const uniqueGroups = new Set(advStudents.map(s => `${s.program}::${getStudentGroupLabel(s)}`));
    const handledGroupsCount = uniqueGroups.size;
    const capacity = adv.maxAdvisees || 8;
    const workloadStatus =
      handledGroupsCount >= capacity
        ? 'At Full Capacity'
        : handledGroupsCount >= Math.ceil(capacity * 0.7)
        ? 'High Load'
        : 'Balanced Load';

    return {
      id: adv.id,
      name: adv.name,
      employeeId: adv.employeeId,
      department: adv.department,
      handledGroupsCount,
      capacity,
      workloadStatus
    };
  });

  // Panelists Workload & Assigned Defenses (Separated)
  const panelistWorkload = panelists.map(p => {
    const assignedCount = schedules.filter(
      s => s.status !== 'Cancelled' && s.panelists.some(item => item.panelistId === p.id)
    ).length;
    const capacity = p.maxDefenses ?? 6;
    const workloadStatus =
      assignedCount >= capacity
        ? 'At Full Capacity'
        : assignedCount >= Math.ceil(capacity * 0.7)
        ? 'Heavy Load'
        : 'Balanced Load';

    return {
      id: p.id,
      name: p.name,
      employeeId: p.employeeId,
      department: p.department,
      assignedCount,
      capacity,
      workloadStatus
    };
  });

  return (
    <div className="space-y-6">
      {/* Header & Top 4 Institutional KPIs */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-5">
        <BackButton label="Back to Dashboard" variant="subtle" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#005696]" />
              <h1 className="text-xl font-bold text-slate-900">
                Defense Analytics & Institutional Reports
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Summary of enrolled students, scheduled defenses, title approval ratio, room utilization, and separated faculty workload.
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#005696] hover:bg-[#004478] rounded-lg flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>

        {/* 4 Summary Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-slate-500 font-medium">Total Enrolled Students</div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">
              {students.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {students.filter(s => s.isActive).length} active accounts
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-slate-500 font-medium">Scheduled Defenses</div>
            <div className="text-2xl font-bold text-[#005696] tabular-nums mt-1">
              {totalScheduled}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {totalCompleted} completed · {totalCancelled} cancelled
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-slate-500 font-medium">Title Approval Ratio</div>
            <div className="text-2xl font-bold text-emerald-700 tabular-nums mt-1">
              {titles.length > 0 ? Math.round((approvedTitles / titles.length) * 100) : 0}%
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {approvedTitles} approved · {rejectedTitles} rejected · {pendingTitles} pending
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-slate-500 font-medium">Faculty Staffing</div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">
              {advisers.length + panelists.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {advisers.length} advisers · {panelists.length} panelists
            </div>
          </div>
        </div>
      </div>

      {/* Defenses by Academic Program & Defense Room Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Defenses by Academic Program</h2>
            <span className="text-xs text-slate-500 tabular-nums">
              {defensesByProgram.reduce((acc, p) => acc + p.count, 0)} active sessions
            </span>
          </div>

          <div className="space-y-3.5">
            {defensesByProgram.map(item => {
              const maxVal = Math.max(...defensesByProgram.map(d => d.count), 1);
              const pct = Math.round((item.count / maxVal) * 100);
              return (
                <div key={item.code} className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-800">
                      {item.code} — {item.name}
                    </span>
                    <span className="font-bold text-[#005696] tabular-nums">
                      {item.count} defenses
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#005696] rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Defense Room Utilization</h2>
            <span className="text-xs text-slate-500 tabular-nums">
              {rooms.length} rooms
            </span>
          </div>

          <div className="space-y-3.5">
            {roomUsage.map(r => {
              const maxSessions = Math.max(...roomUsage.map(ru => ru.sessions), 1);
              const pct = Math.round((r.sessions / maxSessions) * 100);
              return (
                <div key={r.name} className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-800 truncate">{r.name}</span>
                    <span className="text-slate-600 tabular-nums">
                      {r.sessions} session{r.sessions !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Faculty Examination Board Workload & Assignment Distribution (Advisers & Panelists Separated) */}
      <div className="space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Faculty Examination Board Workload & Assignment Distribution
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Advisers and Panelists are separated below with employee ID, department, assigned load, and workload status.
          </p>
        </div>

        {/* 1. Advisers Workload Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#005696]" />
              <h3 className="text-sm font-bold text-slate-900">
                Advisers — Handled Groups & Supervision Load
              </h3>
            </div>
            <span className="text-xs text-slate-500 tabular-nums">{advisers.length} advisers</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Adviser Name</th>
                  <th className="py-3 px-4">Employee ID</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Handled Groups</th>
                  <th className="py-3 px-4">Workload Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {adviserWorkload.map(adv => (
                  <tr key={adv.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-bold text-slate-900">{adv.name}</td>
                    <td className="py-3 px-4 tabular-nums text-slate-600">{adv.employeeId}</td>
                    <td className="py-3 px-4 text-slate-700">
                      {adv.department.includes('Engineering') ? 'College of Engineering' : 'CICT'}
                    </td>
                    <td className="py-3 px-4 tabular-nums font-semibold text-[#005696]">
                      {adv.handledGroupsCount} / {adv.capacity} groups
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-semibold ${
                          adv.workloadStatus === 'At Full Capacity'
                            ? 'text-rose-700'
                            : adv.workloadStatus === 'High Load'
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {adv.workloadStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Panelists Workload Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#005696]" />
              <h3 className="text-sm font-bold text-slate-900">
                Panelists — Assigned Defenses & Evaluation Load
              </h3>
            </div>
            <span className="text-xs text-slate-500 tabular-nums">{panelists.length} panelists</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Panelist Name</th>
                  <th className="py-3 px-4">Employee ID</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Assigned Defenses</th>
                  <th className="py-3 px-4">Workload Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {panelistWorkload.map(pw => (
                  <tr key={pw.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-bold text-slate-900">{pw.name}</td>
                    <td className="py-3 px-4 tabular-nums text-slate-600">{pw.employeeId}</td>
                    <td className="py-3 px-4 text-slate-700">
                      {pw.department.includes('Engineering') ? 'College of Engineering' : 'CICT'}
                    </td>
                    <td className="py-3 px-4 tabular-nums font-semibold text-[#005696]">
                      {pw.assignedCount} / {pw.capacity} defenses
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-semibold ${
                          pw.workloadStatus === 'At Full Capacity'
                            ? 'text-rose-700'
                            : pw.workloadStatus === 'Heavy Load'
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {pw.workloadStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
