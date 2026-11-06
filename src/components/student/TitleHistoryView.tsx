import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { BackButton } from '../common/BackButton';
import { History, Search, Filter, FileText, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';

export const TitleHistoryView: React.FC = () => {
  const { currentUser, students, titles } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const student = students.find(s => s.userId === currentUser.id) || students[0];
  const studentTitles = titles.filter(t => t.studentId === student.id);

  const filteredTitles = studentTitles.filter(t => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.remarks && t.remarks.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <BackButton label="Back to Dashboard" variant="subtle" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#005696]" />
              <h1 className="text-xl font-bold text-slate-900">Permanent Capstone Title History</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Historical digital archive of all submitted, approved, and rejected capstone proposals for candidate {student.name}.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 font-mono-numbers">
            <span className="p-2 bg-slate-50 rounded-lg border border-slate-200">
              Total Recorded: <strong className="text-slate-900">{studentTitles.length}</strong>
            </span>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search past titles, keywords, remarks..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005696]"
            />
          </div>

          <div className="flex gap-1.5 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
            {['All', 'Approved', 'Rejected', 'Pending'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  statusFilter === status
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {filteredTitles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold">No title records matching your filters.</p>
          </div>
        ) : (
          filteredTitles.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#005696] bg-blue-50 px-2 py-0.5 rounded font-mono-numbers">
                      {item.defenseStage}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h3>
                </div>

                <div className="text-left sm:text-right text-xs text-slate-500 font-mono-numbers shrink-0">
                  <div>Date Submitted: <strong>{item.submittedAt}</strong></div>
                  {item.reviewedAt && (
                    <div>Date Reviewed: <strong>{item.reviewedAt}</strong></div>
                  )}
                </div>
              </div>

              {/* Student and Adviser summary strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono-numbers">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Student</span>
                  <span className="font-semibold text-slate-800">{item.studentName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Student Number</span>
                  <span className="font-semibold text-slate-800">{item.studentNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Program</span>
                  <span className="font-semibold text-slate-800">{item.program}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Assigned Adviser</span>
                  <span className="font-semibold text-slate-800">{item.adviserName}</span>
                </div>
              </div>

              {/* Remarks Box */}
              {item.remarks && (
                <div
                  className={`p-3.5 rounded-xl border text-xs ${
                    item.status === 'Approved'
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                      : item.status === 'Rejected'
                      ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                      : 'bg-amber-50/70 border-amber-200 text-amber-900'
                  }`}
                >
                  <strong className="font-bold block mb-1">
                    Formal Committee Remarks:
                  </strong>
                  <p className="leading-relaxed">{item.remarks}</p>
                  {item.reviewedBy && (
                    <span className="block text-[11px] opacity-75 font-mono-numbers mt-1.5">
                      Evaluated by: {item.reviewedBy}
                    </span>
                  )}
                </div>
              )}

              {/* Abstract snippet */}
              <div className="text-xs text-slate-600 line-clamp-2">
                <strong className="text-slate-800">Abstract summary: </strong>
                {item.abstract}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
