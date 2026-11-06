import { CapstoneTitle, DefenseSchedule, Student } from '../types';

const COMPOUND_PREFIXES = ['DELA', 'DE LA', 'DELOS', 'DE LOS', 'DEL', 'DE', 'SAN', 'STA.', 'STA'];

export function extractSurname(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) return 'UNASSIGNED';

  if (trimmed.includes(',')) {
    return trimmed.split(',')[0].trim().toUpperCase();
  }

  const cleaned = trimmed.replace(/\b(Jr\.?|Sr\.?|II|III|IV)\s*$/i, '').trim();
  const parts = cleaned.split(/\s+/);
  if (parts.length === 1) return parts[0].toUpperCase();

  const last = parts[parts.length - 1].toUpperCase();
  const secondLast = parts[parts.length - 2].toUpperCase();
  const thirdLast = parts.length >= 3 ? parts[parts.length - 3].toUpperCase() : '';

  if (thirdLast && `${thirdLast} ${secondLast}` === 'DE LA') {
    return `DE LA ${last}`;
  }
  if (thirdLast && `${thirdLast} ${secondLast}` === 'DE LOS') {
    return `DE LOS ${last}`;
  }
  if (COMPOUND_PREFIXES.includes(secondLast)) {
    return `${secondLast} ${last}`;
  }

  return last;
}

export function normalizeGroupName(rawGroup: string, fallbackStudentName?: string): string {
  const cleaned = rawGroup.trim().toUpperCase();
  if (cleaned) {
    return cleaned.endsWith('GROUP') ? cleaned : `${cleaned} GROUP`;
  }
  if (fallbackStudentName) {
    return `${extractSurname(fallbackStudentName)} GROUP`;
  }
  return 'UNASSIGNED GROUP';
}

export function getStudentGroupLabel(student: Student): string {
  if (student.groupName && student.groupName.trim()) {
    return student.groupName.trim().toUpperCase();
  }
  return `${extractSurname(student.name)} GROUP`;
}

export function getGroupMembers(students: Student[], groupName: string, program?: string): Student[] {
  const target = normalizeGroupName(groupName);
  return students.filter(s => {
    const label = getStudentGroupLabel(s);
    if (program && s.program !== program) return false;
    return label === target;
  });
}

export function resolveScheduleGroupName(schedule: DefenseSchedule, students: Student[]): string {
  if (schedule.groupName && schedule.groupName.trim()) {
    return normalizeGroupName(schedule.groupName);
  }
  const student = students.find(s => s.id === schedule.studentId);
  if (student) {
    return getStudentGroupLabel(student);
  }
  return normalizeGroupName('', schedule.studentName);
}

export function resolveTitleGroupName(title: CapstoneTitle, students: Student[]): string {
  if (title.groupName && title.groupName.trim()) {
    return normalizeGroupName(title.groupName);
  }
  const student = students.find(s => s.id === title.studentId);
  if (student) {
    return getStudentGroupLabel(student);
  }
  return normalizeGroupName('', title.studentName);
}

export function getSchedulesForStudentGroup(
  student: Student,
  schedules: DefenseSchedule[],
  students: Student[]
): DefenseSchedule[] {
  const groupLabel = getStudentGroupLabel(student);
  return schedules.filter(sch => {
    if (sch.studentId === student.id) return true;
    const schGroup = resolveScheduleGroupName(sch, students);
    return schGroup === groupLabel && sch.program === student.program;
  });
}

export function getTitlesForStudentGroup(
  student: Student,
  titles: CapstoneTitle[],
  students: Student[]
): CapstoneTitle[] {
  const groupLabel = getStudentGroupLabel(student);
  return titles.filter(t => {
    if (t.studentId === student.id) return true;
    const tGroup = resolveTitleGroupName(t, students);
    return tGroup === groupLabel && t.program === student.program;
  });
}
