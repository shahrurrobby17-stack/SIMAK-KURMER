import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  School, 
  Edit3, 
  ShieldCheck, 
  X, 
  Database,
  Filter,
  Check,
  MapPin,
  UserCheck,
  ArrowRight
} from 'lucide-react';
import { RegisteredSchool, UserAccount, TeacherProfile } from '../../types';
import { normalizeSchoolId, deduplicateSchools } from '../../lib/firebaseService';

interface RegisteredSchoolsTableViewProps {
  registeredSchools: RegisteredSchool[];
  activeSchoolName: string;
  onSelectSchoolStorage?: (school: RegisteredSchool) => void;
  onRegisterSchool?: (newSchool: Partial<RegisteredSchool> & { name: string }) => Promise<void> | void;
  onDeleteSchoolStorage?: (schoolId: string, schoolName?: string) => Promise<boolean> | boolean | void;
  onNavigateToDetail?: (schoolName: string) => void;
  currentUser?: UserAccount | null;
  teacher?: TeacherProfile;
}

export const RegisteredSchoolsTableView: React.FC<RegisteredSchoolsTableViewProps> = ({
  registeredSchools,
  activeSchoolName,
  onSelectSchoolStorage,
  onRegisterSchool,
  onDeleteSchoolStorage,
  onNavigateToDetail,
  currentUser,
  teacher
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterJenjang, setFilterJenjang] = useState<string>('Semua');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');

  // Modal State for Tambah Sekolah
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastFeedback, setToastFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    npsn: '',
    jenjang: 'SMA',
    statusSekolah: 'Swasta',
    akreditasi: 'A (Unggul)',
    principalName: '',
    principalNip: '',
    city: 'Kab. Malang',
    address: '',
    phone: '',
    email: ''
  });

  const isAdministrator = Boolean(
    currentUser?.email === 'shahrurrobby17@gmail.com' ||
    currentUser?.role?.toLowerCase().includes('admin') ||
    currentUser?.role?.toLowerCase().includes('master') ||
    teacher?.id === 'PROF-ADMIN'
  );

  // Filtered schools
  const filteredSchools = useMemo(() => {
    const list = deduplicateSchools(registeredSchools || []);
    return list.filter((s) => {
      const nameMatch = 
        (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.npsn || '').includes(searchTerm) ||
        (s.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.principalName || '').toLowerCase().includes(searchTerm.toLowerCase());

      const jenjangMatch = 
        filterJenjang === 'Semua' || 
        (s.jenjang || '').toLowerCase().includes(filterJenjang.toLowerCase());

      const statusMatch = 
        filterStatus === 'Semua' || 
        (s.statusSekolah || '').toLowerCase() === filterStatus.toLowerCase();

      return nameMatch && jenjangMatch && statusMatch;
    });
  }, [registeredSchools, searchTerm, filterJenjang, filterStatus]);

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Nama sekolah wajib diisi!');
      return;
    }
    if (!formData.npsn.trim()) {
      alert('NPSN sekolah wajib diisi!');
      return;
    }

    setIsSubmitting(true);
    try {
      const sId = normalizeSchoolId(formData.name.trim());
      const payload = {
        id: sId,
        name: formData.name.trim(),
        npsn: formData.npsn.trim(),
        jenjang: formData.jenjang,
        statusSekolah: formData.statusSekolah,
        akreditasi: formData.akreditasi,
        principalName: formData.principalName.trim() || 'Kepala Sekolah',
        principalNip: formData.principalNip.trim() || '-',
        city: formData.city.trim() || 'Kab. Malang',
        address: formData.address.trim() || '',
        phone: formData.phone.trim() || '',
        email: formData.email.trim() || '',
        academicYear: '2026/2027',
        semester: 'Ganjil'
      };

      if (onRegisterSchool) {
        await onRegisterSchool(payload);
      }

      setToastFeedback({
        type: 'success',
        message: `Sekolah "${formData.name.trim()}" (NPSN: ${formData.npsn.trim()}) berhasil ditambahkan!`
      });

      setShowAddModal(false);
      setFormData({
        name: '',
        npsn: '',
        jenjang: 'SMA',
        statusSekolah: 'Swasta',
        akreditasi: 'A (Unggul)',
        principalName: '',
        principalNip: '',
        city: 'Kab. Malang',
        address: '',
        phone: '',
        email: ''
      });

      setTimeout(() => setToastFeedback(null), 4000);
    } catch (err: any) {
      alert(`Gagal menambah sekolah: ${err?.message || 'Kesalahan sistem'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (school: RegisteredSchool) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data sekolah "${school.name}"? Data penyimpanan terkait akan dibersihkan.`)) {
      return;
    }

    setDeletingId(school.id);
    try {
      if (onDeleteSchoolStorage) {
        await onDeleteSchoolStorage(school.id, school.name);
      }
      setToastFeedback({
        type: 'success',
        message: `Sekolah "${school.name}" berhasil dihapus dari daftar!`
      });
      setTimeout(() => setToastFeedback(null), 4000);
    } catch (err: any) {
      alert(`Gagal menghapus sekolah: ${err?.message || 'Terjadi kesalahan'}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      {/* Toast Feedback Notification */}
      {toastFeedback && (
        <div className="fixed top-6 right-6 z-50 bg-white border border-emerald-300 shadow-2xl p-4 flex items-center gap-3 animate-in fade-in zoom-in-90">
          <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Check className="w-5 h-5 stroke-[3]" />
          </div>
          <div>
            <span className="text-xs font-black text-slate-900 block">Sistem Berhasil</span>
            <span className="text-xs text-slate-600 font-semibold">{toastFeedback.message}</span>
          </div>
        </div>
      )}

      {/* Title & Quick Stats Bar */}
      <div className="bg-white border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#164e63] text-white shrink-0 shadow-xs">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                Daftar Sekolah Terdaftar
              </h1>
              <span className="px-2.5 py-0.5 text-[11px] font-extrabold bg-cyan-100 text-cyan-900 border border-cyan-200">
                Total: {registeredSchools.length} Sekolah
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar seluruh satuan pendidikan terdaftar yang dapat dikelola dalam sistem SIMAK
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#164e63] hover:bg-cyan-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95 shrink-0 self-start sm:self-center"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tambah Sekolah</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama sekolah, NPSN, kepala sekolah, atau kota..."
            className="w-full pl-9 pr-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-300 focus:bg-white focus:border-[#164e63] focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-bold text-slate-600">Jenjang:</span>
            <select
              value={filterJenjang}
              onChange={(e) => setFilterJenjang(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="Semua">Semua Jenjang</option>
              <option value="SD">SD / MI</option>
              <option value="SMP">SMP / MTs</option>
              <option value="SMA">SMA / MA / SMK</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-slate-600">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="Semua">Semua Status</option>
              <option value="Negeri">Negeri</option>
              <option value="Swasta">Swasta</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#164e63] text-white font-extrabold uppercase tracking-wider">
                <th className="py-3 px-3.5 text-center w-12 border-r border-cyan-800">No</th>
                <th className="py-3 px-3.5 border-r border-cyan-800">Nama Sekolah & Legalitas</th>
                <th className="py-3 px-3.5 border-r border-cyan-800 text-center w-28">NPSN</th>
                <th className="py-3 px-3.5 border-r border-cyan-800">Kepala Sekolah & NIP</th>
                <th className="py-3 px-3.5 border-r border-cyan-800">Kota / Alamat</th>
                <th className="py-3 px-3.5 border-r border-cyan-800 text-center w-28">Status Storage</th>
                <th className="py-3 px-3.5 text-center w-36">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredSchools.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-bold bg-slate-50">
                    Tidak ada data sekolah terdaftar yang sesuai dengan pencarian atau filter Anda.
                  </td>
                </tr>
              ) : (
                filteredSchools.map((sch, idx) => {
                  const isActive = sch.name.toLowerCase().trim() === activeSchoolName.toLowerCase().trim();

                  return (
                    <tr 
                      key={sch.id || idx}
                      className={`hover:bg-cyan-50/50 transition-colors ${
                        isActive ? 'bg-cyan-50/80 font-semibold' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                      }`}
                    >
                      {/* No */}
                      <td className="py-3 px-3.5 text-center font-bold text-slate-600 border-r border-slate-200">
                        {idx + 1}
                      </td>

                      {/* Nama Sekolah & Legalitas */}
                      <td className="py-3 px-3.5 border-r border-slate-200">
                        <div className="flex items-start gap-2.5">
                          <div className={`p-2 shrink-0 ${isActive ? 'bg-[#164e63] text-white' : 'bg-slate-100 text-slate-700'}`}>
                            <School className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                                {sch.name}
                              </span>
                              {isActive && (
                                <span className="px-1.5 py-0.2 text-[9px] font-black bg-emerald-600 text-white rounded-none">
                                  AKTIF
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-cyan-100 text-cyan-900 border border-cyan-200">
                                {sch.jenjang || 'SMA'}
                              </span>
                              <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-slate-100 text-slate-800 border border-slate-200">
                                {sch.statusSekolah || 'Swasta'}
                              </span>
                              {sch.akreditasi && (
                                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                                  Akred: {sch.akreditasi}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* NPSN */}
                      <td className="py-3 px-3.5 text-center border-r border-slate-200 font-mono font-bold text-[#164e63] text-xs">
                        {sch.npsn === '20500000' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-300">
                            Belum Terverifikasi
                          </span>
                        ) : (
                          sch.npsn || '20517834'
                        )}
                      </td>

                      {/* Kepala Sekolah */}
                      <td className="py-3 px-3.5 border-r border-slate-200">
                        <div className="font-bold text-slate-900">{sch.principalName || 'Kepala Sekolah'}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          NIP: {sch.principalNip || '-'}
                        </div>
                      </td>

                      {/* Kota / Alamat */}
                      <td className="py-3 px-3.5 border-r border-slate-200">
                        <div className="font-bold text-slate-800 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{sch.city || 'Kab. Malang'}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[200px]" title={sch.address}>
                          {sch.address || '-'}
                        </div>
                      </td>

                      {/* Status Storage */}
                      <td className="py-3 px-3.5 text-center border-r border-slate-200">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Tersambung
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            <Database className="w-3 h-3 text-slate-400" />
                            Siap Pilih
                          </span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {!isActive && onSelectSchoolStorage && (
                            <button
                              type="button"
                              onClick={() => onSelectSchoolStorage(sch)}
                              title="Pilih dan hubungkan ke sekolah ini"
                              className="px-2 py-1 bg-[#164e63] hover:bg-cyan-800 text-white font-bold text-[10px] flex items-center gap-1 shadow-2xs transition-all cursor-pointer active:scale-95"
                            >
                              <span>Pilih</span>
                            </button>
                          )}

                          {onNavigateToDetail && (
                            <button
                              type="button"
                              onClick={() => onNavigateToDetail(sch.name)}
                              title="Kelola detail data sekolah"
                              className="px-2 py-1 bg-sky-100 hover:bg-sky-200 border border-sky-300 text-sky-900 font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Data</span>
                            </button>
                          )}

                          {isAdministrator && registeredSchools.length > 1 && (
                            <button
                              type="button"
                              disabled={deletingId === sch.id}
                              onClick={() => handleDelete(sch)}
                              title="Hapus data sekolah"
                              className="p-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog Tambah Sekolah Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
            {/* Header Modal */}
            <div className="bg-[#164e63] text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-cyan-200" />
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">Tambah Sekolah Baru</h3>
                  <p className="text-[11px] text-cyan-100">Daftarkan satuan pendidikan baru ke dalam sistem SIMAK</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-cyan-700/80 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleCreateSchool} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Jenjang */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jenjang Pendidikan *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['SD/MI', 'SMP/MTS', 'SMA/MA', 'SMK'].map((j) => (
                    <button
                      key={j}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, jenjang: j.startsWith('SD') ? 'SD' : j.startsWith('SMP') ? 'SMP' : j.startsWith('SMA') ? 'SMA' : 'SMK' }))}
                      className={`py-2 text-xs font-bold border text-center transition-all cursor-pointer ${
                        (formData.jenjang === 'SD' && j.startsWith('SD')) ||
                        (formData.jenjang === 'SMP' && j.startsWith('SMP')) ||
                        (formData.jenjang === 'SMA' && j.startsWith('SMA')) ||
                        (formData.jenjang === 'SMK' && j.startsWith('SMK'))
                          ? 'bg-[#164e63] text-white border-[#164e63] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {j}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nama Sekolah */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Resmi Sekolah *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Contoh: SMA Diponegoro Wagir"
                  className="w-full px-3 py-2 border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-50"
                />
              </div>

              {/* NPSN & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NPSN Sekolah *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.npsn}
                    onChange={(e) => setFormData(prev => ({ ...prev, npsn: e.target.value }))}
                    placeholder="Contoh: 20517834"
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-50 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status Sekolah *
                  </label>
                  <select
                    value={formData.statusSekolah}
                    onChange={(e) => setFormData(prev => ({ ...prev, statusSekolah: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-50 cursor-pointer"
                  >
                    <option value="Swasta">Swasta</option>
                    <option value="Negeri">Negeri</option>
                  </select>
                </div>
              </div>

              {/* Akreditasi & Kota/Kab */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Akreditasi
                  </label>
                  <select
                    value={formData.akreditasi}
                    onChange={(e) => setFormData(prev => ({ ...prev, akreditasi: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-50 cursor-pointer"
                  >
                    <option value="A (Unggul)">A (Unggul)</option>
                    <option value="B (Baik)">B (Baik)</option>
                    <option value="C (Cukup)">C (Cukup)</option>
                    <option value="Belum Terakreditasi">Belum Terakreditasi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kota / Kabupaten
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Contoh: Kab. Malang"
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-50"
                  />
                </div>
              </div>

              {/* Kepala Sekolah & NIP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Kepala Sekolah
                  </label>
                  <input
                    type="text"
                    value={formData.principalName}
                    onChange={(e) => setFormData(prev => ({ ...prev, principalName: e.target.value }))}
                    placeholder="Nama lengkap & gelar"
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NIP Kepala Sekolah
                  </label>
                  <input
                    type="text"
                    value={formData.principalNip}
                    onChange={(e) => setFormData(prev => ({ ...prev, principalNip: e.target.value }))}
                    placeholder="Contoh: 1970..."
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-50 font-mono"
                  />
                </div>
              </div>

              {/* Footer Modal Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#164e63] hover:bg-cyan-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Sekolah Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
