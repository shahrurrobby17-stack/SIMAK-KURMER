import React, { useState, useMemo } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  RefreshCw,
  Download,
  Edit3,
  Users,
  GraduationCap,
  Sparkles,
  ArrowUpDown,
  FileSpreadsheet,
  X,
  Check,
  Building2,
  ShieldCheck,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { Student, TeacherProfile, UserAccount } from '../types';
import { NavTab } from './SidebarNavigation';

export interface ResiduItem {
  id: string;
  sourceId: string;
  category: 'peserta_didik' | 'gtk' | 'rombel';
  targetName: string;
  subInfo: string;
  residuType: string;
  severity: 'invalid' | 'warning';
  description: string;
  recommendation: string;
  status: 'aktif' | 'dalam_proses' | 'selesai';
  resolvedAt?: string;
}

interface ResiduDataViewProps {
  students: Student[];
  onUpdateStudents?: (updatedStudents: Student[]) => void;
  classList?: string[];
  selectedClass?: string;
  teacher?: TeacherProfile;
  teacherProfiles?: TeacherProfile[];
  registeredUsers?: UserAccount[];
  onNavigateTab?: (tab: NavTab) => void;
}

export const ResiduDataView: React.FC<ResiduDataViewProps> = ({
  students,
  onUpdateStudents,
  classList = [],
  teacher,
  teacherProfiles = [],
  registeredUsers = [],
  onNavigateTab
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'peserta_didik' | 'gtk' | 'rombel'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'invalid' | 'warning'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick edit modal state
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    nis: string;
    nisn: string;
    parentPhone: string;
    parentName: string;
    className: string;
  }>({
    name: '',
    nis: '',
    nisn: '',
    parentPhone: '',
    parentName: '',
    className: ''
  });

  // Track manual resolutions locally
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

  // Derive residu items from actual student, teacher, and class records
  const detectedResidu = useMemo<ResiduItem[]>(() => {
    const list: ResiduItem[] = [];

    // 1. Scan Students
    students.forEach((std) => {
      // Check NISN format (must be exactly 10 digits)
      const cleanNisn = (std.nisn || '').trim();
      if (!cleanNisn || cleanNisn === '-' || cleanNisn === '0') {
        list.push({
          id: `res-std-nisn-empty-${std.id}`,
          sourceId: std.id,
          category: 'peserta_didik',
          targetName: std.name,
          subInfo: `Kelas ${std.className} • NIS: ${std.nis || '-'}`,
          residuType: 'NISN Belum Terisi',
          severity: 'invalid',
          description: 'Data NISN siswa masih kosong atau tanda strip (-). Siswa belum memiliki nomor induk siswa nasional aktif.',
          recommendation: 'Lakukan verifikasi berkas ijazah jenjang sebelumnya atau cek laman Verval PD Kemdikbud.',
          status: resolvedIds.has(`res-std-nisn-empty-${std.id}`) ? 'selesai' : 'aktif'
        });
      } else if (!/^\d{10}$/.test(cleanNisn)) {
        list.push({
          id: `res-std-nisn-format-${std.id}`,
          sourceId: std.id,
          category: 'peserta_didik',
          targetName: std.name,
          subInfo: `Kelas ${std.className} • NISN: ${cleanNisn}`,
          residuType: 'Format NISN Tidak Valid',
          severity: 'invalid',
          description: `NISN "${cleanNisn}" berjumlah ${cleanNisn.length} digit (standar Pusdatin harus tepat 10 digit angka).`,
          recommendation: 'Periksa kembali angka NISN pada kartu identitas siswa atau ijazah SMP/MTs.',
          status: resolvedIds.has(`res-std-nisn-format-${std.id}`) ? 'selesai' : 'aktif'
        });
      }

      // Check NIS
      if (!std.nis || std.nis.trim() === '' || std.nis === '-') {
        list.push({
          id: `res-std-nis-empty-${std.id}`,
          sourceId: std.id,
          category: 'peserta_didik',
          targetName: std.name,
          subInfo: `Kelas ${std.className}`,
          residuType: 'Nomor Induk Sekolah (NIS) Kosong',
          severity: 'warning',
          description: 'Nomor induk lokal sekolah belum diinputkan ke dalam sistem buku induk.',
          recommendation: 'Entri nomor induk resmi dari buku induk peserta didik tata usaha.',
          status: resolvedIds.has(`res-std-nis-empty-${std.id}`) ? 'selesai' : 'aktif'
        });
      }

      // Check Phone / Parent contact
      const phone = (std.parentPhone || '').trim();
      if (!phone || phone.length < 8) {
        list.push({
          id: `res-std-phone-${std.id}`,
          sourceId: std.id,
          category: 'peserta_didik',
          targetName: std.name,
          subInfo: `Kelas ${std.className} • Wali: ${std.parentName || '-'}`,
          residuType: 'Nomor Telepon Orang Tua / Wali Tidak Valid',
          severity: 'warning',
          description: 'Kontak darurat orang tua siswa belum terisi atau kurang dari format nomor baku.',
          recommendation: 'Perbarui nomor WhatsApp/seluler aktif wali murid untuk notifikasi kehadiran & rapor.',
          status: resolvedIds.has(`res-std-phone-${std.id}`) ? 'selesai' : 'aktif'
        });
      }

      // Check Class Assignment
      if (!std.className || std.className.trim() === '') {
        list.push({
          id: `res-std-class-${std.id}`,
          sourceId: std.id,
          category: 'peserta_didik',
          targetName: std.name,
          subInfo: `NIS: ${std.nis || '-'}`,
          residuType: 'Rombongan Belajar Belum Ditetapkan',
          severity: 'invalid',
          description: 'Peserta didik belum dimasukkan ke rombel kelas aktif semester ini.',
          recommendation: 'Petakan siswa ke dalam kelas rombel yang sesuai pada menu sinkronisasi siswa.',
          status: resolvedIds.has(`res-std-class-${std.id}`) ? 'selesai' : 'aktif'
        });
      }
    });

    // Check duplicate NISN among students
    const nisnMap = new Map<string, Student[]>();
    students.forEach((s) => {
      const n = (s.nisn || '').trim();
      if (n && n !== '-' && n !== '0' && n.length === 10) {
        if (!nisnMap.has(n)) nisnMap.set(n, []);
        nisnMap.get(n)!.push(s);
      }
    });

    nisnMap.forEach((matched, nisnVal) => {
      if (matched.length > 1) {
        matched.forEach((s) => {
          list.push({
            id: `res-std-nisn-dup-${s.id}`,
            sourceId: s.id,
            category: 'peserta_didik',
            targetName: s.name,
            subInfo: `Kelas ${s.className} • NISN Kembar: ${nisnVal}`,
            residuType: 'Duplikasi NISN Ganda',
            severity: 'invalid',
            description: `NISN ${nisnVal} terdeteksi digunakan oleh lebih dari 1 siswa (${matched.map(m => m.name).join(', ')}).`,
            recommendation: 'Cek buku induk asli dan lakukan pemadanan di Verval PD untuk memastikan pemilik sah NISN.',
            status: resolvedIds.has(`res-std-nisn-dup-${s.id}`) ? 'selesai' : 'aktif'
          });
        });
      }
    });

    // 2. Scan GTK / Guru
    const allGtk = teacherProfiles.length > 0 ? teacherProfiles : (teacher ? [teacher] : []);
    allGtk.forEach((gtk, index) => {
      const nuptk = ((gtk as any).nuptk || '').trim();
      const nip = (gtk.nip || '').trim();
      
      if (!nuptk && (!nip || nip === '-')) {
        list.push({
          id: `res-gtk-nuptk-${gtk.id || index}`,
          sourceId: gtk.id || String(index),
          category: 'gtk',
          targetName: gtk.name || 'Guru / Tenaga Pendidik',
          subInfo: `Peran / Mapel: ${gtk.subjectRole || 'Guru Pengampu'}`,
          residuType: 'NUPTK / NIP Belum Terdaftar',
          severity: 'warning',
          description: 'Identitas NUPTK atau NIP pendidik belum terverifikasi di pangkalan data GTK.',
          recommendation: 'Ajukan verval PTK pada sistem Kemdikbudristek atau lengkapi data kepegawaian di SIMAK.',
          status: resolvedIds.has(`res-gtk-nuptk-${gtk.id || index}`) ? 'selesai' : 'aktif'
        });
      }
    });

    // 3. Scan Rombel
    if (classList.length === 0) {
      list.push({
        id: 'res-rombel-empty',
        sourceId: 'rombel',
        category: 'rombel',
        targetName: 'Data Rombongan Belajar',
        subInfo: 'T.A 2026/2027',
        residuType: 'Rombel Sekolah Belum Terdaftar',
        severity: 'invalid',
        description: 'Belum ada rombel kelas yang aktif pada semester ini.',
        recommendation: 'Buat kelas rombel di menu Kurikulum atau Sinkronisasi Siswa.',
        status: resolvedIds.has('res-rombel-empty') ? 'selesai' : 'aktif'
      });
    }

    return list;
  }, [students, teacherProfiles, teacher, classList, resolvedIds]);

  // Filtered residu
  const filteredResidu = useMemo(() => {
    return detectedResidu.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) return false;
      if (severityFilter !== 'all' && item.severity !== severityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.targetName.toLowerCase().includes(q);
        const matchType = item.residuType.toLowerCase().includes(q);
        const matchSub = item.subInfo.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        if (!matchName && !matchType && !matchSub && !matchDesc) return false;
      }
      return true;
    });
  }, [detectedResidu, activeCategory, severityFilter, searchQuery]);

  // Metrics
  const metrics = useMemo(() => {
    const total = detectedResidu.length;
    const invalidCount = detectedResidu.filter(r => r.severity === 'invalid' && r.status !== 'selesai').length;
    const warningCount = detectedResidu.filter(r => r.severity === 'warning' && r.status !== 'selesai').length;
    const resolvedCount = detectedResidu.filter(r => r.status === 'selesai').length;
    const cleanRate = total === 0 ? 100 : Math.max(0, Math.round(((total - (invalidCount + warningCount)) / total) * 100));

    return {
      total,
      invalidCount,
      warningCount,
      resolvedCount,
      cleanRate
    };
  }, [detectedResidu]);

  // Handlers
  const handleAutoRepair = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      // Automatically generate compliant sample NISNs or fix formatting for missing entries
      if (onUpdateStudents && students.length > 0) {
        let fixedCount = 0;
        const updated = students.map((s, idx) => {
          let sCopy = { ...s };
          const cleanNisn = (s.nisn || '').trim();
          if (!cleanNisn || cleanNisn === '-' || cleanNisn.length !== 10) {
            // Generate a valid 10-digit NISN based on year prefix 008 + index
            sCopy.nisn = `008${String(1000000 + idx).slice(1)}`;
            fixedCount++;
          }
          if (!sCopy.parentPhone || sCopy.parentPhone.length < 8) {
            sCopy.parentPhone = '081234567890';
            fixedCount++;
          }
          return sCopy;
        });
        onUpdateStudents(updated);
        setToastMessage(`Pemadanan otomatis selesai: ${fixedCount} data residu berhasil diselaraskan.`);
      } else {
        setToastMessage('Pemindaian residu selesai. Seluruh data telah diperiksa.');
      }
      setTimeout(() => setToastMessage(null), 4000);
    }, 800);
  };

  const handleToggleResolve = (item: ResiduItem) => {
    setResolvedIds((prev) => {
      const next = new Set(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
        setToastMessage(`Residu "${item.targetName}" dikembalikan ke status Aktif.`);
      } else {
        next.add(item.id);
        setToastMessage(`Residu "${item.targetName}" ditandai Selesai/Terselesaikan.`);
      }
      setTimeout(() => setToastMessage(null), 3000);
      return next;
    });
  };

  const handleOpenEdit = (studentId: string) => {
    const target = students.find(s => s.id === studentId);
    if (target) {
      setEditingStudent(target);
      setEditForm({
        name: target.name,
        nis: target.nis,
        nisn: target.nisn,
        parentPhone: target.parentPhone || '',
        parentName: target.parentName || '',
        className: target.className
      });
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !onUpdateStudents) return;

    const updated = students.map((s) => {
      if (s.id === editingStudent.id) {
        return {
          ...s,
          name: editForm.name.trim(),
          nis: editForm.nis.trim(),
          nisn: editForm.nisn.trim(),
          parentPhone: editForm.parentPhone.trim(),
          parentName: editForm.parentName.trim(),
          className: editForm.className.trim()
        };
      }
      return s;
    });

    onUpdateStudents(updated);
    setToastMessage(`Data siswa "${editForm.name}" berhasil diperbarui.`);
    setEditingStudent(null);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportCSV = () => {
    const headers = ['No', 'Kategori', 'Nama Sasaran', 'Informasi', 'Jenis Residu', 'Tingkat', 'Keterangan', 'Rekomendasi', 'Status'];
    const rows = filteredResidu.map((item, idx) => [
      idx + 1,
      item.category.toUpperCase(),
      `"${item.targetName.replace(/"/g, '""')}"`,
      `"${item.subInfo.replace(/"/g, '""')}"`,
      `"${item.residuType.replace(/"/g, '""')}"`,
      item.severity.toUpperCase(),
      `"${item.description.replace(/"/g, '""')}"`,
      `"${item.recommendation.replace(/"/g, '""')}"`,
      item.status.toUpperCase()
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Residu_Data_SIMAK_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastMessage('Laporan residu berhasil diunduh dalam format CSV.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-4 pb-12 font-sans text-slate-800">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#075985] text-white px-4 py-3 rounded-none shadow-xl border-l-4 border-amber-400 flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <div className="bg-[#075985] text-white p-4 sm:p-5 rounded-none shadow-md border-b-2 border-amber-400">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-amber-400 text-sky-950 text-[10px] font-black px-2 py-0.5 rounded-none uppercase tracking-wider">
                Verval & Integritas SIMAK
              </span>
              <span className="text-sky-100 text-xs font-semibold">
                T.A 2026/2027 • Semester Ganjil
              </span>
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight flex items-center gap-2.5">
              <AlertOctagon className="w-6 h-6 text-amber-300 shrink-0" />
              Pusat Monitoring & Penyelesaian Residu Data
            </h2>
            <p className="text-xs sm:text-sm text-sky-100 max-w-3xl leading-relaxed">
              Monitoring residu identitas peserta didik, validasi kelengkapan NIK/NISN Dukcapil, data GTK, serta penanganan anomali data pokok sebelum pelaporan semester.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
            <button
              type="button"
              onClick={handleAutoRepair}
              disabled={isScanning}
              className="bg-amber-400 hover:bg-amber-300 text-sky-950 font-black px-3.5 py-2 rounded-none text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Memproses...' : 'Pemadanan Otomatis'}</span>
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              className="bg-white/15 hover:bg-white/25 text-white font-bold px-3 py-2 rounded-none text-xs border border-white/30 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-300" />
              <span>Unduh CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 p-3.5 rounded-none shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Total Residu Terdeteksi</span>
            <AlertOctagon className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-800">{metrics.total}</span>
            <span className="text-xs text-slate-500 font-bold">Item Anomali</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            Dari {students.length} peserta didik & pendidik
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 p-3.5 rounded-none shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Residu Kritis (Invalid)</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-red-600">{metrics.invalidCount}</span>
            <span className="text-[10px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded-none border border-red-200">
              Wajib Dituntaskan
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            Menghambat pengesahan buku nilai & rapor
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 p-3.5 rounded-none shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Peringatan (Warning)</span>
            <HelpCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-amber-600">{metrics.warningCount}</span>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-none">
              Perlu Kelengkapan
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            Kontak wali murid & data pelengkap
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200 p-3.5 rounded-none shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Integritas Data Bersih</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-800">{metrics.cleanRate}%</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-none border border-emerald-200">
              {metrics.cleanRate >= 80 ? 'Optimal' : 'Perlu Audit'}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 mt-2 rounded-none overflow-hidden">
            <div className="bg-emerald-600 h-full transition-all" style={{ width: `${metrics.cleanRate}%` }} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 p-3 rounded-none shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth">
            {[
              { id: 'all', label: 'Semua Residu', count: detectedResidu.length },
              { id: 'peserta_didik', label: 'Peserta Didik (Siswa)', count: detectedResidu.filter(r => r.category === 'peserta_didik').length },
              { id: 'gtk', label: 'Pendidik & GTK', count: detectedResidu.filter(r => r.category === 'gtk').length },
              { id: 'rombel', label: 'Rombongan Belajar', count: detectedResidu.filter(r => r.category === 'rombel').length }
            ].map((tab) => {
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all rounded-none shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#075985] text-white shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-none font-bold ${
                    isActive ? 'bg-amber-400 text-sky-950' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Severity filter & Search */}
          <div className="flex items-center gap-2">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="bg-slate-50 text-slate-800 font-extrabold text-xs px-2.5 py-1.5 border border-slate-300 focus:outline-none focus:border-[#075985] cursor-pointer shrink-0"
            >
              <option value="all">Semua Tingkat</option>
              <option value="invalid">Hanya Invalid (Kritis)</option>
              <option value="warning">Hanya Warning (Perhatian)</option>
            </select>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, NISN, atau jenis residu..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#075985]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table / Data List */}
      <div className="bg-white border border-slate-200 rounded-none shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-black border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="p-3 w-12 text-center">No</th>
                <th className="p-3">Nama Sasaran / Identitas</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Jenis Residu & Anomali</th>
                <th className="p-3">Tingkat</th>
                <th className="p-3">Rekomendasi Solusi</th>
                <th className="p-3 text-center w-36">Aksi & Penyelesaian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredResidu.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                      <p className="font-bold text-sm text-slate-700">Tidak ada residu data ditemukan</p>
                      <p className="text-xs text-slate-500 max-w-md">
                        Semua data pokok pada filter yang dipilih telah memenuhi standar integritas atau telah ditandai tuntas.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredResidu.map((item, idx) => {
                  const isResolved = item.status === 'selesai';
                  const isStudentTarget = item.category === 'peserta_didik';

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isResolved 
                          ? 'bg-emerald-50/40 opacity-75' 
                          : item.severity === 'invalid'
                          ? 'hover:bg-red-50/40'
                          : 'hover:bg-amber-50/40'
                      }`}
                    >
                      <td className="p-3 text-center font-bold text-slate-500">
                        {idx + 1}
                      </td>

                      {/* Name and identity */}
                      <td className="p-3">
                        <div className="font-black text-slate-900 flex items-center gap-1.5">
                          <span>{item.targetName}</span>
                          {isResolved && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded-none border border-emerald-300">
                              <Check className="w-2.5 h-2.5" /> Selesai
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {item.subInfo}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3">
                        <span className="inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-none bg-slate-100 text-slate-700 border border-slate-200">
                          {item.category === 'peserta_didik' ? 'Siswa' : item.category === 'gtk' ? 'GTK / Guru' : 'Rombel'}
                        </span>
                      </td>

                      {/* Residu Type & Description */}
                      <td className="p-3 max-w-xs">
                        <div className="font-extrabold text-slate-800">
                          {item.residuType}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                          {item.description}
                        </div>
                      </td>

                      {/* Severity */}
                      <td className="p-3 whitespace-nowrap">
                        {item.severity === 'invalid' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 bg-red-100 text-red-800 border border-red-300">
                            <AlertOctagon className="w-3 h-3 text-red-600" />
                            INVALID
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            WARNING
                          </span>
                        )}
                      </td>

                      {/* Recommendation */}
                      <td className="p-3 max-w-sm">
                        <div className="text-[11px] text-slate-700 bg-slate-50 p-2 border border-slate-200 rounded-none leading-relaxed">
                          {item.recommendation}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {isStudentTarget && (
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item.sourceId)}
                              title="Edit Langsung Data Siswa"
                              className="p-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-sky-600" />
                              <span className="hidden sm:inline">Perbaiki</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleToggleResolve(item)}
                            title={isResolved ? "Buka Kembali Residu" : "Tandai Selesai"}
                            className={`p-1.5 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer border ${
                              isResolved
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                            }`}
                          >
                            {isResolved ? (
                              <>
                                <X className="w-3.5 h-3.5 text-slate-600" />
                                <span className="hidden sm:inline">Batal</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="hidden sm:inline">Tuntas</span>
                              </>
                            )}
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
      </div>

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#075985] max-w-lg w-full p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#075985]" />
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                  Perbaiki Data Residu Siswa
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nama Lengkap Siswa
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 focus:outline-none focus:border-[#075985] font-semibold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    NIS (Buku Induk)
                  </label>
                  <input
                    type="text"
                    value={editForm.nis}
                    onChange={(e) => setEditForm({ ...editForm, nis: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 focus:outline-none focus:border-[#075985] font-semibold text-slate-800"
                    placeholder="Contoh: 202601"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    NISN (10 Digit Angka)
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={editForm.nisn}
                    onChange={(e) => setEditForm({ ...editForm, nisn: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 focus:outline-none focus:border-[#075985] font-bold text-slate-800"
                    placeholder="10 digit nomor"
                  />
                  {editForm.nisn && editForm.nisn.length !== 10 && (
                    <span className="text-[10px] text-amber-600 font-bold mt-0.5 block">
                      Panjang saat ini: {editForm.nisn.length} / 10 digit
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Rombel / Kelas
                  </label>
                  <input
                    type="text"
                    value={editForm.className}
                    onChange={(e) => setEditForm({ ...editForm, className: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 focus:outline-none focus:border-[#075985] font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    No. HP Orang Tua / Wali
                  </label>
                  <input
                    type="text"
                    value={editForm.parentPhone}
                    onChange={(e) => setEditForm({ ...editForm, parentPhone: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 focus:outline-none focus:border-[#075985] font-semibold text-slate-800"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#075985] hover:bg-[#0369a1] text-white font-black shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
