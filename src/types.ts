export type AttendanceStatus = 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPA';

export interface Student {
  id: string;
  nis: string;
  nisn: string;
  name: string;
  gender: 'L' | 'P';
  className: string;
  parentName: string;
  parentPhone: string;
  avatarUrl?: string;
  status: 'Aktif' | 'Mutasi' | 'Cuti';
  schoolName?: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  kktp: number; // Kriteria Ketercapaian Tujuan Pembelajaran (e.g. 75)
  category: 'Wajib' | 'Pilihan' | 'Muatan Lokal';
  schoolName?: string;
}

export interface StudentGrade {
  studentId: string;
  subjectId: string;
  tp1: number; // Formatif TP 1
  tp2: number; // Formatif TP 2
  tp3: number; // Formatif TP 3
  tp4: number; // Formatif TP 4
  pts: number; // Sumatif Tengah Semester
  pas: number; // Sumatif Akhir Semester
  finalScore: number;
  predicate: 'A' | 'B' | 'C' | 'D';
  achievementDescription: string;
  schoolName?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  note?: string;
  recordedAt: string; // ISO string
  meetingNo?: number;
  schoolName?: string;
}

export interface TeachingLog {
  id: string;
  date: string;
  className: string;
  subjectId: string;
  classPeriod: string; // e.g. "Jam Ke 1-2 (07.00 - 08.30)"
  learningObjective: string; // Tujuan Pembelajaran / TP
  summaryMaterial: string;
  presentCount: number;
  absentCount: number;
  notes: string;
  schoolName?: string;
}

export interface SchoolAnnouncement {
  id: string;
  title: string;
  category: 'Kedinasan' | 'Akademik' | 'Kurikulum' | 'Kegiatan';
  date: string;
  author: string;
  content: string;
  isImportant: boolean;
  schoolName?: string;
}

export interface TeacherProfile {
  id?: string;
  name: string;
  title: string;
  nip: string;
  npsn: string;
  schoolName: string;
  guardianClass: string;
  subjectRole: string;
  academicYear: string;
  semester: string;
  kkm?: number;
  principalName: string;
  principalNip: string;
  city?: string;
  avatarUrl?: string;
  gender?: 'Laki-laki' | 'Perempuan' | string;
  isMaintenance?: boolean;
  status?: 'Aktif' | 'Nonaktif' | 'Maintenance' | 'Menunggu Aktivasi';
}

export interface DataLockConfig {
  isMasterLocked: boolean;
  lockStudents: boolean;
  lockGrades: boolean;
  lockAttendance: boolean;
  lockJournal: boolean;
  lockSettings: boolean;
  lockedAt?: string;
  lockedBy?: string;
}

export interface WeightingConfig {
  formatif: number; // e.g. 40%
  pts: number;      // e.g. 30%
  pas: number;      // e.g. 30%
}

export interface TeachingScheduleItem {
  id: string;
  day: string;
  time: string;
  className: string;
  sub: string;
  schoolName?: string;
}

export interface WeeklyClassScheduleItem {
  id: string;
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | string;
  time: string;
  className: string;
  subject: string;
  teacher: string;
  room: string;
  notes?: string;
  schoolName?: string;
}

export type StudentTaskCategory = 
  | 'Tugas Mandiri'
  | 'Remedial' 
  | 'Pengayaan' 
  | 'Proyek/Praktikum' 
  | 'Portofolio' 
  | 'Latihan Soal';

export interface StudentTaskGradeItem {
  studentId: string;
  score: number;
  status: 'Tuntas' | 'Belum Tuntas' | 'Belum Mengumpulkan';
  submittedDate?: string;
  notes?: string;
  feedback?: string;
}

export interface StudentTask {
  id: string;
  title: string;
  category: StudentTaskCategory;
  className: string;
  subjectId?: string;
  targetStudentId?: string; // 'SEMUA' or specific student ID
  targetStudentName?: string; // 'Seluruh Siswa Kelas' or specific student name
  dueDate: string;
  assignedDate: string;
  maxScore: number;
  status: 'Aktif' | 'Selesai' | 'Lewat Tenggat';
  description: string;
  submittedCount: number;
  totalStudents: number;
  instructions?: string;
  evaluationType?: 'Nilai' | 'Centang';
  keterangan?: 'Nilai' | 'Centang' | string;
  grades?: Record<string, StudentTaskGradeItem>;
  schoolName?: string;
}

export interface UserAccount {
  uid: string;
  email: string;
  name: string;
  schoolName: string;
  role: string;
  avatarUrl?: string;
  profileId?: string;
  password?: string;
  nip?: string;
  phone?: string;
  birthPlace?: string;
  birthDate?: string;
  gender?: 'Laki-laki' | 'Perempuan' | string;
  ktpFile?: string;
  selfieFile?: string;
  registeredAt?: string;
  isMaintenance?: boolean;
  status?: 'Aktif' | 'Nonaktif' | 'Maintenance' | 'Menunggu Aktivasi';
}

export interface InfoAnnouncementItem {
  id: string;
  text: string;
  category?: 'Informasi' | 'Penting' | 'Pengumuman' | 'Fitur Baru';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface InfoAnnouncement {
  text?: string;
  category?: 'Informasi' | 'Penting' | 'Pengumuman' | 'Fitur Baru';
  isActive?: boolean;
  items?: InfoAnnouncementItem[];
  updatedAt?: string;
  updatedBy?: string;
}

export function getAnnouncementItems(announcement?: InfoAnnouncement): InfoAnnouncementItem[] {
  if (!announcement) return [];
  if (announcement.items && announcement.items.length > 0) {
    return announcement.items;
  }
  if (announcement.text) {
    return [
      {
        id: 'default-1',
        text: announcement.text,
        category: announcement.category || 'Informasi',
        isActive: announcement.isActive ?? true,
        updatedAt: announcement.updatedAt,
        updatedBy: announcement.updatedBy
      }
    ];
  }
  return [];
}

export type ModuleCategory = 
  | 'Modul Ajar (RPP Merdeka)' 
  | 'Alur Tujuan Pembelajaran (ATP)' 
  | 'Capaian Pembelajaran (CP)' 
  | 'Program Tahunan (Prota)' 
  | 'Program Semester (Promes)' 
  | 'Kriteria Ketercapaian TP (KKTP)' 
  | 'Lembar Kerja Siswa (LKPD)' 
  | 'Kisi-Kisi / Bank Soal';

export interface TeacherModuleDocument {
  id: string;
  title: string;
  category: ModuleCategory;
  subject: string;
  fase: string;
  className: string;
  semester: 'Ganjil' | 'Genap' | 'Semua Semester';
  academicYear: string;
  teacherName: string;
  teacherNip?: string;
  fileName: string;
  fileSize?: string;
  fileType?: string;
  fileUrl?: string;
  uploadedAt: string;
  status: 'Disetujui' | 'Meninjau' | 'Perlu Revisi';
  verificationNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  schoolName?: string;
}

export type LoginThemePreset = 
  | 'tech-blue' 
  | 'royal-amber' 
  | 'emerald-green' 
  | 'midnight-dark' 
  | 'crimson-maroon' 
  | 'ocean-cyan' 
  | 'purple-galaxy' 
  | 'custom-gradient' 
  | 'custom-image';

export interface LoginBackgroundConfig {
  themePreset: LoginThemePreset;
  primaryColor?: string; // hex from
  secondaryColor?: string; // hex via
  tertiaryColor?: string; // hex to
  gradientDirection?: 'to-br' | 'to-r' | 'to-b' | 'to-tr' | 'radial';
  imageUrl?: string;
  imageChunks?: string[];
  imageFit?: 'cover' | 'contain' | 'repeat' | 'fit-width' | 'fit-height' | 'scale';
  imageScale?: number; // 20 to 200 (%) default 100
  imagePosition?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'center top' | 'center bottom';
  imageOpacity?: number; // 0 to 100
  backgroundScrollMode?: 'scroll' | 'fixed'; // default 'scroll' so background scrolls with page
  overlayDarkness?: number; // 0 to 100
  overlayBlur?: number; // 0 to 20 px
  showTechGrid?: boolean;
  showPixelMosaic?: boolean;
  showFloatingTiles?: boolean;
  gridLineOpacity?: number; // 0 to 100
  headerGradient?: 'default' | 'match-theme' | 'glass-dark' | 'solid-dark';
  updatedAt?: string;
  updatedBy?: string;
}

export const defaultLoginBackgroundConfig: LoginBackgroundConfig = {
  themePreset: 'tech-blue',
  primaryColor: '#18568c',
  secondaryColor: '#2372ab',
  tertiaryColor: '#114371',
  gradientDirection: 'radial',
  imageUrl: '/login_background.svg',
  imageFit: 'cover',
  imageScale: 100,
  imagePosition: 'center',
  imageOpacity: 100,
  backgroundScrollMode: 'fixed',
  overlayDarkness: 0,
  overlayBlur: 0,
  showTechGrid: false,
  showPixelMosaic: false,
  showFloatingTiles: false,
  gridLineOpacity: 10,
  headerGradient: 'default'
};


