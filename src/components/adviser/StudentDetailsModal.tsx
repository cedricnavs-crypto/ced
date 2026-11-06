import React from 'react';
import { Student } from '../../types';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  getStudentGroupLabel,
  getGroupMembers,
  getSchedulesForStudentGroup,
  getTitlesForStudentGroup
} from '../../utils/studentGroups';
import { formatTimeRange } from '../../utils/timeFormat';
import {
  X,
  Calendar,
  FileText,
  History,
  ArrowLeft,
  Users
} from 'lucide-react';

interface StudentDetailsModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({
  student,
  isOpen,
  onClose
}) => {
  const { students, titles, schedules } = useApp();

  if (!isOpen || !student) return null;

  const groupName = getStudentGroupLabel(student);
  const members = getGroupMembers(students, groupName, student.program);
  const groupTitles = getTitlesForStudentGroup(student, titles, students);
  const activeTitle = groupTitles[0];

  const groupSchedules = getSchedulesForStudentGroup(student, schedules, students);
  const activeSchedule =
    groupSchedules.find(
      s =>
        s.status === 'Scheduled' ||
        s.status === 'Upcoming' ||
        s.status === 'Ongoing' ||
        s.status === 'Rescheduled' ||
        s.status === 'For Re-Defense'
    ) || groupSchedules[0];

  const historySchedules = groupSchedules.filter(
    s => s.status === 'Completed' || s.status === 'Cancelled' || s.status === 'For Re-Defense'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-6 border border-slate-200 my-8 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer flex items-center gap-1 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#005696] bg-blue-50 px-2 py-0.5 rounded font-mono-numbers">
                  {student.program} · {student.section}
                </span>
                <StatusBadge status={student.isActive ? 'Active' : 'Inactive'} size="sm" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5 uppercase">{groupName}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Group Members */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#005696]" />
            Group Members ({members.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {members.map(m => (
              <div
                key={m.id}
                className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-slate-900 block">{m.name}</span>
                  <span className="text-[11px] font-mono-numbers text-slate-500">
                    {m.studentNumber} · {m.email}
                  </span>
                </div>
                <StatusBadge status={m.isActive ? 'Active' : 'Inactive'} size="sm" />
              </div>
            ))}
          </div>
        </div>

        {/* Endorsed Title */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#005696]" />
              Endorsed Capstone Title
            </h4>
            {activeTitle && <StatusBadge status={activeTitle.status} size="sm" />}
          </div>
          {activeTitle ? (
            <div className="space-y-1.5 text-xs">
              <p className="text-sm font-bold text-slate-900">{activeTitle.title}</p>
              <p className="text-slate-600 leading-relaxed">{activeTitle.abstract}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No capstone title submitted yet.</p>
          )}
        </div>

        {/* Defense Schedule */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#005696]" />
              Defense Schedule & Venue
            </h4>
            {activeSchedule ? (
              <StatusBadge status={activeSchedule.status} size="sm" />
            ) : (
              <StatusBadge status="For Scheduling" size="sm" />
            )}
          </div>

          {activeSchedule ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono-numbers">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block uppercase">Date</span>
                <span className="font-bold text-slate-900">{activeSchedule.date}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block uppercase">Time</span>
                <span className="font-bold text-slate-900">
                  {formatTimeRange(activeSchedule.startTime, activeSchedule.endTime)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block uppercase">Room</span>
                <span className="font-bold text-slate-900">{activeSchedule.roomName}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Not yet scheduled.</p>
          )}
        </div>

        {historySchedules.length > 0 && (
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <History className="w-4 h-4 text-[#005696]" />
              Past Defense Records ({historySchedules.length})
            </h4>
            <div className="space-y-1.5 text-xs">
              {historySchedules.map(h => (
                <div
                  key={h.id}
                  className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between"
                >
                  <span className="font-semibold text-slate-800">
                    {h.defenseStage} · {h.date} ({h.roomName})
                  </span>
                  <StatusBadge status={h.status} size="sm" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
