import React, { useState } from 'react';
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
  Wallet
} from 'lucide-react';
import { UserAccount, TeacherProfile, InfoAnnouncement, InfoAnnouncementItem, getAnnouncementItems } from '../types';
import { SaveSuccessModal } from './SaveSuccessModal';
import { CurriculumSystemView } from './systems/CurriculumSystemView';
import { TeacherSystemView } from './systems/TeacherSystemView';
import { AdministrationSystemView } from './systems/AdministrationSystemView';
import { SarprasSystemView } from './systems/SarprasSystemView';
import { LibrarySystemView } from './systems/LibrarySystemView';
import { StudentSystemView } from './systems/StudentSystemView';

interface MasterDataViewProps {
  registeredUsers: UserAccount[];
  onUpdateRegisteredUsers: (updatedUsers: UserAccount[]) => void;
  teacherProfiles?: TeacherProfile[];
  currentUser?: UserAccount | null;
  teacher?: TeacherProfile;
  infoAnnouncement?: InfoAnnouncement;
  classList?: string[];
  onUpdateInfoAnnouncement?: (updated: InfoAnnouncement) => void;
  renderUserModule?: (user: UserAccount, tab: string) => React.ReactNode;
  onNavigateTab?: (tab: string) => void;
  activeCategory?: 'Semua' | 'Kurikulum' | 'Guru' | 'TU' | 'Sarpras' | 'Keuangan' | 'Perpustakaan' | 'Siswa';
  onCategoryChange?: (category: 'Semua' | 'Kurikulum' | 'Guru' | 'TU' | 'Sarpras' | 'Keuangan' | 'Perpustakaan' | 'Siswa') => void;
}

export const MasterDataView: React.FC<MasterDataViewProps> = ({
  registeredUsers = [],
  onUpdateRegisteredUsers,
  teacherProfiles = [],
  currentUser,
  teacher,
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
  const [schoolFilter, setSchoolFilter] = useState<string>('Semua');
  const [roleFilter, setRoleFilter] = useState<string>('Semua');
  const [internalCategory, setInternalCategory] = useState<'Semua' | 'Kurikulum' | 'Guru' | 'TU' | 'Sarpras' | 'Keuangan' | 'Perpustakaan' | 'Siswa'>('Semua');
  const selectedCategory = activeCategory !== undefined ? activeCategory : internalCategory;

  const setSelectedCategory = (cat: 'Semua' | 'Kurikulum' | 'Guru' | 'TU' | 'Sarpras' | 'Keuangan' | 'Perpustakaan' | 'Siswa') => {
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

  // Module Data Inspector Modal State
  const [showModuleModal, setShowModuleModal] = useState<boolean>(false);
  const [selectedUserForModule, setSelectedUserForModule] = useState<UserAccount | null>(null);
  const [activeModuleTab, setActiveModuleTab] = useState<'jadwal' | 'sinkronisasi' | 'siswa' | 'presensi' | 'presensiEkstra' | 'kelolaNilai' | 'jurnal' | 'upload-modul' | 'modul' | 'uploadModul'>('jadwal');

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
      (u.schoolName && u.schoolName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.role && u.role.toLowerCase().includes(searchTerm.toLowerCase()));

    const currentStatus = u.isMaintenance || u.status === 'Nonaktif' ? 'Nonaktif' : 'Aktif';
    const matchesStatus = statusFilter === 'Semua' || currentStatus === statusFilter;
    const matchesSchool = schoolFilter === 'Semua' || (u.schoolName || 'SD Negeri 1 SIMAK') === schoolFilter;
    const matchesRole = roleFilter === 'Semua' || (u.role || 'Guru Pengampu') === roleFilter;
    const userCategory = getUserCategory(u);
    const matchesCategory = selectedCategory === 'Semua' || userCategory === selectedCategory;

    return matchesSearch && matchesStatus && matchesSchool && matchesRole && matchesCategory;
  });

  // Calculate statistics
  const totalCount = registeredUsers.length;
  const activeCount = registeredUsers.filter(u => !u.isMaintenance && u.status !== 'Nonaktif').length;
  const nonActiveCount = totalCount - activeCount;
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
    setSelectedCategory(value as 'Semua' | 'Kurikulum' | 'Guru' | 'TU' | 'Sarpras' | 'Keuangan' | 'Perpustakaan' | 'Siswa');
  };

  // Helper for quick navigation to dedicated system pages
  const handleQuickNavigate = (
    tab: 'system-kurikulum' | 'system-guru' | 'system-tu' | 'system-sarpras' | 'system-keuangan' | 'system-kesiswaan' | 'system-perpustakaan',
    cat: 'Kurikulum' | 'Guru' | 'TU' | 'Sarpras' | 'Keuangan' | 'Perpustakaan' | 'Siswa'
  ) => {
    if (onNavigateTab) {
      onNavigateTab(tab);
    } else if (onCategoryChange) {
      onCategoryChange(cat);
    } else {
      setSelectedCategory(cat);
    }
  };

  // Toggle user active status
  const handleToggleUserStatus = (targetUser: UserAccount) => {
    if (isMasterAccount(targetUser.email, targetUser.name)) {
      showToast(`Akun milik ${targetUser.name} adalah Akun Utama / Master Data dan selalu aktif.`, 'info');
      return;
    }

    const currentIsDisabled = targetUser.isMaintenance || targetUser.status === 'Nonaktif';
    const newIsDisabled = !currentIsDisabled;
    const newStatus: 'Aktif' | 'Nonaktif' = newIsDisabled ? 'Nonaktif' : 'Aktif';

    const updatedUsers = registeredUsers.map(u => {
      if (u.uid === targetUser.uid || u.email.toLowerCase() === targetUser.email.toLowerCase()) {
        return {
          ...u,
          isMaintenance: newIsDisabled,
          status: newStatus
        };
      }
      return u;
    });

    onUpdateRegisteredUsers(updatedUsers);
    setSaveSuccessMsg(`Status akun "${targetUser.name}" berhasil diubah menjadi ${newStatus}.`);
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

      {/* Global Action Bar with Active System Indicator and Action Buttons (Only shown on Monitoring Akun Utama / Semua) */}
      {selectedCategory === 'Semua' && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
            {/* Active System Indicator / Breadcrumb */}
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 text-[#164e63] text-xs font-bold shadow-2xs">
                <Database className="w-4 h-4 text-[#164e63]" />
                <span>Monitoring Seluruh Akun ({totalCount} Pengguna Terdaftar)</span>
              </div>
            </div>

            {/* Action Buttons: Tambah Akun */}
            <div className="flex items-center justify-end gap-2.5 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => handleOpenAddModal()}
                className="px-4 py-2 bg-[#164e63] hover:bg-cyan-800 text-white rounded-none font-bold text-xs flex items-center gap-2 shadow-2xs transition-all cursor-pointer active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>Tambah Akun</span>
              </button>
            </div>
          </div>
      )}

      {/* CONDITIONAL RENDERING OF DEDICATED SYSTEMS */}
      {selectedCategory === 'Kurikulum' ? (
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
          onNavigateTab={onNavigateTab}
        />
      ) : selectedCategory === 'Perpustakaan' ? (
        <LibrarySystemView
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
          {/* KPI Metrics Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-none border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="p-3 bg-cyan-50 text-[#164e63] rounded-none shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Akun</div>
                <div className="text-xl font-black text-slate-800">{totalCount} <span className="text-xs font-semibold text-slate-500">Pengguna</span></div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-none border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-none shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Akun Aktif</div>
                <div className="text-xl font-black text-emerald-700">{activeCount} <span className="text-xs font-semibold text-emerald-600">Aktif</span></div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-none border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-none shrink-0">
                <UserX className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Akun Nonaktif</div>
                <div className="text-xl font-black text-rose-700">{nonActiveCount} <span className="text-xs font-semibold text-rose-600">Dibatasi</span></div>
              </div>
            </div>

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
              placeholder="Cari berdasarkan nama, email, NIP, atau sekolah..."
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
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-none text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-600 cursor-pointer"
            >
              <option value="Semua">Semua Status</option>
              <option value="Aktif">Status: Aktif</option>
              <option value="Nonaktif">Status: BELUM AKTIF</option>
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
            Menampilkan <span className="font-bold text-slate-800">{filteredUsers.length}</span> dari <span className="font-bold text-slate-800">{registeredUsers.length}</span> akun terdaftar.
          </div>
          {(searchTerm || statusFilter !== 'Semua' || schoolFilter !== 'Semua' || roleFilter !== 'Semua' || selectedCategory !== 'Semua') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('Semua');
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
                  <th className="py-3.5 px-4">NIP / Identitas</th>
                  <th className="py-3.5 px-4">Unit Sekolah</th>
                  <th className="py-3.5 px-4">Peran / Hak Akses</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.map((user, idx) => {
                  const isMaster = isMasterAccount(user.email, user.name);
                  const isUserDisabled = user.isMaintenance || user.status === 'Nonaktif';

                  return (
                    <tr key={user.uid || idx} className="hover:bg-cyan-50/40 transition-colors">
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                        {idx + 1}
                      </td>

                      {/* Name & Email & Badge */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs text-white shrink-0 shadow-xs ${
                            isMaster ? 'bg-gradient-to-br from-amber-500 to-amber-700' :
                            isUserDisabled ? 'bg-slate-400' : 'bg-[#164e63]'
                          }`}>
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
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

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          isUserDisabled
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isUserDisabled ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`} />
                          {isUserDisabled ? 'BELUM AKTIF' : 'Aktif'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Toggle status button */}
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

            return (
              <div key={user.uid || idx} className="bg-white rounded-none border border-slate-200/80 p-5 shadow-xs space-y-4 relative hover:border-cyan-300 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-sm text-white shrink-0 shadow-xs ${
                      isMaster ? 'bg-gradient-to-br from-amber-500 to-amber-700' :
                      isUserDisabled ? 'bg-slate-400' : 'bg-[#164e63]'
                    }`}>
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-slate-800 text-sm truncate flex items-center gap-1.5">
                        <span>{user.name}</span>
                      </h4>
                      <div className="text-xs text-slate-500 truncate font-mono">{user.email}</div>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    isUserDisabled ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {isUserDisabled ? 'BELUM AKTIF' : 'Aktif'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
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
                    className={`px-2.5 py-1.5 rounded-none text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isMaster ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
                      isUserDisabled ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                    }`}
                  >
                    {isUserDisabled ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                    <span>{isUserDisabled ? 'Aktifkan' : 'Nonaktifkan'}</span>
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
    </div>
  );
};
