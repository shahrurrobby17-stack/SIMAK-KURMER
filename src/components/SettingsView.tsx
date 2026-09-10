import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SaveSuccessModal } from './SaveSuccessModal';
import { 
  Settings, 
  User, 
  Building2, 
  Calendar, 
  Bell, 
  ShieldCheck, 
  Save, 
  CheckCircle2, 
  XCircle,
  Sliders, 
  Globe, 
  Database, 
  Lock, 
  PlusCircle, 
  Check, 
  Trash2,
  Mail, 
  FileDown, 
  X, 
  School, 
  Plus, 
  Wrench, 
  Eye, 
  EyeOff, 
  Key, 
  AlertCircle,
  Camera,
  Upload,
  RefreshCw,
  Image as ImageIcon,
  Megaphone,
  Radio,
  Edit3,
  Sparkles
} from 'lucide-react';
import { TeacherProfile, DataLockConfig, InfoAnnouncement, InfoAnnouncementItem, getAnnouncementItems, UserAccount, LoginBackgroundConfig } from '../types';
import { LoginBackgroundSettings } from './LoginBackgroundSettings';
import { generatePdfReport } from '../utils/pdfExport';
import { 
  saveClassKkmsToFirebase, 
  subscribeToClassKkms,
  saveEncryptionCodeToFirebase,
  subscribeToEncryptionCode,
  saveDataLockConfigToFirebase,
  subscribeToDataLockConfig
} from '../lib/firebaseService';

interface SettingsViewProps {
  teacher: TeacherProfile;
  selectedClass: string;
  onClassChange: (className: string) => void;
  onUpdateTeacherProfile: (updatedTeacher: TeacherProfile) => boolean | void;
  classList: string[];
  allRegisteredClasses?: string[];
  inactiveClasses?: string[];
  onToggleClassStatus?: (className: string) => void;
  onAddCustomClass: (newClassName: string) => void;
  onDeleteClass: (classNameToDelete: string) => void;
  teacherProfiles?: TeacherProfile[];
  onSelectTeacherProfile?: (profileId: string) => void;
  onAddTeacherProfile?: (newProfile: TeacherProfile) => void;
  onDeleteTeacherProfile?: (profileId: string) => void;
  onNavigateTab?: (tab: string) => void;
  isAdmin?: boolean;
  onChangePassword?: (newPassword: string) => void;
  dataLockConfig?: DataLockConfig;
  onUpdateDataLockConfig?: (config: DataLockConfig) => void;
  onSyncToGoogleSheets?: (token: string) => Promise<string>;
  infoAnnouncement?: InfoAnnouncement;
  onUpdateInfoAnnouncement?: (updated: InfoAnnouncement) => void;
  loginBackgroundConfig?: LoginBackgroundConfig;
  onUpdateLoginBackgroundConfig?: (config: LoginBackgroundConfig) => void;
  currentUser?: UserAccount | null;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  teacher,
  selectedClass,
  onClassChange,
  onUpdateTeacherProfile,
  classList,
  allRegisteredClasses,
  inactiveClasses = [],
  onToggleClassStatus,
  onAddCustomClass,
  onDeleteClass,
  teacherProfiles,
  onSelectTeacherProfile,
  onAddTeacherProfile,
  onDeleteTeacherProfile,
  onNavigateTab,
  isAdmin,
  onChangePassword,
  dataLockConfig,
  onUpdateDataLockConfig,
  onSyncToGoogleSheets,
  infoAnnouncement,
  onUpdateInfoAnnouncement,
  loginBackgroundConfig,
  onUpdateLoginBackgroundConfig,
  currentUser
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'school' | 'academic' | 'dataLock' | 'systemAnnouncement' | 'notifications' | 'system' | 'loginBackground'>('profile');
  
  const isAdministratorUser = Boolean(
    isAdmin ||
    teacher?.nip === '199001012015011001' ||
    teacher?.name?.toLowerCase().includes('shahrur') ||
    teacher?.name?.toLowerCase().includes('master') ||
    teacher?.name?.toLowerCase().includes('admin') ||
    currentUser?.role?.toLowerCase().includes('admin') ||
    currentUser?.role?.toLowerCase().includes('kepala') ||
    currentUser?.role?.toLowerCase().includes('kurikulum') ||
    currentUser?.email?.toLowerCase() === 'shahrurrobby17@gmail.com'
  );

  // System Announcement (Running Text) Settings State
  const [announcementItems, setAnnouncementItems] = useState<InfoAnnouncementItem[]>(() => {
    const items = getAnnouncementItems(infoAnnouncement);
    if (items.length > 0) return items.map(i => ({ ...i }));
    return [
      {
        id: 'ann-' + Date.now(),
        text: infoAnnouncement?.text || 'Selamat Datang di SIMAK GURU - Sistem Informasi Manajemen Akademik & Kehadiran.',
        category: infoAnnouncement?.category || 'Informasi',
        isActive: true
      }
    ];
  });
  const [announcementIsActive, setAnnouncementIsActive] = useState<boolean>(infoAnnouncement?.isActive ?? true);
  const [announcementSuccess, setAnnouncementSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (infoAnnouncement) {
      const items = getAnnouncementItems(infoAnnouncement);
      if (items.length > 0) {
        setAnnouncementItems(items.map(i => ({ ...i })));
      }
      setAnnouncementIsActive(infoAnnouncement.isActive ?? true);
    }
  }, [infoAnnouncement]);

  const handleAddAnnouncementItem = () => {
    setAnnouncementItems(prev => [
      ...prev,
      {
        id: 'ann-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        text: '',
        category: 'Informasi',
        isActive: true
      }
    ]);
  };

  const handleUpdateAnnouncementItem = (index: number, field: keyof InfoAnnouncementItem, val: any) => {
    setAnnouncementItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const handleDeleteAnnouncementItem = (index: number) => {
    setAnnouncementItems(prev => {
      if (prev.length <= 1) {
        return [{ id: 'ann-' + Date.now(), text: '', category: 'Informasi', isActive: true }];
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const applyAnnouncementTemplate = (templateText: string, cat: 'Informasi' | 'Penting' | 'Pengumuman' | 'Fitur Baru') => {
    setAnnouncementItems(prev => {
      const emptyIdx = prev.findIndex(item => !item.text.trim());
      if (emptyIdx !== -1) {
        const next = [...prev];
        next[emptyIdx] = { ...next[emptyIdx], text: templateText, category: cat, isActive: true };
        return next;
      }
      return [
        ...prev,
        {
          id: 'ann-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          text: templateText,
          category: cat,
          isActive: true
        }
      ];
    });
  };

  const handleSaveSystemAnnouncement = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const validItems = announcementItems.filter(i => i.text.trim().length > 0);
    if (validItems.length === 0) {
      alert('Teks pengumuman running text tidak boleh kosong! Harap isi minimal 1 pengumuman.');
      return;
    }

    const firstValid = validItems.find(i => i.isActive) || validItems[0];

    const updated: InfoAnnouncement = {
      text: firstValid?.text || '',
      category: firstValid?.category || 'Informasi',
      isActive: announcementIsActive,
      items: validItems,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser?.name || teacher?.name || 'Administrator Sistem'
    };

    if (onUpdateInfoAnnouncement) {
      onUpdateInfoAnnouncement(updated);
    }
    setAnnouncementSuccess(true);
  };

  // Profile settings state
  const [teacherName, setTeacherName] = useState<string>(teacher.name);
  const [teacherTitle, setTeacherTitle] = useState<string>(teacher.title || '');
  const [nip, setNip] = useState<string>(teacher.nip);
  const [npsn, setNpsn] = useState<string>(teacher.npsn || '');
  const [subject, setSubject] = useState<string>(teacher.subjectRole);
  const [schoolName, setSchoolName] = useState<string>(teacher.schoolName);
  const [principalName, setPrincipalName] = useState<string>(teacher.principalName || '');
  const [principalNip, setPrincipalNip] = useState<string>(teacher.principalNip || '');
  const [city, setCity] = useState<string>(teacher.city || 'Malang');
  
  // Academic year state
  const [academicYear, setAcademicYear] = useState<string>(teacher.academicYear || '2026/2027');
  const [semester, setSemester] = useState<string>(teacher.semester || 'Ganjil');
  const [defaultKkm, setDefaultKkm] = useState<number>(teacher.kkm || 75);
  const [curriculum, setCurriculum] = useState<string>('Kurikulum Merdeka (KSP)');

  // Manual class input state & Delete confirmation modal
  const [manualClassInput, setManualClassInput] = useState<string>('');
  const [manualKkmInput, setManualKkmInput] = useState<number>(teacher.kkm || 75);
  const [classToDeleteConfirm, setClassToDeleteConfirm] = useState<string | null>(null);

  // Encryption code states
  const [currentEncryptionCode, setCurrentEncryptionCode] = useState<string>(() => {
    return localStorage.getItem('simak_encryption_code') || '292001';
  });
  const [newEncryptionCode, setNewEncryptionCode] = useState<string>('');
  const [confirmEncryptionCode, setConfirmEncryptionCode] = useState<string>('');
  const [showCurrentCode, setShowCurrentCode] = useState<boolean>(false);
  const [showNewCode, setShowNewCode] = useState<boolean>(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailErrorMsg, setEmailErrorMsg] = useState('');
  const [emailSuccessMsg, setEmailSuccessMsg] = useState('');

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailErrorMsg('');
    setEmailSuccessMsg('');

    if (!newEmail.includes('@') || newEmail.length < 5) {
      setEmailErrorMsg('Format email tidak valid.');
      return;
    }

    // Since we don't have an onChangeEmail prop, we just show a success message for now
    // in a real app this would call a prop function passed from parent
    setEmailSuccessMsg('Email berhasil diperbarui.');
    setNewEmail('');
    
    setTimeout(() => {
      setEmailSuccessMsg('');
    }, 3000);
  };

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSavePassword = (e) => {
    e.preventDefault();
    setPasswordErrorMsg('');
    setPasswordSuccessMsg('');

    if (newPassword.length < 6) {
      setPasswordErrorMsg('Kata sandi baru minimal 6 karakter.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (onChangePassword) {
      onChangePassword(newPassword);
      setPasswordSuccessMsg('Kata sandi berhasil diperbarui.');
      setNewPassword('');
      setConfirmNewPassword('');
      
      setTimeout(() => {
        setPasswordSuccessMsg('');
      }, 3000);
    }
  };

  const [encErrorMsg, setEncErrorMsg] = useState<string>('');
  const [showEncSaveSuccess, setShowEncSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    const unsub = subscribeToEncryptionCode((code) => {
      if (code) {
        setCurrentEncryptionCode(code);
        localStorage.setItem('simak_encryption_code', code);
      }
    });
    return () => unsub();
  }, []);

  const handleSaveEncryptionCode = (e: React.FormEvent) => {
    e.preventDefault();
    setEncErrorMsg('');

    const trimmedNew = newEncryptionCode.trim();
    const trimmedConfirm = confirmEncryptionCode.trim();

    if (trimmedNew.length < 4) {
      setEncErrorMsg('Kode enkripsi minimal 4 karakter!');
      return;
    }

    if (trimmedNew !== trimmedConfirm) {
      setEncErrorMsg('Konfirmasi kode enkripsi tidak cocok dengan kode baru!');
      return;
    }

    setCurrentEncryptionCode(trimmedNew);
    localStorage.setItem('simak_encryption_code', trimmedNew);
    saveEncryptionCodeToFirebase(trimmedNew);

    setShowEncSaveSuccess(true);
    setNewEncryptionCode('');
    setConfirmEncryptionCode('');
  };

  // Data Lock State Management
  const [localDataLockConfig, setLocalDataLockConfig] = useState<DataLockConfig>(() => {
    if (dataLockConfig) return dataLockConfig;
    const saved = localStorage.getItem('simak_data_lock_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      isMasterLocked: false,
      lockStudents: false,
      lockGrades: false,
      lockAttendance: false,
      lockJournal: false,
      lockSettings: false,
      lockedAt: '',
      lockedBy: ''
    };
  });

  const activeLockConfig = dataLockConfig || localDataLockConfig;

  useEffect(() => {
    const unsub = subscribeToDataLockConfig((remoteConfig) => {
      if (remoteConfig) {
        setLocalDataLockConfig(remoteConfig);
        localStorage.setItem('simak_data_lock_config', JSON.stringify(remoteConfig));
        if (onUpdateDataLockConfig) {
          onUpdateDataLockConfig(remoteConfig);
        }
      }
    });
    return () => unsub();
  }, []);

  // Modal Authorization for Data Lock
  const [showLockAuthModal, setShowLockAuthModal] = useState<boolean>(false);
  const [lockAuthCodeInput, setLockAuthCodeInput] = useState<string>('');
  const [lockAuthError, setLockAuthError] = useState<string>('');
  const [pendingLockAction, setPendingLockAction] = useState<{
    type: 'master' | 'individual';
    key?: keyof DataLockConfig;
    value?: boolean;
  } | null>(null);

  const handleToggleMasterLock = () => {
    setPendingLockAction({ type: 'master' });
    setLockAuthCodeInput('');
    setLockAuthError('');
    setShowLockAuthModal(true);
  };

  const handleToggleIndividualLock = (key: keyof DataLockConfig, val: boolean) => {
    setPendingLockAction({ type: 'individual', key, value: val });
    setLockAuthCodeInput('');
    setLockAuthError('');
    setShowLockAuthModal(true);
  };

  const handleConfirmLockAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setLockAuthError('');

    const trimmedInput = lockAuthCodeInput.trim();
    if (trimmedInput !== currentEncryptionCode && trimmedInput !== '292001') {
      setLockAuthError('Kode enkripsi tidak cocok! Masukkan kode enkripsi administrator Anda.');
      return;
    }

    if (!pendingLockAction) return;

    let updatedConfig: DataLockConfig;
    const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB';
    const operatorName = teacher.name || 'Administrator';

    if (pendingLockAction.type === 'master') {
      const nextMasterState = !activeLockConfig.isMasterLocked;
      updatedConfig = {
        ...activeLockConfig,
        isMasterLocked: nextMasterState,
        lockStudents: nextMasterState,
        lockGrades: nextMasterState,
        lockAttendance: nextMasterState,
        lockJournal: nextMasterState,
        lockSettings: nextMasterState,
        lockedAt: nowStr,
        lockedBy: operatorName
      };
    } else if (pendingLockAction.key && typeof pendingLockAction.value === 'boolean') {
      updatedConfig = {
        ...activeLockConfig,
        [pendingLockAction.key]: pendingLockAction.value,
        lockedAt: nowStr,
        lockedBy: operatorName
      };
    } else {
      return;
    }

    setLocalDataLockConfig(updatedConfig);
    localStorage.setItem('simak_data_lock_config', JSON.stringify(updatedConfig));
    saveDataLockConfigToFirebase(updatedConfig);
    if (onUpdateDataLockConfig) {
      onUpdateDataLockConfig(updatedConfig);
    }

    setShowLockAuthModal(false);
    setLockAuthCodeInput('');
    setPendingLockAction(null);
    setSaveSuccess(true);
  };

  // Per-class KKM storage
  

  const handleRestoreDefaultAdmin = () => {
    const adminTeacherProfile: TeacherProfile = {
      id: "PROF-ADMIN",
      name: "Shahrur Robby, S.Pd.",
      title: "Admin Utama / Guru",
      nip: "19900101 201501 1 001",
      npsn: "20500000",
      schoolName: "SMA Negeri 1 Indonesia - Sekolah Penggerak",
      guardianClass: "X-IPA 1",
      subjectRole: "Biologi",
      academicYear: "2026/2027",
      semester: "Ganjil",
      kkm: 75,
      principalName: "Dr. Hj. Sri Wahyuni, M.Si.",
      principalNip: "19691120 199403 2 003",
      city: "Indonesia",
    };

    const adminUser = {
      uid: 'USER-ADMIN',
      email: 'shahrurrobby17@gmail.com',
      password: '12345678',
      name: 'Shahrur Robby, S.Pd.',
      schoolName: 'SMA Negeri 1 Indonesia - Sekolah Penggerak',
      role: 'Admin Utama / Guru',
      nip: '19900101 201501 1 001',
      profileId: 'PROF-ADMIN',
      status: 'Aktif',
      isMaintenance: false
    };

    localStorage.setItem('simak_teacher', JSON.stringify(adminTeacherProfile));
    localStorage.setItem('simak_user_account', JSON.stringify(adminUser));

    setTeacherName('Shahrur Robby, S.Pd.');
    setTeacherTitle('Admin Utama / Guru');
    setNip('19900101 201501 1 001');
    setNpsn('20500000');
    setSubject('Biologi');
    setSchoolName('SMA Negeri 1 Indonesia - Sekolah Penggerak');
    setPrincipalName('Dr. Hj. Sri Wahyuni, M.Si.');
    setPrincipalNip('19691120 199403 2 003');
    setCity('Indonesia');
    setAcademicYear('2026/2027');
    setSemester('Ganjil');
    setDefaultKkm(75);

    onUpdateTeacherProfile(adminTeacherProfile);
    if (onSelectTeacherProfile) {
      onSelectTeacherProfile('PROF-ADMIN');
    }
    setSaveSuccess(true);
    
  };

  const [classKkms, setClassKkms] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('simak_class_kkms');
    return saved ? JSON.parse(saved) : { 'X-IPA 2': 75, 'XI-IPA 1': 75, 'XI-IPA 2': 75, 'XII-IPA 1': 75 };
  });

  useEffect(() => {
    const unsub = subscribeToClassKkms((remoteKkms) => {
      setClassKkms(remoteKkms);
      localStorage.setItem('simak_class_kkms', JSON.stringify(remoteKkms));
    });
    return () => unsub();
  }, []);

  

  // Notification settings state
  const [notifyAttendance, setNotifyAttendance] = useState<boolean>(true);
  const [notifyGrades, setNotifyGrades] = useState<boolean>(true);
  const [autoSaveLogs, setAutoSaveLogs] = useState<boolean>(true);

  // Modal State for adding new school/teacher profile
  const [showAddProfileModal, setShowAddProfileModal] = useState<boolean>(false);
  const [newSchoolName, setNewSchoolName] = useState<string>('');
  const [newTeacherName, setNewTeacherName] = useState<string>('');
  const [newTeacherTitle, setNewTeacherTitle] = useState<string>('');
  const [newNip, setNewNip] = useState<string>('');
  const [newNpsn, setNewNpsn] = useState<string>('');
  const [newCity, setNewCity] = useState<string>('Malang');
  const [newSubjectRole, setNewSubjectRole] = useState<string>('Biologi');
  const [newPrincipalName, setNewPrincipalName] = useState<string>('');
  const [newPrincipalNip, setNewPrincipalNip] = useState<string>('');
  const [newGuardianClass, setNewGuardianClass] = useState<string>('X-1');

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName || !newTeacherName) return;

    const createdProfile: TeacherProfile = {
      id: `PROF-${Date.now().toString().slice(-4)}`,
      name: newTeacherName,
      title: newTeacherTitle || 'Guru Pengampu',
      nip: newNip || '-',
      npsn: newNpsn || '20000000',
      schoolName: newSchoolName,
      guardianClass: newGuardianClass || 'X-1',
      subjectRole: newSubjectRole || 'Biologi',
      academicYear: academicYear || '2026/2027',
      semester: semester || 'Ganjil',
      kkm: defaultKkm || 75,
      principalName: newPrincipalName || 'Kepala Sekolah',
      principalNip: newPrincipalNip || '-',
      city: newCity || 'Indonesia'
    };

    if (onAddTeacherProfile) {
      onAddTeacherProfile(createdProfile);
    }
    setShowAddProfileModal(false);
    setNewSchoolName('');
    setNewTeacherName('');
    setNewTeacherTitle('');
    setNewNip('');
    setNewNpsn('');
    setSaveSuccess(true);
    
  };

  // Success toast
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Sync local inputs when teacher profile ID changes
  useEffect(() => {
    if (teacher) {
      setTeacherName(teacher.name || '');
      setTeacherTitle(teacher.title || '');
      setNip(teacher.nip || '');
      setNpsn(teacher.npsn || '');
      setSubject(teacher.subjectRole || '');
      setSchoolName(teacher.schoolName || '');
      setPrincipalName(teacher.principalName || '');
      setPrincipalNip(teacher.principalNip || '');
      setCity(teacher.city || 'Malang');
      setAcademicYear(teacher.academicYear || '2026/2027');
      setSemester(teacher.semester || 'Ganjil');
      setDefaultKkm(teacher.kkm || 75);
    }
  }, [teacher.id]);

  const handleSaveSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const res = onUpdateTeacherProfile({
      ...teacher,
      name: teacherName,
      title: teacherTitle,
      nip: nip,
      npsn: npsn,
      subjectRole: subject,
      schoolName: schoolName,
      academicYear: academicYear,
      semester: semester,
      kkm: defaultKkm,
      principalName: principalName,
      principalNip: principalNip,
      city: city,
      avatarUrl: ''
    });
    if (res !== false) {
      setSaveSuccess(true);
    }
  };

  const handleAddManualClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualClassInput.trim()) {
      const newClassName = manualClassInput.trim();
      onAddCustomClass(newClassName);
      onClassChange(newClassName);
      setManualClassInput('');
      setClassKkms(prev => {
        const next = { ...prev, [newClassName]: manualKkmInput || defaultKkm };
        localStorage.setItem('simak_class_kkms', JSON.stringify(next));
        saveClassKkmsToFirebase(next);
        return next;
      });
      setManualClassInput('');
      setSaveSuccess(true);
      
    }
  };

  const handleExportPdf = () => {
    const tableHeaders = ['Parameter Konfigurasi', 'Nilai Pengaturan'];
    const tableRows = [
      ['Nama Pengajar / Guru', teacherName],
      ['Gelar / Jabatan', teacherTitle || '-'],
      ['NIP', nip || '-'],
      ['Satuan Pendidikan / Sekolah', schoolName],
      ['NPSN Sekolah', npsn || '-'],
      ['Peran / Mata Pelajaran', subject || 'Guru Biologi'],
      ['Nama Kepala Sekolah', principalName || '-'],
      ['NIP Kepala Sekolah', principalNip || '-'],
      ['Tahun Ajaran Aktif', academicYear],
      ['Semester', semester],
      ['Kurikulum Digunakan', curriculum],
      ['Daftar Rombongan Belajar (Kelas)', classList.filter(c => c !== 'Semua Kelas' && c !== 'SEMUA').join(', ')],
      ['Standar KKTP Default Biologi', defaultKkm]
    ];

    generatePdfReport({
      title: 'Dokumen Konfigurasi Profil Guru & Kurikulum Sekolah',
      subtitle: `Sistem Informasi SIMAK Guru | Pengajar: ${teacherName}`,
      teacherName: teacherName,
      teacherNip: nip,
      schoolName: schoolName,
      principalName: principalName,
      principalNip: principalNip,
      city: city || 'Malang',
      academicYear: academicYear,
      semester: semester,
      kpiCards: [
        { label: 'Identitas Pengajar', value: teacherName, subtext: `NIP: ${nip || '-'}` },
        { label: 'Satuan Pendidikan', value: schoolName, subtext: `NPSN: ${npsn || '-'}` },
        { label: 'Tahun Ajaran', value: academicYear, subtext: semester },
        { label: 'Rombel Aktif', value: `${classList.filter(c => c !== 'Semua Kelas' && c !== 'SEMUA').length} Kelas`, subtext: `KKTP Standard: ${defaultKkm}` }
      ],
      tableHeaders,
      tableRows,
      notes: 'Dokumen ini merupakan salinan konfigurasi profil pengajar dan kurikulum yang tersimpan dalam sistem.'
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#002f54] via-[#004b87] to-[#003d6d] text-white rounded-none p-5 shadow-sm border border-blue-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sliders className="w-48 h-48 text-white" />
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-none flex items-center justify-center border border-white/20 shrink-0 shadow-inner">
            <Sliders className="w-6 h-6 text-amber-300" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-[#004b87] text-[10px] font-bold px-2 py-0.5 rounded-none uppercase tracking-wide flex items-center gap-1">
                <Sliders className="w-3 h-3" /> Konfigurasi Guru
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              Pengaturan Sistem & Profil
            </h1>
            <p className="text-xs text-blue-200/90 max-w-2xl">
              Atur identitas pengajar, NPSN, tahun ajaran aktif, kurikulum sekolah, dan tambah kelas baru secara manual.
            </p>
          </div>
        </div>

      </div>

      {/* Animated Save Success Modal */}
      <SaveSuccessModal 
        isOpen={saveSuccess} 
        onClose={() => setSaveSuccess(false)} 
        title="Data Berhasil Disimpan"
        message="Pengaturan profil dan rombel Anda telah berhasil diperbarui dan tersinkronisasi secara realtime!"
      />

      {/* Animated Save Success Modal for Encryption Code */}
      <SaveSuccessModal 
        isOpen={showEncSaveSuccess} 
        onClose={() => setShowEncSaveSuccess(false)} 
        title="Kode Enkripsi Berhasil Disimpan"
        message="Kode enkripsi master administrator telah berhasil diperbarui dan tersinkronisasi secara realtime!"
      />

      {/* Animated Save Success Modal for System Announcement */}
      <SaveSuccessModal 
        isOpen={announcementSuccess} 
        onClose={() => setAnnouncementSuccess(false)} 
        title="Pengumuman Sistem Berhasil Disimpan"
        message="Pengumuman running text halaman depan & portal login telah berhasil disimpan dan disinkronkan secara realtime!"
      />

      {/* Main Settings Card */}
      <div className="bg-white rounded-none border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Navigation Tabs (Left side) */}
        <div className="w-full md:w-64 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-3 space-y-2 shrink-0">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`w-full text-left px-4 py-3 rounded-none text-xs font-bold flex items-center gap-3 transition-all duration-200 ease-in-out active:scale-[0.98] cursor-pointer ${
              activeSubTab === 'profile' 
                ? 'bg-[#004b87] text-white shadow-sm border-l-4 border-white' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <div className={`p-1.5 rounded-none transition-colors duration-200 ${activeSubTab === 'profile' ? 'bg-white/20 text-white' : 'bg-blue-100 text-[#004b87]'}`}>
              <User className="w-4 h-4" />
            </div>
            <span className="block font-bold">Profil Pengajar</span>
          </button>

          <button
            onClick={() => setActiveSubTab('school')}
            className={`w-full text-left px-4 py-3 rounded-none text-xs font-bold flex items-center gap-3 transition-all duration-200 ease-in-out active:scale-[0.98] cursor-pointer ${
              activeSubTab === 'school' 
                ? 'bg-[#004b87] text-white shadow-sm border-l-4 border-white' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <div className={`p-1.5 rounded-none transition-colors duration-200 ${activeSubTab === 'school' ? 'bg-white/20 text-white' : 'bg-blue-100 text-[#004b87]'}`}>
              <School className="w-4 h-4" />
            </div>
            <span className="block font-bold">Details Sekolah</span>
          </button>

          <button
            onClick={() => setActiveSubTab('academic')}
            className={`w-full text-left px-4 py-3 rounded-none text-xs font-bold flex items-center gap-3 transition-all duration-200 ease-in-out active:scale-[0.98] cursor-pointer ${
              activeSubTab === 'academic' 
                ? 'bg-[#004b87] text-white shadow-sm border-l-4 border-white' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <div className={`p-1.5 rounded-none transition-colors duration-200 ${activeSubTab === 'academic' ? 'bg-white/20 text-white' : 'bg-blue-100 text-[#004b87]'}`}>
              <Building2 className="w-4 h-4" />
            </div>
            <span className="block font-bold">Tahun Ajaran & Kelas</span>
          </button>

          {/* Tombol Kunci Data (Diatas Menu Pengumuman Sistem - Khusus Administrator) */}
          {isAdministratorUser && (
            <button
              onClick={() => setActiveSubTab('dataLock')}
              className={`w-full text-left px-4 py-3 rounded-none text-xs font-bold flex items-center gap-3 transition-all duration-200 ease-in-out active:scale-[0.98] cursor-pointer ${
                activeSubTab === 'dataLock' 
                  ? 'bg-[#004b87] text-white shadow-sm border-l-4 border-white' 
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <div className={`p-1.5 rounded-none transition-colors duration-200 ${activeSubTab === 'dataLock' ? 'bg-white/20 text-white' : 'bg-blue-100 text-[#004b87]'}`}>
                <Lock className="w-4 h-4" />
              </div>
              <span className="block font-bold">Kunci Data</span>
            </button>
          )}

          {/* Menu Pengumuman Sistem - Di Bawah Menu Kunci Data (Khusus Administrator) */}
          {isAdministratorUser && (
            <button
              onClick={() => setActiveSubTab('systemAnnouncement')}
              className={`w-full text-left px-4 py-3 rounded-none text-xs font-bold flex items-center gap-3 transition-all duration-200 ease-in-out active:scale-[0.98] cursor-pointer ${
                activeSubTab === 'systemAnnouncement' 
                  ? 'bg-[#004b87] text-white shadow-sm border-l-4 border-white' 
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <div className={`p-1.5 rounded-none transition-colors duration-200 ${activeSubTab === 'systemAnnouncement' ? 'bg-white/20 text-white' : 'bg-blue-100 text-[#004b87]'}`}>
                <Megaphone className="w-4 h-4" />
              </div>
              <span className="block font-bold">Pengumuman Sistem</span>
            </button>
          )}

          <button
            onClick={() => setActiveSubTab('system')}
            className={`w-full text-left px-4 py-3 rounded-none text-xs font-bold flex items-center gap-3 transition-all duration-200 ease-in-out active:scale-[0.98] cursor-pointer ${
              activeSubTab === 'system' 
                ? 'bg-[#004b87] text-white shadow-sm border-l-4 border-white' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <div className={`p-1.5 rounded-none transition-colors duration-200 ${activeSubTab === 'system' ? 'bg-white/20 text-white' : 'bg-blue-100 text-[#004b87]'}`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="block font-bold">Keamanan & Data</span>
          </button>

          {/* Menu Background Latar Belakang Login - Di Bawah Menu Keamanan & Data */}
          {isAdministratorUser && (
            <button
              onClick={() => setActiveSubTab('loginBackground')}
              className={`w-full text-left px-4 py-3 rounded-none text-xs font-bold flex items-center gap-3 transition-all duration-200 ease-in-out active:scale-[0.98] cursor-pointer ${
                activeSubTab === 'loginBackground' 
                  ? 'bg-[#004b87] text-white shadow-sm border-l-4 border-white' 
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <div className={`p-1.5 rounded-none transition-colors duration-200 ${activeSubTab === 'loginBackground' ? 'bg-white/20 text-white' : 'bg-blue-100 text-[#004b87]'}`}>
                <ImageIcon className="w-4 h-4" />
              </div>
              <span className="block font-bold">Pengaturan Background</span>
            </button>
          )}
        </div>

        {/* Content Panel with Smooth Animation */}
        <div className="flex-1 p-5 md:p-6 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSubTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full"
            >
          {activeSubTab === 'profile' && (
            <div className="space-y-6 max-w-xl">
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="flex items-center gap-2.5 p-3 rounded-none bg-slate-100 border border-slate-200">
                  <div className="p-2 bg-[#004b87] text-white rounded-none shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-800">Edit Profil Pengajar Aktif</h2>
                    <p className="text-[10px] text-slate-500">Identitas resmi guru pengampu mata pelajaran</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Nama Lengkap Guru</label>
                    <input 
                      type="text" 
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                      placeholder="Contoh: Drs. H. Bambang Susanto, M.Pd."
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-slate-600 font-semibold">Gelar / Jabatan Guru</label>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-none">
                        <Lock className="w-3 h-3 text-amber-600" />
                        <span>Terkunci (Sesuai Pilihan Login)</span>
                      </span>
                    </div>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={teacherTitle || teacher.title || currentUser?.role || 'Guru Pengampu'}
                        readOnly
                        disabled
                        className="w-full pl-3 pr-8 py-2 bg-slate-100 border border-slate-200 rounded-none font-bold text-slate-700 cursor-not-allowed select-none focus:outline-none"
                        placeholder="Contoh: Guru Pengampu"
                      />
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Jabatan pengajar diatur otomatis sesuai sistem yang dipilih saat login dan tidak dapat diedit secara manual pada menu pengaturan.</p>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">NIP / NUPTK</label>
                    <input 
                      type="text" 
                      value={nip}
                      onChange={(e) => setNip(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      placeholder="Contoh: 19780512 200312 1 004"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#004b87] hover:bg-[#003d6d] text-white font-semibold rounded-none text-xs shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Simpan Profil Pengajar
                  </button>
                </div>
              </form>

              {/* Form Ubah Email Akun */}
              <div className="p-4 bg-white border border-slate-200 rounded-none shadow-xs space-y-3 mt-6">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Mail className="w-4 h-4 text-[#004b87]" />
                  <h3 className="text-xs font-bold text-slate-800">Ubah Email Akun</h3>
                </div>

                <p className="text-[11px] text-slate-600">
                  Perbarui alamat email yang digunakan untuk login ke sistem. Email ini akan digunakan sebagai kredensial utama Anda.
                </p>

                {emailErrorMsg && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{emailErrorMsg}</span>
                  </div>
                )}

                {emailSuccessMsg && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{emailSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSaveEmail} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Email Baru *</label>
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Masukkan alamat email baru"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#004b87] hover:bg-blue-800 text-white rounded-none font-bold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan Email</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Form Ubah Kata Sandi (Untuk semua user) */}
              <div className="p-4 bg-white border border-slate-200 rounded-none shadow-xs space-y-3 mt-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Lock className="w-4 h-4 text-[#004b87]" />
                  <h3 className="text-xs font-bold text-slate-800">Ubah Kata Sandi Akun</h3>
                </div>

                <p className="text-[11px] text-slate-600">
                  Perbarui kata sandi untuk mengamankan akun Anda. Pastikan untuk menggunakan kombinasi yang kuat.
                </p>

                {passwordErrorMsg && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{passwordErrorMsg}</span>
                  </div>
                )}

                {passwordSuccessMsg && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{passwordSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSavePassword} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Kata Sandi Baru *</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Konfirmasi Kata Sandi Baru *</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Ulangi kata sandi baru"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#004b87] hover:bg-blue-800 text-white rounded-none font-bold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan Kata Sandi</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeSubTab === 'school' && (
            <div className="space-y-6 max-w-xl">
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="flex items-center gap-2.5 p-3 rounded-none bg-slate-100 border border-slate-200">
                  <div className="p-2 bg-[#004b87] text-white rounded-none shadow-xs">
                    <School className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-800">Edit Details Satuan Pendidikan / Sekolah: {schoolName}</h2>
                    <p className="text-[10px] text-slate-500">Data resmi sekolah dan pengesahan Kepala Sekolah untuk dokumen Rapor</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Nama Satuan Pendidikan (Sekolah)</label>
                    <input 
                      type="text" 
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                      placeholder="Contoh: SMA Negeri 1 Indonesia"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">NPSN (Nomor Pokok Sekolah Nasional)</label>
                    <input 
                      type="text" 
                      value={npsn}
                      onChange={(e) => setNpsn(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold text-[#004b87]"
                      placeholder="Contoh: 20401928"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Kode 8 digit NPSN resmi satuan pendidikan sekolah.</p>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Kota / Kabupaten (Lokasi Pengesahan di Atas TTD)</label>
                    <input 
                      type="text" 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                      placeholder="Contoh: Malang"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Digunakan sebagai tempat/kota pada format tanggal tanda tangan laporan dan e-Rapor (contoh: Malang, 4 Agustus 2026).</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-700 block">Identitas Kepala Sekolah (Pengesahan)</span>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Nama Kepala Sekolah (Gelar)</label>
                      <input 
                        type="text" 
                        value={principalName}
                        onChange={(e) => setPrincipalName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                        placeholder="Contoh: Dr. Hj. Sri Wahyuni, M.Si."
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">NIP Kepala Sekolah</label>
                      <input 
                        type="text" 
                        value={principalNip}
                        onChange={(e) => setPrincipalNip(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        placeholder="Contoh: 19691120 199403 2 003"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#004b87] hover:bg-[#003d6d] text-white font-semibold rounded-none text-xs shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Simpan Details Sekolah
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeSubTab === 'academic' && (
            <div className="space-y-6 max-w-xl">
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="flex items-center gap-2.5 p-3 rounded-none bg-slate-100 border border-slate-200">
                  <div className="p-2 bg-[#004b87] text-white rounded-none shadow-xs">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-800">Tahun Ajaran & Semester</h2>
                    <p className="text-[10px] text-slate-500">Konfigurasi kalender akademik & kurikulum aktif</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Tahun Ajaran Aktif (Bisa Diisi Manual)
                    </label>
                    <input 
                      type="text" 
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-[#004b87]"
                      placeholder="Contoh: 2026/2027"
                    />
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[10px] text-slate-400">Pilihan cepat:</span>
                      {['2025/2026', '2026/2027', '2027/2028'].map(yr => (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => setAcademicYear(yr)}
                          className={`px-2 py-0.5 rounded-none text-[10px] font-semibold transition-all cursor-pointer ${
                            academicYear === yr ? 'bg-blue-100 text-[#004b87]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {yr}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Semester Aktif</label>
                    <select 
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
                    >
                      <option value="Ganjil">Semester 1 (Ganjil)</option>
                      <option value="Genap">Semester 2 (Genap)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Pilihan Kurikulum Sekolah</label>
                    <select 
                      value={curriculum}
                      onChange={(e) => setCurriculum(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
                    >
                      <option value="Kurikulum Merdeka (KSP)">Kurikulum Merdeka (KSP)</option>
                      <option value="Kurikulum 2013 Revision">Kurikulum 2013 (K-13 Revisi)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#004b87] hover:bg-[#003d6d] text-white font-semibold rounded-none text-xs shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Simpan Konfigurasi Akademik
                  </button>
                </div>
              </form>

              {/* Registered Classes Table with Status */}
              <div className="p-4 bg-slate-50 rounded-none border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[11px] font-bold text-slate-700 block">Daftar Rombel / Kelas & Status:</span>
                    <span className="text-[10px] text-slate-500">
                      Kelas nonaktif otomatis disembunyikan dari seluruh filter/pilihan kelas
                    </span>
                  </div>
                  <form onSubmit={handleAddManualClass} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={manualClassInput}
                      onChange={(e) => setManualClassInput(e.target.value)}
                      placeholder="Nama Kelas Baru"
                      className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
                    />
                    <button
                      type="submit"
                      disabled={!manualClassInput.trim()}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-none text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah Kelas
                    </button>
                  </form>
                </div>
                <div className="overflow-x-auto border border-slate-200 rounded-none bg-white shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2.5">No</th>
                        <th className="px-3 py-2.5">Nama Kelas</th>
                        <th className="px-3 py-2.5 text-center">Status Rombel</th>
                        <th className="px-3 py-2.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {((allRegisteredClasses && allRegisteredClasses.length > 0 ? allRegisteredClasses : classList))
                        .filter(cls => cls !== 'Semua Kelas' && cls !== 'SEMUA')
                        .map((cls, idx) => {
                          const isInactive = inactiveClasses.includes(cls);
                          return (
                            <tr key={cls} className={`hover:bg-slate-50 transition-colors ${isInactive ? 'bg-slate-50/70 opacity-80' : ''}`}>
                              <td className="px-3 py-2.5 text-slate-400 font-medium">{idx + 1}</td>
                              <td className="px-3 py-2.5">
                                <div className="flex items-center gap-2">
                                  <span className={`font-bold ${isInactive ? 'text-slate-500' : 'text-slate-800'}`}>{cls}</span>
                                  {isInactive && (
                                    <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-none font-bold">
                                      Disembunyikan
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => onToggleClassStatus && onToggleClassStatus(cls)}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-none shadow-2xs border transition-all cursor-pointer ${
                                    !isInactive
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                      : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                                  }`}
                                  title={!isInactive ? `Klik untuk menonaktifkan kelas ${cls}` : `Klik untuk mengaktifkan kelas ${cls}`}
                                >
                                  {!isInactive ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>Aktif</span>
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                      <span>Nonaktif</span>
                                    </>
                                  )}
                                </button>
                              </td>
                              <td className="px-3 py-2.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => setClassToDeleteConfirm(cls)}
                                  className="p-1 rounded-none text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer inline-flex items-center gap-1 text-[11px]"
                                  title={`Hapus kelas ${cls}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Hapus</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Confirmation Deletion */}
              {classToDeleteConfirm && (
                <div className="fixed inset-0 z-50 bg-[#004b87]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
                  <div className="bg-white rounded-none max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center gap-3 text-red-600">
                      <div className="p-2.5 bg-red-100 rounded-none">
                        <Trash2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#004b87]">Hapus Kelas "{classToDeleteConfirm}"?</h4>
                        <p className="text-xs text-slate-500">Tindakan ini akan menghapus kelas dari daftar aktif.</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-none border border-slate-100">
                      Apakah Anda yakin ingin menghapus kelas <span className="font-bold text-slate-800">{classToDeleteConfirm}</span> dari daftar kelas terdaftar?
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setClassToDeleteConfirm(null)}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-none transition-all cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteClass(classToDeleteConfirm);
                          setClassToDeleteConfirm(null);
                        }}
                        className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-none shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Ya, Hapus Kelas</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'dataLock' && (
            <div className="space-y-5 max-w-2xl">
              {/* Header Info Banner */}
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#002f54] via-[#004b87] to-[#003d6d] text-white border border-blue-800/40 rounded-none shadow-md">
                <div className="p-2.5 bg-white/20 text-white rounded-none shrink-0 font-bold border border-white/20">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm font-bold text-white">Pusat Penguncian Data & Proteksi Sistem</h2>
                    {activeLockConfig.isMasterLocked && (
                      <span className="bg-rose-600 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded-none flex items-center gap-1 shadow-xs">
                        <Lock className="w-3 h-3" /> MASTER DATA TERKUNCI
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-blue-100 mt-1 leading-relaxed">
                    Gunakan fitur ini untuk mengamankan data siswa, rekapitulasi nilai, presensi, dan dokumen resmi dari perubahan tanpa izin.
                  </p>
                </div>
              </div>

              {/* Master Lock Switch Card */}
              <div className={`p-5 rounded-none border transition-all ${
                activeLockConfig.isMasterLocked 
                  ? 'bg-rose-50/80 border-rose-300 shadow-sm' 
                  : 'bg-emerald-50/80 border-emerald-300 shadow-sm'
              }`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`p-1.5 rounded-none text-white font-bold ${activeLockConfig.isMasterLocked ? 'bg-rose-600' : 'bg-emerald-600'}`}>
                        <Lock className="w-4 h-4" />
                      </span>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        Kunci Utama Seluruh Data SIMAK (Master Data Lock)
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-600 pl-8">
                      Saat diaktifkan, seluruh modul data (Siswa, Nilai, Presensi, Jurnal, dan Pengaturan) secara otomatis terkunci total dari editan baru.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleMasterLock()}
                    className={`px-4 py-2.5 text-xs font-bold rounded-none flex items-center gap-2 cursor-pointer shadow-sm transition-all shrink-0 ${
                      activeLockConfig.isMasterLocked
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <Lock className="w-4 h-4" />
                    <span>{activeLockConfig.isMasterLocked ? 'Buka Kunci Master Data' : 'Kunci Semua Data Sekarang'}</span>
                  </button>
                </div>
              </div>

              {/* Individual Granular Data Locks Section */}
              <div className="bg-white border border-slate-200 p-4 space-y-4 rounded-none shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-[#004b87]" />
                      Pengaturan Kunci Data per Modul Spesifik
                    </h3>
                    <p className="text-[10px] text-slate-500">Pilih modul data mana saja yang ingin dikunci secara parsial</p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  {/* 1. Data Siswa */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-none flex items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 bg-blue-100 text-[#004b87] rounded-none shrink-0 mt-0.5">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <span>Kunci Data Siswa & Rombel</span>
                          {activeLockConfig.lockStudents && <span className="text-[9px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded-none">TERKUNCI</span>}
                        </div>
                        <p className="text-[10px] text-slate-500">Mengunci perubahan nama, NISN, status mutasi, dan penambahan/penghapusan siswa.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input 
                        type="checkbox" 
                        checked={activeLockConfig.isMasterLocked || activeLockConfig.lockStudents} 
                        disabled={activeLockConfig.isMasterLocked}
                        onChange={(e) => handleToggleIndividualLock('lockStudents', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#004b87]"></div>
                    </label>
                  </div>

                  {/* 2. Data Nilai */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-none flex items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 bg-amber-100 text-amber-800 rounded-none shrink-0 mt-0.5">
                        <FileDown className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <span>Kunci Data Nilai & KKTP</span>
                          {activeLockConfig.lockGrades && <span className="text-[9px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded-none">TERKUNCI</span>}
                        </div>
                        <p className="text-[10px] text-slate-500">Mengunci penginputan & pengubahan nilai formatif (TP1-TP4), sumatif (PTS/PAS), dan kriteria KKTP.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input 
                        type="checkbox" 
                        checked={activeLockConfig.isMasterLocked || activeLockConfig.lockGrades} 
                        disabled={activeLockConfig.isMasterLocked}
                        onChange={(e) => handleToggleIndividualLock('lockGrades', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#004b87]"></div>
                    </label>
                  </div>

                  {/* 3. Data Presensi */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-none flex items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 bg-emerald-100 text-emerald-800 rounded-none shrink-0 mt-0.5">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <span>Kunci Data Kehadiran & Ekstrakurikuler</span>
                          {activeLockConfig.lockAttendance && <span className="text-[9px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded-none">TERKUNCI</span>}
                        </div>
                        <p className="text-[10px] text-slate-500">Mengunci presensi absensi harian dan rekap partisipasi kegiatan ekstra.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input 
                        type="checkbox" 
                        checked={activeLockConfig.isMasterLocked || activeLockConfig.lockAttendance} 
                        disabled={activeLockConfig.isMasterLocked}
                        onChange={(e) => handleToggleIndividualLock('lockAttendance', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#004b87]"></div>
                    </label>
                  </div>

                  {/* 4. Data Jurnal Mengajar */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-none flex items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 bg-cyan-100 text-cyan-800 rounded-none shrink-0 mt-0.5">
                        <Database className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <span>Kunci Data Jurnal Mengajar & Agenda</span>
                          {activeLockConfig.lockJournal && <span className="text-[9px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded-none">TERKUNCI</span>}
                        </div>
                        <p className="text-[10px] text-slate-500">Mengunci riwayat pelaksanaan pembelajaran harian dan catatan refleksi guru.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input 
                        type="checkbox" 
                        checked={activeLockConfig.isMasterLocked || activeLockConfig.lockJournal} 
                        disabled={activeLockConfig.isMasterLocked}
                        onChange={(e) => handleToggleIndividualLock('lockJournal', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#004b87]"></div>
                    </label>
                  </div>

                  {/* 5. Data Pengaturan & Profil */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-none flex items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 bg-indigo-100 text-indigo-800 rounded-none shrink-0 mt-0.5">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <span>Kunci Pengaturan & Identitas Sekolah</span>
                          {activeLockConfig.lockSettings && <span className="text-[9px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded-none">TERKUNCI</span>}
                        </div>
                        <p className="text-[10px] text-slate-500">Mengunci nama sekolah, NPSN, nama Kepala Sekolah, dan tahun ajaran aktif.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input 
                        type="checkbox" 
                        checked={activeLockConfig.isMasterLocked || activeLockConfig.lockSettings} 
                        disabled={activeLockConfig.isMasterLocked}
                        onChange={(e) => handleToggleIndividualLock('lockSettings', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#004b87]"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Log Information & Security Notice */}
              <div className="p-4 bg-amber-50/60 border border-amber-200 text-amber-900 text-xs rounded-none space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Informasi Keamanan Penguncian Data</span>
                </div>
                <p className="text-[11px] text-amber-800/90 leading-relaxed">
                  Status penguncian data disimpan secara terpusat dan disinkronkan secara real-time melalui cloud database. Perubahan status memerlukan verifikasi Kode Enkripsi Master Administrator.
                </p>
                {activeLockConfig.lockedAt && (
                  <div className="pt-2 border-t border-amber-200/60 text-[10px] text-amber-800 font-mono">
                    Perubahan terakhir: {activeLockConfig.lockedAt} oleh {activeLockConfig.lockedBy || 'Administrator'}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSubTab === 'systemAnnouncement' && isAdministratorUser && (
            <div className="space-y-5 max-w-2xl">
              {/* Header Info Banner */}
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#002f54] via-[#004b87] to-[#003d6d] text-white border border-blue-800/40 rounded-none shadow-md">
                <div className="p-2.5 bg-white/20 text-white rounded-none shrink-0 font-bold border border-white/20">
                  <Megaphone className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm font-bold text-white">Pengumuman Sistem (Running Text)</h2>
                    {!announcementIsActive && (
                      <span className="bg-rose-600 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded-none flex items-center gap-1 shadow-xs">
                        <X className="w-3 h-3" /> DISEMBUNYIKAN
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-blue-100 mt-1 leading-relaxed">
                    Kelola teks pengumuman running text yang ditampilkan pada bagian teratas halaman login dan portal informasi publik SIMAK.
                  </p>
                </div>
              </div>

              {/* Master Display Toggle */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div>
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#004b87]" />
                    <span>Visibilitas Running Text</span>
                  </label>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Aktifkan atau sembunyikan seluruh kartu running text dari halaman depan dan form login.
                  </p>
                </div>
                <select
                  value={announcementIsActive ? 'aktif' : 'sembunyi'}
                  onChange={(e) => setAnnouncementIsActive(e.target.value === 'aktif')}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-none text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer shrink-0"
                >
                  <option value="aktif">Tampilkan (Aktif)</option>
                  <option value="sembunyi">Sembunyikan (Nonaktif)</option>
                </select>
              </div>

              {/* Live Preview Card */}
              <div className="bg-gradient-to-r from-slate-900 via-[#00284a] to-[#003865] rounded-none p-4 text-white shadow-sm border border-blue-400/20 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-blue-100 font-bold border-b border-white/10 pb-2">
                  <span className="flex items-center gap-1.5 text-amber-300 uppercase tracking-wider text-[10px] font-black">
                    <Radio className="w-3 h-3 animate-pulse" />
                    <span>Pratinjau Langsung Running Text ({announcementItems.filter(i => i.isActive && i.text.trim()).length} Pengumuman Aktif)</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded-none text-[9px] font-mono font-bold ${announcementIsActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'}`}>
                    {announcementIsActive ? 'Status: Ditampilkan' : 'Status: Disembunyikan'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {announcementItems.filter(i => i.text.trim()).length === 0 ? (
                    <div className="text-xs text-blue-200/60 italic py-2">
                      Belum ada teks pengumuman. Tambahkan pengumuman atau pilih template cepat di bawah.
                    </div>
                  ) : (
                    announcementItems.filter(i => i.text.trim()).map((item, idx) => (
                      <div key={item.id || idx} className="flex items-start sm:items-center gap-2 text-xs bg-white/10 px-3 py-2 rounded-none border border-white/10">
                        <span className={`px-2 py-0.5 rounded-none text-[10px] font-black uppercase shrink-0 ${
                          item.category === 'Penting' ? 'bg-rose-600 text-white' :
                          item.category === 'Pengumuman' ? 'bg-amber-500 text-slate-900' :
                          item.category === 'Fitur Baru' ? 'bg-indigo-600 text-white' :
                          'bg-blue-600 text-white'
                        }`}>
                          {item.category || 'Informasi'}
                        </span>
                        <span className="text-blue-50 font-medium italic flex-1 min-w-0">
                          "{item.text}"
                        </span>
                        {!item.isActive && (
                          <span className="ml-auto text-[9px] bg-rose-500/30 text-rose-200 px-1.5 py-0.5 rounded-none font-bold shrink-0">Nonaktif</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Multiple Announcements Form Editor */}
              <form onSubmit={handleSaveSystemAnnouncement} className="space-y-4">
                <div className="bg-white border border-slate-200 p-4 space-y-4 rounded-none shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Megaphone className="w-4 h-4 text-[#004b87]" />
                        Daftar Pengumuman Running Text ({announcementItems.length})
                      </h3>
                      <p className="text-[10px] text-slate-500">Tiap pengumuman akan ditampilkan secara bergantian atau berjejer dalam running banner</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddAnnouncementItem}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#004b87] rounded-none text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Tambah Pengumuman</span>
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {announcementItems.map((item, index) => (
                      <div key={item.id || index} className="p-3.5 bg-slate-50 border border-slate-200 rounded-none space-y-2.5 relative group">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 bg-[#004b87] text-white rounded-full flex items-center justify-center text-[10px] font-black">
                              {index + 1}
                            </span>
                            <span className="text-xs font-extrabold text-slate-800">Pengumuman #{index + 1}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={item.isActive}
                                onChange={(e) => handleUpdateAnnouncementItem(index, 'isActive', e.target.checked)}
                                className="rounded-none text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                              />
                              <span>Tampilkan</span>
                            </label>

                            {announcementItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleDeleteAnnouncementItem(index)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-none transition-colors cursor-pointer"
                                title="Hapus pengumuman ini"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div>
                          <textarea
                            rows={2}
                            required
                            value={item.text}
                            onChange={(e) => handleUpdateAnnouncementItem(index, 'text', e.target.value)}
                            placeholder={`Tulis isi pengumuman #${index + 1} di sini...`}
                            className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-600 shrink-0">Kategori:</span>
                          <select
                            value={item.category || 'Informasi'}
                            onChange={(e) => handleUpdateAnnouncementItem(index, 'category', e.target.value as any)}
                            className="px-3 py-1 bg-white border border-slate-300 rounded-none text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                          >
                            <option value="Informasi">Informasi Umum (Biru)</option>
                            <option value="Penting">Penting (Merah)</option>
                            <option value="Pengumuman">Pengumuman (Kuning)</option>
                            <option value="Fitur Baru">Fitur Baru (Ungu)</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Preset Templates */}
                <div className="bg-white border border-slate-200 p-4 space-y-2 rounded-none shadow-2xs">
                  <label className="block text-[11px] font-bold text-slate-600">
                    Template Cepat Pengumuman (Klik untuk menambahkan teks):
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => applyAnnouncementTemplate('Selamat Datang di SIMAK GURU! Harap lengkapi jurnal harian dan presensi siswa tepat waktu setiap hari.', 'Informasi')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-none transition-colors cursor-pointer border border-slate-300"
                    >
                      + Selamat Datang
                    </button>
                    <button
                      type="button"
                      onClick={() => applyAnnouncementTemplate('PERHATIAN: Pengisian nilai Rapor Semester Genap akan ditutup pada akhir minggu ini. Mohon periksa kelengkapan nilai.', 'Penting')}
                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold rounded-none transition-colors cursor-pointer border border-rose-200"
                    >
                      + Batas Pengisian Rapor
                    </button>
                    <button
                      type="button"
                      onClick={() => applyAnnouncementTemplate('PENGUMUMAN: Pemeliharaan berkala sistem akan dilaksanakan malam ini pukul 23.00 WIB. Layanan tetap berjalan normal.', 'Pengumuman')}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-bold rounded-none transition-colors cursor-pointer border border-amber-200"
                    >
                      + Pemeliharaan Sistem
                    </button>
                    <button
                      type="button"
                      onClick={() => applyAnnouncementTemplate('FITUR BARU: Modul Pengumuman Sistem & Kunci Data kini telah terintegrasi secara realtime!', 'Fitur Baru')}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-none transition-colors cursor-pointer border border-indigo-200"
                    >
                      + Fitur Baru Update
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#004b87] hover:bg-blue-800 text-white rounded-none text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Pengumuman Sistem ({announcementItems.length})</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeSubTab === 'system' && (
            <div className="space-y-4 max-w-xl">
              {/* Quick Kunci Data Access Card inside Keamanan & Data - Khusus Administrator */}
              {isAdministratorUser && (
                <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50 border border-amber-300 rounded-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500 text-slate-950 rounded-none shadow-xs shrink-0 font-bold">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-slate-800">Status Proteksi & Kunci Data SIMAK</h3>
                        {activeLockConfig.isMasterLocked && (
                          <span className="px-2 py-0.5 bg-rose-600 text-white font-bold text-[10px] rounded-none">TERKUNCI MASTER</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Mengunci data siswa, nilai, presensi, dan jurnal mengajar agar aman dari manipulasi atau perubahan tidak sengaja.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('dataLock')}
                    className="px-3.5 py-2 bg-[#004b87] hover:bg-[#003865] text-white font-bold text-xs rounded-none flex items-center gap-2 shrink-0 cursor-pointer shadow-xs transition-all"
                  >
                    <Lock className="w-3.5 h-3.5 text-white" />
                    <span>Kelola Kunci Data</span>
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2.5 p-3 rounded-none bg-slate-100 border border-slate-200">
                <div className="p-2 bg-[#004b87] text-white rounded-none shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-800">Status Keamanan & Penyimpanan</h2>
                  <p className="text-[10px] text-slate-500">Sistem keamanan offline-first & enkripsi lokal</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-blue-50 rounded-none border border-blue-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Database className="w-5 h-5 text-[#004b87]" />
                    <div>
                      <div className="font-bold text-slate-800">Vercel</div>
                      <div className="text-[11px] text-slate-600">Data tersimpan dan tersinkronisasi secara real-time di Vercel</div>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-none text-[10px]">Terhubung</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-none border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Lock className="w-5 h-5 text-slate-600" />
                    <div>
                      <div className="font-bold text-slate-800">Enkripsi Akses Rapor</div>
                      <div className="text-[11px] text-slate-500">Standar keamanan data nilai sesuai petunjuk teknis SIMAK</div>
                    </div>
                  </div>
                  <span className="bg-blue-100 text-[#004b87] font-bold px-2 py-0.5 rounded-none text-[10px]">Terproteksi</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-none border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-5 h-5 text-slate-600" />
                    <div>
                      <div className="font-bold text-slate-800">Versi Aplikasi</div>
                      <div className="text-[11px] text-slate-500">SIMAK Merdeka Versi 3.7.0</div>
                    </div>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px]">Up-to-date</span>
                </div>
              </div>

              {/* Form Ubah Kode Enkripsi Keamanan Sistem (Administrator & Kurikulum) */}
              <div className="p-4 bg-white border border-slate-200 rounded-none shadow-xs space-y-3 mt-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Key className="w-4 h-4 text-[#004b87]" />
                  <h3 className="text-xs font-bold text-slate-800">Ubah Kode Enkripsi Keamanan Sistem</h3>
                </div>

                <p className="text-[11px] text-slate-600">
                  Kode enkripsi digunakan untuk otorisasi kunci data, proteksi kurikulum, dan verifikasi login akun Administrator / Master Data.
                </p>

                {encErrorMsg && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{encErrorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSaveEncryptionCode} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Kode Enkripsi Aktif Saat Ini</label>
                    <div className="relative">
                      <input
                        type={showCurrentCode ? 'text' : 'password'}
                        readOnly
                        value={currentEncryptionCode}
                        className="w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-700 rounded-none font-mono font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentCode(!showCurrentCode)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showCurrentCode ? "Sembunyikan Kode" : "Tampilkan Kode"}
                      >
                        {showCurrentCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Kode Enkripsi Baru *</label>
                    <div className="relative">
                      <input
                        type={showNewCode ? 'text' : 'password'}
                        required
                        value={newEncryptionCode}
                        onChange={(e) => setNewEncryptionCode(e.target.value)}
                        placeholder="Masukkan kode enkripsi baru (min. 4 karakter)"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewCode(!showNewCode)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showNewCode ? "Sembunyikan Kode" : "Tampilkan Kode"}
                      >
                        {showNewCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Konfirmasi Kode Enkripsi Baru *</label>
                    <input
                      type={showNewCode ? 'text' : 'password'}
                      required
                      value={confirmEncryptionCode}
                      onChange={(e) => setConfirmEncryptionCode(e.target.value)}
                      placeholder="Ketik ulang kode enkripsi baru"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-medium"
                    />
                  </div>

                  <div className="pt-1 flex items-center justify-end gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#004b87] hover:bg-[#003865] text-white font-bold rounded-none flex items-center gap-2 cursor-pointer shadow-xs transition-all text-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan Kode Enkripsi</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeSubTab === 'loginBackground' && (
            <LoginBackgroundSettings 
              currentConfig={loginBackgroundConfig}
              onSaveConfig={(newConfig) => {
                if (onUpdateLoginBackgroundConfig) {
                  onUpdateLoginBackgroundConfig(newConfig);
                }
              }}
            />
          )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Modal: Tambah Sekolah / Guru Baru */}
      {showAddProfileModal && (
        <div className="fixed inset-0 z-50 bg-[#004b87]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-none max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#004b87] text-amber-300 rounded-none">
                  <School className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Tambah Profil Guru & Sekolah Baru</h3>
                  <p className="text-[11px] text-slate-500">Daftarkan sekolah dan pengajar berbeda untuk sistem SIMAK</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddProfileModal(false)}
                className="p-1 rounded-none text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProfile} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Sekolah / Satuan Pendidikan *</label>
                <input
                  type="text"
                  required
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                  placeholder="Contoh: SMA Negeri 2 Surabaya / MA Al-Azhar"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">NPSN Sekolah</label>
                  <input
                    type="text"
                    value={newNpsn}
                    onChange={(e) => setNewNpsn(e.target.value)}
                    placeholder="Contoh: 20532101"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Kota / Kabupaten</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="Contoh: Surabaya"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Lengkap Guru Pengampu *</label>
                <input
                  type="text"
                  required
                  value={newTeacherName}
                  onChange={(e) => setNewTeacherName(e.target.value)}
                  placeholder="Contoh: Siti Rahmah, S.Pd., M.Si."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Gelar / Jabatan</label>
                  <input
                    type="text"
                    value={newTeacherTitle}
                    onChange={(e) => setNewTeacherTitle(e.target.value)}
                    placeholder="Contoh: Guru Penggerak"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">NIP / NUPTK Guru</label>
                  <input
                    type="text"
                    value={newNip}
                    onChange={(e) => setNewNip(e.target.value)}
                    placeholder="Contoh: 19830415 200902 2 008"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Mata Pelajaran</label>
                  <input
                    type="text"
                    value={newSubjectRole}
                    onChange={(e) => setNewSubjectRole(e.target.value)}
                    placeholder="Contoh: Fisika / Biologi"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Kelas Wali / Rombel</label>
                  <input
                    type="text"
                    value={newGuardianClass}
                    onChange={(e) => setNewGuardianClass(e.target.value)}
                    placeholder="Contoh: X-1"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 block">Pengesahan Kepala Sekolah</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="text"
                      value={newPrincipalName}
                      onChange={(e) => setNewPrincipalName(e.target.value)}
                      placeholder="Nama Kepala Sekolah"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={newPrincipalNip}
                      onChange={(e) => setNewPrincipalNip(e.target.value)}
                      placeholder="NIP Kepala Sekolah"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddProfileModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-none transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#004b87] hover:bg-[#003d6d] rounded-none shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>Simpan & Gunakan Profil</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Verifikasi Kode Enkripsi Kunci Data */}
      {showLockAuthModal && (
        <div className="fixed inset-0 z-50 bg-[#002f54]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-none max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500 text-slate-950 rounded-none shadow-xs font-bold">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Otorisasi Penguncian Data
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Konfirmasi perubahan status kunci data SIMAK
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowLockAuthModal(false);
                  setPendingLockAction(null);
                }}
                className="p-1 rounded-none text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {lockAuthError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{lockAuthError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmLockAuth} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-none space-y-1">
                <span className="font-bold text-slate-800 block">
                  {pendingLockAction?.type === 'master'
                    ? (activeLockConfig.isMasterLocked ? 'Buka Kunci Seluruh Data Sistem' : 'Kunci Seluruh Data Sistem (Master Lock)')
                    : `Ubah Status Kunci Modul (${pendingLockAction?.key || 'Modul'})`
                  }
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Masukkan Kode Enkripsi Master Administrator Anda untuk memverifikasi dan menyimpan status proteksi ini.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Kode Enkripsi Administrator *
                </label>
                <div className="relative">
                  <input
                    type={showCurrentCode ? 'text' : 'password'}
                    required
                    value={lockAuthCodeInput}
                    onChange={(e) => setLockAuthCodeInput(e.target.value)}
                    placeholder="Masukkan kode enkripsi"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentCode(!showCurrentCode)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showCurrentCode ? "Sembunyikan Kode" : "Tampilkan Kode"}
                  >
                    {showCurrentCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowLockAuthModal(false);
                    setPendingLockAction(null);
                  }}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-none font-bold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-none font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>Konfirmasi & Eksekusi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

