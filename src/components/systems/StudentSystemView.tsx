import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  Users,
  Award,
  ClipboardCheck,
  HeartHandshake,
  FolderKanban,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Download,
  Trash2,
  Edit3,
  UserPlus,
  X,
  Save,
  Upload,
  Calendar,
  Phone,
  FileText,
  BadgeAlert,
  Sparkles,
  Building2,
  GraduationCap,
  RotateCcw
} from 'lucide-react';
import { UserAccount, TeacherProfile, Student, AttendanceRecord, StudentGrade, StudentTask, Subject } from '../../types';
import { allDefaultStudents } from '../../data/initialData';
import { StudentLMSView } from '../StudentLMSView';
import * as XLSX from 'xlsx';

// Types for Wakasek Kesiswaan & Tim Kesiswaan
export interface DisciplineViolation {
  id: string;
  date: string;
  studentId: string;
  studentName: string;
  className: string;
  category: 'Ringan' | 'Sedang' | 'Berat';
  violationType: string;
  points: number;
  sanction: string;
  status: 'Selesai' | 'Dalam Pembinaan' | 'Panggilan Orang Tua';
  recordedBy: string;
  notes?: string;
}

export interface EkskulItem {
  id: string;
  name: string;
  category: 'Kepemimpinan' | 'Kesehatan' | 'Keagamaan' | 'Olahraga' | 'Seni & Budaya' | 'Ilmiah & Teknologi' | 'Bahasa';
  coachName: string;
  coachContact: string;
  scheduleDay: string;
  scheduleTime: string;
  location: string;
  memberCount: number;
  status: 'Aktif' | 'Nonaktif';
}

export interface OsisMember {
  id: string;
  position: string;
  studentName: string;
  className: string;
  division: string;
  contact: string;
}

export interface StudentAchievement {
  id: string;
  date: string;
  studentId: string;
  studentName: string;
  className: string;
  field: 'Akademik' | 'Olahraga' | 'Seni & Budaya' | 'Keagamaan' | 'Kepramukaan';
  competitionName: string;
  level: 'Kecamatan/Kota' | 'Kabupaten' | 'Provinsi' | 'Nasional' | 'Internasional';
  result: string;
  organizer: string;
  rewardPoints: number;
}

export interface ScholarshipRecord {
  id: string;
  studentId: string;
  studentName: string;
  nisn: string;
  className: string;
  programName: string;
  amount: string;
  academicYear: string;
  status: 'Tersalurkan' | 'Proses Verifikasi' | 'Pemberkasan';
  bankAccountInfo: string;
  parentPhone: string;
}

interface StudentSystemViewProps {
  registeredUsers: UserAccount[];
  teacher?: TeacherProfile;
  students?: Student[];
  attendanceRecords?: AttendanceRecord[];
  grades?: StudentGrade[];
  studentTasks?: StudentTask[];
  subjects?: Subject[];
  currentUser?: UserAccount | null;
  classList?: string[];
  onNavigateTab?: (tab: string) => void;
  onOpenAddUserModal?: (defaultRole: string) => void;
  onOpenEditUserModal?: (user: UserAccount) => void;
  onOpenDeleteUserModal?: (user: UserAccount) => void;
  onOpenModuleModal?: (user: UserAccount, tab: any) => void;
  onSelectCategory?: (category: 'Semua' | 'Kurikulum' | 'Guru' | 'TU' | 'Siswa') => void;
  onAddStudent?: (newStudent: Student) => boolean | void;
  onEditStudent?: (updatedStudent: Student) => boolean | void;
  onDeleteStudent?: (studentId: string) => boolean | void;
  onSaveTask?: (task: StudentTask) => boolean | void;
  onUpdateAttendance?: (records: AttendanceRecord[]) => void;
  onOpenReportCard?: (student: Student) => void;
}

// Initial Mock Data for Kesiswaan
const initialViolations: DisciplineViolation[] = [
  {
    id: 'VIO-001',
    date: '2025-02-14',
    studentId: 'STU-001',
    studentName: 'Ahmad Fauzi',
    className: 'X-IPA 1',
    category: 'Ringan',
    violationType: 'Keterlambatan Masuk Sekolah (> 15 Menit)',
    points: 5,
    sanction: 'Teguran lisan & piket kebersihan perpustakaan',
    status: 'Selesai',
    recordedBy: 'Guru Piket Kesiswaan',
    notes: 'Keterlambatan karena rantai sepeda motor putus'
  },
  {
    id: 'VIO-002',
    date: '2025-02-18',
    studentId: 'STU-003',
    studentName: 'Budi Santoso',
    className: 'X-IPA 2',
    category: 'Sedang',
    violationType: 'Meninggalkan Kelas / Jam Pelajaran Tanpa Izin',
    points: 20,
    sanction: 'Surat Peringatan 1 (SP1) & Konseling BK',
    status: 'Dalam Pembinaan',
    recordedBy: 'Tim Kesiswaan',
    notes: 'Berada di kantin saat jam pelajaran Fisika'
  },
  {
    id: 'VIO-003',
    date: '2025-02-25',
    studentId: 'STU-007',
    studentName: 'Doni Pratama',
    className: 'XI-IPA 1',
    category: 'Sedang',
    violationType: 'Pelanggaran Seragam & Atribut Sekolah Berulang',
    points: 15,
    sanction: 'Pemanggilan orang tua / wali murid',
    status: 'Panggilan Orang Tua',
    recordedBy: 'Wakasek Kesiswaan',
    notes: 'Sepatu non-standar dan tidak mengenakan dasi'
  },
  {
    id: 'VIO-004',
    date: '2025-03-02',
    studentId: 'STU-012',
    studentName: 'Fajar Nugraha',
    className: 'X-IPS 1',
    category: 'Ringan',
    violationType: 'Membawa barang terlarang (Kartu Remi/Game)',
    points: 10,
    sanction: 'Penyitaan barang & pembinaan wali kelas',
    status: 'Selesai',
    recordedBy: 'Tim Kesiswaan'
  }
];

const initialEkskuls: EkskulItem[] = [
  {
    id: 'EKS-001',
    name: 'Pramuka Gudep 01-02 (Wajib)',
    category: 'Kepemimpinan',
    coachName: 'Bambang Irawan, S.Pd.',
    coachContact: '0812-3456-7890',
    scheduleDay: 'Jumat',
    scheduleTime: '14.00 - 16.30 WIB',
    location: 'Lapangan Utama & Lap. Upacara',
    memberCount: 280,
    status: 'Aktif'
  },
  {
    id: 'EKS-002',
    name: 'Paskibra Saka Bhayangkara',
    category: 'Kepemimpinan',
    coachName: 'Siti Rahmawati, S.Pd.',
    coachContact: '0821-9876-5432',
    scheduleDay: 'Senin & Kamis',
    scheduleTime: '15.30 - 17.00 WIB',
    location: 'Lapangan Upacara',
    memberCount: 42,
    status: 'Aktif'
  },
  {
    id: 'EKS-003',
    name: 'PMR Wira (Palang Merah Remaja)',
    category: 'Kesehatan',
    coachName: 'dr. Anisa Permata / Pembina UKS',
    coachContact: '0813-1122-3344',
    scheduleDay: 'Rabu',
    scheduleTime: '15.00 - 17.00 WIB',
    location: 'Ruang UKS & Aula',
    memberCount: 38,
    status: 'Aktif'
  },
  {
    id: 'EKS-004',
    name: 'Rohani Islam (Rohis)',
    category: 'Keagamaan',
    coachName: 'Ust. Fahrur Razi, S.Ag.',
    coachContact: '0857-4433-2211',
    scheduleDay: 'Kamis',
    scheduleTime: '15.30 - 17.00 WIB',
    location: 'Masjid Al-Ikhlas Sekolah',
    memberCount: 65,
    status: 'Aktif'
  },
  {
    id: 'EKS-005',
    name: 'Karya Ilmiah Remaja (KIR) & Robotik',
    category: 'Ilmiah & Teknologi',
    coachName: 'Dr. Hendra Gunawan, M.Si.',
    coachContact: '0819-8765-4321',
    scheduleDay: 'Selasa',
    scheduleTime: '15.00 - 17.00 WIB',
    location: 'Laboratorium Komputer & Fisika',
    memberCount: 28,
    status: 'Aktif'
  },
  {
    id: 'EKS-006',
    name: 'Futsal & Sepakbola',
    category: 'Olahraga',
    coachName: 'Coach Rian Ardiansyah',
    coachContact: '0822-5566-7788',
    scheduleDay: 'Selasa & Sabtu',
    scheduleTime: '15.30 - 17.30 WIB',
    location: 'Lapangan Futsal Sekolah',
    memberCount: 52,
    status: 'Aktif'
  },
  {
    id: 'EKS-007',
    name: 'Seni Tari Tradisional & Modern',
    category: 'Seni & Budaya',
    coachName: 'Dewi Lestari, S.Sn.',
    coachContact: '0811-2233-4455',
    scheduleDay: 'Rabu',
    scheduleTime: '15.00 - 17.00 WIB',
    location: 'Ruang Kesenian',
    memberCount: 34,
    status: 'Aktif'
  },
  {
    id: 'EKS-008',
    name: 'English Club & Debat',
    category: 'Bahasa',
    coachName: 'Nadia Putri, M.Pd.',
    coachContact: '0878-3344-5566',
    scheduleDay: 'Jumat',
    scheduleTime: '13.30 - 15.00 WIB',
    location: 'Laboratorium Bahasa',
    memberCount: 26,
    status: 'Aktif'
  }
];

const initialOsis: OsisMember[] = [
  { id: 'OSIS-01', position: 'Ketua Umum OSIS', studentName: 'Muhammad Rizky Pratama', className: 'XI-IPA 1', division: 'Badan Pengurus Harian (BPH)', contact: '0812-9988-7766' },
  { id: 'OSIS-02', position: 'Wakil Ketua OSIS', studentName: 'Aulia Salma Rahmawati', className: 'XI-IPS 1', division: 'Badan Pengurus Harian (BPH)', contact: '0821-3344-5566' },
  { id: 'OSIS-03', position: 'Sekretaris 1', studentName: 'Nabila Zahra Khairunnisa', className: 'XI-IPA 2', division: 'Kesekretariatan', contact: '0813-7766-5544' },
  { id: 'OSIS-04', position: 'Bendahara 1', studentName: 'Kevin Wijaya', className: 'XI-IPA 1', division: 'Kebendaharaan', contact: '0857-1122-9988' },
  { id: 'OSIS-05', position: 'Koordinator Sekbid 1 (Ketaqwaan)', studentName: 'Farhan Maulana', className: 'XI-IPS 2', division: 'Sekbid Pembinaan Ketaqwaan', contact: '0822-4455-6677' },
  { id: 'OSIS-06', position: 'Koordinator Sekbid 2 (Budi Pekerti)', studentName: 'Siti Aminah', className: 'XI-IPA 3', division: 'Sekbid Karakter & Tata Tertib', contact: '0819-2233-4455' },
  { id: 'OSIS-07', position: 'Koordinator Sekbid 4 (Prestasi & Olahraga)', studentName: 'Dimas Bagaskara', className: 'XI-IPA 2', division: 'Sekbid Bakat & Olahraga', contact: '0812-7788-9900' }
];

const initialAchievements: StudentAchievement[] = [
  {
    id: 'ACH-001',
    date: '2025-01-20',
    studentId: 'STU-001',
    studentName: 'Ahmad Fauzi',
    className: 'X-IPA 1',
    field: 'Akademik',
    competitionName: 'Olimpiade Sains Nasional (OSN) Bidang Matematika',
    level: 'Provinsi',
    result: 'Juara 1 (Medali Emas)',
    organizer: 'BPTI Kemendikbudristek',
    rewardPoints: 30
  },
  {
    id: 'ACH-002',
    date: '2025-02-05',
    studentId: 'STU-002',
    studentName: 'Siti Nurhaliza',
    className: 'X-IPA 1',
    field: 'Seni & Budaya',
    competitionName: 'Festival & Lomba Seni Siswa Nasional (FLS2N) Cipta Puisi',
    level: 'Nasional',
    result: 'Juara 2 Nasional',
    organizer: 'Puspresnas Kemendikbudristek',
    rewardPoints: 50
  },
  {
    id: 'ACH-003',
    date: '2025-02-12',
    studentId: 'STU-004',
    studentName: 'Citra Dewi',
    className: 'X-IPA 2',
    field: 'Olahraga',
    competitionName: 'O2SN Bulutangkis Tunggal Putri SMA',
    level: 'Kecamatan/Kota',
    result: 'Juara 1 (Medali Emas)',
    organizer: 'Dinas Pendidikan & Dispora',
    rewardPoints: 20
  },
  {
    id: 'ACH-004',
    date: '2025-02-28',
    studentId: 'STU-005',
    studentName: 'Eko Prasetyo',
    className: 'XI-IPA 1',
    field: 'Kepramukaan',
    competitionName: 'Lomba Tingkat Kemah Pramuka Penegak Garuda',
    level: 'Kabupaten',
    result: 'Regu Teladan Terbaik 1',
    organizer: 'Kwartir Cabang Pramuka',
    rewardPoints: 25
  }
];

const initialScholarships: ScholarshipRecord[] = [
  {
    id: 'SCH-001',
    studentId: 'STU-001',
    studentName: 'Ahmad Fauzi',
    nisn: '0071234567',
    className: 'X-IPA 1',
    programName: 'Program Indonesia Pintar (PIP) Kemendikbud',
    amount: 'Rp 1.800.000 / Tahun',
    academicYear: '2024/2025',
    status: 'Tersalurkan',
    bankAccountInfo: 'BRI SimPel - 1029384756',
    parentPhone: '0812-3456-7890'
  },
  {
    id: 'SCH-002',
    studentId: 'STU-003',
    studentName: 'Budi Santoso',
    nisn: '0072345678',
    className: 'X-IPA 2',
    programName: 'Program Indonesia Pintar (PIP) Kemendikbud',
    amount: 'Rp 1.800.000 / Tahun',
    academicYear: '2024/2025',
    status: 'Tersalurkan',
    bankAccountInfo: 'BRI SimPel - 9876543210',
    parentPhone: '0821-9876-5432'
  },
  {
    id: 'SCH-003',
    studentId: 'STU-006',
    studentName: 'Dewi Lestari',
    nisn: '0075678901',
    className: 'X-IPS 1',
    programName: 'Beasiswa Prestasi Akademik Yayasan / Komite',
    amount: 'Rp 1.200.000 / Semester',
    academicYear: '2024/2025',
    status: 'Proses Verifikasi',
    bankAccountInfo: 'BNI Rekening Sekolah',
    parentPhone: '0813-9876-1234'
  },
  {
    id: 'SCH-004',
    studentId: 'STU-008',
    studentName: 'Erlina Kusuma',
    nisn: '0078901234',
    className: 'XI-IPA 2',
    programName: 'Bantuan Afirmasi Siswa Berkelanjutan (SKTM)',
    amount: 'Rp 1.000.000 / Tahun',
    academicYear: '2024/2025',
    status: 'Pemberkasan',
    bankAccountInfo: 'Menunggu Aktivasi Rekening SimPel',
    parentPhone: '0857-1234-5678'
  }
];

export const StudentSystemView: React.FC<StudentSystemViewProps> = ({
  registeredUsers,
  teacher,
  students = allDefaultStudents,
  attendanceRecords = [],
  grades = [],
  studentTasks = [],
  subjects = [],
  currentUser,
  classList,
  onNavigateTab,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onSaveTask,
  onUpdateAttendance,
  onOpenReportCard
}) => {
  // PURE Student User Check: Must be pure student and NOT Kesiswaan
  const isStudentUser = Boolean(
    currentUser?.role &&
    !currentUser.role.toLowerCase().includes('kesiswaan') &&
    (currentUser.role.toLowerCase().includes('siswa') || currentUser.role.toLowerCase().includes('murid'))
  );

  // If a pure student account logs in directly, render dedicated Student LMS view
  if (isStudentUser) {
    return (
      <StudentLMSView
        allStudents={students}
        grades={grades}
        subjects={subjects}
        studentTasks={studentTasks}
        attendanceRecords={attendanceRecords}
        teacher={teacher}
        currentUser={currentUser}
        onSaveTask={onSaveTask}
        onUpdateAttendance={onUpdateAttendance}
        onOpenReportCard={onOpenReportCard}
        isPreviewMode={false}
      />
    );
  }

  // WAKASEK KESISWAAN & TIM KESISWAAN MAIN VIEW
  const [activeTab, setActiveTab] = useState<'kedisiplinan' | 'ekskul-osis' | 'prestasi' | 'beasiswa' | 'rombel' | 'presensi'>('kedisiplinan');
  const [localStudents, setLocalStudents] = useState<Student[]>(students);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  useEffect(() => {
    setLocalStudents(students);
  }, [students]);

  // Violations State
  const [violations, setViolations] = useState<DisciplineViolation[]>(() => {
    try {
      const isCleared = typeof window !== 'undefined' && localStorage.getItem('simak_kesiswaan_reset_cleared') === 'true';
      if (isCleared) return [];
      const saved = localStorage.getItem('simak_kesiswaan_violations');
      return saved ? JSON.parse(saved) : initialViolations;
    } catch {
      return [];
    }
  });

  const saveViolations = (newList: DisciplineViolation[]) => {
    setViolations(newList);
    try {
      localStorage.setItem('simak_kesiswaan_violations', JSON.stringify(newList));
      localStorage.removeItem('simak_kesiswaan_reset_cleared');
    } catch {}
  };

  // Ekskul State
  const [ekskuls, setEkskuls] = useState<EkskulItem[]>(() => {
    try {
      const isCleared = typeof window !== 'undefined' && localStorage.getItem('simak_kesiswaan_reset_cleared') === 'true';
      if (isCleared) return [];
      const saved = localStorage.getItem('simak_kesiswaan_ekskul');
      return saved ? JSON.parse(saved) : initialEkskuls;
    } catch {
      return [];
    }
  });

  const saveEkskuls = (newList: EkskulItem[]) => {
    setEkskuls(newList);
    try {
      localStorage.setItem('simak_kesiswaan_ekskul', JSON.stringify(newList));
      localStorage.removeItem('simak_kesiswaan_reset_cleared');
    } catch {}
  };

  // OSIS State
  const [osisMembers, setOsisMembers] = useState<OsisMember[]>(() => {
    try {
      const isCleared = typeof window !== 'undefined' && localStorage.getItem('simak_kesiswaan_reset_cleared') === 'true';
      if (isCleared) return [];
      const saved = localStorage.getItem('simak_kesiswaan_osis');
      return saved ? JSON.parse(saved) : initialOsis;
    } catch {
      return [];
    }
  });

  const saveOsisMembers = (newList: OsisMember[]) => {
    setOsisMembers(newList);
    try {
      localStorage.setItem('simak_kesiswaan_osis', JSON.stringify(newList));
      localStorage.removeItem('simak_kesiswaan_reset_cleared');
    } catch {}
  };

  // Achievements State
  const [achievements, setAchievements] = useState<StudentAchievement[]>(() => {
    try {
      const isCleared = typeof window !== 'undefined' && localStorage.getItem('simak_kesiswaan_reset_cleared') === 'true';
      if (isCleared) return [];
      const saved = localStorage.getItem('simak_kesiswaan_achievements');
      return saved ? JSON.parse(saved) : initialAchievements;
    } catch {
      return [];
    }
  });

  const saveAchievements = (newList: StudentAchievement[]) => {
    setAchievements(newList);
    try {
      localStorage.setItem('simak_kesiswaan_achievements', JSON.stringify(newList));
      localStorage.removeItem('simak_kesiswaan_reset_cleared');
    } catch {}
  };

  // Scholarships State
  const [scholarships, setScholarships] = useState<ScholarshipRecord[]>(() => {
    try {
      const isCleared = typeof window !== 'undefined' && localStorage.getItem('simak_kesiswaan_reset_cleared') === 'true';
      if (isCleared) return [];
      const saved = localStorage.getItem('simak_kesiswaan_scholarships');
      return saved ? JSON.parse(saved) : initialScholarships;
    } catch {
      return [];
    }
  });

  const saveScholarships = (newList: ScholarshipRecord[]) => {
    setScholarships(newList);
    try {
      localStorage.setItem('simak_kesiswaan_scholarships', JSON.stringify(newList));
      localStorage.removeItem('simak_kesiswaan_reset_cleared');
    } catch {}
  };

  // Listen for Kesiswaan Reset Event
  useEffect(() => {
    const handleReset = () => {
      setLocalStudents([]);
      setViolations([]);
      setEkskuls([]);
      setOsisMembers([]);
      setAchievements([]);
      setScholarships([]);
    };
    window.addEventListener('simak_kesiswaan_reset', handleReset);
    window.addEventListener('simak_students_reset', handleReset);
    return () => {
      window.removeEventListener('simak_kesiswaan_reset', handleReset);
      window.removeEventListener('simak_students_reset', handleReset);
    };
  }, []);

  // Classes list
  const localClasses = Array.from(new Set(localStudents.map(s => s.className))).filter(Boolean);
  const classes = Array.from(new Set([...(classList || []), ...localClasses])).filter(c => Boolean(c) && c !== 'Semua Kelas' && c !== 'SEMUA');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('Semua');
  const [categoryFilter, setCategoryFilter] = useState('Semua');

  // Modals
  const [showAddViolationModal, setShowAddViolationModal] = useState(false);
  const [showAddEkskulModal, setShowAddEkskulModal] = useState(false);
  const [showAddAchievementModal, setShowAddAchievementModal] = useState(false);
  const [showAddScholarshipModal, setShowAddScholarshipModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // New Violation Form State
  const [newViolationForm, setNewViolationForm] = useState({
    studentId: localStudents[0]?.id || '',
    category: 'Ringan' as 'Ringan' | 'Sedang' | 'Berat',
    violationType: 'Keterlambatan Masuk Sekolah (> 15 Menit)',
    points: 5,
    sanction: 'Teguran lisan & surat peringatan wali kelas',
    status: 'Dalam Pembinaan' as 'Selesai' | 'Dalam Pembinaan' | 'Panggilan Orang Tua',
    notes: ''
  });

  // New Ekskul Form State
  const [newEkskulForm, setNewEkskulForm] = useState({
    name: '',
    category: 'Olahraga' as EkskulItem['category'],
    coachName: '',
    coachContact: '',
    scheduleDay: 'Senin',
    scheduleTime: '15.30 - 17.00 WIB',
    location: '',
    memberCount: 20
  });

  // New Achievement Form State
  const [newAchievementForm, setNewAchievementForm] = useState({
    studentId: localStudents[0]?.id || '',
    field: 'Akademik' as StudentAchievement['field'],
    competitionName: '',
    level: 'Provinsi' as StudentAchievement['level'],
    result: 'Juara 1 (Medali Emas)',
    organizer: '',
    rewardPoints: 25
  });

  // New Scholarship Form State
  const [newScholarshipForm, setNewScholarshipForm] = useState({
    studentId: localStudents[0]?.id || '',
    programName: 'Program Indonesia Pintar (PIP) Kemendikbud',
    amount: 'Rp 1.800.000 / Tahun',
    status: 'Tersalurkan' as ScholarshipRecord['status'],
    bankAccountInfo: 'Rekening SimPel Bank Penyalur'
  });

  // New Student Form State
  const [newStudentForm, setNewStudentForm] = useState({
    name: '',
    nis: '',
    nisn: '',
    gender: 'L' as 'L' | 'P',
    className: classes[0] || 'X-IPA 1',
    parentName: '',
    parentPhone: '',
    status: 'Aktif' as 'Aktif' | 'Mutasi' | 'Cuti'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto clear notification
  useEffect(() => {
    if (notificationMsg) {
      const timer = setTimeout(() => setNotificationMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notificationMsg]);

  // Calculated KPI Stats
  const activeStudents = localStudents.filter(s => s.status === 'Aktif');
  const totalViolationsCount = violations.length;
  const activePembinaanCount = violations.filter(v => v.status !== 'Selesai').length;
  const totalEkskulCount = ekskuls.length;
  const totalAchievementsCount = achievements.length;
  const totalScholarshipCount = scholarships.length;

  // Discipline index score (Average)
  const averageDisciplineScore = useMemo(() => {
    if (localStudents.length === 0) return 100;
    const totalPointsDeducted = violations.reduce((acc, v) => acc + (v.points || 0), 0);
    const score = Math.max(0, 100 - (totalPointsDeducted / localStudents.length));
    return score.toFixed(1);
  }, [localStudents, violations]);

  // Attendance rate
  const attendanceRate = useMemo(() => {
    if (attendanceRecords.length === 0) return '98.4%';
    const hadir = attendanceRecords.filter(r => r.status === 'HADIR').length;
    return ((hadir / attendanceRecords.length) * 100).toFixed(1) + '%';
  }, [attendanceRecords]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return localStudents.filter(s => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || s.name.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q) || s.nisn.toLowerCase().includes(q);
      const matchClass = selectedClassFilter === 'Semua' || s.className === selectedClassFilter;
      return matchSearch && matchClass;
    });
  }, [localStudents, searchQuery, selectedClassFilter]);

  // Filtered Violations
  const filteredViolations = useMemo(() => {
    return violations.filter(v => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || v.studentName.toLowerCase().includes(q) || v.violationType.toLowerCase().includes(q);
      const matchClass = selectedClassFilter === 'Semua' || v.className === selectedClassFilter;
      const matchCat = categoryFilter === 'Semua' || v.category === categoryFilter;
      return matchSearch && matchClass && matchCat;
    });
  }, [violations, searchQuery, selectedClassFilter, categoryFilter]);

  // Filtered Ekskuls
  const filteredEkskuls = useMemo(() => {
    return ekskuls.filter(e => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || e.name.toLowerCase().includes(q) || e.coachName.toLowerCase().includes(q);
      const matchCat = categoryFilter === 'Semua' || e.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [ekskuls, searchQuery, categoryFilter]);

  // Filtered Achievements
  const filteredAchievements = useMemo(() => {
    return achievements.filter(a => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || a.studentName.toLowerCase().includes(q) || a.competitionName.toLowerCase().includes(q);
      const matchClass = selectedClassFilter === 'Semua' || a.className === selectedClassFilter;
      return matchSearch && matchClass;
    });
  }, [achievements, searchQuery, selectedClassFilter]);

  // Filtered Scholarships
  const filteredScholarships = useMemo(() => {
    return scholarships.filter(sc => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || sc.studentName.toLowerCase().includes(q) || sc.nisn.includes(q) || sc.programName.toLowerCase().includes(q);
      const matchClass = selectedClassFilter === 'Semua' || sc.className === selectedClassFilter;
      return matchSearch && matchClass;
    });
  }, [scholarships, searchQuery, selectedClassFilter]);

  // Save new violation
  const handleSaveViolation = (e: React.FormEvent) => {
    e.preventDefault();
    const targetStudent = localStudents.find(s => s.id === newViolationForm.studentId) || localStudents[0];
    if (!targetStudent) return;

    const created: DisciplineViolation = {
      id: `VIO-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      studentId: targetStudent.id,
      studentName: targetStudent.name,
      className: targetStudent.className,
      category: newViolationForm.category,
      violationType: newViolationForm.violationType,
      points: Number(newViolationForm.points) || 5,
      sanction: newViolationForm.sanction,
      status: newViolationForm.status,
      recordedBy: currentUser?.name || 'Wakasek Kesiswaan',
      notes: newViolationForm.notes
    };

    saveViolations([created, ...violations]);
    setNotificationMsg(`Pelanggaran tata tertib atas nama ${targetStudent.name} berhasil dicatat.`);
    setShowAddViolationModal(false);
  };

  // Save new ekskul
  const handleSaveEkskul = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEkskulForm.name.trim()) return;

    const created: EkskulItem = {
      id: `EKS-${Date.now()}`,
      name: newEkskulForm.name.trim(),
      category: newEkskulForm.category,
      coachName: newEkskulForm.coachName || 'Pembina Kesiswaan',
      coachContact: newEkskulForm.coachContact || '-',
      scheduleDay: newEkskulForm.scheduleDay,
      scheduleTime: newEkskulForm.scheduleTime,
      location: newEkskulForm.location || 'Lingkungan Sekolah',
      memberCount: Number(newEkskulForm.memberCount) || 15,
      status: 'Aktif'
    };

    saveEkskuls([...ekskuls, created]);
    setNotificationMsg(`Ekstrakurikuler ${created.name} berhasil ditambahkan.`);
    setShowAddEkskulModal(false);
  };

  // Save new achievement
  const handleSaveAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    const targetStudent = localStudents.find(s => s.id === newAchievementForm.studentId) || localStudents[0];
    if (!targetStudent || !newAchievementForm.competitionName) return;

    const created: StudentAchievement = {
      id: `ACH-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      studentId: targetStudent.id,
      studentName: targetStudent.name,
      className: targetStudent.className,
      field: newAchievementForm.field,
      competitionName: newAchievementForm.competitionName,
      level: newAchievementForm.level,
      result: newAchievementForm.result,
      organizer: newAchievementForm.organizer || 'Dinas Pendidikan / Puspresnas',
      rewardPoints: Number(newAchievementForm.rewardPoints) || 20
    };

    saveAchievements([created, ...achievements]);
    setNotificationMsg(`Prestasi siswa ${targetStudent.name} berhasil dicatat (+${created.rewardPoints} Poin Apresiasi).`);
    setShowAddAchievementModal(false);
  };

  // Save new scholarship
  const handleSaveScholarship = (e: React.FormEvent) => {
    e.preventDefault();
    const targetStudent = localStudents.find(s => s.id === newScholarshipForm.studentId) || localStudents[0];
    if (!targetStudent) return;

    const created: ScholarshipRecord = {
      id: `SCH-${Date.now()}`,
      studentId: targetStudent.id,
      studentName: targetStudent.name,
      nisn: targetStudent.nisn,
      className: targetStudent.className,
      programName: newScholarshipForm.programName,
      amount: newScholarshipForm.amount,
      academicYear: '2024/2025',
      status: newScholarshipForm.status,
      bankAccountInfo: newScholarshipForm.bankAccountInfo,
      parentPhone: targetStudent.parentPhone || '-'
    };

    saveScholarships([created, ...scholarships]);
    setNotificationMsg(`Penerima bantuan atas nama ${targetStudent.name} berhasil didaftarkan.`);
    setShowAddScholarshipModal(false);
  };

  // Excel import for students
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        const newStudents: Student[] = [];
        data.forEach((rawRow: any, idx: number) => {
          const row: Record<string, any> = {};
          if (rawRow && typeof rawRow === 'object') {
            Object.keys(rawRow).forEach(key => {
              row[key.toLowerCase().replace(/[^a-z0-9]/g, '')] = rawRow[key];
            });
          }

          const rawName = row['namasiswa'] || row['nama'] || row['name'] || row['namalengkap'] || row['pesertadidik'];
          if (rawName) {
            const cls = row['kelas'] || row['rombel'] || (classes[0] || 'X-IPA 1');
            const student: Student = {
              id: `STD-IMP-${Date.now()}-${idx}`,
              nis: String(row['nis'] || row['nomorinduk'] || ''),
              nisn: String(row['nisn'] || ''),
              name: String(rawName).trim(),
              className: String(cls).trim(),
              gender: (row['lp'] || row['jk'] || 'L').toString().toUpperCase().startsWith('P') ? 'P' : 'L',
              status: 'Aktif',
              parentName: String(row['namaorangtua'] || row['wali'] || '-').trim(),
              parentPhone: String(row['telepon'] || row['nohp'] || '-').trim(),
              schoolName: teacher?.schoolName || 'SMA Negeri 1 Indonesia - Sekolah Penggerak'
            };
            newStudents.push(student);
          }
        });

        if (newStudents.length > 0) {
          newStudents.forEach(st => {
            if (onAddStudent) onAddStudent(st);
          });
          setLocalStudents(prev => [...prev, ...newStudents].sort((a, b) => a.name.localeCompare(b.name)));
          setNotificationMsg(`Berhasil mengimpor ${newStudents.length} siswa ke direktori kesiswaan.`);
        }
      } catch (err) {
        console.error(err);
        setNotificationMsg('Gagal membaca file Excel.');
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetAllStudents = () => {
    if (window.confirm('Apakah Anda yakin ingin mereset/mengosongkan seluruh data siswa? Setelah diklik, seluruh data siswa pada halaman Kesiswaan dan menu Data Siswa akan menjadi kosong.')) {
      try {
        localStorage.setItem('simak_students_reset_cleared', 'true');
        localStorage.removeItem('simak_students_data');
        localStorage.setItem('simak_kesiswaan_reset_cleared', 'true');
        localStorage.removeItem('simak_kesiswaan_violations');
        localStorage.removeItem('simak_kesiswaan_ekskuls');
        localStorage.removeItem('simak_kesiswaan_osis');
        localStorage.removeItem('simak_kesiswaan_achievements');
        localStorage.removeItem('simak_kesiswaan_scholarships');
      } catch (e) {}
      setLocalStudents([]);
      setViolations([]);
      setEkskuls([]);
      setOsisMembers([]);
      setAchievements([]);
      setScholarships([]);
      window.dispatchEvent(new CustomEvent('simak_students_reset'));
      window.dispatchEvent(new CustomEvent('simak_kesiswaan_reset'));
      setNotificationMsg('Seluruh data siswa telah berhasil direset / dikosongkan.');
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER: SISTEM KESISWAAN */}
      <div className="bg-gradient-to-r from-[#164e63] via-[#0e7490] to-[#0891b2] p-5 sm:p-6 text-white rounded-none shadow-md border-b-2 border-cyan-400">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 bg-cyan-400/20 border border-cyan-300 text-cyan-100 text-xs font-bold uppercase tracking-wider">
                Wakil Kepala Sekolah Bidang Kesiswaan
              </span>
              <span className="text-xs text-cyan-200 font-medium">
                T.A. 2024/2025 • Semester Genap
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <ShieldAlert className="w-6 h-6 text-amber-300 shrink-0" />
              <span>Sistem Manajemen Kesiswaan & Pembinaan Karakter</span>
            </h2>
            <p className="text-xs sm:text-sm text-cyan-100/90 max-w-3xl leading-relaxed">
              Pusat kendali kedisiplinan dan tata tertib siswa, pembinaan OSIS & ekstrakurikuler, pendataan prestasi kejuaraan, serta monitoring beasiswa (PIP) & kehadiran peserta didik.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handleResetAllStudents}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
              title="Reset seluruh data siswa"
            >
              <RotateCcw className="w-4 h-4 text-white" />
              <span>Reset Data Siswa</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAddViolationModal(true)}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            >
              <BadgeAlert className="w-4 h-4" />
              <span>Catat Pelanggaran</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAddAchievementModal(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            >
              <Award className="w-4 h-4" />
              <span>Input Prestasi</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-4 rounded-none border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-cyan-50 text-[#164e63] shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase">Siswa Aktif</div>
            <div className="text-lg sm:text-xl font-black text-slate-800">{activeStudents.length} <span className="text-xs font-semibold text-slate-500">Siswa</span></div>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-none border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase">Skor Kedisiplinan</div>
            <div className="text-lg sm:text-xl font-black text-emerald-700">{averageDisciplineScore} <span className="text-xs font-semibold text-slate-500">/ 100</span></div>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-none border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 text-rose-700 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase">Kasus Pembinaan</div>
            <div className="text-lg sm:text-xl font-black text-rose-700">{activePembinaanCount} <span className="text-xs font-semibold text-slate-500">Kasus</span></div>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-none border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 text-purple-700 shrink-0">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase">Ekskul Aktif</div>
            <div className="text-lg sm:text-xl font-black text-purple-700">{totalEkskulCount} <span className="text-xs font-semibold text-slate-500">Unit</span></div>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-none border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-700 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase">Prestasi Juara</div>
            <div className="text-lg sm:text-xl font-black text-amber-700">{totalAchievementsCount} <span className="text-xs font-semibold text-slate-500">Lomba</span></div>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-none border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-teal-50 text-teal-700 shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase">Penerima PIP</div>
            <div className="text-lg sm:text-xl font-black text-teal-700">{totalScholarshipCount} <span className="text-xs font-semibold text-slate-500">Siswa</span></div>
          </div>
        </div>
      </div>

      {/* NOTIFICATION TOAST */}
      {notificationMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notificationMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotificationMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB NAVIGATION: WAKASEK KESISWAAN */}
      <div className="flex border-b border-slate-200 bg-white px-2 pt-2 gap-1 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('kedisiplinan')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'kedisiplinan'
              ? 'border-[#164e63] text-[#164e63] bg-cyan-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <span>Kedisiplinan & Tata Tertib</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ekskul-osis')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'ekskul-osis'
              ? 'border-[#164e63] text-[#164e63] bg-cyan-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FolderKanban className="w-4 h-4 text-purple-600" />
          <span>OSIS, MPK & Ekstrakurikuler</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('prestasi')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'prestasi'
              ? 'border-[#164e63] text-[#164e63] bg-cyan-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>Prestasi & Penghargaan Siswa</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('beasiswa')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'beasiswa'
              ? 'border-[#164e63] text-[#164e63] bg-cyan-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <HeartHandshake className="w-4 h-4 text-teal-600" />
          <span>Beasiswa & Bantuan Siswa (PIP)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rombel')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'rombel'
              ? 'border-[#164e63] text-[#164e63] bg-cyan-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4 text-cyan-700" />
          <span>Data Siswa & Rombel</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('presensi')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'presensi'
              ? 'border-[#164e63] text-[#164e63] bg-cyan-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ClipboardCheck className="w-4 h-4 text-emerald-600" />
          <span>Monitoring Kehadiran Siswa</span>
        </button>
      </div>

      {/* SEARCH & GLOBAL FILTER BAR */}
      <div className="bg-white p-4 rounded-none border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama siswa, nomor induk, atau jenis kegiatan..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-none text-xs focus:outline-none focus:ring-2 focus:ring-[#164e63]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-none text-xs font-bold text-slate-700 cursor-pointer"
            >
              <option value="Semua">Semua Kelas</option>
              {classes.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Status Pembinaan: <span className="font-bold text-[#164e63]">{activePembinaanCount} Menunggu Tindak Lanjut</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: KEDISIPLINAN & TATA TERTIB SISWA */}
      {/* ======================================================== */}
      {activeTab === 'kedisiplinan' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-none border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span>Buku Catatan Pelanggaran & Poin Tata Tertib Siswa</span>
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[11px] font-bold">
                    {filteredViolations.length} Rekam Kasus
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Pencatatan sanksi kedisiplinan, poin minus, dan surat peringatan (SP) untuk pembinaan karakter siswa.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddViolationModal(true)}
                  className="px-3 py-1.5 bg-[#164e63] hover:bg-cyan-800 text-white rounded-none font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Catat Pelanggaran</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3">Tanggal</th>
                    <th className="p-3">Nama Siswa</th>
                    <th className="p-3">Kelas</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Bentuk Pelanggaran</th>
                    <th className="p-3 text-center">Poin (-)</th>
                    <th className="p-3">Tindak Lanjut / Sanksi</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredViolations.length > 0 ? (
                    filteredViolations.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-slate-600">{v.date}</td>
                        <td className="p-3 font-bold text-slate-900">{v.studentName}</td>
                        <td className="p-3 text-slate-700 font-semibold">{v.className}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-none ${
                            v.category === 'Berat'
                              ? 'bg-rose-100 text-rose-800'
                              : v.category === 'Sedang'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {v.category}
                          </span>
                        </td>
                        <td className="p-3 text-slate-800 max-w-xs">{v.violationType}</td>
                        <td className="p-3 text-center font-bold text-rose-700">-{v.points}</td>
                        <td className="p-3 text-slate-600 text-[11px]">{v.sanction}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-none ${
                            v.status === 'Selesai'
                              ? 'bg-emerald-100 text-emerald-800'
                              : v.status === 'Panggilan Orang Tua'
                              ? 'bg-rose-100 text-rose-800 animate-pulse'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {v.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {v.status !== 'Selesai' && (
                              <button
                                type="button"
                                onClick={() => {
                                  saveViolations(violations.map(item => item.id === v.id ? { ...item, status: 'Selesai' } : item));
                                  setNotificationMsg(`Status pembinaan untuk ${v.studentName} ditandai selesai.`);
                                }}
                                className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-600 hover:text-white font-bold text-[10px] cursor-pointer"
                                title="Tandai Selesai Pembinaan"
                              >
                                Selesai
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                saveViolations(violations.filter(item => item.id !== v.id));
                                setNotificationMsg(`Catatan pelanggaran dihapus.`);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                              title="Hapus Catatan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-slate-500">
                        Tidak ada catatan pelanggaran tata tertib yang ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: OSIS, MPK & EKSTRAKURIKULER */}
      {/* ======================================================== */}
      {activeTab === 'ekskul-osis' && (
        <div className="space-y-6">
          {/* OSIS Section */}
          <div className="bg-white p-5 rounded-none border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span>Struktur Kepengurusan Inti OSIS & MPK</span>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-900 text-[11px] font-bold">
                    Periode 2024/2025
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Organisasi Siswa Intra Sekolah dan Majelis Perwakilan Kelas di bawah pembinaan Tim Kesiswaan.
                </p>
              </div>
            </div>

            {osisMembers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {osisMembers.map(o => (
                  <div key={o.id} className="p-3.5 border border-slate-200 bg-slate-50/60 rounded-none space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-[#164e63] bg-cyan-100 px-1.5 py-0.5">
                      {o.position}
                    </span>
                    <div className="text-sm font-bold text-slate-900">{o.studentName}</div>
                    <div className="text-xs text-slate-600 font-medium">Kelas: {o.className}</div>
                    <div className="text-[11px] text-slate-500">{o.division}</div>
                    <div className="text-[11px] font-mono text-cyan-800 pt-1 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{o.contact}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 bg-slate-50 border border-slate-200 text-xs italic">
                Belum ada data pengurus OSIS & MPK (Data telah direset).
              </div>
            )}
          </div>

          {/* Ekskul Section */}
          <div className="bg-white p-5 rounded-none border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span>Daftar Kegiatan Ekstrakurikuler Sekolah ({filteredEkskuls.length} Unit)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Data pembina, jadwal latihan mingguan, lokasi kegiatan, dan jumlah anggota peserta didik.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddEkskulModal(true)}
                className="px-3 py-1.5 bg-[#164e63] hover:bg-cyan-800 text-white rounded-none font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Ekstrakurikuler</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3">Nama Ekstrakurikuler</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Guru Pembina</th>
                    <th className="p-3">Kontak Pembina</th>
                    <th className="p-3">Jadwal Latihan</th>
                    <th className="p-3">Lokasi Kegiatan</th>
                    <th className="p-3 text-center">Anggota</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEkskuls.map(e => (
                    <tr key={e.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{e.name}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-800 font-bold text-[10px]">
                          {e.category}
                        </span>
                      </td>
                      <td className="p-3 text-slate-800">{e.coachName}</td>
                      <td className="p-3 font-mono text-slate-600">{e.coachContact}</td>
                      <td className="p-3 font-medium text-cyan-900">{e.scheduleDay}, {e.scheduleTime}</td>
                      <td className="p-3 text-slate-600">{e.location}</td>
                      <td className="p-3 text-center font-bold text-[#164e63]">{e.memberCount} Siswa</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          {e.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: PRESTASI & PENGHARGAAN SISWA */}
      {/* ======================================================== */}
      {activeTab === 'prestasi' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-none border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span>Rekapitulasi Prestasi & Kejuaraan Peserta Didik</span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[11px] font-bold">
                    {filteredAchievements.length} Piagam Terverifikasi
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Pencatatan prestasi lomba tingkat Kabupaten, Provinsi, Nasional, dan reward poin karakter kesiswaan.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddAchievementModal(true)}
                  className="px-3 py-1.5 bg-[#164e63] hover:bg-cyan-800 text-white rounded-none font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Input Prestasi</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3">Tanggal</th>
                    <th className="p-3">Nama Siswa</th>
                    <th className="p-3">Kelas</th>
                    <th className="p-3">Bidang</th>
                    <th className="p-3">Nama Kejuaraan / Lomba</th>
                    <th className="p-3">Tingkat</th>
                    <th className="p-3">Capaian Juara</th>
                    <th className="p-3">Penyelenggara</th>
                    <th className="p-3 text-center">Reward Poin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAchievements.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-slate-600">{a.date}</td>
                      <td className="p-3 font-bold text-slate-900">{a.studentName}</td>
                      <td className="p-3 text-slate-700 font-semibold">{a.className}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-cyan-100 text-cyan-900 font-bold text-[10px]">
                          {a.field}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-slate-800 max-w-xs">{a.competitionName}</td>
                      <td className="p-3 text-slate-700 font-bold">{a.level}</td>
                      <td className="p-3 font-black text-amber-700">{a.result}</td>
                      <td className="p-3 text-slate-600 text-[11px]">{a.organizer}</td>
                      <td className="p-3 text-center font-bold text-emerald-700">+{a.rewardPoints} Pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: BEASISWA & BANTUAN SISWA (PIP) */}
      {/* ======================================================== */}
      {activeTab === 'beasiswa' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-none border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span>Data Siswa Penerima Bantuan & Beasiswa (PIP / Afirmasi)</span>
                  <span className="px-2 py-0.5 bg-teal-100 text-teal-900 text-[11px] font-bold">
                    {filteredScholarships.length} Siswa Terdaftar
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Pemantauan penyaluran Program Indonesia Pintar (PIP), beasiswa prestasi, dan rekening tabungan SimPel.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddScholarshipModal(true)}
                  className="px-3 py-1.5 bg-[#164e63] hover:bg-cyan-800 text-white rounded-none font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Penerima Bantuan</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3">NISN</th>
                    <th className="p-3">Nama Siswa</th>
                    <th className="p-3">Kelas</th>
                    <th className="p-3">Program Bantuan</th>
                    <th className="p-3">Besaran Bantuan</th>
                    <th className="p-3">Rekening SimPel / Bank</th>
                    <th className="p-3">Kontak Wali</th>
                    <th className="p-3 text-center">Status Penyaluran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredScholarships.map(sc => (
                    <tr key={sc.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-[#164e63] font-bold">{sc.nisn}</td>
                      <td className="p-3 font-bold text-slate-900">{sc.studentName}</td>
                      <td className="p-3 text-slate-700 font-semibold">{sc.className}</td>
                      <td className="p-3 text-slate-800 font-medium">{sc.programName}</td>
                      <td className="p-3 font-black text-emerald-800">{sc.amount}</td>
                      <td className="p-3 font-mono text-slate-600 text-[11px]">{sc.bankAccountInfo}</td>
                      <td className="p-3 font-mono text-slate-600">{sc.parentPhone}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-none ${
                          sc.status === 'Tersalurkan'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sc.status === 'Proses Verifikasi'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {sc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: DIREKTORI SISWA & ROMBEL */}
      {/* ======================================================== */}
      {activeTab === 'rombel' && (
        <div className="bg-white p-5 rounded-none border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span>Direktori Siswa & Rombongan Belajar (Rombel)</span>
                <span className="px-2 py-0.5 bg-cyan-100 text-cyan-900 text-[11px] font-bold">
                  {filteredStudents.length} Siswa Terdaftar
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Data induk peserta didik aktif, nomor NIS/NISN, status keaktifan, dan data kontak orang tua/wali murid.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleResetAllStudents}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-none font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Reset seluruh data siswa"
              >
                <RotateCcw className="w-3.5 h-3.5 text-white" />
                <span>Reset Data Siswa</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddStudentModal(true)}
                className="px-3 py-1.5 bg-[#164e63] hover:bg-cyan-800 text-white rounded-none font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Tambah Siswa</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-none font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Impor dari Excel"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Impor Xlsx</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportExcel}
                accept=".xlsx, .xls, .csv"
                className="hidden"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3">NIS</th>
                  <th className="p-3">NISN</th>
                  <th className="p-3">Nama Lengkap Siswa</th>
                  <th className="p-3 text-center">L/P</th>
                  <th className="p-3">Kelas</th>
                  <th className="p-3">Nama Orang Tua / Wali</th>
                  <th className="p-3">Kontak Wali</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-700">{s.nis}</td>
                    <td className="p-3 font-mono text-[#164e63] font-semibold">{s.nisn}</td>
                    <td className="p-3 font-bold text-slate-900">{s.name}</td>
                    <td className="p-3 text-center font-bold">
                      <span className={`px-1.5 py-0.5 text-[10px] ${s.gender === 'L' ? 'bg-cyan-100 text-cyan-800' : 'bg-pink-100 text-pink-800'}`}>
                        {s.gender}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-800">{s.className}</td>
                    <td className="p-3 text-slate-700">{s.parentName}</td>
                    <td className="p-3 font-mono text-slate-600">{s.parentPhone}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 font-bold text-[10px] bg-emerald-100 text-emerald-800">
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingStudent({ ...s })}
                          className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-300 font-bold text-[11px] cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setStudentToDelete(s)}
                          className="px-2 py-1 bg-rose-50 text-rose-700 border border-rose-300 font-bold text-[11px] cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
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

      {/* ======================================================== */}
      {/* TAB 6: MONITORING KEHADIRAN SISWA */}
      {/* ======================================================== */}
      {activeTab === 'presensi' && (
        <div className="bg-white p-5 rounded-none border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span>Monitoring Kehadiran & Rekapitulasi Presensi Siswa</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 text-[11px] font-bold">
                  {attendanceRate} Rata-rata Kehadiran
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Pemantauan data kehadiran harian peserta didik, deteksi dini siswa sering alpa untuk penanganan kesiswaan.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('attendance')}
              className="px-3 py-1.5 bg-[#164e63] hover:bg-cyan-800 text-white rounded-none font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Buka Presensi Siswa Lengkap</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3">Nama Siswa</th>
                  <th className="p-3">Kelas</th>
                  <th className="p-3 text-center">Hadir (H)</th>
                  <th className="p-3 text-center">Sakit (S)</th>
                  <th className="p-3 text-center">Izin (I)</th>
                  <th className="p-3 text-center">Alpa (A)</th>
                  <th className="p-3 text-center bg-cyan-50/50">Tingkat Kehadiran</th>
                  <th className="p-3 text-center">Status Pembinaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map(student => {
                  const studentRecords = attendanceRecords.filter(r => r.studentId === student.id);
                  const total = studentRecords.length;
                  const h = studentRecords.filter(r => r.status === 'HADIR').length;
                  const s = studentRecords.filter(r => r.status === 'SAKIT').length;
                  const i = studentRecords.filter(r => r.status === 'IZIN').length;
                  const a = studentRecords.filter(r => r.status === 'ALPA').length;
                  const rate = total > 0 ? ((h / total) * 100).toFixed(1) + '%' : '100.0%';
                  const needsAttention = a >= 2;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-800">{student.name}</td>
                      <td className="p-3 text-slate-600 font-medium">{student.className}</td>
                      <td className="p-3 text-center font-bold text-emerald-600">{h}</td>
                      <td className="p-3 text-center font-bold text-cyan-600">{s}</td>
                      <td className="p-3 text-center font-bold text-amber-600">{i}</td>
                      <td className="p-3 text-center font-bold text-rose-600">{a}</td>
                      <td className="p-3 text-center font-black text-[#164e63] bg-cyan-50/40">{rate}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 font-bold text-[10px] rounded-none ${
                          needsAttention ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {needsAttention ? 'Perlu Pemanggilan' : 'Disiplin'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CATAT PELANGGARAN SISWA */}
      {/* ======================================================== */}
      {showAddViolationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-none border border-slate-300 w-full max-w-lg shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Catat Pelanggaran Tata Tertib Siswa</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddViolationModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveViolation} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Siswa yang Melanggar *</label>
                <select
                  required
                  value={newViolationForm.studentId}
                  onChange={(e) => setNewViolationForm({ ...newViolationForm, studentId: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none font-medium text-slate-800"
                >
                  {localStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.className}) - NISN: {s.nisn}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori Pelanggaran *</label>
                  <select
                    value={newViolationForm.category}
                    onChange={(e) => {
                      const cat = e.target.value as any;
                      const pts = cat === 'Berat' ? 50 : cat === 'Sedang' ? 20 : 5;
                      setNewViolationForm({ ...newViolationForm, category: cat, points: pts });
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none font-medium"
                  >
                    <option value="Ringan">Ringan (5 - 15 Poin)</option>
                    <option value="Sedang">Sedang (20 - 40 Poin)</option>
                    <option value="Berat">Berat (50 - 100 Poin)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bobot Poin Minus *</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={newViolationForm.points}
                    onChange={(e) => setNewViolationForm({ ...newViolationForm, points: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none font-bold text-rose-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bentuk / Jenis Pelanggaran *</label>
                <input
                  type="text"
                  required
                  value={newViolationForm.violationType}
                  onChange={(e) => setNewViolationForm({ ...newViolationForm, violationType: e.target.value })}
                  placeholder="Contoh: Terlambat, Merokok di area sekolah, Tawuran, Bullying"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sanksi / Tindak Lanjut *</label>
                <input
                  type="text"
                  required
                  value={newViolationForm.sanction}
                  onChange={(e) => setNewViolationForm({ ...newViolationForm, sanction: e.target.value })}
                  placeholder="Contoh: Teguran lisan, SP1, Konseling BK, Pemanggilan Orang Tua"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Penanganan</label>
                  <select
                    value={newViolationForm.status}
                    onChange={(e) => setNewViolationForm({ ...newViolationForm, status: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none"
                  >
                    <option value="Dalam Pembinaan">Dalam Pembinaan</option>
                    <option value="Panggilan Orang Tua">Panggilan Orang Tua</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan</label>
                  <input
                    type="text"
                    value={newViolationForm.notes}
                    onChange={(e) => setNewViolationForm({ ...newViolationForm, notes: e.target.value })}
                    placeholder="Keterangan saksi atau kronologi singkat"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddViolationModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#164e63] hover:bg-cyan-800 text-white font-bold cursor-pointer"
                >
                  Simpan Pelanggaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: INPUT PRESTASI SISWA */}
      {/* ======================================================== */}
      {showAddAchievementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-none border border-slate-300 w-full max-w-lg shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Input Prestasi & Piagam Siswa</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddAchievementModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAchievement} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Siswa yang Berprestasi *</label>
                <select
                  required
                  value={newAchievementForm.studentId}
                  onChange={(e) => setNewAchievementForm({ ...newAchievementForm, studentId: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none font-medium"
                >
                  {localStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.className})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bidang Prestasi *</label>
                  <select
                    value={newAchievementForm.field}
                    onChange={(e) => setNewAchievementForm({ ...newAchievementForm, field: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none"
                  >
                    <option value="Akademik">Akademik (OSN, Lomba Ilmiah)</option>
                    <option value="Olahraga">Olahraga (O2SN, Popda)</option>
                    <option value="Seni & Budaya">Seni & Budaya (FLS2N, Musik, Tari)</option>
                    <option value="Keagamaan">Keagamaan (MTQ, Kaligrafi)</option>
                    <option value="Kepramukaan">Kepramukaan & Bela Negara</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tingkat Kejuaraan *</label>
                  <select
                    value={newAchievementForm.level}
                    onChange={(e) => setNewAchievementForm({ ...newAchievementForm, level: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none font-bold"
                  >
                    <option value="Kecamatan/Kota">Kecamatan / Kota</option>
                    <option value="Kabupaten">Kabupaten</option>
                    <option value="Provinsi">Provinsi</option>
                    <option value="Nasional">Nasional</option>
                    <option value="Internasional">Internasional</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Kejuaraan / Lomba *</label>
                <input
                  type="text"
                  required
                  value={newAchievementForm.competitionName}
                  onChange={(e) => setNewAchievementForm({ ...newAchievementForm, competitionName: e.target.value })}
                  placeholder="Contoh: Olimpiade Sains Nasional Bidang Fisika 2025"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Capaian Juara *</label>
                  <input
                    type="text"
                    required
                    value={newAchievementForm.result}
                    onChange={(e) => setNewAchievementForm({ ...newAchievementForm, result: e.target.value })}
                    placeholder="Contoh: Juara 1 / Medali Emas"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none font-bold text-amber-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Poin Reward Karakter</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={newAchievementForm.rewardPoints}
                    onChange={(e) => setNewAchievementForm({ ...newAchievementForm, rewardPoints: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Instansi Penyelenggara</label>
                <input
                  type="text"
                  value={newAchievementForm.organizer}
                  onChange={(e) => setNewAchievementForm({ ...newAchievementForm, organizer: e.target.value })}
                  placeholder="Contoh: Kemendikbudristek / Dinas Pendidikan / Universitas"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddAchievementModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#164e63] hover:bg-cyan-800 text-white font-bold cursor-pointer"
                >
                  Simpan Prestasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: TAMBAH EKSTRAKURIKULER */}
      {/* ======================================================== */}
      {showAddEkskulModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-none border border-slate-300 w-full max-w-lg shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-purple-600" />
                <span>Tambah Ekstrakurikuler Baru</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddEkskulModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEkskul} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Ekstrakurikuler *</label>
                <input
                  type="text"
                  required
                  value={newEkskulForm.name}
                  onChange={(e) => setNewEkskulForm({ ...newEkskulForm, name: e.target.value })}
                  placeholder="Contoh: Robotik & Otomasi, Teater Sekolah"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori *</label>
                  <select
                    value={newEkskulForm.category}
                    onChange={(e) => setNewEkskulForm({ ...newEkskulForm, category: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none"
                  >
                    <option value="Olahraga">Olahraga</option>
                    <option value="Seni & Budaya">Seni & Budaya</option>
                    <option value="Kepemimpinan">Kepemimpinan</option>
                    <option value="Kesehatan">Kesehatan (PMR)</option>
                    <option value="Keagamaan">Keagamaan</option>
                    <option value="Ilmiah & Teknologi">Ilmiah & Teknologi</option>
                    <option value="Bahasa">Bahasa</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estimasi Anggota</label>
                  <input
                    type="number"
                    min="1"
                    value={newEkskulForm.memberCount}
                    onChange={(e) => setNewEkskulForm({ ...newEkskulForm, memberCount: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Pembina *</label>
                  <input
                    type="text"
                    required
                    value={newEkskulForm.coachName}
                    onChange={(e) => setNewEkskulForm({ ...newEkskulForm, coachName: e.target.value })}
                    placeholder="Nama Guru Pembina"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kontak Pembina (HP)</label>
                  <input
                    type="text"
                    value={newEkskulForm.coachContact}
                    onChange={(e) => setNewEkskulForm({ ...newEkskulForm, coachContact: e.target.value })}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hari Latihan</label>
                  <select
                    value={newEkskulForm.scheduleDay}
                    onChange={(e) => setNewEkskulForm({ ...newEkskulForm, scheduleDay: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none"
                  >
                    <option value="Senin">Senin</option>
                    <option value="Selasa">Selasa</option>
                    <option value="Rabu">Rabu</option>
                    <option value="Kamis">Kamis</option>
                    <option value="Jumat">Jumat</option>
                    <option value="Sabtu">Sabtu</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jam Latihan</label>
                  <input
                    type="text"
                    value={newEkskulForm.scheduleTime}
                    onChange={(e) => setNewEkskulForm({ ...newEkskulForm, scheduleTime: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lokasi Latihan</label>
                <input
                  type="text"
                  value={newEkskulForm.location}
                  onChange={(e) => setNewEkskulForm({ ...newEkskulForm, location: e.target.value })}
                  placeholder="Contoh: Lapangan Basket, Aula Sekolah, Lab Komputer"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddEkskulModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#164e63] hover:bg-cyan-800 text-white font-bold cursor-pointer"
                >
                  Simpan Ekstrakurikuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: TAMBAH PENERIMA BANTUAN BEASISWA / PIP */}
      {/* ======================================================== */}
      {showAddScholarshipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-none border border-slate-300 w-full max-w-lg shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-teal-600" />
                <span>Tambah Siswa Penerima Bantuan (PIP/SKTM)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddScholarshipModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveScholarship} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Peserta Didik *</label>
                <select
                  required
                  value={newScholarshipForm.studentId}
                  onChange={(e) => setNewScholarshipForm({ ...newScholarshipForm, studentId: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none"
                >
                  {localStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.className}) - NISN: {s.nisn}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Program Bantuan / Beasiswa *</label>
                <input
                  type="text"
                  required
                  value={newScholarshipForm.programName}
                  onChange={(e) => setNewScholarshipForm({ ...newScholarshipForm, programName: e.target.value })}
                  placeholder="Contoh: Program Indonesia Pintar (PIP) Kemendikbud"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Besaran / Nominal *</label>
                  <input
                    type="text"
                    required
                    value={newScholarshipForm.amount}
                    onChange={(e) => setNewScholarshipForm({ ...newScholarshipForm, amount: e.target.value })}
                    placeholder="Rp 1.800.000 / Tahun"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none font-bold text-emerald-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Penyaluran</label>
                  <select
                    value={newScholarshipForm.status}
                    onChange={(e) => setNewScholarshipForm({ ...newScholarshipForm, status: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none font-bold"
                  >
                    <option value="Tersalurkan">Tersalurkan</option>
                    <option value="Proses Verifikasi">Proses Verifikasi</option>
                    <option value="Pemberkasan">Pemberkasan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Informasi Bank / Rekening SimPel</label>
                <input
                  type="text"
                  value={newScholarshipForm.bankAccountInfo}
                  onChange={(e) => setNewScholarshipForm({ ...newScholarshipForm, bankAccountInfo: e.target.value })}
                  placeholder="Contoh: Bank BRI SimPel - No. Rekening 1234xxxx"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddScholarshipModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#164e63] hover:bg-cyan-800 text-white font-bold cursor-pointer"
                >
                  Simpan Penerima Bantuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: TAMBAH SISWA (ROMBEL) */}
      {/* ======================================================== */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-none border border-slate-300 w-full max-w-lg shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#164e63]" />
                <span>Tambah Data Siswa Baru ke Rombel</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddStudentModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newStudentForm.name.trim()) return;
                const created: Student = {
                  id: `STD-${Date.now()}`,
                  name: newStudentForm.name.trim(),
                  nis: newStudentForm.nis.trim() || '12345',
                  nisn: newStudentForm.nisn.trim() || '0071234567',
                  gender: newStudentForm.gender,
                  className: newStudentForm.className || classes[0] || 'X-IPA 1',
                  parentName: newStudentForm.parentName.trim() || '-',
                  parentPhone: newStudentForm.parentPhone.trim() || '-',
                  status: newStudentForm.status,
                  schoolName: teacher?.schoolName || 'SMA Negeri 1 Indonesia - Sekolah Penggerak'
                };
                if (onAddStudent) onAddStudent(created);
                setLocalStudents(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
                setNotificationMsg(`Siswa baru ${created.name} berhasil ditambahkan.`);
                setShowAddStudentModal(false);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Siswa *</label>
                <input
                  type="text"
                  required
                  value={newStudentForm.name}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                  placeholder="Masukkan nama lengkap siswa..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIS *</label>
                  <input
                    type="text"
                    required
                    value={newStudentForm.nis}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, nis: e.target.value })}
                    placeholder="Nomor Induk Siswa"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NISN *</label>
                  <input
                    type="text"
                    required
                    value={newStudentForm.nisn}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, nisn: e.target.value })}
                    placeholder="10 digit NISN"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none font-mono text-[#164e63]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={newStudentForm.gender}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, gender: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kelas / Rombel *</label>
                  <select
                    value={newStudentForm.className}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, className: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none font-bold"
                  >
                    {classes.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    value={newStudentForm.parentName}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, parentName: e.target.value })}
                    placeholder="Ayah / Ibu / Wali"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. Kontak Orang Tua (WA)</label>
                  <input
                    type="text"
                    value={newStudentForm.parentPhone}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, parentPhone: e.target.value })}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#164e63] hover:bg-cyan-800 text-white font-bold cursor-pointer"
                >
                  Tambah Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT DATA SISWA */}
      {/* ======================================================== */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-none border border-slate-300 w-full max-w-lg shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-600" />
                <span>Edit Identitas Siswa: {editingStudent.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (onEditStudent) onEditStudent(editingStudent);
                setLocalStudents(prev => prev.map(s => s.id === editingStudent.id ? editingStudent : s));
                setNotificationMsg(`Perubahan data ${editingStudent.name} berhasil disimpan.`);
                setEditingStudent(null);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIS</label>
                  <input
                    type="text"
                    value={editingStudent.nis}
                    onChange={(e) => setEditingStudent({ ...editingStudent, nis: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NISN</label>
                  <input
                    type="text"
                    value={editingStudent.nisn}
                    onChange={(e) => setEditingStudent({ ...editingStudent, nisn: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none font-mono text-[#164e63]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kelas</label>
                  <select
                    value={editingStudent.className}
                    onChange={(e) => setEditingStudent({ ...editingStudent, className: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none font-bold"
                  >
                    {classes.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Keaktifan</label>
                  <select
                    value={editingStudent.status}
                    onChange={(e) => setEditingStudent({ ...editingStudent, status: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none font-bold"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Mutasi">Mutasi Keluar</option>
                    <option value="Cuti">Cuti</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Orang Tua</label>
                  <input
                    type="text"
                    value={editingStudent.parentName}
                    onChange={(e) => setEditingStudent({ ...editingStudent, parentName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. Kontak (WA)</label>
                  <input
                    type="text"
                    value={editingStudent.parentPhone}
                    onChange={(e) => setEditingStudent({ ...editingStudent, parentPhone: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-3.5 py-1.5 border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#164e63] hover:bg-cyan-800 text-white font-bold cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: HAPUS SISWA */}
      {/* ======================================================== */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-none border border-slate-300 w-full max-w-md shadow-2xl p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="font-bold text-sm text-slate-900">Konfirmasi Hapus Data Siswa</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              Apakah Anda yakin ingin menghapus data siswa <span className="font-bold text-slate-950">{studentToDelete.name}</span> ({studentToDelete.className}, NISN: {studentToDelete.nisn}) dari rombel kesiswaan?
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-3.5 py-1.5 border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteStudent) onDeleteStudent(studentToDelete.id);
                  setLocalStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
                  setNotificationMsg(`Siswa ${studentToDelete.name} berhasil dihapus.`);
                  setStudentToDelete(null);
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
              >
                Hapus Siswa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
