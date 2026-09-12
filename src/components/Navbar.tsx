import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  GraduationCap, 
  LogOut, 
  ShieldCheck, 
  LogIn, 
  CheckCircle2, 
  Sparkles,
  Calendar,
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
  Layers
} from 'lucide-react';
import { TeacherProfile, UserAccount, TeachingScheduleItem } from '../types';
import { subscribeToSchedules } from '../lib/firebaseService';
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

const SUB_HEADER_MENUS: {
  id: NavTab;
  label: string;
  tooltip: string;
  icon: React.ComponentType<{ className?: string }>;
  studentAccessible?: boolean;
}[] = [
  {
    id: 'sync',
    label: 'Sinkronisasi',
    tooltip: 'Sinkronisasi Siswa, Kenaikan Kelas & Mutasi Rombel',
    icon: RefreshCw,
    studentAccessible: false
  },
  {
    id: 'master-data',
    label: 'Monitoring Akun',
    tooltip: 'Monitoring Master Akun & Manajemen Pengguna SIMAK',
    icon: Database,
    studentAccessible: false
  },
  {
    id: 'system-kurikulum',
    label: 'Kurikulum',
    tooltip: 'Sistem Informasi Kurikulum Merdeka',
    icon: BookOpen,
    studentAccessible: false
  },
  {
    id: 'system-guru',
    label: 'Guru',
    tooltip: 'Sistem Manajemen Pendidik & Tenaga Kependidikan',
    icon: Users,
    studentAccessible: false
  },
  {
    id: 'system-tu',
    label: 'TU',
    tooltip: 'Sistem Tata Usaha & Administrasi Persuratan',
    icon: Building2,
    studentAccessible: false
  },
  {
    id: 'system-sarpras',
    label: 'Sarpras',
    tooltip: 'Sistem Pengelolaan Sarana & Prasarana Sekolah',
    icon: Package,
    studentAccessible: false
  },
  {
    id: 'system-keuangan',
    label: 'Keuangan',
    tooltip: 'Sistem Pengelolaan Anggaran & Keuangan Sekolah',
    icon: Wallet,
    studentAccessible: false
  },
  {
    id: 'system-kesiswaan',
    label: 'Kesiswaan',
    tooltip: 'Sistem Informasi Kesiswaan & LMS Terpadu',
    icon: GraduationCap,
    studentAccessible: true
  },
  {
    id: 'system-perpustakaan',
    label: 'Perpustakaan',
    tooltip: 'Katalog Koleksi Buku & Sirkulasi Peminjaman',
    icon: Library,
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
  isMasterUser = false
}) => {
  const [timeString, setTimeString] = useState('');
  const [dateString, setDateString] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isMaster = isMasterUser || teacher?.id === 'PROF-ADMIN';
  const storageKey = teacher?.id ? `simak_schedules_${teacher.id}` : 'simak_schedules';
  const settingsScope = teacher?.id && !isMaster ? `_${teacher.id}` : '';

  const getInitialSchedules = () => {
    const savedKey = ((k: string) => null as any)(storageKey);
    if (savedKey) {
      try {
        const parsed = JSON.parse(savedKey);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    if (isMaster) {
      const savedGen = ((k: string) => null as any)('simak_schedules');
      if (savedGen) {
        try {
          const parsed = JSON.parse(savedGen);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return [];
  };

  const [schedules, setSchedules] = useState<TeachingScheduleItem[]>(getInitialSchedules);

  useEffect(() => {
    setSchedules(getInitialSchedules());
  }, [teacher?.id, currentUser?.uid, isMaster]);

  useEffect(() => {
    const unsub = subscribeToSchedules((remoteSchedules) => {
      if (remoteSchedules && Array.isArray(remoteSchedules)) {
        setSchedules(remoteSchedules);
      }
    }, settingsScope);
    return () => unsub();
  }, [teacher?.id, isMaster, settingsScope]);

  const dayIndex = new Date().getDay();
  const dayName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][dayIndex];
  
  const activeClasses = Array.from(new Set(
    schedules.filter(sch => sch.day === dayName).map(sch => sch.className)
  ));
  
  const activeClassText = activeClasses.length > 0 ? activeClasses.join(', ') : 'Tidak ada jadwal hari ini';

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB');
      setDateString(now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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

  const displayedSubHeaderMenus = useMemo(() => {
    if (isStudentUser) {
      return SUB_HEADER_MENUS.filter(m => m.studentAccessible);
    }
    return SUB_HEADER_MENUS;
  }, [isStudentUser]);

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
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

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
    <header className="bg-cyan-900 border-b border-cyan-800 sticky top-0 z-30 shadow-md">
      {/* Top Banner bar */}
      <div className="bg-cyan-950/80 text-white px-3 md:px-6 pt-[calc(env(safe-area-inset-top,0px)+0.4rem)] pb-1.5 text-[10px] flex justify-between items-center border-b border-cyan-800/80 transition-all">
        <div className="flex items-center space-x-1.5 truncate">
          <span className="font-bold tracking-wide uppercase text-[9px] md:text-[10px] text-white truncate">
            {isStudentUser ? 'LEARNING MANAGEMENT SYSTEM • PLATFORM PEMBELAJARAN DIGITAL MANDIRI' : isKeuanganPage ? 'SISTEM PENGELOLAAN KEUANGAN & ANGGARAN SEKOLAH' : isSarprasPage ? 'SISTEM PENGELOLAAN SARANA & PRASARANA SEKOLAH' : isTuPage ? 'SISTEM INFORMASI ADMINISTRASI TATA USAHA' : isKurikulumPage ? 'SISTEM INFORMASI KURIKULUM MERDEKA' : 'SISTEM INFORMASI AKADEMIK GURU'}
          </span>
          <span className="hidden md:inline text-white/70">•</span>
          <span className="hidden md:inline-flex items-center text-amber-300 font-medium text-[10px]">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-amber-400" />
            SIMAK Versi 3.8.1
          </span>

        </div>
        
        <div className="flex items-center space-x-2 text-[9px] md:text-[10px] text-white shrink-0">
          <div className="hidden sm:flex items-center space-x-1">
            <Calendar className="w-3 h-3 text-cyan-200" />
            <span>{dateString}</span>
          </div>
        </div>
      </div>

      {/* Main Header Content */}
      <div className="px-3 md:px-6 py-2 md:py-2.5 w-full flex flex-col md:flex-row justify-between items-stretch md:items-center gap-2 md:gap-4">
        
        {/* Top Row: Emblem Title + User Profile Badge */}
        <div className="flex items-center justify-between gap-3 min-w-0 shrink-0">
          {/* School Emblem Title */}
          <div className="flex items-center space-x-2.5 md:space-x-3 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-13 md:h-13 bg-white rounded-none shadow-sm shrink-0 flex items-center justify-center p-1 md:p-1.5 border border-cyan-700/60">
              <TutWuriHandayaniLogo className="w-full h-full" />
            </div>
            <div className="min-w-0 flex flex-col justify-center space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-black text-white uppercase tracking-wider leading-tight truncate">
                  {isStudentUser ? 'Learning Management System' : isTuPage ? 'ADMINISTRASI TATA USAHA' : isSarprasPage ? 'SARANA & PRASARANA' : isPerpustakaanPage ? 'PERPUSTAKAAN SEKOLAH' : isKurikulumPage ? 'KURIKULUM' : 'SIMAK GURU'}
                </h1>
                {!isStudentUser && !isTuPage && !isKurikulumPage && !isSarprasPage && !isPerpustakaanPage && (
                  <span className="bg-amber-400 text-cyan-950 font-black text-[10px] sm:text-[11px] md:text-xs px-1.5 py-0.5 rounded-none shadow-xs shrink-0 tracking-wider">
                    V.3.8.1
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs md:text-sm text-white font-bold tracking-tight truncate">
                {teacher?.schoolName || currentUser?.schoolName || 'SMA ISLAM DIPONEGORO WAGIR'} {!isStudentPage && <span className="inline text-cyan-100 font-semibold">• NPSN: {teacher?.npsn || '20517834'}</span>}
              </p>
            </div>
          </div>

          {/* Mobile Action Buttons (Logout on HP) */}
          <div className="md:hidden flex items-center gap-1.5 shrink-0">
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center space-x-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/40 px-2.5 py-1.5 rounded-none text-xs font-bold transition-all shrink-0 cursor-pointer shadow-2xs"
                title="Keluar dari Aplikasi"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-300" />
                <span>Keluar</span>
              </button>
            )}
          </div>
        </div>

        {/* Center: Search Menu Bar */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-full md:max-w-xs lg:max-w-md xl:max-w-lg mx-0 md:mx-2 my-0.5 md:my-0 z-40">
          <div className="relative flex items-center">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cyan-300">
              <Search className="w-4 h-4" />
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
              placeholder="Cari menu & fitur aplikasi... (Ctrl+K)"
              className="w-full pl-9 pr-16 sm:pr-20 py-1.5 bg-cyan-950/70 hover:bg-cyan-950/90 focus:bg-cyan-950 text-white placeholder:text-cyan-300/70 border border-cyan-700/80 focus:border-amber-400 text-xs sm:text-sm rounded-none focus:outline-none focus:ring-1 focus:ring-amber-400 shadow-inner transition-all"
            />
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1.5">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedIndex(0);
                    searchInputRef.current?.focus();
                  }}
                  className="text-cyan-300 hover:text-white p-0.5 rounded-none transition-colors cursor-pointer"
                  title="Hapus pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] bg-cyan-800/90 text-cyan-200 border border-cyan-700 px-1.5 py-0.5 rounded-none font-mono select-none">
                  <Command className="w-2.5 h-2.5" /> K
                </kbd>
              )}
            </div>
          </div>

          {/* Search Results Dropdown */}
          {isSearchOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white text-slate-800 rounded-none shadow-2xl border border-cyan-900/20 max-h-[360px] sm:max-h-[420px] overflow-y-auto z-50 divide-y divide-slate-100">
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

        {/* Right Side: Teacher Info & Photo + Class Filter Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between md:justify-end gap-2 md:gap-3 mt-2 md:mt-0 border-t border-cyan-800 md:border-0 pt-2 md:pt-0 w-full md:w-auto">
          {/* Teacher Profile Avatar & Info Card */}
          <div className="flex items-center justify-between md:justify-end gap-2.5 min-w-0 w-full md:w-auto">
            <div className="flex flex-col md:items-end min-w-0 flex-1 md:flex-initial text-left md:text-right">
              <p className="text-[10px] md:hidden font-bold text-white truncate">
                {currentUser?.name || teacher?.name || 'Pengguna'}
              </p>
              <p className="text-[9px] md:hidden font-semibold text-white truncate leading-tight">
                {currentUser?.role || teacher?.subjectRole || 'Guru Pengampu'}
              </p>
              {!isKurikulumPage && !isTuPage && !isStudentPage && (
                <div className="flex items-center md:hidden gap-1.5 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${activeClasses.length > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-600'}`}></div>
                  <p className="text-[9px] md:text-[10px] font-bold truncate text-white">
                    Status: Kelas Aktif ({activeClassText})
                  </p>
                </div>
              )}

              {/* Filter Kelas on Laptop/Desktop - directly below status kelas aktif */}
              {showClassSelector && (
                <div className="hidden md:flex items-center justify-end gap-1.5 mt-1">
                  <span className="text-cyan-200 font-bold text-[10px]">Filter Kelas:</span>
                  <select 
                    value={selectedClass} 
                    onChange={(e) => onSelectClass(e.target.value)}
                    className="bg-cyan-800 text-white font-extrabold px-2 py-0.5 rounded-none border border-cyan-700 focus:outline-none focus:border-cyan-400 cursor-pointer shadow-2xs text-[11px]"
                  >
                    {classList.map((cls) => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile Only Filter Kelas */}
          {showClassSelector && (
            <div className="md:hidden flex items-center justify-between gap-2 bg-cyan-800/90 px-2 py-1.5 rounded-none border border-cyan-700 w-full shrink-0 mt-1">
              <div className="flex items-center space-x-1.5 text-xs">
                <span className="text-cyan-200 font-bold text-[11px]">Filter Kelas:</span>
                <select 
                  value={selectedClass} 
                  onChange={(e) => onSelectClass(e.target.value)}
                  className="bg-cyan-900 text-white font-extrabold px-2 py-0.5 rounded-none border border-cyan-700 focus:outline-none focus:border-cyan-400 cursor-pointer shadow-2xs text-xs"
                >
                  {classList.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
              <span className="text-[10px] text-cyan-300/80 font-medium">
                T.A {teacher?.academicYear || '2026/2027'}
              </span>
            </div>
          )}
        </div>

      </div>

      {/* Sub-Header Navigation Bar: Sinkronisasi, Monitoring Akun, Kurikulum, Guru, TU, Sarpras, Keuangan, Kesiswaan, Perpustakaan */}
      <nav 
        aria-label="Navigasi Menu Terpadu di Bawah Header" 
        className="bg-cyan-950 border-t border-cyan-800/90 px-2 sm:px-4 md:px-6 py-1 overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-1 sm:gap-1.5 shadow-inner select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black text-amber-300 uppercase tracking-wider shrink-0 pr-2 border-r border-cyan-800 mr-0.5">
          <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="hidden sm:inline">Menu Sistem:</span>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {displayedSubHeaderMenus.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange?.(item.id)}
                title={item.tooltip}
                className={`group flex items-center gap-1.5 px-2.5 sm:px-3 py-1 text-xs font-bold transition-all rounded-none shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-cyan-950 shadow-xs border-b-2 border-amber-300 font-black'
                    : 'text-cyan-100 hover:text-white hover:bg-cyan-800/80 border-b-2 border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 transition-colors ${isActive ? 'text-cyan-950' : 'text-cyan-300 group-hover:text-white'}`} />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
