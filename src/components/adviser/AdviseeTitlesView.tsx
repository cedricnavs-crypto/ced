import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { BackButton } from '../common/BackButton';
import { TitleStatus, CapstoneTitle } from '../../types';
import { resolveTitleGroupName } from '../../utils/studentGroups';
import {
  FileText,
  Search,
  CheckCircle2,
  X,
  FileCheck,
  Award
} from 'lucide-react';

export const AdviseeTitlesView: React.FC = () => {
  const { currentUser, advisers, students, titles, reviewCapstoneTitle } = useApp();

  const [scope, setScope] = useState<'all' | 'mine'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Approved' | 'Rejected' | 'Pending'>('All');

  const [selectedTitle, setSelectedTitle] = useState<CapstoneTitle | null>(null);
  const [endorseDecision, setEndorseDecision] = useState<TitleStatus>('Approved');
  const [toast, setToast] = useState<string | null>(null);

  const adviser = advisers.find(a => a.userId === currentUser.id) || advisers[0];

  const sourceTitles =
    scope === 'mine' ? titles.filter(t => t.adviserId === adviser.id) : titles;

  const filtered = sourceTitles.filter(t => {
    const grp = resolveTitleGroupName(t, students).toLowerCase();
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      t.title.toLowerCase().includes(q) ||
      grp.includes(q) ||
      t.studentName.toLowerCase().includes(q) ||
      t.studentNumber.toLowerCase().includes(q) ||
      t.adviserName.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenEndorse = (title: CapstoneTitle) => {
    setSelectedTitle(title);
    setEndorseDecision(title.status === 'Rejected' ? 'Rejected' : 'Approved');
  };

  const handleSaveEndorsement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTitle) return;
    reviewCapstoneTitle(
      selectedTitle.id,
      endorseDecision,
      '',
      `${adviser.name} (Adviser)`
    );
    setToast(`Updated status for "${selectedTitle.title.slice(0, 40)}..." to ${endorseDecision}.`);
    setSelectedTitle(null);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <BackButton label="Back to Dashboard" variant="subtle" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#005696]" />
              <h1 className="text-xl font-bold text-slate-900">
                Capstone / Thesis Titles (Approved, Rejected & Endorsed)
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Search and view approved, rejected, and endorsed capstone titles across the campus, or endorse proposals submitted by your handled groups.
            </p>
          </div>

          {/* Scope Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl self-start lg:self-auto">
            <button
              type="button"
              onClick={() => setScope('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                scope === 'all'
                  ? 'bg-white text-[#005696] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Titles Directory ({titles.length})
            </button>
            <button
              type="button"
              onClick={() => setScope('mine')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                scope === 'mine'
                  ? 'bg-white text-[#005696] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Handled Groups ({titles.filter(t => t.adviserId === adviser.id).length})
            </button>
          </div>
        </div>

        {/* Search & Status Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search title keywords, group name, student, or adviser..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005696]"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto text-xs">
            {[
              { id: 'All', label: 'All' },
              { id: 'Approved', label: 'Approved / Endorsed' },
              { id: 'Rejected', label: 'Rejected' },
              { id: 'Pending', label: 'Pending Endorsement' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as typeof statusFilter)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-white text-[#005696] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Highlight Legend for Campus Directory */}
        {scope === 'all' && (
          <div className="flex items-center gap-3 text-xs text-slate-600 pt-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-amber-100 border border-amber-400 inline-block" />
              <span className="font-medium text-slate-800">
                Highlighted = Students / Group Assigned to You
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Titles List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          No capstone or thesis titles match your current search and filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(item => {
            const grpName = resolveTitleGroupName(item, students);
            const isMyAdvisee = item.adviserId === adviser.id;

            return (
              <div
                key={item.id}
                className={`rounded-2xl border p-5 shadow-2xs space-y-3 transition-colors ${
                  isMyAdvisee
                    ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-200/80'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-[#005696] uppercase">
                      {grpName}
                    </span>
                    {isMyAdvisee && (
                      <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
                        Assigned to You (Adviser)
                      </span>
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono-numbers">
                      {item.defenseStage}
                    </span>
                    {item.status === 'Approved' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Award className="w-3 h-3" />
                        Endorsed
                      </span>
                    )}
                    <StatusBadge status={item.status} size="sm" />
                  </div>

                  <span className="text-xs text-slate-500 font-mono-numbers">
                    Submitted: {item.submittedAt}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">{item.abstract}</p>

                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
                  <div>
                    Submitted by: <strong className="text-slate-800">{item.studentName}</strong> · Adviser:{' '}
                    <strong className="text-slate-800">{item.adviserName}</strong>
                  </div>

                  {isMyAdvisee && (
                    <button
                      type="button"
                      onClick={() => handleOpenEndorse(item)}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#005696] hover:bg-[#004478] rounded-lg cursor-pointer self-start sm:self-auto"
                    >
                      Review / Endorse Title
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review / Endorse Modal for Supervised Groups */}
      {selectedTitle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Endorse / Review Group Title</h3>
              <button
                type="button"
                onClick={() => setSelectedTitle(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="font-bold text-[#005696] uppercase block">
                {resolveTitleGroupName(selectedTitle, students)}
              </span>
              <p className="font-semibold text-slate-900 mt-1">{selectedTitle.title}</p>
            </div>

            <form onSubmit={handleSaveEndorsement} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Endorsement Status</label>
                <select
                  value={endorseDecision}
                  onChange={e => setEndorseDecision(e.target.value as TitleStatus)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Approved">Approved / Endorsed for Defense</option>
                  <option value="Rejected">Rejected (Revision Needed)</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedTitle(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-[#005696] hover:bg-[#004478] rounded-lg cursor-pointer"
                >
                  Save Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
