import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Calendar,
  Layers,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  Award,
  Download,
  Plus,
  Users,
  Search,
  ArrowRight,
  ExternalLink,
  Sliders,
  CheckSquare,
  AlertTriangle,
  FileText,
  Building2,
  Sparkles,
  Edit3,
  Trash2,
  Save,
  X,
  UserCheck,
  UserPlus,
  ShieldCheck,
  KeyRound,
  Settings,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  RefreshCw,
  ClipboardCheck,
  Trophy,
  Printer,
  Info,
  FolderUp,
  FileCheck,
  FolderOpen,
  HelpCircle,
  CheckCheck
} from 'lucide-react';
import { UserAccount, TeacherProfile, Subject, TeacherModuleDocument, ModuleCategory, WeeklyClassScheduleItem } from '../../types';
import { initialWeeklyClassSchedules } from '../../data/initialData';
import {
  saveCurriculumJjmToFirebase,
  subscribeToCurriculumJjm,
  saveCurriculumP5ToFirebase,
  subscribeToCurriculumP5,
  saveCurriculumEventsToFirebase,
  subscribeToCurriculumEvents,
  saveRegisteredUsersToFirebase,
  saveWeeklySchedulesToFirebase,
  subscribeToWeeklySchedules
} from '../../lib/firebaseService';
import { auth } from '../../lib/firebase';
import { SaveSuccessModal } from '../SaveSuccessModal';

interface JJMItem {
  code: string;
  name: string;
  fase: string;
  jjm: number;
  p5: number;
  total: number;
  guru: string;
  kktp: number;
}

const initialDefaultModules: TeacherModuleDocument[] = [
  {
    id: 'MOD-01',
    title: 'Modul Ajar Bab 1: Struktur & Fungsi Seluler Diferensiasi',
    category: 'Modul Ajar (RPP Merdeka)',
    subject: 'Biologi',
    fase: 'Fase E (Kelas X)',
    className: 'X-IPA 1, X-IPA 2',
    semester: 'Ganjil',
    academicYear: '2026/2027',
    teacherName: 'Shahrur Robby, S.Pd.',
    teacherNip: '19900101 201501 1 001',
    fileName: 'Modul_Ajar_Biologi_X_Struktur_Sel_2026.pdf',
    fileSize: '2.4 MB',
    fileType: 'pdf',
    fileUrl: '#',
    uploadedAt: '2026-08-15',
    status: 'Disetujui',
    verificationNotes: 'Sesuai dengan capaian pembelajaran Fase E dan prinsip pembelajaran berdiferensiasi.',
    verifiedBy: 'Waka Kurikulum',
    verifiedAt: '2026-08-18'
  },
  {
    id: 'MOD-02',
    title: 'Alur Tujuan Pembelajaran (ATP) Biologi Fase E Lengkap',
    category: 'Alur Tujuan Pembelajaran (ATP)',
    subject: 'Biologi',
    fase: 'Fase E (Kelas X)',
    className: 'Semua Kelas X',
    semester: 'Semua Semester',
    academicYear: '2026/2027',
    teacherName: 'Shahrur Robby, S.Pd.',
    teacherNip: '19900101 201501 1 001',
    fileName: 'ATP_Biologi_Fase_E_Kurikulum_Merdeka_Rev2026.docx',
    fileSize: '840 KB',
    fileType: 'docx',
    fileUrl: '#',
    uploadedAt: '2026-08-12',
    status: 'Disetujui',
    verificationNotes: 'Alur runtut dari pemahaman sel hingga ekosistem hayati.',
    verifiedBy: 'Tim Pengembang Kurikulum',
    verifiedAt: '2026-08-14'
  },
  {
    id: 'MOD-03',
    title: 'Capaian Pembelajaran (CP) & Analisis Elemen Sains Biologi',
    category: 'Capaian Pembelajaran (CP)',
    subject: 'Biologi',
    fase: 'Fase E (Kelas X)',
    className: 'Semua Kelas X',
    semester: 'Ganjil',
    academicYear: '2026/2027',
    teacherName: 'Shahrur Robby, S.Pd.',
    teacherNip: '19900101 201501 1 001',
    fileName: 'Analisis_CP_Biologi_Fase_E.pdf',
    fileSize: '1.1 MB',
    fileType: 'pdf',
    fileUrl: '#',
    uploadedAt: '2026-08-10',
    status: 'Disetujui',
    verificationNotes: 'Disahkan untuk panduan semester ganjil.',
    verifiedBy: 'Kepala Sekolah',
    verifiedAt: '2026-08-11'
  },
  {
    id: 'MOD-04',
    title: 'Program Tahunan (Prota) & Program Semester (Promes) Ganjil',
    category: 'Program Tahunan (Prota)',
    subject: 'Biologi',
    fase: 'Fase E (Kelas X)',
    className: 'Kelas X',
    semester: 'Ganjil',
    academicYear: '2026/2027',
    teacherName: 'Shahrur Robby, S.Pd.',
    teacherNip: '19900101 201501 1 001',
    fileName: 'Prota_Promes_Biologi_X_2026_2027.xlsx',
    fileSize: '520 KB',
    fileType: 'xlsx',
    fileUrl: '#',
    uploadedAt: '2026-08-16',
    status: 'Disetujui',
    verificationNotes: 'Alokasi pekan efektif 18 minggu telah diverifikasi tepat.',
    verifiedBy: 'Waka Kurikulum',
    verifiedAt: '2026-08-19'
  },
  {
    id: 'MOD-05',
    title: 'Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) & Rubrik Asesmen',
    category: 'Kriteria Ketercapaian TP (KKTP)',
    subject: 'Biologi',
    fase: 'Fase E (Kelas X)',
    className: 'X-IPA 1, X-IPA 2',
    semester: 'Ganjil',
    academicYear: '2026/2027',
    teacherName: 'Shahrur Robby, S.Pd.',
    teacherNip: '19900101 201501 1 001',
    fileName: 'KKTP_Rubrik_Asesmen_Biologi_X.pdf',
    fileSize: '1.7 MB',
    fileType: 'pdf',
    fileUrl: '#',
    uploadedAt: '2026-08-18',
    status: 'Meninjau',
    verificationNotes: 'Sedang dalam antrean verifikasi rubrik deskripsi kualitatif.',
    verifiedBy: 'Tim Kurikulum'
  },
  {
    id: 'MOD-06',
    title: 'LKPD Praktikum Pengamatan Mikroskop & Jaringan Tumbuhan',
    category: 'Lembar Kerja Siswa (LKPD)',
    subject: 'Biologi',
    fase: 'Fase E (Kelas X)',
    className: 'X-IPA 1',
    semester: 'Ganjil',
    academicYear: '2026/2027',
    teacherName: 'Shahrur Robby, S.Pd.',
    teacherNip: '19900101 201501 1 001',
    fileName: 'LKPD_Praktikum_Mikroskop_Sel_2026.pdf',
    fileSize: '3.2 MB',
    fileType: 'pdf',
    fileUrl: '#',
    uploadedAt: '2026-08-20',
    status: 'Disetujui',
    verificationNotes: 'Instruksi K3 laboratorium dan keselamatan kerja sangat lengkap.',
    verifiedBy: 'Waka Kurikulum',
    verifiedAt: '2026-08-21'
  },
  {
    id: 'MOD-07',
    title: 'Kisi-Kisi Soal & Instrumen Asesmen Sumatif Tengah Semester (STS)',
    category: 'Kisi-Kisi / Bank Soal',
    subject: 'Biologi',
    fase: 'Fase E (Kelas X)',
    className: 'Semua Kelas X',
    semester: 'Ganjil',
    academicYear: '2026/2027',
    teacherName: 'Shahrur Robby, S.Pd.',
    teacherNip: '19900101 201501 1 001',
    fileName: 'Kisi_Kisi_STS_Biologi_X_Ganjil.docx',
    fileSize: '610 KB',
    fileType: 'docx',
    fileUrl: '#',
    uploadedAt: '2026-08-22',
    status: 'Meninjau',
    verificationNotes: 'Menunggu review kartu soal level HOTS.'
  }
];

interface CurriculumSystemViewProps {
  registeredUsers: UserAccount[];
  teacher?: TeacherProfile;
  classList?: string[];
  allRegisteredClasses?: string[];
  inactiveClasses?: string[];
  onNavigateTab?: (tab: string) => void;
  onUpdateRegisteredUsers?: (users: UserAccount[]) => void;
  onOpenAddUserModal?: (defaultRole: string) => void;
  onOpenEditUserModal?: (user: UserAccount) => void;
  onOpenDeleteUserModal?: (user: UserAccount) => void;
  onOpenModuleModal?: (user: UserAccount, tab: any) => void;
  onSelectCategory?: (category: 'Semua' | 'Kurikulum' | 'Guru' | 'TU' | 'Siswa') => void;
  renderUserModule?: (user: UserAccount, tab: string) => React.ReactNode;
}

const initialJjmList: JJMItem[] = [
  { code: 'PAI-01', name: 'Pendidikan Agama & Budi Pekerti', fase: 'Fase E (Kelas X)', jjm: 3, p5: 1, total: 4, guru: 'Drs. H. Ahmad Dahlan, M.Pd.I', kktp: 75 },
  { code: 'PPKN-01', name: 'Pendidikan Pancasila', fase: 'Fase E (Kelas X)', jjm: 2, p5: 1, total: 3, guru: 'Siti Rahmawati, S.Pd.', kktp: 75 },
  { code: 'IND-01', name: 'Bahasa Indonesia', fase: 'Fase E (Kelas X)', jjm: 4, p5: 1, total: 5, guru: 'Dewi Lestari, M.Pd.', kktp: 78 },
  { code: 'MAT-01', name: 'Matematika Umum', fase: 'Fase E (Kelas X)', jjm: 4, p5: 1, total: 5, guru: 'Budi Santoso, S.Pd., M.Si.', kktp: 75 },
  { code: 'BIO-01', name: 'Biologi', fase: 'Fase E (Kelas X)', jjm: 3, p5: 1, total: 4, guru: 'Shahrur Robby, S.Pd.', kktp: 75 },
  { code: 'FIS-01', name: 'Fisika', fase: 'Fase E (Kelas X)', jjm: 3, p5: 1, total: 4, guru: 'Ir. Agus Pratama, S.Pd.', kktp: 75 },
  { code: 'KIM-01', name: 'Kimia', fase: 'Fase E (Kelas X)', jjm: 3, p5: 1, total: 4, guru: 'Dr. Nurul Hidayati, M.Sc.', kktp: 76 },
  { code: 'SEJ-01', name: 'Sejarah Indonesia', fase: 'Fase E (Kelas X)', jjm: 2, p5: 1, total: 3, guru: 'Bambang Triatmojo, S.Pd.', kktp: 75 },
  { code: 'ING-01', name: 'Bahasa Inggris', fase: 'Fase E (Kelas X)', jjm: 3, p5: 1, total: 4, guru: 'Anita Wijaya, S.Pd., M.Hum.', kktp: 77 },
  { code: 'PJOK-01', name: 'Pendidikan Jasmani, Olahraga, & Kesehatan', fase: 'Fase E (Kelas X)', jjm: 3, p5: 1, total: 4, guru: 'Hendra Gunawan, S.Pd.', kktp: 75 },
  { code: 'INF-01', name: 'Informatika', fase: 'Fase E (Kelas X)', jjm: 3, p5: 1, total: 4, guru: 'Muhammad Rizki, S.Kom., M.T.', kktp: 78 },
  { code: 'SNB-01', name: 'Seni Budaya & Prakarya', fase: 'Fase E (Kelas X)', jjm: 2, p5: 1, total: 3, guru: 'Ratna Sari, S.Sn.', kktp: 75 }
];

const initialP5List = [
  { id: 1, tema: 'Gaya Hidup Berkelanjutan', status: 'Aktif Semester 1', target: 'Dimensi Beriman, Bertakwa & Mandiri', pic: 'Siti Rahmawati, S.Pd.' },
  { id: 2, tema: 'Kearifan Lokal & Budaya', status: 'Rencana Semester 2', target: 'Dimensi Berkebinekaan Global & Gotong Royong', pic: 'Bambang Triatmojo, S.Pd.' },
  { id: 3, tema: 'Kewirausahaan Digital', status: 'Pilihan Kelas XI', target: 'Dimensi Kreatif & Mandiri', pic: 'Muhammad Rizki, S.Kom., M.T.' },
  { id: 4, tema: 'Suara Demokrasi & Kewarganegaraan', status: 'Pemilihan Ketua OSIS', target: 'Dimensi Bernalar Kritis', pic: 'Dewi Lestari, M.Pd.' }
];

const initialRpeList = [
  { date: '15 - 17 Juli 2026', event: 'Masa Pengenalan Lingkungan Sekolah (MPLS)', category: 'Non-Efektif', desc: 'Pengenalan lingkungan sekolah bagi peserta didik baru' },
  { date: '21 - 26 September 2026', event: 'Sumatif Tengah Semester (STS) Ganjil', category: 'Asesmen', desc: 'Penilaian capaian pembelajaran pertengahan semester' },
  { date: '23 Nov - 5 Des 2026', event: 'Sumatif Akhir Semester (SAS) Ganjil', category: 'Asesmen', desc: 'Asesmen komprehensif semester ganjil' },
  { date: '18 Desember 2026', event: 'Penyerahan Laporan Hasil Belajar (Rapor)', category: 'Pelaporan', desc: 'Pembagian Rapor Semester Ganjil 2026/2027' },
  { date: '21 Des - 2 Jan 2027', event: 'Libur Semester Ganjil & Tahun Baru', category: 'Libur', desc: 'Libur resmi kalender pendidikan' }
];

export const CurriculumSystemView: React.FC<CurriculumSystemViewProps> = ({
  registeredUsers,
  teacher,
  classList = [],
  allRegisteredClasses = [],
  inactiveClasses = [],
  onNavigateTab,
  onUpdateRegisteredUsers,
  onOpenAddUserModal,
  onOpenEditUserModal,
  onOpenDeleteUserModal,
  onOpenModuleModal,
  onSelectCategory,
  renderUserModule
}) => {
  const [activeTab, setActiveTab] = useState<'jjm' | 'jadwalMapel' | 'validasiModul' | 'guruMapel' | 'perangkat' | 'kalender' | 'tim'>('jjm');
  const [searchMapel, setSearchMapel] = useState<string>('');
  const [searchGuru, setSearchGuru] = useState<string>('');
  const [filterFase, setFilterFase] = useState<string>('Semua');

  // Weekly Subject Schedule (1-Week Schedule) State
  const [weeklySchedules, setWeeklySchedules] = useState<WeeklyClassScheduleItem[]>(() => {
    try {
      const isCleared = typeof window !== 'undefined' && localStorage.getItem('simak_weekly_class_schedules_cleared') === 'true';
      if (isCleared) return [];
      const saved = typeof window !== 'undefined' ? localStorage.getItem('simak_weekly_class_schedules') : null;
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading weekly schedules from storage:', e);
    }
    return initialWeeklyClassSchedules;
  });

  const [filterScheduleClass, setFilterScheduleClass] = useState<string>('Semua Kelas');
  const [filterScheduleDay, setFilterScheduleDay] = useState<string>('Semua Hari');
  const [searchScheduleQuery, setSearchScheduleQuery] = useState<string>('');

  // Weekly Schedule Modal States
  const [showWeeklyScheduleModal, setShowWeeklyScheduleModal] = useState<boolean>(false);
  const [editingScheduleItem, setEditingScheduleItem] = useState<WeeklyClassScheduleItem | null>(null);
  const [schDay, setSchDay] = useState<string>('Senin');
  const [schTime, setSchTime] = useState<string>('07.00 - 08.30');
  const [schClassName, setSchClassName] = useState<string>(() => {
    const activeFromProps = (classList || []).filter(c => Boolean(c) && c !== 'Semua Kelas' && c !== 'SEMUA');
    return activeFromProps[0] || 'X-IPA 1';
  });
  const [schSubject, setSchSubject] = useState<string>('Biologi - Struktur & Fungsi Sel');
  const [schTeacher, setSchTeacher] = useState<string>(teacher?.name || 'Shahrur Robby, S.Pd.');
  const [schRoom, setSchRoom] = useState<string>('Lab Biologi');
  const [schNotes, setSchNotes] = useState<string>('');

  const [showDeleteScheduleModal, setShowDeleteScheduleModal] = useState<boolean>(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<WeeklyClassScheduleItem | null>(null);
  const [showResetScheduleModal, setShowResetScheduleModal] = useState<boolean>(false);
  const [showPrintScheduleModal, setShowPrintScheduleModal] = useState<boolean>(false);

  // Sync weekly schedules with Firebase & local storage
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const token = await user.getIdToken();
          const res = await fetch('/api/teaching-schedules', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const remoteSchedules = await res.json();
            if (Array.isArray(remoteSchedules)) {
              const isCleared = localStorage.getItem('simak_weekly_class_schedules_cleared') === 'true';
              if (remoteSchedules.length > 0 || isCleared) {
                setWeeklySchedules(remoteSchedules);
                try {
                  localStorage.setItem('simak_weekly_class_schedules', JSON.stringify(remoteSchedules));
                } catch (e) {
                  // ignore
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch schedules from postgres', err);
      }
    };
    fetchSchedules();

    const unsub = subscribeToWeeklySchedules((items) => {
      if (items && Array.isArray(items)) {
        // Fallback or secondary sync
      }
    });

    const handleStorageUpdate = (e: StorageEvent) => {
      if (e.key === 'simak_weekly_class_schedules' && e.newValue) {
        try {
          setWeeklySchedules(JSON.parse(e.newValue));
        } catch (err) {
          console.error('Error parsing updated weekly schedules:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      if (unsub) unsub();
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  // Teacher Module & ATP Validation State with localStorage synchronization
  const [teacherModules, setTeacherModules] = useState<TeacherModuleDocument[]>(() => {
    try {
      const saved = ((k: string) => null as any)('simak_teacher_modules');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading teacher modules from storage:', e);
    }
    return initialDefaultModules;
  });

  const [searchDoc, setSearchDoc] = useState<string>('');
  const [filterDocStatus, setFilterDocStatus] = useState<string>('Semua');
  const [filterDocCategory, setFilterDocCategory] = useState<string>('Semua');
  const [filterDocTeacher, setFilterDocTeacher] = useState<string>('Semua');

  // Validation Modal State
  const [showValidationModal, setShowValidationModal] = useState<boolean>(false);
  const [selectedDocForValidation, setSelectedDocForValidation] = useState<TeacherModuleDocument | null>(null);
  const [valStatus, setValStatus] = useState<'Disetujui' | 'Meninjau' | 'Perlu Revisi'>('Disetujui');
  const [valNotes, setValNotes] = useState<string>('');
  const [valVerifier, setValVerifier] = useState<string>(teacher?.name || 'Waka Kurikulum');
  const [previewDocModal, setPreviewDocModal] = useState<TeacherModuleDocument | null>(null);

  // Sync helper to update state & localStorage
  const updateTeacherModules = (updated: TeacherModuleDocument[]) => {
    setTeacherModules(updated);
    ((k: string, v: string) => void 0)('simak_teacher_modules', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  // Listen to external localStorage changes (e.g. from TeacherModuleUploadView)
  useEffect(() => {
    const handleStorageUpdate = (e: StorageEvent) => {
      if (e.key === 'simak_teacher_modules' && e.newValue) {
        try {
          setTeacherModules(JSON.parse(e.newValue));
        } catch (err) {
          console.error('Error parsing updated teacher modules:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageUpdate);
    return () => window.removeEventListener('storage', handleStorageUpdate);
  }, []);

  // Quick 1-Click Approve Validation
  const handleQuickApprove = (doc: TeacherModuleDocument) => {
    const today = new Date().toISOString().split('T')[0];
    const verifierName = teacher?.name || 'Waka Kurikulum';
    const updated = teacherModules.map(item => {
      if (item.id === doc.id) {
        return {
          ...item,
          status: 'Disetujui' as const,
          verifiedBy: verifierName,
          verifiedAt: today,
          verificationNotes: item.verificationNotes && !item.verificationNotes.toLowerCase().includes('antrean')
            ? item.verificationNotes
            : 'Perangkat pembelajaran telah divalidasi dan disetujui sesuai standar Kurikulum Merdeka.'
        };
      }
      return item;
    });

    updateTeacherModules(updated);
    showToast(`Dokumen "${doc.title}" berhasil divalidasi (Disetujui).`, 'success');
  };

  // Quick Request Revision
  const handleQuickReject = (doc: TeacherModuleDocument) => {
    setSelectedDocForValidation(doc);
    setValStatus('Perlu Revisi');
    setValNotes(doc.verificationNotes || 'Mohon melengkapi rubrik asesmen formatif dan LKPD pendukung.');
    setValVerifier(teacher?.name || 'Waka Kurikulum');
    setShowValidationModal(true);
  };

  // Open Full Validation Modal
  const handleOpenValidationModal = (doc: TeacherModuleDocument) => {
    setSelectedDocForValidation(doc);
    setValStatus(doc.status);
    setValNotes(doc.verificationNotes || '');
    setValVerifier(teacher?.name || 'Waka Kurikulum');
    setShowValidationModal(true);
  };

  // Save Validation Changes from Modal
  const handleSaveValidation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocForValidation) return;

    const today = new Date().toISOString().split('T')[0];
    const verifierName = valVerifier.trim() || teacher?.name || 'Waka Kurikulum';

    const updated = teacherModules.map(item => {
      if (item.id === selectedDocForValidation.id) {
        return {
          ...item,
          status: valStatus,
          verificationNotes: valNotes.trim() || (valStatus === 'Disetujui' ? 'Tervalidasi sesuai standar BSKAP Kemendikbudristek.' : 'Sedang dalam peninjauan.'),
          verifiedBy: verifierName,
          verifiedAt: valStatus === 'Disetujui' ? today : item.verifiedAt
        };
      }
      return item;
    });

    updateTeacherModules(updated);
    setShowValidationModal(false);
    setSelectedDocForValidation(null);
    setSaveSuccessMsg(`Status dokumen "${selectedDocForValidation.title}" berhasil diperbarui menjadi "${valStatus}".`);
    setSaveSuccessModal(true);
  };

  // Batch Validation: Approve all pending modules
  const handleApproveAllPending = () => {
    const today = new Date().toISOString().split('T')[0];
    const verifierName = teacher?.name || 'Waka Kurikulum';
    let count = 0;

    const updated = teacherModules.map(item => {
      if (item.status === 'Meninjau') {
        count++;
        return {
          ...item,
          status: 'Disetujui' as const,
          verifiedBy: verifierName,
          verifiedAt: today,
          verificationNotes: 'Divalidasi serentak oleh Tim Kurikulum.'
        };
      }
      return item;
    });

    if (count === 0) {
      showToast('Tidak ada dokumen dengan status Sedang Ditinjau.', 'info');
      return;
    }

    updateTeacherModules(updated);
    setSaveSuccessMsg(`Sebanyak ${count} dokumen perangkat ajar yang sedang ditinjau telah berhasil divalidasi (Disetujui).`);
    setSaveSuccessModal(true);
  };

  // Initial structure of Kurikulum Merdeka (KSP) JJM with localStorage persistence
  const [curriculumMapels, setCurriculumMapels] = useState<JJMItem[]>(() => {
    try {
      const saved = ((k: string) => null as any)('simak_curriculum_jjm');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading curriculum JJM from storage:', e);
    }
    return initialJjmList;
  });

  // Modal State for P5 Module with persistence
  const [p5Modules, setP5Modules] = useState<{ id: number; tema: string; status: string; target: string; pic: string }[]>(() => {
    try {
      const saved = ((k: string) => null as any)('simak_curriculum_p5');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading curriculum P5 from storage:', e);
    }
    return initialP5List;
  });
  const [showP5Modal, setShowP5Modal] = useState<boolean>(false);
  const [showDeleteP5Modal, setShowDeleteP5Modal] = useState<boolean>(false);
  const [p5ToDelete, setP5ToDelete] = useState<{ id: number; tema: string } | null>(null);
  const [newP5Tema, setNewP5Tema] = useState<string>('');
  const [newP5Status, setNewP5Status] = useState<string>('Aktif Semester 1');
  const [newP5Target, setNewP5Target] = useState<string>('Dimensi Beriman & Mandiri');
  const [newP5Pic, setNewP5Pic] = useState<string>('');

  // Calendar & RPE Events State with persistence
  const [rpeEvents, setRpeEvents] = useState<{ date: string; event: string; category: string; desc: string }[]>(() => {
    try {
      const saved = ((k: string) => null as any)('simak_curriculum_events');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading curriculum events from storage:', e);
    }
    return initialRpeList;
  });
  const [showEventModal, setShowEventModal] = useState<boolean>(false);
  const [showDeleteEventModal, setShowDeleteEventModal] = useState<boolean>(false);
  const [eventToDeleteIndex, setEventToDeleteIndex] = useState<number | null>(null);
  const [newEventDate, setNewEventDate] = useState<string>('');
  const [newEventName, setNewEventName] = useState<string>('');
  const [newEventCategory, setNewEventCategory] = useState<string>('Asesmen');
  const [newEventDesc, setNewEventDesc] = useState<string>('');

  // Modal State for JJM Add / Edit / Delete
  const [showJjmModal, setShowJjmModal] = useState<boolean>(false);
  const [showDeleteJjmModal, setShowDeleteJjmModal] = useState<boolean>(false);
  const [jjmToDelete, setJjmToDelete] = useState<{ item: JJMItem; index: number } | null>(null);
  const [editingJjmIndex, setEditingJjmIndex] = useState<number | null>(null);
  const [jjmCode, setJjmCode] = useState<string>('');
  const [jjmName, setJjmName] = useState<string>('');
  const [jjmFase, setJjmFase] = useState<string>('Fase E (Kelas X)');
  const [jjmIntra, setJjmIntra] = useState<number>(3);
  const [jjmP5, setJjmP5] = useState<number>(1);
  const [jjmGuru, setJjmGuru] = useState<string>('');
  const [jjmKktp, setJjmKktp] = useState<number>(75);

  // Modal State for Deleting Staff User
  const [userToDeleteInternal, setUserToDeleteInternal] = useState<UserAccount | null>(null);
  const [showDeleteUserModalInternal, setShowDeleteUserModalInternal] = useState<boolean>(false);

  // Edit User Modal State (Built-in with persistence)
  const [showEditUserModal, setShowEditUserModal] = useState<boolean>(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserAccount | null>(null);
  const [formEditName, setFormEditName] = useState<string>('');
  const [formEditEmail, setFormEditEmail] = useState<string>('');
  const [formEditNip, setFormEditNip] = useState<string>('');
  const [formEditSchool, setFormEditSchool] = useState<string>('SD Negeri 1 SIMAK');
  const [formEditRole, setFormEditRole] = useState<string>('Guru Pengampu');
  const [formEditPassword, setFormEditPassword] = useState<string>('12345678');
  const [formEditStatus, setFormEditStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');
  const [showEditPassword, setShowEditPassword] = useState<boolean>(false);

  // Module / Schedule Inspector Modal State
  const [showModuleModal, setShowModuleModal] = useState<boolean>(false);
  const [selectedUserForModule, setSelectedUserForModule] = useState<UserAccount | null>(null);
  const [activeModuleTab, setActiveModuleTab] = useState<'jadwal' | 'sinkronisasi' | 'siswa' | 'presensi' | 'presensiEkstra' | 'kelolaNilai' | 'jurnal'>('jadwal');

  // Update & Sync Weekly Schedule helper
  const updateWeeklySchedules = async (updated: WeeklyClassScheduleItem[], msg: string = 'Jadwal mata pelajaran 1 minggu berhasil diperbarui!') => {
    setWeeklySchedules(updated);
    try {
      localStorage.setItem('simak_weekly_class_schedules', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    window.dispatchEvent(new CustomEvent('simak_schedules_updated', { detail: updated }));
    window.dispatchEvent(new Event('storage'));
    saveWeeklySchedulesToFirebase(updated).catch(err => console.warn('Firebase saveWeeklySchedules warning:', err));
    
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        await fetch('/api/teaching-schedules', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updated)
        });
      }
    } catch (err) {
      console.error('Failed to save to postgres', err);
    }

    setSaveSuccessMsg(msg);
    setSaveSuccessModal(true);
    showToast(msg, 'success');
  };

  const handleOpenAddScheduleModal = (prefillDay?: string, prefillClass?: string) => {
    setEditingScheduleItem(null);
    setSchDay(prefillDay || (filterScheduleDay !== 'Semua Hari' ? filterScheduleDay : 'Senin'));
    setSchTime('07.00 - 08.30');
    // Prioritaskan prefillClass, filterScheduleClass jika aktif di pengaturan, atau kelas pertama dari pengaturan
    const defaultCls = prefillClass || 
      (filterScheduleClass !== 'Semua Kelas' && scheduleAvailableClasses.includes(filterScheduleClass) 
        ? filterScheduleClass 
        : (scheduleAvailableClasses[0] || 'X-IPA 1'));
    setSchClassName(defaultCls);
    setSchSubject('');
    setSchTeacher(teacher?.name || 'Shahrur Robby, S.Pd.');
    setSchRoom(`R. ${defaultCls}`);
    setSchNotes('');
    setShowWeeklyScheduleModal(true);
  };

  const handleOpenEditScheduleModal = (item: WeeklyClassScheduleItem) => {
    setEditingScheduleItem(item);
    setSchDay(item.day);
    setSchTime(item.time);
    setSchClassName(item.className);
    setSchSubject(item.subject);
    setSchTeacher(item.teacher);
    setSchRoom(item.room);
    setSchNotes(item.notes || '');
    setShowWeeklyScheduleModal(true);
  };

  const handleSaveWeeklySchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schSubject.trim() || !schTime.trim() || !schTeacher.trim()) {
      showToast('Mata Pelajaran, Jam Pembelajaran, dan Guru Pengampu wajib diisi!', 'error');
      return;
    }

    if (editingScheduleItem) {
      const updated = weeklySchedules.map(s =>
        s.id === editingScheduleItem.id
          ? {
              ...s,
              day: schDay as any,
              time: schTime.trim(),
              className: schClassName,
              subject: schSubject.trim(),
              teacher: schTeacher.trim(),
              room: schRoom.trim() || `R. ${schClassName}`,
              notes: schNotes.trim()
            }
          : s
      );
      updateWeeklySchedules(updated, 'Jadwal pelajaran berhasil diperbarui!');
    } else {
      const newItem: WeeklyClassScheduleItem = {
        id: `WSCH-${Date.now()}`,
        day: schDay as any,
        time: schTime.trim(),
        className: schClassName,
        subject: schSubject.trim(),
        teacher: schTeacher.trim(),
        room: schRoom.trim() || `R. ${schClassName}`,
        notes: schNotes.trim()
      };
      const updated = [...weeklySchedules, newItem];
      updateWeeklySchedules(updated, 'Sesi jadwal baru berhasil ditambahkan!');
    }

    setShowWeeklyScheduleModal(false);
    setEditingScheduleItem(null);
  };

  const handleDeleteWeeklyScheduleConfirm = () => {
    if (!scheduleToDelete) return;
    const updated = weeklySchedules.filter(s => s.id !== scheduleToDelete.id);
    updateWeeklySchedules(updated, 'Sesi jadwal berhasil dihapus dari sistem!');
    setShowDeleteScheduleModal(false);
    setScheduleToDelete(null);
  };

  const handleResetWeeklyScheduleConfirm = async () => {
    try {
      localStorage.removeItem('simak_weekly_class_schedules_cleared');
    } catch (e) {
      // ignore
    }
    await updateWeeklySchedules(initialWeeklyClassSchedules, 'Jadwal 1 minggu berhasil direset ke standar kurikulum!');
    setShowResetScheduleModal(false);
  };

  const handleClearAllWeeklyScheduleConfirm = async () => {
    try {
      localStorage.setItem('simak_weekly_class_schedules_cleared', 'true');
    } catch (e) {
      // ignore
    }
    await updateWeeklySchedules([], 'Seluruh data jadwal berhasil direset dan dihapus dari sistem!');
    setShowResetScheduleModal(false);
  };

  // Schedule Filter Calculations
  const scheduleDaysList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  
  // Ambil data kelas/rombel dari Menu Pengaturan > Tahun Ajaran & Kelas
  const scheduleAvailableClasses = useMemo(() => {
    // 1. Ambil dari props classList (hanya kelas aktif tanpa 'Semua Kelas' dan 'SEMUA')
    const activeFromProps = (classList || [])
      .filter(c => Boolean(c) && c !== 'Semua Kelas' && c !== 'SEMUA');

    // 2. Ambil dari allRegisteredClasses jika ada, saring yang aktif
    const activeFromRegistered = (allRegisteredClasses || [])
      .filter(c => Boolean(c) && c !== 'Semua Kelas' && c !== 'SEMUA' && !inactiveClasses?.includes(c));

    // 3. Fallback ke localStorage jika props sedang dimuat atau kosong
    let activeFromStorage: string[] = [];
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('simak_active_classes') || localStorage.getItem('simak_all_registered_classes');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            activeFromStorage = parsed.filter(c => Boolean(c) && c !== 'Semua Kelas' && c !== 'SEMUA');
          }
        }
      } catch (e) {
        // ignore
      }
    }

    // Gabungkan rombel dari Pengaturan (Tahun Ajaran & Kelas)
    const settingsClasses = Array.from(new Set([
      ...activeFromProps,
      ...activeFromRegistered,
      ...activeFromStorage
    ]));

    // Pertahankan kelas yang sudah ada di jadwal tersimpan agar tidak hilang dari filter
    const fromSchedules = weeklySchedules.map(s => s.className).filter(Boolean);

    // Default cadangan jika belum ada kelas terdaftar sama sekali
    const fallback = ['X-IPA 1', 'X-IPA 2', 'XI-IPA 1', 'XI-IPA 2', 'XII-IPA 1'];

    const result = Array.from(new Set([
      ...(settingsClasses.length > 0 ? settingsClasses : fallback),
      ...fromSchedules
    ]));

    return result.length > 0 ? result : fallback;
  }, [classList, allRegisteredClasses, inactiveClasses, weeklySchedules]);

  // Sinkronisasi pilihan rombel saat daftar kelas terbarui
  useEffect(() => {
    if (scheduleAvailableClasses.length > 0 && (!schClassName || !scheduleAvailableClasses.includes(schClassName))) {
      setSchClassName(scheduleAvailableClasses[0]);
    }
  }, [scheduleAvailableClasses, schClassName]);

  const filteredWeeklySchedules = useMemo(() => {
    return weeklySchedules.filter(item => {
      const matchClass = filterScheduleClass === 'Semua Kelas' || item.className === filterScheduleClass;
      const matchDay = filterScheduleDay === 'Semua Hari' || item.day === filterScheduleDay;
      const matchQuery = !searchScheduleQuery.trim() || 
        item.subject.toLowerCase().includes(searchScheduleQuery.toLowerCase()) ||
        item.teacher.toLowerCase().includes(searchScheduleQuery.toLowerCase()) ||
        item.room.toLowerCase().includes(searchScheduleQuery.toLowerCase()) ||
        item.className.toLowerCase().includes(searchScheduleQuery.toLowerCase());
      return matchClass && matchDay && matchQuery;
    });
  }, [weeklySchedules, filterScheduleClass, filterScheduleDay, searchScheduleQuery]);

  // Notifications & Save Success Modal
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

  // Open Edit User Modal (use prop if provided, else built-in)
  const handleEditUserClick = (user: UserAccount) => {
    if (onOpenEditUserModal) {
      onOpenEditUserModal(user);
    } else {
      setSelectedUserForEdit(user);
      setFormEditName(user.name);
      setFormEditEmail(user.email);
      setFormEditNip(user.nip || '');
      setFormEditSchool(user.schoolName || 'SD Negeri 1 SIMAK');
      setFormEditRole(user.role || 'Guru Pengampu');
      setFormEditPassword(user.password || '12345678');
      setFormEditStatus(user.isMaintenance || user.status === 'Nonaktif' ? 'Nonaktif' : 'Aktif');
      setShowEditUserModal(true);
    }
  };

  // Save Edit User Changes
  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;

    if (!formEditName.trim() || !formEditEmail.trim()) {
      showToast('Nama Lengkap dan Email wajib diisi!', 'error');
      return;
    }

    const updatedUsers = registeredUsers.map(u => {
      if (u.uid === selectedUserForEdit.uid || u.email.toLowerCase() === selectedUserForEdit.email.toLowerCase()) {
        return {
          ...u,
          name: formEditName.trim(),
          email: formEditEmail.trim().toLowerCase(),
          nip: formEditNip.trim() || '-',
          schoolName: formEditSchool,
          role: formEditRole,
          password: formEditPassword.trim() || u.password || '12345678',
          status: formEditStatus,
          isMaintenance: formEditStatus === 'Nonaktif'
        };
      }
      return u;
    });

    ((k: string, v: string) => void 0)('simak_registered_users', JSON.stringify(updatedUsers));
    saveRegisteredUsersToFirebase(updatedUsers);
    if (onUpdateRegisteredUsers) {
      onUpdateRegisteredUsers(updatedUsers);
    }
    setShowEditUserModal(false);
    setSelectedUserForEdit(null);
    setSaveSuccessMsg(`Data pendidik "${formEditName}" berhasil diperbarui.`);
    setSaveSuccessModal(true);
  };

  // Open Schedule / Module Inspector Modal
  const handleModuleClick = (user: UserAccount, tab: string = 'jadwal') => {
    if (onOpenModuleModal) {
      onOpenModuleModal(user, tab);
    } else {
      setSelectedUserForModule(user);
      setActiveModuleTab(tab as any);
      setShowModuleModal(true);
    }
  };

  // Subscribe to Firebase real-time updates
  useEffect(() => {
    const unsubJjm = subscribeToCurriculumJjm((items) => {
      if (items && Array.isArray(items)) {
        setCurriculumMapels(items);
        ((k: string, v: string) => void 0)('simak_curriculum_jjm', JSON.stringify(items));
      }
    });

    const unsubP5 = subscribeToCurriculumP5((items) => {
      if (items && Array.isArray(items)) {
        setP5Modules(items);
        ((k: string, v: string) => void 0)('simak_curriculum_p5', JSON.stringify(items));
      }
    });

    const unsubEvents = subscribeToCurriculumEvents((items) => {
      if (items && Array.isArray(items)) {
        setRpeEvents(items);
        ((k: string, v: string) => void 0)('simak_curriculum_events', JSON.stringify(items));
      }
    });

    return () => {
      if (unsubJjm) unsubJjm();
      if (unsubP5) unsubP5();
      if (unsubEvents) unsubEvents();
    };
  }, []);

  // Filter curriculum staff
  const curriculumUsers = registeredUsers.filter(u => {
    const r = (u.role || '').toLowerCase();
    return r.includes('kurikulum') || r.includes('waka');
  });

  // Filter all teachers in the system
  const teacherUsers = registeredUsers.filter(u => {
    const r = (u.role || '').toLowerCase();
    return !r.includes('tu') && !r.includes('tata usaha') && !r.includes('siswa') && !r.includes('operator');
  });

  const filteredTeachers = teacherUsers.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(searchGuru.toLowerCase()) ||
      u.email.toLowerCase().includes(searchGuru.toLowerCase()) ||
      (u.nip || '').toLowerCase().includes(searchGuru.toLowerCase()) ||
      (u.role || '').toLowerCase().includes(searchGuru.toLowerCase());
    return matchSearch;
  });

  const filteredMapels = curriculumMapels.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(searchMapel.toLowerCase()) ||
      m.code.toLowerCase().includes(searchMapel.toLowerCase()) ||
      m.guru.toLowerCase().includes(searchMapel.toLowerCase());
    const matchFase = filterFase === 'Semua' || m.fase.includes(filterFase);
    return matchSearch && matchFase;
  });

  const totalJJMIntrakurikuler = curriculumMapels.reduce((acc, curr) => acc + curr.jjm, 0);
  const totalP5 = curriculumMapels.reduce((acc, curr) => acc + curr.p5, 0);
  const totalJPMingguan = totalJJMIntrakurikuler + totalP5;

  // Distinct count of subjects: multiple entries of the same subject count as 1
  const uniqueMapelsCount = new Set(
    curriculumMapels
      .map(m => m.name.trim().toLowerCase())
      .filter(Boolean)
  ).size;

  const handleExportJJM = () => {
    const headers = ['Kode Mapel', 'Mata Pelajaran', 'Fase/Tingkat', 'Intrakurikuler (JP)', 'Kokurikuler P5 (JP)', 'Total JP/Minggu', 'Guru Pengampu', 'KKTP Minimum'];
    const rows = curriculumMapels.map(m => [
      m.code,
      m.name,
      m.fase,
      m.jjm.toString(),
      m.p5.toString(),
      m.total.toString(),
      m.guru,
      m.kktp.toString()
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.map(i => `"${i}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Struktur_Kurikulum_Merdeka_JJM_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open JJM Add Modal
  const handleOpenAddJjm = () => {
    setEditingJjmIndex(null);
    setJjmCode(`MP-${curriculumMapels.length + 1}`);
    setJjmName('');
    setJjmFase('Fase E (Kelas X)');
    setJjmIntra(3);
    setJjmP5(1);
    setJjmGuru(registeredUsers.find(u => (u.role || '').includes('Guru'))?.name || '');
    setJjmKktp(75);
    setShowJjmModal(true);
  };

  // Open JJM Edit Modal
  const handleOpenEditJjm = (item: JJMItem, index: number) => {
    setEditingJjmIndex(index);
    setJjmCode(item.code);
    setJjmName(item.name);
    setJjmFase(item.fase);
    setJjmIntra(item.jjm);
    setJjmP5(item.p5);
    setJjmGuru(item.guru);
    setJjmKktp(item.kktp);
    setShowJjmModal(true);
  };

  // Save P5 Module (Persistent)
  const handleSaveP5 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newP5Tema.trim()) return;
    const newMod = {
      id: Date.now(),
      tema: newP5Tema.trim(),
      status: newP5Status,
      target: newP5Target.trim() || 'Dimensi Profil Pelajar Pancasila',
      pic: newP5Pic.trim() || 'Tim Projek P5'
    };
    const updated = [newMod, ...p5Modules];
    setP5Modules(updated);
    ((k: string, v: string) => void 0)('simak_curriculum_p5', JSON.stringify(updated));
    saveCurriculumP5ToFirebase(updated);
    setShowP5Modal(false);
    setNewP5Tema('');
  };

  // Delete P5 Module (Persistent)
  const handleConfirmDeleteP5 = () => {
    if (p5ToDelete) {
      const updated = p5Modules.filter(p => p.id !== p5ToDelete.id);
      setP5Modules(updated);
      ((k: string, v: string) => void 0)('simak_curriculum_p5', JSON.stringify(updated));
      saveCurriculumP5ToFirebase(updated);
      setShowDeleteP5Modal(false);
      setP5ToDelete(null);
    }
  };

  // Save RPE Event (Persistent)
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventName.trim() || !newEventDate.trim()) return;
    const newEv = {
      date: newEventDate.trim(),
      event: newEventName.trim(),
      category: newEventCategory,
      desc: newEventDesc.trim() || 'Kegiatan Kalender Akademik'
    };
    const updated = [...rpeEvents, newEv];
    setRpeEvents(updated);
    ((k: string, v: string) => void 0)('simak_curriculum_events', JSON.stringify(updated));
    saveCurriculumEventsToFirebase(updated);
    setShowEventModal(false);
    setNewEventName('');
    setNewEventDate('');
    setNewEventDesc('');
  };

  // Delete RPE Event (Persistent)
  const handleConfirmDeleteEvent = () => {
    if (eventToDeleteIndex !== null) {
      const updated = rpeEvents.filter((_, idx) => idx !== eventToDeleteIndex);
      setRpeEvents(updated);
      ((k: string, v: string) => void 0)('simak_curriculum_events', JSON.stringify(updated));
      saveCurriculumEventsToFirebase(updated);
      setShowDeleteEventModal(false);
      setEventToDeleteIndex(null);
    }
  };

  // Delete JJM Mapel (Persistent)
  const handleDeleteJjm = (index: number) => {
    const itemToDelete = curriculumMapels[index];
    setJjmToDelete({ item: itemToDelete, index });
    setShowDeleteJjmModal(true);
  };

  const handleConfirmDeleteJjm = () => {
    if (jjmToDelete !== null) {
      const updated = curriculumMapels.filter((_, idx) => idx !== jjmToDelete.index);
      setCurriculumMapels(updated);
      ((k: string, v: string) => void 0)('simak_curriculum_jjm', JSON.stringify(updated));
      saveCurriculumJjmToFirebase(updated);
      setShowDeleteJjmModal(false);
      setJjmToDelete(null);
    }
  };

  // Save JJM (Add or Edit - Persistent)
  const handleSaveJjm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jjmName.trim() || !jjmCode.trim()) return;

    const newItem: JJMItem = {
      code: jjmCode.trim(),
      name: jjmName.trim(),
      fase: jjmFase,
      jjm: Number(jjmIntra) || 0,
      p5: Number(jjmP5) || 0,
      total: (Number(jjmIntra) || 0) + (Number(jjmP5) || 0),
      guru: jjmGuru.trim() || 'Belum Ditugaskan',
      kktp: Number(jjmKktp) || 75
    };

    let updated: JJMItem[];
    if (editingJjmIndex !== null) {
      updated = [...curriculumMapels];
      updated[editingJjmIndex] = newItem;
    } else {
      updated = [...curriculumMapels, newItem];
    }

    setCurriculumMapels(updated);
    ((k: string, v: string) => void 0)('simak_curriculum_jjm', JSON.stringify(updated));
    saveCurriculumJjmToFirebase(updated);
    setShowJjmModal(false);
  };

  // Handle Delete Curriculum Staff User (Persistent)
  const handleDeleteUserClick = (user: UserAccount) => {
    if (onOpenDeleteUserModal) {
      onOpenDeleteUserModal(user);
    } else {
      setUserToDeleteInternal(user);
      setShowDeleteUserModalInternal(true);
    }
  };

  const handleConfirmDeleteUserInternal = () => {
    if (!userToDeleteInternal) return;
    const targetUid = userToDeleteInternal.uid;
    const targetEmail = (userToDeleteInternal.email || '').trim().toLowerCase();
    const targetName = (userToDeleteInternal.name || '').trim().toLowerCase();

    const updatedUsers = registeredUsers.filter(u => {
      if (targetUid && u.uid && u.uid === targetUid) return false;
      if (targetEmail && u.email && u.email.trim().toLowerCase() === targetEmail) return false;
      if (targetName && u.name && u.name.trim().toLowerCase() === targetName && u.nip && u.nip === userToDeleteInternal.nip) return false;
      return true;
    });

    ((k: string, v: string) => void 0)('simak_registered_users', JSON.stringify(updatedUsers));
    saveRegisteredUsersToFirebase(updatedUsers);
    if (onUpdateRegisteredUsers) {
      onUpdateRegisteredUsers(updatedUsers);
    }
    setShowDeleteUserModalInternal(false);
    setUserToDeleteInternal(null);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards for Curriculum */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-none border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-cyan-50 text-[#164e63] rounded-none shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Beban JJM</div>
            <div className="text-xl font-black text-slate-800">{totalJPMingguan} <span className="text-xs font-semibold text-slate-500">JP / Minggu</span></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-none border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-none shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mata Pelajaran</div>
            <div className="text-xl font-black text-indigo-700">{uniqueMapelsCount} <span className="text-xs font-semibold text-indigo-600">Mapel Pokok</span></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-none border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-none shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Alokasi Projek P5</div>
            <div className="text-xl font-black text-emerald-700">{totalP5} <span className="text-xs font-semibold text-emerald-600">JP (20-30%)</span></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-none border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-none shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tim Kurikulum</div>
            <div className="text-xl font-black text-amber-700">{curriculumUsers.length || 1} <span className="text-xs font-semibold text-amber-600">Personil</span></div>
          </div>
        </div>
      </div>

      {/* Subsystem Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-2 pt-2 gap-1.5 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('jjm')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'jjm'
              ? 'border-[#164e63] text-[#164e63] bg-cyan-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Struktur Kurikulum & JJM</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('jadwalMapel')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'jadwalMapel'
              ? 'border-[#164e63] text-[#164e63] bg-cyan-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4 text-indigo-600" />
          <span>Jadwal Mapel 1 Minggu</span>
          <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded-full">
            {weeklySchedules.length} Sesi
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('validasiModul')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'validasiModul'
              ? 'border-[#164e63] text-[#164e63] bg-cyan-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FolderUp className="w-4 h-4 text-amber-600" />
          <span>Validasi Modul/ATP Guru</span>
          {teacherModules.filter(m => m.status === 'Meninjau').length > 0 ? (
            <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[10px] font-black rounded-full">
              {teacherModules.filter(m => m.status === 'Meninjau').length} Menunggu
            </span>
          ) : (
            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
              Lengkap
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('guruMapel')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'guruMapel'
              ? 'border-[#164e63] text-[#164e63] bg-cyan-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-600" />
          <span>Direktori Guru Pengampu ({teacherUsers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('perangkat')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'perangkat'
              ? 'border-[#164e63] text-[#164e63] bg-cyan-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Perangkat Ajar (CP & ATP)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('kalender')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'kalender'
              ? 'border-[#164e63] text-[#164e63] bg-cyan-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Kalender Pendidikan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tim')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'tim'
              ? 'border-[#164e63] text-[#164e63] bg-cyan-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Award className="w-4 h-4 text-[#164e63]" />
          <span>Akun Tim Kurikulum ({curriculumUsers.length})</span>
        </button>

        {onNavigateTab && (
          <button
            type="button"
            onClick={() => onNavigateTab('settings')}
            className="px-3.5 py-2.5 text-xs font-bold border-b-2 border-transparent text-slate-600 hover:text-[#164e63] hover:bg-slate-50 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ml-auto"
            title="Buka Pengaturan Sistem"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span className="border-b border-slate-400/80 pb-0.5">Pengaturan</span>
          </button>
        )}
      </div>

      {/* TAB CONTENT: JJM STRUCTURE */}
      {activeTab === 'jjm' && (
        <div className="bg-white p-5 rounded-none border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Distribusi Jam Pelajaran (JJM) Kurikulum Merdeka</h3>
              <p className="text-xs text-slate-500">Alokasi jam tatap muka intrakurikuler dan kokurikuler Projek Penguatan Profil Pelajar Pancasila (P5).</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchMapel}
                  onChange={(e) => setSearchMapel(e.target.value)}
                  placeholder="Cari mata pelajaran / guru..."
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-none text-xs w-48 sm:w-56 focus:outline-none focus:ring-2 focus:ring-cyan-600"
                />
              </div>
              <button
                type="button"
                onClick={handleOpenAddJjm}
                className="px-3 py-1.5 bg-[#164e63] hover:bg-cyan-800 text-white rounded-none font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Mapel & Guru</span>
              </button>
              <select
                value={filterFase}
                onChange={(e) => setFilterFase(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-none text-xs font-medium cursor-pointer"
              >
                <option value="Semua">Semua Tingkat</option>
                <option value="Kelas X">Fase E (Kelas X)</option>
                <option value="Kelas XI">Fase F (Kelas XI)</option>
                <option value="Kelas XII">Fase F (Kelas XII)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3">No</th>
                  <th className="p-3">Kode</th>
                  <th className="p-3">Mata Pelajaran</th>
                  <th className="p-3">Tingkat / Fase</th>
                  <th className="p-3 text-center">Intra (JP)</th>
                  <th className="p-3 text-center">P5 (JP)</th>
                  <th className="p-3 text-center bg-cyan-50/50">Total JP</th>
                  <th className="p-3">Guru Pengampu</th>
                  <th className="p-3 text-center">KKTP</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMapels.map((item, idx) => (
                  <tr key={item.code} className="hover:bg-cyan-50/30 transition-colors">
                    <td className="p-3 font-semibold text-slate-500">{idx + 1}</td>
                    <td className="p-3 font-mono font-bold text-[#164e63]">{item.code}</td>
                    <td className="p-3 font-bold text-slate-800">{item.name}</td>
                    <td className="p-3 text-slate-600 font-medium">{item.fase}</td>
                    <td className="p-3 text-center font-semibold text-slate-700">{item.jjm} JP</td>
                    <td className="p-3 text-center font-semibold text-amber-600">{item.p5} JP</td>
                    <td className="p-3 text-center font-black text-[#164e63] bg-cyan-50/40">{item.total} JP</td>
                    <td className="p-3 text-slate-700 font-semibold">{item.guru}</td>
                    <td className="p-3 text-center font-bold text-slate-800">{item.kktp}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-none">
                        Tervalidasi
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditJjm(item, idx)}
                          title="Edit Mapel & Alokasi Guru"
                          className="p-1.5 text-cyan-600 hover:text-white hover:bg-cyan-600 rounded-none border border-cyan-200 transition-all cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteJjm(idx)}
                          title="Hapus Mapel dari JJM"
                          className="p-1.5 text-rose-600 hover:text-white hover:bg-rose-600 rounded-none border border-rose-200 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-bold text-slate-800 border-t-2 border-slate-300">
                  <td colSpan={4} className="p-3 text-right">Total Jam Pelajaran / Minggu:</td>
                  <td className="p-3 text-center text-slate-800">{totalJJMIntrakurikuler} JP</td>
                  <td className="p-3 text-center text-amber-700">{totalP5} JP</td>
                  <td className="p-3 text-center text-[#164e63] bg-cyan-100/50 font-black">{totalJPMingguan} JP</td>
                  <td colSpan={4} className="p-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: JADWAL MATA PELAJARAN 1 MINGGU */}
      {activeTab === 'jadwalMapel' && (
        <div className="space-y-4">
          {/* Header Description & Action Toolbar */}
          <div className="bg-white p-5 rounded-none border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-none">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-800">
                  Jadwal Mata Pelajaran 1 Minggu (KBM Tatap Muka Terpadu)
                </h3>
              </div>
              <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
                Penataan jadwal pelajaran mingguan per rombel kelas yang terhubung secara realtime dengan 
                <span className="font-bold text-indigo-700"> Portal Siswa (LMS)</span>, 
                <span className="font-bold text-cyan-700"> Jurnal Mengajar Guru</span>, dan 
                <span className="font-bold text-emerald-700"> Presensi Kelas</span>.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleOpenAddScheduleModal()}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-none shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Sesi Jadwal</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPrintScheduleModal(true)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-none border border-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Cetak Jadwal</span>
              </button>

              <button
                type="button"
                onClick={() => setShowResetScheduleModal(true)}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-none border border-rose-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                title="Reset dan hapus semua data jadwal pelajaran pada menu kurikulum"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Reset Jadwal</span>
              </button>
            </div>
          </div>

          {/* KPI Mini-Cards for Schedule */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 border border-slate-200 rounded-none shadow-xs">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Sesi Terjadwal</div>
              <div className="text-lg font-black text-indigo-700 mt-0.5">{weeklySchedules.length} <span className="text-xs font-semibold text-slate-500">Sesi KBM</span></div>
            </div>
            <div className="bg-white p-3.5 border border-slate-200 rounded-none shadow-xs">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rombongan Belajar</div>
              <div className="text-lg font-black text-cyan-700 mt-0.5">{scheduleAvailableClasses.length} <span className="text-xs font-semibold text-slate-500">Kelas</span></div>
            </div>
            <div className="bg-white p-3.5 border border-slate-200 rounded-none shadow-xs">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Guru Pengampu</div>
              <div className="text-lg font-black text-emerald-700 mt-0.5">{new Set(weeklySchedules.map(s => s.teacher)).size} <span className="text-xs font-semibold text-slate-500">Pendidik</span></div>
            </div>
            <div className="bg-white p-3.5 border border-slate-200 rounded-none shadow-xs">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hari Efektif KBM</div>
              <div className="text-lg font-black text-amber-700 mt-0.5">Senin - Sabtu <span className="text-xs font-semibold text-slate-500">(6 Hari)</span></div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-none border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchScheduleQuery}
                  onChange={(e) => setSearchScheduleQuery(e.target.value)}
                  placeholder="Cari mata pelajaran, guru, kelas, atau ruang..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-none text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                />
              </div>

              {/* Class Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-600 shrink-0">Kelas:</span>
                <select
                  value={filterScheduleClass}
                  onChange={(e) => setFilterScheduleClass(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-none text-xs font-bold text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="Semua Kelas">Semua Kelas</option>
                  {scheduleAvailableClasses.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              {/* Day Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-600 shrink-0">Hari:</span>
                <select
                  value={filterScheduleDay}
                  onChange={(e) => setFilterScheduleDay(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-none text-xs font-bold text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="Semua Hari">Semua Hari (Senin - Sabtu)</option>
                  {scheduleDaysList.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Day Selector Pills */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setFilterScheduleDay('Semua Hari')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-none transition-all cursor-pointer whitespace-nowrap ${
                  filterScheduleDay === 'Semua Hari'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua
              </button>
              {scheduleDaysList.map(dayName => {
                const count = weeklySchedules.filter(s => 
                  s.day === dayName && 
                  (filterScheduleClass === 'Semua Kelas' || s.className === filterScheduleClass)
                ).length;
                return (
                  <button
                    key={dayName}
                    type="button"
                    onClick={() => setFilterScheduleDay(dayName)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-none transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                      filterScheduleDay === dayName
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{dayName}</span>
                    <span className={`px-1 py-0.2 rounded-full text-[9px] font-black ${
                      filterScheduleDay === dayName ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day-by-Day Schedule View Cards */}
          <div className="space-y-4">
            {(filterScheduleDay === 'Semua Hari' ? scheduleDaysList : [filterScheduleDay]).map((day) => {
              const daySchedules = filteredWeeklySchedules.filter(s => s.day === day);

              return (
                <div key={day} className="bg-white border border-slate-200 rounded-none shadow-xs overflow-hidden">
                  {/* Day Header */}
                  <div className="bg-gradient-to-r from-slate-100 via-slate-50 to-white px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-indigo-600 text-white rounded-none flex items-center justify-center font-black text-xs shadow-xs">
                        {day.substring(0, 3)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                          <span>Hari {day}</span>
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-extrabold rounded-none">
                            {daySchedules.length} Sesi Terjadwal
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {filterScheduleClass === 'Semua Kelas' ? 'Semua Rombongan Belajar' : `Rombel: ${filterScheduleClass}`}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenAddScheduleModal(day, filterScheduleClass !== 'Semua Kelas' ? filterScheduleClass : undefined)}
                      className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 border border-indigo-200 font-bold text-xs rounded-none transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Sesi {day}</span>
                    </button>
                  </div>

                  {/* Sessions Content */}
                  {daySchedules.length > 0 ? (
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {daySchedules.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="p-3.5 bg-slate-50/80 hover:bg-indigo-50/30 border border-slate-200 hover:border-indigo-300 rounded-none transition-all flex flex-col justify-between gap-3 group relative"
                        >
                          <div>
                            {/* Top info badge row */}
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="px-2 py-0.5 bg-indigo-600 text-white font-bold text-[10px] rounded-none flex items-center gap-1 shadow-xs">
                                <Clock className="w-3 h-3" />
                                <span>{item.time}</span>
                              </span>
                              <span className="px-2 py-0.5 bg-slate-200 text-slate-800 font-extrabold text-[10px] rounded-none">
                                {item.className}
                              </span>
                            </div>

                            {/* Subject Title */}
                            <h5 className="text-xs font-black text-slate-900 group-hover:text-indigo-900 transition-colors leading-snug line-clamp-2">
                              {item.subject}
                            </h5>

                            {/* Teacher and Room Details */}
                            <div className="mt-2.5 space-y-1 text-[11px] text-slate-600">
                              <div className="flex items-center gap-1.5 truncate">
                                <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                <span className="font-semibold text-slate-700 truncate">{item.teacher}</span>
                              </div>
                              <div className="flex items-center gap-1.5 truncate">
                                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">{item.room || `R. ${item.className}`}</span>
                              </div>
                              {item.notes && (
                                <div className="text-[10px] text-slate-500 italic bg-white p-1.5 border border-slate-200 mt-1">
                                  {item.notes}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Footer */}
                          <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                            <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Terkoneksi LMS Siswa</span>
                            </span>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditScheduleModal(item)}
                                title="Edit Sesi Jadwal"
                                className="p-1.5 bg-white hover:bg-cyan-600 hover:text-white text-cyan-600 border border-slate-200 rounded-none transition-all cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setScheduleToDelete(item);
                                  setShowDeleteScheduleModal(true);
                                }}
                                title="Hapus Sesi Jadwal"
                                className="p-1.5 bg-white hover:bg-rose-600 hover:text-white text-rose-600 border border-slate-200 rounded-none transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50/50">
                      <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-600">Belum ada jadwal KBM untuk hari {day}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {filterScheduleClass !== 'Semua Kelas' ? `Kelas ${filterScheduleClass}` : 'Semua rombel kelas'}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleOpenAddScheduleModal(day, filterScheduleClass !== 'Semua Kelas' ? filterScheduleClass : undefined)}
                        className="mt-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-none inline-flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Tambah Jadwal Hari {day}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: VALIDASI MODUL / ATP GURU */}
      {activeTab === 'validasiModul' && (
        <div className="space-y-4">
          {/* Header Description & Actions */}
          <div className="bg-white p-5 rounded-none border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-50 text-amber-700 rounded-none">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-800">
                  Pusat Validasi & Verifikasi Perangkat Ajar Guru (Modul/ATP/CP/Prota)
                </h3>
              </div>
              <p className="text-xs text-slate-500 max-w-2xl">
                Supervisi kurikulum untuk meninjau, menyetujui, atau meminta revisi modul ajar berdiferensiasi, alur tujuan pembelajaran (ATP), dan perangkat asesmen guru pengampu.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleApproveAllPending}
                disabled={teacherModules.filter(m => m.status === 'Meninjau').length === 0}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-none shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:cursor-not-allowed"
                title="Setujui seluruh dokumen yang sedang dalam status Meninjau"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Validasi Semua ({teacherModules.filter(m => m.status === 'Meninjau').length} Meninjau)</span>
              </button>
            </div>
          </div>

          {/* KPI Mini-Cards for Module Validation */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white p-3.5 border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="p-2.5 bg-cyan-50 text-[#164e63] rounded-none">
                <FolderOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Terunggah</div>
                <div className="text-lg font-black text-slate-800">{teacherModules.length} <span className="text-xs font-normal text-slate-500">Berkas</span></div>
              </div>
            </div>

            <div className="bg-white p-3.5 border border-amber-200 shadow-xs flex items-center gap-3 bg-amber-50/20">
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded-none">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Sedang Ditinjau</div>
                <div className="text-lg font-black text-amber-900 flex items-center gap-1.5">
                  <span>{teacherModules.filter(m => m.status === 'Meninjau').length}</span>
                  {teacherModules.filter(m => m.status === 'Meninjau').length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white p-3.5 border border-emerald-200 shadow-xs flex items-center gap-3 bg-emerald-50/20">
              <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-none">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Telah Disetujui</div>
                <div className="text-lg font-black text-emerald-800">{teacherModules.filter(m => m.status === 'Disetujui').length} <span className="text-xs font-normal text-emerald-700">Valid</span></div>
              </div>
            </div>

            <div className="bg-white p-3.5 border border-rose-200 shadow-xs flex items-center gap-3 bg-rose-50/20">
              <div className="p-2.5 bg-rose-100 text-rose-800 rounded-none">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">Perlu Revisi</div>
                <div className="text-lg font-black text-rose-800">{teacherModules.filter(m => m.status === 'Perlu Revisi').length} <span className="text-xs font-normal text-rose-700">Berkas</span></div>
              </div>
            </div>

            <div className="bg-white p-3.5 border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-none">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Persentase Valid</div>
                <div className="text-lg font-black text-indigo-900">
                  {teacherModules.length > 0
                    ? Math.round((teacherModules.filter(m => m.status === 'Disetujui').length / teacherModules.length) * 100)
                    : 0}%
                </div>
              </div>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="bg-white p-4 rounded-none border border-slate-200 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchDoc}
                  onChange={(e) => setSearchDoc(e.target.value)}
                  placeholder="Cari judul, guru, mapel, berkas..."
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-none text-xs w-full focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white"
                />
              </div>

              <div>
                <select
                  value={filterDocStatus}
                  onChange={(e) => setFilterDocStatus(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white cursor-pointer"
                >
                  <option value="Semua">Semua Status Validasi</option>
                  <option value="Meninjau">⏳ Meninjau (Sedang Ditinjau)</option>
                  <option value="Disetujui">✓ Disetujui (Valid)</option>
                  <option value="Perlu Revisi">⚠️ Perlu Revisi</option>
                </select>
              </div>

              <div>
                <select
                  value={filterDocCategory}
                  onChange={(e) => setFilterDocCategory(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white cursor-pointer"
                >
                  <option value="Semua">Semua Kategori Perangkat</option>
                  <option value="Modul Ajar (RPP Merdeka)">Modul Ajar (RPP Merdeka)</option>
                  <option value="Alur Tujuan Pembelajaran (ATP)">Alur Tujuan Pembelajaran (ATP)</option>
                  <option value="Capaian Pembelajaran (CP)">Capaian Pembelajaran (CP)</option>
                  <option value="Program Tahunan (Prota)">Program Tahunan (Prota)</option>
                  <option value="Kriteria Ketercapaian TP (KKTP)">KKTP & Rubrik Asesmen</option>
                  <option value="Lembar Kerja Siswa (LKPD)">Lembar Kerja Siswa (LKPD)</option>
                  <option value="Kisi-Kisi / Bank Soal">Kisi-Kisi / Bank Soal</option>
                </select>
              </div>

              <div>
                <select
                  value={filterDocTeacher}
                  onChange={(e) => setFilterDocTeacher(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white cursor-pointer"
                >
                  <option value="Semua">Semua Guru Pengampu</option>
                  {Array.from(new Set(teacherModules.map(m => m.teacherName))).map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            </div>

            {(searchDoc || filterDocStatus !== 'Semua' || filterDocCategory !== 'Semua' || filterDocTeacher !== 'Semua') && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-500 font-medium">
                  Menampilkan <strong className="text-slate-800">{
                    teacherModules.filter(doc => {
                      const s = searchDoc.toLowerCase();
                      const matchSearch =
                        !s ||
                        doc.title.toLowerCase().includes(s) ||
                        doc.teacherName.toLowerCase().includes(s) ||
                        (doc.teacherNip && doc.teacherNip.toLowerCase().includes(s)) ||
                        doc.subject.toLowerCase().includes(s) ||
                        doc.fase.toLowerCase().includes(s) ||
                        doc.className.toLowerCase().includes(s) ||
                        doc.fileName.toLowerCase().includes(s);
                      const matchStatus = filterDocStatus === 'Semua' || doc.status === filterDocStatus;
                      const matchCategory = filterDocCategory === 'Semua' || doc.category === filterDocCategory;
                      const matchTeacher = filterDocTeacher === 'Semua' || doc.teacherName === filterDocTeacher;
                      return matchSearch && matchStatus && matchCategory && matchTeacher;
                    }).length
                  }</strong> dari {teacherModules.length} dokumen
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchDoc('');
                    setFilterDocStatus('Semua');
                    setFilterDocCategory('Semua');
                    setFilterDocTeacher('Semua');
                  }}
                  className="text-cyan-600 hover:text-cyan-800 font-bold cursor-pointer"
                >
                  Reset Filter
                </button>
              </div>
            )}
          </div>

          {/* Document Table with Action / Validation Buttons */}
          <div className="bg-white rounded-none border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3 w-12 text-center">No</th>
                    <th className="p-3 min-w-[240px]">Dokumen Perangkat Ajar & Kategori</th>
                    <th className="p-3 min-w-[170px]">Guru Pengampu</th>
                    <th className="p-3 min-w-[150px]">Mapel & Kelas</th>
                    <th className="p-3 min-w-[150px]">Berkas File</th>
                    <th className="p-3 min-w-[110px]">Tgl Unggah</th>
                    <th className="p-3 min-w-[140px] text-center">Status Validasi</th>
                    <th className="p-3 min-w-[220px]">Catatan Evaluasi Kurikulum</th>
                    <th className="p-3 min-w-[200px] text-center">Aksi Validasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teacherModules
                    .filter(doc => {
                      const s = searchDoc.toLowerCase();
                      const matchSearch =
                        !s ||
                        doc.title.toLowerCase().includes(s) ||
                        doc.teacherName.toLowerCase().includes(s) ||
                        (doc.teacherNip && doc.teacherNip.toLowerCase().includes(s)) ||
                        doc.subject.toLowerCase().includes(s) ||
                        doc.fase.toLowerCase().includes(s) ||
                        doc.className.toLowerCase().includes(s) ||
                        doc.fileName.toLowerCase().includes(s);
                      const matchStatus = filterDocStatus === 'Semua' || doc.status === filterDocStatus;
                      const matchCategory = filterDocCategory === 'Semua' || doc.category === filterDocCategory;
                      const matchTeacher = filterDocTeacher === 'Semua' || doc.teacherName === filterDocTeacher;
                      return matchSearch && matchStatus && matchCategory && matchTeacher;
                    })
                    .map((doc, idx) => (
                      <tr
                        key={doc.id}
                        className={`hover:bg-cyan-50/30 transition-colors ${
                          doc.status === 'Meninjau' ? 'bg-amber-50/20' : ''
                        }`}
                      >
                        <td className="p-3 text-center font-bold text-slate-500">{idx + 1}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-800 leading-snug">{doc.title}</div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="px-2 py-0.5 bg-cyan-50 text-[#164e63] font-semibold text-[10px] border border-cyan-100">
                              {doc.category}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">Sem. {doc.semester}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-800">{doc.teacherName}</div>
                          {doc.teacherNip && (
                            <div className="text-[10px] text-slate-500 font-mono">NIP: {doc.teacherNip}</div>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-cyan-900">{doc.subject}</div>
                          <div className="text-[11px] text-slate-600">{doc.fase} ({doc.className})</div>
                        </td>
                        <td className="p-3">
                          <div className="font-mono text-[11px] font-bold text-slate-700 truncate max-w-[160px]" title={doc.fileName}>
                            {doc.fileName}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-slate-400 font-semibold">{doc.fileSize}</span>
                            <button
                              type="button"
                              onClick={() => {
                                showToast(`Mengunduh berkas "${doc.fileName}"...`, 'info');
                              }}
                              className="text-[#164e63] hover:underline font-bold text-[10px] flex items-center gap-0.5 cursor-pointer"
                            >
                              <Download className="w-3 h-3" /> Unduh
                            </button>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-600">
                          {doc.uploadedAt}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold ${
                            doc.status === 'Disetujui'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : doc.status === 'Meninjau'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}>
                            {doc.status === 'Disetujui' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                            {doc.status === 'Meninjau' && <Clock className="w-3.5 h-3.5 text-amber-700" />}
                            {doc.status === 'Perlu Revisi' && <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
                            <span>{doc.status}</span>
                          </span>
                          {doc.verifiedBy && (
                            <div className="text-[9px] text-slate-500 mt-1 truncate max-w-[120px] mx-auto">
                              Oleh: {doc.verifiedBy}
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-slate-600 text-[11px] leading-relaxed">
                          <div className="line-clamp-2" title={doc.verificationNotes}>
                            {doc.verificationNotes || (
                              <span className="text-slate-400 italic">Belum ada catatan evaluasi.</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Quick Setujui Button */}
                            <button
                              type="button"
                              onClick={() => handleQuickApprove(doc)}
                              title="Langsung Setujui (Validasi)"
                              className={`px-2.5 py-1.5 font-bold text-xs rounded-none flex items-center gap-1 transition-all cursor-pointer shadow-xs ${
                                doc.status === 'Disetujui'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Setujui</span>
                            </button>

                            {/* Quick Minta Revisi Button */}
                            <button
                              type="button"
                              onClick={() => handleQuickReject(doc)}
                              title="Minta Revisi Dokumen"
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-none flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Revisi</span>
                            </button>

                            {/* Tinjau / Detail Validation Modal */}
                            <button
                              type="button"
                              onClick={() => handleOpenValidationModal(doc)}
                              title="Buka Form Validasi Lengkap & Catatan Evaluasi"
                              className="p-1.5 bg-slate-100 hover:bg-cyan-50 text-slate-700 hover:text-[#164e63] border border-slate-300 rounded-none cursor-pointer"
                            >
                              <ShieldCheck className="w-4 h-4 text-cyan-700" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                  {teacherModules.filter(doc => {
                    const s = searchDoc.toLowerCase();
                    const matchSearch =
                      !s ||
                      doc.title.toLowerCase().includes(s) ||
                      doc.teacherName.toLowerCase().includes(s) ||
                      (doc.teacherNip && doc.teacherNip.toLowerCase().includes(s)) ||
                      doc.subject.toLowerCase().includes(s) ||
                      doc.fase.toLowerCase().includes(s) ||
                      doc.className.toLowerCase().includes(s) ||
                      doc.fileName.toLowerCase().includes(s);
                    const matchStatus = filterDocStatus === 'Semua' || doc.status === filterDocStatus;
                    const matchCategory = filterDocCategory === 'Semua' || doc.category === filterDocCategory;
                    const matchTeacher = filterDocTeacher === 'Semua' || doc.teacherName === filterDocTeacher;
                    return matchSearch && matchStatus && matchCategory && matchTeacher;
                  }).length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-10 text-center text-slate-500 space-y-2">
                        <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
                        <div className="font-bold text-slate-700 text-sm">Tidak Ada Dokumen Perangkat Ajar</div>
                        <p className="text-xs text-slate-400">
                          Tidak ditemukan dokumen perangkat ajar dengan kriteria filter yang Anda pilih.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchDoc('');
                            setFilterDocStatus('Semua');
                            setFilterDocCategory('Semua');
                            setFilterDocTeacher('Semua');
                          }}
                          className="px-3 py-1.5 bg-cyan-50 text-[#164e63] text-xs font-bold border border-cyan-200 cursor-pointer"
                        >
                          Tampilkan Semua Dokumen
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: DIREKTORI GURU PENGAMPU MAPEL */}
      {activeTab === 'guruMapel' && (
        <div className="bg-white p-5 rounded-none border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Direktori & Supervisi Beban Mengajar Guru (JJM)</span>
              </h3>
              <p className="text-xs text-slate-500">Supervisi penugasan mata pelajaran dan jam mengajar (JJM) per pendidik sesuai Kurikulum Merdeka.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchGuru}
                  onChange={(e) => setSearchGuru(e.target.value)}
                  placeholder="Cari guru, NIP, email..."
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-none text-xs w-48 sm:w-56 focus:outline-none focus:ring-2 focus:ring-cyan-600"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3">Nama Pendidik</th>
                  <th className="p-3">Email Akun</th>
                  <th className="p-3">NIP / NUPTK</th>
                  <th className="p-3">Jabatan / Role</th>
                  <th className="p-3 text-center">Beban Mengajar (JJM)</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Aksi Kurikulum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.length > 0 ? (
                  filteredTeachers.map(user => {
                    const assigned = curriculumMapels.filter(m => m.guru.toLowerCase().includes(user.name.toLowerCase()));
                    const totalJp = assigned.reduce((acc, curr) => acc + curr.total, 0);

                    return (
                      <tr key={user.uid || user.email} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-800">{user.name}</td>
                        <td className="p-3 font-mono text-slate-600">{user.email}</td>
                        <td className="p-3 text-slate-600 font-mono">{user.nip || '-'}</td>
                        <td className="p-3 font-bold text-emerald-800">{user.role || 'Guru Pengampu'}</td>
                        <td className="p-3 text-center">
                          {assigned.length > 0 ? (
                            <span className="px-2.5 py-1 bg-cyan-50 text-[#164e63] font-bold text-xs border border-cyan-200 rounded-none inline-block">
                              {totalJp} JP <span className="text-[10px] text-slate-500 font-normal">({assigned.length} Mapel)</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-medium text-[11px] border border-amber-200">
                              Belum Ditugaskan
                            </span>
                          )}
                        </td>
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
                              title="Edit Data Guru"
                              className="px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white font-bold text-[11px] border border-amber-300 rounded-none transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleModuleClick(user, 'jadwal')}
                              title="Inspeksi Jadwal & Modul"
                              className="px-2 py-1 bg-cyan-50 text-[#164e63] hover:bg-[#164e63] hover:text-white font-bold text-[11px] border border-cyan-200 rounded-none transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Calendar className="w-3 h-3" />
                              <span>Jadwal</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-500">
                      Tidak ditemukan data guru yang sesuai pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PERANGKAT AJAR */}
      {activeTab === 'perangkat' && (
        <div className="space-y-4">
          {/* Quick Banner to Validasi Modul Guru */}
          <div className="bg-gradient-to-r from-cyan-50 via-amber-50/40 to-emerald-50 border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500 text-white rounded-none shrink-0 shadow-xs">
                <FolderUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-2">
                  <span>Modul & ATP Terunggah dari Guru Pengampu</span>
                  {teacherModules.filter(m => m.status === 'Meninjau').length > 0 && (
                    <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full">
                      {teacherModules.filter(m => m.status === 'Meninjau').length} Menunggu Validasi
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-600">
                  Total <strong className="text-slate-800">{teacherModules.length} dokumen</strong> perangkat ajar diunggah oleh bapak/ibu guru. Tinjau dan beri validasi resmi.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('validasiModul')}
              className="px-4 py-2 bg-[#164e63] hover:bg-cyan-800 text-white text-xs font-bold rounded-none shadow-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Buka Pusat Validasi Modul</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-none border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Award className="w-4 h-4 text-[#164e63]" />
                <span>Capaian Pembelajaran (CP) & ATP Standard</span>
              </h3>
              <span className="px-2 py-0.5 bg-cyan-100 text-cyan-800 text-[10px] font-bold">BSKAP Kemendikbudristek</span>
            </div>
            <p className="text-xs text-slate-600">
              Dokumen Capaian Pembelajaran standar nasional Kurikulum Merdeka yang menjadi acuan penyusunan Tujuan Pembelajaran (TP) dan Alur Tujuan Pembelajaran (ATP).
            </p>
            <div className="space-y-2 pt-2">
              {['Fase A (Kelas 1-2 SD)', 'Fase B (Kelas 3-4 SD)', 'Fase C (Kelas 5-6 SD)', 'Fase D (Kelas 7-9 SMP)', 'Fase E (Kelas 10 SMA/SMK)', 'Fase F (Kelas 11-12 SMA/SMK)'].map(fase => (
                <div key={fase} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-700">{fase}</span>
                  <button type="button" onClick={() => alert(`Mengunduh dokumen panduan CP & ATP untuk ${fase}`)} className="text-[#164e63] font-bold hover:underline flex items-center gap-1 cursor-pointer">
                    <Download className="w-3.5 h-3.5" /> Unduh CP
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-none border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Modul Projek P5 & Asesmen Karakter</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowP5Modal(true)}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-none shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Tambah Tema P5
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Panduan tema Projek Penguatan Profil Pelajar Pancasila untuk sekolah beserta lembar rubrik penilaian kualitatif.
            </p>
            <div className="space-y-2 pt-2 max-h-80 overflow-y-auto">
              {p5Modules.map(p5 => (
                <div key={p5.id} className="p-3 bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{p5.tema}</span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-none">{p5.status}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">{p5.target}</p>
                  <div className="text-[10px] text-slate-400 pt-0.5 border-t border-slate-200/60 flex items-center justify-between">
                    <span>PIC: {p5.pic}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setP5ToDelete(p5);
                          setShowDeleteP5Modal(true);
                        }}
                        className="text-rose-600 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                      >
                        <Trash2 className="w-3 h-3" /> Hapus
                      </button>
                      <button type="button" onClick={() => alert(`Mengunduh Modul P5: ${p5.tema}`)} className="text-[#164e63] font-bold hover:underline cursor-pointer flex items-center gap-1">
                        <Download className="w-3 h-3" /> Unduh Modul
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* TAB CONTENT: KALENDER PENDIDIKAN */}
      {activeTab === 'kalender' && (
        <div className="bg-white p-5 rounded-none border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Rencana Pekan Efektif (RPE) & Kalender Akademik 2026/2027</h3>
              <p className="text-xs text-slate-500">Jadwal pelaksanaan pembelajaran efektif, penilaian formatif/sumatif, dan libur kalender pendidikan.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowEventModal(true)}
                className="px-3 py-1.5 bg-[#164e63] hover:bg-cyan-800 text-white font-bold text-xs rounded-none shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Agenda
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pekan Semester</div>
              <div className="text-2xl font-black text-slate-800">26 <span className="text-xs font-normal text-slate-500">Pekan Kalender</span></div>
              <p className="text-[11px] text-slate-500">Juli s.d. Desember 2026</p>
            </div>
            <div className="p-4 bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Pekan Efektif KBM</div>
              <div className="text-2xl font-black text-emerald-800">19 <span className="text-xs font-normal text-emerald-600">Pekan Tatap Muka</span></div>
              <p className="text-[11px] text-emerald-700">76 Jam Pembelajaran Efektif</p>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 space-y-2">
              <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">Pekan Non-Efektif</div>
              <div className="text-2xl font-black text-amber-800">7 <span className="text-xs font-normal text-amber-600">Pekan (MPLS, STS, SAS, Libur)</span></div>
              <p className="text-[11px] text-amber-700">Kegiatan Asesmen & Libur Semester</p>
            </div>
          </div>

          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Agenda & Milestone Kalender Akademik:</h4>
            <div className="overflow-x-auto border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3">Tanggal / Periode</th>
                    <th className="p-3">Nama Agenda / Kegiatan</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Keterangan</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rpeEvents.map((ev, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-[#164e63]">{ev.date}</td>
                      <td className="p-3 font-bold text-slate-800">{ev.event}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-none ${
                          ev.category === 'Asesmen' ? 'bg-amber-100 text-amber-800' :
                          ev.category === 'Libur' ? 'bg-rose-100 text-rose-800' :
                          ev.category === 'Pelaporan' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {ev.category}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{ev.desc}</td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setEventToDeleteIndex(idx);
                            setShowDeleteEventModal(true);
                          }}
                          className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white font-bold text-[11px] border border-rose-300 rounded-none transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Hapus
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

      {/* TAB CONTENT: TIM KURIKULUM */}
      {activeTab === 'tim' && (
        <div className="bg-white p-5 rounded-none border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Daftar Akun Waka & Tim Kurikulum Sekolah</h3>
              <p className="text-xs text-slate-500">Daftar akun pendidik dengan peran dan wewenang pengelolaan kurikulum serta jadwal pembelajaran.</p>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3">Nama Lengkap</th>
                  <th className="p-3">Email Akun</th>
                  <th className="p-3">NIP</th>
                  <th className="p-3">Sekolah</th>
                  <th className="p-3">Peran / Jabatan</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {curriculumUsers.length > 0 ? (
                  curriculumUsers.map(user => (
                    <tr key={user.uid || user.email} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-800">{user.name}</td>
                      <td className="p-3 font-mono text-slate-600">{user.email}</td>
                      <td className="p-3 text-slate-600 font-mono">{user.nip || '-'}</td>
                      <td className="p-3 text-slate-700">{user.schoolName || 'SD Negeri 1 SIMAK'}</td>
                      <td className="p-3 font-bold text-[#164e63]">{user.role}</td>
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
                            title="Edit Data Staf Kurikulum"
                            className="px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white font-bold text-[11px] border border-amber-300 rounded-none transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUserClick(user)}
                            title="Hapus Akun Staf Kurikulum"
                            className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white font-bold text-[11px] border border-rose-300 rounded-none transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleModuleClick(user, 'jadwal')}
                            title="Inspeksi Jadwal & Modul"
                            className="px-2 py-1 bg-cyan-50 text-[#164e63] hover:bg-[#164e63] hover:text-white font-bold text-[11px] border border-cyan-200 rounded-none transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Calendar className="w-3 h-3" />
                            <span>Jadwal</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-500">
                      Belum ada data akun dengan peran Tim Kurikulum.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Add / Edit JJM Mapel & Guru */}
      {showJjmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-none max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[90vh] flex flex-col border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-cyan-50 text-[#164e63] rounded-none">
                  {editingJjmIndex !== null ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">
                    {editingJjmIndex !== null ? 'Edit Mapel & Guru Pengampu' : 'Tambah Mapel & Guru Pengampu'}
                  </h3>
                  <p className="text-xs text-slate-500">Atur alokasi jam mengajar (JJM) dan guru penanggung jawab mata pelajaran.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowJjmModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJjm} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 overflow-y-auto space-y-4 max-h-[calc(90vh-140px)]">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kode Mapel *</label>
                    <input
                      type="text"
                      required
                      value={jjmCode}
                      onChange={(e) => setJjmCode(e.target.value)}
                      placeholder="Contoh: MAT-01"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-none text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nama Mata Pelajaran *</label>
                    <input
                      type="text"
                      required
                      value={jjmName}
                      onChange={(e) => setJjmName(e.target.value)}
                      placeholder="Contoh: Matematika Tingkat Lanjut"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tingkat / Fase</label>
                    <select
                      value={jjmFase}
                      onChange={(e) => setJjmFase(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white cursor-pointer"
                    >
                      <option value="Fase A (Kelas 1-2 SD)">Fase A (Kelas 1-2 SD)</option>
                      <option value="Fase B (Kelas 3-4 SD)">Fase B (Kelas 3-4 SD)</option>
                      <option value="Fase C (Kelas 5-6 SD)">Fase C (Kelas 5-6 SD)</option>
                      <option value="Fase D (Kelas 7-9 SMP)">Fase D (Kelas 7-9 SMP)</option>
                      <option value="Fase E (Kelas X)">Fase E (Kelas X)</option>
                      <option value="Fase F (Kelas XI)">Fase F (Kelas XI)</option>
                      <option value="Fase F (Kelas XII)">Fase F (Kelas XII)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">KKTP Minimum</label>
                    <input
                      type="number"
                      min={60}
                      max={100}
                      value={jjmKktp}
                      onChange={(e) => setJjmKktp(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-none text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Intrakurikuler (JP)</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={jjmIntra}
                      onChange={(e) => setJjmIntra(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-none text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-800 mb-1">Projek P5 (JP)</label>
                    <input
                      type="number"
                      min={0}
                      max={5}
                      value={jjmP5}
                      onChange={(e) => setJjmP5(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-none text-xs font-bold text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="col-span-2 text-right text-xs font-bold text-[#164e63]">
                    Total Alokasi: {Number(jjmIntra) + Number(jjmP5)} JP / Minggu
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Guru Pengampu Mata Pelajaran</label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={jjmGuru}
                      onChange={(e) => setJjmGuru(e.target.value)}
                      placeholder="Nama guru pengampu..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-none text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white"
                    />
                    {teacherUsers.length > 0 && (
                      <div className="flex flex-wrap gap-1 items-center pt-1">
                        <span className="text-[11px] text-slate-500 font-medium">Pilih cepat:</span>
                        {teacherUsers.slice(0, 5).map(u => (
                          <button
                            key={u.uid || u.email}
                            type="button"
                            onClick={() => setJjmGuru(u.name)}
                            className="px-2 py-0.5 bg-slate-100 hover:bg-cyan-100 hover:text-[#164e63] text-slate-700 text-[10px] font-bold rounded-none border border-slate-200 cursor-pointer"
                          >
                            {u.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowJjmModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-none transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#164e63] hover:bg-cyan-800 text-white rounded-none text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Alokasi JJM</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL: Delete JJM Confirmation */}
      {showDeleteJjmModal && jjmToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-none max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-none">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Hapus Mapel dari JJM?</h3>
                <p className="text-xs text-rose-600 font-semibold">Tindakan ini menghapus alokasi mata pelajaran.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus alokasi mapel <span className="font-bold text-slate-800">"{jjmToDelete.item.name}"</span> ({jjmToDelete.item.code}) dari struktur JJM Kurikulum?
            </p>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteJjmModal(false);
                  setJjmToDelete(null);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-none cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteJjm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-none shadow-xs cursor-pointer"
              >
                Hapus Mapel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Modul P5 */}
      {showP5Modal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-none max-w-md w-full shadow-2xl p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>Tambah Tema Projek P5</span>
              </h3>
              <button type="button" onClick={() => setShowP5Modal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveP5} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tema Utama P5 *</label>
                <input
                  type="text"
                  required
                  value={newP5Tema}
                  onChange={(e) => setNewP5Tema(e.target.value)}
                  placeholder="Contoh: Bhinneka Tunggal Ika & Kebinekaan"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status Pelaksanaan</label>
                <select
                  value={newP5Status}
                  onChange={(e) => setNewP5Status(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="Aktif Semester 1">Aktif Semester 1</option>
                  <option value="Rencana Semester 2">Rencana Semester 2</option>
                  <option value="Projek Tahunan">Projek Tahunan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Dimensi Profil Pelajar</label>
                <input
                  type="text"
                  value={newP5Target}
                  onChange={(e) => setNewP5Target(e.target.value)}
                  placeholder="Contoh: Dimensi Gotong Royong & Mandiri"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Koordinator / PIC</label>
                <input
                  type="text"
                  value={newP5Pic}
                  onChange={(e) => setNewP5Pic(e.target.value)}
                  placeholder="Nama koordinator projek..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowP5Modal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                >
                  Simpan Tema P5
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Agenda Kalender */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-none max-w-md w-full shadow-2xl p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#164e63]" />
                <span>Tambah Agenda Kalender Akademik</span>
              </h3>
              <button type="button" onClick={() => setShowEventModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Agenda / Kegiatan *</label>
                <input
                  type="text"
                  required
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  placeholder="Contoh: Asesmen Bakat Minat (ABM)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal / Periode *</label>
                <input
                  type="text"
                  required
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  placeholder="Contoh: 10 - 14 November 2026"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-none text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Agenda</label>
                <select
                  value={newEventCategory}
                  onChange={(e) => setNewEventCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600"
                >
                  <option value="Asesmen">Asesmen & Penilaian</option>
                  <option value="Pelaporan">Pelaporan & Rapor</option>
                  <option value="Non-Efektif">Kegiatan Non-Efektif</option>
                  <option value="Libur">Libur Resmi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Keterangan Tambahan</label>
                <textarea
                  value={newEventDesc}
                  onChange={(e) => setNewEventDesc(e.target.value)}
                  placeholder="Deskripsi singkat kegiatan..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 h-20 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#164e63] hover:bg-cyan-800 text-white font-bold text-xs shadow-xs"
                >
                  Simpan Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete P5 Module Confirmation */}
      {showDeleteP5Modal && p5ToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-none max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-none">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Hapus Tema P5?</h3>
                <p className="text-xs text-rose-600 font-semibold">Tindakan ini menghapus modul tema projek secara permanen.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus tema projek <span className="font-bold text-slate-800">"{p5ToDelete.tema}"</span> dari daftar kurikulum?
            </p>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteP5Modal(false);
                  setP5ToDelete(null);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-none cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteP5}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-none shadow-xs cursor-pointer"
              >
                Hapus Tema P5
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Delete Kalender Event Confirmation */}
      {showDeleteEventModal && eventToDeleteIndex !== null && rpeEvents[eventToDeleteIndex] && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-none max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-none">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Hapus Agenda Kalender?</h3>
                <p className="text-xs text-rose-600 font-semibold">Tindakan ini menghapus agenda akademik.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus agenda <span className="font-bold text-slate-800">"{rpeEvents[eventToDeleteIndex].event}"</span> ({rpeEvents[eventToDeleteIndex].date})?
            </p>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteEventModal(false);
                  setEventToDeleteIndex(null);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-none cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteEvent}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-none shadow-xs cursor-pointer"
              >
                Hapus Agenda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Delete Staf Kurikulum Confirmation */}
      {showDeleteUserModalInternal && userToDeleteInternal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-none max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-none">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Hapus Akun Pengguna?</h3>
                <p className="text-xs text-rose-600 font-semibold">Tindakan ini menghapus akun dari sistem.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus akun <span className="font-bold text-slate-800">"{userToDeleteInternal.name}"</span> ({userToDeleteInternal.email}) dari Tim Kurikulum?
            </p>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteUserModalInternal(false);
                  setUserToDeleteInternal(null);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-none cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUserInternal}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-none shadow-xs cursor-pointer"
              >
                Hapus Akun
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Edit User Data */}
      {showEditUserModal && selectedUserForEdit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-none max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-none shrink-0">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">Edit Data Pendidik / Akun</h3>
                  <p className="text-xs text-slate-500">Perbarui profil dan wewenang kurikulum akun</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditUserModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEditUser} className="space-y-4 overflow-y-auto pr-1 flex-1">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap & Gelar *</label>
                  <input
                    type="text"
                    required
                    value={formEditName}
                    onChange={(e) => setFormEditName(e.target.value)}
                    placeholder="Contoh: Shahrur Robby, S.Pd."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Email *</label>
                    <input
                      type="email"
                      required
                      value={formEditEmail}
                      onChange={(e) => setFormEditEmail(e.target.value)}
                      disabled={isMasterAccount(selectedUserForEdit.email, selectedUserForEdit.name)}
                      placeholder="email@simakmerdeka.ai.studio"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">NIP / NUPTK</label>
                    <input
                      type="text"
                      value={formEditNip}
                      onChange={(e) => setFormEditNip(e.target.value)}
                      placeholder="19870512 201001 1 003"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-none text-xs font-mono focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Unit Sekolah</label>
                    <input
                      type="text"
                      value={formEditSchool}
                      onChange={(e) => setFormEditSchool(e.target.value)}
                      placeholder="SD Negeri 1 SIMAK"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Peran / Jabatan</label>
                    <select
                      value={formEditRole}
                      onChange={(e) => setFormEditRole(e.target.value)}
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
                        type={showEditPassword ? 'text' : 'password'}
                        value={formEditPassword}
                        onChange={(e) => setFormEditPassword(e.target.value)}
                        placeholder="Biarkan kosong jika tidak diubah"
                        className="w-full pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditPassword(!showEditPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Status Akun</label>
                    <select
                      value={formEditStatus}
                      onChange={(e) => setFormEditStatus(e.target.value as 'Aktif' | 'Nonaktif')}
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
              <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2 shrink-0 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6">
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
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

      {/* MODAL: Inspeksi Jadwal & Modul Guru */}
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
            </div>

            {/* Tab Content Body */}
            <div className="overflow-y-auto space-y-4 pr-1 flex-1">
              {renderUserModule ? (
                renderUserModule(selectedUserForModule, activeModuleTab)
              ) : (
                /* Fallback Schedule & Supervision View */
                <div className="space-y-4">
                  {(() => {
                    const assignedMapels = curriculumMapels.filter(m => 
                      m.guru.toLowerCase().includes(selectedUserForModule.name.toLowerCase())
                    );
                    const totalAssignedJp = assignedMapels.reduce((acc, curr) => acc + curr.total, 0);

                    return (
                      <>
                        {/* Summary JJM Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="p-3.5 bg-cyan-50 border border-cyan-200">
                            <div className="text-[11px] font-bold text-cyan-900 uppercase">Total Jam Mengajar (JJM)</div>
                            <div className="text-2xl font-black text-[#164e63] mt-1">{totalAssignedJp} JP <span className="text-xs font-medium text-slate-500">/ Minggu</span></div>
                            <div className="text-[10px] text-cyan-700 mt-1 font-semibold">
                              {totalAssignedJp >= 24 ? '✓ Memenuhi Beban Linier Sertifikasi' : '⚠️ Kurang dari 24 JP standar sertifikasi'}
                            </div>
                          </div>

                          <div className="p-3.5 bg-emerald-50 border border-emerald-200">
                            <div className="text-[11px] font-bold text-emerald-900 uppercase">Mata Pelajaran Diampu</div>
                            <div className="text-2xl font-black text-emerald-700 mt-1">{assignedMapels.length} Mapel</div>
                            <div className="text-[10px] text-emerald-700 mt-1 font-semibold">Kurikulum Merdeka (KSP)</div>
                          </div>

                          <div className="p-3.5 bg-amber-50 border border-amber-200">
                            <div className="text-[11px] font-bold text-amber-900 uppercase">Status Penugasan</div>
                            <div className="text-base font-black text-amber-800 mt-1">{selectedUserForModule.role || 'Guru Pengampu'}</div>
                            <div className="text-[10px] text-amber-700 mt-1 font-semibold">Aktif Semester Ganjil 2026/2027</div>
                          </div>
                        </div>

                        {/* Assigned Mapel List */}
                        <div className="bg-slate-50 p-4 border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <BookOpen className="w-4 h-4 text-cyan-700" />
                              <span>Daftar Mata Pelajaran yang Diampu</span>
                            </h4>
                            <span className="text-[11px] text-slate-500 font-medium">Beban Mengajar Resmi</span>
                          </div>

                          {assignedMapels.length > 0 ? (
                            <div className="overflow-x-auto border border-slate-200 bg-white">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                                    <th className="p-2.5">Kode</th>
                                    <th className="p-2.5">Nama Mata Pelajaran</th>
                                    <th className="p-2.5">Fase / Kelas</th>
                                    <th className="p-2.5 text-center">Intra</th>
                                    <th className="p-2.5 text-center">P5</th>
                                    <th className="p-2.5 text-center font-black text-cyan-900">Total JJM</th>
                                    <th className="p-2.5 text-center">KKTP</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {assignedMapels.map(m => (
                                    <tr key={m.code} className="hover:bg-slate-50">
                                      <td className="p-2.5 font-mono font-bold text-slate-800">{m.code}</td>
                                      <td className="p-2.5 font-semibold text-slate-800">{m.name}</td>
                                      <td className="p-2.5 text-slate-600">{m.fase}</td>
                                      <td className="p-2.5 text-center font-mono">{m.jjm} JP</td>
                                      <td className="p-2.5 text-center font-mono">{m.p5} JP</td>
                                      <td className="p-2.5 text-center font-mono font-bold text-cyan-900 bg-cyan-50/50">{m.total} JP</td>
                                      <td className="p-2.5 text-center font-mono font-bold text-emerald-700">{m.kktp}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="p-6 text-center text-slate-500 bg-white border border-slate-200">
                              Belum ada penugasan mata pelajaran di tabel JJM untuk guru ini.
                            </div>
                          )}
                        </div>

                        {/* Weekly Schedule Timetable Grid */}
                        <div className="bg-slate-50 p-4 border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-indigo-700" />
                              <span>Matriks Jadwal Pembelajaran Mingguan</span>
                            </h4>
                            <button
                              type="button"
                              onClick={() => window.print()}
                              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold text-[11px] border border-slate-300 rounded-none flex items-center gap-1 cursor-pointer"
                            >
                              <Printer className="w-3 h-3" /> Cetak Jadwal
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {[
                              { day: 'Senin', time: '07.30 - 09.30', mapel: assignedMapels[0]?.name || 'Matematika Umum', room: 'Ruang Kelas X-A' },
                              { day: 'Selasa', time: '09.45 - 11.45', mapel: assignedMapels[0]?.name || 'Matematika Umum', room: 'Ruang Kelas X-B' },
                              { day: 'Rabu', time: '07.30 - 09.30', mapel: assignedMapels[1]?.name || 'Projek P5', room: 'Ruang Multimedia' },
                              { day: 'Kamis', time: '10.00 - 12.00', mapel: assignedMapels[0]?.name || 'Matematika Umum', room: 'Ruang Kelas X-C' },
                              { day: 'Jumat', time: '07.30 - 09.00', mapel: assignedMapels[1]?.name || 'Projek P5', room: 'Laboratorium' },
                              { day: 'Sabtu', time: '08.00 - 10.00', mapel: 'Supervisi & Evaluasi TP', room: 'Ruang Guru' }
                            ].map((slot, idx) => (
                              <div key={idx} className="p-3 bg-white border border-slate-200 space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-extrabold text-[#164e63]">{slot.day}</span>
                                  <span className="font-mono text-[11px] text-slate-500">{slot.time}</span>
                                </div>
                                <div className="text-xs font-bold text-slate-800 truncate">{slot.mapel}</div>
                                <div className="text-[11px] text-slate-500">{slot.room}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
              <div className="text-[11px] text-slate-500 font-medium">
                Inspeksi modul pembelajaran untuk <span className="font-bold text-slate-800">{selectedUserForModule.name}</span>
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

      {/* MODAL: VALIDASI PERANGKAT AJAR GURU */}
      {showValidationModal && selectedDocForValidation && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-none max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-50 text-[#164e63] rounded-none shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">Validasi Perangkat Ajar Guru</h3>
                  <p className="text-xs text-slate-500">Supervisi kurikulum & penetapan status validasi modul/ATP</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowValidationModal(false);
                  setSelectedDocForValidation(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Info Card */}
            <div className="bg-slate-50 p-3.5 border border-slate-200 space-y-2 text-xs shrink-0">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-cyan-100 text-[#164e63] font-bold text-[10px]">
                  {selectedDocForValidation.category}
                </span>
                <span className="font-mono text-slate-500 text-[11px]">ID: {selectedDocForValidation.id}</span>
              </div>
              <div className="font-bold text-slate-900 text-sm">{selectedDocForValidation.title}</div>
              <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1 border-t border-slate-200/80">
                <div>
                  <span className="text-slate-400 font-medium">Guru Pengampu:</span>
                  <div className="font-semibold text-slate-800">{selectedDocForValidation.teacherName}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Mata Pelajaran:</span>
                  <div className="font-semibold text-slate-800">{selectedDocForValidation.subject} ({selectedDocForValidation.className})</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Sasaran Fase:</span>
                  <div className="font-semibold text-slate-800">{selectedDocForValidation.fase}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Nama File:</span>
                  <div className="font-mono text-[#164e63] font-bold truncate">{selectedDocForValidation.fileName}</div>
                </div>
              </div>
            </div>

            {/* Form Validation */}
            <form onSubmit={handleSaveValidation} className="space-y-4 overflow-y-auto pr-1 flex-1">
              {/* Status Selection Cards */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Pilih Status Validasi Kurikulum *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setValStatus('Disetujui')}
                    className={`p-3 border text-left transition-all cursor-pointer rounded-none flex flex-col justify-between space-y-1.5 ${
                      valStatus === 'Disetujui'
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs flex items-center gap-1.5 text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Disetujui (Valid)</span>
                      </span>
                      {valStatus === 'Disetujui' && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      Perangkat ajar memenuhi standar CP, ATP, & diferensiasi.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setValStatus('Meninjau')}
                    className={`p-3 border text-left transition-all cursor-pointer rounded-none flex flex-col justify-between space-y-1.5 ${
                      valStatus === 'Meninjau'
                        ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 text-amber-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs flex items-center gap-1.5 text-amber-700">
                        <Clock className="w-4 h-4" />
                        <span>Meninjau</span>
                      </span>
                      {valStatus === 'Meninjau' && <span className="w-2 h-2 rounded-full bg-amber-500" />}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      Dokumen sedang dalam antrean review tim kurikulum.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setValStatus('Perlu Revisi')}
                    className={`p-3 border text-left transition-all cursor-pointer rounded-none flex flex-col justify-between space-y-1.5 ${
                      valStatus === 'Perlu Revisi'
                        ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500/20 text-rose-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-rose-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs flex items-center gap-1.5 text-rose-700">
                        <AlertCircle className="w-4 h-4" />
                        <span>Perlu Revisi</span>
                      </span>
                      {valStatus === 'Perlu Revisi' && <span className="w-2 h-2 rounded-full bg-rose-500" />}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      Guru perlu melengkapi instrumen asesmen atau komponen.
                    </p>
                  </button>
                </div>
              </div>

              {/* Verifier Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Supervisor / Verifikator Kurikulum *
                </label>
                <input
                  type="text"
                  required
                  value={valVerifier}
                  onChange={(e) => setValVerifier(e.target.value)}
                  placeholder="Contoh: Shahrur Robby, S.Pd. (Waka Kurikulum)"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white"
                />
              </div>

              {/* Notes & Feedback Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Catatan Evaluasi & Rekomendasi Kurikulum
                  </label>
                  <span className="text-[10px] text-slate-400">Terbaca langsung oleh guru</span>
                </div>
                <textarea
                  value={valNotes}
                  onChange={(e) => setValNotes(e.target.value)}
                  rows={3}
                  placeholder="Tuliskan catatan evaluasi, kekuatan modul, atau hal-hal yang perlu diperbaiki oleh guru..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white resize-none"
                />

                {/* Quick Recommendation Chips */}
                <div className="mt-2 space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Template Masukan Cepat:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Sesuai CP & Diferensiasi Pembelajaran.',
                      'Alur ATP runtut dan alokasi JP efektif tepat.',
                      'Mohon lengkapi rubrik asesmen formatif & LKPD.',
                      'Sesuaikan tujuan pembelajaran dengan KKO Bloom.'
                    ].map((snippet, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setValNotes(prev => prev ? `${prev} ${snippet}` : snippet);
                        }}
                        className="px-2 py-1 bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-slate-600 text-[10px] font-medium border border-slate-200 transition-colors cursor-pointer"
                      >
                        + {snippet}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowValidationModal(false);
                    setSelectedDocForValidation(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-none cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#164e63] hover:bg-cyan-800 text-white font-bold text-xs rounded-none shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan & Terapkan Validasi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH / EDIT SESI JADWAL 1 MINGGU */}
      {showWeeklyScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-none shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#164e63] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-white/10 rounded-none">
                  <Clock className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    {editingScheduleItem ? 'Edit Sesi Jadwal Mata Pelajaran' : 'Tambah Sesi Jadwal Baru'}
                  </h3>
                  <p className="text-[11px] text-cyan-200">
                    Atur jadwal tatap muka 1 minggu per rombel kelas
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowWeeklyScheduleModal(false);
                  setEditingScheduleItem(null);
                }}
                className="text-white/80 hover:text-white p-1 rounded-none hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveWeeklySchedule} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Hari */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hari KBM <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={schDay}
                    onChange={(e) => setSchDay(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-none text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                  >
                    {scheduleDaysList.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Kelas / Rombel */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Kelas / Rombel <span className="text-rose-600">*</span>
                    </label>
                    {onNavigateTab && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowWeeklyScheduleModal(false);
                          onNavigateTab('settings');
                        }}
                        className="text-[10px] text-cyan-700 hover:text-cyan-900 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                        title="Buka Menu Pengaturan > Tahun Ajaran & Kelas untuk menambah/mengubah rombel"
                      >
                        <Settings className="w-3 h-3" />
                        <span>Pengaturan Rombel</span>
                      </button>
                    )}
                  </div>
                  <select
                    value={schClassName}
                    onChange={(e) => {
                      const newCls = e.target.value;
                      setSchClassName(newCls);
                      if (!schRoom || schRoom.startsWith('R. ') || schRoom === 'Lab Biologi') {
                        setSchRoom(`R. ${newCls}`);
                      }
                    }}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-none text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white cursor-pointer"
                  >
                    {scheduleAvailableClasses.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0"></span>
                    <span>Diambil dari rombel aktif <strong>Pengaturan &gt; Tahun Ajaran &amp; Kelas</strong> ({scheduleAvailableClasses.length} kelas).</span>
                  </p>
                </div>
              </div>

              {/* Waktu Pelajaran */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Waktu / Jam Pelajaran <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={schTime}
                  onChange={(e) => setSchTime(e.target.value)}
                  placeholder="Contoh: 07.00 - 08.30"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-none text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                />
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <span className="text-[10px] text-slate-400">Preset:</span>
                  {['07.00 - 08.30', '08.30 - 10.00', '10.15 - 11.45', '12.30 - 14.00', '14.00 - 15.30'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSchTime(t)}
                      className="px-1.5 py-0.5 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-800 text-[10px] text-slate-600 border border-slate-200 cursor-pointer"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mata Pelajaran */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mata Pelajaran <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={schSubject}
                  onChange={(e) => setSchSubject(e.target.value)}
                  placeholder="Pilih atau ketik nama mata pelajaran..."
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-none text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                />
                <div className="flex flex-wrap gap-1.5 mt-1.5 max-h-20 overflow-y-auto no-scrollbar">
                  {curriculumMapels.slice(0, 8).map(m => (
                    <button
                      key={m.name}
                      type="button"
                      onClick={() => {
                        setSchSubject(m.name);
                        if (m.guru) setSchTeacher(m.guru);
                      }}
                      className="px-1.5 py-0.5 bg-slate-100 hover:bg-cyan-100 hover:text-cyan-800 text-[10px] text-slate-600 border border-slate-200 cursor-pointer truncate max-w-[160px]"
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Guru Pengampu */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Guru Pengampu <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={schTeacher}
                  onChange={(e) => setSchTeacher(e.target.value)}
                  placeholder="Nama lengkap guru pengampu..."
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-none text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                />
              </div>

              {/* Ruang Belajar & Catatan */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ruang / Lab
                  </label>
                  <input
                    type="text"
                    value={schRoom}
                    onChange={(e) => setSchRoom(e.target.value)}
                    placeholder="Contoh: Lab Biologi"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-none text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Catatan Sesi
                  </label>
                  <input
                    type="text"
                    value={schNotes}
                    onChange={(e) => setSchNotes(e.target.value)}
                    placeholder="Opsional: Bawa jas lab"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-none text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowWeeklyScheduleModal(false);
                    setEditingScheduleItem(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-none cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-none shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Sesi Jadwal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI HAPUS SESI JADWAL */}
      {showDeleteScheduleModal && scheduleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-none shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 text-rose-700 rounded-none flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Hapus Sesi Jadwal KBM?</h4>
                <p className="text-xs text-slate-500">Tindakan ini akan menghapus jadwal dari Portal LMS Siswa & Jurnal Guru.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div><span className="font-bold text-slate-700">Hari & Jam:</span> Hari {scheduleToDelete.day}, {scheduleToDelete.time}</div>
              <div><span className="font-bold text-slate-700">Mata Pelajaran:</span> {scheduleToDelete.subject}</div>
              <div><span className="font-bold text-slate-700">Kelas & Guru:</span> {scheduleToDelete.className} ({scheduleToDelete.teacher})</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteScheduleModal(false);
                  setScheduleToDelete(null);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-none cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteWeeklyScheduleConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-none shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI RESET JADWAL */}
      {showResetScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-none shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-rose-100 text-rose-700 rounded-none flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900">Reset Data Jadwal Pelajaran</h4>
                <p className="text-xs text-slate-500">
                  Konfirmasi penghapusan data jadwal pelajaran ({weeklySchedules.length} sesi terdaftar).
                </p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 p-3 rounded-none text-xs text-rose-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Peringatan Penghapusan</span>
              </div>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                Tindakan <strong>Hapus Semua Jadwal</strong> akan menghapus seluruh data jadwal pelajaran pada menu kurikulum, portal siswa, dan jadwal mengajar guru secara permanen.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowResetScheduleModal(false)}
                className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-none cursor-pointer text-center"
              >
                Batal
              </button>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleResetWeeklyScheduleConfirm}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-none border border-slate-300 flex items-center gap-1.5 cursor-pointer"
                  title="Kembalikan susunan jadwal ke standar awal kurikulum"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                  <span>Isi Standar Baku</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearAllWeeklyScheduleConfirm}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-none shadow-xs flex items-center gap-1.5 cursor-pointer"
                  title="Hapus seluruh data jadwal pada menu kurikulum"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Hapus Semua Jadwal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CETAK JADWAL PELAJARAN 1 MINGGU */}
      {showPrintScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-none shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-[#164e63] text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm">Pratinjau Cetak: Jadwal Pelajaran 1 Minggu</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-none flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintScheduleModal(false)}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-none cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Content */}
            <div className="p-6 overflow-y-auto space-y-6 print:p-0">
              {/* Kop Surat Sekolah */}
              <div className="text-center border-b-2 border-slate-800 pb-3">
                <h2 className="text-base font-black text-slate-900 uppercase tracking-wide">
                  SISTEM INFORMASI MANAJEMEN AKADEMIK KURIKULUM (SIMAK)
                </h2>
                <h3 className="text-sm font-bold text-slate-700 uppercase">
                  JADWAL PELAJARAN MINGGUAN TAHUN AJARAN {teacher?.academicYear || '2026/2027'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Kurikulum Merdeka • Berlaku Efektif Semester {teacher?.semester || 'Ganjil'} • {filterScheduleClass !== 'Semua Kelas' ? `Rombel: ${filterScheduleClass}` : 'Semua Rombel'}
                </p>
              </div>

              {/* Table of Schedules */}
              <div className="space-y-4">
                {scheduleDaysList.map(d => {
                  const items = weeklySchedules.filter(s => 
                    s.day === d && 
                    (filterScheduleClass === 'Semua Kelas' || s.className === filterScheduleClass)
                  );
                  if (items.length === 0) return null;

                  return (
                    <div key={d} className="border border-slate-300">
                      <div className="bg-slate-100 px-3 py-1.5 font-bold text-xs text-slate-800 border-b border-slate-300 flex justify-between">
                        <span>HARI {d.toUpperCase()}</span>
                        <span>{items.length} Sesi Pembelajaran</span>
                      </div>
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                            <th className="p-2 w-32">Waktu</th>
                            <th className="p-2 w-24">Kelas</th>
                            <th className="p-2">Mata Pelajaran</th>
                            <th className="p-2">Guru Pengampu</th>
                            <th className="p-2 w-32">Ruang / Lab</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {items.map((item, idx) => (
                            <tr key={idx}>
                              <td className="p-2 font-mono font-bold text-slate-700">{item.time}</td>
                              <td className="p-2 font-bold text-indigo-900">{item.className}</td>
                              <td className="p-2 font-bold text-slate-900">{item.subject}</td>
                              <td className="p-2 text-slate-700">{item.teacher}</td>
                              <td className="p-2 text-slate-600">{item.room || `R. ${item.className}`}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
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

      {/* Save Success Animated Modal */}
      <SaveSuccessModal
        isOpen={saveSuccessModal}
        onClose={() => setSaveSuccessModal(false)}
        title="Data Berhasil Disimpan"
        message={saveSuccessMsg || "Data telah berhasil disimpan dan tersinkronisasi."}
      />
    </div>
  );
};
