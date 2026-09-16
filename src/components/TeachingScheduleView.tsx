import React, { useState, useEffect } from 'react';
import { WeeklyClassScheduleItem, TeacherProfile, Subject } from '../types';
import { 
  Calendar, 
  Clock, 
  Printer, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle,
  Filter,
} from 'lucide-react';
import { subscribeToWeeklySchedules } from '../lib/firebaseService';
import { auth } from '../lib/firebase';
import { generatePdfReport } from '../utils/pdfExport';

interface TeachingScheduleViewProps {
  teacher?: TeacherProfile;
  selectedClass: string;
  classList: string[];
  subjects: Subject[];
  isDemoAdmin?: boolean;
  isMasterUser?: boolean;
}

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
  const [schedules, setSchedules] = useState<WeeklyClassScheduleItem[]>([]);
  const [filterDay, setFilterDay] = useState<string>('SEMUA');

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();
        const res = await fetch('/api/teaching-schedules', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const remoteSchedules = await res.json();
          if (Array.isArray(remoteSchedules)) {
            setSchedules(remoteSchedules);
          }
        }
      } catch (err) {
        console.error('Failed to fetch schedules from postgres', err);
      }
    };
    
    fetchSchedules();

    const unsub = subscribeToWeeklySchedules((remoteSchedules) => {
      if (remoteSchedules && Array.isArray(remoteSchedules)) {
        // We rely on PostgreSQL mostly, but we can sync fallback here if needed.
        // The curriculum saves to both. We'll use PG as primary in this fetch.
      }
    }, '');
    return () => unsub();
  }, [teacher?.id]);

  // Today's day name in Indonesian
  const todayDayIndex = new Date().getDay(); // 0 is Sunday
  const todayDayName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][todayDayIndex];

  // Filtered schedules for current teacher
  const mySchedules = schedules.filter(s => 
    s.teacher === teacher?.name || s.teacher === teacher?.id || isMaster
  );

  const filteredSchedules = mySchedules.filter(item => {
    const matchDay = filterDay === 'SEMUA' || item.day === filterDay;
    return matchDay;
  });

  const getSchedulesForDay = (dayStr: string) => {
    return mySchedules.filter(s => s.day === dayStr);
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
      item.subject
    ]);

    const kpiCards = [
      { label: 'Total Sesi / Minggu', value: `${mySchedules.length} Sesi`, subtext: 'Tatap Muka' },
      { label: 'Rombel Diajar', value: `${Array.from(new Set(mySchedules.map(s => s.className))).length} Kelas`, subtext: 'Lintas Rombel' },
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

  return (
    <div className="space-y-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-none border border-slate-200 shadow-2xs">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Sesi / Minggu</div>
          <div className="text-xl font-black text-[#164e63] mt-0.5">{mySchedules.length} Sesi</div>
          <div className="text-[10px] text-slate-400">Tatap Muka</div>
        </div>
        <div className="bg-white p-3.5 rounded-none border border-slate-200 shadow-2xs">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Rombel Diajar</div>
          <div className="text-xl font-black text-slate-800 mt-0.5">
            {Array.from(new Set(mySchedules.map(s => s.className))).length} Kelas
          </div>
          <div className="text-[10px] text-slate-400">Lintas Tingkat</div>
        </div>
        <div className="bg-white p-3.5 rounded-none border border-slate-200 shadow-2xs">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Sesi Hari Ini ({todayDayName})</div>
          <div className="text-xl font-black text-emerald-600 mt-0.5">
            {getSchedulesForDay(todayDayName).length} Sesi
          </div>
          <div className="text-[10px] text-emerald-600 font-medium">
            {getSchedulesForDay(todayDayName).length > 0 ? 'Ada Jadwal Mengajar' : 'Tidak Ada Jadwal'}
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-none border border-slate-200 shadow-2xs">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Status Sinkronisasi</div>
          <div className="text-xl font-black text-cyan-700 mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-5 h-5 text-cyan-600" />
            Vercel DB
          </div>
          <div className="text-[10px] text-slate-400">Otomatis Tersinkron Kurikulum</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-none border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-cyan-600" />
            Jadwal Hanya Bisa Diedit di Menu Manajemen Kurikulum
          </div>
          <button
            onClick={handlePrintSchedule}
            className="flex items-center space-x-1.5 bg-white border border-slate-300 px-3 py-1.5 rounded-none text-slate-700 font-bold text-xs hover:bg-slate-50 hover:text-[#164e63] transition-colors cursor-pointer w-full sm:w-auto shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Jadwal</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center space-x-1.5 bg-slate-100 px-3 py-1.5 rounded-none border border-slate-200 text-xs w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value)}
              className="bg-transparent border-none text-slate-700 font-bold focus:outline-none cursor-pointer w-full sm:w-auto"
            >
              <option value="SEMUA">Semua Hari</option>
              {DAYS_OF_WEEK.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Schedule Grid by Day */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DAYS_OF_WEEK.filter(day => filterDay === 'SEMUA' || filterDay === day).map(day => {
          const daySchedules = getSchedulesForDay(day).sort((a, b) => a.time.localeCompare(b.time));
          const isToday = day === todayDayName;
          
          return (
            <div 
              key={day} 
              className={`bg-white border ${isToday ? 'border-cyan-400 shadow-md shadow-cyan-100' : 'border-slate-200 shadow-sm'} rounded-none flex flex-col`}
            >
              <div className="flex justify-between items-center p-3 border-b border-slate-200 bg-slate-50/50">
                <div className="flex items-center space-x-2">
                  <div className={`w-7 h-7 rounded-none flex items-center justify-center font-bold text-xs ${
                    isToday ? 'bg-cyan-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {day.substring(0, 1)}
                  </div>
                  <div>
                    <h3 className={`font-extrabold text-sm ${isToday ? 'text-cyan-800' : 'text-slate-800'}`}>{day}</h3>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {daySchedules.length} Sesi Mengajar
                    </p>
                  </div>
                </div>
                {isToday && (
                  <span className="text-[9px] font-black tracking-wider text-cyan-600 uppercase bg-cyan-100 px-2 py-0.5 rounded-full border border-cyan-200">Hari Ini</span>
                )}
              </div>

              {daySchedules.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 bg-slate-50 rounded-none border-t border-dashed border-slate-200 flex-1">
                  Kosong
                </div>
              ) : (
                <div className="p-3 space-y-2.5 flex-1">
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
                      </div>

                      <div className="mt-2.5">
                        <div className="text-xs font-black text-[#164e63] flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-800">{item.className}</span>
                          <span className="text-[10px] text-slate-500 font-semibold bg-slate-200/60 px-1.5 py-0.5 rounded-none">
                            Tatap Muka
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 mt-1 font-medium flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-amber-500 shrink-0" />
                          <span className="truncate">{item.subject}</span>
                        </div>
                        {item.room && (
                          <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                            <span>📍 Ruang: {item.room}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
