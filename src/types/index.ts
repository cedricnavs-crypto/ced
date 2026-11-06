export type UserRole = 'student' | 'panelist' | 'adviser' | 'admin';

export type TitleStatus = 'Pending' | 'Approved' | 'Rejected';

export type DefenseStatus =
  | 'For Scheduling'
  | 'Scheduled'
  | 'Upcoming'
  | 'Ongoing'
  | 'Completed'
  | 'For Re-Defense'
  | 'Rescheduled'
  | 'Cancelled'
  | 'Under Review';

export type DefenseStage = 'Title Proposal' | 'Defense 1 (Proposal)' | 'Defense 2 (Mid-Defense)' | 'Final Capstone Defense';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  studentNumber?: string;
  employeeId?: string;
  program?: string;
  department?: string;
  contactNumber?: string;
  password?: string;
  isActive: boolean;
}

export interface Student {
  id: string;
  userId: string;
  name: string;
  studentNumber: string;
  program: string;
  section: string;
  groupName?: string;
  email: string;
  contactNumber: string;
  adviserId: string;
  adviserName: string;
  currentTitleId?: string;
  password?: string;
  isActive: boolean;
}

export interface Panelist {
  id: string;
  userId: string;
  name: string;
  employeeId: string;
  email: string;
  department: string;
  specializations: string[];
  maxDefenses?: number;
  contactNumber: string;
  isActive: boolean;
}

export interface Adviser {
  id: string;
  userId: string;
  name: string;
  employeeId: string;
  email: string;
  department: string;
  specializations: string[];
  maxAdvisees: number;
  contactNumber: string;
  isActive: boolean;
}

export interface Room {
  id: string;
  name: string;
  location: string;
  capacity: number;
  facilities: string[];
  isAvailable: boolean;
}

export interface AcademicProgram {
  id: string;
  code: string;
  name: string;
  department: string;
  durationYears: number;
  activeStudents: number;
}

export interface CapstoneTitle {
  id: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  program: string;
  groupName?: string;
  adviserId: string;
  adviserName: string;
  title: string;
  abstract: string;
  problemStatement?: string;
  objectives: string[];
  techStack: string[];
  status: TitleStatus;
  remarks?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  defenseStage: DefenseStage;
  version: number;
}

export interface PanelistAssignment {
  panelistId: string;
  name: string;
  role: 'Panel Chair' | 'Member Panelist';
}

export interface DefenseSchedule {
  id: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  program: string;
  groupName?: string;
  adviserId: string;
  adviserName: string;
  capstoneTitleId: string;
  capstoneTitle: string;
  defenseStage: DefenseStage;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (24h)
  endTime: string; // HH:mm (24h)
  roomId: string;
  roomName: string;
  panelists: PanelistAssignment[];
  status: DefenseStatus;
  remarks?: string;
  verdictScore?: number;
  requirementsCompleted: boolean;
}

export interface AvailabilitySlot {
  id: string;
  panelistId: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  notes?: string;
}

export interface AppNotification {
  id: string;
  userId: string; // user id or 'all' | 'students' | 'faculty'
  roleTarget?: UserRole | 'all';
  title: string;
  message: string;
  date: string;
  time: string;
  isRead: boolean;
  type: 'defense' | 'title' | 'room' | 'announcement' | 'conflict' | 'adviser' | 'account';
  linkTab?: string;
}


export interface ConflictWarning {
  type: 'room' | 'panelist' | 'student';
  message: string;
  conflictingScheduleId: string;
  details: string;
}

export interface SystemSettings {
  campusName: string;
  academicYear: string;
  trimester: string;
  defenseDurationMinutes: number;
  allowSubmissions: boolean;
  institutionAddress: string;
  contactEmail: string;
}
