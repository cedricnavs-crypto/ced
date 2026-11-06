import { Student, CapstoneTitle, DefenseSchedule } from '../types';

export interface ProgressStep {
  step: number;
  label: string;
  sublabel: string;
  status: 'completed' | 'current' | 'warning' | 'upcoming';
}

export interface StudentProgressSummary {
  percentage: number;
  widthClass: string;
  barColorClass: string;
  stageLabel: string;
  tone: 'emerald' | 'blue' | 'amber' | 'rose' | 'slate';
  steps: ProgressStep[];
}

export function getStudentProgress(
  student: Student,
  titles: CapstoneTitle[],
  schedules: DefenseSchedule[]
): StudentProgressSummary {
  const hasAdviser = Boolean(
    student.adviserId &&
      student.adviserName &&
      student.adviserName !== 'Unassigned'
  );

  const studentTitles = titles.filter(t => t.studentId === student.id);
  const activeTitle = studentTitles[0];

  const studentSchedules = schedules.filter(s => s.studentId === student.id);
  const activeSchedule =
    studentSchedules.find(
      s => s.status === 'Scheduled' || s.status === 'Rescheduled'
    ) || studentSchedules.find(s => s.status === 'Completed');
  const completedSchedules = studentSchedules.filter(
    s => s.status === 'Completed'
  );
  const isFinalCompleted = completedSchedules.some(
    s => s.defenseStage === 'Final Capstone Defense'
  );
  const hasAnyCompletedDefense = completedSchedules.length > 0;

  const isTitleSubmitted = Boolean(activeTitle);
  const isTitleEndorsed = activeTitle?.status === 'Approved';
  const isTitleRejected = activeTitle?.status === 'Rejected';

  let percentage = 10;
  let widthClass = 'w-[10%]';
  let stageLabel = 'Awaiting Adviser';
  let tone: StudentProgressSummary['tone'] = 'slate';

  if (isFinalCompleted) {
    percentage = 100;
    widthClass = 'w-full';
    stageLabel = 'Final Defense Completed';
    tone = 'emerald';
  } else if (
    hasAnyCompletedDefense &&
    (!activeSchedule || activeSchedule.status === 'Completed')
  ) {
    percentage = 90;
    widthClass = 'w-[90%]';
    stageLabel = `${completedSchedules[0].defenseStage} Passed`;
    tone = 'emerald';
  } else if (
    activeSchedule &&
    (activeSchedule.status === 'Scheduled' ||
      activeSchedule.status === 'Rescheduled')
  ) {
    percentage = 80;
    widthClass = 'w-[80%]';
    stageLabel = `Scheduled: ${activeSchedule.defenseStage}`;
    tone = 'blue';
  } else if (isTitleEndorsed) {
    percentage = 60;
    widthClass = 'w-[60%]';
    stageLabel = 'Endorsed · Ready for Scheduling';
    tone = 'emerald';
  } else if (isTitleRejected) {
    percentage = 35;
    widthClass = 'w-[35%]';
    stageLabel = 'Title Revision Requested';
    tone = 'rose';
  } else if (isTitleSubmitted) {
    percentage = 40;
    widthClass = 'w-[40%]';
    stageLabel = 'Proposal Under Adviser Review';
    tone = 'amber';
  } else if (hasAdviser) {
    percentage = 20;
    widthClass = 'w-[20%]';
    stageLabel = 'Adviser Assigned · Awaiting Title';
    tone = 'blue';
  }

  const barColorClass =
    tone === 'emerald'
      ? 'bg-emerald-500'
      : tone === 'amber'
      ? 'bg-amber-500'
      : tone === 'rose'
      ? 'bg-rose-500'
      : 'bg-[#005696]';

  const steps: ProgressStep[] = [
    {
      step: 1,
      label: 'Adviser Assigned',
      sublabel: hasAdviser ? student.adviserName : 'Assigned offline',
      status: hasAdviser ? 'completed' : 'current'
    },
    {
      step: 2,
      label: 'Proposal Submitted',
      sublabel: activeTitle
        ? `Submitted ${activeTitle.submittedAt}`
        : 'Awaiting submission',
      status: isTitleSubmitted
        ? 'completed'
        : hasAdviser
        ? 'current'
        : 'upcoming'
    },
    {
      step: 3,
      label: 'Adviser Endorsement',
      sublabel: isTitleEndorsed
        ? `Endorsed by ${activeTitle?.adviserName || student.adviserName}`
        : isTitleRejected
        ? 'Scope revision requested'
        : isTitleSubmitted
        ? 'Under adviser review'
        : 'Pending proposal',
      status: isTitleEndorsed
        ? 'completed'
        : isTitleRejected
        ? 'warning'
        : isTitleSubmitted
        ? 'current'
        : 'upcoming'
    },
    {
      step: 4,
      label: 'Defense Scheduled',
      sublabel:
        activeSchedule &&
        (activeSchedule.status === 'Scheduled' ||
          activeSchedule.status === 'Rescheduled')
          ? `${activeSchedule.date} · ${activeSchedule.roomName}`
          : hasAnyCompletedDefense
          ? 'Session conducted'
          : isTitleEndorsed
          ? 'Ready for room & panel routing'
          : 'Requires endorsement',
      status:
        activeSchedule &&
        (activeSchedule.status === 'Scheduled' ||
          activeSchedule.status === 'Rescheduled')
          ? 'current'
          : hasAnyCompletedDefense
          ? 'completed'
          : isTitleEndorsed
          ? 'current'
          : 'upcoming'
    },
    {
      step: 5,
      label: 'Defense Completed',
      sublabel: isFinalCompleted
        ? 'Capstone cleared'
        : hasAnyCompletedDefense
        ? `${completedSchedules[0].defenseStage} (${completedSchedules[0].verdictScore ?? 88}/100)`
        : 'Awaiting oral defense',
      status: hasAnyCompletedDefense ? 'completed' : 'upcoming'
    }
  ];

  return {
    percentage,
    widthClass,
    barColorClass,
    stageLabel,
    tone,
    steps
  };
}
