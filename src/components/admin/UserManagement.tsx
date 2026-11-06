import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { BackButton } from '../common/BackButton';
import { DEFAULT_STUDENT_PASSWORD } from '../../data/mockData';
import {
  UserCog,
  Search,
  KeyRound,
  CheckCircle2,
  X
} from 'lucide-react';

interface UnifiedAccountRow {
  id: string;
  accountUserId: string;
  displayIdNo: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  isActive: boolean;
}

export const UserManagement: React.FC = () => {
  const { students, panelists, advisers, resetUserPassword } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [resetModalUser, setResetModalUser] = useState<UnifiedAccountRow | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState(DEFAULT_STUDENT_PASSWORD);
  const [resetSuccess, setResetSuccess] = useState(false);

  const unifiedUsers: UnifiedAccountRow[] = [
    ...students.map(s => ({
      id: s.id,
      accountUserId: s.userId,
      displayIdNo: s.studentNumber,
      name: s.name,
      email: s.email,
      role: 'student' as UserRole,
      department: `${s.program} (${s.section})`,
      isActive: s.isActive
    })),
    ...panelists.map(p => ({
      id: p.id,
      accountUserId: p.userId,
      displayIdNo: p.employeeId,
      name: p.name,
      email: p.email,
      role: 'panelist' as UserRole,
      department: p.department.includes('Engineering') ? 'College of Engineering' : 'CICT',
      isActive: p.isActive
    })),
    ...advisers.map(a => ({
      id: a.id,
      accountUserId: a.userId,
      displayIdNo: a.employeeId,
      name: a.name,
      email: a.email,
      role: 'adviser' as UserRole,
      department: a.department.includes('Engineering') ? 'College of Engineering' : 'CICT',
      isActive: a.isActive
    })),
    {
      id: 'user-admin-1',
      accountUserId: 'user-admin-1',
      displayIdNo: 'STI-GC-ADM-0010',
      name: 'Prof. Arnold V. Mercado',
      email: 'arnold.mercado@globalcity.sti.edu',
      role: 'admin' as UserRole,
      department: 'Academic Affairs',
      isActive: true
    }
  ];

  // Search names, user IDs, student no. / employee IDs, and emails
  const filtered = unifiedUsers.filter(u => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.accountUserId.toLowerCase().includes(q) ||
      u.displayIdNo.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q);
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleOpenResetModal = (u: UnifiedAccountRow) => {
    setResetModalUser(u);
    setNewPasswordInput(u.role === 'student' ? DEFAULT_STUDENT_PASSWORD : 'sti2026!');
    setResetSuccess(false);
  };

  const handleConfirmReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser) return;
    resetUserPassword(resetModalUser.id, resetModalUser.role, newPasswordInput);
    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
      setResetModalUser(null);
    }, 1200);
  };

  const roleTabs = [
    { key: 'All', label: `All (${unifiedUsers.length})` },
    { key: 'student', label: `Students (${students.length})` },
    { key: 'panelist', label: `Panels (${panelists.length})` },
    { key: 'adviser', label: `Advisers (${advisers.length})` }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <BackButton label="Back to Dashboard" variant="subtle" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <UserCog className="w-5 h-5 text-[#005696]" />
              <h1 className="text-xl font-bold text-slate-900">User Management</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Directory of all student, panelist, adviser, and coordinator accounts with password reset controls.
            </p>
          </div>

          <div className="text-xs text-slate-600 tabular-nums px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 self-start sm:self-auto">
            Total Accounts: <strong className="text-slate-900">{unifiedUsers.length}</strong>
          </div>
        </div>

        {/* Search & Role Filter Buttons (Students, Panels, Advisers) */}
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name, user ID, student no., or institutional email..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005696]"
            />
          </div>

          <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-lg self-start lg:self-auto">
            {roleTabs.map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setRoleFilter(tab.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  roleFilter === tab.key
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">User ID / ID No.</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Program / Dept</th>
                <th className="py-3.5 px-4">Institutional Email</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No user accounts match your search query.
                  </td>
                </tr>
              ) : (
                filtered.map(u => (
                  <tr key={`${u.role}-${u.id}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {u.name}
                    </td>
                    <td className="py-3.5 px-4 tabular-nums whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{u.displayIdNo}</div>
                      <div className="text-[11px] text-slate-400">{u.accountUserId}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap capitalize font-semibold text-slate-700">
                      {u.role}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">
                      {u.department}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={u.isActive ? 'Active' : 'Inactive'} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenResetModal(u)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                        <span>Reset Pass</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Password Reset Modal */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Reset Account Password
              </h3>
              <button
                type="button"
                onClick={() => setResetModalUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {resetSuccess ? (
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Password reset saved for {resetModalUser.name}.</span>
              </div>
            ) : (
              <form onSubmit={handleConfirmReset} className="space-y-4 text-xs">
                <div className="text-slate-600 space-y-0.5">
                  <div className="font-bold text-slate-900">{resetModalUser.name}</div>
                  <div>{resetModalUser.email}</div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    New / Default Password *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPasswordInput}
                    onChange={e => setNewPasswordInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setResetModalUser(null)}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#005696] hover:bg-[#004478] rounded-lg cursor-pointer"
                  >
                    Confirm Reset
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
