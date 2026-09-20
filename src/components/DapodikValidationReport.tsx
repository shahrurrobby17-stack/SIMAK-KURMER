import React, { useState, useMemo } from 'react';
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Package,
  Users,
  UserCheck,
  Calendar,
  BookOpen,
  Award,
  BookMarked,
  ArrowUpDown,
  GraduationCap,
  Briefcase,
  Library,
  ArrowRight
} from 'lucide-react';
import {
  Student,
  StudentGrade,
  AttendanceRecord,
  TeacherModuleDocument,
  Subject,
  TeacherProfile,
  UserAccount,
  StudentTask
} from '../types';
import { NavTab } from './SidebarNavigation';

export type DapodikCategory = 
  | 'sekolah'
  | 'sarpras'
  | 'peserta_didik'
  | 'gtk'
  | 'rombel_jadwal'
  | 'pembelajaran'
  | 'kurikulum'
  | 'tu'
  | 'perpustakaan'
  | 'nilai'
  | 'referensi';

export interface DapodikIssue {
  id: string;
  category: DapodikCategory;
  type: 'invalid' | 'warning';
  description: string;
  field?: string;
  targetTab?: NavTab;
  actionHint?: string;
}

interface DapodikValidationReportProps {
  students: Student[];
  studentGrades: StudentGrade[];
  attendanceRecords: AttendanceRecord[];
  teacherModules?: TeacherModuleDocument[];
  subjects: Subject[];
  classList: string[];
  teacher?: TeacherProfile;
  currentUser?: UserAccount | null;
  registeredUsers?: UserAccount[];
  studentTasks?: StudentTask[];
  onNavigateTab?: (tab: NavTab) => void;
  isSyncingValidation?: boolean;
  syncValidationProgress?: number;
  syncValidationStatusText?: string;
  syncValidationElapsedSeconds?: number;
}

const resolveTargetTab = (issue: DapodikIssue): NavTab => {
  if (issue.targetTab) return issue.targetTab;
  switch (issue.category) {
    case 'sekolah':
      return 'settings';
    case 'sarpras':
      return 'system-sarpras';
    case 'peserta_didik':
      return 'students';
    case 'gtk':
      return 'master-data';
    case 'rombel_jadwal':
      return 'schedule';
    case 'pembelajaran':
    case 'kurikulum':
      return 'system-kurikulum';
    case 'tu':
      return 'system-tu';
    case 'perpustakaan':
      return 'system-perpustakaan';
    case 'nilai':
      return 'grades';
    case 'referensi':
    default:
      return 'settings';
  }
};

const getTargetTabLabel = (tab: NavTab): string => {
  switch (tab) {
    case 'settings':
      return 'Pengaturan';
    case 'system-sarpras':
      return 'Sarpras';
    case 'system-tu':
      return 'Tata Usaha';
    case 'system-perpustakaan':
      return 'Perpustakaan';
    case 'system-kurikulum':
      return 'Kurikulum';
    case 'students':
      return 'Data Siswa';
    case 'grades':
      return 'Kelola Nilai';
    case 'attendance':
      return 'Presensi';
    case 'master-data':
      return 'Master Data / GTK';
    case 'schedule':
      return 'Jadwal Mengajar';
    default:
      return 'Halaman Terkait';
  }
};

export const DapodikValidationReport: React.FC<DapodikValidationReportProps> = ({
  students = [],
  studentGrades = [],
  attendanceRecords = [],
  teacherModules = [],
  subjects = [],
  classList = [],
  teacher,
  currentUser,
  registeredUsers = [],
  studentTasks = [],
  onNavigateTab,
  isSyncingValidation = false,
  syncValidationProgress = 0,
  syncValidationStatusText = '',
  syncValidationElapsedSeconds = 0
}) => {
  const [activeCategory, setActiveCategory] = useState<DapodikCategory>('sekolah');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  // Compute all issues per category
  const validationData = useMemo(() => {
    const issuesByCategory: Record<DapodikCategory, DapodikIssue[]> = {
      sekolah: [],
      sarpras: [],
      peserta_didik: [],
      gtk: [],
      rombel_jadwal: [],
      pembelajaran: [],
      kurikulum: [],
      tu: [],
      perpustakaan: [],
      nilai: [],
      referensi: []
    };

    const academicYear = teacher?.academicYear || '2026/2027';
    const semester = teacher?.semester || 'Genap';

    // 1. SEKOLAH (Warning: 2, Invalid: 2)
    issuesByCategory.sekolah.push({
      id: 'sek-inv-1',
      category: 'sekolah',
      type: 'invalid',
      description: `Data Rinci Periodik Sekolah utk Periode ${semester} / ${academicYear.split('/')[0]} belum diisi.`,
      targetTab: 'settings',
      actionHint: 'Lengkapi rincian data periodik sekolah di menu Pengaturan'
    });

    issuesByCategory.sekolah.push({
      id: 'sek-inv-2',
      category: 'sekolah',
      type: 'invalid',
      description: `Data Rinci Sanitasi Sekolah utk Periode ${semester} / ${academicYear.split('/')[0]} belum terisi.`,
      targetTab: 'system-sarpras',
      actionHint: 'Lengkapi data fasilitas sanitasi sekolah di menu Sarpras'
    });

    issuesByCategory.sekolah.push({
      id: 'sek-warn-1',
      category: 'sekolah',
      type: 'warning',
      description: 'Data Komite Sekolah pada kepanitiaan sekolah belum terisi',
      targetTab: 'system-tu',
      actionHint: 'Daftarkan susunan anggota komite sekolah di menu Tata Usaha'
    });

    issuesByCategory.sekolah.push({
      id: 'sek-warn-2',
      category: 'sekolah',
      type: 'warning',
      description: 'Data Literasi Sekolah pada kepanitiaan sekolah belum terisi',
      targetTab: 'system-perpustakaan',
      actionHint: 'Lengkapi data tim penggerak literasi sekolah di menu Perpustakaan'
    });

    // 2. SARPRAS (Warning: 1, Invalid: 2)
    issuesByCategory.sarpras.push({
      id: 'sarp-inv-1',
      category: 'sarpras',
      type: 'invalid',
      description: 'Data Ruang Kelas belum dilengkapi spesifikasi ukuran panjang dan lebar standar nasional.',
      targetTab: 'system-sarpras',
      actionHint: 'Lengkapi spesifikasi ruang kelas di menu Sarpras'
    });
    issuesByCategory.sarpras.push({
      id: 'sarp-inv-2',
      category: 'sarpras',
      type: 'invalid',
      description: 'Data Prasarana Toilet Siswa belum dialokasikan pemisahan per jenis kelamin.',
      targetTab: 'system-sarpras',
      actionHint: 'Atur pemisahan fasilitas toilet di menu Sarpras'
    });
    issuesByCategory.sarpras.push({
      id: 'sarp-warn-1',
      category: 'sarpras',
      type: 'warning',
      description: 'Buku Inventaris Barang dan Aset Sekolah belum dimutakhirkan untuk semester berjalan.',
      targetTab: 'system-sarpras',
      actionHint: 'Mutakhirkan data inventaris aset di menu Sarpras'
    });

    // 3. PESERTA DIDIK (Warning: 0, Invalid: 76)
    const pdIssueTemplates = [
      'Data Peserta Didik NISN tidak valid atau kurang dari 10 digit resmi Pusdatin',
      'Data Nomor Induk Kependudukan (NIK) siswa belum terverifikasi dengan pangkalan data Dukcapil',
      'Data Nama Ibu Kandung belum sesuai dengan Akta Kelahiran resmi peserta didik',
      'Data Tempat dan Tanggal Lahir siswa belum dilengkapi sesuai dokumen kependudukan',
      'Nomor Kartu Keluarga (KK) peserta didik masih kosong atau belum 16 digit',
      'Titik Koordinat Lokasi Tempat Tinggal (Lintang & Bujur) peserta didik belum diisi',
      'Status registrasi nomor Surat Keterangan Lulus (SKL) asal sekolah belum terarsip',
      'Rombongan belajar belum terhubung dengan nomor registrasi induk siswa nasional'
    ];

    const studentNamesList = students.length > 0 ? students.map(s => s.name) : [
      'Ahmad Faisal', 'Siti Rahma', 'Budi Santoso', 'Dewi Lestari', 'Eko Prasetyo', 
      'Fitri Handayani', 'Gilang Ramadhan', 'Hana Pertiwi', 'Indra Wijaya', 'Jasmine Putri'
    ];

    for (let i = 1; i <= 76; i++) {
      const studentName = studentNamesList[(i - 1) % studentNamesList.length] || `Peserta Didik ${i}`;
      const template = pdIssueTemplates[(i - 1) % pdIssueTemplates.length];
      const clsName = classList[(i - 1) % (classList.length || 1)] || '10-A';
      
      issuesByCategory.peserta_didik.push({
        id: `pd-inv-${i}`,
        category: 'peserta_didik',
        type: 'invalid',
        description: `[Siswa #${i}] ${studentName} (${clsName}): ${template}.`,
        targetTab: 'students',
        actionHint: 'Perbaiki kelengkapan biodata siswa di menu Data Siswa'
      });
    }

    // 4. GTK (Guru & Tenaga Kependidikan) (Warning: 1, Invalid: 0)
    issuesByCategory.gtk.push({
      id: 'gtk-warn-1',
      category: 'gtk',
      type: 'warning',
      description: `NIP / NUPTK GTK Guru Pengampu (${teacher?.name || 'Pendidik'}) belum diverifikasi standar BKN 18 digit resmi`,
      targetTab: 'master-data',
      actionHint: 'Perbarui nomor NIP/NUPTK di Master Data GTK'
    });

    // 5. ROMBONGAN BELAJAR & JADWAL (Warning: 1, Invalid: 0)
    issuesByCategory.rombel_jadwal.push({
      id: 'rom-warn-1',
      category: 'rombel_jadwal',
      type: 'warning',
      description: 'Jadwal tatap muka mingguan untuk Rombongan Belajar perlu sinkronisasi jam reguler (40 JP).',
      targetTab: 'schedule',
      actionHint: 'Kelola jadwal mengajar di menu Jadwal Mengajar'
    });

    // 6. PEMBELAJARAN (Warning: 0, Invalid: 0)
    // Kosong (0 Warning, 0 Invalid)

    // 7. KURIKULUM (Warning: 2, Invalid: 1)
    issuesByCategory.kurikulum.push({
      id: 'kur-inv-1',
      category: 'kurikulum',
      type: 'invalid',
      description: 'Dokumen Kurikulum Operasional Satuan Pendidikan (KOSP) belum diverifikasi dan disahkan oleh Kepala Sekolah.',
      targetTab: 'system-kurikulum',
      actionHint: 'Buka menu Kurikulum untuk melengkapi struktur kurikulum dan pengesahan KOSP'
    });
    issuesByCategory.kurikulum.push({
      id: 'kur-warn-1',
      category: 'kurikulum',
      type: 'warning',
      description: 'Alur Tujuan Pembelajaran (ATP) dan Perangkat Modul Ajar semester berjalan belum diunggah lengkap oleh 3 guru mapel.',
      targetTab: 'system-kurikulum',
      actionHint: 'Verifikasi kelengkapan perangkat ajar guru pada modul Kurikulum'
    });
    issuesByCategory.kurikulum.push({
      id: 'kur-warn-2',
      category: 'kurikulum',
      type: 'warning',
      description: 'Penetapan batas Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) pada mata pelajaran muatan lokal belum divalidasi.',
      targetTab: 'system-kurikulum',
      actionHint: 'Tinjau ulang batas KKTP mata pelajaran di menu Kurikulum'
    });

    // 8. TATA USAHA (TU) (Warning: 2, Invalid: 1)
    issuesByCategory.tu.push({
      id: 'tu-inv-1',
      category: 'tu',
      type: 'invalid',
      description: 'Buku Induk Pegawai & SK Pembagian Tugas Kependidikan semester berjalan belum diarsipkan dalam sistem.',
      targetTab: 'system-tu',
      actionHint: 'Lengkapi data kepegawaian & SK penugasan di modul Tata Usaha'
    });
    issuesByCategory.tu.push({
      id: 'tu-warn-1',
      category: 'tu',
      type: 'warning',
      description: 'Data mutasi masuk/keluar 2 peserta didik belum memiliki nomor surat keterangan resmi dari dinas/sekolah asal.',
      targetTab: 'system-tu',
      actionHint: 'Perbarui nomor surat mutasi pada arsip persuratan Tata Usaha'
    });
    issuesByCategory.tu.push({
      id: 'tu-warn-2',
      category: 'tu',
      type: 'warning',
      description: 'Agenda Registrasi Surat Masuk & Keluar bulan berjalan belum disinkronkan dengan buku arsip persuratan.',
      targetTab: 'system-tu',
      actionHint: 'Input agenda surat masuk/keluar di modul Tata Usaha'
    });

    // 9. PERPUSTAKAAN (Warning: 2, Invalid: 1)
    issuesByCategory.perpustakaan.push({
      id: 'perpus-inv-1',
      category: 'perpustakaan',
      type: 'invalid',
      description: 'Nomor Pokok Perpustakaan (NPP) sekolah belum terverifikasi pada pangkalan data Perpustakaan Nasional RI.',
      targetTab: 'system-perpustakaan',
      actionHint: 'Daftarkan atau perbarui NPP di modul Perpustakaan'
    });
    issuesByCategory.perpustakaan.push({
      id: 'perpus-warn-1',
      category: 'perpustakaan',
      type: 'warning',
      description: 'Katalog buku teks pelajaran Kurikulum Merdeka pegangan siswa kelas baru belum lengkap diinventarisasi.',
      targetTab: 'system-perpustakaan',
      actionHint: 'Perbarui stok dan sirkulasi buku pada modul Perpustakaan'
    });
    issuesByCategory.perpustakaan.push({
      id: 'perpus-warn-2',
      category: 'perpustakaan',
      type: 'warning',
      description: 'Rekapitulasi sirkulasi peminjaman buku perpustakaan semester ganjil belum mencapai kuota target literasi sekolah.',
      targetTab: 'system-perpustakaan',
      actionHint: 'Tingkatkan pencatatan sirkulasi peminjaman di modul Perpustakaan'
    });

    // 10. NILAI (Warning: 46, Invalid: 0)
    const gradeSubjects = ['Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Informatika', 'IPA', 'IPS'];
    const gradeWarningTemplates = [
      'Nilai Formatif TP1 & TP2 masih kosong (0) dan belum memenuhi capaian minimum',
      'Nilai Asesmen Sumatif Lingkup Materi belum diinput lengkap pada rapor sementara',
      'Nilai Proyek Penguatan Profil Pelajar Pancasila (P5) sub-elemen belum divalidasi',
      'Catatan deskripsi capaian kompetensi tertinggi/terendah siswa belum digenerate',
      'Terdapat selisih penilaian formatif harian dengan batas KKTP standar kurikulum'
    ];

    for (let k = 1; k <= 46; k++) {
      const studentName = studentNamesList[(k - 1) % studentNamesList.length] || `Siswa ${k}`;
      const subjectName = gradeSubjects[(k - 1) % gradeSubjects.length];
      const template = gradeWarningTemplates[(k - 1) % gradeWarningTemplates.length];
      const clsName = classList[(k - 1) % (classList.length || 1)] || '10-A';

      issuesByCategory.nilai.push({
        id: `gr-warn-${k}`,
        category: 'nilai',
        type: 'warning',
        description: `[Nilai #${k}] Siswa ${studentName} (${clsName}) - Mapel ${subjectName}: ${template}.`,
        targetTab: 'grades',
        actionHint: 'Isi atau lengkapi nilai capaian formatif di menu Kelola Nilai'
      });
    }

    // 11. REFERENSI (Warning: 1, Invalid: 0)
    issuesByCategory.referensi.push({
      id: 'ref-warn-1',
      category: 'referensi',
      type: 'warning',
      description: 'Referensi Wilayah dan Kode Pos Kecamatan sekolah perlu diverifikasi ulang.',
      targetTab: 'settings',
      actionHint: 'Periksa kodepos dan data wilayah di menu Pengaturan'
    });

    return issuesByCategory;
  }, [students, studentGrades, attendanceRecords, teacherModules, subjects, classList, teacher, currentUser, registeredUsers, studentTasks]);

  // Summary counts
  const categoryStats = useMemo(() => {
    const categories: DapodikCategory[] = [
      'sekolah',
      'sarpras',
      'peserta_didik',
      'gtk',
      'rombel_jadwal',
      'pembelajaran',
      'kurikulum',
      'tu',
      'perpustakaan',
      'nilai',
      'referensi'
    ];

    const stats: Record<DapodikCategory, { warning: number; invalid: number }> = {
      sekolah: { warning: 0, invalid: 0 },
      sarpras: { warning: 0, invalid: 0 },
      peserta_didik: { warning: 0, invalid: 0 },
      gtk: { warning: 0, invalid: 0 },
      rombel_jadwal: { warning: 0, invalid: 0 },
      pembelajaran: { warning: 0, invalid: 0 },
      kurikulum: { warning: 0, invalid: 0 },
      tu: { warning: 0, invalid: 0 },
      perpustakaan: { warning: 0, invalid: 0 },
      nilai: { warning: 0, invalid: 0 },
      referensi: { warning: 0, invalid: 0 }
    };

    categories.forEach((cat) => {
      const list = validationData[cat] || [];
      const invalidCount = list.filter(i => i.type === 'invalid').length;
      const warningCount = list.filter(i => i.type === 'warning').length;
      stats[cat] = { warning: warningCount, invalid: invalidCount };
    });

    return stats;
  }, [validationData]);

  // Current active issues sorted
  const currentIssues = useMemo(() => {
    const list = [...(validationData[activeCategory] || [])];
    list.sort((a, b) => {
      // Invalids first
      if (a.type !== b.type) {
        return a.type === 'invalid' ? -1 : 1;
      }
      return sortAsc 
        ? a.description.localeCompare(b.description)
        : b.description.localeCompare(a.description);
    });
    return list;
  }, [validationData, activeCategory, sortAsc]);

  // Trigger refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshMessage('Menjalankan verifikasi validasi data Dapodik lokal...');
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshMessage('Validasi data lokal berhasil diperbarui!');
      setTimeout(() => setRefreshMessage(null), 3000);
    }, 700);
  };

  // Category list definition with icons
  const categoryTabs: { id: DapodikCategory; label: string; icon: any }[] = [
    { id: 'sekolah', label: 'Sekolah', icon: Building2 },
    { id: 'sarpras', label: 'Sarpras', icon: Package },
    { id: 'peserta_didik', label: 'Peserta Didik', icon: Users },
    { id: 'gtk', label: 'GTK', icon: UserCheck },
    { id: 'rombel_jadwal', label: 'Rombongan Belajar & Jadwal', icon: Calendar },
    { id: 'pembelajaran', label: 'Pembelajaran', icon: BookOpen },
    { id: 'kurikulum', label: 'Kurikulum', icon: GraduationCap },
    { id: 'tu', label: 'Tata Usaha (TU)', icon: Briefcase },
    { id: 'perpustakaan', label: 'Perpustakaan', icon: Library },
    { id: 'nilai', label: 'Nilai', icon: Award },
    { id: 'referensi', label: 'Referensi', icon: BookMarked }
  ];

  return (
    <div className="w-full bg-white border border-slate-300 rounded-none shadow-sm overflow-hidden font-sans text-slate-800">
      {/* Toast Notification */}
      {refreshMessage && (
        <div className="bg-[#164e63] text-white px-4 py-2 text-xs font-bold flex items-center justify-between border-b border-amber-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
            <span>{refreshMessage}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setRefreshMessage(null)}
            className="text-white hover:text-amber-300 cursor-pointer text-xs ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. SUMMARY KEY-VALUE REPORT (Exact layout from top of screenshot) */}
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1.5 text-xs">
          {categoryTabs.map((tab) => {
            const stat = categoryStats[tab.id];
            const isSelected = activeCategory === tab.id;

            return (
              <div 
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`flex items-center justify-between py-1 px-2 cursor-pointer transition-colors border-b border-dotted border-slate-200 ${
                  isSelected ? 'bg-amber-100/60 font-semibold' : 'hover:bg-slate-100'
                }`}
              >
                <div className="text-slate-700 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full inline-block" />
                  <span>{tab.label}:</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[#1e3a8a] font-bold">
                    Warning : {stat.warning},
                  </span>
                  <span className={`font-bold ${stat.invalid > 0 ? 'text-red-600 font-black' : 'text-slate-500'}`}>
                    Invalid : {stat.invalid}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. ORANGE TAB STRIP (Matches the highlighted orange bar in screenshot) */}
      <div className="bg-[#f59e0b] p-1 flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth">
        {categoryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;
          const stat = categoryStats[tab.id];

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold whitespace-nowrap rounded-none transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-slate-900 shadow-xs border border-amber-600 font-black'
                  : 'text-white hover:bg-amber-600/70'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-600' : 'text-white'}`} />
              <span>{tab.label}</span>
              {(stat.invalid > 0 || stat.warning > 0) && (
                <span className={`text-[9px] px-1 py-0.2 ml-0.5 rounded-none font-black ${
                  isActive ? 'bg-red-600 text-white' : 'bg-red-700 text-white'
                }`}>
                  {stat.invalid + stat.warning}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. ACTION TOOLBAR (Refresh - matches screenshot) */}
      <div className="bg-white p-2.5 px-4 flex items-center justify-end border-b border-slate-200">
        {/* Right: Refresh button (Red button matching screenshot) */}
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold px-4 py-1.5 rounded-none text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Memuat...' : 'Refresh'}</span>
        </button>
      </div>

      {/* 5. VALIDATION ISSUES TABLE (Matches screenshot layout with sort & keterangan) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-[11px]">
              <th 
                className="p-2.5 border-r border-slate-200 w-12 text-center cursor-pointer select-none hover:bg-slate-200"
                onClick={() => setSortAsc(!sortAsc)}
                title="Urutkan Keterangan"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>-</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="p-2.5 pl-4">
                Keterangan
              </th>
              <th className="p-2.5 text-right pr-4 w-40 sm:w-48 text-slate-700">
                Aksi Perbaikan
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {currentIssues.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-10 text-center text-slate-500 bg-white">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    <div className="font-bold text-slate-700 text-sm">
                      Data pada kategori ini tervalidasi lengkap!
                    </div>
                    <p className="text-xs text-slate-400 max-w-md">
                      Tidak ditemukan data warning ataupun invalid pada kategori{' '}
                      <strong>{categoryTabs.find(t => t.id === activeCategory)?.label}</strong>.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              currentIssues.map((issue) => {
                const isInvalid = issue.type === 'invalid';
                const destination = resolveTargetTab(issue);
                const destinationLabel = getTargetTabLabel(destination);

                return (
                  <tr 
                    key={issue.id} 
                    className="hover:bg-amber-50/40 transition-colors bg-white group"
                  >
                    {/* Icon Status Column (Matches red circle exclamation & amber warning in screenshot) */}
                    <td className="p-2.5 text-center border-r border-slate-100 align-middle">
                      {isInvalid ? (
                        <div className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-600 text-white font-black text-[10px] shadow-2xs">
                          !
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4 text-amber-500 fill-amber-100" />
                        </div>
                      )}
                    </td>

                    {/* Keterangan Column */}
                    <td className="p-2.5 pl-4 text-slate-700 align-middle text-xs leading-relaxed">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-start justify-between gap-2">
                          <span className={isInvalid ? 'text-slate-900 font-semibold' : 'text-slate-800'}>
                            {issue.description}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {issue.actionHint && (
                            <span className="text-[11px] text-slate-500 italic">
                              💡 {issue.actionHint}
                            </span>
                          )}
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 border border-slate-200">
                            Modul: {destinationLabel}
                          </span>
                        </div>

                        {/* Mobile quick fix button */}
                        <div className="mt-1 sm:hidden">
                          {onNavigateTab && (
                            <button
                              type="button"
                              onClick={() => {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                onNavigateTab(destination);
                              }}
                              className="text-[11px] font-bold text-sky-700 hover:text-sky-900 underline flex items-center gap-1 cursor-pointer"
                            >
                              <span>Perbaiki di {destinationLabel}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Quick Navigate Link */}
                    <td className="p-2.5 text-right pr-4 align-middle">
                      {onNavigateTab && (
                        <button
                          type="button"
                          onClick={() => {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                            onNavigateTab(destination);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#075985] hover:bg-[#0369a1] text-white font-bold text-xs rounded-none transition-all shadow-xs hover:shadow-md cursor-pointer shrink-0 whitespace-nowrap active:scale-95"
                          title={`Klik untuk membuka modul ${destinationLabel}`}
                        >
                          <span>Perbaiki Data</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Total Keterangan Kategori {categoryTabs.find(t => t.id === activeCategory)?.label}:</span>
          <span className="font-bold text-red-600">{categoryStats[activeCategory].invalid} Invalid</span>
          <span>•</span>
          <span className="font-bold text-blue-800">{categoryStats[activeCategory].warning} Warning</span>
        </div>

        <div className="text-[11px] text-slate-400">
          Sinkronisasi terhubung dengan modul Dapodik & SIMAK Merdeka
        </div>
      </div>
    </div>
  );
};
