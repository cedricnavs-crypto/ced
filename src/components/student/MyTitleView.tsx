import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { BackButton } from '../common/BackButton';
import { SubmitTitleModal } from './SubmitTitleModal';
import {
  getStudentGroupLabel,
  getTitlesForStudentGroup,
  resolveTitleGroupName
} from '../../utils/studentGroups';
import {
  FileText,
  Search,
  PlusCircle,
  Award,
  Lock
} from 'lucide-react';

export const MyTitleView: React.FC = () => {
  const { currentUser, students, titles, settings } = useApp();
  const [tab, setTab] = useState<'my-group' | 'directory'>('my-group');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Approved' | 'Rejected' | 'Pending'>('All');
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  const student = students.find(s => s.userId === currentUser.id) || students[0];
  const groupName = getStudentGroupLabel(student);
  const myGroupTitles = getTitlesForStudentGroup(student, titles, students);
  const activeTitle = myGroupTitles[0] || null;

  const filteredDirectory = titles.filter(t => {
    const grp = resolveTitleGroupName(t, students).toLowerCase();
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      t.title.toLowerCase().includes(q) ||
      t.abstract.toLowerCase().includes(q) ||
      grp.includes(q) ||
      t.adviserName.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header & Switcher */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <BackButton label="Back to Dashboard" variant="subtle" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#005696]" />
              <h1 className="text-xl font-bold text-slate-900">
                Capstone / Thesis Titles (Approved, Rejected & Endorsed)
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Submit your group&apos;s endorsed capstone title to the database, or search approved, rejected, and endorsed titles for reference.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setTab('my-group')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  tab === 'my-group'
                    ? 'bg-white text-[#005696] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                My Group&apos;s Endorsed Title
              </button>
              <button
                type="button"
                onClick={() => setTab('directory')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  tab === 'directory'
                    ? 'bg-white text-[#005696] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Approved / Rejected Directory ({titles.length})
              </button>
            </div>

            {settings.allowSubmissions ? (
              <button
                type="button"
                onClick={() => setIsSubmitOpen(true)}
                className="px-4 py-2 text-xs font-bold text-white bg-[#005696] hover:bg-[#004478] rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit Endorsed Title</span>
              </button>
            ) : (
              <span className="px-3 py-2 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Submission Locked</span>
              </span>
            )}
          </div>
        </div>

        {tab === 'directory' && (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search approved, rejected, or endorsed titles by keyword, group, or adviser..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005696]"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl text-xs">
              {[
                { id: 'All', label: 'All' },
                { id: 'Approved', label: 'Approved / Endorsed' },
                { id: 'Rejected', label: 'Rejected' },
                { id: 'Pending', label: 'Pending' }
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStatusFilter(item.id as typeof statusFilter)}
                  className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
                    statusFilter === item.id
                      ? 'bg-white text-[#005696] shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* TAB 1: My Group's Endorsed Title */}
      {tab === 'my-group' ? (
        !activeTitle ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">
              No Endorsed Title Submitted Yet for {groupName}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Submit your group&apos;s endorsed capstone or thesis title so it is saved in the database and queued for defense scheduling.
            </p>
            {settings.allowSubmissions && (
              <button
                type="button"
                onClick={() => setIsSubmitOpen(true)}
                className="px-4 py-2 text-xs font-bold text-white bg-[#005696] hover:bg-[#004478] rounded-xl cursor-pointer"
              >
                Submit Endorsed Title
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {myGroupTitles.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-[#005696] uppercase">{groupName}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono-numbers">
                      {item.defenseStage}
                    </span>
                    {item.status === 'Approved' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Award className="w-3.5 h-3.5" />
                        Endorsed
                      </span>
                    )}
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                <h2 className="text-lg font-bold text-slate-900 leading-snug">{item.title}</h2>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.abstract}</p>

                {item.problemStatement && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                    <strong className="text-slate-900 block mb-1">Problem Statement:</strong>
                    {item.problemStatement}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono-numbers text-slate-600 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Group</span>
                    <strong className="text-slate-900">{groupName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Adviser</span>
                    <strong className="text-slate-900">{item.adviserName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Submitted</span>
                    <strong className="text-slate-900">{item.submittedAt}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Status</span>
                    <strong className="text-slate-900">{item.status}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* TAB 2: Campus Approved / Rejected / Endorsed Titles Directory */
        <div className="space-y-3">
          {filteredDirectory.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400">
              No titles found matching your search.
            </div>
          ) : (
            filteredDirectory.map(item => {
              const grp = resolveTitleGroupName(item, students);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-[#005696] uppercase">{grp}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono-numbers">
                        {item.defenseStage}
                      </span>
                      {item.status === 'Approved' && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Endorsed
                        </span>
                      )}
                    </div>
                    <StatusBadge status={item.status} size="sm" />
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{item.abstract}</p>

                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                    <span>
                      Adviser: <strong className="text-slate-700">{item.adviserName}</strong>
                    </span>
                    <span className="font-mono-numbers">Submitted: {item.submittedAt}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <SubmitTitleModal isOpen={isSubmitOpen} onClose={() => setIsSubmitOpen(false)} />
    </div>
  );
};
