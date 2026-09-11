import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  ArrowRightLeft,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  ExternalLink,
  Sparkles,
  Award,
  Clock,
  ShieldCheck,
  FolderOpen,
  Send,
  Database,
  FileText,
  Edit3,
  Trash2,
  X,
  Save,
  GraduationCap,
  Briefcase,
  Settings,
  UserPlus,
  KeyRound
} from 'lucide-react';
import { UserAccount, TeacherProfile } from '../../types';
import {
  saveBukuIndukPegawaiToFirebase,
  subscribeToBukuIndukPegawai,
  saveMutasiSiswaToFirebase,
  subscribeToMutasiSiswa,
  saveRegisteredUsersToFirebase
} from '../../lib/firebaseService';

export interface PegawaiBukuInduk {
  id: string;
  nama: string;
  nip: string;
  nuptk: string;
  status: string;
  jabatan: string;
  tugas: string;
  kategori?: 'Guru' | 'Pegawai TU' | 'Tenaga Kependidikan';
  keaktifan?: 'Aktif' | 'Cuti' | 'Pensiun' | 'Tugas Belajar';
}

export interface MutasiSiswaItem {
  id: string;
  noSurat: string;
  nama: string;
  nisn: string;
  asal: string;
  tujuan: string;
  jenis: 'Mutasi Masuk' | 'Mutasi Keluar';
  tgl: string;
  status: string;
  keterangan?: string;
}

interface AdministrationSystemViewProps {
  registeredUsers: UserAccount[];
  teacher?: TeacherProfile;
  onNavigateTab?: (tab: string) => void;
  onUpdateRegisteredUsers?: (users: UserAccount[]) => void;
  onOpenAddUserModal?: (defaultRole: string) => void;
  onOpenEditUserModal?: (user: UserAccount) => void;
  onOpenDeleteUserModal?: (user: UserAccount) => void;
  onOpenModuleModal?: (user: UserAccount, tab: any) => void;
  onSelectCategory?: (category: 'Semua' | 'Kurikulum' | 'Guru' | 'TU' | 'Siswa') => void;
}

export const AdministrationSystemView: React.FC<AdministrationSystemViewProps> = ({
  registeredUsers,
  teacher,
  onNavigateTab,
  onUpdateRegisteredUsers,
  onOpenAddUserModal,
  onOpenEditUserModal,
  onOpenDeleteUserModal,
  onOpenModuleModal,
  onSelectCategory
}) => {
  const [activeTab, setActiveTab] = useState<'bukuInduk' | 'mutasi' | 'staf'>('bukuInduk');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterKategori, setFilterKategori] = useState<string>('Semua');

  // Filter TU / Admin staff
  const tuUsers = registeredUsers.filter(u => {
    const r = (u.role || '').toLowerCase();
    return r.includes('tu') || r.includes('tata usaha') || r.includes('operator') || r.includes('administrasi') || r.includes('staf') || r.includes('staff');
  });

  // Initial Default Pegawai List
  const initialPegawaiList: PegawaiBukuInduk[] = [
    { id: 'gtk-1', nama: 'Drs. H. Bambang Sudirman, M.M.', nip: '19710510 199803 1 002', nuptk: '4532749651200032', status: 'PNS (Pembina / IV-a)', jabatan: 'Kepala Tata Usaha', tugas: 'Koordinator Administrasi & Keuangan', kategori: 'Pegawai TU', keaktifan: 'Aktif' },
    { id: 'gtk-2', nama: 'Endang Wahyuni, S.AP.', nip: '19840215 200902 2 004', nuptk: '7845762663300012', status: 'PNS (Penata / III-c)', jabatan: 'Pengadministrasi Kepegawaian', tugas: 'Pengelolaan Kenaikan Gaji Berkala & SKP', kategori: 'Pegawai TU', keaktifan: 'Aktif' },
    { id: 'gtk-3', nama: 'Riyan Hidayat, S.Kom.', nip: '19950820 202221 1 003', nuptk: '9845773674130089', status: 'PPPK (Ahli Pertama)', jabatan: 'Operator Dapodik / IT', tugas: 'Sinkronisasi Data Pokok & Validasi NISN', kategori: 'Pegawai TU', keaktifan: 'Aktif' },
    { id: 'gtk-4', nama: 'Fitri Handayani, A.Md.', nip: '-', nuptk: '-', status: 'Tenaga Honorer / PTT', jabatan: 'Administrasi Kesiswaan', tugas: 'Buku Induk Siswa & Mutasi Peserta Didik', kategori: 'Pegawai TU', keaktifan: 'Aktif' },
    { id: 'gtk-5', nama: teacher?.name || 'Shahrur Robby, S.Pd.', nip: teacher?.nip || '19900101 201501 1 001', nuptk: '3445768669130045', status: 'PNS (Penata Tk.I / III-d)', jabatan: 'Guru Madya / Wali Kelas', tugas: 'Pengajar Biologi & Wali Kelas X-IPA 1', kategori: 'Guru', keaktifan: 'Aktif' }
  ];

  // Initialize and persist Pegawai Buku Induk
  const [pegawaiList, setPegawaiList] = useState<PegawaiBukuInduk[]>(() => {
    const saved = localStorage.getItem('simak_buku_induk_pegawai');
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Error loading buku induk pegawai:', e);
      }
    }
    try {
      localStorage.setItem('simak_buku_induk_pegawai', JSON.stringify(initialPegawaiList));
    } catch (e) {}
    return initialPegawaiList;
  });

  // Subscribe to Firebase Firestore for real-time syncing of Buku Induk Pegawai
  useEffect(() => {
    const unsubscribe = subscribeToBukuIndukPegawai((items) => {
      if (Array.isArray(items)) {
        setPegawaiList(items);
        localStorage.setItem('simak_buku_induk_pegawai', JSON.stringify(items));
      }
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Modal State for Tambah/Edit Data Buku Induk
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PegawaiBukuInduk | null>(null);
  const [formData, setFormData] = useState({
    nama: '',
    nip: '',
    nuptk: '',
    status: 'PNS (Penata / III-c)',
    jabatan: '',
    tugas: '',
    kategori: 'Guru' as 'Guru' | 'Pegawai TU' | 'Tenaga Kependidikan',
    keaktifan: 'Aktif' as 'Aktif' | 'Cuti' | 'Pensiun' | 'Tugas Belajar'
  });
  const [formError, setFormError] = useState<string>('');

  const savePegawaiList = (newList: PegawaiBukuInduk[]) => {
    setPegawaiList(newList);
    localStorage.setItem('simak_buku_induk_pegawai', JSON.stringify(newList));
    saveBukuIndukPegawaiToFirebase(newList);
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      nama: '',
      nip: '',
      nuptk: '',
      status: 'PNS (Penata / III-c)',
      jabatan: '',
      tugas: '',
      kategori: 'Guru',
      keaktifan: 'Aktif'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: PegawaiBukuInduk) => {
    setEditingId(item.id);
    setFormData({
      nama: item.nama,
      nip: item.nip === '-' ? '' : item.nip,
      nuptk: item.nuptk === '-' ? '' : item.nuptk,
      status: item.status,
      jabatan: item.jabatan,
      tugas: item.tugas,
      kategori: item.kategori || 'Guru',
      keaktifan: item.keaktifan || 'Aktif'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSavePegawai = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim()) {
      setFormError('Nama Pegawai / Guru wajib diisi.');
      return;
    }

    const payload: PegawaiBukuInduk = {
      id: editingId || `gtk-${Date.now()}`,
      nama: formData.nama.trim(),
      nip: formData.nip.trim() || '-',
      nuptk: formData.nuptk.trim() || '-',
      status: formData.status.trim() || 'Tenaga Honorer / PTT',
      jabatan: formData.jabatan.trim() || (formData.kategori === 'Guru' ? 'Guru Pengampu' : 'Staf Administrasi'),
      tugas: formData.tugas.trim() || 'Tugas Pokok & Fungsi Satuan Pendidikan',
      kategori: formData.kategori,
      keaktifan: formData.keaktifan
    };

    let updated: PegawaiBukuInduk[];
    if (editingId) {
      updated = pegawaiList.map(p => p.id === editingId ? payload : p);
    } else {
      updated = [payload, ...pegawaiList];
    }

    savePegawaiList(updated);
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const updated = pegawaiList.filter(p => p.id !== deleteTarget.id);
    savePegawaiList(updated);
    setDeleteTarget(null);
  };

  // Initial Mutasi Siswa List with Persistence & Firebase
  const initialMutasiList: MutasiSiswaItem[] = [
    { id: 'mut-1', noSurat: '421.3/089/SMA.01/2026', nama: 'Muhammad Farhan', nisn: '0071829350', asal: 'SMA Negeri 1 Indonesia', tujuan: 'SMA Negeri 3 Bandung', jenis: 'Mutasi Keluar', tgl: '2026-08-15', status: 'Selesai & Disetujui' },
    { id: 'mut-2', noSurat: '421.3/094/SMA.01/2026', nama: 'Aulia Rahmadani', nisn: '0081234991', asal: 'SMA Taruna Nusantara Magelang', tujuan: 'SMA Negeri 1 Indonesia', jenis: 'Mutasi Masuk', tgl: '2026-08-10', status: 'Selesai & Disetujui' },
    { id: 'mut-3', noSurat: '421.3/102/SMA.01/2026', nama: 'Dimas Prasetyo', nisn: '0079981234', asal: 'SMA Negeri 1 Indonesia', tujuan: 'SMA Negeri 5 Surabaya', jenis: 'Mutasi Keluar', tgl: '2026-08-05', status: 'Selesai & Disetujui' }
  ];

  const [mutasiList, setMutasiList] = useState<MutasiSiswaItem[]>(() => {
    const saved = localStorage.getItem('simak_mutasi_siswa');
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Error loading mutasi siswa:', e);
      }
    }
    try {
      localStorage.setItem('simak_mutasi_siswa', JSON.stringify(initialMutasiList));
    } catch (e) {}
    return initialMutasiList;
  });

  useEffect(() => {
    const unsubscribe = subscribeToMutasiSiswa((items) => {
      if (Array.isArray(items)) {
        setMutasiList(items);
        localStorage.setItem('simak_mutasi_siswa', JSON.stringify(items));
      }
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const [isMutasiModalOpen, setIsMutasiModalOpen] = useState<boolean>(false);
  const [editingMutasiId, setEditingMutasiId] = useState<string | null>(null);
  const [deleteMutasiTarget, setDeleteMutasiTarget] = useState<MutasiSiswaItem | null>(null);
  const [mutasiFormData, setMutasiFormData] = useState({
    noSurat: '',
    nama: '',
    nisn: '',
    asal: '',
    tujuan: '',
    jenis: 'Mutasi Keluar' as 'Mutasi Masuk' | 'Mutasi Keluar',
    tgl: new Date().toISOString().slice(0, 10),
    status: 'Selesai & Disetujui'
  });
  const [mutasiFormError, setMutasiFormError] = useState<string>('');

  const saveMutasiList = (newList: MutasiSiswaItem[]) => {
    setMutasiList(newList);
    localStorage.setItem('simak_mutasi_siswa', JSON.stringify(newList));
    saveMutasiSiswaToFirebase(newList);
  };

  const handleOpenAddMutasiModal = () => {
    setEditingMutasiId(null);
    setMutasiFormData({
      noSurat: `421.3/${Math.floor(100 + Math.random() * 900)}/TU.01/${new Date().getFullYear()}`,
      nama: '',
      nisn: '',
      asal: teacher?.schoolName || 'SD Negeri 1 SIMAK',
      tujuan: '',
      jenis: 'Mutasi Keluar',
      tgl: new Date().toISOString().slice(0, 10),
      status: 'Selesai & Disetujui'
    });
    setMutasiFormError('');
    setIsMutasiModalOpen(true);
  };

  const handleSaveMutasi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mutasiFormData.nama.trim()) {
      setMutasiFormError('Nama siswa wajib diisi.');
      return;
    }

    const payload: MutasiSiswaItem = {
      id: editingMutasiId || `mut-${Date.now()}`,
      noSurat: mutasiFormData.noSurat.trim() || `421.3/MUT/${Date.now()}`,
      nama: mutasiFormData.nama.trim(),
      nisn: mutasiFormData.nisn.trim() || '-',
      asal: mutasiFormData.asal.trim() || (teacher?.schoolName || 'SD Negeri 1 SIMAK'),
      tujuan: mutasiFormData.tujuan.trim() || 'Satuan Pendidikan Tujuan',
      jenis: mutasiFormData.jenis,
      tgl: mutasiFormData.tgl,
      status: mutasiFormData.status
    };

    let updated: MutasiSiswaItem[];
    if (editingMutasiId) {
      updated = mutasiList.map(m => m.id === editingMutasiId ? payload : m);
    } else {
      updated = [payload, ...mutasiList];
    }
    saveMutasiList(updated);
    setIsMutasiModalOpen(false);
  };

  const handleConfirmDeleteMutasi = () => {
    if (!deleteMutasiTarget) return;
    const updated = mutasiList.filter(m => m.id !== deleteMutasiTarget.id);
    saveMutasiList(updated);
    setDeleteMutasiTarget(null);
  };

  // Staf TU Account Internal Modals & Management
  const [showAddUserModalInternal, setShowAddUserModalInternal] = useState<boolean>(false);
  const [showEditUserModalInternal, setShowEditUserModalInternal] = useState<boolean>(false);
  const [showDeleteUserModalInternal, setShowDeleteUserModalInternal] = useState<boolean>(false);
  const [selectedUserInternal, setSelectedUserInternal] = useState<UserAccount | null>(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    nip: '',
    role: 'Tata Usaha (TU)',
    schoolName: teacher?.schoolName || 'SD Negeri 1 SIMAK',
    status: 'Aktif' as 'Aktif' | 'Nonaktif' | 'Maintenance'
  });

  const handleAddUserClick = () => {
    if (onOpenAddUserModal) {
      onOpenAddUserModal('Tata Usaha (TU)');
    } else {
      setUserFormData({
        name: '',
        email: '',
        password: '',
        nip: '',
        role: 'Tata Usaha (TU)',
        schoolName: teacher?.schoolName || 'SD Negeri 1 SIMAK',
        status: 'Aktif'
      });
      setShowAddUserModalInternal(true);
    }
  };

  const handleEditUserClick = (user: UserAccount) => {
    if (onOpenEditUserModal) {
      onOpenEditUserModal(user);
    } else {
      setSelectedUserInternal(user);
      setUserFormData({
        name: user.name,
        email: user.email,
        password: user.password || '',
        nip: user.nip || '',
        role: user.role,
        schoolName: user.schoolName || teacher?.schoolName || 'SD Negeri 1 SIMAK',
        status: user.status || 'Aktif'
      });
      setShowEditUserModalInternal(true);
    }
  };

  const handleDeleteUserClick = (user: UserAccount) => {
    if (onOpenDeleteUserModal) {
      onOpenDeleteUserModal(user);
    } else {
      setSelectedUserInternal(user);
      setShowDeleteUserModalInternal(true);
    }
  };

  const handleSaveUserInternal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.name.trim() || !userFormData.email.trim()) return;

    if (showEditUserModalInternal && selectedUserInternal) {
      const updatedUsers = registeredUsers.map(u => {
        if (u.uid === selectedUserInternal.uid || u.email.toLowerCase() === selectedUserInternal.email.toLowerCase()) {
          return {
            ...u,
            name: userFormData.name.trim(),
            email: userFormData.email.trim(),
            nip: userFormData.nip.trim(),
            role: userFormData.role,
            schoolName: userFormData.schoolName,
            status: userFormData.status,
            password: userFormData.password || u.password
          };
        }
        return u;
      });
      localStorage.setItem('simak_registered_users', JSON.stringify(updatedUsers));
      saveRegisteredUsersToFirebase(updatedUsers);
      if (onUpdateRegisteredUsers) onUpdateRegisteredUsers(updatedUsers);
      setShowEditUserModalInternal(false);
      setSelectedUserInternal(null);
    } else {
      const newUser: UserAccount = {
        uid: `user-tu-${Date.now()}`,
        name: userFormData.name.trim(),
        email: userFormData.email.trim(),
        password: userFormData.password || 'password123',
        nip: userFormData.nip.trim(),
        role: userFormData.role,
        schoolName: userFormData.schoolName,
        status: userFormData.status
      };
      const updatedUsers = [newUser, ...registeredUsers];
      localStorage.setItem('simak_registered_users', JSON.stringify(updatedUsers));
      saveRegisteredUsersToFirebase(updatedUsers);
      if (onUpdateRegisteredUsers) onUpdateRegisteredUsers(updatedUsers);
      setShowAddUserModalInternal(false);
    }
  };

  const handleConfirmDeleteUserInternal = () => {
    if (!selectedUserInternal) return;
    const targetUid = selectedUserInternal.uid;
    const targetEmail = (selectedUserInternal.email || '').trim().toLowerCase();
    const targetName = (selectedUserInternal.name || '').trim().toLowerCase();

    const updatedUsers = registeredUsers.filter(u => {
      if (targetUid && u.uid && u.uid === targetUid) return false;
      if (targetEmail && u.email && u.email.trim().toLowerCase() === targetEmail) return false;
      if (targetName && u.name && u.name.trim().toLowerCase() === targetName && u.nip && u.nip === selectedUserInternal.nip) return false;
      return true;
    });

    localStorage.setItem('simak_registered_users', JSON.stringify(updatedUsers));
    saveRegisteredUsersToFirebase(updatedUsers);
    if (onUpdateRegisteredUsers) {
      onUpdateRegisteredUsers(updatedUsers);
    }
    setShowDeleteUserModalInternal(false);
    setSelectedUserInternal(null);
  };

  const filteredPegawai = pegawaiList.filter(p => {
    const matchSearch = p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nip.includes(searchQuery) ||
      p.nuptk.includes(searchQuery) ||
      p.jabatan.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterKategori === 'Semua') return matchSearch;
    if (filterKategori === 'Guru') return matchSearch && (p.kategori === 'Guru' || p.jabatan.toLowerCase().includes('guru'));
    if (filterKategori === 'TU') return matchSearch && (p.kategori === 'Pegawai TU' || p.kategori === 'Tenaga Kependidikan' || !p.jabatan.toLowerCase().includes('guru'));
    return matchSearch;
  });

  const handleExportBukuInduk = () => {
    const headers = ['Nama Pegawai / Guru', 'NIP', 'NUPTK', 'Kategori', 'Status Kepegawaian', 'Jabatan', 'Uraian Tugas', 'Keaktifan'];
    const rows = pegawaiList.map(p => [p.nama, p.nip, p.nuptk, p.kategori || '-', p.status, p.jabatan, p.tugas, p.keaktifan || 'Aktif']);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.map(i => `"${i}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Buku_Induk_Kepegawaian_Guru_TU_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards for TU */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-none border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-cyan-50 text-[#164e63] rounded-none shrink-0">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Buku Induk GTK</div>
            <div className="text-xl font-black text-slate-800">{pegawaiList.length} <span className="text-xs font-semibold text-slate-500">Pegawai & Guru</span></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-none border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-none shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Staf TU & Operator</div>
            <div className="text-xl font-black text-slate-800">{tuUsers.length || 1} <span className="text-xs font-semibold text-slate-500">Personil</span></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-none border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-none shrink-0">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Layanan Mutasi</div>
            <div className="text-xl font-black text-indigo-700">{mutasiList.length} <span className="text-xs font-semibold text-slate-500">Berkas</span></div>
          </div>
        </div>
      </div>

      {/* Subsystem Navigation Tabs (Single Row) */}
      <div className="flex items-center border-b border-slate-200 bg-white px-2 pt-2 gap-1 md:gap-2 overflow-x-auto flex-nowrap">
        <button
          type="button"
          onClick={() => setActiveTab('bukuInduk')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'bukuInduk'
              ? 'border-amber-600 text-amber-800 bg-amber-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          <span>Buku Induk Pegawai & Guru ({pegawaiList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('mutasi')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'mutasi'
              ? 'border-amber-600 text-amber-800 bg-amber-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Layanan Mutasi Siswa & Surat Keterangan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('staf')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'staf'
              ? 'border-amber-600 text-amber-800 bg-amber-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Akun Staf TU & Operator ({tuUsers.length})</span>
        </button>

        {onNavigateTab && (
          <button
            type="button"
            onClick={() => onNavigateTab('settings')}
            className="px-3.5 py-2.5 text-xs font-bold border-b-2 border-transparent text-slate-600 hover:text-amber-800 hover:bg-slate-50 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ml-auto"
            title="Buka Pengaturan Sistem"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span className="border-b border-slate-400/80 pb-0.5">Pengaturan</span>
          </button>
        )}
      </div>

      {/* TAB CONTENT: BUKU INDUK PEGAWAI */}
      {activeTab === 'bukuInduk' && (
        <div className="bg-white p-5 rounded-none border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-amber-700" />
                <span>Buku Induk Data Pendidik & Tenaga Kependidikan (GTK)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Arsip kepegawaian resmi sekolah memuat identitas ASN/Non-ASN, NIP, NUPTK, jabatan struktural, dan beban tugas pokok.
              </p>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="px-3 py-1.5 bg-[#164e63] hover:bg-cyan-800 text-white rounded-none font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Data Pegawai & Guru</span>
              </button>
            </div>
          </div>

          {/* Filters and Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 border border-slate-200">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-600 shrink-0">Filter Kategori:</span>
              <div className="flex items-center gap-1">
                {(['Semua', 'Guru', 'TU'] as const).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFilterKategori(cat)}
                    className={`px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                      filterKategori === cat
                        ? 'bg-amber-700 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, NIP, NUPTK, jabatan..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 text-xs rounded-none focus:outline-none focus:ring-1 focus:ring-amber-600"
              />
            </div>
          </div>

          {/* Table of Buku Induk */}
          <div className="overflow-x-auto border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3 w-12 text-center">No</th>
                  <th className="p-3">Nama Pegawai & Gelar</th>
                  <th className="p-3">NIP & NUPTK</th>
                  <th className="p-3">Kategori & Status</th>
                  <th className="p-3">Jabatan Resmi</th>
                  <th className="p-3">Uraian Tugas Pokok</th>
                  <th className="p-3 text-center">Keaktifan</th>
                  <th className="p-3 text-center">Aksi Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPegawai.length > 0 ? (
                  filteredPegawai.map((pegawai, index) => (
                    <tr key={pegawai.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="p-3 text-center font-mono text-slate-500">{index + 1}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{pegawai.nama}</div>
                        <div className="text-[11px] text-slate-500 font-medium">{pegawai.jabatan}</div>
                      </td>
                      <td className="p-3 font-mono text-slate-600 space-y-0.5">
                        <div className="text-[11px]"><span className="text-slate-400">NIP:</span> {pegawai.nip}</div>
                        <div className="text-[11px]"><span className="text-slate-400">NUPTK:</span> {pegawai.nuptk}</div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 font-bold text-[10px] rounded-none ${
                            pegawai.kategori === 'Guru' ? 'bg-cyan-100 text-cyan-800' : 'bg-amber-100 text-amber-900'
                          }`}>
                            {pegawai.kategori || 'Pegawai TU'}
                          </span>
                          <span className="text-slate-700 text-[11px] font-medium">
                            {pegawai.status}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 font-bold text-slate-800">{pegawai.jabatan}</td>
                      <td className="p-3 text-slate-600 max-w-xs">{pegawai.tugas}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 font-bold text-[10px] rounded-none ${
                          pegawai.keaktifan === 'Aktif' || !pegawai.keaktifan
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {pegawai.keaktifan || 'Aktif'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(pegawai)}
                            title="Edit Data Pegawai / Guru"
                            className="p-1.5 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white border border-amber-200 rounded-none transition-all cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(pegawai)}
                            title="Hapus Data Pegawai / Guru"
                            className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 rounded-none transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">
                      Tidak ada data pegawai / guru yang sesuai dengan pencarian atau filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH / EDIT DATA BUKU INDUK */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-2xl rounded-none shadow-2xl border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="bg-[#164e63] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-none border border-white/20">
                  <FolderOpen className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-wide">
                    {editingId ? 'Edit Data Buku Induk Pegawai & Guru' : 'Tambah Entri Buku Induk Baru'}
                  </h3>
                  <p className="text-[11px] text-cyan-100">Buku Induk Tenaga Pendidik & Kependidikan (GTK)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-white/20 rounded-none text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePegawai} className="p-5 space-y-4 overflow-y-auto text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-bold text-slate-700">
                    Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Contoh: Drs. H. Bambang Sudirman, M.M."
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none focus:outline-none focus:ring-2 focus:ring-[#164e63]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Kategori GTK</label>
                  <select
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none focus:outline-none focus:ring-2 focus:ring-[#164e63]"
                  >
                    <option value="Guru">Guru / Tenaga Pendidik</option>
                    <option value="Pegawai TU">Pegawai Tata Usaha</option>
                    <option value="Tenaga Kependidikan">Tenaga Kependidikan Lainnya</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Status Kepegawaian</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none focus:outline-none focus:ring-2 focus:ring-[#164e63]"
                  >
                    <option value="PNS (Pembina / IV-a)">PNS (Pembina / IV-a)</option>
                    <option value="PNS (Penata Tk.I / III-d)">PNS (Penata Tk.I / III-d)</option>
                    <option value="PNS (Penata / III-c)">PNS (Penata / III-c)</option>
                    <option value="PNS (Penata Muda / III-a)">PNS (Penata Muda / III-a)</option>
                    <option value="PPPK (Ahli Pertama)">PPPK (Ahli Pertama)</option>
                    <option value="PPPK (Terampil)">PPPK (Terampil)</option>
                    <option value="Guru Tetap Yayasan (GTY)">Guru Tetap Yayasan (GTY)</option>
                    <option value="Guru Tidak Tetap (GTT)">Guru Tidak Tetap (GTT)</option>
                    <option value="Tenaga Honorer / PTT">Tenaga Honorer / PTT</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">NIP (Nomor Induk Pegawai)</label>
                  <input
                    type="text"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    placeholder="Contoh: 19710510 199803 1 002 (atau - jika belum ada)"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none focus:outline-none focus:ring-2 focus:ring-[#164e63] font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">NUPTK</label>
                  <input
                    type="text"
                    value={formData.nuptk}
                    onChange={(e) => setFormData({ ...formData, nuptk: e.target.value })}
                    placeholder="Contoh: 4532749651200032 (atau - jika belum ada)"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none focus:outline-none focus:ring-2 focus:ring-[#164e63] font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Jabatan Resmi</label>
                  <input
                    type="text"
                    value={formData.jabatan}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    placeholder="Contoh: Kepala Tata Usaha / Guru Biologi"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none focus:outline-none focus:ring-2 focus:ring-[#164e63]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Status Keaktifan</label>
                  <select
                    value={formData.keaktifan}
                    onChange={(e) => setFormData({ ...formData, keaktifan: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none focus:outline-none focus:ring-2 focus:ring-[#164e63]"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Cuti">Cuti</option>
                    <option value="Pensiun">Pensiun</option>
                    <option value="Tugas Belajar">Tugas Belajar</option>
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-bold text-slate-700">
                    Uraian Tugas Pokok & Fungsi (Tupoksi)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.tugas}
                    onChange={(e) => setFormData({ ...formData, tugas: e.target.value })}
                    placeholder="Contoh: Pengajar Biologi & Wali Kelas X-IPA 1 / Pengelolaan Kenaikan Pangkat & SKP"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none focus:outline-none focus:ring-2 focus:ring-[#164e63]"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-100 rounded-none transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#164e63] text-white font-bold hover:bg-cyan-800 rounded-none flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingId ? 'Simpan Perubahan' : 'Simpan Data Baru'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS BUKU INDUK */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-none shadow-2xl border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-rose-700 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-none border border-white/20">
                  <Trash2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-wide">Konfirmasi Hapus Data</h3>
                  <p className="text-[11px] text-rose-100">Buku Induk Tenaga Pendidik & Kependidikan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="p-1 hover:bg-white/20 rounded-none text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-700 leading-relaxed">
                Apakah Anda yakin ingin menghapus data buku induk <strong className="text-slate-900 font-bold">{deleteTarget.nama}</strong> ({deleteTarget.jabatan})?
              </p>
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Tindakan ini akan menghapus entri dari buku induk kepegawaian sekolah secara permanen.</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 border border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-100 rounded-none transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-rose-700 text-white font-bold hover:bg-rose-800 rounded-none flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Ya, Hapus Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: MUTASI SISWA */}
      {activeTab === 'mutasi' && (
        <div className="bg-white p-5 rounded-none border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Layanan Administrasi Mutasi Masuk & Keluar Siswa</h3>
              <p className="text-xs text-slate-500">Penerbitan surat keterangan pindah sekolah, validasi berkas dapodik, dan buku mutasi peserta didik.</p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddMutasiModal}
              className="px-3 py-1.5 bg-[#164e63] hover:bg-cyan-800 text-white rounded-none font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Proses Mutasi Baru</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3">No. Surat Keterangan</th>
                  <th className="p-3">Nama Siswa</th>
                  <th className="p-3">NISN</th>
                  <th className="p-3">Sekolah Asal</th>
                  <th className="p-3">Sekolah Tujuan</th>
                  <th className="p-3 text-center">Jenis Mutasi</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mutasiList.length > 0 ? (
                  mutasiList.map(item => (
                    <tr key={item.id || item.noSurat} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-700">{item.noSurat}</td>
                      <td className="p-3 font-bold text-slate-800">{item.nama}</td>
                      <td className="p-3 font-mono text-slate-600">{item.nisn}</td>
                      <td className="p-3 text-slate-700">{item.asal}</td>
                      <td className="p-3 text-slate-700">{item.tujuan}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 font-bold text-[10px] rounded-none ${
                          item.jenis === 'Mutasi Masuk' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.jenis}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 bg-cyan-100 text-cyan-800 font-bold text-[10px] rounded-none">
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => setDeleteMutasiTarget(item)}
                          title="Hapus Rekod Mutasi"
                          className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 rounded-none transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-500">
                      Belum ada catatan mutasi siswa. Klik "Proses Mutasi Baru" untuk menambahkan berkas mutasi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH MUTASI */}
      {isMutasiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-none shadow-2xl border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#164e63] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-none border border-white/20">
                  <ArrowRightLeft className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-wide">Proses Berkas Mutasi Siswa</h3>
                  <p className="text-[11px] text-cyan-100">Penerbitan Surat Keterangan Pindah</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMutasiModalOpen(false)}
                className="p-1 hover:bg-white/20 rounded-none text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMutasi} className="p-5 space-y-4 text-xs">
              {mutasiFormError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{mutasiFormError}</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nomor Surat Keterangan</label>
                  <input
                    type="text"
                    required
                    value={mutasiFormData.noSurat}
                    onChange={(e) => setMutasiFormData({ ...mutasiFormData, noSurat: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none font-mono focus:outline-none focus:ring-1 focus:ring-[#164e63]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Siswa <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={mutasiFormData.nama}
                    onChange={(e) => setMutasiFormData({ ...mutasiFormData, nama: e.target.value })}
                    placeholder="Nama lengkap peserta didik..."
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none focus:outline-none focus:ring-1 focus:ring-[#164e63]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">NISN</label>
                    <input
                      type="text"
                      value={mutasiFormData.nisn}
                      onChange={(e) => setMutasiFormData({ ...mutasiFormData, nisn: e.target.value })}
                      placeholder="007xxxxxxx"
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none font-mono focus:outline-none focus:ring-1 focus:ring-[#164e63]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Jenis Mutasi</label>
                    <select
                      value={mutasiFormData.jenis}
                      onChange={(e) => setMutasiFormData({ ...mutasiFormData, jenis: e.target.value as any })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none focus:outline-none focus:ring-1 focus:ring-[#164e63]"
                    >
                      <option value="Mutasi Keluar">Mutasi Keluar</option>
                      <option value="Mutasi Masuk">Mutasi Masuk</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Sekolah Asal</label>
                    <input
                      type="text"
                      value={mutasiFormData.asal}
                      onChange={(e) => setMutasiFormData({ ...mutasiFormData, asal: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none focus:outline-none focus:ring-1 focus:ring-[#164e63]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Sekolah Tujuan</label>
                    <input
                      type="text"
                      value={mutasiFormData.tujuan}
                      onChange={(e) => setMutasiFormData({ ...mutasiFormData, tujuan: e.target.value })}
                      placeholder="Nama sekolah tujuan..."
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none focus:outline-none focus:ring-1 focus:ring-[#164e63]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMutasiModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-100 rounded-none transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#164e63] text-white font-bold hover:bg-cyan-800 rounded-none flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Berkas</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS MUTASI */}
      {deleteMutasiTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-none shadow-2xl border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-rose-700 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-5 h-5 text-white" />
                <h3 className="text-sm font-bold tracking-wide">Hapus Data Mutasi Siswa</h3>
              </div>
              <button
                type="button"
                onClick={() => setDeleteMutasiTarget(null)}
                className="p-1 hover:bg-white/20 rounded-none text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-700 leading-relaxed">
                Apakah Anda yakin ingin menghapus berkas mutasi siswa <strong className="text-slate-900 font-bold">{deleteMutasiTarget.nama}</strong> ({deleteMutasiTarget.noSurat})?
              </p>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteMutasiTarget(null)}
                  className="px-4 py-2 border border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-100 rounded-none transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteMutasi}
                  className="px-4 py-2 bg-rose-700 text-white font-bold hover:bg-rose-800 rounded-none flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Ya, Hapus Mutasi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* TAB CONTENT: STAF TU */}
      {activeTab === 'staf' && (
        <div className="bg-white p-5 rounded-none border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Direktori Akun Staf Tata Usaha & Operator Sekolah</h3>
              <p className="text-xs text-slate-500">Petugas dengan kewenangan mengelola kearsipan, surat menyurat, dan data Dapodik.</p>
            </div>
            <button
              type="button"
              onClick={handleAddUserClick}
              className="px-3 py-1.5 bg-[#164e63] hover:bg-cyan-800 text-white rounded-none font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Staf TU</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3">Nama Pegawai</th>
                  <th className="p-3">Email Akun</th>
                  <th className="p-3">NIP</th>
                  <th className="p-3">Sekolah</th>
                  <th className="p-3">Peran / Jabatan</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Aksi Staf TU</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tuUsers.length > 0 ? (
                  tuUsers.map(user => (
                    <tr key={user.uid || user.email} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-800">{user.name}</td>
                      <td className="p-3 font-mono text-slate-600">{user.email}</td>
                      <td className="p-3 text-slate-600 font-mono">{user.nip || '-'}</td>
                      <td className="p-3 text-slate-700">{user.schoolName || 'SD Negeri 1 SIMAK'}</td>
                      <td className="p-3 font-bold text-amber-800">{user.role}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-none">
                          {user.status || 'Aktif'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEditUserClick(user)}
                            title="Edit Data Staf TU"
                            className="px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white font-bold text-[11px] border border-amber-300 rounded-none transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUserClick(user)}
                            title="Hapus Akun Staf TU"
                            className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white font-bold text-[11px] border border-rose-300 rounded-none transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenModuleModal && onOpenModuleModal(user, 'sinkronisasi')}
                            className="px-2 py-1 bg-amber-50 text-amber-800 hover:bg-amber-600 hover:text-white font-bold text-[11px] border border-amber-200 rounded-none transition-all cursor-pointer"
                          >
                            Sinkronisasi
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-500">
                      Belum ada akun khusus dengan peran Tata Usaha (TU). Anda dapat menambahkan akun staf TU baru melalui tombol di atas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INTERNAL MODAL: ADD / EDIT STAF TU USER */}
      {(showAddUserModalInternal || showEditUserModalInternal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-none shadow-2xl border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#164e63] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="text-sm font-bold tracking-wide">
                    {showEditUserModalInternal ? 'Edit Akun Staf TU' : 'Tambah Akun Staf Tata Usaha'}
                  </h3>
                  <p className="text-[11px] text-cyan-100">Manajemen Pengguna & Hak Akses Administrasi</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddUserModalInternal(false);
                  setShowEditUserModalInternal(false);
                  setSelectedUserInternal(null);
                }}
                className="p-1 hover:bg-white/20 rounded-none text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUserInternal} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  required
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  placeholder="Nama pegawai tata usaha..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none focus:outline-none focus:ring-1 focus:ring-[#164e63]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Login</label>
                  <input
                    type="email"
                    required
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    placeholder="email@simakmerdeka.ai.studio"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none focus:outline-none focus:ring-1 focus:ring-[#164e63]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kata Sandi</label>
                  <input
                    type="password"
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    placeholder={showEditUserModalInternal ? 'Biarkan kosong jika tidak diubah' : 'Kata sandi akun'}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none focus:outline-none focus:ring-1 focus:ring-[#164e63]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">NIP</label>
                  <input
                    type="text"
                    value={userFormData.nip}
                    onChange={(e) => setUserFormData({ ...userFormData, nip: e.target.value })}
                    placeholder="1984..."
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none font-mono focus:outline-none focus:ring-1 focus:ring-[#164e63]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Peran / Hak Akses</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none focus:outline-none focus:ring-1 focus:ring-[#164e63]"
                  >
                    <option value="Tata Usaha (TU)">Tata Usaha (TU)</option>
                    <option value="Kepala Tata Usaha">Kepala Tata Usaha</option>
                    <option value="Operator Dapodik">Operator Dapodik</option>
                    <option value="Administrasi Kesiswaan">Administrasi Kesiswaan</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUserModalInternal(false);
                    setShowEditUserModalInternal(false);
                    setSelectedUserInternal(null);
                  }}
                  className="px-4 py-2 border border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-100 rounded-none transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#164e63] text-white font-bold hover:bg-cyan-800 rounded-none flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Akun</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INTERNAL MODAL: DELETE USER CONFIRMATION */}
      {showDeleteUserModalInternal && selectedUserInternal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-none shadow-2xl border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-rose-700 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-5 h-5 text-white" />
                <h3 className="text-sm font-bold tracking-wide">Konfirmasi Hapus Akun Staf TU</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteUserModalInternal(false);
                  setSelectedUserInternal(null);
                }}
                className="p-1 hover:bg-white/20 rounded-none text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-700 leading-relaxed">
                Apakah Anda yakin ingin menghapus akun staf TU <strong className="text-slate-900 font-bold">{selectedUserInternal.name}</strong> ({selectedUserInternal.email})?
              </p>
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Akun ini tidak akan dapat mengakses modul administrasi sekolah lagi setelah dihapus.</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteUserModalInternal(false);
                    setSelectedUserInternal(null);
                  }}
                  className="px-4 py-2 border border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-100 rounded-none transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteUserInternal}
                  className="px-4 py-2 bg-rose-700 text-white font-bold hover:bg-rose-800 rounded-none flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Ya, Hapus Akun</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
