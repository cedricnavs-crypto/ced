import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PanelistAssignment, DefenseStage, DefenseStatus } from '../../types';
import {
  getStudentGroupLabel,
  getTitlesForStudentGroup,
  resolveScheduleGroupName
} from '../../utils/studentGroups';
import {
  formatStandardTime,
  formatTimeRange,
  getStandardTimeOptionsWithCurrent
} from '../../utils/timeFormat';
import {
  X,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Check
} from 'lucide-react';

interface CreateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

const DEFENSE_STATUS_OPTIONS: DefenseStatus[] = [
  'For Scheduling',
  'Scheduled',
  'Upcoming',
  'Ongoing',
  'Completed',
  'For Re-Defense',
  'Rescheduled',
  'Cancelled'
];

export const CreateScheduleModal: React.FC<CreateScheduleModalProps> = ({
  isOpen,
  onClose,
  initialData
}) => {
  const {
    students,
    titles,
    panelists,
    rooms,
    schedules,
    createSchedule,
    updateSchedule
  } = useApp();

  // Deduplicate group representatives so dropdown shows clean Group Names
  const groupRepresentativeStudents = useMemo(() => {
    const seen = new Set<string>();
    return students.filter(s => {
      const key = `${s.program}::${getStudentGroupLabel(s)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [students]);

  const [studentId, setStudentId] = useState(groupRepresentativeStudents[0]?.id || students[0]?.id || '');
  const [date, setDate] = useState('2026-10-15');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:30');
  const [roomId, setRoomId] = useState(rooms[0]?.id || '');
  const [defenseStage, setDefenseStage] = useState<DefenseStage>('Defense 1 (Proposal)');
  const [status, setStatus] = useState<DefenseStatus>('Scheduled');
  const [leadPanelistId, setLeadPanelistId] = useState(panelists[0]?.id || '');
  const [memberPanelistIds, setMemberPanelistIds] = useState<string[]>(
    [panelists[1]?.id, panelists[2]?.id].filter(Boolean) as string[]
  );
  const [isSuccess, setIsSuccess] = useState(false);
  const [autoAssignToast, setAutoAssignToast] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      if (initialData.studentId) setStudentId(initialData.studentId);
      if (initialData.date) setDate(initialData.date);
      if (initialData.startTime) setStartTime(initialData.startTime);
      if (initialData.endTime) setEndTime(initialData.endTime);
      if (initialData.roomId) setRoomId(initialData.roomId);
      if (initialData.defenseStage) setDefenseStage(initialData.defenseStage);
      if (initialData.status) setStatus(initialData.status);
      if (initialData.panelists && initialData.panelists.length > 0) {
        const chair = initialData.panelists.find((p: any) => p.role === 'Panel Chair');
        const members = initialData.panelists
          .filter((p: any) => p.role !== 'Panel Chair')
          .map((p: any) => p.panelistId);
        if (chair) setLeadPanelistId(chair.panelistId);
        if (members.length > 0) setMemberPanelistIds(members);
      }
    } else {
      setStatus('Scheduled');
    }
  }, [initialData]);

  const currentStudent = students.find(s => s.id === studentId);
  const currentGroupLabel = currentStudent ? getStudentGroupLabel(currentStudent) : '';
  const groupTitles = currentStudent ? getTitlesForStudentGroup(currentStudent, titles, students) : [];
  const activeGroupTitle =
    groupTitles.find(t => t.status === 'Approved') ||
    groupTitles.find(t => t.status === 'Pending') ||
    groupTitles[0];
  const studentTitle = activeGroupTitle?.title || 'No Endorsed Title Registered Yet';

  const roomStatusMap = useMemo(() => {
    const map: Record<string, { isOccupied: boolean; occupant?: string; timeslot?: string }> = {};
    rooms.forEach(r => {
      const conflict = schedules.find(
        s =>
          s.roomId === r.id &&
          s.date === date &&
          s.status !== 'Cancelled' &&
          s.id !== initialData?.id &&
          s.startTime < endTime &&
          s.endTime > startTime
      );
      if (conflict) {
        map[r.id] = {
          isOccupied: true,
          occupant: resolveScheduleGroupName(conflict, students),
          timeslot: formatTimeRange(conflict.startTime, conflict.endTime)
        };
      } else {
        map[r.id] = { isOccupied: false };
      }
    });
    return map;
  }, [rooms, schedules, date, startTime, endTime, initialData, students]);

  const handleAutoSuggestRoom = () => {
    const freeRoom =
      rooms.find(r => r.isAvailable && !roomStatusMap[r.id]?.isOccupied) ||
      rooms.find(r => !roomStatusMap[r.id]?.isOccupied);
    if (freeRoom) {
      setRoomId(freeRoom.id);
      setAutoAssignToast(
        `Assigned ${freeRoom.name} — Free from ${formatStandardTime(startTime)} to ${formatStandardTime(endTime)}`
      );
      setTimeout(() => setAutoAssignToast(null), 3500);
    } else {
      setAutoAssignToast('All campus rooms are occupied or unavailable for this timeslot.');
      setTimeout(() => setAutoAssignToast(null), 4000);
    }
  };

  const selectedRoomObj = rooms.find(r => r.id === roomId);
  const selectedRoomStatus = selectedRoomObj ? roomStatusMap[selectedRoomObj.id] : null;
  const allSelectedPanelistIds = [leadPanelistId, ...memberPanelistIds].filter(Boolean);

  // Ensure initialData student is included in dropdown even if another member was picked
  const dropdownOptions = useMemo(() => {
    const exists = groupRepresentativeStudents.some(s => s.id === studentId);
    if (exists || !currentStudent) return groupRepresentativeStudents;
    return [currentStudent, ...groupRepresentativeStudents];
  }, [groupRepresentativeStudents, studentId, currentStudent]);

  if (!isOpen) return null;

  const handleMemberToggle = (id: string) => {
    if (id === leadPanelistId) return;
    if (memberPanelistIds.includes(id)) {
      setMemberPanelistIds(memberPanelistIds.filter(m => m !== id));
    } else {
      setMemberPanelistIds([...memberPanelistIds, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) return;

    const assignedRoom = rooms.find(r => r.id === roomId);
    const leadObj = panelists.find(p => p.id === leadPanelistId);

    const panelistAssignments: PanelistAssignment[] = [];
    if (leadObj) {
      panelistAssignments.push({
        panelistId: leadObj.id,
        name: leadObj.name,
        role: 'Panel Chair'
      });
    }

    memberPanelistIds.forEach(mId => {
      const pObj = panelists.find(p => p.id === mId);
      if (pObj && pObj.id !== leadPanelistId) {
        panelistAssignments.push({
          panelistId: pObj.id,
          name: pObj.name,
          role: 'Member Panelist'
        });
      }
    });

    if (initialData?.id) {
      updateSchedule(initialData.id, {
        studentId,
        studentName: currentStudent.name,
        studentNumber: currentStudent.studentNumber,
        program: currentStudent.program,
        groupName: currentGroupLabel,
        adviserId: currentStudent.adviserId,
        adviserName: currentStudent.adviserName,
        capstoneTitleId: activeGroupTitle?.id || initialData.capstoneTitleId || 'title-1',
        capstoneTitle: studentTitle,
        defenseStage,
        status,
        date,
        startTime,
        endTime,
        roomId,
        roomName: assignedRoom?.name || 'TBD',
        panelists: panelistAssignments,
        remarks: ''
      });
    } else {
      createSchedule({
        studentId,
        studentName: currentStudent.name,
        studentNumber: currentStudent.studentNumber,
        program: currentStudent.program,
        groupName: currentGroupLabel,
        adviserId: currentStudent.adviserId,
        adviserName: currentStudent.adviserName,
        capstoneTitleId: activeGroupTitle?.id || 'title-1',
        capstoneTitle: studentTitle,
        defenseStage,
        date,
        startTime,
        endTime,
        roomId,
        roomName: assignedRoom?.name || 'TBD',
        panelists: panelistAssignments,
        status,
        remarks: '',
        requirementsCompleted: true
      });
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 border border-slate-200 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {initialData ? 'Edit Defense Schedule' : 'Create Defense Schedule'}
              </h3>
              <p className="text-xs text-slate-500">
                Assign capstone group, date & time, defense room, panelists, and status
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-900">
              Schedule {initialData ? 'Updated' : 'Created'} Successfully
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Notifications dispatched to {currentGroupLabel}, adviser, and assigned panelists.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
            {/* Group Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Capstone Group *
                </label>
                <select
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005696] bg-white font-medium"
                >
                  {dropdownOptions.map(s => (
                    <option key={s.id} value={s.id}>
                      {getStudentGroupLabel(s)} — {s.program} ({s.section})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Defense Status *
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as DefenseStatus)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005696] bg-white font-medium"
                >
                  {DEFENSE_STATUS_OPTIONS.map(st => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Attached Endorsed Title & Adviser Preview */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="text-[11px] font-medium text-slate-500">
                Endorsed Title · Adviser: <span className="font-semibold text-slate-700">{currentStudent?.adviserName}</span>
              </div>
              <p className="font-semibold text-slate-900">{studentTitle}</p>
            </div>

            {/* Defense Stage & Date/Time */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-1">
                <label className="block font-semibold text-slate-700 mb-1">Stage *</label>
                <select
                  value={defenseStage}
                  onChange={e => setDefenseStage(e.target.value as DefenseStage)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005696] bg-white font-medium"
                >
                  <option value="Title Proposal">Title Proposal</option>
                  <option value="Defense 1 (Proposal)">Defense 1 (Proposal)</option>
                  <option value="Defense 2 (Mid-Defense)">Mid-Defense</option>
                  <option value="Final Capstone Defense">Final Defense</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005696] tabular-nums"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Start Time *</label>
                <select
                  required
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#005696] tabular-nums"
                >
                  {getStandardTimeOptionsWithCurrent(startTime).map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">End Time *</label>
                <select
                  required
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#005696] tabular-nums"
                >
                  {getStandardTimeOptionsWithCurrent(endTime).map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Room Assignment */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block font-semibold text-slate-700">
                  Defense Room *
                </label>
                <button
                  type="button"
                  onClick={handleAutoSuggestRoom}
                  className="px-2.5 py-1 text-xs font-semibold text-[#005696] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 text-[#005696]" />
                  <span>Auto-Suggest Free Room</span>
                </button>
              </div>

              {autoAssignToast && (
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-medium text-blue-900">
                  {autoAssignToast}
                </div>
              )}

              <select
                value={roomId}
                onChange={e => setRoomId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005696] bg-white font-medium"
              >
                {rooms.map(r => {
                  const st = roomStatusMap[r.id];
                  let statusLabel = '[Available]';
                  if (st?.isOccupied) {
                    statusLabel = `[Occupied by ${st.occupant} (${st.timeslot})]`;
                  } else if (!r.isAvailable) {
                    statusLabel = '[Unavailable]';
                  }
                  return (
                    <option key={r.id} value={r.id}>
                      {r.name} — {statusLabel}
                    </option>
                  );
                })}
              </select>

              {selectedRoomObj && selectedRoomStatus?.isOccupied && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    <MapPin className="w-3.5 h-3.5 inline mr-1" />
                    {selectedRoomObj.name} is currently booked by {selectedRoomStatus.occupant} ({selectedRoomStatus.timeslot}).
                  </span>
                </div>
              )}
            </div>

            {/* Panelists Assignment */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block font-semibold text-slate-700">
                  Panel Chair *
                </label>
                <span className="text-[11px] text-slate-500">
                  {allSelectedPanelistIds.length} Panelist(s) Selected
                </span>
              </div>
              <select
                value={leadPanelistId}
                onChange={e => {
                  const newLead = e.target.value;
                  setLeadPanelistId(newLead);
                  if (memberPanelistIds.includes(newLead)) {
                    setMemberPanelistIds(memberPanelistIds.filter(id => id !== newLead));
                  }
                }}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005696] bg-white font-medium"
              >
                {panelists.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.specializations.slice(0, 2).join(', ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Member Panelists
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {panelists.map(p => {
                  const isLead = p.id === leadPanelistId;
                  const isMember = memberPanelistIds.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className={`p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer ${
                        isLead
                          ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                          : isMember
                          ? 'bg-blue-50/70 border-blue-300 text-blue-950 font-semibold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <input
                          type="checkbox"
                          disabled={isLead}
                          checked={isLead || isMember}
                          onChange={() => handleMemberToggle(p.id)}
                          className="rounded text-[#005696]"
                        />
                        <span className="truncate">{p.name}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 shrink-0">
                        {isLead ? 'Chair' : 'Member'}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white rounded-lg bg-[#005696] hover:bg-[#004478] cursor-pointer transition-colors"
              >
                {initialData ? 'Save Schedule Changes' : 'Create Defense Schedule'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
