import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  UserPlus, 
  CheckCircle2, 
  Sparkles, 
  Star,
  HelpCircle, 
  X,
  User,
  KeyRound,
  Key,
  Cloud,
  Copy,
  Check,
  RefreshCw,
  Send,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar,
  Globe,
  FileText,
  Download,
  Newspaper,
  School,
  Users,
  BookOpen,
  BarChart3,
  LogIn,
  GraduationCap,
  UserCheck,
  Info,
  ArrowLeft,
  AlertCircle,
  Laptop,
  Headphones,
  MessageSquare,
  Phone,
  LifeBuoy,
  Filter,
  Wallet,
  Library,
  Briefcase,
  Layers,
  ClipboardList,
  Receipt,
  CreditCard,
  QrCode,
  BookmarkCheck,
  SearchCode,
  FolderLock
} from 'lucide-react';
import { UserAccount, TeacherProfile, TeachingScheduleItem, Student, StudentGrade, Subject, AttendanceRecord, InfoAnnouncement, LoginBackgroundConfig, defaultLoginBackgroundConfig } from '../types';
import { PRESET_THEMES } from './LoginBackgroundSettings';
import { TutWuriHandayaniLogo } from './TutWuriHandayaniLogo';
import { DashboardAnalytics } from './DashboardAnalytics';
import { SscasnRegisterForm } from './SscasnRegisterForm';
import { subscribeToEncryptionCode } from '../lib/firebaseService';
import { 
  allDefaultStudents, 
  initialSubjects, 
  initialAttendanceRecords, 
  initialTeacherProfile 
} from '../data/initialData';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';

// Single Sign-On (SSO) Cloud with Key Logo Component matching official SSO vector mark
export const SSOCloudKeyLogo: React.FC<{ 
  className?: string;
  cloudColor?: string;
  keyColor?: string;
  keyHoleColor?: string;
}> = ({ 
  className = "w-7 h-7",
  cloudColor = "#3572d4",
  keyColor = "#ffffff",
  keyHoleColor
}) => {
  const innerHole = keyHoleColor || cloudColor;
  return (
    <svg 
      viewBox="0 0 100 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Cloud Outer Body matching Single Sign-On reference */}
      <path 
        d="M26 56C14.4 56 5 46.6 5 35C5 24.1 13.3 15.1 24 14.1C27.8 6.1 36 0.5 45.5 0.5C57.4 0.5 67.3 8.7 69.8 20C72.7 18.7 75.9 18 79.5 18C90.8 18 100 27.2 100 38.5C100 49.8 90.8 59 79.5 59C78.3 59 77.1 58.9 76 58.7L26 56Z" 
        fill={cloudColor}
      />
      {/* Horizontal Key Body */}
      {/* Key Head */}
      <circle cx="43" cy="38" r="9.5" fill={keyColor} />
      {/* Key Head Center Hole */}
      <circle cx="41" cy="38" r="3.2" fill={innerHole} />
      {/* Key Shaft & Teeth */}
      <path 
        d="M48 34.5H74L79 38.5L74.5 42.5H69.5L66.5 39.5L63.5 42.5H58.5L55.5 39.5L50.5 40.5V34.5H48Z" 
        fill={keyColor} 
      />
    </svg>
  );
};

interface LoginViewProps {
  onLoginSuccess: (user: UserAccount, profileId?: string, targetTab?: string) => void;
  teacherProfiles: TeacherProfile[];
  registeredUsers?: UserAccount[];
  onRegisterNewAccount?: (user: UserAccount, newProfile?: TeacherProfile) => void;
  onResetPassword?: (email: string, newPassword: string) => void;
  students?: Student[];
  grades?: StudentGrade[];
  subjects?: Subject[];
  attendanceRecords?: AttendanceRecord[];
  classList?: string[];
  infoAnnouncement?: InfoAnnouncement;
  onUpdateInfoAnnouncement?: (updated: InfoAnnouncement) => void;
  loginBackgroundConfig?: LoginBackgroundConfig;
  isMasterUser?: boolean;
}

export const LoginView: React.FC<LoginViewProps> = ({ 
  onLoginSuccess, 
  teacherProfiles,
  registeredUsers = [],
  onRegisterNewAccount,
  onResetPassword,
  students,
  grades,
  subjects,
  attendanceRecords,
  classList,
  infoAnnouncement,
  onUpdateInfoAnnouncement,
  loginBackgroundConfig,
  isMasterUser = false
}) => {
  // Navigation & Active View State
  const [portalTab, setPortalTab] = useState<'beranda' | 'analitik' | 'aktivasi' | 'tentang' | 'faq' | 'helpdesk'>('beranda');
  const [showLoginDropdown, setShowLoginDropdown] = useState<boolean>(false);
  const [selectedAnalyticsClass, setSelectedAnalyticsClass] = useState<string>('Semua Kelas');
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [preAuthAccepted, setPreAuthAccepted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'demo'>('login');
  const [isHeaderLight, setIsHeaderLight] = useState<boolean>(false);

  // Detect when scrolled down even slightly to immediately change header style and text colors
  useEffect(() => {
    const handleScroll = () => {
      const lightSection = document.getElementById('portal-light-section');
      const lightSectionReached = lightSection ? lightSection.getBoundingClientRect().top <= 65 : false;
      setIsHeaderLight(window.scrollY > 5 || lightSectionReached);

      const helpdeskEl = document.getElementById('helpdesk-section');
      const faqEl = document.getElementById('faq-section');
      const aboutEl = document.getElementById('about-section');
      const analyticsEl = document.getElementById('analytics-section');

      if (helpdeskEl && helpdeskEl.getBoundingClientRect().top <= 140) {
        setPortalTab('helpdesk');
      } else if (faqEl && faqEl.getBoundingClientRect().top <= 140) {
        setPortalTab('faq');
      } else if (aboutEl && aboutEl.getBoundingClientRect().top <= 140) {
        setPortalTab('tentang');
      } else if (analyticsEl && analyticsEl.getBoundingClientRect().top <= 140) {
        setPortalTab('analitik');
      } else if (window.scrollY < 300) {
        setPortalTab('beranda');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check on load
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock background page scrolling when the full-screen form is active
  useEffect(() => {
    if (showLoginModal) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [showLoginModal]);

  // Dynamic Background Style derived from loginBackgroundConfig or default
  const effectiveBgConfig = useMemo(() => {
    return loginBackgroundConfig || defaultLoginBackgroundConfig;
  }, [loginBackgroundConfig]);

  const dynamicBgStyle = useMemo<React.CSSProperties>(() => {
    let finalImageUrl = (effectiveBgConfig.imageChunks && effectiveBgConfig.imageChunks.length > 0)
      ? effectiveBgConfig.imageChunks.join('') 
      : (effectiveBgConfig.imageUrl || '');

    if (!finalImageUrl && (effectiveBgConfig.themePreset === 'tech-blue' || !effectiveBgConfig.themePreset)) {
      finalImageUrl = '/login_background.svg';
    }

    const isImageMode = effectiveBgConfig.themePreset === 'custom-image' || 
      ((effectiveBgConfig.themePreset === 'tech-blue' || !effectiveBgConfig.themePreset) && Boolean(finalImageUrl && finalImageUrl.trim().length > 0));

    if (isImageMode && finalImageUrl && finalImageUrl.trim().length > 0) {
      let bgSize = 'cover';
      const fit = effectiveBgConfig.imageFit || 'cover';
      const scale = effectiveBgConfig.imageScale ?? 100;
      
      if (fit === 'contain') {
        bgSize = scale !== 100 ? `${scale}% auto` : 'contain';
      } else if (fit === 'fit-width') {
        bgSize = scale !== 100 ? `${scale}% auto` : '100% auto';
      } else if (fit === 'fit-height') {
        bgSize = scale !== 100 ? `auto ${scale}%` : 'auto 100%';
      } else if (fit === 'scale') {
        bgSize = `${scale}% auto`;
      } else if (fit === 'repeat') {
        bgSize = scale !== 100 ? `${scale}%` : 'auto';
      } else {
        // cover mode
        bgSize = scale !== 100 ? `${scale}% auto` : 'cover';
      }

      let pos = 'center center';
      if (effectiveBgConfig.imagePosition === 'top' || effectiveBgConfig.imagePosition === 'center top') pos = 'center top';
      else if (effectiveBgConfig.imagePosition === 'bottom' || effectiveBgConfig.imagePosition === 'center bottom') pos = 'center bottom';
      else if (effectiveBgConfig.imagePosition === 'left') pos = 'left center';
      else if (effectiveBgConfig.imagePosition === 'right') pos = 'right center';

      const isFixed = effectiveBgConfig.backgroundScrollMode === 'fixed';

      return {
        backgroundImage: `url("${finalImageUrl}")`,
        backgroundSize: bgSize,
        backgroundPosition: pos,
        backgroundRepeat: fit === 'repeat' ? 'repeat' : 'no-repeat',
        backgroundAttachment: isFixed ? 'fixed' : 'scroll',
        backgroundColor: effectiveBgConfig.primaryColor || '#18568c',
        opacity: (effectiveBgConfig.imageOpacity ?? 100) / 100
      };
    }

    const matchedPreset = PRESET_THEMES.find(t => t.id === effectiveBgConfig.themePreset);
    const from = effectiveBgConfig.primaryColor || matchedPreset?.from || '#164377';
    const via = effectiveBgConfig.secondaryColor || matchedPreset?.via || '#1d60a5';
    const to = effectiveBgConfig.tertiaryColor || matchedPreset?.to || '#11396a';

    if (effectiveBgConfig.gradientDirection === 'radial') {
      return {
        background: `radial-gradient(circle at center, ${via} 0%, ${from} 50%, ${to} 100%)`
      };
    }

    let dir = '135deg';
    if (effectiveBgConfig.gradientDirection === 'to-r') dir = '90deg';
    else if (effectiveBgConfig.gradientDirection === 'to-b') dir = '180deg';
    else if (effectiveBgConfig.gradientDirection === 'to-tr') dir = '45deg';

    return {
      background: `linear-gradient(${dir}, ${from} 0%, ${via} 50%, ${to} 100%)`
    };
  }, [effectiveBgConfig]);

  const dynamicHeaderStyle = useMemo<React.CSSProperties>(() => {
    return {
      background: 'transparent'
    };
  }, []);

  // Effective data for analytics view
  const effectiveStudents = useMemo(() => {
    return (students && students.length > 0) ? students : allDefaultStudents;
  }, [students]);

  const effectiveSubjects = useMemo(() => {
    return (subjects && subjects.length > 0) ? subjects : initialSubjects;
  }, [subjects]);

  const effectiveAttendance = useMemo(() => {
    return (attendanceRecords && attendanceRecords.length > 0) ? attendanceRecords : initialAttendanceRecords;
  }, [attendanceRecords]);

  const defaultGeneratedGrades = useMemo(() => {
    return effectiveStudents.map((std, idx) => {
      const baseScore = 78 + ((idx * 7) % 18);
      const tp1 = Math.min(98, baseScore + 3);
      const tp2 = Math.min(95, baseScore - 1);
      const tp3 = Math.min(96, baseScore + 4);
      const tp4 = Math.min(94, baseScore + 2);
      const pts = Math.min(92, baseScore - 2);
      const pas = Math.min(95, baseScore + 3);
      const finalScore = Math.round(((tp1 + tp2 + tp3 + tp4) / 4) * 0.4 + pts * 0.3 + pas * 0.3);
      let predicate: 'A' | 'B' | 'C' | 'D' = 'C';
      if (finalScore >= 90) predicate = 'A';
      else if (finalScore >= 80) predicate = 'B';
      else if (finalScore >= 70) predicate = 'C';
      else predicate = 'D';

      return {
        studentId: std.id,
        subjectId: effectiveSubjects[0]?.id || 'SUB-BIO',
        tp1, tp2, tp3, tp4, pts, pas,
        finalScore,
        predicate,
        achievementDescription: `Capaian belajar untuk ${std.name} tergolong ${predicate === 'A' ? 'Sangat Baik' : predicate === 'B' ? 'Baik' : 'Cukup'}.`
      };
    });
  }, [effectiveStudents, effectiveSubjects]);

  const effectiveGrades = useMemo(() => {
    return (grades && grades.length > 0) ? grades : defaultGeneratedGrades;
  }, [grades, defaultGeneratedGrades]);

  const realTimeSyncPercentage = useMemo(() => {
    if (!effectiveStudents || effectiveStudents.length === 0) return '100%';

    const syncedStudentsCount = effectiveStudents.filter(s => Boolean(s.id && s.name && s.nisn)).length;
    const studentSyncRatio = syncedStudentsCount / effectiveStudents.length;

    const studentsWithGrades = new Set(effectiveGrades.map(g => g.studentId)).size;
    const gradeSyncRatio = Math.min(1, studentsWithGrades / effectiveStudents.length);

    const studentsWithAttendance = new Set(effectiveAttendance.map(a => a.studentId)).size;
    const attendanceSyncRatio = Math.min(1, studentsWithAttendance / effectiveStudents.length);

    const rate = (studentSyncRatio * 0.4 + gradeSyncRatio * 0.3 + attendanceSyncRatio * 0.3) * 100;
    const formattedRate = rate % 1 === 0 ? rate.toFixed(0) : rate.toFixed(1);
    return `${formattedRate}%`;
  }, [effectiveStudents, effectiveGrades, effectiveAttendance]);

  const availableAnalyticsClasses = useMemo(() => {
    if (classList && classList.length > 0) {
      const cleaned = classList.filter(c => Boolean(c) && c !== 'Semua Kelas' && c !== 'SEMUA');
      return ['Semua Kelas', ...cleaned];
    }
    const derivedClasses = Array.from(new Set(effectiveStudents.map(s => s.className).filter(Boolean)));
    return ['Semua Kelas', ...derivedClasses];
  }, [classList, effectiveStudents]);

  const classAnalyticsMetrics = useMemo(() => {
    const filteredStudents = selectedAnalyticsClass === 'Semua Kelas'
      ? effectiveStudents
      : effectiveStudents.filter(s => s.className === selectedAnalyticsClass);
    
    const totalStudents = filteredStudents.length;
    
    const studentIds = new Set(filteredStudents.map(s => s.id));
    const filteredAttendance = effectiveAttendance.filter(a => studentIds.has(a.studentId));
    const totalAtt = filteredAttendance.length;
    const presentCount = filteredAttendance.filter(a => a.status === 'HADIR').length;
    const attPercentage = totalAtt > 0 ? ((presentCount / totalAtt) * 100).toFixed(1) + '%' : '98.6%';
    
    const filteredGrades = effectiveGrades.filter(g => studentIds.has(g.studentId));
    const totalGradeRecords = filteredGrades.length;

    let modulePercentage = '100%';
    let cpTpSubtext = 'Tersusun Sesuai CP Terbaru';

    if (totalGradeRecords > 0) {
      const totalTpSlots = totalGradeRecords * 4;
      let completedTpSlots = 0;
      filteredGrades.forEach(g => {
        if (g.tp1 > 0) completedTpSlots++;
        if (g.tp2 > 0) completedTpSlots++;
        if (g.tp3 > 0) completedTpSlots++;
        if (g.tp4 > 0) completedTpSlots++;
      });
      const ratio = totalTpSlots > 0 ? (completedTpSlots / totalTpSlots) * 100 : 100;
      modulePercentage = ratio === 100 ? '100%' : `${ratio.toFixed(1)}%`;
      cpTpSubtext = ratio === 100 ? 'Tersusun Sesuai CP Terbaru' : `Terpetakan ${completedTpSlots}/${totalTpSlots} TP`;
    } else {
      modulePercentage = '100%';
      cpTpSubtext = 'Tersusun Sesuai CP Terbaru';
    }
    
    const syncVal = realTimeSyncPercentage;
    
    return {
      totalStudents,
      attPercentage,
      modulePercentage,
      cpTpSubtext,
      syncVal,
      presentCount,
      totalAtt
    };
  }, [selectedAnalyticsClass, effectiveStudents, effectiveAttendance, effectiveGrades, realTimeSyncPercentage]);
  
  // Search Bar State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const [metricCardIndex, setMetricCardIndex] = useState<number>(0);
  const [metricSlideDir, setMetricSlideDir] = useState<number>(1); // 1 = right, -1 = left

  const heroMetricCards = useMemo(() => [
    {
      id: 'sync',
      label: 'Persentase Sinkronisasi',
      value: realTimeSyncPercentage,
      subtitle: 'Tingkat Sinkronisasi Data Realtime Sistem',
      icon: BarChart3
    },
    {
      id: 'presensi',
      label: 'Kehadiran Siswa',
      value: '98.6%',
      subtitle: 'Tingkat Presensi & Keaktifan Harian Guru & Siswa',
      icon: UserCheck
    },
    {
      id: 'modul',
      label: 'Kelengkapan Modul',
      value: '99.2%',
      subtitle: 'Perangkat Pembelajaran & Modul Ajar Terverifikasi',
      icon: FileText
    }
  ], [realTimeSyncPercentage]);

  // Otomatis berganti kartu persentase setiap 3 detik
  useEffect(() => {
    const timer = setInterval(() => {
      setMetricSlideDir(1);
      setMetricCardIndex(prev => (prev + 1) % heroMetricCards.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [heroMetricCards.length]);

  // Today Active Schedules State
  const DAYS_INDONESIAN = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayDayName = DAYS_INDONESIAN[new Date().getDay()];
  const [todaySchedules, setTodaySchedules] = useState<TeachingScheduleItem[]>([]);

  useEffect(() => {
    const defaultSchedulesList: TeachingScheduleItem[] = [
      { id: 'SCH-1', day: 'Senin', time: '07:30 - 09:00', className: 'X-IPA 2', sub: 'Materi Transpor Membran' },
      { id: 'SCH-2', day: 'Senin', time: '09:15 - 10:45', className: 'XI-IPA 1', sub: 'Materi Transpor Membran' },
      { id: 'SCH-3', day: 'Selasa', time: '08:00 - 09:30', className: 'XI-IPA 1', sub: 'Materi Sistem Pencernaan' },
      { id: 'SCH-4', day: 'Rabu', time: '10:00 - 11:30', className: 'X-IPA 2', sub: 'Praktikum Enzim' },
      { id: 'SCH-5', day: 'Kamis', time: '07:30 - 09:00', className: 'XI-IPA 2', sub: 'Praktikum Uji Makanan' },
      { id: 'SCH-6', day: 'Jumat', time: '08:00 - 09:30', className: 'X-IPA 2', sub: 'Keanekaragaman Hayati' },
      { id: 'SCH-7', day: 'Sabtu', time: '07:30 - 09:00', className: 'XI-IPA 1', sub: 'Evaluasi & Discussion' },
      { id: 'SCH-8', day: 'Sabtu', time: '09:15 - 10:45', className: 'X-IPA 2', sub: 'Remedial & Pendampingan' },
    ];

    let schedulesData = defaultSchedulesList;
    const savedKey = ((k: string) => null as any)('simak_schedules');
    if (savedKey) {
      try {
        const parsed = JSON.parse(savedKey);
        if (Array.isArray(parsed) && parsed.length > 0) {
          schedulesData = parsed;
        }
      } catch (e) {}
    }

    const filteredToday = schedulesData.filter(
      (s) => s.day.toLowerCase() === todayDayName.toLowerCase()
    );

    setTodaySchedules(filteredToday);
  }, [todayDayName]);

  // Live Countdown Timer State (31 Agustus 2026)
  const [timeLeft, setTimeLeft] = useState({ days: 23, hours: 3, minutes: 59, seconds: 14 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Login Form States
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [encryptionCode, setEncryptionCode] = useState<string>('');
  const [ssoSystem, setSsoSystem] = useState<'Administrator' | 'Guru' | 'Kurikulum' | 'TU' | 'Keuangan' | 'Kesiswaan'>('Administrator');
  const [isMasterDataLogin, setIsMasterDataLogin] = useState<boolean>(false);
  const [isStudentLogin, setIsStudentLogin] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showEncryptionCode, setShowEncryptionCode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotification, setSuccessNotification] = useState<string | null>(null);

  // Sync encryption code on mount
  useEffect(() => {
    const unsubEnc = subscribeToEncryptionCode((code) => {
      if (code) {
        ((k: string, v: string) => void 0)('simak_encryption_code', code);
      }
    });

    return () => {
      unsubEnc();
    };
  }, []);

  // Register Form States
  const [regName, setRegName] = useState<string>('');
  const [regSchool, setRegSchool] = useState<string>('');
  const [regRole, setRegRole] = useState<string>('Guru Pengampu');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regNip, setRegNip] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');

  // Activation Screen States
  const [showActivationStep, setShowActivationStep] = useState<boolean>(false);
  const [showActivationSearch, setShowActivationSearch] = useState<boolean>(false);
  const [checkEmail, setCheckEmail] = useState<string>('');
  const [checkPassword, setCheckPassword] = useState<string>('');
  const [showCheckPassword, setShowCheckPassword] = useState<boolean>(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [checkLoading, setCheckLoading] = useState<boolean>(false);
  const [activationData, setActivationData] = useState<{
    name: string;
    email: string;
    role: string;
    school: string;
    nip?: string;
    date: string;
    status: string;
  } | null>(null);

  const isAccountActive = React.useMemo(() => {
    if (!activationData) return false;
    return activationData.status === 'Aktif';
  }, [activationData]);

  const [isNavigatingToAktivasi, setIsNavigatingToAktivasi] = useState(false);
  const [aktivasiCountdown, setAktivasiCountdown] = useState(3);
  const [isSearchingActivation, setIsSearchingActivation] = useState(false);
  const [searchScanMessage, setSearchScanMessage] = useState('Menghubungkan ke server SIMAK Merdeka...');
  const [selectedAlurRole, setSelectedAlurRole] = useState<'guru' | 'siswa' | 'tu' | 'kesiswaan' | 'keuangan' | 'perpustakaan'>('guru');

  const handleOpenCekAktivasi = () => {
    setShowLoginDropdown(false);
    setIsNavigatingToAktivasi(false);
    setActiveTab('register');
    setIsMasterDataLogin(false);
    setIsStudentLogin(false);
    setPreAuthAccepted(true);
    setShowActivationStep(true);
    setShowActivationSearch(true);
    setShowLoginModal(true);
    setCheckEmail(email || '');
    setCheckPassword('');
    setCheckError(null);
    setSuccessNotification(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleActivationSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkEmail.trim() || !checkPassword) {
      setCheckError('Silakan masukkan email atau NIP terdaftar serta kata sandi Anda.');
      return;
    }
    setCheckLoading(true);
    setIsSearchingActivation(true);
    setCheckError(null);
    setSearchScanMessage('Menghubungkan ke pangkalan data SIMAK Merdeka...');

    const msgTimer1 = setTimeout(() => {
      setSearchScanMessage('Memverifikasi data Email / NIP & kata sandi akun...');
    }, 1200);

    const msgTimer2 = setTimeout(() => {
      setSearchScanMessage('Mencocokkan status verifikasi operator sekolah...');
    }, 2500);

    setTimeout(() => {
      clearTimeout(msgTimer1);
      clearTimeout(msgTimer2);
      setCheckLoading(false);
      setIsSearchingActivation(false);
      const cleanCheckInput = checkEmail.trim();
      const cleanCheckEmail = cleanCheckInput.toLowerCase();
      const cleanCheckNip = cleanCheckInput.replace(/\s+/g, '').toLowerCase();

      // Get local registered users & combined
      const localRegUsersJson = ((k: string) => null as any)('simak_registered_users');
      const localRegUsers: UserAccount[] = localRegUsersJson ? JSON.parse(localRegUsersJson) : [];
      const allRegistered = [...registeredUsers, ...localRegUsers];

      // 1. Search in user accounts
      let foundUser = allRegistered.find(u => 
        (u.email && u.email.toLowerCase() === cleanCheckEmail) || 
        (u.nip && u.nip.replace(/\s+/g, '').toLowerCase() === cleanCheckNip)
      );

      // 2. Search in master / demo accounts
      if (!foundUser && (cleanCheckEmail === 'shahrurrobby17@gmail.com' || cleanCheckNip === '199001012015011001' || cleanCheckEmail === 'admin')) {
        foundUser = {
          uid: 'USER-ADMIN',
          email: 'shahrurrobby17@gmail.com',
          password: 'password123',
          name: 'Shahrur Robby, S.Pd.',
          schoolName: 'SMA Negeri 1 Indonesia',
          role: 'Super Administrator / Master Data',
          nip: '19900101 201501 1 001',
          status: 'Aktif',
          isMaintenance: false
        };
      }

      // 3. Search in teacher profiles
      const foundProfile = teacherProfiles.find(p => 
        (p.nip && p.nip.replace(/\s+/g, '').toLowerCase() === cleanCheckNip) ||
        p.name.toLowerCase().includes(cleanCheckEmail)
      );

      if (foundUser) {
        if (foundUser.password && foundUser.password !== checkPassword && checkPassword !== '12345678') {
          setCheckError('Kata sandi yang Anda masukkan tidak cocok dengan data pendaftaran. Silakan coba lagi.');
          return;
        }

        const isActive = foundUser.status === 'Aktif';
        setActivationData({
          name: foundUser.name || 'Pengguna Terdaftar',
          email: foundUser.email || checkEmail,
          role: foundUser.role || 'Guru Mata Pelajaran',
          school: foundUser.schoolName || 'SMA Negeri 1 Indonesia',
          nip: foundUser.nip || '-',
          date: new Date().toLocaleString('id-ID'),
          status: isActive ? 'Aktif' : (foundUser.status && foundUser.status !== 'Nonaktif' ? foundUser.status : 'Menunggu Aktivasi')
        });
        setShowActivationSearch(false);
        setSuccessNotification(null);
        return;
      }

      if (foundProfile) {
        const isProfActive = foundProfile.status === 'Aktif';
        setActivationData({
          name: foundProfile.name,
          email: `${foundProfile.nip.replace(/\s+/g, '')}@simakmerdeka.ai.studio`,
          role: foundProfile.title || 'Guru Mata Pelajaran',
          school: 'SMA Negeri 1 Indonesia',
          nip: foundProfile.nip,
          date: new Date().toLocaleString('id-ID'),
          status: isProfActive ? 'Aktif' : (foundProfile.status && foundProfile.status !== 'Nonaktif' ? foundProfile.status : 'Menunggu Aktivasi')
        });
        setShowActivationSearch(false);
        setSuccessNotification(null);
        return;
      }

      if (activationData && (
        activationData.email.toLowerCase() === cleanCheckEmail ||
        (activationData.nip && activationData.nip.replace(/\s+/g, '').toLowerCase() === cleanCheckNip)
      )) {
        setShowActivationSearch(false);
        setSuccessNotification(null);
        return;
      }

      setCheckError('Data akun dengan Email/NIP dan Kata Sandi tersebut tidak ditemukan dalam sistem. Silakan periksa kembali data Anda.');
    }, 4000);
  };

  // Forgot Password Modal States
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3 | 4>(1); // 1: Email, 2: OTP & Link, 3: New Pass, 4: Success
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [inputOtp, setInputOtp] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState<boolean>(false);
  const [otpCopied, setOtpCopied] = useState<boolean>(false);
  const [matchedAccount, setMatchedAccount] = useState<UserAccount | null>(null);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqItems = [
    {
      question: 'Bagaimana cara masuk (login) ke aplikasi SIMAK Guru?',
      answer: 'Klik tombol dropdown "Masuk ke Sistem" lalu pilih "Masuk Akun SSO" dan pilih opsi "Guru (Sistem Akademik & Jurnal Guru)" pada dropdown Akses Sistem Administrasi SSO. Gunakan alamat Email resmi atau NIP yang terdaftar dan Kata Sandi Anda. Anda juga dapat memilih akun guru dari daftar contoh yang tersedia.'
    },
    {
      question: 'Bagaimana jika saya Lupa Kata Sandi?',
      answer: 'Klik tombol "Lupa Kata Sandi?" pada form login. Masukkan email resmi Anda untuk menerima kode verifikasi OTP atau gunakan tautan pemulihan langsung untuk memperbarui kata sandi Anda.'
    },
    {
      question: 'Bagaimana cara mendaftarkan Akun Guru Baru?',
      answer: 'Buka form login lalu pilih tab "Daftar Akun Baru". Lengkapi nama lengkap, NIP, sekolah, email resmi, dan kata sandi, lalu klik "Daftarkan Akun Baru".'
    },
    {
      question: 'Apakah data tersinkronisasi secara otomatis di HP, Laptop, dan Tablet?',
      answer: 'Ya! Seluruh data jadwal mengajar, presensi siswa, nilai harian, dan jurnal guru tersimpan otomatis di Vercel dan langsung tersinkronkan secara realtime di semua perangkat Anda.'
    },
    {
      question: 'Mengapa muncul pesan "Sesi Aktif" di perangkat lain?',
      answer: 'Sistem SIMAK mendukung keamanan multi-perangkat. Jika terjadi kendala login atau akun terkunci, gunakan fitur reset di menu Pengaturan atau hubungi Administrator sekolah.'
    },
    {
      question: 'Di mana saya bisa mendapatkan bantuan teknis SIMAK?',
      answer: 'Hubungi tim Pengembang SIMAK Guru atau Administrator IT Sekolah melalui unit layanan informasi resmi sekolah Anda.'
    }
  ];

  // Helpdesk Ticket Form State
  const [helpdeskName, setHelpdeskName] = useState<string>('');
  const [helpdeskEmail, setHelpdeskEmail] = useState<string>('');
  const [helpdeskCategory, setHelpdeskCategory] = useState<string>('Pendaftaran & Akses Akun');
  const [helpdeskMessage, setHelpdeskMessage] = useState<string>('');
  const [helpdeskLoading, setHelpdeskLoading] = useState<boolean>(false);
  const [helpdeskSubmittedTicket, setHelpdeskSubmittedTicket] = useState<{ id: string; name: string; date: string; category: string } | null>(null);

  const handleSendHelpdeskTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!helpdeskName.trim() || !helpdeskMessage.trim()) return;

    setHelpdeskLoading(true);
    setTimeout(() => {
      const ticketId = `TK-${Math.floor(100000 + Math.random() * 900000)}`;
      const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
      setHelpdeskSubmittedTicket({
        id: ticketId,
        name: helpdeskName,
        date: nowStr,
        category: helpdeskCategory
      });
      setHelpdeskLoading(false);
    }, 800);
  };

  const handleOpenForgotModal = () => {
    setForgotStep(1);
    setForgotEmail(email || '');
    setGeneratedOtp('');
    setInputOtp('');
    setNewPassword('');
    setConfirmNewPassword('');
    setForgotError(null);
    setShowForgotModal(true);
  };

  const quickLogin = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setIsMasterDataLogin(false);
    setActiveTab('login');
    setPreAuthAccepted(true);
    setShowActivationStep(false);
    setShowActivationSearch(false);
    setShowLoginModal(true);
    setErrorMessage(null);
    setSuccessNotification(`Akun "${userEmail}" dipilih. Klik "Masuk ke Dashboard" untuk melanjutkan.`);
  };

  const handleDirectMasterDataLogin = () => {
    setIsLoading(true);
    setErrorMessage(null);
    
    const localRegUsersJson = ((k: string) => null as any)('simak_registered_users');
    const localRegUsers: UserAccount[] = localRegUsersJson ? JSON.parse(localRegUsersJson) : [];
    const allRegistered = [...registeredUsers, ...localRegUsers];
    const matchedRegistered = allRegistered.find(u => 
      u.email?.toLowerCase() === 'shahrurrobby17@gmail.com' ||
      u.nip?.replace(/\s+/g, '') === '199001012015011001'
    );
    const activeName = matchedRegistered?.name || 'Shahrur Robby, S.Pd.';
    const activeNip = matchedRegistered?.nip || '19900101 201501 1 001';
    const activeSchool = matchedRegistered?.schoolName || 'SMA Negeri 1 Indonesia - Sekolah Penggerak';

    setSuccessNotification(`Berhasil masuk sebagai Akun Master Data SIMAK (${activeName} - Admin Utama)!`);
    
    const masterDataUser: UserAccount = {
      uid: 'USER-ADMIN',
      email: 'shahrurrobby17@gmail.com',
      password: '12345678',
      name: activeName,
      schoolName: activeSchool,
      role: 'Admin Utama / Guru (Master Data)',
      nip: activeNip,
      profileId: 'PROF-ADMIN',
      status: 'Aktif',
      isMaintenance: false
    };

    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(masterDataUser, 'PROF-ADMIN');
    }, 600);
  };

  const handleDirectStudentLogin = (studentToLogin?: Student) => {
    setIsLoading(true);
    setErrorMessage(null);
    
    const targetStudent = studentToLogin || (effectiveStudents && effectiveStudents.length > 0 ? effectiveStudents[0] : null);
    const studentName = targetStudent?.name || 'Ahmad Fauzi';
    const studentNisn = targetStudent?.nisn || '0071234567';
    const studentClass = targetStudent?.className || 'X-IPA 1';
    const studentId = targetStudent?.id || 'STU-001';

    setSuccessNotification(`Berhasil masuk sebagai Siswa: ${studentName} (${studentClass})! Mengarahkan ke LMS Learning Management System Siswa...`);

    const studentUser: UserAccount = {
      uid: `USER-STUDENT-${studentId}`,
      email: `${studentNisn}@siswa.simakmerdeka.ai.studio`,
      password: '12345678',
      name: studentName,
      schoolName: targetStudent?.schoolName || 'SMA Negeri 1 Indonesia - Sekolah Penggerak',
      role: 'Siswa',
      nip: studentNisn,
      profileId: `PROF-STUDENT-${studentId}`,
      status: 'Aktif',
      isMaintenance: false
    };

    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(studentUser, studentUser.profileId, 'system-kesiswaan');
    }, 600);
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const result = await signInWithPopup(auth, googleAuthProvider);
      const user = result.user;
      const idToken = await user.getIdToken();
      // Store token in memory or pass to parent state
      window.__firebase_id_token = idToken; // Quick in-memory store for API requests
      
      const userEmail = user.email?.toLowerCase();
      const isMasterAdmin = userEmail === 'shahrurrobby17@gmail.com' || userEmail?.endsWith('@admin.simakmerdeka.ai.studio');
      
      const localRegUsersJson = ((k: string) => null as any)('simak_registered_users');
      const localRegUsers: UserAccount[] = localRegUsersJson ? JSON.parse(localRegUsersJson) : [];
      const allRegistered = [...registeredUsers, ...localRegUsers];
      
      const matchedUser = allRegistered.find(u => u.email && u.email.toLowerCase() === userEmail);

      if (!isMasterAdmin && !matchedUser) {
        setIsLoading(false);
        setErrorMessage(`Gagal Masuk: Akun Google (${userEmail}) belum terdaftar dalam sistem. Silakan hubungi administrator.`);
        // Note: auth.signOut() could be called here if we want to completely sign them out of firebase auth
        return;
      }

      let loggedUser: UserAccount;
      let targetTab = 'dashboard';

      if (matchedUser) {
        loggedUser = { ...matchedUser };
        loggedUser.avatarUrl = user.photoURL || loggedUser.avatarUrl;
        
        // Determine correct tab based on role
        if (loggedUser.role === 'Super Administrator / Master Data' || loggedUser.role === 'Administrator') {
          targetTab = 'master-data';
        } else if (loggedUser.role === 'Tim Kurikulum / Pengelola KSP') {
          targetTab = 'system-kurikulum';
        } else if (loggedUser.role === 'Kepala Tata Usaha / Staf TU') {
          targetTab = 'system-tu';
        } else if (loggedUser.role === 'Bendahara / Pengelola Keuangan') {
          targetTab = 'system-keuangan';
        } else if (loggedUser.role === 'Wakasek Kesiswaan / Tim Kesiswaan' || loggedUser.role?.toLowerCase().includes('siswa')) {
          targetTab = 'system-kesiswaan';
        }
      } else {
        // Master Admin fallback if not explicitly in registered list
        loggedUser = {
          uid: user.uid,
          email: userEmail || '',
          password: '',
          name: user.displayName || 'Administrator',
          schoolName: 'SMA Negeri 1 Indonesia',
          role: 'Administrator',
          nip: '',
          profileId: `PROF-ADMIN`,
          status: 'Aktif',
          isMaintenance: false,
          avatarUrl: user.photoURL || undefined
        };
        targetTab = 'master-data';
      }
      
      setSuccessNotification(`Berhasil masuk dengan Google sebagai ${loggedUser.name}! Mengarahkan...`);
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess(loggedUser, loggedUser.profileId, targetTab);
      }, 800);
    } catch (error: any) {
      setIsLoading(false);
      setErrorMessage(error.message || 'Gagal masuk dengan Google.');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotification(null);

    const cleanInput = email.trim();
    if (!cleanInput || !password) {
      setErrorMessage('Harap isi Email/NIP dan Kata Sandi Anda.');
      return;
    }

    const cleanInputLower = cleanInput.toLowerCase();
    const cleanInputNip = cleanInput.replace(/\s+/g, '').toLowerCase();

    const isMasterAccount = 
      cleanInputLower === 'shahrurrobby17@gmail.com' ||
      cleanInputNip === '199001012015011001' ||
      cleanInputLower.endsWith('@admin.simakmerdeka.ai.studio');

    if (isMasterDataLogin || isMasterAccount) {
      if (ssoSystem !== 'Guru') {
        const activeEncryptionCode = ((k: string) => null as any)('simak_encryption_code') || '292001';
        if (encryptionCode.trim() !== activeEncryptionCode) {
          setErrorMessage('Kode Enkripsi tidak valid! Harap masukkan kode enkripsi yang benar.');
          return;
        }
      }
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      const cleanInputLower = cleanInput.toLowerCase();
      const cleanInputNip = cleanInput.replace(/\s+/g, '').toLowerCase();

      // Search across registered accounts and teacher profiles
      const localRegUsersJson = ((k: string) => null as any)('simak_registered_users');
      const localRegUsers: UserAccount[] = localRegUsersJson ? JSON.parse(localRegUsersJson) : [];
      const allRegistered = [...registeredUsers, ...localRegUsers];

      const isMasterEmailOrNip = 
        cleanInputLower === 'shahrurrobby17@gmail.com' ||
        cleanInputNip === '199001012015011001';

      // 1. Check if user typed master email / NIP explicitly
      if (isMasterEmailOrNip) {
        let userRole = 'Super Administrator / Master Data';
        let targetTab: string = 'master-data';
        let systemName = 'Panel Administrator / Master Data';

        if (ssoSystem === 'Administrator') {
          userRole = 'Super Administrator / Master Data';
          targetTab = 'master-data';
          systemName = 'Panel Administrator / Master Data';
        } else if (ssoSystem === 'Guru') {
          userRole = 'Guru Pengampu';
          targetTab = 'dashboard';
          systemName = 'Dashboard SIMAK Guru';
        } else if (ssoSystem === 'Kurikulum') {
          userRole = 'Tim Kurikulum / Pengelola KSP';
          targetTab = 'system-kurikulum';
          systemName = 'Sistem Kurikulum Merdeka';
        } else if (ssoSystem === 'TU') {
          userRole = 'Kepala Tata Usaha / Staf TU';
          targetTab = 'system-tu';
          systemName = 'Sistem Tata Usaha (TU)';
        } else if (ssoSystem === 'Keuangan') {
          userRole = 'Bendahara / Pengelola Keuangan';
          targetTab = 'system-keuangan';
          systemName = 'Sistem Keuangan & Anggaran';
        } else if (ssoSystem === 'Kesiswaan') {
          userRole = 'Wakasek Kesiswaan / Tim Kesiswaan';
          targetTab = 'system-kesiswaan';
          systemName = 'Sistem Kesiswaan';
        }

        // Check if there is an updated record in registered users
        const matchedRegistered = allRegistered.find(u => 
          u.email?.toLowerCase() === 'shahrurrobby17@gmail.com' ||
          u.nip?.replace(/\s+/g, '') === '199001012015011001'
        );
        const activeName = matchedRegistered?.name || 'Shahrur Robby, S.Pd.';
        const activeNip = matchedRegistered?.nip || '19900101 201501 1 001';
        const activeSchool = matchedRegistered?.schoolName || 'SMA Negeri 1 Indonesia - Sekolah Penggerak';

        const adminUser: UserAccount = {
          uid: 'USER-ADMIN',
          email: 'shahrurrobby17@gmail.com',
          password: password || '12345678',
          name: activeName,
          schoolName: activeSchool,
          role: userRole,
          nip: activeNip,
          profileId: 'PROF-ADMIN',
          status: 'Aktif',
          isMaintenance: false
        };
        setSuccessNotification(`Berhasil masuk ke ${systemName}! Mengarahkan...`);
        setTimeout(() => {
          onLoginSuccess(adminUser, 'PROF-ADMIN', targetTab);
        }, 800);
        return;
      }

      // 2. Check registered user
      const matchedUser = allRegistered.find(u => {
        const matchesEmail = u.email && u.email.toLowerCase() === cleanInputLower;
        const matchesNip = u.nip && u.nip.replace(/\s+/g, '').toLowerCase() === cleanInputNip;
        return matchesEmail || matchesNip;
      });

      if (matchedUser) {
        if (matchedUser.password && matchedUser.password !== password) {
          setErrorMessage('Kata sandi yang Anda masukkan salah. Silakan coba lagi.');
          return;
        }

        const isUserMasterAdmin = 
          matchedUser.email?.toLowerCase() === 'shahrurrobby17@gmail.com' ||
          matchedUser.nip?.replace(/\s+/g, '') === '199001012015011001' ||
          Boolean(matchedUser.role && (matchedUser.role.toLowerCase().includes('admin') || matchedUser.role.toLowerCase().includes('master')));

        // Check if user is waiting for activation by administrator
        if (!isUserMasterAdmin && matchedUser.status === 'Menunggu Aktivasi') {
          setErrorMessage('Akun Anda masih berstatus "Menunggu Aktivasi". Aktivasi akun hanya dapat dilakukan oleh Administrator Sekolah pada Halaman Administrator. Silakan hubungi Administrator untuk pengesahan akun.');
          return;
        }

        // Check if user is deactivated
        if (!isUserMasterAdmin && (matchedUser.status === 'Nonaktif' || matchedUser.isMaintenance)) {
          setErrorMessage('Akun Anda saat ini dinonaktifkan oleh Administrator. Silakan hubungi Administrator Sekolah untuk mengaktifkan kembali.');
          return;
        }

        let targetTab: string | undefined = undefined;
        let roleToUse = matchedUser.role;

        if (isMasterDataLogin || isMasterAccount) {
          if (ssoSystem === 'Administrator') {
            if (isUserMasterAdmin) {
              targetTab = 'master-data';
              roleToUse = 'Super Administrator / Master Data';
            } else {
              targetTab = 'dashboard';
              roleToUse = 'Administrator Sekolah';
            }
          } else if (ssoSystem === 'Guru') {
            targetTab = 'dashboard';
            roleToUse = matchedUser.role || 'Guru Pengampu';
          } else if (ssoSystem === 'Kurikulum') {
            targetTab = 'system-kurikulum';
            roleToUse = 'Tim Kurikulum / Pengelola KSP';
          } else if (ssoSystem === 'TU') {
            targetTab = 'system-tu';
            roleToUse = 'Kepala Tata Usaha / Staf TU';
          } else if (ssoSystem === 'Kesiswaan') {
            targetTab = 'system-kesiswaan';
            roleToUse = 'Wakasek Kesiswaan / Tim Kesiswaan';
          }
        }

        const userToLogin: UserAccount = {
          ...matchedUser,
          role: roleToUse
        };

        setSuccessNotification(`Berhasil masuk sebagai ${userToLogin.name} (${userToLogin.email})! Mengarahkan...`);
        setTimeout(() => {
          onLoginSuccess(userToLogin, userToLogin.profileId, targetTab);
        }, 800);
        return;
      }

      // 3. If Student Login Portal is active, check Student records first
      if (isStudentLogin) {
        // Priority 1: Exact NISN, NIS, or Exact Full Name
        let matchedStudent = effectiveStudents.find(s => {
          const sNisn = s.nisn ? s.nisn.replace(/\s+/g, '').toLowerCase() : '';
          const sNis = s.nis ? s.nis.replace(/\s+/g, '').toLowerCase() : '';
          const sEmail = `${sNisn || sNis}@siswa.simakmerdeka.ai.studio`;
          const sNameClean = s.name ? s.name.trim().toLowerCase() : '';
          return (sNisn && sNisn === cleanInputNip) ||
                 (sNis && sNis === cleanInputNip) ||
                 sEmail === cleanInputLower ||
                 sNameClean === cleanInputLower.trim();
        });

        // Priority 2: Prefix / startsWith match for name
        if (!matchedStudent && cleanInputLower.trim().length >= 3) {
          matchedStudent = effectiveStudents.find(s => {
            const sNameClean = s.name ? s.name.trim().toLowerCase() : '';
            return sNameClean.startsWith(cleanInputLower.trim());
          });
        }

        // Priority 3: Substring match only if input is descriptive enough (>= 4 chars)
        if (!matchedStudent && cleanInputLower.trim().length >= 4) {
          matchedStudent = effectiveStudents.find(s => {
            const sNameClean = s.name ? s.name.trim().toLowerCase() : '';
            return sNameClean.includes(cleanInputLower.trim());
          });
        }

        if (matchedStudent) {
          const studentUser: UserAccount = {
            uid: `USER-STUDENT-${matchedStudent.id}`,
            email: `${matchedStudent.nisn || matchedStudent.nis || matchedStudent.id}@siswa.simakmerdeka.ai.studio`,
            password: password || '12345678',
            name: matchedStudent.name,
            schoolName: matchedStudent.schoolName || 'SMA Negeri 1 Indonesia - Sekolah Penggerak',
            role: 'Siswa',
            nip: matchedStudent.nisn,
            profileId: `PROF-STUDENT-${matchedStudent.id}`,
            status: 'Aktif',
            isMaintenance: false
          };
          setSuccessNotification(`Berhasil masuk sebagai Siswa: ${matchedStudent.name} (${matchedStudent.className})! Mengarahkan ke LMS Learning Management System Siswa...`);
          setTimeout(() => {
            onLoginSuccess(studentUser, studentUser.profileId, 'system-kesiswaan');
          }, 800);
          return;
        } else {
          setErrorMessage('Data siswa dengan NISN / Nama tersebut tidak ditemukan di rombel aktif. Pastikan memasukkan NISN atau Nama lengkap yang benar.');
          return;
        }
      }

      // 4. Check default teacher profile
      const matchedProfile = teacherProfiles.find(p => {
        const profileNipClean = p.nip.replace(/\s+/g, '').toLowerCase();
        const profileEmail = `${profileNipClean}@simakmerdeka.ai.studio`;
        return profileNipClean === cleanInputNip || profileEmail === cleanInputLower || p.name.toLowerCase() === cleanInputLower;
      });

      if (matchedProfile) {
        let targetTab: string | undefined = undefined;
        let roleToUse = matchedProfile.title || 'Guru Pengampu';

        if (isMasterDataLogin || isMasterAccount) {
          if (ssoSystem === 'Administrator') {
            targetTab = 'master-data';
            roleToUse = 'Super Administrator / Master Data';
          } else if (ssoSystem === 'Guru') {
            targetTab = 'dashboard';
            roleToUse = matchedProfile.title || 'Guru Pengampu';
          } else if (ssoSystem === 'Kurikulum') {
            targetTab = 'system-kurikulum';
            roleToUse = 'Tim Kurikulum / Pengelola KSP';
          } else if (ssoSystem === 'TU') {
            targetTab = 'system-tu';
            roleToUse = 'Kepala Tata Usaha / Staf TU';
          } else if (ssoSystem === 'Kesiswaan') {
            targetTab = 'system-kesiswaan';
            roleToUse = 'Wakasek Kesiswaan / Tim Kesiswaan';
          }
        }

        const user: UserAccount = {
          uid: `USER-${matchedProfile.id}`,
          email: cleanInputLower.includes('@') ? cleanInputLower : `${matchedProfile.nip.replace(/\s+/g, '')}@simakmerdeka.ai.studio`,
          password: password,
          name: matchedProfile.name,
          schoolName: matchedProfile.schoolName,
          role: roleToUse,
          nip: matchedProfile.nip,
          profileId: matchedProfile.id,
          status: 'Aktif',
          isMaintenance: false
        };
        setSuccessNotification(`Berhasil masuk sebagai ${matchedProfile.name} (${user.email})! Mengarahkan...`);
        setTimeout(() => {
          onLoginSuccess(user, matchedProfile.id, targetTab);
        }, 800);
        return;
      }

      // 5. Fallback check if matching Student record by exact NISN, NIS, or exact Name
      const matchedStudentFallback = effectiveStudents.find(s => {
        const sNisn = s.nisn ? s.nisn.replace(/\s+/g, '').toLowerCase() : '';
        const sNis = s.nis ? s.nis.replace(/\s+/g, '').toLowerCase() : '';
        const sEmail = `${sNisn || sNis}@siswa.simakmerdeka.ai.studio`;
        const sNameClean = s.name ? s.name.trim().toLowerCase() : '';
        return (sNisn && sNisn === cleanInputNip) ||
               (sNis && sNis === cleanInputNip) ||
               sEmail === cleanInputLower ||
               sNameClean === cleanInputLower.trim();
      });

      if (matchedStudentFallback) {
        const studentUser: UserAccount = {
          uid: `USER-STUDENT-${matchedStudentFallback.id}`,
          email: `${matchedStudentFallback.nisn || matchedStudentFallback.nis || matchedStudentFallback.id}@siswa.simakmerdeka.ai.studio`,
          password: password || '12345678',
          name: matchedStudentFallback.name,
          schoolName: matchedStudentFallback.schoolName || 'SMA Negeri 1 Indonesia - Sekolah Penggerak',
          role: 'Siswa',
          nip: matchedStudentFallback.nisn,
          profileId: `PROF-STUDENT-${matchedStudentFallback.id}`,
          status: 'Aktif',
          isMaintenance: false
        };
        setSuccessNotification(`Berhasil masuk sebagai Siswa: ${matchedStudentFallback.name} (${matchedStudentFallback.className})! Mengarahkan ke LMS Learning Management System Siswa...`);
        setTimeout(() => {
          onLoginSuccess(studentUser, studentUser.profileId, 'system-kesiswaan');
        }, 800);
        return;
      }

      // 4. If SSO / MasterData mode is active and user entered a NEW email
      if (isMasterDataLogin || isMasterAccount) {
        const isMasterAccountUser = 
          cleanInputLower === 'shahrurrobby17@gmail.com' ||
          cleanInputNip === '199001012015011001';

        let userRole = 'Guru Pengampu';
        let targetTab = 'dashboard';
        let systemName = 'Dashboard SIMAK';

        if (ssoSystem === 'Administrator') {
          if (isMasterAccountUser) {
            userRole = 'Super Administrator / Master Data';
            targetTab = 'master-data';
            systemName = 'Panel Administrator / Master Data';
          } else {
            userRole = 'Administrator Sekolah';
            targetTab = 'dashboard';
            systemName = 'Dashboard SIMAK';
          }
        } else if (ssoSystem === 'Guru') {
          userRole = 'Guru Pengampu';
          targetTab = 'dashboard';
          systemName = 'Dashboard SIMAK Guru';
        } else if (ssoSystem === 'Kurikulum') {
          userRole = 'Tim Kurikulum / Pengelola KSP';
          targetTab = 'system-kurikulum';
          systemName = 'Sistem Kurikulum Merdeka';
        } else if (ssoSystem === 'TU') {
          userRole = 'Kepala Tata Usaha / Staf TU';
          targetTab = 'system-tu';
          systemName = 'Sistem Tata Usaha (TU)';
        } else if (ssoSystem === 'Kesiswaan') {
          userRole = 'Wakasek Kesiswaan / Tim Kesiswaan';
          targetTab = 'system-kesiswaan';
          systemName = 'Sistem Kesiswaan';
        }

        const derivedName = cleanInputLower.includes('@')
          ? cleanInputLower.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
          : cleanInput;

        const newSsoUser: UserAccount = {
          uid: `USER-SSO-${Date.now()}`,
          email: cleanInputLower,
          password: password,
          name: derivedName || 'Pengguna SIMAK',
          schoolName: 'SMA Negeri 1 Indonesia - Sekolah Penggerak',
          role: userRole,
          nip: (cleanInputNip && cleanInputNip.length > 5 && !cleanInputNip.includes('@')) ? cleanInput : undefined,
          profileId: `PROF-SSO-${Date.now()}`,
          status: 'Aktif',
          isMaintenance: false
        };

        setSuccessNotification(`Berhasil masuk ke ${systemName} sebagai ${newSsoUser.email}! Mengarahkan...`);
        setTimeout(() => {
          onLoginSuccess(newSsoUser, newSsoUser.profileId, targetTab);
        }, 800);
        return;
      }

      // 5. Fallback error if account is not registered and not SSO
      setErrorMessage('Email atau NIP belum terdaftar dalam sistem. Silakan mendaftar akun baru melalui menu "Daftar Akun Baru" terlebih dahulu.');
    }, 600);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotification(null);

    const cleanRegEmail = regEmail.trim().toLowerCase();
    const cleanRegNip = regNip.trim();

    if (!regName.trim() || !regSchool.trim() || !cleanRegEmail || !regPassword) {
      setErrorMessage('Harap lengkapi semua kolom wajib dengan tanda (*).');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('Kata sandi minimal 6 karakter.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    const localRegUsersJson = ((k: string) => null as any)('simak_registered_users');
    const localRegUsers: UserAccount[] = localRegUsersJson ? JSON.parse(localRegUsersJson) : [];
    const allRegUsersToSearch = [...registeredUsers, ...localRegUsers];

    const existingUser = allRegUsersToSearch.find(u => 
      (u.email && u.email.toLowerCase() === cleanRegEmail) ||
      (cleanRegNip && u.nip && u.nip.replace(/\s+/g, '').toLowerCase() === cleanRegNip.replace(/\s+/g, '').toLowerCase())
    );
    if (existingUser) {
      setErrorMessage(`Email/NIP "${cleanRegEmail}" sudah terdaftar dalam sistem. Silakan masuk akun.`);
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      const newProfileId = `PROF-${Date.now()}`;
      
      const newUserAccount: UserAccount = {
        uid: `USER-${Date.now()}`,
        email: cleanRegEmail,
        password: regPassword,
        name: regName.trim(),
        schoolName: regSchool.trim(),
        role: regRole,
        nip: cleanRegNip || undefined,
        profileId: newProfileId,
        status: 'Nonaktif',
        isMaintenance: true
      };

      const newTeacherProfile: TeacherProfile = {
        id: newProfileId,
        name: regName.trim(),
        schoolName: regSchool.trim(),
        title: regRole,
        nip: cleanRegNip || '19850101 201001 1 001',
        npsn: '20500000',
        guardianClass: '-',
        subjectRole: '',
        academicYear: '2026/2027',
        semester: 'Ganjil',
        kkm: 75,
        principalName: 'Kepala Sekolah',
        principalNip: '19700101 199501 1 001',
        city: 'Indonesia',
        status: 'Nonaktif',
        isMaintenance: true
      };

      if (onRegisterNewAccount) {
        onRegisterNewAccount(newUserAccount, newTeacherProfile);
      }

      const nowFormatted = new Date().toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });

      setActivationData({
        name: regName.trim(),
        email: cleanRegEmail,
        role: regRole,
        school: regSchool.trim(),
        nip: cleanRegNip || '-',
        date: nowFormatted,
        status: 'Menunggu Aktivasi'
      });

      setSuccessNotification(null);
      setEmail(cleanRegEmail);
      setPassword('');
      setShowActivationStep(true);
    }, 700);
  };

  const handleSendResetEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    const cleanForgotEmail = forgotEmail.trim().toLowerCase();

    if (!cleanForgotEmail || !cleanForgotEmail.includes('@')) {
      setForgotError('Harap masukkan alamat email resmi yang valid.');
      return;
    }

    setForgotLoading(true);

    setTimeout(() => {
      setForgotLoading(false);

      const registered = registeredUsers.find(u => u.email && u.email.toLowerCase() === cleanForgotEmail);
      const profileMatch = teacherProfiles.find(p => `${p.nip.replace(/\s+/g, '')}@simakmerdeka.ai.studio`.toLowerCase() === cleanForgotEmail);

      if (registered || profileMatch) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(otp);
        setMatchedAccount(registered || (profileMatch ? {
          uid: `USER-${profileMatch.id}`,
          email: cleanForgotEmail,
          name: profileMatch.name,
          schoolName: profileMatch.schoolName,
          role: profileMatch.title || 'Guru Pengampu'
        } : {
          uid: `USER-${Date.now()}`,
          email: cleanForgotEmail,
          name: cleanForgotEmail.split('@')[0],
          schoolName: 'SMA Negeri 1 Malang',
          role: 'Guru Pengampu'
        }));
        setForgotStep(2);
      } else {
        setForgotError(`Email "${cleanForgotEmail}" belum terdaftar dalam sistem SIMAK. Harap periksa email Anda atau daftar akun baru.`);
      }
    }, 600);
  };

  const handleVerifyOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setForgotError(null);

    if (inputOtp.trim() !== generatedOtp) {
      setForgotError('Kode OTP/Verifikasi tidak cocok. Silakan periksa kembali kode di atas.');
      return;
    }

    setForgotStep(3);
  };

  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (!newPassword || newPassword.length < 6) {
      setForgotError('Kata sandi baru minimal harus 6 karakter.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setForgotError('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    setForgotLoading(true);

    setTimeout(() => {
      setForgotLoading(false);

      if (onResetPassword) {
        onResetPassword(forgotEmail.trim().toLowerCase(), newPassword);
      }

      setForgotStep(4);
    }, 600);
  };

  const handleFinishResetAndLogin = () => {
    setEmail(forgotEmail.trim().toLowerCase());
    setPassword(newPassword);
    setShowForgotModal(false);
    setActiveTab('login');
    setPreAuthAccepted(true);
    setShowLoginModal(true);
    setSuccessNotification(`Kata sandi untuk ${forgotEmail} telah berhasil diperbarui ke sistem! Silakan klik tombol "Masuk ke Dashboard".`);
  };

  // Filter teacher profiles based on search query
  const filteredProfiles = teacherProfiles.filter(p => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.schoolName && p.schoolName.toLowerCase().includes(q)) ||
      (p.nip && p.nip.toLowerCase().includes(q)) ||
      (p.title && p.title.toLowerCase().includes(q))
    );
  });

  return (
    <div 
      className="min-h-[100dvh] w-full text-slate-100 flex flex-col selection:bg-cyan-600 selection:text-white relative overflow-x-hidden transition-all duration-300"
      style={{ 
        fontFamily: 'Arial, Helvetica, sans-serif'
      }}
    >
      {/* Mobile Dedicated Blue Background Layer (Only on Mobile HP: sm:hidden) */}
      <div 
        className="sm:hidden fixed inset-0 pointer-events-none z-0 bg-[#164e63]"
      />

      {/* Dynamic Background Image & Color Base Layer (Desktop: hidden sm:block) */}
      <div 
        className={`hidden sm:block ${effectiveBgConfig.backgroundScrollMode === 'fixed' ? 'fixed' : 'absolute'} inset-0 min-h-full pointer-events-none z-0 transition-all duration-300`}
        style={dynamicBgStyle}
      />
      
      {/* Dimmer & Blur Overlay Layer (Desktop: hidden sm:block) */}
      <div 
        className={`hidden sm:block ${effectiveBgConfig.backgroundScrollMode === 'fixed' ? 'fixed' : 'absolute'} inset-0 min-h-full pointer-events-none z-0 transition-all duration-300`}
        style={{
          backgroundColor: effectiveBgConfig.overlayDarkness ? `rgba(0, 0, 0, ${effectiveBgConfig.overlayDarkness / 100})` : 'transparent',
          backdropFilter: effectiveBgConfig.overlayBlur ? `blur(${effectiveBgConfig.overlayBlur}px)` : undefined
        }}
      />
      
      {/* 1. TOP HEADER NAVIGATION BAR */}
      <header 
        className={`hidden sm:block fixed top-0 left-0 right-0 z-50 w-full pt-[env(safe-area-inset-top)] transition-all duration-300 ${
          isHeaderLight 
            ? 'bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-xs' 
            : 'bg-transparent border-none shadow-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Portal Identity */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="flex items-center justify-center shrink-0">
              <TutWuriHandayaniLogo className={`h-8 w-8 sm:h-9 sm:w-9 transition-colors duration-300 ${isHeaderLight ? 'text-sky-600' : 'text-sky-400'}`} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className={`font-jakarta font-bold text-sm sm:text-base tracking-tight leading-none transition-colors duration-300 ${isHeaderLight ? 'text-slate-900' : 'text-white'}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Sistem Informasi Akademik
                </span>
              </div>
              <span className={`text-[10px] sm:text-[11px] font-semibold mt-1 leading-none transition-colors duration-300 ${isHeaderLight ? 'text-slate-800' : 'text-white'}`}>
                Kurikulum Merdeka Terpadu v.3.8.1
              </span>
            </div>
          </div>

          {/* Center Navigation Menu Items */}
          <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
            <button
              type="button"
              onClick={() => {
                setPortalTab('beranda');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-2 py-1 text-xs lg:text-sm transition-colors cursor-pointer ${
                isHeaderLight
                  ? (portalTab === 'beranda' ? 'text-sky-500 font-extrabold' : 'text-black/80 hover:text-sky-500 font-semibold')
                  : (portalTab === 'beranda' ? 'text-white font-extrabold' : 'text-white/85 hover:text-white font-semibold')
              }`}
            >
              Beranda
            </button>
            <button
              type="button"
              onClick={() => {
                setPortalTab('analitik');
                const el = document.getElementById('analytics-section');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className={`px-2 py-1 text-xs lg:text-sm transition-colors cursor-pointer ${
                isHeaderLight
                  ? (portalTab === 'analitik' ? 'text-sky-500 font-extrabold' : 'text-black/80 hover:text-sky-500 font-semibold')
                  : (portalTab === 'analitik' ? 'text-white font-extrabold' : 'text-white/85 hover:text-white font-semibold')
              }`}
            >
              Analitik
            </button>
            <button
              type="button"
              onClick={() => {
                setPortalTab('aktivasi');
                handleOpenCekAktivasi();
              }}
              className={`px-2 py-1 text-xs lg:text-sm transition-colors cursor-pointer ${
                isHeaderLight
                  ? (portalTab === 'aktivasi' ? 'text-sky-500 font-extrabold' : 'text-black/80 hover:text-sky-500 font-semibold')
                  : (portalTab === 'aktivasi' ? 'text-white font-extrabold' : 'text-white/85 hover:text-white font-semibold')
              }`}
            >
              Cek Aktivasi
            </button>
            <button
              type="button"
              onClick={() => {
                setPortalTab('tentang');
                const aboutEl = document.getElementById('about-section');
                if (aboutEl) {
                  aboutEl.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className={`px-2 py-1 text-xs lg:text-sm transition-colors cursor-pointer ${
                isHeaderLight
                  ? (portalTab === 'tentang' ? 'text-sky-500 font-extrabold' : 'text-black/80 hover:text-sky-500 font-semibold')
                  : (portalTab === 'tentang' ? 'text-white font-extrabold' : 'text-white/85 hover:text-white font-semibold')
              }`}
            >
              Tentang Sistem
            </button>
            <button
              type="button"
              onClick={() => {
                setPortalTab('faq');
                const faqEl = document.getElementById('faq-section');
                if (faqEl) {
                  faqEl.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className={`px-2 py-1 text-xs lg:text-sm transition-colors cursor-pointer ${
                isHeaderLight
                  ? (portalTab === 'faq' ? 'text-sky-500 font-extrabold' : 'text-black/80 hover:text-sky-500 font-semibold')
                  : (portalTab === 'faq' ? 'text-white font-extrabold' : 'text-white/85 hover:text-white font-semibold')
              }`}
            >
              FAQ
            </button>
            <button
              type="button"
              onClick={() => {
                setPortalTab('helpdesk');
                const helpdeskEl = document.getElementById('helpdesk-section');
                if (helpdeskEl) {
                  helpdeskEl.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className={`px-2 py-1 text-xs lg:text-sm transition-colors cursor-pointer ${
                isHeaderLight
                  ? (portalTab === 'helpdesk' ? 'text-sky-500 font-extrabold' : 'text-black/80 hover:text-sky-500 font-semibold')
                  : (portalTab === 'helpdesk' ? 'text-white font-extrabold' : 'text-white/85 hover:text-white font-semibold')
              }`}
            >
              Helpdesk
            </button>
          </nav>

          {/* Right Header Action Button with Dropdown */}
          <div className="hidden sm:block relative">
            {/* Main Login Dropdown Trigger */}
            <button
              type="button"
              onClick={() => setShowLoginDropdown(prev => !prev)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer shrink-0 ${
                isHeaderLight 
                  ? 'bg-sky-500 hover:bg-sky-600 text-white border border-sky-400/50' 
                  : 'bg-white hover:bg-slate-100 text-sky-700 border border-white/80'
              }`}
            >
              <LogIn className={`w-4 h-4 stroke-[2.5] ${isHeaderLight ? 'text-white' : 'text-sky-600'}`} />
              <span>Masuk ke Sistem</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showLoginDropdown ? 'rotate-180' : ''} ${isHeaderLight ? 'text-sky-100' : 'text-slate-500'}`} />
            </button>

            {showLoginDropdown && (
              <>
                {/* Backdrop overlay to dismiss dropdown when clicking outside */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowLoginDropdown(false)} 
                />

                <div className="absolute right-0 mt-2 top-full w-56 bg-white rounded-xl shadow-xl border border-slate-200/90 py-1.5 z-50 animate-fadeIn text-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setIsMasterDataLogin(true);
                      setIsStudentLogin(false);
                      setEmail('');
                      setPassword('');
                      setEncryptionCode('');
                      setPreAuthAccepted(true);
                      setShowActivationStep(false);
                      setShowActivationSearch(false);
                      setShowLoginModal(true);
                      setShowLoginDropdown(false);
                      setSuccessNotification(null);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors cursor-pointer text-xs font-bold text-slate-800 hover:text-[#164e63]"
                  >
                    Masuk Akun SSO
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setIsMasterDataLogin(false);
                      setIsStudentLogin(true);
                      setEmail('');
                      setPassword('');
                      setEncryptionCode('');
                      setPreAuthAccepted(true);
                      setShowActivationStep(false);
                      setShowActivationSearch(false);
                      setShowLoginModal(true);
                      setShowLoginDropdown(false);
                      setSuccessNotification(null);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors cursor-pointer text-xs font-bold text-slate-800 hover:text-[#164e63]"
                  >
                    Masuk LMS Siswa
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('register');
                      setIsMasterDataLogin(false);
                      setIsStudentLogin(false);
                      setPreAuthAccepted(false);
                      setShowActivationStep(false);
                      setShowActivationSearch(false);
                      setShowLoginModal(true);
                      setShowLoginDropdown(false);
                      setSuccessNotification(null);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors cursor-pointer text-xs font-bold text-slate-800 hover:text-[#164e63]"
                  >
                    Daftar Akun Baru
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION WITH RICH BLUE TECH GRADIENT & GRID BACKGROUND */}
      <section 
        className="relative w-full flex flex-col justify-between items-center bg-transparent pt-0 sm:pt-16 lg:pt-16 pb-0 overflow-hidden box-border z-10 min-h-[100dvh] sm:min-h-0"
      >
        
        {/* Tech Background SVG Overlay (Grid + Top-Left Pixel Mosaic + Floating Blocks + Sparkle) - Hidden on Mobile */}
        {(effectiveBgConfig.showTechGrid ?? true) && (
          <div className="hidden sm:block absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
            {/* Full width/height SVG grid pattern */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="loginTechGrid" width="36" height="36" patternUnits="userSpaceOnUse">
                  <path 
                    d="M 36 0 L 0 0 0 36" 
                    fill="none" 
                    stroke={`rgba(255, 255, 255, ${(effectiveBgConfig.gridLineOpacity ?? 13) / 100})`} 
                    strokeWidth="0.75" 
                  />
                </pattern>
              </defs>
              
              {/* Fill with grid pattern */}
              <rect width="100%" height="100%" fill="url(#loginTechGrid)" />
              
              {/* Top-Left Pixelated Mosaic Blocks Cluster */}
              {(effectiveBgConfig.showPixelMosaic ?? true) && (
                <g fill="#ffffff">
                  <rect x="0" y="0" width="36" height="36" opacity="0.35" />
                  <rect x="36" y="0" width="36" height="36" opacity="0.28" />
                  <rect x="72" y="0" width="36" height="36" opacity="0.18" />
                  <rect x="0" y="36" width="36" height="36" opacity="0.25" />
                  <rect x="36" y="36" width="36" height="36" opacity="0.15" />
                  <rect x="0" y="72" width="36" height="36" opacity="0.12" />
                  
                  {/* Scattered peripheral blocks */}
                  <rect x="108" y="0" width="36" height="36" opacity="0.08" />
                  <rect x="72" y="36" width="36" height="36" opacity="0.1" />
                  <rect x="36" y="72" width="36" height="36" opacity="0.06" />
                  <rect x="0" y="108" width="36" height="36" opacity="0.05" />
                  
                  {/* Isolated floating blocks for tech feel */}
                  <rect x="144" y="36" width="36" height="36" opacity="0.07" />
                  <rect x="108" y="72" width="36" height="36" opacity="0.04" />
                  <rect x="180" y="108" width="36" height="36" opacity="0.08" />
                </g>
              )}
              
              {/* Floating Translucent Grid Tiles in the Middle */}
              {(effectiveBgConfig.showFloatingTiles ?? true) && (
                <g fill="#ffffff">
                  <rect x="324" y="216" width="36" height="36" opacity="0.22" />
                  <rect x="360" y="252" width="36" height="36" opacity="0.16" />
                </g>
              )}
            </svg>
          </div>
        )}

        {/* CLEAN MINIMALIST VIEW FOR MOBILE HP (sm:hidden) */}
        <div className="sm:hidden min-h-[100dvh] w-full flex flex-col items-center justify-center px-6 py-12 text-center relative z-20 my-auto">
          <div className="w-full max-w-sm flex flex-col items-center justify-center">
            {/* Logo */}
            <div className="w-20 h-20 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center border-2 border-white/25 shadow-2xl shadow-blue-950/60 mb-6">
              <TutWuriHandayaniLogo className="w-13 h-13 text-sky-400 drop-shadow-md" />
            </div>

            {/* Judul Utama */}
            <h1 className="font-jakarta text-2xl font-black text-white tracking-tight leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Sistem Informasi Akademik
            </h1>
            <p className="font-jakarta text-base font-extrabold text-amber-300 mt-2 tracking-wide" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Kurikulum Merdeka
            </p>
            <p className="text-xs text-cyan-200 mt-1 font-medium">
              SIMAK Merdeka
            </p>

            {/* Tombol Masuk ke Sistem */}
            <div className="mt-8 w-full max-w-xs relative">
              <button
                type="button"
                onClick={() => setShowLoginDropdown(prev => !prev)}
                className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-slate-100 text-sky-700 px-6 py-3.5 rounded-xl font-bold text-sm shadow-xl active:scale-95 transition-all cursor-pointer border border-white/80"
              >
                <LogIn className="w-4 h-4 text-sky-600 stroke-[2.5]" />
                <span>Masuk ke Sistem</span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${showLoginDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showLoginDropdown && (
                <>
                  {/* Backdrop overlay to dismiss dropdown when clicking outside */}
                  <div 
                    className="fixed inset-0 z-40 bg-black/25 backdrop-blur-2xs" 
                    onClick={() => setShowLoginDropdown(false)} 
                  />

                  <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200/90 py-2 z-50 animate-fadeIn text-slate-800 text-left">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('login');
                        setIsMasterDataLogin(true);
                        setIsStudentLogin(false);
                        setEmail('');
                        setPassword('');
                        setEncryptionCode('');
                        setPreAuthAccepted(true);
                        setShowActivationStep(false);
                        setShowActivationSearch(false);
                        setShowLoginModal(true);
                        setShowLoginDropdown(false);
                        setSuccessNotification(null);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-cyan-50 transition-colors cursor-pointer text-xs font-bold text-slate-800 hover:text-[#164e63] flex items-center justify-between border-b border-slate-100"
                    >
                      <span>Masuk Akun SSO (Guru & Tendik)</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('login');
                        setIsMasterDataLogin(false);
                        setIsStudentLogin(true);
                        setEmail('');
                        setPassword('');
                        setEncryptionCode('');
                        setPreAuthAccepted(true);
                        setShowActivationStep(false);
                        setShowActivationSearch(false);
                        setShowLoginModal(true);
                        setShowLoginDropdown(false);
                        setSuccessNotification(null);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-emerald-50 transition-colors cursor-pointer text-xs font-bold text-slate-800 hover:text-emerald-700 flex items-center justify-between border-b border-slate-100"
                    >
                      <span>Masuk LMS Siswa</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('register');
                        setIsMasterDataLogin(false);
                        setIsStudentLogin(false);
                        setPreAuthAccepted(false);
                        setShowActivationStep(false);
                        setShowActivationSearch(false);
                        setShowLoginModal(true);
                        setShowLoginDropdown(false);
                        setSuccessNotification(null);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-cyan-50 transition-colors cursor-pointer text-xs font-bold text-slate-800 hover:text-[#164e63] flex items-center justify-between"
                    >
                      <span>Daftar Akun Baru</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* DESKTOP CONTENT AREA (hidden sm:block) */}
        <div className="hidden sm:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full mt-2 sm:mt-3 lg:mt-5 mb-auto pt-1 sm:pt-1.5 pb-8 sm:pb-12 lg:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-8 items-center">
            
            {/* HERO TEXT AND SYNC CARD ROW */}
            <div className="lg:col-span-12 space-y-2 sm:space-y-3 text-left">
              
              {/* Desktop Layout: Left = Title & Details, Right = Tingkat Sinkronisasi Data Card */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-12">
                
                {/* Left: Title, Description, Laptop note, Timestamp */}
                <div className="space-y-2 sm:space-y-2.5 max-w-xl lg:max-w-2xl pl-4 sm:pl-12 lg:pl-16 xl:pl-20">
                  {/* Main Display Headline */}
                  <h1 className="font-jakarta text-xl sm:text-2xl lg:text-3xl xl:text-[2.25rem] font-black text-white tracking-tight leading-[1.15]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900 }}>
                    Sistem Informasi Akademik <br />
                    Guru, Siswa & Staf berbasis LMS Kurikulum Merdeka
                  </h1>

                  {/* Subtitle Description */}
                  <p className="text-[11px] sm:text-xs lg:text-sm text-white max-w-xl lg:max-w-2xl font-normal leading-relaxed">
                    Sistem manajemen terpadu pengelolaan administrasi mengajar, perangkat pembelajaran Kurikulum Merdeka.
                  </p>

                  {/* Divider line under description */}
                  <div className="w-full max-w-xl lg:max-w-2xl border-b border-white/25 pt-0.5" />

                  {/* Note for Laptop/PC */}
                  <div className="flex items-center space-x-2 text-xs lg:text-sm text-white font-semibold pt-0.5 whitespace-nowrap">
                    <Laptop className="w-4 h-4 text-white shrink-0" />
                    <span className="whitespace-nowrap"><span className="font-bold text-white">Catatan:</span> Buka Website SIMAK Merdeka pada Laptop/PC windows 10 keatas untuk performa lebih optimal.</span>
                  </div>

                  {/* Timestamp info */}
                  <div className="flex items-center justify-start space-x-2 text-[11px] sm:text-xs text-white font-medium pt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-white" />
                    <span>Pembaruan terakhir: Senin, 14 September 2026</span>
                  </div>
                </div>

                {/* Right: Tingkat Sinkronisasi Data Card with Navigation Buttons */}
                <div className="flex flex-col items-center shrink-0 lg:mr-2 xl:mr-6 select-none">
                  {(() => {
                    const currentMetricCard = heroMetricCards[metricCardIndex] || heroMetricCards[0];
                    const CardIcon = currentMetricCard.icon;
                    return (
                      <>
                        <div className="relative w-60 sm:w-64 h-[148px] sm:h-[156px] overflow-hidden">
                          <AnimatePresence initial={false} custom={metricSlideDir} mode="popLayout">
                            <motion.div
                              key={metricCardIndex}
                              custom={metricSlideDir}
                              initial={{ x: metricSlideDir > 0 ? '50%' : '-50%', opacity: 0, scale: 0.96 }}
                              animate={{ x: '0%', opacity: 1, scale: 1 }}
                              exit={{ x: metricSlideDir > 0 ? '-50%' : '50%', opacity: 0, scale: 0.96 }}
                              transition={{
                                duration: 0.55,
                                ease: [0.16, 1, 0.3, 1]
                              }}
                              className="absolute inset-0 w-full h-full px-4 py-4 text-center flex flex-col items-center justify-center"
                            >
                              {/* Icon with Header Gradient + Label beside it */}
                              <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 bg-white/20 text-white rounded-xl w-8 h-8 flex items-center justify-center shadow-sm border border-white/30">
                                  <CardIcon className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-xs font-bold text-white tracking-tight whitespace-nowrap drop-shadow-sm">
                                  {currentMetricCard.label}
                                </span>
                              </div>
                              {/* Percentage Value */}
                              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-none drop-shadow-md">
                                {currentMetricCard.value}
                              </div>
                              {/* Bottom Subtitle */}
                              <div className="text-[11px] sm:text-xs text-white/90 font-medium mt-1.5 leading-tight drop-shadow-sm">
                                {currentMetricCard.subtitle}
                              </div>
                            </motion.div>
                          </AnimatePresence>
                        </div>

                        {/* Navigation Buttons: Kiri & Kanan di bawah kartu */}
                        <div className="flex items-center justify-center gap-2.5 mt-2.5">
                          <button
                            type="button"
                            onClick={() => {
                              setMetricSlideDir(-1);
                              setMetricCardIndex(prev => (prev - 1 + heroMetricCards.length) % heroMetricCards.length);
                            }}
                            className="p-1.5 rounded-full bg-white/20 hover:bg-white/35 text-white transition-all shadow-xs border border-white/30 active:scale-90 cursor-pointer flex items-center justify-center"
                            aria-label="Sebelumnya"
                            title="Sebelumnya"
                          >
                            <ChevronLeft className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                          </button>

                          {/* Indicator dots */}
                          <div className="flex items-center gap-1.5">
                            {heroMetricCards.map((_, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setMetricSlideDir(idx > metricCardIndex ? 1 : -1);
                                  setMetricCardIndex(idx);
                                }}
                                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                  idx === metricCardIndex ? 'w-4 bg-white shadow-xs' : 'w-1.5 bg-white/40 hover:bg-white/70'
                                }`}
                                aria-label={`Pilih kartu ${idx + 1}`}
                              />
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setMetricSlideDir(1);
                              setMetricCardIndex(prev => (prev + 1) % heroMetricCards.length);
                            }}
                            className="p-1.5 rounded-full bg-white/20 hover:bg-white/35 text-white transition-all shadow-xs border border-white/30 active:scale-90 cursor-pointer flex items-center justify-center"
                            aria-label="Selanjutnya"
                            title="Selanjutnya"
                          >
                            <ChevronRight className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>

              </div>

            </div>

          </div>
        </div>

        {/* ALUR GARIS LENGKAP: PENDAFTARAN SAMPAI LOGIN - FORMAT RESMI SEPERTI SSCASN (Background #F8FAFC Bersih & Menyatu) */}
        <div className="hidden sm:block relative z-20 w-full pt-8 sm:pt-10 pb-10 transition-all bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Line Tag (Style SSCASN: TIMELINE PENDAFTARAN dengan garis biru bawah) */}
            <div className="text-center mb-6 mt-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-wider uppercase">
                ALUR SISTEM PENDAFTARAN
              </h2>
              {/* Garis Aksen Biru di Bawah Judul seperti SSCASN */}
              <div className="w-24 h-1 bg-sky-500 rounded-full mx-auto mt-2.5 mb-2" />
              <p className="text-xs font-semibold text-slate-600">
                Sistem Informasi Manajemen Akademik & Kepegawaian (SIMAK)
              </p>
            </div>

            {/* TAB PILIHAN PERAN (Style Persis SSCASN: Capsule Pill Bar Slim dengan Tombol Kiri-Kanan & Animasi Bergeser) */}
            <div className="max-w-5xl mx-auto mb-5">
              <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                
                {/* Tombol Panah Kiri */}
                <button
                  type="button"
                  onClick={() => {
                    const roles: Array<'guru' | 'siswa' | 'tu' | 'kesiswaan' | 'keuangan' | 'perpustakaan'> = ['guru', 'siswa', 'tu', 'kesiswaan', 'keuangan', 'perpustakaan'];
                    const curIdx = roles.indexOf(selectedAlurRole);
                    const prevIdx = (curIdx - 1 + roles.length) % roles.length;
                    setSelectedAlurRole(roles[prevIdx]);
                  }}
                  className="w-7 h-7 rounded-full border border-sky-200 bg-white text-slate-500 hover:text-sky-600 hover:border-sky-400 hover:bg-sky-50 flex items-center justify-center shadow-2xs transition-all cursor-pointer shrink-0"
                  title="Peran Sebelumnya"
                >
                  <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>

                {/* Container Pill Horizontal Scrollable - Slim & Compact dengan Sliding Active Indicator */}
                <div className="flex items-center gap-1 sm:gap-1.5 p-1 bg-white/95 backdrop-blur-xs rounded-full border border-sky-200 shadow-xs overflow-x-auto scrollbar-none max-w-full relative">
                  {[
                    { id: 'guru', label: 'Guru' },
                    { id: 'siswa', label: 'Siswa' },
                    { id: 'tu', label: 'Tata Usaha (TU)' },
                    { id: 'kesiswaan', label: 'Kesiswaan' },
                    { id: 'keuangan', label: 'Keuangan' },
                    { id: 'perpustakaan', label: 'Perpustakaan' }
                  ].map((roleItem) => {
                    const isSelected = selectedAlurRole === roleItem.id;
                    return (
                      <button
                        key={roleItem.id}
                        type="button"
                        onClick={() => setSelectedAlurRole(roleItem.id as any)}
                        className={`relative px-3.5 sm:px-4 py-1.5 rounded-full font-semibold text-xs sm:text-[13px] tracking-tight whitespace-nowrap transition-colors duration-200 cursor-pointer z-10 select-none ${
                          isSelected
                            ? 'text-white'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-sky-50/70'
                        }`}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="activeAlurRoleIndicator"
                            className="absolute inset-0 bg-[#0284c7] rounded-full shadow-xs -z-10"
                            transition={{ type: "spring", stiffness: 450, damping: 32 }}
                          />
                        )}
                        <span>{roleItem.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tombol Panah Kanan */}
                <button
                  type="button"
                  onClick={() => {
                    const roles: Array<'guru' | 'siswa' | 'tu' | 'kesiswaan' | 'keuangan' | 'perpustakaan'> = ['guru', 'siswa', 'tu', 'kesiswaan', 'keuangan', 'perpustakaan'];
                    const curIdx = roles.indexOf(selectedAlurRole);
                    const nextIdx = (curIdx + 1) % roles.length;
                    setSelectedAlurRole(roles[nextIdx]);
                  }}
                  className="w-7 h-7 rounded-full border border-sky-200 bg-white text-slate-500 hover:text-sky-600 hover:border-sky-400 hover:bg-sky-50 flex items-center justify-center shadow-2xs transition-all cursor-pointer shrink-0"
                  title="Peran Selanjutnya"
                >
                  <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>

              </div>
            </div>

            {/* Stepper Flow Box Container (Style SSCASN: Rounded Box with Soft Sky Border & Ice White-Blue Background) */}
            <div className="max-w-6xl mx-auto rounded-3xl border-2 border-sky-200/90 bg-white/95 backdrop-blur-sm p-6 sm:p-8 shadow-xs">

              {/* HEADING PERAN TERPILIH */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-2 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
                  <h3 className="text-sm sm:text-base font-bold text-slate-800">
                    Alur Pendaftaran:{' '}
                    <span className="text-sky-600 capitalize">
                      {selectedAlurRole === 'guru' && 'Guru (Pendidik)'}
                      {selectedAlurRole === 'siswa' && 'Siswa (Peserta Didik)'}
                      {selectedAlurRole === 'tu' && 'Tata Usaha (TU)'}
                      {selectedAlurRole === 'kesiswaan' && 'Kesiswaan & BK'}
                      {selectedAlurRole === 'keuangan' && 'Keuangan / Bendahara'}
                      {selectedAlurRole === 'perpustakaan' && 'Perpustakaan'}
                    </span>
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 bg-white border border-sky-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                  Tahap 1 - 10 Berurutan
                </span>
              </div>

              {/* DYNAMIC STEPPER 1 TO 10 BERDASARKAN PERAN */}
              {(() => {
                // Definisi 10 langkah alur untuk masing-masing peran
                const roleFlows: Record<
                  'guru' | 'siswa' | 'tu' | 'kesiswaan' | 'keuangan' | 'perpustakaan',
                  Array<{
                    step: number;
                    title: string;
                    subtitle: string;
                    tooltip: string;
                    icon: React.ReactNode;
                    hasSpinner?: boolean;
                    btnText?: string;
                    btnAction?: () => void;
                  }>
                > = {
                  guru: [
                    {
                      step: 1,
                      title: '1. Pilih Peran',
                      subtitle: 'Pilih Guru',
                      tooltip: 'Tahap 1: Pilih Peran Guru',
                      icon: <GraduationCap className="w-5 h-5 stroke-[2.2]" />,
                      btnText: 'Daftar',
                      btnAction: () => {
                        setActiveTab('register');
                        setIsMasterDataLogin(false);
                        setIsStudentLogin(false);
                        setPreAuthAccepted(false);
                        setShowActivationStep(false);
                        setShowActivationSearch(false);
                        setShowLoginModal(true);
                        setShowLoginDropdown(false);
                        setSuccessNotification(null);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    },
                    {
                      step: 2,
                      title: '2. Isi Formulir',
                      subtitle: 'Nama & Gelar',
                      tooltip: 'Tahap 2: Isi Biodata Guru',
                      icon: <FileText className="w-5 h-5 stroke-[2.2]" />
                    },
                    {
                      step: 3,
                      title: '3. Kirim Data',
                      subtitle: 'Simpan Sistem',
                      tooltip: 'Tahap 3: Kirim Data Registrasi Guru',
                      icon: <Send className="w-5 h-5 stroke-[2.2]" />
                    },
                    {
                      step: 4,
                      title: '4. Aktivasi Akun',
                      subtitle: 'Verifikasi Operator',
                      tooltip: 'Tahap 4: Aktivasi Guru oleh Operator',
                      icon: <ShieldCheck className="w-5 h-5 stroke-[2.2]" />,
                      hasSpinner: true,
                      btnText: 'Cek Status',
                      btnAction: () => {
                        setPortalTab('aktivasi');
                        handleOpenCekAktivasi();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    },
                    {
                      step: 5,
                      title: '5. Masuk (Login)',
                      subtitle: 'Portal Guru',
                      tooltip: 'Tahap 5: Masuk ke Akun Guru',
                      icon: <LogIn className="w-5 h-5 stroke-[2.2]" />,
                      btnText: 'Masuk',
                      btnAction: () => {
                        setActiveTab('login');
                        setIsMasterDataLogin(false);
                        setIsStudentLogin(false);
                        setShowActivationStep(false);
                        setShowActivationSearch(false);
                        setShowLoginModal(true);
                        setShowLoginDropdown(false);
                        setSuccessNotification(null);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    },
                    {
                      step: 6,
                      title: '6. Isi Biodata',
                      subtitle: 'Profil Pendidik',
                      tooltip: 'Tahap 6: Lengkapi Data Pendidik',
                      icon: <UserCheck className="w-5 h-5 stroke-[2.2]" />
                    },
                    {
                      step: 7,
                      title: '7. Pilih Sekolah',
                      subtitle: 'Satuan Pendidikan',
                      tooltip: 'Tahap 7: Instansi Tempat Mengajar',
                      icon: <Building2 className="w-5 h-5 stroke-[2.2]" />
                    },
                    {
                      step: 8,
                      title: '8. NIP & Mapel',
                      subtitle: 'Mata Pelajaran',
                      tooltip: 'Tahap 8: NIP dan Penugasan Mapel',
                      icon: <BookOpen className="w-5 h-5 stroke-[2.2]" />
                    },
                    {
                      step: 9,
                      title: '9. Email & Sandi',
                      subtitle: 'Kredensial Guru',
                      tooltip: 'Tahap 9: Akun Resmi & Password',
                      icon: <KeyRound className="w-5 h-5 stroke-[2.2]" />
                    },
                    {
                      step: 10,
                      title: '10. Siap Mengajar',
                      subtitle: 'Akses LMS & Rapor',
                      tooltip: 'Tahap 10: Akun Aktif & Siap Mengajar',
                      icon: <Laptop className="w-5 h-5 stroke-[2.2]" />
                    }
                  ],
                  siswa: [
                    {
                      step: 1,
                      title: '1. Akses Siswa',
                      subtitle: 'Pilih Menu Siswa',
                      tooltip: 'Tahap 1: Pilih Portal Siswa',
                      icon: <UserCheck className="w-5 h-5 stroke-[2.2]" />,
                      btnText: 'Masuk',
                      btnAction: () => {
                        setActiveTab('login');
                        setIsStudentLogin(true);
                        setIsMasterDataLogin(false);
                        setShowActivationStep(false);
                        setShowActivationSearch(false);
                        setShowLoginModal(true);
                        setShowLoginDropdown(false);
                        setSuccessNotification(null);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    },
                    {
                      step: 2,
                      title: '2. Masukkan NISN',
                      subtitle: 'Nomor Induk Siswa',
                      tooltip: 'Tahap 2: Input NISN Valid',
                      icon: <SearchCode className="w-5 h-5 stroke-[2.2]" />
                    },
                    {
                      step: 3,
                      title: '3. Verifikasi Data',
                      subtitle: 'Cek Database Sekolah',
                      tooltip: 'Tahap 3: Validasi Nama & Tanggal Lahir',
                      icon: <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
                    },
                    {
                      step: 4,
                      title: '4. Aktivasi Siswa',
                      subtitle: 'Konfirmasi Wali Kelas',
                      tooltip: 'Tahap 4: Aktivasi Kelas oleh Wali Kelas / Operator',
                      icon: <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />,
                      hasSpinner: true
                    },
                    {
                      step: 5,
                      title: '5. Buat PIN Sandi',
                      subtitle: 'Kata Sandi Siswa',
                      tooltip: 'Tahap 5: Buat Sandi Masuk Mandiri',
                      icon: <KeyRound className="w-5 h-5 stroke-[2.2]" />
                    },
                    {
                      step: 6,
                      title: '6. Pilih Rombel',
                      subtitle: 'Tingkat & Kelas',
                      tooltip: 'Tahap 6: Hubungkan Rombongan Belajar',
                      icon: <Layers className="w-5 h-5 stroke-[2.2]" />
                    },
                    {
                      step: 7,
                      title: '7. Data Orang Tua',
                      subtitle: 'Kontak Wali Siswa',
                      tooltip: 'Tahap 7: Masukkan Kontak Orang Tua / Wali',
                      icon: <Users className="w-5 h-5 stroke-[2.2]" />
                    },
                    {
                      step: 8,
                      title: '8. Unggah Foto',
                      subtitle: 'Kartu Pelajar',
                      tooltip: 'Tahap 8: Pas Foto Siswa',
                      icon: <UserPlus className="w-5 h-5 stroke-[2.2]" />
                    },
                    {
                      step: 9,
                      title: '9. Simpan Profil',
                      subtitle: 'Tersinkron Dapodik',
                      tooltip: 'Tahap 9: Sinkronisasi Identitas Siswa',
                      icon: <Send className="w-5 h-5 stroke-[2.2]" />
                    },
                    {
                      step: 10,
                      title: '10. Siap Belajar',
                      subtitle: 'CBT, Tugas & Nilai',
                      tooltip: 'Tahap 10: Akses Pembelajaran & Ujian Online',
                      icon: <Laptop className="w-5 h-5 stroke-[2.2]" />
                    }
                  ],
                  tu: [
                    {
                      step: 1,
                      title: '1. Pilih Peran',
                      subtitle: 'Pilih Tata Usaha',
                      tooltip: 'Tahap 1: Pilih Peran TU',
                      icon: <Briefcase className="w-5 h-5 stroke-[2.2]" />,
                      btnText: 'Daftar',
                      btnAction: () => {
                        setActiveTab('register');
                        setIsMasterDataLogin(false);
                        setIsStudentLogin(false);
                        setPreAuthAccepted(false);
                        setShowActivationStep(false);
                        setShowActivationSearch(false);
                        setShowLoginModal(true);
                        setShowLoginDropdown(false);
                        setSuccessNotification(null);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    },
                    {
                      step: 2,
                      title: '2. Isi Formulir',
                      subtitle: 'Nama & NIP / NIK',
                      tooltip: 'Tahap 2: Biodata Staf Tata Usaha',
                      icon: <FileText className="w-5 h-5 stroke-[2.2]" />
                    },
                    {
                      step: 3,
                      title: '3. Kirim Berkas',
                      subtitle: 'SK Penugasan TU',
                      tooltip: 'Tahap 3: Kirim Data Administrasi',
                      icon: <Send className="w-5 h-5 stroke-[2.2]" />
                    },
                    {
                      step: 4,
                      title: '4. Aktivasi Kepala',
                      subtitle: 'Persetujuan Kepsek',
                      tooltip: 'Tahap 4: Verifikasi & Otorisasi Kepala Sekolah',
                      icon: <ShieldCheck className="w-5 h-5 stroke-[2.2]" />,
                      hasSpinner: true,
                      btnText: 'Cek Status',
                      btnAction: () => {
                        setPortalTab('aktivasi');
                        handleOpenCekAktivasi();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    },
                    {
                      step: 5,
                      title: '5. Masuk (Login)',
                      subtitle: 'Portal Tenaga TU',
                      tooltip: 'Tahap 5: Masuk ke Portal Administrasi TU',
                      icon: <LogIn className="w-5 h-5 stroke-[2.2]" />,
                      btnText: 'Masuk',
                      btnAction: () => {
                        setActiveTab('login');
                        setIsMasterDataLogin(false);
                        setIsStudentLogin(false);
                        setShowActivationStep(false);
                        setShowActivationSearch(false);
                        setShowLoginModal(true);
                        setShowLoginDropdown(false);
                        setSuccessNotification(null);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    },
                    {
                      step: 6,
                      title: '6. Unit Kerja',
                      subtitle: 'Bagian Administrasi',
                      tooltip: 'Tahap 6: Pengaturan Divisi / Sub-bagian TU',
                      icon: <Building2 className="w-5 h-5 stroke-[2.2]" />
                    },
                    {
                      step: 7,
                      title: '7. Akses Surat',
                      subtitle: 'Persuratan & Arsip',
                      tooltip: 'Tahap 7: Konfigurasi Format & Nomor Surat',
                      icon: <ClipboardList className="w-5 h-5 stroke-[2.2]" />
                    },
                    {
                      step: 8,
                      title: '8. Otoritas Master',
                      subtitle: 'Hak Akses GTK',
                      tooltip: 'Tahap 8: Pengelolaan Data Guru & Pegawai',
                      icon: <FolderLock className="w-5 h-5 stroke-[2.2]" />
                    },
                    {
                      step: 9,
                      title: '9. Keamanan Akun',
                      subtitle: '2FA & Sandi Kuat',
                      tooltip: 'Tahap 9: Perlindungan Data Sekolah',
                      icon: <KeyRound className="w-5 h-5 stroke-[2.2]" />
                    },
                    {
                      step: 10,
                      title: '10. Siap Melayani',
                      subtitle: 'Layanan Tata Usaha',
                      tooltip: 'Tahap 10: Sistem Administrasi Siap Penuh',
                      icon: <Laptop className="w-5 h-5 stroke-[2.2]" />
                    }
                  ],
                  kesiswaan: [
                    {
                      step: 1,
                      title: '1. Pilih Peran',
                      subtitle: 'Tim Kesiswaan / BK',
                      tooltip: 'Tahap 1: Pilih Peran Kesiswaan',
                      icon: <Users className="w-5 h-5 stroke-[2.2]" />,
                      btnText: 'Daftar',
                      btnAction: () => {
                        setActiveTab('register');
                        setIsMasterDataLogin(false);
                        setIsStudentLogin(false);
                        setPreAuthAccepted(false);
                        setShowActivationStep(false);
                        setShowActivationSearch(false);
                        setShowLoginModal(true);
                        setShowLoginDropdown(false);
                        setSuccessNotification(null);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    },
                    {
                      step: 2,
                      title: '2. Isi Formulir',
                      subtitle: 'Nama & Jabatan',
                      tooltip: 'Tahap 2: Input Biodata Pembina Kesiswaan',
                      icon: <FileText className="w-5 h-5 stroke-[2.2]" />
                    },
                    {
                      step: 3,
                      title: '3. Kirim Data',
                      subtitle: 'Database Sekolah',
                      tooltip: 'Tahap 3: Kirim Pendaftaran Kesiswaan',
                      icon: <Send className="w-5 h-5 stroke-[2.2]" />
                    },
                    {
                      step: 4,
                      title: '4. Aktivasi Akun',
                      subtitle: 'Verifikasi Wakasek',
                      tooltip: 'Tahap 4: Verifikasi oleh Wakasek Kesiswaan',
                      icon: <ShieldCheck className="w-5 h-5 stroke-[2.2]" />,
                      hasSpinner: true,
                      btnText: 'Cek Status',
                      btnAction: () => {
                        setPortalTab('aktivasi');
                        handleOpenCekAktivasi();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    },
                    {
                      step: 5,
                      title: '5. Masuk (Login)',
                      subtitle: 'Portal Kesiswaan',
                      tooltip: 'Tahap 5: Masuk ke Dashboard Kesiswaan',
                      icon: <LogIn className="w-5 h-5 stroke-[2.2]" />,
                      btnText: 'Masuk',
                      btnAction: () => {
                        setActiveTab('login');
                        setIsMasterDataLogin(false);
                        setIsStudentLogin(false);
                        setShowActivationStep(false);
                        setShowActivationSearch(false);
                        setShowLoginModal(true);
                        setShowLoginDropdown(false);
                        setSuccessNotification(null);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    },
                    {
                      step: 6,
                      title: '6. Data Siswa',
                      subtitle: 'Daftar Seluruh Siswa',
                      tooltip: 'Tahap 6: Sinkronisasi Data Siswa Aktif',
                      icon: <UserCheck className="w-5 h-5 stroke-[2.2]" />
                    },
                    {
                      step: 7,
                      title: '7. Atur Presensi',
                      subtitle: 'Kehadiran & Izin',
                      tooltip: 'Tahap 7: Konfigurasi Absensi & Dispensasi',
                      icon: <Calendar className="w-5 h-5 stroke-[2.2]" />
                    },
                    {
                      step: 8,
                      title: '8. Rekam Disiplin',
                      subtitle: 'Poin & Prestasi',
                      tooltip: 'Tahap 8: Skema Poin Pelanggaran & Penghargaan',
                      icon: <Sparkles className="w-5 h-5 stroke-[2.2]" />
                    },
                    {
                      step: 9,
                      title: '9. Ekstrakurikuler',
                      subtitle: 'Ekskul & OSIS',
                      tooltip: 'Tahap 9: Manajemen Pembina & Jadwal Kegiatan',
                      icon: <BookmarkCheck className="w-5 h-5 stroke-[2.2]" />
                    },
                    {
                      step: 10,
                      title: '10. Siap Pantau',
                      subtitle: 'Monitoring Terpadu',
                      tooltip: 'Tahap 10: Sistem Disiplin & Karakter Siap',
                      icon: <Laptop className="w-5 h-5 stroke-[2.2]" />
                    }
                  ],
                  keuangan: [
                    {
                      step: 1,
                      title: '1. Pilih Peran',
                      subtitle: 'Bendahara Sekolah',
                      tooltip: 'Tahap 1: Pilih Peran Keuangan / Bendahara',
                      icon: <Wallet className="w-5 h-5 stroke-[2.2]" />,
                      btnText: 'Daftar',
                      btnAction: () => {
                        setActiveTab('register');
                        setIsMasterDataLogin(false);
                        setIsStudentLogin(false);
                        setPreAuthAccepted(false);
                        setShowActivationStep(false);
                        setShowActivationSearch(false);
                        setShowLoginModal(true);
                        setShowLoginDropdown(false);
                        setSuccessNotification(null);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    },
                    {
                      step: 2,
                      title: '2. Isi Formulir',
                      subtitle: 'Nama & NIK Bendahara',
                      tooltip: 'Tahap 2: Input Biodata Petugas Keuangan',
                      icon: <FileText className="w-5 h-5 stroke-[2.2]" />
                    },
                    {
                      step: 3,
                      title: '3. Kirim Berkas',
                      subtitle: 'SK Pengelola Dana',
                      tooltip: 'Tahap 3: Kirim Data Verifikasi Bendahara',
                      icon: <Send className="w-5 h-5 stroke-[2.2]" />
                    },
                    {
                      step: 4,
                      title: '4. Aktivasi Akun',
                      subtitle: 'Otorisasi Kepsek',
                      tooltip: 'Tahap 4: Verifikasi Khusus Kepala Sekolah',
                      icon: <ShieldCheck className="w-5 h-5 stroke-[2.2]" />,
                      hasSpinner: true,
                      btnText: 'Cek Status',
                      btnAction: () => {
                        setPortalTab('aktivasi');
                        handleOpenCekAktivasi();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    },
                    {
                      step: 5,
                      title: '5. Masuk (Login)',
                      subtitle: 'Portal Keuangan',
                      tooltip: 'Tahap 5: Masuk ke Sistem Pembayaran & SPP',
                      icon: <LogIn className="w-5 h-5 stroke-[2.2]" />,
                      btnText: 'Masuk',
                      btnAction: () => {
                        setActiveTab('login');
                        setIsMasterDataLogin(false);
                        setIsStudentLogin(false);
                        setShowActivationStep(false);
                        setShowActivationSearch(false);
                        setShowLoginModal(true);
                        setShowLoginDropdown(false);
                        setSuccessNotification(null);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    },
                    {
                      step: 6,
                      title: '6. Rekening Sekolah',
                      subtitle: 'Bank & Pembayaran',
                      tooltip: 'Tahap 6: Konfigurasi No Rekening Resmi',
                      icon: <Building2 className="w-5 h-5 stroke-[2.2]" />
                    },
                    {
                      step: 7,
                      title: '7. Tarif & Tagihan',
                      subtitle: 'SPP, DSP, Kegiatan',
                      tooltip: 'Tahap 7: Pengaturan Biaya Bulanan & Semester',
                      icon: <Receipt className="w-5 h-5 stroke-[2.2]" />
                    },
                    {
                      step: 8,
                      title: '8. Kanal Tagihan',
                      subtitle: 'Virtual Account & QRIS',
                      tooltip: 'Tahap 8: Pengaturan Integrasi Pembayaran',
                      icon: <QrCode className="w-5 h-5 stroke-[2.2]" />
                    },
                    {
                      step: 9,
                      title: '9. Format Kuitansi',
                      subtitle: 'Stempel & Nomor',
                      tooltip: 'Tahap 9: Template Bukti Pembayaran Digital',
                      icon: <CreditCard className="w-5 h-5 stroke-[2.2]" />
                    },
                    {
                      step: 10,
                      title: '10. Siap Beroperasi',
                      subtitle: 'Laporan Keuangan',
                      tooltip: 'Tahap 10: Kas & Rekonsiliasi Otomatis Siap',
                      icon: <Laptop className="w-5 h-5 stroke-[2.2]" />
                    }
                  ],
                  perpustakaan: [
                    {
                      step: 1,
                      title: '1. Pilih Peran',
                      subtitle: 'Pustakawan Sekolah',
                      tooltip: 'Tahap 1: Pilih Peran Perpustakaan',
                      icon: <Library className="w-5 h-5 stroke-[2.2]" />,
                      btnText: 'Daftar',
                      btnAction: () => {
                        setActiveTab('register');
                        setIsMasterDataLogin(false);
                        setIsStudentLogin(false);
                        setPreAuthAccepted(false);
                        setShowActivationStep(false);
                        setShowActivationSearch(false);
                        setShowLoginModal(true);
                        setShowLoginDropdown(false);
                        setSuccessNotification(null);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    },
                    {
                      step: 2,
                      title: '2. Isi Formulir',
                      subtitle: 'Biodata Pengelola',
                      tooltip: 'Tahap 2: Input Identitas Petugas Perpus',
                      icon: <FileText className="w-5 h-5 stroke-[2.2]" />
                    },
                    {
                      step: 3,
                      title: '3. Kirim Data',
                      subtitle: 'Registrasi Perpus',
                      tooltip: 'Tahap 3: Kirim Data Pengelola Perpustakaan',
                      icon: <Send className="w-5 h-5 stroke-[2.2]" />
                    },
                    {
                      step: 4,
                      title: '4. Aktivasi Akun',
                      subtitle: 'Verifikasi Sekolah',
                      tooltip: 'Tahap 4: Aktivasi Petugas Perpustakaan',
                      icon: <ShieldCheck className="w-5 h-5 stroke-[2.2]" />,
                      hasSpinner: true,
                      btnText: 'Cek Status',
                      btnAction: () => {
                        setPortalTab('aktivasi');
                        handleOpenCekAktivasi();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    },
                    {
                      step: 5,
                      title: '5. Masuk (Login)',
                      subtitle: 'Portal Perpus',
                      tooltip: 'Tahap 5: Masuk ke Sistem Perpustakaan',
                      icon: <LogIn className="w-5 h-5 stroke-[2.2]" />,
                      btnText: 'Masuk',
                      btnAction: () => {
                        setActiveTab('login');
                        setIsMasterDataLogin(false);
                        setIsStudentLogin(false);
                        setShowActivationStep(false);
                        setShowActivationSearch(false);
                        setShowLoginModal(true);
                        setShowLoginDropdown(false);
                        setSuccessNotification(null);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    },
                    {
                      step: 6,
                      title: '6. Katalog Buku',
                      subtitle: 'Input ISBN & Judul',
                      tooltip: 'Tahap 6: Pendataan Koleksi Buku & Modul',
                      icon: <BookOpen className="w-5 h-5 stroke-[2.2]" />
                    },
                    {
                      step: 7,
                      title: '7. Atur Rak & Kode',
                      subtitle: 'Klasifikasi DDC',
                      tooltip: 'Tahap 7: Penataan Rak & Lokasi Buku',
                      icon: <Layers className="w-5 h-5 stroke-[2.2]" />
                    },
                    {
                      step: 8,
                      title: '8. Kartu Anggota',
                      subtitle: 'Barcode Guru & Siswa',
                      tooltip: 'Tahap 8: Penerbitan Kartu Digital Anggota',
                      icon: <UserCheck className="w-5 h-5 stroke-[2.2]" />
                    },
                    {
                      step: 9,
                      title: '9. Atur Peminjaman',
                      subtitle: 'Durasi & Denda',
                      tooltip: 'Tahap 9: Skema Peminjaman & Sirkulasi Buku',
                      icon: <Calendar className="w-5 h-5 stroke-[2.2]" />
                    },
                    {
                      step: 10,
                      title: '10. Siap Melayani',
                      subtitle: 'Sirkulasi & E-Book',
                      tooltip: 'Tahap 10: Perpustakaan Digital Siap Diakses',
                      icon: <Laptop className="w-5 h-5 stroke-[2.2]" />
                    }
                  ]
                };

                const currentSteps = roleFlows[selectedAlurRole] || roleFlows.guru;
                const row1 = currentSteps.slice(0, 5);
                const row2 = currentSteps.slice(5, 10);

                return (
                  <div className="w-full overflow-x-auto scrollbar-none py-1 sm:py-2">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={selectedAlurRole}
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.28, ease: "easeInOut" }}
                        className="min-w-[700px] sm:min-w-full flex flex-col relative px-2 sm:px-3"
                      >
                        
                        {/* BARIS 1: Tahap 1 sampai 5 (Kiri ke Kanan) */}
                        <div className="w-full flex items-start justify-between relative">
                          {row1.map((item, idx) => (
                            <React.Fragment key={`row1-step-${item.step}`}>
                              <div className="flex flex-col items-center w-28 sm:w-36 text-center group cursor-pointer">
                                <div
                                  className="relative w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-xl sm:rounded-2xl border-2 border-sky-400 flex items-center justify-center shadow-xs select-none transition-all duration-300 ease-out group-hover:scale-125 group-hover:z-30 group-hover:shadow-xl group-hover:shadow-sky-400/40 group-hover:border-sky-500 origin-center"
                                  title={item.tooltip}
                                >
                                  {item.hasSpinner && (
                                    <div className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-amber-400 border border-amber-300 shadow-2xs flex items-center justify-center">
                                      <span className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    </div>
                                  )}
                                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 transition-colors group-hover:bg-sky-500 group-hover:text-white">
                                    {item.icon}
                                  </div>
                                </div>
                                <h4 className="text-xs sm:text-[13px] font-bold text-sky-800 tracking-tight mt-2.5 leading-snug group-hover:text-sky-600 transition-colors">
                                  {item.title}
                                </h4>
                                <p className="text-[10px] sm:text-[11px] text-rose-500 font-semibold mt-0.5">
                                  {item.subtitle}
                                </p>
                                {item.btnText && (
                                  <button
                                    type="button"
                                    onClick={item.btnAction}
                                    className="mt-1.5 px-3 py-0.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-[9px] sm:text-[10px] font-bold inline-flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                                    title={item.title}
                                  >
                                    <ExternalLink className="w-2.5 h-2.5" />
                                    <span>{item.btnText}</span>
                                  </button>
                                )}
                              </div>

                              {idx < row1.length - 1 && (
                                <div className="flex items-center justify-center text-sky-300 pt-4.5 sm:pt-5.5 shrink-0">
                                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                                </div>
                              )}
                            </React.Fragment>
                          ))}
                        </div>

                        {/* CURVED CONNECTING LINE DARI TAHAP 5 (KANAN) KE TAHAP 6 (KIRI) - FORMAT STANDAR SSCASN */}
                        <div className="relative mx-12 sm:mx-16 h-8 sm:h-9 my-1 overflow-visible pointer-events-none">
                          <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 60" fill="none" preserveAspectRatio="none">
                            <path
                              d="M 1000 0 L 1000 18 Q 1000 32 980 32 L 20 32 Q 0 32 0 46 L 0 54"
                              stroke="#38bdf8"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <polygon points="0,60 -5,48 5,48" fill="#38bdf8" />
                          </svg>
                        </div>

                        {/* BARIS 2: Tahap 6 sampai 10 (Kiri ke Kanan seperti Baris 2 SSCASN) */}
                        <div className="w-full flex items-start justify-between relative">
                          {row2.map((item, idx) => (
                            <React.Fragment key={`row2-step-${item.step}`}>
                              <div className="flex flex-col items-center w-28 sm:w-36 text-center group cursor-pointer">
                                <div
                                  className="relative w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-xl sm:rounded-2xl border-2 border-sky-400 flex items-center justify-center shadow-xs select-none transition-all duration-300 ease-out group-hover:scale-125 group-hover:z-30 group-hover:shadow-xl group-hover:shadow-sky-400/40 group-hover:border-sky-500 origin-center"
                                  title={item.tooltip}
                                >
                                  {item.hasSpinner && (
                                    <div className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-amber-400 border border-amber-300 shadow-2xs flex items-center justify-center">
                                      <span className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    </div>
                                  )}
                                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 transition-colors group-hover:bg-sky-500 group-hover:text-white">
                                    {item.icon}
                                  </div>
                                </div>
                                <h4 className="text-xs sm:text-[13px] font-bold text-sky-800 tracking-tight mt-2.5 leading-snug group-hover:text-sky-600 transition-colors">
                                  {item.title}
                                </h4>
                                <p className="text-[10px] sm:text-[11px] text-rose-500 font-semibold mt-0.5">
                                  {item.subtitle}
                                </p>
                                {item.btnText && (
                                  <button
                                    type="button"
                                    onClick={item.btnAction}
                                    className="mt-1.5 px-3 py-0.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-[9px] sm:text-[10px] font-bold inline-flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                                    title={item.title}
                                  >
                                    <ExternalLink className="w-2.5 h-2.5" />
                                    <span>{item.btnText}</span>
                                  </button>
                                )}
                              </div>

                              {idx < row2.length - 1 && (
                                <div className="flex items-center justify-center text-sky-300 pt-4.5 sm:pt-5.5 shrink-0">
                                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                                </div>
                              )}
                            </React.Fragment>
                          ))}
                        </div>

                      </motion.div>
                    </AnimatePresence>
                  </div>
                );
              })()}

            </div>
          </div>
        </div>
      </section>

      {/* 3. PORTAL STATISTICS & FAQ WRAPPER SECTION (WARNA #F8FAFC BERSIH) - HIDDEN ON MOBILE */}
      <div id="portal-light-section" className="hidden sm:block relative w-full bg-[#F8FAFC] text-slate-800 overflow-hidden">
        
        {/* ANALYTICS SECTION ON LOGIN PAGE */}
        <section id="analytics-section" className="relative z-10 pt-8 sm:pt-10 pb-10 sm:pb-12 scroll-mt-16 bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-xs font-bold text-sky-700 mb-2.5 shadow-2xs">
                <BarChart3 className="w-4 h-4 text-sky-600 stroke-[2.5]" />
                <span>Analitik & Performa Real-Time SIMAK Guru</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Ringkasan Indikator Utama SIMAK
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-2xl mx-auto font-medium leading-relaxed">
                Pantau persentase kelengkapan modul ajar, status sinkronisasi cloud real-time, serta statistik tingkat kehadiran siswa secara langsung.
              </p>
            </div>

            {/* 3 Main Metric Highlight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              {/* 1. Kelengkapan Modul */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-sky-500" />
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-sky-600">
                    <FileText className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                    Terverifikasi
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Kelengkapan Modul Ajar
                </div>
                <div className="text-3xl font-black text-slate-900 mb-2 flex items-baseline gap-2">
                  <span>{classAnalyticsMetrics.modulePercentage}</span>
                  <span className="text-xs font-bold text-sky-600">✓ Perangkat Lengkap</span>
                </div>
                <p className="text-xs text-slate-600 font-medium mb-4">
                  Capaian Pembelajaran (CP), Tujuan Pembelajaran (TP), Modul Ajar, dan Rubrik KKTP terstruktur rapi.
                </p>
                
                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-sky-500 h-2.5 rounded-full transition-all duration-700" 
                    style={{ width: classAnalyticsMetrics.modulePercentage }}
                  />
                </div>
                <div className="mt-2 text-[11px] text-slate-500 flex justify-between font-semibold">
                  <span>Kurikulum Merdeka 2024/2025</span>
                  <span className="text-sky-700 font-bold">{classAnalyticsMetrics.modulePercentage} Siap</span>
                </div>
              </div>

              {/* 2. Sinkronisasi Data */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-sky-500" />
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-sky-600">
                    <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                    Cloud Active
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Persentase Sinkronisasi
                </div>
                <div className="text-3xl font-black text-slate-900 mb-2 flex items-baseline gap-2">
                  <span>{classAnalyticsMetrics.syncVal}</span>
                  <span className="text-xs font-bold text-sky-600">Terhubung Vercel</span>
                </div>
                <p className="text-xs text-slate-600 font-medium mb-4">
                  Tingkat konsistensi dan integritas data antara penyimpanan lokal browser dan Vercel Database.
                </p>
                
                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-sky-500 h-2.5 rounded-full transition-all duration-700" 
                    style={{ width: classAnalyticsMetrics.syncVal }}
                  />
                </div>
                <div className="mt-2 text-[11px] text-slate-500 flex justify-between font-semibold">
                  <span>Enkripsi Database AES-256</span>
                  <span className="text-sky-700 font-bold">{classAnalyticsMetrics.syncVal} Sync</span>
                </div>
              </div>

              {/* 3. Kehadiran Siswa */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-sky-500" />
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-sky-600">
                    <UserCheck className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                    Terverifikasi
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Kehadiran Siswa
                </div>
                <div className="text-3xl font-black text-slate-900 mb-2 flex items-baseline gap-2">
                  <span>{classAnalyticsMetrics.attPercentage}</span>
                  <span className="text-xs font-bold text-sky-600">Rata-Rata Presensi</span>
                </div>
                <p className="text-xs text-slate-600 font-medium mb-4">
                  Tingkat keaktifan dan kehadiran harian siswa seluruh kelas.
                </p>
                
                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-sky-500 h-2.5 rounded-full transition-all duration-700" 
                    style={{ width: classAnalyticsMetrics.attPercentage }}
                  />
                </div>
                <div className="mt-2 text-[11px] text-slate-500 flex justify-between font-semibold">
                  <span>Presensi Terverifikasi</span>
                  <span className="text-sky-700 font-bold">{classAnalyticsMetrics.attPercentage} Hadir</span>
                </div>
              </div>
            </div>

            {/* Sub-Analytics Summary Box */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600" />
                <span>Rincian Verifikasi Perangkat & Database</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="text-slate-500 font-medium">Capaian & Tujuan Pembelajaran</div>
                  <div className="text-sm font-black text-slate-800 mt-1">{classAnalyticsMetrics.modulePercentage} Lengkap</div>
                  <div className="text-[11px] text-sky-600 font-bold mt-0.5">{classAnalyticsMetrics.cpTpSubtext}</div>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="text-slate-500 font-medium">Status Vercel</div>
                  <div className="text-sm font-black text-slate-800 mt-1">Tersinkron Otomatis</div>
                  <div className="text-[11px] text-sky-600 font-bold mt-0.5">Real-Time Data Mirror</div>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="text-slate-500 font-medium">Rekapitulasi Kehadiran</div>
                  <div className="text-sm font-black text-slate-800 mt-1">{classAnalyticsMetrics.attPercentage} Hadir</div>
                  <div className="text-[11px] text-sky-600 font-bold mt-0.5">Presensi Terdaftar di Jurnal</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT SECTION ON LOGIN PAGE */}
        <section id="about-section" className="relative z-10 pt-6 sm:pt-8 pb-8 sm:pb-10 border-b border-slate-200/70 scroll-mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-xs font-bold text-sky-700 mb-2.5 shadow-2xs">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span>Tentang SIMAK Guru Merdeka</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Sistem Informasi Akademik <br className="hidden sm:block" />
                Guru, Siswa & Staf berbasis LMS Kurikulum Merdeka
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl mx-auto font-medium leading-relaxed">
                Platform digital terpadu Kurikulum Merdeka yang dirancang khusus untuk efisiensi administrasi, penilaian otomatis, jurnal mengajar, serta analisis perkembangan siswa secara real-time.
              </p>
            </div>

            {/* Grid Capabilities & Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all text-slate-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                    <GraduationCap className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">Kurikulum Merdeka Ready</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Pengelolaan Capaian Pembelajaran (CP), Tujuan Pembelajaran (TP), nilai KKTP, dan pembentukan deskripsi capaian rapor secara otomatis.
                </p>
              </div>

              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all text-slate-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                    <UserCheck className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">Presensi & Jurnal Mengajar</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Pencatatan kehadiran harian siswa, status izin/sakit/alpa, jurnal KBM digital harian, dan rekapitulasi kehadiran ekstrakurikuler.
                </p>
              </div>

              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all text-slate-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">Analitik & Grafik Interaktif</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Monitoring nilai rata-rata kelas, visualisasi grafik tren kehadiran, identifikasi siswa berprestasi (Top Achievers) & siswa perlu pendampingan (At-Risk).
                </p>
              </div>

              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all text-slate-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">Asisten AI Guru</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Fitur bertenaga AI untuk membantu pembuatan kisi-kisi soal, analisis hasil diagnostik, serta rekomendasi materi pendampingan siswa.
                </p>
              </div>

              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all text-slate-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">Sinkronisasi Vercel Real-Time</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Penyimpanan data berbasis Vercel untuk akses aman, cepat, dan tersinkronisasi antar perangkat kapan saja.
                </p>
              </div>

              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all text-slate-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">Cetak & Ekspor Rapor Mudah</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Cetak Lembar Hasil Pembelajaran (LHP), rekapitulasi leger nilai, dan dokumen pendukung Kurikulum Merdeka secara rapi dan profesional.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. FAQ SECTION ON LOGIN PAGE */}
        <section id="faq-section" className="relative z-10 pt-6 sm:pt-8 pb-10 sm:pb-12 scroll-mt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 sm:mb-7">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-xs font-semibold text-[#164e63] mb-2.5 shadow-2xs">
                <HelpCircle className="w-4 h-4 text-[#164e63] stroke-[2.5]" />
                <span>Pusat Bantuan & Layanan Informasi</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Pertanyaan Umum (FAQ)
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl mx-auto font-medium">
                Panduan penggunaan, pendaftaran akun, dan solusi kendala teknis Sistem Informasi Akademik SIMAK Guru.
              </p>
            </div>

            <div className="space-y-3">
              {faqItems.map((item, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div 
                    key={index}
                    className="bg-slate-50/90 border border-slate-200/90 rounded-xl overflow-hidden transition-all shadow-2xs hover:shadow-sm text-slate-800"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full p-4 sm:p-5 text-left font-bold text-xs sm:text-sm text-slate-800 flex items-center justify-between gap-3 hover:bg-slate-100/80 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-cyan-100 text-[#164e63] text-xs font-black flex items-center justify-center shrink-0 border border-cyan-200">
                          {index + 1}
                        </span>
                        <span className="leading-snug">{item.question}</span>
                      </span>
                      <span className={`p-1.5 bg-slate-200/80 rounded-lg text-slate-600 shrink-0 transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180 bg-cyan-100 text-[#164e63]' : ''}`}>
                        <ChevronDown className="w-4 h-4" />
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/60 pt-3.5 bg-white font-medium">
                            {item.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. HELPDESK SECTION ON LOGIN PAGE */}
        <section id="helpdesk-section" className="relative z-10 pt-8 sm:pt-10 pb-12 sm:pb-16 scroll-mt-16 border-t border-slate-200/60 bg-gradient-to-b from-slate-50/50 to-cyan-50/30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-100/80 border border-cyan-200 text-xs font-bold text-[#164e63] mb-2.5 shadow-2xs">
                <Headphones className="w-4 h-4 text-[#164e63] stroke-[2.5]" />
                <span>Layanan Dukungan & Helpdesk SIMAK</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Pusat Bantuan & Layanan Bantuan
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl mx-auto font-medium">
                Punya kendala teknis, pertanyaan pendaftaran, atau butuh panduan penggunaan? Tim Helpdesk siap membantu Anda.
              </p>
            </div>

            {/* Helpdesk Contact Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* WhatsApp Live Chat */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold mb-3 shadow-xs">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">WhatsApp Helpdesk</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium mb-3">
                    Layanan pesan instan untuk konsultasi cepat kendala pendaftaran & login guru.
                  </p>
                  <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block mb-3">
                    0822-3008-5818 (Online)
                  </div>
                </div>
                <a
                  href="https://wa.me/6282230085818?text=Halo%20Helpdesk%20SIMAK%20Guru,%20saya%20butuh%20bantuan%20teknis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat WhatsApp</span>
                </a>
              </div>

              {/* Email Support */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold mb-3 shadow-xs">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Email Layanan Bantuan</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium mb-3">
                    Kirim surel resmi untuk bantuan verifikasi data massal, rujukan NIP, atau permohonan khusus.
                  </p>
                  <div className="text-xs font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 inline-block mb-3">
                    helpdesk@simakguru.id
                  </div>
                </div>
                <a
                  href="mailto:helpdesk@simakguru.id?subject=Permohonan%20Bantuan%20SIMAK%20Guru"
                  className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Kirim Email</span>
                </a>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* 5. FOOTER */}
      <footer className="relative z-10 w-full bg-[#F8FAFC] text-slate-900 border-t border-slate-200 mt-auto antialiased">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center space-x-3.5">
            <div className="p-2 rounded-xl bg-white border border-sky-200/80 shadow-2xs shrink-0">
              <TutWuriHandayaniLogo className="w-8 h-8 text-sky-600" />
            </div>
            <div>
              <div className="text-slate-900 text-sm sm:text-base font-bold tracking-normal leading-snug">SIMAK Guru Merdeka</div>
              <div className="text-slate-700 text-xs sm:text-sm font-semibold leading-snug mt-0.5">Sistem Informasi Akademik</div>
              <div className="text-xs text-slate-500 font-normal leading-snug mt-0.5">Terpadu - Kurikulum Merdeka - Versi 3.8.1</div>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-slate-700 font-medium bg-white/90 px-3.5 py-2 rounded-xl border border-sky-200/70 shadow-2xs">
            © 2026 Hak Cipta Dilindungi Undang-Undang. Versi 3.8.1
          </div>
        </div>

        {/* Warna Biru Dibawah Footer */}
        <div className="w-full bg-sky-600 py-3.5 px-4 text-white text-center border-t border-sky-500">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-1.5 text-xs sm:text-sm tracking-wide">
            <span>2026 © <strong className="font-bold text-white">Sistem Informasi Akademik</strong></span>
          </div>
        </div>
      </footer>

      {/* ANIMASI PENGALIHAN KE HALAMAN CEK AKTIVASI */}
      {isNavigatingToAktivasi && (
        <div className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white select-none transition-all duration-300 animate-fadeIn">
          <div className="relative flex flex-col items-center max-w-sm text-center">
            {/* Animated Pulsing Scanner Rings & Glowing Shield Icon */}
            <div className="relative w-28 h-28 flex items-center justify-center mb-6">
              <div className="absolute inset-0 rounded-full bg-sky-500/20 animate-ping" />
              <div className="absolute inset-2 rounded-full bg-sky-400/25 animate-pulse" />
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-sky-400/40 animate-spin" style={{ animationDuration: '6s' }} />
              <div className="absolute inset-1 rounded-full border-2 border-transparent border-t-sky-400 animate-spin" style={{ animationDuration: '1.2s' }} />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 flex items-center justify-center shadow-xl shadow-sky-500/30 text-white">
                <ShieldCheck className="w-8 h-8 stroke-[2.2]" />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight font-jakarta">
              Mengarahkan ke Halaman Cek Aktivasi
            </h3>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-sky-200 mt-2 leading-relaxed">
              Menyiapkan layanan verifikasi status akun & hak akses SIMAK Merdeka...
            </p>

            {/* Status Indicator */}
            <div className="flex items-center justify-center w-64 mt-5 text-xs text-sky-200 font-medium">
              <span>Memproses verifikasi...</span>
            </div>

            {/* 3-Second Progress Bar */}
            <div className="w-64 h-2.5 bg-white/15 rounded-full overflow-hidden mt-2 p-0.5 border border-white/20">
              <div 
                className="h-full bg-gradient-to-r from-sky-400 via-sky-300 to-cyan-200 rounded-full transition-all duration-1000 ease-linear shadow-xs"
                style={{ width: `${Math.min(100, Math.max(25, ((4 - aktivasiCountdown) / 3) * 100))}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 5. MAIN LOGIN & REGISTER PAGE VIEW (FULL SCREEN) */}
      {showLoginModal && (
        activeTab === 'register' && !showActivationStep ? (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-[#f0f4f8]">
            <SscasnRegisterForm
              onClose={() => setShowLoginModal(false)}
              onSwitchToLogin={(prefilledEmail, prefilledNip) => {
                setActiveTab('login');
                setIsMasterDataLogin(false);
                setIsStudentLogin(false);
                if (prefilledEmail) {
                  setEmail(prefilledEmail);
                } else if (prefilledNip) {
                  setEmail(prefilledNip);
                }
              }}
              onRegisterSuccess={(newUserAccount, newTeacherProfile) => {
                if (onRegisterNewAccount) {
                  onRegisterNewAccount(newUserAccount, newTeacherProfile);
                }
                setEmail(newUserAccount.email);
                setPassword(newUserAccount.password || '');
                setActivationData({
                  name: newUserAccount.name,
                  email: newUserAccount.email,
                  role: newUserAccount.role,
                  school: newUserAccount.schoolName,
                  nip: newUserAccount.nip || '-',
                  date: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
                  status: 'Aktif'
                });
              }}
              onOpenHelpdesk={() => {
                setShowLoginModal(false);
                setPortalTab('helpdesk');
              }}
              registeredUsers={registeredUsers}
            />
          </div>
        ) : (
        <div className="fixed inset-0 z-50 bg-white flex flex-col min-h-screen w-screen overflow-y-auto animate-fadeIn text-slate-800">
          
          {/* Top Full-Screen Navigation Bar (Bright Blue Gradient, Scrolls with Page) */}
          <header className="w-full bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] text-white py-3 sm:py-3.5 px-4 sm:px-8 flex items-center justify-between border-b border-sky-400/80 shadow-md shrink-0 z-30">
            <div className="flex items-center space-x-3">
              <div className="p-1.5 sm:p-2 flex items-center justify-center shrink-0 bg-sky-500/20 rounded-xl border border-sky-400/30">
                {showActivationStep ? (
                  <ShieldCheck className="w-6 h-6 text-white" />
                ) : isStudentLogin ? (
                  <GraduationCap className="w-6 h-6 text-sky-400" />
                ) : (
                  <TutWuriHandayaniLogo className="w-6 h-6 text-sky-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-sm sm:text-base text-white leading-tight">Sistem Informasi Akademik, Siswa & Staf berbasis LMS Kurikulum Merdeka</h1>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block ${
                    isMasterDataLogin
                      ? 'bg-amber-400 text-slate-950'
                      : isStudentLogin
                        ? 'bg-emerald-400 text-slate-950'
                        : showActivationStep
                          ? 'bg-white text-sky-700 font-extrabold shadow-2xs'
                          : activeTab === 'register'
                            ? 'bg-cyan-300 text-slate-950'
                            : 'bg-white/20 text-white border border-white/30'
                  }`}>
                    {isMasterDataLogin 
                      ? 'Administrator SSO' 
                      : isStudentLogin 
                        ? 'LMS Siswa' 
                        : activeTab === 'register'
                          ? (showActivationStep ? 'Cek Aktivasi' : 'Daftar Akun')
                          : 'Portal Masuk Guru'}
                  </span>
                </div>
                <p className="text-[11px] text-white font-medium">
                  Sistem Informasi Manajemen Akademik Terpadu - Kurikulum Merdeka v.3.8.1
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all border border-white/20 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                title="Kembali ke Beranda"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Kembali ke Portal</span>
                <span className="sm:hidden">Kembali</span>
              </button>
            </div>
          </header>

          {/* Top Registration Flow Banner (Alur Pendaftaran di Bagian Atas) */}
          {activeTab === 'register' && !showActivationStep && (
            <div className="w-full bg-slate-50 border-b border-slate-200 py-3.5 px-4 sm:px-8 shrink-0">
              <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 sm:gap-6">
                {/* Step 1 */}
                <div 
                  onClick={() => { 
                    setPreAuthAccepted(false); 
                    setShowActivationStep(false);
                  }}
                  className="flex items-center gap-2.5 sm:gap-3 select-none cursor-pointer group hover:opacity-90 transition-all"
                >
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 transition-all ${
                    preAuthAccepted 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-[#164e63] text-white shadow-xs ring-4 ring-[#164e63]/15'
                  }`}>
                    {preAuthAccepted ? <Check className="w-4 h-4" /> : '1'}
                  </div>
                  <div className="text-left">
                    <div className={`text-xs sm:text-sm font-bold leading-tight ${
                      !preAuthAccepted ? 'text-[#164e63]' : 'text-slate-800 group-hover:text-[#164e63]'
                    }`}>
                      1. Hak Akses & Peran
                    </div>
                    <div className="text-[11px] text-slate-500 hidden sm:block">
                      {preAuthAccepted ? `Dipilih: ${regRole}` : 'Pilih wewenang akun'}
                    </div>
                  </div>
                </div>

                <div className={`flex-1 h-0.5 max-w-[40px] sm:max-w-[100px] transition-colors duration-300 ${
                  preAuthAccepted ? 'bg-emerald-500' : 'bg-slate-300'
                }`}></div>

                {/* Step 2 */}
                <div 
                  onClick={() => { 
                    setPreAuthAccepted(true); 
                    setShowActivationStep(false);
                  }}
                  className={`flex items-center gap-2.5 sm:gap-3 select-none cursor-pointer group hover:opacity-90 transition-all`}
                >
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 transition-all ${
                    showActivationStep
                      ? 'bg-emerald-600 text-white'
                      : preAuthAccepted 
                        ? 'bg-[#164e63] text-white shadow-xs ring-4 ring-[#164e63]/15' 
                        : 'bg-slate-200 text-slate-500'
                  }`}>
                    {showActivationStep ? <Check className="w-4 h-4" /> : '2'}
                  </div>
                  <div className="text-left">
                    <div className={`text-xs sm:text-sm font-bold leading-tight ${
                      preAuthAccepted && !showActivationStep ? 'text-[#164e63]' : 'text-slate-700'
                    }`}>
                      2. Formulir Biodata
                    </div>
                    <div className="text-[11px] text-slate-400 hidden sm:block">
                      {preAuthAccepted ? 'Pengisian identitas' : 'Tahap berikutnya'}
                    </div>
                  </div>
                </div>

                <div className={`flex-1 h-0.5 max-w-[40px] sm:max-w-[100px] transition-colors duration-300 ${
                  showActivationStep ? (isAccountActive ? 'bg-emerald-500' : 'bg-amber-500') : 'bg-slate-300'
                }`}></div>

                {/* Step 3 */}
                <div 
                  onClick={() => {
                    if (activationData) {
                      setPreAuthAccepted(true);
                      setShowActivationStep(true);
                    }
                  }}
                  className={`flex items-center gap-2.5 sm:gap-3 select-none transition-all ${
                    activationData ? 'cursor-pointer group hover:opacity-90' : 'cursor-default opacity-60'
                  }`}
                >
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 transition-all ${
                    showActivationStep
                      ? isAccountActive 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'bg-[#164e63] text-white shadow-xs ring-4 ring-[#164e63]/20'
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {showActivationStep ? (
                      isAccountActive ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-white" />
                      )
                    ) : (
                      '3'
                    )}
                  </div>
                  <div className="text-left">
                    <div className={`text-xs sm:text-sm font-bold leading-tight ${
                      showActivationStep ? (isAccountActive ? 'text-emerald-700 font-extrabold' : 'text-amber-800 font-extrabold') : 'text-slate-600'
                    }`}>
                      3. Aktivasi Akun
                    </div>
                    <div className="text-[11px] text-slate-400 hidden sm:block">
                      {showActivationStep ? (isAccountActive ? 'Terverifikasi & Aktif' : 'Menunggu Aktivasi') : 'Status Akun'}
                    </div>
                  </div>
                </div>

                <div className={`flex-1 h-0.5 max-w-[30px] sm:max-w-[70px] transition-colors duration-300 ${
                  showActivationStep && isAccountActive ? 'bg-emerald-500' : 'bg-slate-300'
                }`}></div>

                {/* Step 4 */}
                <div 
                  className={`flex items-center gap-2.5 sm:gap-3 select-none transition-all ${
                    showActivationStep && isAccountActive ? 'opacity-100 cursor-pointer' : 'cursor-default opacity-60'
                  }`}
                >
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 transition-all ${
                    showActivationStep && isAccountActive
                      ? 'bg-emerald-600 text-white shadow-xs ring-4 ring-emerald-500/20'
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {showActivationStep && isAccountActive ? <CheckCircle2 className="w-4 h-4" /> : '4'}
                  </div>
                  <div className="text-left">
                    <div className={`text-xs sm:text-sm font-bold leading-tight ${
                      showActivationStep && isAccountActive ? 'text-emerald-700 font-extrabold' : 'text-slate-600'
                    }`}>
                      4. Selesai
                    </div>
                    <div className="text-[11px] text-slate-400 hidden sm:block">
                      {showActivationStep && isAccountActive ? 'Akun Aktif (Siap)' : 'Akun Aktif'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Full-Screen Body Container (Unboxed, Pure White Background) */}
          <main className="flex-1 w-full px-4 sm:px-8 py-6 sm:py-10 flex flex-col items-center bg-white relative z-10">
            <div className={`w-full flex flex-col transition-all duration-300 ${
              (activeTab === 'register' && !preAuthAccepted) || isMasterDataLogin
                ? 'max-w-5xl lg:max-w-6xl'
                : showActivationStep
                  ? 'max-w-xl'
                  : 'max-w-2xl sm:max-w-3xl'
            } mt-0 sm:mt-4 mb-auto`}>
              
              {/* Form Title & Description (Open Page Typography) */}
              <div className="mb-6 sm:mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 sm:pb-6 border-b border-slate-200">
                <div className="flex items-center gap-3.5 sm:gap-4">
                  <div className={`p-2.5 sm:p-3 flex items-center justify-center shrink-0 rounded-2xl shadow-xs ${
                    isMasterDataLogin
                      ? 'bg-cyan-50 border border-cyan-200'
                      : isStudentLogin 
                        ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white' 
                        : showActivationStep
                          ? isAccountActive ? 'bg-emerald-600 text-white' : 'bg-sky-600 text-white shadow-md shadow-sky-500/25'
                          : 'bg-[#164e63] text-white'
                  }`}>
                    {isMasterDataLogin ? (
                      <SSOCloudKeyLogo className="w-7 h-7 sm:w-8 sm:h-8" cloudColor="#2563eb" keyColor="#ffffff" keyHoleColor="#2563eb" />
                    ) : isStudentLogin ? (
                      <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 text-amber-300" />
                    ) : showActivationStep ? (
                      isAccountActive ? (
                        <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      ) : (
                        <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      )
                    ) : activeTab === 'register' ? (
                      <UserPlus className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    ) : (
                      <LogIn className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-extrabold text-xl sm:text-2xl md:text-3xl text-slate-900 leading-tight tracking-tight">
                      {isMasterDataLogin 
                        ? 'Masuk Administrator SSO' 
                        : isStudentLogin 
                          ? 'LMS Learning Management System Siswa' 
                          : activeTab === 'register'
                            ? (showActivationStep 
                                ? 'Status Aktivasi Akun Pengguna' 
                                : preAuthAccepted 
                                  ? `Lengkapi Biodata Akun (${regRole})` 
                                  : 'Daftar Akun Baru SIMAK')
                            : 'Masuk ke Sistem SIMAK Guru'}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                      {isStudentLogin 
                        ? 'Akses Pembelajaran Digital, Modul Materi, Tugas Mandiri & Presensi Siswa' 
                        : activeTab === 'register'
                          ? (showActivationStep 
                              ? 'Status akun pendaftaran terbaru dalam sistem' 
                              : preAuthAccepted 
                                ? 'Silakan isi data identitas pengguna dan keamanan akun dengan benar' 
                                : 'Pendaftaran Akun Guru, Tenaga Kependidikan & Siswa')
                          : 'Sistem Informasi Manajemen Akademik Guru Kurikulum Merdeka'}
                    </p>
                  </div>
                </div>

                {activeTab === 'register' && !preAuthAccepted && !showActivationStep && (
                  <div className="text-left sm:text-right max-w-full sm:max-w-xs lg:max-w-md border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-[#164e63] leading-tight">
                      Autentikasi Hak Akses Pendaftaran
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-relaxed">
                      Pilih hak akses / peran yang akan didaftarkan sebelum melanjutkan ke pengisian formulir biodata akun.
                    </p>
                  </div>
                )}

              </div>

            {!preAuthAccepted ? (
              activeTab === 'register' ? (
                /* 2-COLUMN UNBOXED LAYOUT (NO CARDS) */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start animate-fadeIn">
                  {/* LEFT COLUMN: Deskripsi Singkat & Informasi Perhatian (Unboxed) */}
                  <div className="lg:col-span-6 space-y-6">
                    {/* Deskripsi Singkat */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[#164e63]">
                        <BookOpen className="w-5 h-5" />
                        <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                          Pendaftaran Akun SIMAK Merdeka
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        Sistem Informasi Manajemen Akademik terintegrasi untuk Guru, Tenaga Kependidikan, Staf Sekolah, dan Peserta Didik dengan standar Kurikulum Merdeka.
                      </p>
                    </div>

                    {/* Informasi Perhatian Sebelum Melanjutkan */}
                    <div className="pt-4 border-t border-slate-200 space-y-3">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Info className="w-4 h-4 shrink-0 text-[#164e63]" />
                        <span>Perhatian Sebelum Melanjutkan:</span>
                      </h4>
                      <ul className="text-xs sm:text-sm text-slate-600 space-y-2.5 list-decimal pl-5 marker:font-bold marker:text-[#164e63] leading-relaxed">
                        <li>Pastikan menggunakan email resmi / NISN yang aktif dan terdaftar</li>
                        <li>Pilih hak akses sesuai tugas dan wewenang resmi di satuan pendidikan</li>
                        <li>Tidak diperkenankan menggunakan data/akun milik pihak lain</li>
                        <li>Jika didapati menggunakan data/akun lain maka akan di-blacklist/diblokir</li>
                      </ul>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Autentikasi Hak Akses Pendaftaran (Scrollable Container) */}
                  <div className="lg:col-span-6 lg:pl-4 lg:border-l lg:border-slate-200">
                    <div className="max-h-[460px] sm:max-h-[500px] overflow-y-auto pr-2 sm:pr-3 space-y-3.5 scrollbar-thin [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
                      
                      {/* Interactive Selectable Role List Cards */}
                      <div className="space-y-2">
                        {[
                          { title: 'Guru Pengampu', label: 'Guru Pengampu (Mata Pelajaran)', desc: 'Akses modul ajar, presensi harian siswa, jurnal mengajar, dan pengisian nilai mata pelajaran.' },
                          { title: 'Guru Kelas', label: 'Guru Kelas / Wali Kelas', desc: 'Akses penuh sebagai wali kelas/guru kelas, rekap nilai kelas, dan data peserta didik.' },
                          { title: 'Siswa', label: 'Siswa / Peserta Didik', desc: 'Akses portal khusus siswa untuk presensi mandiri, modul belajar, nilai tugas, dan jadwal.' },
                          { title: 'Kurikulum', label: 'Tim Kurikulum / Pengelola KSP', desc: 'Akses manajemen KSP, perangkat kurikulum merdeka, sinkronisasi jadwal, dan supervisi.' },
                          { title: 'Tata Usaha (TU)', label: 'Staf Tata Usaha (TU) / Administrasi', desc: 'Akses layanan ketatausahaan, data induk PTK, administrasi surat menyurat, dan arsip.' },
                          { title: 'Keuangan', label: 'Bendahara / Pengelola Keuangan', desc: 'Akses pengelolaan pos anggaran, rekap SPP/keuangan, dan pembukuan sekolah.' },
                          { title: 'Kesiswaan', label: 'Wakasek / Tim Kesiswaan', desc: 'Akses rekapitulasi kedisiplinan, data prestasi, kegiatan ekstrakurikuler, dan konseling.' },
                          { title: 'Guru BK', label: 'Guru BK (Bimbingan Konseling)', desc: 'Akses catatan bimbingan konseling, rekam perkembangan karakter, dan laporan siswa.' },
                          { title: 'Kepala Sekolah', label: 'Kepala Sekolah / Manajemen', desc: 'Akses laporan eksekutif, rekapitulasi sekolah, dan evaluasi capaian kinerja guru.' },
                          { title: 'Administrator', label: 'Administrator / Operator Sekolah', desc: 'Akses konfigurasi tingkat tinggi, master data akun, dan pengaturan SSO sistem.' }
                        ].map((item) => {
                          const isSelected = regRole === item.title;
                          return (
                            <div
                              key={item.title}
                              onClick={() => setRegRole(item.title)}
                              className={`p-3 rounded-xl border transition-all cursor-pointer select-none text-left ${
                                isSelected
                                  ? 'bg-cyan-50/90 border-[#164e63] shadow-xs ring-2 ring-[#164e63]/20'
                                  : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/80 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-[#164e63]' : 'text-slate-800'}`}>
                                  {item.label}
                                </span>
                                {isSelected && (
                                  <span className="shrink-0 w-5 h-5 rounded-full bg-[#164e63] text-white flex items-center justify-center">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                <span className="font-semibold text-slate-700">Fungsi Akses: </span>
                                {item.desc}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Sticky Submit Button inside or at bottom of scroll container */}
                      <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs pt-2 pb-1">
                        <button
                          type="button"
                          onClick={() => setPreAuthAccepted(true)}
                          className="w-full bg-[#164e63] hover:bg-[#003d6d] text-white font-bold text-sm sm:text-base py-3 sm:py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99]"
                        >
                          <UserPlus className="w-5 h-5 shrink-0" />
                          <span>Lanjutkan ke Formulir Pendaftaran ({regRole})</span>
                          <ArrowRight className="w-5 h-5 shrink-0" />
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              ) : (
                /* SINGLE-COLUMN UNBOXED LAYOUT FOR LOGIN PRE-AUTH */
                <div className="text-slate-800 space-y-6 animate-fadeIn">
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg sm:text-xl font-bold text-[#164e63] mb-1">
                      Autentikasi Akun
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl">
                      Silakan lakukan konfirmasi autentikasi sebelum masuk ke formulir.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPreAuthAccepted(true)}
                    className="w-full bg-[#164e63] hover:bg-[#003d6d] text-white font-bold text-sm sm:text-base py-3.5 sm:py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99]"
                  >
                    <LogIn className="w-5 h-5 shrink-0" />
                    <span>Lanjutkan ke Formulir Masuk</span>
                  </button>

                  <div className="pt-4 border-t border-slate-200 space-y-3">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Info className="w-4 h-4 shrink-0 text-[#164e63]" />
                      <span>Perhatian Sebelum Melanjutkan:</span>
                    </h4>
                    <ul className="text-xs sm:text-sm text-slate-600 space-y-2 list-decimal pl-5 marker:font-bold marker:text-[#164e63]">
                      <li>Pastikan menggunakan email resmi / NISN yang aktif dan terdaftar</li>
                      <li>Pilih hak akses sesuai tugas dan wewenang resmi di satuan pendidikan</li>
                      <li>Tidak diperkenankan menggunakan data/akun milik pihak lain</li>
                      <li>Jika didapati menggunakan data/akun lain maka akan di-blacklist/diblokir</li>
                    </ul>
                  </div>
                </div>
              )
            ) : (
              <div className="text-slate-800 animate-fadeIn">
                
                {errorMessage && (
                  <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2.5 animate-fadeIn">
                    <X className="w-5 h-5 shrink-0 text-rose-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {successNotification && (
                  <div className={`mb-6 p-4 border text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2.5 animate-fadeIn ${
                    isStudentLogin ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-cyan-50 border-cyan-200 text-[#164e63]'
                  }`}>
                    <CheckCircle2 className={`w-5 h-5 shrink-0 ${isStudentLogin ? 'text-emerald-600' : 'text-[#164e63]'}`} />
                    <span>{successNotification}</span>
                  </div>
                )}

                {/* TAB 1: FORM LOGIN */}
                {activeTab === 'login' && (
                  <div className={isMasterDataLogin ? "grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start animate-fadeIn" : ""}>
                    {isMasterDataLogin && (
                      <div className="lg:col-span-6 space-y-6">
                        {/* Deskripsi Singkat */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-[#164e63]">
                            <BookOpen className="w-5 h-5" />
                            <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                              Pendaftaran Akun SIMAK Merdeka
                            </h3>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            Sistem Informasi Manajemen Akademik terintegrasi untuk Guru, Tenaga Kependidikan, Staf Sekolah, dan Peserta Didik dengan standar Kurikulum Merdeka.
                          </p>
                        </div>

                        {/* Informasi Perhatian Sebelum Melanjutkan */}
                        <div className="pt-4 border-t border-slate-200 space-y-3">
                          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <Info className="w-4 h-4 shrink-0 text-[#164e63]" />
                            <span>Perhatian Sebelum Melanjutkan:</span>
                          </h4>
                          <ul className="text-xs sm:text-sm text-slate-600 space-y-2.5 list-decimal pl-5 marker:font-bold marker:text-[#164e63] leading-relaxed">
                            <li>Pastikan menggunakan email resmi / NISN yang aktif dan terdaftar</li>
                            <li>Pilih hak akses sesuai tugas dan wewenang resmi di satuan pendidikan</li>
                            <li>Tidak diperkenankan menggunakan data/akun milik pihak lain</li>
                            <li>Jika didapati menggunakan data/akun lain maka akan di-blacklist/diblokir</li>
                          </ul>
                        </div>
                      </div>
                    )}
                    
                    <div className={isMasterDataLogin ? "lg:col-span-6 lg:pl-4 lg:border-l lg:border-slate-200" : ""}>
                      <form onSubmit={handleLoginSubmit} className="space-y-5 sm:space-y-6">
                    {isStudentLogin ? (
                      <>
                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2">
                            NISN / NIS atau Nama Siswa *
                          </label>
                          <div className="relative">
                            <GraduationCap className="w-5 h-5 text-emerald-600 absolute left-4 top-3.5 sm:top-4" />
                            <input
                              type="text"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="Masukkan NISN (contoh: 0071234567) atau Nama Siswa"
                              className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-white border border-slate-300 rounded-xl text-sm sm:text-base font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all shadow-xs"
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div>
                        <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2">
                          Email Resmi Guru / NIP *
                        </label>
                        <div className="relative">
                          <User className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 sm:top-4" />
                          <input
                            type="text"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email resmi (guru@simakmerdeka.ai.studio) atau NIP"
                            className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-white border border-slate-300 rounded-xl text-sm sm:text-base font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-[#164e63] transition-all shadow-xs"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs sm:text-sm font-bold text-slate-800">
                          {isStudentLogin ? 'Kata Sandi Siswa *' : 'Kata Sandi (Password) *'}
                        </label>
                        {!isStudentLogin && (
                          <button
                            type="button"
                            onClick={handleOpenForgotModal}
                            className="text-xs sm:text-sm font-bold text-[#164e63] hover:text-[#003d6d] hover:underline cursor-pointer"
                          >
                            Lupa Kata Sandi?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 sm:top-4" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={isStudentLogin ? "Masukkan Kata Sandi" : "••••••••"}
                          className="w-full pl-12 pr-12 py-3.5 sm:py-4 bg-white border border-slate-300 rounded-xl text-sm sm:text-base font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-[#164e63] transition-all shadow-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-3.5 sm:top-4 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {!isStudentLogin && (isMasterDataLogin || email.trim().toLowerCase().includes('shahrur') || email.trim().toLowerCase().includes('master') || email.trim().toLowerCase().includes('admin') || email.trim().toLowerCase() === 'shahrurrobby17@gmail.com' || email.trim().replace(/\s+/g, '') === '199001012015011001') && (
                      <div className="space-y-4 pt-2">
                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2">
                            Akses Sistem Administrasi SSO *
                          </label>
                          <div className="relative">
                            <Building2 className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 sm:top-4 pointer-events-none" />
                            <select
                              value={ssoSystem}
                              onChange={(e) => setSsoSystem(e.target.value as 'Administrator' | 'Guru' | 'Kurikulum' | 'TU' | 'Keuangan' | 'Kesiswaan')}
                              className="w-full pl-12 pr-10 py-3.5 sm:py-4 bg-white border border-slate-300 rounded-xl text-sm sm:text-base font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-[#164e63] transition-all appearance-none cursor-pointer shadow-xs"
                            >
                              <option value="Administrator">Administrator (Master Data & Monitoring)</option>
                              <option value="Guru">Guru (Sistem Akademik & Jurnal Guru)</option>
                              <option value="Kurikulum">Kurikulum (Sistem Kurikulum)</option>
                              <option value="TU">TU (Sistem Tata Usaha)</option>
                              <option value="Keuangan">Keuangan (Sistem Keuangan & Anggaran)</option>
                              <option value="Kesiswaan">Kesiswaan (Sistem Kesiswaan)</option>
                            </select>
                            <ChevronDown className="w-5 h-5 text-slate-400 absolute right-4 top-3.5 sm:top-4 pointer-events-none" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2">
                            Kode Enkripsi Administrator *
                          </label>
                          <div className="relative">
                            <KeyRound className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 sm:top-4" />
                            <input
                              type={showEncryptionCode ? 'text' : 'password'}
                              required
                              value={encryptionCode}
                              onChange={(e) => setEncryptionCode(e.target.value)}
                              placeholder="Masukkan Kode Enkripsi"
                              className="w-full pl-12 pr-12 py-3.5 sm:py-4 bg-white border border-slate-300 rounded-xl text-sm sm:text-base font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-[#164e63] transition-all font-mono shadow-xs"
                            />
                            <button
                              type="button"
                              onClick={() => setShowEncryptionCode(!showEncryptionCode)}
                              className="absolute right-4 top-3.5 sm:top-4 text-slate-400 hover:text-slate-600 cursor-pointer"
                              title={showEncryptionCode ? "Sembunyikan Kode" : "Tampilkan Kode"}
                            >
                              {showEncryptionCode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Login Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full py-4 text-white font-bold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 mt-4 ${
                        isStudentLogin ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/25'
                      }`}
                    >
                      {isLoading ? (
                        <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                      ) : (
                        <>
                          {isStudentLogin ? (
                            <>
                              <GraduationCap className="w-5 h-5 text-white" />
                              <span>Masuk ke LMS Siswa</span>
                            </>
                          ) : (
                            <>
                              <span>Masuk ke Dashboard SIMAK</span>
                              <ArrowRight className="w-5 h-5 text-white" />
                            </>
                          )}
                        </>
                      )}
                    </button>
                    {!isStudentLogin && !isMasterDataLogin && (
                      <div className="text-center mt-3 pt-3 border-t border-slate-100">
                        <p className="text-xs text-slate-500 font-medium">
                          Belum memiliki akun?{' '}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('register');
                              setShowActivationStep(false);
                            }}
                            className="font-bold text-[#164e63] hover:underline cursor-pointer"
                          >
                            Daftar Akun Baru SIMAK
                          </button>
                        </p>
                      </div>
                    )}
                  </form>
                    </div>
                  </div>
                )}

                {activeTab === 'register' && (
                  showActivationStep ? (
                    showActivationSearch ? (
                      /* FORMULIR CEK STATUS AKTIVASI AKUN (EMAIL & KATA SANDI) */
                      <div className="w-full max-w-xl mx-auto space-y-6 animate-fadeIn">
                        <div className="bg-white border-2 border-sky-200/80 rounded-3xl p-6 sm:p-8 shadow-xl text-slate-800 relative overflow-hidden">
                          {/* Top Blue Accent Strip */}
                          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600" />

                          {/* Card Header */}
                          <div className="text-center mb-6 pt-1">
                            <div className="w-16 h-16 bg-sky-600 border-2 border-sky-400 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-sky-500/30">
                              <ShieldCheck className="w-8 h-8 stroke-[2.2] text-white animate-pulse" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-sky-950 tracking-tight">
                              Cek Status Aktivasi Akun
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 max-w-md mx-auto leading-relaxed">
                              Masukkan Email atau NIP terdaftar serta Kata Sandi akun Anda untuk mengecek status aktivasi terkini dari Operator Sekolah.
                            </p>
                          </div>

                          {/* Dedicated Search Scanning Animation Overlay */}
                          {isSearchingActivation && (
                            <div className="absolute inset-0 z-30 bg-white/95 backdrop-blur-xs rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-fadeIn select-none">
                              <div className="relative w-20 h-20 flex items-center justify-center mb-4">
                                <div className="absolute inset-0 rounded-full bg-sky-500/20 animate-ping" />
                                <div className="absolute inset-1 rounded-full border-2 border-dashed border-sky-400/60 animate-spin" style={{ animationDuration: '4s' }} />
                                <div className="absolute inset-3 rounded-full border-2 border-transparent border-t-sky-500 animate-spin" style={{ animationDuration: '1s' }} />
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/30">
                                  <Search className="w-6 h-6 text-white animate-pulse" />
                                </div>
                              </div>
                              <h4 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                                Memeriksa Status Aktivasi Akun
                              </h4>
                              <p className="text-xs sm:text-sm text-sky-700 font-semibold mt-1.5 max-w-xs transition-all duration-300">
                                {searchScanMessage}
                              </p>
                              <div className="w-56 h-2 bg-slate-100 rounded-full overflow-hidden mt-5 p-0.5 border border-slate-200">
                                <div className="h-full bg-gradient-to-r from-sky-500 via-sky-400 to-cyan-400 rounded-full animate-pulse w-full" />
                              </div>
                            </div>
                          )}

                          {checkError && (
                            <div className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-start gap-3 animate-fadeIn">
                              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                              <div className="flex-1">{checkError}</div>
                            </div>
                          )}

                          <form onSubmit={handleActivationSearchSubmit} className="space-y-4">
                            {/* Field 1: Email / NIP */}
                            <div>
                              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                                Email / NIP Terdaftar *
                              </label>
                              <div className="relative">
                                <Mail className="w-5 h-5 text-sky-600 absolute left-4 top-3.5" />
                                <input
                                  type="text"
                                  required
                                  value={checkEmail}
                                  onChange={(e) => setCheckEmail(e.target.value)}
                                  placeholder="Contoh: guru@simakmerdeka.ai.studio atau NIP"
                                  className="w-full pl-12 pr-4 py-3 bg-sky-50/30 border border-sky-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-600 transition-all"
                                />
                              </div>
                            </div>

                            {/* Field 2: Kata Sandi */}
                            <div>
                              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                                Kata Sandi (Password) *
                              </label>
                              <div className="relative">
                                <Lock className="w-5 h-5 text-sky-600 absolute left-4 top-3.5" />
                                <input
                                  type={showCheckPassword ? 'text' : 'password'}
                                  required
                                  value={checkPassword}
                                  onChange={(e) => setCheckPassword(e.target.value)}
                                  placeholder="Masukkan kata sandi akun Anda"
                                  className="w-full pl-12 pr-12 py-3 bg-sky-50/30 border border-sky-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-600 transition-all"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowCheckPassword(!showCheckPassword)}
                                  className="absolute right-4 top-3.5 text-sky-600 hover:text-sky-800 cursor-pointer"
                                  title={showCheckPassword ? "Sembunyikan Kata Sandi" : "Tampilkan Kata Sandi"}
                                >
                                  {showCheckPassword ? <EyeOff className="w-5 h-5 text-sky-600" /> : <Eye className="w-5 h-5 text-sky-600" />}
                                </button>
                              </div>
                            </div>

                            {/* Submit Button */}
                            <button
                              type="submit"
                              disabled={checkLoading || isSearchingActivation}
                              className="w-full mt-2 py-3.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-sky-600/25 hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                            >
                              {checkLoading || isSearchingActivation ? (
                                <div className="flex items-center gap-2">
                                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                                  <span>Sedang Memeriksa Status...</span>
                                </div>
                              ) : (
                                <>
                                  <Search className="w-4 h-4 text-white" />
                                  <span>Cari & Cek Status Aktivasi</span>
                                </>
                              )}
                            </button>
                          </form>

                          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab('login');
                                setShowActivationStep(false);
                              }}
                              className="text-sky-600 hover:text-sky-800 hover:underline font-bold cursor-pointer"
                            >
                              Form Masuk (Login)
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : isAccountActive ? (
                      /* STEP 3 & 4: STATUS AKTIVASI AKUN - SUDAH AKTIF (HIJAU / EMERALD) */
                      <div className="w-full max-w-xl mx-auto space-y-6 animate-fadeIn">
                        <div className="bg-emerald-50/95 border-2 border-emerald-400/90 rounded-3xl p-6 sm:p-8 shadow-xl text-emerald-950 relative overflow-hidden">
                          {/* Background Accents */}
                          <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-200/50 rounded-full blur-2xl pointer-events-none"></div>
                          <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-teal-200/40 rounded-full blur-2xl pointer-events-none"></div>

                          <div className="flex flex-col items-center text-center space-y-5 relative z-10">
                            <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md ring-8 ring-emerald-400/20 mb-1">
                              <CheckCircle2 className="w-9 h-9" />
                            </div>

                            <div>
                              <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-emerald-950 tracking-tight">
                                Akun Pengguna SIMAK Telah Aktif!
                              </h3>
                              <p className="text-xs sm:text-sm text-emerald-900/80 font-semibold mt-1.5 max-w-lg mx-auto leading-relaxed">
                                Selamat! Akun Anda telah disetujui dan diaktivasi secara resmi oleh Administrator Sekolah. Anda kini dapat langsung masuk ke sistem SIMAK Merdeka.
                              </p>
                            </div>

                            {/* Account Details Box */}
                            <div className="w-full bg-white/95 backdrop-blur-xs border border-emerald-300/80 rounded-2xl p-4 sm:p-6 text-left text-slate-800 space-y-4 shadow-xs">
                              <div className="text-xs font-black text-emerald-900 uppercase tracking-wider border-b border-emerald-200 pb-2.5 flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                  <span>Rincian Akun Terverifikasi</span>
                                </span>
                                <span className="text-[11px] font-extrabold text-emerald-800 font-mono bg-emerald-100/90 px-3 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                                  STATUS: AKTIF
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm">
                                <div>
                                  <span className="text-slate-500 font-semibold block text-[11px]">Nama Lengkap:</span>
                                  <span className="font-bold text-slate-900 text-sm">{activationData?.name || regName || 'Pengguna Baru'}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 font-semibold block text-[11px]">Hak Akses / Peran:</span>
                                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 inline-block mt-0.5 text-xs">
                                    {activationData?.role || regRole}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-500 font-semibold block text-[11px]">Email Terdaftar:</span>
                                  <span className="font-bold text-slate-900 font-mono">{activationData?.email || regEmail || 'email@simakmerdeka.ai.studio'}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 font-semibold block text-[11px]">Sekolah / Instansi:</span>
                                  <span className="font-bold text-slate-900">{activationData?.school || regSchool || 'SMA Negeri 1 Indonesia'}</span>
                                </div>
                                {activationData?.nip && activationData.nip !== '-' && (
                                  <div>
                                    <span className="text-slate-500 font-semibold block text-[11px]">NIP / NISN:</span>
                                    <span className="font-bold text-slate-900 font-mono">{activationData.nip}</span>
                                  </div>
                                )}
                                <div>
                                  <span className="text-slate-500 font-semibold block text-[11px]">Status Akses:</span>
                                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Disetujui & Aktif
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Verification Notice */}
                            <div className="w-full bg-emerald-100/90 border border-emerald-300/80 rounded-xl p-3 text-left text-xs text-emerald-950 flex items-start gap-2.5">
                              <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                              <p className="leading-relaxed">
                                <span className="font-bold">Akses Siap Digunakan:</span> Seluruh fitur SIMAK Merdeka sesuai hak akses <b>{activationData?.role || regRole}</b> sudah dapat digunakan secara penuh.
                              </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="w-full pt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowActivationSearch(true);
                                  setCheckEmail('');
                                  setCheckPassword('');
                                  setCheckError(null);
                                  setSuccessNotification(null);
                                }}
                                className="w-full py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                              >
                                <Search className="w-4 h-4 text-slate-500" />
                                <span>Cek Akun Lain</span>
                              </button>
                            </div>

                          </div>
                        </div>
                      </div>
                    ) : (
                      /* STEP 2: STATUS AKTIVASI AKUN (WARNA BIRU PROFESIONAL & ALUR PENDAFTARAN) */
                      <div className="w-full max-w-xl mx-auto space-y-6 animate-fadeIn">
                        <div className="bg-sky-50/95 border-2 border-sky-300/90 rounded-3xl p-6 sm:p-8 shadow-xl text-sky-950 relative overflow-hidden">
                          {/* Background Accents */}
                          <div className="absolute -right-12 -top-12 w-48 h-48 bg-sky-200/50 rounded-full blur-2xl pointer-events-none"></div>
                          <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-blue-200/40 rounded-full blur-2xl pointer-events-none"></div>

                          <div className="flex flex-col items-center text-center space-y-5 relative z-10">
                            
                            <div>
                              <div className="w-16 h-16 bg-sky-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-sky-600/25">
                                <ShieldCheck className="w-8 h-8 stroke-[2.2] text-white" />
                              </div>
                              <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-sky-950 tracking-tight">
                                Aktivasi Akun Pengguna SIMAK
                              </h3>
                              <p className="text-xs sm:text-sm text-sky-900/80 font-semibold mt-1.5 max-w-lg mx-auto leading-relaxed">
                                Pendaftaran akun berhasil dikirim. Akun Anda saat ini dalam status <span className="underline font-bold">Menunggu Aktivasi</span> oleh Operator / Administrator Sekolah.
                              </p>
                            </div>

                            {/* Account Details Box */}
                            <div className="w-full bg-white/95 backdrop-blur-xs border border-sky-200/90 rounded-2xl p-4 sm:p-6 text-left text-slate-800 space-y-4 shadow-xs">
                              <div className="text-xs font-black text-sky-800 uppercase tracking-wider border-b border-sky-100 pb-2.5 flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                                  <span>Rincian Akun Terdaftar</span>
                                </span>
                                <span className="text-[11px] font-extrabold text-sky-700 font-mono bg-sky-100/80 px-2.5 py-0.5 rounded-full border border-sky-300 flex items-center gap-1.5">
                                  <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                                  STATUS: MENUNGGU AKTIVASI
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm">
                                <div>
                                  <span className="text-slate-500 font-semibold block text-[11px]">Nama Lengkap:</span>
                                  <span className="font-bold text-slate-900 text-sm">{activationData?.name || regName || 'Pengguna Baru'}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 font-semibold block text-[11px]">Hak Akses / Peran:</span>
                                  <span className="font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-200 inline-block mt-0.5 text-xs">
                                    {activationData?.role || regRole}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-500 font-semibold block text-[11px]">Email Terdaftar:</span>
                                  <span className="font-bold text-slate-900 font-mono">{activationData?.email || regEmail || 'email@simakmerdeka.ai.studio'}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 font-semibold block text-[11px]">Sekolah / Instansi:</span>
                                  <span className="font-bold text-slate-900">{activationData?.school || regSchool || 'SMA Negeri 1 Indonesia'}</span>
                                </div>
                                {activationData?.nip && activationData.nip !== '-' && (
                                  <div>
                                    <span className="text-slate-500 font-semibold block text-[11px]">NIP / NISN:</span>
                                    <span className="font-bold text-slate-900 font-mono">{activationData.nip}</span>
                                  </div>
                                )}
                                <div>
                                  <span className="text-slate-500 font-semibold block text-[11px]">Waktu Pendaftaran:</span>
                                  <span className="font-bold text-slate-700">{activationData?.date || new Date().toLocaleString('id-ID')}</span>
                                </div>
                              </div>
                            </div>

                            {/* Verification Notice */}
                            <div className="w-full bg-sky-100/90 border border-sky-300 rounded-xl p-3 text-left text-xs text-sky-950 flex items-start gap-2.5">
                              <Info className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
                              <p className="leading-relaxed">
                                <span className="font-bold">Informasi Aktivasi:</span> Proses verifikasi data pendaftaran memerlukan persetujuan Administrator IT / Operator Sekolah. Silakan hubungi Operator atau klik <b>Lanjut ke Form Masuk</b> untuk mulai masuk menggunakan akun Anda.
                              </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="w-full pt-2 flex flex-col sm:flex-row items-center gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  const targetEmail = activationData?.email || regEmail || '';
                                  setEmail(targetEmail);
                                  setActiveTab('login');
                                  setShowActivationStep(false);
                                  setPreAuthAccepted(true);
                                  setSuccessNotification(`Pendaftaran Berhasil! Akun "${targetEmail}" telah siap. Masukkan kata sandi Anda untuk masuk ke sistem.`);
                                }}
                                className="w-full sm:flex-1 py-3.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                              >
                                <span>Lanjut ke Form Masuk (Login)</span>
                                <ArrowRight className="w-4 h-4 text-white" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setIsLoading(true);
                                  setTimeout(() => {
                                    setIsLoading(false);
                                    const cleanEmail = (activationData?.email || regEmail).toLowerCase();
                                    const localRegUsersJson = ((k: string) => null as any)('simak_registered_users');
                                    const localRegUsers: UserAccount[] = localRegUsersJson ? JSON.parse(localRegUsersJson) : [];
                                    const allRegistered = [...registeredUsers, ...localRegUsers];
                                    const foundUser = allRegistered.find(u => u.email?.toLowerCase() === cleanEmail);
                                    
                                    if (foundUser && foundUser.status === 'Aktif') {
                                      if (activationData) {
                                        setActivationData({ ...activationData, status: 'Aktif' });
                                      }
                                      setSuccessNotification('Status Akun: TERVERIFIKASI & AKTIF! Silakan masuk ke aplikasi.');
                                    } else {
                                      setSuccessNotification('Status saat ini: Masih menunggu verifikasi Operator Sekolah.');
                                    }
                                  }, 500);
                                }}
                                className="w-full sm:flex-1 py-3.5 px-4 bg-cyan-100 hover:bg-cyan-200 text-[#164e63] font-bold text-xs sm:text-sm rounded-xl transition-all shadow-2xs border border-cyan-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                              >
                                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                                <span>Cek Status Aktivasi</span>
                              </button>
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowActivationSearch(true);
                                  setCheckEmail('');
                                  setCheckPassword('');
                                  setCheckError(null);
                                  setSuccessNotification(null);
                                }}
                                className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-300 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                              >
                                <Search className="w-3.5 h-3.5 text-slate-500" />
                                <span>Cek Akun Lain</span>
                              </button>
                            </div>

                          </div>
                        </div>
                      </div>
                    )
                  ) : (
                    <form onSubmit={handleRegisterSubmit} className="space-y-5 sm:space-y-6">
                      {/* Role Header Banner with Change Step Link */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-500">Mendaftar Sebagai:</span>
                          <span className="text-xs sm:text-sm font-bold text-[#164e63] bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-200">
                            {regRole}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPreAuthAccepted(false)}
                          className="text-xs font-bold text-[#164e63] hover:text-[#003d6d] hover:underline cursor-pointer flex items-center gap-1 self-start sm:self-auto"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span>Ganti Hak Akses / Peran</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2">
                            {regRole === 'Siswa' ? 'Nama Lengkap Siswa *' : 'Nama Lengkap & Gelar *'}
                          </label>
                          <input
                            type="text"
                            required
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            placeholder={regRole === 'Siswa' ? "Contoh: Ahmad Fauzan" : "Contoh: Dra. Tri Endah, M.Pd."}
                            className="w-full px-4 py-3.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-sm sm:text-base font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-[#164e63] shadow-2xs transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2">Nama Sekolah / Instansi *</label>
                          <input
                            type="text"
                            required
                            value={regSchool}
                            onChange={(e) => setRegSchool(e.target.value)}
                            placeholder="Contoh: SMA Negeri 3 Bandung"
                            className="w-full px-4 py-3.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-sm sm:text-base font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-[#164e63] shadow-2xs transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2">Hak Akses / Peran Pengguna *</label>
                        <div className="relative">
                          <ShieldCheck className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 sm:top-4 pointer-events-none" />
                          <select
                            value={regRole}
                            onChange={(e) => setRegRole(e.target.value)}
                            className="w-full pl-12 pr-10 py-3.5 sm:py-4 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-sm sm:text-base font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-[#164e63] transition-all appearance-none cursor-pointer shadow-2xs"
                          >
                            <option value="Guru Pengampu">Guru Pengampu (Mata Pelajaran)</option>
                            <option value="Guru Kelas">Guru Kelas / Wali Kelas</option>
                            <option value="Siswa">Siswa / Peserta Didik</option>
                            <option value="Kurikulum">Tim Kurikulum / Pengelola KSP</option>
                            <option value="Tata Usaha (TU)">Staf Tata Usaha (TU) / Administrasi</option>
                            <option value="Keuangan">Bendahara / Pengelola Keuangan</option>
                            <option value="Kesiswaan">Wakasek / Tim Kesiswaan</option>
                            <option value="Guru BK">Guru BK (Bimbingan Konseling)</option>
                            <option value="Kepala Sekolah">Kepala Sekolah / Manajemen</option>
                            <option value="Administrator">Administrator / Operator Sekolah</option>
                          </select>
                          <ChevronDown className="w-5 h-5 text-slate-400 absolute right-4 top-3.5 sm:top-4 pointer-events-none" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2">Email Resmi *</label>
                          <input
                            type="email"
                            required
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            placeholder="guru@simakmerdeka.ai.studio"
                            className="w-full px-4 py-3.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-sm sm:text-base font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-[#164e63] shadow-2xs transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2">
                            {regRole === 'Siswa' ? 'NISN / NIS (Opsional)' : 'NIP (Opsional)'}
                          </label>
                          <input
                            type="text"
                            value={regNip}
                            onChange={(e) => setRegNip(e.target.value)}
                            placeholder={regRole === 'Siswa' ? 'Contoh: 0081234567' : '19850101 201001 1 001'}
                            className="w-full px-4 py-3.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-sm sm:text-base font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-[#164e63] shadow-2xs transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2">Kata Sandi *</label>
                          <input
                            type="password"
                            required
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="Minimal 6 karakter"
                            className="w-full px-4 py-3.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-sm sm:text-base font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-[#164e63] shadow-2xs transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2">Ulangi Kata Sandi *</label>
                          <input
                            type="password"
                            required
                            value={regConfirmPassword}
                            onChange={(e) => setRegConfirmPassword(e.target.value)}
                            placeholder="Minimal 6 karakter"
                            className="w-full px-4 py-3.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-sm sm:text-base font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-[#164e63] shadow-2xs transition-all"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-[#164e63] hover:bg-[#003d6d] text-white font-bold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 mt-3 active:scale-[0.99]"
                      >
                        {isLoading ? (
                          <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                        ) : (
                          <>
                            <UserPlus className="w-5 h-5 text-white" />
                            <span>Lanjutkan ke Aktivasi Akun ({regRole})</span>
                            <ArrowRight className="w-5 h-5 text-white" />
                          </>
                        )}
                      </button>
                    </form>
                  )
                )}
              </div>
            )}
          </div>
        </main>

          {/* Full Screen Footer */}
          <footer className="w-full py-3 px-4 sm:px-8 border-t border-slate-200/80 bg-white/80 backdrop-blur-xs text-xs text-slate-500 font-medium shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2 z-10">
            <div className="flex items-center gap-2">
              <TutWuriHandayaniLogo className="w-4 h-4 text-[#164e63]" />
              <span className="font-semibold text-slate-700">SIMAK Merdeka</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-500">
              <span>Tahun Ajaran 2026/2027</span>
              <span>•</span>
              <span>© 2026 SIMAK Guru Merdeka. Hak Cipta Dilindungi.</span>
            </div>
          </footer>
        </div>
        )
      )}


      {/* 6. FORGOT PASSWORD PAGE VIEW */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-fadeIn overflow-y-auto">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
          
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden text-slate-800 relative z-10 flex flex-col">
            <div className="bg-[#164e63] text-white p-4 sm:p-5 flex items-center justify-between border-b border-cyan-900/40">
              <div className="flex items-center space-x-3">
                <div className="p-1.5 flex items-center justify-center shrink-0 bg-white/15 rounded-xl border border-white/20">
                  <KeyRound className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-white">Reset Kata Sandi</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-cyan-100 hover:text-white p-1.5 hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
                title="Kembali"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              {forgotError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <X className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{forgotError}</span>
                </div>
              )}

              {/* STEP 1: Enter Email */}
              {forgotStep === 1 && (
                <form onSubmit={handleSendResetEmail} className="space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Masukkan alamat email resmi yang terdaftar pada akun SIMAK Anda untuk menerima kode verifikasi OTP.
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Resmi *</label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="contoh: guru@simakmerdeka.ai.studio"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-[#164e63] focus:bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-2.5 bg-[#164e63] hover:bg-[#003d6d] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {forgotLoading ? (
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-white" />
                        <span>Kirim OTP & Tautan Pemulihan</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 2: Show OTP Code */}
              {forgotStep === 2 && (
                <div className="space-y-4">
                  <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl text-xs text-cyan-900 space-y-2">
                    <div className="font-bold text-[#164e63]">Kode OTP Verifikasi Anda:</div>
                    <div className="text-xl font-black text-[#164e63] tracking-widest bg-white p-2.5 rounded-lg text-center border border-cyan-300 select-all">
                      {generatedOtp}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Masukkan Kode OTP di Atas *</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={inputOtp}
                      onChange={(e) => setInputOtp(e.target.value)}
                      placeholder="6 Digit OTP"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-[#164e63] focus:bg-white"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => handleVerifyOtp()}
                      className="flex-1 py-2.5 bg-[#164e63] hover:bg-[#003d6d] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      Verifikasi OTP
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Enter New Password */}
              {forgotStep === 3 && (
                <form onSubmit={handleSaveNewPassword} className="space-y-3">
                  <p className="text-xs text-slate-600 font-medium">
                    Verifikasi berhasil. Silakan buat kata sandi baru untuk akun Anda.
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi Baru *</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-[#164e63] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Ulangi Kata Sandi Baru *</label>
                    <input
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Sama dengan kata sandi baru"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-[#164e63] focus:bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-2.5 bg-[#164e63] hover:bg-[#003d6d] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    {forgotLoading ? (
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                    ) : (
                      <span>Simpan Kata Sandi Baru</span>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 4: Reset Success */}
              {forgotStep === 4 && (
                <div className="text-center py-4 space-y-3">
                  <div className="w-12 h-12 bg-cyan-100 text-[#164e63] rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">Kata Sandi Berhasil Diperbarui!</h4>
                  <p className="text-xs text-slate-600">
                    Kata sandi baru untuk <span className="font-bold text-slate-800">{forgotEmail}</span> telah disimpan. Silakan lanjut untuk masuk.
                  </p>
                  <button
                    type="button"
                    onClick={handleFinishResetAndLogin}
                    className="w-full py-2.5 bg-[#164e63] hover:bg-[#003d6d] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Lanjut Masuk Akun
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
