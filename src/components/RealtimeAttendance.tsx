import React, { useState, useMemo, useEffect } from 'react';
import { SaveSuccessModal } from './SaveSuccessModal';
import { Student, AttendanceRecord, AttendanceStatus, TeacherProfile, TeachingScheduleItem } from '../types';
import { subscribeToSchedules } from '../lib/firebaseService';
import { initialSchedules } from '../data/initialData';
import { 
  UserCheck, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Sparkles, 
  FileDown, 
  BookOpen, 
  PlusCircle, 
  Trash2, 
  Save,
  X 
} from 'lucide-react';
import { generatePdfReport } from '../utils/pdfExport';

interface RealtimeAttendanceProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  selectedClass: string;
  classList?: string[];
  onUpdateAttendance: (studentId: string, status: AttendanceStatus, note?: string, dateStr?: string, meetingNo?: number) => boolean | void;
  onMarkAllPresent: (classStudents: Student[], dateStr?: string, meetingNo?: number) => boolean | void;
  onDeleteMeeting?: (meetingNo: number, className?: string) => boolean | void;
  teacher?: TeacherProfile;
  isMasterUser?: boolean;
}

export const RealtimeAttendance: React.FC<RealtimeAttendanceProps> = ({
  students,
  attendanceRecords,
  selectedClass,
  classList,
  onUpdateAttendance,
  onMarkAllPresent,
  onDeleteMeeting,
  teacher,
  isMasterUser = false
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [manualClass, setManualClass] = useState<string>('');
  const [selectedMeetingNo, setSelectedMeetingNo] = useState<number>(2);

  // Modal State for Tambah Presensi
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [modalClass, setModalClass] = useState<string>('');
  const [modalDate, setModalDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [modalMeetingNo, setModalMeetingNo] = useState<number>(3);
  const [modalDefaultStatus, setModalDefaultStatus] = useState<AttendanceStatus>('HADIR');
  const [modalNote, setModalNote] = useState<string>('');

  // Modal State for Hapus Pertemuan
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [meetingToDelete, setMeetingToDelete] = useState<number>(2);

  const [showSaveSuccess, setShowSaveSuccess] = useState<boolean>(false);

  const isMaster = isMasterUser || teacher?.id === 'PROF-ADMIN';
  const storageKey = teacher?.id ? `simak_schedules_${teacher.id}` : 'simak_schedules';
  const settingsScope = teacher?.id && !isMaster ? `_${teacher.id}` : '';

  const getInitialSchedules = () => {
    const savedKey = localStorage.getItem(storageKey);
    if (savedKey) {
      try {
        const parsed = JSON.parse(savedKey);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    if (isMaster) {
      const savedGen = localStorage.getItem('simak_schedules');
      if (savedGen) {
        try {
          const parsed = JSON.parse(savedGen);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
      return initialSchedules;
    }
    return [];
  };

  const [schedules, setSchedules] = useState<TeachingScheduleItem[]>(getInitialSchedules);

  useEffect(() => {
    setSchedules(getInitialSchedules());
  }, [teacher?.id, isMaster]);

  useEffect(() => {
    const unsub = subscribeToSchedules((remoteSchedules) => {
      if (remoteSchedules && Array.isArray(remoteSchedules)) {
        setSchedules(remoteSchedules);
        localStorage.setItem(storageKey, JSON.stringify(remoteSchedules));
        if (isMaster) {
          localStorage.setItem('simak_schedules', JSON.stringify(remoteSchedules));
        }
      }
    }, settingsScope);
    return () => unsub();
  }, [teacher?.id, isMaster, storageKey, settingsScope]);

  const targetClass = manualClass || selectedClass;
  // Filter students by selected class (or show all if 'Semua Kelas' / '')
  const classStudents = students.filter(s => {
    if (!targetClass || targetClass === 'Semua Kelas' || targetClass === 'SEMUA') {
      return true;
    }
    return s.className === targetClass;
  });

  // Calculate unique meeting numbers that actually exist for the current class
  const existingMeetingNumbers = useMemo(() => {
    const studentIds = new Set(classStudents.map(s => s.id));
    const meetingSet = new Set<number>();

    attendanceRecords.forEach(r => {
      if (studentIds.has(r.studentId)) {
        const m = r.meetingNo !== undefined && r.meetingNo !== null ? Number(r.meetingNo) : 1;
        if (!isNaN(m) && m > 0) {
          meetingSet.add(m);
        }
      }
    });

    if (meetingSet.size === 0) {
      return [1];
    }

    return Array.from(meetingSet).sort((a, b) => a - b);
  }, [classStudents, attendanceRecords]);

  // When class or existingMeetingNumbers changes, sync selectedMeetingNo if it's not present
  useEffect(() => {
    if (existingMeetingNumbers.length > 0) {
      if (!existingMeetingNumbers.includes(selectedMeetingNo)) {
        const latest = existingMeetingNumbers[existingMeetingNumbers.length - 1];
        setSelectedMeetingNo(latest);
        
        const studentIds = new Set(classStudents.map(s => s.id));
        const rec = attendanceRecords.find(r => studentIds.has(r.studentId) && Number(r.meetingNo) === latest && r.date);
        if (rec && rec.date) {
          setSelectedDate(rec.date);
        }
      }
    }
  }, [existingMeetingNumbers, selectedMeetingNo, classStudents, attendanceRecords]);

  // Attendance for selected meeting & student
  const getRecordForStudent = (studentId: string) => {
    const match = attendanceRecords.find(r => 
      r.studentId === studentId && Number(r.meetingNo) === Number(selectedMeetingNo)
    );
    if (match) return match;

    if (Number(selectedMeetingNo) === 1) {
      const legacyMatch = attendanceRecords.find(r => 
        r.studentId === studentId && (!r.meetingNo || Number(r.meetingNo) === 1)
      );
      if (legacyMatch) return legacyMatch;
    }

    return undefined;
  };

  const handleMeetingChange = (newMeeting: number) => {
    const valid = Math.max(1, newMeeting || 1);
    setSelectedMeetingNo(valid);
    
    // Auto-sync date if there are existing records for this meeting
    const classStudentIds = classStudents.map(s => s.id);
    const existingRec = attendanceRecords.find(r => 
      classStudentIds.includes(r.studentId) && Number(r.meetingNo) === valid && r.date
    );
    if (existingRec && existingRec.date) {
      setSelectedDate(existingRec.date);
    }
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);

    // Auto-sync meetingNo if there is a record for this class on this date
    const classStudentIds = classStudents.map(s => s.id);
    const existingRec = attendanceRecords.find(r => 
      classStudentIds.includes(r.studentId) && r.date === newDate && r.meetingNo
    );
    if (existingRec && existingRec.meetingNo) {
      setSelectedMeetingNo(Number(existingRec.meetingNo));
    }
  };

  const filteredStudents = classStudents;

  // Calculate Counters for selected meeting
  let hadirCount = 0;
  let izinCount = 0;
  let sakitCount = 0;
  let alpaCount = 0;

  classStudents.forEach(student => {
    const rec = getRecordForStudent(student.id);
    const st = rec?.status || 'HADIR';
    if (st === 'HADIR') hadirCount++;
    else if (st === 'IZIN') izinCount++;
    else if (st === 'SAKIT') sakitCount++;
    else if (st === 'ALPA') alpaCount++;
  });

  const total = classStudents.length;
  const attendancePercentage = total > 0 ? Math.round((hadirCount / total) * 100) : 100;

  // Helper to get next meeting number for a given class name
  const getNextMeetingForClass = (clsName: string) => {
    const clsStudents = students.filter(s => !clsName || clsName === 'Semua Kelas' ? true : s.className === clsName);
    const clsStudentIds = new Set(clsStudents.map(s => s.id));
    const mSet = new Set<number>();
    attendanceRecords.forEach(r => {
      if (clsStudentIds.has(r.studentId) && r.meetingNo) {
        mSet.add(Number(r.meetingNo));
      }
    });
    return mSet.size > 0 ? Math.max(...Array.from(mSet)) + 1 : 1;
  };

  // Open modal handler
  const handleOpenAddModal = () => {
    const activeCls = targetClass && targetClass !== 'Semua Kelas' ? targetClass : (students[0]?.className || '');
    setModalClass(activeCls);
    setModalDate(new Date().toISOString().split('T')[0]);
    const nextMeeting = getNextMeetingForClass(activeCls);
    setModalMeetingNo(nextMeeting);
    setModalDefaultStatus('HADIR');
    setModalNote('');
    setShowAddModal(true);
  };

  // When class changes inside the modal
  const handleModalClassChange = (newCls: string) => {
    setModalClass(newCls);
    const nextMeeting = getNextMeetingForClass(newCls);
    setModalMeetingNo(nextMeeting);
  };

  // Submit modal handler
  const handleSubmitAddModal = (e: React.FormEvent) => {
    e.preventDefault();
    const studentsToMark = students.filter(s => {
      if (!modalClass || modalClass === 'Semua Kelas') return true;
      return s.className === modalClass;
    });

    if (studentsToMark.length === 0) {
      alert('Tidak ada siswa di kelas yang dipilih.');
      return;
    }

    studentsToMark.forEach(st => {
      onUpdateAttendance(st.id, modalDefaultStatus, modalNote, modalDate, modalMeetingNo);
    });

    setSelectedDate(modalDate);
    if (modalClass) setManualClass(modalClass);
    setSelectedMeetingNo(modalMeetingNo);
    setShowAddModal(false);
    setShowSaveSuccess(true);
  };

  const handleSaveAttendance = () => {
    const listToSave = filteredStudents.length > 0 ? filteredStudents : classStudents;
    let savedSuccessfully = true;
    for (const st of listToSave) {
      const rec = getRecordForStudent(st.id);
      const status = rec?.status || 'HADIR';
      const note = rec?.note || '';
      const date = rec?.date || selectedDate;
      const res = onUpdateAttendance(st.id, status, note, date, selectedMeetingNo);
      if (res === false) {
        savedSuccessfully = false;
        break;
      }
    }
    if (savedSuccessfully) {
      setShowSaveSuccess(true);
    }
  };

  const handleExportPdf = () => {
    const tableHeaders = ['No', 'Nama Siswa', 'Pertemuan Ke-', 'Status Kehadiran', 'Waktu Masuk', 'Keterangan'];
    const exportList = filteredStudents.length > 0 ? filteredStudents : classStudents;
    const tableRows = exportList.map((student, idx) => {
      const rec = getRecordForStudent(student.id);
      return [
        idx + 1,
        student.name,
        `Pertemuan ${rec?.meetingNo || selectedMeetingNo}`,
        rec?.status || 'HADIR',
        rec?.recordedAt || '07:15:00',
        rec?.note || '-'
      ];
    });

    generatePdfReport({
      title: `Laporan Presensi Kehadiran Siswa ${targetClass && targetClass !== 'Semua Kelas' ? `Kelas ${targetClass}` : 'Semua Kelas'}`,
      subtitle: `Tanggal Presensi: ${selectedDate} | Pertemuan Ke: ${selectedMeetingNo} | Total Siswa: ${exportList.length} Orang`,
      teacherName: teacher?.name,
      teacherNip: teacher?.nip,
      schoolName: teacher?.schoolName,
      principalName: teacher?.principalName,
      principalNip: teacher?.principalNip,
      city: teacher?.city || 'Malang',
      academicYear: teacher?.academicYear,
      semester: teacher?.semester,
      kpiCards: [
        { label: 'Pertemuan', value: `Ke-${selectedMeetingNo}`, subtext: 'Sesi Pembelajaran' },
        { label: 'Tingkat Kehadiran', value: `${attendancePercentage}%`, subtext: `${hadirCount} Siswa Hadir` },
        { label: 'Izin', value: `${izinCount} Siswa`, subtext: 'Keterangan Surat' },
        { label: 'Sakit / Alpa', value: `${sakitCount + alpaCount} Siswa`, subtext: 'Perlu Konfirmasi' }
      ],
      tableHeaders,
      tableRows,
      notes: `Laporan Presensi Pertemuan Ke-${selectedMeetingNo} dibuat secara otomatis melalui SIMAK Guru.`
    });
  };

  return (
    <div className="space-y-6">
      {/* Real-Time Attendance Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-[#004b87] text-white p-3 rounded-none flex flex-col justify-center border border-blue-900 shadow-2xs">
          <span className="text-[10px] text-blue-200 uppercase font-bold tracking-wider">Tingkat Kehadiran</span>
          <div className="text-2xl font-black text-amber-400 mt-0.5">{attendancePercentage}%</div>
          <span className="text-[10px] text-blue-200">Total: {total} Siswa</span>
        </div>

        <div className="bg-white border border-slate-200 p-3 rounded-none shadow-2xs border-l-4 border-l-emerald-600">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hadir</span>
          <div className="text-2xl font-black text-emerald-700 mt-0.5">{hadirCount}</div>
          <span className="text-[10px] text-emerald-600 font-medium">Siswa di Kelas</span>
        </div>

        <div className="bg-white border border-slate-200 p-3 rounded-none shadow-2xs border-l-4 border-l-sky-600">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Izin</span>
          <div className="text-2xl font-black text-sky-700 mt-0.5">{izinCount}</div>
          <span className="text-[10px] text-sky-600 font-medium">Disertai Surat</span>
        </div>

        <div className="bg-white border border-slate-200 p-3 rounded-none shadow-2xs border-l-4 border-l-amber-500">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sakit</span>
          <div className="text-2xl font-black text-amber-700 mt-0.5">{sakitCount}</div>
          <span className="text-[10px] text-amber-600 font-medium">Surat Dokter</span>
        </div>

        <div className="bg-white border border-slate-200 p-3 rounded-none shadow-2xs border-l-4 border-l-rose-600">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Alpa / Tanpa Ket.</span>
          <div className="text-2xl font-black text-rose-700 mt-0.5">{alpaCount}</div>
          <span className="text-[10px] text-rose-600 font-medium">Perlu Konfirmasi</span>
        </div>
      </div>

      {/* Action Controls & Pertemuan Bar */}
      <div className="bg-white p-4 rounded-none border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Tombol Tambah Presensi */}
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="h-9 px-3.5 inline-flex items-center justify-center space-x-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-none text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer border border-emerald-400/40 shrink-0"
            >
              <PlusCircle className="w-4 h-4 text-emerald-100" />
              <span>Tambah Presensi</span>
            </button>

            {/* Pilih Kelas Dropdown */}
            <div className="inline-flex items-center gap-1.5 h-9 shrink-0">
              <span className="text-xs font-bold text-slate-600 shrink-0">Pilih Kelas:</span>
              <select
                value={manualClass || (selectedClass !== 'Semua Kelas' ? selectedClass : '')}
                onChange={(e) => setManualClass(e.target.value)}
                className="h-9 bg-slate-50 border border-slate-300 text-xs px-3 rounded-none focus:outline-none focus:border-blue-500 text-slate-800 font-semibold cursor-pointer shrink-0"
              >
                <option value="">Semua Kelas</option>
                {Array.from(new Set([...(classList || []), ...students.map(s => s.className)])).filter(c => Boolean(c) && c !== 'Semua Kelas' && c !== 'SEMUA').sort().map(cls => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Group Tombol Kanan: Simpan dan Unduh PDF */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSaveAttendance}
              className="h-9 px-3.5 inline-flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500/50 rounded-none text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm shrink-0"
              title="Simpan Data Presensi"
            >
              <Save className="w-4 h-4 text-white" />
              <span>Simpan</span>
            </button>

            <button
              type="button"
              onClick={handleExportPdf}
              className="h-9 px-3.5 inline-flex items-center justify-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-none text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs shrink-0"
              title="Unduh Laporan Presensi PDF"
            >
              <FileDown className="w-4 h-4 text-amber-600" />
              <span>Unduh PDF</span>
            </button>
          </div>
        </div>

        {/* Baris Pertemuan (Dibawah Tombol Tambah Presensi) dan Tombol Hapus Pertemuan */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-[#004b87]">
              <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Pertemuan:</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {existingMeetingNumbers.map(mNo => (
                <button
                  key={mNo}
                  type="button"
                  onClick={() => handleMeetingChange(mNo)}
                  className={`px-3 py-1 text-xs font-bold rounded-none transition-all cursor-pointer border ${
                    selectedMeetingNo === mNo
                      ? 'bg-[#004b87] text-white border-blue-900 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                  title={`Tampilkan Presensi Pertemuan Ke-${mNo}`}
                >
                  Pertemuan {mNo}
                </button>
              ))}
            </div>
          </div>

          {/* Tombol Hapus Pertemuan */}
          <button
            type="button"
            onClick={() => {
              setMeetingToDelete(selectedMeetingNo);
              setShowDeleteModal(true);
            }}
            className="flex items-center space-x-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1 rounded-none text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs shrink-0"
            title="Hapus Sesi Pertemuan Tertentu"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Hapus Pertemuan</span>
          </button>
        </div>
      </div>

      {/* Modal Hapus Pertemuan */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-300 rounded-none shadow-2xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="bg-red-700 text-white p-4 flex items-center justify-between border-b border-red-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 bg-white/10 rounded-none flex items-center justify-center border border-white/20">
                  <Trash2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">Hapus Sesi Pertemuan</h3>
                  <p className="text-[11px] text-red-100">Hapus data presensi sesi pertemuan tertentu</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-white/70 hover:text-white p-1 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs text-slate-700">
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-none text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-red-900">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  Konfirmasi Penghapusan
                </div>
                <p className="text-[11px] text-red-700">
                  Pilih nomor pertemuan yang ingin dihapus untuk kelas <strong>{targetClass || 'Semua Kelas'}</strong>. Seluruh data presensi siswa pada pertemuan tersebut akan dihapus.
                </p>
              </div>

              {/* Pilih Pertemuan yang Ingin Dihapus */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700">
                  Pilih Pertemuan yang Ingin Dihapus <span className="text-red-500">*</span>
                </label>
                <select
                  value={meetingToDelete}
                  onChange={(e) => setMeetingToDelete(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 px-3 py-2.5 text-xs font-bold rounded-none focus:outline-none focus:border-red-600 text-slate-800"
                >
                  {existingMeetingNumbers.map(mNo => (
                    <option key={mNo} value={mNo}>
                      Pertemuan Ke-{mNo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-none transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    let res: any = true;
                    if (onDeleteMeeting) {
                      res = onDeleteMeeting(meetingToDelete, targetClass);
                    }
                    if (res !== false) {
                      const remaining = existingMeetingNumbers.filter(m => m !== meetingToDelete);
                      if (remaining.length > 0) {
                        setSelectedMeetingNo(remaining[remaining.length - 1]);
                      } else {
                        setSelectedMeetingNo(1);
                      }
                      setShowDeleteModal(false);
                      setShowSaveSuccess(true);
                    } else {
                      setShowDeleteModal(false);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-none shadow-md transition-colors cursor-pointer flex items-center space-x-1.5"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                  <span>Hapus Pertemuan {meetingToDelete}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Presensi */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-300 rounded-none shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#004b87] text-white p-4 flex items-center justify-between border-b border-blue-900">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 bg-white/10 rounded-none flex items-center justify-center border border-white/20">
                  <PlusCircle className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">Tambah / Buka Sesi Presensi Baru</h3>
                  <p className="text-[11px] text-blue-200">Inisialisasi presensi kelas untuk pertemuan pembelajaran</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white/70 hover:text-white p-1 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmitAddModal} className="p-5 space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pilih Kelas */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">Pilih Kelas <span className="text-red-500">*</span></label>
                  <select
                    value={modalClass}
                    onChange={(e) => handleModalClassChange(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded-none text-xs font-semibold focus:outline-none focus:border-blue-600"
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {Array.from(new Set([...(classList || []), ...students.map(s => s.className)])).filter(c => Boolean(c) && c !== 'Semua Kelas' && c !== 'SEMUA').sort().map(cls => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pertemuan Ke- */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">Pertemuan Ke- <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={modalMeetingNo}
                    onChange={(e) => setModalMeetingNo(Math.max(1, parseInt(e.target.value) || 1))}
                    required
                    className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded-none text-xs font-bold focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Status Kehadiran Default */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">Status Awal Siswa</label>
                  <select
                    value={modalDefaultStatus}
                    onChange={(e) => setModalDefaultStatus(e.target.value as AttendanceStatus)}
                    className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded-none text-xs font-semibold focus:outline-none focus:border-blue-600"
                  >
                    <option value="HADIR">Semua Hadir (Default)</option>
                    <option value="IZIN">Izin</option>
                    <option value="SAKIT">Sakit</option>
                    <option value="ALPA">Alpa</option>
                  </select>
                </div>

                {/* Catatan / Materi Pembelajaran */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">Materi / Catatan Pertemuan (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Bab 1 - Pembelajaran"
                    value={modalNote}
                    onChange={(e) => setModalNote(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded-none text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-none transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#004b87] hover:bg-[#003d6d] text-white text-xs font-bold rounded-none shadow-md transition-colors cursor-pointer flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Simpan & Buka Presensi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {classStudents.length === 0 ? (
        <div className="bg-white rounded-none border border-slate-200 shadow-sm p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-amber-50 rounded-none flex items-center justify-center border border-amber-200 text-amber-600">
            <UserCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">
              Tidak Ada Data Siswa
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Tidak ditemukan data siswa untuk kelas yang dipilih. Silakan pilih kelas lain melalui menu pilihan kelas.
            </p>
          </div>
        </div>
      ) : (
      <div className="bg-white rounded-none border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#004b87] text-slate-200 uppercase tracking-wider text-[11px] font-bold">
                <th className="p-3.5 border-b border-slate-800 w-12 text-center">No</th>
                <th className="p-3.5 border-b border-slate-800">Nama Siswa</th>
                <th className="p-3.5 border-b border-slate-800 text-center w-16">L/P</th>
                <th className="p-3.5 border-b border-slate-800 text-center w-28">Pertemuan Ke-</th>
                <th className="p-3.5 border-b border-slate-800 text-center w-64">Status Presensi</th>
                <th className="p-3.5 border-b border-slate-800">Catatan / Alasan</th>
                <th className="p-3.5 border-b border-slate-800 text-right">Waktu Record</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                    Tidak ditemukan data siswa untuk kriteria ini.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, index) => {
                  const record = getRecordForStudent(student.id);
                  const currentStatus: AttendanceStatus = record?.status || 'HADIR';
                  const currentNote = record?.note || '';
                  const currentMeeting = selectedMeetingNo;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 text-center font-bold text-slate-500">{index + 1}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-[#004b87] text-xs">{student.name}</div>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded-none text-[10px] font-bold ${
                          student.gender === 'L' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                        }`}>
                          {student.gender}
                        </span>
                      </td>

                      {/* Kolom Pertemuan Ke- */}
                      <td className="p-3.5 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-none text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          Pertemuan {selectedMeetingNo}
                        </span>
                      </td>

                      {/* Status Selector Button Group */}
                      <td className="p-3 text-center">
                        <div className="inline-flex items-center gap-1 rounded-none p-1 bg-slate-100 border border-slate-200 shadow-inner">
                          <button
                            onClick={() => onUpdateAttendance(student.id, 'HADIR', currentNote, selectedDate, selectedMeetingNo)}
                            className={`px-2.5 py-1 rounded-none text-xs font-bold transition-all cursor-pointer ${
                              currentStatus === 'HADIR'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-emerald-700'
                            }`}
                          >
                            Hadir
                          </button>
                          <button
                            onClick={() => onUpdateAttendance(student.id, 'IZIN', currentNote, selectedDate, selectedMeetingNo)}
                            className={`px-2.5 py-1 rounded-none text-xs font-bold transition-all cursor-pointer ${
                              currentStatus === 'IZIN'
                                ? 'bg-sky-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-sky-700'
                            }`}
                          >
                            Izin
                          </button>
                          <button
                            onClick={() => onUpdateAttendance(student.id, 'SAKIT', currentNote, selectedDate, selectedMeetingNo)}
                            className={`px-2.5 py-1 rounded-none text-xs font-bold transition-all cursor-pointer ${
                              currentStatus === 'SAKIT'
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'text-slate-600 hover:text-amber-700'
                            }`}
                          >
                            Sakit
                          </button>
                          <button
                            onClick={() => onUpdateAttendance(student.id, 'ALPA', currentNote, selectedDate, selectedMeetingNo)}
                            className={`px-2.5 py-1 rounded-none text-xs font-bold transition-all cursor-pointer ${
                              currentStatus === 'ALPA'
                                ? 'bg-red-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-red-700'
                            }`}
                          >
                            Alpa
                          </button>
                        </div>
                      </td>

                      {/* Note Input */}
                      <td className="p-3">
                        <input
                          type="text"
                          placeholder="Tambah keterangan..."
                          value={currentNote}
                          onChange={(e) => onUpdateAttendance(student.id, currentStatus, e.target.value, selectedDate, selectedMeetingNo)}
                          className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1 rounded-none focus:bg-white focus:border-blue-500 text-slate-800"
                        />
                      </td>

                      <td className="p-3.5 text-right font-mono text-[11px] text-slate-500">
                        {record?.recordedAt || '07:15:00'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Animated Save Success Modal */}
      <SaveSuccessModal 
        isOpen={showSaveSuccess} 
        onClose={() => setShowSaveSuccess(false)} 
        title="Data Berhasil Disimpan"
        message="Data presensi siswa berhasil disimpan dan tersinkronisasi!"
      />
    </div>
  );
};