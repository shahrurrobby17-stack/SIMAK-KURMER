import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  BookOpen,
  Calendar,
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Plus,
  Search,
  ExternalLink,
  Sparkles,
  Award,
  Clock,
  Eye,
  Building2,
  CheckSquare,
  XSquare,
  Edit3,
  Trash2,
  FolderUp,
  ShieldCheck,
  Filter,
  UserCheck,
  UserX,
  X,
  Save,
  Check,
  School
} from 'lucide-react';
import { UserAccount, TeacherProfile, RegisteredSchool } from '../../types';
import { TeacherModuleUploadView, initialDefaultModules } from '../TeacherModuleUploadView';

interface TeacherSystemViewProps {
  registeredUsers: UserAccount[];
  teacher?: TeacherProfile;
  currentUser?: UserAccount | null;
  teacherProfiles?: TeacherProfile[];
  registeredSchools?: RegisteredSchool[];
  activeSchoolName?: string;
  onUpdateRegisteredUsers?: (users: UserAccount[]) => void;
  onNavigateTab?: (tab: string) => void;
  onOpenAddUserModal?: (defaultRole: string) => void;
  onOpenEditUserModal?: (user: UserAccount) => void;
  onOpenDeleteUserModal?: (user: UserAccount) => void;
  onOpenModuleModal?: (user: UserAccount, tab: any) => void;
  onSelectCategory?: (category: 'Semua' | 'Kurikulum' | 'Guru' | 'TU' | 'Siswa') => void;
}

interface TeachingLogItem {
  id: string;
  guru: string;
  mapel: string;
  kelas: string;
  tgl: string;
  jam: string;
  tp: string;
  hadir: number;
  absen: number;
  status: string;
}

export const TeacherSystemView: React.FC<TeacherSystemViewProps> = ({
  registeredUsers = [],
  teacher,
  currentUser,
  teacherProfiles = [],
  registeredSchools = [],
  activeSchoolName,
  onUpdateRegisteredUsers,
  onNavigateTab,
  onOpenAddUserModal,
  onOpenEditUserModal,
  onOpenDeleteUserModal,
  onOpenModuleModal
}) => {
  // Default tab is 'direktori' (GTK Table)
  const [activeTab, setActiveTab] = useState<'direktori' | 'jurnal' | 'uploadModul' | 'administrasi'>('direktori');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusKepegawaianFilter, setStatusKepegawaianFilter] = useState<string>('Semua');
  const [schoolFilter, setSchoolFilter] = useState<string>('Semua');
  const [roleFilter, setRoleFilter] = useState<string>('Semua');

  // Modal States for Inline GTK Add/Edit
  const [showInlineAddModal, setShowInlineAddModal] = useState<boolean>(false);
  const [showInlineEditModal, setShowInlineEditModal] = useState<boolean>(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserAccount | null>(null);
  const [showInlineDeleteModal, setShowInlineDeleteModal] = useState<boolean>(false);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<UserAccount | null>(null);

  // Form States for Add/Edit GTK
  const [formName, setFormName] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formNip, setFormNip] = useState<string>('');
  const [formSchool, setFormSchool] = useState<string>('SMA Negeri 1 Indonesia - Sekolah Penggerak');
  const [formRole, setFormRole] = useState<string>('Guru Pengampu');
  const [formEmploymentStatus, setFormEmploymentStatus] = useState<'PPPK' | 'PNS' | 'Non-ASN' | 'Honorer' | 'GTY'>('PNS');
  const [formStatus, setFormStatus] = useState<'Aktif' | 'Nonaktif' | 'Menunggu Aktivasi'>('Aktif');

  // Identify Role Level
  const isAdministrator = useMemo(() => {
    return Boolean(
      currentUser?.email?.toLowerCase() === 'shahrurrobby17@gmail.com' ||
      (currentUser?.role && (
        currentUser.role.toLowerCase().includes('admin') ||
        currentUser.role.toLowerCase().includes('master') ||
        currentUser.role.toLowerCase().includes('super')
      )) ||
      teacher?.id === 'PROF-ADMIN'
    );
  }, [currentUser, teacher]);

  const isKepalaSekolah = useMemo(() => {
    return Boolean(
      currentUser?.role && (
        currentUser.role.toLowerCase().includes('kepala') ||
        currentUser.role.toLowerCase().includes('principal')
      ) && !isAdministrator
    );
  }, [currentUser, isAdministrator]);

  // Derive Status Kepegawaian (PPPK / PNS / Non-ASN / Honorer / GTY)
  const getStatusKepegawaian = (item: any): 'PPPK' | 'PNS' | 'Non-ASN' | 'Honorer' | 'GTY' => {
    if (item.employmentStatus) {
      const empUpper = String(item.employmentStatus).toUpperCase();
      if (empUpper.includes('GTY') || empUpper.includes('YAYASAN')) return 'GTY';
      if (empUpper.includes('PPPK')) return 'PPPK';
      if (empUpper.includes('PNS')) return 'PNS';
      if (empUpper.includes('NON-ASN') || empUpper.includes('NON ASN')) return 'Non-ASN';
      if (empUpper.includes('HONORER')) return 'Honorer';
      return item.employmentStatus as any;
    }
    if (item.statusKepegawaian) {
      const skUpper = String(item.statusKepegawaian).toUpperCase();
      if (skUpper.includes('GTY') || skUpper.includes('YAYASAN')) return 'GTY';
      if (skUpper.includes('PPPK')) return 'PPPK';
      if (skUpper.includes('PNS')) return 'PNS';
      if (skUpper.includes('NON-ASN') || skUpper.includes('NON ASN')) return 'Non-ASN';
      if (skUpper.includes('HONORER')) return 'Honorer';
      return item.statusKepegawaian as any;
    }

    const nipClean = item.nip ? String(item.nip).replace(/\s+/g, '').trim() : '';
    const roleLower = (item.role || '').toLowerCase();

    if (roleLower.includes('gty') || roleLower.includes('yayasan')) return 'GTY';
    if (roleLower.includes('pppk')) return 'PPPK';
    if (roleLower.includes('pns')) return 'PNS';
    if (roleLower.includes('honorer')) return 'Honorer';
    if (roleLower.includes('non-asn') || roleLower.includes('non asn')) return 'Non-ASN';

    if (nipClean.length >= 18) {
      const yearSlot = nipClean.substring(8, 12);
      const yr = parseInt(yearSlot, 10);
      if (!isNaN(yr) && yr >= 2021) {
        return 'PPPK';
      }
      return 'PNS';
    } else if (nipClean.length >= 12) {
      return 'Non-ASN';
    } else if (nipClean.length > 0) {
      return 'Honorer';
    }

    return 'Honorer';
  };

  // Build Unified GTK List (Teachers, Staff, Educators, Officers)
  const allGtkList = useMemo(() => {
    const map = new Map<string, any>();

    // 1. Process registeredUsers
    registeredUsers.forEach((u) => {
      const rLower = (u.role || '').toLowerCase();
      // Exclude students
      if (rLower.includes('siswa') || rLower.includes('murid')) return;

      const userSchool = u.schoolName || activeSchoolName || 'SMA Negeri 1 Indonesia - Sekolah Penggerak';

      // For Kepala Sekolah, filter by active school context
      if (isKepalaSekolah && activeSchoolName) {
        const uSchoolClean = userSchool.toLowerCase().trim();
        const activeClean = activeSchoolName.toLowerCase().trim();
        if (uSchoolClean && !uSchoolClean.includes(activeClean) && !activeClean.includes(uSchoolClean)) {
          return;
        }
      }

      const key = u.email ? u.email.toLowerCase() : u.uid;
      map.set(key, {
        uid: u.uid,
        name: u.name,
        email: u.email,
        nip: u.nip || '-',
        schoolName: userSchool,
        role: u.role || 'Guru Pengampu',
        status: u.status || 'Aktif',
        employmentStatus: getStatusKepegawaian(u)
      });
    });

    // 2. Combine with teacherProfiles
    teacherProfiles.forEach((p) => {
      const key = p.email ? p.email.toLowerCase() : (p.id || p.nip);
      if (!key) return;

      const profSchool = p.schoolName || activeSchoolName || 'SMA Negeri 1 Indonesia - Sekolah Penggerak';

      if (isKepalaSekolah && activeSchoolName) {
        const pSchoolClean = profSchool.toLowerCase().trim();
        const activeClean = activeSchoolName.toLowerCase().trim();
        if (pSchoolClean && !pSchoolClean.includes(activeClean) && !activeClean.includes(pSchoolClean)) {
          return;
        }
      }

      if (!map.has(key)) {
        map.set(key, {
          uid: p.id || `PROF-${Date.now()}`,
          name: p.name,
          email: p.email || `${p.nip ? p.nip.replace(/\s+/g, '') : 'prof'}@simakmerdeka.ai.studio`,
          nip: p.nip || '-',
          schoolName: profSchool,
          role: p.title || 'Guru Pengampu',
          status: p.status || 'Aktif',
          employmentStatus: getStatusKepegawaian(p)
        });
      }
    });

    return Array.from(map.values());
  }, [registeredUsers, teacherProfiles, isKepalaSekolah, activeSchoolName]);

  // List of distinct schools for school filter
  const schoolOptions = useMemo(() => {
    const set = new Set<string>();
    registeredSchools.forEach((s) => set.add(s.name));
    allGtkList.forEach((g) => {
      if (g.schoolName) set.add(g.schoolName);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [registeredSchools, allGtkList]);

  // Filtered GTK List
  const filteredGtkList = useMemo(() => {
    return allGtkList.filter((item) => {
      // Search term
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = item.name && item.name.toLowerCase().includes(q);
        const nipMatch = item.nip && item.nip.toLowerCase().includes(q);
        const emailMatch = item.email && item.email.toLowerCase().includes(q);
        const roleMatch = item.role && item.role.toLowerCase().includes(q);
        const schoolMatch = item.schoolName && item.schoolName.toLowerCase().includes(q);
        if (!nameMatch && !nipMatch && !emailMatch && !roleMatch && !schoolMatch) return false;
      }

      // School filter
      if (schoolFilter !== 'Semua') {
        if (item.schoolName !== schoolFilter) return false;
      }

      // Status Kepegawaian filter
      if (statusKepegawaianFilter !== 'Semua') {
        if (item.employmentStatus !== statusKepegawaianFilter) return false;
      }

      // Role filter
      if (roleFilter !== 'Semua') {
        const rLower = (item.role || '').toLowerCase();
        if (roleFilter === 'Guru' && !rLower.includes('guru') && !rLower.includes('pendidik')) return false;
        if (roleFilter === 'Kepala Sekolah' && !rLower.includes('kepala') && !rLower.includes('principal')) return false;
        if (roleFilter === 'TU / Staff' && !rLower.includes('tu') && !rLower.includes('tata usaha') && !rLower.includes('administrasi') && !rLower.includes('staf')) return false;
      }

      return true;
    });
  }, [allGtkList, searchQuery, schoolFilter, statusKepegawaianFilter, roleFilter]);

  // Counts
  const pnsCount = useMemo(() => allGtkList.filter(g => g.employmentStatus === 'PNS').length, [allGtkList]);
  const pppkCount = useMemo(() => allGtkList.filter(g => g.employmentStatus === 'PPPK').length, [allGtkList]);
  const gtyCount = useMemo(() => allGtkList.filter(g => g.employmentStatus === 'GTY').length, [allGtkList]);
  const nonAsnCount = useMemo(() => allGtkList.filter(g => g.employmentStatus === 'Non-ASN').length, [allGtkList]);
  const honorerCount = useMemo(() => allGtkList.filter(g => g.employmentStatus === 'Honorer').length, [allGtkList]);

  // Teaching Logs State
  const [teachingLogs, setTeachingLogs] = useState<TeachingLogItem[]>([
    { id: 'LOG-01', guru: teacher?.name || 'Shahrur Robby, S.Pd.', mapel: 'Biologi', kelas: 'X-IPA 1', tgl: '2026-08-21', jam: 'Jam Ke 1-2 (07.00 - 08.30)', tp: 'Struktur Sel & Transpor Membran Seluler', hadir: 31, absen: 1, status: 'Tuntas' },
    { id: 'LOG-02', guru: 'Budi Santoso, S.Pd., M.Si.', mapel: 'Matematika', kelas: 'X-IPA 2', tgl: '2026-08-21', jam: 'Jam Ke 3-4 (08.30 - 10.00)', tp: 'Eksponen & Bentuk Akar Logaritma', hadir: 32, absen: 0, status: 'Tuntas' },
    { id: 'LOG-03', guru: 'Dewi Lestari, M.Pd.', mapel: 'Bahasa Indonesia', kelas: 'XI-A', tgl: '2026-08-20', jam: 'Jam Ke 1-2 (07.00 - 08.30)', tp: 'Menulis Teks Laporan Hasil Observasi (LHO)', hadir: 30, absen: 2, status: 'Tuntas' },
    { id: 'LOG-04', guru: 'Ir. Agus Pratama, S.Pd.', mapel: 'Fisika', kelas: 'XI-B', tgl: '2026-08-20', jam: 'Jam Ke 5-6 (10.15 - 11.45)', tp: 'Pengukuran Vektor & Dinamika Gerak Lurus', hadir: 31, absen: 1, status: 'Tuntas' },
    { id: 'LOG-05', guru: 'Anita Wijaya, S.Pd.', mapel: 'Bahasa Inggris', kelas: 'X-IPA 1', tgl: '2026-08-19', jam: 'Jam Ke 3-4 (08.30 - 10.00)', tp: 'Descriptive Text & Analytical Exposition', hadir: 32, absen: 0, status: 'Tuntas' }
  ]);

  // Teaching Logs Modal State
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [logFormGuru, setLogFormGuru] = useState<string>('');
  const [logFormMapel, setLogFormMapel] = useState<string>('');
  const [logFormKelas, setLogFormKelas] = useState<string>('');
  const [logFormTgl, setLogFormTgl] = useState<string>('');
  const [logFormJam, setLogFormJam] = useState<string>('');
  const [logFormTp, setLogFormTp] = useState<string>('');
  const [logFormHadir, setLogFormHadir] = useState<number>(32);
  const [logFormAbsen, setLogFormAbsen] = useState<number>(0);
  const [logFormStatus, setLogFormStatus] = useState<string>('Tuntas');

  const [showDeleteLogModal, setShowDeleteLogModal] = useState<boolean>(false);
  const [logToDelete, setLogToDelete] = useState<TeachingLogItem | null>(null);

  // Modules
  const [modules] = useState<any[]>(() => initialDefaultModules);

  // Open Add Inline GTK Modal
  const handleOpenInlineAdd = () => {
    if (onOpenAddUserModal) {
      onOpenAddUserModal('Guru Pengampu');
      return;
    }
    setFormName('');
    setFormEmail('');
    setFormNip('');
    setFormSchool(activeSchoolName || 'SMA Negeri 1 Indonesia - Sekolah Penggerak');
    setFormRole('Guru Pengampu');
    setFormEmploymentStatus('PNS');
    setFormStatus('Aktif');
    setShowInlineAddModal(true);
  };

  // Open Edit Inline GTK Modal
  const handleOpenInlineEdit = (userItem: any) => {
    if (onOpenEditUserModal) {
      onOpenEditUserModal(userItem);
      return;
    }
    setSelectedUserForEdit(userItem);
    setFormName(userItem.name || '');
    setFormEmail(userItem.email || '');
    setFormNip(userItem.nip || '');
    setFormSchool(userItem.schoolName || activeSchoolName || 'SMA Negeri 1 Indonesia - Sekolah Penggerak');
    setFormRole(userItem.role || 'Guru Pengampu');
    setFormEmploymentStatus(userItem.employmentStatus || 'PNS');
    setFormStatus(userItem.status || 'Aktif');
    setShowInlineEditModal(true);
  };

  // Save Inline Add GTK
  const handleSaveInlineAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    const newGtkUser: UserAccount = {
      uid: `USER-GTK-${Date.now()}`,
      name: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      nip: formNip.trim() || undefined,
      schoolName: formSchool,
      role: formRole,
      status: formStatus,
      password: 'password123'
    };
    (newGtkUser as any).employmentStatus = formEmploymentStatus;

    if (onUpdateRegisteredUsers) {
      onUpdateRegisteredUsers([newGtkUser, ...registeredUsers]);
    }
    setShowInlineAddModal(false);
  };

  // Save Inline Edit GTK
  const handleSaveInlineEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit || !formName.trim()) return;

    const updated = registeredUsers.map((u) => {
      if (u.uid === selectedUserForEdit.uid || u.email === selectedUserForEdit.email) {
        const item = {
          ...u,
          name: formName.trim(),
          email: formEmail.trim().toLowerCase(),
          nip: formNip.trim() || undefined,
          schoolName: formSchool,
          role: formRole,
          status: formStatus
        };
        (item as any).employmentStatus = formEmploymentStatus;
        return item;
      }
      return u;
    });

    if (onUpdateRegisteredUsers) {
      onUpdateRegisteredUsers(updated);
    }
    setShowInlineEditModal(false);
    setSelectedUserForEdit(null);
  };

  // Confirm Delete GTK
  const handleConfirmInlineDelete = () => {
    if (selectedUserForDelete) {
      if (onOpenDeleteUserModal) {
        onOpenDeleteUserModal(selectedUserForDelete);
      } else if (onUpdateRegisteredUsers) {
        const updated = registeredUsers.filter(u => u.uid !== selectedUserForDelete.uid && u.email !== selectedUserForDelete.email);
        onUpdateRegisteredUsers(updated);
      }
      setShowInlineDeleteModal(false);
      setSelectedUserForDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards for GTK */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-none border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-cyan-50 text-[#164e63] rounded-none shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total GTK</div>
            <div className="text-xl font-black text-slate-800">
              {allGtkList.length} <span className="text-xs font-semibold text-slate-500">Pendidik & Staff</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-none border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-none shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">PNS & PPPK</div>
            <div className="text-xl font-black text-emerald-700">
              {pnsCount + pppkCount} <span className="text-xs font-semibold text-emerald-600">({pnsCount} PNS / {pppkCount} PPPK)</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-none border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-none shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">GTY, Non-ASN & Honorer</div>
            <div className="text-xl font-black text-amber-700">
              {gtyCount + nonAsnCount + honorerCount} <span className="text-xs font-semibold text-amber-600">({gtyCount} GTY / {nonAsnCount} Non-ASN / {honorerCount} Honorer)</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-none border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-none shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cakupan Unit Sekolah</div>
            <div className="text-xl font-black text-indigo-700">
              {isAdministrator ? `${schoolOptions.length} Sekolah` : (activeSchoolName || 'Sekolah Aktif')}
            </div>
          </div>
        </div>
      </div>

      {/* Subsystem Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-2 pt-2 gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('direktori')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'direktori'
              ? 'border-[#164e63] text-[#164e63] bg-cyan-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Daftar GTK & Status Kepegawaian ({allGtkList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('jurnal')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'jurnal'
              ? 'border-[#164e63] text-[#164e63] bg-cyan-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Monitoring Jurnal Mengajar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('uploadModul')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'uploadModul'
              ? 'border-[#164e63] text-[#164e63] bg-cyan-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FolderUp className="w-4 h-4" />
          <span>Upload Modul/ATP & Perangkat Ajar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('administrasi')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'administrasi'
              ? 'border-[#164e63] text-[#164e63] bg-cyan-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Kelengkapan Administrasi & Supervisi</span>
        </button>
      </div>

      {/* TAB CONTENT 1: DAFTAR GTK TABEL UTAMA */}
      {activeTab === 'direktori' && (
        <div className="bg-white p-5 rounded-none border border-slate-200 shadow-xs space-y-4">
          {/* Header Controls & Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-800 tracking-tight uppercase flex items-center gap-2">
                <Users className="w-4 h-4 text-[#164e63]" />
                <span>Daftar Guru & Tenaga Kependidikan (GTK)</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {isAdministrator 
                  ? 'Menampilkan seluruh data pendidik, pegawai, dan staf dari semua unit sekolah terdaftar.' 
                  : `Daftar pendidik & tenaga kependidikan aktif unit ${activeSchoolName || 'Sekolah'}.`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari Nama, NIP/NUPTK, Peran..."
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-none text-xs w-52 sm:w-60 focus:outline-none focus:ring-2 focus:ring-cyan-600"
                />
              </div>

              {/* School Filter (Shown for Administrator) */}
              {isAdministrator && (
                <select
                  value={schoolFilter}
                  onChange={(e) => setSchoolFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-none text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-600 max-w-[170px] truncate cursor-pointer"
                >
                  <option value="Semua">Semua Unit Sekolah</option>
                  {schoolOptions.map(sch => (
                    <option key={sch} value={sch}>{sch}</option>
                  ))}
                </select>
              )}

              {/* Status Kepegawaian Filter */}
              <select
                value={statusKepegawaianFilter}
                onChange={(e) => setStatusKepegawaianFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-none text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-600 cursor-pointer"
              >
                <option value="Semua">Semua Kepegawaian</option>
                <option value="PNS">PNS ({pnsCount})</option>
                <option value="PPPK">PPPK ({pppkCount})</option>
                <option value="GTY">GTY / Guru Tetap Yayasan ({gtyCount})</option>
                <option value="Non-ASN">Non-ASN ({nonAsnCount})</option>
                <option value="Honorer">Honorer ({honorerCount})</option>
              </select>

              {/* Add GTK Button */}
              <button
                type="button"
                onClick={handleOpenInlineAdd}
                className="px-3 py-1.5 bg-[#164e63] hover:bg-cyan-800 text-white rounded-none font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah GTK / Guru</span>
              </button>
            </div>
          </div>

          {/* Table displaying GTK Details */}
          <div className="overflow-x-auto border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <th className="p-3 w-10 text-center">No</th>
                  <th className="p-3">Nama Pendidik & Tenaga Kependidikan</th>
                  <th className="p-3">NIP / NUPTK</th>
                  <th className="p-3">Unit Sekolah</th>
                  <th className="p-3 text-center">Status Kepegawaian</th>
                  <th className="p-3">Peran / Jabatan</th>
                  <th className="p-3 text-center">Status Akses</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGtkList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500 font-medium">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Users className="w-8 h-8 text-slate-300" />
                        <p className="font-bold text-slate-700">Tidak Ada Data GTK Ditemukan</p>
                        <p className="text-xs text-slate-500">Cobalah mengubah kata kunci pencarian atau pilihan filter kepegawaian.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredGtkList.map((item, idx) => {
                    const statusKategori = item.employmentStatus || 'Honorer';
                    const isAktif = item.status !== 'Nonaktif' && item.status !== 'BELUM AKTIF';

                    return (
                      <tr key={item.uid || idx} className="hover:bg-cyan-50/40 transition-colors">
                        <td className="p-3 text-center font-bold text-slate-400">
                          {idx + 1}
                        </td>

                        {/* Nama */}
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-none bg-[#164e63] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                              {item.name ? item.name.charAt(0).toUpperCase() : 'G'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800">{item.name}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{item.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* NIP / NUPTK */}
                        <td className="p-3 font-mono font-medium text-slate-700">
                          {item.nip || '-'}
                        </td>

                        {/* Unit Sekolah */}
                        <td className="p-3 font-semibold text-slate-700">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[180px]">{item.schoolName || 'SD Negeri 1 SIMAK'}</span>
                          </div>
                        </td>

                        {/* Status Kepegawaian (PPPK/PNS/Non-ASN/Honorer/GTY) */}
                        <td className="p-3 text-center">
                          <span className={`px-2.5 py-1 text-[10px] font-extrabold border ${
                            statusKategori === 'PNS'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : statusKategori === 'PPPK'
                              ? 'bg-cyan-100 text-[#164e63] border-cyan-300'
                              : statusKategori === 'GTY'
                              ? 'bg-purple-100 text-purple-900 border-purple-300'
                              : statusKategori === 'Non-ASN'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}>
                            {statusKategori === 'PNS' && '✓ PNS'}
                            {statusKategori === 'PPPK' && '✓ PPPK'}
                            {statusKategori === 'GTY' && '✓ GTY (Yayasan)'}
                            {statusKategori === 'Non-ASN' && '• Non-ASN'}
                            {statusKategori === 'Honorer' && '• Honorer'}
                          </span>
                        </td>

                        {/* Peran / Jabatan */}
                        <td className="p-3 font-bold text-slate-800">
                          {item.role || 'Guru Pengampu'}
                        </td>

                        {/* Status Akses */}
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 text-[10px] font-bold ${
                            isAktif ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {isAktif ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>

                        {/* Aksi */}
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenInlineEdit(item)}
                              title="Edit Data GTK"
                              className="px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white font-bold text-[11px] border border-amber-300 transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedUserForDelete(item);
                                setShowInlineDeleteModal(true);
                              }}
                              title="Hapus Akun GTK"
                              className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white font-bold text-[11px] border border-rose-300 transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <div>
              Menampilkan <span className="font-bold text-slate-800">{filteredGtkList.length}</span> dari total <span className="font-bold text-slate-800">{allGtkList.length}</span> GTK terdaftar.
            </div>
            {(searchQuery || schoolFilter !== 'Semua' || statusKepegawaianFilter !== 'Semua' || roleFilter !== 'Semua') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSchoolFilter('Semua');
                  setStatusKepegawaianFilter('Semua');
                  setRoleFilter('Semua');
                }}
                className="text-[#164e63] font-bold hover:underline cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: JURNAL MENGAJAR */}
      {activeTab === 'jurnal' && (
        <div className="bg-white p-5 rounded-none border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Rekapitulasi Jurnal Mengajar Harian Guru</h3>
              <p className="text-xs text-slate-500">Aktivitas pembelajaran, ketercapaian Tujuan Pembelajaran (TP), dan catatan kehadiran kelas.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingLogId(null);
                  setLogFormGuru(teacher?.name || 'Shahrur Robby, S.Pd.');
                  setLogFormMapel('Biologi');
                  setLogFormKelas('X-IPA 1');
                  setLogFormTgl(new Date().toISOString().split('T')[0]);
                  setLogFormJam('Jam Ke 1-2 (07.00 - 08.30)');
                  setLogFormTp('');
                  setLogFormHadir(32);
                  setLogFormAbsen(0);
                  setLogFormStatus('Tuntas');
                  setShowLogModal(true);
                }}
                className="px-3 py-1.5 bg-[#164e63] hover:bg-cyan-800 text-white rounded-none font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Input Jurnal Baru</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3">Tanggal & Jam</th>
                  <th className="p-3">Guru Pengampu</th>
                  <th className="p-3">Mata Pelajaran</th>
                  <th className="p-3">Kelas</th>
                  <th className="p-3">Tujuan Pembelajaran (TP) / Topik</th>
                  <th className="p-3 text-center">Kehadiran</th>
                  <th className="p-3 text-center">Status KBM</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachingLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-700 whitespace-nowrap">
                      <div>{log.tgl}</div>
                      <div className="text-[10px] text-slate-500">{log.jam}</div>
                    </td>
                    <td className="p-3 font-bold text-[#164e63]">{log.guru}</td>
                    <td className="p-3 font-semibold text-slate-800">{log.mapel}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-cyan-100 text-cyan-800 font-bold text-[10px]">
                        {log.kelas}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 max-w-xs truncate">{log.tp}</td>
                    <td className="p-3 text-center">
                      <span className="text-emerald-700 font-bold">{log.hadir} Hadir</span>
                      {log.absen > 0 && <span className="text-rose-600 font-bold ml-1">({log.absen} Absen)</span>}
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingLogId(log.id);
                            setLogFormGuru(log.guru);
                            setLogFormMapel(log.mapel);
                            setLogFormKelas(log.kelas);
                            setLogFormTgl(log.tgl);
                            setLogFormJam(log.jam);
                            setLogFormTp(log.tp);
                            setLogFormHadir(log.hadir);
                            setLogFormAbsen(log.absen);
                            setLogFormStatus(log.status);
                            setShowLogModal(true);
                          }}
                          title="Edit Jurnal"
                          className="px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white font-bold text-[11px] border border-amber-300 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLogToDelete(log);
                            setShowDeleteLogModal(true);
                          }}
                          title="Hapus Jurnal"
                          className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white font-bold text-[11px] border border-rose-300 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: UPLOAD MODUL / ATP */}
      {activeTab === 'uploadModul' && (
        <TeacherModuleUploadView teacher={teacher} registeredUsers={registeredUsers} />
      )}

      {/* TAB CONTENT 4: KELENGKAPAN ADMINISTRASI */}
      {activeTab === 'administrasi' && (
        <div className="bg-white p-5 rounded-none border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Supervisi & Audit Kelengkapan Perangkat Administrasi Guru</h3>
              <p className="text-xs text-slate-500">Standar pemenuhan dokumen RPP/Modul Ajar, ATP, KKTP, Buku Jurnal, dan Leger Nilai.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold">
                Tahun Ajaran 2026/2027
              </span>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3">Nama Guru</th>
                  <th className="p-3">NIP</th>
                  <th className="p-3">Unit Sekolah</th>
                  <th className="p-3 text-center">Status Kepegawaian</th>
                  <th className="p-3 text-center">Modul Ajar</th>
                  <th className="p-3 text-center">ATP</th>
                  <th className="p-3 text-center">KKTP</th>
                  <th className="p-3 text-center">Status Supervisi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allGtkList.map((item, idx) => (
                  <tr key={item.uid || idx} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-800">{item.name}</td>
                    <td className="p-3 text-slate-600 font-mono">{item.nip}</td>
                    <td className="p-3 font-semibold text-slate-700">{item.schoolName}</td>
                    <td className="p-3 text-center font-bold">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px]">
                        {item.employmentStatus}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold">✓ Terunggah</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold">✓ Terunggah</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold">✓ Terunggah</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        Lengkap (100%)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD GTK INLINE */}
      {showInlineAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-none shadow-2xl border border-slate-300 w-full max-w-md overflow-hidden flex flex-col">
            <div className="bg-[#164e63] text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-sm">Tambah Data GTK / Guru Baru</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInlineAddModal(false)}
                className="text-white/80 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveInlineAdd} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap GTK *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Drs. H. Bambang Susanto, M.Pd."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none focus:ring-2 focus:ring-cyan-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Resmi *</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="bambang@simakmerdeka.ai.studio"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none focus:ring-2 focus:ring-cyan-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIP / NUPTK</label>
                  <input
                    type="text"
                    value={formNip}
                    onChange={(e) => setFormNip(e.target.value)}
                    placeholder="19800101 200501 1 002"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none focus:ring-2 focus:ring-cyan-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Kepegawaian *</label>
                  <select
                    value={formEmploymentStatus}
                    onChange={(e) => setFormEmploymentStatus(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none focus:ring-2 focus:ring-cyan-600 focus:outline-none font-bold text-slate-800"
                  >
                    <option value="PNS">PNS (Pegawai Negeri Sipil)</option>
                    <option value="PPPK">PPPK (Pegawai Kontrak ASN)</option>
                    <option value="GTY">GTY (Guru Tetap Yayasan)</option>
                    <option value="Non-ASN">Non-ASN / Pegawai Tetap</option>
                    <option value="Honorer">Honorer / Guru Tidak Tetap</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Unit Sekolah *</label>
                <select
                  value={formSchool}
                  onChange={(e) => setFormSchool(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none focus:ring-2 focus:ring-cyan-600 focus:outline-none"
                >
                  {schoolOptions.map(sch => (
                    <option key={sch} value={sch}>{sch}</option>
                  ))}
                  {!schoolOptions.includes(formSchool) && <option value={formSchool}>{formSchool}</option>}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Peran / Jabatan *</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none focus:ring-2 focus:ring-cyan-600 focus:outline-none"
                  >
                    <option value="Guru Pengampu">Guru Pengampu</option>
                    <option value="Guru Kelas">Guru Kelas / Wali Kelas</option>
                    <option value="Guru BK">Guru BK (Bimbingan Konseling)</option>
                    <option value="Kepala Sekolah">Kepala Sekolah</option>
                    <option value="Kepala Tata Usaha / Staf TU">Staf Tata Usaha (TU)</option>
                    <option value="Wakasek Kesiswaan / Tim Kesiswaan">Wakasek Kesiswaan</option>
                    <option value="Tim Kurikulum / Pengelola KSP">Tim Kurikulum</option>
                    <option value="Pengelola Sarpras">Pengelola Sarpras</option>
                    <option value="Pustakawan / Pengelola Perpustakaan">Pustakawan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Akses</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none focus:ring-2 focus:ring-cyan-600 focus:outline-none"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                    <option value="Menunggu Aktivasi">Menunggu Aktivasi</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowInlineAddModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 rounded-none cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#164e63] hover:bg-cyan-800 text-white font-bold rounded-none cursor-pointer shadow-xs active:scale-95 transition-all"
                >
                  Simpan GTK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT GTK INLINE */}
      {showInlineEditModal && selectedUserForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-none shadow-2xl border border-slate-300 w-full max-w-md overflow-hidden flex flex-col">
            <div className="bg-[#164e63] text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm">Edit Data GTK ({selectedUserForEdit.name})</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInlineEditModal(false)}
                className="text-white/80 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveInlineEdit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap GTK *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none focus:ring-2 focus:ring-cyan-600 focus:outline-none font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Resmi *</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none focus:ring-2 focus:ring-cyan-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIP / NUPTK</label>
                  <input
                    type="text"
                    value={formNip}
                    onChange={(e) => setFormNip(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none focus:ring-2 focus:ring-cyan-600 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Kepegawaian *</label>
                  <select
                    value={formEmploymentStatus}
                    onChange={(e) => setFormEmploymentStatus(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none focus:ring-2 focus:ring-cyan-600 focus:outline-none font-bold text-slate-800"
                  >
                    <option value="PNS">PNS (Pegawai Negeri Sipil)</option>
                    <option value="PPPK">PPPK (Pegawai Kontrak ASN)</option>
                    <option value="GTY">GTY (Guru Tetap Yayasan)</option>
                    <option value="Non-ASN">Non-ASN / Pegawai Tetap</option>
                    <option value="Honorer">Honorer / Guru Tidak Tetap</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Unit Sekolah *</label>
                <select
                  value={formSchool}
                  onChange={(e) => setFormSchool(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none focus:ring-2 focus:ring-cyan-600 focus:outline-none"
                >
                  {schoolOptions.map(sch => (
                    <option key={sch} value={sch}>{sch}</option>
                  ))}
                  {!schoolOptions.includes(formSchool) && <option value={formSchool}>{formSchool}</option>}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Peran / Jabatan *</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none focus:ring-2 focus:ring-cyan-600 focus:outline-none"
                  >
                    <option value="Guru Pengampu">Guru Pengampu</option>
                    <option value="Guru Kelas">Guru Kelas / Wali Kelas</option>
                    <option value="Guru BK">Guru BK (Bimbingan Konseling)</option>
                    <option value="Kepala Sekolah">Kepala Sekolah</option>
                    <option value="Kepala Tata Usaha / Staf TU">Staf Tata Usaha (TU)</option>
                    <option value="Wakasek Kesiswaan / Tim Kesiswaan">Wakasek Kesiswaan</option>
                    <option value="Tim Kurikulum / Pengelola KSP">Tim Kurikulum</option>
                    <option value="Pengelola Sarpras">Pengelola Sarpras</option>
                    <option value="Pustakawan / Pengelola Perpustakaan">Pustakawan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Akses</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none focus:ring-2 focus:ring-cyan-600 focus:outline-none"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                    <option value="Menunggu Aktivasi">Menunggu Aktivasi</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowInlineEditModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 rounded-none cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#164e63] hover:bg-cyan-800 text-white font-bold rounded-none cursor-pointer shadow-xs active:scale-95 transition-all"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION INLINE */}
      {showInlineDeleteModal && selectedUserForDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-none shadow-2xl border border-slate-300 w-full max-w-sm overflow-hidden flex flex-col">
            <div className="bg-rose-700 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                <h3 className="font-bold text-sm">Konfirmasi Hapus Akun GTK</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInlineDeleteModal(false)}
                className="text-white/80 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs">
              <p className="text-slate-700">
                Apakah Anda yakin ingin menghapus akun GTK ini dari database?
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800">{selectedUserForDelete.name}</div>
                <div className="text-slate-600 font-mono">{selectedUserForDelete.email}</div>
                <div className="text-slate-500 text-[11px]">{selectedUserForDelete.schoolName} • {selectedUserForDelete.role}</div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowInlineDeleteModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 rounded-none cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmInlineDelete}
                  className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-none cursor-pointer shadow-xs active:scale-95 transition-all"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LOG DELETE */}
      {showDeleteLogModal && logToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-none shadow-2xl border border-slate-300 w-full max-w-sm overflow-hidden flex flex-col">
            <div className="bg-rose-700 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                <h3 className="font-bold text-sm">Konfirmasi Hapus Jurnal</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteLogModal(false)}
                className="text-white/80 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs">
              <p className="text-slate-700">
                Apakah Anda yakin ingin menghapus catatan jurnal mengajar ini?
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800">{logToDelete.guru}</div>
                <div className="text-slate-600">{logToDelete.mapel} ({logToDelete.kelas})</div>
                <div className="text-slate-500 text-[11px]">{logToDelete.tgl} • {logToDelete.jam}</div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowDeleteLogModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 rounded-none cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (logToDelete) {
                      setTeachingLogs(prev => prev.filter(l => l.id !== logToDelete.id));
                      setShowDeleteLogModal(false);
                      setLogToDelete(null);
                    }
                  }}
                  className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-none cursor-pointer shadow-xs active:scale-95 transition-all"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
