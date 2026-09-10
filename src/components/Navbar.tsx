import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  LogOut, 
  ShieldCheck, 
  LogIn, 
  CheckCircle2, 
  Sparkles,
  Calendar,
  User
} from 'lucide-react';
import { TeacherProfile, UserAccount, TeachingScheduleItem } from '../types';
import { subscribeToSchedules } from '../lib/firebaseService';
import { TutWuriHandayaniLogo } from './TutWuriHandayaniLogo';

interface NavbarProps {
  teacher: TeacherProfile;
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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner bar */}
      <div className="bg-[#004b87] text-white px-3 md:px-6 pt-[calc(env(safe-area-inset-top,0px)+0.4rem)] pb-1.5 text-[10px] flex justify-between items-center border-b border-slate-800 transition-all">
        <div className="flex items-center space-x-1.5 truncate">
          <span className="font-bold tracking-wide uppercase text-[9px] md:text-[10px] text-blue-100 truncate">
            {isStudentUser ? 'LEARNING MANAGEMENT SYSTEM • PLATFORM PEMBELAJARAN DIGITAL MANDIRI' : isKeuanganPage ? 'SISTEM PENGELOLAAN KEUANGAN & ANGGARAN SEKOLAH' : isTuPage ? 'SISTEM INFORMASI ADMINISTRASI TATA USAHA' : isKurikulumPage ? 'SISTEM INFORMASI KURIKULUM MERDEKA' : 'SISTEM INFORMASI AKADEMIK GURU'}
          </span>
          <span className="hidden md:inline text-blue-400">•</span>
          <span className="hidden md:inline-flex items-center text-amber-300 font-medium text-[10px]">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-amber-400" />
            SIMAK Versi 3.7.0
          </span>

        </div>
        
        <div className="flex items-center space-x-2 text-[9px] md:text-[10px] text-blue-100 shrink-0">
          <div className="hidden sm:flex items-center space-x-1">
            <Calendar className="w-3 h-3 text-blue-300" />
            <span>{dateString}</span>
          </div>
        </div>
      </div>

      {/* Main Header Content */}
      <div className="px-3 md:px-6 py-2 md:py-3 max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-stretch md:items-center gap-2 md:gap-3">
        
        {/* Top Row: Emblem Title + User Profile Badge */}
        <div className="flex items-center justify-between gap-2">
          {/* School Emblem Title */}
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-none shadow-xs shrink-0 flex items-center justify-center p-1 border border-slate-200">
              <TutWuriHandayaniLogo className="w-full h-full" />
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              <h1 className="text-xs md:text-sm font-black text-[#004b87] uppercase tracking-wider leading-none truncate">
                {isStudentUser ? 'Learning Management System' : isTuPage ? 'ADMINISTRASI TATA USAHA' : isKurikulumPage ? 'KURIKULUM' : 'SIMAK GURU'}
              </h1>
              <p className="text-[10px] md:text-[11px] text-slate-600 font-medium tracking-tight mt-1 truncate">
                {teacher.schoolName} {!isStudentPage && <span className="hidden sm:inline">• NPSN: {teacher.npsn}</span>}
              </p>
            </div>
          </div>

          {/* Mobile Action Buttons (Logout on HP) */}
          <div className="md:hidden flex items-center gap-1.5 shrink-0">
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center space-x-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1.5 rounded-none text-xs font-bold transition-all shrink-0 cursor-pointer shadow-2xs"
                title="Keluar dari Aplikasi"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Keluar</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Teacher Info & Photo + Class Filter Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between md:justify-end gap-2 md:gap-3 mt-2 md:mt-0 border-t border-slate-100 md:border-0 pt-2 md:pt-0 w-full md:w-auto">
          {/* Teacher Profile Avatar & Info Card */}
          <div className="flex items-center justify-between md:justify-end gap-2.5 min-w-0 w-full md:w-auto">
            <div className="flex flex-col md:items-end min-w-0 flex-1 md:flex-initial text-left md:text-right">
              <p className="text-[10px] md:text-[11px] font-bold text-[#004b87] truncate">
                {currentUser?.name || teacher.name}
              </p>
              <p className="text-[9px] md:text-[10px] font-semibold text-slate-500 truncate leading-tight">
                {currentUser?.role || teacher.subjectRole || 'Guru Pengampu'}
              </p>
              {!isKurikulumPage && !isTuPage && !isStudentPage && (
                <div className="flex items-center md:justify-end gap-1.5 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${activeClasses.length > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
                  <p className={`text-[9px] md:text-[10px] font-bold truncate ${activeClasses.length > 0 ? 'text-emerald-600' : 'text-slate-500'}`}>
                    Status: Kelas Aktif ({activeClassText})
                  </p>
                </div>
              )}

              {/* Filter Kelas on Laptop/Desktop - directly below status kelas aktif */}
              {showClassSelector && (
                <div className="hidden md:flex items-center justify-end gap-1.5 mt-1">
                  <span className="text-slate-500 font-bold text-[10px]">Filter Kelas:</span>
                  <select 
                    value={selectedClass} 
                    onChange={(e) => onSelectClass(e.target.value)}
                    className="bg-white text-[#004b87] font-extrabold px-2 py-0.5 rounded-none border border-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs text-[11px]"
                  >
                    {classList.map((cls) => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => onTabChange && onTabChange('settings')}
              className="relative w-9 h-9 md:w-10 md:h-10 shrink-0 rounded-full border-2 border-[#004b87]/30 bg-[#004b87] flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#004b87] hover:scale-105 transition-all shadow-xs self-center"
              title="Profil Pengajar"
            >
              <div className="w-full h-full text-white flex items-center justify-center font-bold text-xs md:text-sm">
                {(currentUser?.name || teacher.name) ? (currentUser?.name || teacher.name).charAt(0).toUpperCase() : <User className="w-4 h-4 text-white" />}
              </div>
            </button>
          </div>
          
          {/* Mobile Only Filter Kelas */}
          {showClassSelector && (
            <div className="md:hidden flex items-center justify-between gap-2 bg-slate-50 px-2 py-1.5 rounded-none border border-slate-200/80 w-full shrink-0 mt-1">
              <div className="flex items-center space-x-1.5 text-xs">
                <span className="text-slate-500 font-bold text-[11px]">Filter Kelas:</span>
                <select 
                  value={selectedClass} 
                  onChange={(e) => onSelectClass(e.target.value)}
                  className="bg-white text-[#004b87] font-extrabold px-2 py-0.5 rounded-none border border-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs text-xs"
                >
                  {classList.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                T.A {teacher.academicYear}
              </span>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
