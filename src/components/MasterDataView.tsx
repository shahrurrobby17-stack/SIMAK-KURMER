import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  Search,
  Plus,
  Edit3,
  Trash2,
  KeyRound,
  RefreshCw,
  Building2,
  Download,
  Filter,
  LayoutGrid,
  List,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Clock,
  UserPlus,
  Eye,
  EyeOff,
  ShieldAlert,
  X,
  Save,
  Check,
  Megaphone,
  Radio,
  Calendar,
  ClipboardCheck,
  Trophy,
  FileSpreadsheet,
  BookOpen,
  FolderUp,
  ArrowRightLeft,
  ChevronRight,
  ChevronDown,
  Layers,
  GraduationCap,
  ArrowLeft,
  Database,
  ArrowUpRight,
  ExternalLink,
  Wallet,
  Package,
  Library,
  School,
  Settings,
  Laptop,
  Globe,
  Wifi
} from 'lucide-react';
import { UserAccount, TeacherProfile, RegisteredSchool, InfoAnnouncement, InfoAnnouncementItem, getAnnouncementItems } from '../types';
import { normalizeSchoolId, deleteSchoolFromFirebase } from '../lib/firebaseService';
import { SaveSuccessModal } from './SaveSuccessModal';
import { UserLoginLog, subscribeToUserLoginLogs, getLocalLoginLogs } from '../lib/userLoginLogService';
import { UserPresence, subscribeToUserPresence, getLocalPresenceMap } from '../lib/userPresenceService';
import { CurriculumSystemView } from './systems/CurriculumSystemView';
import { TeacherSystemView } from './systems/TeacherSystemView';
import { AdministrationSystemView } from './systems/AdministrationSystemView';
import { SarprasSystemView } from './systems/SarprasSystemView';
import { LibrarySystemView } from './systems/LibrarySystemView';
import { StudentSystemView } from './systems/StudentSystemView';
import { FinanceSystemView } from './systems/FinanceSystemView';
import { SchoolDetailSystemView } from './systems/SchoolDetailSystemView';
import { RegisteredSchoolsTableView } from './systems/RegisteredSchoolsTableView';

export type MasterDataCategory = 'Semua' | 'DetailSekolah' | 'DaftarSekolahTabel' | 'Penyimpanan' | 'Pengumuman' | 'Kurikulum' | 'Guru' | 'TU' | 'Sarpras' | 'Keuangan' | 'Perpustakaan' | 'Siswa';

interface MasterDataViewProps {
  registeredUsers: UserAccount[];
  onUpdateRegisteredUsers: (updatedUsers: UserAccount[]) => void;
  teacherProfiles?: TeacherProfile[];
  onUpdateTeacherProfiles?: (updatedProfiles: TeacherProfile[]) => void;
  onDeleteGtkUser?: (target: { uid?: string; email?: string; nip?: string; name?: string }) => boolean | void;
  currentUser?: UserAccount | null;
  teacher?: TeacherProfile;
  onUpdateTeacherProfile?: (newProfile: TeacherProfile) => boolean;
  registeredSchools?: RegisteredSchool[];
  onRegisterSchool?: (newSchool: Partial<RegisteredSchool> & { name: string }) => Promise<void> | void;
  onDeleteSchoolStorage?: (schoolId: string, schoolName?: string) => Promise<boolean> | void;
  activeSchoolName?: string;
  infoAnnouncement?: InfoAnnouncement;
  classList?: string[];
  onUpdateInfoAnnouncement?: (updated: InfoAnnouncement) => void;
  renderUserModule?: (user: UserAccount, tab: string) => React.ReactNode;
  onNavigateTab?: (tab: string) => void;
  activeCategory?: MasterDataCategory;
  onCategoryChange?: (category: MasterDataCategory) => void;
}

export const MasterDataView: React.FC<MasterDataViewProps> = ({
  registeredUsers = [],
  onUpdateRegisteredUsers,
  teacherProfiles = [],
  onUpdateTeacherProfiles,
  onDeleteGtkUser,
  currentUser,
  teacher,
  onUpdateTeacherProfile,
  registeredSchools = [],
  onRegisterSchool,
  onDeleteSchoolStorage,
  activeSchoolName,
  infoAnnouncement,
  classList,
  onUpdateInfoAnnouncement,
  renderUserModule,
  onNavigateTab,
  activeCategory,
  onCategoryChange
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [onlineFilter, setOnlineFilter] = useState<'Semua' | 'Online' | 'Offline'>('Semua');
  const [schoolFilter, setSchoolFilter] = useState<string>('Semua');
  const [roleFilter, setRoleFilter] = useState<string>('Semua');
  const [internalCategory, setInternalCategory] = useState<MasterDataCategory>('Semua');
  const selectedCategory: MasterDataCategory = activeCategory !== undefined ? activeCategory : internalCategory;

  // Realtime Presence & Login Logs to determine user session online/offline status
  const [presenceMap, setPresenceMap] = useState<Record<string, UserPresence>>(() => {
    return getLocalPresenceMap();
  });
  const [liveTicker, setLiveTicker] = useState<number>(Date.now());
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(true);

  const [loginLogs, setLoginLogs] = useState<UserLoginLog[]>(() => {
    try {
      return getLocalLoginLogs();
    } catch {
      return [];
    }
  });

  useEffect(() => {
    // 1. Subscribe to real-time presence tracking
    const unsubPresence = subscribeToUserPresence((map) => {
      setPresenceMap(map);
      setIsRealtimeConnected(true);
    });

    // 2. Subscribe to login logs
    const unsubLogs = subscribeToUserLoginLogs((logs) => {
      setLoginLogs(logs);
    });

    // 3. Live timer ticker every 1 second (1000ms) for real-time live clock ticking
    const tickerInterval = setInterval(() => {
      setLiveTicker(Date.now());
    }, 1000);

    return () => {
      unsubPresence();
      unsubLogs();
      clearInterval(tickerInterval);
    };
  }, []);

  const setSelectedCategory = (cat: MasterDataCategory) => {
    setInternalCategory(cat);
    onCategoryChange?.(cat);
  };
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserAccount | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [userToReset, setUserToReset] = useState<UserAccount | null>(null);
  const [newResetPassword, setNewResetPassword] = useState<string>('12345678');

  // Delete School Storage Modal State
  const [showDeleteSchoolStorageModal, setShowDeleteSchoolStorageModal] = useState<boolean>(false);
  const [selectedSchoolToDelete, setSelectedSchoolToDelete] = useState<string>('');
  const [isDeletingSchoolStorage, setIsDeletingSchoolStorage] = useState<boolean>(false);

  const handleExecuteDeleteSchoolStorage = async () => {
    const schoolObj = registeredSchools.find(s => 
      s.name.toLowerCase().trim() === selectedSchoolToDelete.toLowerCase().trim() ||
      s.id.toLowerCase() === selectedSchoolToDelete.toLowerCase()
    ) || {
      id: normalizeSchoolId(selectedSchoolToDelete || 'sekolah-default'),
      name: selectedSchoolToDelete || 'Sekolah Terpilih'
    };

    setIsDeletingSchoolStorage(true);
    try {
      if (onDeleteSchoolStorage) {
        await onDeleteSchoolStorage(schoolObj.id, schoolObj.name);
      } else {
        await deleteSchoolFromFirebase(schoolObj.id);
      }

      showToast(`Penyimpanan sekolah "${schoolObj.name}" berhasil dihapus dan dibersihkan dari sistem!`, 'success');
      setShowDeleteSchoolStorageModal(false);
    } catch (err: any) {
      console.error('Error deleting school storage:', err);
      showToast(`Terjadi kendala saat menghapus penyimpanan: ${err?.message || 'Gagal menghapus'}`, 'error');
    } finally {
      setIsDeletingSchoolStorage(false);
    }
  };

  // Module Data Inspector Modal State
  const [showModuleModal, setShowModuleModal] = useState<boolean>(false);
  const [selectedUserForModule, setSelectedUserForModule] = useState<UserAccount | null>(null);
  const [activeModuleTab, setActiveModuleTab] = useState<'jadwal' | 'sinkronisasi' | 'siswa' | 'presensi' | 'presensiEkstra' | 'kelolaNilai' | 'jurnal' | 'upload-modul' | 'modul' | 'uploadModul'>('jadwal');

  // Active school lookup for Penyimpanan card (synchronized with Detail Sekolah)
  const activeSchoolObj = registeredSchools.find(s => 
    s.name && s.name.toLowerCase().trim() === (teacher?.schoolName || activeSchoolName || '').toLowerCase().trim()
  ) || registeredSchools.find(s => s.npsn && teacher?.npsn && s.npsn.trim() === teacher.npsn.trim()) || registeredSchools[0];

  const matchedSchoolName = teacher?.schoolName || activeSchoolObj?.name || activeSchoolName || 'SMA Islam Diponegoro Wagir';
  const matchedNpsn = teacher?.npsn || activeSchoolObj?.npsn || '20517834';
  const matchedPrincipal = teacher?.principalName || activeSchoolObj?.principalName || 'H. Moh. Ridwan, S.Pd., M.Si.';

  // Form states for Add/Edit
  const [formName, setFormName] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formNip, setFormNip] = useState<string>('');
  const [formSchool, setFormSchool] = useState<string>('SD Negeri 1 SIMAK');
  const [formRole, setFormRole] = useState<string>('Guru Pengampu');
  const [formPassword, setFormPassword] = useState<string>('12345678');
  const [formStatus, setFormStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');
  const [showFormPassword, setShowFormPassword] = useState<boolean>(false);

  const handleOpenModuleModal = (
    user: UserAccount,
    tab: 'jadwal' | 'sinkronisasi' | 'siswa' | 'presensi' | 'presensiEkstra' | 'kelolaNilai' | 'jurnal' | 'upload-modul' | 'modul' | 'uploadModul' = 'jadwal'
  ) => {
    setSelectedUserForModule(user);
    setActiveModuleTab(tab);
    setShowModuleModal(true);
  };

  // Notification Toast & Save Success Animated Modal
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [saveSuccessModal, setSaveSuccessModal] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('Data Anda telah berhasil disimpan!');

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Helper to identify protected master accounts
  const isMasterAccount = (email: string = '', name: string = '') => {
    const e = email.toLowerCase();
    const n = name.toLowerCase();
    return e === 'shahrurrobby17@gmail.com' || n.includes('shahrur robby') || n.includes('shahrur');
  };

  // Helper to determine if an account is actively online or offline in REALTIME
  const getUserOnlineStatus = (u: UserAccount): { 
    isOnline: boolean; 
    label: string; 
    lastSeenText: string; 
    isRealtime: boolean;
    deviceInfo?: string;
  } => {
    const emailNorm = (u.email || '').toLowerCase().trim();

    // 1. Current user logged in is definitively online (active in this browser session)
    const isCurrent = Boolean(
      currentUser && (
        (u.uid && currentUser.uid && u.uid === currentUser.uid) ||
        (emailNorm && currentUser.email && emailNorm === currentUser.email.toLowerCase().trim())
      )
    );

    if (isCurrent) {
      return {
        isOnline: true,
        label: 'Sedang Online',
        lastSeenText: 'Aktif saat ini (Sesi Anda • Realtime)',
        isRealtime: true
      };
    }

    // 2. Realtime presence map evaluation from Firestore & BroadcastChannel
    const presence = presenceMap[emailNorm];
    if (presence) {
      const elapsed = liveTicker - (presence.lastSeenMillis || 0);
      const isPresenceActive = presence.isOnline && elapsed < 60000; // 60s threshold for active presence

      if (isPresenceActive) {
        let recency = 'Aktif sekarang (Realtime)';
        const elapsedSec = Math.floor(elapsed / 1000);
        if (elapsedSec < 5) {
          recency = 'Aktif barusan (Realtime)';
        } else if (elapsedSec < 60) {
          recency = `Aktif ${elapsedSec} dtk lalu (Realtime)`;
        }

        return {
          isOnline: true,
          label: 'Sedang Online',
          lastSeenText: recency,
          isRealtime: true,
          deviceInfo: `${presence.deviceType || 'Desktop'} • ${presence.browser || 'Browser'}`
        };
      } else {
        // If presence was logged but expired (user idle > 60s or closed tab)
        let offlineDesc = presence.lastSeenFormatted || 'Sesi berakhir';
        const elapsedMinutes = Math.floor(elapsed / 60000);
        if (elapsedMinutes < 60) {
          offlineDesc = `Offline sejak ${elapsedMinutes} mnt lalu`;
        } else {
          offlineDesc = `Terakhir aktif: ${presence.lastSeenFormatted}`;
        }

        return {
          isOnline: false,
          label: 'Offline',
          lastSeenText: offlineDesc,
          isRealtime: true,
          deviceInfo: `${presence.deviceType || 'Desktop'} • ${presence.browser || 'Browser'}`
        };
      }
    }

    // 3. Explicit isOnline flag on UserAccount if set
    if (u.isOnline !== undefined) {
      return {
        isOnline: Boolean(u.isOnline),
        label: u.isOnline ? 'Sedang Online' : 'Offline',
        lastSeenText: u.isOnline ? 'Sedang aktif di sistem' : 'Tidak aktif saat ini',
        isRealtime: false
      };
    }

    // 4. Fallback against recent login logs
    const userLogs = loginLogs.filter(l => 
      l.email && l.email.toLowerCase().trim() === emailNorm && l.status === 'Berhasil'
    );

    if (userLogs.length > 0) {
      const latest = [...userLogs].sort((a, b) => new Date(b.loginTime).getTime() - new Date(a.loginTime).getTime())[0];
      const logTime = new Date(latest.loginTime).getTime();
      const diffMinutes = Math.floor((liveTicker - logTime) / 60000);

      // If logged in within the last 30 minutes, consider online
      if (diffMinutes >= 0 && diffMinutes <= 30) {
        return {
          isOnline: true,
          label: 'Sedang Online',
          lastSeenText: diffMinutes < 1 ? 'Aktif baru saja' : `Aktif ${diffMinutes} mnt lalu`,
          isRealtime: false
        };
      }

      return {
        isOnline: false,
        label: 'Offline',
        lastSeenText: latest.loginTimeFormatted ? `Terakhir login: ${latest.loginTimeFormatted}` : 'Sesi berakhir',
        isRealtime: false
      };
    }

    return {
      isOnline: false,
      label: 'Offline',
      lastSeenText: 'Belum ada riwayat aktivitas sesi',
      isRealtime: false
    };
  };

  // Helper to categorize user into Kurikulum, Guru, TU, Sarpras, Perpustakaan, Siswa
  const getUserCategory = (u: UserAccount): 'Kurikulum' | 'Guru' | 'TU' | 'Sarpras' | 'Perpustakaan' | 'Siswa' => {
    const r = (u.role || '').toLowerCase();
    if (r.includes('kurikulum')) return 'Kurikulum';
    if (r.includes('perpustakaan') || r.includes('pustaka') || r.includes('pustakawan')) return 'Perpustakaan';
    if (r.includes('sarpras') || r.includes('sarana') || r.includes('prasarana')) return 'Sarpras';
    if (r.includes('tu') || r.includes('tata usaha') || r.includes('administrasi') || r.includes('operator') || r.includes('staf') || r.includes('staff')) return 'TU';
    if (r.includes('siswa') || r.includes('murid') || r.includes('peserta didik')) return 'Siswa';
    return 'Guru';
  };

  // Get list of unique schools for filtering
  const schoolOptions = Array.from(new Set(registeredUsers.map(u => u.schoolName || 'SD Negeri 1 SIMAK'))).filter(Boolean);

  // Filter users based on search, selected category, and selected filters
  const filteredUsers = registeredUsers.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.nip && u.nip.includes(searchTerm)) ||
      (u.phone && u.phone.includes(searchTerm)) ||
      (u.schoolName && u.schoolName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.role && u.role.toLowerCase().includes(searchTerm.toLowerCase()));

    const isPending = u.status === 'Menunggu Aktivasi';
    const isNonaktif = u.isMaintenance || u.status === 'Nonaktif';
    const matchesStatus =
      statusFilter === 'Semua' ||
      (statusFilter === 'Menunggu Aktivasi' && isPending) ||
      (statusFilter === 'Aktif' && !isNonaktif && !isPending) ||
      (statusFilter === 'Nonaktif' && isNonaktif);

    const userOnline = getUserOnlineStatus(u);
    const matchesOnline =
      onlineFilter === 'Semua' ||
      (onlineFilter === 'Online' && userOnline.isOnline) ||
      (onlineFilter === 'Offline' && !userOnline.isOnline);

    const matchesSchool = schoolFilter === 'Semua' || (u.schoolName || 'SD Negeri 1 SIMAK') === schoolFilter;
    const matchesRole = roleFilter === 'Semua' || (u.role || 'Guru Pengampu') === roleFilter;
    const userCategory = getUserCategory(u);
    const matchesCategory = selectedCategory === 'Semua' || (userCategory as string) === (selectedCategory as string);

    return matchesSearch && matchesStatus && matchesOnline && matchesSchool && matchesRole && matchesCategory;
  });

  // Calculate statistics
  const totalCount = registeredUsers.length;
  const onlineCount = registeredUsers.filter(u => getUserOnlineStatus(u).isOnline).length;
  const offlineCount = Math.max(0, registeredUsers.length - onlineCount);
  const pendingCount = registeredUsers.filter(u => u.status === 'Menunggu Aktivasi').length;
  const activeCount = registeredUsers.filter(u => !u.isMaintenance && u.status !== 'Nonaktif' && u.status !== 'Menunggu Aktivasi').length;
  const nonActiveCount = registeredUsers.filter(u => u.isMaintenance || u.status === 'Nonaktif').length;
  const masterAccountsCount = registeredUsers.filter(u => isMasterAccount(u.email, u.name)).length;
  const totalSchoolsCount = new Set(registeredUsers.map(u => u.schoolName || 'SD Negeri 1 SIMAK')).size;

  // Category statistics for Kurikulum, Guru, TU, Sarpras, Perpustakaan, Siswa
  const kurikulumCount = registeredUsers.filter(u => getUserCategory(u) === 'Kurikulum').length;
  const guruCount = registeredUsers.filter(u => getUserCategory(u) === 'Guru').length;
  const tuCount = registeredUsers.filter(u => getUserCategory(u) === 'TU').length;
  const sarprasCount = registeredUsers.filter(u => getUserCategory(u) === 'Sarpras').length;
  const perpustakaanCount = registeredUsers.filter(u => getUserCategory(u) === 'Perpustakaan').length;
  const siswaCount = registeredUsers.filter(u => getUserCategory(u) === 'Siswa').length;

  // Handle header category navigation / filtering
  const handleCategoryDropdownChange = (value: string) => {
    setSelectedCategory(value as MasterDataCategory);
  };

  // Helper for quick navigation to dedicated system pages
  const handleQuickNavigate = (
    tab: 'system-kurikulum' | 'system-guru' | 'system-tu' | 'system-sarpras' | 'system-keuangan' | 'system-kesiswaan' | 'system-perpustakaan',
    cat: MasterDataCategory
  ) => {
    if (onNavigateTab) {
      onNavigateTab(tab);
    } else if (onCategoryChange) {
      onCategoryChange(cat);
    } else {
      setSelectedCategory(cat);
    }
  };

  // Toggle user active status / Admin Activation
  const handleToggleUserStatus = (targetUser: UserAccount) => {
    if (isMasterAccount(targetUser.email, targetUser.name)) {
      showToast(`Akun milik ${targetUser.name} adalah Akun Utama / Master Data dan selalu aktif.`, 'info');
      return;
    }

    const isPending = targetUser.status === 'Menunggu Aktivasi';
    const currentIsDisabled = targetUser.isMaintenance || targetUser.status === 'Nonaktif';
    const newIsDisabled = isPending ? false : !currentIsDisabled;
    const newStatus: 'Aktif' | 'Nonaktif' = isPending ? 'Aktif' : (newIsDisabled ? 'Nonaktif' : 'Aktif');

    const updatedUsers = registeredUsers.map(u => {
      if (u.uid === targetUser.uid || (u.email && targetUser.email && u.email.toLowerCase() === targetUser.email.toLowerCase())) {
        return {
          ...u,
          isMaintenance: newIsDisabled,
          status: newStatus
        };
      }
      return u;
    });

    onUpdateRegisteredUsers(updatedUsers);
    if (isPending) {
      setSaveSuccessMsg(`Akun pendaftar baru "${targetUser.name}" berhasil DIVERIFIKASI & DIAKTIFKAN oleh Administrator! Pengguna sekarang dapat masuk ke portal SIMAK.`);
    } else {
      setSaveSuccessMsg(`Status akun "${targetUser.name}" berhasil diubah menjadi ${newStatus}.`);
    }
    setSaveSuccessModal(true);
  };

  // Open Add Modal
  const handleOpenAddModal = (defaultRole?: string) => {
    setFormName('');
    setFormEmail('');
    setFormNip('');
    setFormSchool('SD Negeri 1 SIMAK');
    const initialRole = defaultRole || (
      selectedCategory === 'Kurikulum' ? 'Kurikulum' :
      selectedCategory === 'TU' ? 'Tata Usaha (TU)' :
      selectedCategory === 'Siswa' ? 'Siswa' : 'Guru Pengampu'
    );
    setFormRole(initialRole);
    setFormPassword('12345678');
    setFormStatus('Aktif');
    setShowAddModal(true);
  };

  // Save new user
  const handleSaveNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      showToast('Nama Lengkap dan Email wajib diisi!', 'error');
      return;
    }

    const exists = registeredUsers.some(u => u.email.toLowerCase() === formEmail.trim().toLowerCase());
    if (exists) {
      showToast('Email sudah terdaftar dalam Master Data!', 'error');
      return;
    }

    const newUser: UserAccount = {
      uid: `USER-${Date.now()}`,
      name: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      nip: formNip.trim() || '-',
      schoolName: formSchool,
      role: formRole,
      password: formPassword.trim() || '12345678',
      status: formStatus,
      isMaintenance: formStatus === 'Nonaktif'
    };

    const updatedUsers = [newUser, ...registeredUsers];
    onUpdateRegisteredUsers(updatedUsers);
    setShowAddModal(false);
    setSaveSuccessMsg(`Akun baru "${newUser.name}" berhasil ditambahkan ke Master Data!`);
    setSaveSuccessModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (user: UserAccount) => {
    setSelectedUserForEdit(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormNip(user.nip || '');
    setFormSchool(user.schoolName || 'SD Negeri 1 SIMAK');
    setFormRole(user.role || 'Guru Pengampu');
    setFormPassword(user.password || '12345678');
    setFormStatus(user.isMaintenance || user.status === 'Nonaktif' ? 'Nonaktif' : 'Aktif');
    setShowEditModal(true);
  };

  // Save Edit User
  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;

    if (!formName.trim() || !formEmail.trim()) {
      showToast('Nama Lengkap dan Email wajib diisi!', 'error');
      return;
    }

    const updatedUsers = registeredUsers.map(u => {
      if (u.uid === selectedUserForEdit.uid || u.email.toLowerCase() === selectedUserForEdit.email.toLowerCase()) {
        return {
          ...u,
          name: formName.trim(),
          email: formEmail.trim().toLowerCase(),
          nip: formNip.trim() || '-',
          schoolName: formSchool,
          role: formRole,
          password: formPassword.trim() || u.password || '12345678',
          status: formStatus,
          isMaintenance: formStatus === 'Nonaktif'
        };
      }
      return u;
    });

    onUpdateRegisteredUsers(updatedUsers);
    setShowEditModal(false);
    setSelectedUserForEdit(null);
    setSaveSuccessMsg(`Data akun "${formName}" berhasil diperbarui dan tersinkronisasi.`);
    setSaveSuccessModal(true);
  };

  // Open Reset Password Modal
  const handleOpenResetModal = (user: UserAccount) => {
    setUserToReset(user);
    setNewResetPassword('12345678');
    setShowResetModal(true);
  };

  // Save Reset Password
  const handleConfirmResetPassword = () => {
    if (!userToReset) return;
    if (!newResetPassword.trim()) {
      showToast('Kata sandi baru tidak boleh kosong!', 'error');
      return;
    }

    const updatedUsers = registeredUsers.map(u => {
      if (u.uid === userToReset.uid || u.email.toLowerCase() === userToReset.email.toLowerCase()) {
        return {
          ...u,
          password: newResetPassword.trim()
        };
      }
      return u;
    });

    onUpdateRegisteredUsers(updatedUsers);
    setShowResetModal(false);
    setUserToReset(null);
    setSaveSuccessMsg(`Kata sandi akun "${userToReset.name}" berhasil direset.`);
    setSaveSuccessModal(true);
  };

  // Open Delete Modal
  const handleOpenDeleteModal = (user: UserAccount) => {
    if (isMasterAccount(user.email, user.name)) {
      showToast(`Akun milik ${user.name} adalah Akun Master Data Utama dan tidak dapat dihapus.`, 'info');
      return;
    }
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  // Confirm Delete User
  const handleConfirmDeleteUser = () => {
    if (!userToDelete) return;

    const targetUid = userToDelete.uid;
    const targetEmail = (userToDelete.email || '').trim().toLowerCase();
    const targetName = (userToDelete.name || '').trim().toLowerCase();

    const updatedUsers = registeredUsers.filter(u => {
      if (targetUid && u.uid && u.uid === targetUid) return false;
      if (targetEmail && u.email && u.email.trim().toLowerCase() === targetEmail) return false;
      if (targetName && u.name && u.name.trim().toLowerCase() === targetName && u.nip && u.nip === userToDelete.nip) return false;
      return true;
    });

    onUpdateRegisteredUsers(updatedUsers);

    if (onDeleteGtkUser) {
      onDeleteGtkUser({ uid: targetUid, email: targetEmail, nip: userToDelete.nip, name: targetName });
    }

    if (onUpdateTeacherProfiles && teacherProfiles) {
      const filteredProfs = teacherProfiles.filter(p => {
        if (targetUid && p.id === targetUid) return false;
        if (targetEmail && p.email && p.email.trim().toLowerCase() === targetEmail) return false;
        if (targetName && p.name && p.name.trim().toLowerCase() === targetName) return false;
        return true;
      });
      onUpdateTeacherProfiles(filteredProfs);
    }

    // Also record into simak_deleted_gtk_keys and filter simak_teacher_profiles
    try {
      const savedGtkKeys = localStorage.getItem('simak_deleted_gtk_keys');
      const keysSet = savedGtkKeys ? new Set(JSON.parse(savedGtkKeys)) : new Set();
      if (targetUid) keysSet.add(targetUid);
      if (targetEmail) keysSet.add(targetEmail);
      if (userToDelete.nip && userToDelete.nip !== '-') keysSet.add(userToDelete.nip.replace(/\s+/g, ''));
      if (targetName) keysSet.add(targetName);
      localStorage.setItem('simak_deleted_gtk_keys', JSON.stringify(Array.from(keysSet)));
    } catch (e) {}

    try {
      const savedProfs = localStorage.getItem('simak_teacher_profiles');
      if (savedProfs) {
        const parsedProfs: TeacherProfile[] = JSON.parse(savedProfs);
        const filteredProfs = parsedProfs.filter(p => {
          if (targetUid && p.id === targetUid) return false;
          if (targetEmail && p.email && p.email.trim().toLowerCase() === targetEmail) return false;
          if (targetName && p.name && p.name.trim().toLowerCase() === targetName) return false;
          return true;
        });
        localStorage.setItem('simak_teacher_profiles', JSON.stringify(filteredProfs));
      }
    } catch (e) {}

    setShowDeleteModal(false);
    setUserToDelete(null);
    setSaveSuccessMsg(`Akun "${userToDelete.name}" telah berhasil dihapus dari Master Data.`);
    setSaveSuccessModal(true);
  };

  // Export Data to CSV
  const handleExportData = () => {
    if (registeredUsers.length === 0) {
      showToast('Tidak ada data akun untuk diekspor!', 'error');
      return;
    }

    const headers = ['No', 'Nama Lengkap', 'Email', 'NIP/NUPTK', 'Unit Sekolah', 'Peran', 'Status Akun'];
    const rows = registeredUsers.map((u, idx) => [
      idx + 1,
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.email}"`,
      `"${u.nip || '-'}"`,
      `"${(u.schoolName || 'SD Negeri 1 SIMAK').replace(/"/g, '""')}"`,
      `"${(u.role || 'Guru Pengampu').replace(/"/g, '""')}"`,
      `"${u.isMaintenance || u.status === 'Nonaktif' ? 'Nonaktif' : 'Aktif'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Master_Data_Akun_Terdaftar_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSaveSuccessMsg('Data akun terdaftar berhasil diekspor ke file CSV.');
    setSaveSuccessModal(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification dengan ikon centang berputar hijau simpan data */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-white border border-emerald-200 shadow-2xl rounded-none p-3.5 sm:p-4 flex items-center gap-3.5 animate-in fade-in zoom-in-90 slide-in-from-top-6 duration-300">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow-md text-white ${
            toastMessage.type === 'success' ? 'bg-emerald-500 ring-4 ring-emerald-100' :
            toastMessage.type === 'error' ? 'bg-rose-500 ring-4 ring-rose-100' : 'bg-cyan-600 ring-4 ring-cyan-100'
          }`}>
            {toastMessage.type === 'success' ? (
              <Check className="w-6 h-6 stroke-[3] animate-[spin_0.7s_ease-out_1] transition-transform" />
            ) : toastMessage.type === 'error' ? (
              <AlertCircle className="w-6 h-6" />
            ) : (
              <Sparkles className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span>{toastMessage.type === 'success' ? 'Data Berhasil Disimpan!' : 'Pemberitahuan Sistem'}</span>
              {toastMessage.type === 'success' && <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
            </div>
            <p className="text-[11px] text-slate-600 font-semibold">{toastMessage.text}</p>
          </div>
        </div>
      )}



      {/* CONDITIONAL RENDERING OF DEDICATED SYSTEMS */}
      {selectedCategory === 'DaftarSekolahTabel' ? (
        <RegisteredSchoolsTableView
          registeredSchools={registeredSchools}
          activeSchoolName={activeSchoolName || 'SMA Diponegoro Wagir'}
          onSelectSchoolStorage={(sch) => {
            if (onRegisterSchool) onRegisterSchool(sch);
            setSelectedCategory('DetailSekolah');
          }}
          onRegisterSchool={onRegisterSchool}
          onDeleteSchoolStorage={onDeleteSchoolStorage}
          onNavigateToDetail={(schName) => {
            if (onUpdateTeacherProfile && teacher) {
              onUpdateTeacherProfile({ ...teacher, schoolName: schName });
            }
            setSelectedCategory('DetailSekolah');
          }}
          currentUser={currentUser}
          teacher={teacher}
        />
      ) : selectedCategory === 'DetailSekolah' ? (
        <SchoolDetailSystemView
          teacher={teacher}
          currentUser={currentUser}
          registeredUsers={registeredUsers}
          onUpdateTeacherProfile={onUpdateTeacherProfile}
          registeredSchools={registeredSchools}
          onRegisterSchool={onRegisterSchool}
          onDeleteSchoolStorage={onDeleteSchoolStorage}
          activeSchoolName={activeSchoolName}
          onNavigateTab={onNavigateTab}
          onSelectCategory={setSelectedCategory}
        />
      ) : selectedCategory === 'Penyimpanan' ? (
        <div className="space-y-6 animate-fadeIn pb-12">
          {/* Header Banner */}
          <div className="bg-white border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-[#164e63] text-white shrink-0">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                    Penyimpanan Satuan Pendidikan
                  </h1>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-100 text-cyan-900 border border-cyan-200">
                    Multi-Tenant Cloud
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Partisi database dan penyimpanan cloud masing-masing sekolah
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab?.('settings')}
              className="px-4 py-2 bg-[#164e63] hover:bg-cyan-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Buka Menu Pengaturan</span>
            </button>
          </div>

          {/* Partisi Aktif Card */}
          <div className="bg-white border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <School className="w-4 h-4 text-[#164e63]" />
                <span>Penyimpanan Sekolah Aktif</span>
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Tersambung
              </span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-sm font-black text-slate-800">
                  {matchedSchoolName}
                </h4>
                <span className="font-mono text-xs text-cyan-800 bg-cyan-50 px-2 py-0.5 border border-cyan-200">
                  Path: /schools/{normalizeSchoolId(matchedSchoolName)}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                NPSN: <span className="font-bold text-slate-700">{matchedNpsn}</span> • Kepala Sekolah: <span className="font-bold text-slate-700">{matchedPrincipal}</span>
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
              <p className="text-xs text-slate-500">
                Pengelolaan dan penghapusan partisi penyimpanan sekolah telah dipindahkan ke <strong>Menu Pengaturan &gt; Penyimpanan</strong>.
              </p>
              <button
                type="button"
                onClick={() => onNavigateTab?.('settings')}
                className="px-4 py-2 border border-[#164e63] text-[#164e63] hover:bg-cyan-50 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Ke Menu Pengaturan Penyimpanan</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : selectedCategory === 'Pengumuman' ? (
        <div className="space-y-6 animate-fadeIn pb-12">
          <div className="bg-white border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-amber-500 text-white shrink-0">
                <Megaphone className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                  Pengumuman Sistem (Running Text)
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Teks pengumuman portal login dan halaman depan SIMAK
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab?.('settings')}
              className="px-4 py-2 bg-[#164e63] hover:bg-cyan-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Kelola di Menu Pengaturan</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Pengumuman Aktif:</span>
              <p className="text-xs text-slate-800 font-bold">
                {infoAnnouncement?.text || 'Selamat Datang di SIMAK MERDEKA - Sistem Informasi Manajemen Akademik & Kehadiran.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab?.('settings')}
              className="px-4 py-2 bg-[#164e63] hover:bg-cyan-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Buka Editor Pengumuman di Menu Pengaturan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : selectedCategory === 'Kurikulum' ? (
        <CurriculumSystemView
          registeredUsers={registeredUsers}
          teacher={teacher}
          onNavigateTab={onNavigateTab}
          onOpenAddUserModal={(role) => handleOpenAddModal(role)}
          onOpenEditUserModal={handleOpenEditModal}
          onOpenDeleteUserModal={handleOpenDeleteModal}
          onOpenModuleModal={handleOpenModuleModal}
          onSelectCategory={setSelectedCategory}
        />
      ) : selectedCategory === 'Guru' ? (
        <TeacherSystemView
          registeredUsers={registeredUsers}
          teacher={teacher}
          currentUser={currentUser}
          teacherProfiles={teacherProfiles}
          registeredSchools={registeredSchools}
          activeSchoolName={activeSchoolName}
          onUpdateRegisteredUsers={onUpdateRegisteredUsers}
          onUpdateTeacherProfiles={onUpdateTeacherProfiles}
          onDeleteGtkUser={onDeleteGtkUser}
          onNavigateTab={onNavigateTab}
          onOpenAddUserModal={(role) => handleOpenAddModal(role)}
          onOpenEditUserModal={handleOpenEditModal}
          onOpenDeleteUserModal={handleOpenDeleteModal}
          onOpenModuleModal={handleOpenModuleModal}
          onSelectCategory={setSelectedCategory}
        />
      ) : selectedCategory === 'TU' ? (
        <AdministrationSystemView
          registeredUsers={registeredUsers}
          teacher={teacher}
          onNavigateTab={onNavigateTab}
          onOpenAddUserModal={(role) => handleOpenAddModal(role)}
          onOpenEditUserModal={handleOpenEditModal}
          onOpenDeleteUserModal={handleOpenDeleteModal}
          onOpenModuleModal={handleOpenModuleModal}
          onSelectCategory={setSelectedCategory}
        />
      ) : selectedCategory === 'Sarpras' ? (
        <SarprasSystemView
          registeredUsers={registeredUsers}
          teacher={teacher}
          currentUser={currentUser}
          onNavigateTab={onNavigateTab}
        />
      ) : selectedCategory === 'Perpustakaan' ? (
        <LibrarySystemView
          registeredUsers={registeredUsers}
          teacher={teacher}
          onNavigateTab={onNavigateTab}
        />
      ) : selectedCategory === 'Keuangan' ? (
        <FinanceSystemView
          registeredUsers={registeredUsers}
          teacher={teacher}
          onNavigateTab={onNavigateTab}
        />
      ) : selectedCategory === 'Siswa' ? (
        <StudentSystemView
          registeredUsers={registeredUsers}
          teacher={teacher}
          classList={classList}
          onNavigateTab={onNavigateTab}
          onOpenAddUserModal={(role) => handleOpenAddModal(role)}
          onOpenEditUserModal={handleOpenEditModal}
          onOpenDeleteUserModal={handleOpenDeleteModal}
          onOpenModuleModal={handleOpenModuleModal}
          onSelectCategory={setSelectedCategory}
        />
      ) : (
        <>
          {/* Status Sesi Online/Offline Realtime Header Bar */}
          <div className="bg-white border border-emerald-200/90 p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 relative">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xs sm:text-sm font-black text-slate-800 tracking-wide uppercase">
                    Monitoring Sesi Pengguna Realtime
                  </h3>
                  <span className="px-2 py-0.5 text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-none uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse inline-block" />
                    <span>Realtime Cloud Sync</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Status online/offline diperbarui secara realtime ({onlineCount} akun sedang aktif saat ini).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0 flex-wrap">
              <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-none shadow-2xs">
                <Clock className="w-4 h-4 text-[#164e63] shrink-0" />
                <div className="text-left sm:text-right">
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <span>Waktu Server</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  </div>
                  <div className="text-xs font-mono font-black text-slate-800 tracking-tight">
                    {new Date(liveTicker).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })} WIB
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLiveTicker(Date.now());
                  showToast('Sinkronisasi sesi realtime berhasil diperbarui.', 'success');
                }}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer active:scale-95"
                title="Segarkan data sesi realtime sekarang"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Segarkan Sesi</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenAddModal()}
                className="px-3 py-2 bg-[#164e63] hover:bg-cyan-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Tambah Akun</span>
              </button>
            </div>
          </div>

          {/* KPI Metrics Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div className="bg-white p-4 rounded-none border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="p-3 bg-cyan-50 text-[#164e63] rounded-none shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Akun</div>
                <div className="text-xl font-black text-slate-800">{totalCount} <span className="text-xs font-semibold text-slate-500">Pengguna</span></div>
              </div>
            </div>

            {/* KPI: Sedang Online */}
            <div className="bg-white p-4 rounded-none border border-emerald-200/80 shadow-xs flex items-center gap-3.5 ring-1 ring-emerald-500/10">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-none shrink-0 relative">
                <span className="relative flex h-2 w-2 absolute top-1 right-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <UserCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Sedang Online</span>
                </div>
                <div className="text-xl font-black text-emerald-700">
                  {onlineCount} <span className="text-xs font-semibold text-emerald-600">Aktif</span>
                </div>
              </div>
            </div>

            {/* KPI: Akun Offline */}
            <div className="bg-white p-4 rounded-none border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="p-3 bg-slate-100 text-slate-500 rounded-none shrink-0">
                <UserX className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Akun Offline</div>
                <div className="text-xl font-black text-slate-700">{offlineCount} <span className="text-xs font-semibold text-slate-500">Pengguna</span></div>
              </div>
            </div>

            {/* KPI: Status Akun Aktif / Antrean */}
            <div className="bg-white p-4 rounded-none border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className={`p-3 rounded-none shrink-0 ${pendingCount > 0 ? 'bg-amber-100 text-amber-900 ring-2 ring-amber-400' : 'bg-cyan-50 text-[#164e63]'}`}>
                {pendingCount > 0 ? <Clock className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {pendingCount > 0 ? 'Antrean Aktivasi' : 'Akun Terverifikasi'}
                </div>
                <div className={`text-xl font-black ${pendingCount > 0 ? 'text-amber-900' : 'text-[#164e63]'}`}>
                  {pendingCount > 0 ? pendingCount : activeCount}{' '}
                  <span className={`text-xs font-semibold ${pendingCount > 0 ? 'text-amber-800' : 'text-cyan-700'}`}>
                    {pendingCount > 0 ? 'Menunggu' : 'Aktif'}
                  </span>
                </div>
              </div>
            </div>

            {/* KPI: Unit Sekolah */}
            <div className="bg-white p-4 rounded-none border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-none shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Unit Sekolah</div>
                <div className="text-xl font-black text-indigo-700">{totalSchoolsCount} <span className="text-xs font-semibold text-indigo-600">Lembaga</span></div>
              </div>
            </div>
          </div>

          {/* Alert Banner: Antrean Aktivasi Akun oleh Administrator */}
          {pendingCount > 0 && (
            <div className="bg-amber-50/90 border-2 border-amber-300 p-4 rounded-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-xs sm:text-sm text-amber-950">
                      Terdapat {pendingCount} Pendaftar Baru Menunggu Verifikasi & Aktivasi Akun
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black uppercase">
                      Penting
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-900/80 mt-0.5">
                    Aktivasi akun pengguna baru dilakukan di Halaman Administrator ini untuk menjaga integritas data pendidik & tenaga kependidikan.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStatusFilter('Menunggu Aktivasi');
                  setSelectedCategory('Semua');
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-none flex items-center gap-2 cursor-pointer shadow-xs shrink-0 active:scale-95 transition-all"
              >
                <UserCheck className="w-4 h-4" />
                <span>Lihat Antrean Aktivasi ({pendingCount})</span>
              </button>
            </div>
          )}

          {/* Filter and Control Toolbar */}
      <div className="bg-white p-4 rounded-none border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Field */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari berdasarkan nama, email, NIP, no hp, atau sekolah..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Controls: Filter Selects + View Mode */}
          <div className="flex flex-wrap items-center gap-2 pb-1 md:pb-0">
            {/* Online / Offline Filter */}
            <select
              value={onlineFilter}
              onChange={(e) => setOnlineFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-none text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-600 cursor-pointer"
              title="Filter Status Sesi Online/Offline"
            >
              <option value="Semua">Semua Sesi ({totalCount})</option>
              <option value="Online">● Sedang Online ({onlineCount})</option>
              <option value="Offline">○ Offline ({offlineCount})</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-none text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-600 cursor-pointer"
            >
              <option value="Semua">Semua Status</option>
              <option value="Menunggu Aktivasi">Status: Menunggu Aktivasi ({pendingCount})</option>
              <option value="Aktif">Status: Aktif</option>
              <option value="Nonaktif">Status: BELUM AKTIF / Nonaktif</option>
            </select>

            {/* School Filter */}
            <select
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-none text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-600 cursor-pointer max-w-[160px] truncate"
            >
              <option value="Semua">Semua Sekolah</option>
              {schoolOptions.map((sch) => (
                <option key={sch} value={sch}>{sch}</option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-none border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-none text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-[#164e63] shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Tampilan Tabel"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-none text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-[#164e63] shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Tampilan Kartu Grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1 border-t border-slate-100">
          <div>
            Menampilkan <span className="font-bold text-slate-800">{filteredUsers.length}</span> dari <span className="font-bold text-slate-800">{registeredUsers.length}</span> akun terdaftar (<span className="text-emerald-700 font-bold">{onlineCount} online</span>, <span className="text-slate-600 font-bold">{offlineCount} offline</span>).
          </div>
          {(searchTerm || statusFilter !== 'Semua' || onlineFilter !== 'Semua' || schoolFilter !== 'Semua' || roleFilter !== 'Semua' || selectedCategory !== 'Semua') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('Semua');
                setOnlineFilter('Semua');
                setSchoolFilter('Semua');
                setRoleFilter('Semua');
                setSelectedCategory('Semua');
              }}
              className="text-[#164e63] font-bold hover:underline cursor-pointer"
            >
              Reset Semua Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Monitoring Content */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-none border border-slate-200/80 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-cyan-50 text-[#164e63] rounded-none flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Tidak Ada Akun Ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Tidak ditemukan akun yang sesuai dengan pencarian atau filter yang ditentukan. Cobalah menggunakan kata kunci lain.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('Semua');
              setOnlineFilter('Semua');
              setSchoolFilter('Semua');
            }}
            className="px-4 py-2 bg-[#164e63] text-white text-xs font-bold rounded-none hover:bg-cyan-800 transition-colors cursor-pointer"
          >
            Tampilkan Semua Akun
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-none border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4">Pengguna & Email</th>
                  <th className="py-3.5 px-4 text-center">Status Sesi</th>
                  <th className="py-3.5 px-4">NIP / Identitas</th>
                  <th className="py-3.5 px-4">Unit Sekolah</th>
                  <th className="py-3.5 px-4">Peran / Hak Akses</th>
                  <th className="py-3.5 px-4 text-center">Status Akun</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.map((user, idx) => {
                  const isMaster = isMasterAccount(user.email, user.name);
                  const isUserDisabled = user.isMaintenance || user.status === 'Nonaktif';
                  const userOnline = getUserOnlineStatus(user);

                  return (
                    <tr key={user.uid || idx} className="hover:bg-cyan-50/40 transition-colors">
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                        {idx + 1}
                      </td>

                      {/* Name & Email & Badge with Online indicator */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs text-white shadow-xs ${
                              isMaster ? 'bg-gradient-to-br from-amber-500 to-amber-700' :
                              isUserDisabled ? 'bg-slate-400' : 'bg-[#164e63]'
                            }`}>
                              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span 
                              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                                userOnline.isOnline ? 'bg-emerald-500 ring-1 ring-emerald-300' : 'bg-slate-300'
                              }`}
                              title={userOnline.isOnline ? 'Sedang Online' : 'Offline'}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-800 flex items-center gap-1.5 truncate">
                              <span>{user.name}</span>
                              {isMaster && (
                                <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 border border-amber-300 rounded text-[9px] font-black shrink-0">
                                  Master Data
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate font-mono">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status Sesi (Online / Offline) Realtime */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {userOnline.isOnline ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wider bg-emerald-500/10 text-emerald-800 border border-emerald-300/90 shadow-xs">
                              <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                              </span>
                              <span>ONLINE</span>
                            </span>
                            <span className="text-[10px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                              <span>{userOnline.lastSeenText}</span>
                            </span>
                            {userOnline.deviceInfo && (
                              <span className="text-[9px] text-slate-500 font-medium bg-slate-100/90 border border-slate-200/80 px-2 py-0.5 rounded-md mt-1 inline-flex items-center gap-1 font-mono">
                                <Laptop className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                <span>{userOnline.deviceInfo}</span>
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider bg-slate-100 text-slate-600 border border-slate-200 shadow-2xs">
                              <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0"></span>
                              <span>OFFLINE</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium mt-1 max-w-[150px] truncate" title={userOnline.lastSeenText}>
                              {userOnline.lastSeenText}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* NIP */}
                      <td className="py-3.5 px-4 font-mono text-slate-600 font-medium">
                        {user.nip || '-'}
                      </td>

                      {/* School */}
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{user.schoolName || 'SD Negeri 1 SIMAK'}</span>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-none text-[10px] font-bold border ${
                          isMaster ? 'bg-amber-50 text-amber-900 border-amber-200' :
                          user.role?.toLowerCase().includes('admin') ? 'bg-cyan-50 text-[#164e63] border-cyan-200' :
                          'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {user.role || 'Guru Pengampu'}
                        </span>
                      </td>

                      {/* Status Akun */}
                      <td className="py-3.5 px-4 text-center">
                        {user.status === 'Menunggu Aktivasi' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs">
                            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>MENUNGGU AKTIVASI</span>
                          </span>
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isUserDisabled
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isUserDisabled ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                            {isUserDisabled ? 'BELUM AKTIF' : 'Aktif'}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Toggle status button / Direct Activation */}
                          {user.status === 'Menunggu Aktivasi' ? (
                            <button
                              type="button"
                              onClick={() => handleToggleUserStatus(user)}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-none text-xs font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer active:scale-95"
                              title="Setujui & Aktifkan Akun Pengguna Baru"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Aktifkan Akun</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleUserStatus(user)}
                              className={`p-1.5 rounded-none text-xs font-bold transition-all cursor-pointer ${
                                isMaster ? 'text-slate-300 cursor-not-allowed' :
                                isUserDisabled ? 'text-emerald-600 hover:bg-emerald-50' : 'text-rose-600 hover:bg-rose-50'
                              }`}
                              title={isMaster ? 'Akun Master Selalu Aktif' : isUserDisabled ? 'Aktifkan Akun' : 'Nonaktifkan Akun'}
                              disabled={isMaster}
                            >
                              {isUserDisabled ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                            </button>
                          )}

                          {/* Reset Password */}
                          <button
                            type="button"
                            onClick={() => handleOpenResetModal(user)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-none text-xs font-bold transition-all cursor-pointer"
                            title="Reset Kata Sandi"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Edit User */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(user)}
                            className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded-none text-xs font-bold transition-all cursor-pointer"
                            title="Edit Data Akun"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete User */}
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteModal(user)}
                            className={`p-1.5 rounded-none text-xs font-bold transition-all cursor-pointer ${
                              isMaster ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                            }`}
                            title={isMaster ? 'Akun Master Tidak Dapat Dihapus' : 'Hapus Akun'}
                            disabled={isMaster}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user, idx) => {
            const isMaster = isMasterAccount(user.email, user.name);
            const isUserDisabled = user.isMaintenance || user.status === 'Nonaktif';
            const userOnline = getUserOnlineStatus(user);

            return (
              <div key={user.uid || idx} className="bg-white rounded-none border border-slate-200/80 p-5 shadow-xs space-y-4 relative hover:border-cyan-300 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-sm text-white shadow-xs ${
                        isMaster ? 'bg-gradient-to-br from-amber-500 to-amber-700' :
                        user.status === 'Menunggu Aktivasi' ? 'bg-amber-600' :
                        isUserDisabled ? 'bg-slate-400' : 'bg-[#164e63]'
                      }`}>
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span 
                        className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                          userOnline.isOnline ? 'bg-emerald-500 ring-1 ring-emerald-300' : 'bg-slate-300'
                        }`}
                        title={userOnline.isOnline ? 'Sedang Online' : 'Offline'}
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-slate-800 text-sm truncate flex items-center gap-1.5">
                        <span>{user.name}</span>
                      </h4>
                      <div className="text-xs text-slate-500 truncate font-mono">{user.email}</div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {/* Session Online/Offline Badge */}
                    {userOnline.isOnline ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider bg-emerald-500/10 text-emerald-800 border border-emerald-300/80 shadow-2xs">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]"></span>
                        </span>
                        <span>ONLINE</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
                        <span>OFFLINE</span>
                      </span>
                    )}

                    {/* Account status badge */}
                    {user.status === 'Menunggu Aktivasi' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>MENUNGGU AKTIVASI</span>
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isUserDisabled ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {isUserDisabled ? 'BELUM AKTIF' : 'Aktif'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Status Sesi:</span>
                    <span className={`font-semibold flex items-center gap-1.5 text-xs ${userOnline.isOnline ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                      <span className={`w-2 h-2 rounded-full ${userOnline.isOnline ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse' : 'bg-slate-400'}`} />
                      <span>{userOnline.isOnline ? 'Sedang Online' : 'Offline'}</span>
                      <span className="text-[10px] text-slate-400 font-medium">({userOnline.lastSeenText})</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">NIP/NUPTK:</span>
                    <span className="font-mono font-semibold text-slate-700">{user.nip || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Sekolah:</span>
                    <span className="font-semibold text-slate-700 truncate max-w-[170px]">{user.schoolName || 'SD Negeri 1 SIMAK'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Peran:</span>
                    <span className="font-semibold text-[#164e63]">{user.role || 'Guru Pengampu'}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">No. WhatsApp:</span>
                      <span className="font-mono text-slate-700">{user.phone}</span>
                    </div>
                  )}
                </div>

                {/* Modul Data Actions Bar */}
                <div className="pt-2.5 pb-1 border-t border-slate-100 space-y-1.5">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Aksi Data Modul Akun</span>
                    <span className="text-cyan-600 font-bold">6 Modul</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenModuleModal(user, 'jadwal')}
                      className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-none text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Lihat Data Jadwal Mengajar"
                    >
                      <Calendar className="w-3 h-3 text-indigo-600 shrink-0" />
                      <span className="truncate">Jadwal</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenModuleModal(user, 'sinkronisasi')}
                      className="p-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 rounded-none text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Lihat Data Sinkronisasi"
                    >
                      <RefreshCw className="w-3 h-3 text-cyan-600 shrink-0" />
                      <span className="truncate">Sinkronisasi</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenModuleModal(user, 'siswa')}
                      className="p-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-none text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Lihat Data Siswa"
                    >
                      <Users className="w-3 h-3 text-teal-600 shrink-0" />
                      <span className="truncate">Siswa</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenModuleModal(user, 'presensi')}
                      className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-none text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Lihat Data Presensi Kelas"
                    >
                      <ClipboardCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">Presensi</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenModuleModal(user, 'presensiEkstra')}
                      className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-none text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Lihat Data Presensi Ekstrakurikuler"
                    >
                      <Trophy className="w-3 h-3 text-amber-600 shrink-0" />
                      <span className="truncate">Prs. Ekstra</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenModuleModal(user, 'kelolaNilai')}
                      className="p-1.5 bg-violet-50 hover:bg-violet-100 text-violet-800 rounded-none text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Lihat Data Kelola Nilai"
                    >
                      <FileSpreadsheet className="w-3 h-3 text-violet-600 shrink-0" />
                      <span className="truncate">Kelola Nilai</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenModuleModal(user, 'jurnal')}
                      className="p-1.5 bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-800 rounded-none text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Lihat Data Jurnal Guru"
                    >
                      <BookOpen className="w-3 h-3 text-fuchsia-600 shrink-0" />
                      <span className="truncate">Jurnal Guru</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenModuleModal(user, 'upload-modul')}
                      className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-none text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Lihat Upload Modul / ATP"
                    >
                      <FolderUp className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">Modul/ATP</span>
                    </button>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleToggleUserStatus(user)}
                    disabled={isMaster}
                    className={`px-3 py-1.5 rounded-none text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                      isMaster ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
                      user.status === 'Menunggu Aktivasi' ? 'bg-emerald-600 text-white hover:bg-emerald-700' :
                      isUserDisabled ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{user.status === 'Menunggu Aktivasi' ? 'Aktifkan Akun' : isUserDisabled ? 'Aktifkan' : 'Nonaktifkan'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenResetModal(user)}
                      className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-none transition-all cursor-pointer"
                      title="Reset Kata Sandi"
                    >
                      <KeyRound className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(user)}
                      className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded-none transition-all cursor-pointer"
                      title="Edit Akun"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {!isMaster && (
                      <button
                        type="button"
                        onClick={() => handleOpenDeleteModal(user)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-none transition-all cursor-pointer"
                        title="Hapus Akun"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  )}

  {/* MODAL: Add New User */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-none max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[92vh] flex flex-col border border-slate-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-cyan-50 text-[#164e63] rounded-none">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">Tambah Akun Baru</h3>
                  <p className="text-xs text-slate-500">Mendaftarkan akun baru ke Master Data SIMAK</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewUser} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Modal Body with Scroll */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap & Gelar *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Contoh: Budi Santoso, S.Pd."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="email@simakmerdeka.ai.studio"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">NIP / NUPTK / NISN</label>
                    <input
                      type="text"
                      value={formNip}
                      onChange={(e) => setFormNip(e.target.value)}
                      placeholder="Nomor identitas (NIP/NUPTK/NISN)..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Unit Sekolah</label>
                    <input
                      type="text"
                      value={formSchool}
                      onChange={(e) => setFormSchool(e.target.value)}
                      placeholder="SD Negeri 1 SIMAK"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Peran / Jabatan</label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white cursor-pointer"
                    >
                      <option value="Guru Pengampu">Guru Pengampu</option>
                      <option value="Guru Kelas">Guru Kelas</option>
                      <option value="Guru Mata Pelajaran">Guru Mata Pelajaran</option>
                      <option value="Kurikulum">Kurikulum (Waka / Tim Kurikulum)</option>
                      <option value="Tata Usaha (TU)">Tata Usaha (TU) / Administrasi</option>
                      <option value="Siswa">Siswa / Peserta Didik</option>
                      <option value="Admin Utama / Operator">Admin Utama / Operator</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi</label>
                    <div className="relative">
                      <input
                        type={showFormPassword ? 'text' : 'password'}
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowFormPassword(!showFormPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showFormPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Status Akun</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as 'Aktif' | 'Nonaktif')}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-none text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white cursor-pointer"
                    >
                      <option value="Aktif">Aktif (Dapat Login)</option>
                      <option value="Nonaktif">Nonaktif (Akses Dibatasi)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-none transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#164e63] hover:bg-cyan-800 text-white rounded-none text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Akun Baru</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit User */}
      {showEditModal && selectedUserForEdit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-none max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[92vh] flex flex-col border border-slate-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-cyan-50 text-[#164e63] rounded-none">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">Edit Data Akun</h3>
                  <p className="text-xs text-slate-500">Perbarui rincian pengguna {selectedUserForEdit.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Modal Body with Scroll */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap & Gelar *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Contoh: Budi Santoso, S.Pd."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="email@simakmerdeka.ai.studio"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">NIP / NUPTK / NISN</label>
                    <input
                      type="text"
                      value={formNip}
                      onChange={(e) => setFormNip(e.target.value)}
                      placeholder="Nomor identitas (NIP/NUPTK/NISN)..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Unit Sekolah</label>
                    <input
                      type="text"
                      value={formSchool}
                      onChange={(e) => setFormSchool(e.target.value)}
                      placeholder="SD Negeri 1 SIMAK"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Peran / Jabatan</label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white cursor-pointer"
                    >
                      <option value="Guru Pengampu">Guru Pengampu</option>
                      <option value="Guru Kelas">Guru Kelas</option>
                      <option value="Guru Mata Pelajaran">Guru Mata Pelajaran</option>
                      <option value="Kurikulum">Kurikulum (Waka / Tim Kurikulum)</option>
                      <option value="Tata Usaha (TU)">Tata Usaha (TU) / Administrasi</option>
                      <option value="Siswa">Siswa / Peserta Didik</option>
                      <option value="Admin Utama / Operator">Admin Utama / Operator</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi</label>
                    <div className="relative">
                      <input
                        type={showFormPassword ? 'text' : 'password'}
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        placeholder="Biarkan kosong jika tidak diubah"
                        className="w-full pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowFormPassword(!showFormPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showFormPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Status Akun</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as 'Aktif' | 'Nonaktif')}
                      disabled={isMasterAccount(selectedUserForEdit.email, selectedUserForEdit.name)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-none text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="Aktif">Aktif (Dapat Login)</option>
                      <option value="Nonaktif">Nonaktif (Akses Dibatasi)</option>
                    </select>
                  </div>
                </div>

                {/* Status Sesi Pengguna Realtime */}
                <div className="bg-slate-50 border border-slate-200 p-3.5 flex items-center justify-between text-xs mt-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${getUserOnlineStatus(selectedUserForEdit).isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                    <div>
                      <span className="font-bold text-slate-800 block">Keterangan Aktivitas Sesi (Realtime):</span>
                      <span className="text-[11px] text-slate-600 font-semibold">{getUserOnlineStatus(selectedUserForEdit).lastSeenText}</span>
                      {getUserOnlineStatus(selectedUserForEdit).deviceInfo && (
                        <span className="text-[10px] text-slate-400 block font-mono">
                          Perangkat: {getUserOnlineStatus(selectedUserForEdit).deviceInfo}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`font-black px-2.5 py-1 rounded text-[11px] ${
                    getUserOnlineStatus(selectedUserForEdit).isOnline 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {getUserOnlineStatus(selectedUserForEdit).isOnline ? '● SEDANG ONLINE' : '○ OFFLINE'}
                  </span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-none transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#164e63] hover:bg-cyan-800 text-white rounded-none text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Reset Password */}
      {showResetModal && userToReset && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-none max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-none">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Reset Kata Sandi</h3>
                <p className="text-xs text-slate-500">Akun: {userToReset.name}</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-slate-700">Masukkan Kata Sandi Baru *</label>
              <input
                type="text"
                value={newResetPassword}
                onChange={(e) => setNewResetPassword(e.target.value)}
                placeholder="Password baru..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium font-mono focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white"
              />
              <p className="text-[11px] text-slate-500">
                Pengguna dapat langsung menggunakan kata sandi baru ini untuk login ke aplikasi SIMAK.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-none cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmResetPassword}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-none shadow-xs cursor-pointer"
              >
                Reset Kata Sandi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Delete User Confirmation */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-none max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-none">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Hapus Akun Pengguna?</h3>
                <p className="text-xs text-rose-600 font-semibold">Tindakan ini tidak dapat dibatalkan!</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus akun <span className="font-bold text-slate-800">{userToDelete.name}</span> ({userToDelete.email}) dari Master Data SIMAK?
            </p>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-none cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-none shadow-xs cursor-pointer"
              >
                Hapus Akun
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Lihat Data Modul Guru */}
      {showModuleModal && selectedUserForModule && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-none max-w-4xl w-full p-5 sm:p-6 shadow-2xl space-y-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-[#164e63] text-white rounded-none flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                  {selectedUserForModule.name ? selectedUserForModule.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-[#164e63] uppercase tracking-wider">
                    <Building2 className="w-3 h-3" />
                    <span>{selectedUserForModule.schoolName || 'SD Negeri 1 SIMAK'}</span>
                  </div>
                  <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                    <span>{selectedUserForModule.name}</span>
                    <span className="text-xs font-mono font-medium text-slate-500">({selectedUserForModule.nip || 'NIP: -'})</span>
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModuleModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-none cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Module Tabs Navigation */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 shrink-0 no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveModuleTab('jadwal')}
                className={`px-3 py-2 rounded-none text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                  activeModuleTab === 'jadwal'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Jadwal Mengajar</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModuleTab('sinkronisasi')}
                className={`px-3 py-2 rounded-none text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                  activeModuleTab === 'sinkronisasi'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Sinkronisasi</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModuleTab('siswa')}
                className={`px-3 py-2 rounded-none text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                  activeModuleTab === 'siswa'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Data Siswa</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModuleTab('presensi')}
                className={`px-3 py-2 rounded-none text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                  activeModuleTab === 'presensi'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>Presensi Kelas</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModuleTab('presensiEkstra')}
                className={`px-3 py-2 rounded-none text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                  activeModuleTab === 'presensiEkstra'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>Presensi Ekstra</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModuleTab('kelolaNilai')}
                className={`px-3 py-2 rounded-none text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                  activeModuleTab === 'kelolaNilai'
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'bg-violet-50 text-violet-700 hover:bg-violet-100'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Kelola Nilai</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModuleTab('jurnal')}
                className={`px-3 py-2 rounded-none text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                  activeModuleTab === 'jurnal'
                    ? 'bg-fuchsia-600 text-white shadow-xs'
                    : 'bg-fuchsia-50 text-fuchsia-700 hover:bg-fuchsia-100'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Jurnal Guru</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModuleTab('upload-modul')}
                className={`px-3 py-2 rounded-none text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                  activeModuleTab === 'upload-modul'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <FolderUp className="w-4 h-4" />
                <span>Upload Modul/ATP</span>
              </button>
            </div>

            {/* Tab Content Body */}
            <div className="overflow-y-auto space-y-4 pr-1 flex-1">
              {renderUserModule ? (
                renderUserModule(selectedUserForModule, activeModuleTab)
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">Modul Tidak Tersedia</h4>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Fungsi rendering modul belum diimplementasikan di tingkat parent.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
              <div className="text-[11px] text-slate-500 font-medium">
                Menampilkan modul data terintegrasi untuk <span className="font-bold text-slate-800">{selectedUserForModule.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowModuleModal(false)}
                className="px-5 py-2 bg-[#164e63] hover:bg-cyan-800 text-white text-xs font-bold rounded-none transition-colors cursor-pointer shadow-xs"
              >
                Tutup Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Success Animated Modal (Sama seperti simpan profil guru) */}
      <SaveSuccessModal
        isOpen={saveSuccessModal}
        onClose={() => setSaveSuccessModal(false)}
        title="Data Berhasil Disimpan"
        message={saveSuccessMsg || "Data telah berhasil disimpan dan tersinkronisasi."}
      />

      {/* Modal Hapus Penyimpanan Sekolah (Multi-Tenant Partition Cleanup) */}
      {showDeleteSchoolStorageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-none w-full max-w-lg overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-rose-700 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-white/20 flex items-center justify-center rounded-none">
                  <Trash2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight text-white uppercase">
                    Hapus Penyimpanan Sekolah
                  </h3>
                  <p className="text-[11px] text-rose-100">
                    Pembersihan Partisi Data Multi-Tenant Satuan Pendidikan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isDeletingSchoolStorage) {
                    setShowDeleteSchoolStorageModal(false);
                  }
                }}
                className="text-white/80 hover:text-white p-1 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Partisi Satuan Pendidikan yang Ingin Dihapus *
                </label>
                <select
                  value={selectedSchoolToDelete}
                  onChange={(e) => setSelectedSchoolToDelete(e.target.value)}
                  disabled={isDeletingSchoolStorage}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                >
                  {registeredSchools.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} {s.npsn ? `(NPSN: ${s.npsn})` : ''} {s.name === (teacher?.schoolName || activeSchoolName) ? '— [Sedang Aktif]' : ''}
                    </option>
                  ))}
                  {registeredSchools.length === 0 && (
                    <option value={teacher?.schoolName || activeSchoolName || 'Sekolah Utama'}>
                      {teacher?.schoolName || activeSchoolName || 'Sekolah Utama'}
                    </option>
                  )}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Penyimpanan untuk sekolah yang dipilih akan dibersihkan dari server dan peramban.
                </p>
              </div>

              {/* Data Summary Card */}
              <div className="p-3 bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-semibold">Satuan Pendidikan:</span>
                  <span className="font-bold text-slate-800 truncate max-w-[240px]">{selectedSchoolToDelete || 'Belum dipilih'}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-semibold">Path Database:</span>
                  <span className="font-mono text-cyan-800 text-[10px]">/schools/{normalizeSchoolId(selectedSchoolToDelete || '')}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-semibold">Pengguna Terdaftar:</span>
                  <span className="font-bold text-rose-700">
                    {registeredUsers.filter(u => (u.schoolName || '').toLowerCase().trim() === (selectedSchoolToDelete || '').toLowerCase().trim()).length} Akun
                  </span>
                </div>
              </div>

              {/* Warning Notice */}
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-[11px]">
                  <p className="font-bold">Peringatan Penghapusan Data Permanen:</p>
                  <p className="text-rose-800 leading-relaxed">
                    Tindakan ini akan menghapus dokumen partisi penyimpanan sekolah di cloud dan membersihkan cache lokal untuk sekolah <strong>"{selectedSchoolToDelete}"</strong>. Pastikan Anda telah mengarsipkan data penting jika diperlukan.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeleteSchoolStorageModal(false)}
                disabled={isDeletingSchoolStorage}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteDeleteSchoolStorage}
                disabled={isDeletingSchoolStorage || !selectedSchoolToDelete}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isDeletingSchoolStorage ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus Penyimpanan...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Penyimpanan Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
