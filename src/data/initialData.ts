import { Student, Subject, StudentGrade, AttendanceRecord, TeacherProfile, SchoolAnnouncement, TeachingLog, StudentTask, WeeklyClassScheduleItem} from '../types';

export const initialTeacherProfile: TeacherProfile = {
  id: "PROF-ADMIN",
  name: "Shahrur Robby, S.Pd.",
  title: "Admin Utama / Guru",
  nip: "19900101 201501 1 001",
  npsn: "20500000",
  schoolName: "SMA Negeri 1 Indonesia - Sekolah Penggerak",
  guardianClass: "X-IPA 1",
  subjectRole: "Biologi",
  academicYear: "2026/2027",
  semester: "Ganjil",
  kkm: 75,
  principalName: "Dr. Hj. Sri Wahyuni, M.Si.",
  principalNip: "19691120 199403 2 003",
  city: "Indonesia",
};

export const initialTeacherProfiles: TeacherProfile[] = [
  initialTeacherProfile
];

export const school2Students: Student[] = [
  { id: "STD-SUR-01", nis: "25261001", nisn: "0081234501", name: "Aditya Pratama Putra", gender: "L", className: "X-1", parentName: "Budi Santoso", parentPhone: "081333444001", status: "Aktif", schoolName: "SMA Negeri 2 Surabaya"},
  { id: "STD-SUR-02", nis: "25261002", nisn: "0081234502", name: "Aisyah Nur Salsabila", gender: "P", className: "X-1", parentName: "Ahmad Fauzi", parentPhone: "081333444002", status: "Aktif", schoolName: "SMA Negeri 2 Surabaya"},
  { id: "STD-SUR-03", nis: "25261003", nisn: "0081234503", name: "Bayu Perkasa", gender: "L", className: "X-1", parentName: "Hendra Perkasa", parentPhone: "081333444003", status: "Aktif", schoolName: "SMA Negeri 2 Surabaya"},
  { id: "STD-SUR-04", nis: "25261004", nisn: "0081234504", name: "Diah Ayu Permata", gender: "P", className: "X-1", parentName: "Suryadi Ayu", parentPhone: "081333444004", status: "Aktif", schoolName: "SMA Negeri 2 Surabaya"},
  { id: "STD-SUR-05", nis: "25261005", nisn: "0081234505", name: "Eko Febrianto", gender: "L", className: "X-1", parentName: "Sugeng Febrianto", parentPhone: "081333444005", status: "Aktif", schoolName: "SMA Negeri 2 Surabaya"},
];

export const school3Students: Student[] = [
  { id: "STD-JKT-01", nis: "26271001", nisn: "0091122301", name: "Andhika Wijaya", gender: "L", className: "XI-A", parentName: "Wijaya Kusuma", parentPhone: "081211112201", status: "Aktif", schoolName: "SMA Muhammadiyah 1 Jakarta"},
  { id: "STD-JKT-02", nis: "26271002", nisn: "0091122302", name: "Bella Syifa Anggraini", gender: "P", className: "XI-A", parentName: "Kharisma Anggraini", parentPhone: "081211112202", status: "Aktif", schoolName: "SMA Muhammadiyah 1 Jakarta"},
  { id: "STD-JKT-03", nis: "26271003", nisn: "0091122303", name: "Candra Kirana", gender: "L", className: "XI-A", parentName: "Teguh Kirana", parentPhone: "081211112203", status: "Aktif", schoolName: "SMA Muhammadiyah 1 Jakarta"},
  { id: "STD-JKT-04", nis: "26271004", nisn: "0091122304", name: "Devi Mariska", gender: "P", className: "XI-A", parentName: "Agus Mariska", parentPhone: "081211112204", status: "Aktif", schoolName: "SMA Muhammadiyah 1 Jakarta"},
];

export const initialSubjects: Subject[] = [
  { id: "SUB-BIO", code: "BIO-10", name: "Biologi", kktp: 75, category: "Wajib"},
];

export const initialStudents: Student[] = [
  { id: "STD-001", nis: "24251001", nisn: "0071829301", name: "Ahmad Rizky Pratama", gender: "L", className: "X-IPA 2", parentName: "H. Pratama Widodo", parentPhone: "081234567801", status: "Aktif", schoolName: "SMA Negeri 1 Indonesia - Sekolah Penggerak"},
  { id: "STD-002", nis: "24251002", nisn: "0071829302", name: "Anisa Rahmawati", gender: "P", className: "X-IPA 2", parentName: "Bambang Rahmadi", parentPhone: "081234567802", status: "Aktif", schoolName: "SMA Negeri 1 Indonesia - Sekolah Penggerak"},
  { id: "STD-003", nis: "24251003", nisn: "0071829303", name: "Bagas Adi Putra", gender: "L", className: "X-IPA 2", parentName: "Hendra Putra", parentPhone: "081234567803", status: "Aktif", schoolName: "SMA Negeri 1 Indonesia - Sekolah Penggerak"},
  { id: "STD-004", nis: "24251004", nisn: "0071829304", name: "Citra Dewi Lestari", gender: "P", className: "X-IPA 2", parentName: "Darmawan Lestari", parentPhone: "081234567804", status: "Aktif", schoolName: "SMA Negeri 1 Indonesia - Sekolah Penggerak"},
  { id: "STD-005", nis: "24251005", nisn: "0071829305", name: "Daffa Arya Perdana", gender: "L", className: "X-IPA 2", parentName: "Supriyanto", parentPhone: "081234567805", status: "Aktif", schoolName: "SMA Negeri 1 Indonesia - Sekolah Penggerak"},
  { id: "STD-006", nis: "24251006", nisn: "0071829306", name: "Elvira Anggraini", gender: "P", className: "X-IPA 2", parentName: "Tri Kusuma", parentPhone: "081234567806", status: "Aktif", schoolName: "SMA Negeri 1 Indonesia - Sekolah Penggerak"},
  { id: "STD-007", nis: "24251007", nisn: "0071829307", name: "Farhan Fadhilah", gender: "L", className: "X-IPA 2", parentName: "Ahmad Fadhil", parentPhone: "081234567807", status: "Aktif", schoolName: "SMA Negeri 1 Indonesia - Sekolah Penggerak"},
  { id: "STD-008", nis: "24251008", nisn: "0071829308", name: "Gitadiva Maharani", gender: "P", className: "X-IPA 2", parentName: "Surya Maharani", parentPhone: "081234567808", status: "Aktif", schoolName: "SMA Negeri 1 Indonesia - Sekolah Penggerak"},
  { id: "STD-009", nis: "24251009", nisn: "0071829309", name: "Hafiz Naufal Rabbani", gender: "L", className: "X-IPA 2", parentName: "Rudi Hartono", parentPhone: "081234567809", status: "Aktif", schoolName: "SMA Negeri 1 Indonesia - Sekolah Penggerak"},
  { id: "STD-010", nis: "24251010", nisn: "0071829310", name: "Indah Permata Sari", gender: "P", className: "X-IPA 2", parentName: "Agus Susilo", parentPhone: "081234567810", status: "Aktif", schoolName: "SMA Negeri 1 Indonesia - Sekolah Penggerak"},
  { id: "STD-011", nis: "24251011", nisn: "0071829311", name: "Kevin Sanjaya", gender: "L", className: "X-IPA 2", parentName: "Riyadi Sanjaya", parentPhone: "081234567811", status: "Aktif", schoolName: "SMA Negeri 1 Indonesia - Sekolah Penggerak"},
  { id: "STD-012", nis: "24251012", nisn: "0071829312", name: "Larasati Putri Utami", gender: "P", className: "X-IPA 2", parentName: "Budi Utami", parentPhone: "081234567812", status: "Aktif", schoolName: "SMA Negeri 1 Indonesia - Sekolah Penggerak"},
  { id: "STD-013", nis: "24251013", nisn: "0071829313", name: "Muhammad Wildan", gender: "L", className: "X-IPA 2", parentName: "Syamsul Bahri", parentPhone: "081234567813", status: "Aktif", schoolName: "SMA Negeri 1 Indonesia - Sekolah Penggerak"},
  { id: "STD-014", nis: "24251014", nisn: "0071829314", name: "Nabila Aulia Zahrani", gender: "P", className: "X-IPA 2", parentName: "Zahrani Syarif", parentPhone: "081234567814", status: "Aktif", schoolName: "SMA Negeri 1 Indonesia - Sekolah Penggerak"},
  { id: "STD-015", nis: "24251015", nisn: "0071829315", name: "Rizky Ramadhan", gender: "L", className: "X-IPA 2", parentName: "Teguh Ramadhan", parentPhone: "081234567815", status: "Aktif", schoolName: "SMA Negeri 1 Indonesia - Sekolah Penggerak"},
  { id: "STD-016", nis: "24251016", nisn: "0071829316", name: "Zahra Salsabila", gender: "P", className: "X-IPA 2", parentName: "Munawar Kholil", parentPhone: "081234567816", status: "Aktif", schoolName: "SMA Negeri 1 Indonesia - Sekolah Penggerak"},
];

export const allDefaultStudents: Student[] = [
  ...initialStudents,
  ...school2Students,
  ...school3Students
];
export const calculateFinalScore = (tp1: number, tp2: number, tp3: number, tp4: number, pts: number, pas: number): { score: number; predicate: 'A' | 'B' | 'C' | 'D'} => {
  const formatifAvg = (tp1 + tp2 + tp3 + tp4) / 4;
  const score = Math.round((formatifAvg * 0.4) + (pts * 0.3) + (pas * 0.3));
  let predicate: 'A' | 'B' | 'C' | 'D' = 'C';
  if (score >= 90) predicate = 'A';
  else if (score >= 80) predicate = 'B';
  else if (score >= 70) predicate = 'C';
  else predicate = 'D';

  return { score, predicate};
};

export const initialGrades: StudentGrade[] = [
  { studentId: "STD-001", subjectId: "SUB-BIO", tp1: 0, tp2: 0, tp3: 0, tp4: 0, pts: 0, pas: 0, finalScore: 0, predicate: 'D', achievementDescription: "Belum ada deskripsi capaian."},
  { studentId: "STD-002", subjectId: "SUB-BIO", tp1: 0, tp2: 0, tp3: 0, tp4: 0, pts: 0, pas: 0, finalScore: 0, predicate: 'D', achievementDescription: "Belum ada deskripsi capaian."},
  { studentId: "STD-003", subjectId: "SUB-BIO", tp1: 0, tp2: 0, tp3: 0, tp4: 0, pts: 0, pas: 0, finalScore: 0, predicate: 'D', achievementDescription: "Belum ada deskripsi capaian."},
  { studentId: "STD-004", subjectId: "SUB-BIO", tp1: 0, tp2: 0, tp3: 0, tp4: 0, pts: 0, pas: 0, finalScore: 0, predicate: 'D', achievementDescription: "Belum ada deskripsi capaian."},
  { studentId: "STD-005", subjectId: "SUB-BIO", tp1: 0, tp2: 0, tp3: 0, tp4: 0, pts: 0, pas: 0, finalScore: 0, predicate: 'D', achievementDescription: "Belum ada deskripsi capaian."},
  { studentId: "STD-006", subjectId: "SUB-BIO", tp1: 0, tp2: 0, tp3: 0, tp4: 0, pts: 0, pas: 0, finalScore: 0, predicate: 'D', achievementDescription: "Belum ada deskripsi capaian."},
  { studentId: "STD-007", subjectId: "SUB-BIO", tp1: 0, tp2: 0, tp3: 0, tp4: 0, pts: 0, pas: 0, finalScore: 0, predicate: 'D', achievementDescription: "Belum ada deskripsi capaian."},
  { studentId: "STD-008", subjectId: "SUB-BIO", tp1: 0, tp2: 0, tp3: 0, tp4: 0, pts: 0, pas: 0, finalScore: 0, predicate: 'D', achievementDescription: "Belum ada deskripsi capaian."},
  { studentId: "STD-009", subjectId: "SUB-BIO", tp1: 0, tp2: 0, tp3: 0, tp4: 0, pts: 0, pas: 0, finalScore: 0, predicate: 'D', achievementDescription: "Belum ada deskripsi capaian."},
  { studentId: "STD-010", subjectId: "SUB-BIO", tp1: 0, tp2: 0, tp3: 0, tp4: 0, pts: 0, pas: 0, finalScore: 0, predicate: 'D', achievementDescription: "Belum ada deskripsi capaian."},
  { studentId: "STD-011", subjectId: "SUB-BIO", tp1: 0, tp2: 0, tp3: 0, tp4: 0, pts: 0, pas: 0, finalScore: 0, predicate: 'D', achievementDescription: "Belum ada deskripsi capaian."},
  { studentId: "STD-012", subjectId: "SUB-BIO", tp1: 0, tp2: 0, tp3: 0, tp4: 0, pts: 0, pas: 0, finalScore: 0, predicate: 'D', achievementDescription: "Belum ada deskripsi capaian."},
  { studentId: "STD-013", subjectId: "SUB-BIO", tp1: 0, tp2: 0, tp3: 0, tp4: 0, pts: 0, pas: 0, finalScore: 0, predicate: 'D', achievementDescription: "Belum ada deskripsi capaian."},
  { studentId: "STD-014", subjectId: "SUB-BIO", tp1: 0, tp2: 0, tp3: 0, tp4: 0, pts: 0, pas: 0, finalScore: 0, predicate: 'D', achievementDescription: "Belum ada deskripsi capaian."},
  { studentId: "STD-015", subjectId: "SUB-BIO", tp1: 0, tp2: 0, tp3: 0, tp4: 0, pts: 0, pas: 0, finalScore: 0, predicate: 'D', achievementDescription: "Belum ada deskripsi capaian."},
  { studentId: "STD-016", subjectId: "SUB-BIO", tp1: 0, tp2: 0, tp3: 0, tp4: 0, pts: 0, pas: 0, finalScore: 0, predicate: 'D', achievementDescription: "Belum ada deskripsi capaian."}
];

export const getTodayDateString = (): string => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

export const initialAttendanceRecords: AttendanceRecord[] = [
  // Pertemuan 2 (Today / 2026-08-18) - SMA 1 (X-IPA 2)
  { id: "ATT-101", studentId: "STD-001", date: getTodayDateString(), status: "HADIR", meetingNo: 2, recordedAt: "07:15:00"},
  { id: "ATT-102", studentId: "STD-002", date: getTodayDateString(), status: "HADIR", meetingNo: 2, recordedAt: "07:12:30"},
  { id: "ATT-103", studentId: "STD-003", date: getTodayDateString(), status: "IZIN", note: "Acara Keluarga", meetingNo: 2, recordedAt: "07:30:00"},
  { id: "ATT-104", studentId: "STD-004", date: getTodayDateString(), status: "HADIR", meetingNo: 2, recordedAt: "07:05:12"},
  { id: "ATT-105", studentId: "STD-005", date: getTodayDateString(), status: "SAKIT", note: "Surat Dokter Flu & Demam", meetingNo: 2, recordedAt: "07:45:00"},
  { id: "ATT-106", studentId: "STD-006", date: getTodayDateString(), status: "HADIR", meetingNo: 2, recordedAt: "07:10:00"},
  { id: "ATT-107", studentId: "STD-007", date: getTodayDateString(), status: "HADIR", meetingNo: 2, recordedAt: "07:18:22"},
  { id: "ATT-108", studentId: "STD-008", date: getTodayDateString(), status: "HADIR", meetingNo: 2, recordedAt: "07:08:15"},
  { id: "ATT-109", studentId: "STD-009", date: getTodayDateString(), status: "ALPA", note: "Tanpa Keterangan", meetingNo: 2, recordedAt: "08:00:00"},
  { id: "ATT-110", studentId: "STD-010", date: getTodayDateString(), status: "HADIR", meetingNo: 2, recordedAt: "07:14:00"},
  { id: "ATT-111", studentId: "STD-011", date: getTodayDateString(), status: "HADIR", meetingNo: 2, recordedAt: "07:20:10"},
  { id: "ATT-112", studentId: "STD-012", date: getTodayDateString(), status: "HADIR", meetingNo: 2, recordedAt: "07:02:45"},
  { id: "ATT-113", studentId: "STD-013", date: getTodayDateString(), status: "HADIR", meetingNo: 2, recordedAt: "07:11:00"},
  { id: "ATT-114", studentId: "STD-014", date: getTodayDateString(), status: "HADIR", meetingNo: 2, recordedAt: "07:09:50"},
  { id: "ATT-115", studentId: "STD-015", date: getTodayDateString(), status: "HADIR", meetingNo: 2, recordedAt: "07:16:40"},
  { id: "ATT-116", studentId: "STD-016", date: getTodayDateString(), status: "HADIR", meetingNo: 2, recordedAt: "07:04:10"},

  // Pertemuan 2 (Today) - Surabaya - X-1
  { id: "ATT-SUR-101", studentId: "STD-SUR-01", date: getTodayDateString(), status: "HADIR", meetingNo: 2, recordedAt: "07:10:00"},
  { id: "ATT-SUR-102", studentId: "STD-SUR-02", date: getTodayDateString(), status: "HADIR", meetingNo: 2, recordedAt: "07:12:00"},
  { id: "ATT-SUR-103", studentId: "STD-SUR-03", date: getTodayDateString(), status: "HADIR", meetingNo: 2, recordedAt: "07:08:00"},
  { id: "ATT-SUR-104", studentId: "STD-SUR-04", date: getTodayDateString(), status: "IZIN", note: "Lomba Olimpiade Fisika", meetingNo: 2, recordedAt: "07:25:00"},
  { id: "ATT-SUR-105", studentId: "STD-SUR-05", date: getTodayDateString(), status: "HADIR", meetingNo: 2, recordedAt: "07:14:00"},

  // Pertemuan 1 (Today) - Jakarta - XI-A
  { id: "ATT-JKT-101", studentId: "STD-JKT-01", date: getTodayDateString(), status: "HADIR", meetingNo: 1, recordedAt: "07:00:00"},
  { id: "ATT-JKT-102", studentId: "STD-JKT-02", date: getTodayDateString(), status: "HADIR", meetingNo: 1, recordedAt: "07:05:00"},
  { id: "ATT-JKT-103", studentId: "STD-JKT-03", date: getTodayDateString(), status: "SAKIT", note: "Pusing Demam", meetingNo: 1, recordedAt: "07:30:00"},
  { id: "ATT-JKT-104", studentId: "STD-JKT-04", date: getTodayDateString(), status: "HADIR", meetingNo: 1, recordedAt: "07:10:00"},

  // Pertemuan 1 (2026-08-01) - SMA 1 & Surabaya
  { id: "ATT-401", studentId: "STD-001", date: "2026-08-01", status: "HADIR", meetingNo: 1, recordedAt: "07:10:00"},
  { id: "ATT-402", studentId: "STD-002", date: "2026-08-01", status: "IZIN", note: "Pernikahan Saudara", meetingNo: 1, recordedAt: "07:30:00"},
  { id: "ATT-403", studentId: "STD-003", date: "2026-08-01", status: "HADIR", meetingNo: 1, recordedAt: "07:12:00"},
  { id: "ATT-404", studentId: "STD-004", date: "2026-08-01", status: "HADIR", meetingNo: 1, recordedAt: "07:09:00"},
  { id: "ATT-405", studentId: "STD-005", date: "2026-08-01", status: "HADIR", meetingNo: 1, recordedAt: "07:15:00"},
  { id: "ATT-SUR-301", studentId: "STD-SUR-01", date: "2026-08-01", status: "HADIR", meetingNo: 1, recordedAt: "07:10:00"},
  { id: "ATT-SUR-302", studentId: "STD-SUR-02", date: "2026-08-01", status: "HADIR", meetingNo: 1, recordedAt: "07:12:00"},
  { id: "ATT-SUR-303", studentId: "STD-SUR-03", date: "2026-08-01", status: "HADIR", meetingNo: 1, recordedAt: "07:14:00"},
  { id: "ATT-SUR-304", studentId: "STD-SUR-04", date: "2026-08-01", status: "HADIR", meetingNo: 1, recordedAt: "07:08:00"},
  { id: "ATT-SUR-305", studentId: "STD-SUR-05", date: "2026-08-01", status: "SAKIT", note: "Demam", meetingNo: 1, recordedAt: "07:50:00"}
];

export const initialAnnouncements: SchoolAnnouncement[] = [
  {
    id: "ANC-001",
    title: "Surat Edaran Kemendikbudristek: Pelaksanaan Asesmen Nasional (ANBK) 2025/2026",
    category: "Kedinasan",
    date: "2026-07-28",
    author: "Tim Kurikulum SMAN 1",
    content: "Diberitahukan kepada seluruh Guru Wali Kelas X dan XI untuk melakukan validasi data presensi dan nilai formatif persiapan simulasi ANBK.",
    isImportant: true
},
  {
    id: "ANC-002",
    title: "Batas Akhir Input Nilai PTS Semester Ganjil",
    category: "Akademik",
    date: "2026-07-30",
    author: "Wakil Kepala Sekolah Bidang Kurikulum",
    content: "Penginputan Nilai PTS dan Deskripsi Capaian Pembelajaran Kurikulum Merdeka di SIMAK Guru wajib diselesaikan paling lambat Jumat ini.",
    isImportant: true
},
  {
    id: "ANC-003",
    title: "Pelatihan Mandiri Pembelajaran Diferensiasi & P5 Biologi",
    category: "Kurikulum",
    date: "2026-07-25",
    author: "Pengawas Pembina Cabang Dinas",
    content: "Materi modul ajar terbaru untuk Projek Penguatan Profil Pelajar Pancasila (P5) tema Biologi Lingkungan telah diunggah di platform SIMAK.",
    isImportant: false
}
];

export const initialTeachingLogs: TeachingLog[] = [
  {
    id: "LOG-01",
    date: getTodayDateString(),
    className: "X-IPA 2",
    subjectId: "SUB-BIO",
    classPeriod: "Jam Ke 1-3 (07.00 - 09.15)",
    learningObjective: "Menganalisis keanekaragaman hayati (gen, jenis, ekosistem) di Indonesia beserta upaya pelestariannya.",
    summaryMaterial: "Diskusi kelompok dan praktikum mikroskop pengamatan preparat jaringan tumbuhan dan hewan.",
    presentCount: 14,
    absentCount: 2,
    notes: "Siswa sangat antusias saat pengamatan mikroskopis. Perlu bimbingan penggunaan lensa okuler."
},
  {
    id: "LOG-02",
    date: "2026-07-31",
    className: "XI-IPA 1",
    subjectId: "SUB-BIO",
    classPeriod: "Jam Ke 4-5 (09.30 - 11.00)",
    learningObjective: "Menjelaskan komponen ekosistem dan mengaitkannya dengan interaksi rantai makanan.",
    summaryMaterial: "Pengamatan ekosistem kebun sekolah dan analisis daur biogeokimia.",
    presentCount: 16,
    absentCount: 0,
    notes: "Seluruh siswa hadir tepat waktu. Hasil post-test menunjukkan rata-rata 86.5."
}
];

export const initialStudentTasks: StudentTask[] = [
  {
    id: "TSK-001",
    title: "Remedial Bab 2: Struktur & Fungsi Sel",
    category: "Remedial",
    className: "X-IPA 2",
    subjectId: "SUB-BIO",
    targetStudentId: "SEMUA",
    targetStudentName: "Siswa Nilai < KKTP",
    dueDate: "2026-08-10",
    assignedDate: "2026-08-01",
    maxScore: 100,
    status: "Aktif",
    description: "Pembuatan peta konsep organel sel tumbuhan dan hewan disertai analisis fungsi masing-masing.",
    submittedCount: 14,
    totalStudents: 16,
    instructions: "Kerjakan di kertas folio bergaris atau format digital PDF. Kumpulkan via portal e-learning/guru.",
    grades: {
      "STD-001": { studentId: "STD-001", score: 85, status: "Tuntas", submittedDate: "2026-08-05", feedback: "Peta konsep lengkap dan sangat jelas." },
      "STD-002": { studentId: "STD-002", score: 90, status: "Tuntas", submittedDate: "2026-08-04", feedback: "Analisis fungsi organel sangat rinci." },
      "STD-003": { studentId: "STD-003", score: 78, status: "Tuntas", submittedDate: "2026-08-06", feedback: "Cukup baik, tingkatkan pemahaman sel hewan." },
      "STD-004": { studentId: "STD-004", score: 88, status: "Tuntas", submittedDate: "2026-08-05", feedback: "Kerapian dan visualisasi sangat baik." },
      "STD-005": { studentId: "STD-005", score: 82, status: "Tuntas", submittedDate: "2026-08-07", feedback: "Bagus, sesuai instruksi perbaikan." },
      "STD-006": { studentId: "STD-006", score: 92, status: "Tuntas", submittedDate: "2026-08-04", feedback: "Sangat memuaskan." },
      "STD-007": { studentId: "STD-007", score: 76, status: "Tuntas", submittedDate: "2026-08-08", feedback: "Tuntas batas KKTP, perbanyak latihan." },
      "STD-008": { studentId: "STD-008", score: 85, status: "Tuntas", submittedDate: "2026-08-05", feedback: "Paham dengan baik." },
      "STD-009": { studentId: "STD-009", score: 80, status: "Tuntas", submittedDate: "2026-08-06", feedback: "Tuntas remedial." },
      "STD-010": { studentId: "STD-010", score: 90, status: "Tuntas", submittedDate: "2026-08-04", feedback: "Hasil tugas remedial sangat baik." },
      "STD-011": { studentId: "STD-011", score: 75, status: "Tuntas", submittedDate: "2026-08-09", feedback: "Tuntas pas KKTP." },
      "STD-012": { studentId: "STD-012", score: 86, status: "Tuntas", submittedDate: "2026-08-06", feedback: "Struktur sel digambar rapi." },
      "STD-013": { studentId: "STD-013", score: 84, status: "Tuntas", submittedDate: "2026-08-07", feedback: "Bagus." },
      "STD-014": { studentId: "STD-014", score: 88, status: "Tuntas", submittedDate: "2026-08-05", feedback: "Sangat baik." },
      "STD-015": { studentId: "STD-015", score: 0, status: "Belum Mengumpulkan", submittedDate: "", feedback: "Belum menyerahkan tugas remedial." },
      "STD-016": { studentId: "STD-016", score: 0, status: "Belum Mengumpulkan", submittedDate: "", feedback: "Belum menyerahkan tugas remedial." }
    }
  },
  {
    id: "TSK-002",
    title: "Proyek Pembuatan Laporan Herbarium Basah & Kering",
    category: "Proyek/Praktikum",
    className: "X-IPA 2",
    subjectId: "SUB-BIO",
    targetStudentId: "SEMUA",
    targetStudentName: "Seluruh Siswa Kelas X-IPA 2",
    dueDate: "2026-08-20",
    assignedDate: "2026-08-02",
    maxScore: 100,
    status: "Aktif",
    description: "Tugas kelompok koleksi spesimen tumbuhan sekitar lingkungan sekolah dan analisis taksonomi.",
    submittedCount: 16,
    totalStudents: 16,
    instructions: "Sertakan label klasifikasi kingdom s/d spesies, lokasi pengambilan, dan nama pengumpul.",
    grades: {
      "STD-001": { studentId: "STD-001", score: 90, status: "Tuntas", submittedDate: "2026-08-12", feedback: "Koleksi spesimen pteridophyta sangat lengkap." },
      "STD-002": { studentId: "STD-002", score: 94, status: "Tuntas", submittedDate: "2026-08-11", feedback: "Herbarium kering terawat dan tata letak rapi." },
      "STD-003": { studentId: "STD-003", score: 85, status: "Tuntas", submittedDate: "2026-08-14", feedback: "Laporan klasifikasi sistematis." },
      "STD-004": { studentId: "STD-004", score: 92, status: "Tuntas", submittedDate: "2026-08-12", feedback: "Analisis taksonomi akurat." },
      "STD-005": { studentId: "STD-005", score: 86, status: "Tuntas", submittedDate: "2026-08-15", feedback: "Baik dan lengkap." },
      "STD-006": { studentId: "STD-006", score: 95, status: "Tuntas", submittedDate: "2026-08-10", feedback: "Karya herbarium luar biasa, layak pameran." },
      "STD-007": { studentId: "STD-007", score: 80, status: "Tuntas", submittedDate: "2026-08-16", feedback: "Cukup baik." },
      "STD-008": { studentId: "STD-008", score: 90, status: "Tuntas", submittedDate: "2026-08-12", feedback: "Preservasi spesimen bagus." },
      "STD-009": { studentId: "STD-009", score: 84, status: "Tuntas", submittedDate: "2026-08-14", feedback: "Deskripsi morfologi jelas." },
      "STD-010": { studentId: "STD-010", score: 92, status: "Tuntas", submittedDate: "2026-08-12", feedback: "Sangat baik." },
      "STD-011": { studentId: "STD-011", score: 82, status: "Tuntas", submittedDate: "2026-08-15", feedback: "Bagus." },
      "STD-012": { studentId: "STD-012", score: 88, status: "Tuntas", submittedDate: "2026-08-13", feedback: "Laporan rapi." },
      "STD-013": { studentId: "STD-013", score: 86, status: "Tuntas", submittedDate: "2026-08-14", feedback: "Lengkap." },
      "STD-014": { studentId: "STD-014", score: 91, status: "Tuntas", submittedDate: "2026-08-11", feedback: "Sangat teliti." },
      "STD-015": { studentId: "STD-015", score: 83, status: "Tuntas", submittedDate: "2026-08-15", feedback: "Koleksi spesimen cukup." },
      "STD-016": { studentId: "STD-016", score: 89, status: "Tuntas", submittedDate: "2026-08-13", feedback: "Bagus sekali." }
    }
  },
  {
    id: "TSK-003",
    title: "Pengayaan: Analisis Bioteknologi Modern Dalam Farmasi",
    category: "Pengayaan",
    className: "X-IPA 2",
    subjectId: "SUB-BIO",
    targetStudentId: "SEMUA",
    targetStudentName: "Siswa Pengayaan (> 85)",
    dueDate: "2026-08-15",
    assignedDate: "2026-08-03",
    maxScore: 100,
    status: "Aktif",
    description: "Kajian artikel ilmiah mengenai teknik pCR dan rekayasa genetika insulin sintetis.",
    submittedCount: 6,
    totalStudents: 16,
    instructions: "Buat ringkasan 2 halaman A4 dengan menyertakan referensi jurnal ilmiah terpercaya.",
    grades: {
      "STD-002": { studentId: "STD-002", score: 96, status: "Tuntas", submittedDate: "2026-08-10", feedback: "Analisis jurnal sangat mendalam dan kritis." },
      "STD-004": { studentId: "STD-004", score: 92, status: "Tuntas", submittedDate: "2026-08-11", feedback: "Ringkasan konsep plasmid dan ligasi sangat tepat." },
      "STD-006": { studentId: "STD-006", score: 98, status: "Tuntas", submittedDate: "2026-08-09", feedback: "Wawasan bioteknologi luar biasa." },
      "STD-008": { studentId: "STD-008", score: 90, status: "Tuntas", submittedDate: "2026-08-12", feedback: "Kajian literatur komprehensif." },
      "STD-010": { studentId: "STD-010", score: 93, status: "Tuntas", submittedDate: "2026-08-11", feedback: "Bagus dan terstruktur." },
      "STD-014": { studentId: "STD-014", score: 94, status: "Tuntas", submittedDate: "2026-08-10", feedback: "Penjelasan mekanisme CRISPR-Cas9 sangat baik." }
    }
  },
  {
    id: "TSK-004",
    title: "Latihan Soal Mandiri: Rantai Makanan & Jaring Ekosistem",
    category: "Latihan Soal",
    className: "XI-IPA 1",
    subjectId: "SUB-BIO",
    targetStudentId: "SEMUA",
    targetStudentName: "Seluruh Siswa Kelas XI-IPA 1",
    dueDate: "2026-08-08",
    assignedDate: "2026-08-01",
    maxScore: 100,
    status: "Aktif",
    description: "Pengerjaan 15 soal essay analisis perubahan populasi konsumen tingkat I dan II.",
    submittedCount: 14,
    totalStudents: 16,
    instructions: "Kerjakan secara mandiri di buku tugas Biologi masing-masing."
  }
];

export const initialSchedules = [
  { id: 'SCH-1', day: 'Senin', time: '07:30 - 09:00', className: 'X-IPA 2', sub: 'Biologi - Transpor Membran'},
  { id: 'SCH-2', day: 'Senin', time: '09:15 - 10:45', className: 'XI-IPA 1', sub: 'Biologi - Transpor Membran'},
  { id: 'SCH-3', day: 'Selasa', time: '08:00 - 09:30', className: 'XI-IPA 1', sub: 'Biologi - Sistem Pencernaan'},
  { id: 'SCH-4', day: 'Rabu', time: '10:00 - 11:30', className: 'X-IPA 2', sub: 'Biologi - Praktikum Enzim'},
  { id: 'SCH-5', day: 'Kamis', time: '07:30 - 09:00', className: 'XI-IPA 2', sub: 'Biologi - Praktikum Uji Makanan'},
  { id: 'SCH-6', day: 'Jumat', time: '08:00 - 09:30', className: 'X-IPA 2', sub: 'Biologi - Keanekaragaman Hayati'},
];

export const initialWeeklyClassSchedules: WeeklyClassScheduleItem[] = [
  // Kelas X-IPA 1
  { id: 'WSCH-01', day: 'Senin', time: '07.00 - 08.30', className: 'X-IPA 1', subject: 'Upacara Bendera & Pembiasaan Karakter', teacher: 'Tim Kesiswaan', room: 'Lapangan Utama' },
  { id: 'WSCH-02', day: 'Senin', time: '08.30 - 10.00', className: 'X-IPA 1', subject: 'Biologi - Struktur & Fungsi Sel', teacher: 'Shahrur Robby, S.Pd.', room: 'Lab Biologi' },
  { id: 'WSCH-03', day: 'Senin', time: '10.15 - 11.45', className: 'X-IPA 1', subject: 'Matematika - Persamaan Kuadrat & Fungsi', teacher: 'Dra. Endang Sulistyowati', room: 'R. X-IPA 1' },
  { id: 'WSCH-04', day: 'Selasa', time: '07.00 - 08.30', className: 'X-IPA 1', subject: 'Bahasa Indonesia - Teks LHO', teacher: 'Ahmad Fauzi, M.Pd.', room: 'R. X-IPA 1' },
  { id: 'WSCH-05', day: 'Selasa', time: '08.30 - 10.00', className: 'X-IPA 1', subject: 'Fisika - Pengukuran & Vektor', teacher: 'Ir. Hendra Gunawan', room: 'Lab Fisika' },
  { id: 'WSCH-06', day: 'Rabu', time: '07.00 - 09.15', className: 'X-IPA 1', subject: 'Biologi - Praktikum Enzim & Membran', teacher: 'Shahrur Robby, S.Pd.', room: 'Lab Biologi' },
  { id: 'WSCH-07', day: 'Rabu', time: '09.30 - 11.00', className: 'X-IPA 1', subject: 'Kimia - Struktur Atom & Tabel Periodik', teacher: 'Dr. Siti Nurhaliza', room: 'Lab Kimia' },
  { id: 'WSCH-08', day: 'Kamis', time: '07.00 - 08.30', className: 'X-IPA 1', subject: 'Pendidikan Pancasila - Norma & Konstitusi', teacher: 'Drs. Bambang Irawan', room: 'R. X-IPA 1' },
  { id: 'WSCH-09', day: 'Kamis', time: '08.30 - 10.00', className: 'X-IPA 1', subject: 'Bahasa Inggris - Narrative & Descriptive', teacher: 'Sarah Jessica, M.Ed.', room: 'R. X-IPA 1' },
  { id: 'WSCH-10', day: 'Jumat', time: '07.00 - 08.15', className: 'X-IPA 1', subject: 'Senam Pagi & Literasi / P5', teacher: 'Tim Pembina', room: 'Aula Sekolah' },
  { id: 'WSCH-11', day: 'Jumat', time: '08.15 - 09.45', className: 'X-IPA 1', subject: 'Pendidikan Agama & Budi Pekerti', teacher: 'Ust. H. Syahrul Munir, S.Ag.', room: 'Masjid Sekolah' },

  // Kelas X-IPA 2
  { id: 'WSCH-12', day: 'Senin', time: '07.00 - 08.30', className: 'X-IPA 2', subject: 'Upacara Bendera & Pembiasaan Karakter', teacher: 'Tim Kesiswaan', room: 'Lapangan Utama' },
  { id: 'WSCH-13', day: 'Senin', time: '08.30 - 10.00', className: 'X-IPA 2', subject: 'Matematika - Persamaan Kuadrat & Fungsi', teacher: 'Dra. Endang Sulistyowati', room: 'R. X-IPA 2' },
  { id: 'WSCH-14', day: 'Senin', time: '10.15 - 11.45', className: 'X-IPA 2', subject: 'Biologi - Transpor Membran', teacher: 'Shahrur Robby, S.Pd.', room: 'Lab Biologi' },
  { id: 'WSCH-15', day: 'Selasa', time: '07.00 - 08.30', className: 'X-IPA 2', subject: 'Kimia - Struktur Atom & Ikatan Kimia', teacher: 'Dr. Siti Nurhaliza', room: 'Lab Kimia' },
  { id: 'WSCH-16', day: 'Selasa', time: '08.30 - 10.00', className: 'X-IPA 2', subject: 'Bahasa Indonesia - Teks Eksposisi', teacher: 'Ahmad Fauzi, M.Pd.', room: 'R. X-IPA 2' },
  { id: 'WSCH-17', day: 'Rabu', time: '08.30 - 10.00', className: 'X-IPA 2', subject: 'Fisika - Besaran & Satuan', teacher: 'Ir. Hendra Gunawan', room: 'Lab Fisika' },
  { id: 'WSCH-18', day: 'Rabu', time: '10.15 - 11.45', className: 'X-IPA 2', subject: 'Biologi - Praktikum Enzim', teacher: 'Shahrur Robby, S.Pd.', room: 'Lab Biologi' },
  { id: 'WSCH-19', day: 'Kamis', time: '07.00 - 08.30', className: 'X-IPA 2', subject: 'Bahasa Inggris - Formal Letter & Discussion', teacher: 'Sarah Jessica, M.Ed.', room: 'R. X-IPA 2' },
  { id: 'WSCH-20', day: 'Kamis', time: '08.30 - 10.00', className: 'X-IPA 2', subject: 'Informatika - Berpikir Komputasional', teacher: 'Muhammad Rizki, S.Kom., M.T.', room: 'Lab Komputer' },
  { id: 'WSCH-21', day: 'Jumat', time: '07.00 - 08.15', className: 'X-IPA 2', subject: 'Senam Pagi & Literasi / P5', teacher: 'Tim Pembina', room: 'Aula Sekolah' },
  { id: 'WSCH-22', day: 'Jumat', time: '08.15 - 09.45', className: 'X-IPA 2', subject: 'Biologi - Keanekaragaman Hayati', teacher: 'Shahrur Robby, S.Pd.', room: 'Lab Biologi' },

  // Kelas XI-IPA 1
  { id: 'WSCH-23', day: 'Senin', time: '07.00 - 08.30', className: 'XI-IPA 1', subject: 'Upacara Bendera', teacher: 'Tim Kesiswaan', room: 'Lapangan Utama' },
  { id: 'WSCH-24', day: 'Senin', time: '09.15 - 10.45', className: 'XI-IPA 1', subject: 'Biologi - Transpor Membran Sel', teacher: 'Shahrur Robby, S.Pd.', room: 'Lab Biologi' },
  { id: 'WSCH-25', day: 'Selasa', time: '08.00 - 09.30', className: 'XI-IPA 1', subject: 'Biologi - Sistem Pencernaan Manusia', teacher: 'Shahrur Robby, S.Pd.', room: 'Lab Biologi' },
  { id: 'WSCH-26', day: 'Rabu', time: '07.00 - 08.30', className: 'XI-IPA 1', subject: 'Matematika Tingkat Lanjut', teacher: 'Dra. Endang Sulistyowati', room: 'R. XI-IPA 1' },
  // Kelas XI-IPA 1 & XI-IPA 2 (Jadwal Lanjutan)
  { id: 'WSCH-27', day: 'Kamis', time: '07.30 - 09.00', className: 'XI-IPA 1', subject: 'Fisika - Gelombang Mekanik', teacher: 'Ir. Hendra Gunawan', room: 'Lab Fisika' },
  { id: 'WSCH-28', day: 'Kamis', time: '10.15 - 11.45', className: 'XI-IPA 1', subject: 'Biologi - Sistem Pernapasan Manusia', teacher: 'Shahrur Robby, S.Pd.', room: 'Lab Biologi' },
  { id: 'WSCH-29', day: 'Kamis', time: '07.30 - 09.00', className: 'XI-IPA 2', subject: 'Biologi - Praktikum Uji Makanan', teacher: 'Shahrur Robby, S.Pd.', room: 'Lab Biologi' },
  { id: 'WSCH-30', day: 'Jumat', time: '08.15 - 09.45', className: 'XI-IPA 1', subject: 'Pendidikan Agama & Budi Pekerti', teacher: 'Ust. H. Syahrul Munir, S.Ag.', room: 'Masjid Sekolah' },
];

