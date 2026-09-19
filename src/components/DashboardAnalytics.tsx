import React, { useState } from 'react';
import { Student, StudentGrade, Subject, AttendanceRecord, TeacherProfile } from '../types';
import { NavTab } from './SidebarNavigation';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, LineChart, Line, PieChart, Pie, Legend 
} from 'recharts';
import { 
  TrendingUp, 
  UserCheck, 
  Award, 
  AlertTriangle, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  RefreshCw,
  Users,
  Target,
  BarChart3,
  FileDown,
  BookOpenCheck,
  GraduationCap,
  CalendarDays,
  Trophy,
  Settings,
  Zap,
  ChevronRight,
  Database,
  ShieldAlert,
  ShieldCheck,
  FolderUp
} from 'lucide-react';
import { generatePdfReport } from '../utils/pdfExport';
import { UserAccount } from '../types';
import { AdminExecutiveAnalytics } from './AdminExecutiveAnalytics';

interface DashboardAnalyticsProps {
  students: Student[];
  grades: StudentGrade[];
  subjects: Subject[];
  attendanceRecords: AttendanceRecord[];
  selectedClass: string;
  selectedSubject: Subject;
  teacher?: TeacherProfile;
  currentUser?: UserAccount | null;
  isMasterUser?: boolean;
  isAccountDisabled?: boolean;
  onTabChange?: (tab: NavTab) => void;
  isLoginView?: boolean;
  teacherProfiles?: TeacherProfile[];
  registeredUsers?: UserAccount[];
  teachingLogs?: any[];
  classList?: string[];
}

const RESTRICTED_TABS: NavTab[] = ['sync', 'schedule', 'journal', 'upload-modul', 'students', 'attendance', 'extracurricular', 'grades'];

export const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({
  students,
  grades,
  subjects,
  attendanceRecords,
  selectedClass,
  selectedSubject,
  teacher,
  currentUser,
  isMasterUser,
  isAccountDisabled: propAccountDisabled,
  onTabChange,
  isLoginView,
  teacherProfiles = [],
  registeredUsers = [],
  teachingLogs = [],
  classList = []
}) => {
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const isAdministrator = Boolean(
    isMasterUser ||
    currentUser?.role?.toLowerCase().includes('admin') ||
    currentUser?.role?.toLowerCase().includes('master') ||
    currentUser?.role?.toLowerCase().includes('operator') ||
    currentUser?.email?.toLowerCase() === 'shahrurrobby17@gmail.com' ||
    currentUser?.uid === 'USER-ADMIN'
  );

  const [activeDashboardView, setActiveDashboardView] = useState<'admin' | 'guru'>(
    isAdministrator ? 'admin' : 'guru'
  );

  const quickMenuItems = [
    {
      id: 'attendance' as NavTab,
      label: 'Presensi Siswa',
      desc: 'Kehadiran harian',
      icon: UserCheck,
      color: 'bg-cyan-50/80 hover:bg-cyan-100/80 border-cyan-200/80',
      iconBg: 'bg-[#164e63] text-white'
    },
    {
      id: 'grades' as NavTab,
      label: 'Kelola Nilai',
      desc: 'Formatif & Sumatif',
      icon: BookOpenCheck,
      color: 'bg-cyan-50/80 hover:bg-cyan-100/80 border-cyan-200/80',
      iconBg: 'bg-[#164e63] text-white'
    },
    {
      id: 'students' as NavTab,
      label: 'Data Siswa',
      desc: 'Roster & Rapor',
      icon: GraduationCap,
      color: 'bg-cyan-50/80 hover:bg-cyan-100/80 border-cyan-200/80',
      iconBg: 'bg-[#164e63] text-white'
    },
    {
      id: 'journal' as NavTab,
      label: 'Jurnal Guru',
      desc: 'Agenda mengajar',
      icon: CalendarDays,
      color: 'bg-cyan-50/80 hover:bg-cyan-100/80 border-cyan-200/80',
      iconBg: 'bg-[#164e63] text-white'
    },
    {
      id: 'upload-modul' as NavTab,
      label: 'Upload Modul/ATP',
      desc: 'Perangkat & RPP',
      icon: FolderUp,
      color: 'bg-cyan-50/80 hover:bg-cyan-100/80 border-cyan-200/80',
      iconBg: 'bg-[#164e63] text-white'
    },
    ...(isMasterUser ? [{
      id: 'master-data' as NavTab,
      label: 'Master Data',
      desc: 'Monitoring Akun Terdaftar',
      icon: Database,
      color: 'bg-cyan-50/80 hover:bg-cyan-100/80 border-cyan-200/80',
      iconBg: 'bg-[#164e63] text-white'
    }] : []),
    {
      id: 'extracurricular' as NavTab,
      label: 'Presensi Ekstra',
      desc: 'Ekstrakurikuler',
      icon: Trophy,
      color: 'bg-cyan-50/80 hover:bg-cyan-100/80 border-cyan-200/80',
      iconBg: 'bg-[#164e63] text-white'
    },
    {
      id: 'sync' as NavTab,
      label: 'Sinkronisasi',
      desc: 'Kenaikan & Mutasi',
      icon: RefreshCw,
      color: 'bg-cyan-50/80 hover:bg-cyan-100/80 border-cyan-200/80',
      iconBg: 'bg-[#164e63] text-white'
    },
    {
      id: 'ai-assistant' as NavTab,
      label: 'Asisten AI',
      desc: 'Generator Modul',
      icon: Sparkles,
      color: 'bg-cyan-50/80 hover:bg-cyan-100/80 border-cyan-200/80',
      iconBg: 'bg-[#164e63] text-white'
    },
    {
      id: 'settings' as NavTab,
      label: 'Pengaturan',
      desc: 'Profil & Sekolah',
      icon: Settings,
      color: 'bg-slate-50 hover:bg-slate-100 border-slate-200',
      iconBg: 'bg-[#164e63] text-white'
    }
  ];

  // All students (global/keseluruhan)
  const classStudents = students;
  const totalStudents = classStudents.length;

  // Grades for all classes and selected subject
  const currentGrades = classStudents.map(student => {
    const grade = grades.find(g => g.studentId === student.id && g.subjectId === selectedSubject.id);
    return {
      student,
      grade: grade || {
        studentId: student.id,
        subjectId: selectedSubject.id,
        tp1: 0, tp2: 0, tp3: 0, tp4: 0,
        pts: 0, pas: 0, finalScore: 0,
        predicate: 'D' as const,
        achievementDescription: 'Belum ada nilai.'
      }
    };
  });

  // Calculate Average Global Score
  const totalScore = currentGrades.reduce((sum, item) => sum + item.grade.finalScore, 0);
  const avgClassScore = totalStudents > 0 ? Math.round((totalScore / totalStudents) * 10) / 10 : 0;

  // KKTP Passing Count (Score >= 75)
  const passedStudents = currentGrades.filter(item => item.grade.finalScore >= selectedSubject.kktp);
  const passRate = totalStudents > 0 ? Math.round((passedStudents.length / totalStudents) * 100) : 0;
  const atRiskStudents = currentGrades.filter(item => item.grade.finalScore < selectedSubject.kktp);

  // Grade Distribution Counts
  const gradeDistribution = [
    { name: 'Sangat Baik (A: 90-100)', count: currentGrades.filter(g => g.grade.finalScore >= 90).length, color: '#164e63' },
    { name: 'Baik (B: 80-89)', count: currentGrades.filter(g => g.grade.finalScore >= 80 && g.grade.finalScore < 90).length, color: '#1d4ed8' },
    { name: 'Cukup (C: 70-79)', count: currentGrades.filter(g => g.grade.finalScore >= 70 && g.grade.finalScore < 80).length, color: '#3b82f6' },
    { name: 'Perlu Bimbingan (D: <70)', count: currentGrades.filter(g => g.grade.finalScore < 70).length, color: '#93c5fd' },
  ];

  // Today's Attendance Stats
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = attendanceRecords.filter(r => r.date === todayStr);

  const hadirCount = todayRecords.filter(r => r.status === 'HADIR').length;
  const izinCount = todayRecords.filter(r => r.status === 'IZIN').length;
  const sakitCount = todayRecords.filter(r => r.status === 'SAKIT').length;
  const alpaCount = todayRecords.filter(r => r.status === 'ALPA').length;
  const attendanceRate = totalStudents > 0 ? Math.round((hadirCount / totalStudents) * 100) : 100;

  // Attendance Trend Data (Real-time 5 Days)
  const attendanceTrendData = (() => {
    const data = [];
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    for (let i = 4; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = i === 0 ? `${days[d.getDay()]} (Hari Ini)` : days[d.getDay()];
      
      const records = attendanceRecords.filter(r => r.date === dateStr);

      data.push({
        day: dayName,
        hadir: records.filter(r => r.status === 'HADIR').length,
        sakit: records.filter(r => r.status === 'SAKIT').length,
        izin: records.filter(r => r.status === 'IZIN').length,
        alpa: records.filter(r => r.status === 'ALPA').length,
      });
    }
    return data;
  })();

  // Top Achievers (Sorted by Final Score)
  const sortedAchievers = [...currentGrades].sort((a, b) => b.grade.finalScore - a.grade.finalScore);
  const top3Achievers = sortedAchievers.slice(0, 4);

  // Trigger AI Class Analysis from Backend
  const displaySubjectName = teacher?.subjectRole && teacher.subjectRole.trim() !== '' 
    ? teacher.subjectRole 
    : selectedSubject.name;

  const handleFetchAiAnalysis = async () => {
    setLoadingAi(true);
    setAiError(null);
    try {
      const response = await window.mockFetch('/api/ai/analisis-kelas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          className: selectedClass,
          subjectName: displaySubjectName,
          averageGrade: avgClassScore,
          passRate,
          lowestSubject: atRiskStudents[0]?.grade.finalScore || 65,
          atRiskCount: atRiskStudents.length
        })
      });

      const data = await response.json();
      if (data.success) {
        setAiAnalysis(data.result);
      } else {
        throw new Error(data.error || 'Gagal memproses analisis AI.');
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Gagal tersambung ke layanan AI.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleExportPdf = () => {
    const tableHeaders = ['No', 'NISN', 'Nama Siswa', 'TP1', 'TP2', 'TP3', 'TP4', 'PTS', 'PAS', 'Nilai Akhir', 'Predikat', 'Status KKTP'];
    const tableRows = currentGrades.map((item, idx) => [
      idx + 1,
      item.student.nisn,
      item.student.name,
      item.grade.tp1 ?? '-',
      item.grade.tp2 ?? '-',
      item.grade.tp3 ?? '-',
      item.grade.tp4 ?? '-',
      item.grade.pts ?? '-',
      item.grade.pas ?? '-',
      item.grade.finalScore,
      item.grade.predicate,
      item.grade.finalScore >= selectedSubject.kktp ? 'LULUS KKTP' : 'REMEDIAL'
    ]);

    generatePdfReport({
      title: `Laporan Analitik Performa Rekap Keseluruhan`,
      subtitle: `${displaySubjectName ? `Mata Pelajaran: ${displaySubjectName} | ` : ''}Standard KKTP: ${selectedSubject.kktp}`,
      teacherName: teacher?.name,
      teacherNip: teacher?.nip,
      schoolName: teacher?.schoolName,
      principalName: teacher?.principalName,
      principalNip: teacher?.principalNip,
      city: teacher?.city || 'Malang',
      academicYear: teacher?.academicYear,
      semester: teacher?.semester,
      kpiCards: [
        { label: 'Rata-rata Keseluruhan', value: avgClassScore, subtext: `KKTP: ${selectedSubject.kktp}` },
        { label: 'Ketuntasan KKTP', value: `${passRate}%`, subtext: `${passedStudents.length} dari ${totalStudents} Siswa` },
        { label: 'Tingkat Kehadiran', value: `${attendanceRate}%`, subtext: 'Presensi Harian' },
        { label: 'Siswa Remedial / At-Risk', value: `${atRiskStudents.length} Siswa`, subtext: `Nilai < ${selectedSubject.kktp}` }
      ],
      tableHeaders,
      tableRows,
      additionalSection: aiAnalysis ? {
        title: 'Ringkasan Analisis AI Pembelajaran',
        content: aiAnalysis
      } : undefined,
      notes: 'Laporan ini di-generate secara otomatis berdasarkan data akademik & presensi real-time SIMAK Guru.'
    });
  };

  const isAccountDisabled = propAccountDisabled ?? Boolean(
    teacher?.isMaintenance || teacher?.status === 'Nonaktif' ||
    currentUser?.isMaintenance || currentUser?.status === 'Nonaktif'
  );

  return (
    <div className="space-y-6">
      {/* Banner Status Akun Belum Aktif */}
      {isAccountDisabled && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-none p-4 text-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-rose-600 text-white rounded-none shrink-0 shadow-sm">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-rose-950 uppercase tracking-tight">KETERANGAN DASBOARD:</h3>
                <span className="px-2.5 py-0.5 rounded-none bg-rose-600 text-white font-black text-xs shadow-xs">BELUM AKTIF</span>
              </div>
              <p className="text-xs text-rose-900 font-semibold mt-1 leading-snug">
                Akun ini saat ini berstatus <strong className="text-rose-700 underline font-black">BELUM AKTIF</strong>. Seluruh akses fitur pembelajaran dan penginputan data dibatasi. Silakan hubungi Administrator untuk aktivasi.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mode View Selector: Analitik Administrator (14 Sistem) vs Analitik Guru */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveDashboardView('admin')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider cursor-pointer transition-all flex items-center gap-2 border ${
              activeDashboardView === 'admin'
                ? 'bg-[#164e63] text-white border-[#164e63] shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>Analitik Administrator (14 Sistem)</span>
            <span className="px-1.5 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px]">
              14 MODUL
            </span>
          </button>

          <button
            onClick={() => setActiveDashboardView('guru')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider cursor-pointer transition-all flex items-center gap-2 border ${
              activeDashboardView === 'guru'
                ? 'bg-[#164e63] text-white border-[#164e63] shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-cyan-500" />
            <span>Analitik Akademik Guru</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span className="font-semibold text-slate-700">SIMAK Merdeka</span>
          <span>• T.A 2026/2027 Ganjil</span>
        </div>
      </div>

      {activeDashboardView === 'admin' ? (
        <AdminExecutiveAnalytics 
          students={students}
          grades={grades}
          subjects={subjects}
          attendanceRecords={attendanceRecords}
          teacher={teacher}
          currentUser={currentUser}
          teacherProfiles={teacherProfiles}
          registeredUsers={registeredUsers}
          teachingLogs={teachingLogs}
          classList={classList}
          onNavigateTab={onTabChange}
        />
      ) : (
        <>
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Rata-rata Nilai */}
        <div className="bg-white p-4 rounded-none border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Rata-rata Keseluruhan</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-[#164e63]">{avgClassScore}</span>
              <span className="text-xs text-cyan-600 font-bold">+2.4%</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-none bg-cyan-50 text-[#164e63] flex items-center justify-center font-bold text-lg border border-cyan-100">
            📊
          </div>
        </div>

        {/* Card 2: Kelulusan KKTP */}
        <div className="bg-white p-4 rounded-none border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Tuntas KKM/KKTP</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-[#164e63]">{passedStudents.length}</span>
              <span className="text-xs text-slate-400 font-medium">/ {totalStudents} Siswa</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-none bg-cyan-50 text-[#164e63] flex items-center justify-center font-bold text-lg border border-cyan-100">
            🎯
          </div>
        </div>
      </div>

      {/* AI Analysis Insight Output Banner (if generated) */}
      {aiAnalysis && (
        <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-[#002f54] p-5 rounded-none border border-cyan-800 text-white shadow-xl">
          <div className="flex items-center justify-between mb-3 border-b border-cyan-800/60 pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-200" />
              Rekomendasi Asesmen & Pedagogis AI (Kurikulum Merdeka)
            </h3>
            <span className="text-[10px] bg-cyan-400/20 text-cyan-200 font-mono px-2 py-0.5 rounded-none border border-cyan-400/30">
              Powered by Gemini 2.5
            </span>
          </div>

          <p className="text-xs text-slate-200 mb-4 leading-relaxed bg-cyan-900/40 p-3 rounded-none border border-cyan-800/40">
            {aiAnalysis.ringkasanAnalisis}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-[#164e63]/80 p-3 rounded-none border border-cyan-400/30">
              <span className="font-bold text-cyan-200 block mb-1">💪 Kekuatan Utama Kelas:</span>
              <ul className="list-disc list-inside text-slate-300 space-y-1 text-[11px]">
                {aiAnalysis.kekuatanUtama?.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-[#164e63]/80 p-3 rounded-none border border-cyan-400/30">
              <span className="font-bold text-cyan-200 block mb-1">🎯 Strategi Pengajaran:</span>
              <ul className="list-disc list-inside text-slate-300 space-y-1 text-[11px]">
                {aiAnalysis.rekomendasiPedagogis?.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-[#164e63]/80 p-3 rounded-none border border-cyan-400/30">
              <span className="font-bold text-cyan-200 block mb-1">🛠️ Langkah Remedial & Diferensiasi:</span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {aiAnalysis.rekomendasiRemedial}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Distribution of Grades Histogram */}
        <div className="bg-white p-5 rounded-none border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#164e63] flex items-center gap-2">
                <BarChart className="w-4 h-4 text-[#164e63]" />
                Distribusi Predikat Capaian Siswa
              </h3>
              <p className="text-xs text-slate-500">Jumlah siswa per rentang predikat nilai (A, B, C, D)</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeDistribution} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Attendance Trends Line Chart */}
        <div className="bg-white p-5 rounded-none border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#164e63] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#164e63]" />
                Tren Presensi Minggu Ini
              </h3>
              <p className="text-xs text-slate-500">Rekapitulasi jumlah siswa hadir per hari kerja</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis domain={[0, totalStudents]} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="hadir" name="Hadir" stroke="#164e63" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="sakit" name="Sakit" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="alpa" name="Alpa" stroke="#93c5fd" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};
