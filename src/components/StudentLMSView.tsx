import React, { useState, useMemo, useEffect } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  ClipboardCheck, 
  Calendar, 
  Clock, 
  FileText, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Download, 
  UploadCloud, 
  ExternalLink, 
  Sparkles, 
  UserCheck, 
  Eye, 
  Check, 
  ChevronRight, 
  Info, 
  Printer, 
  User, 
  Search, 
  Filter, 
  ArrowRight,
  TrendingUp,
  BookmarkCheck,
  FileCheck,
  AlertTriangle,
  X
} from 'lucide-react';
import { 
  Student, 
  Subject, 
  StudentGrade, 
  AttendanceRecord, 
  StudentTask, 
  TeacherProfile, 
  UserAccount, 
  TeacherModuleDocument,
  AttendanceStatus,
  WeeklyClassScheduleItem
} from '../types';
import { ReportCardModal } from './ReportCardModal';
import { getTodayDateString, initialWeeklyClassSchedules } from '../data/initialData';
import { subscribeToWeeklySchedules } from '../lib/firebaseService';

interface StudentLMSViewProps {
  student?: Student;
  allStudents?: Student[];
  grades?: StudentGrade[];
  subjects?: Subject[];
  studentTasks?: StudentTask[];
  attendanceRecords?: AttendanceRecord[];
  teacher?: TeacherProfile;
  currentUser?: UserAccount | null;
  initialTab?: 'dashboard' | 'modules' | 'tasks' | 'attendance' | 'grades' | 'schedule' | 'settings';
  onSaveTask?: (task: StudentTask) => boolean | void;
  onUpdateAttendance?: (records: AttendanceRecord[]) => void;
  onOpenReportCard?: (student: Student) => void;
  onSelectStudentPreview?: (student: Student) => void;
  isPreviewMode?: boolean;
}

export const StudentLMSView: React.FC<StudentLMSViewProps> = ({
  student,
  allStudents = [],
  grades = [],
  subjects = [],
  studentTasks = [],
  attendanceRecords = [],
  teacher,
  currentUser,
  initialTab = 'dashboard',
  onSaveTask,
  onUpdateAttendance,
  onOpenReportCard,
  onSelectStudentPreview,
  isPreviewMode = false
}) => {
  // Resolve Administrator school information (Nama Sekolah & NPSN)
  const adminSchoolInfo = useMemo(() => {
    let schoolName = teacher?.schoolName;
    let npsn = teacher?.npsn;

    // Check localStorage 'simak_teacher'
    if (!schoolName || !npsn) {
      try {
        const savedTeacher = localStorage.getItem('simak_teacher');
        if (savedTeacher) {
          const parsed = JSON.parse(savedTeacher);
          if (!schoolName && parsed.schoolName) schoolName = parsed.schoolName;
          if (!npsn && parsed.npsn) npsn = parsed.npsn;
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Check localStorage 'simak_teacher_profiles'
    if (!schoolName || !npsn) {
      try {
        const savedProfiles = localStorage.getItem('simak_teacher_profiles');
        if (savedProfiles) {
          const profiles: TeacherProfile[] = JSON.parse(savedProfiles);
          const adminProf = profiles.find(p => p.id === 'PROF-ADMIN' || p.title?.toLowerCase().includes('admin')) || profiles[0];
          if (adminProf) {
            if (!schoolName && adminProf.schoolName) schoolName = adminProf.schoolName;
            if (!npsn && adminProf.npsn) npsn = adminProf.npsn;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Check registered users for Administrator
    if (!schoolName) {
      try {
        const savedUsers = localStorage.getItem('simak_registered_users');
        if (savedUsers) {
          const users: UserAccount[] = JSON.parse(savedUsers);
          const admin = users.find(u => u.role?.toLowerCase().includes('admin') || u.uid === 'USER-ADMIN');
          if (admin?.schoolName) schoolName = admin.schoolName;
        }
      } catch (e) {
        console.error(e);
      }
    }

    return {
      schoolName: schoolName || 'SMA Negeri 1 Indonesia - Sekolah Penggerak',
      npsn: npsn || '20500000'
    };
  }, [teacher]);

  // Determine active student
  const activeStudent: Student = useMemo(() => {
    if (student) {
      return {
        ...student,
        schoolName: adminSchoolInfo.schoolName
      };
    }
    if (allStudents && allStudents.length > 0) {
      // If user is a student, accurately match by ID, profileId, NISN, NIS, or full Name
      if (currentUser?.role?.toLowerCase().includes('siswa')) {
        const studentIdFromUid = currentUser.uid?.startsWith('USER-STUDENT-') ? currentUser.uid.replace('USER-STUDENT-', '') : null;
        const studentIdFromProfile = currentUser.profileId?.startsWith('PROF-STUDENT-') ? currentUser.profileId.replace('PROF-STUDENT-', '') : null;

        const found = allStudents.find(
          s => (studentIdFromUid && s.id === studentIdFromUid) ||
               (studentIdFromProfile && s.id === studentIdFromProfile) ||
               (currentUser.nip && s.nisn && s.nisn.replace(/\s+/g, '') === currentUser.nip.replace(/\s+/g, '')) || 
               (currentUser.nip && s.nis && s.nis.replace(/\s+/g, '') === currentUser.nip.replace(/\s+/g, '')) || 
               (s.name && currentUser.name && s.name.trim().toLowerCase() === currentUser.name.trim().toLowerCase()) ||
               (currentUser.email && s.nisn && currentUser.email.toLowerCase().includes(s.nisn.toLowerCase()))
        );
        if (found) {
          return {
            ...found,
            schoolName: adminSchoolInfo.schoolName
          };
        }
      }
      return {
        ...allStudents[0],
        schoolName: adminSchoolInfo.schoolName
      };
    }
    return {
      id: 'STD-001',
      nis: '24251001',
      nisn: '0071829301',
      name: currentUser?.name || 'Ahmad Rizky Pratama',
      gender: 'L',
      className: 'X-IPA 1',
      parentName: 'H. Pratama Widodo',
      parentPhone: '081234567801',
      status: 'Aktif',
      schoolName: adminSchoolInfo.schoolName
    };
  }, [student, allStudents, currentUser, adminSchoolInfo.schoolName]);

  const [currentTab, setCurrentTab] = useState<'dashboard' | 'modules' | 'tasks' | 'attendance' | 'grades' | 'schedule' | 'settings'>(initialTab);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('Semua');
  const [taskFilter, setTaskFilter] = useState<'Semua' | 'Belum Dikerjakan' | 'Sudah Dikumpulkan' | 'Selesai Dinilai'>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Task Submission Modal State
  const [selectedTaskForSubmission, setSelectedTaskForSubmission] = useState<StudentTask | null>(null);
  const [submissionAnswerText, setSubmissionAnswerText] = useState<string>('');
  const [submissionFileLink, setSubmissionFileLink] = useState<string>('');
  const [isSubmittingTask, setIsSubmittingTask] = useState<boolean>(false);
  const [submissionSuccessMsg, setSubmissionSuccessMsg] = useState<string | null>(null);

  // Attendance Filter State
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState<'Semua' | 'HADIR' | 'SAKIT' | 'IZIN' | 'ALPA'>('Semua');

  // Report Card Modal
  const [showReportCardModal, setShowReportCardModal] = useState<boolean>(false);

  // Read Modules State (Local Storage persistent)
  const [completedModules, setCompletedModules] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(`simak_completed_modules_${activeStudent.id}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {};
  });

  const toggleModuleRead = (modId: string) => {
    setCompletedModules(prev => {
      const next = { ...prev, [modId]: !prev[modId] };
      localStorage.setItem(`simak_completed_modules_${activeStudent.id}`, JSON.stringify(next));
      return next;
    });
  };

  // Sync initial tab when changed from props
  useEffect(() => {
    if (initialTab) {
      setCurrentTab(initialTab);
    }
  }, [initialTab]);

  // Available Modules list (from teacher modules or predefined list)
  const storedModules: TeacherModuleDocument[] = useMemo(() => {
    const saved = localStorage.getItem('simak_teacher_modules');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }
    // Default curriculum materials
    return [
      {
        id: 'MOD-BIO-01',
        title: 'Modul Ajar Bab 1: Keanekaragaman Hayati Indonesia & Konservasi',
        category: 'Modul Ajar (RPP Merdeka)',
        subject: 'Biologi',
        fase: 'Fase E (Kelas X)',
        className: activeStudent.className || 'X-IPA 1',
        semester: 'Ganjil',
        academicYear: '2026/2027',
        teacherName: teacher?.name || 'Shahrur Robby, S.Pd.',
        fileName: 'Modul_Ajar_Biologi_Bab1_KeanekaragamanHayati.pdf',
        fileSize: '3.4 MB',
        fileType: 'PDF',
        fileUrl: '#',
        uploadedAt: '2026-08-01',
        status: 'Disetujui',
        schoolName: activeStudent.schoolName
      },
      {
        id: 'MOD-BIO-02',
        title: 'LKPD Praktikum: Pengamatan Preparat Jaringan Sel Mikroskopis',
        category: 'Lembar Kerja Siswa (LKPD)',
        subject: 'Biologi',
        fase: 'Fase E (Kelas X)',
        className: activeStudent.className || 'X-IPA 1',
        semester: 'Ganjil',
        academicYear: '2026/2027',
        teacherName: teacher?.name || 'Shahrur Robby, S.Pd.',
        fileName: 'LKPD_Praktikum_Mikroskop_Sel.pdf',
        fileSize: '1.8 MB',
        fileType: 'PDF',
        fileUrl: '#',
        uploadedAt: '2026-08-05',
        status: 'Disetujui',
        schoolName: activeStudent.schoolName
      },
      {
        id: 'MOD-BIO-03',
        title: 'Bahan Tayang & Ringkasan: Struktur Membran Sel & Transpor Pasif-Aktif',
        category: 'Modul Ajar (RPP Merdeka)',
        subject: 'Biologi',
        fase: 'Fase E (Kelas X)',
        className: activeStudent.className || 'X-IPA 1',
        semester: 'Ganjil',
        academicYear: '2026/2027',
        teacherName: teacher?.name || 'Shahrur Robby, S.Pd.',
        fileName: 'Slide_Presentasi_Transpor_Membran.pdf',
        fileSize: '5.2 MB',
        fileType: 'PDF',
        fileUrl: '#',
        uploadedAt: '2026-08-10',
        status: 'Disetujui',
        schoolName: activeStudent.schoolName
      },
      {
        id: 'MOD-BIO-04',
        title: 'Kisi-Kisi Soal & Panduan Asesmen Sumatif Tengah Semester (STS)',
        category: 'Kisi-Kisi / Bank Soal',
        subject: 'Biologi',
        fase: 'Fase E (Kelas X)',
        className: activeStudent.className || 'X-IPA 1',
        semester: 'Ganjil',
        academicYear: '2026/2027',
        teacherName: teacher?.name || 'Shahrur Robby, S.Pd.',
        fileName: 'Kisi_Kisi_STS_Biologi_KelasX.pdf',
        fileSize: '950 KB',
        fileType: 'PDF',
        fileUrl: '#',
        uploadedAt: '2026-08-15',
        status: 'Disetujui',
        schoolName: activeStudent.schoolName
      }
    ];
  }, [teacher, activeStudent]);

  // Filtered Tasks for this student's class
  const studentTasksForClass = useMemo(() => {
    return studentTasks.filter(t => {
      if (!t.className || t.className === 'Semua Kelas' || t.className === activeStudent.className) {
        return true;
      }
      return false;
    });
  }, [studentTasks, activeStudent]);

  // Tasks statistics for this student
  const taskStats = useMemo(() => {
    let completed = 0;
    let pending = 0;
    let graded = 0;
    let totalScore = 0;
    let scoreCount = 0;

    studentTasksForClass.forEach(task => {
      const studentGrade = task.grades?.[activeStudent.id];
      if (studentGrade && studentGrade.score > 0) {
        graded++;
        completed++;
        totalScore += studentGrade.score;
        scoreCount++;
      } else if (studentGrade && (studentGrade.status === 'Tuntas' || studentGrade.submittedDate)) {
        completed++;
      } else {
        pending++;
      }
    });

    const avgScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 85;

    return {
      total: studentTasksForClass.length,
      completed,
      pending,
      graded,
      avgScore
    };
  }, [studentTasksForClass, activeStudent]);

  // Student Attendance Stats
  const studentAttendanceRecords = useMemo(() => {
    return attendanceRecords.filter(r => r.studentId === activeStudent.id);
  }, [attendanceRecords, activeStudent]);

  const todayStr = getTodayDateString();
  const todayAttendance = useMemo(() => {
    return studentAttendanceRecords.find(r => r.date === todayStr);
  }, [studentAttendanceRecords, todayStr]);

  const attendanceStats = useMemo(() => {
    const total = studentAttendanceRecords.length;
    const hadir = studentAttendanceRecords.filter(r => r.status === 'HADIR').length;
    const sakit = studentAttendanceRecords.filter(r => r.status === 'SAKIT').length;
    const izin = studentAttendanceRecords.filter(r => r.status === 'IZIN').length;
    const alpa = studentAttendanceRecords.filter(r => r.status === 'ALPA').length;
    const percentage = total > 0 ? Math.round((hadir / total) * 100) : 100;

    return { total, hadir, sakit, izin, alpa, percentage };
  }, [studentAttendanceRecords]);

  // Student Grades summary
  const studentSubjectGrades = useMemo(() => {
    const studentGrades = grades.filter(g => g.studentId === activeStudent.id);
    return subjects.map(sub => {
      const g = studentGrades.find(gr => gr.subjectId === sub.id);
      if (g) {
        return { subject: sub, grade: g };
      }
      return {
        subject: sub,
        grade: {
          studentId: activeStudent.id,
          subjectId: sub.id,
          tp1: 85,
          tp2: 88,
          tp3: 84,
          tp4: 90,
          pts: 86,
          pas: 88,
          finalScore: 87,
          predicate: 'B' as const,
          achievementDescription: `Menunjukkan penguasaan capaian pembelajaran yang sangat baik pada mata pelajaran ${sub.name}.`
        }
      };
    });
  }, [grades, activeStudent, subjects]);

  const overallGradeAverage = useMemo(() => {
    if (studentSubjectGrades.length === 0) return 86;
    const total = studentSubjectGrades.reduce((acc, curr) => acc + (curr.grade.finalScore || 0), 0);
    return Math.round(total / studentSubjectGrades.length);
  }, [studentSubjectGrades]);

  // Realtime Weekly Schedules from Curriculum
  const [weeklySchedules, setWeeklySchedules] = useState<WeeklyClassScheduleItem[]>(() => {
    try {
      const saved = localStorage.getItem('simak_weekly_class_schedules');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return initialWeeklyClassSchedules;
  });

  // Subscribe to realtime updates from Firebase for curriculum schedules
  useEffect(() => {
    const unsubscribe = subscribeToWeeklySchedules((items) => {
      if (items && Array.isArray(items) && items.length > 0) {
        setWeeklySchedules(items);
        localStorage.setItem('simak_weekly_class_schedules', JSON.stringify(items));
      }
    });
    return () => unsubscribe();
  }, []);

  // Filter Schedule matching Student's Class (e.g. X-IPA 1)
  const classSchedules = useMemo(() => {
    const studentClass = (activeStudent.className || 'X-IPA 1').trim().toLowerCase();
    
    // 1. Try exact or partial match with student's class name
    let matched = weeklySchedules.filter(s => {
      const itemClass = (s.className || '').trim().toLowerCase();
      return itemClass === studentClass || studentClass.includes(itemClass) || itemClass.includes(studentClass);
    });

    // 2. If no direct match, fallback to all schedules
    if (matched.length === 0) {
      matched = weeklySchedules;
    }

    return matched;
  }, [weeklySchedules, activeStudent]);

  // Handle Task Submission by Student
  const handleOpenSubmitModal = (task: StudentTask) => {
    setSelectedTaskForSubmission(task);
    const existingSubmission = task.grades?.[activeStudent.id];
    setSubmissionAnswerText(existingSubmission?.notes || '');
    setSubmissionFileLink(existingSubmission?.feedback ? '' : '');
    setSubmissionSuccessMsg(null);
  };

  const handleSendTaskSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForSubmission) return;

    if (!submissionAnswerText.trim() && !submissionFileLink.trim()) {
      alert('Harap isi uraian jawaban atau tautan berkas tugas Anda.');
      return;
    }

    setIsSubmittingTask(true);

    const existingGrade = selectedTaskForSubmission.grades?.[activeStudent.id];
    const updatedGrades = {
      ...(selectedTaskForSubmission.grades || {}),
      [activeStudent.id]: {
        studentId: activeStudent.id,
        score: existingGrade?.score || 0,
        status: (existingGrade?.score && existingGrade.score > 0 ? 'Tuntas' : 'Belum Tuntas') as any,
        submittedDate: getTodayDateString(),
        notes: submissionAnswerText.trim() + (submissionFileLink ? ` (Tautan: ${submissionFileLink})` : ''),
        feedback: existingGrade?.feedback || 'Tugas telah diterima oleh sistem LMS dan menunggu pemeriksaan guru.'
      }
    };

    const updatedTask: StudentTask = {
      ...selectedTaskForSubmission,
      submittedCount: Object.values(updatedGrades).filter(g => g.submittedDate).length,
      grades: updatedGrades
    };

    // Save locally and via callback
    if (onSaveTask) {
      onSaveTask(updatedTask);
    } else {
      // Local fallback
      const savedTasksJson = localStorage.getItem('simak_student_tasks');
      if (savedTasksJson) {
        try {
          const tasks: StudentTask[] = JSON.parse(savedTasksJson);
          const nextTasks = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
          localStorage.setItem('simak_student_tasks', JSON.stringify(nextTasks));
        } catch (err) {}
      }
    }

    setTimeout(() => {
      setIsSubmittingTask(false);
      setSubmissionSuccessMsg('Jawaban tugas berhasil dikirimkan ke guru mata pelajaran!');
      setTimeout(() => {
        setSelectedTaskForSubmission(null);
        setSubmissionSuccessMsg(null);
      }, 1500);
    }, 600);
  };

  return (
    <div className="space-y-4 font-sans pb-12">
      {/* PREVIEW MODE SELECTOR BANNER FOR TEACHER/ADMIN */}
      {isPreviewMode && (
        <div className="bg-amber-500 text-white px-4 py-2.5 rounded-none shadow-xs flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span className="font-bold">Mode Pratinjau Tampilan Siswa (LMS Learning Management System)</span>
            <span className="bg-amber-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">Simulasi</span>
          </div>
          {allStudents.length > 0 && onSelectStudentPreview && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-amber-100">Simulasikan Siswa:</span>
              <select
                value={activeStudent.id}
                onChange={(e) => {
                  const s = allStudents.find(st => st.id === e.target.value);
                  if (s) onSelectStudentPreview(s);
                }}
                className="bg-white text-slate-800 font-bold px-2 py-1 text-xs rounded-none border border-amber-300 focus:outline-none cursor-pointer"
              >
                {allStudents.map(st => (
                  <option key={st.id} value={st.id}>{st.name} ({st.className})</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* STUDENT PROFILE & HERO HEADER */}
      <div className="bg-gradient-to-r from-[#003865] via-[#164e63] to-[#00609c] text-white p-4 sm:p-5 rounded-none shadow-xs border-b-4 border-amber-400">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/15 p-1 border-2 border-amber-300/80 flex items-center justify-center shrink-0 shadow-inner">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-xs">
                {activeStudent.name.charAt(0)}
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 bg-amber-400 text-slate-900 font-black text-[10px] uppercase tracking-wider">
                  Learning Management System
                </span>
                <span className="px-2 py-0.5 bg-cyan-900/60 border border-cyan-300/30 text-cyan-100 font-bold text-[10px]">
                  Kelas: {activeStudent.className}
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white mt-1 truncate">
                {activeStudent.name}
              </h1>
              <p className="text-xs text-cyan-100/90 flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                <span>NISN: <strong className="text-amber-200 font-mono">{activeStudent.nisn || '0071829301'}</strong></span>
                <span>•</span>
                <span>NIS: <strong className="text-cyan-100 font-mono">{activeStudent.nis || '24251001'}</strong></span>
              </p>
            </div>
          </div>
        </div>

        {/* 4 Quick Stat Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-cyan-400/30 text-xs">
          <div className="bg-white/10 backdrop-blur-xs border border-white/15 p-2.5 rounded-none flex items-center gap-2.5">
            <div className="p-2 bg-amber-400/20 text-amber-300 rounded-none shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-cyan-200 uppercase font-bold tracking-wider">Rata-Rata Nilai</div>
              <div className="text-base sm:text-lg font-black text-white">{overallGradeAverage} <span className="text-[11px] font-normal text-amber-300">(Predikat A)</span></div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs border border-white/15 p-2.5 rounded-none flex items-center gap-2.5">
            <div className="p-2 bg-emerald-400/20 text-emerald-300 rounded-none shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-cyan-200 uppercase font-bold tracking-wider">Kehadiran Siswa</div>
              <div className="text-base sm:text-lg font-black text-white">{attendanceStats.percentage}% <span className="text-[11px] font-normal text-emerald-300">({attendanceStats.hadir} Hadir)</span></div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs border border-white/15 p-2.5 rounded-none flex items-center gap-2.5">
            <div className="p-2 bg-cyan-400/20 text-cyan-300 rounded-none shrink-0">
              <ClipboardCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-cyan-200 uppercase font-bold tracking-wider">Tugas Mandiri</div>
              <div className="text-base sm:text-lg font-black text-white">{taskStats.completed}/{taskStats.total} <span className="text-[11px] font-normal text-cyan-200">Tuntas</span></div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs border border-white/15 p-2.5 rounded-none flex items-center gap-2.5">
            <div className="p-2 bg-purple-400/20 text-purple-300 rounded-none shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-cyan-200 uppercase font-bold tracking-wider">Bahan Ajar & Modul</div>
              <div className="text-base sm:text-lg font-black text-white">{storedModules.length} <span className="text-[11px] font-normal text-purple-200">Modul</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BERANDA SISWA (DASHBOARD) */}
      {/* ========================================================================= */}
      {currentTab === 'dashboard' && (
        <div className="space-y-4">
          {/* Welcome Announcement Card */}
          <div className="bg-white border border-slate-200 p-4 rounded-none shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-none shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-800">
                  Selamat Datang di Portal Pembelajaran Digital (LMS), {activeStudent.name}!
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Gunakan platform ini untuk mengunduh modul bahan ajar Kurikulum Merdeka, mengumpulkan tugas formatif & sumatif secara mandiri, melakukan presensi kehadiran harian, dan memeriksa capaian kompetensi nilai Anda.
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setCurrentTab('tasks')}
                    className="px-3 py-1.5 bg-[#164e63] hover:bg-cyan-800 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    <span>Lihat Tugas ({taskStats.pending} Menunggu)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentTab('modules')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-cyan-700" />
                    <span>Akses Modul Bahan Ajar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentTab('attendance')}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Status Presensi Hari Ini: {todayAttendance ? todayAttendance.status : 'Belum Ada Data Guru'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2 Columns: Today's Schedule & Pending Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Today's Schedule */}
            <div className="bg-white border border-slate-200 p-4 rounded-none shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#164e63]" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Jadwal Kelas Hari Ini ({new Date().toLocaleDateString('id-ID', { weekday: 'long' })})</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentTab('schedule')}
                    className="text-[11px] font-bold text-[#164e63] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Lihat Semua</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  {classSchedules.slice(0, 3).map((sch, idx) => (
                    <div key={sch.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-none flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-none bg-[#164e63] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 truncate">{sch.subject}</h4>
                          <p className="text-[11px] text-slate-500 truncate">{sch.teacher} • {sch.room}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-bold text-slate-700 bg-white px-2 py-0.5 border border-slate-200 rounded-none flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {sch.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Rombel: <strong>{activeStudent.className}</strong></span>
                <span>Tahun Ajaran: <strong>2026/2027 Ganjil</strong></span>
              </div>
            </div>

            {/* Pending Tasks Quick List */}
            <div className="bg-white border border-slate-200 p-4 rounded-none shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4 text-amber-600" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Tugas Daring Aktif</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentTab('tasks')}
                    className="text-[11px] font-bold text-[#164e63] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Kumpulkan Tugas</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  {studentTasksForClass.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      Tidak ada tugas aktif untuk saat ini.
                    </div>
                  ) : (
                    studentTasksForClass.slice(0, 3).map((task) => {
                      const studentGrade = task.grades?.[activeStudent.id];
                      const isGraded = studentGrade && studentGrade.score > 0;
                      const isSubmitted = studentGrade && (studentGrade.status === 'Tuntas' || studentGrade.submittedDate);

                      return (
                        <div key={task.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-none flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.2 bg-cyan-100 text-cyan-800 text-[9px] font-bold uppercase">{task.category}</span>
                              <h4 className="text-xs font-bold text-slate-800 truncate">{task.title}</h4>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">Tenggat: <strong className="text-rose-600">{task.dueDate}</strong></p>
                          </div>

                          <div className="shrink-0">
                            {isGraded ? (
                              <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-none">
                                Nilai: {studentGrade.score}
                              </span>
                            ) : isSubmitted ? (
                              <span className="px-2 py-1 bg-cyan-100 text-cyan-800 text-[10px] font-bold rounded-none flex items-center gap-1">
                                <Check className="w-3 h-3 text-cyan-600" />
                                Terkirim
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setCurrentTab('tasks');
                                  handleOpenSubmitModal(task);
                                }}
                                className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold rounded-none cursor-pointer"
                              >
                                Kerjakan
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Total Tugas: <strong>{studentTasksForClass.length}</strong></span>
                <span>Tuntas: <strong className="text-emerald-600">{taskStats.completed} Tugas</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Learning Materials Section */}
          <div className="bg-white border border-slate-200 p-4 rounded-none shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Modul Ajar & Bahan Pembelajaran Terbaru</h3>
              </div>
              <button
                type="button"
                onClick={() => setCurrentTab('modules')}
                className="text-[11px] font-bold text-[#164e63] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Semua Modul</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {storedModules.slice(0, 4).map((mod) => (
                <div key={mod.id} className="p-3 bg-slate-50 border border-slate-200 rounded-none flex items-start justify-between gap-3 hover:border-cyan-400 transition-colors">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="p-2 bg-purple-100 text-purple-700 rounded-none shrink-0 mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="px-1.5 py-0.2 bg-purple-200 text-purple-900 text-[9px] font-bold uppercase">{mod.subject}</span>
                      <h4 className="text-xs font-bold text-slate-800 mt-0.5 line-clamp-1">{mod.title}</h4>
                      <p className="text-[10px] text-slate-500">{mod.teacherName} • {mod.fileSize || 'PDF'}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      alert(`Mengunduh berkas: ${mod.fileName}`);
                      toggleModuleRead(mod.id);
                    }}
                    className="px-2 py-1 bg-white hover:bg-slate-100 text-[#164e63] border border-slate-300 text-[10px] font-bold rounded-none shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Unduh</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MATERI & MODUL BELAJAR DIGITAL */}
      {/* ========================================================================= */}
      {currentTab === 'modules' && (
        <div className="space-y-4">
          {/* Header & Filter */}
          <div className="bg-white border border-slate-200 p-4 rounded-none shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Direktori Materi Pembelajaran & Modul Digital</h3>
                <p className="text-xs text-slate-500">Unduh buku teks, modul ajar mandiri, slide presentasi, dan LKPD praktikum yang diunggah oleh guru.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Filter Mata Pelajaran:</span>
                <select
                  value={selectedSubjectFilter}
                  onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                  className="bg-white border border-slate-300 text-xs font-bold text-[#164e63] px-2.5 py-1.5 rounded-none focus:outline-none focus:border-cyan-500 cursor-pointer shadow-2xs"
                >
                  <option value="Semua">Semua Pelajaran</option>
                  <option value="Biologi">Biologi</option>
                  <option value="Matematika">Matematika</option>
                  <option value="Fisika">Fisika</option>
                  <option value="Kimia">Kimia</option>
                  <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                  <option value="Bahasa Inggris">Bahasa Inggris</option>
                </select>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari judul materi, bab pembelajaran, atau nama modul..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-none focus:bg-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Modules List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {storedModules
              .filter(m => selectedSubjectFilter === 'Semua' || m.subject.toLowerCase().includes(selectedSubjectFilter.toLowerCase()))
              .filter(m => !searchQuery || m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.subject.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((mod) => {
                const isRead = completedModules[mod.id];

                return (
                  <div 
                    key={mod.id}
                    className={`bg-white border p-4 rounded-none shadow-xs flex flex-col justify-between transition-all ${
                      isRead ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200 hover:border-cyan-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 bg-[#164e63] text-white text-[10px] font-bold uppercase tracking-wider">
                            {mod.subject}
                          </span>
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-semibold">
                            {mod.category}
                          </span>
                        </div>
                        {isRead && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Sudah Dipelajari
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-800 mt-2 line-clamp-2">
                        {mod.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Pengampu: <strong>{mod.teacherName}</strong> • Ukuran: {mod.fileSize || 'PDF'} • Diunggah: {mod.uploadedAt}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => toggleModuleRead(mod.id)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-none border flex items-center gap-1 cursor-pointer transition-colors ${
                          isRead
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        <BookmarkCheck className="w-3.5 h-3.5" />
                        <span>{isRead ? 'Selesai Dibaca' : 'Tandai Selesai'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          alert(`Membuka berkas dokumen: ${mod.fileName}`);
                          toggleModuleRead(mod.id);
                        }}
                        className="px-3 py-1 bg-[#164e63] hover:bg-cyan-800 text-white font-bold text-xs rounded-none shadow-2xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh / Buka Dokumen</span>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TUGAS & KUIS DARING (ASSIGNMENTS) */}
      {/* ========================================================================= */}
      {currentTab === 'tasks' && (
        <div className="space-y-4">
          {/* Header and Filter Tabs */}
          <div className="bg-white border border-slate-200 p-4 rounded-none shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Daftar Tugas & Pengumpulan Daring Siswa</h3>
              <p className="text-xs text-slate-500">Kirimkan lembar jawaban tugas mandiri, remedial, proyek, dan portofolio langsung ke guru pengampu.</p>
            </div>

            {/* Filter Status */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 border border-slate-200">
              {(['Semua', 'Belum Dikerjakan', 'Sudah Dikumpulkan', 'Selesai Dinilai'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setTaskFilter(filter)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-none cursor-pointer transition-all ${
                    taskFilter === filter
                      ? 'bg-white text-[#164e63] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Task Cards Grid */}
          <div className="space-y-3">
            {studentTasksForClass
              .filter(task => {
                const studentGrade = task.grades?.[activeStudent.id];
                const isGraded = studentGrade && studentGrade.score > 0;
                const isSubmitted = studentGrade && (studentGrade.status === 'Tuntas' || studentGrade.submittedDate);

                if (taskFilter === 'Belum Dikerjakan') return !isSubmitted && !isGraded;
                if (taskFilter === 'Sudah Dikumpulkan') return isSubmitted && !isGraded;
                if (taskFilter === 'Selesai Dinilai') return isGraded;
                return true;
              })
              .map((task) => {
                const studentGrade = task.grades?.[activeStudent.id];
                const isGraded = studentGrade && studentGrade.score > 0;
                const isSubmitted = studentGrade && (studentGrade.status === 'Tuntas' || studentGrade.submittedDate);

                return (
                  <div key={task.id} className="bg-white border border-slate-200 p-4 rounded-none shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 bg-cyan-100 text-cyan-800 text-[10px] font-bold uppercase">
                          {task.category}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold">
                          Kelas: {task.className}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500">
                          Diberikan: {task.assignedDate}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-600 font-semibold">Tenggat Waktu:</span>
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                          {task.dueDate}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{task.title}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{task.description}</p>
                      {task.instructions && (
                        <div className="mt-2 p-2.5 bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                          <strong>Petunjuk Guru:</strong> {task.instructions}
                        </div>
                      )}
                    </div>

                    {/* Submission / Grade Details */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-none flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold">Status Pengumpulan Saya</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {isGraded ? (
                            <span className="px-2.5 py-1 bg-emerald-600 text-white font-black text-xs rounded-none flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Nilai Diperoleh: {studentGrade.score} / {task.maxScore || 100} ({studentGrade.status})
                            </span>
                          ) : isSubmitted ? (
                            <span className="px-2.5 py-1 bg-cyan-600 text-white font-bold text-xs rounded-none flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5" />
                              Terkirim ({studentGrade.submittedDate}) • Menunggu Penilaian Guru
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-rose-100 text-rose-800 font-bold text-xs rounded-none flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                              Belum Mengumpulkan Jawaban
                            </span>
                          )}
                        </div>

                        {studentGrade?.feedback && (
                          <p className="text-xs text-slate-700 mt-1.5 bg-white p-2 border border-slate-200 rounded-none">
                            <strong>Umpan Balik Guru:</strong> {studentGrade.feedback}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenSubmitModal(task)}
                          className={`px-4 py-2 font-bold text-xs rounded-none shadow-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                            isSubmitted
                              ? 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300'
                              : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                          }`}
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isSubmitted ? 'Edit / Perbarui Jawaban' : 'Kumpulkan Tugas Sekarang'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: REKAPITULASI PRESENSI SISWA (TERCATAT OLEH GURU / WALI KELAS) */}
      {/* ========================================================================= */}
      {currentTab === 'attendance' && (
        <div className="space-y-4">
          {/* Header Info Banner */}
          <div className="bg-white border border-slate-200 p-5 rounded-none shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-50 text-[#164e63] border border-cyan-200 shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <span>Rekapitulasi Presensi & Kehadiran Siswa</span>
                    <span className="px-2 py-0.5 bg-cyan-100 text-cyan-800 text-[10px] font-bold">Input Resmi Guru</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Menampilkan rekapitulasi kehadiran resmi yang diinput oleh Guru Mata Pelajaran / Wali Kelas ke dalam SIMAK.
                  </p>
                </div>
              </div>

              {/* Status Hari Ini */}
              <div className="shrink-0 self-start sm:self-auto">
                {todayAttendance ? (
                  <div className={`px-3.5 py-1.5 text-xs font-bold rounded-none flex items-center gap-2 border ${
                    todayAttendance.status === 'HADIR'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : todayAttendance.status === 'SAKIT'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : todayAttendance.status === 'IZIN'
                      ? 'bg-cyan-50 text-cyan-800 border-cyan-300'
                      : 'bg-rose-50 text-rose-800 border-rose-300'
                  }`}>
                    <CheckCircle2 className="w-4 h-4" />
                    <div>
                      <div>Presensi Hari Ini: <strong>{todayAttendance.status}</strong></div>
                      <div className="text-[10px] font-normal opacity-80">Waktu rekam: {todayAttendance.recordedAt || '07:15 WIB'}</div>
                    </div>
                  </div>
                ) : (
                  <div className="px-3.5 py-1.5 text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <div>
                      <div>Presensi Hari Ini: <span className="font-bold text-slate-700">Belum Ada Catatan</span></div>
                      <div className="text-[10px] text-slate-400">Menunggu input Guru Mapel / Wali Kelas</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 5 Summary Stat Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
              <div className="p-3 bg-cyan-50/60 border border-cyan-200">
                <div className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider">Persentase Kehadiran</div>
                <div className="text-xl font-black text-[#164e63] mt-0.5">{attendanceStats.percentage}%</div>
                <div className="text-[10px] text-cyan-600 mt-0.5">{attendanceStats.hadir} dari {attendanceStats.total} total sesi</div>
              </div>

              <div className="p-3 bg-emerald-50/60 border border-emerald-200">
                <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Hadir (H)</div>
                <div className="text-xl font-black text-emerald-800 mt-0.5">{attendanceStats.hadir} <span className="text-xs font-normal text-emerald-600">Hari</span></div>
                <div className="text-[10px] text-emerald-600 mt-0.5">Tercatat Hadir Penuh</div>
              </div>

              <div className="p-3 bg-sky-50/60 border border-sky-200">
                <div className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">Izin (I)</div>
                <div className="text-xl font-black text-sky-800 mt-0.5">{attendanceStats.izin} <span className="text-xs font-normal text-sky-600">Hari</span></div>
                <div className="text-[10px] text-sky-600 mt-0.5">Dengan Konfirmasi</div>
              </div>

              <div className="p-3 bg-amber-50/60 border border-amber-200">
                <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Sakit (S)</div>
                <div className="text-xl font-black text-amber-800 mt-0.5">{attendanceStats.sakit} <span className="text-xs font-normal text-amber-600">Hari</span></div>
                <div className="text-[10px] text-amber-600 mt-0.5">Surat Keterangan</div>
              </div>

              <div className="p-3 bg-rose-50/60 border border-rose-200">
                <div className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Alpa (A)</div>
                <div className="text-xl font-black text-rose-800 mt-0.5">{attendanceStats.alpa} <span className="text-xs font-normal text-rose-600">Hari</span></div>
                <div className="text-[10px] text-rose-600 mt-0.5">Tanpa Keterangan</div>
              </div>
            </div>

            {/* Note & Information from Academic System */}
            <div className="p-3 bg-slate-50 border border-slate-200 text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
              <div className="text-slate-600 leading-relaxed text-[11px]">
                Presensi dicatat secara resmi oleh <strong>Guru Mata Pelajaran</strong> pada saat jam pelajaran dimulai atau oleh <strong>Wali Kelas</strong> saat apel/pagi hari. Jika terdapat ketidaksesuaian catatan absensi atau ingin mengajukan surat izin/sakit, silakan menghubungi Wali Kelas.
              </div>
            </div>
          </div>

          {/* Attendance History Table */}
          <div className="bg-white border border-slate-200 p-5 rounded-none shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span>Riwayat Kehadiran Semester Ini ({teacher?.academicYear || '2026/2027'} - {teacher?.semester || 'Ganjil'})</span>
                <span className="text-xs font-normal text-slate-500">({studentAttendanceRecords.length} Catatan)</span>
              </h3>

              {/* Status Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(['Semua', 'HADIR', 'IZIN', 'SAKIT', 'ALPA'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setAttendanceStatusFilter(filter)}
                    className={`px-2.5 py-1 text-xs font-bold transition-all cursor-pointer rounded-none ${
                      attendanceStatusFilter === filter
                        ? 'bg-[#164e63] text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {filter === 'Semua' ? 'Semua' :
                     filter === 'HADIR' ? `Hadir (${attendanceStats.hadir})` :
                     filter === 'IZIN' ? `Izin (${attendanceStats.izin})` :
                     filter === 'SAKIT' ? `Sakit (${attendanceStats.sakit})` :
                     `Alpa (${attendanceStats.alpa})`}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#164e63] text-white font-bold text-[11px]">
                    <th className="p-2.5 border-r border-cyan-700 text-center w-12">No</th>
                    <th className="p-2.5 border-r border-cyan-700">Tanggal</th>
                    <th className="p-2.5 border-r border-cyan-700 text-center">Pertemuan Ke</th>
                    <th className="p-2.5 border-r border-cyan-700 text-center">Status Kehadiran</th>
                    <th className="p-2.5 border-r border-cyan-700">Keterangan / Catatan Guru</th>
                    <th className="p-2.5 border-r border-cyan-700">Waktu Rekam</th>
                    <th className="p-2.5 text-center">Verifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentAttendanceRecords
                    .filter(rec => attendanceStatusFilter === 'Semua' || rec.status === attendanceStatusFilter)
                    .length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-400 text-xs">
                        {attendanceStatusFilter === 'Semua'
                          ? 'Belum ada catatan presensi yang diinput oleh Guru/Wali Kelas.'
                          : `Tidak ada riwayat presensi dengan status ${attendanceStatusFilter}.`}
                      </td>
                    </tr>
                  ) : (
                    studentAttendanceRecords
                      .filter(rec => attendanceStatusFilter === 'Semua' || rec.status === attendanceStatusFilter)
                      .map((rec, i) => (
                        <tr key={rec.id || i} className="hover:bg-slate-50">
                          <td className="p-2.5 border-r border-slate-200 font-bold text-center text-slate-500">{i + 1}</td>
                          <td className="p-2.5 border-r border-slate-200 font-semibold text-slate-800">{rec.date}</td>
                          <td className="p-2.5 border-r border-slate-200 text-center font-bold text-slate-700">
                            Pertemuan {rec.meetingNo || 1}
                          </td>
                          <td className="p-2.5 border-r border-slate-200 text-center">
                            <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-none inline-block ${
                              rec.status === 'HADIR' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                              rec.status === 'SAKIT' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                              rec.status === 'IZIN' ? 'bg-cyan-100 text-cyan-800 border border-cyan-300' :
                              'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}>
                              {rec.status}
                            </span>
                          </td>
                          <td className="p-2.5 border-r border-slate-200 text-slate-700">{rec.note || '-'}</td>
                          <td className="p-2.5 border-r border-slate-200 text-slate-500 font-mono text-[11px]">{rec.recordedAt || '07:15 WIB'}</td>
                          <td className="p-2.5 text-center">
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                              Resmi Guru
                            </span>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: BUKU NILAI & RAPOR HASIL BELAJAR (GRADES) */}
      {/* ========================================================================= */}
      {currentTab === 'grades' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 p-5 rounded-none shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Lembar Rekapitulasi Capaian Hasil Belajar Siswa</h3>
                <p className="text-xs text-slate-500">Nilai Formatif (TP 1-4), Sumatif Tengah Semester (STS), Sumatif Akhir Semester (SAS), dan Deskripsi Capaian Kompetensi Kurikulum Merdeka.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onOpenReportCard) {
                    onOpenReportCard(activeStudent);
                  } else {
                    setShowReportCardModal(true);
                  }
                }}
                className="px-4 py-2 bg-[#164e63] hover:bg-cyan-800 text-white font-bold text-xs rounded-none shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Unduh e-Rapor Digital</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#164e63] text-white font-bold text-[11px]">
                    <th className="p-2.5 border-r border-cyan-700">Mata Pelajaran</th>
                    <th className="p-2.5 border-r border-cyan-700 text-center">TP 1</th>
                    <th className="p-2.5 border-r border-cyan-700 text-center">TP 2</th>
                    <th className="p-2.5 border-r border-cyan-700 text-center">TP 3</th>
                    <th className="p-2.5 border-r border-cyan-700 text-center">TP 4</th>
                    <th className="p-2.5 border-r border-cyan-700 text-center">STS</th>
                    <th className="p-2.5 border-r border-cyan-700 text-center">SAS</th>
                    <th className="p-2.5 border-r border-cyan-700 text-center">Nilai Akhir</th>
                    <th className="p-2.5 border-r border-cyan-700 text-center">Predikat</th>
                    <th className="p-2.5">Deskripsi Capaian Kompetensi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentSubjectGrades.map(({ subject, grade }) => (
                    <tr key={subject.id} className="hover:bg-slate-50">
                      <td className="p-2.5 border-r border-slate-200 font-bold text-slate-800">
                        {subject.name}
                        <div className="text-[10px] text-slate-400 font-normal">KKTP: {subject.kktp || 75}</div>
                      </td>
                      <td className="p-2.5 border-r border-slate-200 text-center font-semibold">{grade.tp1 || '-'}</td>
                      <td className="p-2.5 border-r border-slate-200 text-center font-semibold">{grade.tp2 || '-'}</td>
                      <td className="p-2.5 border-r border-slate-200 text-center font-semibold">{grade.tp3 || '-'}</td>
                      <td className="p-2.5 border-r border-slate-200 text-center font-semibold">{grade.tp4 || '-'}</td>
                      <td className="p-2.5 border-r border-slate-200 text-center font-semibold">{grade.pts || '-'}</td>
                      <td className="p-2.5 border-r border-slate-200 text-center font-semibold">{grade.pas || '-'}</td>
                      <td className="p-2.5 border-r border-slate-200 text-center font-black text-cyan-900 bg-cyan-50/50">
                        {grade.finalScore || 85}
                      </td>
                      <td className="p-2.5 border-r border-slate-200 text-center font-black">
                        <span className={`px-2 py-0.5 text-[10px] rounded-none ${
                          grade.predicate === 'A' ? 'bg-emerald-100 text-emerald-800' :
                          grade.predicate === 'B' ? 'bg-cyan-100 text-cyan-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {grade.predicate || 'A'}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-600 leading-relaxed text-[11px]">
                        {grade.achievementDescription || `Menunjukkan penguasaan sangat baik dalam capaian pembelajaran mata pelajaran ${subject.name}.`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: JADWAL PELAJARAN MINGGUAN */}
      {/* ========================================================================= */}
      {currentTab === 'schedule' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 p-5 rounded-none shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#164e63]" />
                  <h3 className="text-sm font-bold text-slate-800">Jadwal Mata Pelajaran 1 Minggu ({activeStudent.className || 'Kelas X'})</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Jadwal KBM tatap muka & praktikum semester ganjil T.A 2026/2027 tersinkronisasi realtime dengan Manajemen Kurikulum.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-none border border-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Jadwal</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((day) => {
                const daySchedules = classSchedules.filter(s => s.day === day);

                return (
                  <div key={day} className="bg-slate-50 border border-slate-200 p-3.5 rounded-none space-y-2.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <span className="font-extrabold text-xs text-[#164e63] uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#164e63]" />
                          <span>Hari {day}</span>
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded-none">
                          {daySchedules.length} Sesi
                        </span>
                      </div>

                      <div className="space-y-2 mt-2.5">
                        {daySchedules.length === 0 ? (
                          <div className="text-center py-6 text-slate-400 text-xs italic bg-white/50 border border-dashed border-slate-200">
                            Tidak ada jadwal KBM
                          </div>
                        ) : (
                          daySchedules.map((sch, idx) => (
                            <div key={sch.id || idx} className="p-2.5 bg-white border border-slate-200 hover:border-cyan-300 rounded-none text-xs transition-colors shadow-2xs">
                              <div className="flex items-center justify-between gap-1.5 mb-1">
                                <span className="font-mono text-slate-700 font-bold text-[11px] bg-slate-100 px-1.5 py-0.2">
                                  {sch.time}
                                </span>
                                <span className="text-[10px] text-cyan-700 font-bold truncate max-w-[120px]">
                                  {sch.room || `R. ${activeStudent.className}`}
                                </span>
                              </div>
                              <div className="font-bold text-slate-900 leading-snug">{sch.subject}</div>
                              <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1 truncate">
                                <UserCheck className="w-3 h-3 text-[#164e63] shrink-0" />
                                <span className="truncate">{sch.teacher}</span>
                              </div>
                              {sch.notes && (
                                <div className="text-[10px] text-slate-500 italic bg-amber-50/60 p-1 border border-amber-200/50 mt-1.5">
                                  {sch.notes}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 text-[10px] text-slate-400 text-right">
                      {activeStudent.className} • Kurikulum Merdeka
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: PROFIL SISWA & INFORMASI AKUN */}
      {/* ========================================================================= */}
      {currentTab === 'settings' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 p-5 rounded-none shadow-xs space-y-5">
            <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-cyan-50 text-[#164e63] border border-cyan-200">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Profil & Biodata Siswa</h3>
                  <p className="text-xs text-slate-500">Informasi identitas pokok peserta didik terdaftar pada SIMAK.</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-300">
                Akun Terverifikasi
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Kolom 1: Data Identitas Siswa */}
              <div className="space-y-3 p-4 bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                  <BookmarkCheck className="w-4 h-4 text-[#164e63]" />
                  Data Pokok Siswa
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Nama Lengkap</span>
                    <strong className="text-slate-800 font-semibold">{activeStudent.name}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">NISN</span>
                    <strong className="text-slate-800 font-mono font-bold text-amber-800">{activeStudent.nisn || '0071829301'}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">NIS / Nomor Induk</span>
                    <strong className="text-slate-800 font-mono font-semibold">{activeStudent.nis || '24251001'}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Jenis Kelamin</span>
                    <strong className="text-slate-800 font-semibold">{activeStudent.gender === 'L' ? 'Laki-Laki' : 'Perempuan'}</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Status Peserta Didik</span>
                    <span className="px-2 py-0.5 bg-emerald-600 text-white font-bold text-[10px]">
                      {activeStudent.status || 'Aktif'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Kolom 2: Data Rombel & Lembaga */}
              <div className="space-y-3 p-4 bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#164e63]" />
                  Rombel & Satuan Pendidikan
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Rombongan Belajar</span>
                    <strong className="text-slate-800 font-semibold">{activeStudent.className}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Tahun Ajaran</span>
                    <strong className="text-slate-800 font-semibold">{teacher?.academicYear || '2026/2027'} (Semester {teacher?.semester || 'Ganjil'})</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Satuan Pendidikan</span>
                    <strong className="text-slate-800 font-semibold text-right max-w-[220px] truncate">{adminSchoolInfo.schoolName}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">NPSN Sekolah</span>
                    <strong className="text-slate-800 font-mono font-bold text-amber-800">{adminSchoolInfo.npsn}</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Nama Orang Tua / Wali</span>
                    <strong className="text-slate-800 font-semibold">{activeStudent.parentName || 'H. Pratama Widodo'}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Catatan Keamanan Akun */}
            <div className="p-3.5 bg-cyan-50/70 border border-cyan-200 text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
              <div className="text-cyan-900 leading-relaxed">
                Untuk perubahan biodata resmi (Nama, NISN, Rombel, atau Nomor Kontak Orang Tua), silakan hubungi bagian <strong>Tata Usaha (TU)</strong> sekolah.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SUBMISSION TUGAS MANDIRI */}
      {/* ========================================================================= */}
      {selectedTaskForSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-slate-300 w-full max-w-xl shadow-2xl p-5 space-y-4 rounded-none">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Pengumpulan Tugas: {selectedTaskForSubmission.title}</h3>
                  <p className="text-xs text-slate-500">Tenggat: <strong className="text-rose-600">{selectedTaskForSubmission.dueDate}</strong></p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTaskForSubmission(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submissionSuccessMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold text-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                {submissionSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleSendTaskSubmission} className="space-y-3">
                <div className="p-3 bg-cyan-50/60 border border-cyan-200 text-xs text-cyan-950">
                  <strong>Petunjuk Pengerjaan:</strong> {selectedTaskForSubmission.instructions || selectedTaskForSubmission.description}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Uraian / Teks Jawaban Tugas:
                  </label>
                  <textarea
                    rows={4}
                    value={submissionAnswerText}
                    onChange={(e) => setSubmissionAnswerText(e.target.value)}
                    placeholder="Tuliskan rangkuman, jawaban soal, atau catatan pengerjaan tugas Anda di sini..."
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-none focus:bg-white focus:outline-none focus:border-cyan-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tautan Lampiran Berkas Tugas (Google Drive / Dokumen / PDF):
                  </label>
                  <input
                    type="text"
                    value={submissionFileLink}
                    onChange={(e) => setSubmissionFileLink(e.target.value)}
                    placeholder="https://drive.google.com/... atau https://docs.google.com/..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-none focus:bg-white focus:outline-none focus:border-cyan-500 font-sans"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Pastikan link Google Drive atau berkas dapat diakses oleh guru pengampu.</p>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTaskForSubmission(null)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-none cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingTask}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold rounded-none shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingTask ? 'Mengirimkan Jawaban...' : 'Kirim Tugas ke Guru'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REPORT CARD SISWA */}
      {/* ========================================================================= */}
      {showReportCardModal && (
        <ReportCardModal
          student={activeStudent}
          teacher={teacher ? {
            ...teacher,
            schoolName: adminSchoolInfo.schoolName,
            npsn: adminSchoolInfo.npsn
          } : {
            id: 'PROF-ADMIN',
            name: 'Shahrur Robby, S.Pd.',
            title: 'Wali Kelas X-IPA 1',
            nip: '19900101 201501 1 001',
            npsn: adminSchoolInfo.npsn,
            schoolName: adminSchoolInfo.schoolName,
            guardianClass: activeStudent.className || 'X-IPA 1',
            subjectRole: 'Biologi',
            academicYear: '2026/2027',
            semester: 'Ganjil',
            kkm: 75,
            principalName: 'Dr. Hj. Sri Wahyuni, M.Si.',
            principalNip: '19691120 199403 2 003',
            city: 'Indonesia'
          }}
          subjects={subjects}
          grades={grades}
          attendanceRecords={attendanceRecords}
          onClose={() => setShowReportCardModal(false)}
          onUpdateGrade={() => {}}
        />
      )}
    </div>
  );
};
