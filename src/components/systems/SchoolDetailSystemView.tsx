import React, { useState, useEffect } from 'react';
import {
  School,
  Building2,
  ShieldCheck,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Mail,
  Phone,
  Globe,
  Award,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  FileText,
  UserCheck,
  Trash2,
  Database,
  ChevronRight
} from 'lucide-react';
import { TeacherProfile, UserAccount, RegisteredSchool } from '../../types';
import { registerSchoolToFirebase, normalizeSchoolId, deleteSchoolFromFirebase } from '../../lib/firebaseService';

interface SchoolDetailSystemViewProps {
  teacher?: TeacherProfile;
  currentUser?: UserAccount | null;
  registeredUsers?: UserAccount[];
  onUpdateTeacherProfile?: (newProfile: TeacherProfile) => boolean;
  registeredSchools?: RegisteredSchool[];
  onRegisterSchool?: (newSchool: Partial<RegisteredSchool> & { name: string }) => Promise<void> | void;
  onDeleteSchoolStorage?: (schoolId: string, schoolName?: string) => Promise<boolean> | void;
  activeSchoolName?: string;
  onNavigateTab?: (tab: string) => void;
  onSelectCategory?: (category: any) => void;
}

export const SchoolDetailSystemView: React.FC<SchoolDetailSystemViewProps> = ({
  teacher,
  currentUser,
  registeredUsers = [],
  onUpdateTeacherProfile,
  registeredSchools = [],
  onRegisterSchool,
  onDeleteSchoolStorage,
  activeSchoolName,
  onNavigateTab,
  onSelectCategory
}) => {
  // Verifikasi wewenang: Hanya Administrator dan Kepala Sekolah yang bisa mengedit
  const isAdministrator = Boolean(
    currentUser?.email?.toLowerCase() === 'shahrurrobby17@gmail.com' ||
    teacher?.id === 'PROF-ADMIN' ||
    (currentUser?.role && (
      currentUser.role.toLowerCase().includes('admin') ||
      currentUser.role.toLowerCase().includes('master') ||
      currentUser.role.toLowerCase().includes('super')
    )) ||
    (currentUser?.email && (
      currentUser.email.toLowerCase().includes('admin') ||
      currentUser.email.toLowerCase().includes('master')
    ))
  );

  const isKepalaSekolah = Boolean(
    (currentUser?.role && (
      currentUser.role.toLowerCase().includes('kepala') ||
      currentUser.role.toLowerCase().includes('principal') ||
      currentUser.role.toLowerCase().includes('ks')
    )) ||
    (teacher?.subjectRole && (
      teacher.subjectRole.toLowerCase().includes('kepala') ||
      teacher.subjectRole.toLowerCase().includes('principal')
    )) ||
    (teacher?.title && teacher.title.toLowerCase().includes('kepala')) ||
    (teacher?.id && teacher.id.toLowerCase().includes('ks'))
  );

  const canEditSchool = isAdministrator || isKepalaSekolah;

  // Temukan data sekolah aktif
  const currentSchoolData = registeredSchools.find(
    s => s.name?.toLowerCase().trim() === (teacher?.schoolName || '').toLowerCase().trim()
  ) || registeredSchools[0];

  // Form states
  const [schoolName, setSchoolName] = useState<string>(() => teacher?.schoolName || currentSchoolData?.name || 'SMA Negeri 1 Indonesia - Sekolah Penggerak');
  const [npsn, setNpsn] = useState<string>(() => teacher?.npsn || currentSchoolData?.npsn || '20500000');
  const [jenjang, setJenjang] = useState<string>(() => currentSchoolData?.jenjang || 'SMA');
  const [statusSekolah, setStatusSekolah] = useState<string>(() => currentSchoolData?.statusSekolah || 'Negeri');
  const [akreditasi, setAkreditasi] = useState<string>(() => currentSchoolData?.akreditasi || 'A (Unggul)');
  const [kurikulum, setKurikulum] = useState<string>(() => currentSchoolData?.kurikulum || 'Kurikulum Merdeka');
  const [principalName, setPrincipalName] = useState<string>(() => teacher?.principalName || currentSchoolData?.principalName || 'Dr. Hj. Sri Wahyuni, M.Si.');
  const [principalNip, setPrincipalNip] = useState<string>(() => teacher?.principalNip || currentSchoolData?.principalNip || '19691120 199403 2 003');
  const [city, setCity] = useState<string>(() => teacher?.city || currentSchoolData?.city || 'Indonesia');
  const [address, setAddress] = useState<string>(() => currentSchoolData?.address || 'Jl. Pendidikan Merdeka No. 45, Kompleks Pendidikan');
  const [province, setProvince] = useState<string>(() => currentSchoolData?.province || 'Jawa Timur');
  const [postalCode, setPostalCode] = useState<string>(() => currentSchoolData?.postalCode || '65145');
  const [phone, setPhone] = useState<string>(() => currentSchoolData?.phone || '(0341) 551234');
  const [emailSekolah, setEmailSekolah] = useState<string>(() => currentSchoolData?.email || 'info@sman1indonesia.sch.id');
  const [website, setWebsite] = useState<string>(() => currentSchoolData?.website || 'https://sman1indonesia.sch.id');
  const [academicYear, setAcademicYear] = useState<string>(() => teacher?.academicYear || currentSchoolData?.academicYear || '2026/2027');
  const [semester, setSemester] = useState<string>(() => teacher?.semester || currentSchoolData?.semester || 'Ganjil');

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync state if teacher prop updates
  useEffect(() => {
    if (teacher) {
      if (teacher.schoolName) setSchoolName(teacher.schoolName);
      if (teacher.npsn) setNpsn(teacher.npsn);
      if (teacher.principalName) setPrincipalName(teacher.principalName);
      if (teacher.principalNip) setPrincipalNip(teacher.principalNip);
      if (teacher.city) setCity(teacher.city);
      if (teacher.academicYear) setAcademicYear(teacher.academicYear);
      if (teacher.semester) setSemester(teacher.semester);
    }
  }, [teacher]);

  // Hitung jumlah akun dan PTK di sekolah ini
  const schoolUsersCount = registeredUsers.filter(u => 
    (u.schoolName || '').toLowerCase().trim() === schoolName.toLowerCase().trim()
  ).length;

  const handleReset = () => {
    if (teacher) {
      setSchoolName(teacher.schoolName || 'SMA Negeri 1 Indonesia - Sekolah Penggerak');
      setNpsn(teacher.npsn || '20500000');
      setPrincipalName(teacher.principalName || 'Dr. Hj. Sri Wahyuni, M.Si.');
      setPrincipalNip(teacher.principalNip || '19691120 199403 2 003');
      setCity(teacher.city || 'Indonesia');
      setAcademicYear(teacher.academicYear || '2026/2027');
      setSemester(teacher.semester || 'Ganjil');
    }
    setFeedback({
      type: 'success',
      message: 'Formulir berhasil dikembalikan ke data awal.'
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!canEditSchool) {
      setFeedback({
        type: 'error',
        message: 'Akses Ditolak: Hanya Administrator SIMAK dan Kepala Sekolah resmi yang diizinkan untuk mengedit Detail Sekolah.'
      });
      return;
    }

    if (!schoolName.trim()) {
      setFeedback({
        type: 'error',
        message: 'Nama Satuan Pendidikan (Sekolah) wajib diisi!'
      });
      return;
    }

    if (!npsn.trim()) {
      setFeedback({
        type: 'error',
        message: 'NPSN sekolah wajib diisi!'
      });
      return;
    }

    setIsSaving(true);

    try {
      // 1. Perbarui profil teacher aktif di state utama & localStorage
      const updatedTeacher: TeacherProfile = {
        ...(teacher || {}),
        name: teacher?.name || 'Administrator SIMAK',
        title: teacher?.title || 'Admin & Guru',
        nip: teacher?.nip || '19900101 201501 1 001',
        subjectRole: teacher?.subjectRole || 'Pendidik',
        schoolName: schoolName.trim(),
        npsn: npsn.trim(),
        principalName: principalName.trim(),
        principalNip: principalNip.trim(),
        city: city.trim(),
        address: address.trim(),
        province: province.trim(),
        postalCode: postalCode.trim(),
        phone: phone.trim(),
        email: emailSekolah.trim(),
        website: website.trim(),
        jenjang: jenjang,
        statusSekolah: statusSekolah,
        akreditasi: akreditasi,
        kurikulum: kurikulum,
        academicYear: academicYear.trim(),
        semester: semester.trim(),
        guardianClass: teacher?.guardianClass || 'X-IPA 1'
      };

      if (onUpdateTeacherProfile) {
        onUpdateTeacherProfile(updatedTeacher);
      }

      // 2. Sinkronisasikan ke Firebase Firestore /schools/{schoolId}
      const schoolId = normalizeSchoolId(schoolName.trim());
      await registerSchoolToFirebase({
        id: schoolId,
        name: schoolName.trim(),
        npsn: npsn.trim(),
        principalName: principalName.trim(),
        principalNip: principalNip.trim(),
        academicYear: academicYear.trim(),
        semester: semester.trim(),
        city: city.trim(),
        address: address.trim(),
        province: province.trim(),
        postalCode: postalCode.trim(),
        phone: phone.trim(),
        email: emailSekolah.trim(),
        website: website.trim(),
        jenjang: jenjang,
        statusSekolah: statusSekolah,
        akreditasi: akreditasi,
        kurikulum: kurikulum
      });

      if (onRegisterSchool) {
        await onRegisterSchool({
          id: schoolId,
          name: schoolName.trim(),
          npsn: npsn.trim(),
          principalName: principalName.trim(),
          academicYear: academicYear.trim(),
          semester: semester.trim()
        });
      }

      setFeedback({
        type: 'success',
        message: `Detail Satuan Pendidikan "${schoolName.trim()}" berhasil disimpan & disinkronkan oleh ${isAdministrator ? 'Administrator' : 'Kepala Sekolah'}!`
      });
    } catch (err: any) {
      console.error('Error saving school details:', err);
      setFeedback({
        type: 'error',
        message: `Terjadi kendala saat menyimpan data: ${err?.message || 'Gagal menyimpan ke basis data'}`
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. Header Banner & Identity Card */}
      <div className="bg-white border border-slate-200 p-4 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-[#164e63] text-white shrink-0 shadow-xs">
              <School className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                  Detail Satuan Pendidikan & Data Kelembagaan
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-100 text-cyan-900 border border-cyan-200">
                  NPSN: {npsn}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                  {statusSekolah} • {jenjang}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pusat data legalitas sekolah, pimpinan pengesahan dokumen, kontak resmi, dan kalender akademik aktif
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            {canEditSchool ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Izin Edit: {isAdministrator ? 'Administrator' : 'Kepala Sekolah'}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Mode Hanya-Lihat</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick KPI badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="p-2.5 bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Satuan Pendidikan</span>
            <span className="text-xs font-black text-slate-800 truncate block mt-0.5" title={schoolName}>{schoolName}</span>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kepala Sekolah</span>
            <span className="text-xs font-black text-slate-800 truncate block mt-0.5" title={principalName}>{principalName}</span>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kurikulum & Akreditasi</span>
            <span className="text-xs font-black text-slate-800 truncate block mt-0.5">{kurikulum} • {akreditasi}</span>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pengguna Terdaftar</span>
            <span className="text-xs font-black text-[#164e63] truncate block mt-0.5">{schoolUsersCount || registeredUsers.length} Akun Sekolah</span>
          </div>
        </div>
      </div>

      {/* 2. Permission Banner */}
      {canEditSchool ? (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-emerald-200/80 rounded-none text-emerald-800 shrink-0">
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <p className="font-bold text-emerald-950">
                Otoritas Terverifikasi: {isAdministrator ? 'Administrator SIMAK' : 'Kepala Sekolah Resmi'}
              </p>
              <p className="text-[11px] text-emerald-700">
                Anda memiliki wewenang penuh untuk memperbarui profil satuan pendidikan, identitas pengesahan kepala sekolah, dan data kelembagaan.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider shrink-0 hidden sm:inline-block">
            Akses Edit Penuh
          </span>
        </div>
      ) : (
        <div className="p-3.5 bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-3 shadow-xs">
          <div className="p-1.5 bg-amber-200/80 rounded-none text-amber-900 shrink-0 mt-0.5">
            <Lock className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-amber-950">Mode Hanya-Lihat: Detail Sekolah Terkunci</span>
              <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 uppercase tracking-wider">
                Khusus Administrator & Kepala Sekolah
              </span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Anda masuk dengan peran <strong>{currentUser?.role || 'Pengguna'}</strong>. Data identitas satuan pendidikan (Nama Sekolah, NPSN, Legalitas, Kepala Sekolah, dan Kontak) dilindungi dan <strong>hanya dapat diedit oleh Administrator dan Kepala Sekolah</strong>.
            </p>
          </div>
        </div>
      )}

      {/* 3. Feedback Alert */}
      {feedback && (
        <div className={`p-3.5 text-xs font-semibold flex items-center gap-3 border shadow-xs animate-fadeIn ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
            : 'bg-rose-50 border-rose-300 text-rose-900'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 4. Edit Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* BAGIAN 1: Identitas Satuan Pendidikan & Legalitas */}
        <div className="bg-white border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#164e63]" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                1. Identitas Satuan Pendidikan & Legalitas
              </h3>
            </div>
            {!canEditSchool && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Terkunci
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Nama Sekolah */}
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold mb-1">
                Nama Resmi Satuan Pendidikan (Sekolah) *
              </label>
              <input 
                type="text" 
                value={schoolName}
                disabled={!canEditSchool}
                readOnly={!canEditSchool}
                onChange={(e) => setSchoolName(e.target.value)}
                className={`w-full px-3 py-2 border font-medium ${
                  canEditSchool 
                    ? 'bg-slate-50 border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900' 
                    : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed select-none'
                }`}
                placeholder="Contoh: SMA Negeri 1 Indonesia - Sekolah Penggerak"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">Dicantumkan pada kop surat, buku induk, rapor, dan identitas ijazah.</p>
            </div>

            {/* NPSN */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                NPSN (Nomor Pokok Sekolah Nasional) *
              </label>
              <input 
                type="text" 
                value={npsn}
                disabled={!canEditSchool}
                readOnly={!canEditSchool}
                onChange={(e) => setNpsn(e.target.value)}
                className={`w-full px-3 py-2 border font-mono font-bold ${
                  canEditSchool 
                    ? 'bg-slate-50 border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-[#164e63]' 
                    : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed select-none'
                }`}
                placeholder="Contoh: 20500000"
                maxLength={8}
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">Kode 8 digit unik terdaftar di Pusdatin Kemendikbudristek.</p>
            </div>

            {/* Bentuk Pendidikan / Jenjang */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Bentuk Pendidikan / Jenjang
              </label>
              <select
                value={jenjang}
                disabled={!canEditSchool}
                onChange={(e) => setJenjang(e.target.value)}
                className={`w-full px-3 py-2 border font-medium ${
                  canEditSchool 
                    ? 'bg-slate-50 border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 cursor-pointer' 
                    : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                }`}
              >
                <option value="SD">SD (Sekolah Dasar)</option>
                <option value="SMP">SMP (Sekolah Menengah Pertama)</option>
                <option value="SMA">SMA (Sekolah Menengah Atas)</option>
                <option value="SMK">SMK (Sekolah Menengah Kejuruan)</option>
                <option value="SLB">SLB (Sekolah Luar Biasa)</option>
              </select>
            </div>

            {/* Status Sekolah */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Status Satuan Pendidikan
              </label>
              <select
                value={statusSekolah}
                disabled={!canEditSchool}
                onChange={(e) => setStatusSekolah(e.target.value)}
                className={`w-full px-3 py-2 border font-medium ${
                  canEditSchool 
                    ? 'bg-slate-50 border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 cursor-pointer' 
                    : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                }`}
              >
                <option value="Negeri">Negeri (Pemerintah)</option>
                <option value="Swasta">Swasta (Yayasan / Lembaga)</option>
              </select>
            </div>

            {/* Akreditasi */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Peringkat Akreditasi BAN-PDM
              </label>
              <select
                value={akreditasi}
                disabled={!canEditSchool}
                onChange={(e) => setAkreditasi(e.target.value)}
                className={`w-full px-3 py-2 border font-medium ${
                  canEditSchool 
                    ? 'bg-slate-50 border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 cursor-pointer' 
                    : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                }`}
              >
                <option value="A (Unggul)">A (Unggul)</option>
                <option value="B (Baik)">B (Baik)</option>
                <option value="C (Cukup)">C (Cukup)</option>
                <option value="Belum Terakreditasi">Belum Terakreditasi</option>
              </select>
            </div>

            {/* Kurikulum */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Kurikulum Operasional Satuan Pendidikan (KSP)
              </label>
              <select
                value={kurikulum}
                disabled={!canEditSchool}
                onChange={(e) => setKurikulum(e.target.value)}
                className={`w-full px-3 py-2 border font-medium ${
                  canEditSchool 
                    ? 'bg-slate-50 border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 cursor-pointer' 
                    : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                }`}
              >
                <option value="Kurikulum Merdeka">Kurikulum Merdeka</option>
                <option value="Kurikulum 2013">Kurikulum 2013</option>
              </select>
            </div>
          </div>
        </div>

        {/* BAGIAN 2: Data Pengesahan & Pimpinan Kepala Sekolah */}
        <div className="bg-white border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#164e63]" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                2. Pejabat Kepala Sekolah (Pengesahan Dokumen & e-Rapor)
              </h3>
            </div>
            {!canEditSchool && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Terkunci
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Nama Kepala Sekolah */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Nama Lengkap Kepala Sekolah (Gelar Akademik) *
              </label>
              <input 
                type="text" 
                value={principalName}
                disabled={!canEditSchool}
                readOnly={!canEditSchool}
                onChange={(e) => setPrincipalName(e.target.value)}
                className={`w-full px-3 py-2 border font-medium ${
                  canEditSchool 
                    ? 'bg-slate-50 border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900' 
                    : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed select-none'
                }`}
                placeholder="Contoh: Dr. Hj. Sri Wahyuni, M.Si."
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">Dicetak di bawah tanda tangan pengesahan rapor dan SK sekolah.</p>
            </div>

            {/* NIP Kepala Sekolah */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                NIP Kepala Sekolah
              </label>
              <input 
                type="text" 
                value={principalNip}
                disabled={!canEditSchool}
                readOnly={!canEditSchool}
                onChange={(e) => setPrincipalNip(e.target.value)}
                className={`w-full px-3 py-2 border font-mono ${
                  canEditSchool 
                    ? 'bg-slate-50 border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900' 
                    : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed select-none'
                }`}
                placeholder="Contoh: 19691120 199403 2 003"
              />
              <p className="text-[10px] text-slate-400 mt-1">Kosongkan atau beri tanda "-" jika bukan PNS / PPPK.</p>
            </div>

            {/* Kota Pengesahan */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Tempat / Kota Pengesahan Dokumen *
              </label>
              <input 
                type="text" 
                value={city}
                disabled={!canEditSchool}
                readOnly={!canEditSchool}
                onChange={(e) => setCity(e.target.value)}
                className={`w-full px-3 py-2 border font-medium ${
                  canEditSchool 
                    ? 'bg-slate-50 border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900' 
                    : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed select-none'
                }`}
                placeholder="Contoh: Malang"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">Format tanggal di atas TTD rapor (contoh: Malang, 18 Desember 2026).</p>
            </div>
          </div>
        </div>

        {/* BAGIAN 3: Alamat Satuan Pendidikan & Kontak Resmi */}
        <div className="bg-white border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#164e63]" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                3. Alamat Satuan Pendidikan & Kontak Resmi
              </h3>
            </div>
            {!canEditSchool && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Terkunci
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Alamat Jalan */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-slate-700 font-bold mb-1">
                Alamat Lengkap (Jalan, RT/RW, Dusun/Kompleks)
              </label>
              <input 
                type="text" 
                value={address}
                disabled={!canEditSchool}
                readOnly={!canEditSchool}
                onChange={(e) => setAddress(e.target.value)}
                className={`w-full px-3 py-2 border font-medium ${
                  canEditSchool 
                    ? 'bg-slate-50 border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900' 
                    : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed select-none'
                }`}
                placeholder="Contoh: Jl. Pendidikan Merdeka No. 45"
              />
            </div>

            {/* Provinsi */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Provinsi
              </label>
              <input 
                type="text" 
                value={province}
                disabled={!canEditSchool}
                readOnly={!canEditSchool}
                onChange={(e) => setProvince(e.target.value)}
                className={`w-full px-3 py-2 border font-medium ${
                  canEditSchool 
                    ? 'bg-slate-50 border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900' 
                    : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed select-none'
                }`}
                placeholder="Contoh: Jawa Timur"
              />
            </div>

            {/* Kode Pos */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Kode Pos
              </label>
              <input 
                type="text" 
                value={postalCode}
                disabled={!canEditSchool}
                readOnly={!canEditSchool}
                onChange={(e) => setPostalCode(e.target.value)}
                className={`w-full px-3 py-2 border font-mono ${
                  canEditSchool 
                    ? 'bg-slate-50 border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900' 
                    : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed select-none'
                }`}
                placeholder="Contoh: 65145"
                maxLength={5}
              />
            </div>

            {/* Telepon */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Nomor Telepon / Fax Resmi
              </label>
              <input 
                type="text" 
                value={phone}
                disabled={!canEditSchool}
                readOnly={!canEditSchool}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full px-3 py-2 border font-medium ${
                  canEditSchool 
                    ? 'bg-slate-50 border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900' 
                    : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed select-none'
                }`}
                placeholder="Contoh: (0341) 551234"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Email Resmi Lembaga
              </label>
              <input 
                type="email" 
                value={emailSekolah}
                disabled={!canEditSchool}
                readOnly={!canEditSchool}
                onChange={(e) => setEmailSekolah(e.target.value)}
                className={`w-full px-3 py-2 border font-medium ${
                  canEditSchool 
                    ? 'bg-slate-50 border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900' 
                    : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed select-none'
                }`}
                placeholder="Contoh: info@sman1indonesia.sch.id"
              />
            </div>

            {/* Website */}
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold mb-1">
                Website / Portal Resmi
              </label>
              <input 
                type="url" 
                value={website}
                disabled={!canEditSchool}
                readOnly={!canEditSchool}
                onChange={(e) => setWebsite(e.target.value)}
                className={`w-full px-3 py-2 border font-medium ${
                  canEditSchool 
                    ? 'bg-slate-50 border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900' 
                    : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed select-none'
                }`}
                placeholder="Contoh: https://sman1indonesia.sch.id"
              />
            </div>
          </div>
        </div>

        {/* BAGIAN 4: Tahun Ajaran & Semester Aktif */}
        <div className="bg-white border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#164e63]" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                4. Tahun Ajaran & Semester Berjalan
              </h3>
            </div>
            {!canEditSchool && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Terkunci
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Tahun Ajaran */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Tahun Ajaran Aktif *
              </label>
              <input 
                type="text" 
                value={academicYear}
                disabled={!canEditSchool}
                readOnly={!canEditSchool}
                onChange={(e) => setAcademicYear(e.target.value)}
                className={`w-full px-3 py-2 border font-bold ${
                  canEditSchool 
                    ? 'bg-slate-50 border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900' 
                    : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed select-none'
                }`}
                placeholder="Contoh: 2026/2027"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">Format standar penulisan: YYYY/YYYY (contoh: 2026/2027).</p>
            </div>

            {/* Semester */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Semester Berjalan *
              </label>
              <select
                value={semester}
                disabled={!canEditSchool}
                onChange={(e) => setSemester(e.target.value)}
                className={`w-full px-3 py-2 border font-bold ${
                  canEditSchool 
                    ? 'bg-slate-50 border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 cursor-pointer' 
                    : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                }`}
              >
                <option value="Ganjil">Ganjil (Semester 1)</option>
                <option value="Genap">Genap (Semester 2)</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">Menentukan periode penilaian dan cetak rapor aktif.</p>
            </div>
          </div>
        </div>

        {/* 5. Tombol Aksi */}
        <div className="flex items-center justify-between gap-3 pt-2 flex-wrap">
          <div className="text-[11px] text-slate-500">
            {canEditSchool ? (
              <span>Perubahan data akan disimpan ke profil satuan pendidikan dan disinkronkan ke seluruh sistem sekolah.</span>
            ) : (
              <span className="text-amber-800 font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                Hanya Administrator dan Kepala Sekolah yang memiliki hak akses untuk menyimpan perubahan.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {canEditSchool ? (
              <>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isSaving}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Reset Formulir
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#164e63] hover:bg-cyan-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan ke Cloud...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan Perubahan Detail Sekolah</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled
                className="px-4 py-2 bg-slate-100 border border-slate-300 text-slate-400 font-bold text-xs flex items-center gap-2 cursor-not-allowed select-none"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Detail Sekolah Terkunci (Khusus Administrator & KS)</span>
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Info Penyimpanan Sekolah telah dipindahkan ke Menu Pengaturan */}
      {isAdministrator && (
        <div className="bg-slate-50 border border-slate-200 p-4 shadow-xs mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#164e63] text-white shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
                Penyimpanan & Partisi Sekolah
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Tombol hapus dan kelola partisi database per sekolah telah dipindahkan ke menu <strong>Pengaturan &gt; Penyimpanan</strong>.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab ? onNavigateTab('settings') : onSelectCategory ? onSelectCategory('Penyimpanan') : null}
            className="px-3.5 py-2 border border-[#164e63] text-[#164e63] hover:bg-cyan-50 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <span>Buka Pengaturan Penyimpanan</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
