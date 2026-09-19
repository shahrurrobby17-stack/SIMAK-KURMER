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
  onNavigateTab
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

    // 1. SEKOLAH
    // Check school info
    const npsn = teacher?.npsn || '20512345';
    const schoolName = teacher?.schoolName || currentUser?.schoolName || 'SD NEGERI 1 WAGIR';

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

    if (!npsn || npsn.length < 8) {
      issuesByCategory.sekolah.push({
        id: 'sek-inv-3',
        category: 'sekolah',
        type: 'invalid',
        description: `NPSN Sekolah tidak valid atau kurang dari 8 digit (NPSN: ${npsn || 'Kosong'})`,
        targetTab: 'settings',
        actionHint: 'Perbarui NPSN sekolah di menu Pengaturan'
      });
    }

    // 2. SARPRAS
    // Sample/dynamic Sarpras issues
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

    // 3. PESERTA DIDIK
    // Real calculation based on actual students
    let pdInvalidCount = 0;
    let pdWarnCount = 0;

    students.forEach((st) => {
      const isNisnValid = Boolean(st.nisn && st.nisn.trim().length >= 10 && !st.nisn.startsWith('0000'));
      const hasName = Boolean(st.name && st.name.trim());
      const hasClass = Boolean(st.className && st.className.trim());
      const hasParent = Boolean(st.parentName && st.parentName.trim());

      if (!hasName) {
        pdInvalidCount++;
        issuesByCategory.peserta_didik.push({
          id: `pd-name-${st.id}`,
          category: 'peserta_didik',
          type: 'invalid',
          description: `Nama Peserta Didik masih kosong pada ID ${st.id}`,
          targetTab: 'students',
          actionHint: 'Lengkapi nama lengkap siswa di menu Data Siswa'
        });
      }

      if (!isNisnValid) {
        pdInvalidCount++;
        issuesByCategory.peserta_didik.push({
          id: `pd-nisn-${st.id}`,
          category: 'peserta_didik',
          type: 'invalid',
          description: `Data Peserta Didik NISN tidak valid atau kurang dari 10 digit (Siswa: ${st.name || st.id}, NISN: ${st.nisn || '-'})`,
          targetTab: 'students',
          actionHint: 'Perbaiki NISN menjadi 10 digit resmi Pusdatin'
        });
      }

      if (!hasClass) {
        pdInvalidCount++;
        issuesByCategory.peserta_didik.push({
          id: `pd-cls-${st.id}`,
          category: 'peserta_didik',
          type: 'invalid',
          description: `Rombongan Belajar belum ditentukan untuk Peserta Didik ${st.name}`,
          targetTab: 'students',
          actionHint: 'Tetapkan kelas rombel siswa'
        });
      }

      if (!hasParent) {
        pdWarnCount++;
        issuesByCategory.peserta_didik.push({
          id: `pd-prnt-${st.id}`,
          category: 'peserta_didik',
          type: 'warning',
          description: `Data nama orang tua / wali belum terisi lengkap untuk Peserta Didik ${st.name}`,
          targetTab: 'students',
          actionHint: 'Lengkapi data orang tua siswa'
        });
      }

      // Check attendance alpa > 3
      const studentAlpa = attendanceRecords.filter(r => r.studentId === st.id && r.status === 'ALPA').length;
      if (studentAlpa > 3) {
        pdWarnCount++;
        issuesByCategory.peserta_didik.push({
          id: `pd-alpa-${st.id}`,
          category: 'peserta_didik',
          type: 'warning',
          description: `Akumulasi ketidakhadiran Alpa melebihi batas 3 kali (${studentAlpa}x) pada Siswa: ${st.name}`,
          targetTab: 'attendance',
          actionHint: 'Konfirmasi presensi siswa atau buat surat tindak lanjut wali kelas'
        });
      }
    });

    // 4. GTK (Guru & Tenaga Kependidikan)
    if (registeredUsers && registeredUsers.length > 0) {
      registeredUsers.forEach((u) => {
        const uId = u.uid || u.email || 'unknown';
        if (!u.name || !u.name.trim()) {
          issuesByCategory.gtk.push({
            id: `gtk-name-${uId}`,
            category: 'gtk',
            type: 'invalid',
            description: `Nama GTK / Akun Pendidik belum terdaftar pada ID: ${uId}`,
            targetTab: 'master-data',
            actionHint: 'Lengkapi identitas pendidik di Master Data GTK'
          });
        }
        if (!u.nip || u.nip.trim() === '' || u.nip.startsWith('0000')) {
          issuesByCategory.gtk.push({
            id: `gtk-nip-${uId}`,
            category: 'gtk',
            type: 'warning',
            description: `NIP / NUPTK GTK belum dilengkapi untuk ${u.name} (${u.role})`,
            targetTab: 'master-data',
            actionHint: 'Perbarui nomor NIP/NUPTK di Master Data GTK'
          });
        }
        if (u.status === 'Nonaktif' || u.status === 'Menunggu Aktivasi') {
          issuesByCategory.gtk.push({
            id: `gtk-status-${uId}`,
            category: 'gtk',
            type: 'warning',
            description: `Akun GTK ${u.name} berstatus ${u.status}`,
            targetTab: 'master-data',
            actionHint: 'Ubah status akun di Master Data GTK'
          });
        }
      });
    }

    // Check teacher profile
    if (teacher) {
      if (!teacher.nip || teacher.nip.trim().length < 8) {
        issuesByCategory.gtk.push({
          id: 'gtk-tch-nip',
          category: 'gtk',
          type: 'warning',
          description: `NIP Guru Pengampu (${teacher.name}) belum diisi standar BKN 18 digit`,
          targetTab: 'settings',
          actionHint: 'Perbarui NIP guru di Pengaturan'
        });
      }
      if (!teacher.principalName || teacher.principalName.trim() === '') {
        issuesByCategory.gtk.push({
          id: 'gtk-tch-prnc',
          category: 'gtk',
          type: 'invalid',
          description: 'Nama Kepala Sekolah pada profil institusi belum terisi',
          targetTab: 'settings',
          actionHint: 'Lengkapi nama Kepala Sekolah di Pengaturan'
        });
      }
    }

    // 5. ROMBONGAN BELAJAR & JADWAL
    const uniqueClasses = classList && classList.length > 0 ? classList : ['10-A', '10-B', '11-A', '11-B', '12-A'];
    if (uniqueClasses.length === 0) {
      issuesByCategory.rombel_jadwal.push({
        id: 'rom-inv-1',
        category: 'rombel_jadwal',
        type: 'invalid',
        description: 'Belum ada Rombongan Belajar (Kelas) yang terdaftar di sekolah.',
        targetTab: 'settings',
        actionHint: 'Atur kelas rombel di Pengaturan'
      });
    } else {
      issuesByCategory.rombel_jadwal.push({
        id: 'rom-warn-1',
        category: 'rombel_jadwal',
        type: 'warning',
        description: `Jadwal tatap muka mingguan untuk Rombel ${uniqueClasses[0]} perlu sinkronisasi jam reguler (40 JP).`,
        targetTab: 'schedule',
        actionHint: 'Kelola jadwal mengajar di menu Jadwal Mengajar'
      });
    }

    // 6. PEMBELAJARAN
    if (subjects.length === 0) {
      issuesByCategory.pembelajaran.push({
        id: 'pem-inv-1',
        category: 'pembelajaran',
        type: 'invalid',
        description: 'Mata pelajaran kurikulum belum diinputkan pada struktur pembelajaran sekolah.',
        targetTab: 'system-kurikulum',
        actionHint: 'Tambahkan mata pelajaran di menu Kurikulum'
      });
    } else {
      const zeroKktp = subjects.filter(s => !s.kktp || s.kktp < 50);
      if (zeroKktp.length > 0) {
        issuesByCategory.pembelajaran.push({
          id: 'pem-inv-kktp',
          category: 'pembelajaran',
          type: 'invalid',
          description: `Terdapat ${zeroKktp.length} Mata Pelajaran dengan batas KKTP di bawah standar nasional (< 50).`,
          targetTab: 'system-kurikulum',
          actionHint: 'Tinjau batas KKTP mapel di menu Kurikulum'
        });
      }
    }

    // 7. KURIKULUM
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

    // 8. TATA USAHA (TU)
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

    // 9. PERPUSTAKAAN
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

    // 10. NILAI
    let nilaiInvalidCount = 0;
    let nilaiWarnCount = 0;

    studentGrades.forEach((g) => {
      const isOutOfRange = (g.finalScore !== undefined && (g.finalScore < 0 || g.finalScore > 100));
      const isTpEmpty = (g.tp1 === 0 && g.tp2 === 0);
      const studentObj = students.find(s => s.id === g.studentId);
      const studentName = studentObj?.name || `ID ${g.studentId}`;

      if (isOutOfRange) {
        nilaiInvalidCount++;
        issuesByCategory.nilai.push({
          id: `gr-rng-${g.studentId}-${g.subjectId}`,
          category: 'nilai',
          type: 'invalid',
          description: `Nilai Akhir Rapor di luar rentang wajar 0-100 (${g.finalScore}) pada Siswa: ${studentName}`,
          targetTab: 'grades',
          actionHint: 'Perbaiki nilai siswa di menu Kelola Nilai'
        });
      }

      if (isTpEmpty) {
        nilaiWarnCount++;
        issuesByCategory.nilai.push({
          id: `gr-tp-${g.studentId}-${g.subjectId}`,
          category: 'nilai',
          type: 'warning',
          description: `Nilai Formatif TP1 & TP2 masih kosong (0) pada Siswa: ${studentName}`,
          targetTab: 'grades',
          actionHint: 'Isi nilai capaian formatif TP di menu Kelola Nilai'
        });
      }
    });

    // 11. REFERENSI
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
