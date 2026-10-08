import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  UserCheck, 
  BookOpenCheck, 
  GraduationCap, 
  CalendarDays, 
  Clock,
  Sparkles,
  RefreshCw,
  Trophy,
  Settings,
  Zap,
  Wrench,
  LogOut,
  Database,
  ChevronDown,
  ChevronUp,
  Award,
  BookOpen,
  Users,
  Building2,
  ShieldCheck,
  FolderUp,
  Wallet,
  Package,
  Library,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldAlert,
  FileText,
  Calendar,
  FileCheck,
  AlertOctagon,
  X
} from 'lucide-react';

export type NavTab = 
  | 'dashboard' 
  | 'attendance' 
  | 'grades' 
  | 'extra-tasks' 
  | 'students' 
  | 'journal' 
  | 'upload-modul'
  | 'master-data' 
  | 'system-kurikulum'
  | 'system-guru'
  | 'system-tu'
  | 'system-sarpras'
  | 'system-keuangan'
  | 'system-kesiswaan'
  | 'system-perpustakaan'
  | 'validasi'
  | 'validasi-dapodik'
  | 'validasi-overview'
  | 'validasi-students'
  | 'validasi-grades'
  | 'validasi-attendance'
  | 'validasi-modules'
  | 'validasi-report'
  | 'sync' 
  | 'schedule' 
  | 'extracurricular' 
  | 'residu'
  | 'ai-assistant' 
  | 'maintenance' 
  | 'settings';

import { UserAccount, TeacherProfile, Student, StudentGrade, AttendanceRecord, StudentTask } from '../types';
import { useTeachingSchedules } from '../lib/teachingScheduleService';
import { computeMenuHealthMap } from '../lib/menuHealthService';

interface SidebarNavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  attendanceCount: number;
  totalStudents: number;
  pendingGradesCount: number;
  isAdmin?: boolean;
  isMasterUser?: boolean;
  isAccountDisabled?: boolean;
  onLogout?: () => void;
  currentUser?: UserAccount | null;
  teacher?: TeacherProfile;
  students?: Student[];
  grades?: StudentGrade[];
  attendanceRecords?: AttendanceRecord[];
  registeredUsers?: UserAccount[];
  studentTasks?: StudentTask[];
  isOpen?: boolean;
  onClose?: () => void;
}

const RESTRICTED_TABS: NavTab[] = ['sync', 'schedule', 'journal', 'upload-modul', 'students', 'attendance', 'extracurricular', 'grades', 'extra-tasks'];

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  activeTab,
  onTabChange,
  attendanceCount,
  totalStudents,
  pendingGradesCount,
  isAdmin,
  isMasterUser,
  isAccountDisabled = false,
  onLogout,
  currentUser,
  teacher,
  students,
  grades,
  attendanceRecords,
  registeredUsers,
  studentTasks,
  isOpen = true,
  onClose
}) => {
  const [isMasterDataOpen, setIsMasterDataOpen] = useState(true);
  const mobileNavContainerRef = React.useRef<HTMLDivElement>(null);

  // Compute validation health (warning, invalid, valid) for all menu items
  const menuHealthMap = React.useMemo(() => {
    return computeMenuHealthMap({
      students,
      grades,
      attendanceRecords,
      teacher,
      currentUser,
      registeredUsers,
      studentTasks
    });
  }, [students, grades, attendanceRecords, teacher, currentUser, registeredUsers, studentTasks]);

  // Aggregate totals across all modules
  const { totalInvalidCount, totalWarningCount, totalValidCount } = React.useMemo(() => {
    let inv = 0;
    let warn = 0;
    let val = 0;
    Object.values(menuHealthMap).forEach((h) => {
      if (h.level === 'invalid') inv += (h.invalidCount || 1);
      else if (h.level === 'warning') warn += (h.warningCount || 1);
      else val++;
    });
    return { totalInvalidCount: inv, totalWarningCount: warn, totalValidCount: val };
  }, [menuHealthMap]);

  
  // Live active teaching schedule data from Teaching Schedule menu
  const {
    activeClasses,
    activeClassText
  } = useTeachingSchedules({
    teacher,
    currentUser,
    isMasterUser
  });

  const isGuruRole = Boolean(
    currentUser?.role && (
      currentUser.role.toLowerCase().includes('guru') ||
      currentUser.role.toLowerCase().includes('pendidik') ||
      currentUser.role.toLowerCase().includes('pengampu') ||
      currentUser.role.toLowerCase().includes('wali kelas')
    ) && (
      !currentUser.role.toLowerCase().includes('admin') &&
      !currentUser.role.toLowerCase().includes('master')
    )
  );

  const isAdministrator = !isGuruRole && (isAdmin || isMasterUser || Boolean(
    currentUser && (
      currentUser.role?.toLowerCase().includes('admin') ||
      currentUser.role?.toLowerCase().includes('master') ||
      (currentUser.email?.toLowerCase().includes('master') && !currentUser.role?.toLowerCase().includes('guru')) ||
      (currentUser.email?.toLowerCase() === 'shahrurrobby17@gmail.com' && !currentUser.role?.toLowerCase().includes('guru'))
    )
  ));

  const isKurikulumRole = currentUser?.role ? currentUser.role.toLowerCase().includes('kurikulum') : false;

  const isTuRole = currentUser?.role ? (
    currentUser.role.toLowerCase().includes('tu') || 
    currentUser.role.toLowerCase().includes('tata usaha') ||
    currentUser.role.toLowerCase().includes('administrasi')
  ) : false;

  const isKesiswaanRole = currentUser?.role ? (
    currentUser.role.toLowerCase().includes('kesiswaan') ||
    currentUser.role.toLowerCase().includes('wakasek kesiswaan')
  ) : false;

  const [lastSystemMode, setLastSystemMode] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'system-tu') {
      setLastSystemMode('tu');
    } else if (activeTab === 'system-kurikulum') {
      setLastSystemMode('kurikulum');
    } else if (activeTab === 'system-kesiswaan') {
      setLastSystemMode('kesiswaan');
    } else if (activeTab === 'system-sarpras') {
      setLastSystemMode('sarpras');
    } else if (activeTab === 'system-perpustakaan') {
      setLastSystemMode('perpustakaan');
    } else if (activeTab === 'validasi-dapodik' || activeTab === 'validasi') {
      if (lastSystemMode === 'kurikulum' || isKurikulumRole) {
        setLastSystemMode('kurikulum');
      } else {
        setLastSystemMode(null);
      }
    } else if (activeTab === 'attendance') {
      if (lastSystemMode === 'kesiswaan' || isKesiswaanRole) {
        setLastSystemMode('kesiswaan');
      } else {
        setLastSystemMode(null);
      }
    } else if (activeTab !== 'settings') {
      setLastSystemMode(null);
    }
  }, [activeTab, isKurikulumRole, isKesiswaanRole, lastSystemMode]);

  // Halaman Kurikulum hanya menampilkan menu kurikulum, validasi lokal, dan pengaturan (berlaku untuk akses Kurikulum maupun saat berada di halaman Kurikulum)
  const isKurikulumOnlyMode = isKurikulumRole || 
    activeTab === 'system-kurikulum' || 
    (activeTab as string) === 'kurikulum' || 
    (lastSystemMode === 'kurikulum' && (activeTab === 'settings' || activeTab === 'validasi-dapodik' || activeTab === 'validasi'));

  // Halaman TU hanya menampilkan menu TU dan pengaturan (berlaku untuk akses TU maupun saat berada di halaman TU)
  const isTuOnlyMode = isTuRole || activeTab === 'system-tu' || (activeTab as string) === 'tu' || (lastSystemMode === 'tu' && activeTab === 'settings');

  // Halaman Kesiswaan hanya menampilkan menu kesiswaan, presensi siswa, dan pengaturan (berlaku untuk akses Kesiswaan maupun saat berada di halaman Kesiswaan)
  const isKesiswaanOnlyMode = isKesiswaanRole || 
    activeTab === 'system-kesiswaan' || 
    (activeTab as string) === 'kesiswaan' || 
    (lastSystemMode === 'kesiswaan' && (activeTab === 'settings' || activeTab === 'attendance'));

  const isSarprasRole = currentUser?.role ? (currentUser.role.toLowerCase().includes('sarpras') || currentUser.role.toLowerCase().includes('sarana')) : false;
  const isSarprasOnlyMode = !isAdministrator && (activeTab === 'system-sarpras' || (isSarprasRole && activeTab === 'settings'));

  const isPerpustakaanRole = currentUser?.role ? (currentUser.role.toLowerCase().includes('perpustakaan') || currentUser.role.toLowerCase().includes('pustaka') || currentUser.role.toLowerCase().includes('pustakawan')) : false;
  const isPerpustakaanOnlyMode = !isAdministrator && (activeTab === 'system-perpustakaan' || (isPerpustakaanRole && activeTab === 'settings'));

  const isStudentRole = currentUser?.role ? (
    (currentUser.role.toLowerCase().includes('siswa') || currentUser.role.toLowerCase().includes('murid')) &&
    !currentUser.role.toLowerCase().includes('kesiswaan')
  ) : false;

  const isKepalaSekolah = Boolean(
    currentUser?.role && (
      currentUser.role.toLowerCase().includes('kepala') ||
      currentUser.role.toLowerCase().includes('principal')
    )
  );

  React.useEffect(() => {
    if (mobileNavContainerRef.current) {
      const activeEl = mobileNavContainerRef.current.querySelector<HTMLElement>('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [activeTab]);

  const kurikulumItem = {
    id: 'system-kurikulum' as NavTab,
    label: 'Kurikulum',
    subtitle: 'Sistem Kurikulum',
    icon: BookOpen,
    badge: null
  };

  const validasiLokalItem = {
    id: 'validasi-dapodik' as NavTab,
    label: 'Validasi Lokal',
    subtitle: 'Audit Warning & Invalid',
    icon: ShieldAlert,
    badge: null
  };

  const tuItem = {
    id: 'system-tu' as NavTab,
    label: 'TU',
    subtitle: 'Sistem Tata Usaha',
    icon: Building2,
    badge: null
  };

  const sarprasItem = {
    id: 'system-sarpras' as NavTab,
    label: 'Sarpras',
    subtitle: 'Sarana & Prasarana',
    icon: Package,
    badge: null
  };

  const perpustakaanItem = {
    id: 'system-perpustakaan' as NavTab,
    label: 'Perpustakaan',
    subtitle: 'Katalog & Sirkulasi',
    icon: Library,
    badge: null
  };

  const kesiswaanItem = {
    id: 'system-kesiswaan' as NavTab,
    label: 'Kesiswaan',
    subtitle: 'Sistem Kesiswaan',
    icon: GraduationCap,
    badge: null
  };

  const presensiSiswaKesiswaanItem = {
    id: 'attendance' as NavTab,
    label: 'Presensi Siswa',
    subtitle: 'Kehadiran Siswa',
    icon: UserCheck,
    badge: null
  };

  const settingsItem = {
    id: 'settings' as NavTab,
    label: 'Pengaturan',
    subtitle: 'Konfigurasi Sistem',
    icon: Settings,
    badge: null
  };

  const dashboardItem = {
    id: 'dashboard' as NavTab,
    label: 'Dashboard',
    subtitle: 'Ringkasan & Analitik',
    icon: BarChart3,
    badge: null
  };

  const masterDataSubItems = [
    {
      id: 'sync' as NavTab,
      label: 'Sinkronisasi',
      subtitle: 'Sinkronisasi Siswa & Kenaikan Rombel',
      icon: RefreshCw,
      badge: null
    },
    {
      id: 'master-data' as NavTab,
      label: 'Monitoring Akun',
      subtitle: 'Master Data & Manajemen Akun SIMAK',
      icon: Database,
      badge: null
    },
    {
      id: 'system-kurikulum' as NavTab,
      label: 'Kurikulum',
      subtitle: 'Sistem Informasi Kurikulum Merdeka',
      icon: BookOpen,
      badge: null
    },
    {
      id: 'system-guru' as NavTab,
      label: 'Guru',
      subtitle: 'Sistem Manajemen Pendidik & PTK',
      icon: Users,
      badge: null
    },
    {
      id: 'system-tu' as NavTab,
      label: 'TU',
      subtitle: 'Sistem Tata Usaha & Persuratan',
      icon: Building2,
      badge: null
    },
    {
      id: 'system-sarpras' as NavTab,
      label: 'Sarpras',
      subtitle: 'Sarana & Prasarana Sekolah',
      icon: Package,
      badge: null
    },
    {
      id: 'system-keuangan' as NavTab,
      label: 'Keuangan',
      subtitle: 'Sistem Keuangan & Anggaran Sekolah',
      icon: Wallet,
      badge: null
    },
    {
      id: 'system-perpustakaan' as NavTab,
      label: 'Perpustakaan',
      subtitle: 'Katalog Koleksi & Sirkulasi Buku',
      icon: Library,
      badge: null
    },
    {
      id: 'system-kesiswaan' as NavTab,
      label: 'Kesiswaan',
      subtitle: 'Sistem Kesiswaan & LMS Terpadu',
      icon: GraduationCap,
      badge: null
    }
  ];

  // Pada halaman/akses Kepala Sekolah, sembunyikan menu Monitoring Akun
  const displayedMasterDataSubItems = masterDataSubItems.filter(item => {
    if (isKepalaSekolah && item.id === 'master-data') return false;
    return true;
  });

  useEffect(() => {
    if (displayedMasterDataSubItems.some((item) => item.id === activeTab)) {
      setIsMasterDataOpen(true);
    }
  }, [activeTab, displayedMasterDataSubItems]);

  const validasiSubItems = [
    {
      id: 'validasi-dapodik' as NavTab,
      label: 'Validasi Lokal',
      subtitle: 'Audit Warning & Invalid',
      icon: ShieldAlert
    },
    {
      id: 'validasi-overview' as NavTab,
      label: 'Ringkasan Audit',
      subtitle: 'Audit Integritas Data & Rapor',
      icon: ShieldCheck
    },
    {
      id: 'validasi-students' as NavTab,
      label: 'Validasi Siswa',
      subtitle: 'Kelengkapan NISN & Profil Siswa',
      icon: Users
    },
    {
      id: 'validasi-grades' as NavTab,
      label: 'Validasi Nilai',
      subtitle: 'Ketuntasan KKTP & Nilai Akhir',
      icon: Award
    },
    {
      id: 'validasi-attendance' as NavTab,
      label: 'Validasi Presensi',
      subtitle: 'Presensi Minimal & Rekap Kehadiran',
      icon: Calendar
    },
    {
      id: 'validasi-modules' as NavTab,
      label: 'Validasi Modul Guru',
      subtitle: 'Kelengkapan Modul Ajar & ATP',
      icon: FileText
    },
    {
      id: 'validasi-report' as NavTab,
      label: 'Berita Acara',
      subtitle: 'Dokumen SPTJM & Berita Acara (BAVA)',
      icon: FileCheck
    }
  ];

  const isValidasiActive = activeTab === 'validasi' || validasiSubItems.some((item) => item.id === activeTab);

  const [isValidasiOpen, setIsValidasiOpen] = useState<boolean>(true);

  useEffect(() => {
    if (isValidasiActive) {
      setIsValidasiOpen(true);
    }
  }, [isValidasiActive]);

  const isMasterUserOrAdmin = isMasterUser || isAdmin || isAdministrator;

  const mainNavItems = [
    {
      id: 'students' as NavTab,
      label: 'Data Siswa',
      subtitle: 'Rapor & Rekap',
      icon: GraduationCap,
      badge: null
    },
    {
      id: 'schedule' as NavTab,
      label: 'Jadwal Mengajar',
      subtitle: 'Agenda Tatap Muka',
      icon: Clock,
      badge: null
    },
    {
      id: 'journal' as NavTab,
      label: 'Jurnal Guru',
      subtitle: 'Agenda Mengajar',
      icon: CalendarDays,
      badge: null
    },
    {
      id: 'upload-modul' as NavTab,
      label: 'Upload Modul/ATP',
      subtitle: 'Perangkat Ajar & ATP',
      icon: FolderUp,
      badge: null
    },
    {
      id: 'attendance' as NavTab,
      label: 'Presensi',
      subtitle: 'Kehadiran Siswa',
      icon: UserCheck,
      badge: null
    },
    {
      id: 'extracurricular' as NavTab,
      label: 'Presensi Ekstra',
      subtitle: 'Kegiatan Ekstrakurikuler',
      icon: Trophy,
      badge: null
    },
    {
      id: 'grades' as NavTab,
      label: 'Kelola Nilai',
      subtitle: 'Formatif & Sumatif',
      icon: BookOpenCheck,
      badge: null
    },
    {
      id: 'extra-tasks' as NavTab,
      label: 'Nilai Tugas Tambahan',
      subtitle: 'Remedial & Pengayaan',
      icon: Award,
      badge: null
    },
    {
      id: 'residu' as NavTab,
      label: 'Residu',
      subtitle: 'Residu Data & Verval',
      icon: AlertOctagon,
      badge: null
    },
    {
      id: 'ai-assistant' as NavTab,
      label: 'Asisten AI',
      subtitle: 'Tersedia',
      icon: Sparkles,
      badge: null
    }
  ];

  // Pada halaman/akses Kepala Sekolah, sembunyikan menu Asisten AI dan Residu
  const displayedMainNavItems = mainNavItems.filter(item => {
    if (isKepalaSekolah && (item.id === 'ai-assistant' || item.id === 'residu')) return false;
    return true;
  });

  const studentNavItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      subtitle: 'Ringkasan Belajar',
      icon: Sparkles,
      badge: null
    },
    {
      id: 'system-kesiswaan' as NavTab,
      label: 'LMS',
      subtitle: 'Learning Management System',
      icon: GraduationCap,
      badge: 'LMS'
    },
    {
      id: 'upload-modul' as NavTab,
      label: 'Materi & Modul',
      subtitle: 'Bahan Ajar Digital',
      icon: BookOpen,
      badge: null
    },
    {
      id: 'extra-tasks' as NavTab,
      label: 'Tugas Daring',
      subtitle: 'Pengumpulan Tugas',
      icon: BookOpenCheck,
      badge: null
    },
    {
      id: 'attendance' as NavTab,
      label: 'Presensi Siswa',
      subtitle: 'Rekap Kehadiran Guru',
      icon: UserCheck,
      badge: null
    },
    {
      id: 'grades' as NavTab,
      label: 'Buku Nilai & Rapor',
      subtitle: 'Capaian Kompetensi',
      icon: Award,
      badge: null
    },
    {
      id: 'schedule' as NavTab,
      label: 'Jadwal Pelajaran',
      subtitle: 'Jadwal KBM Siswa',
      icon: Clock,
      badge: null
    },
    {
      id: 'settings' as NavTab,
      label: 'Profil Siswa',
      subtitle: 'Informasi Akun',
      icon: Settings,
      badge: null
    }
  ];

  const guruNavItems = [
    dashboardItem,
    {
      id: 'students' as NavTab,
      label: 'Data Siswa',
      subtitle: 'Data Siswa & Rombel',
      icon: Users,
      badge: null
    },
    {
      id: 'schedule' as NavTab,
      label: 'Jadwal Mengajar',
      subtitle: 'Agenda Tatap Muka',
      icon: Clock,
      badge: null
    },
    {
      id: 'journal' as NavTab,
      label: 'Jurnal Guru',
      subtitle: 'Agenda Mengajar',
      icon: CalendarDays,
      badge: null
    },
    {
      id: 'upload-modul' as NavTab,
      label: 'Upload Modul',
      subtitle: 'Perangkat Ajar & ATP',
      icon: FolderUp,
      badge: null
    },
    {
      id: 'attendance' as NavTab,
      label: 'Presensi',
      subtitle: 'Kehadiran Siswa',
      icon: UserCheck,
      badge: null
    },
    {
      id: 'grades' as NavTab,
      label: 'Kelola Nilai',
      subtitle: 'Formatif & Sumatif',
      icon: BookOpenCheck,
      badge: null
    },
    settingsItem
  ];

  const allVisibleItems = isKesiswaanOnlyMode
    ? [kesiswaanItem, presensiSiswaKesiswaanItem, settingsItem]
    : isStudentRole
    ? studentNavItems
    : isTuOnlyMode
    ? [tuItem, settingsItem]
    : isKurikulumOnlyMode
    ? [kurikulumItem, validasiLokalItem, settingsItem]
    : isGuruRole
    ? guruNavItems
    : isSarprasOnlyMode
    ? [sarprasItem, settingsItem]
    : isPerpustakaanOnlyMode
    ? [perpustakaanItem, settingsItem]
    : [
        dashboardItem, 
        {
          id: 'validasi' as NavTab,
          label: 'Validasi',
          subtitle: 'Pusat Validasi & Dapodik',
          icon: ShieldCheck,
          badge: null
        },
        ...displayedMainNavItems,
        settingsItem
      ];

  const renderDesktopItem = (item: any, isMobileDrawer: boolean = false) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id || 
      (item.id === 'validasi-dapodik' && (activeTab === 'validasi' || activeTab === 'validasi-dapodik')) ||
      (item.id === 'system-kesiswaan' && (activeTab === 'system-kesiswaan' || (activeTab as string) === 'kesiswaan'));
    const health = menuHealthMap[item.id as NavTab] || {
      level: 'valid',
      badgeLabel: 'Valid',
      tooltip: 'Data valid & tuntas',
      invalidCount: 0,
      warningCount: 0,
      validCount: 1
    };

    return (
      <React.Fragment key={item.id}>
        {!isStudentRole && !isGuruRole && !isKurikulumOnlyMode && !isTuOnlyMode && !isKesiswaanOnlyMode && item.id === 'attendance' && (
          <div className="pt-3 pb-1 px-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <span>NAVIGASI SISWA</span>
          </div>
        )}
        {!isStudentRole && !isGuruRole && !isKurikulumOnlyMode && !isTuOnlyMode && !isKesiswaanOnlyMode && item.id === 'ai-assistant' && (
          <div className="pt-3 pb-1 px-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <span>AI & Sistem</span>
          </div>
        )}
        <motion.button 
          type="button" 
          onClick={() => {
            onTabChange(item.id);
            if (isMobileDrawer && onClose) {
              onClose();
            }
          }}
          whileHover={item.id === 'ai-assistant' ? undefined : { x: 2 }}
          whileTap={item.id === 'ai-assistant' ? undefined : { scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          title={health.tooltip}
          className={`relative w-full text-left px-3 py-2 rounded-none transition-colors flex items-center justify-between group cursor-pointer overflow-hidden ${
            isActive
              ? 'bg-[#354152] text-white font-semibold border-l-4 border-[#337ab7] shadow-xs'
              : 'hover:bg-[#2d3642] text-slate-300 hover:text-white font-medium'
          }`}
        >
          {isActive && (
            <motion.div
              layoutId={isMobileDrawer ? "activeMobileDrawerBg" : "activeSidebarBg"}
              className="absolute inset-0 bg-white/5 -z-0"
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            />
          )}
          
          <div className="flex items-center space-x-2.5 relative z-10 min-w-0 flex-1 mr-1">
            <Icon className={`w-4.5 h-4.5 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white opacity-90 group-hover:opacity-100'}`} />
            <span className="text-xs sm:text-sm font-medium truncate">{item.label}</span>
          </div>

          {item.badge && (
            <div className="relative z-10 flex items-center shrink-0">
              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-none ${
                item.id === 'ai-assistant'
                  ? 'bg-amber-400 text-slate-950 font-black'
                  : isActive ? 'bg-[#337ab7] text-white' : 'bg-[#1e252e] text-slate-300 border border-slate-600/40'
              }`}>
                {item.badge}
              </span>
            </div>
          )}
        </motion.button>
      </React.Fragment>
    );
  };

  const renderNavContent = (isMobileDrawer: boolean = false) => (
    <div className="flex flex-col justify-between min-h-full w-full max-w-full overflow-x-hidden">
      <div className="space-y-2 w-full max-w-full overflow-x-hidden">
        {/* Profile Card at Top of Sidebar with generous breathing space */}
        <div className="pt-4 sm:pt-5 pb-3.5 px-3.5 sm:px-4 mb-2 border-b border-[#35404e] bg-[#222b34]/40">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-none bg-white/10 border border-white/20 flex items-center justify-center shrink-0 text-slate-200 mt-0.5 shadow-2xs">
              <GraduationCap className="w-4.5 h-4.5 text-slate-200" />
            </div>
            <div className="flex flex-col text-left min-w-0 flex-1 overflow-hidden">
              <p className="text-[12px] font-bold text-white truncate">
                {currentUser?.name || teacher?.name || 'Pengguna'}
              </p>
              <p className="text-[10px] font-semibold text-slate-400 truncate leading-tight mt-0.5">
                {currentUser?.role || teacher?.subjectRole || 'Guru Pengampu'}
              </p>
              {!isKurikulumOnlyMode && !isTuOnlyMode && !isKesiswaanOnlyMode && !isStudentRole && (
                <div className="flex items-center gap-1.5 mt-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${activeClasses.length > 0 ? 'bg-emerald-400' : 'bg-sky-400'}`}></div>
                  <p className="text-[9px] font-bold truncate text-slate-300">
                    Status: Kelas Aktif ({activeClassText})
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>{isKesiswaanOnlyMode ? 'Sistem Kesiswaan' : isStudentRole ? 'LMS Siswa Merdeka' : isTuOnlyMode ? 'Sistem Tata Usaha' : isKurikulumOnlyMode ? 'Sistem Kurikulum' : isGuruRole ? 'Sistem Guru & Akademik' : isSarprasOnlyMode ? 'Sistem Sarpras' : isPerpustakaanOnlyMode ? 'Sistem Perpustakaan' : isKepalaSekolah ? 'Sistem Kepala Sekolah' : 'Navigasi Utama'}</span>
        </div>

        <nav className="space-y-1 w-full max-w-full overflow-x-hidden">
          {isKesiswaanOnlyMode ? (
            <>
              {renderDesktopItem(kesiswaanItem, isMobileDrawer)}
              {renderDesktopItem(presensiSiswaKesiswaanItem, isMobileDrawer)}
              {renderDesktopItem(settingsItem, isMobileDrawer)}
            </>
          ) : isTuOnlyMode ? (
            <>
              {renderDesktopItem(tuItem, isMobileDrawer)}
              {renderDesktopItem(settingsItem, isMobileDrawer)}
            </>
          ) : isKurikulumOnlyMode ? (
            <>
              {renderDesktopItem(kurikulumItem, isMobileDrawer)}
              {renderDesktopItem(validasiLokalItem, isMobileDrawer)}
              {renderDesktopItem(settingsItem, isMobileDrawer)}
            </>
          ) : isStudentRole ? (
            <>
              {studentNavItems.map(item => renderDesktopItem(item, isMobileDrawer))}
            </>
          ) : isGuruRole ? (
            <>
              {guruNavItems.map(item => renderDesktopItem(item, isMobileDrawer))}
            </>
          ) : isSarprasOnlyMode ? (
            <>
              {renderDesktopItem(sarprasItem, isMobileDrawer)}
              {renderDesktopItem(settingsItem, isMobileDrawer)}
              <div className="pt-2 pb-1 px-1">
                <div className="border-b border-[#35404e] w-full" />
              </div>
            </>
          ) : isPerpustakaanOnlyMode ? (
            <>
              {renderDesktopItem(perpustakaanItem, isMobileDrawer)}
              {renderDesktopItem(settingsItem, isMobileDrawer)}
              <div className="pt-2 pb-1 px-1">
                <div className="border-b border-[#35404e] w-full" />
              </div>
            </>
          ) : (
            <>
              {/* Dashboard Item */}
              {renderDesktopItem(dashboardItem, isMobileDrawer)}

              {/* Master Data Section */}
              {!isStudentRole && (
                <div className="pt-2 pb-1 w-full max-w-full overflow-x-hidden">
                  <button
                    type="button"
                    onClick={() => setIsMasterDataOpen(!isMasterDataOpen)}
                    className="w-full px-2.5 py-1.5 flex items-center justify-between text-[11px] font-bold text-slate-300 uppercase tracking-wider hover:bg-[#303a47] hover:text-white transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Database className="w-3.5 h-3.5 text-slate-400 group-hover:text-white shrink-0" />
                      <span className="truncate">Master Data</span>
                      <span className="bg-[#337ab7] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-none shrink-0">
                        {displayedMasterDataSubItems.length}
                      </span>
                    </div>
                    {isMasterDataOpen ? (
                      <ChevronUp className="w-3.5 h-3.5 opacity-80 group-hover:opacity-100 shrink-0" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 opacity-80 group-hover:opacity-100 shrink-0" />
                    )}
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isMasterDataOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden mt-1 ml-2 mr-2 pl-2 space-y-0.5 py-0.5 bg-[#1a2027]/80 rounded-none border-l border-slate-700/60"
                      >
                        {displayedMasterDataSubItems.map((subItem) => {
                          const SubIcon = subItem.icon;
                          const isSubActive = activeTab === subItem.id;
                          const subHealth = menuHealthMap[subItem.id as NavTab] || {
                            level: 'valid',
                            badgeLabel: 'Valid',
                            tooltip: 'Data valid & tuntas',
                            invalidCount: 0,
                            warningCount: 0,
                            validCount: 1
                          };

                          return (
                            <button
                              key={subItem.id}
                              type="button"
                              onClick={() => {
                                onTabChange(subItem.id);
                                if (isMobileDrawer && onClose) onClose();
                              }}
                              className={`w-full text-left pl-2.5 pr-2 py-1.5 rounded-none flex items-center justify-between text-xs transition-colors group cursor-pointer ${
                                isSubActive
                                  ? 'bg-[#337ab7] text-white font-bold shadow-xs'
                                  : 'text-slate-300 hover:text-white hover:bg-[#2d3642] font-medium'
                              }`}
                              title={subHealth.tooltip}
                            >
                              <div className="flex items-center gap-2 min-w-0 mr-1 overflow-hidden">
                                <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                                <span className="truncate">{subItem.label}</span>
                              </div>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Validasi Dropdown Section */}
              {!isStudentRole && (
                <div className="pt-2 pb-1 w-full max-w-full overflow-x-hidden">
                  <button
                    type="button"
                    onClick={() => setIsValidasiOpen(!isValidasiOpen)}
                    className="w-full px-2.5 py-1.5 flex items-center justify-between text-[11px] font-bold text-slate-300 uppercase tracking-wider hover:bg-[#303a47] hover:text-white transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-400 group-hover:text-white shrink-0" />
                      <span className="truncate">Validasi</span>
                      <span className="bg-[#337ab7] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-none shrink-0">
                        {validasiSubItems.length}
                      </span>
                    </div>
                    {isValidasiOpen ? (
                      <ChevronUp className="w-3.5 h-3.5 opacity-80 group-hover:opacity-100 shrink-0" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 opacity-80 group-hover:opacity-100 shrink-0" />
                    )}
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isValidasiOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden mt-1 ml-2 mr-2 pl-2 space-y-0.5 py-0.5 bg-[#1a2027]/80 rounded-none border-l border-slate-700/60"
                      >
                        {validasiSubItems.map((subItem) => {
                          const SubIcon = subItem.icon;
                          const isSubActive = activeTab === subItem.id || (activeTab === 'validasi' && subItem.id === 'validasi-dapodik');
                          const subHealth = menuHealthMap[subItem.id as NavTab] || {
                            level: 'valid',
                            badgeLabel: 'Valid',
                            tooltip: 'Data valid & tuntas',
                            invalidCount: 0,
                            warningCount: 0,
                            validCount: 1
                          };

                          return (
                            <button
                              key={subItem.id}
                              type="button"
                              onClick={() => {
                                onTabChange(subItem.id);
                                if (isMobileDrawer && onClose) onClose();
                              }}
                              className={`w-full text-left pl-2.5 pr-2 py-1.5 rounded-none flex items-center justify-between text-xs transition-colors group cursor-pointer ${
                                isSubActive
                                  ? 'bg-[#337ab7] text-white font-bold shadow-xs'
                                  : 'text-slate-300 hover:text-white hover:bg-[#2d3642] font-medium'
                              }`}
                              title={subHealth.tooltip}
                            >
                              <div className="flex items-center gap-2 min-w-0 mr-1 overflow-hidden">
                                <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                                <span className="truncate">{subItem.label}</span>
                              </div>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Main Navigation Items */}
              {displayedMainNavItems.map(item => renderDesktopItem(item, isMobileDrawer))}

              {/* Settings Item */}
              {renderDesktopItem(settingsItem, isMobileDrawer)}
            </>
          )}
        </nav>
      </div>

      {onLogout && (
        <div className="w-full shrink-0 border-t border-[#35404e] mt-4">
          <button
            type="button"
            onClick={() => {
              if (isMobileDrawer && onClose) onClose();
              onLogout();
            }}
            className="w-full text-left px-4 py-3 rounded-none flex items-center justify-start space-x-2.5 bg-[#d9534f] hover:bg-[#c9302c] active:bg-[#ac2925] text-white font-bold transition-colors cursor-pointer shadow-sm group"
            title="Keluar dari Akun"
          >
            <LogOut className="w-4.5 h-4.5 shrink-0 text-white transition-transform group-hover:-translate-x-0.5" />
            <span className="text-sm font-bold text-white tracking-wide">Keluar</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Minimalist Elegant Quick Navigation Dock (Fixed at bottom on HP / mobile screens < md) */}
      <nav 
        aria-label="Menu Cepat Mobile"
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden pointer-events-none pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] px-2.5 sm:px-4"
      >
        <div className="pointer-events-auto max-w-lg mx-auto bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_10px_35px_-5px_rgba(15,23,42,0.18)] rounded-2xl p-1.5 transition-all">
          <div 
            ref={mobileNavContainerRef}
            className="relative flex items-center gap-1 overflow-x-auto py-0.5 px-0.5 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
          >
            {allVisibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || 
                (item.id === 'validasi' && (activeTab === 'validasi' || activeTab.startsWith('validasi'))) ||
                (item.id === 'validasi-dapodik' && (activeTab === 'validasi' || activeTab === 'validasi-dapodik')) ||
                (item.id === 'system-kesiswaan' && (activeTab === 'system-kesiswaan' || (activeTab as string) === 'kesiswaan'));
              const itemHealth = menuHealthMap[item.id as NavTab];
              return (
                <motion.button
                  type="button"
                  key={item.id}
                  data-active={isActive}
                  onClick={() => onTabChange(item.id)}
                  whileTap={{ scale: 0.94 }}
                  title={`${item.label} (${itemHealth?.badgeLabel || 'Valid'})`}
                  aria-label={item.label}
                  className={`relative flex items-center justify-center shrink-0 h-9 sm:h-10 transition-all duration-200 rounded-xl cursor-pointer select-none ${
                    isActive
                      ? 'px-3 bg-white text-slate-800 shadow-sm shadow-blue-950/20'
                      : 'px-2.5 text-slate-500 hover:text-[#164e63] hover:bg-slate-100/80 active:bg-slate-200/60'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeMobileNavPill"
                      className="absolute inset-0 bg-[#2f618e] rounded-xl -z-0"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}
                  
                  <div className="relative z-10 flex items-center gap-1.5">
                    <div className="relative">
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-white stroke-[2.2]' : 'text-slate-500 stroke-[1.8]'}`} />
                      {itemHealth && itemHealth.invalidCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 border border-white" />
                      )}
                      {itemHealth && itemHealth.warningCount > 0 && (
                        <span className={`absolute -top-1 ${itemHealth.invalidCount > 0 ? '-right-2.5' : '-right-1'} w-2 h-2 rounded-full bg-amber-400 border border-white`} />
                      )}
                      {itemHealth && itemHealth.invalidCount === 0 && itemHealth.warningCount === 0 && (
                        <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 border border-white" />
                      )}
                    </div>
                    {isActive && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.18 }}
                        className="text-xs font-bold text-white whitespace-nowrap tracking-tight"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer (When hamburger 3 lines is clicked on Mobile) */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex pointer-events-auto">
            <motion.div
              key="mobile-drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.aside
              key="mobile-drawer-panel"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              className="relative w-72 max-w-[85vw] bg-[#27313b] text-slate-200 shrink-0 flex flex-col justify-between shadow-2xl h-full overflow-hidden border-r border-[#1e252e] z-10 select-none"
            >
              <div className="p-3.5 pb-2.5 border-b border-[#35404e] flex items-center justify-between shrink-0">
                <span className="text-xs font-black text-white uppercase tracking-wider">Menu Navigasi</span>
                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded cursor-pointer transition-colors"
                    title="Tutup Menu"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto overflow-x-hidden">
                {renderNavContent(true)}
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Animated Sidebar (Opens/Closes with smooth sliding width animation) */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.aside
            key="desktop-sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 272, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
            className="hidden md:flex bg-[#27313b] text-slate-200 shrink-0 flex-col justify-between rounded-none shadow-md md:h-full overflow-hidden border-r border-[#1e252e] select-none"
          >
            <div className="w-68 min-w-[272px] max-w-[272px] flex flex-col justify-between h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto overflow-x-hidden">
                {renderNavContent(false)}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};
