import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  GraduationCap, 
  LogOut, 
  LogIn, 
  CheckCircle2, 
  Sparkles,
  Search,
  X,
  BookOpen,
  Building2,
  Settings,
  BarChart3,
  Users,
  Wallet,
  Clock,
  CalendarDays,
  FolderUp,
  UserCheck,
  Trophy,
  BookOpenCheck,
  Award,
  Database,
  RefreshCw,
  ChevronRight,
  SearchX,
  Command,
  Package,
  Library,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Calendar,
  FileCheck,
  AlertOctagon,
  Menu
} from 'lucide-react';
import { TeacherProfile, UserAccount } from '../types';
import { useTeachingSchedules } from '../lib/teachingScheduleService';
import { TutWuriHandayaniLogo } from './TutWuriHandayaniLogo';
import { NavTab } from './SidebarNavigation';

interface SearchMenuItem {
  id: NavTab;
  title: string;
  subtitle: string;
  category: 'Akademik' | 'Administrasi' | 'Sistem Terpadu' | 'Siswa & Ekstra' | 'Lainnya';
  keywords: string[];
  icon: React.ComponentType<{ className?: string }>;
  studentAccessible?: boolean;
}

const MENU_CATALOG: SearchMenuItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard & Analitik',
    subtitle: 'Ringkasan performa akademik & statistik',
    category: 'Akademik',
    keywords: ['dashboard', 'beranda', 'home', 'analitik', 'statistik', 'ringkasan', 'grafik', 'performa'],
    icon: BarChart3,
    studentAccessible: true
  },
  {
    id: 'attendance',
    title: 'Presensi Siswa',
    subtitle: 'Kehadiran, absensi harian & rekap presensi',
    category: 'Akademik',
    keywords: ['presensi', 'absen', 'kehadiran', 'absensi', 'hadir', 'sakit', 'izin', 'alpa', 'bolos', 'siswa'],
    icon: UserCheck,
    studentAccessible: true
  },
  {
    id: 'journal',
    title: 'Jurnal Guru',
    subtitle: 'Agenda KBM harian & catatan mengajar guru',
    category: 'Administrasi',
    keywords: ['jurnal', 'agenda', 'kbm', 'catatan', 'materi', 'harian', 'mengajar', 'guru'],
    icon: CalendarDays,
    studentAccessible: false
  },
  {
    id: 'grades',
    title: 'Kelola Nilai',
    subtitle: 'Asesmen formatif, sumatif (STS/SAS) & rapor',
    category: 'Akademik',
    keywords: ['nilai', 'asesmen', 'formatif', 'sumatif', 'sts', 'sas', 'rapor', 'leger', 'kktp', 'bobot', 'rekap nilai'],
    icon: BookOpenCheck,
    studentAccessible: true
  },
  {
    id: 'extra-tasks',
    title: 'Nilai Tugas Tambahan',
    subtitle: 'Remedial, pengayaan & proyek mandiri',
    category: 'Akademik',
    keywords: ['tugas', 'tambahan', 'remedial', 'pengayaan', 'proyek', 'portofolio', 'pekerjaan rumah', 'pr'],
    icon: Award,
    studentAccessible: true
  },
  {
    id: 'students',
    title: 'Data Siswa',
    subtitle: 'Rombel, biodata NIS/NISN & rekap leger',
    category: 'Siswa & Ekstra',
    keywords: ['siswa', 'data siswa', 'murid', 'peserta didik', 'biodata', 'nis', 'nisn', 'rombel', 'kelas', 'wali'],
    icon: GraduationCap,
    studentAccessible: false
  },
  {
    id: 'schedule',
    title: 'Jadwal Mengajar',
    subtitle: 'Agenda tatap muka mingguan & jam pelajaran',
    category: 'Administrasi',
    keywords: ['jadwal', 'mengajar', 'jam pelajaran', 'jjm', 'tatap muka', 'hari', 'kbm', 'waktu'],
    icon: Clock,
    studentAccessible: true
  },
  {
    id: 'upload-modul',
    title: 'Upload Modul & ATP',
    subtitle: 'Perangkat ajar, ATP, CP & modul pembelajaran',
    category: 'Administrasi',
    keywords: ['modul', 'atp', 'cp', 'perangkat ajar', 'rpp', 'materi', 'bahan ajar', 'upload', 'dokumen', 'kurikulum merdeka'],
    icon: FolderUp,
    studentAccessible: true
  },
  {
    id: 'extracurricular',
    title: 'Presensi Ekstrakurikuler',
    subtitle: 'Kegiatan ekskul, pramuka & pembinaan bakat',
    category: 'Siswa & Ekstra',
    keywords: ['ekstra', 'ekstrakurikuler', 'ekskul', 'pramuka', 'osis', 'olahraga', 'seni', 'pembinaan', 'presensi ekstra'],
    icon: Trophy,
    studentAccessible: false
  },
  {
    id: 'system-kurikulum',
    title: 'Sistem Kurikulum',
    subtitle: 'Kurikulum Merdeka, CP, TP, ATP & struktur JJM',
    category: 'Sistem Terpadu',
    keywords: ['kurikulum', 'merdeka', 'ksp', 'cp', 'tp', 'atp', 'jjm', 'beban ajar', 'distribusi jam'],
    icon: BookOpen,
    studentAccessible: false
  },
  {
    id: 'system-guru',
    title: 'Sistem Guru',
    subtitle: 'Manajemen pendidik & administrasi guru terpadu',
    category: 'Sistem Terpadu',
    keywords: ['guru', 'sistem guru', 'pendidik', 'pengajar', 'administrasi guru', 'kepegawaian', 'sertifikasi'],
    icon: Users,
    studentAccessible: false
  },
  {
    id: 'system-tu',
    title: 'Sistem Tata Usaha (TU)',
    subtitle: 'Persuratan, agenda surat & arsip administrasi TU',
    category: 'Sistem Terpadu',
    keywords: ['tu', 'tata usaha', 'surat', 'persuratan', 'disposisi', 'arsip', 'administrasi', 'staf'],
    icon: Building2,
    studentAccessible: false
  },
  {
    id: 'system-sarpras',
    title: 'Sistem Sarpras',
    subtitle: 'Inventarisasi aset, KIR ruang, peminjaman & pemeliharaan',
    category: 'Sistem Terpadu',
    keywords: ['sarpras', 'sarana', 'prasarana', 'inventaris', 'aset', 'kir', 'ruang', 'gedung', 'peminjaman', 'pemeliharaan', 'perbaikan', 'fasilitas'],
    icon: Package,
    studentAccessible: false
  },
  {
    id: 'system-keuangan',
    title: 'Sistem Keuangan',
    subtitle: 'Anggaran BOS, RAPBS, kas sekolah & SPP',
    category: 'Sistem Terpadu',
    keywords: ['keuangan', 'dana bos', 'rapbs', 'anggaran', 'kas', 'pengeluaran', 'pemasukan', 'spp', 'buku kas'],
    icon: Wallet,
    studentAccessible: false
  },
  {
    id: 'system-kesiswaan',
    title: 'Sistem Kesiswaan & LMS',
    subtitle: 'Portal tugas, materi & pembelajaran mandiri siswa',
    category: 'Sistem Terpadu',
    keywords: ['kesiswaan', 'lms', 'portal siswa', 'tugas siswa', 'materi siswa', 'belajar mandiri', 'ujian'],
    icon: GraduationCap,
    studentAccessible: true
  },
  {
    id: 'system-perpustakaan',
    title: 'Sistem Perpustakaan',
    subtitle: 'Katalog buku, sirkulasi peminjaman & literasi digital',
    category: 'Sistem Terpadu',
    keywords: ['perpustakaan', 'perpus', 'buku', 'katalog', 'peminjaman', 'pengembalian', 'sirkulasi', 'isbn', 'ddc', 'rak', 'buku teks', 'e-book', 'literasi', 'buku tamu'],
    icon: Library,
    studentAccessible: true
  },
  {
    id: 'sync',
    title: 'Sinkronisasi Siswa',
    subtitle: 'Kenaikan kelas & pemindahan rombel data',
    category: 'Administrasi',
    keywords: ['sinkronisasi', 'sync', 'kenaikan', 'naik kelas', 'pindah rombel', 'mutasi', 'kelulusan'],
    icon: RefreshCw,
    studentAccessible: false
  },
  {
    id: 'master-data',
    title: 'Monitoring Akun (Master Data)',
    subtitle: 'Master data akun SIMAK & hak akses pengguna',
    category: 'Administrasi',
    keywords: ['master', 'master data', 'akun', 'user', 'pengguna', 'aktivasi', 'role', 'hak akses', 'password'],
    icon: Database,
    studentAccessible: false
  },
  {
    id: 'validasi',
    title: 'Validasi Data & Integritas SIMAK',
    subtitle: 'Validasi kelayakan NISN, ketuntasan KKTP nilai, presensi & rapor',
    category: 'Administrasi',
    keywords: ['validasi', 'verifikasi', 'audit', 'integritas', 'kktp', 'nisn', 'berita acara', 'bava', 'pengesahan', 'rapor'],
    icon: ShieldCheck,
    studentAccessible: false
  },
  {
    id: 'validasi-dapodik',
    title: 'Validasi Lokal',
    subtitle: 'Audit Warning & Invalid',
    category: 'Administrasi',
    keywords: ['validasi', 'validasi lokal', 'laporan validasi', 'dapodik', 'warning', 'invalid', 'sinkron', 'peserta didik', 'guru', 'rombongan belajar'],
    icon: ShieldAlert,
    studentAccessible: false
  },
  {
    id: 'validasi-overview',
    title: 'Ringkasan Audit SIMAK',
    subtitle: 'Audit Integritas Data & Rapor',
    category: 'Administrasi',
    keywords: ['ringkasan audit simak', 'audit', 'integritas', 'kktp', 'rekap'],
    icon: ShieldCheck,
    studentAccessible: false
  },
  {
    id: 'validasi-students',
    title: 'Validasi Siswa',
    subtitle: 'Kelengkapan NISN & Profil Siswa',
    category: 'Administrasi',
    keywords: ['validasi siswa', 'nisn', 'nik', 'profil siswa'],
    icon: Users,
    studentAccessible: false
  },
  {
    id: 'validasi-grades',
    title: 'Validasi Nilai',
    subtitle: 'Ketuntasan KKTP & Nilai Akhir',
    category: 'Administrasi',
    keywords: ['validasi nilai', 'kktp', 'formatif', 'sumatif', 'bobot'],
    icon: Award,
    studentAccessible: false
  },
  {
    id: 'validasi-attendance',
    title: 'Validasi Presensi',
    subtitle: 'Presensi Minimal & Rekap Kehadiran',
    category: 'Administrasi',
    keywords: ['validasi presensi', 'kehadiran', 'alfa', 'izin', 'sakit'],
    icon: Calendar,
    studentAccessible: false
  },
  {
    id: 'validasi-modules',
    title: 'Validasi Modul Guru',
    subtitle: 'Kelengkapan Modul Ajar & ATP',
    category: 'Administrasi',
    keywords: ['validasi modul', 'atp', 'perangkat ajar', 'rpp'],
    icon: FileText,
    studentAccessible: false
  },
  {
    id: 'validasi-report',
    title: 'Berita Acara',
    subtitle: 'Dokumen SPTJM & Berita Acara (BAVA)',
    category: 'Administrasi',
    keywords: ['berita acara', 'bava', 'sptjm', 'pengesahan', 'kepala sekolah'],
    icon: FileCheck,
    studentAccessible: false
  },
  {
    id: 'residu',
    title: 'Residu Data',
    subtitle: 'Monitoring & penyelesaian residu data pokok & verval',
    category: 'Administrasi',
    keywords: ['residu', 'residu data', 'verval', 'nik', 'nisn ganda', 'duplikasi', 'pemadanan'],
    icon: AlertOctagon,
    studentAccessible: false
  },
  {
    id: 'ai-assistant',
    title: 'Asisten AI Guru (Gemini)',
    subtitle: 'Generator modul ajar, rubrik asesmen & soal HOTS',
    category: 'Lainnya',
    keywords: ['ai', 'asisten ai', 'gemini', 'generator', 'buat soal', 'hots', 'modul otomatis', 'bantuan ai'],
    icon: Sparkles,
    studentAccessible: false
  },
  {
    id: 'settings',
    title: 'Pengaturan Sistem',
    subtitle: 'Identitas sekolah, semester, kurikulum & backup',
    category: 'Lainnya',
    keywords: ['pengaturan', 'settings', 'sekolah', 'profil', 'npsn', 'semester', 'tahun ajaran', 'kunci data', 'backup'],
    icon: Settings,
    studentAccessible: true
  }
];

interface NavbarProps {
  teacher?: TeacherProfile;
  currentUser?: UserAccount | null;
  classList: string[];
  selectedClass: string;
  onSelectClass: (cls: string) => void;
  onLogout?: () => void;
  onOpenLogin?: () => void;
  onOpenProfilePrompt?: () => void;
  showClassSelector?: boolean;
  activeTab?: string;
  onTabChange?: (tab: any) => void;
  isMasterUser?: boolean;
  isAdmin?: boolean;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  teacher, 
  currentUser,
  classList, 
  selectedClass, 
  onSelectClass,
  onLogout,
  onOpenLogin,
  onOpenProfilePrompt,
  showClassSelector = true,
  activeTab = 'dashboard',
  onTabChange,
  isMasterUser = false,
  isAdmin = false,
  onToggleSidebar,
  isSidebarOpen = true
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isMaster = isMasterUser || teacher?.id === 'PROF-ADMIN';
  const isAdministrator = Boolean(
    isAdmin || 
    isMasterUser || 
    isMaster || 
    (currentUser?.role && (
      currentUser.role.toLowerCase().includes('admin') ||
      currentUser.role.toLowerCase().includes('kepala') ||
      currentUser.role.toLowerCase().includes('master')
    )) ||
    (currentUser?.email && (
      currentUser.email.toLowerCase().includes('admin') ||
      currentUser.email.toLowerCase().includes('master')
    )) ||
    activeTab === 'master-data' ||
    activeTab === 'maintenance' ||
    activeTab === 'system-validation'
  );

  // Live active teaching schedule data from Teaching Schedule menu
  const {
    activeClasses,
    activeClassText
  } = useTeachingSchedules({
    teacher,
    currentUser,
    isMasterUser
  });

  const isTuRole = currentUser?.role ? (currentUser.role.toLowerCase().includes('tu') || currentUser.role.toLowerCase().includes('tata usaha')) : false;
  const isTuPage = activeTab === 'system-tu' || (isTuRole && activeTab === 'settings');

  const isSarprasRole = currentUser?.role ? (currentUser.role.toLowerCase().includes('sarpras') || currentUser.role.toLowerCase().includes('sarana')) : false;
  const isSarprasPage = activeTab === 'system-sarpras' || (isSarprasRole && activeTab === 'settings');

  const isPerpustakaanRole = currentUser?.role ? (currentUser.role.toLowerCase().includes('perpustakaan') || currentUser.role.toLowerCase().includes('pustaka') || currentUser.role.toLowerCase().includes('pustakawan')) : false;
  const isPerpustakaanPage = activeTab === 'system-perpustakaan' || (isPerpustakaanRole && activeTab === 'settings');

  const isKeuanganPage = activeTab === 'system-keuangan';

  const isKurikulumRole = currentUser?.role ? currentUser.role.toLowerCase().includes('kurikulum') : false;
  const isKurikulumPage = activeTab === 'system-kurikulum' || (isKurikulumRole && activeTab === 'settings');
  const isStudentUser = currentUser?.role ? currentUser.role.toLowerCase().includes('siswa') : false;
  const isStudentPage = activeTab === 'system-kesiswaan' || isStudentUser;

  // Filter menu catalog based on role & search query
  const filteredMenus = useMemo(() => {
    let list = MENU_CATALOG;
    if (isStudentUser) {
      list = list.filter(m => m.studentAccessible);
    }
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return list;
    }
    return list.filter(item => {
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.keywords.some(k => k.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, isStudentUser]);

  // Handle outside click to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    if (isAdministrator) return;
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isAdministrator]);

  // Keyboard navigation within search results
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isSearchOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setIsSearchOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (filteredMenus.length > 0 ? (prev + 1) % filteredMenus.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (filteredMenus.length > 0 ? (prev - 1 + filteredMenus.length) % filteredMenus.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredMenus.length > 0 && filteredMenus[selectedIndex]) {
        handleSelectMenu(filteredMenus[selectedIndex].id);
      }
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
      searchInputRef.current?.blur();
    }
  };

  const handleSelectMenu = (tabId: NavTab) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
    setSearchQuery('');
    setIsSearchOpen(false);
    searchInputRef.current?.blur();
  };

  return (
    <header className="bg-gradient-to-r from-[#3e4854] via-[#35526e] to-[#2f618e] border-b border-[#234d72] sticky top-0 z-30 shadow-sm pt-[env(safe-area-inset-top,0px)]">
      {/* Main Header Content - Compact slim height */}
      <div className="px-3 md:px-5 py-1 md:py-1.5 w-full flex items-center justify-between gap-2 md:gap-3">
        
        {/* Left & Center: Emblem Title + School Info */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
          {/* School Emblem Title & App Brand */}
          <div className="flex items-center space-x-2 md:space-x-2.5 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white rounded-none shadow-xs shrink-0 flex items-center justify-center p-0.5 sm:p-1 border border-white/25">
              <TutWuriHandayaniLogo className="w-full h-full" />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <h1 className="text-xs sm:text-sm md:text-base font-black text-white uppercase tracking-wider leading-none">
                {isStudentUser ? 'Learning Management System' : isTuPage ? 'ADMINISTRASI TATA USAHA' : isSarprasPage ? 'SARANA & PRASARANA' : isPerpustakaanPage ? 'PERPUSTAKAAN SEKOLAH' : isKurikulumPage ? 'KURIKULUM' : 'SIMAK MERDEKA'}
              </h1>
              {!isStudentUser && !isTuPage && !isKurikulumPage && !isSarprasPage && !isPerpustakaanPage && (
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="bg-amber-400 text-slate-950 font-black text-[8.5px] sm:text-[9.5px] px-1 py-0.2 rounded-none shadow-xs shrink-0 tracking-wider leading-none">
                    V.3.8.1
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tombol Garis 3 (Menu Hamburger) & School Name */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 ml-1 sm:ml-2 md:ml-3">
            <motion.button
              type="button"
              onClick={onToggleSidebar}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              className={`p-1 sm:p-1.5 text-white/90 hover:text-white ${
                isSidebarOpen 
                  ? 'bg-white/20 text-white border-white/40 shadow-inner' 
                  : 'bg-white/10 hover:bg-white/20 active:bg-white/30 border-white/25'
              } rounded-none transition-colors shrink-0 flex items-center justify-center border shadow-2xs cursor-pointer`}
              title={isSidebarOpen ? "Tutup Menu Navigasi (Garis 3)" : "Buka Menu Navigasi (Garis 3)"}
              aria-label="Menu Navigasi"
            >
              <motion.div
                animate={{ rotate: isSidebarOpen ? 90 : 0 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
                className="flex items-center justify-center"
              >
                <Menu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </motion.div>
            </motion.button>
            <p className="text-[11px] sm:text-xs md:text-sm text-white font-bold tracking-tight truncate leading-tight">
              {teacher?.schoolName || currentUser?.schoolName || 'SMA ISLAM DIPONEGORO WAGIR'}
              {!isStudentPage && (
                <span className="inline text-slate-200 font-semibold">
                  {' - '}NPSN: {teacher?.npsn || '20517834'} - Semester {teacher?.semester || 'Ganjil'} {teacher?.academicYear || '2026/2027'}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Mobile Action Buttons (Logout on HP) */}
        <div className="md:hidden flex items-center gap-1.5 shrink-0">
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center space-x-1 bg-[#d9534f] hover:bg-[#c9302c] active:bg-[#ac2925] text-white border border-[#c9302c] px-2 py-1 rounded-none text-[11px] font-bold transition-all shrink-0 cursor-pointer shadow-xs"
              title="Keluar dari Aplikasi"
            >
              <LogOut className="w-3 h-3 text-white" />
              <span className="text-white font-bold">Keluar</span>
            </button>
          )}
        </div>

        {/* Right Side: Filter Kelas & Kolom Cari Menu */}
        <div className="flex items-center justify-end gap-2 md:gap-2.5 shrink-0 ml-auto">
          {/* Status Kelas Aktif - Hanya untuk guru non-admin dan hanya jika ada jadwal aktif */}
          {!isAdministrator && !isKurikulumPage && !isTuPage && !isStudentPage && activeClasses.length > 0 && (
            <div className="hidden xl:flex items-center gap-1.5 shrink-0 bg-[#1d3c58]/85 border border-[#376189] px-2 py-0.5">
              <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-emerald-400"></div>
              <p className="text-[10px] font-bold truncate text-white">
                Kelas: {activeClassText}
              </p>
            </div>
          )}

          {/* Filter Kelas on Laptop/Desktop */}
          {showClassSelector && (
            <div className="hidden sm:flex items-center justify-end gap-1.5 shrink-0">
              <span className="text-slate-200 font-bold text-[10px] whitespace-nowrap">Filter Kelas:</span>
              <select 
                value={selectedClass} 
                onChange={(e) => onSelectClass(e.target.value)}
                className="bg-[#1d3c58] text-white font-extrabold px-2 py-0.5 rounded-none border border-[#376189] focus:outline-none focus:border-white cursor-pointer shadow-2xs text-xs"
              >
                {classList.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          )}

          {/* Kolom Cari Menu di Pojok Kanan Atas - Disembunyikan pada halaman Administrator */}
          {!isAdministrator && (
            <div ref={searchContainerRef} className="relative w-36 sm:w-48 md:w-56 lg:w-64 xl:w-72 shrink-0 z-40">
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-300">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                    setSelectedIndex(0);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  onKeyDown={handleKeyDown}
                  placeholder="Cari menu... (Ctrl+K)"
                  className="w-full pl-8 pr-12 py-1 bg-[#1d3c58]/80 hover:bg-[#1d3c58] focus:bg-[#162d42] text-white placeholder:text-slate-300/70 border border-[#376189] focus:border-white text-xs rounded-none focus:outline-none focus:ring-1 focus:ring-white shadow-inner transition-all"
                />
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedIndex(0);
                        searchInputRef.current?.focus();
                      }}
                      className="text-slate-300 hover:text-white p-0.5 rounded-none transition-colors cursor-pointer"
                      title="Hapus pencarian"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  ) : (
                    <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[9px] bg-[#162d42] text-slate-300 border border-[#376189] px-1 py-0.2 rounded-none font-mono select-none">
                      <Command className="w-2.5 h-2.5" /> K
                    </kbd>
                  )}
                </div>
              </div>

              {/* Search Results Dropdown */}
              {isSearchOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-[320px] sm:w-[420px] md:w-[480px] max-w-[92vw] bg-white text-slate-800 rounded-none shadow-2xl border border-sky-900/20 max-h-[360px] sm:max-h-[420px] overflow-y-auto z-50 divide-y divide-slate-100">
                  {/* Header result info */}
                  <div className="px-3 py-2 bg-slate-50 flex items-center justify-between text-[11px] font-semibold text-slate-500 border-b border-slate-200 sticky top-0 z-10">
                    <span className="flex items-center gap-1 text-[#164e63] font-bold">
                      <Search className="w-3 h-3 text-[#164e63]" />
                      {searchQuery ? `Hasil Pencarian (${filteredMenus.length} Menu)` : 'Daftar Menu & Pintasan Cepat'}
                    </span>
                    <span className="text-[10px] text-slate-400 hidden sm:inline">
                      Gunakan ↑ ↓ dan Enter untuk memilih
                    </span>
                  </div>

                  {filteredMenus.length > 0 ? (
                    <div className="py-1">
                      {filteredMenus.map((item, idx) => {
                        const IconComp = item.icon;
                        const isSelected = idx === selectedIndex;
                        const isActiveTab = activeTab === item.id;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelectMenu(item.id)}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className={`w-full text-left px-3 py-2 flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                              isSelected 
                                ? 'bg-cyan-50/90 text-[#164e63]' 
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div className={`w-8 h-8 rounded-none flex items-center justify-center shrink-0 border ${
                                isActiveTab
                                  ? 'bg-cyan-900 text-white border-cyan-900'
                                  : isSelected
                                  ? 'bg-cyan-100 text-[#164e63] border-cyan-300'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}>
                                <IconComp className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-bold truncate ${isSelected ? 'text-[#164e63]' : 'text-slate-800'}`}>
                                    {item.title}
                                  </span>
                                  {isActiveTab && (
                                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-none border border-emerald-200 shrink-0">
                                      Aktif
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 truncate leading-tight mt-0.5">
                                  {item.subtitle}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-none border border-slate-200 hidden sm:inline-block">
                                {item.category}
                              </span>
                              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-[#164e63] translate-x-0.5' : 'text-slate-300'}`} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <SearchX className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700">
                        Tidak ada menu yang sesuai dengan "{searchQuery}"
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Coba kata kunci lain: presensi, nilai, jurnal, kurikulum, data siswa, keuangan, dll.
                      </p>
                    </div>
                  )}

                  {/* Quick tip footer */}
                  <div className="px-3 py-1.5 bg-slate-50 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-100">
                    <span>Tekan <kbd className="font-mono bg-white border border-slate-200 px-1 py-0.5">ESC</kbd> untuk menutup</span>
                    <span className="text-cyan-800 font-semibold cursor-pointer hover:underline" onClick={() => setIsSearchOpen(false)}>
                      Tutup Pencarian
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Mobile Only Filter Kelas */}
      {showClassSelector && (
        <div className="sm:hidden flex items-center justify-between gap-2 bg-[#075985]/90 px-3 py-1.5 border-t border-sky-300/40 w-full shrink-0">
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-sky-100 font-bold text-[11px]">Filter Kelas:</span>
            <select 
              value={selectedClass} 
              onChange={(e) => onSelectClass(e.target.value)}
              className="bg-[#034d75] text-white font-extrabold px-2 py-0.5 rounded-none border border-sky-300/60 focus:outline-none focus:border-sky-200 cursor-pointer shadow-2xs text-xs"
            >
              {classList.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
          <span className="text-[10px] text-sky-200/90 font-medium">
            T.A {teacher?.academicYear || '2026/2027'}
          </span>
        </div>
      )}
    </header>
  );
};
