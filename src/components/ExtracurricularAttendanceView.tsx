import React, { useState, useEffect } from 'react';
import { SaveSuccessModal } from './SaveSuccessModal';
import { Student, AttendanceStatus, TeacherProfile } from '../types';
import { 
  Trophy, 
  Calendar, 
  Search, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  CheckSquare, 
  Download, 
  Sparkles,
  Users,
  Award,
  Plus,
  FileSpreadsheet,
  Check,
  FileDown,
  User
} from 'lucide-react';
import { generatePdfReport } from '../utils/pdfExport';


import { 
  saveExtracurricularSettingsToFirebase, 
  saveExtraRecordsToFirebase 
} from '../lib/firebaseService';

interface ExtracurricularAttendanceViewProps {
  students: Student[];
  selectedClass: string;
  classList?: string[];
  teacher?: TeacherProfile;
  isDemoAdmin?: boolean;
}

interface ExtraRecord {
  studentId: string;
  status: AttendanceStatus;
  note?: string;
  updatedAt: string;
}

const DEFAULT_EXTRAS = [
  'Pramuka (Wajib)',
  'Al Banjari',
  'Paskibra',
  'PMR (Palang Merah Remaja)',
  'Futsal & Sepakbola',
  'Bola Basket',
  'English Club',
  'Seni Tari & Musik',
  'Karya Ilmiah Remaja (KIR)',
  'Bela Diri (Pencak Silat / Karate)',
  'Rohis / Kerohanian'
];

export const ExtracurricularAttendanceView: React.FC<ExtracurricularAttendanceViewProps> = ({
  students,
  selectedClass,
  classList,
  teacher,
  isDemoAdmin = true
}) => {
  const [extraList, setExtraList] = useState<string[]>(() => {
    if (!isDemoAdmin) return DEFAULT_EXTRAS;
    const saved = localStorage.getItem('simak_extra_list');
    return saved ? JSON.parse(saved) : DEFAULT_EXTRAS;
  });

  const [selectedExtra, setSelectedExtra] = useState<string>('Pramuka (Wajib)');
  const [isAddingExtra, setIsAddingExtra] = useState<boolean>(false);
  const [newExtraName, setNewExtraName] = useState<string>('');
  
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sessionTitle, setSessionTitle] = useState<string>('Latihan Rutin Mingguan');

  // Instructor name per extracurricular, persisted in real-time
  const [instructors, setInstructors] = useState<Record<string, string>>(() => {
    if (!isDemoAdmin) return {};
    const saved = localStorage.getItem('simak_extra_instructors');
    if (saved) return JSON.parse(saved);
    return {
      'Pramuka (Wajib)': 'Kak Pembina Pramuka',
      'Paskibra': 'Pelatih Paskibra',
      'PMR (Palang Merah Remaja)': 'Pembina PMR'
    };
  });
  const currentInstructor = instructors[selectedExtra] || (isDemoAdmin ? 'Kak Pembina Ekstra' : '');


  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Store records keyed by `${extraName}_${date}_${studentId}`
  const [extraRecords, setExtraRecords] = useState<Record<string, ExtraRecord>>(() => {
    const saved = localStorage.getItem('simak_extra_records');
    return saved ? JSON.parse(saved) : {};
  });

  const [extraMembers, setExtraMembers] = useState<Record<string, string[]>>(() => {
    if (!isDemoAdmin) return {};
    const saved = localStorage.getItem('simak_extra_members');
    return saved ? JSON.parse(saved) : {};
  });

  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [modalClassFilter, setModalClassFilter] = useState('SEMUA');

  // Listen to Firestore real-time updates for extracurricular settings and records
  useEffect(() => {
    // Firebase removed for Supabase migration
    const unsubSettings = () => {};
    const unsubRecords = () => {};
    return () => {
      unsubSettings();
      unsubRecords();
    };
  }, []);

  React.useEffect(() => {
    localStorage.setItem('simak_extra_list', JSON.stringify(extraList));
  }, [extraList]);

  React.useEffect(() => {
    localStorage.setItem('simak_extra_members', JSON.stringify(extraMembers));
  }, [extraMembers]);

  React.useEffect(() => {
    localStorage.setItem('simak_extra_records', JSON.stringify(extraRecords));
  }, [extraRecords]);

  React.useEffect(() => {
    localStorage.setItem('simak_extra_instructors', JSON.stringify(instructors));
  }, [instructors]);

  // Handler to update instructor name in real-time
  const handleInstructorChange = (newName: string) => {
    const updated = {
      ...instructors,
      [selectedExtra]: newName
    };
    setInstructors(updated);
    localStorage.setItem('simak_extra_instructors', JSON.stringify(updated));
    const settingsScope = teacher?.id && !isDemoAdmin ? `_${teacher.id}` : '';
    saveExtracurricularSettingsToFirebase({ instructors: updated }, settingsScope);
  };

  // Handler to update session title in real-time
  const handleSessionTitleChange = (newTitle: string) => {
    setSessionTitle(newTitle);
    const settingsScope = teacher?.id && !isDemoAdmin ? `_${teacher.id}` : '';
    saveExtracurricularSettingsToFirebase({ sessionTitle: newTitle }, settingsScope);
  };

  // Unique classes dynamically synchronized from classList and student data
  const availableClasses = Array.from(new Set([
    ...(classList || [])
  ])).filter(cls => Boolean(cls) && cls !== 'Semua Kelas' && cls !== 'SEMUA');

  // Helper to get record key
  const getRecordKey = (studentId: string) => `${selectedExtra}_${sessionDate}_${studentId}`;

  const getStudentRecord = (studentId: string): ExtraRecord => {
    const key = getRecordKey(studentId);
    return extraRecords[key] || {
      studentId,
      status: 'HADIR',
      note: '',
      updatedAt: new Date().toLocaleTimeString('id-ID')
    };
  };

  // Update single student attendance
  const handleUpdateStatus = (studentId: string, status: AttendanceStatus, note?: string) => {
    const key = getRecordKey(studentId);
    setExtraRecords(prev => {
      const updated = {
        ...prev,
        [key]: {
          studentId,
          status,
          note: note !== undefined ? note : (prev[key]?.note || ''),
          updatedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        }
      };
      const settingsScope = teacher?.id && !isDemoAdmin ? `_${teacher.id}` : '';
    saveExtraRecordsToFirebase(updated, settingsScope);
      return updated;
    });
  };

  const handleUpdateNote = (studentId: string, note: string) => {
    const key = getRecordKey(studentId);
    const current = getStudentRecord(studentId);
    setExtraRecords(prev => {
      const updated = {
        ...prev,
        [key]: {
          ...current,
          note
        }
      };
      const settingsScope = teacher?.id && !isDemoAdmin ? `_${teacher.id}` : '';
    saveExtraRecordsToFirebase(updated, settingsScope);
      return updated;
    });
  };

  // Mark all filtered students as present
  const handleMarkAllPresent = () => {
    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const newRecords = { ...extraRecords };
    
    filteredStudents.forEach(st => {
      const key = getRecordKey(st.id);
      newRecords[key] = {
        studentId: st.id,
        status: 'HADIR',
        note: newRecords[key]?.note || '',
        updatedAt: now
      };
    });

    setExtraRecords(newRecords);
    const settingsScope = teacher?.id && !isDemoAdmin ? `_${teacher.id}` : '';
    saveExtraRecordsToFirebase(newRecords, settingsScope);
    setToastMessage(`Berhasil menandai ${filteredStudents.length} peserta ekstra sebagai HADIR.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter students based on search query
  const filteredStudents = students.filter(student => {
    const isMember = (extraMembers[selectedExtra] || []).includes(student.id);
    if (!isMember) return false;

    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          student.nisn.includes(searchQuery) ||
                          student.className.toLowerCase().includes(searchQuery.toLowerCase());
    
    const rec = getStudentRecord(student.id);
    const matchesStatus = statusFilter === 'ALL' || rec.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate stats for current view
  const targetStudents = students.filter(s => {
    const isMember = (extraMembers[selectedExtra] || []).includes(s.id);
    return isMember;
  });
  let hadirCount = 0;
  let izinCount = 0;
  let sakitCount = 0;
  let alpaCount = 0;

  targetStudents.forEach(s => {
    const rec = getStudentRecord(s.id);
    if (rec.status === 'HADIR') hadirCount++;
    else if (rec.status === 'IZIN') izinCount++;
    else if (rec.status === 'SAKIT') sakitCount++;
    else if (rec.status === 'ALPA') alpaCount++;
  });

  const totalTarget = targetStudents.length;
  const attendanceRate = totalTarget > 0 ? Math.round((hadirCount / totalTarget) * 100) : 100;

  // Export CSV Handler
  const handleExportCSV = () => {
    const csvRows = [
      ['No', 'NISN', 'Nama Siswa', 'Kelas', 'Ekstrakurikuler', 'Tanggal Session', 'Nama Kegiatan', 'Pembina/Pelatih', 'Status Kehadiran', 'Keterangan'],
      ...targetStudents.map((s, idx) => {
        const rec = getStudentRecord(s.id);
        return [
          idx + 1,
          `"${s.nisn}"`,
          `"${s.name}"`,
          s.className,
          `"${selectedExtra}"`,
          sessionDate,
          `"${sessionTitle}"`,
          `"${currentInstructor}"`,
          rec.status,
          `"${rec.note || '-'}"`
        ];
      })
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Presensi_Ekstra_${selectedExtra.replace(/\s+/g, '_')}_${sessionDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage(`Rekap Presensi Ekstra ${selectedExtra} berhasil diunduh (CSV).`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAddStudentToExtra = (studentId: string) => {
    const updated = {
      ...extraMembers,
      [selectedExtra]: [...(extraMembers[selectedExtra] || []), studentId]
    };
    setExtraMembers(updated);
    const settingsScope = teacher?.id && !isDemoAdmin ? `_${teacher.id}` : '';
    saveExtracurricularSettingsToFirebase({ extraMembers: updated }, settingsScope);
  };

  const handleRemoveStudentFromExtra = (studentId: string) => {
    const updated = {
      ...extraMembers,
      [selectedExtra]: (extraMembers[selectedExtra] || []).filter(id => id !== studentId)
    };
    setExtraMembers(updated);
    const settingsScope = teacher?.id && !isDemoAdmin ? `_${teacher.id}` : '';
    saveExtracurricularSettingsToFirebase({ extraMembers: updated }, settingsScope);
  };

  const handleExportPdf = () => {
    const tableHeaders = ['No', 'NISN', 'Nama Siswa', 'Kelas', 'Status Kehadiran', 'Catatan / Keterangan'];
    const tableRows = filteredStudents.map((s, idx) => {
      const rec = getStudentRecord(s.id);
      return [
        idx + 1,
        s.nisn,
        s.name,
        s.className,
        rec.status,
        rec.note || '-'
      ];
    });

    generatePdfReport({
      title: `Laporan Presensi Ekstrakurikuler: ${selectedExtra}`,
      subtitle: `Tanggal Sesi: ${sessionDate} | Total Peserta: ${filteredStudents.length} Siswa`,
      teacherName: teacher?.name,
      teacherNip: teacher?.nip,
      schoolName: teacher?.schoolName,
      principalName: teacher?.principalName,
      principalNip: teacher?.principalNip,
      city: teacher?.city || 'Malang',
      academicYear: teacher?.academicYear,
      semester: teacher?.semester,
      kpiCards: [
        { label: 'Tingkat Kehadiran', value: `${attendanceRate}%`, subtext: `${hadirCount} Siswa Hadir` },
        { label: 'Izin / Sakit', value: `${izinCount + sakitCount} Siswa`, subtext: `Izin: ${izinCount}, Sakit: ${sakitCount}` },
        { label: 'Alpa / Tanpa Ket', value: `${alpaCount} Siswa`, subtext: 'Perlu Konfirmasi Pembina' }
      ],
      tableHeaders,
      tableRows,
      notes: 'Laporan ini di-generate secara otomatis dari Sistem Presensi Ekstrakurikuler berdasarkan data real-time.'
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification / Save Success Modal */}
      <SaveSuccessModal 
        isOpen={Boolean(toastMessage)} 
        onClose={() => setToastMessage(null)} 
        title="Data Berhasil Disimpan"
        message={toastMessage || "Data presensi ekstrakurikuler berhasil disimpan dan tersinkronisasi."}
      />

      {/* Configuration Card: Ekstra Selection, Session Title, Date & Instructor */}
      <div className="bg-white rounded-none p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
          <Award className="w-4 h-4 text-blue-600" />
          <span>Pengaturan Sesi Presensi Ekstrakurikuler</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Pilih Ekstrakurikuler
              </label>
              <button
                onClick={() => setIsAddingExtra(!isAddingExtra)}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>{isAddingExtra ? 'Batal' : '+ Tambah'}</span>
              </button>
            </div>

            {isAddingExtra ? (
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newExtraName}
                  onChange={(e) => setNewExtraName(e.target.value)}
                  placeholder="Nama ekstra..."
                  className="w-full bg-slate-50 border border-slate-300 font-bold text-slate-800 text-xs px-2.5 py-2 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => {
                    if (newExtraName.trim()) {
                      const trimmed = newExtraName.trim();
                      if (!extraList.includes(trimmed)) {
                        const updatedList = [trimmed, ...extraList];
                        setExtraList(updatedList);
                        const settingsScope = teacher?.id && !isDemoAdmin ? `_${teacher.id}` : '';
                        saveExtracurricularSettingsToFirebase({ extraList: updatedList }, settingsScope);
                      }
                      setSelectedExtra(trimmed);
                      setNewExtraName('');
                      setIsAddingExtra(false);
                      setToastMessage(`Ekstrakurikuler "${trimmed}" berhasil ditambahkan.`);
                      setTimeout(() => setToastMessage(null), 3000);
                    }
                  }}
                  className="px-3 py-2 bg-blue-600 text-white font-bold text-xs rounded-none hover:bg-blue-700 cursor-pointer shrink-0"
                >
                  Simpan
                </button>
              </div>
            ) : (
              <select
                value={selectedExtra}
                onChange={(e) => setSelectedExtra(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 font-bold text-slate-800 text-xs px-3 py-2.5 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {extraList.map(ex => (
                  <option key={ex} value={ex}>{ex}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Nama Kegiatan / Sesi
            </label>
            <input
              type="text"
              value={sessionTitle}
              onChange={(e) => handleSessionTitleChange(e.target.value)}
              placeholder="Contoh: Latihan Rutin Mingguan"
              className="w-full bg-slate-50 border border-slate-200 font-medium text-slate-800 text-xs px-3 py-2.5 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Tanggal Pelaksanaan
            </label>
            <div className="relative">
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 font-medium text-slate-800 text-xs px-3 py-2.5 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Pembina / Pelatih
              </label>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Realtime
              </span>
            </div>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={currentInstructor}
                onChange={(e) => handleInstructorChange(e.target.value)}
                placeholder="Nama Pembina / Pelatih"
                className="w-full bg-slate-50 border border-slate-200 font-bold text-slate-800 text-xs pl-8 pr-3 py-2.5 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-none border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Peserta</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-slate-800">{totalTarget}</span>
            <Users className="w-5 h-5 text-slate-400" />
          </div>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-none border border-emerald-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Hadir</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-emerald-700">{hadirCount}</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        <div className="bg-blue-50/70 p-4 rounded-none border border-blue-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Izin</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-blue-700">{izinCount}</span>
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="bg-amber-50/70 p-4 rounded-none border border-amber-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Sakit</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-amber-700">{sakitCount}</span>
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
        </div>

        <div className="bg-rose-50/70 p-4 rounded-none border border-rose-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">Alpa</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-rose-700">{alpaCount}</span>
            <AlertCircle className="w-5 h-5 text-rose-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-none border border-indigo-200 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider">% Kehadiran</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-indigo-700">{attendanceRate}%</span>
            <Sparkles className="w-5 h-5 text-indigo-500" />
          </div>
        </div>
      </div>

      {/* Main Student Table Controls */}
      <div className="bg-white rounded-none border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">


            {/* Status Filter */}
            <div className="bg-white border border-slate-300 rounded-none px-3 py-1.5 flex items-center gap-2 shadow-xs">
              <span className="text-xs font-medium text-slate-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent font-bold text-slate-800 text-xs focus:outline-none cursor-pointer"
              >
                <option value="ALL">Semua Status</option>
                <option value="HADIR">Hadir</option>
                <option value="IZIN">Izin</option>
                <option value="SAKIT">Sakit</option>
                <option value="ALPA">Alpa</option>
              </select>
            </div>
            
            <button
              onClick={() => setIsAddStudentModalOpen(true)}
              className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold px-3 py-1.5 rounded-none text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Tambah Siswa</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama atau NISN..."
                className="w-full bg-white border border-slate-300 rounded-none pl-9 pr-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Mark All Present */}
            <button
              onClick={handleMarkAllPresent}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-none shadow-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <CheckSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Tandai Semua Hadir</span>
            </button>

            {/* Export Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleExportPdf}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-none shadow-xs border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileDown className="w-4 h-4 text-blue-600" />
                <span className="hidden lg:inline">PDF</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-xs rounded-none shadow-xs border border-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span className="hidden lg:inline">CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Student List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold">
                <th className="p-3.5 w-12 text-center">No</th>
                <th className="p-3.5">Nama Siswa</th>
                <th className="p-3.5">NISN</th>
                <th className="p-3.5">Kelas</th>
                <th className="p-3.5 text-center min-w-[280px]">Status Kehadiran</th>
                <th className="p-3.5">Catatan / Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <UserCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold">Tidak ada data siswa ditemukan.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const rec = getStudentRecord(student.id);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 text-center font-medium text-slate-400">
                        {idx + 1}
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-slate-800">{student.name}</div>
                        <div className="text-[10px] text-slate-400">Poin Presensi Ekstra</div>
                      </td>

                      <td className="p-3.5 font-mono text-slate-500">
                        {student.nisn}
                      </td>

                      <td className="p-3.5">
                        <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-none border border-slate-200">
                          {student.className}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center justify-center gap-1">
                          {/* HADIR */}
                          <button
                            onClick={() => handleUpdateStatus(student.id, 'HADIR')}
                            className={`px-3 py-1.5 rounded-none font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
                              rec.status === 'HADIR'
                                ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-300'
                                : 'bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-800'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Hadir</span>
                          </button>

                          {/* IZIN */}
                          <button
                            onClick={() => handleUpdateStatus(student.id, 'IZIN')}
                            className={`px-3 py-1.5 rounded-none font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
                              rec.status === 'IZIN'
                                ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-300'
                                : 'bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-800'
                            }`}
                          >
                            <span>Izin</span>
                          </button>

                          {/* SAKIT */}
                          <button
                            onClick={() => handleUpdateStatus(student.id, 'SAKIT')}
                            className={`px-3 py-1.5 rounded-none font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
                              rec.status === 'SAKIT'
                                ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-300'
                                : 'bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-800'
                            }`}
                          >
                            <span>Sakit</span>
                          </button>

                          {/* ALPA */}
                          <button
                            onClick={() => handleUpdateStatus(student.id, 'ALPA')}
                            className={`px-3 py-1.5 rounded-none font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
                              rec.status === 'ALPA'
                                ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-300'
                                : 'bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-800'
                            }`}
                          >
                            <span>Alpa</span>
                          </button>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={rec.note || ''}
                            onChange={(e) => handleUpdateNote(student.id, e.target.value)}
                            placeholder="Tambah catatan..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-none px-2.5 py-1 text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => handleRemoveStudentFromExtra(student.id)}
                            className="bg-rose-100 hover:bg-rose-200 text-rose-700 px-3 rounded-none text-xs font-bold transition-colors shadow-sm"
                            title="Hapus dari Ekstra"
                          >
                            Hapus
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

      {/* Modal Tambah Siswa */}
      {isAddStudentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-none max-w-2xl w-full shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="bg-[#004b87] text-white p-4 flex justify-between items-center shrink-0">
              <h3 className="font-bold flex items-center gap-2">
                <User className="w-5 h-5 text-amber-300" />
                Tambah Siswa ke {selectedExtra}
              </h3>
              <button onClick={() => setIsAddStudentModalOpen(false)} className="text-blue-200 hover:text-white">
                Tutup
              </button>
            </div>
            
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex gap-2 shrink-0">
              <input 
                type="text" 
                placeholder="Cari siswa..." 
                value={modalSearch}
                onChange={e => setModalSearch(e.target.value)}
                className="flex-1 bg-white border border-slate-300 px-3 py-2 rounded-none text-xs focus:outline-none"
              />
              <select 
                value={modalClassFilter}
                onChange={e => setModalClassFilter(e.target.value)}
                className="bg-white border border-slate-300 px-3 py-2 rounded-none text-xs focus:outline-none"
              >
                <option value="SEMUA">Semua Kelas</option>
                {availableClasses.sort().map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
            
            <div className="overflow-y-auto p-4 flex-1">
              <div className="space-y-2">
                {students
                  .filter(s => {
                    const notInExtra = !(extraMembers[selectedExtra] || []).includes(s.id);
                    const matchClass = modalClassFilter === 'SEMUA' || s.className === modalClassFilter;
                    const matchSearch = s.name.toLowerCase().includes(modalSearch.toLowerCase()) || s.nisn.includes(modalSearch);
                    return notInExtra && matchClass && matchSearch;
                  })
                  .slice(0, 100) // limit for perf
                  .map(student => (
                  <div key={student.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-none hover:border-blue-300 hover:bg-blue-50/30 transition-all">
                    <div>
                      <div className="font-bold text-slate-800 text-sm">{student.name}</div>
                      <div className="text-xs text-slate-500">{student.className} • NISN: {student.nisn}</div>
                    </div>
                    <button
                      onClick={() => handleAddStudentToExtra(student.id)}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-none text-xs font-bold transition-all"
                    >
                      Tambahkan
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
