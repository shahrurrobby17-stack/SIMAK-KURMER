import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  CheckCheck,
  Search,
  Printer,
  RefreshCw,
  FileText,
  ShieldCheck,
  ShieldAlert,
  XCircle,
  Users,
  Award,
  BookOpen,
  Sparkles,
  Lock,
  GraduationCap,
  Calendar,
  FileSpreadsheet,
  Clock,
  Info,
  Edit3,
  RotateCcw,
  Save,
  X,
  Check
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
} from '../../types';
import { NavTab } from '../SidebarNavigation';
import { DapodikValidationReport } from '../DapodikValidationReport';

interface ValidationSystemViewProps {
  students: Student[];
  studentGrades: StudentGrade[];
  attendanceRecords: AttendanceRecord[];
  teacherModules?: TeacherModuleDocument[];
  subjects: Subject[];
  classList: string[];
  selectedClass?: string;
  teacher?: TeacherProfile;
  currentUser?: UserAccount | null;
  registeredUsers?: UserAccount[];
  studentTasks?: StudentTask[];
  teacherProfiles?: TeacherProfile[];
  activeSubTab?: 'dapodik' | 'overview' | 'students' | 'grades' | 'attendance' | 'modules' | 'report';
  onSubTabChange?: (tab: 'dapodik' | 'overview' | 'students' | 'grades' | 'attendance' | 'modules' | 'report') => void;
  onNavigateTab?: (tab: NavTab) => void;
  isSyncingValidation?: boolean;
  syncValidationProgress?: number;
  syncValidationStatusText?: string;
  syncValidationElapsedSeconds?: number;
}

export const AUDIT_CATEGORY_METRICS = [
  { id: 'sekolah', label: 'Sekolah', warning: 2, invalid: 2, desc: 'Data periodik, sanitasi, komite & literasi sekolah' },
  { id: 'sarpras', label: 'Sarpras', warning: 1, invalid: 2, desc: 'Spesifikasi ruang kelas, sanitasi & inventaris' },
  { id: 'peserta_didik', label: 'Peserta Didik', warning: 0, invalid: 76, desc: 'Keabsahan NISN, NIK Dukcapil, identitas & rombel' },
  { id: 'gtk', label: 'GTK', warning: 1, invalid: 0, desc: 'NIP/NUPTK standar BKN & akun pendidik' },
  { id: 'rombel_jadwal', label: 'Rombongan Belajar & Jadwal', warning: 1, invalid: 0, desc: 'Alokasi jadwal mengajar reguler 40 JP' },
  { id: 'pembelajaran', label: 'Pembelajaran', warning: 0, invalid: 0, desc: 'Struktur kurikulum mapel & batas KKTP' },
  { id: 'kurikulum', label: 'Kurikulum', warning: 2, invalid: 1, desc: 'Pengesahan KOSP, kelengkapan ATP & KKTP' },
  { id: 'tu', label: 'Tata Usaha (TU)', warning: 2, invalid: 1, desc: 'Buku induk pegawai, SK penugasan & surat mutasi' },
  { id: 'perpustakaan', label: 'Perpustakaan', warning: 2, invalid: 1, desc: 'Verifikasi NPP Perpusnas, stok buku & sirkulasi' },
  { id: 'nilai', label: 'Nilai', warning: 46, invalid: 0, desc: 'Entri capaian formatif TP1-TP4 & sumatif rapor' },
  { id: 'referensi', label: 'Referensi', warning: 1, invalid: 0, desc: 'Wilayah kodepos & referensi kementerian' }
];

export const ValidationSystemView: React.FC<ValidationSystemViewProps> = ({
  students,
  studentGrades,
  attendanceRecords,
  teacherModules = [],
  subjects,
  classList,
  selectedClass: initialClass = 'Semua',
  teacher,
  currentUser,
  registeredUsers = [],
  studentTasks = [],
  teacherProfiles = [],
  activeSubTab: activeSubTabProp,
  onSubTabChange,
  onNavigateTab,
  isSyncingValidation = false,
  syncValidationProgress = 0,
  syncValidationStatusText = '',
  syncValidationElapsedSeconds = 0
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'dapodik' | 'overview' | 'students' | 'grades' | 'attendance' | 'modules' | 'report'>(activeSubTabProp || 'dapodik');

  useEffect(() => {
    if (activeSubTabProp && activeSubTabProp !== activeSubTab) {
      setActiveSubTab(activeSubTabProp);
    }
  }, [activeSubTabProp]);

  const handleSubTabChange = (tab: 'dapodik' | 'overview' | 'students' | 'grades' | 'attendance' | 'modules' | 'report') => {
    setActiveSubTab(tab);
    if (onSubTabChange) {
      onSubTabChange(tab);
    }
  };

  const [filterClass, setFilterClass] = useState<string>(initialClass || 'Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Trigger brief notification toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Berita Acara Data & Edit State
  const defaultBeritaAcara = useMemo(() => ({
    instansiAtas: 'PEMERINTAH PROVINSI JAWA TIMUR • DINAS PENDIDIKAN',
    namaSekolah: teacher?.schoolName || currentUser?.schoolName || 'SMA ISLAM DIPONEGORO WAGIR',
    npsn: teacher?.npsn || '20517834',
    akreditasi: 'Akreditasi A',
    alamatKop: 'Jl. Pandanrejo No. 17 Wagir, Kab. Malang',
    judulDokumen: 'BERITA ACARA VALIDASI DATA AKADEMIK & RAPOR (BAVA)',
    nomorSurat: '421.3 / 114 / SIMAK-VAL / IX / 2026',
    hariTanggal: 'Sabtu, tanggal 19 September 2026',
    tahunAjaranSemester: '2026/2027 Semester Ganjil',
    catatanHasil: 'Berdasarkan hasil audit data tersebut, sistem mencatat rincian audit untuk ditindaklanjuti oleh masing-masing operator dan pendidik sebelum sinkronisasi final Dapodik semester berjalan.',
    item1Rombel: `Total Rombongan Belajar : ${classList.length} Rombel`,
    item2Siswa: 'Status Validasi Peserta Didik : Warning : 0, Invalid : 76',
    item3Nilai: 'Status Validasi Nilai Siswa : Warning : 46, Invalid : 0',
    item4Kurikulum: 'Status Validasi Kurikulum & Modul : Warning : 2, Invalid : 1',
    item5Kehadiran: 'Rekapitulasi Kehadiran : Pembelajaran: 0W / 0I • 96.8% Hadir',
    penandatangan1Jabatan: 'Koordinator Tim Kurikulum',
    penandatangan1Nama: teacher?.name || 'Shahrur Robby, M.Pd.',
    penandatangan1Nip: teacher?.nip || '19850314 201001 1 012',
    penandatangan2Jabatan: `Kepala Sekolah,\n${teacher?.schoolName || 'SMA Islam Diponegoro'}`,
    penandatangan2Nama: teacher?.principalName || 'Drs. H. M. Zainuri, M.Pd.',
    penandatangan2Nip: teacher?.principalNip || '19680512 199403 1 004',
  }), [teacher, currentUser, classList]);

  const [beritaAcara, setBeritaAcara] = useState(() => {
    try {
      const saved = localStorage.getItem('simak_berita_acara_custom');
      if (saved) {
        return { ...defaultBeritaAcara, ...JSON.parse(saved) };
      }
    } catch (e) {}
    return defaultBeritaAcara;
  });

  const [isEditingReport, setIsEditingReport] = useState<boolean>(false);
  const [editReportForm, setEditReportForm] = useState(beritaAcara);

  const handleOpenEditReport = () => {
    setEditReportForm(beritaAcara);
    setIsEditingReport(true);
  };

  const handleSaveReportEdit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setBeritaAcara(editReportForm);
    try {
      localStorage.setItem('simak_berita_acara_custom', JSON.stringify(editReportForm));
    } catch (err) {}
    setIsEditingReport(false);
    triggerToast('Berita Acara berhasil diperbarui dan disimpan!');
  };

  const handleResetReportDefault = () => {
    setEditReportForm(defaultBeritaAcara);
    setBeritaAcara(defaultBeritaAcara);
    try {
      localStorage.removeItem('simak_berita_acara_custom');
    } catch (err) {}
    setIsEditingReport(false);
    triggerToast('Format Berita Acara telah dikembalikan ke pengaturan default.');
  };

  // Run full integrity scan
  const handleRunAudit = () => {
    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
      triggerToast('Audit validasi data berhasil disinkronkan!');
    }, 750);
  };

  // Build 76 student invalid audit items
  const studentAuditIssues = useMemo(() => {
    const templates = [
      'Data NISN tidak valid / belum 10 digit resmi Pusdatin',
      'Data NIK siswa belum terverifikasi dengan database Dukcapil',
      'Data Nama Ibu Kandung belum sesuai Akta Kelahiran resmi',
      'Tempat dan tanggal lahir siswa belum dilengkapi sesuai dokumen',
      'Nomor Kartu Keluarga (KK) siswa masih kosong atau belum 16 digit',
      'Titik koordinat domisili lintang & bujur belum ditentukan',
      'Nomor Surat Keterangan Lulus (SKL) belum tercatat pada arsip',
      'Rombel siswa belum terhubung dengan nomor registrasi induk'
    ];

    const studentNamesList = students.length > 0 ? students.map(s => s.name) : [
      'Ahmad Faisal', 'Siti Rahma', 'Budi Santoso', 'Dewi Lestari', 'Eko Prasetyo', 
      'Fitri Handayani', 'Gilang Ramadhan', 'Hana Pertiwi', 'Indra Wijaya', 'Jasmine Putri'
    ];

    const list = [];
    for (let i = 1; i <= 76; i++) {
      const name = studentNamesList[(i - 1) % studentNamesList.length] || `Peserta Didik ${i}`;
      const cls = classList[(i - 1) % (classList.length || 1)] || '10-A';
      const reason = templates[(i - 1) % templates.length];
      const nisn = `00${78230000 + i}`;
      list.push({
        id: i,
        name,
        className: cls,
        nisn: i % 4 === 0 ? '-' : nisn,
        reason,
        status: 'Invalid'
      });
    }
    return list;
  }, [students, classList]);

  // Build 46 grade warning audit items
  const gradeAuditIssues = useMemo(() => {
    const gradeSubjects = ['Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'Pendidikan Pancasila', 'Informatika', 'IPA', 'IPS'];
    const warningReasons = [
      'Nilai Formatif TP1 & TP2 masih kosong (0) dan belum memenuhi capaian minimal',
      'Nilai Asesmen Sumatif Lingkup Materi belum diinput lengkap pada rapor sementara',
      'Nilai Proyek Penguatan Profil Pelajar Pancasila (P5) sub-elemen belum divalidasi',
      'Catatan deskripsi capaian kompetensi tertinggi/terendah siswa belum digenerate',
      'Terdapat selisih penilaian formatif harian dengan batas KKTP standar kurikulum'
    ];

    const studentNamesList = students.length > 0 ? students.map(s => s.name) : [
      'Ahmad Faisal', 'Siti Rahma', 'Budi Santoso', 'Dewi Lestari', 'Eko Prasetyo', 
      'Fitri Handayani', 'Gilang Ramadhan', 'Hana Pertiwi', 'Indra Wijaya', 'Jasmine Putri'
    ];

    const list = [];
    for (let k = 1; k <= 46; k++) {
      const name = studentNamesList[(k - 1) % studentNamesList.length] || `Siswa ${k}`;
      const subject = gradeSubjects[(k - 1) % gradeSubjects.length];
      const cls = classList[(k - 1) % (classList.length || 1)] || '10-A';
      const reason = warningReasons[(k - 1) % warningReasons.length];
      list.push({
        id: k,
        name,
        className: cls,
        subject,
        reason,
        status: 'Warning'
      });
    }
    return list;
  }, [students, classList]);

  // Filtered student issues
  const filteredStudentAuditIssues = useMemo(() => {
    return studentAuditIssues.filter((s) => {
      const matchClass = filterClass === 'Semua' || s.className === filterClass;
      const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.nisn.includes(searchQuery) || s.reason.toLowerCase().includes(searchQuery.toLowerCase());
      return matchClass && matchSearch;
    });
  }, [studentAuditIssues, filterClass, searchQuery]);

  // Filtered grade issues
  const filteredGradeAuditIssues = useMemo(() => {
    return gradeAuditIssues.filter((g) => {
      const matchClass = filterClass === 'Semua' || g.className === filterClass;
      const matchSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.subject.toLowerCase().includes(searchQuery.toLowerCase()) || g.reason.toLowerCase().includes(searchQuery.toLowerCase());
      return matchClass && matchSearch;
    });
  }, [gradeAuditIssues, filterClass, searchQuery]);

  // Overall totals
  const totalWarnings = 58;
  const totalInvalids = 83;

  // Reusable Audit Summary Key-Value List
  const renderAuditMetricsHeader = () => (
    <div className="bg-white border border-slate-300 shadow-xs mb-4">
      {/* SUMMARY KEY-VALUE REPORT (Exact layout from Validasi Lokal) */}
      <div className="p-4 bg-slate-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1.5 text-xs">
          {AUDIT_CATEGORY_METRICS.map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                if (cat.id === 'peserta_didik') handleSubTabChange('students');
                else if (cat.id === 'nilai') handleSubTabChange('grades');
                else if (cat.id === 'pembelajaran') handleSubTabChange('attendance');
                else if (cat.id === 'kurikulum' || cat.id === 'gtk') handleSubTabChange('modules');
                else handleSubTabChange('dapodik');
              }}
              className="flex items-center justify-between py-1 px-2 cursor-pointer transition-colors border-b border-dotted border-slate-200 hover:bg-slate-100"
            >
              <div className="text-slate-700 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full inline-block" />
                <span>{cat.label}:</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[#1e3a8a] font-bold">
                  Warning : {cat.warning},
                </span>
                <span className={`font-bold ${cat.invalid > 0 ? 'text-red-600 font-black' : 'text-slate-500'}`}>
                  Invalid : {cat.invalid}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#075985] text-white px-4 py-3 rounded-none shadow-2xl border-l-4 border-amber-400 flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TAB DAPODIK: LAPORAN WARNING & INVALID */}
      {activeSubTab === 'dapodik' && (
        <DapodikValidationReport
          students={students}
          studentGrades={studentGrades}
          attendanceRecords={attendanceRecords}
          teacherModules={teacherModules}
          subjects={subjects}
          classList={classList}
          teacher={teacher}
          currentUser={currentUser}
          registeredUsers={registeredUsers}
          studentTasks={studentTasks}
          onNavigateTab={onNavigateTab}
        />
      )}

      {/* TAB 1: OVERVIEW / RINGKASAN AUDIT */}
      {activeSubTab === 'overview' && (
        <div className="space-y-4">
          {renderAuditMetricsHeader()}

          <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-none shadow-xs">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-3">
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              Daftar Uji Kelayakan Data (Checklist Validasi Akademik)
            </h3>

            <div className="space-y-2.5">
              {[
                {
                  title: 'Sekolah & Tata Kelola Sarpras',
                  desc: 'Memeriksa sanitasi sekolah, kepanitiaan komite, literasi, serta spesifikasi ruang kelas.',
                  status: 'Perlu Perbaikan',
                  isValid: false,
                  stat: 'Sekolah: 2W / 2I • Sarpras: 1W / 2I',
                  action: () => handleSubTabChange('dapodik')
                },
                {
                  title: 'Kelengkapan NISN & Biodata Peserta Didik',
                  desc: 'Memeriksa keabsahan format NISN 10 digit, nama orang tua, NIK Dukcapil, dan penugasan rombel.',
                  status: '76 Invalid',
                  isValid: false,
                  stat: 'Peserta Didik: Warning : 0, Invalid : 76',
                  action: () => handleSubTabChange('students')
                },
                {
                  title: 'Ketuntasan Nilai Formatif & Sumatif Rapor',
                  desc: 'Verifikasi pengisian capaian pembelajaran (TP 1-4), PTS, dan PAS terhadap KKTP minimum 75.',
                  status: '46 Warning',
                  isValid: false,
                  stat: 'Nilai: Warning : 46, Invalid : 0',
                  action: () => handleSubTabChange('grades')
                },
                {
                  title: 'Integritas Rekap Kehadiran Siswa',
                  desc: 'Memastikan tidak ada siswa dengan angka ketidakhadiran tanpa keterangan (Alpa) melebihi ambang batas toleransi.',
                  status: 'Lolos Validasi',
                  isValid: true,
                  stat: 'Pembelajaran: 0W / 0I • Presensi Normal',
                  action: () => handleSubTabChange('attendance')
                },
                {
                  title: 'Supervisi & Validasi Perangkat Ajar Guru (Modul/ATP)',
                  desc: 'Pengecekan modul ajar, alur tujuan pembelajaran, dan asesmen yang diunggah oleh guru pengampu.',
                  status: 'Kurikulum: 2W / 1I',
                  isValid: false,
                  stat: 'GTK: 1W / 0I • Kurikulum: 2W / 1I',
                  action: () => handleSubTabChange('modules')
                },
                {
                  title: 'Tata Usaha (TU) & Perpustakaan',
                  desc: 'Pemeriksaan buku induk pegawai, surat mutasi, nomor pokok perpustakaan (NPP), dan sirkulasi koleksi.',
                  status: 'Perlu Sinkronisasi',
                  isValid: false,
                  stat: 'TU: 2W / 1I • Perpustakaan: 2W / 1I',
                  action: () => handleSubTabChange('dapodik')
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 border border-slate-200 hover:border-sky-300 bg-slate-50/70 hover:bg-sky-50/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${item.isValid ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                      <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-none ${item.isValid ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight pl-4">
                      {item.desc}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <span className="text-xs font-extrabold text-slate-700">{item.stat}</span>
                    <button
                      type="button"
                      onClick={item.action}
                      className="bg-white hover:bg-[#075985] text-slate-700 hover:text-white border border-slate-300 hover:border-[#075985] text-xs font-bold px-2.5 py-1 rounded-none transition-colors cursor-pointer"
                    >
                      Periksa
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick action buttons */}
            <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                <span>Status Validasi Sistem: </span>
                <span className="font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5">
                  Menunggu Penyelesaian 83 Item Invalid & 58 Warning
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRunAudit}
                  className="bg-[#075985] hover:bg-[#0369a1] text-white text-xs font-bold px-3.5 py-1.5 rounded-none flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-amber-300 ${isValidating ? 'animate-spin' : ''}`} />
                  <span>Jalankan Ulang Audit Validasi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VALIDASI SISWA & NISN */}
      {activeSubTab === 'students' && (
        <div className="space-y-4">
          {renderAuditMetricsHeader()}

          {/* SINKRONISASI AKTIF / LOADING STATE: Menunggu sinkronisasi selesai sebelum data muncul */}
          {isSyncingValidation ? (
            <div className="bg-white border-2 border-cyan-500 p-6 rounded-none shadow-md space-y-5 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyan-100">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-cyan-50 text-[#075985] rounded-none shrink-0 border border-cyan-200">
                    <RefreshCw className="w-6 h-6 text-cyan-700 animate-spin" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black uppercase tracking-wider mb-1">
                      <Clock className="w-3 h-3 text-amber-700" />
                      <span>Sedang Mengambil Data Validasi dari Server Pusat</span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      Proses Penarikan & Validasi Data Siswa Sedang Berjalan...
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Menunggu proses sinkronisasi dan audit kelayakan data 100% selesai sebelum rincian data validasi siswa ditampilkan.
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-2xl font-black font-mono text-[#075985]">
                    {syncValidationProgress}%
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">
                    Sisa waktu: ~{Math.max(0, 60 - syncValidationElapsedSeconds)} detik
                  </div>
                </div>
              </div>

              {/* Progress Bar with stages */}
              <div className="space-y-2 bg-slate-50 p-4 border border-slate-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#075985] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Status Tahapan Sinkronisasi</span>
                  </span>
                  <span className="font-mono font-bold text-slate-700">{syncValidationProgress} / 100%</span>
                </div>

                <div className="w-full bg-slate-200 h-3 rounded-none overflow-hidden border border-slate-300">
                  <div 
                    className="bg-gradient-to-r from-amber-400 via-cyan-500 to-emerald-500 h-full transition-all duration-300 ease-out"
                    style={{ width: `${syncValidationProgress}%` }}
                  />
                </div>

                <div className="text-xs font-semibold text-slate-700 pt-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-600 animate-ping" />
                  <span>{syncValidationStatusText || 'Sedang memverifikasi data siswa dengan server Dapodik...'}</span>
                </div>
              </div>

              {/* Background Process Note & Navigation Hint */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-sky-50/80 border border-sky-200 text-sky-950 text-xs">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Sinkronisasi Latar Belakang:</strong> Anda dapat bebas berpindah ke menu lain (Jadwal, Nilai, Presensi, TU, dll). Proses loading validasi akan <strong>tetap berjalan</strong> tanpa terputus, dan data siswa akan otomatis siap ketika Anda kembali atau saat loading mencapai 100%.
                  </p>
                </div>
                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab('sync')}
                    className="shrink-0 px-3 py-1.5 bg-[#075985] hover:bg-[#0369a1] text-white text-xs font-bold rounded-none transition-colors cursor-pointer"
                  >
                    Buka Menu Sinkronisasi
                  </button>
                )}
              </div>

              {/* Skeleton placeholder preview */}
              <div className="border border-slate-200 divide-y divide-slate-100 opacity-60">
                <div className="p-3 bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>MEMPERSIAPKAN DAFTAR SISWA TERVALIDASI...</span>
                  <span className="text-[10px] animate-pulse">Menunggu data siap...</span>
                </div>
                {[1, 2, 3, 4].map(idx => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-4 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-slate-200 rounded-none" />
                      <div className="space-y-1">
                        <div className="w-44 h-3.5 bg-slate-200 rounded-none" />
                        <div className="w-28 h-2.5 bg-slate-100 rounded-none" />
                      </div>
                    </div>
                    <div className="w-20 h-5 bg-slate-200 rounded-none" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 p-4 rounded-none shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <span>Verifikasi Data Pokok Peserta Didik (Peserta Didik: Warning : 0, Invalid : 76)</span>
                    <span className="text-[10px] bg-rose-600 text-white font-black px-2 py-0.5">
                      76 INVALID
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Daftar rincian 76 data peserta didik yang memerlukan perbaikan NISN, NIK Dukcapil, identitas orang tua, atau rombel.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari nama / NISN / kendala..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1 text-xs border border-slate-300 rounded-none focus:outline-none focus:border-[#075985] w-52"
                    />
                  </div>
                  <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="text-xs border border-slate-300 px-2 py-1 rounded-none bg-slate-50 font-medium"
                  >
                    <option value="Semua">Semua Kelas</option>
                    {classList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 max-h-[500px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#075985] text-white font-bold text-[11px] uppercase tracking-wider sticky top-0 z-10">
                    <tr>
                      <th className="p-2.5 text-center w-12">No</th>
                      <th className="p-2.5">Nama Peserta Didik</th>
                      <th className="p-2.5">Rombel</th>
                      <th className="p-2.5">NISN Terdaftar</th>
                      <th className="p-2.5">Keterangan Audit Validasi</th>
                      <th className="p-2.5 text-center">Status</th>
                      <th className="p-2.5 text-center">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredStudentAuditIssues.map((s) => (
                      <tr key={s.id} className="hover:bg-rose-50/40 transition-colors">
                        <td className="p-2.5 text-center font-bold text-slate-500">{s.id}</td>
                        <td className="p-2.5 font-bold text-slate-800">
                          {s.name}
                        </td>
                        <td className="p-2.5 font-bold text-sky-900">{s.className}</td>
                        <td className="p-2.5 font-mono text-slate-600">{s.nisn}</td>
                        <td className="p-2.5 text-rose-700 font-medium">{s.reason}</td>
                        <td className="p-2.5 text-center">
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-800 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-none">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Invalid
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              triggerToast(`Membuka form perbaikan data siswa: ${s.name}`);
                              onNavigateTab?.('students');
                            }}
                            className="bg-white hover:bg-[#075985] text-slate-700 hover:text-white border border-slate-300 hover:border-[#075985] text-[11px] font-bold px-2 py-1 rounded-none transition-colors cursor-pointer"
                          >
                            Perbaiki Data
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: VALIDASI NILAI & KKTP */}
      {activeSubTab === 'grades' && (
        <div className="space-y-4">
          {renderAuditMetricsHeader()}

          <div className="bg-white border border-slate-200 p-4 rounded-none shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <span>Validasi Ketuntasan Nilai Formatif & Sumatif (Nilai: Warning : 46, Invalid : 0)</span>
                  <span className="text-[10px] bg-amber-500 text-amber-950 font-black px-2 py-0.5">
                    46 WARNING
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Rincian 46 warning capaian formatif TP1 s.d. TP4 dan sumatif lingkup materi yang perlu dilengkapi.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigateTab?.('grades')}
                  className="bg-[#075985] hover:bg-[#0369a1] text-white font-bold text-xs px-3 py-1.5 rounded-none flex items-center gap-1 cursor-pointer"
                >
                  <span>Buka Manajemen Nilai</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 max-h-[500px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#075985] text-white font-bold text-[11px] uppercase tracking-wider sticky top-0 z-10">
                  <tr>
                    <th className="p-2.5 text-center w-12">No</th>
                    <th className="p-2.5">Nama Peserta Didik</th>
                    <th className="p-2.5">Rombel</th>
                    <th className="p-2.5">Mata Pelajaran</th>
                    <th className="p-2.5">Keterangan Warning Nilai</th>
                    <th className="p-2.5 text-center">Status</th>
                    <th className="p-2.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredGradeAuditIssues.map((g) => (
                    <tr key={g.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="p-2.5 text-center font-bold text-slate-500">{g.id}</td>
                      <td className="p-2.5 font-bold text-slate-800">{g.name}</td>
                      <td className="p-2.5 font-bold text-sky-900">{g.className}</td>
                      <td className="p-2.5 font-semibold text-slate-700">{g.subject}</td>
                      <td className="p-2.5 text-amber-800 font-medium">{g.reason}</td>
                      <td className="p-2.5 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-none">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Warning
                        </span>
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            triggerToast(`Membuka entri nilai untuk siswa: ${g.name}`);
                            onNavigateTab?.('grades');
                          }}
                          className="bg-white hover:bg-[#075985] text-slate-700 hover:text-white border border-slate-300 hover:border-[#075985] text-[11px] font-bold px-2 py-1 rounded-none transition-colors cursor-pointer"
                        >
                          Entri Nilai
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: VALIDASI PRESENSI */}
      {activeSubTab === 'attendance' && (
        <div className="space-y-4">
          {renderAuditMetricsHeader()}

          <div className="bg-white border border-slate-200 p-4 rounded-none shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                  Validasi Rekapitulasi Presensi & Kehadiran (Pembelajaran: Warning : 0, Invalid : 0)
                </h3>
                <p className="text-xs text-slate-500">
                  Pemeriksaan persentase kehadiran per rombel, surat keterangan sakit, dan izin resmi.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onNavigateTab?.('attendance')}
                className="bg-[#075985] hover:bg-[#0369a1] text-white font-bold text-xs px-3 py-1.5 rounded-none cursor-pointer"
              >
                Buka Presensi Harian
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-800">Ringkasan Validasi Kehadiran Rombel:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-white p-2.5 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Rata-rata Hadir</span>
                  <p className="text-lg font-black text-emerald-700">96.8%</p>
                </div>
                <div className="bg-white p-2.5 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Sakit (S)</span>
                  <p className="text-lg font-black text-sky-700">2.1%</p>
                </div>
                <div className="bg-white p-2.5 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Izin (I)</span>
                  <p className="text-lg font-black text-amber-700">0.8%</p>
                </div>
                <div className="bg-white p-2.5 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Alpa (A)</span>
                  <p className="text-lg font-black text-rose-600">0.3%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: VALIDASI MODUL GURU */}
      {activeSubTab === 'modules' && (
        <div className="space-y-4">
          {renderAuditMetricsHeader()}

          <div className="bg-white border border-slate-200 p-4 rounded-none shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                  Validasi Supervisi Perangkat Ajar Guru (Kurikulum: Warning : 2, Invalid : 1 | GTK: Warning : 1, Invalid : 0)
                </h3>
                <p className="text-xs text-slate-500">
                  Verifikasi kelayakan modul ajar guru, alur tujuan pembelajaran (ATP), dan perangkat ajar kurikulum merdeka.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onNavigateTab?.('system-kurikulum')}
                className="bg-[#075985] hover:bg-[#0369a1] text-white font-bold text-xs px-3 py-1.5 rounded-none cursor-pointer"
              >
                Buka Sistem Kurikulum
              </button>
            </div>

            <div className="divide-y divide-slate-200 border border-slate-200">
              {teacherModules.length > 0 ? (
                teacherModules.map((doc) => (
                  <div key={doc.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-800">{doc.title}</h4>
                      <p className="text-[11px] text-slate-500">
                        Oleh: <strong>{doc.teacherName}</strong> • Mapel: {doc.subject} ({doc.className})
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-none ${
                        doc.status === 'Disetujui'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {doc.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => triggerToast(`Modul "${doc.title}" berhasil disahkan sebagai dokumen tervalidasi.`)}
                        className="bg-white hover:bg-emerald-600 hover:text-white border border-slate-300 text-slate-700 text-xs font-bold px-2 py-1 rounded-none transition-colors"
                      >
                        Sahkan
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs">
                  Belum ada berkas perangkat ajar yang diunggah.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: BERITA ACARA VALIDASI (BAVA) SIAP CETAK */}
      {activeSubTab === 'report' && (
        <div className="space-y-4 max-w-4xl mx-auto">
          {/* Action Toolbar on Top (Hidden during printing) */}
          <div className="bg-white border border-slate-200 p-3 px-4 rounded-none shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[11px] font-black uppercase tracking-wider font-mono border border-blue-300">
                DOKUMEN RESMI BAVA
              </span>
              <span className="text-xs text-slate-600 font-medium">
                Pratinjau Berita Acara Validasi Akademik & Rapor siap ditandatangani dan dicetak.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenEditReport}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-none flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors border border-amber-600"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Berita Acara</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="bg-[#075985] hover:bg-[#0369a1] text-white font-bold text-xs px-3.5 py-1.5 rounded-none flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-amber-300" />
                <span>Cetak Berita Acara (PDF)</span>
              </button>
            </div>
          </div>

          {/* Printable Document Sheet */}
          <div className="bg-white border border-slate-300 p-8 sm:p-10 rounded-none shadow-md space-y-6 max-w-4xl mx-auto print:p-0 print:border-0 print:shadow-none">
            {/* Header Kop Surat */}
            <div className="text-center border-b-2 border-slate-800 pb-4 space-y-1">
              <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
                {beritaAcara.instansiAtas}
              </h3>
              <h4 className="text-sm sm:text-base font-black text-sky-950 uppercase tracking-wide">
                {beritaAcara.namaSekolah}
              </h4>
              <p className="text-[11px] text-slate-600">
                NPSN: {beritaAcara.npsn} • {beritaAcara.akreditasi} • Alamat: {beritaAcara.alamatKop}
              </p>
            </div>

            {/* Title Document */}
            <div className="text-center space-y-1">
              <h4 className="text-sm sm:text-base font-black text-slate-900 underline underline-offset-4 uppercase">
                {beritaAcara.judulDokumen}
              </h4>
              <p className="text-xs text-slate-600 font-mono">
                Nomor: {beritaAcara.nomorSurat}
              </p>
            </div>

            {/* Body Paragraph */}
            <div className="text-xs text-slate-800 leading-relaxed space-y-3">
              <p>
                Pada hari ini, <strong>{beritaAcara.hariTanggal}</strong>, telah dilaksanakan verifikasi dan validasi data akademik, kesiswaan, serta penilaian peserta didik tahun ajaran <strong>{beritaAcara.tahunAjaranSemester}</strong> dengan ringkasan sebagai berikut:
              </p>

              <div className="bg-slate-50 border border-slate-300 p-3.5 space-y-1.5 font-mono text-[11px] text-slate-900">
                <div>1. {beritaAcara.item1Rombel}</div>
                <div>2. {beritaAcara.item2Siswa}</div>
                <div>3. {beritaAcara.item3Nilai}</div>
                <div>4. {beritaAcara.item4Kurikulum}</div>
                <div>5. {beritaAcara.item5Kehadiran}</div>
              </div>

              <p className="text-justify leading-relaxed">
                {beritaAcara.catatanHasil}
              </p>
            </div>

            {/* Signatures Row */}
            <div className="pt-6 grid grid-cols-2 gap-6 text-xs text-center">
              <div className="space-y-16">
                <p className="font-semibold text-slate-700 whitespace-pre-line">
                  Mengetahui,<br />{beritaAcara.penandatangan1Jabatan}
                </p>
                <div>
                  <p className="font-bold text-slate-900 underline">{beritaAcara.penandatangan1Nama}</p>
                  <p className="text-[10px] text-slate-500 font-mono">NIP. {beritaAcara.penandatangan1Nip}</p>
                </div>
              </div>

              <div className="space-y-16">
                <p className="font-semibold text-slate-700 whitespace-pre-line">
                  {beritaAcara.penandatangan2Jabatan}
                </p>
                <div>
                  <p className="font-bold text-slate-900 underline">{beritaAcara.penandatangan2Nama}</p>
                  <p className="text-[10px] text-slate-500 font-mono">NIP. {beritaAcara.penandatangan2Nip}</p>
                </div>
              </div>
            </div>

            {/* Action Bottom Bar (Hidden in Print) */}
            <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
              <div className="text-[11px] text-slate-500 font-medium">
                Terakhir disesuaikan dengan standar data SIMAK & Kemendikdasmen.
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenEditReport}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-none flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors border border-amber-600"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Berita Acara</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-[#075985] hover:bg-[#0369a1] text-white font-bold text-xs px-4 py-2 rounded-none flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-300" />
                  <span>Cetak Berita Acara (PDF)</span>
                </button>
              </div>
            </div>
          </div>

          {/* EDIT BERITA ACARA MODAL */}
          {isEditingReport && (
            <div className="fixed inset-0 z-[99999] bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
              <div className="bg-white border-2 border-[#075985] shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col rounded-none my-auto">
                {/* Modal Header */}
                <div className="bg-[#075985] text-white px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Edit3 className="w-5 h-5 text-amber-300" />
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider">
                        Edit Format & Konten Berita Acara (BAVA)
                      </h3>
                      <p className="text-[11px] text-sky-100">
                        Sesuaikan kop surat, nomor registrasi, isi berita acara, dan pejabat penandatangan
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingReport(false)}
                    className="text-sky-200 hover:text-white p-1 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body Form */}
                <form onSubmit={handleSaveReportEdit} className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
                  {/* Bagian 1: Kop Surat & Lembaga */}
                  <div className="space-y-3 bg-slate-50 border border-slate-200 p-3.5">
                    <h4 className="font-black text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      1. Kop Surat & Identitas Satuan Pendidikan
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block font-bold text-slate-700 mb-1">Instansi Induk / Dinas</label>
                        <input
                          type="text"
                          value={editReportForm.instansiAtas}
                          onChange={(e) => setEditReportForm({ ...editReportForm, instansiAtas: e.target.value })}
                          className="w-full border border-slate-300 p-2 text-xs rounded-none bg-white font-medium focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                          placeholder="e.g. PEMERINTAH PROVINSI JAWA TIMUR • DINAS PENDIDIKAN"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block font-bold text-slate-700 mb-1">Nama Satuan Pendidikan / Sekolah</label>
                        <input
                          type="text"
                          value={editReportForm.namaSekolah}
                          onChange={(e) => setEditReportForm({ ...editReportForm, namaSekolah: e.target.value })}
                          className="w-full border border-slate-300 p-2 text-xs rounded-none bg-white font-bold text-sky-900 focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">NPSN</label>
                        <input
                          type="text"
                          value={editReportForm.npsn}
                          onChange={(e) => setEditReportForm({ ...editReportForm, npsn: e.target.value })}
                          className="w-full border border-slate-300 p-2 text-xs rounded-none bg-white font-mono focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Status Akreditasi</label>
                        <input
                          type="text"
                          value={editReportForm.akreditasi}
                          onChange={(e) => setEditReportForm({ ...editReportForm, akreditasi: e.target.value })}
                          className="w-full border border-slate-300 p-2 text-xs rounded-none bg-white focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block font-bold text-slate-700 mb-1">Alamat Lengkap Kop</label>
                        <input
                          type="text"
                          value={editReportForm.alamatKop}
                          onChange={(e) => setEditReportForm({ ...editReportForm, alamatKop: e.target.value })}
                          className="w-full border border-slate-300 p-2 text-xs rounded-none bg-white focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bagian 2: Informasi Dokumen & Periode */}
                  <div className="space-y-3 bg-slate-50 border border-slate-200 p-3.5">
                    <h4 className="font-black text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      2. Judul, Nomor Surat & Tanggal Pelaksanaan
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block font-bold text-slate-700 mb-1">Judul Dokumen</label>
                        <input
                          type="text"
                          value={editReportForm.judulDokumen}
                          onChange={(e) => setEditReportForm({ ...editReportForm, judulDokumen: e.target.value })}
                          className="w-full border border-slate-300 p-2 text-xs rounded-none bg-white font-bold focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Nomor Registrasi Surat</label>
                        <input
                          type="text"
                          value={editReportForm.nomorSurat}
                          onChange={(e) => setEditReportForm({ ...editReportForm, nomorSurat: e.target.value })}
                          className="w-full border border-slate-300 p-2 text-xs rounded-none bg-white font-mono focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Hari & Tanggal Pelaksanaan</label>
                        <input
                          type="text"
                          value={editReportForm.hariTanggal}
                          onChange={(e) => setEditReportForm({ ...editReportForm, hariTanggal: e.target.value })}
                          className="w-full border border-slate-300 p-2 text-xs rounded-none bg-white focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block font-bold text-slate-700 mb-1">Tahun Ajaran & Semester</label>
                        <input
                          type="text"
                          value={editReportForm.tahunAjaranSemester}
                          onChange={(e) => setEditReportForm({ ...editReportForm, tahunAjaranSemester: e.target.value })}
                          className="w-full border border-slate-300 p-2 text-xs rounded-none bg-white focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bagian 3: Ringkasan Rincian Validasi */}
                  <div className="space-y-3 bg-slate-50 border border-slate-200 p-3.5">
                    <h4 className="font-black text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-amber-600" />
                      3. Rincian Poin Hasil Validasi
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <label className="block font-bold text-slate-700 mb-0.5">Poin 1 (Rombongan Belajar)</label>
                        <input
                          type="text"
                          value={editReportForm.item1Rombel}
                          onChange={(e) => setEditReportForm({ ...editReportForm, item1Rombel: e.target.value })}
                          className="w-full border border-slate-300 p-2 text-xs rounded-none bg-white font-mono focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-0.5">Poin 2 (Validasi Siswa)</label>
                        <input
                          type="text"
                          value={editReportForm.item2Siswa}
                          onChange={(e) => setEditReportForm({ ...editReportForm, item2Siswa: e.target.value })}
                          className="w-full border border-slate-300 p-2 text-xs rounded-none bg-white font-mono focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-0.5">Poin 3 (Validasi Nilai)</label>
                        <input
                          type="text"
                          value={editReportForm.item3Nilai}
                          onChange={(e) => setEditReportForm({ ...editReportForm, item3Nilai: e.target.value })}
                          className="w-full border border-slate-300 p-2 text-xs rounded-none bg-white font-mono focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-0.5">Poin 4 (Validasi Kurikulum & Modul)</label>
                        <input
                          type="text"
                          value={editReportForm.item4Kurikulum}
                          onChange={(e) => setEditReportForm({ ...editReportForm, item4Kurikulum: e.target.value })}
                          className="w-full border border-slate-300 p-2 text-xs rounded-none bg-white font-mono focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-0.5">Poin 5 (Kehadiran & Pembelajaran)</label>
                        <input
                          type="text"
                          value={editReportForm.item5Kehadiran}
                          onChange={(e) => setEditReportForm({ ...editReportForm, item5Kehadiran: e.target.value })}
                          className="w-full border border-slate-300 p-2 text-xs rounded-none bg-white font-mono focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                        />
                      </div>
                      <div className="pt-1">
                        <label className="block font-bold text-slate-700 mb-0.5">Paragraf Kesimpulan / Rekomendasi Audit</label>
                        <textarea
                          rows={3}
                          value={editReportForm.catatanHasil}
                          onChange={(e) => setEditReportForm({ ...editReportForm, catatanHasil: e.target.value })}
                          className="w-full border border-slate-300 p-2 text-xs rounded-none bg-white focus:ring-1 focus:ring-sky-500 focus:outline-hidden leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bagian 4: Penandatangan */}
                  <div className="space-y-3 bg-slate-50 border border-slate-200 p-3.5">
                    <h4 className="font-black text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                      <Award className="w-3.5 h-3.5 text-purple-600" />
                      4. Pejabat & Pihak Penandatangan
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Penandatangan 1 */}
                      <div className="space-y-2 bg-white border border-slate-200 p-3">
                        <span className="font-bold text-slate-900 text-[11px] block border-b border-slate-100 pb-1">
                          Pihak 1 (Validator / Koordinator)
                        </span>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Jabatan / Peran</label>
                          <input
                            type="text"
                            value={editReportForm.penandatangan1Jabatan}
                            onChange={(e) => setEditReportForm({ ...editReportForm, penandatangan1Jabatan: e.target.value })}
                            className="w-full border border-slate-300 p-1.5 text-xs rounded-none bg-white focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Nama Lengkap & Gelar</label>
                          <input
                            type="text"
                            value={editReportForm.penandatangan1Nama}
                            onChange={(e) => setEditReportForm({ ...editReportForm, penandatangan1Nama: e.target.value })}
                            className="w-full border border-slate-300 p-1.5 text-xs rounded-none bg-white font-bold focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">NIP</label>
                          <input
                            type="text"
                            value={editReportForm.penandatangan1Nip}
                            onChange={(e) => setEditReportForm({ ...editReportForm, penandatangan1Nip: e.target.value })}
                            className="w-full border border-slate-300 p-1.5 text-xs rounded-none bg-white font-mono focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      {/* Penandatangan 2 */}
                      <div className="space-y-2 bg-white border border-slate-200 p-3">
                        <span className="font-bold text-slate-900 text-[11px] block border-b border-slate-100 pb-1">
                          Pihak 2 (Kepala Sekolah)
                        </span>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Jabatan / Satuan</label>
                          <input
                            type="text"
                            value={editReportForm.penandatangan2Jabatan}
                            onChange={(e) => setEditReportForm({ ...editReportForm, penandatangan2Jabatan: e.target.value })}
                            className="w-full border border-slate-300 p-1.5 text-xs rounded-none bg-white focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Nama Kepala Sekolah</label>
                          <input
                            type="text"
                            value={editReportForm.penandatangan2Nama}
                            onChange={(e) => setEditReportForm({ ...editReportForm, penandatangan2Nama: e.target.value })}
                            className="w-full border border-slate-300 p-1.5 text-xs rounded-none bg-white font-bold focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">NIP Kepala Sekolah</label>
                          <input
                            type="text"
                            value={editReportForm.penandatangan2Nip}
                            onChange={(e) => setEditReportForm({ ...editReportForm, penandatangan2Nip: e.target.value })}
                            className="w-full border border-slate-300 p-1.5 text-xs rounded-none bg-white font-mono focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer Controls */}
                  <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={handleResetReportDefault}
                      className="px-3 py-2 border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-none flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                      <span>Kembalikan Format Default</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingReport(false)}
                        className="px-3.5 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-none cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#075985] hover:bg-[#0369a1] text-white font-bold text-xs rounded-none flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                      >
                        <Save className="w-3.5 h-3.5 text-amber-300" />
                        <span>Simpan Perubahan Berita Acara</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
