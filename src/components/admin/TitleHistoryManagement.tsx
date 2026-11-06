import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { BackButton } from '../common/BackButton';
import { History, Search, Filter, Download, Printer, FileText } from 'lucide-react';

export const TitleHistoryManagement: React.FC = () => {
  const { titles } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [programFilter, setProgramFilter] = useState('All');

  const filtered = titles.filter(t => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.studentNumber.includes(searchTerm) ||
      t.adviserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.remarks && t.remarks.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesProg = programFilter === 'All' || t.program === programFilter;
    return matchesSearch && matchesStatus && matchesProg;
  });

  const handleExportCSV = () => {
    const headers = [
      'Student Name',
      'Student Number',
      'Program',
      'Adviser',
      'Capstone Title',
      'Date Submitted',
      'Status',
      'Remarks',
      'Date Reviewed',
      'Reviewed By'
    ];
    const rows = filtered.map(t => [
      `"${t.studentName}"`,
      `"${t.studentNumber}"`,
      `"${t.program}"`,
      `"${t.adviserName}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.submittedAt}"`,
      `"${t.status}"`,
      `"${(t.remarks || '').replace(/"/g, '""')}"`,
      `"${t.reviewedAt || 'N/A'}"`,
      `"${t.reviewedBy || 'N/A'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `STI_Capstone_Title_History_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <BackButton label="Back to Dashboard" variant="subtle" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#005696]" />
              <h1 className="text-xl font-bold text-slate-900">
                Permanent Capstone Title Historical Archive
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Institutional tamper-proof record of all proposed, approved, and rejected capstone manuscripts across academic years.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Archive</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search historical titles, student numbers, keywords, remarks..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005696]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
            >
              <option value="All">All Historical Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Pending">Pending</option>
            </select>

            <select
              value={programFilter}
              onChange={e => setProgramFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
            >
              <option value="All">All Programs</option>
              <option value="BSIT">BSIT</option>
              <option value="BSCS">BSCS</option>
              <option value="BSCpE">BSCpE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Historical Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Student Number</th>
                <th className="py-3 px-4">Program</th>
                <th className="py-3 px-4">Adviser</th>
                <th className="py-3 px-4">Capstone Title</th>
                <th className="py-3 px-4">Date Submitted</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Committee Remarks</th>
                <th className="py-3 px-4">Date Reviewed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No archival title records matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {item.studentName}
                    </td>
                    <td className="py-3 px-4 font-mono-numbers text-slate-600 whitespace-nowrap">
                      {item.studentNumber}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-mono-numbers">
                        {item.program}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                      {item.adviserName}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900 line-clamp-2 leading-snug" title={item.title}>
                        {item.title}
                      </div>
                      <span className="text-[10px] text-[#005696] font-mono-numbers">
                        {item.defenseStage}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono-numbers text-slate-600 whitespace-nowrap">
                      {item.submittedAt}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 max-w-xs text-[11px] text-slate-600 italic">
                      {item.remarks || '—'}
                    </td>
                    <td className="py-3 px-4 font-mono-numbers text-slate-600 whitespace-nowrap">
                      {item.reviewedAt || 'Pending'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
