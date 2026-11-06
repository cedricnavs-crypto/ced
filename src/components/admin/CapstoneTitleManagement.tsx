import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CapstoneTitle, TitleStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { BackButton } from '../common/BackButton';
import { getGroupMembers, resolveTitleGroupName } from '../../utils/studentGroups';
import {
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  X
} from 'lucide-react';

export const CapstoneTitleManagement: React.FC = () => {
  const { titles, students, reviewCapstoneTitle } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [programFilter, setProgramFilter] = useState('All');

  const [selectedTitle, setSelectedTitle] = useState<CapstoneTitle | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [successAction, setSuccessAction] = useState<string | null>(null);

  const filtered = titles.filter(t => {
    const grp = resolveTitleGroupName(t, students);
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      t.title.toLowerCase().includes(q) ||
      grp.toLowerCase().includes(q) ||
      t.studentName.toLowerCase().includes(q) ||
      t.studentNumber.toLowerCase().includes(q) ||
      t.adviserName.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesProg = programFilter === 'All' || t.program === programFilter;
    return matchesSearch && matchesStatus && matchesProg;
  });

  const handleOpenReview = (title: CapstoneTitle) => {
    setSelectedTitle(title);
    setIsReviewOpen(true);
  };

  const handleDecision = (status: TitleStatus) => {
    if (!selectedTitle) return;
    reviewCapstoneTitle(selectedTitle.id, status, '');
    setSuccessAction(`Title status updated to ${status}.`);
    setTimeout(() => {
      setSuccessAction(null);
      setIsReviewOpen(false);
      setSelectedTitle(null);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <BackButton label="Back to Dashboard" variant="subtle" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#005696]" />
              <h1 className="text-xl font-bold text-slate-900">
                Capstone / Thesis Titles (Approved & Rejected)
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Search and view approved, rejected, and submitted endorsed titles. Edit title status as Approved or Rejected.
            </p>
          </div>

          <div className="text-xs text-slate-600 tabular-nums px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 self-start sm:self-auto">
            Total Titles: <strong className="text-slate-900">{titles.length}</strong>
          </div>
        </div>

        {/* Search & Segmented Status Tabs */}
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by capstone title, group name, student name/no., or adviser..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005696]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center p-1 bg-slate-100 rounded-lg">
              {[
                { key: 'All', label: 'All Titles' },
                { key: 'Approved', label: 'Approved' },
                { key: 'Rejected', label: 'Rejected' },
                { key: 'Pending', label: 'Endorsed / Pending' }
              ].map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    statusFilter === tab.key
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

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

      {/* Table of Titles */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Group & Program</th>
                <th className="py-3.5 px-4">Endorsed / Proposed Title</th>
                <th className="py-3.5 px-4">Adviser</th>
                <th className="py-3.5 px-4">Submitted</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Edit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No capstone or thesis titles match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map(title => {
                  const grp = resolveTitleGroupName(title, students);
                  return (
                    <tr key={title.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{grp}</div>
                        <div className="text-[11px] text-slate-500">
                          {title.program}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-md">
                        <div className="font-semibold text-slate-900 leading-snug line-clamp-2">
                          {title.title}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                        {title.adviserName}
                      </td>
                      <td className="py-3.5 px-4 tabular-nums text-slate-600 whitespace-nowrap">
                        {title.submittedAt}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={title.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenReview(title)}
                          className="px-3 py-1.5 text-xs font-semibold text-[#005696] hover:bg-blue-50 rounded-lg border border-blue-200 cursor-pointer"
                        >
                          Edit Status
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Title Status Modal */}
      {isReviewOpen && selectedTitle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 border border-slate-200 my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Edit Endorsed Title Status — {resolveTitleGroupName(selectedTitle, students)}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedTitle.program} · Adviser: {selectedTitle.adviserName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successAction ? (
              <div className="py-10 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-900">{successAction}</h4>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 text-sm">{selectedTitle.title}</span>
                    <StatusBadge status={selectedTitle.status} size="sm" />
                  </div>
                  <div className="text-slate-600">
                    Members:{' '}
                    {getGroupMembers(
                      students,
                      resolveTitleGroupName(selectedTitle, students),
                      selectedTitle.program
                    )
                      .map(m => m.name)
                      .join(', ') || selectedTitle.studentName}
                  </div>
                </div>

                <div>
                  <div className="font-semibold text-slate-800 mb-1">Abstract / Brief Description</div>
                  <p className="text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                    {selectedTitle.abstract}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsReviewOpen(false)}
                    className="px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Close
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDecision('Rejected')}
                      className="px-4 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Mark Rejected</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDecision('Approved')}
                      className="px-4 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Approved</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
