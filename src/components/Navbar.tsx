import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  LogOut, 
  ShieldCheck, 
  LogIn, 
  CheckCircle2, 
  Sparkles,
  Calendar
} from 'lucide-react';
import { TeacherProfile, UserAccount, TeachingScheduleItem } from '../types';
import { subscribeToSchedules } from '../lib/firebaseService';
import { TutWuriHandayaniLogo } from './TutWuriHandayaniLogo';

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

  const isMaster = isMasterUser || teacher?.id === 'PROF-ADMIN';
  const storageKey = teacher?.id ? `simak_schedules_${teacher.id}` : 'simak_schedules';
  const settingsScope = teacher?.id && !isMaster ? `_${teacher.id}` : '';

  const getInitialSchedules = () => {
    const savedKey = localStorage.getItem(storageKey);
    if (savedKey) {
      try {
        const parsed = JSON.parse(savedKey);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    if (isMaster) {
      const savedGen = localStorage.getItem('simak_schedules');
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

  const isKeuanganPage = activeTab === 'system-keuangan';

  const isKurikulumRole = currentUser?.role ? currentUser.role.toLowerCase().includes('kurikulum') : false;
  const isKurikulumPage = activeTab === 'system-kurikulum' || (isKurikulumRole && activeTab === 'settings');
  const isStudentUser = currentUser?.role ? currentUser.role.toLowerCase().includes('siswa') : false;
  const isStudentPage = activeTab === 'system-kesiswaan' || isStudentUser;

  return (
    <header className="bg-cyan-900 border-b border-cyan-800 sticky top-0 z-30 shadow-md">
      {/* Top Banner bar */}
      <div className="bg-cyan-950/80 text-white px-3 md:px-6 pt-[calc(env(safe-area-inset-top,0px)+0.4rem)] pb-1.5 text-[10px] flex justify-between items-center border-b border-cyan-800/80 transition-all">
        <div className="flex items-center space-x-1.5 truncate">
          <span className="font-bold tracking-wide uppercase text-[9px] md:text-[10px] text-white truncate">
            {isStudentUser ? 'LEARNING MANAGEMENT SYSTEM • PLATFORM PEMBELAJARAN DIGITAL MANDIRI' : isKeuanganPage ? 'SISTEM PENGELOLAAN KEUANGAN & ANGGARAN SEKOLAH' : isTuPage ? 'SISTEM INFORMASI ADMINISTRASI TATA USAHA' : isKurikulumPage ? 'SISTEM INFORMASI KURIKULUM MERDEKA' : 'SISTEM INFORMASI AKADEMIK GURU'}
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
      <div className="px-3 md:px-6 py-2 md:py-2.5 w-full flex flex-col md:flex-row justify-between items-stretch md:items-center gap-2 md:gap-3">
        
        {/* Top Row: Emblem Title + User Profile Badge */}
        <div className="flex items-center justify-between gap-3 min-w-0">
          {/* School Emblem Title */}
          <div className="flex items-center space-x-2.5 md:space-x-3 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-13 md:h-13 bg-white rounded-none shadow-sm shrink-0 flex items-center justify-center p-1 md:p-1.5 border border-cyan-700/60">
              <TutWuriHandayaniLogo className="w-full h-full" />
            </div>
            <div className="min-w-0 flex flex-col justify-center space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-black text-white uppercase tracking-wider leading-tight truncate">
                  {isStudentUser ? 'Learning Management System' : isTuPage ? 'ADMINISTRASI TATA USAHA' : isKurikulumPage ? 'KURIKULUM' : 'SIMAK GURU'}
                </h1>
                {!isStudentUser && !isTuPage && !isKurikulumPage && (
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
    </header>
  );
};
