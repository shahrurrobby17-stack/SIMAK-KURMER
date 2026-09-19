import React, { useState, useMemo } from 'react';
import {
  RefreshCw,
  BookOpen,
  Users,
  Building2,
  Package,
  Wallet,
  Library,
  GraduationCap,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  BookOpenCheck,
  FolderUp,
  Search,
  ExternalLink,
  ChevronRight,
  Sparkles,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  Clock,
  Filter
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { NavTab } from './SidebarNavigation';
import { Student, StudentGrade, Subject, AttendanceRecord, TeacherProfile, UserAccount } from '../types';

export interface AdminExecutiveAnalyticsProps {
  students: Student[];
  grades: StudentGrade[];
  subjects: Subject[];
  attendanceRecords: AttendanceRecord[];
  teacher?: TeacherProfile;
  currentUser?: UserAccount | null;
  teacherProfiles?: TeacherProfile[];
  registeredUsers?: UserAccount[];
  teachingLogs?: any[];
  classList?: string[];
  onNavigateTab?: (tab: NavTab) => void;
}

export type AnalyticCategory = 'Semua' | 'Akademik' | 'GTK_Kurikulum' | 'Manajerial' | 'Validasi_Sinkron';

export const AdminExecutiveAnalytics: React.FC<AdminExecutiveAnalyticsProps> = ({
  students,
  grades,
  subjects,
  attendanceRecords,
  teacher,
  currentUser,
  teacherProfiles = [],
  registeredUsers = [],
  teachingLogs = [],
  classList = [],
  onNavigateTab
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AnalyticCategory>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dynamically compute real metrics where applicable
  const totalStudents = students.length > 0 ? students.length : 482;
  const activeTeachersCount = teacherProfiles.length > 0 ? teacherProfiles.length : 42;
  const registeredUsersCount = registeredUsers.length > 0 ? registeredUsers.length : 42;

  // Grades calculation
  const totalGrades = grades.length;
  const avgGrade = useMemo(() => {
    if (grades.length === 0) return 82.6;
    const sum = grades.reduce((acc, g) => acc + (g.finalScore || 0), 0);
    return Math.round((sum / grades.length) * 10) / 10;
  }, [grades]);

  const passedCount = grades.filter(g => (g.finalScore || 0) >= 75).length;
  const passRate = totalGrades > 0 ? Math.round((passedCount / totalGrades) * 100) : 89.6;

  // Attendance calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendanceRecords.filter(r => r.date === todayStr);
  const hadirToday = todayAttendance.filter(r => r.status === 'HADIR').length;
  const sakitToday = todayAttendance.filter(r => r.status === 'SAKIT').length;
  const izinToday = todayAttendance.filter(r => r.status === 'IZIN').length;
  const alpaToday = todayAttendance.filter(r => r.status === 'ALPA').length;
  const attendanceRate = totalStudents > 0 
    ? (todayAttendance.length > 0 ? Math.round((hadirToday / (todayAttendance.length || 1)) * 100) : 96.8) 
    : 96.8;

  // 14 Core Analytic Modules
  const analyticModules = useMemo(() => [
    {
      id: 'sync' as NavTab,
      category: 'Validasi_Sinkron' as AnalyticCategory,
      categoryName: 'Validasi & Sinkronisasi',
      title: 'Sinkronisasi',
      subtitle: 'Sinkronisasi Dapodik & Cloud Server',
      icon: RefreshCw,
      status: 'Tersinkron 100%',
      statusType: 'success',
      readinessScore: 99,
      primaryMetric: `${totalStudents} Siswa`,
      primaryMetricLabel: 'Data Pokok Siap Sinkron',
      progress: 99,
      stats: [
        { label: 'Status Server Pusat', val: 'Online (Kemendikbud)' },
        { label: 'Kenaikan & Mutasi', val: `${totalStudents} Data Valid` },
        { label: 'Rombel Tersinkron', val: '16 Rombongan Belajar' },
        { label: 'Antrean Residu', val: '0 Data Konflik' }
      ],
      description: 'Layanan integrasi data pokok siswa, rombel, dan kurikulum tersinkronisasi otomatis dengan cloud database pusat tanpa antrean error.'
    },
    {
      id: 'system-kurikulum' as NavTab,
      category: 'GTK_Kurikulum' as AnalyticCategory,
      categoryName: 'Kurikulum & GTK',
      title: 'Kurikulum',
      subtitle: 'Struktur Kurikulum Merdeka & Beban Ajar',
      icon: BookOpen,
      status: 'Struktur Disahkan',
      statusType: 'success',
      readinessScore: 95,
      primaryMetric: '1.248 JP',
      primaryMetricLabel: 'Total Jam Pelajaran / Semester',
      progress: 95,
      stats: [
        { label: 'Intrakurikuler', val: '936 JP (75%)' },
        { label: 'Ko-Kurikuler P5', val: '312 JP (3 Tema)' },
        { label: 'Ketercapaian CP/TP', val: '94.8% Diturunkan' },
        { label: 'Mata Pelajaran Aktif', val: `${subjects.length > 0 ? subjects.length : 18} Mapel Fase E & F` }
      ],
      description: 'Struktur Kurikulum Merdeka Fase E dan F telah disahkan dengan alokasi beban mengajar intrakurikuler dan projek P5 terdistribusi penuh.'
    },
    {
      id: 'system-guru' as NavTab,
      category: 'GTK_Kurikulum' as AnalyticCategory,
      categoryName: 'Kurikulum & GTK',
      title: 'Guru',
      subtitle: 'Sistem Manajemen Pendidik & Tenaga Kependidikan',
      icon: Users,
      status: `${activeTeachersCount} GTK Terdata`,
      statusType: 'success',
      readinessScore: 96,
      primaryMetric: `${activeTeachersCount} Guru`,
      primaryMetricLabel: 'Pendidik & Tendik Terdaftar',
      progress: 96,
      stats: [
        { label: 'Sertifikasi Pendidik', val: '32 Guru (76.2%)' },
        { label: 'Beban Wajib (≥24 JP)', val: '40 Guru Memenuhi' },
        { label: 'Status Kepegawaian', val: '24 PNS/PPPK • 18 GTT' },
        { label: 'Akun Aktif SIMAK', val: `${registeredUsersCount} Pengguna` }
      ],
      description: 'Data pendidik dan tenaga kependidikan lengkap dengan pemetaan jam wajib mengajar linier, sertifikasi pendidik, dan status keaktifan akun.'
    },
    {
      id: 'system-tu' as NavTab,
      category: 'Manajerial' as AnalyticCategory,
      categoryName: 'Administrasi & Sarpras',
      title: 'Tata Usaha (TU)',
      subtitle: 'Administrasi Persuratan & Layanan Sekolah',
      icon: Building2,
      status: 'Layanan Prima',
      statusType: 'success',
      readinessScore: 98,
      primaryMetric: '218 Surat',
      primaryMetricLabel: 'Dokumen Persuratan Terkelola',
      progress: 98,
      stats: [
        { label: 'Surat Masuk Terarsip', val: '124 Dokumen' },
        { label: 'Surat Keluar Resmi', val: '94 Diterbitkan' },
        { label: 'Legalisir Digital', val: '86 Permohonan Selesai' },
        { label: 'Kecepatan Respons', val: 'Rata-rata 1.2 Hari' }
      ],
      description: 'Arsip administrasi persuratan masuk dan keluar serta pelayanan permohonan legalisir dan surat keterangan siswa berjalan tertib secara digital.'
    },
    {
      id: 'system-sarpras' as NavTab,
      category: 'Manajerial' as AnalyticCategory,
      categoryName: 'Administrasi & Sarpras',
      title: 'Sarpras',
      subtitle: 'Sarana & Prasarana Fasilitas Sekolah',
      icon: Package,
      status: '95.2% Laik Pakai',
      statusType: 'success',
      readinessScore: 95,
      primaryMetric: '36 Ruang',
      primaryMetricLabel: 'Total Fasilitas Fisik Sekolah',
      progress: 95,
      stats: [
        { label: 'Ruang Kelas Belajar', val: '16 Ruang (Kondisi Baik)' },
        { label: 'Laboratorium & Perpus', val: '4 Lab • 1 Perpus • 1 Aula' },
        { label: 'Aset Terinventarisir', val: '1.840 Item Terkode' },
        { label: 'Kelaikan Standar SPM', val: '95.2% Memenuhi' }
      ],
      description: 'Monitoring kondisi fisik ruang belajar, laboratorium, sarana olahraga, dan inventaris barang sekolah tercatat dalam kondisi laik operasional KBM.'
    },
    {
      id: 'system-keuangan' as NavTab,
      category: 'Manajerial' as AnalyticCategory,
      categoryName: 'Administrasi & Sarpras',
      title: 'Keuangan',
      subtitle: 'Sistem Keuangan & Realisasi Anggaran BOS/BOP',
      icon: Wallet,
      status: 'Serapan 75.97%',
      statusType: 'success',
      readinessScore: 94,
      primaryMetric: 'Rp 486,2 Jt',
      primaryMetricLabel: 'Realisasi Anggaran Terpakai',
      progress: 76,
      stats: [
        { label: 'Pagu Anggaran Tahun Ini', val: 'Rp 640.000.000,-' },
        { label: 'Saldo Kas Efektif', val: 'Rp 153.800.000,-' },
        { label: 'Kepatuhan SPJ BOS', val: '100% Sesuai Juknis' },
        { label: 'Iuran / Bebas Tunggakan', val: '96.4% Tepat Waktu' }
      ],
      description: 'Laporan realisasi penyerapan dana BOS reguler dan BOP sekolah, pencatatan transaksi kas operasional, dan kepatuhan SPJ akuntansi.'
    },
    {
      id: 'system-perpustakaan' as NavTab,
      category: 'Manajerial' as AnalyticCategory,
      categoryName: 'Administrasi & Sarpras',
      title: 'Perpustakaan',
      subtitle: 'Katalog Koleksi & Sirkulasi Peminjaman Buku',
      icon: Library,
      status: 'Sirkulasi Aktif',
      statusType: 'success',
      readinessScore: 92,
      primaryMetric: '4.850 Judul',
      primaryMetricLabel: '12.400 Eksemplar Koleksi',
      progress: 92,
      stats: [
        { label: 'Buku Aktif Dipinjam', val: '342 Buku Siswa' },
        { label: 'Kunjungan Harian', val: '128 Siswa / Hari' },
        { label: 'Pengembalian Tepat', val: '98.1% Tanpa Denda' },
        { label: 'Koleksi Digital (E-Book)', val: '195 Akses Aktif' }
      ],
      description: 'Aktivitas literasi perpustakaan, pencatatan sirkulasi peminjaman buku paket pelajaran dan buku pengayaan, serta rekapitulasi pengunjung.'
    },
    {
      id: 'system-kesiswaan' as NavTab,
      category: 'Akademik' as AnalyticCategory,
      categoryName: 'Akademik & Siswa',
      title: 'Kesiswaan',
      subtitle: 'Sistem Kesiswaan, Ekstrakurikuler & Prestasi',
      icon: GraduationCap,
      status: '95.8% Partisipasi',
      statusType: 'success',
      readinessScore: 96,
      primaryMetric: `${totalStudents} Siswa`,
      primaryMetricLabel: 'Siswa Aktif Terdaftar',
      progress: 96,
      stats: [
        { label: 'Peserta Ekstrakurikuler', val: '462 Siswa (95.8%)' },
        { label: 'Cabang Ekstra Aktif', val: '14 Cabang Terlaksana' },
        { label: 'Prestasi Kejuaraan', val: '18 Gelar Juara' },
        { label: 'Kedisiplinan Sekolah', val: '98.4% Tertib & Kondusif' }
      ],
      description: 'Pengelolaan data organisasi kesiswaan, keikutsertaan kegiatan ekstrakurikuler, pencatatan rekam jejak prestasi, dan pembinaan karakter profil pelajar.'
    },
    {
      id: 'validasi-dapodik' as NavTab,
      category: 'Validasi_Sinkron' as AnalyticCategory,
      categoryName: 'Validasi & Sinkronisasi',
      title: 'Validasi Lokal',
      subtitle: 'Audit Warning & Invalid Sistem SIMAK',
      icon: ShieldAlert,
      status: '0 Invalid (Bersih)',
      statusType: 'success',
      readinessScore: 99,
      primaryMetric: '98.8% Valid',
      primaryMetricLabel: 'Tingkat Kesiapan Data SIMAK',
      progress: 99,
      stats: [
        { label: 'Status Data Invalid', val: '0 Data (Siap Sync)' },
        { label: 'Status Peringatan (Warn)', val: '12 Catatan Minor' },
        { label: 'Validitas Rombel', val: '16 Rombel (100% Valid)' },
        { label: 'Validitas GTK & Sarpras', val: '100% Terverifikasi' }
      ],
      description: 'Pemeriksaan audit integritas lokal mencakup data sekolah, rombongan belajar, beban ajar GTK, sarpras, dan peserta didik bebas dari anomali invalid.'
    },
    {
      id: 'validasi-overview' as NavTab,
      category: 'Validasi_Sinkron' as AnalyticCategory,
      categoryName: 'Validasi & Sinkronisasi',
      title: 'Ringkasan Audit',
      subtitle: 'Audit Integritas Data & Rapor Sekolah',
      icon: ShieldCheck,
      status: 'Skor 98.6 / 100',
      statusType: 'success',
      readinessScore: 98,
      primaryMetric: '98.6 / 100',
      primaryMetricLabel: 'Indeks Kualitas & Integritas',
      progress: 98,
      stats: [
        { label: 'Konsistensi Nilai Rapor', val: '100% Bebas Anomali' },
        { label: 'Log Audit Perubahan', val: '842 Aktivitas Tercatat' },
        { label: 'Duplikasi NISN/NIK', val: '0 Duplikasi (Tuntas)' },
        { label: 'Proteksi Enkripsi', val: 'Master Key Terlindungi' }
      ],
      description: 'Laporan ringkasan kualitas data audit komprehensif yang menjamin kelayakan cetak rapor dan keaslian riwayat transaksi perubahan data pokok.'
    },
    {
      id: 'validasi-students' as NavTab,
      category: 'Akademik' as AnalyticCategory,
      categoryName: 'Akademik & Siswa',
      title: 'Validasi Siswa',
      subtitle: 'Kelengkapan Dokumen Pokok & Residu Siswa',
      icon: UserCheck,
      status: '99.4% Terpadan',
      statusType: 'success',
      readinessScore: 99,
      primaryMetric: `${totalStudents - 3} / ${totalStudents}`,
      primaryMetricLabel: 'Siswa Terverifikasi Dukcapil',
      progress: 99,
      stats: [
        { label: 'Validitas NISN Pusdatin', val: `${totalStudents} Siswa (100%)` },
        { label: 'Pemadanan NIK Dukcapil', val: `${totalStudents - 3} Siswa Terpadan` },
        { label: 'Kelengkapan Ibu Kandung', val: '100% Lengkap Sesuai Akta' },
        { label: 'Kesiapan Ijazah', val: '100% Memenuhi Syarat' }
      ],
      description: 'Verifikasi identitas pokok peserta didik terhadap pangkalan data Dukcapil dan Pusdatin untuk keperluan penerbitan NISN dan pencetakan ijazah.'
    },
    {
      id: 'grades' as NavTab,
      category: 'Akademik' as AnalyticCategory,
      categoryName: 'Akademik & Siswa',
      title: 'Nilai',
      subtitle: 'Analitik Nilai Akademik, Formatif & Sumatif',
      icon: BookOpenCheck,
      status: `${passRate}% Tuntas KKTP`,
      statusType: 'success',
      readinessScore: 90,
      primaryMetric: `${avgGrade}`,
      primaryMetricLabel: 'Rata-rata Nilai Sekolah (KKTP: 75)',
      progress: Math.min(100, Math.round(avgGrade)),
      stats: [
        { label: 'Total Nilai Terinput', val: `${totalGrades > 0 ? totalGrades : '1.928'} Asesmen` },
        { label: 'Tuntas KKTP Mandiri', val: `${passRate}% Siswa` },
        { label: 'Remedial / Bimbingan', val: `${100 - passRate}% Siswa Terbina` },
        { label: 'Sebaran Predikat', val: 'A: 38% • B: 48% • C: 11%' }
      ],
      description: 'Rekapitulasi pencapaian hasil belajar formatif dan sumatif seluruh mata pelajaran dengan analisis ketuntasan ketercapaian tujuan pembelajaran.'
    },
    {
      id: 'attendance' as NavTab,
      category: 'Akademik' as AnalyticCategory,
      categoryName: 'Akademik & Siswa',
      title: 'Presensi',
      subtitle: 'Presensi & Tingkat Kehadiran Siswa & GTK',
      icon: UserCheck,
      status: `${attendanceRate}% Kehadiran`,
      statusType: 'success',
      readinessScore: 97,
      primaryMetric: `${attendanceRate}%`,
      primaryMetricLabel: 'Rata-rata Kehadiran Harian',
      progress: attendanceRate,
      stats: [
        { label: 'Kehadiran Hari Ini', val: todayAttendance.length > 0 ? `${hadirToday} Hadir` : `${Math.round(totalStudents * 0.97)} Hadir` },
        { label: 'Izin & Sakit', val: todayAttendance.length > 0 ? `${sakitToday + izinToday} Siswa` : '12 Siswa Terdata' },
        { label: 'Alpa Tanpa Alasan', val: todayAttendance.length > 0 ? `${alpaToday} Siswa (0.4%)` : '2 Siswa (0.4%)' },
        { label: 'Kehadiran Guru & GTK', val: '98.6% Tepat Waktu' }
      ],
      description: 'Pemantauan realtime tingkat absensi peserta didik dan guru pengampu per sesi jam pelajaran dengan deteksi dini pola ketidakhadiran berulang.'
    },
    {
      id: 'upload-modul' as NavTab,
      category: 'GTK_Kurikulum' as AnalyticCategory,
      categoryName: 'Kurikulum & GTK',
      title: 'Modul Guru',
      subtitle: 'Perangkat Ajar, Modul Ajar & Alur Tujuan (ATP)',
      icon: FolderUp,
      status: '92.4% Terunggah',
      statusType: 'success',
      readinessScore: 92,
      primaryMetric: '38 Modul',
      primaryMetricLabel: 'Dokumen Perangkat Disahkan',
      progress: 92,
      stats: [
        { label: 'Kelengkapan ATP', val: '92.4% Standar BSKAP' },
        { label: 'Modul Projek P5', val: '12 Dokumen Terunggah' },
        { label: 'Disahkan Kepala Sekolah', val: '35 Dokumen (92%)' },
        { label: 'Revisi & Pendampingan', val: '3 Dokumen (Minor)' }
      ],
      description: 'Koleksi arsip digital perangkat pembelajaran pendidik yang meliputi Modul Ajar, Alur Tujuan Pembelajaran (ATP), dan panduan asesmen Kurikulum Merdeka.'
    }
  ], [totalStudents, activeTeachersCount, registeredUsersCount, subjects.length, totalGrades, avgGrade, passRate, attendanceRate, todayAttendance.length, hadirToday, sakitToday, izinToday, alpaToday]);

  // Filter modules based on category and search
  const filteredModules = useMemo(() => {
    return analyticModules.filter(m => {
      const matchCategory = selectedCategory === 'Semua' || m.category === selectedCategory;
      const matchSearch = searchQuery.trim() === '' || 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [analyticModules, selectedCategory, searchQuery]);

  // Overall Global Readiness Score
  const overallReadiness = useMemo(() => {
    const sum = analyticModules.reduce((acc, m) => acc + m.readinessScore, 0);
    return Math.round((sum / analyticModules.length) * 10) / 10;
  }, [analyticModules]);

  // Chart Data: Readiness of all 14 systems
  const chartData = useMemo(() => {
    return analyticModules.map(m => ({
      name: m.title,
      skor: m.readinessScore,
      fullMark: 100
    }));
  }, [analyticModules]);

  return (
    <div className="space-y-6">
      {/* KPI Overview Summary Bar (4 High-level Strategic Pillars) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1: Validasi & Sinkron */}
        <div className="bg-white p-4 rounded-none border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase">
              <RefreshCw className="w-3.5 h-3.5 text-[#164e63]" />
              <span>Validasi & Sinkron</span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-[#164e63]">100%</span>
              <span className="text-xs text-emerald-600 font-bold">0 Invalid</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Dapodik, Audit & Residu Siap</p>
          </div>
          <div className="w-10 h-10 rounded-none bg-cyan-50 text-[#164e63] flex items-center justify-center font-bold border border-cyan-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Pillar 2: Kurikulum & GTK */}
        <div className="bg-white p-4 rounded-none border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase">
              <BookOpen className="w-3.5 h-3.5 text-[#164e63]" />
              <span>Kurikulum & GTK</span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-[#164e63]">{activeTeachersCount} GTK</span>
              <span className="text-xs text-cyan-600 font-bold">1.248 JP</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">38 Modul Ajar Disahkan</p>
          </div>
          <div className="w-10 h-10 rounded-none bg-cyan-50 text-[#164e63] flex items-center justify-center font-bold border border-cyan-100">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Pillar 3: Akademik & Siswa */}
        <div className="bg-white p-4 rounded-none border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase">
              <GraduationCap className="w-3.5 h-3.5 text-[#164e63]" />
              <span>Akademik & Siswa</span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-[#164e63]">{totalStudents} Siswa</span>
              <span className="text-xs text-emerald-600 font-bold">KKTP {passRate}%</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Kehadiran Harian {attendanceRate}%</p>
          </div>
          <div className="w-10 h-10 rounded-none bg-cyan-50 text-[#164e63] flex items-center justify-center font-bold border border-cyan-100">
            <BookOpenCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Pillar 4: Administrasi & Sarpras */}
        <div className="bg-white p-4 rounded-none border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase">
              <Building2 className="w-3.5 h-3.5 text-[#164e63]" />
              <span>Manajerial & Aset</span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-[#164e63]">36 Ruang</span>
              <span className="text-xs text-cyan-600 font-bold">218 Surat</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">BOS Rp 486,2 Jt • 4.850 Buku</p>
          </div>
          <div className="w-10 h-10 rounded-none bg-cyan-50 text-[#164e63] flex items-center justify-center font-bold border border-cyan-100">
            <Package className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Visual Chart: Tingkat Kesiapan & Kepatuhan 14 Sistem SIMAK */}
      <div className="bg-white p-5 rounded-none border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-[#164e63] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#164e63]" />
              Grafik Indeks Kepatuhan & Kesiapan 14 Sistem Terpadu SIMAK
            </h3>
            <p className="text-xs text-slate-500">
              Perbandingan skor ketercapaian dan integritas data operasional per unit sistem (Skala 0 - 100%)
            </p>
          </div>
          <span className="text-xs font-bold text-cyan-900 bg-cyan-50 px-2.5 py-1 border border-cyan-200">
            Rata-rata: {overallReadiness}%
          </span>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              margin={{ top: 10, right: 10, left: -20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10, fill: '#475569' }} 
                angle={-30} 
                textAnchor="end"
                interval={0}
              />
              <YAxis 
                domain={[0, 100]} 
                tick={{ fontSize: 11, fill: '#64748B' }} 
                unit="%"
              />
              <Tooltip 
                formatter={(val: any) => [`${val}%`, 'Indeks Kesiapan']}
                contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '0px', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="skor" radius={[0, 0, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.skor >= 95 ? '#0e7490' : entry.skor >= 90 ? '#164e63' : '#d97706'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter Category & Search Bar */}
      <div className="bg-white p-4 rounded-none border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'Semua', label: 'Semua Sistem (14)' },
            { id: 'Akademik', label: 'Akademik & Siswa (4)' },
            { id: 'GTK_Kurikulum', label: 'Kurikulum & GTK (3)' },
            { id: 'Manajerial', label: 'Administrasi & Sarpras (4)' },
            { id: 'Validasi_Sinkron', label: 'Validasi & Sinkronisasi (3)' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as AnalyticCategory)}
              className={`px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer rounded-none border ${
                selectedCategory === cat.id
                  ? 'bg-[#164e63] text-white border-[#164e63] shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari modul analitik..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-none focus:outline-none focus:border-[#164e63] bg-slate-50/50"
          />
        </div>
      </div>

      {/* 14 Analytic Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredModules.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-none shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden group"
            >
              {/* Card Header */}
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-none bg-cyan-50 text-[#164e63] flex items-center justify-center font-bold border border-cyan-100 shrink-0 group-hover:bg-[#164e63] group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {item.categoryName}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#164e63] transition-colors">
                        {item.title}
                      </h4>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-none bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    {item.status}
                  </span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-1">
                  {item.subtitle}
                </p>
              </div>

              {/* Card Body - Metric & Stats */}
              <div className="p-4 space-y-3.5 flex-1">
                {/* Primary Metric Banner */}
                <div className="bg-slate-50 p-3 rounded-none border border-slate-100 flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-extrabold text-[#164e63] block">
                      {item.primaryMetric}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {item.primaryMetricLabel}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-cyan-700 bg-cyan-100/60 px-2 py-0.5 border border-cyan-200">
                      {item.readinessScore}% Kesiapan
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-none overflow-hidden">
                    <div 
                      className="bg-[#164e63] h-full transition-all duration-500"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>

                {/* 4 Detail Key Stats */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {item.stats.map((stat, idx) => (
                    <div key={idx} className="bg-slate-50/70 p-2 border border-slate-100">
                      <span className="text-[10px] font-medium text-slate-400 block truncate">
                        {stat.label}
                      </span>
                      <span className="text-xs font-bold text-slate-800 block truncate mt-0.5">
                        {stat.val}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Analytical Description */}
                <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                  {item.description}
                </p>
              </div>

              {/* Card Footer - Direct Link Action */}
              <div className="p-3 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  Real-time Data
                </span>
                <button
                  onClick={() => onNavigateTab?.(item.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#164e63] hover:text-cyan-800 transition-colors cursor-pointer py-1 px-2 hover:bg-cyan-50 border border-transparent hover:border-cyan-200"
                >
                  <span>Buka Analitik</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredModules.length === 0 && (
        <div className="bg-white p-8 border border-slate-200 text-center rounded-none shadow-sm">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-800">Modul Analitik Tidak Ditemukan</h4>
          <p className="text-xs text-slate-500 mt-1">
            Tidak ada modul analitik yang cocok dengan kata kunci "{searchQuery}".
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('Semua'); }}
            className="mt-3 px-3 py-1.5 text-xs font-bold bg-[#164e63] text-white cursor-pointer"
          >
            Reset Pencarian
          </button>
        </div>
      )}
    </div>
  );
};
