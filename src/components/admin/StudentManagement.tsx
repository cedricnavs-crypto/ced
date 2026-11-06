import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { DEFAULT_STUDENT_PASSWORD } from '../../data/mockData';
import { StatusBadge } from '../common/StatusBadge';
import { BackButton } from '../common/BackButton';
import {
  getStudentGroupLabel,
  normalizeGroupName
} from '../../utils/studentGroups';
import {
  Users,
  Plus,
  Search,
  Edit2,
  X,
  CheckCircle2,
  Eye,
  EyeOff,
  FolderKanban,
  ChevronDown,
  ChevronRight,
  CheckSquare,
  Square
} from 'lucide-react';

type ViewMode = 'programs' | 'roster';

export const StudentManagement: React.FC = () => {
  const {
    students,
    advisers,
    programs,
    addStudent,
    updateStudent,
    bulkUpdateStudents,
    toggleStudentStatus,
    addProgram
  } = useApp();

  const [viewMode, setViewMode] = useState<ViewMode>('programs');
  const [searchTerm, setSearchTerm] = useState('');
  const [programFilter, setProgramFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Expanded groups in Programs -> Groups -> Students hierarchy
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'BSIT::NAVAJAS GROUP': true,
    'BSIT::DELA CRUZ GROUP': true,
    'BSCS::REYES GROUP': true,
    'BSCpE::NAVARRO GROUP': true
  });

  // Multi-select student IDs
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAdviserId, setBulkAdviserId] = useState('');
  const [bulkGroupInput, setBulkGroupInput] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add / Edit Student Modal
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [name, setName] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [program, setProgram] = useState(programs[0]?.code || 'BSIT');
  const [section, setSection] = useState('BSIT-401A');
  const [groupName, setGroupName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('+63 917 000 0000');
  const [password, setPassword] = useState(DEFAULT_STUDENT_PASSWORD);
  const [showPassword, setShowPassword] = useState(true);
  const [adviserId, setAdviserId] = useState(advisers[0]?.id || '');

  // Add Program Modal
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [progCode, setProgCode] = useState('');
  const [progName, setProgName] = useState('');
  const [progDepartment, setProgDepartment] = useState('College of Information & Communications Technology');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Search names, user IDs, student no., emails, or group name
  const filteredStudents = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return students.filter(s => {
      const grp = getStudentGroupLabel(s).toLowerCase();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.userId.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.studentNumber.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        grp.includes(q);
      const matchesProg = programFilter === 'All' || s.program === programFilter;
      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Active' ? s.isActive : !s.isActive);
      return matchesSearch && matchesProg && matchesStatus;
    });
  }, [students, searchTerm, programFilter, statusFilter]);

  // Programs -> Groups -> Students hierarchy
  const programHierarchy = useMemo(() => {
    const visiblePrograms = programs.filter(
      p => programFilter === 'All' || p.code === programFilter
    );

    return visiblePrograms.map(prog => {
      const progStudents = filteredStudents.filter(s => s.program === prog.code);
      const groupMap = new Map<string, Student[]>();

      progStudents.forEach(s => {
        const gLabel = getStudentGroupLabel(s);
        const existing = groupMap.get(gLabel) || [];
        existing.push(s);
        groupMap.set(gLabel, existing);
      });

      const groups = Array.from(groupMap.entries())
        .map(([gName, members]) => ({
          groupName: gName,
          adviserName: members[0]?.adviserName || 'Unassigned',
          section: members[0]?.section || `${prog.code}-401A`,
          members
        }))
        .sort((a, b) => a.groupName.localeCompare(b.groupName));

      return {
        program: prog,
        totalStudents: progStudents.length,
        groups
      };
    });
  }, [programs, filteredStudents, programFilter]);

  const toggleSelectStudent = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectGroup = (members: Student[]) => {
    const memberIds = members.map(m => m.id);
    const allSelected = memberIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !memberIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...memberIds])));
    }
  };

  const toggleSelectAllFiltered = () => {
    const visibleIds = filteredStudents.map(s => s.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleBulkAssignAdviser = () => {
    if (!bulkAdviserId || selectedIds.length === 0) return;
    const adv = advisers.find(a => a.id === bulkAdviserId);
    if (!adv) return;
    bulkUpdateStudents(selectedIds, { adviserId: adv.id, adviserName: adv.name });
    showToast(`Assigned ${adv.name} to ${selectedIds.length} selected student(s).`);
    setBulkAdviserId('');
    setSelectedIds([]);
  };

  const handleBulkAssignGroup = () => {
    if (!bulkGroupInput.trim() || selectedIds.length === 0) return;
    const normalized = normalizeGroupName(bulkGroupInput);
    bulkUpdateStudents(selectedIds, { groupName: normalized });
    showToast(`Moved ${selectedIds.length} student(s) to ${normalized}.`);
    setBulkGroupInput('');
    setSelectedIds([]);
  };

  const handleBulkStatus = (isActive: boolean) => {
    if (selectedIds.length === 0) return;
    bulkUpdateStudents(selectedIds, { isActive });
    showToast(`Marked ${selectedIds.length} student(s) as ${isActive ? 'Active' : 'Inactive'}.`);
    setSelectedIds([]);
  };

  const handleOpenAddStudent = () => {
    setEditingStudent(null);
    setName('');
    setStudentNumber(`020002${Math.floor(10000 + Math.random() * 90000)}`);
    const defaultProg = programs[0]?.code || 'BSIT';
    setProgram(defaultProg);
    setSection(`${defaultProg}-401A`);
    setGroupName('');
    setEmail('');
    setContactNumber('+63 917 000 0000');
    setPassword(DEFAULT_STUDENT_PASSWORD);
    setShowPassword(true);
    setAdviserId(advisers[0]?.id || '');
    setIsStudentModalOpen(true);
  };

  const handleOpenEditStudent = (student: Student) => {
    setEditingStudent(student);
    setName(student.name);
    setStudentNumber(student.studentNumber);
    setProgram(student.program);
    setSection(student.section);
    setGroupName(getStudentGroupLabel(student));
    setEmail(student.email);
    setContactNumber(student.contactNumber);
    setPassword(student.password || DEFAULT_STUDENT_PASSWORD);
    setShowPassword(false);
    setAdviserId(student.adviserId);
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !studentNumber.trim()) return;

    const chosenAdviser = advisers.find(a => a.id === adviserId) || advisers[0];
    const computedEmail =
      email.trim() ||
      `${name.toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.')}@globalcity.sti.edu`;
    const computedGroup = groupName.trim()
      ? normalizeGroupName(groupName)
      : normalizeGroupName(name.trim().split(' ').slice(-1)[0]);

    if (editingStudent) {
      updateStudent(editingStudent.id, {
        name: name.trim(),
        studentNumber: studentNumber.trim(),
        program,
        section: section.trim(),
        groupName: computedGroup,
        email: computedEmail,
        contactNumber: contactNumber.trim(),
        password: password.trim() || DEFAULT_STUDENT_PASSWORD,
        adviserId: chosenAdviser?.id || '',
        adviserName: chosenAdviser?.name || 'Unassigned'
      });
      showToast(`Updated student record for ${name.trim()}.`);
    } else {
      addStudent({
        name: name.trim(),
        studentNumber: studentNumber.trim(),
        program,
        section: section.trim() || `${program}-401A`,
        groupName: computedGroup,
        email: computedEmail,
        contactNumber: contactNumber.trim(),
        password: password.trim() || DEFAULT_STUDENT_PASSWORD,
        adviserId: chosenAdviser?.id || '',
        adviserName: chosenAdviser?.name || 'Unassigned',
        isActive: true
      });
      showToast(`Registered ${name.trim()} in ${computedGroup} (Default Password: ${password.trim() || DEFAULT_STUDENT_PASSWORD}).`);
    }

    setIsStudentModalOpen(false);
  };

  const handleSaveProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!progCode.trim() || !progName.trim()) return;
    addProgram({
      code: progCode.trim().toUpperCase(),
      name: progName.trim(),
      department: progDepartment.trim(),
      durationYears: 4,
      activeStudents: 0
    });
    showToast(`Added academic program ${progCode.trim().toUpperCase()}.`);
    setProgCode('');
    setProgName('');
    setIsProgramModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2.5 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <BackButton label="Back to Dashboard" variant="subtle" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-[#005696]" />
              <h1 className="text-xl font-bold text-slate-900">Students & Academic Programs</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              View coordinator programs, capstone groups inside each program, and enrolled student details. Select multiple students for bulk actions or register new accounts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Switcher */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('programs')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'programs'
                    ? 'bg-white text-[#005696] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Programs & Groups
              </button>
              <button
                type="button"
                onClick={() => setViewMode('roster')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'roster'
                    ? 'bg-white text-[#005696] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Students Table ({filteredStudents.length})
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsProgramModalOpen(true)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
            >
              + Program
            </button>

            <button
              type="button"
              onClick={handleOpenAddStudent}
              className="px-4 py-2 text-xs font-bold text-white bg-[#005696] hover:bg-[#004478] rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Student</span>
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search student name, user ID, student no., institutional email, or group..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005696]"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={programFilter}
              onChange={e => setProgramFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#005696]"
            >
              <option value="All">All Handled Programs</option>
              {programs.map(p => (
                <option key={p.id} value={p.code}>
                  {p.code} — {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#005696]"
            >
              <option value="All">All Student Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Multi-Select Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="p-3.5 rounded-xl bg-blue-50/90 border border-blue-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#00335e]">
              <CheckSquare className="w-4 h-4 text-[#005696]" />
              <span>{selectedIds.length} student(s) selected</span>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 underline ml-2 cursor-pointer"
              >
                Clear selection
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={bulkGroupInput}
                  onChange={e => setBulkGroupInput(e.target.value)}
                  placeholder="e.g. NAVAJAS GROUP"
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white w-40"
                />
                <button
                  type="button"
                  onClick={handleBulkAssignGroup}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-[#005696] text-white rounded-lg hover:bg-[#004478] cursor-pointer"
                >
                  Set Group
                </button>
              </div>

              <div className="flex items-center gap-1">
                <select
                  value={bulkAdviserId}
                  onChange={e => setBulkAdviserId(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="">Assign Adviser...</option>
                  {advisers.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleBulkAssignAdviser}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-900 cursor-pointer"
                >
                  Apply
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleBulkStatus(true)}
                className="px-2.5 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
              >
                Set Active
              </button>
              <button
                type="button"
                onClick={() => handleBulkStatus(false)}
                className="px-2.5 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 cursor-pointer"
              >
                Set Inactive
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW 1: Programs -> Groups -> Enrolled Students Hierarchy */}
      {viewMode === 'programs' ? (
        <div className="space-y-5">
          {programHierarchy.map(({ program: prog, totalStudents, groups }) => (
            <div
              key={prog.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden"
            >
              {/* Program Header */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-lg bg-[#005696] text-white text-xs font-bold font-mono-numbers">
                    {prog.code}
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">{prog.name}</h2>
                    <p className="text-[11px] text-slate-500">{prog.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono-numbers text-slate-600">
                  <span>
                    Groups: <strong className="text-slate-900">{groups.length}</strong>
                  </span>
                  <span>·</span>
                  <span>
                    Enrolled Students: <strong className="text-slate-900">{totalStudents}</strong>
                  </span>
                </div>
              </div>

              {/* Groups inside Program */}
              {groups.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No enrolled student groups matching current search in {prog.code}.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {groups.map(grp => {
                    const key = `${prog.code}::${grp.groupName}`;
                    const isOpen = !!expandedGroups[key] || Boolean(searchTerm.trim());
                    const allGroupSelected =
                      grp.members.length > 0 &&
                      grp.members.every(m => selectedIds.includes(m.id));

                    return (
                      <div key={key} className="bg-white">
                        {/* Group Row */}
                        <div className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/80 transition-colors">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => toggleSelectGroup(grp.members)}
                              className="text-slate-400 hover:text-[#005696] cursor-pointer"
                              title="Select all students in group"
                            >
                              {allGroupSelected ? (
                                <CheckSquare className="w-4 h-4 text-[#005696]" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setExpandedGroups(prev => ({
                                  ...prev,
                                  [key]: !isOpen
                                }))
                              }
                              className="flex items-center gap-2 text-left cursor-pointer"
                            >
                              {isOpen ? (
                                <ChevronDown className="w-4 h-4 text-slate-500" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-500" />
                              )}
                              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                                {grp.groupName}
                              </span>
                              <span className="text-[11px] font-mono-numbers px-2 py-0.5 rounded bg-blue-50 text-[#005696] font-semibold">
                                {grp.members.length} {grp.members.length === 1 ? 'member' : 'members'}
                              </span>
                            </button>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-500 pl-8 sm:pl-0">
                            <span>
                              Section: <strong className="text-slate-700 font-mono-numbers">{grp.section}</strong>
                            </span>
                            <span>·</span>
                            <span>
                              Adviser: <strong className="text-slate-700">{grp.adviserName}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Enrolled Students Table inside Group */}
                        {isOpen && (
                          <div className="px-6 pb-4">
                            <div className="overflow-x-auto rounded-xl border border-slate-200">
                              <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider">
                                  <tr>
                                    <th className="py-2.5 px-3 w-8">Select</th>
                                    <th className="py-2.5 px-3">Student Name</th>
                                    <th className="py-2.5 px-3">Student No. / User ID</th>
                                    <th className="py-2.5 px-3">Program & Section</th>
                                    <th className="py-2.5 px-3">Institutional Email</th>
                                    <th className="py-2.5 px-3">Adviser</th>
                                    <th className="py-2.5 px-3">Status</th>
                                    <th className="py-2.5 px-3 text-right">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {grp.members.map(student => {
                                    const checked = selectedIds.includes(student.id);
                                    return (
                                      <tr
                                        key={student.id}
                                        className={`hover:bg-slate-50/70 ${
                                          checked ? 'bg-blue-50/40' : ''
                                        }`}
                                      >
                                        <td className="py-2.5 px-3">
                                          <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => toggleSelectStudent(student.id)}
                                            className="rounded border-slate-300 text-[#005696] focus:ring-[#005696] cursor-pointer"
                                          />
                                        </td>
                                        <td className="py-2.5 px-3 font-bold text-slate-900">
                                          {student.name}
                                        </td>
                                        <td className="py-2.5 px-3 font-mono-numbers text-slate-600">
                                          <div>{student.studentNumber}</div>
                                          <div className="text-[10px] text-slate-400">ID: {student.userId}</div>
                                        </td>
                                        <td className="py-2.5 px-3 font-mono-numbers text-slate-700">
                                          {student.program} · {student.section}
                                        </td>
                                        <td className="py-2.5 px-3 font-mono-numbers text-slate-600">
                                          {student.email}
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-700">
                                          {student.adviserName}
                                        </td>
                                        <td className="py-2.5 px-3">
                                          <button
                                            type="button"
                                            onClick={() => toggleStudentStatus(student.id)}
                                            className="cursor-pointer"
                                            title="Click to toggle status"
                                          >
                                            <StatusBadge
                                              status={student.isActive ? 'Active' : 'Inactive'}
                                              size="sm"
                                            />
                                          </button>
                                        </td>
                                        <td className="py-2.5 px-3 text-right">
                                          <button
                                            type="button"
                                            onClick={() => handleOpenEditStudent(student)}
                                            className="p-1.5 text-slate-500 hover:text-[#005696] hover:bg-blue-50 rounded-lg cursor-pointer"
                                            title="Edit Student"
                                          >
                                            <Edit2 className="w-3.5 h-3.5" />
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* VIEW 2: Flat All Students Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-8">
                    <input
                      type="checkbox"
                      checked={
                        filteredStudents.length > 0 &&
                        filteredStudents.every(s => selectedIds.includes(s.id))
                      }
                      onChange={toggleSelectAllFiltered}
                      className="rounded border-slate-300 text-[#005696] cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Student No. / User ID</th>
                  <th className="py-3 px-4">Program & Section</th>
                  <th className="py-3 px-4">Group</th>
                  <th className="py-3 px-4">Institutional Email</th>
                  <th className="py-3 px-4">Adviser</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      No students found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(student => {
                    const checked = selectedIds.includes(student.id);
                    return (
                      <tr
                        key={student.id}
                        className={`hover:bg-slate-50/70 ${checked ? 'bg-blue-50/40' : ''}`}
                      >
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSelectStudent(student.id)}
                            className="rounded border-slate-300 text-[#005696] cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">{student.name}</td>
                        <td className="py-3 px-4 font-mono-numbers text-slate-600">
                          <div>{student.studentNumber}</div>
                          <div className="text-[10px] text-slate-400">ID: {student.userId}</div>
                        </td>
                        <td className="py-3 px-4 font-mono-numbers text-slate-700">
                          {student.program} · {student.section}
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#005696]">
                          {getStudentGroupLabel(student)}
                        </td>
                        <td className="py-3 px-4 font-mono-numbers text-slate-600">
                          {student.email}
                        </td>
                        <td className="py-3 px-4 text-slate-700">{student.adviserName}</td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => toggleStudentStatus(student.id)}
                            className="cursor-pointer"
                          >
                            <StatusBadge status={student.isActive ? 'Active' : 'Inactive'} size="sm" />
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenEditStudent(student)}
                            className="px-2.5 py-1 text-xs font-semibold text-[#005696] hover:bg-blue-50 rounded-lg cursor-pointer"
                          >
                            Edit
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
      )}

      {/* Register / Edit Student Modal */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#005696]" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingStudent ? 'Edit Student Details' : 'Register New Student'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsStudentModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-3.5 pt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Student Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Juan Carlos Dela Cruz"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005696]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Student Number *</label>
                  <input
                    type="text"
                    required
                    value={studentNumber}
                    onChange={e => setStudentNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono-numbers"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Program *</label>
                  <select
                    value={program}
                    onChange={e => {
                      setProgram(e.target.value);
                      setSection(`${e.target.value}-401A`);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    {programs.map(p => (
                      <option key={p.id} value={p.code}>
                        {p.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Year & Section *</label>
                  <input
                    type="text"
                    required
                    value={section}
                    onChange={e => setSection(e.target.value)}
                    placeholder="BSIT-401A"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono-numbers"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Capstone Group</label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                    placeholder="e.g. NAVAJAS GROUP"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Institutional Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@globalcity.sti.edu (auto-generated if blank)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono-numbers"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Adviser *</label>
                <select
                  value={adviserId}
                  onChange={e => setAdviserId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  {advisers.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    Account Password (Default: <span className="font-mono-numbers text-[#005696]">{DEFAULT_STUDENT_PASSWORD}</span>)
                  </label>
                  <button
                    type="button"
                    onClick={() => setPassword(DEFAULT_STUDENT_PASSWORD)}
                    className="text-[11px] font-semibold text-[#005696] hover:underline cursor-pointer"
                  >
                    Use Default
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-9 rounded-lg border border-slate-300 font-mono-numbers bg-slate-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-[#005696] hover:bg-[#004478] rounded-lg cursor-pointer"
                >
                  {editingStudent ? 'Save Changes' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Program Modal */}
      {isProgramModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Academic Program</h3>
              <button
                type="button"
                onClick={() => setIsProgramModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveProgram} className="space-y-3.5 pt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Program Code *</label>
                <input
                  type="text"
                  required
                  value={progCode}
                  onChange={e => setProgCode(e.target.value)}
                  placeholder="e.g. BSIS"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 uppercase"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Program Name *</label>
                <input
                  type="text"
                  required
                  value={progName}
                  onChange={e => setProgName(e.target.value)}
                  placeholder="BS in Information Systems"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={progDepartment}
                  onChange={e => setProgDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProgramModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-[#005696] hover:bg-[#004478] rounded-lg cursor-pointer"
                >
                  Save Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
