import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  CloudDownload, 
  CheckCircle2, 
  Users, 
  Database, 
  ShieldCheck, 
  History, 
  ArrowRight,
  Sparkles,
  Filter,
  Search,
  Check,
  CheckSquare,
  Square,
  AlertCircle,
  Trash2,
  FileDown,
  Plus,
  FileSpreadsheet,
  X,
  UserPlus
} from 'lucide-react';
import { Student, TeacherProfile } from '../types';
import { generatePdfReport } from '../utils/pdfExport';
import { saveSyncLogsToFirebase, subscribeToSyncLogs, saveLastSyncedTimeToFirebase, subscribeToLastSyncedTime } from '../lib/firebaseService';

interface StudentSyncViewProps {
  students: Student[];
  selectedClass: string;
  classList?: string[];
  onUpdateStudents: (updatedStudents: Student[]) => void;
  onAddStudent: (newStudent: Student) => void;
  onDeleteStudent?: (studentId: string) => void;
  teacher?: TeacherProfile;
  onClassChange?: (newClass: string) => void;
}

export const StudentSyncView: React.FC<StudentSyncViewProps> = ({
  students,
  selectedClass,
  classList,
  onUpdateStudents,
  onAddStudent,
  onDeleteStudent,
  teacher,
  onClassChange
}) => {
  // Helper to get current formatted time string
  const getFormattedNow = (): string => {
    const now = new Date();
    const dateStr = now.getDate().toString().padStart(2, '0');
    const monthStr = now.toLocaleString('id-ID', { month: 'long' });
    const yearStr = now.getFullYear();
    const hoursStr = now.getHours().toString().padStart(2, '0');
    const minutesStr = now.getMinutes().toString().padStart(2, '0');
    return `${dateStr} ${monthStr} ${yearStr}, ${hoursStr}:${minutesStr} WIB`;
  };

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<number>(0);
  const [syncStatusText, setSyncStatusText] = useState<string>('');
  const [lastSyncedTime, setLastSyncedTime] = useState<string>(() => {
    const saved = ((k: string) => null as any)('simak_last_synced_time');
    if (saved) return saved;
    const initialTime = getFormattedNow();
    ((k: string, v: string) => void 0)('simak_last_synced_time', initialTime);
    return initialTime;
  });

  const [activeFilterClass, setActiveFilterClass] = useState<string>('');

  useEffect(() => {
    const unsub = subscribeToLastSyncedTime((remoteTime) => {
      setLastSyncedTime(remoteTime);
      ((k: string, v: string) => void 0)('simak_last_synced_time', remoteTime);
    });
    return () => unsub();
  }, []);

  
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  
  
  // Calculate target promoted class suggestion helper
  const getNextClassSuggestion = (currentClass: string): string => {
    if (!currentClass || currentClass === 'SEMUA') return 'XI-IPA 1';
    if (currentClass.startsWith('X-') || currentClass.startsWith('X ')) {
      return currentClass.replace(/^X([-\s])/, 'XI$1');
    }
    if (currentClass.startsWith('XI-') || currentClass.startsWith('XI ')) {
      return currentClass.replace(/^XI([-\s])/, 'XII$1');
    }
    if (currentClass.startsWith('XII') || currentClass.toLowerCase().includes('alumni') || currentClass.toLowerCase().includes('lulus')) {
      return 'Alumni / Lulus';
    }
    if (currentClass.includes('10')) return currentClass.replace('10', '11');
    if (currentClass.includes('11')) return currentClass.replace('11', '12');
    if (currentClass.includes('12')) return 'Alumni / Lulus';

    return 'XI-IPA 1';
  };

  const [targetClass, setTargetClass] = useState<string>(() => getNextClassSuggestion(selectedClass || ''));

  useEffect(() => {
    if (activeFilterClass && activeFilterClass !== 'SEMUA') {
      setTargetClass(getNextClassSuggestion(activeFilterClass));
    }
  }, [activeFilterClass]);

  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState<boolean>(false);

  // Bulk Student Paste / Import Modal State
  const [showBulkImportModal, setShowBulkImportModal] = useState<boolean>(false);
  const [bulkText, setBulkText] = useState<string>('');
  const [bulkClassTarget, setBulkClassTarget] = useState<string>(selectedClass || 'Kelas 1');
  const [replaceExistingRoster, setReplaceExistingRoster] = useState<boolean>(false);

  const handleImportBulkStudents = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) return;

    const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    const targetRombel = bulkClassTarget || activeFilterClass || 'Kelas 1';
    const newStudents: Student[] = lines.map((rawLine, index) => {
      const parts = rawLine.split(/[\t,;]/).map(p => p.trim());
      const name = parts[0] || rawLine;
      const nisn = parts[1] && parts[1].length >= 8 ? parts[1] : '';
      const genderStr = parts[2] ? parts[2].toUpperCase() : '';
      const gender: 'L' | 'P' = (genderStr === 'P' || genderStr.includes('PEREMPUAN')) ? 'P' : 'L';

      return {
        id: `STD-IMP-${Date.now().toString().slice(-4)}-${index}`,
        nis: '',
        nisn: nisn,
        name: name,
        gender: gender,
        className: targetRombel,
        parentName: '-',
        parentPhone: '-',
        status: 'Aktif'
      };
    });

    const updated = replaceExistingRoster 
      ? newStudents 
      : [...students, ...newStudents];

    onUpdateStudents(updated);
    setShowBulkImportModal(false);
    setBulkText('');

    const now = new Date();
    const timeStr = `${now.getDate().toString().padStart(2, '0')} ${now.toLocaleString('id-ID', { month: 'long' })} ${now.getFullYear()}, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} WIB`;
    setSyncLogs(prev => [{
      id: `LOG-SYNC-${Date.now()}`,
      timestamp: timeStr,
      action: replaceExistingRoster 
        ? `Ganti Roster: Impor ${newStudents.length} Nama Siswa Baru (${teacher?.schoolName || 'Sekolah Aktif'}) ke Kelas [${targetRombel}]`
        : `Impor Massal ${newStudents.length} Nama Siswa Baru (${teacher?.schoolName || 'Sekolah Aktif'}) ke Kelas [${targetRombel}]`,
      count: newStudents.length,
      status: 'Sukses'
    }, ...prev]);

    setSyncSuccessMessage(`Berhasil mengimpor ${newStudents.length} nama siswa baru untuk ${teacher?.schoolName || 'Sekolah Aktif'} ke Kelas [${targetRombel}]!`);
    
  };

  // Derive dynamic list of all unique available classes matching entered data
  const availableClasses = (classList && classList.length > 0)
    ? classList.filter(cls => Boolean(cls) && cls !== 'Semua Kelas' && cls !== 'SEMUA')
    : Array.from(new Set(students.map(s => s.className))).filter(cls => Boolean(cls) && cls !== 'Semua Kelas' && cls !== 'SEMUA');

  // Sync log history state with persistence (initialized empty as requested)
  const [syncLogs, setSyncLogs] = useState<Array<{ id: string; timestamp: string; action: string; count: number; status: 'Sukses' | 'Gagal' }>>(() => {
    const saved = ((k: string) => null as any)('simak_sync_logs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(l => l.id !== 'LOG-SYNC-01' && l.id !== 'LOG-SYNC-02');
        }
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    const unsub = subscribeToSyncLogs((remoteLogs) => {
      if (Array.isArray(remoteLogs)) {
        const cleanLogs = remoteLogs.filter(l => l.id !== 'LOG-SYNC-01' && l.id !== 'LOG-SYNC-02');
        setSyncLogs(cleanLogs);
        ((k: string, v: string) => void 0)('simak_sync_logs', JSON.stringify(cleanLogs));
      }
    });
    return () => unsub();
  }, []);

  const handleClearSyncLogs = () => {
    setSyncLogs([]);
    ((k: string, v: string) => void 0)('simak_sync_logs', JSON.stringify([]));
    saveSyncLogsToFirebase([]);
    setSyncSuccessMessage('Riwayat aktivitas sinkronisasi berhasil dihapus.');
  };

  

  

  // Filter students based on filter class and search term
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.nis.includes(searchTerm);
    const matchesClass = !activeFilterClass || activeFilterClass === 'SEMUA' || student.className === activeFilterClass;
    return matchesSearch && matchesClass;
  });

  // Toggle single student selection
  const toggleSelectStudent = (id: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map(s => s.id));
    }
  };

  // Trigger full sync simulation from Server
  const handleStartPullSync = () => {
    setIsSyncing(true);
    setSyncProgress(10);
    setSyncStatusText('Menghubungkan ke Server Pusat & SIMAK...');

    setTimeout(() => {
      setSyncProgress(40);
      setSyncStatusText('Mengunduh struktur rombel & data kenaikan kelas...');
    }, 800);

    setTimeout(() => {
      setSyncProgress(75);
      setSyncStatusText('Memvalidasi status kelulusan & NIS siswa...');
    }, 1600);

    setTimeout(() => {
      setSyncProgress(100);
      setSyncStatusText('Sinkronisasi selesai!');
      
      const now = new Date();
      const timeStr = `${now.getDate().toString().padStart(2, '0')} ${now.toLocaleString('id-ID', { month: 'long' })} ${now.getFullYear()}, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} WIB`;
      
      setLastSyncedTime(timeStr);
      setIsSyncing(false);

      // Add a potential new student if needed
      const dummyNewNisn = `00${Math.floor(10000000 + Math.random() * 90000000)}`;
      const newStudentFromDapodik: Student = {
        id: `STD-SYNC-${Date.now().toString().slice(-4)}`,
        nis: `222310${Math.floor(10 + Math.random() * 80)}`,
        nisn: dummyNewNisn,
        name: 'Bagas Prasetyo (Siswa Pindahan)',
        gender: 'L',
        className: (!activeFilterClass || activeFilterClass === 'SEMUA') ? (availableClasses[0] || 'Kelas 1') : activeFilterClass,
        parentName: 'Suryono',
        parentPhone: '081298887711',
        status: 'Aktif'
      };

      onAddStudent(newStudentFromDapodik);

      // Log action
      const currentClassLabel = !activeFilterClass ? 'Semua Rombel' : (activeFilterClass === 'SEMUA' ? 'Semua Rombel' : `Kelas ${activeFilterClass}`);
      const newLog = {
        id: `LOG-SYNC-${Date.now()}`,
        timestamp: timeStr,
        action: `Penarikan data siswa otomatis dari Server Pusat (${currentClassLabel})`,
        count: filteredStudents.length + 1,
        status: 'Sukses' as const
      };
      setSyncLogs(prev => {
        const next = [newLog, ...prev];
        ((k: string, v: string) => void 0)('simak_sync_logs', JSON.stringify(next));
        saveSyncLogsToFirebase(next);
        return next;
      });

      setSyncSuccessMessage(`Berhasil menarik data & melakukan sinkronisasi terbaru! 1 Siswa baru (${newStudentFromDapodik.name}) terdaftar.`);
      
    }, 2400);
  };

  // Promote single student to a new class in real-time
  const handlePromoteSingleStudent = (studentId: string, newClassName: string) => {
    const targetStudent = students.find(s => s.id === studentId);
    if (!targetStudent || targetStudent.className === newClassName) return;

    const oldClass = targetStudent.className;
    const updated = students.map(st => st.id === studentId ? { ...st, className: newClassName } : st);
    onUpdateStudents(updated);

    const now = new Date();
    const timeStr = `${now.getDate().toString().padStart(2, '0')} ${now.toLocaleString('id-ID', { month: 'long' })} ${now.getFullYear()}, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} WIB`;

    const newLog = {
      id: `LOG-SYNC-${Date.now()}`,
      timestamp: timeStr,
      action: `Pemindahan Siswa ${targetStudent.name} (${oldClass} ➔ ${newClassName})`,
      count: 1,
      status: 'Sukses' as const
    };

    setSyncLogs(prev => [newLog, ...prev]);
    setLastSyncedTime(timeStr);
    setSyncSuccessMessage(`Berhasil memindahkan ${targetStudent.name} dari ${oldClass} ke [${newClassName}] secara realtime!`);

    
  };

  // Promote selected students to new class
  const handlePromoteSelected = () => {
    if (selectedStudentIds.length === 0) return;

    const updated = students.map(st => {
      if (selectedStudentIds.includes(st.id)) {
        return {
          ...st,
          className: targetClass
        };
      }
      return st;
    });

    onUpdateStudents(updated);

    const now = new Date();
    const timeStr = `${now.getDate().toString().padStart(2, '0')} ${now.toLocaleString('id-ID', { month: 'long' })} ${now.getFullYear()}, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} WIB`;

    const newLog = {
      id: `LOG-SYNC-${Date.now()}`,
      timestamp: timeStr,
      action: `Kenaikan Kelas & Perubahan Rombel ke [${targetClass}]`,
      count: selectedStudentIds.length,
      status: 'Sukses' as const
    };

    setSyncLogs(prev => [newLog, ...prev]);
    setLastSyncedTime(timeStr);
    setSyncSuccessMessage(`Berhasil memindahkan / memutakhirkan ${selectedStudentIds.length} siswa ke kelas [${targetClass}]!`);
    setSelectedStudentIds([]);

    
  };

  const handleExportPdf = () => {
    const tableHeaders = ['No', 'NISN', 'Nama Siswa', 'Kelas Asal', 'Target Kenaikan Kelas', 'Status Sinkronisasi'];
    const tableRows = filteredStudents.map((s, idx) => [
      idx + 1,
      s.nisn,
      s.name,
      s.className,
      targetClass,
      'Terverifikasi Dapodik'
    ]);

    const activeLabel = !activeFilterClass ? 'Pilih kelas terlebih dahulu' : (activeFilterClass === 'SEMUA' ? 'Semua Rombel' : `Kelas ${activeFilterClass}`);

    generatePdfReport({
      title: 'Laporan Sinkronisasi Data Siswa & Kenaikan Kelas',
      subtitle: `Filter Rombel: ${activeLabel} | Total Data: ${filteredStudents.length} Peserta Didik`,
      teacherName: teacher?.name,
      teacherNip: teacher?.nip,
      schoolName: teacher?.schoolName,
      principalName: teacher?.principalName,
      principalNip: teacher?.principalNip,
      city: teacher?.city || 'Malang',
      academicYear: teacher?.academicYear,
      semester: teacher?.semester,
      kpiCards: [
        { label: 'Total Siswa Terdata', value: `${filteredStudents.length} Siswa`, subtext: `Filter: ${activeLabel}` },
        { label: 'Terakhir Disinkron', value: lastSyncedTime || 'Hari ini', subtext: 'Status Server Aktif' },
        { label: 'Target Rombel Kenaikan', value: `Kelas ${targetClass}`, subtext: 'Sistem Kenaikan Otomatis' }
      ],
      tableHeaders,
      tableRows,
      notes: 'Laporan ini di-generate dari modul Sinkronisasi Data & Kenaikan Kelas SIMAK Guru berdasarkan data real-time.'
    });
  };

  return (
    <div className="space-y-4">
      {/* Sync Progress Indicator */}
      {isSyncing && (
        <div className="bg-[#164e63] text-white p-4 rounded-none space-y-2 border border-cyan-900 shadow-sm">
          <div className="flex justify-between text-xs text-cyan-200">
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              {syncStatusText}
            </span>
            <span className="font-mono font-bold text-amber-300">{syncProgress}%</span>
          </div>
          <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-white/10">
            <div 
              className="bg-gradient-to-r from-amber-400 to-[#00AEEF] h-full transition-all duration-300 ease-out" 
              style={{ width: `${syncProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Success Notification Alert */}
      {syncSuccessMessage && (
        <div className="fixed top-6 right-6 z-[60] p-4 bg-emerald-50 border border-emerald-200 rounded-none flex items-center justify-between text-emerald-800 text-xs shadow-lg animate-fadeIn max-w-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{syncSuccessMessage}</span>
          </div>
          <button 
            onClick={() => setSyncSuccessMessage(null)}
            className="ml-4 text-emerald-700 hover:text-emerald-900 font-bold text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-none border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-none bg-cyan-50 text-[#164e63] flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500">Total Siswa Terdaftar</div>
            <div className="text-lg font-bold text-slate-800">{students.length} Siswa</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-none border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-none bg-amber-50 text-amber-700 flex items-center justify-center font-bold shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500">Rombel Aktif Dipilih</div>
            <div className="text-sm font-bold text-slate-800">
              {!activeFilterClass || activeFilterClass === '' ? (
                <span className="text-amber-800 font-semibold italic">Pilih kelas terlebih dahulu</span>
              ) : activeFilterClass === 'SEMUA' ? (
                'Semua Rombel'
              ) : (
                `Kelas ${activeFilterClass}`
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-none border border-slate-200 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">Sinkron Terakhir</div>
              <div className="text-[11px] font-semibold text-slate-800 mt-0.5">{lastSyncedTime}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Kenaikan Kelas & Sinkronisasi Panel */}
      <div className="bg-white rounded-none border border-slate-200 shadow-sm overflow-hidden">
        {/* Panel Header & Controls */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CloudDownload className="w-5 h-5 text-[#164e63]" />
            <div>
              <h2 className="text-sm font-bold text-slate-800">Daftar Siswa Kenaikan Kelas & Pemutakhiran Rombel</h2>
              <p className="text-[11px] text-slate-500">Pilih siswa yang akan dipindahkan atau dinaikkan ke kelas berikutnya</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Class Select Dropdown */}
            <div className="flex items-center gap-1.5">
              <select 
                value={activeFilterClass}
                onChange={(e) => {
                  const val = e.target.value;
                  setActiveFilterClass(val);
                  if (onClassChange && val) onClassChange(val);
                }}
                className="px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-none focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-800 cursor-pointer"
              >
                <option value="">Pilih Kelas Terlebih Dahulu</option>
                <option value="SEMUA">Semua Rombel</option>
                {availableClasses.map(cls => (
                  <option key={cls} value={cls}>Kelas {cls}</option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Cari nama / NIS..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-none focus:outline-none focus:ring-1 focus:ring-cyan-500 w-36 sm:w-48"
              />
            </div>

            {/* Export PDF */}
            <button
              onClick={handleExportPdf}
              className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-none text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0 shadow-xs"
            >
              <FileDown className="w-3.5 h-3.5 text-cyan-600" />
              <span className="hidden sm:inline">Unduh PDF</span>
            </button>
          </div>
        </div>

        {/* Promotion Action Toolbar (Shown when students selected) */}
        <div className="px-4 py-3 bg-cyan-50/70 border-b border-cyan-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <button 
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 font-semibold text-[#164e63] hover:underline cursor-pointer"
            >
              {selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-[#164e63]" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              {selectedStudentIds.length === filteredStudents.length ? 'Batalkan Semua' : 'Pilih Semua Siswa'}
            </button>
            <span className="text-slate-400">•</span>
            <span className="font-semibold text-slate-800">{selectedStudentIds.length} Siswa Terpilih</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium text-[11px]">Pindahkan / Naikkan Ke:</span>
            <select
              value={targetClass}
              onChange={(e) => setTargetClass(e.target.value)}
              className="bg-white border border-slate-300 font-bold text-slate-800 px-2.5 py-1 rounded-none text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
            >
              {availableClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
              <option value="Alumni / Lulus">Alumni / Lulus</option>
            </select>

            <button
              onClick={handlePromoteSelected}
              disabled={selectedStudentIds.length === 0}
              className="px-3 py-1.5 bg-[#164e63] hover:bg-[#003d6d] text-white font-semibold rounded-none text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-40"
            >
              <span>Proses Kenaikan Kelas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {onDeleteStudent && selectedStudentIds.length > 0 && (
              <button
                onClick={() => setShowBatchDeleteModal(true)}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-none text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus ({selectedStudentIds.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Student Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/80 text-slate-600 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5 w-10 text-center">Pilih</th>
                <th className="p-3.5">NISN</th>
                <th className="p-3.5">Nama Siswa</th>
                <th className="p-3.5">L/P</th>
                <th className="p-3.5">Kelas Saat Ini</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Tidak ada data siswa ditemukan untuk kriteria filter ini.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const isSelected = selectedStudentIds.includes(student.id);

                  return (
                    <tr 
                      key={student.id}
                      onClick={() => toggleSelectStudent(student.id)}
                      className={`hover:bg-cyan-50/50 transition-colors cursor-pointer ${
                        isSelected ? 'bg-cyan-50/80 font-medium' : ''
                      }`}
                    >
                      <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleSelectStudent(student.id)}
                          className="text-slate-400 hover:text-cyan-600 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#164e63]" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">
                        {student.nisn}
                      </td>
                      <td className="p-3.5 font-bold text-slate-800">
                        {student.name}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-1.5 py-0.5 rounded-none font-bold text-[10px] ${
                          student.gender === 'L' ? 'bg-cyan-100 text-cyan-800' : 'bg-pink-100 text-pink-800'
                        }`}>
                          {student.gender}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-none border border-slate-200">
                          {student.className}
                        </span>
                      </td>
                      <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        {onDeleteStudent && (
                          <button
                            onClick={() => setStudentToDelete(student)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-none transition-colors cursor-pointer"
                            title="Hapus Siswa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sync Log History Table */}
      <div className="bg-white rounded-none border border-slate-200 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#164e63]" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Riwayat Aktivitas Sinkronisasi Server
            </h3>
          </div>
          {syncLogs.length > 0 && (
            <button
              onClick={handleClearSyncLogs}
              className="text-[11px] font-semibold text-red-600 hover:text-red-800 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Riwayat</span>
            </button>
          )}
        </div>

        {syncLogs.length === 0 ? (
          <div className="p-6 text-center text-slate-400 bg-slate-50 border border-slate-100 text-xs">
            <History className="w-6 h-6 mx-auto mb-1.5 opacity-40 text-slate-400" />
            <p className="font-medium">Belum ada riwayat aktivitas sinkronisasi.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {syncLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-50 rounded-none border border-slate-100 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-800 flex items-center gap-2">
                    <span>{log.action}</span>
                    <span className="bg-cyan-100 text-[#164e63] text-[10px] px-1.5 py-0.2 rounded-none font-bold">
                      {log.count} Data
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">{log.timestamp}</div>
                </div>

                <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px] bg-emerald-100/60 px-2.5 py-1 rounded-none">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{log.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Single Student Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 bg-[#164e63]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-none max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 bg-red-100 rounded-none">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#164e63]">Hapus Data Siswa?</h4>
                <p className="text-xs text-slate-500">Konfirmasi Penghapusan</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-none border border-slate-100">
              Apakah Anda yakin ingin menghapus siswa <span className="font-bold text-[#164e63]">{studentToDelete.name}</span> (NIS: {studentToDelete.nis}) dari sistem?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-none transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteStudent && studentToDelete) {
                    onDeleteStudent(studentToDelete.id);
                  }
                  setStudentToDelete(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-none shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Siswa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Students Delete Confirmation Modal */}
      {showBatchDeleteModal && (
        <div className="fixed inset-0 z-50 bg-[#164e63]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-none max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 bg-red-100 rounded-none">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#164e63]">Hapus {selectedStudentIds.length} Siswa Terpilih?</h4>
                <p className="text-xs text-slate-500">Penghapusan Banyak Data Sekaligus</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-none border border-slate-100">
              Apakah Anda yakin ingin menghapus <span className="font-bold text-[#164e63]">{selectedStudentIds.length} siswa</span> yang telah Anda centang dari sistem SIMAK?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBatchDeleteModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-none transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteStudent) {
                    selectedStudentIds.forEach(id => onDeleteStudent(id));
                    setSelectedStudentIds([]);
                  }
                  setShowBatchDeleteModal(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-none shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Semua Terpilih</span>
              </button>
            </div>
          </div>
        </div>
      )}

          </div>
  );
};
