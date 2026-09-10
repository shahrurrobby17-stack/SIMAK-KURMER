import React, { useState } from 'react';
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
  Wallet
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
  | 'system-keuangan'
  | 'system-kesiswaan'
  | 'sync' 
  | 'schedule' 
  | 'extracurricular' 
  | 'ai-assistant' 
  | 'maintenance' 
  | 'settings';

import { UserAccount } from '../types';

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
  currentUser
}) => {
  const [isMasterDataOpen, setIsMasterDataOpen] = useState(true);
  const mobileNavContainerRef = React.useRef<HTMLDivElement>(null);

  const isAdministrator = isAdmin || isMasterUser || Boolean(
    currentUser && (
      currentUser.role?.toLowerCase().includes('admin') ||
      currentUser.role?.toLowerCase().includes('master') ||
      currentUser.email?.toLowerCase().includes('master') ||
      currentUser.email?.toLowerCase() === 'shahrurrobby17@gmail.com'
    )
  );

  const isKurikulumRole = currentUser?.role ? currentUser.role.toLowerCase().includes('kurikulum') : false;
  const isKurikulumOnlyMode = !isAdministrator && (activeTab === 'system-kurikulum' || (isKurikulumRole && activeTab === 'settings'));

  const isTuRole = currentUser?.role ? (currentUser.role.toLowerCase().includes('tu') || currentUser.role.toLowerCase().includes('tata usaha')) : false;
  const isTuOnlyMode = !isAdministrator && (activeTab === 'system-tu' || (isTuRole && activeTab === 'settings'));

  const isStudentRole = currentUser?.role ? currentUser.role.toLowerCase().includes('siswa') : false;

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

  const tuItem = {
    id: 'system-tu' as NavTab,
    label: 'TU',
    subtitle: 'Sistem Tata Usaha',
    icon: Building2,
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

  const systemItems = [
    {
      id: 'system-kurikulum' as NavTab,
      label: 'Kurikulum',
      subtitle: 'Sistem Kurikulum',
      icon: BookOpen,
      badge: null
    },
    {
      id: 'system-guru' as NavTab,
      label: 'Guru',
      subtitle: 'Sistem Guru',
      icon: Users,
      badge: null
    },
    {
      id: 'system-tu' as NavTab,
      label: 'TU',
      subtitle: 'Sistem Tata Usaha',
      icon: Building2,
      badge: null
    },
    {
      id: 'system-keuangan' as NavTab,
      label: 'Keuangan',
      subtitle: 'Sistem Keuangan',
      icon: Wallet,
      badge: null
    },
    {
      id: 'system-kesiswaan' as NavTab,
      label: 'Kesiswaan',
      subtitle: 'LMS & Kesiswaan',
      icon: GraduationCap,
      badge: null
    }
  ];

  const isMasterUserOrAdmin = isMasterUser || isAdmin || isAdministrator;

  const mainNavItems = [
    ...(!isMasterUserOrAdmin ? [
      {
        id: 'students' as NavTab,
        label: 'Data Siswa',
        subtitle: 'Rapor & Rekap',
        icon: GraduationCap,
        badge: null
      },
      {
        id: 'sync' as NavTab,
        label: 'Sinkronisasi',
        subtitle: 'Kenaikan & Pemindahan',
        icon: RefreshCw,
        badge: null
      }
    ] : []),
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
      id: 'ai-assistant' as NavTab,
      label: 'Asisten AI',
      subtitle: 'Tersedia',
      icon: Sparkles,
      badge: null
    },
    {
      id: 'settings' as NavTab,
      label: 'Pengaturan',
      subtitle: 'Konfigurasi Sistem',
      icon: Settings,
      badge: null
    }
  ];

  const masterDataItems = isMasterUserOrAdmin ? [
    {
      id: 'students' as NavTab,
      label: 'Data Siswa',
      subtitle: 'Rapor & Rekap',
      icon: GraduationCap,
      badge: null
    },
    {
      id: 'sync' as NavTab,
      label: 'Sinkronisasi',
      subtitle: 'Kenaikan & Pemindahan',
      icon: RefreshCw,
      badge: null
    },
    {
      id: 'master-data' as NavTab,
      label: 'Monitoring Akun',
      subtitle: 'Master Akun SIMAK',
      icon: Database,
      badge: null
    },
    ...systemItems
  ] : [];

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

  const allVisibleItems = isStudentRole
    ? studentNavItems
    : isKurikulumOnlyMode
    ? [kurikulumItem, settingsItem]
    : isTuOnlyMode
    ? [tuItem, settingsItem]
    : [
        dashboardItem, 
        ...masterDataItems, 
        ...mainNavItems
      ];

  const renderDesktopItem = (item: any) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return (
      <React.Fragment key={item.id}>
        {!isStudentRole && !isKurikulumOnlyMode && !isTuOnlyMode && item.id === 'attendance' && (
          <div className="pt-3 pb-1 px-2.5 text-[10px] font-bold text-blue-200 uppercase tracking-wider flex items-center gap-1">
            <span>NAVIGASI SISWA</span>
          </div>
        )}
        {!isStudentRole && !isKurikulumOnlyMode && !isTuOnlyMode && item.id === 'ai-assistant' && (
          <div className="pt-3 pb-1 px-2.5 text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
            <span>AI & Sistem</span>
          </div>
        )}
        <motion.button 
          type="button" 
          onClick={() => onTabChange(item.id)}
          whileHover={item.id === 'ai-assistant' ? undefined : { x: 2 }}
          whileTap={item.id === 'ai-assistant' ? undefined : { scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={`relative w-full text-left px-3.5 py-2.5 rounded-none transition-colors flex items-center justify-between group cursor-pointer overflow-hidden ${
            isActive
              ? 'bg-white/15 text-white font-semibold border-l-4 border-white shadow-xs'
              : 'hover:bg-white/5 text-white/70 hover:text-white font-medium'
          }`}
        >
          {isActive && (
            <motion.div
              layoutId="activeSidebarBg"
              className="absolute inset-0 bg-white/10 -z-0"
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            />
          )}
          
          <div className="flex items-center space-x-3 relative z-10">
            <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-white' : 'opacity-70 group-hover:opacity-100 text-blue-200'}`} />
            <span className="text-sm font-medium">{item.label}</span>
          </div>
          {item.badge && (
            <span className={`relative z-10 text-[10px] font-bold px-2 py-0.5 rounded-none ${
              item.id === 'ai-assistant'
                ? 'bg-white text-[#004b87] font-black'
                : isActive ? 'bg-blue-400/30 text-white' : 'bg-white/10 text-white/80'
            }`}>
              {item.badge}
            </span>
          )}
        </motion.button>
      </React.Fragment>
    );
  };

  return (
    <>
      {/* Mobile Minimalist Elegant Quick Navigation Dock (Fixed at bottom on HP / mobile screens < md) */}
      <nav 
        aria-label="Menu Cepat Mobile"
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden pointer-events-none pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] px-2.5 sm:px-4"
      >
        <div className="pointer-events-auto max-w-lg mx-auto bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_10px_35px_-5px_rgba(15,23,42,0.18)] rounded-2xl p-1.5 transition-all">
          <div 
            ref={mobileNavContainerRef}
            className="relative flex items-center gap-1 overflow-x-auto py-0.5 px-0.5 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
          >
            {allVisibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <motion.button
                  type="button"
                  key={item.id}
                  data-active={isActive}
                  onClick={() => onTabChange(item.id)}
                  whileTap={{ scale: 0.94 }}
                  title={item.label}
                  aria-label={item.label}
                  className={`relative flex items-center justify-center shrink-0 h-9 sm:h-10 transition-all duration-200 rounded-xl cursor-pointer select-none ${
                    isActive
                      ? 'px-3 bg-[#004b87] text-white shadow-sm shadow-blue-950/20'
                      : 'px-2.5 text-slate-500 hover:text-[#004b87] hover:bg-slate-100/80 active:bg-slate-200/60'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeMobileNavPill"
                      className="absolute inset-0 bg-[#004b87] rounded-xl -z-0"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}
                  
                  <div className="relative z-10 flex items-center gap-1.5">
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-white stroke-[2.2]' : 'text-slate-500 stroke-[1.8]'}`} />
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

      {/* Desktop Sidebar (Only visible on desktop/tablet >= md) */}
      <aside className="hidden md:flex w-64 lg:w-68 bg-[#004b87] text-white shrink-0 p-4 flex-col justify-between rounded-none shadow-sm md:h-full overflow-y-auto">
        <div className="space-y-3">
          <div className="px-2 py-1 text-[10px] font-bold text-blue-200 uppercase tracking-wider flex items-center justify-between">
            <span>{isStudentRole ? 'LMS Siswa Merdeka' : isKurikulumOnlyMode ? 'Sistem Kurikulum' : isTuOnlyMode ? 'Sistem Tata Usaha' : 'Navigasi Utama'}</span>
          </div>

          <nav className="space-y-1">
            {isStudentRole ? (
              <>
                {studentNavItems.map(renderDesktopItem)}
              </>
            ) : isKurikulumOnlyMode ? (
              <>
                {renderDesktopItem(kurikulumItem)}
                {renderDesktopItem(settingsItem)}
                <div className="pt-2 pb-1 px-1">
                  <div className="border-b border-blue-400/30 w-full" />
                </div>
              </>
            ) : isTuOnlyMode ? (
              <>
                {renderDesktopItem(tuItem)}
                {renderDesktopItem(settingsItem)}
                <div className="pt-2 pb-1 px-1">
                  <div className="border-b border-blue-400/30 w-full" />
                </div>
              </>
            ) : (
              <>
                {/* Dashboard Item */}
                {renderDesktopItem(dashboardItem)}

                {/* Master Data Section */}
                {isMasterUserOrAdmin && (
                  <div className="pt-2 pb-1">
                    <button
                      type="button"
                      onClick={() => setIsMasterDataOpen(!isMasterDataOpen)}
                      className="w-full px-2.5 py-1.5 flex items-center justify-between text-[10px] font-bold text-blue-200 uppercase tracking-wider hover:bg-white/5 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-blue-300" />
                        <span>Master Data</span>
                      </div>
                      {isMasterDataOpen ? (
                        <ChevronUp className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
                      )}
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {isMasterDataOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden mt-1 pl-1 space-y-1 border-l border-blue-400/20"
                        >
                          {/* Master Data & System Items */}
                          {masterDataItems.map(renderDesktopItem)}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Main Navigation Items */}
                {mainNavItems.map(renderDesktopItem)}
              </>
            )}
          </nav>
          
          {onLogout && (
            <div className="pt-2 mt-2">
              <button
                type="button"
                onClick={onLogout}
                className="w-full text-left px-3.5 py-2.5 rounded-none flex items-center space-x-3 text-rose-300 hover:text-rose-100 hover:bg-rose-500/20 font-medium transition-colors cursor-pointer group"
              >
                <LogOut className="w-5 h-5 shrink-0 transition-colors opacity-80 group-hover:opacity-100" />
                <span className="text-sm font-medium">Keluar</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
