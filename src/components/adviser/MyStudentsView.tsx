import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { BackButton } from '../common/BackButton';
import { StudentDetailsModal } from './StudentDetailsModal';
import {
  getStudentGroupLabel,
  getSchedulesForStudentGroup,
  getTitlesForStudentGroup
} from '../../utils/studentGroups';
import { formatTimeRange } from '../../utils/timeFormat';
import {
  Users,
  Search,
  Calendar,
  Clock,
  MapPin,
  FileText
} from 'lucide-react';

export const MyStudentsView: React.FC = () => {
  const { currentUser, advisers, students, titles, schedules } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [programFilter, setProgramFilter] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const adviser = advisers.find(a => a.userId === currentUser.id) || advisers[0];
  const myStudents = students.filter(s => s.adviserId === adviser.id);

  // Group supervised students into Handled Groups
  const handledGroups = useMemo(() => {
    const map = new Map<string, Student[]>();
    myStudents.forEach(s => {
      const grp = getStudentGroupLabel(s);
      const list = map.get(grp) || [];
      list.push(s);
      map.set(grp, list);
    });

    const q = searchTerm.trim().toLowerCase();

    return Array.from(map.entries())
      .map(([groupName, members]) => {
        const rep = members[0];
        const groupTitles = getTitlesForStudentGroup(rep, titles, students);
        const endorsedTitle =
          groupTitles.find(t => t.status === 'Approved') || groupTitles[0] || null;
        const groupSchedules = getSchedulesForStudentGroup(rep, schedules, students);
        const activeSchedule =
          groupSchedules.find(
            s =>
              s.status === 'Scheduled' ||
              s.status === 'Upcoming' ||
              s.status === 'Ongoing' ||
              s.status === 'Rescheduled' ||
              s.status === 'For Re-Defense'
          ) || groupSchedules[0] || null;

        return {
          groupName,
          program: rep.program,
          section: rep.section,
          members,
          endorsedTitle,
          activeSchedule
        };
      })
      .filter(grp => {
        const matchesProg = programFilter === 'All' || grp.program === programFilter;
        if (!matchesProg) return false;
        if (!q) return true;

        const groupMatch =
          grp.groupName.toLowerCase().includes(q) ||
          (grp.endorsedTitle && grp.endorsedTitle.title.toLowerCase().includes(q));

        // Search names, user IDs, student no., and emails
        const memberMatch = grp.members.some(
          m =>
            m.name.toLowerCase().includes(q) ||
            m.userId.toLowerCase().includes(q) ||
            m.id.toLowerCase().includes(q) ||
            m.studentNumber.toLowerCase().includes(q) ||
            m.email.toLowerCase().includes(q)
        );

        return groupMatch || memberMatch;
      });
  }, [myStudents, students, titles, schedules, searchTerm, programFilter]);

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <BackButton label="Back to Dashboard" variant="subtle" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#005696]" />
              <h1 className="text-xl font-bold text-slate-900">Handled Groups (My Students)</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Capstone groups supervised by {adviser.name} ({adviser.employeeId}) — showing members, program & section, endorsed title, and defense schedule.
            </p>
          </div>

          <div className="text-xs text-slate-600 font-mono-numbers px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
            Handled Groups: <strong className="text-slate-900">{handledGroups.length}</strong> · Students:{' '}
            <strong className="text-slate-900">{myStudents.length}</strong>/{adviser.maxAdvisees}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search student name, user ID, student no., institutional email, or group..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005696]"
            />
          </div>

          <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
            {['All', 'BSIT', 'BSCS', 'BSCpE'].map(prog => (
              <button
                key={prog}
                type="button"
                onClick={() => setProgramFilter(prog)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  programFilter === prog
                    ? 'bg-white text-[#005696] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {prog}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Handled Groups Cards */}
      {handledGroups.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400">
          No handled groups or students match your search criteria.
        </div>
      ) : (
        <div className="space-y-4">
          {handledGroups.map(grp => (
            <div
              key={`${grp.program}-${grp.groupName}`}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4"
            >
              {/* Group Top Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-[#005696] uppercase">
                    {grp.groupName}
                  </span>
                  <span className="text-xs font-mono-numbers px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-800 font-semibold">
                    {grp.program} · {grp.section}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                    Assigned to You (Adviser)
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">Defense Status:</span>
                    <StatusBadge
                      status={grp.activeSchedule ? grp.activeSchedule.status : 'For Scheduling'}
                      size="sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudent(grp.members[0]);
                      setIsDetailsOpen(true);
                    }}
                    className="px-2.5 py-1 text-xs font-semibold text-[#005696] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg cursor-pointer transition-colors"
                  >
                    View
                  </button>
                </div>
              </div>

              {/* Endorsed Title + Defense Schedule Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-7 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-[#005696]" />
                      Endorsed Capstone Title
                    </span>
                    {grp.endorsedTitle && (
                      <StatusBadge status={grp.endorsedTitle.status} size="sm" />
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">
                    {grp.endorsedTitle ? grp.endorsedTitle.title : 'No Capstone Title Submitted Yet'}
                  </p>
                </div>

                <div className="lg:col-span-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-3 gap-2 text-xs font-mono-numbers">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#005696]" /> Date
                    </span>
                    <strong className="text-slate-900 mt-1 block">
                      {grp.activeSchedule?.date || 'TBD'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" /> Time
                    </span>
                    <strong className="text-slate-900 mt-1 block">
                      {grp.activeSchedule
                        ? formatTimeRange(grp.activeSchedule.startTime, grp.activeSchedule.endTime)
                        : 'TBD'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-600" /> Room
                    </span>
                    <strong className="text-slate-900 mt-1 truncate block">
                      {grp.activeSchedule?.roomName || 'TBD'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Group Members Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Member Name</th>
                      <th className="py-2.5 px-3">Student No. / User ID</th>
                      <th className="py-2.5 px-3">Program & Section</th>
                      <th className="py-2.5 px-3">Institutional Email</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {grp.members.map(member => (
                      <tr key={member.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{member.name}</td>
                        <td className="py-2.5 px-3 font-mono-numbers text-slate-600">
                          <div>{member.studentNumber}</div>
                          <div className="text-[10px] text-slate-400">ID: {member.userId}</div>
                        </td>
                        <td className="py-2.5 px-3 font-mono-numbers text-slate-700">
                          {member.program} · {member.section}
                        </td>
                        <td className="py-2.5 px-3 font-mono-numbers text-slate-600">
                          {member.email}
                        </td>
                        <td className="py-2.5 px-3">
                          <StatusBadge
                            status={member.isActive ? 'Active' : 'Inactive'}
                            size="sm"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      <StudentDetailsModal
        student={selectedStudent}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </div>
  );
};
