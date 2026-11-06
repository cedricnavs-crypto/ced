import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Adviser } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { BackButton } from '../common/BackButton';
import { getStudentGroupLabel } from '../../utils/studentGroups';
import {
  GraduationCap,
  Plus,
  Search,
  Edit2,
  Users,
  X
} from 'lucide-react';

export const AdviserManagement: React.FC = () => {
  const { advisers, students, addAdviser, updateAdviser, toggleAdviserStatus } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdviser, setEditingAdviser] = useState<Adviser | null>(null);
  const [inspectAdvisees, setInspectAdvisees] = useState<Adviser | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('College of Information & Communications Technology');
  const [maxAdvisees, setMaxAdvisees] = useState(8);
  const [contactNumber, setContactNumber] = useState('+63 917 000 0000');

  // Search names, user IDs, student no. (of handled students), employee IDs, and emails
  const filtered = advisers.filter(a => {
    const q = searchTerm.trim().toLowerCase();
    const handledStudents = students.filter(s => s.adviserId === a.id);
    const matchesSearch =
      !q ||
      a.name.toLowerCase().includes(q) ||
      a.userId.toLowerCase().includes(q) ||
      a.employeeId.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      handledStudents.some(
        s =>
          s.studentNumber.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          getStudentGroupLabel(s).toLowerCase().includes(q)
      );
    const matchesDept = departmentFilter === 'All' || a.department.includes(departmentFilter);
    return matchesSearch && matchesDept;
  });

  const getHandledGroups = (adviserId: string) => {
    const advStudents = students.filter(s => s.adviserId === adviserId);
    const groupMap = new Map<string, { groupName: string; program: string; count: number }>();
    advStudents.forEach(s => {
      const grp = getStudentGroupLabel(s);
      const key = `${s.program}::${grp}`;
      const existing = groupMap.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        groupMap.set(key, { groupName: grp, program: s.program, count: 1 });
      }
    });
    return Array.from(groupMap.values());
  };

  const handleOpenAdd = () => {
    setEditingAdviser(null);
    setName('');
    setEmployeeId(`STI-GC-ADV-0${Math.floor(100 + Math.random() * 900)}`);
    setEmail('');
    setDepartment('College of Information & Communications Technology');
    setMaxAdvisees(8);
    setContactNumber('+63 917 000 1234');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (a: Adviser) => {
    setEditingAdviser(a);
    setName(a.name);
    setEmployeeId(a.employeeId);
    setEmail(a.email);
    setDepartment(a.department);
    setMaxAdvisees(a.maxAdvisees);
    setContactNumber(a.contactNumber);
    setIsModalOpen(true);
  };

  const handleSaveAdviser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAdviser) {
      updateAdviser(editingAdviser.id, {
        name,
        employeeId,
        email,
        department,
        maxAdvisees: Number(maxAdvisees),
        contactNumber
      });
    } else {
      addAdviser({
        name,
        employeeId,
        email: email || `${name.toLowerCase().replace(/[^a-z0-9]+/g, '.')}@globalcity.sti.edu`,
        department,
        specializations: ['Mentorship', 'Software Engineering'],
        maxAdvisees: Number(maxAdvisees),
        contactNumber,
        isActive: true
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <BackButton label="Back to Dashboard" variant="subtle" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#005696]" />
              <h1 className="text-xl font-bold text-slate-900">Advisers</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Manage capstone advisers, institutional emails, handled groups, and load capacities.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#005696] hover:bg-[#004478] rounded-lg flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Adviser</span>
          </button>
        </div>

        {/* Search & Department Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name, user ID, employee ID, institutional email, or advisee student no...."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005696]"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
          >
            <option value="All">All Departments</option>
            <option value="Information & Communications">CICT Department</option>
            <option value="Engineering">Engineering Department</option>
          </select>
        </div>
      </div>

      {/* Advisers Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Adviser & Email</th>
                <th className="py-3.5 px-4">Employee ID / User ID</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Handled Groups</th>
                <th className="py-3.5 px-4">Load Capacity</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No advisers match your search query.
                  </td>
                </tr>
              ) : (
                filtered.map(adviser => {
                  const handledGroups = getHandledGroups(adviser.id);
                  const isAtCapacity = handledGroups.length >= adviser.maxAdvisees;

                  return (
                    <tr key={adviser.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{adviser.name}</div>
                        <div className="text-[11px] text-slate-500">{adviser.email}</div>
                      </td>
                      <td className="py-3.5 px-4 tabular-nums">
                        <div className="font-semibold text-slate-800">{adviser.employeeId}</div>
                        <div className="text-[11px] text-slate-400">{adviser.userId}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {adviser.department.includes('Engineering') ? 'College of Engineering' : 'CICT'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#005696] tabular-nums">
                          {handledGroups.length} group{handledGroups.length !== 1 ? 's' : ''}
                        </div>
                        {handledGroups.length > 0 && (
                          <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                            {handledGroups.map(g => g.groupName).join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 tabular-nums whitespace-nowrap">
                        <span className={isAtCapacity ? 'font-bold text-amber-700' : 'font-semibold text-slate-800'}>
                          {handledGroups.length} / {adviser.maxAdvisees}
                        </span>
                        <span className="text-slate-500"> groups</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={adviser.isActive ? 'Active' : 'Inactive'} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setInspectAdvisees(adviser)}
                            className="px-2.5 py-1 text-xs font-semibold text-[#005696] hover:bg-blue-50 rounded-lg inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>Groups</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(adviser)}
                            className="p-1.5 text-slate-600 hover:text-[#005696] hover:bg-slate-100 rounded-lg cursor-pointer"
                            title="Edit adviser"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleAdviserStatus(adviser.id)}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg cursor-pointer ${
                              adviser.isActive
                                ? 'text-rose-700 hover:bg-rose-50'
                                : 'text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            {adviser.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Adviser Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingAdviser ? 'Edit Adviser Details' : 'Register New Adviser'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdviser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g., Dr. Maria Santos"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={employeeId}
                    onChange={e => setEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Group Capacity *</label>
                  <input
                    type="number"
                    min={1}
                    max={25}
                    required
                    value={maxAdvisees}
                    onChange={e => setMaxAdvisees(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Institutional Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@globalcity.sti.edu"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department *</label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="College of Information & Communications Technology">
                    College of Information & Communications Technology
                  </option>
                  <option value="College of Engineering">College of Engineering</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Number</label>
                <input
                  type="text"
                  value={contactNumber}
                  onChange={e => setContactNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 tabular-nums"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-[#005696] hover:bg-[#004478] rounded-lg cursor-pointer"
                >
                  {editingAdviser ? 'Save Changes' : 'Register Adviser'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Handled Groups Modal */}
      {inspectAdvisees && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Handled Groups — {inspectAdvisees.name}
                </h3>
                <p className="text-xs text-slate-500">{inspectAdvisees.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setInspectAdvisees(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto text-xs">
              {getHandledGroups(inspectAdvisees.id).length === 0 ? (
                <p className="text-center text-slate-400 py-6">No capstone groups currently assigned.</p>
              ) : (
                getHandledGroups(inspectAdvisees.id).map(g => {
                  const members = students.filter(
                    s =>
                      s.adviserId === inspectAdvisees.id &&
                      getStudentGroupLabel(s) === g.groupName &&
                      s.program === g.program
                  );
                  return (
                    <div key={`${g.program}-${g.groupName}`} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{g.groupName}</span>
                        <span className="text-[11px] text-slate-500 font-medium">{g.program}</span>
                      </div>
                      <div className="text-slate-600">
                        Members: {members.map(m => `${m.name} (${m.studentNumber})`).join(', ')}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setInspectAdvisees(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
