import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Panelist } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { BackButton } from '../common/BackButton';
import { formatTimeRange } from '../../utils/timeFormat';
import {
  UserCheck,
  Plus,
  Search,
  Edit2,
  Clock,
  X
} from 'lucide-react';

export const PanelistManagement: React.FC = () => {
  const {
    panelists,
    availability,
    schedules,
    students,
    addPanelist,
    updatePanelist,
    togglePanelistStatus
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPanelist, setEditingPanelist] = useState<Panelist | null>(null);
  const [inspectAvailability, setInspectAvailability] = useState<Panelist | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('College of Information & Communications Technology');
  const [specializationsStr, setSpecializationsStr] = useState('Cloud Computing, Software Architecture');
  const [maxDefenses, setMaxDefenses] = useState<number>(6);
  const [contactNumber, setContactNumber] = useState('+63 917 000 0000');

  // Search names, user IDs, student no. (of assigned defenses), employee IDs, emails, or specializations
  const filtered = panelists.filter(p => {
    const q = searchTerm.trim().toLowerCase();
    const assignedScheds = schedules.filter(s => s.panelists.some(pa => pa.panelistId === p.id));
    const assignedStudentNos = assignedScheds.map(s => s.studentNumber.toLowerCase());
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.userId.toLowerCase().includes(q) ||
      p.employeeId.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.specializations.some(s => s.toLowerCase().includes(q)) ||
      assignedStudentNos.some(sn => sn.includes(q)) ||
      students.some(
        st =>
          st.studentNumber.toLowerCase().includes(q) &&
          assignedScheds.some(as => as.studentId === st.id)
      );

    const matchesDept = departmentFilter === 'All' || p.department.includes(departmentFilter);
    return matchesSearch && matchesDept;
  });

  const handleOpenAdd = () => {
    setEditingPanelist(null);
    setName('');
    setEmployeeId(`STI-GC-FAC-0${Math.floor(100 + Math.random() * 900)}`);
    setEmail('');
    setDepartment('College of Information & Communications Technology');
    setSpecializationsStr('Distributed Systems, Mobile Apps');
    setMaxDefenses(6);
    setContactNumber('+63 917 000 1234');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Panelist) => {
    setEditingPanelist(p);
    setName(p.name);
    setEmployeeId(p.employeeId);
    setEmail(p.email);
    setDepartment(p.department);
    setSpecializationsStr(p.specializations.join(', '));
    setMaxDefenses(p.maxDefenses ?? 6);
    setContactNumber(p.contactNumber);
    setIsModalOpen(true);
  };

  const handleSavePanelist = (e: React.FormEvent) => {
    e.preventDefault();
    const specs = specializationsStr
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (editingPanelist) {
      updatePanelist(editingPanelist.id, {
        name,
        employeeId,
        email,
        department,
        specializations: specs,
        maxDefenses: Number(maxDefenses),
        contactNumber
      });
    } else {
      addPanelist({
        name,
        employeeId,
        email: email || `${name.toLowerCase().replace(/[^a-z0-9]+/g, '.')}@globalcity.sti.edu`,
        department,
        specializations: specs,
        maxDefenses: Number(maxDefenses),
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
              <UserCheck className="w-5 h-5 text-[#005696]" />
              <h1 className="text-xl font-bold text-slate-900">Panelists</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Manage defense panelists, institutional emails, specializations, assigned defenses, and load capacities.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#005696] hover:bg-[#004478] rounded-lg flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Panelist</span>
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
              placeholder="Search by name, user ID, employee ID, institutional email, specialization, or student no...."
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

      {/* Panelists Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Panelist & Email</th>
                <th className="py-3.5 px-4">Employee ID / User ID</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Specializations</th>
                <th className="py-3.5 px-4">Assigned Defenses</th>
                <th className="py-3.5 px-4">Load Capacity</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    No panelists match your search query.
                  </td>
                </tr>
              ) : (
                filtered.map(panelist => {
                  const assignedCount = schedules.filter(
                    s =>
                      s.status !== 'Cancelled' &&
                      s.panelists.some(p => p.panelistId === panelist.id)
                  ).length;
                  const capacity = panelist.maxDefenses ?? 6;
                  const isOverloaded = assignedCount >= capacity;

                  return (
                    <tr key={panelist.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{panelist.name}</div>
                        <div className="text-[11px] text-slate-500">{panelist.email}</div>
                      </td>
                      <td className="py-3.5 px-4 tabular-nums">
                        <div className="font-semibold text-slate-800">{panelist.employeeId}</div>
                        <div className="text-[11px] text-slate-400">{panelist.userId}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {panelist.department.includes('Engineering') ? 'College of Engineering' : 'CICT'}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs text-slate-600">
                        {panelist.specializations.join(' · ')}
                      </td>
                      <td className="py-3.5 px-4 tabular-nums whitespace-nowrap">
                        <span className="font-semibold text-[#005696]">{assignedCount}</span>
                        <span className="text-slate-500"> defenses</span>
                      </td>
                      <td className="py-3.5 px-4 tabular-nums whitespace-nowrap">
                        <span className={isOverloaded ? 'font-bold text-amber-700' : 'font-semibold text-slate-800'}>
                          {assignedCount} / {capacity}
                        </span>
                        <span className="text-slate-500"> max</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={panelist.isActive ? 'Active' : 'Inactive'} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setInspectAvailability(panelist)}
                            className="px-2.5 py-1 text-xs font-semibold text-[#005696] hover:bg-blue-50 rounded-lg inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Availability</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(panelist)}
                            className="p-1.5 text-slate-600 hover:text-[#005696] hover:bg-slate-100 rounded-lg cursor-pointer"
                            title="Edit panelist"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => togglePanelistStatus(panelist.id)}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg cursor-pointer ${
                              panelist.isActive
                                ? 'text-rose-700 hover:bg-rose-50'
                                : 'text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            {panelist.isActive ? 'Deactivate' : 'Activate'}
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

      {/* Add / Edit Panelist Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingPanelist ? 'Edit Panelist Details' : 'Register New Panelist'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePanelist} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g., Engr. Francis Bautista"
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
                  <label className="block font-semibold text-slate-700 mb-1">Load Capacity (Max) *</label>
                  <input
                    type="number"
                    min={1}
                    max={25}
                    required
                    value={maxDefenses}
                    onChange={e => setMaxDefenses(Number(e.target.value))}
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
                <label className="block font-semibold text-slate-700 mb-1">
                  Specializations (comma-separated) *
                </label>
                <input
                  type="text"
                  required
                  value={specializationsStr}
                  onChange={e => setSpecializationsStr(e.target.value)}
                  placeholder="Cloud Computing, Machine Learning, IoT"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
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
                  {editingPanelist ? 'Save Changes' : 'Register Panelist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Panelist Availability Modal */}
      {inspectAvailability && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Weekly Availability — {inspectAvailability.name}
                </h3>
                <p className="text-xs text-slate-500">{inspectAvailability.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setInspectAvailability(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto text-xs">
              {availability.filter(a => a.panelistId === inspectAvailability.id).length === 0 ? (
                <p className="text-center text-slate-400 py-6">No weekly availability slots configured yet.</p>
              ) : (
                availability
                  .filter(a => a.panelistId === inspectAvailability.id)
                  .map(slot => (
                    <div
                      key={slot.id}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{slot.dayOfWeek}</div>
                        <div className="text-slate-500 tabular-nums">
                          {formatTimeRange(slot.startTime, slot.endTime)}
                        </div>
                      </div>
                      <StatusBadge status={slot.isAvailable ? 'Available' : 'Unavailable'} size="sm" />
                    </div>
                  ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setInspectAvailability(null)}
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
