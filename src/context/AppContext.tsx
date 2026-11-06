import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Student,
  Panelist,
  Adviser,
  Room,
  AcademicProgram,
  CapstoneTitle,
  DefenseSchedule,
  AvailabilitySlot,
  AppNotification,
  SystemSettings,
  ConflictWarning,
  TitleStatus
} from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_PROGRAMS,
  INITIAL_ROOMS,
  INITIAL_PANELISTS,
  INITIAL_ADVISERS,
  INITIAL_STUDENTS,
  INITIAL_TITLES,
  INITIAL_SCHEDULES,
  INITIAL_AVAILABILITY,
  INITIAL_NOTIFICATIONS,
  USERS_SEED,
  DEFAULT_STUDENT_PASSWORD
} from '../data/mockData';
import {
  getStudentGroupLabel,
  normalizeGroupName,
  resolveScheduleGroupName,
  resolveTitleGroupName
} from '../utils/studentGroups';
import {
  formatStandardTime,
  formatTimeRange,
  getCurrentStandardTime
} from '../utils/timeFormat';

interface AppContextType {
  currentUser: User;
  users: User[];
  currentRole: UserRole;
  students: Student[];
  panelists: Panelist[];
  advisers: Adviser[];
  rooms: Room[];
  programs: AcademicProgram[];
  titles: CapstoneTitle[];
  schedules: DefenseSchedule[];
  availability: AvailabilitySlot[];
  notifications: AppNotification[];
  settings: SystemSettings;

  // Navigation & selection state
  activeTab: string;
  setActiveTab: (tab: string) => void;
  goBack: () => void;
  canGoBack: boolean;
  selectedStudent: Student | null;
  setSelectedStudent: (student: Student | null) => void;
  selectedSchedule: DefenseSchedule | null;
  setSelectedSchedule: (schedule: DefenseSchedule | null) => void;

  // Actions
  switchRole: (role: UserRole) => void;
  switchUserById: (userId: string) => void;
  checkConflicts: (candidate: {
    id?: string;
    studentId: string;
    roomId: string;
    date: string;
    startTime: string;
    endTime: string;
    panelistIds: string[];
  }) => ConflictWarning[];
  createSchedule: (scheduleData: Omit<DefenseSchedule, 'id'>) => { success: boolean; warnings: ConflictWarning[] };
  updateSchedule: (id: string, updates: Partial<DefenseSchedule>) => void;
  cancelSchedule: (id: string, reason: string) => void;
  rescheduleDefense: (id: string, newDate: string, newStartTime: string, newEndTime: string, newRoomId: string, reason: string) => void;
  scheduleReDefense: (
    id: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string,
    newRoomId: string
  ) => { success: boolean; warnings: ConflictWarning[] };
  submitCapstoneTitle: (data: {
    title: string;
    abstract: string;
    problemStatement: string;
    objectives: string[];
    techStack: string[];
    adviserId: string;
    defenseStage: CapstoneTitle['defenseStage'];
  }) => void;
  reviewCapstoneTitle: (titleId: string, status: TitleStatus, remarks: string, customReviewer?: string) => void;

  // User & entity management
  addStudent: (student: Omit<Student, 'id' | 'userId'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  bulkUpdateStudents: (studentIds: string[], updates: Partial<Student>) => void;
  toggleStudentStatus: (id: string) => void;
  assignStudentAdviser: (studentId: string, adviserId: string) => void;
  resetUserPassword: (accountId: string, role: UserRole, newPassword?: string) => void;

  addPanelist: (panelist: Omit<Panelist, 'id' | 'userId'>) => void;
  updatePanelist: (id: string, updates: Partial<Panelist>) => void;
  togglePanelistStatus: (id: string) => void;

  addAdviser: (adviser: Omit<Adviser, 'id' | 'userId'>) => void;
  updateAdviser: (id: string, updates: Partial<Adviser>) => void;
  toggleAdviserStatus: (id: string) => void;

  addRoom: (room: Omit<Room, 'id'>) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  toggleRoomAvailability: (id: string) => void;

  addProgram: (program: Omit<AcademicProgram, 'id'>) => void;
  updateProgram: (id: string, updates: Partial<AcademicProgram>) => void;

  updateAvailabilitySlot: (slot: AvailabilitySlot) => void;
  addAvailabilitySlot: (slot: Omit<AvailabilitySlot, 'id'>) => void;
  deleteAvailabilitySlot: (id: string) => void;

  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  sendAnnouncement: (title: string, message: string, targetRole?: UserRole | 'all') => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'sti_capstone_v1_';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.error(`Error loading ${key} from storage:`, err);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function rangesOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  const aStart = timeToMinutes(startA);
  const aEnd = timeToMinutes(endA);
  const bStart = timeToMinutes(startB);
  const bEnd = timeToMinutes(endB);
  return Math.max(aStart, bStart) < Math.min(aEnd, bEnd);
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => loadFromStorage('users', USERS_SEED));
  const [currentRole, setCurrentRole] = useState<UserRole>(() => loadFromStorage('role', 'student'));
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedUsers = loadFromStorage<User[]>('users', USERS_SEED);
    const savedUserId = loadFromStorage<string>('current_user_id', '');
    if (savedUserId) {
      const matched = savedUsers.find(u => u.id === savedUserId);
      if (matched) return matched;
    }
    const storedRole = loadFromStorage<UserRole>('role', 'student');
    return savedUsers.find(u => u.role === storedRole) || USERS_SEED[0];
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const loaded = loadFromStorage<Student[]>('students', INITIAL_STUDENTS);
    const seedById = new Map(INITIAL_STUDENTS.map(s => [s.id, s]));

    const hydrated = loaded.map(s => {
      if (s.groupName && s.groupName.trim()) return s;
      const seedMatch = seedById.get(s.id);
      if (seedMatch?.groupName) {
        return { ...s, groupName: seedMatch.groupName };
      }
      return { ...s, groupName: normalizeGroupName('', s.name) };
    });

    const existingIds = new Set(hydrated.map(s => s.id));
    const missingSeedMembers = INITIAL_STUDENTS.filter(s => !existingIds.has(s.id));
    const navajasSeeds = missingSeedMembers.filter(s => s.groupName === 'NAVAJAS GROUP');
    const otherMissingSeeds = missingSeedMembers.filter(s => s.groupName !== 'NAVAJAS GROUP');
    return [...navajasSeeds, ...hydrated, ...otherMissingSeeds];
  });

  const [panelists, setPanelists] = useState<Panelist[]>(() => {
    const loaded = loadFromStorage<Panelist[]>('panelists', INITIAL_PANELISTS);
    const seedById = new Map(INITIAL_PANELISTS.map(p => [p.id, p]));
    return loaded.map(p => ({
      ...p,
      maxDefenses: p.maxDefenses ?? seedById.get(p.id)?.maxDefenses ?? 6
    }));
  });

  const [advisers, setAdvisers] = useState<Adviser[]>(() => loadFromStorage('advisers', INITIAL_ADVISERS));
  const [rooms, setRooms] = useState<Room[]>(() => loadFromStorage('rooms', INITIAL_ROOMS));
  const [programs, setPrograms] = useState<AcademicProgram[]>(() => {
    const loaded = loadFromStorage<AcademicProgram[]>('programs', INITIAL_PROGRAMS);
    return loaded.filter(p => p.code !== 'BSIS');
  });

  const [titles, setTitles] = useState<CapstoneTitle[]>(() => {
    const loaded = loadFromStorage<CapstoneTitle[]>('titles', INITIAL_TITLES);
    const seedById = new Map(INITIAL_TITLES.map(t => [t.id, t]));
    const hydrated = loaded.map(t => {
      const seed = seedById.get(t.id);
      return {
        ...t,
        groupName: t.groupName || seed?.groupName || resolveTitleGroupName(t, INITIAL_STUDENTS),
        remarks:
          t.remarks && /(First 30|31st & Up|Endorsed \(#)/.test(t.remarks) && seed?.remarks
            ? seed.remarks
            : t.remarks
      };
    });
    const existingIds = new Set(hydrated.map(t => t.id));
    const missingSeeds = INITIAL_TITLES.filter(t => !existingIds.has(t.id));
    return [...hydrated, ...missingSeeds];
  });

  const [schedules, setSchedules] = useState<DefenseSchedule[]>(() => {
    const loaded = loadFromStorage<DefenseSchedule[]>('schedules', INITIAL_SCHEDULES);
    const seedById = new Map(INITIAL_SCHEDULES.map(s => [s.id, s]));
    const hydrated = loaded.map(s => {
      const seed = seedById.get(s.id);
      return {
        ...s,
        groupName: s.groupName || seed?.groupName || resolveScheduleGroupName(s, INITIAL_STUDENTS)
      };
    });
    const existingIds = new Set(hydrated.map(s => s.id));
    const missingSeeds = INITIAL_SCHEDULES.filter(s => !existingIds.has(s.id));
    return [...hydrated, ...missingSeeds];
  });

  const [availability, setAvailability] = useState<AvailabilitySlot[]>(() =>
    loadFromStorage('availability', INITIAL_AVAILABILITY)
  );

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const loaded = loadFromStorage<AppNotification[]>('notifications', INITIAL_NOTIFICATIONS);
    return loaded
      .filter(
        n =>
          n.linkTab !== 'Apply for Adviser' &&
          n.linkTab !== 'Adviser Requests' &&
          n.linkTab !== 'Account Approvals'
      )
      .map(n =>
        n.linkTab === 'My Capstone Title'
          ? { ...n, linkTab: 'Capstone Titles' }
          : n.linkTab === 'Advisee Titles'
          ? { ...n, linkTab: 'Capstone Titles' }
          : n
      );
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const loaded = loadFromStorage<SystemSettings>('settings', INITIAL_SETTINGS);
    return {
      ...INITIAL_SETTINGS,
      ...loaded
    };
  });

  const [activeTab, setActiveTabState] = useState<string>('Dashboard');
  const [tabHistory, setTabHistory] = useState<string[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<DefenseSchedule | null>(null);

  const setActiveTab = (tab: string) => {
    setActiveTabState(prev => {
      if (prev !== tab) {
        setTabHistory(h => [...h, prev]);
      }
      return tab;
    });
  };

  const goBack = () => {
    setTabHistory(h => {
      if (h.length === 0) {
        setActiveTabState('Dashboard');
        return [];
      }
      const previous = h[h.length - 1];
      setActiveTabState(previous || 'Dashboard');
      return h.slice(0, -1);
    });
  };

  const canGoBack = activeTab !== 'Dashboard' || tabHistory.length > 0;

  useEffect(() => { saveToStorage('users', users); }, [users]);
  useEffect(() => { saveToStorage('current_user_id', currentUser.id); }, [currentUser]);
  useEffect(() => { saveToStorage('role', currentRole); }, [currentRole]);
  useEffect(() => { saveToStorage('students', students); }, [students]);
  useEffect(() => { saveToStorage('panelists', panelists); }, [panelists]);
  useEffect(() => { saveToStorage('advisers', advisers); }, [advisers]);
  useEffect(() => { saveToStorage('rooms', rooms); }, [rooms]);
  useEffect(() => { saveToStorage('programs', programs); }, [programs]);
  useEffect(() => { saveToStorage('titles', titles); }, [titles]);
  useEffect(() => { saveToStorage('schedules', schedules); }, [schedules]);
  useEffect(() => { saveToStorage('availability', availability); }, [availability]);
  useEffect(() => { saveToStorage('notifications', notifications); }, [notifications]);
  useEffect(() => { saveToStorage('settings', settings); }, [settings]);

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    const user = users.find(u => u.role === role) || users[0];
    setCurrentUser(user);
    setActiveTabState('Dashboard');
    setTabHistory([]);
    setSelectedStudent(null);
    setSelectedSchedule(null);
  };

  const switchUserById = (userId: string) => {
    const existingUser = users.find(u => u.id === userId);
    if (existingUser) {
      setCurrentUser(existingUser);
      setCurrentRole(existingUser.role);
      setActiveTabState('Dashboard');
      setTabHistory([]);
      setSelectedStudent(null);
      setSelectedSchedule(null);
      return;
    }

    const matchedStudent = students.find(s => s.userId === userId || s.id === userId);
    if (matchedStudent) {
      const synthesized: User = {
        id: matchedStudent.userId,
        name: matchedStudent.name,
        email: matchedStudent.email,
        role: 'student',
        studentNumber: matchedStudent.studentNumber,
        program: matchedStudent.program,
        contactNumber: matchedStudent.contactNumber,
        password: matchedStudent.password,
        isActive: matchedStudent.isActive
      };
      setUsers(prev => (prev.some(u => u.id === synthesized.id) ? prev : [...prev, synthesized]));
      setCurrentUser(synthesized);
      setCurrentRole('student');
      setActiveTabState('Dashboard');
      setTabHistory([]);
      setSelectedStudent(null);
      setSelectedSchedule(null);
      return;
    }

    const matchedAdviser = advisers.find(a => a.userId === userId || a.id === userId);
    if (matchedAdviser) {
      const synthesized: User = {
        id: matchedAdviser.userId,
        name: matchedAdviser.name,
        email: matchedAdviser.email,
        role: 'adviser',
        employeeId: matchedAdviser.employeeId,
        department: matchedAdviser.department,
        contactNumber: matchedAdviser.contactNumber,
        isActive: matchedAdviser.isActive
      };
      setUsers(prev => (prev.some(u => u.id === synthesized.id) ? prev : [...prev, synthesized]));
      setCurrentUser(synthesized);
      setCurrentRole('adviser');
      setActiveTabState('Dashboard');
      setTabHistory([]);
      return;
    }

    const matchedPanelist = panelists.find(p => p.userId === userId || p.id === userId);
    if (matchedPanelist) {
      const synthesized: User = {
        id: matchedPanelist.userId,
        name: matchedPanelist.name,
        email: matchedPanelist.email,
        role: 'panelist',
        employeeId: matchedPanelist.employeeId,
        department: matchedPanelist.department,
        contactNumber: matchedPanelist.contactNumber,
        isActive: matchedPanelist.isActive
      };
      setUsers(prev => (prev.some(u => u.id === synthesized.id) ? prev : [...prev, synthesized]));
      setCurrentUser(synthesized);
      setCurrentRole('panelist');
      setActiveTabState('Dashboard');
      setTabHistory([]);
    }
  };

  const checkConflicts = (candidate: {
    id?: string;
    studentId: string;
    roomId: string;
    date: string;
    startTime: string;
    endTime: string;
    panelistIds: string[];
  }): ConflictWarning[] => {
    const warnings: ConflictWarning[] = [];
    const activeSchedules = schedules.filter(s => s.status !== 'Cancelled' && s.id !== candidate.id);

    const roomOverlap = activeSchedules.find(
      s =>
        s.date === candidate.date &&
        s.roomId === candidate.roomId &&
        rangesOverlap(s.startTime, s.endTime, candidate.startTime, candidate.endTime)
    );
    if (roomOverlap) {
      const grp = resolveScheduleGroupName(roomOverlap, students);
      warnings.push({
        type: 'room',
        message: `Room conflict: "${roomOverlap.roomName}" is occupied on ${candidate.date} (${formatTimeRange(roomOverlap.startTime, roomOverlap.endTime)}) by ${grp}.`,
        conflictingScheduleId: roomOverlap.id,
        details: `Occupied by: ${grp} (${roomOverlap.program})`
      });
    }

    const candidateStudent = students.find(s => s.id === candidate.studentId);
    const candidateGroup = candidateStudent ? getStudentGroupLabel(candidateStudent) : '';

    const studentOverlap = activeSchedules.find(s => {
      if (s.date !== candidate.date) return false;
      if (!rangesOverlap(s.startTime, s.endTime, candidate.startTime, candidate.endTime)) return false;
      if (s.studentId === candidate.studentId) return true;
      if (candidateGroup && candidateStudent) {
        return resolveScheduleGroupName(s, students) === candidateGroup && s.program === candidateStudent.program;
      }
      return false;
    });
    if (studentOverlap) {
      warnings.push({
        type: 'student',
        message: `Group conflict: ${candidateGroup || candidate.studentId} already has a defense session on ${candidate.date} (${formatTimeRange(studentOverlap.startTime, studentOverlap.endTime)}).`,
        conflictingScheduleId: studentOverlap.id,
        details: `Existing schedule: ${studentOverlap.defenseStage}`
      });
    }

    for (const panelId of candidate.panelistIds) {
      const panelOverlap = activeSchedules.find(
        s =>
          s.date === candidate.date &&
          s.panelists.some(p => p.panelistId === panelId) &&
          rangesOverlap(s.startTime, s.endTime, candidate.startTime, candidate.endTime)
      );
      if (panelOverlap) {
        const panObj = panelists.find(p => p.id === panelId);
        const grp = resolveScheduleGroupName(panelOverlap, students);
        warnings.push({
          type: 'panelist',
          message: `Panelist conflict: ${panObj?.name || 'Assigned panelist'} is already serving on another panel on ${candidate.date} (${formatTimeRange(panelOverlap.startTime, panelOverlap.endTime)}) for ${grp}.`,
          conflictingScheduleId: panelOverlap.id,
          details: `Assigned to: ${grp}`
        });
      }
    }

    return warnings;
  };

  const createSchedule = (scheduleData: Omit<DefenseSchedule, 'id'>) => {
    const warnings = checkConflicts({
      studentId: scheduleData.studentId,
      roomId: scheduleData.roomId,
      date: scheduleData.date,
      startTime: scheduleData.startTime,
      endTime: scheduleData.endTime,
      panelistIds: scheduleData.panelists.map(p => p.panelistId)
    });

    const student = students.find(s => s.id === scheduleData.studentId);
    const resolvedGroup =
      scheduleData.groupName ||
      (student ? getStudentGroupLabel(student) : normalizeGroupName('', scheduleData.studentName));

    const newId = `def-${Date.now()}`;
    const newSchedule: DefenseSchedule = {
      ...scheduleData,
      groupName: resolvedGroup,
      id: newId
    };

    setSchedules(prev => [newSchedule, ...prev]);

    if (student) {
      const notifStudent: AppNotification = {
        id: `notif-${Date.now()}-1`,
        userId: student.userId,
        title: `Defense Scheduled: ${resolvedGroup}`,
        message: `Your group's defense has been scheduled for ${scheduleData.date} (${formatTimeRange(scheduleData.startTime, scheduleData.endTime)}) in ${scheduleData.roomName}.`,
        date: new Date().toISOString().split('T')[0],
        time: getCurrentStandardTime(),
        isRead: false,
        type: 'defense',
        linkTab: 'Defense Schedule'
      };
      setNotifications(prev => [notifStudent, ...prev]);
    }

    scheduleData.panelists.forEach((p, idx) => {
      const pan = panelists.find(item => item.id === p.panelistId);
      if (pan) {
        const notifPan: AppNotification = {
          id: `notif-${Date.now()}-p${idx}`,
          userId: pan.userId,
          title: `New Defense Assignment: ${resolvedGroup}`,
          message: `You are assigned as ${p.role} for ${resolvedGroup} (${scheduleData.program}) on ${scheduleData.date} (${formatTimeRange(scheduleData.startTime, scheduleData.endTime)}) in ${scheduleData.roomName}.`,
          date: new Date().toISOString().split('T')[0],
          time: getCurrentStandardTime(),
          isRead: false,
          type: 'defense',
          linkTab: 'Defense Schedule'
        };
        setNotifications(prev => [notifPan, ...prev]);
      }
    });

    return { success: true, warnings };
  };

  const updateSchedule = (id: string, updates: Partial<DefenseSchedule>) => {
    setSchedules(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));

    const target = schedules.find(s => s.id === id);
    if (target) {
      const updated = { ...target, ...updates };
      const grp = resolveScheduleGroupName(updated, students);
      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        userId: 'all',
        title: `Defense Updated: ${grp}`,
        message: `Defense details updated for ${grp} (${updated.status}). Date: ${updated.date}, Time: ${formatTimeRange(updated.startTime, updated.endTime)}, Room: ${updated.roomName}.`,
        date: new Date().toISOString().split('T')[0],
        time: getCurrentStandardTime(),
        isRead: false,
        type: 'defense',
        linkTab: 'Defense Schedule'
      };
      setNotifications(prev => [notif, ...prev]);
    }
  };

  const cancelSchedule = (id: string, reason: string) => {
    setSchedules(prev =>
      prev.map(s => (s.id === id ? { ...s, status: 'Cancelled', remarks: `Cancelled: ${reason}` } : s))
    );

    const target = schedules.find(s => s.id === id);
    if (target) {
      const grp = resolveScheduleGroupName(target, students);
      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        userId: 'all',
        title: `Defense Cancelled: ${grp}`,
        message: `The defense for ${grp} on ${target.date} (${formatStandardTime(target.startTime)}) in ${target.roomName} has been cancelled. Reason: ${reason}`,
        date: new Date().toISOString().split('T')[0],
        time: getCurrentStandardTime(),
        isRead: false,
        type: 'defense',
        linkTab: 'Defense Schedule'
      };
      setNotifications(prev => [notif, ...prev]);
    }
  };

  const rescheduleDefense = (
    id: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string,
    newRoomId: string,
    reason: string
  ) => {
    const room = rooms.find(r => r.id === newRoomId);
    const roomName = room ? room.name : 'TBD';

    setSchedules(prev =>
      prev.map(s => {
        if (s.id === id) {
          return {
            ...s,
            date: newDate,
            startTime: newStartTime,
            endTime: newEndTime,
            roomId: newRoomId,
            roomName: roomName,
            status: 'Rescheduled',
            remarks: `Rescheduled: ${reason}`
          };
        }
        return s;
      })
    );

    const target = schedules.find(s => s.id === id);
    if (target) {
      const grp = resolveScheduleGroupName(target, students);
      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        userId: 'all',
        title: `Defense Rescheduled: ${grp}`,
        message: `Defense for ${grp} moved to ${newDate} at ${formatTimeRange(newStartTime, newEndTime)} in ${roomName}. Reason: ${reason}`,
        date: new Date().toISOString().split('T')[0],
        time: getCurrentStandardTime(),
        isRead: false,
        type: 'defense',
        linkTab: 'Defense Schedule'
      };
      setNotifications(prev => [notif, ...prev]);
    }
  };

  const scheduleReDefense = (
    id: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string,
    newRoomId: string
  ): { success: boolean; warnings: ConflictWarning[] } => {
    const target = schedules.find(s => s.id === id);
    if (!target) {
      return { success: false, warnings: [] };
    }

    const warnings = checkConflicts({
      id: target.id,
      studentId: target.studentId,
      roomId: newRoomId,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      panelistIds: target.panelists.map(p => p.panelistId)
    });

    const room = rooms.find(r => r.id === newRoomId);
    const roomName = room ? room.name : target.roomName;

    setSchedules(prev =>
      prev.map(s =>
        s.id === id
          ? {
              ...s,
              date: newDate,
              startTime: newStartTime,
              endTime: newEndTime,
              roomId: newRoomId,
              roomName,
              status: 'For Re-Defense',
              remarks: ''
            }
          : s
      )
    );

    const grp = resolveScheduleGroupName(target, students);
    const notif: AppNotification = {
      id: `notif-${Date.now()}-redef`,
      userId: 'all',
      title: `Re-Defense Scheduled: ${grp}`,
      message: `Re-defense session for ${grp} (${target.program} · ${target.defenseStage}) has been scheduled on ${newDate} (${formatTimeRange(newStartTime, newEndTime)}) in ${roomName}.`,
      date: new Date().toISOString().split('T')[0],
      time: getCurrentStandardTime(),
      isRead: false,
      type: 'defense',
      linkTab: 'Defense Schedule'
    };
    setNotifications(prev => [notif, ...prev]);

    return { success: true, warnings };
  };

  const submitCapstoneTitle = (data: {
    title: string;
    abstract: string;
    problemStatement: string;
    objectives: string[];
    techStack: string[];
    adviserId: string;
    defenseStage: CapstoneTitle['defenseStage'];
  }) => {
    const student = students.find(s => s.userId === currentUser.id) || students[0];
    const adviser = advisers.find(a => a.id === data.adviserId) || advisers[0];
    const groupLabel = getStudentGroupLabel(student);

    const newTitle: CapstoneTitle = {
      id: `title-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      studentNumber: student.studentNumber,
      program: student.program,
      groupName: groupLabel,
      adviserId: adviser.id,
      adviserName: adviser.name,
      title: data.title,
      abstract: data.abstract,
      problemStatement: data.problemStatement,
      objectives: data.objectives,
      techStack: data.techStack,
      status: 'Pending',
      remarks: 'Submitted endorsed title saved to repository. Awaiting review/approval.',
      submittedAt: new Date().toISOString().split('T')[0],
      defenseStage: data.defenseStage,
      version: 1
    };

    setTitles(prev => [newTitle, ...prev]);

    setStudents(prev =>
      prev.map(s =>
        getStudentGroupLabel(s) === groupLabel && s.program === student.program
          ? { ...s, currentTitleId: newTitle.id }
          : s
      )
    );

    const notifAdviser: AppNotification = {
      id: `notif-${Date.now()}-adv`,
      userId: adviser.userId,
      title: `Submitted Endorsed Title: ${groupLabel}`,
      message: `${groupLabel} (${student.program}) submitted their endorsed title: "${data.title}".`,
      date: new Date().toISOString().split('T')[0],
      time: getCurrentStandardTime(),
      isRead: false,
      type: 'title',
      linkTab: 'Capstone Titles'
    };

    const notifAdmin: AppNotification = {
      id: `notif-${Date.now()}-adm`,
      userId: 'user-admin-1',
      title: `New Endorsed Title Submitted: ${groupLabel}`,
      message: `${groupLabel} submitted "${data.title}" under adviser ${adviser.name}.`,
      date: new Date().toISOString().split('T')[0],
      time: getCurrentStandardTime(),
      isRead: false,
      type: 'title',
      linkTab: 'Capstone Titles'
    };

    setNotifications(prev => [notifAdviser, notifAdmin, ...prev]);
  };

  const reviewCapstoneTitle = (
    titleId: string,
    status: TitleStatus,
    remarks: string,
    customReviewer?: string
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const reviewerLabel =
      customReviewer ||
      `${currentUser.name} (${
        currentUser.role === 'adviser' ? 'Adviser' : currentUser.role === 'admin' ? 'Coordinator' : currentUser.role
      })`;

    setTitles(prev =>
      prev.map(t => {
        if (t.id === titleId) {
          return {
            ...t,
            status,
            remarks,
            reviewedAt: today,
            reviewedBy: reviewerLabel
          };
        }
        return t;
      })
    );

    const targetTitle = titles.find(t => t.id === titleId);
    if (targetTitle) {
      const student = students.find(s => s.id === targetTitle.studentId);
      const grp = resolveTitleGroupName(targetTitle, students);
      if (student) {
        const notifStudent: AppNotification = {
          id: `notif-${Date.now()}-rev`,
          userId: student.userId,
          title: `Capstone Title ${status}: ${grp}`,
          message: `Your group's endorsed title "${targetTitle.title}" has been marked as ${status}. Remarks: "${remarks}"`,
          date: today,
          time: getCurrentStandardTime(),
          isRead: false,
          type: 'title',
          linkTab: 'Capstone Titles'
        };

        const notifAdmin: AppNotification = {
          id: `notif-${Date.now()}-adv-endorse`,
          userId: 'user-admin-1',
          title: `Title ${status} — ${grp}`,
          message: `${reviewerLabel} updated "${targetTitle.title}" (${grp}) to ${status}.`,
          date: today,
          time: getCurrentStandardTime(),
          isRead: false,
          type: 'title',
          linkTab: 'Capstone Titles'
        };

        setNotifications(prev => [notifStudent, notifAdmin, ...prev]);
      }
    }
  };

  const addStudent = (studentData: Omit<Student, 'id' | 'userId'>) => {
    const ts = Date.now();
    const newId = `stud-${ts}`;
    const newUserId = `user-student-${ts}`;
    const cleanPassword = studentData.password?.trim() || DEFAULT_STUDENT_PASSWORD;
    const cleanGroup = normalizeGroupName(studentData.groupName || '', studentData.name);
    const newStudent: Student = {
      ...studentData,
      groupName: cleanGroup,
      id: newId,
      userId: newUserId,
      password: cleanPassword
    };
    const newUser: User = {
      id: newUserId,
      name: studentData.name,
      email: studentData.email,
      role: 'student',
      studentNumber: studentData.studentNumber,
      program: studentData.program,
      department:
        studentData.program === 'BSCpE'
          ? 'College of Engineering'
          : 'College of Information & Communications Technology',
      contactNumber: studentData.contactNumber,
      password: cleanPassword,
      isActive: studentData.isActive
    };
    setStudents(prev => [newStudent, ...prev]);
    setUsers(prev => [newUser, ...prev]);
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    const target = students.find(s => s.id === id);
    setStudents(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
    if (target) {
      setUsers(prev =>
        prev.map(u =>
          u.id === target.userId
            ? {
                ...u,
                ...(updates.name !== undefined ? { name: updates.name } : {}),
                ...(updates.email !== undefined ? { email: updates.email } : {}),
                ...(updates.studentNumber !== undefined ? { studentNumber: updates.studentNumber } : {}),
                ...(updates.program !== undefined ? { program: updates.program } : {}),
                ...(updates.contactNumber !== undefined ? { contactNumber: updates.contactNumber } : {}),
                ...(updates.password !== undefined ? { password: updates.password } : {}),
                ...(updates.isActive !== undefined ? { isActive: updates.isActive } : {})
              }
            : u
        )
      );
    }
  };

  const bulkUpdateStudents = (studentIds: string[], updates: Partial<Student>) => {
    const idSet = new Set(studentIds);
    const updatedUserIds = new Set(students.filter(s => idSet.has(s.id)).map(s => s.userId));

    setStudents(prev => prev.map(s => (idSet.has(s.id) ? { ...s, ...updates } : s)));

    if (updates.isActive !== undefined) {
      setUsers(prev =>
        prev.map(u => (updatedUserIds.has(u.id) ? { ...u, isActive: updates.isActive as boolean } : u))
      );
    }
  };

  const toggleStudentStatus = (id: string) => {
    const target = students.find(s => s.id === id);
    setStudents(prev => prev.map(s => (s.id === id ? { ...s, isActive: !s.isActive } : s)));
    if (target) {
      setUsers(prev =>
        prev.map(u => (u.id === target.userId ? { ...u, isActive: !target.isActive } : u))
      );
    }
  };

  const assignStudentAdviser = (studentId: string, adviserId: string) => {
    const adviser = advisers.find(a => a.id === adviserId);
    if (adviser) {
      setStudents(prev =>
        prev.map(s =>
          s.id === studentId
            ? {
                ...s,
                adviserId: adviser.id,
                adviserName: adviser.name
              }
            : s
        )
      );

      setTitles(prev =>
        prev.map(t =>
          t.studentId === studentId
            ? {
                ...t,
                adviserId: adviser.id,
                adviserName: adviser.name
              }
            : t
        )
      );

      setSchedules(prev =>
        prev.map(sch =>
          sch.studentId === studentId
            ? {
                ...sch,
                adviserId: adviser.id,
                adviserName: adviser.name
              }
            : sch
        )
      );
    }
  };

  const resetUserPassword = (accountId: string, role: UserRole, newPassword?: string) => {
    const pwd = newPassword?.trim() || (role === 'student' ? DEFAULT_STUDENT_PASSWORD : 'sti2026!');
    if (role === 'student') {
      const target = students.find(s => s.id === accountId || s.userId === accountId);
      if (target) {
        setStudents(prev => prev.map(s => (s.id === target.id ? { ...s, password: pwd } : s)));
        setUsers(prev => prev.map(u => (u.id === target.userId ? { ...u, password: pwd } : u)));
        return;
      }
    }
    setUsers(prev => prev.map(u => (u.id === accountId ? { ...u, password: pwd } : u)));
  };

  const addPanelist = (panelistData: Omit<Panelist, 'id' | 'userId'>) => {
    const newId = `panel-${Date.now()}`;
    const newUserId = `user-panelist-${Date.now()}`;
    const newPan: Panelist = {
      ...panelistData,
      maxDefenses: panelistData.maxDefenses ?? 6,
      id: newId,
      userId: newUserId
    };
    setPanelists(prev => [newPan, ...prev]);
  };

  const updatePanelist = (id: string, updates: Partial<Panelist>) => {
    setPanelists(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
  };

  const togglePanelistStatus = (id: string) => {
    setPanelists(prev => prev.map(p => (p.id === id ? { ...p, isActive: !p.isActive } : p)));
  };

  const addAdviser = (adviserData: Omit<Adviser, 'id' | 'userId'>) => {
    const newId = `adv-${Date.now()}`;
    const newUserId = `user-adviser-${Date.now()}`;
    const newAdv: Adviser = {
      ...adviserData,
      id: newId,
      userId: newUserId
    };
    setAdvisers(prev => [newAdv, ...prev]);
  };

  const updateAdviser = (id: string, updates: Partial<Adviser>) => {
    setAdvisers(prev => prev.map(a => (a.id === id ? { ...a, ...updates } : a)));
  };

  const toggleAdviserStatus = (id: string) => {
    setAdvisers(prev => prev.map(a => (a.id === id ? { ...a, isActive: !a.isActive } : a)));
  };

  const addRoom = (roomData: Omit<Room, 'id'>) => {
    const newRoom: Room = {
      ...roomData,
      id: `room-${Date.now()}`
    };
    setRooms(prev => [...prev, newRoom]);
  };

  const updateRoom = (id: string, updates: Partial<Room>) => {
    setRooms(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
  };

  const toggleRoomAvailability = (id: string) => {
    setRooms(prev => prev.map(r => (r.id === id ? { ...r, isAvailable: !r.isAvailable } : r)));
  };

  const addProgram = (programData: Omit<AcademicProgram, 'id'>) => {
    const newProg: AcademicProgram = {
      ...programData,
      id: `prog-${Date.now()}`
    };
    setPrograms(prev => [...prev, newProg]);
  };

  const updateProgram = (id: string, updates: Partial<AcademicProgram>) => {
    setPrograms(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
  };

  const updateAvailabilitySlot = (slot: AvailabilitySlot) => {
    setAvailability(prev => prev.map(s => (s.id === slot.id ? slot : s)));
  };

  const addAvailabilitySlot = (slotData: Omit<AvailabilitySlot, 'id'>) => {
    const newSlot: AvailabilitySlot = {
      ...slotData,
      id: `av-${Date.now()}`
    };
    setAvailability(prev => [...prev, newSlot]);
  };

  const deleteAvailabilitySlot = (id: string) => {
    setAvailability(prev => prev.filter(s => s.id !== id));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const sendAnnouncement = (title: string, message: string, targetRole: UserRole | 'all' = 'all') => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: targetRole === 'all' ? 'all' : targetRole,
      roleTarget: targetRole,
      title,
      message,
      date: new Date().toISOString().split('T')[0],
      time: getCurrentStandardTime(),
      isRead: false,
      type: 'announcement',
      linkTab: 'Notifications'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetAllData = () => {
    localStorage.clear();
    setUsers(USERS_SEED);
    setStudents(INITIAL_STUDENTS);
    setPanelists(INITIAL_PANELISTS);
    setAdvisers(INITIAL_ADVISERS);
    setRooms(INITIAL_ROOMS);
    setPrograms(INITIAL_PROGRAMS);
    setTitles(INITIAL_TITLES);
    setSchedules(INITIAL_SCHEDULES);
    setAvailability(INITIAL_AVAILABILITY);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSettings(INITIAL_SETTINGS);
    setCurrentRole('student');
    setCurrentUser(USERS_SEED[0]);
    setActiveTab('Dashboard');
    setSelectedStudent(null);
    setSelectedSchedule(null);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        currentRole,
        students,
        panelists,
        advisers,
        rooms,
        programs,
        titles,
        schedules,
        availability,
        notifications,
        settings,
        activeTab,
        setActiveTab,
        goBack,
        canGoBack,
        selectedStudent,
        setSelectedStudent,
        selectedSchedule,
        setSelectedSchedule,
        switchRole,
        switchUserById,
        checkConflicts,
        createSchedule,
        updateSchedule,
        cancelSchedule,
        rescheduleDefense,
        scheduleReDefense,
        submitCapstoneTitle,
        reviewCapstoneTitle,
        addStudent,
        updateStudent,
        bulkUpdateStudents,
        toggleStudentStatus,
        assignStudentAdviser,
        resetUserPassword,
        addPanelist,
        updatePanelist,
        togglePanelistStatus,
        addAdviser,
        updateAdviser,
        toggleAdviserStatus,
        addRoom,
        updateRoom,
        toggleRoomAvailability,
        addProgram,
        updateProgram,
        updateAvailabilitySlot,
        addAvailabilitySlot,
        deleteAvailabilitySlot,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        sendAnnouncement,
        updateSettings,
        resetAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
