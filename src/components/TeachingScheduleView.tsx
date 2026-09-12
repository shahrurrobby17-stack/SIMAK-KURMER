import React, { useState, useEffect } from 'react';
import { SaveSuccessModal } from './SaveSuccessModal';
import { TeachingScheduleItem, TeacherProfile, Subject } from '../types';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Printer, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Users,
  Filter,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { saveTeachingSchedulesToFirebase, subscribeToSchedules } from '../lib/firebaseService';
import { generatePdfReport } from '../utils/pdfExport';

interface TeachingScheduleViewProps {
  teacher?: TeacherProfile;
  selectedClass: string;
  classList: string[];
  subjects: Subject[];
  isDemoAdmin?: boolean;
  isMasterUser?: boolean;
}

const defaultSchedules: TeachingScheduleItem[] = [
  { id: 'SCH-1', day: 'Senin', time: '07:30 - 09:00', className: 'X-IPA 2', sub: 'Biologi - Transpor Membran' },
  { id: 'SCH-2', day: 'Senin', time: '09:15 - 10:45', className: 'XI-IPA 1', sub: 'Biologi - Transpor Membran' },
  { id: 'SCH-3', day: 'Selasa', time: '08:00 - 09:30', className: 'XI-IPA 1', sub: 'Biologi - Sistem Pencernaan' },
  { id: 'SCH-4', day: 'Rabu', time: '10:00 - 11:30', className: 'X-IPA 2', sub: 'Biologi - Praktikum Enzim' },
  { id: 'SCH-5', day: 'Kamis', time: '07:30 - 09:00', className: 'XI-IPA 2', sub: 'Biologi - Praktikum Uji Makanan' },
  { id: 'SCH-6', day: 'Jumat', time: '08:00 - 09:30', className: 'X-IPA 2', sub: 'Biologi - Keanekaragaman Hayati' },
];

const DAYS_OF_WEEK = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const TeachingScheduleView: React.FC<TeachingScheduleViewProps> = ({
  teacher,
  selectedClass,
  classList,
  subjects,
  isDemoAdmin = true,
  isMasterUser = false
}) => {
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
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {}
      }
      return defaultSchedules;
    }

    return [];
  };

  const [schedules, setSchedules] = useState<TeachingScheduleItem[]>(getInitialSchedules);

  useEffect(() => {
    setSchedules(getInitialSchedules());
  }, [teacher?.id, isMaster]);

  const [filterDay, setFilterDay] = useState<string>('SEMUA');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState<boolean>(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<TeachingScheduleItem | null>(null);

  const [form, setForm] = useState({
    day: 'Senin',
    time: '07:30 - 09:00',
    className: selectedClass || 'X-IPA 2',
    sub: 'Biologi - Bab 1'
  });

  useEffect(() => {
    const unsub = subscribeToSchedules((remoteSchedules) => {
      if (remoteSchedules && Array.isArray(remoteSchedules)) {
        setSchedules(remoteSchedules);
        ((k: string, v: string) => void 0)(storageKey, JSON.stringify(remoteSchedules));
        if (isMaster) {
          ((k: string, v: string) => void 0)('simak_schedules', JSON.stringify(remoteSchedules));
        }
      }
    }, settingsScope);
    return () => unsub();
  }, [teacher?.id, isMaster, storageKey, settingsScope]);

  const handleSaveSchedules = (newSchedules: TeachingScheduleItem[]) => {
    setSchedules(newSchedules);
    ((k: string, v: string) => void 0)(storageKey, JSON.stringify(newSchedules));
    if (isMaster) {
      ((k: string, v: string) => void 0)('simak_schedules', JSON.stringify(newSchedules));
    }
    saveTeachingSchedulesToFirebase(newSchedules, settingsScope);
  };

  // Today's day name in Indonesian
  const todayDayIndex = new Date().getDay(); // 0 is Sunday
  const todayDayName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][todayDayIndex];

  // Filtered schedules
  const filteredSchedules = schedules.filter(item => {
    const matchClass = true; // Menampilkan semua kelas
    const matchDay = filterDay === 'SEMUA' || item.day === filterDay;
    return matchClass && matchDay;
  });

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.day || !form.time || !form.className) return;

    const newItem: TeachingScheduleItem = {
      id: `SCH-${Date.now().toString().slice(-4)}`,
      day: form.day,
      time: form.time,
      className: form.className,
      sub: form.sub || 'Mata Pelajaran Biologi'
    };

    const updated = [...schedules, newItem];
    handleSaveSchedules(updated);
    setShowAddModal(false);
    setForm({
      day: 'Senin',
      time: '07:30 - 09:00',
      className: selectedClass || 'X-IPA 2',
      sub: 'Biologi - Bab 1'
    });
    setShowSaveSuccess(true);
  };

  const handleDeleteSchedule = (id: string) => {
    const updated = schedules.filter(s => s.id !== id);
    handleSaveSchedules(updated);
    setScheduleToDelete(null);
  };

  const handlePrintSchedule = () => {
    const dayOrder: Record<string, number> = {
      'Senin': 1,
      'Selasa': 2,
      'Rabu': 3,
      'Kamis': 4,
      'Jumat': 5,
      'Sabtu': 6
    };

    const sortedSchedules = [...filteredSchedules].sort((a, b) => {
      const dayDiff = (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99);
      if (dayDiff !== 0) return dayDiff;
      return a.time.localeCompare(b.time);
    });

    const tableHeaders = ['No', 'Hari', 'Jam Pembelajaran', 'Kelas / Rombel', 'Mata Pelajaran & Pokok Bahasan'];
    const tableRows = sortedSchedules.map((item, index) => [
      index + 1,
      item.day,
      item.time,
      item.className,
      item.sub
    ]);

    const kpiCards = [
      { label: 'Total Sesi / Minggu', value: `${schedules.length} Sesi`, subtext: 'Tatap Muka' },
      { label: 'Rombel Diajar', value: `${Array.from(new Set(schedules.map(s => s.className))).length} Kelas`, subtext: 'Lintas Rombel' },
      { label: 'Sesi Hari Ini', value: `${getSchedulesForDay(todayDayName).length} Sesi`, subtext: todayDayName }
    ];

    generatePdfReport({
      title: 'JADWAL MENGAJAR TATAP MUKA GURU',
      subtitle: `Jadwal Kegiatan Belajar Mengajar — ${teacher?.name || 'Guru Pengampu'}`,
      teacherName: teacher?.name || 'Guru Pengampu',
      teacherNip: teacher?.nip || '-',
      schoolName: teacher?.schoolName || 'SMA Negeri Merdeka',
      principalName: teacher?.principalName || 'Kepala Sekolah',
      principalNip: teacher?.principalNip || '-',
      academicYear: teacher?.academicYear || '2026/2027',
      semester: teacher?.semester || 'Ganjil',
      kpiCards,
      tableHeaders,
      tableRows,
      notes: 'Dokumen Jadwal Mengajar Guru terstruktur secara resmi dan tersinkronisasi otomatis dengan Jurnal Mengajar Harian SIMAK Merdeka.'
    });
  };

  // Group schedules by Day
  const getSchedulesForDay = (day: string) => {
    return filteredSchedules.filter(s => s.day === day);
  };

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-none border border-slate-200 shadow-2xs">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Sesi / Minggu</div>
          <div className="text-xl font-black text-[#164e63] mt-0.5">{schedules.length} Sesi</div>
          <div className="text-[10px] text-slate-400">Tatap Muka</div>
        </div>

        <div className="bg-white p-3.5 rounded-none border border-slate-200 shadow-2xs">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Rombel Diajar</div>
          <div className="text-xl font-black text-slate-800 mt-0.5">
            {Array.from(new Set(schedules.map(s => s.className))).length} Kelas
          </div>
          <div className="text-[10px] text-slate-400">Lintas Tingkat</div>
        </div>

        <div className="bg-white p-3.5 rounded-none border border-slate-200 shadow-2xs">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Sesi Hari Ini ({todayDayName})</div>
          <div className="text-xl font-black text-emerald-600 mt-0.5">
            {getSchedulesForDay(todayDayName).length} Sesi
          </div>
          <div className="text-[10px] text-emerald-600 font-medium">
            {getSchedulesForDay(todayDayName).length > 0 ? 'Ada Kegiatan' : 'Tidak Ada Jam'}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-none border border-slate-200 shadow-2xs">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Status Sinkronisasi</div>
          <div className="text-xl font-black text-cyan-700 mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-cyan-600" />
            Tersambung
          </div>
          <div className="text-[10px] text-slate-400">Firestore Cloud DB</div>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div className="bg-white p-4 rounded-none border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setForm(prev => ({ ...prev, className: selectedClass !== 'Semua Kelas' ? selectedClass : 'X-IPA 2' }));
              setShowAddModal(true);
            }}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 px-3.5 py-2 rounded-none text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jadwal Baru</span>
          </button>

          <button
            onClick={handlePrintSchedule}
            className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-3 py-2 rounded-none text-xs font-semibold transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Cetak Jadwal</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center space-x-1.5 bg-slate-100 px-3 py-1.5 rounded-none border border-slate-200 text-xs w-full sm:w-auto">
            <span className="text-slate-500 font-semibold">Hari:</span>
            <select
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value)}
              className="bg-white text-slate-800 font-bold px-2 py-1 rounded-none border border-slate-300 focus:outline-none focus:border-cyan-500 text-xs shrink-0"
            >
              <option value="SEMUA">Semua Hari</option>
              {DAYS_OF_WEEK.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Day Columns Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DAYS_OF_WEEK.filter(day => filterDay === 'SEMUA' || filterDay === day).map(day => {
          const daySchedules = getSchedulesForDay(day);
          const isToday = day === todayDayName;

          return (
            <div 
              key={day} 
              className={`p-4 rounded-none border transition-all ${
                isToday 
                  ? 'bg-gradient-to-b from-cyan-50/80 to-white border-cyan-400 shadow-md ring-2 ring-cyan-500/20' 
                  : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-7 h-7 rounded-none flex items-center justify-center font-bold text-xs ${
                    isToday ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {day.slice(0, 3)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#164e63] flex items-center gap-1.5">
                      <span>{day}</span>
                      {isToday && (
                        <span className="bg-cyan-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-none uppercase">
                          Hari Ini
                        </span>
                      )}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {daySchedules.length} Sesi Terjadwal
                    </p>
                  </div>
                </div>
              </div>

              {daySchedules.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 bg-slate-50 rounded-none border border-dashed border-slate-200">
                  <Clock className="w-6 h-6 mx-auto mb-1 opacity-40 text-slate-400" />
                  <span>Tidak ada jam mengajar di hari {day}</span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {daySchedules.map((item) => (
                    <div 
                      key={item.id}
                      className="bg-slate-50 p-3.5 rounded-none border border-slate-200 hover:border-cyan-300 transition-all group relative flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center space-x-1.5 text-xs font-extrabold text-cyan-800 bg-cyan-100/80 px-2.5 py-0.5 rounded-none">
                          <Clock className="w-3 h-3 text-cyan-600" />
                          <span>{item.time}</span>
                        </div>

                        <button
                          onClick={() => setScheduleToDelete(item)}
                          className="text-slate-400 hover:text-red-600 p-1 rounded-none hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                          title="Hapus Jadwal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="mt-2.5">
                        <div className="text-xs font-black text-[#164e63] flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-800">{item.className}</span>
                          <span className="text-[10px] text-slate-500 font-semibold bg-slate-200/60 px-1.5 py-0.5 rounded-none">
                            Biologi
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 mt-1 font-medium flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-amber-500 shrink-0" />
                          <span className="truncate">{item.sub}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#164e63]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-none max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#164e63] text-white p-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-sm">Tambah Jadwal Mengajar</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-white/70 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSchedule} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Hari Tatap Muka</label>
                <select
                  value={form.day}
                  onChange={(e) => setForm({ ...form, day: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-none p-2.5 font-semibold text-slate-800 focus:outline-none focus:border-cyan-600"
                >
                  {DAYS_OF_WEEK.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Jam Pelajaran (WIB)</label>
                <input
                  type="text"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  placeholder="Contoh: 07:30 - 09:00"
                  className="w-full bg-slate-50 border border-slate-300 rounded-none p-2.5 font-medium text-slate-800 focus:outline-none focus:border-cyan-600"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Kelas / Rombel Target</label>
                <select
                  value={form.className}
                  onChange={(e) => setForm({ ...form, className: e.target.value })}
                  className={`w-full bg-slate-50 border border-slate-300 rounded-none p-2.5 font-bold focus:outline-none focus:border-cyan-600 ${
                    form.className === 'OFF' ? 'text-red-600' : 'text-slate-800'
                  }`}
                >
                  {classList.filter(c => c !== 'Semua Kelas').map(cls => (
                    <option key={cls} value={cls} className="text-slate-800">{cls}</option>
                  ))}
                  <option value="OFF" className="text-red-600 font-bold">OFF</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Topik / Bahasan Pembelajaran</label>
                <input
                  type="text"
                  value={form.sub}
                  onChange={(e) => setForm({ ...form, sub: e.target.value })}
                  placeholder="Contoh: Biologi - Keanekaragaman Hayati"
                  className="w-full bg-slate-50 border border-slate-300 rounded-none p-2.5 font-medium text-slate-800 focus:outline-none focus:border-cyan-600"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-none bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-none bg-cyan-600 hover:bg-cyan-700 text-white font-bold cursor-pointer transition-colors shadow-sm"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Schedule Modal */}
      {scheduleToDelete && (
        <div className="fixed inset-0 z-50 bg-[#164e63]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-none max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="p-2 bg-red-100 rounded-none">
                <Trash2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#164e63]">Hapus Jadwal Mengajar?</h4>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus jadwal <span className="font-bold text-[#164e63]">{scheduleToDelete.day} ({scheduleToDelete.time})</span> untuk kelas <span className="font-bold text-[#164e63]">{scheduleToDelete.className}</span>?
            </p>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setScheduleToDelete(null)}
                className="px-3.5 py-1.5 rounded-none bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteSchedule(scheduleToDelete.id)}
                className="px-3.5 py-1.5 rounded-none bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer transition-colors shadow-sm"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animated Save Success Modal */}
      <SaveSuccessModal 
        isOpen={showSaveSuccess} 
        onClose={() => setShowSaveSuccess(false)} 
        title="Data Berhasil Disimpan"
        message="Jadwal mengajar baru telah berhasil disimpan dan disinkronkan."
      />
    </div>
  );
};
