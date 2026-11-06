import {
  User,
  Student,
  Panelist,
  Adviser,
  Room,
  AcademicProgram,
  CapstoneTitle,
  DefenseSchedule,
  AvailabilitySlot,
  AppNotification,
  SystemSettings
} from '../types';

export const DEFAULT_STUDENT_PASSWORD = 'student123';

export const INITIAL_SETTINGS: SystemSettings = {
  campusName: 'STI College Global City',
  academicYear: '2025-2026',
  trimester: '2nd Trimester',
  defenseDurationMinutes: 60,
  allowSubmissions: true,
  institutionAddress: 'University Parkway, Bonifacio Global City, Taguig City, Metro Manila',
  contactEmail: 'capstone.office@globalcity.sti.edu'
};

export const INITIAL_PROGRAMS: AcademicProgram[] = [
  {
    id: 'prog-1',
    code: 'BSIT',
    name: 'Bachelor of Science in Information Technology',
    department: 'College of Information & Communications Technology',
    durationYears: 4,
    activeStudents: 142
  },
  {
    id: 'prog-2',
    code: 'BSCS',
    name: 'Bachelor of Science in Computer Science',
    department: 'College of Information & Communications Technology',
    durationYears: 4,
    activeStudents: 98
  },
  {
    id: 'prog-3',
    code: 'BSCpE',
    name: 'Bachelor of Science in Computer Engineering',
    department: 'College of Engineering',
    durationYears: 4,
    activeStudents: 76
  }
];

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'room-1',
    name: 'Lab 401 - Systems Dev Lab',
    location: '4th Floor, Main Academic Building',
    capacity: 20,
    facilities: ['Dual 75" Smart TV', 'High-Spec Workstations', 'HDMI Hub', 'Fiber LAN', 'Air Conditioned'],
    isAvailable: true
  },
  {
    id: 'room-2',
    name: 'Lab 402 - Networking & IoT Lab',
    location: '4th Floor, Main Academic Building',
    capacity: 18,
    facilities: ['Cisco Rack Equipment', 'Interactive Display', 'Oscilloscopes', 'Air Conditioned'],
    isAvailable: true
  },
  {
    id: 'room-3',
    name: 'AVR Global Hall',
    location: '3rd Floor, West Wing',
    capacity: 50,
    facilities: ['Laser Projector Screen', 'Wireless Mic System', 'Stage Podium', 'Hybrid Zoom Suite'],
    isAvailable: true
  },
  {
    id: 'room-4',
    name: 'Multimedia Room 302',
    location: '3rd Floor, East Wing',
    capacity: 16,
    facilities: ['65" 4K OLED Display', 'Conference Cam', 'Whiteboard Wall', 'Air Conditioned'],
    isAvailable: true
  },
  {
    id: 'room-5',
    name: 'Conference Room 501',
    location: '5th Floor, Executive Hall',
    capacity: 12,
    facilities: ['Roundtable Discussion Setup', 'Polycom Mic', 'Glass Board', 'Air Conditioned'],
    isAvailable: false
  }
];

export const INITIAL_PANELISTS: Panelist[] = [
  {
    id: 'panel-1',
    userId: 'user-panelist-1',
    name: 'Engr. Francis Bautista',
    employeeId: 'STI-GC-FAC-0142',
    email: 'francis.bautista@globalcity.sti.edu',
    department: 'College of Information & Communications Technology',
    specializations: ['Cloud Computing', 'Enterprise Web Architecture', 'Distributed Systems'],
    maxDefenses: 8,
    contactNumber: '+63 917 555 3821',
    isActive: true
  },
  {
    id: 'panel-2',
    userId: 'user-panelist-2',
    name: 'Prof. Kristine Angela Diaz',
    employeeId: 'STI-GC-FAC-0188',
    email: 'kristine.diaz@globalcity.sti.edu',
    department: 'College of Information & Communications Technology',
    specializations: ['Machine Learning', 'Data Science', 'Human-Computer Interaction'],
    maxDefenses: 6,
    contactNumber: '+63 920 443 1928',
    isActive: true
  },
  {
    id: 'panel-3',
    userId: 'user-panelist-3',
    name: 'Engr. Jonathan Ramos',
    employeeId: 'STI-GC-FAC-0205',
    email: 'jonathan.ramos@globalcity.sti.edu',
    department: 'College of Engineering',
    specializations: ['Embedded Systems', 'IoT Hardware', 'Robotics & Automation'],
    maxDefenses: 6,
    contactNumber: '+63 918 887 6231',
    isActive: true
  },
  {
    id: 'panel-4',
    userId: 'user-panelist-4',
    name: 'Dr. Roberto Mendoza',
    employeeId: 'STI-GC-FAC-0094',
    email: 'roberto.mendoza@globalcity.sti.edu',
    department: 'College of Information & Communications Technology',
    specializations: ['Cybersecurity', 'Database Management', 'Software Quality Assurance'],
    maxDefenses: 8,
    contactNumber: '+63 922 711 0495',
    isActive: true
  }
];

export const INITIAL_ADVISERS: Adviser[] = [
  {
    id: 'adv-1',
    userId: 'user-adviser-1',
    name: 'Dr. Maria Santos',
    employeeId: 'STI-GC-ADV-0089',
    email: 'maria.santos@globalcity.sti.edu',
    department: 'College of Information & Communications Technology',
    specializations: ['Information Systems Management', 'Web Systems Development', 'Agile Methodologies'],
    maxAdvisees: 8,
    contactNumber: '+63 917 890 1234',
    isActive: true
  },
  {
    id: 'adv-2',
    userId: 'user-adviser-2',
    name: 'Engr. Rodrigo Cortez',
    employeeId: 'STI-GC-ADV-0112',
    email: 'rodrigo.cortez@globalcity.sti.edu',
    department: 'College of Engineering',
    specializations: ['Hardware Prototyping', 'Firmware Design', 'Sensor Telemetry'],
    maxAdvisees: 6,
    contactNumber: '+63 919 444 8765',
    isActive: true
  },
  {
    id: 'adv-3',
    userId: 'user-adviser-3',
    name: 'Prof. Dennis Villanueva',
    employeeId: 'STI-GC-ADV-0155',
    email: 'dennis.villanueva@globalcity.sti.edu',
    department: 'College of Information & Communications Technology',
    specializations: ['Mobile Application Development', 'Fintech Systems', 'RESTful API Engineering'],
    maxAdvisees: 7,
    contactNumber: '+63 928 333 9911',
    isActive: true
  }
];

export const INITIAL_STUDENTS: Student[] = [
  // BSIT — NAVAJAS GROUP
  {
    id: 'stud-nav-1',
    userId: 'user-student-nav-1',
    name: 'Sophia Mae Alia',
    studentNumber: '02000231011',
    program: 'BSIT',
    section: 'BSIT-401A',
    groupName: 'NAVAJAS GROUP',
    email: 'sophia.alia@globalcity.sti.edu',
    contactNumber: '+63 917 410 1101',
    adviserId: 'adv-1',
    adviserName: 'Dr. Maria Santos',
    password: DEFAULT_STUDENT_PASSWORD,
    isActive: true
  },
  {
    id: 'stud-nav-2',
    userId: 'user-student-nav-2',
    name: 'Cedric Navajas',
    studentNumber: '02000231012',
    program: 'BSIT',
    section: 'BSIT-401A',
    groupName: 'NAVAJAS GROUP',
    email: 'cedric.navajas@globalcity.sti.edu',
    contactNumber: '+63 917 410 1102',
    adviserId: 'adv-1',
    adviserName: 'Dr. Maria Santos',
    password: DEFAULT_STUDENT_PASSWORD,
    isActive: true
  },
  {
    id: 'stud-nav-3',
    userId: 'user-student-nav-3',
    name: 'Ryan Christian Gonzales',
    studentNumber: '02000231013',
    program: 'BSIT',
    section: 'BSIT-401A',
    groupName: 'NAVAJAS GROUP',
    email: 'ryan.gonzales@globalcity.sti.edu',
    contactNumber: '+63 917 410 1103',
    adviserId: 'adv-1',
    adviserName: 'Dr. Maria Santos',
    password: DEFAULT_STUDENT_PASSWORD,
    isActive: true
  },
  {
    id: 'stud-nav-4',
    userId: 'user-student-nav-4',
    name: 'Kyle Vincent Deatras',
    studentNumber: '02000231014',
    program: 'BSIT',
    section: 'BSIT-401A',
    groupName: 'NAVAJAS GROUP',
    email: 'kyle.deatras@globalcity.sti.edu',
    contactNumber: '+63 917 410 1104',
    adviserId: 'adv-1',
    adviserName: 'Dr. Maria Santos',
    password: DEFAULT_STUDENT_PASSWORD,
    isActive: true
  },

  // BSIT — DELA CRUZ GROUP
  {
    id: 'stud-1',
    userId: 'user-student-1',
    name: 'Juan Carlos Dela Cruz',
    studentNumber: '02000214829',
    program: 'BSIT',
    section: 'BSIT-401A',
    groupName: 'DELA CRUZ GROUP',
    email: 'juan.delacruz@globalcity.sti.edu',
    contactNumber: '+63 915 220 9182',
    adviserId: 'adv-1',
    adviserName: 'Dr. Maria Santos',
    currentTitleId: 'title-1',
    password: DEFAULT_STUDENT_PASSWORD,
    isActive: true
  },
  {
    id: 'stud-5',
    userId: 'user-student-5',
    name: 'Joshua Emmanuel Soriano',
    studentNumber: '02000225102',
    program: 'BSIT',
    section: 'BSIT-401A',
    groupName: 'DELA CRUZ GROUP',
    email: 'joshua.soriano@globalcity.sti.edu',
    contactNumber: '+63 920 812 4056',
    adviserId: 'adv-1',
    adviserName: 'Dr. Maria Santos',
    currentTitleId: 'title-5',
    password: DEFAULT_STUDENT_PASSWORD,
    isActive: true
  },
  {
    id: 'stud-dc-3',
    userId: 'user-student-dc-3',
    name: 'Clarisse Joy Villanueva',
    studentNumber: '02000225188',
    program: 'BSIT',
    section: 'BSIT-401A',
    groupName: 'DELA CRUZ GROUP',
    email: 'clarisse.villanueva@globalcity.sti.edu',
    contactNumber: '+63 920 812 4199',
    adviserId: 'adv-1',
    adviserName: 'Dr. Maria Santos',
    password: DEFAULT_STUDENT_PASSWORD,
    isActive: true
  },

  // BSIT — LIM GROUP
  {
    id: 'stud-4',
    userId: 'user-student-4',
    name: 'Patricia Gail Lim',
    studentNumber: '02000223450',
    program: 'BSIT',
    section: 'BSIT-402A',
    groupName: 'LIM GROUP',
    email: 'patricia.lim@globalcity.sti.edu',
    contactNumber: '+63 999 501 3342',
    adviserId: 'adv-3',
    adviserName: 'Prof. Dennis Villanueva',
    currentTitleId: 'title-4',
    password: DEFAULT_STUDENT_PASSWORD,
    isActive: true
  },
  {
    id: 'stud-lim-2',
    userId: 'user-student-lim-2',
    name: 'Paolo Miguel Rivera',
    studentNumber: '02000223491',
    program: 'BSIT',
    section: 'BSIT-402A',
    groupName: 'LIM GROUP',
    email: 'paolo.rivera@globalcity.sti.edu',
    contactNumber: '+63 999 501 3401',
    adviserId: 'adv-3',
    adviserName: 'Prof. Dennis Villanueva',
    password: DEFAULT_STUDENT_PASSWORD,
    isActive: true
  },
  {
    id: 'stud-lim-3',
    userId: 'user-student-lim-3',
    name: 'Bea Katrina Ocampo',
    studentNumber: '02000223510',
    program: 'BSIT',
    section: 'BSIT-402A',
    groupName: 'LIM GROUP',
    email: 'bea.ocampo@globalcity.sti.edu',
    contactNumber: '+63 999 501 3488',
    adviserId: 'adv-3',
    adviserName: 'Prof. Dennis Villanueva',
    password: DEFAULT_STUDENT_PASSWORD,
    isActive: true
  },

  // BSCS — REYES GROUP
  {
    id: 'stud-2',
    userId: 'user-student-2',
    name: 'Angelica Mae Reyes',
    studentNumber: '02000218934',
    program: 'BSCS',
    section: 'BSCS-401A',
    groupName: 'REYES GROUP',
    email: 'angelica.reyes@globalcity.sti.edu',
    contactNumber: '+63 917 331 4455',
    adviserId: 'adv-1',
    adviserName: 'Dr. Maria Santos',
    currentTitleId: 'title-2',
    password: DEFAULT_STUDENT_PASSWORD,
    isActive: true
  },
  {
    id: 'stud-rey-2',
    userId: 'user-student-rey-2',
    name: 'Gabriel Luis Aquino',
    studentNumber: '02000219012',
    program: 'BSCS',
    section: 'BSCS-401A',
    groupName: 'REYES GROUP',
    email: 'gabriel.aquino@globalcity.sti.edu',
    contactNumber: '+63 917 331 4501',
    adviserId: 'adv-1',
    adviserName: 'Dr. Maria Santos',
    password: DEFAULT_STUDENT_PASSWORD,
    isActive: true
  },
  {
    id: 'stud-rey-3',
    userId: 'user-student-rey-3',
    name: 'Bianca Nicole Morales',
    studentNumber: '02000219045',
    program: 'BSCS',
    section: 'BSCS-401A',
    groupName: 'REYES GROUP',
    email: 'bianca.morales@globalcity.sti.edu',
    contactNumber: '+63 917 331 4590',
    adviserId: 'adv-1',
    adviserName: 'Dr. Maria Santos',
    password: DEFAULT_STUDENT_PASSWORD,
    isActive: true
  },

  // BSCS — SALAZAR GROUP
  {
    id: 'stud-sal-1',
    userId: 'user-student-sal-1',
    name: 'Miguel Antonio Salazar',
    studentNumber: '02000227401',
    program: 'BSCS',
    section: 'BSCS-401A',
    groupName: 'SALAZAR GROUP',
    email: 'miguel.salazar@globalcity.sti.edu',
    contactNumber: '+63 928 601 2210',
    adviserId: 'adv-3',
    adviserName: 'Prof. Dennis Villanueva',
    password: DEFAULT_STUDENT_PASSWORD,
    isActive: true
  },
  {
    id: 'stud-sal-2',
    userId: 'user-student-sal-2',
    name: 'Hannah Grace Castillo',
    studentNumber: '02000227418',
    program: 'BSCS',
    section: 'BSCS-401A',
    groupName: 'SALAZAR GROUP',
    email: 'hannah.castillo@globalcity.sti.edu',
    contactNumber: '+63 928 601 2245',
    adviserId: 'adv-3',
    adviserName: 'Prof. Dennis Villanueva',
    password: DEFAULT_STUDENT_PASSWORD,
    isActive: true
  },
  {
    id: 'stud-sal-3',
    userId: 'user-student-sal-3',
    name: 'Dominic Jude Tan',
    studentNumber: '02000227439',
    program: 'BSCS',
    section: 'BSCS-401A',
    groupName: 'SALAZAR GROUP',
    email: 'dominic.tan@globalcity.sti.edu',
    contactNumber: '+63 928 601 2289',
    adviserId: 'adv-3',
    adviserName: 'Prof. Dennis Villanueva',
    password: DEFAULT_STUDENT_PASSWORD,
    isActive: true
  },

  // BSCpE — NAVARRO GROUP
  {
    id: 'stud-3',
    userId: 'user-student-3',
    name: 'Mark Justine Navarro',
    studentNumber: '02000220115',
    program: 'BSCpE',
    section: 'BSCPE-401A',
    groupName: 'NAVARRO GROUP',
    email: 'mark.navarro@globalcity.sti.edu',
    contactNumber: '+63 926 772 1093',
    adviserId: 'adv-2',
    adviserName: 'Engr. Rodrigo Cortez',
    currentTitleId: 'title-3',
    password: DEFAULT_STUDENT_PASSWORD,
    isActive: true
  },
  {
    id: 'stud-navr-2',
    userId: 'user-student-navr-2',
    name: 'Jerome Patrick Pineda',
    studentNumber: '02000220204',
    program: 'BSCpE',
    section: 'BSCPE-401A',
    groupName: 'NAVARRO GROUP',
    email: 'jerome.pineda@globalcity.sti.edu',
    contactNumber: '+63 926 772 1140',
    adviserId: 'adv-2',
    adviserName: 'Engr. Rodrigo Cortez',
    password: DEFAULT_STUDENT_PASSWORD,
    isActive: true
  },
  {
    id: 'stud-navr-3',
    userId: 'user-student-navr-3',
    name: 'Katrina Mae Velasco',
    studentNumber: '02000220267',
    program: 'BSCpE',
    section: 'BSCPE-401A',
    groupName: 'NAVARRO GROUP',
    email: 'katrina.velasco@globalcity.sti.edu',
    contactNumber: '+63 926 772 1198',
    adviserId: 'adv-2',
    adviserName: 'Engr. Rodrigo Cortez',
    password: DEFAULT_STUDENT_PASSWORD,
    isActive: true
  },

  // BSCpE — RAMIREZ GROUP
  {
    id: 'stud-ram-1',
    userId: 'user-student-ram-1',
    name: 'Lorenzo Gabriel Ramirez',
    studentNumber: '02000229110',
    program: 'BSCpE',
    section: 'BSCPE-401A',
    groupName: 'RAMIREZ GROUP',
    email: 'lorenzo.ramirez@globalcity.sti.edu',
    contactNumber: '+63 919 884 3011',
    adviserId: 'adv-2',
    adviserName: 'Engr. Rodrigo Cortez',
    password: DEFAULT_STUDENT_PASSWORD,
    isActive: true
  },
  {
    id: 'stud-ram-2',
    userId: 'user-student-ram-2',
    name: 'Andrei Martin Pascual',
    studentNumber: '02000229144',
    program: 'BSCpE',
    section: 'BSCPE-401A',
    groupName: 'RAMIREZ GROUP',
    email: 'andrei.pascual@globalcity.sti.edu',
    contactNumber: '+63 919 884 3052',
    adviserId: 'adv-2',
    adviserName: 'Engr. Rodrigo Cortez',
    password: DEFAULT_STUDENT_PASSWORD,
    isActive: true
  },
  {
    id: 'stud-ram-3',
    userId: 'user-student-ram-3',
    name: 'Denise Anne Tolentino',
    studentNumber: '02000229182',
    program: 'BSCpE',
    section: 'BSCPE-401A',
    groupName: 'RAMIREZ GROUP',
    email: 'denise.tolentino@globalcity.sti.edu',
    contactNumber: '+63 919 884 3099',
    adviserId: 'adv-2',
    adviserName: 'Engr. Rodrigo Cortez',
    password: DEFAULT_STUDENT_PASSWORD,
    isActive: true
  }
];

export const INITIAL_TITLES: CapstoneTitle[] = [
  {
    id: 'title-1',
    studentId: 'stud-1',
    studentName: 'Juan Carlos Dela Cruz',
    studentNumber: '02000214829',
    program: 'BSIT',
    groupName: 'DELA CRUZ GROUP',
    adviserId: 'adv-1',
    adviserName: 'Dr. Maria Santos',
    title: 'Automated RFID and Face Recognition Attendance with SMS Notification for STI College Global City',
    abstract: 'An integrated hardware-software attendance monitoring solution designed for STI Global City laboratories. It utilizes high-frequency RFID cards paired with computer vision face authentication to eradicate buddy-punching, dispatching automated SMS logs to parents via cellular gateway.',
    problemStatement: 'Manual paper-based log sheets and standard RFID readers at STI Global City laboratory gates suffer from proxy attendance and delayed notification to guardians during early student departures.',
    objectives: [
      'Design dual-layer verification integrating Mifare RFID cards and Haar-Cascade OpenCV face recognition',
      'Deploy GSM module modem for instantaneous SMS alerts to registered guardians',
      'Provide faculty dashboard for real-time laboratory occupancy tracking and exportable CHED compliance reports'
    ],
    techStack: ['Python', 'OpenCV', 'React', 'Node.js', 'PostgreSQL', 'SIM800L GSM Module'],
    status: 'Approved',
    remarks: 'Approved & Endorsed. Scope and methodology are sound. Proceed with Defense 1 oral presentation.',
    submittedAt: '2026-08-15',
    reviewedAt: '2026-08-20',
    reviewedBy: 'Dr. Maria Santos (Adviser)',
    defenseStage: 'Defense 1 (Proposal)',
    version: 1
  },
  {
    id: 'title-2',
    studentId: 'stud-2',
    studentName: 'Angelica Mae Reyes',
    studentNumber: '02000218934',
    program: 'BSCS',
    groupName: 'REYES GROUP',
    adviserId: 'adv-1',
    adviserName: 'Dr. Maria Santos',
    title: 'AI-Powered Career Pathway Advisory and Skill Gap Analyzer for STI Graduates',
    abstract: 'A natural language processing and graph neural network engine that digests STI student transcript data, capstone artifacts, and real-time Philippine job market listings to recommend customized career tracks and prerequisite upskilling micro-courses.',
    problemStatement: 'Graduating seniors frequently face ambiguity mapping their academic electives to current industry demands in Bonifacio Global City tech corridors.',
    objectives: [
      'Parse student curriculum syllabi and build weighted competency vector embeddings',
      'Scrape local tech job boards for emerging stack demands',
      'Generate personalized upskilling roadmaps with 85%+ recommendation relevancy'
    ],
    techStack: ['Python', 'FastAPI', 'PyTorch', 'Next.js', 'PostgreSQL', 'Tailwind CSS'],
    status: 'Approved',
    remarks: 'Approved & Endorsed. Ensure data privacy compliance for student academic records (Republic Act 10173).',
    submittedAt: '2026-08-18',
    reviewedAt: '2026-08-22',
    reviewedBy: 'Dr. Maria Santos (Adviser)',
    defenseStage: 'Final Capstone Defense',
    version: 1
  },
  {
    id: 'title-3',
    studentId: 'stud-3',
    studentName: 'Mark Justine Navarro',
    studentNumber: '02000220115',
    program: 'BSCpE',
    groupName: 'NAVARRO GROUP',
    adviserId: 'adv-2',
    adviserName: 'Engr. Rodrigo Cortez',
    title: 'IoT-Driven Smart Campus Energy Optimization and Monitoring Grid for STI Global City',
    abstract: 'A mesh sensor network measuring ambient temperature, occupancy via PIR, and circuit power draw across classroom air conditioning units. Includes automated relay cutoff during zero occupancy and predictive peak-load shedding.',
    problemStatement: 'Classroom AC units and lighting frequently remain active during class hiatuses, leading to unnecessary electrical expenditure and carbon footprint.',
    objectives: [
      'Fabricate ESP32 LoRa nodes with non-invasive split-core current sensors',
      'Implement BACnet protocol bridge to facility central cooling panels',
      'Demonstrate at least 18% energy conservation in 4th-floor test labs'
    ],
    techStack: ['ESP32', 'FreeRTOS', 'MQTT', 'InfluxDB', 'Grafana', 'React'],
    status: 'Approved',
    remarks: 'Approved & Endorsed. Coordinate with Facilities Management regarding main electrical riser tie-in.',
    submittedAt: '2026-08-12',
    reviewedAt: '2026-08-17',
    reviewedBy: 'Engr. Rodrigo Cortez (Adviser)',
    defenseStage: 'Final Capstone Defense',
    version: 1
  },
  {
    id: 'title-nav-1',
    studentId: 'stud-nav-2',
    studentName: 'Cedric Navajas',
    studentNumber: '02000231012',
    program: 'BSIT',
    groupName: 'NAVAJAS GROUP',
    adviserId: 'adv-1',
    adviserName: 'Dr. Maria Santos',
    title: 'Web-Based Capstone Defense Scheduling and Title Repository Management System for STI College Global City',
    abstract: 'A centralized academic workflow platform automating capstone title endorsements, conflict-free oral defense scheduling, room occupancy monitoring, and blind panelist workload distribution.',
    problemStatement: 'Manual spreadsheet tracking of capstone schedules leads to room double-bookings and delayed title clearance visibility.',
    objectives: [
      'Provide conflict-free scheduling for defense rooms and faculty panelists',
      'Streamline coordinator-managed defense scheduling and room allocation',
      'Maintain a searchable institutional repository of approved and rejected titles'
    ],
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js'],
    status: 'Approved',
    remarks: 'Approved & Endorsed. Cleared for coordinator defense scheduling.',
    submittedAt: '2026-09-10',
    reviewedAt: '2026-09-14',
    reviewedBy: 'Dr. Maria Santos (Adviser)',
    defenseStage: 'Defense 1 (Proposal)',
    version: 1
  },
  {
    id: 'title-sal-1',
    studentId: 'stud-sal-1',
    studentName: 'Miguel Antonio Salazar',
    studentNumber: '02000227401',
    program: 'BSCS',
    groupName: 'SALAZAR GROUP',
    adviserId: 'adv-3',
    adviserName: 'Prof. Dennis Villanueva',
    title: 'Real-Time Commuter Crowd Density Estimation at BGC Bus Stops Using Edge Computer Vision',
    abstract: 'An edge-deployed computer vision analytics platform quantifying passenger queue lengths and estimated waiting times across BGC bus terminals.',
    problemStatement: 'Commuters experience unpredictable queue surges during peak hours along McKinley Parkway and 32nd Street.',
    objectives: [
      'Train lightweight object detection model for crowd counting under varied lighting',
      'Publish live commuter wait-time telemetry dashboard'
    ],
    techStack: ['Python', 'OpenCV', 'TensorFlow Lite', 'React'],
    status: 'Approved',
    remarks: 'Approved & Endorsed. Scheduled for Proposal Defense; flagged for re-defense on dataset validation.',
    submittedAt: '2026-09-02',
    reviewedAt: '2026-09-06',
    reviewedBy: 'Prof. Dennis Villanueva (Adviser)',
    defenseStage: 'Defense 1 (Proposal)',
    version: 1
  },
  {
    id: 'title-ram-1',
    studentId: 'stud-ram-1',
    studentName: 'Lorenzo Gabriel Ramirez',
    studentNumber: '02000229110',
    program: 'BSCpE',
    groupName: 'RAMIREZ GROUP',
    adviserId: 'adv-2',
    adviserName: 'Engr. Rodrigo Cortez',
    title: 'Solar-Powered Automated Hydroponic Nutrient Dosing and pH Control Rig for Urban Micro-Farms',
    abstract: 'A closed-loop microcontroller dosing rig regulating EC and pH balance in vertical NFT hydroponic channels powered by a solar battery array.',
    problemStatement: 'Urban hydroponic growers manually test nutrient reservoirs daily, causing pH drift and crop stunting.',
    objectives: [
      'Automate peristaltic pump dosing using industrial pH and TDS probes',
      'Monitor reservoir health via low-power wireless telemetry'
    ],
    techStack: ['ESP32', 'C++', 'MQTT', 'React'],
    status: 'Approved',
    remarks: 'Approved & Endorsed. Defense schedule will be assigned by the Capstone Coordinator.',
    submittedAt: '2026-09-25',
    reviewedAt: '2026-09-27',
    reviewedBy: 'Engr. Rodrigo Cortez (Adviser)',
    defenseStage: 'Defense 1 (Proposal)',
    version: 1
  },
  {
    id: 'title-4',
    studentId: 'stud-4',
    studentName: 'Patricia Gail Lim',
    studentNumber: '02000223450',
    program: 'BSIT',
    groupName: 'LIM GROUP',
    adviserId: 'adv-3',
    adviserName: 'Prof. Dennis Villanueva',
    title: 'Barangay Health Center Record and Pediatric Immunization Tracking Mobile System with Geo-Mapping',
    abstract: 'A mobile-first cloud EHR for local Taguig City barangay health centers. Provides offline-first digital immunization cards, SMS immunization appointment reminders, and dengue cluster geospatial heatmaps.',
    problemStatement: 'Barangay Fort Bonifacio health centers currently track childhood vaccine schedules on physical index cards which are frequently soiled or misplaced.',
    objectives: [
      'Develop offline-first progressive mobile app for field community health workers',
      'Implement automated SMS scheduling based on DOH national vaccine roadmap',
      'Provide GIS map pinpointing immunization coverage gaps'
    ],
    techStack: ['React Native', 'Supabase', 'Node.js', 'Leaflet GIS', 'Semaphore SMS API'],
    status: 'Pending',
    remarks: 'Submitted endorsed title awaiting final review.',
    submittedAt: '2026-09-20',
    defenseStage: 'Title Proposal',
    version: 1
  },
  {
    id: 'title-5',
    studentId: 'stud-5',
    studentName: 'Joshua Emmanuel Soriano',
    studentNumber: '02000225102',
    program: 'BSIT',
    groupName: 'DELA CRUZ GROUP',
    adviserId: 'adv-1',
    adviserName: 'Dr. Maria Santos',
    title: 'Blockchain-Based STI Academic Credential Verification and Transcript Tamper-Proof Vault',
    abstract: 'A decentralized verifiable credential framework enabling instant employer verification of STI diplomas and certificates using cryptographic digital signatures.',
    problemStatement: 'HR departments spend up to two weeks verifying physical diploma authenticity via registrars.',
    objectives: [
      'Issue ERC-721 compatible academic soulbound tokens for STI diplomas',
      'Develop instant QR-code mobile verifier for recruiters'
    ],
    techStack: ['Solidity', 'Polygon', 'Ethers.js', 'React', 'IPFS'],
    status: 'Pending',
    remarks: 'Awaiting adviser endorsement before formal panel review.',
    submittedAt: '2026-09-24',
    defenseStage: 'Title Proposal',
    version: 1
  },
  {
    id: 'title-hist-1',
    studentId: 'stud-1',
    studentName: 'Juan Carlos Dela Cruz',
    studentNumber: '02000214829',
    program: 'BSIT',
    groupName: 'DELA CRUZ GROUP',
    adviserId: 'adv-1',
    adviserName: 'Dr. Maria Santos',
    title: 'Autonomous Drone-Assisted Campus Security Patrol and Intrusion Detection Framework',
    abstract: 'Proposal to deploy quadcopter drones equipped with thermal cameras patrolling the perimeter of the STI Global City BGC campus after midnight.',
    problemStatement: 'Perimeter monitoring relies on static CCTV blind spots around building alleyways.',
    objectives: ['Deploy DJI drone with AI object recognition', 'Patrol BGC campus perimeter'],
    techStack: ['DJI SDK', 'YOLOv8', 'Python'],
    status: 'Rejected',
    remarks: 'Rejected by Committee. Outdoor commercial drone flight in Bonifacio Global City violates local BGC estate management regulations and exceeds IT undergraduate capstone budget safety guidelines.',
    submittedAt: '2026-07-05',
    reviewedAt: '2026-07-12',
    reviewedBy: 'Prof. Arnold V. Mercado (Capstone Admin)',
    defenseStage: 'Title Proposal',
    version: 1
  }
];

export const INITIAL_SCHEDULES: DefenseSchedule[] = [
  {
    id: 'def-1',
    studentId: 'stud-1',
    studentName: 'Juan Carlos Dela Cruz',
    studentNumber: '02000214829',
    program: 'BSIT',
    adviserId: 'adv-1',
    adviserName: 'Dr. Maria Santos',
    capstoneTitleId: 'title-1',
    capstoneTitle: 'Automated RFID and Face Recognition Attendance with SMS Notification for STI College Global City',
    defenseStage: 'Defense 1 (Proposal)',
    date: '2026-10-06',
    startTime: '09:00',
    endTime: '10:30',
    roomId: 'room-1',
    roomName: 'Lab 401 - Systems Dev Lab',
    panelists: [
      { panelistId: 'panel-1', name: 'Engr. Francis Bautista', role: 'Panel Chair' },
      { panelistId: 'panel-2', name: 'Prof. Kristine Angela Diaz', role: 'Member Panelist' },
      { panelistId: 'panel-4', name: 'Dr. Roberto Mendoza', role: 'Member Panelist' }
    ],
    status: 'Scheduled',
    remarks: 'Bring 4 bound copies of Chapter 1-3 manuscript, hardware breadboard prototype, and presentation slide deck on USB.',
    requirementsCompleted: true
  },
  {
    id: 'def-2',
    studentId: 'stud-2',
    studentName: 'Angelica Mae Reyes',
    studentNumber: '02000218934',
    program: 'BSCS',
    adviserId: 'adv-1',
    adviserName: 'Dr. Maria Santos',
    capstoneTitleId: 'title-2',
    capstoneTitle: 'AI-Powered Career Pathway Advisory and Skill Gap Analyzer for STI Graduates',
    defenseStage: 'Final Capstone Defense',
    date: '2026-10-06',
    startTime: '10:30',
    endTime: '12:00',
    roomId: 'room-3',
    roomName: 'AVR Global Hall',
    panelists: [
      { panelistId: 'panel-2', name: 'Prof. Kristine Angela Diaz', role: 'Panel Chair' },
      { panelistId: 'panel-1', name: 'Engr. Francis Bautista', role: 'Member Panelist' },
      { panelistId: 'panel-4', name: 'Dr. Roberto Mendoza', role: 'Member Panelist' }
    ],
    status: 'Scheduled',
    remarks: 'Live demonstration of model inference on cloud test dataset required. Prepare user evaluation test sheets.',
    requirementsCompleted: true
  },
  {
    id: 'def-3',
    studentId: 'stud-3',
    studentName: 'Mark Justine Navarro',
    studentNumber: '02000220115',
    program: 'BSCpE',
    adviserId: 'adv-2',
    adviserName: 'Engr. Rodrigo Cortez',
    capstoneTitleId: 'title-3',
    capstoneTitle: 'IoT-Driven Smart Campus Energy Optimization and Monitoring Grid for STI Global City',
    defenseStage: 'Final Capstone Defense',
    date: '2026-10-07',
    startTime: '13:30',
    endTime: '15:00',
    roomId: 'room-2',
    roomName: 'Lab 402 - Networking & IoT Lab',
    panelists: [
      { panelistId: 'panel-3', name: 'Engr. Jonathan Ramos', role: 'Panel Chair' },
      { panelistId: 'panel-1', name: 'Engr. Francis Bautista', role: 'Member Panelist' },
      { panelistId: 'panel-4', name: 'Dr. Roberto Mendoza', role: 'Member Panelist' }
    ],
    status: 'Scheduled',
    remarks: 'Live hardware sensor bench test with live power load measurement required.',
    requirementsCompleted: true
  },
  {
    id: 'def-4',
    studentId: 'stud-4',
    studentName: 'Patricia Gail Lim',
    studentNumber: '02000223450',
    program: 'BSIT',
    adviserId: 'adv-3',
    adviserName: 'Prof. Dennis Villanueva',
    capstoneTitleId: 'title-4',
    capstoneTitle: 'Barangay Health Center Record and Pediatric Immunization Tracking Mobile System with Geo-Mapping',
    defenseStage: 'Title Proposal',
    date: '2026-10-08',
    startTime: '14:00',
    endTime: '15:00',
    roomId: 'room-4',
    roomName: 'Multimedia Room 302',
    panelists: [
      { panelistId: 'panel-1', name: 'Engr. Francis Bautista', role: 'Panel Chair' },
      { panelistId: 'panel-2', name: 'Prof. Kristine Angela Diaz', role: 'Member Panelist' },
      { panelistId: 'panel-4', name: 'Dr. Roberto Mendoza', role: 'Member Panelist' }
    ],
    status: 'Scheduled',
    remarks: 'Preliminary Title Hearing. 15 minutes presentation, 30 minutes Q&A.',
    requirementsCompleted: true
  },
  {
    id: 'def-5',
    studentId: 'stud-5',
    studentName: 'Joshua Emmanuel Soriano',
    studentNumber: '02000225102',
    program: 'BSIT',
    adviserId: 'adv-1',
    adviserName: 'Dr. Maria Santos',
    capstoneTitleId: 'title-5',
    capstoneTitle: 'Blockchain-Based STI Academic Credential Verification and Transcript Tamper-Proof Vault',
    defenseStage: 'Defense 1 (Proposal)',
    date: '2026-10-06',
    startTime: '14:00',
    endTime: '15:30',
    roomId: 'room-1',
    roomName: 'Lab 401 - Systems Dev Lab',
    panelists: [
      { panelistId: 'panel-1', name: 'Engr. Francis Bautista', role: 'Panel Chair' },
      { panelistId: 'panel-4', name: 'Dr. Roberto Mendoza', role: 'Member Panelist' },
      { panelistId: 'panel-3', name: 'Engr. Jonathan Ramos', role: 'Member Panelist' }
    ],
    status: 'Scheduled',
    remarks: 'Demonstrate smart contract testnet deployment and gas cost efficiency metrics.',
    requirementsCompleted: true
  },
  {
    id: 'def-6',
    studentId: 'stud-2',
    studentName: 'Angelica Mae Reyes',
    studentNumber: '02000218934',
    program: 'BSCS',
    adviserId: 'adv-1',
    adviserName: 'Dr. Maria Santos',
    capstoneTitleId: 'title-2',
    capstoneTitle: 'AI-Powered Career Pathway Advisory and Skill Gap Analyzer for STI Graduates',
    defenseStage: 'Defense 2 (Mid-Defense)',
    date: '2026-10-08',
    startTime: '09:00',
    endTime: '10:30',
    roomId: 'room-2',
    roomName: 'Lab 402 - Networking & IoT Lab',
    panelists: [
      { panelistId: 'panel-2', name: 'Prof. Kristine Angela Diaz', role: 'Panel Chair' },
      { panelistId: 'panel-1', name: 'Engr. Francis Bautista', role: 'Member Panelist' },
      { panelistId: 'panel-4', name: 'Dr. Roberto Mendoza', role: 'Member Panelist' }
    ],
    status: 'Scheduled',
    remarks: 'Model convergence metrics and accuracy benchmarks review.',
    requirementsCompleted: true
  },
  {
    id: 'def-7',
    studentId: 'stud-3',
    studentName: 'Mark Justine Navarro',
    studentNumber: '02000220115',
    program: 'BSCpE',
    adviserId: 'adv-2',
    adviserName: 'Engr. Rodrigo Cortez',
    capstoneTitleId: 'title-3',
    capstoneTitle: 'IoT-Driven Smart Campus Energy Optimization and Monitoring Grid for STI Global City',
    defenseStage: 'Defense 1 (Proposal)',
    date: '2026-10-09',
    startTime: '10:00',
    endTime: '11:30',
    roomId: 'room-3',
    roomName: 'AVR Global Hall',
    panelists: [
      { panelistId: 'panel-3', name: 'Engr. Jonathan Ramos', role: 'Panel Chair' },
      { panelistId: 'panel-4', name: 'Dr. Roberto Mendoza', role: 'Member Panelist' },
      { panelistId: 'panel-1', name: 'Engr. Francis Bautista', role: 'Member Panelist' }
    ],
    status: 'Scheduled',
    remarks: 'Bring prototype schematic diagrams and breadboard sensors.',
    requirementsCompleted: true
  },
  {
    id: 'def-8',
    studentId: 'stud-4',
    studentName: 'Patricia Gail Lim',
    studentNumber: '02000223450',
    program: 'BSIT',
    adviserId: 'adv-3',
    adviserName: 'Prof. Dennis Villanueva',
    capstoneTitleId: 'title-4',
    capstoneTitle: 'Barangay Health Center Record and Pediatric Immunization Tracking Mobile System with Geo-Mapping',
    defenseStage: 'Defense 1 (Proposal)',
    date: '2026-10-14',
    startTime: '13:30',
    endTime: '15:00',
    roomId: 'room-4',
    roomName: 'Multimedia Room 302',
    panelists: [
      { panelistId: 'panel-1', name: 'Engr. Francis Bautista', role: 'Panel Chair' },
      { panelistId: 'panel-2', name: 'Prof. Kristine Angela Diaz', role: 'Member Panelist' },
      { panelistId: 'panel-4', name: 'Dr. Roberto Mendoza', role: 'Member Panelist' }
    ],
    status: 'Scheduled',
    remarks: 'Barangay endorsement and security assessment documentation required.',
    requirementsCompleted: true
  },
  {
    id: 'def-9',
    studentId: 'stud-1',
    studentName: 'Juan Carlos Dela Cruz',
    studentNumber: '02000214829',
    program: 'BSIT',
    adviserId: 'adv-1',
    adviserName: 'Dr. Maria Santos',
    capstoneTitleId: 'title-1',
    capstoneTitle: 'Automated RFID and Face Recognition Attendance with SMS Notification for STI College Global City',
    defenseStage: 'Final Capstone Defense',
    date: '2026-10-20',
    startTime: '09:00',
    endTime: '11:00',
    roomId: 'room-5',
    roomName: 'Conference Room 501',
    panelists: [
      { panelistId: 'panel-1', name: 'Engr. Francis Bautista', role: 'Panel Chair' },
      { panelistId: 'panel-2', name: 'Prof. Kristine Angela Diaz', role: 'Member Panelist' },
      { panelistId: 'panel-4', name: 'Dr. Roberto Mendoza', role: 'Member Panelist' }
    ],
    status: 'Scheduled',
    remarks: 'Final defense presentation. All chapters finalized with plagiarism clearance report.',
    requirementsCompleted: true
  },
  // Completed defense in history
  {
    id: 'def-hist-1',
    studentId: 'stud-1',
    studentName: 'Juan Carlos Dela Cruz',
    studentNumber: '02000214829',
    program: 'BSIT',
    groupName: 'DELA CRUZ GROUP',
    adviserId: 'adv-1',
    adviserName: 'Dr. Maria Santos',
    capstoneTitleId: 'title-1',
    capstoneTitle: 'Automated RFID and Face Recognition Attendance with SMS Notification for STI College Global City',
    defenseStage: 'Title Proposal',
    date: '2026-08-25',
    startTime: '10:00',
    endTime: '11:00',
    roomId: 'room-4',
    roomName: 'Multimedia Room 302',
    panelists: [
      { panelistId: 'panel-1', name: 'Engr. Francis Bautista', role: 'Panel Chair' },
      { panelistId: 'panel-2', name: 'Prof. Kristine Angela Diaz', role: 'Member Panelist' },
      { panelistId: 'panel-4', name: 'Dr. Roberto Mendoza', role: 'Member Panelist' }
    ],
    status: 'Completed',
    remarks: 'Title proposal successfully approved with grade 1.25. Recommendation to use Haar-Cascade face detection for edge hardware.',
    verdictScore: 92,
    requirementsCompleted: true
  },
  // For Re-Defense group session
  {
    id: 'def-redef-1',
    studentId: 'stud-sal-1',
    studentName: 'Miguel Antonio Salazar',
    studentNumber: '02000227401',
    program: 'BSCS',
    groupName: 'SALAZAR GROUP',
    adviserId: 'adv-3',
    adviserName: 'Prof. Dennis Villanueva',
    capstoneTitleId: 'title-sal-1',
    capstoneTitle: 'Real-Time Commuter Crowd Density Estimation at BGC Bus Stops Using Edge Computer Vision',
    defenseStage: 'Defense 1 (Proposal)',
    date: '2026-10-03',
    startTime: '13:30',
    endTime: '15:00',
    roomId: 'room-2',
    roomName: 'Lab 402 - Networking & IoT Lab',
    panelists: [
      { panelistId: 'panel-1', name: 'Engr. Francis Bautista', role: 'Panel Chair' },
      { panelistId: 'panel-2', name: 'Prof. Kristine Angela Diaz', role: 'Member Panelist' },
      { panelistId: 'panel-3', name: 'Engr. Jonathan Ramos', role: 'Member Panelist' }
    ],
    status: 'For Re-Defense',
    remarks: 'For Re-Defense: Revise camera calibration methodology and benchmark dataset accuracy before re-presenting to panel.',
    verdictScore: 72,
    requirementsCompleted: true
  },
  // Cancelled defense in history
  {
    id: 'def-canc-1',
    studentId: 'stud-2',
    studentName: 'Angelica Mae Reyes',
    studentNumber: '02000218934',
    program: 'BSCS',
    groupName: 'REYES GROUP',
    adviserId: 'adv-1',
    adviserName: 'Dr. Maria Santos',
    capstoneTitleId: 'title-2',
    capstoneTitle: 'AI-Powered Career Pathway Advisory and Skill Gap Analyzer for STI Graduates',
    defenseStage: 'Title Proposal',
    date: '2026-09-18',
    startTime: '15:00',
    endTime: '16:00',
    roomId: 'room-3',
    roomName: 'AVR Global Hall',
    panelists: [
      { panelistId: 'panel-2', name: 'Prof. Kristine Angela Diaz', role: 'Panel Chair' },
      { panelistId: 'panel-1', name: 'Engr. Francis Bautista', role: 'Member Panelist' },
      { panelistId: 'panel-4', name: 'Dr. Roberto Mendoza', role: 'Member Panelist' }
    ],
    status: 'Cancelled',
    remarks: 'Cancelled due to campus-wide power maintenance advisory; moved to October defense window.',
    requirementsCompleted: true
  }
];

export const INITIAL_AVAILABILITY: AvailabilitySlot[] = [
  // Engr. Francis Bautista
  { id: 'av-1', panelistId: 'panel-1', dayOfWeek: 'Monday', startTime: '09:00', endTime: '12:00', isAvailable: true, notes: 'Morning block preferred' },
  { id: 'av-2', panelistId: 'panel-1', dayOfWeek: 'Monday', startTime: '13:00', endTime: '17:00', isAvailable: false, notes: 'Faculty CICT department meeting' },
  { id: 'av-3', panelistId: 'panel-1', dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '12:00', isAvailable: true },
  { id: 'av-4', panelistId: 'panel-1', dayOfWeek: 'Tuesday', startTime: '13:00', endTime: '17:00', isAvailable: true },
  { id: 'av-5', panelistId: 'panel-1', dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '12:00', isAvailable: true },
  { id: 'av-6', panelistId: 'panel-1', dayOfWeek: 'Wednesday', startTime: '13:00', endTime: '17:00', isAvailable: true },
  { id: 'av-7', panelistId: 'panel-1', dayOfWeek: 'Thursday', startTime: '09:00', endTime: '12:00', isAvailable: true },
  { id: 'av-8', panelistId: 'panel-1', dayOfWeek: 'Thursday', startTime: '13:00', endTime: '17:00', isAvailable: true },
  { id: 'av-9', panelistId: 'panel-1', dayOfWeek: 'Friday', startTime: '09:00', endTime: '12:00', isAvailable: true },
  { id: 'av-10', panelistId: 'panel-1', dayOfWeek: 'Saturday', startTime: '09:00', endTime: '14:00', isAvailable: false, notes: 'Graduate school classes' },

  // Prof. Kristine Angela Diaz
  { id: 'av-11', panelistId: 'panel-2', dayOfWeek: 'Monday', startTime: '09:00', endTime: '12:00', isAvailable: true },
  { id: 'av-12', panelistId: 'panel-2', dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '12:00', isAvailable: true },
  { id: 'av-13', panelistId: 'panel-2', dayOfWeek: 'Tuesday', startTime: '13:00', endTime: '17:00', isAvailable: true },
  { id: 'av-14', panelistId: 'panel-2', dayOfWeek: 'Wednesday', startTime: '13:00', endTime: '17:00', isAvailable: true },
  { id: 'av-15', panelistId: 'panel-2', dayOfWeek: 'Thursday', startTime: '09:00', endTime: '12:00', isAvailable: true },
  { id: 'av-16', panelistId: 'panel-2', dayOfWeek: 'Friday', startTime: '13:00', endTime: '17:00', isAvailable: true }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    userId: 'all',
    title: '2nd Trimester Capstone Defense Period Announced',
    message: 'Oral Proposal and Final Defenses for 2nd Trimester A.Y. 2025-2026 are scheduled between October 5 and October 18, 2026. Please check your assigned schedules.',
    date: '2026-09-28',
    time: '8:30 AM',
    isRead: false,
    type: 'announcement',
    linkTab: 'Defense Schedule'
  },
  {
    id: 'notif-2',
    userId: 'user-student-1',
    title: 'Defense Schedule Confirmed: Defense 1 (Proposal)',
    message: 'Your defense has been scheduled for October 6, 2026 at 9:00 AM – 10:30 AM in Lab 401.',
    date: '2026-09-28',
    time: '9:15 AM',
    isRead: false,
    type: 'defense',
    linkTab: 'Defense Schedule'
  },
  {
    id: 'notif-3',
    userId: 'user-panelist-1',
    title: 'New Panel Defense Assignment Assigned',
    message: 'You have been designated as Panel Chair for DELA CRUZ GROUP (BSIT-401A) on Oct 6, 2026 at 9:00 AM – 10:30 AM.',
    date: '2026-09-28',
    time: '9:20 AM',
    isRead: false,
    type: 'defense',
    linkTab: 'Defense Schedule'
  },
  {
    id: 'notif-4',
    userId: 'user-adviser-1',
    title: 'Advisee Defense Notice: DELA CRUZ GROUP',
    message: 'Your handled group DELA CRUZ GROUP has an upcoming Proposal Defense on Oct 6, 2026 (9:00 AM – 10:30 AM) in Lab 401.',
    date: '2026-09-28',
    time: '9:25 AM',
    isRead: false,
    type: 'defense',
    linkTab: 'Handled Groups'
  },
  {
    id: 'notif-5',
    userId: 'user-student-1',
    title: 'Capstone Title Approved by Committee',
    message: 'Your title "Automated RFID and Face Recognition Attendance with SMS Notification" has been approved.',
    date: '2026-08-20',
    time: '3:45 PM',
    isRead: true,
    type: 'title',
    linkTab: 'Capstone Titles'
  },
  {
    id: 'notif-7',
    userId: 'user-student-1',
    title: 'Adviser Endorsement Notice',
    message: 'Dr. Maria Santos endorsed your Team Proposal for official scheduling. Manuscript Chapters 1-3 approved.',
    date: '2026-09-30',
    time: '4:30 PM',
    isRead: false,
    type: 'title',
    linkTab: 'Defense Schedule'
  },
  {
    id: 'notif-8',
    userId: 'all',
    title: 'Defense Attire & Manuscript Guidelines',
    message: 'All capstone presenters must wear corporate business attire. Submit 4 spiral-bound copies to Lab 401 coordinator 15 minutes before defense.',
    date: '2026-09-29',
    time: '11:00 AM',
    isRead: true,
    type: 'announcement',
    linkTab: 'Defense Schedule'
  },
  {
    id: 'notif-6',
    userId: 'admin',
    title: 'Panel Availability Updated',
    message: 'Engr. Francis Bautista updated their weekly defense availability slots for October.',
    date: '2026-09-27',
    time: '4:12 PM',
    isRead: true,
    type: 'defense',
    linkTab: 'Panelists'
  }
];

export const USERS_SEED: User[] = [
  {
    id: 'user-student-1',
    name: 'Juan Carlos Dela Cruz',
    email: 'juan.delacruz@globalcity.sti.edu',
    role: 'student',
    studentNumber: '02000214829',
    program: 'BSIT',
    department: 'College of Information & Communications Technology',
    contactNumber: '+63 915 220 9182',
    password: DEFAULT_STUDENT_PASSWORD,
    isActive: true
  },
  {
    id: 'user-panelist-1',
    name: 'Engr. Francis Bautista',
    email: 'francis.bautista@globalcity.sti.edu',
    role: 'panelist',
    employeeId: 'STI-GC-FAC-0142',
    department: 'College of Information & Communications Technology',
    contactNumber: '+63 917 555 3821',
    isActive: true
  },
  {
    id: 'user-adviser-1',
    name: 'Dr. Maria Santos',
    email: 'maria.santos@globalcity.sti.edu',
    role: 'adviser',
    employeeId: 'STI-GC-ADV-0089',
    department: 'College of Information & Communications Technology',
    contactNumber: '+63 917 890 1234',
    isActive: true
  },
  {
    id: 'user-admin-1',
    name: 'Prof. Arnold V. Mercado',
    email: 'arnold.mercado@globalcity.sti.edu',
    role: 'admin',
    employeeId: 'STI-GC-ADM-0010',
    department: 'Academic Affairs & Capstone Directorate',
    contactNumber: '+63 917 100 2000',
    isActive: true
  }
];
