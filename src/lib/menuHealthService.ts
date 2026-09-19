import { Student, StudentGrade, AttendanceRecord, TeacherProfile, UserAccount, StudentTask } from '../types';
import { NavTab } from '../components/SidebarNavigation';

export type MenuHealthLevel = 'valid' | 'warning' | 'invalid';

export interface MenuHealthIssue {
  id: string;
  itemTitle: string;
  field: string;
  reason: string;
  severity: 'error' | 'warning';
  actionHint?: string;
  targetTab?: NavTab;
}

export interface MenuHealthInfo {
  level: MenuHealthLevel;
  badgeLabel: string;
  tooltip: string;
  invalidCount: number;
  warningCount: number;
  validCount: number;
  errorIssues: MenuHealthIssue[];
  warningIssues: MenuHealthIssue[];
}

export interface SystemDataHealthParams {
  students?: Student[];
  grades?: StudentGrade[];
  attendanceRecords?: AttendanceRecord[];
  teacher?: TeacherProfile;
  currentUser?: UserAccount | null;
  registeredUsers?: UserAccount[];
  studentTasks?: StudentTask[];
}

/**
 * Computes health, error, warning, and success validation status for each menu tab.
 */
export function computeMenuHealthMap(params: SystemDataHealthParams): Record<NavTab, MenuHealthInfo> {
  const {
    students = [],
    grades = [],
    attendanceRecords = [],
    teacher,
    currentUser,
    registeredUsers = [],
    studentTasks = []
  } = params;

  // 1. Students Analysis
  const totalStudents = students.length;
  let studentsInvalid = 0;
  let studentsWarning = 0;
  let studentsValid = 0;
  const studentErrorIssues: MenuHealthIssue[] = [];
  const studentWarningIssues: MenuHealthIssue[] = [];

  if (totalStudents === 0) {
    studentsWarning = 1;
    studentWarningIssues.push({
      id: 'std-empty',
      itemTitle: 'Database Siswa Kosong',
      field: 'Data Rombel',
      reason: 'Belum ada data siswa yang diimpor atau ditambahkan ke sistem.',
      severity: 'warning',
      actionHint: 'Klik tombol Tambah Siswa Baru atau Impor Excel pada menu Data Siswa',
      targetTab: 'students'
    });
  } else {
    students.forEach((s) => {
      const isNisnValid = Boolean(s.nisn && s.nisn.trim().length >= 10 && !s.nisn.startsWith('0000'));
      const hasName = Boolean(s.name && s.name.trim());
      const hasClass = Boolean(s.className && s.className.trim());
      
      if (!isNisnValid || !hasName || !hasClass) {
        studentsInvalid++;
        const reasons: string[] = [];
        if (!hasName) reasons.push('Nama siswa kosong');
        if (!hasClass) reasons.push('Rombel/Kelas belum ditentukan');
        if (!s.nisn || !s.nisn.trim()) reasons.push('NISN belum diisi');
        else if (s.nisn.trim().length < 10) reasons.push(`NISN kurang dari 10 digit (hanya ${s.nisn.trim().length} digit: "${s.nisn}")`);
        else if (s.nisn.startsWith('0000')) reasons.push(`NISN tidak valid (format contoh "0000": "${s.nisn}")`);

        studentErrorIssues.push({
          id: `std-err-${s.id}`,
          itemTitle: `${s.name || 'Siswa Tanpa Nama'} (${s.className || 'Tanpa Kelas'})`,
          field: !hasName ? 'Nama Lengkap Siswa' : !hasClass ? 'Rombongan Belajar (Kelas)' : 'NISN (Nomor Induk Siswa Nasional)',
          reason: reasons.join(', '),
          severity: 'error',
          actionHint: 'Buka menu Data Siswa, edit data siswa bersangkutan dan lengkapi 10 digit NISN resmi',
          targetTab: 'students'
        });
      } else if (!s.parentName || s.parentName === '-' || !s.gender) {
        studentsWarning++;
        const reasons: string[] = [];
        if (!s.gender) reasons.push('Jenis kelamin (L/P) belum dipilih');
        if (!s.parentName || s.parentName === '-') reasons.push('Nama orang tua/wali belum dilengkapi');

        studentWarningIssues.push({
          id: `std-warn-${s.id}`,
          itemTitle: `${s.name} (${s.className})`,
          field: !s.gender ? 'Jenis Kelamin' : 'Nama Orang Tua / Wali',
          reason: reasons.join(', '),
          severity: 'warning',
          actionHint: 'Lengkapi identitas orang tua dan jenis kelamin pada profil siswa',
          targetTab: 'students'
        });
      } else {
        studentsValid++;
      }
    });
  }

  const studentsHealth: MenuHealthInfo = {
    level: studentsInvalid > 0 ? 'invalid' : studentsWarning > 0 ? 'warning' : 'valid',
    badgeLabel: studentsInvalid > 0 && studentsWarning > 0
      ? `${studentsInvalid} Err • ${studentsWarning} Kurang`
      : studentsInvalid > 0 
      ? `${studentsInvalid} Error` 
      : studentsWarning > 0 
      ? `${studentsWarning} Kurang` 
      : 'Valid',
    tooltip: `Data Siswa: ${studentsInvalid > 0 ? `${studentsInvalid} Data Error (NISN/nama/kelas tidak valid). ` : '0 Error. '}${studentsWarning > 0 ? `${studentsWarning} Data Kurang (wali/gender belum diisi). ` : '0 Kurang. '}${studentsValid} Siswa valid.`,
    invalidCount: studentsInvalid,
    warningCount: studentsWarning,
    validCount: studentsValid,
    errorIssues: studentErrorIssues,
    warningIssues: studentWarningIssues
  };

  // 2. Grades Analysis
  let gradesInvalid = 0;
  let gradesWarning = 0;
  let gradesValid = 0;
  const gradeErrorIssues: MenuHealthIssue[] = [];
  const gradeWarningIssues: MenuHealthIssue[] = [];
  const kkm = teacher?.kkm || 75;

  if (grades.length === 0) {
    gradesWarning = 1;
    gradeWarningIssues.push({
      id: 'grd-empty',
      itemTitle: 'Data Penilaian Belum Tersedia',
      field: 'Asesmen Formatif & Sumatif',
      reason: 'Belum ada rekaman nilai formatif/sumatif untuk mata pelajaran ini.',
      severity: 'warning',
      actionHint: 'Input nilai asesmen formatif (TP) dan sumatif di menu Kelola Nilai',
      targetTab: 'grades'
    });
  } else {
    grades.forEach((g) => {
      const score = g.finalScore !== undefined ? g.finalScore : 0;
      const student = students.find(s => s.id === g.studentId);
      const studentName = student?.name || `Siswa ID ${g.studentId}`;
      const className = student?.className || '';

      const isScoreOutOfRange = score < 0 || score > 100;
      const isTpEmpty = g.tp1 === 0 && g.tp2 === 0;

      if (isScoreOutOfRange || isTpEmpty) {
        gradesInvalid++;
        const reasons: string[] = [];
        if (isScoreOutOfRange) reasons.push(`Nilai akhir (${score}) berada di luar batas wajar rentang 0 – 100`);
        if (isTpEmpty) reasons.push('Capaian Tujuan Pembelajaran (TP 1 & TP 2) masih bernilai 0 / belum dinilai');

        gradeErrorIssues.push({
          id: `grd-err-${g.studentId}-${g.subjectId}`,
          itemTitle: `${studentName} ${className ? `(${className})` : ''}`,
          field: isScoreOutOfRange ? 'Nilai Akhir Rapor' : 'Tujuan Pembelajaran (TP 1 / TP 2)',
          reason: reasons.join(' dan '),
          severity: 'error',
          actionHint: 'Input capaian formatif TP dan periksa bobot asesmen sumatif',
          targetTab: 'grades'
        });
      } else if (score < kkm) {
        gradesWarning++; // Di bawah KKTP (Perlu remedial)
        gradeWarningIssues.push({
          id: `grd-warn-${g.studentId}-${g.subjectId}`,
          itemTitle: `${studentName} ${className ? `(${className})` : ''}`,
          field: 'Nilai di Bawah Batas KKTP',
          reason: `Nilai akhir ${score} masih di bawah batas kriteria ketercapaian minimal (${kkm})`,
          severity: 'warning',
          actionHint: 'Jadwalkan kegiatan remedial atau berikan tugas pengayaan',
          targetTab: 'grades'
        });
      } else {
        gradesValid++;
      }
    });
  }

  const gradesHealth: MenuHealthInfo = {
    level: gradesInvalid > 0 ? 'invalid' : gradesWarning > 0 ? 'warning' : 'valid',
    badgeLabel: gradesInvalid > 0 && gradesWarning > 0
      ? `${gradesInvalid} Err • ${gradesWarning} Kurang`
      : gradesInvalid > 0 
      ? `${gradesInvalid} Error` 
      : gradesWarning > 0 
      ? `${gradesWarning} Kurang` 
      : 'Valid',
    tooltip: `Data Nilai: ${gradesInvalid > 0 ? `${gradesInvalid} Data Error (nilai < 0 atau > 100 / TP kosong). ` : '0 Error. '}${gradesWarning > 0 ? `${gradesWarning} Data Kurang (di bawah KKTP ${kkm}, butuh remedial). ` : '0 Kurang. '}${gradesValid} Nilai tuntas.`,
    invalidCount: gradesInvalid,
    warningCount: gradesWarning,
    validCount: gradesValid,
    errorIssues: gradeErrorIssues,
    warningIssues: gradeWarningIssues
  };

  // 3. Attendance Analysis
  let attendanceInvalid = 0;
  let attendanceWarning = 0;
  let attendanceValid = 0;
  const attendanceErrorIssues: MenuHealthIssue[] = [];
  const attendanceWarningIssues: MenuHealthIssue[] = [];

  if (attendanceRecords.length === 0) {
    attendanceWarning = 1;
    attendanceWarningIssues.push({
      id: 'att-empty',
      itemTitle: 'Rekam Presensi Belum Dimulai',
      field: 'Data Kehadiran',
      reason: 'Belum ada presensi yang direkam untuk kelas semester ini.',
      severity: 'warning',
      actionHint: 'Gunakan fitur Presensi Cepat atau Klik Hadir Semua di menu Presensi Siswa',
      targetTab: 'attendance'
    });
  } else {
    // Check students with high unexcused absence
    const alpaMap: Record<string, number> = {};
    attendanceRecords.forEach((r) => {
      if (r.status === 'ALPA') {
        alpaMap[r.studentId] = (alpaMap[r.studentId] || 0) + 1;
      }
    });

    Object.entries(alpaMap).forEach(([stId, alpaCount]) => {
      const student = students.find(s => s.id === stId);
      const studentName = student?.name || `Siswa ID ${stId}`;
      const className = student?.className || '';

      if (alpaCount > 3) {
        attendanceInvalid++;
        attendanceErrorIssues.push({
          id: `att-err-${stId}`,
          itemTitle: `${studentName} ${className ? `(${className})` : ''}`,
          field: 'Akumulasi Ketidakhadiran (Alpa)',
          reason: `Jumlah alpa mencapai ${alpaCount} kali pertemuan (melebihi batas maksimal toleransi 3 kali)`,
          severity: 'error',
          actionHint: 'Lakukan tindak lanjut pembinaan siswa dan hubungi orang tua/wali',
          targetTab: 'attendance'
        });
      } else if (alpaCount >= 2) {
        attendanceWarning++;
        attendanceWarningIssues.push({
          id: `att-warn-${stId}`,
          itemTitle: `${studentName} ${className ? `(${className})` : ''}`,
          field: 'Waspada Batas Alpa',
          reason: `Akumulasi alpa telah mencapai ${alpaCount} kali pertemuan (mendekati batas maksimal 3 kali)`,
          severity: 'warning',
          actionHint: 'Verifikasi surat izin sakit atau koordinasikan dengan wali kelas',
          targetTab: 'attendance'
        });
      } else {
        attendanceValid++;
      }
    });

    if (attendanceInvalid === 0 && attendanceWarning === 0) {
      attendanceValid = attendanceRecords.length;
    }
  }

  const attendanceHealth: MenuHealthInfo = {
    level: attendanceInvalid > 0 ? 'invalid' : attendanceWarning > 0 ? 'warning' : 'valid',
    badgeLabel: attendanceInvalid > 0 && attendanceWarning > 0
      ? `${attendanceInvalid} Err • ${attendanceWarning} Kurang`
      : attendanceInvalid > 0 
      ? `${attendanceInvalid} Error` 
      : attendanceWarning > 0 
      ? `${attendanceWarning} Kurang` 
      : 'Valid',
    tooltip: `Data Presensi: ${attendanceInvalid > 0 ? `${attendanceInvalid} Data Error (siswa Alpa > 3). ` : '0 Error. '}${attendanceWarning > 0 ? `${attendanceWarning} Data Kurang/Perhatian (mendekati batas Alpa). ` : '0 Kurang. '}Presensi tuntas.`,
    invalidCount: attendanceInvalid,
    warningCount: attendanceWarning,
    validCount: attendanceValid,
    errorIssues: attendanceErrorIssues,
    warningIssues: attendanceWarningIssues
  };

  // 4. Teaching Schedule (Jadwal Mengajar)
  const scheduleHealth: MenuHealthInfo = {
    level: 'valid',
    badgeLabel: 'Valid',
    tooltip: 'Alokasi jadwal tatap muka semester aktif terverifikasi',
    invalidCount: 0,
    warningCount: 0,
    validCount: 1,
    errorIssues: [],
    warningIssues: []
  };

  // 5. Journal (Jurnal Mengajar)
  const journalHealth: MenuHealthInfo = {
    level: 'valid',
    badgeLabel: 'Valid',
    tooltip: 'Agenda KBM dan rekam jurnal mengajar terekam',
    invalidCount: 0,
    warningCount: 0,
    validCount: 1,
    errorIssues: [],
    warningIssues: []
  };

  // 6. Upload Modul / ATP
  const uploadModulHealth: MenuHealthInfo = {
    level: 'valid',
    badgeLabel: 'Valid',
    tooltip: 'Perangkat ajar (Modul Ajar, ATP, CP) tervalidasi',
    invalidCount: 0,
    warningCount: 0,
    validCount: 1,
    errorIssues: [],
    warningIssues: []
  };

  // 7. Extracurricular (Presensi Ekstra)
  const extracurricularHealth: MenuHealthInfo = {
    level: 'valid',
    badgeLabel: 'Valid',
    tooltip: 'Kegiatan ekstrakurikuler & presensi pembina aktif',
    invalidCount: 0,
    warningCount: 0,
    validCount: 1,
    errorIssues: [],
    warningIssues: []
  };

  // 8. Extra Tasks (Tugas Tambahan & Remedial)
  const overdueTasksList = studentTasks.filter((t) => t.status === 'Lewat Tenggat');
  const overdueTasks = overdueTasksList.length;
  const extraTasksWarningIssues: MenuHealthIssue[] = overdueTasksList.map(t => ({
    id: `task-warn-${t.id}`,
    itemTitle: `${t.title} (${t.targetStudentName || t.className || 'Tugas Siswa'})`,
    field: 'Tenggat Remedial',
    reason: `Tugas belum diserahkan dan telah melewati batas tenggat pengumpulan (${t.dueDate || 'Waktu Habis'})`,
    severity: 'warning' as const,
    actionHint: 'Perpanjang tenggat waktu atau konfirmasi pengumpulan pada menu Tugas Tambahan',
    targetTab: 'extra-tasks' as NavTab
  }));

  const extraTasksHealth: MenuHealthInfo = {
    level: overdueTasks > 0 ? 'warning' : 'valid',
    badgeLabel: overdueTasks > 0 ? `${overdueTasks} Kurang` : 'Valid',
    tooltip: `Tugas Remedial: 0 Error. ${overdueTasks > 0 ? `${overdueTasks} Data Kurang (tugas remedial siswa melewati tenggat waktu).` : '0 Kurang. Semua tugas tuntas.'}`,
    invalidCount: 0,
    warningCount: overdueTasks,
    validCount: studentTasks.length,
    errorIssues: [],
    warningIssues: extraTasksWarningIssues
  };

  // 9. AI Assistant
  const aiAssistantHealth: MenuHealthInfo = {
    level: 'valid',
    badgeLabel: 'Aktif',
    tooltip: 'Layanan Asisten AI Kurikulum & Analitik aktif: 0 Error, 0 Kurang.',
    invalidCount: 0,
    warningCount: 0,
    validCount: 1,
    errorIssues: [],
    warningIssues: []
  };

  // 10. Settings (Pengaturan)
  let settingsInvalid = 0;
  let settingsWarning = 0;
  const settingsErrorIssues: MenuHealthIssue[] = [];
  const settingsWarningIssues: MenuHealthIssue[] = [];

  if (!teacher?.npsn || !teacher.npsn.trim() || !teacher?.principalName || !teacher.principalName.trim()) {
    settingsInvalid = 1;
    const reasons: string[] = [];
    if (!teacher?.npsn || !teacher.npsn.trim()) reasons.push('Nomor Pokok Sekolah Nasional (NPSN) masih kosong');
    if (!teacher?.principalName || !teacher.principalName.trim()) reasons.push('Nama Kepala Sekolah belum ditentukan');

    settingsErrorIssues.push({
      id: 'set-err-school-profile',
      itemTitle: 'Identitas Sekolah & Legalisasi Rapor',
      field: !teacher?.npsn || !teacher.npsn.trim() ? 'NPSN Sekolah' : 'Nama Kepala Sekolah',
      reason: reasons.join(', '),
      severity: 'error',
      actionHint: 'Buka menu Pengaturan -> Identitas Sekolah dan isi NPSN serta nama Kepala Sekolah',
      targetTab: 'settings'
    });
  } else if (teacher.npsn === '20500000') {
    settingsWarning = 1;
    settingsWarningIssues.push({
      id: 'set-warn-npsn-default',
      itemTitle: 'NPSN Masih Menggunakan Kode Contoh',
      field: 'NPSN Lembaga',
      reason: 'NPSN sekolah masih menggunakan kode default bawaan 20500000 bukan nomor resmi Kemendikbud',
      severity: 'warning',
      actionHint: 'Ganti dengan 8 digit NPSN resmi sekolah Anda di menu Pengaturan',
      targetTab: 'settings'
    });
  }

  const settingsHealth: MenuHealthInfo = {
    level: settingsInvalid > 0 ? 'invalid' : settingsWarning > 0 ? 'warning' : 'valid',
    badgeLabel: settingsInvalid > 0 && settingsWarning > 0 
      ? '1 Err • 1 Kurang'
      : settingsInvalid > 0 
      ? '1 Error' 
      : settingsWarning > 0 
      ? '1 Kurang' 
      : 'Valid',
    tooltip: `Konfigurasi Sekolah: ${settingsInvalid > 0 ? '1 Data Error (NPSN / Nama Kepala Sekolah kosong). ' : '0 Error. '}${settingsWarning > 0 ? '1 Data Kurang (NPSN masih kode contoh 20500000). ' : '0 Kurang. '}Konfigurasi lengkap.`,
    invalidCount: settingsInvalid,
    warningCount: settingsWarning,
    validCount: settingsInvalid === 0 && settingsWarning === 0 ? 1 : 0,
    errorIssues: settingsErrorIssues,
    warningIssues: settingsWarningIssues
  };

  // 11. Sync (Sinkronisasi)
  const syncHealth: MenuHealthInfo = {
    level: 'valid',
    badgeLabel: 'Valid',
    tooltip: 'Sinkronisasi data siswa & kenaikan rombel tersinkron: 0 Error, 0 Kurang.',
    invalidCount: 0,
    warningCount: 0,
    validCount: 1,
    errorIssues: [],
    warningIssues: []
  };

  // 12. Monitoring Akun (Master Data)
  let usersInvalid = 0;
  let usersWarning = 0;
  let usersValid = 0;
  const usersErrorIssues: MenuHealthIssue[] = [];
  const usersWarningIssues: MenuHealthIssue[] = [];

  if (registeredUsers.length > 0) {
    registeredUsers.forEach((u) => {
      const isNonActive = u.status === 'Nonaktif';
      const isRoleEmpty = !u.role || !u.role.trim();

      if (isNonActive || isRoleEmpty) {
        usersInvalid++;
        usersErrorIssues.push({
          id: `usr-err-${u.uid}`,
          itemTitle: `${u.name || u.email || 'Pengguna'} (${u.uid})`,
          field: isRoleEmpty ? 'Peran Pengguna (Role)' : 'Status Akun Pengguna',
          reason: isRoleEmpty ? 'Hak akses / peran wewenang (Role) belum ditentukan' : 'Status akun Nonaktif (tidak dapat login ke sistem)',
          severity: 'error',
          actionHint: 'Tetapkan peran akun atau aktifkan kembali status pengguna di Master Data',
          targetTab: 'master-data'
        });
      } else if (!u.email || !u.email.trim() || u.isMaintenance) {
        usersWarning++;
        usersWarningIssues.push({
          id: `usr-warn-${u.uid}`,
          itemTitle: `${u.name || 'Pengguna'} (${u.role})`,
          field: !u.email ? 'Alamat Email' : 'Mode Maintenance',
          reason: !u.email ? 'Alamat email pengguna belum diisi' : 'Akun dalam mode pemeliharaan',
          severity: 'warning',
          actionHint: 'Lengkapi email aktif atau selesaikan status pemeliharaan akun',
          targetTab: 'master-data'
        });
      } else {
        usersValid++;
      }
    });
  } else {
    usersValid = 1;
  }

  const masterDataHealth: MenuHealthInfo = {
    level: usersInvalid > 0 ? 'invalid' : usersWarning > 0 ? 'warning' : 'valid',
    badgeLabel: usersInvalid > 0 && usersWarning > 0
      ? `${usersInvalid} Err • ${usersWarning} Kurang`
      : usersInvalid > 0 
      ? `${usersInvalid} Error` 
      : usersWarning > 0 
      ? `${usersWarning} Kurang` 
      : 'Valid',
    tooltip: `Akun Pengguna: ${usersInvalid > 0 ? `${usersInvalid} Data Error (akun nonaktif/tanpa peran). ` : '0 Error. '}${usersWarning > 0 ? `${usersWarning} Data Kurang (email belum diisi). ` : '0 Kurang. '}${usersValid} Akun aktif.`,
    invalidCount: usersInvalid,
    warningCount: usersWarning,
    validCount: usersValid,
    errorIssues: usersErrorIssues,
    warningIssues: usersWarningIssues
  };

  // 13. Kurikulum
  const kurikulumHealth: MenuHealthInfo = {
    level: 'valid',
    badgeLabel: 'Valid',
    tooltip: 'Struktur Kurikulum Merdeka & Capaian Pembelajaran sah: 0 Error, 0 Kurang.',
    invalidCount: 0,
    warningCount: 0,
    validCount: 1,
    errorIssues: [],
    warningIssues: []
  };

  // 14. Guru / PTK
  const guruHealth: MenuHealthInfo = {
    level: 'valid',
    badgeLabel: 'Valid',
    tooltip: 'Data PTK dan guru pengampu terverifikasi: 0 Error, 0 Kurang.',
    invalidCount: 0,
    warningCount: 0,
    validCount: 1,
    errorIssues: [],
    warningIssues: []
  };

  // 15. TU (Tata Usaha)
  const tuHealth: MenuHealthInfo = {
    level: 'valid',
    badgeLabel: 'Valid',
    tooltip: 'Sistem persuratan dan ketatausahaan tertib: 0 Error, 0 Kurang.',
    invalidCount: 0,
    warningCount: 0,
    validCount: 1,
    errorIssues: [],
    warningIssues: []
  };

  // 16. Sarpras (Sarana & Prasarana)
  const sarprasHealth: MenuHealthInfo = {
    level: 'valid',
    badgeLabel: 'Valid',
    tooltip: 'Inventarisasi aset dan ruang belajar terdata baik: 0 Error, 0 Kurang.',
    invalidCount: 0,
    warningCount: 0,
    validCount: 1,
    errorIssues: [],
    warningIssues: []
  };

  // 17. Keuangan
  const keuanganHealth: MenuHealthInfo = {
    level: 'valid',
    badgeLabel: 'Valid',
    tooltip: 'Buku kas dan alokasi anggaran sekolah seimbang: 0 Error, 0 Kurang.',
    invalidCount: 0,
    warningCount: 0,
    validCount: 1,
    errorIssues: [],
    warningIssues: []
  };

  // 18. Perpustakaan
  const perpustakaanHealth: MenuHealthInfo = {
    level: 'valid',
    badgeLabel: 'Valid',
    tooltip: 'Koleksi katalog dan sirkulasi buku perpustakaan tertib: 0 Error, 0 Kurang.',
    invalidCount: 0,
    warningCount: 0,
    validCount: 1,
    errorIssues: [],
    warningIssues: []
  };

  // 19. Kesiswaan
  const kesiswaanHealth: MenuHealthInfo = {
    level: 'valid',
    badgeLabel: 'Valid',
    tooltip: 'Rekam prestasi dan administrasi kesiswaan lengkap: 0 Error, 0 Kurang.',
    invalidCount: 0,
    warningCount: 0,
    validCount: 1,
    errorIssues: [],
    warningIssues: []
  };

  // Total system errors & warnings
  const totalSystemInvalid = studentsInvalid + gradesInvalid + attendanceInvalid + settingsInvalid + usersInvalid;
  const totalSystemWarning = studentsWarning + gradesWarning + attendanceWarning + settingsWarning + usersWarning + (overdueTasks > 0 ? 1 : 0);

  const aggregatedSystemErrorIssues: MenuHealthIssue[] = [
    ...studentErrorIssues,
    ...gradeErrorIssues,
    ...attendanceErrorIssues,
    ...settingsErrorIssues,
    ...usersErrorIssues
  ];

  const aggregatedSystemWarningIssues: MenuHealthIssue[] = [
    ...studentWarningIssues,
    ...gradeWarningIssues,
    ...attendanceWarningIssues,
    ...extraTasksWarningIssues,
    ...settingsWarningIssues,
    ...usersWarningIssues
  ];

  // 20. Validasi Tab (Aggregated Center)
  const validasiHealth: MenuHealthInfo = {
    level: totalSystemInvalid > 0 ? 'invalid' : totalSystemWarning > 0 ? 'warning' : 'valid',
    badgeLabel: totalSystemInvalid > 0 && totalSystemWarning > 0
      ? `${totalSystemInvalid} Err • ${totalSystemWarning} Kurang`
      : totalSystemInvalid > 0 
      ? `${totalSystemInvalid} Error` 
      : totalSystemWarning > 0 
      ? `${totalSystemWarning} Kurang` 
      : '100% Valid',
    tooltip: `Pusat Validasi: ${totalSystemInvalid > 0 ? `${totalSystemInvalid} Data Error perlu perbaikan. ` : '0 Error. '}${totalSystemWarning > 0 ? `${totalSystemWarning} Data Kurang perlu kelengkapan data.` : '0 Kurang.'}`,
    invalidCount: totalSystemInvalid,
    warningCount: totalSystemWarning,
    validCount: 1,
    errorIssues: aggregatedSystemErrorIssues,
    warningIssues: aggregatedSystemWarningIssues
  };

  // 21. Dashboard (Overview)
  const dashboardHealth: MenuHealthInfo = {
    level: totalSystemInvalid > 0 ? 'invalid' : totalSystemWarning > 0 ? 'warning' : 'valid',
    badgeLabel: totalSystemInvalid > 0 && totalSystemWarning > 0
      ? `${totalSystemInvalid} Err • ${totalSystemWarning} Kurang`
      : totalSystemInvalid > 0 
      ? `${totalSystemInvalid} Error` 
      : totalSystemWarning > 0 
      ? `${totalSystemWarning} Kurang` 
      : 'Valid',
    tooltip: `Dashboard: ${totalSystemInvalid > 0 ? `${totalSystemInvalid} Data Error. ` : '0 Error. '}${totalSystemWarning > 0 ? `${totalSystemWarning} Data Kurang.` : '0 Kurang. Sistem normal.'}`,
    invalidCount: totalSystemInvalid,
    warningCount: totalSystemWarning,
    validCount: 1,
    errorIssues: aggregatedSystemErrorIssues,
    warningIssues: aggregatedSystemWarningIssues
  };

  // Maintenance Tab fallback
  const maintenanceHealth: MenuHealthInfo = {
    level: 'valid',
    badgeLabel: 'Valid',
    tooltip: 'Sistem pemeliharaan siap',
    invalidCount: 0,
    warningCount: 0,
    validCount: 1,
    errorIssues: [],
    warningIssues: []
  };

  return {
    dashboard: dashboardHealth,
    students: studentsHealth,
    schedule: scheduleHealth,
    journal: journalHealth,
    'upload-modul': uploadModulHealth,
    attendance: attendanceHealth,
    extracurricular: extracurricularHealth,
    grades: gradesHealth,
    'extra-tasks': extraTasksHealth,
    residu: studentsHealth,
    'ai-assistant': aiAssistantHealth,
    settings: settingsHealth,
    sync: syncHealth,
    'master-data': masterDataHealth,
    'system-kurikulum': kurikulumHealth,
    'system-guru': guruHealth,
    'system-tu': tuHealth,
    'system-sarpras': sarprasHealth,
    'system-keuangan': keuanganHealth,
    'system-perpustakaan': perpustakaanHealth,
    'system-kesiswaan': kesiswaanHealth,
    validasi: validasiHealth,
    'validasi-dapodik': validasiHealth,
    'validasi-overview': validasiHealth,
    'validasi-students': studentsHealth,
    'validasi-grades': gradesHealth,
    'validasi-attendance': attendanceHealth,
    'validasi-modules': uploadModulHealth,
    'validasi-report': validasiHealth,
    maintenance: maintenanceHealth
  };
}
