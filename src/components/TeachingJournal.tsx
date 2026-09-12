import React, { useState, useEffect } from 'react';
import { SaveSuccessModal } from './SaveSuccessModal';
import { TeachingLog, Subject, TeacherProfile, TeachingScheduleItem } from '../types';
import { 
  CalendarDays, 
  Plus, 
  BookOpen, 
  CheckCircle2, 
  UserCheck, 
  FileText, 
  X, 
  Printer, 
  Trash2, 
  FileDown,
  Filter
} from 'lucide-react';
import { generatePdfReport } from '../utils/pdfExport';

interface TeachingJournalProps {
  logs: TeachingLog[];
  subjects: Subject[];
  teacher?: TeacherProfile;
  selectedClass: string;
  classList?: string[];
  onClassChange?: (cls: string) => void;
  onAddLog: (log: TeachingLog) => boolean | void;
  onDeleteLog?: (logId: string) => boolean | void;
  isMasterUser?: boolean;
}

const defaultSchedules: TeachingScheduleItem[] = [
  { id: 'sch-1', day: 'Senin', time: '07.00 - 09.15', className: 'X-IPA 2', sub: 'Biologi (Struktur Sel)' },
  { id: 'sch-2', day: 'Selasa', time: '09.30 - 11.00', className: 'X-IPA 2', sub: 'Biologi (Keanekaragaman Hayati)' },
  { id: 'sch-3', day: 'Rabu', time: '07.00 - 08.30', className: 'XI-IPA 1', sub: 'Biologi (Sistem Organ)' },
  { id: 'sch-4', day: 'Kamis', time: '10.30 - 12.00', className: 'XI-IPA 1', sub: 'Biologi (Praktikum Mikroskop)' },
  { id: 'sch-5', day: 'Jumat', time: '08.00 - 09.30', className: 'XI-IPA 2', sub: 'Biologi (Ekologi & Ekosistem)' }
];

export const TeachingJournal: React.FC<TeachingJournalProps> = ({
  logs,
  subjects,
  teacher,
  selectedClass,
  classList,
  onClassChange,
  onAddLog,
  onDeleteLog,
  isMasterUser = false
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [logToDelete, setLogToDelete] = useState<TeachingLog | null>(null);

  const [filterClass, setFilterClass] = useState<string>(selectedClass || 'SEMUA');

  useEffect(() => {
    if (selectedClass) {
      setFilterClass(selectedClass);
    }
  }, [selectedClass]);

  const isMaster = isMasterUser || teacher?.id === 'PROF-ADMIN';
  const storageKey = teacher?.id ? `simak_schedules_${teacher.id}` : 'simak_schedules';
  const settingsScope = teacher?.id && !isMaster ? `_${teacher.id}` : '';

  const getInitialSchedules = () => {
    const savedKey = ((k: string) => null as any)(storageKey);
    if (savedKey) {
      try {
        const parsed = JSON.parse(savedKey);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    if (isMaster) {
      const savedGen = ((k: string) => null as any)('simak_schedules');
      if (savedGen) {
        try {
          const parsed = JSON.parse(savedGen);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
      return defaultSchedules;
    }
    return [];
  };

  const [schedules, setSchedules] = useState<TeachingScheduleItem[]>(getInitialSchedules);

  const availableClasses = (classList && classList.length > 0)
    ? classList.filter(cls => Boolean(cls) && cls !== 'SEMUA' && cls !== 'Semua Kelas')
    : ['X-IPA 1', 'X-IPA 2', 'XI-IPA 1', 'XI-IPA 2', 'XII-IPA 1', 'XII-IPA 2'];

  const filteredLogs = logs.filter(log => filterClass === 'SEMUA' || log.className === filterClass);

  useEffect(() => {
    setSchedules(getInitialSchedules());
  }, [teacher?.id, isMaster]);

  const [showSaveSuccess, setShowSaveSuccess] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('Data jurnal mengajar berhasil disimpan.');

  const [form, setForm] = useState({
    className: selectedClass,
    subjectId: subjects[0]?.id || 'SUB-BIO',
    classPeriod: 'Jam Ke 1-2 (07.00 - 08.30)',
    learningObjective: '',
    summaryMaterial: '',
    presentCount: 15,
    absentCount: 1,
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.learningObjective) return;

    const newLog: TeachingLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      className: form.className,
      subjectId: form.subjectId,
      classPeriod: form.classPeriod,
      learningObjective: form.learningObjective,
      summaryMaterial: form.summaryMaterial,
      presentCount: form.presentCount,
      absentCount: form.absentCount,
      notes: form.notes
    };

    const res = onAddLog(newLog);
    if (res !== false) {
      setShowAddModal(false);
      setForm({
        className: selectedClass,
        subjectId: subjects[0]?.id || 'SUB-BIO',
        classPeriod: 'Jam Ke 1-2 (07.00 - 08.30)',
        learningObjective: '',
        summaryMaterial: '',
        presentCount: 15,
        absentCount: 1,
        notes: ''
      });
      setSaveSuccessMsg('Jurnal mengajar harian berhasil disimpan!');
      setShowSaveSuccess(true);
    } else {
      setShowAddModal(false);
    }
  };

  const handleExportPdf = () => {
    const classLogs = filteredLogs;
    const tableHeaders = ['No', 'Tanggal', 'Kelas', 'Jam Ke-', 'Tujuan Pembelajaran (TP)', 'Rangkuman Materi', 'Presensi', 'Catatan / Refleksi'];
    const tableRows = classLogs.map((log, idx) => [
      idx + 1,
      log.date,
      log.className,
      log.classPeriod,
      log.learningObjective,
      log.summaryMaterial,
      `Hadir: ${log.presentCount} / Absen: ${log.absentCount}`,
      log.notes || '-'
    ]);

    generatePdfReport({
      title: 'Laporan Jurnal Mengajar & Agenda Pembelajaran',
      subtitle: `Guru: ${teacher?.name || 'Guru Pengampu'} | Mapel: ${teacher?.subjectRole || 'Biologi'} | Filter: ${filterClass === 'SEMUA' ? 'Semua Kelas' : `Kelas ${filterClass}`}`,
      teacherName: teacher?.name || 'Guru Pengampu',
      teacherNip: teacher?.nip || '-',
      schoolName: teacher?.schoolName || 'SMA Negeri 1 Indonesia - Sekolah Penggerak',
      principalName: teacher?.principalName || 'Kepala Sekolah',
      principalNip: teacher?.principalNip || '-',
      city: teacher?.city || 'Malang',
      academicYear: teacher?.academicYear || '2026/2027',
      semester: teacher?.semester || 'Ganjil',
      kpiCards: [
        { label: 'Total Sesi Terlaksana', value: `${classLogs.length} Jurnal`, subtext: filterClass === 'SEMUA' ? 'Semua Kelas' : `Kelas ${filterClass}` },
        { label: 'NIP Guru', value: teacher?.nip || '-', subtext: 'Identitas NIP Guru' },
        { label: 'Tahun Ajaran', value: teacher?.academicYear || '2026/2027', subtext: teacher?.semester || 'Ganjil' }
      ],
      tableHeaders,
      tableRows,
      notes: 'Laporan ini merupakan rekapitulasi resmi kegiatan jurnal pembelajaran harian.'
    });
  };

  return (
    <div className="space-y-6">

      {/* Teaching Logs History Table */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-none border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-[#164e63] uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-600" />
            Riwayat Jurnal Mengajar Harian
          </h3>

          <div className="flex items-center flex-wrap gap-2 shrink-0">
            {/* Dropdown Pilih Kelas disamping kiri Unduh PDF */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-none border border-slate-300 shadow-2xs">
              <Filter className="w-3.5 h-3.5 text-[#164e63]" />
              <span className="text-[11px] font-bold text-slate-600">Pilih Kelas:</span>
              <select
                value={filterClass}
                onChange={(e) => {
                  setFilterClass(e.target.value);
                  if (onClassChange && e.target.value !== 'SEMUA') {
                    onClassChange(e.target.value);
                  }
                }}
                className="bg-white text-[#164e63] font-bold text-xs px-2 py-1 rounded-none border border-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
              >
                <option value="SEMUA">Semua Kelas</option>
                {availableClasses.map((cls) => (
                  <option key={cls} value={cls}>Kelas {cls}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExportPdf}
              className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-3.5 py-2 rounded-none text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              <FileDown className="w-4 h-4 text-amber-600" />
              <span>Unduh PDF</span>
            </button>

            <button
              onClick={() => {
                setForm(prev => ({ ...prev, className: filterClass !== 'SEMUA' ? filterClass : selectedClass }));
                setShowAddModal(true);
              }}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 px-4 py-2 rounded-none text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Jurnal Mengajar</span>
            </button>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="bg-white p-8 rounded-none border border-slate-200 text-center text-slate-400 space-y-2">
            <FileText className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
            <p className="text-xs font-medium">
              Tidak ada catatan jurnal mengajar untuk {filterClass === 'SEMUA' ? 'semua kelas' : `kelas ${filterClass}`}.
            </p>
            <button
              onClick={() => {
                setForm(prev => ({ ...prev, className: filterClass !== 'SEMUA' ? filterClass : selectedClass }));
                setShowAddModal(true);
              }}
              className="text-xs text-[#164e63] font-bold hover:underline cursor-pointer"
            >
              + Tambah Jurnal Sekarang
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => {
            const subject = subjects.find(s => s.id === log.subjectId);

            return (
              <div key={log.id} className="bg-white p-4 rounded-none border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="bg-cyan-100 text-cyan-800 font-bold text-[10px] px-2 py-0.5 rounded-none">
                      {log.className}
                    </span>
                    <h4 className="font-bold text-[#164e63] text-xs">
                      {subject?.name || 'Mata Pelajaran'}
                    </h4>
                    <span className="text-slate-400">•</span>
                    <span className="text-xs text-slate-500 font-mono">{log.classPeriod}</span>
                  </div>

                  <span className="text-slate-400 text-[11px] font-medium">{log.date}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-700 block mb-0.5">🎯 Tujuan Pembelajaran (TP):</span>
                    <p className="text-slate-600 bg-slate-50 p-2 rounded-none border border-slate-100 text-[11px] leading-relaxed">
                      {log.learningObjective}
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-slate-700 block mb-0.5">📝 Ringkasan Materi / Aktivitas:</span>
                    <p className="text-slate-600 bg-slate-50 p-2 rounded-none border border-slate-100 text-[11px] leading-relaxed">
                      {log.summaryMaterial}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 text-[11px] text-slate-500 border-t border-slate-100">
                  <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                    <UserCheck className="w-3.5 h-3.5" />
                    Hadir: {log.presentCount} Siswa | Absen: {log.absentCount} Siswa
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="italic text-slate-500">Catatan Refleksi: {log.notes || '-'}</span>
                    {onDeleteLog && (
                      <button
                        onClick={() => setLogToDelete(log)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-none transition-colors cursor-pointer"
                        title="Hapus Catatan Jurnal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* Delete Confirmation Modal */}
      {logToDelete && (
        <div className="fixed inset-0 z-50 bg-[#164e63]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-none max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 bg-red-100 rounded-none">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#164e63]">Hapus Jurnal Mengajar?</h4>
                <p className="text-xs text-slate-500">Konfirmasi Penghapusan</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-none border border-slate-100">
              Apakah Anda yakin ingin menghapus catatan jurnal mengajar tanggal <span className="font-bold text-[#164e63]">{logToDelete.date}</span> untuk kelas <span className="font-bold text-[#164e63]">{logToDelete.className}</span>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setLogToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-none transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteLog && logToDelete) {
                    onDeleteLog(logToDelete.id);
                  }
                  setLogToDelete(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-none shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Jurnal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Journal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-none max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-base font-bold text-[#164e63] flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-600" />
                Tambah Jurnal Mengajar Baru
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kelas</label>
                  <input 
                    type="text" value={form.className}
                    onChange={(e) => setForm({ ...form, className: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 p-2 rounded-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mata Pelajaran</label>
                  <select 
                    value={form.subjectId}
                    onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 p-2 rounded-none"
                  >
                    {subjects.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Jam Ke / Waktu</label>
                <input 
                  type="text" value={form.classPeriod}
                  onChange={(e) => setForm({ ...form, classPeriod: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 p-2 rounded-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tujuan Pembelajaran (TP) *</label>
                <textarea 
                  rows={2} required
                  placeholder="Menganalisis konsep gerak lurus berubah beraturan..."
                  value={form.learningObjective}
                  onChange={(e) => setForm({ ...form, learningObjective: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 p-2 rounded-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ringkasan Pembelajaran & Praktikum</label>
                <textarea 
                  rows={2}
                  placeholder="Praktikum Hukum Newton menggunakan papan luncur..."
                  value={form.summaryMaterial}
                  onChange={(e) => setForm({ ...form, summaryMaterial: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 p-2 rounded-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Siswa Hadir</label>
                  <input 
                    type="number" value={form.presentCount}
                    onChange={(e) => setForm({ ...form, presentCount: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 p-2 rounded-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Siswa Tidak Hadir</label>
                  <input 
                    type="number" value={form.absentCount}
                    onChange={(e) => setForm({ ...form, absentCount: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 p-2 rounded-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Refleksi Pedagogis / Catatan Guru</label>
                <input 
                  type="text"
                  placeholder="Siswa sangat antusias pada praktikum kelompok..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 p-2 rounded-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button" onClick={() => setShowAddModal(false)}
                  className="w-full bg-slate-100 text-slate-700 font-bold py-2 rounded-none"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full bg-cyan-600 text-white font-bold py-2 rounded-none"
                >
                  Simpan Jurnal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Animated Save Success Modal */}
      <SaveSuccessModal 
        isOpen={showSaveSuccess} 
        onClose={() => setShowSaveSuccess(false)} 
        title="Data Berhasil Disimpan"
        message={saveSuccessMsg}
      />
    </div>
  );
};
