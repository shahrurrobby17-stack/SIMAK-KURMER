import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, doc, onSnapshot, db } from './lib/firestore';
import { 
  seedInitialDataIfEmpty, 
  saveTeacherProfileToFirebase, 
  saveTeacherProfilesToFirebase,
  saveClassListsToFirebase, 
  saveStudentToFirebase, 
  deleteStudentFromFirebase, 
  saveStudentsBatchToFirebase, 
  saveGradeToFirebase, 
  saveGradesBatchToFirebase,
  saveAttendanceRecordToFirebase, 
  saveAttendanceRecordsBatchToFirebase, 
  deleteAttendanceRecordsBatchFromFirebase,
  saveTeachingLogToFirebase, 
  deleteTeachingLogFromFirebase,
  saveStudentTaskToFirebase,
  deleteStudentTaskFromFirebase,
  saveSubjectsToFirebase,
  saveRegisteredUsersToFirebase,
  subscribeToRegisteredUsers,
  subscribeToTeacherProfiles,
  subscribeToSchedules,
  saveInfoAnnouncementToFirebase,
  subscribeToInfoAnnouncement,
  subscribeToDataLockConfig,
  saveLoginBackgroundConfigToFirebase,
  subscribeToLoginBackgroundConfig
} from './lib/firebaseService';
import { 
  Student, 
  Subject, 
  StudentGrade, 
  AttendanceRecord, 
  TeachingLog, 
  TeacherProfile,
  AttendanceStatus,
  SchoolAnnouncement,
  StudentTask,
  UserAccount,
  InfoAnnouncement,
  DataLockConfig,
  LoginBackgroundConfig,
  defaultLoginBackgroundConfig
} from './types';
import { 
  initialTeacherProfile, 
  initialTeacherProfiles,
  initialSubjects, 
  initialStudents, 
  allDefaultStudents,
  initialGrades, 
  initialAttendanceRecords, 
  initialAnnouncements,
  initialTeachingLogs,
  initialStudentTasks
} from './data/initialData';

import { Navbar } from './components/Navbar';
import { SidebarNavigation, NavTab } from './components/SidebarNavigation';
import { DashboardAnalytics } from './components/DashboardAnalytics';
import { RealtimeAttendance } from './components/RealtimeAttendance';
import { GradeManagement } from './components/GradeManagement';
import { ExtraAssignmentGradesView } from './components/ExtraAssignmentGradesView';
import { StudentRoster } from './components/StudentRoster';
import { ReportCardModal } from './components/ReportCardModal';
import { TeachingJournal } from './components/TeachingJournal';
import { TeacherModuleUploadView } from './components/TeacherModuleUploadView';
import { AIAssistantModal } from './components/AIAssistantModal';
import { StudentSyncView } from './components/StudentSyncView';
import { MasterDataView } from './components/MasterDataView';
import { CurriculumSystemView } from './components/systems/CurriculumSystemView';
import { TeacherSystemView } from './components/systems/TeacherSystemView';
import { AdministrationSystemView } from './components/systems/AdministrationSystemView';
import { SarprasSystemView } from './components/systems/SarprasSystemView';
import { FinanceSystemView } from './components/systems/FinanceSystemView';
import { StudentSystemView } from './components/systems/StudentSystemView';
import { LibrarySystemView } from './components/systems/LibrarySystemView';
import { ValidationSystemView } from './components/systems/ValidationSystemView';
import { StudentLMSView } from './components/StudentLMSView';
import { TeachingScheduleView } from './components/TeachingScheduleView';
import { ExtracurricularAttendanceView } from './components/ExtracurricularAttendanceView';
import { ResiduDataView } from './components/ResiduDataView';
import { GeminiAssistantView } from './components/GeminiAssistantView';
import { SettingsView } from './components/SettingsView';
import { MaintenanceManagerView } from './components/MaintenanceManagerView';
import { MaintenanceScreen } from './components/MaintenanceScreen';
import { LoginView } from './components/LoginView';
import { ProfilePromptModal } from './components/ProfilePromptModal';
import { LogoutConfirmModal } from './components/LogoutConfirmModal';
import { FooterHelpModals, HelpModalType } from './components/FooterHelpModals';
import { RestrictedAccessModal } from './components/RestrictedAccessModal';
import { InfoBannerCard } from './components/InfoBannerCard';
import { MenuErrorDiagnosticBanner } from './components/MenuErrorDiagnosticBanner';
import { computeMenuHealthMap } from './lib/menuHealthService';
import { syncToGoogleSheets } from './lib/googleSheetsService';
import { Lock } from 'lucide-react';

export default function App() {
  // Load initial states with localStorage & Firebase fallback
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = null;
    if (saved) {
      let parsed: UserAccount = JSON.parse(saved);
      const demoEmails = ['bambang.susanto@simakmerdeka.ai.studio', 'siti.rahmah@simakmerdeka.ai.studio', 'ahmad.hidayat@simakmerdeka.ai.studio'];
      if (!demoEmails.includes(parsed.email.toLowerCase())) {
        const isRealMaster = 
          parsed.email?.toLowerCase() === 'shahrurrobby17@gmail.com' || 
          parsed.uid === 'USER-ADMIN' || 
          parsed.name?.toLowerCase().includes('shahrur');

        if (!isRealMaster && (parsed.role?.toLowerCase().includes('admin') || parsed.role?.toLowerCase().includes('master'))) {
          parsed.role = 'Guru Pengampu';
        }
        return parsed;
      }
      
    }
    return null;
  });

  const [teacher, setTeacher] = useState<TeacherProfile>(() => {
    const savedTeacher = null;
    const savedUser = null;
    const demoIds = ['PROF-001', 'PROF-002', 'PROF-003'];
    const demoNames = ['drs. h. bambang susanto, m.pd.', 'siti rahmah, s.pd., m.si.', 'ahmad hidayat, s.kom., m.t.', 'ahmad hidayat, s.kom., gr.'];

    if (savedUser) {
      const userObj: UserAccount = JSON.parse(savedUser);
      const demoEmails = ['bambang.susanto@simakmerdeka.ai.studio', 'siti.rahmah@simakmerdeka.ai.studio', 'ahmad.hidayat@simakmerdeka.ai.studio'];
      if (!demoEmails.includes(userObj.email.toLowerCase())) {
        if (savedTeacher) {
          const teacherObj: TeacherProfile = JSON.parse(savedTeacher);
          const isSameUser = 
            (userObj.profileId && teacherObj.id === userObj.profileId) ||
            (userObj.nip && teacherObj.nip && teacherObj.nip.replace(/\s+/g, '') === userObj.nip.replace(/\s+/g, '')) ||
            (userObj.name && teacherObj.name && teacherObj.name.toLowerCase() === userObj.name.toLowerCase());

          if (!demoIds.includes(teacherObj.id) && !demoNames.includes(teacherObj.name.toLowerCase()) && isSameUser) {
            return teacherObj;
          }
        }
        return {
          id: userObj.profileId || `PROF-${userObj.uid}`,
          name: userObj.name,
          schoolName: userObj.schoolName || 'SMA Negeri 1 Indonesia - Sekolah Penggerak',
          title: userObj.role || 'Guru Pengampu',
          nip: userObj.nip || '',
          npsn: '20500000',
          guardianClass: 'X-Merdeka 1',
          subjectRole: 'Mata Pelajaran',
          academicYear: '2026/2027',
          semester: 'Ganjil',
          kkm: 75,
          principalName: 'Kepala Sekolah',
          principalNip: '19700101 199501 1 001',
          city: 'Indonesia',
          avatarUrl: userObj.avatarUrl
        };
      }
    }
    if (savedTeacher) {
      const parsedTeacher: TeacherProfile = JSON.parse(savedTeacher);
      if (!demoIds.includes(parsedTeacher.id) && !demoNames.includes(parsedTeacher.name.toLowerCase())) {
        return parsedTeacher;
      }
    }
    return initialTeacherProfile;
  });

    const activeSchoolName = currentUser?.schoolName || teacher?.schoolName || 'SMA Negeri 1 Indonesia - Sekolah Penggerak';
  const isDemoAdmin = !currentUser || 
    currentUser.uid === 'USER-ADMIN' || 
    currentUser.email?.toLowerCase() === 'shahrurrobby17@gmail.com' ||
    currentUser.name?.toLowerCase().includes('shahrur');

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    if (!isDemoAdmin) return initialSubjects;
    const saved = null;
    return saved ? JSON.parse(saved) : initialSubjects;
  });

  const [allStudents, setStudents] = useState<Student[]>(() => {
    const saved = null;
    const list: Student[] = saved ? JSON.parse(saved) : allDefaultStudents;
    const map = new Map<string, Student>();
    allDefaultStudents.forEach(s => map.set(s.id, s));
    list.forEach(s => map.set(s.id, {
      ...s,
      schoolName: s.schoolName || 'SMA Negeri 1 Indonesia - Sekolah Penggerak'
    }));
    const combined = Array.from(map.values());
    return combined.sort((a: Student, b: Student) => a.name.localeCompare(b.name));
  });

  const [allGrades, setGrades] = useState<StudentGrade[]>(() => {
    const saved = null;
    if (!saved) return initialGrades.map(g => ({ ...g, schoolName: g.schoolName || 'SMA Negeri 1 Indonesia - Sekolah Penggerak' }));
    const parsed = JSON.parse(saved);
    return parsed.map((g: StudentGrade) => ({ ...g, subjectId: 'SUB-BIO', schoolName: g.schoolName || 'SMA Negeri 1 Indonesia - Sekolah Penggerak' }));
  });

  const [allAttendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = null;
    if (!saved) return initialAttendanceRecords.map(r => ({ ...r, schoolName: r.schoolName || 'SMA Negeri 1 Indonesia - Sekolah Penggerak' }));
    try {
      const parsed: AttendanceRecord[] = JSON.parse(saved);
      const withSchool = parsed
        .filter(r => !['ATT-201', 'ATT-202', 'ATT-203', 'ATT-204', 'ATT-205', 'ATT-206', 'ATT-207', 'ATT-208', 'ATT-209', 'ATT-210', 'ATT-211', 'ATT-212', 'ATT-213', 'ATT-214', 'ATT-215', 'ATT-216', 'ATT-SUR-201', 'ATT-SUR-202', 'ATT-SUR-203', 'ATT-SUR-204', 'ATT-SUR-205'].includes(r.id))
        .map(r => ({ ...r, schoolName: r.schoolName || 'SMA Negeri 1 Indonesia - Sekolah Penggerak' }));
      
      const map = new Map<string, AttendanceRecord>();
      initialAttendanceRecords.forEach(r => {
        const key = `${r.studentId}_M${r.meetingNo || 1}`;
        map.set(key, { ...r, schoolName: r.schoolName || 'SMA Negeri 1 Indonesia - Sekolah Penggerak' });
      });
      withSchool.forEach(r => {
        const key = `${r.studentId}_M${r.meetingNo || 1}`;
        map.set(key, r);
      });
      return Array.from(map.values());
    } catch (e) {
      return initialAttendanceRecords.map(r => ({ ...r, schoolName: r.schoolName || 'SMA Negeri 1 Indonesia - Sekolah Penggerak' }));
    }
  });

  const [allTeachingLogs, setTeachingLogs] = useState<TeachingLog[]>(() => {
    const saved = null;
    if (!saved) return initialTeachingLogs.map(l => ({ ...l, schoolName: l.schoolName || 'SMA Negeri 1 Indonesia - Sekolah Penggerak' }));
    const parsed = JSON.parse(saved);
    return parsed.map((l: TeachingLog) => ({ ...l, subjectId: 'SUB-BIO', schoolName: l.schoolName || 'SMA Negeri 1 Indonesia - Sekolah Penggerak' }));
  });

  const [allStudentTasks, setStudentTasks] = useState<StudentTask[]>(() => {
    const saved = null;
    const list: StudentTask[] = saved ? JSON.parse(saved) : initialStudentTasks;
    return list.map(t => ({ ...t, schoolName: t.schoolName || 'SMA Negeri 1 Indonesia - Sekolah Penggerak' }));
  });

  const [allAnnouncements] = useState<SchoolAnnouncement[]>(() => initialAnnouncements.map(a => ({ ...a, schoolName: a.schoolName || 'SMA Negeri 1 Indonesia - Sekolah Penggerak' })));

  // Navigation and Filter States
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedClass, setSelectedClass] = useState<string>('X-IPA 2');
  const [selectedSubject, setSelectedSubject] = useState<Subject>(subjects[0]);
  
  const [customClasses, setCustomClasses] = useState<string[]>(() => {
    if (!isDemoAdmin) return [];
    const saved = null;
    return saved ? JSON.parse(saved) : [];
  });

  const [removedClasses, setRemovedClasses] = useState<string[]>(() => {
    if (!isDemoAdmin) return [];
    const saved = null;
    return saved ? JSON.parse(saved) : [];
  });

  const [inactiveClasses, setInactiveClasses] = useState<string[]>(() => {
    const saved = null;
    return saved ? JSON.parse(saved) : [];
  });

  // Modals
  const [activeReportCardStudent, setActiveReportCardStudent] = useState<Student | null>(null);
  const [showAIAssistantModal, setShowAIAssistantModal] = useState<boolean>(false);
  const [showRestrictedModal, setShowRestrictedModal] = useState<boolean>(false);
  const [showProfilePromptModal, setShowProfilePromptModal] = useState<boolean>(false);
  const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState<boolean>(false);
  const [activeFooterModal, setActiveFooterModal] = useState<HelpModalType>(null);

  // Data Lock Global State
  const [dataLockConfig, setDataLockConfig] = useState<DataLockConfig>(() => {
    const saved = null;
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      isMasterLocked: false,
      lockStudents: false,
      lockGrades: false,
      lockAttendance: false,
      lockJournal: false,
      lockSettings: false,
      lockedAt: '',
      lockedBy: ''
    };
  });

  useEffect(() => {
    const unsub = subscribeToDataLockConfig((remoteConfig) => {
      if (remoteConfig) {
        setDataLockConfig(remoteConfig);
      }
    });
    return () => unsub();
  }, []);

  // Login Background Global State & Sync
  const [loginBackgroundConfig, setLoginBackgroundConfig] = useState<LoginBackgroundConfig>(() => {
    const saved = null;
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return defaultLoginBackgroundConfig;
  });

  useEffect(() => {
    const unsub = subscribeToLoginBackgroundConfig((remoteConfig) => {
      if (remoteConfig) {
        setLoginBackgroundConfig(remoteConfig);
        try {
        } catch (e) {}
      }
    });
    return () => unsub();
  }, []);

  const handleUpdateLoginBackgroundConfig = (newConfig: LoginBackgroundConfig) => {
    setLoginBackgroundConfig(newConfig);
    try {
    } catch (err) {
      console.warn('Error saving to localStorage:', err);
    }
    saveLoginBackgroundConfigToFirebase(newConfig);
  };

  // User & Teacher Profiles State
  const [teacherProfiles, setTeacherProfiles] = useState<TeacherProfile[]>(() => {
    const saved = null;
    const demoIds = ['PROF-001', 'PROF-002', 'PROF-003'];
    const demoNames = ['drs. h. bambang susanto, m.pd.', 'siti rahmah, s.pd., m.si.', 'ahmad hidayat, s.kom., m.t.', 'ahmad hidayat, s.kom., gr.'];
    let list: TeacherProfile[] = [];
    if (saved) {
      const parsed: TeacherProfile[] = JSON.parse(saved);
      list = parsed.filter(p => !demoIds.includes(p.id) && !demoNames.includes(p.name.toLowerCase()));
    }
    if (!list.some(p => p.id === 'PROF-ADMIN' || p.name.toLowerCase().includes('shahrur'))) {
      list.unshift(initialTeacherProfile);
    }
    return list;
  });

  const [registeredUsers, setRegisteredUsers] = useState<UserAccount[]>(() => {
    const saved = null;
    const demoEmails = ['bambang.susanto@simakmerdeka.ai.studio', 'siti.rahmah@simakmerdeka.ai.studio', 'ahmad.hidayat@simakmerdeka.ai.studio'];
    const demoUids = ['USER-001', 'USER-002', 'USER-003'];
    let list: UserAccount[] = [];
    if (saved) {
      const parsed: UserAccount[] = JSON.parse(saved);
      list = parsed.filter(u => !demoEmails.includes(u.email?.toLowerCase()) && !demoUids.includes(u.uid));
      
      // Sanitize non-master admin roles
      list = list.map(u => {
        const isRealMaster = 
          u.email?.toLowerCase() === 'shahrurrobby17@gmail.com' || 
          u.uid === 'USER-ADMIN' || 
          u.name?.toLowerCase().includes('shahrur');
          
        if (!isRealMaster && (u.role?.toLowerCase().includes('admin') || u.role?.toLowerCase().includes('master'))) {
          return { ...u, role: 'Guru Pengampu' };
        }
        return u;
      });
    }
    const adminUser: UserAccount = {
      uid: 'USER-ADMIN',
      email: 'shahrurrobby17@gmail.com',
      password: '12345678',
      name: 'Shahrur Robby, S.Pd.',
      schoolName: 'SMA Negeri 1 Indonesia - Sekolah Penggerak',
      role: 'Admin Utama / Guru',
      nip: '19900101 201501 1 001',
      profileId: 'PROF-ADMIN',
      status: 'Aktif',
      isMaintenance: false
    };
    if (!list.some(u => u.email?.toLowerCase() === 'shahrurrobby17@gmail.com' || u.uid === 'USER-ADMIN')) {
      list.unshift(adminUser);
    }
    return list;
  });

  const [showLoginScreen, setShowLoginScreen] = useState<boolean>(false);

  // Info Terkini Announcement state (running text below header)
  const [infoAnnouncement, setInfoAnnouncement] = useState<InfoAnnouncement>(() => {
    const saved = null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed) return parsed;
      } catch (e) {
        console.error('Failed to parse info announcement:', e);
      }
    }
    return {
      text: 'Selamat Datang di SIMAK MERDEKA - Sistem Informasi Manajemen Akademik & Kehadiran.',
      category: 'Informasi',
      isActive: true,
      items: [
        {
          id: 'ann-1',
          text: 'Selamat Datang di SIMAK MERDEKA - Sistem Informasi Manajemen Akademik & Kehadiran. Pastikan selalu memperbarui data presensi dan nilai siswa secara berkala.',
          category: 'Informasi',
          isActive: true
        },
        {
          id: 'ann-2',
          text: 'PERHATIAN: Pengisian nilai Rapor Semester Genap & Jurnal KBM dapat disinkronkan langsung ke Cloud Database SIMAK.',
          category: 'Penting',
          isActive: true
        }
      ],
      updatedAt: new Date().toISOString(),
      updatedBy: 'Sistem SIMAK'
    };
  });

  const handleUpdateInfoAnnouncement = (updated: InfoAnnouncement) => {
    setInfoAnnouncement(updated);
    saveInfoAnnouncementToFirebase(updated);
  };


  const renderUserModule = (user: UserAccount, tab: string) => {
    const userProfile = teacherProfiles.find(t => t.id === (user.profileId || user.uid) || t.nip === user.nip || t.name === user.name) || teacher;
    const userSchoolName = user.schoolName || userProfile?.schoolName || "SD Negeri 1 SIMAK";
    const userStudents = allStudents.filter(s => s.schoolName === userSchoolName);
    
    const defaultUserClass = userStudents.length > 0 ? userStudents[0].className : selectedClass;

    switch (tab) {
      case "jadwal":
        return (
          <TeachingScheduleView 
            teacher={userProfile}
            
            selectedClass={defaultUserClass}
            classList={classList}
            
            subjects={subjects}
            isDemoAdmin={isDemoAdmin}
            isMasterUser={true}
            currentUser={currentUser}
            
          />
        );
      case "sinkronisasi":
        return (
          <StudentSyncView 
            students={userStudents}
            selectedClass={defaultUserClass}
            classList={classList}
            
            onUpdateStudents={handleUpdateStudents}
            onAddStudent={handleAddStudent}
            onDeleteStudent={handleDeleteStudent}
            teacher={userProfile}
            onClassChange={() => {}}
          />
        );
      case "siswa":
        return (
          <StudentRoster 
            students={userStudents}
            grades={allGrades}
            subjects={subjects}
            attendanceRecords={allAttendanceRecords}
            selectedClass={defaultUserClass}
            classList={classList}
            onAddStudent={handleAddStudent}
            onUpdateStudents={handleUpdateStudents}
            onDeleteStudent={handleDeleteStudent}
            onOpenReportCard={(st) => setActiveReportCardStudent(st)}
            teacher={userProfile}
            
          />
        );
      case "presensi":
        return (
          <RealtimeAttendance 
            students={userStudents}
            attendanceRecords={allAttendanceRecords}
            selectedClass={defaultUserClass}
            classList={classList}
            onUpdateAttendance={handleUpdateAttendance}
            onMarkAllPresent={handleMarkAllPresent}
            onDeleteMeeting={handleDeleteMeeting}
            isMasterUser={true}
            teacher={userProfile}
          />
        );
      case "presensiEkstra":
        return (
          <ExtracurricularAttendanceView 
            students={userStudents}
            selectedClass={defaultUserClass}
            classList={classList}
            
            teacher={userProfile}
            
            isDemoAdmin={isDemoAdmin}
          />
        );
      case "kelolaNilai":
        return (
          <GradeManagement 
            students={userStudents}
            subjects={subjects}
            grades={allGrades}
            selectedClass={defaultUserClass}
            selectedSubject={selectedSubject}
            onSelectSubject={() => {}}
            onUpdateGrade={handleUpdateGrade}
            onUpdateGradesBatch={handleUpdateGradesBatch}
            teacher={userProfile}
            
            onUpdateKktp={handleUpdateKktp}
          />
        );
      case "jurnal":
        return (
          <TeachingJournal 
            logs={allTeachingLogs}
            selectedClass={defaultUserClass}
            
            subjects={subjects}
            onAddLog={handleAddLog}
            onDeleteLog={handleDeleteLog}
            teacher={userProfile}
            
          />
        );
      case "modul":
      case "uploadModul":
      case "upload-modul":
        return (
          <TeacherModuleUploadView
            teacher={userProfile}
            subjects={subjects}
            selectedClass={defaultUserClass}
            isMasterUser={true}
          />
        );
      default:
        return null;
    }
  };

  // Base default registered classes by school
  const baseSchoolClasses = useMemo(() => {
    if (activeSchoolName === 'SMA Negeri 2 Surabaya') {
      return ['X-1', 'X-2', 'XI-1', 'XII-1'];
    }
    if (activeSchoolName === 'SMA Muhammadiyah 1 Jakarta') {
      return ['XI-A', 'XI-B', 'XII-A'];
    }
    return ['X-IPA 1', 'X-IPA 2', 'XI-IPA 1', 'XI-IPA 2', 'XII-IPA 1'];
  }, [activeSchoolName]);

  // All registered classes (active and inactive, including any classes from actual student records)
  const allRegisteredClasses = useMemo(() => {
    const studentClasses = allStudents.map(s => s.className).filter(Boolean);
    return Array.from(new Set([
      ...baseSchoolClasses,
      ...customClasses,
      ...studentClasses
    ])).filter(cls => Boolean(cls) && cls !== 'Semua Kelas' && cls !== 'SEMUA' && !removedClasses.includes(cls));
  }, [baseSchoolClasses, customClasses, allStudents, removedClasses]);

  // Valid registered active classes (excluding inactive classes)
  const validRegisteredClasses = useMemo(() => {
    return allRegisteredClasses.filter(cls => !inactiveClasses.includes(cls));
  }, [allRegisteredClasses, inactiveClasses]);

  // Dynamic classList with 'Semua Kelas' for dropdown filters (strictly ACTIVE classes only)
  const classList = useMemo(() => {
    return ['Semua Kelas', ...validRegisteredClasses];
  }, [validRegisteredClasses]);

  // Sync active classes to localStorage for system views
  useEffect(() => {
    try {
      localStorage.setItem('simak_active_classes', JSON.stringify(validRegisteredClasses));
      localStorage.setItem('simak_all_registered_classes', JSON.stringify(allRegisteredClasses));
    } catch (e) {
      // ignore
    }
  }, [validRegisteredClasses, allRegisteredClasses]);

  // Auto-switch selectedClass if current selection becomes inactive
  useEffect(() => {
    if (selectedClass && selectedClass !== 'Semua Kelas' && selectedClass !== 'SEMUA') {
      if (inactiveClasses.includes(selectedClass)) {
        if (validRegisteredClasses.length > 0) {
          setSelectedClass(validRegisteredClasses[0]);
        } else {
          setSelectedClass('Semua Kelas');
        }
      }
    }
  }, [inactiveClasses, selectedClass, validRegisteredClasses]);

  const students = useMemo(() => {
    const rawFiltered = isDemoAdmin
      ? allStudents
      : allStudents.filter(s => !s.schoolName || s.schoolName === activeSchoolName);
    
    // Only exclude if class is explicitly inactive or removed
    return rawFiltered.filter(s => !inactiveClasses.includes(s.className) && !removedClasses.includes(s.className));
  }, [allStudents, activeSchoolName, isDemoAdmin, inactiveClasses, removedClasses]);

  const grades = useMemo(() => {
    if (isDemoAdmin) {
      return allGrades;
    }
    return allGrades.filter(g => !g.schoolName || g.schoolName === activeSchoolName);
  }, [allGrades, activeSchoolName, isDemoAdmin]);

  const attendanceRecords = useMemo(() => {
    if (isDemoAdmin) {
      return allAttendanceRecords;
    }
    return allAttendanceRecords.filter(a => !a.schoolName || a.schoolName === activeSchoolName);
  }, [allAttendanceRecords, activeSchoolName, isDemoAdmin]);

  const teachingLogs = useMemo(() => {
    if (isDemoAdmin) {
      return allTeachingLogs;
    }
    return allTeachingLogs.filter(l => !l.schoolName || l.schoolName === activeSchoolName);
  }, [allTeachingLogs, activeSchoolName, isDemoAdmin]);

  const studentTasks = useMemo(() => {
    if (isDemoAdmin) {
      return allStudentTasks;
    }
    return allStudentTasks.filter(t => !t.schoolName || t.schoolName === activeSchoolName);
  }, [allStudentTasks, activeSchoolName, isDemoAdmin]);

  const announcements = useMemo(() => {
    if (isDemoAdmin) {
      return allAnnouncements;
    }
    return allAnnouncements.filter(a => !a.schoolName || a.schoolName === activeSchoolName);
  }, [allAnnouncements, activeSchoolName, isDemoAdmin]);

  // Make sure new records get schoolName
  const injectSchool = <T extends Record<string, any>>(item: T): T => ({ ...item, schoolName: activeSchoolName });


  const handleRegisterNewAccount = (newUser: UserAccount, newProfile?: TeacherProfile) => {
    const updatedUsers = [...registeredUsers.filter(u => u.email?.toLowerCase() !== newUser.email.toLowerCase()), newUser];
    setRegisteredUsers(updatedUsers);
    saveRegisteredUsersToFirebase(updatedUsers);

    if (newProfile) {
      handleAddTeacherProfile(newProfile);
    }
  };

  const handleResetPassword = (targetEmail: string, newPass: string) => {
    const updatedUsers = registeredUsers.map(u => {
      if (u.email?.toLowerCase() === targetEmail.toLowerCase()) {
        return { ...u, password: newPass };
      }
      return u;
    });

    // If targetEmail wasn't in registeredUsers yet, add it
    if (!updatedUsers.some(u => u.email?.toLowerCase() === targetEmail.toLowerCase())) {
      updatedUsers.push({
        uid: `USER-${Date.now()}`,
        email: targetEmail.toLowerCase(),
        password: newPass,
        name: targetEmail.split('@')[0],
        schoolName: 'Sekolah SIMAK',
        role: 'Guru Pengampu'
      });
    }

    setRegisteredUsers(updatedUsers);
    saveRegisteredUsersToFirebase(updatedUsers);
  };

  const handleSelectTeacherProfile = (profileId: string, customProfilesList?: TeacherProfile[]) => {
    const listToSearch = customProfilesList || teacherProfiles;
    const matched = listToSearch.find(p => p.id === profileId);
    if (matched) {
      setTeacher(matched);

      if (currentUser) {
        const updatedUser: UserAccount = {
          ...currentUser,
          name: matched.name,
          schoolName: matched.schoolName,
          role: matched.title || currentUser.role,
          nip: matched.nip,
          profileId: matched.id
        };
        setCurrentUser(updatedUser);

        const updatedUsers = registeredUsers.map(u => 
          (u.uid === currentUser.uid || u.email?.toLowerCase() === currentUser.email?.toLowerCase())
            ? updatedUser
            : u
        );
        setRegisteredUsers(updatedUsers);
        saveRegisteredUsersToFirebase(updatedUsers);
      }
    }
  };

  const handleAddTeacherProfile = (newProfile: TeacherProfile) => {
    const updated = [...teacherProfiles, newProfile];
    setTeacherProfiles(updated);
    saveTeacherProfilesToFirebase(updated);
    handleSelectTeacherProfile(newProfile.id!, updated);
  };

  const handleDeleteTeacherProfile = (profileId: string) => {
    const updated = teacherProfiles.filter(p => p.id !== profileId);
    setTeacherProfiles(updated);
    saveTeacherProfilesToFirebase(updated);
    if (teacher.id === profileId && updated.length > 0) {
      handleSelectTeacherProfile(updated[0].id!, updated);
    }
  };

  const handleUpdateRegisteredUsers = (updatedUsers: UserAccount[]) => {
    setRegisteredUsers(updatedUsers);
    saveRegisteredUsersToFirebase(updatedUsers);

    // Sync currentUser if logged in
    if (currentUser) {
      const match = updatedUsers.find(u => 
        (u.uid && u.uid === currentUser.uid) || 
        (u.email && u.email?.toLowerCase() === currentUser.email?.toLowerCase())
      );
      if (match) {
        const updatedUser = { ...currentUser, ...match };
        setCurrentUser(updatedUser);
      }
    }

    // Sync matching teacher profiles
    let profilesChanged = false;
    const updatedProfiles = teacherProfiles.map(prof => {
      const matchUser = updatedUsers.find(u => 
        (u.profileId && u.profileId === prof.id) ||
        (u.name && prof.name && u.name.toLowerCase() === prof.name.toLowerCase()) ||
        (u.email && prof.nip && `${prof.nip.replace(/\s+/g, '')}@simakmerdeka.ai.studio` === u.email?.toLowerCase())
        );
      if (matchUser) {
        profilesChanged = true;
        return {
          ...prof,
          status: matchUser.status,
          isMaintenance: Boolean(matchUser.isMaintenance || matchUser.status === 'Nonaktif')
        };
      }
      return prof;
    });

    if (profilesChanged) {
      setTeacherProfiles(updatedProfiles);
      saveTeacherProfilesToFirebase(updatedProfiles);

      if (teacher) {
        const matchProf = updatedProfiles.find(p => p.id === teacher.id || p.name.toLowerCase() === teacher.name.toLowerCase());
        if (matchProf) {
          const updatedTeacher = { ...teacher, ...matchProf };
          setTeacher(updatedTeacher);
        }
      }
    }
  };

  const handleUpdateTeacherProfiles = (updatedProfiles: TeacherProfile[]) => {
    setTeacherProfiles(updatedProfiles);
    saveTeacherProfilesToFirebase(updatedProfiles);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    
    
    setShowLoginScreen(true);
  };

  // Firebase Real-time Initialization and Listeners
  useEffect(() => {
    seedInitialDataIfEmpty();

    const settingsScope = currentUser && !isDemoAdmin ? `_${currentUser.uid}` : '';
    const handleListenerError = (name: string) => (err: any) => {
      if (err?.message?.includes('offline') || err?.code === 'unavailable' || err?.message?.includes('Could not reach')) {
        return; // Handled gracefully by Firestore local cache
      }
      console.warn(`Realtime ${name} listener error:`, err);
    };

    const unsubClasses = onSnapshot(doc(db, 'settings', `classLists${settingsScope}`), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.customClasses && Array.isArray(data.customClasses)) {
          setCustomClasses(data.customClasses);
        }
        if (data.removedClasses && Array.isArray(data.removedClasses)) {
          setRemovedClasses(data.removedClasses);
        }
        if (data.inactiveClasses && Array.isArray(data.inactiveClasses)) {
          setInactiveClasses(data.inactiveClasses);
        }
      }
    }, handleListenerError('classLists'));

    const unsubSubjects = onSnapshot(doc(db, 'settings', 'subjects'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
          setSubjects(data.items);
        }
      }
    }, handleListenerError('subjects'));

    const unsubStudents = onSnapshot(collection(db, 'students'), (snapshot) => {
      const remoteList: Student[] = [];
      snapshot.forEach(d => {
        const data = d.data() as Student;
        if (data && data.name) remoteList.push(data);
      });
      if (remoteList.length > 0) {
        const formatted = remoteList.map(s => ({
          ...s,
          schoolName: s.schoolName || 'SMA Negeri 1 Indonesia - Sekolah Penggerak'
        })).sort((a, b) => a.name.localeCompare(b.name));
        setStudents(formatted);
      } else if (!snapshot.metadata.hasPendingWrites && !snapshot.metadata.fromCache) {
        // If Firestore remote collection is truly empty, seed default data
        seedInitialDataIfEmpty();
      }
    }, handleListenerError('students'));

    const unsubGrades = onSnapshot(collection(db, 'grades'), (snapshot) => {
      const list: StudentGrade[] = [];
      snapshot.forEach(d => {
        const data = d.data() as StudentGrade;
        if (data && data.studentId) list.push(data);
      });
      if (list.length > 0) {
        setGrades(list);
      }
    }, handleListenerError('grades'));

    const unsubAttendance = onSnapshot(collection(db, 'attendance'), (snapshot) => {
      const list: AttendanceRecord[] = [];
      snapshot.forEach(d => {
        const data = d.data() as AttendanceRecord;
        if (data && data.studentId) list.push(data);
      });
      if (list.length > 0) {
        setAttendanceRecords(list);
      }
    }, handleListenerError('attendance'));

    const unsubLogs = onSnapshot(collection(db, 'teachingLogs'), (snapshot) => {
      const list: TeachingLog[] = [];
      snapshot.forEach(d => {
        const data = d.data() as TeachingLog;
        if (data && data.id) list.push(data);
      });
      if (list.length > 0) {
        setTeachingLogs(list);
      }
    }, handleListenerError('teachingLogs'));

    const unsubTasks = onSnapshot(collection(db, 'studentTasks'), (snapshot) => {
      const list: StudentTask[] = [];
      snapshot.forEach(d => {
        const data = d.data() as StudentTask;
        if (data && data.id) list.push(data);
      });
      if (list.length > 0) {
        setStudentTasks(list);
      }
    }, handleListenerError('studentTasks'));

    const unsubUsers = subscribeToRegisteredUsers((users) => {
      if (users) {
        const demoEmails = ['bambang.susanto@simakmerdeka.ai.studio', 'siti.rahmah@simakmerdeka.ai.studio', 'ahmad.hidayat@simakmerdeka.ai.studio'];
        const demoUids = ['USER-001', 'USER-002', 'USER-003'];
        const cleanUsers = users.filter(u => !demoEmails.includes(u.email?.toLowerCase()) && !demoUids.includes(u.uid));
        
        const userMap = new Map<string, UserAccount>();
        cleanUsers.forEach(u => {
          if (u.email) userMap.set(u.email?.toLowerCase(), u);
        });
        const mergedUsers = Array.from(userMap.values());

        if (!mergedUsers.some(u => u.email?.toLowerCase() === 'shahrurrobby17@gmail.com' || u.uid === 'USER-ADMIN')) {
          mergedUsers.unshift({
            uid: 'USER-ADMIN',
            email: 'shahrurrobby17@gmail.com',
            password: '12345678',
            name: 'Shahrur Robby, S.Pd.',
            schoolName: 'SMA Negeri 1 Indonesia - Sekolah Penggerak',
            role: 'Admin Utama / Guru',
            nip: '19900101 201501 1 001',
            profileId: 'PROF-ADMIN',
            status: 'Aktif',
            isMaintenance: false
          });
        }
        setRegisteredUsers(mergedUsers);
        setCurrentUser(prevUser => {
          if (!prevUser) return prevUser;
          const matchingUser = mergedUsers.find(u => u.uid === prevUser.uid || u.email?.toLowerCase() === prevUser.email.toLowerCase());
          if (matchingUser && (matchingUser.isMaintenance !== prevUser.isMaintenance || matchingUser.status !== prevUser.status)) {
            const updated = { ...prevUser, isMaintenance: matchingUser.isMaintenance, status: matchingUser.status };
            return updated;
          }
          return prevUser;
        });
      }
    });

    const unsubTeacherProfiles = subscribeToTeacherProfiles((profiles) => {
      if (profiles && profiles.length > 0) {
        const demoIds = ['PROF-001', 'PROF-002', 'PROF-003'];
        const demoNames = ['drs. h. bambang susanto, m.pd.', 'siti rahmah, s.pd., m.si.', 'ahmad hidayat, s.kom., m.t.', 'ahmad hidayat, s.kom., gr.'];
        const cleanProfiles = profiles.filter(p => !demoIds.includes(p.id) && !demoNames.includes(p.name.toLowerCase()));

        const profileMap = new Map<string, TeacherProfile>();
        cleanProfiles.forEach(p => {
          if (p.id) profileMap.set(p.id, p);
        });
        const mergedProfiles = Array.from(profileMap.values());

        if (!mergedProfiles.some(p => p.id === 'PROF-ADMIN' || p.name.toLowerCase().includes('shahrur'))) {
          mergedProfiles.unshift(initialTeacherProfile);
        }
        setTeacherProfiles(mergedProfiles);
        setTeacher(prevTeacher => {
          if (!prevTeacher) return prevTeacher;
          const matchingProf = mergedProfiles.find(p => p.id === prevTeacher.id || p.name.toLowerCase() === prevTeacher.name.toLowerCase());
          if (matchingProf) {
            const updated = { ...prevTeacher, ...matchingProf };
            return updated;
          }
          return prevTeacher;
        });
      }
    });

    const unsubSchedules = subscribeToSchedules((remoteSchedules) => {
      if (remoteSchedules && Array.isArray(remoteSchedules)) {
        const scheduleStorageKey = teacher?.id ? `simak_schedules_${teacher.id}` : 'simak_schedules';
      }
    }, settingsScope);

    const unsubInfo = subscribeToInfoAnnouncement((remoteInfo) => {
      if (remoteInfo && remoteInfo.text) {
        setInfoAnnouncement(remoteInfo);
      }
    });

    return () => {
      unsubClasses();
      unsubSubjects();
      unsubStudents();
      unsubGrades();
      unsubAttendance();
      unsubLogs();
      unsubTasks();
      unsubUsers();
      unsubTeacherProfiles();
      unsubSchedules();
      unsubInfo();
    };
  }, [currentUser?.uid, isDemoAdmin]);


  // Sync selectedSubject whenever subjects state is updated
  useEffect(() => {
    if (subjects.length > 0) {
      const matched = subjects.find(s => s.id === selectedSubject.id);
      if (matched && matched.kktp !== selectedSubject.kktp) {
        setSelectedSubject(matched);
      }
    }
  }, [subjects, selectedSubject.id]);

  // Sync selectedSubject and subjects with teacher.subjectRole and teacher.kkm from Settings
  useEffect(() => {
    if (teacher?.subjectRole && teacher.subjectRole.trim() !== '' && teacher.subjectRole !== 'Mata Pelajaran') {
      const activeRole = teacher.subjectRole.trim();
      const activeKkm = teacher.kkm !== undefined ? teacher.kkm : selectedSubject.kktp;
      
      setSelectedSubject(prev => {
        if (prev.name !== activeRole || (teacher.kkm !== undefined && prev.kktp !== teacher.kkm)) {
          return { ...prev, name: activeRole, kktp: activeKkm };
        }
        return prev;
      });
      
      setSubjects(prev => {
        const needsUpdate = prev.some(s => s.name !== activeRole || (teacher.kkm !== undefined && s.kktp !== teacher.kkm));
        if (needsUpdate) {
          const updated = prev.map(s => ({ ...s, name: activeRole, kktp: activeKkm }));
          saveSubjectsToFirebase(updated);
          return updated;
        }
        return prev;
      });
    }
  }, [teacher?.subjectRole, teacher?.kkm]);

  const handleUpdateKktp = (newKktp: number, subjectId?: string): boolean => {
    if (checkIsDataLocked('grades')) return false;
    const targetId = subjectId || selectedSubject.id;
    const updatedSubjects = subjects.map(s => s.id === targetId ? { ...s, kktp: newKktp } : s);
    setSubjects(updatedSubjects);
    saveSubjectsToFirebase(updatedSubjects);

    const updatedSel = updatedSubjects.find(s => s.id === selectedSubject.id);
    if (updatedSel) {
      setSelectedSubject(updatedSel);
    }

    const updatedTeacher = { ...teacher, kkm: newKktp };
    setTeacher(updatedTeacher);
    saveTeacherProfileToFirebase(updatedTeacher);
    return true;
  };

  const handleUpdateTeacherProfile = (newProfile: TeacherProfile): boolean => {
    if (checkIsDataLocked('settings')) return false;
    // 1. Update active teacher in state & localStorage
    setTeacher(newProfile);

    // Only update global single teacher document in Firebase for Master Admin
    if (currentUser?.email?.toLowerCase() === 'shahrurrobby17@gmail.com' || currentUser?.uid === 'USER-ADMIN') {
      saveTeacherProfileToFirebase(newProfile);
    }

    // 2. Update list of teacher profiles in state, localStorage & Firebase
    const profileIdToMatch = newProfile.id || teacher.id;
    const updatedProfiles = teacherProfiles.map(p => {
      const matchById = profileIdToMatch && p.id === profileIdToMatch;
      const matchByNip = newProfile.nip && p.nip && newProfile.nip.replace(/\s+/g, '') === p.nip.replace(/\s+/g, '');
      if (matchById || matchByNip) {
        return { ...p, ...newProfile, id: p.id || profileIdToMatch || `PROF-${Date.now()}` };
      }
      return p;
    });
    if (!updatedProfiles.some(p => (profileIdToMatch && p.id === profileIdToMatch) || (newProfile.nip && p.nip && newProfile.nip.replace(/\s+/g, '') === p.nip.replace(/\s+/g, '')))) {
      updatedProfiles.push({ ...newProfile, id: profileIdToMatch || `PROF-${Date.now()}` });
    }
    setTeacherProfiles(updatedProfiles);
    saveTeacherProfilesToFirebase(updatedProfiles);

    // 3. Update active currentUser in state & localStorage
    if (currentUser) {
      const updatedUser: UserAccount = {
        ...currentUser,
        name: newProfile.name,
        schoolName: newProfile.schoolName,
        role: newProfile.title || currentUser.role,
        nip: newProfile.nip,
        avatarUrl: newProfile.avatarUrl !== undefined ? newProfile.avatarUrl : currentUser.avatarUrl,
        profileId: profileIdToMatch || currentUser.profileId
      };
      setCurrentUser(updatedUser);

      // 4. Update registeredUsers list in state, localStorage & Firebase strictly for this user
      const updatedUsers = registeredUsers.map(u => {
        const matchByUid = u.uid && currentUser.uid && u.uid === currentUser.uid;
        const matchByEmail = currentUser.email && u.email && u.email?.toLowerCase() === currentUser.email?.toLowerCase();
        if (matchByUid || matchByEmail) {
          return {
            ...u,
            name: newProfile.name,
            schoolName: newProfile.schoolName,
            role: newProfile.title || u.role,
            nip: newProfile.nip,
            avatarUrl: newProfile.avatarUrl !== undefined ? newProfile.avatarUrl : u.avatarUrl,
            profileId: profileIdToMatch || u.profileId
          };
        }
        return u;
      });
      setRegisteredUsers(updatedUsers);
      saveRegisteredUsersToFirebase(updatedUsers);
    }

    // 5. Update subject name and KKM across subjects if applicable
    if (newProfile.subjectRole && newProfile.subjectRole.trim() !== '') {
      const activeRole = newProfile.subjectRole.trim();
      const updatedSubjects = subjects.map(s => ({ 
        ...s, 
        name: activeRole, 
        kktp: newProfile.kkm !== undefined ? newProfile.kkm : s.kktp 
      }));
      setSubjects(updatedSubjects);
      saveSubjectsToFirebase(updatedSubjects);

      setSelectedSubject(prev => ({
        ...prev,
        name: activeRole,
        kktp: newProfile.kkm !== undefined ? newProfile.kkm : prev.kktp
      }));
    } else if (newProfile.kkm !== undefined) {
      const updatedSubjects = subjects.map(s => ({ ...s, kktp: newProfile.kkm }));
      setSubjects(updatedSubjects);
      saveSubjectsToFirebase(updatedSubjects);

      const updatedSel = updatedSubjects.find(s => s.id === selectedSubject.id);
      if (updatedSel) {
        setSelectedSubject(updatedSel);
      }
    }
    return true;
  };

  const handleAddCustomClass = (newClass: string) => {
    const trimmed = newClass.trim();
    if (trimmed) {
      const updatedRemoved = removedClasses.filter(c => c !== trimmed);
      const updatedCustom = customClasses.includes(trimmed) ? customClasses : [...customClasses, trimmed];
      const updatedInactive = inactiveClasses.filter(c => c !== trimmed);
      setRemovedClasses(updatedRemoved);
      setCustomClasses(updatedCustom);
      setInactiveClasses(updatedInactive);
      const settingsScope = currentUser && !isDemoAdmin ? `_${currentUser.uid}` : '';
      saveClassListsToFirebase(updatedCustom, updatedRemoved, settingsScope, updatedInactive);
    }
  };

  const handleToggleClassStatus = (classNameToToggle: string) => {
    const isCurrentlyInactive = inactiveClasses.includes(classNameToToggle);
    const updatedInactive = isCurrentlyInactive
      ? inactiveClasses.filter(c => c !== classNameToToggle)
      : [...inactiveClasses, classNameToToggle];
    
    setInactiveClasses(updatedInactive);
    const settingsScope = currentUser && !isDemoAdmin ? `_${currentUser.uid}` : '';
    saveClassListsToFirebase(customClasses, removedClasses, settingsScope, updatedInactive);
  };

  const handleDeleteClass = (classNameToDelete: string) => {
    const updatedCustom = customClasses.filter(c => c !== classNameToDelete);
    const updatedRemoved = removedClasses.includes(classNameToDelete) ? removedClasses : [...removedClasses, classNameToDelete];
    const updatedInactive = inactiveClasses.filter(c => c !== classNameToDelete);
    setCustomClasses(updatedCustom);
    setRemovedClasses(updatedRemoved);
    setInactiveClasses(updatedInactive);
    const settingsScope = currentUser && !isDemoAdmin ? `_${currentUser.uid}` : '';
    saveClassListsToFirebase(updatedCustom, updatedRemoved, settingsScope, updatedInactive);
    
    const remaining = classList.filter(c => c !== classNameToDelete);
    if (selectedClass === classNameToDelete && remaining.length > 0) {
      setSelectedClass(remaining[0]);
    }
  };

  // Attendance Handlers
  const handleUpdateAttendance = (studentId: string, status: AttendanceStatus, note?: string, dateStr?: string, meetingNo?: number): boolean => { 
    if (checkIsDataLocked('attendance')) return false;
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    const targetMeeting = meetingNo !== undefined ? Number(meetingNo) : 1;
    const timeStr = new Date().toLocaleTimeString('id-ID');

    const existingRecord = attendanceRecords.find(r => 
      r.studentId === studentId && (Number(r.meetingNo) === targetMeeting || (!r.meetingNo && targetMeeting === 1))
        );
    const recordToSave: AttendanceRecord = existingRecord
      ? {
          ...existingRecord,
          status,
          date: targetDate,
          note: note !== undefined ? note : existingRecord.note,
          meetingNo: targetMeeting,
          recordedAt: timeStr,
          schoolName: activeSchoolName
        }
      : {
          id: `ATT-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`,
          studentId,
          date: targetDate,
          status,
          note: note || '',
          meetingNo: targetMeeting,
          recordedAt: timeStr,
          schoolName: activeSchoolName
        };

    setAttendanceRecords(prev => {
      const existingIdx = prev.findIndex(r => 
        r.studentId === studentId && (Number(r.meetingNo) === targetMeeting || (!r.meetingNo && targetMeeting === 1))
        );
      let updated: AttendanceRecord[];
      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = recordToSave;
      } else {
        updated = [...prev, recordToSave];
      }
      return updated;
    });

    saveAttendanceRecordToFirebase(recordToSave);
    return true;
  };

  const handleMarkAllPresent = (classStudents: Student[], dateStr?: string, meetingNo?: number): boolean => { 
    if (checkIsDataLocked('attendance')) return false;
    classStudents = classStudents.map(injectSchool);
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    const targetMeeting = meetingNo !== undefined ? Number(meetingNo) : 1;
    const timeStr = new Date().toLocaleTimeString('id-ID');
    
    const recordsToSave: AttendanceRecord[] = classStudents.map(st => {
      const existing = attendanceRecords.find(r => 
        r.studentId === st.id && (Number(r.meetingNo) === targetMeeting || (!r.meetingNo && targetMeeting === 1))
        );
      if (existing) {
        return {
          ...existing,
          status: 'HADIR' as AttendanceStatus,
          date: targetDate,
          meetingNo: targetMeeting,
          recordedAt: timeStr,
          schoolName: activeSchoolName
        };
      } else {
        return {
          id: `ATT-${Date.now().toString().slice(-6)}-${st.id.slice(-4)}-${Math.floor(Math.random() * 1000)}`,
          studentId: st.id,
          date: targetDate,
          status: 'HADIR',
          note: '',
          meetingNo: targetMeeting,
          recordedAt: timeStr,
          schoolName: activeSchoolName
        };
      }
    });

    setAttendanceRecords(prev => {
      let updated = [...prev];
      recordsToSave.forEach(rec => {
        const existingIdx = updated.findIndex(r => 
          r.studentId === rec.studentId && (Number(r.meetingNo) === targetMeeting || (!r.meetingNo && targetMeeting === 1))
        );
        if (existingIdx >= 0) {
          updated[existingIdx] = rec;
        } else {
          updated.push(rec);
        }
      });
      return updated;
    });

    if (recordsToSave.length > 0) {
      saveAttendanceRecordsBatchToFirebase(recordsToSave);
    }
    return true;
  };

  // Delete Meeting Handler
  const handleDeleteMeeting = (meetingNo: number, className?: string): boolean => {
    if (checkIsDataLocked('attendance')) return false;
    const targetMeeting = Number(meetingNo);
    const targetCls = className && className !== 'Semua Kelas' && className !== 'SEMUA' ? className : undefined;

    let deletedIds: string[] = [];

    setAttendanceRecords(prev => {
      let updated: AttendanceRecord[];
      if (!targetCls) {
        deletedIds = prev
          .filter(r => (Number(r.meetingNo) === targetMeeting) || (!r.meetingNo && targetMeeting === 1))
          .map(r => r.id);
        updated = prev.filter(r => (Number(r.meetingNo) !== targetMeeting) && !(r.meetingNo === undefined && targetMeeting === 1));
      } else {
        const classStudentIds = new Set(
          allStudents
            .filter(s => s.className.trim().toLowerCase() === targetCls.trim().toLowerCase())
            .map(s => s.id)
        );
        deletedIds = prev
          .filter(r => classStudentIds.has(r.studentId) && ((Number(r.meetingNo) === targetMeeting) || (!r.meetingNo && targetMeeting === 1)))
          .map(r => r.id);
        updated = prev.filter(r => !(classStudentIds.has(r.studentId) && ((Number(r.meetingNo) === targetMeeting) || (!r.meetingNo && targetMeeting === 1))));
      }
      return updated;
    });

    if (deletedIds.length > 0) {
      deleteAttendanceRecordsBatchFromFirebase(deletedIds);
    }
    return true;
  };

  // Grade Update Handler
  const handleUpdateGrade = (updatedGrade: StudentGrade): boolean => { 
    if (checkIsDataLocked('grades')) return false;
    updatedGrade = injectSchool(updatedGrade);
    setGrades(prev => {
      const idx = prev.findIndex(g => g.studentId === updatedGrade.studentId && g.subjectId === updatedGrade.subjectId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = updatedGrade;
        return updated;
      } else {
        return [...prev, updatedGrade];
      }
    });
    saveGradeToFirebase(updatedGrade);
    return true;
  };

  const handleUpdateGradesBatch = (updatedGrades: StudentGrade[]): boolean => { 
    if (checkIsDataLocked('grades')) return false;
    updatedGrades = updatedGrades.map(injectSchool);
    setGrades(prev => {
      const newGrades = [...prev];
      updatedGrades.forEach(updatedGrade => {
        const idx = newGrades.findIndex(g => g.studentId === updatedGrade.studentId && g.subjectId === updatedGrade.subjectId);
        if (idx >= 0) {
          newGrades[idx] = updatedGrade;
        } else {
          newGrades.push(updatedGrade);
        }
      });
      return newGrades;
    });
    saveGradesBatchToFirebase(updatedGrades);
    return true;
  };

  // Update Attendance Records Batch Handler (for LMS and bulk ops)
  const handleUpdateAttendanceRecordsBatch = (records: AttendanceRecord[]): boolean => {
    if (checkIsDataLocked('attendance')) return false;
    const injected = records.map(injectSchool);
    setAttendanceRecords(prev => {
      let updated = [...prev];
      injected.forEach(rec => {
        const idx = updated.findIndex(r => r.id === rec.id || (r.studentId === rec.studentId && (Number(r.meetingNo) === Number(rec.meetingNo) || (!r.meetingNo && Number(rec.meetingNo) === 1))));
        if (idx >= 0) {
          updated[idx] = rec;
        } else {
          updated.push(rec);
        }
      });
      return updated;
    });
    saveAttendanceRecordsBatchToFirebase(injected);
    return true;
  };

  // Add Student Handler
  const handleAddStudent = (newStudent: Student): boolean => { 
    if (checkIsDataLocked('students')) return false;
    newStudent = injectSchool(newStudent);
    setStudents(prev => [...prev, newStudent].sort((a, b) => a.name.localeCompare(b.name)));
    saveStudentToFirebase(newStudent);
    return true;
  };

  // Delete Student Handler
  const handleDeleteStudent = (studentId: string): boolean => {
    if (checkIsDataLocked('students')) return false;
    setStudents(prev => prev.filter(s => s.id !== studentId));
    setGrades(prev => prev.filter(g => g.studentId !== studentId));
    setAttendanceRecords(prev => prev.filter(a => a.studentId !== studentId));
    deleteStudentFromFirebase(studentId);
    return true;
  };

  // Update Students Batch Handler
  const handleUpdateStudents = (updatedStudents: Student[]): boolean => {
    if (checkIsDataLocked('students')) return false;
    const injected = updatedStudents.map(injectSchool);
    setStudents(prevAll => {
      const activeIds = new Set(injected.map(s => s.id));
      const otherStudents = prevAll.filter(s => {
        const sSchool = s.schoolName || 'SMA Negeri 1 Indonesia - Sekolah Penggerak';
        return sSchool !== activeSchoolName && !activeIds.has(s.id);
      });
      const combined = [...otherStudents, ...injected].sort((a, b) => a.name.localeCompare(b.name));
      saveStudentsBatchToFirebase(combined);
      return combined;
    });
    return true;
  };

  // Add Teaching Log Handler
  const handleAddLog = (newLog: TeachingLog): boolean => { 
    if (checkIsDataLocked('journal')) return false;
    newLog = injectSchool(newLog);
    setTeachingLogs(prev => [newLog, ...prev]);
    saveTeachingLogToFirebase(newLog);
    return true;
  };

  // Delete Teaching Log Handler
  const handleDeleteLog = (logId: string): boolean => {
    if (checkIsDataLocked('journal')) return false;
    setTeachingLogs(prev => prev.filter(l => l.id !== logId));
    deleteTeachingLogFromFirebase(logId);
    return true;
  };

  // Student Tasks Handlers
  const handleSaveStudentTask = (task: StudentTask): boolean => {
    if (checkIsDataLocked('grades')) return false;
    const taskWithSchool = injectSchool(task);
    setStudentTasks(prev => {
      const idx = prev.findIndex(t => t.id === taskWithSchool.id);
      let updated: StudentTask[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = taskWithSchool;
      } else {
        updated = [taskWithSchool, ...prev];
      }
      return updated;
    });
    saveStudentTaskToFirebase(taskWithSchool);
    return true;
  };

  const handleAddTask = (newTask: StudentTask): boolean => { 
    if (checkIsDataLocked('grades')) return false;
    newTask = injectSchool(newTask);
    setStudentTasks(prev => {
      const updated = [newTask, ...prev];
      return updated;
    });
    saveStudentTaskToFirebase(newTask);
    return true;
  };

  const handleUpdateTask = (updatedTask: StudentTask): boolean => { 
    if (checkIsDataLocked('grades')) return false;
    updatedTask = injectSchool(updatedTask);
    setStudentTasks(prev => {
      const updated = prev.map(t => t.id === updatedTask.id ? updatedTask : t);
      return updated;
    });
    saveStudentTaskToFirebase(updatedTask);
    return true;
  };

  // Delete Task Handler
  const handleDeleteTask = (taskId: string): boolean => {
    if (checkIsDataLocked('grades')) return false;
    setStudentTasks(prev => {
      const updated = prev.filter(t => t.id !== taskId);
      return updated;
    });
    deleteStudentTaskFromFirebase(taskId);
    return true;
  };

  // Stats for sidebar badges
  const todayStr = new Date().toISOString().split('T')[0];
  const classStudents = students.filter(s => s.className === selectedClass);
  const recordedTodayCount = attendanceRecords.filter(r => r.date === todayStr && classStudents.some(s => s.id === r.studentId)).length;

  const currentMatchingAccount = registeredUsers.find(u => 
    (currentUser && u.email?.toLowerCase() === currentUser.email?.toLowerCase()) ||
    (teacher && u.name.toLowerCase() === teacher.name.toLowerCase())

        );
  const isExemptAdmin = (name: string = '', email: string = '') => {
    const lowerName = name.toLowerCase();
    const lowerEmail = email.toLowerCase();
    return lowerName.includes('shahrur robby') || lowerName.includes('shahrur') || lowerEmail.includes('shahrurrobby17@gmail.com');
  };

  const isCurrentExempt = isExemptAdmin(currentUser?.name || teacher?.name || '', currentUser?.email || '');
  const isAdminSystem = isCurrentExempt || Boolean(currentUser?.role?.toLowerCase().includes('admin'));

  const isMasterUser = Boolean(
    currentUser && (
      currentUser.email?.toLowerCase() === 'shahrurrobby17@gmail.com' ||
      currentUser.email?.toLowerCase().includes('master') ||
      currentUser.name?.toLowerCase().includes('shahrur') ||
      currentUser.role?.toLowerCase().includes('master')
    )

  // Data Lock Prevention Check & Alert Modal
        );
  const [showDataLockAlertModal, setShowDataLockAlertModal] = useState<boolean>(false);

  const checkIsDataLocked = (moduleKey?: 'students' | 'grades' | 'attendance' | 'journal' | 'settings'): boolean => {
    // Administrator/Master users bypass lock restrictions
    if (isMasterUser || isAdminSystem) return false;

    let locked = false;

    if (dataLockConfig?.isMasterLocked) {
      locked = true;
    } else if (moduleKey === 'attendance' && dataLockConfig?.lockAttendance) {
      locked = true;
    } else if (moduleKey === 'grades' && dataLockConfig?.lockGrades) {
      locked = true;
    } else if (moduleKey === 'students' && dataLockConfig?.lockStudents) {
      locked = true;
    } else if (moduleKey === 'journal' && dataLockConfig?.lockJournal) {
      locked = true;
    } else if (moduleKey === 'settings' && dataLockConfig?.lockSettings) {
      locked = true;
    }

    if (locked) {
      setShowDataLockAlertModal(true);
      return true;
    }

    return false;
  };

  const isCurrentAccountDisabled = 
    !isCurrentExempt && !isMasterUser && (
      currentMatchingAccount
        ? Boolean(currentMatchingAccount.isMaintenance || currentMatchingAccount.status === 'Nonaktif')
        : Boolean(teacher?.isMaintenance || teacher?.status === 'Nonaktif')

        );
  useEffect(() => {
    const isMasterTab = activeTab === 'master-data';
    if (isMasterTab && !isMasterUser && !isAdminSystem) {
      setActiveTab('dashboard');
    }
  }, [activeTab, isMasterUser, isAdminSystem]);

  useEffect(() => {
    const RESTRICTED_TABS: NavTab[] = ['sync', 'schedule', 'journal', 'upload-modul', 'students', 'attendance', 'extracurricular', 'grades'];
    if (isCurrentAccountDisabled && RESTRICTED_TABS.includes(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [isCurrentAccountDisabled, activeTab]);

  const handleTabChange = (tab: NavTab) => {
    const RESTRICTED_TABS: NavTab[] = ['sync', 'schedule', 'journal', 'upload-modul', 'students', 'attendance', 'extracurricular', 'grades'];
    if (isCurrentAccountDisabled && RESTRICTED_TABS.includes(tab)) {
      setShowRestrictedModal(true);
      return;
    }

    setActiveTab(tab);
  };

  const menuHealthMap = useMemo(() => {
    return computeMenuHealthMap({
      students: allStudents && allStudents.length > 0 ? allStudents : students,
      grades: allGrades && allGrades.length > 0 ? allGrades : grades,
      attendanceRecords: allAttendanceRecords && allAttendanceRecords.length > 0 ? allAttendanceRecords : attendanceRecords,
      teacher,
      currentUser,
      registeredUsers,
      studentTasks: allStudentTasks && allStudentTasks.length > 0 ? allStudentTasks : studentTasks
    });
  }, [allStudents, students, allGrades, grades, allAttendanceRecords, attendanceRecords, teacher, currentUser, registeredUsers, allStudentTasks, studentTasks]);

  const activeMenuHealth = menuHealthMap[activeTab];

  if (showLoginScreen || !currentUser) {
    return (
      <LoginView
        teacherProfiles={teacherProfiles}
        registeredUsers={registeredUsers}
        onRegisterNewAccount={handleRegisterNewAccount}
        onResetPassword={handleResetPassword}
        students={allStudents.length > 0 ? allStudents : students}
        grades={allGrades.length > 0 ? allGrades : grades}
        subjects={subjects}
        attendanceRecords={allAttendanceRecords.length > 0 ? allAttendanceRecords : attendanceRecords}
        teachingLogs={allTeachingLogs.length > 0 ? allTeachingLogs : teachingLogs}
        classList={classList}
        
        infoAnnouncement={infoAnnouncement}
        onUpdateInfoAnnouncement={handleUpdateInfoAnnouncement}
        loginBackgroundConfig={loginBackgroundConfig}
                  
        isMasterUser={isMasterUser}
        onLoginSuccess={(user, profileId, targetTab) => {
          setCurrentUser(user);
          setShowLoginScreen(false);

          if (targetTab) {
            handleTabChange(targetTab as NavTab);
          }

          // Search in active state, saved localStorage, and initial defaults
          const savedProfilesJson = null;
          const savedProfiles: TeacherProfile[] = savedProfilesJson ? JSON.parse(savedProfilesJson) : [];

          const profilesToSearch = [
            ...teacherProfiles,
            ...savedProfiles,
            ...initialTeacherProfiles
          ];

          let matchedProf = profilesToSearch.find(
            p => (profileId && p.id === profileId) ||
                 (user.profileId && p.id === user.profileId) ||
                 (user.nip && p.nip && p.nip.replace(/\s+/g, '') === user.nip.replace(/\s+/g, '')) ||
                 (p.name && user.name && p.name.toLowerCase() === user.name.toLowerCase())

        );
          if (matchedProf) {
            // Sync profile status and title (jabatan) with user status and selected login role
            matchedProf = {
              ...matchedProf,
              title: user.role || matchedProf.title || 'Guru Pengampu',
              status: user.status || 'Aktif',
              isMaintenance: Boolean(user.isMaintenance || user.status === 'Nonaktif')
            };
            const updatedProfiles = teacherProfiles.map(p => p.id === matchedProf!.id ? matchedProf! : p);
            if (!updatedProfiles.some(p => p.id === matchedProf!.id)) {
              updatedProfiles.push(matchedProf);
            }
            setTeacherProfiles(updatedProfiles);
            saveTeacherProfilesToFirebase(updatedProfiles);
          } else {
            matchedProf = {
              id: profileId || user.profileId || `PROF-${Date.now()}`,
              name: user.name,
              schoolName: user.schoolName || 'SMA Negeri 1 Indonesia - Sekolah Penggerak',
              title: user.role || 'Guru Pengampu',
              nip: user.nip || '',
              npsn: '20500000',
              guardianClass: 'X-Merdeka 1',
              subjectRole: 'Mata Pelajaran',
              academicYear: '2026/2027',
              semester: 'Ganjil',
              kkm: 75,
              principalName: 'Kepala Sekolah',
              principalNip: '19700101 199501 1 001',
              city: 'Indonesia',
              status: user.status || 'Aktif',
              isMaintenance: Boolean(user.isMaintenance || user.status === 'Nonaktif')
            };
            const updatedProfiles = [...teacherProfiles.filter(p => p.id !== matchedProf!.id), matchedProf];
            setTeacherProfiles(updatedProfiles);
            saveTeacherProfilesToFirebase(updatedProfiles);
          }

          setTeacher(matchedProf);
        }}
      />
        );
  }

  const handleSyncToGoogleSheets = async (token: string): Promise<string> => {
    return await syncToGoogleSheets(token, {
      users: registeredUsers,
      students: allStudents,
      grades: allGrades,
      attendance: allAttendanceRecords,
      teachingLogs: allTeachingLogs
    });
  };

  return (
    <div className="h-[100dvh] bg-slate-50 flex flex-col font-sans antialiased text-slate-800 overflow-hidden">
      {/* Official Top Banner Navbar */}
      <Navbar 
        teacher={teacher}
        selectedClass={selectedClass}
        classList={classList}
        onSelectClass={setSelectedClass}
        showClassSelector={false}
        currentUser={currentUser}
        isMasterUser={isMasterUser}
        isAdmin={isAdminSystem}
        onLogout={() => setShowLogoutConfirmModal(true)}
        onOpenLogin={() => setShowLoginScreen(true)}
        onOpenProfilePrompt={() => setShowProfilePromptModal(true)}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row w-full my-0 items-stretch overflow-hidden">
        {/* Sidebar */}
        <SidebarNavigation
          teacher={teacher}
          activeTab={activeTab}
          onTabChange={handleTabChange} 
          attendanceCount={recordedTodayCount}
          totalStudents={classStudents.length}
          pendingGradesCount={0}
          isAdmin={isAdminSystem}
          isMasterUser={isMasterUser}
          isAccountDisabled={isCurrentAccountDisabled}
          onLogout={() => setShowLogoutConfirmModal(true)}
          currentUser={currentUser}
          students={allStudents && allStudents.length > 0 ? allStudents : students}
          grades={allGrades && allGrades.length > 0 ? allGrades : grades}
          attendanceRecords={allAttendanceRecords && allAttendanceRecords.length > 0 ? allAttendanceRecords : attendanceRecords}
          registeredUsers={registeredUsers}
          studentTasks={allStudentTasks && allStudentTasks.length > 0 ? allStudentTasks : studentTasks}
        />

        {/* Content Pane */}
        <main className="flex-1 w-full p-3 md:p-4 lg:p-5 overflow-y-auto h-full pb-24 md:pb-10">
          {/* Diagnostic Banner showing what data is wrong whenever active menu has errors (hidden on validation page) */}
          {activeTab !== 'validasi' && !activeTab.startsWith('validasi') && (
            <MenuErrorDiagnosticBanner 
              activeTab={activeTab}
              healthInfo={activeMenuHealth}
              onNavigateTab={handleTabChange}
            />
          )}
          {/* STUDENT ROLE DEDICATED LMS VIEWS (Persistent without animation on header/menu switch) */}
          {currentUser?.role?.toLowerCase().includes('siswa') ? (
            <div className="w-full h-full">
              <StudentLMSView 
                teacher={teacher}
                initialTab={
                  activeTab === 'upload-modul' ? 'modules' :
                  activeTab === 'extra-tasks' ? 'tasks' :
                  activeTab === 'attendance' ? 'attendance' :
                  activeTab === 'grades' ? 'grades' :
                  activeTab === 'schedule' ? 'schedule' :
                  activeTab === 'settings' ? 'settings' :
                  'dashboard'
                }
                allStudents={allStudents}
                grades={allGrades}
                subjects={subjects}
                studentTasks={allStudentTasks}
                attendanceRecords={allAttendanceRecords}
                currentUser={currentUser}
                onSaveTask={handleSaveStudentTask}
                onUpdateAttendance={handleUpdateAttendanceRecordsBatch}
                onOpenReportCard={(st) => setActiveReportCardStudent(st)}
              />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.99 }}
                transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
                className="w-full h-full"
              >
                {activeTab === 'dashboard' && (
                    <DashboardAnalytics 
                      students={students}
                      grades={grades}
                      subjects={subjects}
                      attendanceRecords={attendanceRecords}
                      selectedClass={selectedClass}
                      selectedSubject={selectedSubject}
                      currentUser={currentUser}
                      isMasterUser={isMasterUser}
                      isAccountDisabled={isCurrentAccountDisabled}
                      onTabChange={handleTabChange}
                    />
                  )}

                  {activeTab === 'attendance' && (
                    <RealtimeAttendance 
                      students={students}
                      attendanceRecords={attendanceRecords}
                      selectedClass={selectedClass}
                      classList={classList}
                      onUpdateAttendance={handleUpdateAttendance}
                      onMarkAllPresent={handleMarkAllPresent}
                      onDeleteMeeting={handleDeleteMeeting}
                      isMasterUser={isMasterUser}
                    />
                  )}

                  {activeTab === 'grades' && (
                    <GradeManagement 
                      students={students}
                      subjects={subjects}
                      grades={grades}
                      selectedClass={selectedClass}
                      classList={classList}
                      onSelectClass={setSelectedClass}
                      selectedSubject={selectedSubject}
                      onSelectSubject={setSelectedSubject}
                      onUpdateGrade={handleUpdateGrade}
                      onUpdateGradesBatch={handleUpdateGradesBatch}
                      onUpdateKktp={handleUpdateKktp}
                    />
                  )}

                  {activeTab === 'extra-tasks' && (
                    <ExtraAssignmentGradesView 
                      students={students}
                      subjects={subjects}
                      tasks={studentTasks}
                      selectedClass={selectedClass}
                      classList={classList}
                      onSelectClass={setSelectedClass}
                      selectedSubject={selectedSubject}
                      onSelectSubject={setSelectedSubject}
                      onSaveTask={handleSaveStudentTask}
                      onDeleteTask={handleDeleteTask}
                    />
                  )}

                  {activeTab === 'students' && (
                    <StudentRoster 
                      students={students}
                      grades={grades}
                      subjects={subjects}
                      attendanceRecords={attendanceRecords}
                      selectedClass={selectedClass}
                      classList={classList}
                      onSelectClass={setSelectedClass}
                      onAddStudent={handleAddStudent}
                      onDeleteStudent={handleDeleteStudent}
                      onOpenReportCard={(st) => setActiveReportCardStudent(st)}
                    />
                  )}

                  {activeTab === 'journal' && (
                    <TeachingJournal 
                      logs={teachingLogs}
                      subjects={subjects}
                      teacher={teacher}
                      selectedClass={selectedClass}
                      classList={classList}
                      onClassChange={setSelectedClass}
                      onAddLog={handleAddLog}
                      onDeleteLog={handleDeleteLog}
                      isMasterUser={isMasterUser}
                    />
                  )}

                  {activeTab === 'upload-modul' && (
                    <TeacherModuleUploadView
                      subjects={subjects}
                      selectedClass={selectedClass}
                      isMasterUser={isMasterUser}
                    />
                  )}

                  {activeTab === 'system-kurikulum' && (
                    <CurriculumSystemView 
                      registeredUsers={registeredUsers}
                      teacher={teacher}
                      classList={classList}
                      allRegisteredClasses={allRegisteredClasses}
                      inactiveClasses={inactiveClasses}
                      onUpdateRegisteredUsers={handleUpdateRegisteredUsers}
                      onNavigateTab={(tab) => handleTabChange(tab as NavTab)}
                    />
                  )}

                  {activeTab === 'system-guru' && (
                    <TeacherSystemView 
                      registeredUsers={registeredUsers}
                      onNavigateTab={(tab) => handleTabChange(tab as NavTab)}
                    />
                  )}

                  {activeTab === 'system-tu' && (
                    <AdministrationSystemView 
                      registeredUsers={registeredUsers}
                      onUpdateRegisteredUsers={handleUpdateRegisteredUsers}
                      onNavigateTab={(tab) => handleTabChange(tab as NavTab)}
                    />
                  )}

                  {activeTab === 'system-sarpras' && (
                    <SarprasSystemView 
                      registeredUsers={registeredUsers}
                      teacher={teacher}
                      onNavigateTab={(tab) => handleTabChange(tab as NavTab)}
                    />
                  )}

                  {activeTab === 'system-keuangan' && (
                    <FinanceSystemView 
                      registeredUsers={registeredUsers}
                      students={allStudents}
                      onNavigateTab={(tab) => handleTabChange(tab as NavTab)}
                    />
                  )}

                  {activeTab === 'system-kesiswaan' && (
                    <StudentSystemView 
                      registeredUsers={registeredUsers}
                      classList={classList}
                      students={allStudents}
                      attendanceRecords={allAttendanceRecords}
                      grades={allGrades}
                      studentTasks={allStudentTasks}
                      subjects={subjects}
                      currentUser={currentUser}
                      onNavigateTab={(tab) => handleTabChange(tab as NavTab)}
                      onAddStudent={handleAddStudent}
                      onEditStudent={(st) => handleUpdateStudents(allStudents.map(s => s.id === st.id ? st : s))}
                      onDeleteStudent={handleDeleteStudent}
                      onSaveTask={handleSaveStudentTask}
                      onUpdateAttendance={handleUpdateAttendanceRecordsBatch}
                      onOpenReportCard={(st) => setActiveReportCardStudent(st)}
                    />
                  )}

                  {activeTab === 'system-perpustakaan' && (
                    <LibrarySystemView 
                      registeredUsers={registeredUsers}
                      teacher={teacher}
                      onNavigateTab={(tab) => handleTabChange(tab as NavTab)}
                    />
                  )}

              {activeTab === 'master-data' && (isMasterUser || isAdminSystem) && (
                <MasterDataView 
                  registeredUsers={registeredUsers}
                  onUpdateRegisteredUsers={handleUpdateRegisteredUsers}
                  teacherProfiles={teacherProfiles}
                  currentUser={currentUser}
                  classList={classList}
                  infoAnnouncement={infoAnnouncement}
                  onUpdateInfoAnnouncement={handleUpdateInfoAnnouncement}
                  renderUserModule={renderUserModule}
                  onNavigateTab={(tab) => handleTabChange(tab as NavTab)}
                  activeCategory="Semua"
                  onCategoryChange={(cat) => {
                    if (cat === 'Kurikulum') handleTabChange('system-kurikulum');
                    else if (cat === 'Guru') handleTabChange('system-guru');
                    else if (cat === 'TU') handleTabChange('system-tu');
                    else if (cat === 'Sarpras') handleTabChange('system-sarpras');
                    else if (cat === 'Keuangan') handleTabChange('system-keuangan');
                    else if (cat === 'Perpustakaan') handleTabChange('system-perpustakaan');
                    else if (cat === 'Siswa') handleTabChange('system-kesiswaan');
                    else handleTabChange('master-data');
                  }}
                />
              )}

              {(activeTab === 'validasi' || activeTab.startsWith('validasi')) && (
                <ValidationSystemView 
                  students={allStudents && allStudents.length > 0 ? allStudents : students}
                  studentGrades={allGrades && allGrades.length > 0 ? allGrades : grades}
                  attendanceRecords={allAttendanceRecords && allAttendanceRecords.length > 0 ? allAttendanceRecords : attendanceRecords}
                  subjects={subjects}
                  classList={classList}
                  selectedClass={selectedClass}
                  teacher={teacher}
                  currentUser={currentUser}
                  registeredUsers={registeredUsers}
                  studentTasks={allStudentTasks && allStudentTasks.length > 0 ? allStudentTasks : studentTasks}
                  teacherProfiles={teacherProfiles}
                  activeSubTab={
                    activeTab === 'validasi-overview' ? 'overview' :
                    activeTab === 'validasi-students' ? 'students' :
                    activeTab === 'validasi-grades' ? 'grades' :
                    activeTab === 'validasi-attendance' ? 'attendance' :
                    activeTab === 'validasi-modules' ? 'modules' :
                    activeTab === 'validasi-report' ? 'report' :
                    'dapodik'
                  }
                  onSubTabChange={(st) => handleTabChange(`validasi-${st}` as NavTab)}
                  onNavigateTab={(tab) => handleTabChange(tab as NavTab)}
                />
              )}

              {activeTab === 'sync' && (
                <StudentSyncView 
                  students={students}
                  selectedClass={selectedClass}
            classList={classList}
                  
                  onUpdateStudents={handleUpdateStudents}
                  onAddStudent={handleAddStudent}
                  onDeleteStudent={handleDeleteStudent}
                  onClassChange={setSelectedClass}
                />
              )}

              {activeTab === 'schedule' && (
                <TeachingScheduleView 
                  teacher={teacher}
                  selectedClass={selectedClass}
                  classList={classList}
                  subjects={subjects}
                  isDemoAdmin={isDemoAdmin}
                  isMasterUser={isMasterUser}
                  currentUser={currentUser}
                />
              )}

              {activeTab === 'extracurricular' && (
                <ExtracurricularAttendanceView 
                  students={students}
                  selectedClass={selectedClass}
            classList={classList}
                  isDemoAdmin={isDemoAdmin}
            
                />
              )}

              {activeTab === 'residu' && (
                <ResiduDataView
                  students={students}
                  onUpdateStudents={setStudents}
                  classList={classList}
                  selectedClass={selectedClass}
                  teacher={teacher}
                  teacherProfiles={teacherProfiles}
                  registeredUsers={registeredUsers}
                  subjects={subjects}
                  onNavigateTab={handleTabChange}
                />
              )}

              {activeTab === 'ai-assistant' && (
                <GeminiAssistantView
                  teacher={teacher}
                  selectedClass={selectedClass}
                  subjects={subjects.map(s => s.name)}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView 
                  teacher={teacher}
                  selectedClass={selectedClass}
                  classList={classList}
                  allRegisteredClasses={allRegisteredClasses}
                  inactiveClasses={inactiveClasses}
                  onToggleClassStatus={handleToggleClassStatus}
                  onClassChange={setSelectedClass}
                  onUpdateTeacherProfile={handleUpdateTeacherProfile}
                  
                  onAddCustomClass={handleAddCustomClass}
                  onDeleteClass={handleDeleteClass}
                  onAddTeacherProfile={handleAddTeacherProfile}
                  onDeleteTeacherProfile={handleDeleteTeacherProfile}
                  onNavigateTab={(tab) => setActiveTab(tab as NavTab)}
                  isAdmin={isAdminSystem}
                  dataLockConfig={dataLockConfig}
                  onUpdateDataLockConfig={(cfg) => setDataLockConfig(cfg)}
                  onSyncToGoogleSheets={handleSyncToGoogleSheets}
                  infoAnnouncement={infoAnnouncement}
                  onUpdateInfoAnnouncement={handleUpdateInfoAnnouncement}
                  loginBackgroundConfig={loginBackgroundConfig}
                  onUpdateLoginBackgroundConfig={handleUpdateLoginBackgroundConfig}
                  currentUser={currentUser}
                  onChangePassword={(newPass) => {
                    if (currentUser && currentUser.email) {
                      handleResetPassword(currentUser.email, newPass);
                    }
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>
      </div>

      {/* Official High Density Footer */}
      <footer className="min-h-8 py-2 md:py-1 bg-slate-100 border-t border-slate-200 px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-4 text-xs font-semibold text-slate-700 shrink-0 select-none pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0 subpixel-antialiased">
        <div className="text-center sm:text-left">SIMAK Merdeka Versi 3.7.0 © 2026</div>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 font-semibold">
          <button 
            type="button"
            onClick={() => setActiveFooterModal('guide')}
            className="hover:text-cyan-700 hover:underline cursor-pointer transition-colors px-1 py-0.5 rounded active:bg-slate-200"
          >
            Panduan Pengguna
          </button>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <button 
            type="button"
            onClick={() => setActiveFooterModal('terms')}
            className="text-cyan-600 font-bold hover:text-cyan-800 hover:underline cursor-pointer transition-colors px-1 py-0.5 rounded active:bg-slate-200"
          >
            Syarat & Ketentuan
          </button>
        </div>
      </footer>

      {/* Footer Help & Support Modals */}
      <FooterHelpModals 
        activeModal={activeFooterModal} 
        onClose={() => setActiveFooterModal(null)} 
      />

      {/* Rapor Modal */}
      {activeReportCardStudent && (
        <ReportCardModal 
          student={activeReportCardStudent}
          teacher={teacher}
          subjects={subjects}
          grades={grades}
          attendanceRecords={attendanceRecords}
          onClose={() => setActiveReportCardStudent(null)}
          onUpdateGrade={handleUpdateGrade}
        />
      )}

      {/* Dedicated AI Assistant Modal */}
      {showAIAssistantModal && (
        <AIAssistantModal 
          onClose={() => setShowAIAssistantModal(false)}
          selectedClass={selectedClass}
        />
      )}

      {/* Pop up Informasi Pengisian Data Diri Setelah Login */}
      {showProfilePromptModal && (
        <ProfilePromptModal 
          teacher={teacher}
          currentUser={currentUser}
          onClose={() => setShowProfilePromptModal(false)}
        />
      )}

      {/* Pop up Konfirmasi Logout */}
      {showLogoutConfirmModal && (
        <LogoutConfirmModal 
          userName={currentUser?.name}
          userEmail={currentUser?.email}
          onConfirm={() => {
            setShowLogoutConfirmModal(false);
            handleLogout();
          }}
          onClose={() => setShowLogoutConfirmModal(false)}
        />
      )}

      <RestrictedAccessModal
        isOpen={showRestrictedModal}
        onClose={() => setShowRestrictedModal(false)}
      />

      {/* Pop up Gagal Simpan Karena Data Dikunci Administrator */}
      {showDataLockAlertModal && (
        <div className="simpan-data-gagal-lock-alert fixed inset-0 z-[99999] bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white rounded-none border-2 border-rose-600 shadow-2xl max-w-md w-full p-6 text-center space-y-5 relative"
          >
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-none flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-wider font-mono">
                SIMPAN DATA GAGAL
              </span>
              <h3 className="text-base font-extrabold text-slate-800">
                Penguncian Data Aktif
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Gagal menyimpan data karena <span className="font-bold text-rose-700">Administrator telah mengunci data secara permanen</span>. Hubungi Administrator untuk membuka kunci data.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-center">
              <button
                type="button"
                onClick={() => setShowDataLockAlertModal(false)}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-none transition-all cursor-pointer shadow-sm uppercase tracking-wider font-mono"
              >
                Saya Mengerti
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
        );
}
