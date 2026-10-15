import React, { useState, useMemo } from 'react';
import { 
  UserCheck, 
  Users, 
  Search, 
  Filter, 
  Printer, 
  Download, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  Eye, 
  Trash2, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  RefreshCw, 
  GraduationCap, 
  Award, 
  BookOpen, 
  Copy, 
  Check, 
  X,
  UserPlus,
  ShieldCheck,
  Send,
  Sparkles,
  Lock,
  Unlock,
  Link2,
  Globe,
  ExternalLink,
  Pencil
} from 'lucide-react';
import { PpdbRegistration, Student, RegisteredSchool } from '../types';
import { TutWuriHandayaniLogo } from './TutWuriHandayaniLogo';

interface PpdbRegistrationViewProps {
  registrations: PpdbRegistration[];
  onUpdateRegistrations: (newList: PpdbRegistration[]) => void;
  onPromoteToStudent?: (newStudent: Partial<Student>) => void;
  registeredSchools?: RegisteredSchool[];
  activeSchoolName?: string;
  classList?: string[];
  currentUserRole?: string;
  currentUserName?: string;
  isPpdbAccessOpen?: boolean;
  onTogglePpdbAccess?: (isOpen: boolean) => void;
}

export const PpdbRegistrationView: React.FC<PpdbRegistrationViewProps> = ({
  registrations,
  onUpdateRegistrations,
  onPromoteToStudent,
  registeredSchools = [],
  activeSchoolName = '',
  classList = ['VII-A', 'VII-B', 'VII-C', 'X-1', 'X-2', 'X-3'],
  currentUserRole = 'Administrator',
  currentUserName = 'Admin SIMAK',
  isPpdbAccessOpen = true,
  onTogglePpdbAccess
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'Semua' | 'Menunggu Verifikasi' | 'Diterima' | 'Ditolak'>('Semua');
  const [jalurFilter, setJalurFilter] = useState<string>('Semua');
  const [schoolFilter, setSchoolFilter] = useState<string>('Semua');
  const [genderFilter, setGenderFilter] = useState<string>('Semua');

  // Selected registration for modal detail & verification
  const [selectedReg, setSelectedReg] = useState<PpdbRegistration | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showPromoteModal, setShowPromoteModal] = useState<boolean>(false);
  const [promoteClass, setPromoteClass] = useState<string>(classList[0] || 'VII-A');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Copy registration number state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Custom PPDB Link State (Editable by Administrator)
  const [customPpdbLink, setCustomPpdbLink] = useState<string>(() => {
    return localStorage.getItem('simak_custom_ppdb_link') || 'spmbsimakmerdeka.vercel.app';
  });
  const [isEditingLink, setIsEditingLink] = useState<boolean>(false);
  const [tempLinkInput, setTempLinkInput] = useState<string>('');

  // Status Akses feedback notice
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // New offline registrant form state
  const [newForm, setNewForm] = useState<Partial<PpdbRegistration>>({
    fullName: '',
    gender: 'Laki-laki',
    birthPlace: '',
    birthDate: '',
    phone: '',
    email: '',
    nisn: '',
    nik: '',
    sekolahAsal: '',
    jalurPpdb: 'Zonasi',
    schoolTarget: activeSchoolName || (registeredSchools[0]?.name || 'SMP Negeri 1 Kota Malang'),
    jenjangPendidikan: 'SMP / MTs',
    religion: 'Islam',
    childOrder: '1',
    siblingCount: '0',
    parentName: '',
    parentPhone: '',
    fatherName: '',
    fatherBirthPlaceDate: '',
    fatherJob: 'Wiraswasta',
    fatherEdu: 'SMA/SMK/MA',
    fatherAddress: '',
    motherName: '',
    motherBirthPlaceDate: '',
    motherJob: 'Ibu Rumah Tangga',
    motherEdu: 'SMA/SMK/MA',
    motherAddress: '',
    studentAddress: '',
    rt: '01',
    rw: '01',
    village: '',
    district: '',
    regency: '',
    status: 'Menunggu Verifikasi'
  });

  // KPI Calculations
  const stats = useMemo(() => {
    const total = registrations.length;
    const pending = registrations.filter(r => r.status === 'Menunggu Verifikasi').length;
    const accepted = registrations.filter(r => r.status === 'Diterima').length;
    const rejected = registrations.filter(r => r.status === 'Ditolak').length;

    const jalurCounts: Record<string, number> = {};
    registrations.forEach(r => {
      const j = r.jalurPpdb || 'Zonasi';
      jalurCounts[j] = (jalurCounts[j] || 0) + 1;
    });

    return { total, pending, accepted, rejected, jalurCounts };
  }, [registrations]);

  // Filtered List
  const filteredList = useMemo(() => {
    return registrations.filter(reg => {
      // Text Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = reg.fullName?.toLowerCase().includes(query);
        const matchesReg = reg.registrationNumber?.toLowerCase().includes(query);
        const matchesNisn = reg.nisn?.toLowerCase().includes(query);
        const matchesNik = reg.nik?.toLowerCase().includes(query);
        const matchesOrigin = reg.sekolahAsal?.toLowerCase().includes(query);
        const matchesParent = reg.parentName?.toLowerCase().includes(query) || reg.fatherName?.toLowerCase().includes(query);
        if (!matchesName && !matchesReg && !matchesNisn && !matchesNik && !matchesOrigin && !matchesParent) {
          return false;
        }
      }

      // Status Filter
      if (statusFilter !== 'Semua' && reg.status !== statusFilter) {
        return false;
      }

      // Jalur Filter
      if (jalurFilter !== 'Semua' && reg.jalurPpdb !== jalurFilter) {
        return false;
      }

      // School Filter
      if (schoolFilter !== 'Semua' && reg.schoolTarget !== schoolFilter) {
        return false;
      }

      // Gender Filter
      if (genderFilter !== 'Semua' && reg.gender !== genderFilter) {
        return false;
      }

      return true;
    });
  }, [registrations, searchQuery, statusFilter, jalurFilter, schoolFilter, genderFilter]);

  // Handlers
  const handleCopyReg = (regNum: string) => {
    navigator.clipboard?.writeText(regNum);
    setCopiedId(regNum);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUpdateStatus = (id: string, newStatus: 'Menunggu Verifikasi' | 'Diterima' | 'Ditolak') => {
    const updated = registrations.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: newStatus,
          verifiedAt: new Date().toISOString(),
          verifiedBy: `${currentUserName} (${currentUserRole})`
        };
      }
      return r;
    });
    onUpdateRegistrations(updated);

    if (selectedReg && selectedReg.id === id) {
      setSelectedReg({
        ...selectedReg,
        status: newStatus,
        verifiedAt: new Date().toISOString(),
        verifiedBy: `${currentUserName} (${currentUserRole})`
      });
    }
  };

  const handleDelete = (id: string) => {
    const updated = registrations.filter(r => r.id !== id);
    onUpdateRegistrations(updated);
    setDeleteConfirmId(null);
    if (selectedReg?.id === id) {
      setShowDetailModal(false);
      setSelectedReg(null);
    }
  };

  const handleCreateOffline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.fullName || !newForm.nisn || !newForm.nik) {
      alert('Nama Lengkap, NISN, dan NIK wajib diisi.');
      return;
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000).toString();
    const newRegRecord: PpdbRegistration = {
      id: `SPMB-${Date.now()}`,
      registrationNumber: `REG-SPMB-${new Date().getFullYear()}-${randomNum}`,
      fullName: newForm.fullName.trim(),
      gender: newForm.gender as 'Laki-laki' | 'Perempuan',
      birthPlace: newForm.birthPlace || 'Malang',
      birthDate: newForm.birthDate || '2012-01-01',
      phone: newForm.phone || '081234567890',
      email: newForm.email || `${newForm.nisn}@spmb.sekolah.id`,
      nisn: newForm.nisn.trim(),
      nik: newForm.nik.trim(),
      sekolahAsal: newForm.sekolahAsal || 'SD Negeri',
      jalurPpdb: newForm.jalurPpdb || 'Zonasi',
      schoolTarget: newForm.schoolTarget || activeSchoolName || 'SMP Negeri 1',
      jenjangPendidikan: newForm.jenjangPendidikan || 'SMP / MTs',
      religion: newForm.religion || 'Islam',
      childOrder: newForm.childOrder || '1',
      siblingCount: newForm.siblingCount || '0',
      parentName: newForm.parentName || newForm.fatherName || 'Orang Tua',
      parentPhone: newForm.parentPhone || newForm.phone || '081234567890',
      fatherName: newForm.fatherName || '-',
      fatherBirthPlaceDate: newForm.fatherBirthPlaceDate || '-',
      fatherJob: newForm.fatherJob || 'Wiraswasta',
      fatherEdu: newForm.fatherEdu || 'SMA',
      fatherAddress: newForm.fatherAddress || '-',
      motherName: newForm.motherName || '-',
      motherBirthPlaceDate: newForm.motherBirthPlaceDate || '-',
      motherJob: newForm.motherJob || 'Ibu Rumah Tangga',
      motherEdu: newForm.motherEdu || 'SMA',
      motherAddress: newForm.motherAddress || '-',
      studentAddress: newForm.studentAddress || 'Jl. Raya',
      rt: newForm.rt || '01',
      rw: newForm.rw || '01',
      village: newForm.village || 'Kelurahan',
      district: newForm.district || 'Kecamatan',
      regency: newForm.regency || 'Kota/Kabupaten',
      status: 'Menunggu Verifikasi',
      registeredAt: new Date().toISOString()
    };

    onUpdateRegistrations([newRegRecord, ...registrations]);
    setShowAddModal(false);
    // Reset form
    setNewForm({
      fullName: '',
      gender: 'Laki-laki',
      birthPlace: '',
      birthDate: '',
      phone: '',
      email: '',
      nisn: '',
      nik: '',
      sekolahAsal: '',
      jalurPpdb: 'Zonasi',
      schoolTarget: activeSchoolName || 'SMP Negeri 1 Kota Malang',
      jenjangPendidikan: 'SMP / MTs',
      religion: 'Islam',
      childOrder: '1',
      siblingCount: '0',
      parentName: '',
      parentPhone: '',
      fatherName: '',
      fatherBirthPlaceDate: '',
      fatherJob: 'Wiraswasta',
      fatherEdu: 'SMA/SMK/MA',
      fatherAddress: '',
      motherName: '',
      motherBirthPlaceDate: '',
      motherJob: 'Ibu Rumah Tangga',
      motherEdu: 'SMA/SMK/MA',
      motherAddress: '',
      studentAddress: '',
      rt: '01',
      rw: '01',
      village: '',
      district: '',
      regency: '',
      status: 'Menunggu Verifikasi'
    });
  };

  const handlePromote = () => {
    if (!selectedReg || !onPromoteToStudent) return;
    const newStudent: Partial<Student> = {
      id: `STD-SPMB-${Date.now()}`,
      nis: selectedReg.nisn.slice(-6) || Math.floor(10000 + Math.random() * 90000).toString(),
      nisn: selectedReg.nisn,
      name: selectedReg.fullName,
      gender: selectedReg.gender === 'Laki-laki' ? 'L' : 'P',
      className: promoteClass,
      parentName: selectedReg.parentName || selectedReg.fatherName || 'Orang Tua Siswa',
      parentPhone: selectedReg.parentPhone || selectedReg.phone || '081234567890',
      status: 'Aktif',
      schoolName: selectedReg.schoolTarget || activeSchoolName
    };

    onPromoteToStudent(newStudent);
    handleUpdateStatus(selectedReg.id, 'Diterima');
    setShowPromoteModal(false);
    alert(`Calon Siswa ${selectedReg.fullName} berhasil dimasukkan ke Rombel ${promoteClass} Data Siswa SIMAK!`);
  };

  const handlePrintRekap = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      'No. Registrasi',
      'Tanggal Daftar',
      'Nama Lengkap',
      'NISN',
      'NIK',
      'Jenis Kelamin',
      'Tempat Lahir',
      'Tanggal Lahir',
      'Sekolah Asal',
      'Jalur PPDB',
      'Sekolah Tujuan',
      'Nama Orang Tua',
      'No HP/WA',
      'Alamat',
      'Status Verifikasi'
    ];

    const rows = filteredList.map(r => [
      `"${r.registrationNumber}"`,
      `"${new Date(r.registeredAt).toLocaleDateString('id-ID')}"`,
      `"${r.fullName}"`,
      `"${r.nisn}"`,
      `"${r.nik}"`,
      `"${r.gender}"`,
      `"${r.birthPlace}"`,
      `"${r.birthDate}"`,
      `"${r.sekolahAsal}"`,
      `"${r.jalurPpdb}"`,
      `"${r.schoolTarget}"`,
      `"${r.parentName || r.fatherName || '-'}"`,
      `"${r.phone}"`,
      `"${r.studentAddress}, RT ${r.rt}/RW ${r.rw}, ${r.village}, ${r.district}, ${r.regency}"`,
      `"${r.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_PPDB_SPMB_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* SCREEN VIEW (Hidden when printing) */}
      <div className="space-y-5 animate-fadeIn text-slate-800 pb-16 print:hidden">
        {/* 1. TOP HEADER & BRANDING BANNER */}
        <div className="bg-gradient-to-r from-[#18568c] via-[#1d6aa8] to-[#144976] rounded-xl text-white p-5 sm:p-6 shadow-md border border-sky-900/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                <TutWuriHandayaniLogo className="w-9 h-9 object-contain drop-shadow" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Data PPDB / SPMB (Penerimaan Murid Baru)
                </h1>
                <p className="text-xs sm:text-sm text-sky-100 font-medium mt-0.5">
                  Monitoring pendaftaran online & verifikasi data calon peserta didik baru secara langsung.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>Input Offline</span>
              </button>
              <button
                type="button"
                onClick={handlePrintRekap}
                className="px-3.5 py-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Rekap</span>
              </button>
            </div>
          </div>
        </div>

      {/* Notification Banner when Status Akses Toggled */}
      {statusNotice && (
        <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-between shadow-lg animate-fadeIn border border-slate-700">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{statusNotice}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setStatusNotice(null)}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1.5. STATUS AKSES PENDAFTARAN PPDB/SPMB (DIBUKA / DITUTUP) */}
      <div className={`p-4 sm:p-5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs transition-all ${
        isPpdbAccessOpen
          ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
          : 'bg-rose-50/95 border-rose-300 text-rose-950'
      }`}>
        <div className="flex items-start sm:items-center gap-3.5">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
            isPpdbAccessOpen ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}>
            {isPpdbAccessOpen ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-sm text-slate-900">
                Kontrol Akses Pendaftaran SPMB:
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider shadow-2xs ${
                isPpdbAccessOpen 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-rose-600 text-white animate-pulse'
              }`}>
                {isPpdbAccessOpen ? 'AKSES DIBUKA' : 'AKSES DITUTUP (404 NOT FOUND)'}
              </span>
              <span className="text-[11px] text-slate-500 font-semibold hidden md:inline">
                ({currentUserRole === 'Administrator' ? 'Menu Administrator' : 'Mode Kepala Sekolah'})
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              {isPpdbAccessOpen 
                ? 'Tombol SPMB pada halaman login sedang AKTIF dan dapat diakses publik calon siswa baru untuk mendaftar online.'
                : 'Akses SPMB sedang DITUTUP. Pengunjung yang menekan tombol SPMB di halaman login tidak dapat mendaftar dan akan langsung diarahkan ke halaman error 404 Not Found.'}
            </p>
          </div>
        </div>

        {/* Action Button: Khusus Administrator */}
        {onTogglePpdbAccess && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                const nextState = !isPpdbAccessOpen;
                onTogglePpdbAccess(nextState);
                setStatusNotice(
                  nextState 
                    ? 'Akses Pendaftaran SPMB berhasil DIBUKA. Halaman SPMB kini aktif dan dapat diakses publik di portal SIMAK.'
                    : 'Akses Pendaftaran SPMB berhasil DITUTUP. Pengunjung yang menekan tombol SPMB di halaman login kini akan menerima error 404 Not Found.'
                );
                setTimeout(() => setStatusNotice(null), 6000);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0 ${
                isPpdbAccessOpen
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
              }`}
            >
              {isPpdbAccessOpen ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Tutup Akses SPMB (404)</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Buka Akses SPMB</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>



      {/* 2. STATS & KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Pendaftar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Pendaftar</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">{stats.total}</p>
            <p className="text-[10px] text-slate-500 mt-1 font-medium">Calon Siswa Terdata</p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Menunggu Verifikasi */}
        <div className="bg-white p-4 rounded-xl border border-amber-200/80 bg-gradient-to-br from-white to-amber-50/30 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Menunggu Verifikasi</p>
            <p className="text-2xl sm:text-3xl font-black text-amber-800 mt-0.5">{stats.pending}</p>
            <p className="text-[10px] text-amber-700 mt-1 font-medium">Perlu Pemeriksaan</p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Diterima */}
        <div className="bg-white p-4 rounded-xl border border-emerald-200/80 bg-gradient-to-br from-white to-emerald-50/30 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Diterima / Lolos</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-800 mt-0.5">{stats.accepted}</p>
            <p className="text-[10px] text-emerald-700 mt-1 font-medium">Siap Masuk Rombel</p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Ditolak */}
        <div className="bg-white p-4 rounded-xl border border-rose-200/80 bg-gradient-to-br from-white to-rose-50/30 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Ditolak / Batal</p>
            <p className="text-2xl sm:text-3xl font-black text-rose-800 mt-0.5">{stats.rejected}</p>
            <p className="text-[10px] text-rose-700 mt-1 font-medium">Berkas Tidak Sesuai</p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. FILTER, SEARCH & TABS BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {(['Semua', 'Menunggu Verifikasi', 'Diterima', 'Ditolak'] as const).map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#18568c] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {st}
                {st === 'Menunggu Verifikasi' && stats.pending > 0 && (
                  <span className="ml-1.5 bg-amber-400 text-slate-900 font-black text-[9px] px-1.5 py-0.2 rounded-full">
                    {stats.pending}
                  </span>
                )}
                {st === 'Diterima' && stats.accepted > 0 && (
                  <span className="ml-1.5 bg-emerald-200 text-emerald-950 font-black text-[9px] px-1.5 py-0.2 rounded-full">
                    {stats.accepted}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, NISN, NIK, No. Registrasi, asal sekolah..."
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#18568c]/30 focus:border-[#18568c] transition-all font-medium text-slate-800"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Secondary Filters */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2.5 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[11px]">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filter Cepat:</span>
          </div>

          {/* Filter Jalur */}
          <select
            value={jalurFilter}
            onChange={(e) => setJalurFilter(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#18568c]"
          >
            <option value="Semua">Semua Jalur</option>
            <option value="Zonasi">Jalur Zonasi</option>
            <option value="Prestasi">Jalur Prestasi</option>
            <option value="Afirmasi">Jalur Afirmasi</option>
            <option value="Mutasi">Jalur Perpindahan Tugas</option>
          </select>

          {/* Filter Gender */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#18568c]"
          >
            <option value="Semua">Semua Jenis Kelamin</option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>

          {/* Filter Sekolah */}
          {registeredSchools.length > 0 && (
            <select
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#18568c] max-w-xs truncate"
            >
              <option value="Semua">Semua Sekolah Tujuan</option>
              {registeredSchools.map(s => (
                <option key={s.id || s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          )}

          {(searchQuery || statusFilter !== 'Semua' || jalurFilter !== 'Semua' || genderFilter !== 'Semua' || schoolFilter !== 'Semua') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('Semua');
                setJalurFilter('Semua');
                setGenderFilter('Semua');
                setSchoolFilter('Semua');
              }}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer ml-auto"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. MAIN REGISTRATIONS TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-black text-xs sm:text-sm text-slate-800 uppercase tracking-wider">
              Daftar Peserta Didik Baru Terdaftar
            </span>
            <span className="bg-slate-200 text-slate-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
              {filteredList.length} dari {registrations.length}
            </span>
          </div>

          <div className="text-[11px] font-medium text-slate-500">
            Terakhir diperbarui: <span className="font-semibold">{new Date().toLocaleTimeString('id-ID')}</span>
          </div>
        </div>

        {filteredList.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Users className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-slate-600">Belum Ada Data Pendaftar PPDB / SPMB</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Data pendaftaran calon siswa baru dari formulir SPMB online akan otomatis langsung muncul di sini secara real-time saat calon murid mengirim data pendaftaran.
            </p>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-[#18568c] hover:bg-[#144976] text-white text-xs font-bold rounded-lg shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Data Siswa Baru Manual</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200 select-none">
                  <th className="py-3 px-3.5 text-center w-12">No</th>
                  <th className="py-3 px-3">No. Registrasi & Tanggal</th>
                  <th className="py-3 px-4">Calon Siswa</th>
                  <th className="py-3 px-3">NISN / NIK</th>
                  <th className="py-3 px-3">Sekolah Asal & Jalur</th>
                  <th className="py-3 px-3">Kontak & Orang Tua</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3.5 text-center">Aksi & Verifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredList.map((reg, index) => {
                  const isPending = reg.status === 'Menunggu Verifikasi';
                  const isAccepted = reg.status === 'Diterima';
                  const isRejected = reg.status === 'Ditolak';

                  return (
                    <tr 
                      key={reg.id} 
                      className={`hover:bg-sky-50/40 transition-colors ${
                        isPending ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* 1. No */}
                      <td className="py-3.5 px-3.5 text-center font-bold text-slate-400">
                        {index + 1}
                      </td>

                      {/* 2. No Registrasi & Tanggal */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-sky-900 bg-sky-100/80 px-2 py-0.5 rounded border border-sky-300 text-[11px]">
                            {reg.registrationNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyReg(reg.registrationNumber)}
                            title="Salin No Registrasi"
                            className="text-slate-400 hover:text-slate-600 p-1"
                          >
                            {copiedId === reg.registrationNumber ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{new Date(reg.registeredAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                        </p>
                      </td>

                      {/* 3. Calon Siswa */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            reg.gender === 'Laki-laki' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {reg.gender === 'Laki-laki' ? 'L' : 'P'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">
                              {reg.fullName}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {reg.gender} • {reg.birthPlace}, {reg.birthDate ? new Date(reg.birthDate).toLocaleDateString('id-ID') : '-'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 4. NISN / NIK */}
                      <td className="py-3.5 px-3 font-mono text-[11px]">
                        <div>
                          <span className="text-slate-400 text-[9px] block">NISN:</span>
                          <span className="font-bold text-slate-800">{reg.nisn || '-'}</span>
                        </div>
                        <div className="mt-1">
                          <span className="text-slate-400 text-[9px] block">NIK:</span>
                          <span className="text-slate-600">{reg.nik || '-'}</span>
                        </div>
                      </td>

                      {/* 5. Asal Sekolah & Jalur */}
                      <td className="py-3.5 px-3">
                        <p className="font-semibold text-slate-800 text-xs truncate max-w-[180px]">
                          {reg.sekolahAsal || '-'}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            reg.jalurPpdb === 'Prestasi' 
                              ? 'bg-purple-50 text-purple-700 border-purple-200' 
                              : reg.jalurPpdb === 'Afirmasi' 
                              ? 'bg-amber-50 text-amber-800 border-amber-200' 
                              : reg.jalurPpdb === 'Mutasi' 
                              ? 'bg-teal-50 text-teal-700 border-teal-200' 
                              : 'bg-sky-50 text-sky-800 border-sky-200'
                          }`}>
                            {reg.jalurPpdb || 'Zonasi'}
                          </span>
                        </div>
                      </td>

                      {/* 6. Kontak & Orang Tua */}
                      <td className="py-3.5 px-3">
                        <p className="font-bold text-slate-800 text-xs">
                          {reg.parentName || reg.fatherName || '-'}
                        </p>
                        <a 
                          href={`https://wa.me/${reg.phone.replace(/^0/, '62')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[10px] text-emerald-700 font-semibold hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{reg.phone}</span>
                        </a>
                        <p className="text-[10px] text-slate-500 truncate max-w-[160px] mt-0.5">
                          {reg.studentAddress}
                        </p>
                      </td>

                      {/* 7. Status */}
                      <td className="py-3.5 px-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                          isAccepted
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : isRejected
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}>
                          {isAccepted && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                          {isRejected && <XCircle className="w-3 h-3 text-rose-600" />}
                          {isPending && <Clock className="w-3 h-3 text-amber-600" />}
                          <span>{reg.status}</span>
                        </span>
                      </td>

                      {/* 8. Action Buttons */}
                      <td className="py-3.5 px-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Detail / Bukti */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedReg(reg);
                              setShowDetailModal(true);
                            }}
                            title="Lihat Detail & Kartu Bukti"
                            className="p-1.5 text-sky-700 hover:text-white hover:bg-[#18568c] rounded-md transition-colors border border-sky-300/80 bg-sky-50 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Verify Accept */}
                          {isPending && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(reg.id, 'Diterima')}
                              title="Terima Calon Siswa Ini"
                              className="p-1.5 text-emerald-700 hover:text-white hover:bg-emerald-600 rounded-md transition-colors border border-emerald-300 bg-emerald-50 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Quick Reject */}
                          {isPending && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(reg.id, 'Ditolak')}
                              title="Tolak Calon Siswa Ini"
                              className="p-1.5 text-rose-700 hover:text-white hover:bg-rose-600 rounded-md transition-colors border border-rose-300 bg-rose-50 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Promote to Student (if Accepted) */}
                          {isAccepted && onPromoteToStudent && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedReg(reg);
                                setShowPromoteModal(true);
                              }}
                              title="Masukkan ke Rombel Siswa SIMAK"
                              className="p-1.5 text-indigo-700 hover:text-white hover:bg-indigo-600 rounded-md transition-colors border border-indigo-300 bg-indigo-50 cursor-pointer"
                            >
                              <GraduationCap className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(reg.id)}
                            title="Hapus Data Pendaftar"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors border border-transparent cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. MODAL: DETAIL & KARTU BUKTI PENDAFTARAN RESMI */}
      {showDetailModal && selectedReg && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-fadeIn">
            {/* Modal Header */}
            <div className="sticky top-0 z-20 bg-gradient-to-r from-[#18568c] to-[#144976] text-white p-4 px-5 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5">
                <TutWuriHandayaniLogo className="w-7 h-7 object-contain drop-shadow" />
                <div>
                  <h3 className="font-black text-sm sm:text-base text-white">
                    Kartu Tanda Bukti Pendaftaran SPMB
                  </h3>
                  <p className="text-[10px] text-sky-200 font-mono">
                    {selectedReg.registrationNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-white/15 hover:bg-white/25 rounded-lg text-xs font-bold text-white transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Complete Printable Card View */}
            <div className="p-5 sm:p-6 space-y-5 text-xs text-slate-800">
              {/* Header Box Card */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-sky-100 border border-sky-300 flex items-center justify-center font-bold text-sky-900 text-lg">
                    {selectedReg.fullName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900">{selectedReg.fullName}</h4>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                      Sekolah Tujuan: <span className="text-sky-800 font-bold">{selectedReg.schoolTarget || activeSchoolName}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-black border ${
                    selectedReg.status === 'Diterima'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : selectedReg.status === 'Ditolak'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    {selectedReg.status}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">
                    Daftar: {new Date(selectedReg.registeredAt).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              {/* Data Calon Siswa Table */}
              <div>
                <h5 className="font-black text-xs text-[#18568c] uppercase tracking-wider mb-2 flex items-center gap-1.5 border-b pb-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>1. Identitas Calon Siswa Baru</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Nomor Registrasi SPMB:</span>
                    <span className="font-mono font-bold text-sky-900 text-xs">{selectedReg.registrationNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">NISN / NIK:</span>
                    <span className="font-mono font-bold text-slate-800 text-xs">{selectedReg.nisn} / {selectedReg.nik}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Jenis Kelamin:</span>
                    <span className="font-semibold text-slate-800">{selectedReg.gender}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Tempat & Tanggal Lahir:</span>
                    <span className="font-semibold text-slate-800">{selectedReg.birthPlace}, {selectedReg.birthDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Agama:</span>
                    <span className="font-semibold text-slate-800">{selectedReg.religion || 'Islam'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Anak Ke / Jumlah Saudara:</span>
                    <span className="font-semibold text-slate-800">{selectedReg.childOrder || '1'} dari {selectedReg.siblingCount || '1'} bersaudara</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Sekolah Asal:</span>
                    <span className="font-bold text-slate-800">{selectedReg.sekolahAsal || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Jalur Pendaftaran:</span>
                    <span className="font-bold text-[#18568c]">{selectedReg.jalurPpdb || 'Zonasi'}</span>
                  </div>
                </div>
              </div>

              {/* Data Orang Tua Table */}
              <div>
                <h5 className="font-black text-xs text-[#18568c] uppercase tracking-wider mb-2 flex items-center gap-1.5 border-b pb-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>2. Data Orang Tua / Wali</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Nama Ayah Kandung:</span>
                    <span className="font-bold text-slate-800">{selectedReg.fatherName || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Pekerjaan / Pendidikan Ayah:</span>
                    <span className="font-semibold text-slate-800">{selectedReg.fatherJob || '-'} ({selectedReg.fatherEdu || '-'})</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Nama Ibu Kandung:</span>
                    <span className="font-bold text-slate-800">{selectedReg.motherName || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Pekerjaan / Pendidikan Ibu:</span>
                    <span className="font-semibold text-slate-800">{selectedReg.motherJob || '-'} ({selectedReg.motherEdu || '-'})</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">No. Telepon / WhatsApp Ortu:</span>
                    <span className="font-bold text-emerald-700">{selectedReg.phone || selectedReg.parentPhone || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Email Kontak:</span>
                    <span className="text-slate-700 font-mono">{selectedReg.email || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Alamat Domisili */}
              <div>
                <h5 className="font-black text-xs text-[#18568c] uppercase tracking-wider mb-2 flex items-center gap-1.5 border-b pb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>3. Alamat Domisili Tempat Tinggal</span>
                </h5>
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <p className="font-semibold text-slate-800">
                    {selectedReg.studentAddress}, RT {selectedReg.rt || '-'} / RW {selectedReg.rw || '-'}, Kel/Desa {selectedReg.village || '-'}, Kec. {selectedReg.district || '-'}, {selectedReg.regency || '-'}
                  </p>
                </div>
              </div>

              {/* Verification & Action Bar */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedReg.id, 'Diterima')}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Sahkan & Terima Siswa</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedReg.id, 'Ditolak')}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Tolak Berkas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedReg.id, 'Menunggu Verifikasi')}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    <span>Reset Status</span>
                  </button>
                </div>

                {onPromoteToStudent && selectedReg.status === 'Diterima' && (
                  <button
                    type="button"
                    onClick={() => setShowPromoteModal(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Masukkan ke Data Siswa Rombel</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: INPUT OFFLINE / MANUAL PENDAFTAR BARU */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="bg-[#18568c] text-white p-4 px-5 flex items-center justify-between sticky top-0 z-10 shadow-md">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-sky-200" />
                <h3 className="font-black text-sm sm:text-base text-white">
                  Input Data Siswa Baru (Offline / Manual)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-white/80 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOffline} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nama Lengkap Calon Siswa *
                  </label>
                  <input
                    type="text"
                    required
                    value={newForm.fullName}
                    onChange={(e) => setNewForm({ ...newForm, fullName: e.target.value })}
                    placeholder="Nama sesuai ijazah/akta..."
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#18568c]/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Jenis Kelamin *
                  </label>
                  <select
                    value={newForm.gender}
                    onChange={(e) => setNewForm({ ...newForm, gender: e.target.value as 'Laki-laki' | 'Perempuan' })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#18568c]/30"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    NISN (10 Digit) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={newForm.nisn}
                    onChange={(e) => setNewForm({ ...newForm, nisn: e.target.value.replace(/\D/g, '') })}
                    placeholder="Contoh: 0123456789"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#18568c]/30 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    NIK (16 Digit) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={newForm.nik}
                    onChange={(e) => setNewForm({ ...newForm, nik: e.target.value.replace(/\D/g, '') })}
                    placeholder="Contoh: 3507121505120001"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#18568c]/30 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Sekolah Asal *
                  </label>
                  <input
                    type="text"
                    required
                    value={newForm.sekolahAsal}
                    onChange={(e) => setNewForm({ ...newForm, sekolahAsal: e.target.value })}
                    placeholder="Contoh: SD Negeri 1"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#18568c]/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Jalur Pendaftaran *
                  </label>
                  <select
                    value={newForm.jalurPpdb}
                    onChange={(e) => setNewForm({ ...newForm, jalurPpdb: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#18568c]/30"
                  >
                    <option value="Zonasi">Zonasi</option>
                    <option value="Prestasi">Prestasi</option>
                    <option value="Afirmasi">Afirmasi</option>
                    <option value="Mutasi">Perpindahan Tugas Orang Tua</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    No. Handphone / WA Ortu *
                  </label>
                  <input
                    type="text"
                    required
                    value={newForm.phone}
                    onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
                    placeholder="Contoh: 081234567890"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#18568c]/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nama Ayah / Ibu Kandung
                  </label>
                  <input
                    type="text"
                    value={newForm.parentName}
                    onChange={(e) => setNewForm({ ...newForm, parentName: e.target.value })}
                    placeholder="Nama orang tua/wali..."
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#18568c]/30"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Alamat Domisili Siswa
                  </label>
                  <textarea
                    rows={2}
                    value={newForm.studentAddress}
                    onChange={(e) => setNewForm({ ...newForm, studentAddress: e.target.value })}
                    placeholder="Alamat jalan, kelurahan, kecamatan..."
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#18568c]/30"
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Data Pendaftar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL: PROMOTE TO STUDENT IN SIMAK ROMBEL */}
      {showPromoteModal && selectedReg && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 animate-fadeIn space-y-4">
            <div className="flex items-center gap-3 text-indigo-700">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0">
                <GraduationCap className="w-6 h-6 text-indigo-700" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">
                  Masukkan ke Data Siswa SIMAK
                </h3>
                <p className="text-xs text-slate-500">
                  Registrasikan calon siswa ke Rombongan Belajar resmi.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <p className="font-bold text-slate-800">{selectedReg.fullName}</p>
              <p className="text-[11px] text-slate-500 font-mono">NISN: {selectedReg.nisn} • Jalur: {selectedReg.jalurPpdb}</p>
              <p className="text-[11px] text-slate-500">Sekolah: {selectedReg.schoolTarget || activeSchoolName}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Pilih Kelas / Rombel Tujuan:
              </label>
              <select
                value={promoteClass}
                onChange={(e) => setPromoteClass(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                {classList.map(cls => (
                  <option key={cls} value={cls}>Kelas {cls}</option>
                ))}
              </select>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPromoteModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handlePromote}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Konfirmasi & Simpan Siswa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. MODAL: DELETE CONFIRMATION */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-fadeIn space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Hapus Data Pendaftaran Ini?</h4>
            <p className="text-xs text-slate-500">
              Data pendaftaran calon siswa ini akan dihapus dari sistem PPDB/SPMB dan tidak dapat dikembalikan.
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* 9. PRINTABLE REKAP SECTION (Only visible during window.print()) */}
      <div className="hidden print:block p-8 bg-white text-slate-900 font-sans space-y-6">
        {/* Kop Surat Header */}
        <div className="border-b-2 border-slate-900 pb-4 text-center relative">
          <div className="flex items-center justify-center gap-4 mb-2">
            <TutWuriHandayaniLogo className="w-16 h-16 object-contain" />
            <div>
              <h2 className="text-xs font-bold tracking-widest uppercase text-slate-700">
                PANITIA PENERIMAAN PESERTA DIDIK BARU (PPDB / SPMB)
              </h2>
              <h1 className="text-xl font-black uppercase text-slate-900">
                {activeSchoolName || 'SMP NEGERI 1 KOTA MALANG'}
              </h1>
              <p className="text-xs text-slate-600 font-medium">
                Sistem Informasi Manajemen Akademik & Kepegawaian (SIMAK) • T.A. 2026/2027
              </p>
            </div>
          </div>
          <div className="mt-3 text-center">
            <h3 className="text-base font-bold underline uppercase tracking-wide">
              REKAPITULASI DATA PENDAFTARAN CALON SISWA BARU
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Dicetak pada: {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Ringkasan Statistik */}
        <div className="grid grid-cols-4 gap-3 text-center text-xs border border-slate-300 rounded-lg p-3 bg-slate-50">
          <div className="border-r border-slate-200 pr-2">
            <p className="text-slate-500 font-medium">Total Pendaftar</p>
            <p className="text-lg font-bold text-slate-900">{stats.total} Siswa</p>
          </div>
          <div className="border-r border-slate-200 pr-2">
            <p className="text-slate-500 font-medium">Diterima</p>
            <p className="text-lg font-bold text-emerald-700">{stats.accepted} Siswa</p>
          </div>
          <div className="border-r border-slate-200 pr-2">
            <p className="text-slate-500 font-medium">Menunggu Verifikasi</p>
            <p className="text-lg font-bold text-amber-700">{stats.pending} Siswa</p>
          </div>
          <div>
            <p className="text-slate-500 font-medium">Ditolak</p>
            <p className="text-lg font-bold text-rose-700">{stats.rejected} Siswa</p>
          </div>
        </div>

        {/* Tabel Rekap Data Pendaftar */}
        <div>
          <table className="w-full border-collapse border border-slate-400 text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-bold">
                <th className="border border-slate-400 px-2 py-1.5 text-center w-8">No</th>
                <th className="border border-slate-400 px-2 py-1.5">No. Registrasi</th>
                <th className="border border-slate-400 px-2 py-1.5">Nama Lengkap</th>
                <th className="border border-slate-400 px-2 py-1.5 text-center">L/P</th>
                <th className="border border-slate-400 px-2 py-1.5">NISN / NIK</th>
                <th className="border border-slate-400 px-2 py-1.5">Sekolah Asal</th>
                <th className="border border-slate-400 px-2 py-1.5">Jalur PPDB</th>
                <th className="border border-slate-400 px-2 py-1.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="border border-slate-400 p-4 text-center text-slate-500 italic">
                    Tidak ada data pendaftaran calon siswa.
                  </td>
                </tr>
              ) : (
                filteredList.map((reg, idx) => (
                  <tr key={reg.id} className="odd:bg-white even:bg-slate-50">
                    <td className="border border-slate-400 px-2 py-1.5 text-center font-medium">{idx + 1}</td>
                    <td className="border border-slate-400 px-2 py-1.5 font-mono text-[10px] font-bold">{reg.registrationNumber}</td>
                    <td className="border border-slate-400 px-2 py-1.5 font-bold">{reg.fullName}</td>
                    <td className="border border-slate-400 px-2 py-1.5 text-center">{reg.gender === 'Laki-laki' ? 'L' : 'P'}</td>
                    <td className="border border-slate-400 px-2 py-1.5 font-mono text-[10px]">{reg.nisn} / {reg.nik}</td>
                    <td className="border border-slate-400 px-2 py-1.5">{reg.sekolahAsal || '-'}</td>
                    <td className="border border-slate-400 px-2 py-1.5 font-medium">{reg.jalurPpdb}</td>
                    <td className="border border-slate-400 px-2 py-1.5 text-center font-bold">
                      {reg.status}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Tanda Tangan Legitimasi */}
        <div className="pt-8 grid grid-cols-2 gap-8 text-xs text-center break-inside-avoid">
          <div>
            <p className="font-medium text-slate-600">Mengetahui,</p>
            <p className="font-bold text-slate-900 mt-1">Kepala Sekolah</p>
            <div className="h-16"></div>
            <p className="font-bold underline text-slate-900">(..........................................................)</p>
            <p className="text-[11px] text-slate-500">NIP. ....................................................</p>
          </div>
          <div>
            <p className="font-medium text-slate-600">
              {activeSchoolName ? activeSchoolName.split(' ')[0] : 'Kota Malang'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <p className="font-bold text-slate-900 mt-1">Ketua Panitia PPDB / SPMB</p>
            <div className="h-16"></div>
            <p className="font-bold underline text-slate-900">({currentUserName || 'Panitia PPDB SIMAK'})</p>
            <p className="text-[11px] text-slate-500">NIP / ID: {currentUserRole}</p>
          </div>
        </div>
      </div>
    </>
  );
};
