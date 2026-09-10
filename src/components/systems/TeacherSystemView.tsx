import React, { useState } from 'react';
import {
  Users,
  BookOpen,
  Calendar,
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Plus,
  Search,
  ExternalLink,
  Sparkles,
  Award,
  Clock,
  Eye,
  Building2,
  CheckSquare,
  XSquare,
  Edit3,
  Trash2,
  FolderUp
} from 'lucide-react';
import { UserAccount, TeacherProfile, TeachingLog } from '../../types';
import { TeacherModuleUploadView, initialDefaultModules } from '../TeacherModuleUploadView';

interface TeacherSystemViewProps {
  registeredUsers: UserAccount[];
  teacher?: TeacherProfile;
  onNavigateTab?: (tab: string) => void;
  onOpenAddUserModal?: (defaultRole: string) => void;
  onOpenEditUserModal?: (user: UserAccount) => void;
  onOpenDeleteUserModal?: (user: UserAccount) => void;
  onOpenModuleModal?: (user: UserAccount, tab: any) => void;
  onSelectCategory?: (category: 'Semua' | 'Kurikulum' | 'Guru' | 'TU' | 'Siswa') => void;
}

interface TeachingLogItem {
  id: string;
  guru: string;
  mapel: string;
  kelas: string;
  tgl: string;
  jam: string;
  tp: string;
  hadir: number;
  absen: number;
  status: string;
}

interface TeacherAdminItem {
  id: string;
  nama: string;
  nip: string;
  mapel: string;
  modul: boolean;
  atp: boolean;
  kktp: boolean;
  jurnal: boolean;
  nilai: boolean;
  status: string;
}

export const TeacherSystemView: React.FC<TeacherSystemViewProps> = ({
  registeredUsers,
  teacher,
  onNavigateTab,
  onOpenAddUserModal,
  onOpenEditUserModal,
  onOpenDeleteUserModal,
  onOpenModuleModal,
  onSelectCategory
}) => {
  const [activeTab, setActiveTab] = useState<'jurnal' | 'uploadModul' | 'administrasi' | 'direktori'>('jurnal');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter teachers
  const teacherUsers = registeredUsers.filter(u => {
    const r = (u.role || '').toLowerCase();
    return !r.includes('kurikulum') && !r.includes('tu') && !r.includes('tata usaha') && !r.includes('siswa') && !r.includes('operator') && !r.includes('administrasi');
  });

  // Teaching Logs State
  const [teachingLogs, setTeachingLogs] = useState<TeachingLogItem[]>([
    { id: 'LOG-01', guru: teacher?.name || 'Shahrur Robby, S.Pd.', mapel: 'Biologi', kelas: 'X-IPA 1', tgl: '2026-08-21', jam: 'Jam Ke 1-2 (07.00 - 08.30)', tp: 'Struktur Sel & Transpor Membran Seluler', hadir: 31, absen: 1, status: 'Tuntas' },
    { id: 'LOG-02', guru: 'Budi Santoso, S.Pd., M.Si.', mapel: 'Matematika', kelas: 'X-IPA 2', tgl: '2026-08-21', jam: 'Jam Ke 3-4 (08.30 - 10.00)', tp: 'Eksponen & Bentuk Akar Logaritma', hadir: 32, absen: 0, status: 'Tuntas' },
    { id: 'LOG-03', guru: 'Dewi Lestari, M.Pd.', mapel: 'Bahasa Indonesia', kelas: 'XI-A', tgl: '2026-08-20', jam: 'Jam Ke 1-2 (07.00 - 08.30)', tp: 'Menulis Teks Laporan Hasil Observasi (LHO)', hadir: 30, absen: 2, status: 'Tuntas' },
    { id: 'LOG-04', guru: 'Ir. Agus Pratama, S.Pd.', mapel: 'Fisika', kelas: 'XI-B', tgl: '2026-08-20', jam: 'Jam Ke 5-6 (10.15 - 11.45)', tp: 'Pengukuran Vektor & Dinamika Gerak Lurus', hadir: 31, absen: 1, status: 'Tuntas' },
    { id: 'LOG-05', guru: 'Anita Wijaya, S.Pd.', mapel: 'Bahasa Inggris', kelas: 'X-IPA 1', tgl: '2026-08-19', jam: 'Jam Ke 3-4 (08.30 - 10.00)', tp: 'Descriptive Text & Analytical Exposition', hadir: 32, absen: 0, status: 'Tuntas' }
  ]);

  // Teaching Logs Modal State
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [logFormGuru, setLogFormGuru] = useState<string>('');
  const [logFormMapel, setLogFormMapel] = useState<string>('');
  const [logFormKelas, setLogFormKelas] = useState<string>('');
  const [logFormTgl, setLogFormTgl] = useState<string>('');
  const [logFormJam, setLogFormJam] = useState<string>('');
  const [logFormTp, setLogFormTp] = useState<string>('');
  const [logFormHadir, setLogFormHadir] = useState<number>(32);
  const [logFormAbsen, setLogFormAbsen] = useState<number>(0);
  const [logFormStatus, setLogFormStatus] = useState<string>('Tuntas');

  const [showDeleteLogModal, setShowDeleteLogModal] = useState<boolean>(false);
  const [logToDelete, setLogToDelete] = useState<TeachingLogItem | null>(null);

  // Load and sync modules from localStorage
  const [modules, setModules] = useState<any[]>(() => {
    const saved = localStorage.getItem('simak_teacher_modules');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return initialDefaultModules;
  });

  React.useEffect(() => {
    const saved = localStorage.getItem('simak_teacher_modules');
    if (saved) {
      try {
        setModules(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, [activeTab]);

  // Dynamically compute the administrative and supervisi list
  const teacherAdminList = React.useMemo(() => {
    // Load grades from localStorage
    let gradesData: any[] = [];
    try {
      const savedGrades = localStorage.getItem('simak_grades');
      if (savedGrades) gradesData = JSON.parse(savedGrades);
    } catch (e) {}

    // Load tasks from localStorage
    let tasksData: any[] = [];
    try {
      const savedTasks = localStorage.getItem('simak_student_tasks');
      if (savedTasks) tasksData = JSON.parse(savedTasks);
    } catch (e) {}

    // Load teacher profiles
    let profilesData: any[] = [];
    try {
      const savedProfiles = localStorage.getItem('simak_teacher_profiles');
      if (savedProfiles) profilesData = JSON.parse(savedProfiles);
    } catch (e) {}

    return teacherUsers.map((user, index) => {
      const profile = profilesData.find(p => p.name.toLowerCase() === user.name.toLowerCase() || p.id === user.uid);
      const nip = user.nip || (profile ? profile.nip : '') || (index === 0 ? '19900101 201501 1 001' : index === 1 ? '19850412 201001 1 008' : index === 2 ? '19880922 201402 2 005' : index === 3 ? '19790215 200501 1 003' : '19920311 201903 2 007');

      // Determine mapel
      let mapel = 'Biologi';
      if (profile && profile.subjectRole) {
        mapel = profile.subjectRole;
      } else if (user.role && user.role.includes('(')) {
        const match = user.role.match(/\(([^)]+)\)/);
        if (match) mapel = match[1];
      } else if (user.role && user.role.includes('Guru Pengampu')) {
        mapel = user.role.replace('Guru Pengampu', '').trim();
      }

      // Filter documents uploaded by this teacher
      const teacherDocs = modules.filter(m => m.teacherName.toLowerCase() === user.name.toLowerCase());

      // Check status of each category
      const hasModul = teacherDocs.some(m => m.category.includes('Modul Ajar'));
      const isModulApproved = teacherDocs.some(m => m.category.includes('Modul Ajar') && m.status === 'Disetujui');
      const isModulReviewing = teacherDocs.some(m => m.category.includes('Modul Ajar') && m.status === 'Meninjau');

      const hasAtp = teacherDocs.some(m => m.category.includes('Alur Tujuan Pembelajaran'));
      const isAtpApproved = teacherDocs.some(m => m.category.includes('Alur Tujuan Pembelajaran') && m.status === 'Disetujui');
      const isAtpReviewing = teacherDocs.some(m => m.category.includes('Alur Tujuan Pembelajaran') && m.status === 'Meninjau');

      const hasKktp = teacherDocs.some(m => m.category.includes('Kriteria Ketercapaian TP') || m.category.includes('KKTP'));
      const isKktpApproved = teacherDocs.some(m => (m.category.includes('Kriteria Ketercapaian TP') || m.category.includes('KKTP')) && m.status === 'Disetujui');
      const isKktpReviewing = teacherDocs.some(m => (m.category.includes('Kriteria Ketercapaian TP') || m.category.includes('KKTP')) && m.status === 'Meninjau');

      // Jurnal: true if has logs in teachingLogs state
      const hasJurnal = teachingLogs.some(l => l.guru.toLowerCase() === user.name.toLowerCase());

      // Buku Nilai: true if grades exist or task grades exist
      const hasNilai = gradesData.length > 0 || tasksData.some(t => t.grades && Object.keys(t.grades).length > 0) || teacherDocs.some(m => m.category.includes('Kisi-Kisi') || m.category.includes('Soal'));

      // Calculate progress percentage
      const completedCount = [
        isModulApproved || isModulReviewing || hasModul,
        isAtpApproved || isAtpReviewing || hasAtp,
        isKktpApproved || isKktpReviewing || hasKktp,
        hasJurnal,
        hasNilai
      ].filter(Boolean).length;
      
      const pct = Math.round((completedCount / 5) * 100);
      const statusStr = pct === 100 ? 'Lengkap (100%)' : `Progres (${pct}%)`;

      return {
        id: user.uid || `ADM-${index}`,
        nama: user.name,
        nip,
        mapel,
        modul: hasModul,
        modulApproved: isModulApproved,
        modulReviewing: isModulReviewing,
        atp: hasAtp,
        atpApproved: isAtpApproved,
        atpReviewing: isAtpReviewing,
        kktp: hasKktp,
        kktpApproved: isKktpApproved,
        kktpReviewing: isKktpReviewing,
        jurnal: hasJurnal,
        nilai: hasNilai,
        status: statusStr,
        pct
      };
    });
  }, [teacherUsers, modules, teachingLogs]);

  // Journal Handlers
  const handleOpenAddLog = () => {
    setEditingLogId(null);
    setLogFormGuru(teacher?.name || (teacherUsers[0]?.name || ''));
    setLogFormMapel('Biologi');
    setLogFormKelas('X-IPA 1');
    setLogFormTgl(new Date().toISOString().split('T')[0]);
    setLogFormJam('Jam Ke 1-2 (07.00 - 08.30)');
    setLogFormTp('');
    setLogFormHadir(32);
    setLogFormAbsen(0);
    setLogFormStatus('Tuntas');
    setShowLogModal(true);
  };

  const handleOpenEditLog = (item: TeachingLogItem) => {
    setEditingLogId(item.id);
    setLogFormGuru(item.guru);
    setLogFormMapel(item.mapel);
    setLogFormKelas(item.kelas);
    setLogFormTgl(item.tgl);
    setLogFormJam(item.jam);
    setLogFormTp(item.tp);
    setLogFormHadir(item.hadir);
    setLogFormAbsen(item.absen);
    setLogFormStatus(item.status);
    setShowLogModal(true);
  };

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logFormGuru || !logFormMapel) return;

    if (editingLogId) {
      setTeachingLogs(prev => prev.map(l => l.id === editingLogId ? {
        ...l,
        guru: logFormGuru,
        mapel: logFormMapel,
        kelas: logFormKelas,
        tgl: logFormTgl,
        jam: logFormJam,
        tp: logFormTp,
        hadir: Number(logFormHadir),
        absen: Number(logFormAbsen),
        status: logFormStatus
      } : l));
    } else {
      const newLog: TeachingLogItem = {
        id: `LOG-${Date.now().toString().slice(-4)}`,
        guru: logFormGuru,
        mapel: logFormMapel,
        kelas: logFormKelas,
        tgl: logFormTgl,
        jam: logFormJam,
        tp: logFormTp,
        hadir: Number(logFormHadir),
        absen: Number(logFormAbsen),
        status: logFormStatus
      };
      setTeachingLogs(prev => [newLog, ...prev]);
    }
    setShowLogModal(false);
  };

  const handleDeleteLogClick = (item: TeachingLogItem) => {
    setLogToDelete(item);
    setShowDeleteLogModal(true);
  };

  const handleConfirmDeleteLog = () => {
    if (logToDelete) {
      setTeachingLogs(prev => prev.filter(l => l.id !== logToDelete.id));
      setShowDeleteLogModal(false);
      setLogToDelete(null);
    }
  };

  const filteredTeachers = teacherUsers.filter(u => {
    return u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (u.nip && u.nip.includes(searchQuery)) ||
           (u.role && u.role.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <div className="space-y-6">
      {/* KPI Cards for Teachers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-none border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-blue-50 text-[#004b87] rounded-none shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Guru</div>
            <div className="text-xl font-black text-slate-800">{teacherUsers.length || 1} <span className="text-xs font-semibold text-slate-500">Pendidik</span></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-none border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-none shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Guru Aktif KBM</div>
            <div className="text-xl font-black text-emerald-700">{teacherUsers.filter(u => u.status !== 'Nonaktif').length || 1} <span className="text-xs font-semibold text-emerald-600">Aktif</span></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-none border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-none shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Jurnal Terisi</div>
            <div className="text-xl font-black text-indigo-700">96.4% <span className="text-xs font-semibold text-indigo-600">Minggu Ini</span></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-none border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-none shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Kelengkapan Modul</div>
            <div className="text-xl font-black text-amber-700">88.5% <span className="text-xs font-semibold text-amber-600">Terunggah</span></div>
          </div>
        </div>
      </div>

      {/* Subsystem Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-2 pt-2 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('jurnal')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'jurnal'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Monitoring Jurnal & Agenda Mengajar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('uploadModul')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'uploadModul'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FolderUp className="w-4 h-4" />
          <span>Upload Modul/ATP & Perangkat Ajar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('administrasi')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'administrasi'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Kelengkapan Administrasi & Supervisi</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('direktori')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'direktori'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Direktori Akun Guru Pengampu ({teacherUsers.length})</span>
        </button>
      </div>

      {/* TAB CONTENT: JURNAL MENGAJAR */}
      {activeTab === 'jurnal' && (
        <div className="bg-white p-5 rounded-none border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Rekapitulasi Jurnal Mengajar Harian Guru</h3>
              <p className="text-xs text-slate-500">Aktivitas pembelajaran, ketercapaian Tujuan Pembelajaran (TP), dan catatan kehadiran kelas.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenAddLog}
                className="px-3 py-1.5 bg-[#004b87] hover:bg-blue-800 text-white rounded-none font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Input Jurnal Baru</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3">Tanggal & Jam</th>
                  <th className="p-3">Guru Pengampu</th>
                  <th className="p-3">Mata Pelajaran</th>
                  <th className="p-3">Kelas</th>
                  <th className="p-3">Tujuan Pembelajaran (TP) / Topik</th>
                  <th className="p-3 text-center">Kehadiran</th>
                  <th className="p-3 text-center">Status KBM</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachingLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-700 whitespace-nowrap">
                      <div>{log.tgl}</div>
                      <div className="text-[10px] text-slate-500">{log.jam}</div>
                    </td>
                    <td className="p-3 font-bold text-[#004b87]">{log.guru}</td>
                    <td className="p-3 font-semibold text-slate-800">{log.mapel}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold text-[10px] rounded-none">
                        {log.kelas}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 max-w-xs truncate">{log.tp}</td>
                    <td className="p-3 text-center">
                      <span className="text-emerald-700 font-bold">{log.hadir} Hadir</span>
                      {log.absen > 0 && <span className="text-rose-600 font-bold ml-1">({log.absen} Absen)</span>}
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-none">
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditLog(log)}
                          title="Edit Jurnal"
                          className="px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white font-bold text-[11px] border border-amber-300 rounded-none transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLogClick(log)}
                          title="Hapus Jurnal"
                          className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white font-bold text-[11px] border border-rose-300 rounded-none transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Hapus</span>
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

      {/* TAB CONTENT: UPLOAD MODUL / ATP */}
      {activeTab === 'uploadModul' && (
        <TeacherModuleUploadView teacher={teacher} registeredUsers={registeredUsers} />
      )}

      {/* TAB CONTENT: KELENGKAPAN ADMINISTRASI */}
      {activeTab === 'administrasi' && (
        <div className="bg-white p-5 rounded-none border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Supervisi & Audit Kelengkapan Perangkat Administrasi Guru</h3>
              <p className="text-xs text-slate-500">Standar pemenuhan dokumen RPP/Modul Ajar, ATP, KKTP, Buku Jurnal, dan Leger Nilai.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold">
                Tahun Ajaran 2026/2027
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border-l-4 border-[#004b87] text-xs text-slate-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#004b87] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800">💡 Sinkronisasi & Penghitungan Otomatis</p>
              <p className="text-slate-600 mt-0.5">Status kelengkapan administrasi dan supervisi di bawah ini dihitung secara real-time berdasarkan aktivitas nyata di sistem: unggahan perangkat ajar guru (Modul, ATP, KKTP), agenda mengajar harian, serta penginputan nilai formatif/sumatif kelas.</p>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3">Nama Guru</th>
                  <th className="p-3">NIP</th>
                  <th className="p-3">Mapel</th>
                  <th className="p-3 text-center">Modul Ajar</th>
                  <th className="p-3 text-center">ATP</th>
                  <th className="p-3 text-center">KKTP</th>
                  <th className="p-3 text-center">Jurnal</th>
                  <th className="p-3 text-center">Buku Nilai</th>
                  <th className="p-3 text-center">Tingkat Kelengkapan</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teacherAdminList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-800">{item.nama}</td>
                    <td className="p-3 text-slate-600 font-mono">{item.nip}</td>
                    <td className="p-3 font-semibold text-[#004b87]">{item.mapel}</td>
                    <td className="p-3 text-center">
                      {item.modulApproved ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                          ✓ Valid
                        </span>
                      ) : item.modulReviewing ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200 animate-pulse">
                          ⏳ Meninjau
                        </span>
                      ) : item.modul ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold border border-blue-200">
                          ✓ Terunggah
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-bold border border-rose-150">
                          × Belum
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {item.atpApproved ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                          ✓ Valid
                        </span>
                      ) : item.atpReviewing ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200 animate-pulse">
                          ⏳ Meninjau
                        </span>
                      ) : item.atp ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold border border-blue-200">
                          ✓ Terunggah
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-bold border border-rose-150">
                          × Belum
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {item.kktpApproved ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                          ✓ Valid
                        </span>
                      ) : item.kktpReviewing ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200 animate-pulse">
                          ⏳ Meninjau
                        </span>
                      ) : item.kktp ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold border border-blue-200">
                          ✓ Terunggah
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-bold border border-rose-150">
                          × Belum
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {item.jurnal ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                          ✓ Terisi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-bold border border-rose-150">
                          × Kosong
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {item.nilai ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                          ✓ Terinput
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-bold border border-rose-150">
                          × Belum
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-1 font-bold text-[10px] rounded-none ${
                        item.status.includes('100%') ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setActiveTab('uploadModul')}
                          title="Tinjau Berkas Perangkat Ajar"
                          className="px-2 py-1 bg-[#004b87] text-white hover:bg-blue-800 font-bold text-[11px] border border-[#004b87] rounded-none transition-all cursor-pointer flex items-center gap-1 shadow-xs active:scale-95"
                        >
                          <FolderUp className="w-3.5 h-3.5" />
                          <span>Tinjau</span>
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

      {/* TAB CONTENT: DIREKTORI GURU */}
      {activeTab === 'direktori' && (
        <div className="bg-white p-5 rounded-none border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Direktori Akun Guru Pengampu Terdaftar</h3>
              <p className="text-xs text-slate-500">Daftar akun pengajar dengan akses ke jurnal, presensi kelas, dan penginputan nilai formatif/sumatif.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari guru atau NIP..."
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-none text-xs w-56 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <button
                type="button"
                onClick={() => onOpenAddUserModal && onOpenAddUserModal('Guru Pengampu')}
                className="px-3 py-1.5 bg-[#004b87] hover:bg-blue-800 text-white rounded-none font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Guru</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3">Nama Pendidik</th>
                  <th className="p-3">Email Akun</th>
                  <th className="p-3">NIP</th>
                  <th className="p-3">Sekolah</th>
                  <th className="p-3">Peran / Jabatan</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Aksi Data Modul</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.map(user => (
                  <tr key={user.uid || user.email} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-800">{user.name}</td>
                    <td className="p-3 font-mono text-slate-600">{user.email}</td>
                    <td className="p-3 text-slate-600">{user.nip || '-'}</td>
                    <td className="p-3 text-slate-700">{user.schoolName || 'SD Negeri 1 SIMAK'}</td>
                    <td className="p-3 font-bold text-emerald-800">{user.role || 'Guru Pengampu'}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-none">
                        {user.status || 'Aktif'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenEditUserModal && onOpenEditUserModal(user)}
                          title="Edit Data Guru"
                          className="px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white font-bold text-[11px] border border-amber-300 rounded-none transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenDeleteUserModal && onOpenDeleteUserModal(user)}
                          title="Hapus Akun Guru"
                          className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white font-bold text-[11px] border border-rose-300 rounded-none transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Hapus</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenModuleModal && onOpenModuleModal(user, 'jurnal')}
                          className="px-2 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-700 hover:text-white font-bold text-[11px] border border-emerald-200 rounded-none transition-all cursor-pointer"
                        >
                          Jurnal
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenModuleModal && onOpenModuleModal(user, 'kelolaNilai')}
                          className="px-2 py-1 bg-blue-50 text-[#004b87] hover:bg-[#004b87] hover:text-white font-bold text-[11px] border border-blue-200 rounded-none transition-all cursor-pointer"
                        >
                          Nilai
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

      {/* MODAL: INPUT / EDIT JURNAL MENGAJAR */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-none shadow-2xl border border-slate-300 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#004b87] text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-sm">
                  {editingLogId ? 'Edit Jurnal Mengajar Harian' : 'Tambah Jurnal Mengajar Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="text-white/80 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLog} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nama Guru Pengampu <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={logFormGuru}
                  onChange={(e) => setLogFormGuru(e.target.value)}
                  placeholder="Contoh: Shahrur Robby, S.Pd."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Mata Pelajaran <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={logFormMapel}
                    onChange={(e) => setLogFormMapel(e.target.value)}
                    placeholder="Contoh: Biologi"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Kelas <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={logFormKelas}
                    onChange={(e) => setLogFormKelas(e.target.value)}
                    placeholder="Contoh: X-IPA 1"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Jam Pelajaran</label>
                <input
                  type="text"
                  value={logFormJam}
                  onChange={(e) => setLogFormJam(e.target.value)}
                  placeholder="Contoh: Jam Ke 1-2 (07.00 - 08.30)"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Tujuan Pembelajaran (TP) / Materi Bahasan</label>
                <textarea
                  rows={2}
                  value={logFormTp}
                  onChange={(e) => setLogFormTp(e.target.value)}
                  placeholder="Ringkasan aktivitas atau materi yang diajarkan..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Jumlah Hadir</label>
                  <input
                    type="number"
                    min={0}
                    value={logFormHadir}
                    onChange={(e) => setLogFormHadir(parseInt(e.target.value) || 0)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Jumlah Absen</label>
                  <input
                    type="number"
                    min={0}
                    value={logFormAbsen}
                    onChange={(e) => setLogFormAbsen(parseInt(e.target.value) || 0)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Status KBM</label>
                  <select
                    value={logFormStatus}
                    onChange={(e) => setLogFormStatus(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-none focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Tuntas">Tuntas</option>
                    <option value="Proses">Proses</option>
                    <option value="Remedial">Remedial</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 rounded-none cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#004b87] hover:bg-blue-800 text-white font-bold rounded-none cursor-pointer shadow-xs active:scale-95 transition-all"
                >
                  Simpan Jurnal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE JURNAL CONFIRMATION */}
      {showDeleteLogModal && logToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-none shadow-2xl border border-slate-300 w-full max-w-sm overflow-hidden flex flex-col">
            <div className="bg-rose-700 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                <h3 className="font-bold text-sm">Konfirmasi Hapus Jurnal</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteLogModal(false)}
                className="text-white/80 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs">
              <p className="text-slate-700">
                Apakah Anda yakin ingin menghapus catatan jurnal mengajar ini?
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800">{logToDelete.guru}</div>
                <div className="text-slate-600">{logToDelete.mapel} ({logToDelete.kelas})</div>
                <div className="text-slate-500 text-[11px]">{logToDelete.tgl} • {logToDelete.jam}</div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowDeleteLogModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 rounded-none cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteLog}
                  className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-none cursor-pointer shadow-xs active:scale-95 transition-all"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
