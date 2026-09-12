import React, { useState, useEffect, useRef } from 'react';
import { 
  FolderUp, 
  Upload, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Edit3, 
  Download, 
  ExternalLink, 
  FileCheck, 
  BookOpen, 
  Sparkles, 
  Check, 
  X, 
  FileSpreadsheet, 
  FileCode, 
  Printer, 
  Eye, 
  Link as LinkIcon, 
  Paperclip,
  Layers,
  ChevronRight,
  HelpCircle,
  FolderOpen
} from 'lucide-react';
import { TeacherProfile, Subject, TeacherModuleDocument, ModuleCategory, UserAccount } from '../types';
import { SaveSuccessModal } from './SaveSuccessModal';

interface TeacherModuleUploadViewProps {
  teacher?: TeacherProfile;
  subjects?: Subject[];
  selectedClass?: string;
  isMasterUser?: boolean;
  registeredUsers?: UserAccount[];
}

export const initialDefaultModules: TeacherModuleDocument[] = [
  {
    id: 'MOD-01',
    title: 'Modul Ajar Bab 1: Struktur & Fungsi Seluler Diferensiasi',
    category: 'Modul Ajar (RPP Merdeka)',
    subject: 'Biologi',
    fase: 'Fase E (Kelas X)',
    className: 'X-IPA 1, X-IPA 2',
    semester: 'Ganjil',
    academicYear: '2026/2027',
    teacherName: 'Shahrur Robby, S.Pd.',
    teacherNip: '19900101 201501 1 001',
    fileName: 'Modul_Ajar_Biologi_X_Struktur_Sel_2026.pdf',
    fileSize: '2.4 MB',
    fileType: 'pdf',
    fileUrl: '#',
    uploadedAt: '2026-08-15',
    status: 'Disetujui',
    verificationNotes: 'Sesuai dengan capaian pembelajaran Fase E dan prinsip pembelajaran berdiferensiasi.',
    verifiedBy: 'Waka Kurikulum',
    verifiedAt: '2026-08-18'
  },
  {
    id: 'MOD-02',
    title: 'Alur Tujuan Pembelajaran (ATP) Biologi Fase E Lengkap',
    category: 'Alur Tujuan Pembelajaran (ATP)',
    subject: 'Biologi',
    fase: 'Fase E (Kelas X)',
    className: 'Semua Kelas X',
    semester: 'Semua Semester',
    academicYear: '2026/2027',
    teacherName: 'Shahrur Robby, S.Pd.',
    teacherNip: '19900101 201501 1 001',
    fileName: 'ATP_Biologi_Fase_E_Kurikulum_Merdeka_Rev2026.docx',
    fileSize: '840 KB',
    fileType: 'docx',
    fileUrl: '#',
    uploadedAt: '2026-08-12',
    status: 'Disetujui',
    verificationNotes: 'Alur runtut dari pemahaman sel hingga ekosistem hayati.',
    verifiedBy: 'Tim Pengembang Kurikulum',
    verifiedAt: '2026-08-14'
  },
  {
    id: 'MOD-03',
    title: 'Capaian Pembelajaran (CP) & Analisis Elemen Sains Biologi',
    category: 'Capaian Pembelajaran (CP)',
    subject: 'Biologi',
    fase: 'Fase E (Kelas X)',
    className: 'Semua Kelas X',
    semester: 'Ganjil',
    academicYear: '2026/2027',
    teacherName: 'Shahrur Robby, S.Pd.',
    teacherNip: '19900101 201501 1 001',
    fileName: 'Analisis_CP_Biologi_Fase_E.pdf',
    fileSize: '1.1 MB',
    fileType: 'pdf',
    fileUrl: '#',
    uploadedAt: '2026-08-10',
    status: 'Disetujui',
    verificationNotes: 'Disahkan untuk panduan semester ganjil.',
    verifiedBy: 'Kepala Sekolah',
    verifiedAt: '2026-08-11'
  },
  {
    id: 'MOD-04',
    title: 'Program Tahunan (Prota) & Program Semester (Promes) Ganjil',
    category: 'Program Tahunan (Prota)',
    subject: 'Biologi',
    fase: 'Fase E (Kelas X)',
    className: 'Kelas X',
    semester: 'Ganjil',
    academicYear: '2026/2027',
    teacherName: 'Shahrur Robby, S.Pd.',
    teacherNip: '19900101 201501 1 001',
    fileName: 'Prota_Promes_Biologi_X_2026_2027.xlsx',
    fileSize: '520 KB',
    fileType: 'xlsx',
    fileUrl: '#',
    uploadedAt: '2026-08-16',
    status: 'Disetujui',
    verificationNotes: 'Alokasi pekan efektif 18 minggu telah diverifikasi tepat.',
    verifiedBy: 'Waka Kurikulum',
    verifiedAt: '2026-08-19'
  },
  {
    id: 'MOD-05',
    title: 'Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) & Rubrik Asesmen',
    category: 'Kriteria Ketercapaian TP (KKTP)',
    subject: 'Biologi',
    fase: 'Fase E (Kelas X)',
    className: 'X-IPA 1, X-IPA 2',
    semester: 'Ganjil',
    academicYear: '2026/2027',
    teacherName: 'Shahrur Robby, S.Pd.',
    teacherNip: '19900101 201501 1 001',
    fileName: 'KKTP_Rubrik_Asesmen_Biologi_X.pdf',
    fileSize: '1.7 MB',
    fileType: 'pdf',
    fileUrl: '#',
    uploadedAt: '2026-08-18',
    status: 'Meninjau',
    verificationNotes: 'Sedang dalam antrean verifikasi rubrik deskripsi kualitatif.',
    verifiedBy: 'Tim Kurikulum'
  },
  {
    id: 'MOD-06',
    title: 'LKPD Praktikum Pengamatan Mikroskop & Jaringan Tumbuhan',
    category: 'Lembar Kerja Siswa (LKPD)',
    subject: 'Biologi',
    fase: 'Fase E (Kelas X)',
    className: 'X-IPA 1',
    semester: 'Ganjil',
    academicYear: '2026/2027',
    teacherName: 'Shahrur Robby, S.Pd.',
    teacherNip: '19900101 201501 1 001',
    fileName: 'LKPD_Praktikum_Mikroskop_Sel_2026.pdf',
    fileSize: '3.2 MB',
    fileType: 'pdf',
    fileUrl: '#',
    uploadedAt: '2026-08-20',
    status: 'Disetujui',
    verificationNotes: 'Instruksi K3 laboratorium dan keselamatan kerja sangat lengkap.',
    verifiedBy: 'Waka Kurikulum',
    verifiedAt: '2026-08-21'
  },
  {
    id: 'MOD-07',
    title: 'Kisi-Kisi Soal & Instrumen Asesmen Sumatif Tengah Semester (STS)',
    category: 'Kisi-Kisi / Bank Soal',
    subject: 'Biologi',
    fase: 'Fase E (Kelas X)',
    className: 'Semua Kelas X',
    semester: 'Ganjil',
    academicYear: '2026/2027',
    teacherName: 'Shahrur Robby, S.Pd.',
    teacherNip: '19900101 201501 1 001',
    fileName: 'Kisi_Kisi_STS_Biologi_X_Ganjil.docx',
    fileSize: '610 KB',
    fileType: 'docx',
    fileUrl: '#',
    uploadedAt: '2026-08-22',
    status: 'Meninjau',
    verificationNotes: 'Menunggu review kartu soal level HOTS.'
  }
];

export const TeacherModuleUploadView: React.FC<TeacherModuleUploadViewProps> = ({
  teacher,
  subjects = [],
  selectedClass = 'X-IPA 1',
  isMasterUser = false,
  registeredUsers = []
}) => {
  const [moduleList, setModuleList] = useState<TeacherModuleDocument[]>(() => {
    const saved = ((k: string) => null as any)('simak_teacher_modules');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored modules:', e);
      }
    }
    return initialDefaultModules;
  });

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('Semua');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [filterSubject, setFilterSubject] = useState<string>('Semua');
  const [filterTeacher, setFilterTeacher] = useState<string>('Semua');

  // Modal States
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [moduleToDelete, setModuleToDelete] = useState<TeacherModuleDocument | null>(null);
  const [previewDoc, setPreviewDoc] = useState<TeacherModuleDocument | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState<string>('');
  const [formCategory, setFormCategory] = useState<ModuleCategory>('Modul Ajar (RPP Merdeka)');
  const [formSubject, setFormSubject] = useState<string>(teacher?.subjectRole || 'Biologi');
  const [formFase, setFormFase] = useState<string>('Fase E (Kelas X)');
  const [formClassName, setFormClassName] = useState<string>(selectedClass || 'X-IPA 1');
  const [formSemester, setFormSemester] = useState<'Ganjil' | 'Genap' | 'Semua Semester'>('Ganjil');
  const [formAcademicYear, setFormAcademicYear] = useState<string>(teacher?.academicYear || '2026/2027');
  const [formFile, setFormFile] = useState<File | null>(null);
  const [formFileName, setFormFileName] = useState<string>('');
  const [formDriveUrl, setFormDriveUrl] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formTeacherName, setFormTeacherName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get unique teachers who have uploaded or are in the registered list
  const uniqueTeachers = React.useMemo(() => {
    const list = new Set<string>();
    moduleList.forEach(m => {
      if (m.teacherName) list.add(m.teacherName);
    });
    // Add registered teacher users as well so they are always selectable
    const users = (registeredUsers || []).filter(u => {
      const r = (u.role || '').toLowerCase();
      return !r.includes('kurikulum') && !r.includes('tu') && !r.includes('tata usaha') && !r.includes('siswa') && !r.includes('operator') && !r.includes('administrasi');
    });
    users.forEach(u => {
      if (u.name) list.add(u.name);
    });
    return Array.from(list).sort();
  }, [moduleList, registeredUsers]);

  // Notification Modal
  const [saveSuccessModal, setSaveSuccessModal] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sync to localStorage
  const saveModules = (newList: TeacherModuleDocument[]) => {
    setModuleList(newList);
    ((k: string, v: string) => void 0)('simak_teacher_modules', JSON.stringify(newList));
  };

  // Stats Calculations
  const totalCount = moduleList.length;
  const approvedCount = moduleList.filter(m => m.status === 'Disetujui').length;
  const reviewingCount = moduleList.filter(m => m.status === 'Meninjau').length;
  const revisionCount = moduleList.filter(m => m.status === 'Perlu Revisi').length;
  const compliancePercentage = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingModuleId(null);
    setFormTitle('');
    setFormCategory('Modul Ajar (RPP Merdeka)');
    setFormSubject(teacher?.subjectRole || (subjects[0]?.name || 'Biologi'));
    setFormFase('Fase E (Kelas X)');
    setFormClassName(selectedClass || 'X-IPA 1');
    setFormSemester('Ganjil');
    setFormAcademicYear(teacher?.academicYear || '2026/2027');
    setFormFile(null);
    setFormFileName('');
    setFormDriveUrl('');
    setFormNotes('');
    setFormTeacherName(teacher?.name || '');
    setShowUploadModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: TeacherModuleDocument) => {
    setEditingModuleId(item.id);
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormSubject(item.subject);
    setFormFase(item.fase);
    setFormClassName(item.className);
    setFormSemester(item.semester);
    setFormAcademicYear(item.academicYear);
    setFormFile(null);
    setFormFileName(item.fileName);
    setFormDriveUrl(item.fileUrl && item.fileUrl !== '#' ? item.fileUrl : '');
    setFormNotes(item.verificationNotes || '');
    setFormTeacherName(item.teacherName || '');
    setShowUploadModal(true);
  };

  // File Selector Change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormFile(file);
      setFormFileName(file.name);
      if (!formTitle) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, ' ');
        setFormTitle(cleanName);
      }
    }
  };

  // Save / Upload Module Handler
  const handleSaveModule = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      showToast('Judul Dokumen Perangkat Ajar wajib diisi!', 'error');
      return;
    }

    const currentTeacherName = formTeacherName || teacher?.name || 'Guru Pengampu';
    const matchedUser = (registeredUsers || []).find(u => u.name === currentTeacherName);
    const currentTeacherNip = matchedUser?.nip || teacher?.nip || '-';

    let ext = 'pdf';
    let sizeStr = '1.8 MB';

    if (formFile) {
      const fileNameParts = formFile.name.split('.');
      ext = fileNameParts[fileNameParts.length - 1].toLowerCase();
      const mb = (formFile.size / (1024 * 1024)).toFixed(1);
      sizeStr = `${mb} MB`;
    } else if (formDriveUrl) {
      ext = 'link';
      sizeStr = 'Cloud Link';
    } else if (formFileName) {
      const fileNameParts = formFileName.split('.');
      ext = fileNameParts[fileNameParts.length - 1].toLowerCase();
    }

    if (editingModuleId) {
      const updated = moduleList.map(item => {
        if (item.id === editingModuleId) {
          return {
            ...item,
            title: formTitle.trim(),
            category: formCategory,
            subject: formSubject,
            fase: formFase,
            className: formClassName,
            semester: formSemester,
            academicYear: formAcademicYear,
            teacherName: currentTeacherName,
            teacherNip: currentTeacherNip,
            fileName: formFileName || item.fileName || 'Dokumen_Perangkat_Ajar.pdf',
            fileSize: formFile ? sizeStr : item.fileSize,
            fileType: ext,
            fileUrl: formDriveUrl.trim() || item.fileUrl || '#',
            verificationNotes: formNotes || item.verificationNotes
          };
        }
        return item;
      });
      saveModules(updated);
      setShowUploadModal(false);
      setSaveSuccessMsg(`Perangkat ajar "${formTitle}" berhasil diperbarui.`);
      setSaveSuccessModal(true);
    } else {
      const newDoc: TeacherModuleDocument = {
        id: `MOD-${Date.now().toString().slice(-4)}`,
        title: formTitle.trim(),
        category: formCategory,
        subject: formSubject,
        fase: formFase,
        className: formClassName,
        semester: formSemester,
        academicYear: formAcademicYear,
        teacherName: currentTeacherName,
        teacherNip: currentTeacherNip,
        fileName: formFileName || `${formTitle.replace(/\s+/g, '_')}.${ext}`,
        fileSize: sizeStr,
        fileType: ext,
        fileUrl: formDriveUrl.trim() || '#',
        uploadedAt: new Date().toISOString().split('T')[0],
        status: 'Meninjau',
        verificationNotes: 'Dokumen baru terunggah dan sedang dalam antrean verifikasi tim Kurikulum.',
        schoolName: teacher?.schoolName || 'SD Negeri 1 SIMAK'
      };

      const updated = [newDoc, ...moduleList];
      saveModules(updated);
      setShowUploadModal(false);
      setSaveSuccessMsg(`Dokumen "${formTitle}" berhasil diunggah untuk verifikasi.`);
      setSaveSuccessModal(true);
    }
  };

  // Delete Action
  const handleDeleteClick = (item: TeacherModuleDocument) => {
    setModuleToDelete(item);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (moduleToDelete) {
      const updated = moduleList.filter(m => m.id !== moduleToDelete.id);
      saveModules(updated);
      setShowDeleteModal(false);
      setModuleToDelete(null);
      showToast(`Dokumen "${moduleToDelete.title}" telah dihapus.`, 'info');
    }
  };

  // Filtered List
  const filteredList = moduleList.filter(item => {
    const matchSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.teacherName || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchCategory = filterCategory === 'Semua' || item.category === filterCategory;
    const matchStatus = filterStatus === 'Semua' || item.status === filterStatus;
    const matchSubject = filterSubject === 'Semua' || item.subject === filterSubject;
    const matchTeacher = filterTeacher === 'Semua' || item.teacherName === filterTeacher;

    return matchSearch && matchCategory && matchStatus && matchSubject && matchTeacher;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* KPI Cards / Status Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-none border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-cyan-50 text-[#164e63] rounded-none shrink-0">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Dokumen</div>
            <div className="text-xl font-black text-slate-800">{totalCount} <span className="text-xs font-semibold text-slate-500">File</span></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-none border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-none shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Telah Disetujui</div>
            <div className="text-xl font-black text-emerald-700">{approvedCount} <span className="text-xs font-semibold text-emerald-600">Dokumen</span></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-none border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-none shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dalam Peninjauan</div>
            <div className="text-xl font-black text-amber-700">{reviewingCount} <span className="text-xs font-semibold text-amber-600">Menunggu</span></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-none border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-none shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kelengkapan Ajar</div>
            <div className="text-xl font-black text-indigo-700">{compliancePercentage}% <span className="text-xs font-semibold text-indigo-600">Terverifikasi</span></div>
          </div>
        </div>
      </div>

      {/* Main Filter & Action Card */}
      <div className="bg-white p-5 rounded-none border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul perangkat, materi, topik, atau nama file..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-none text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-none shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Dokumen Baru</span>
            </button>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 cursor-pointer"
            >
              <option value="Semua">Semua Kategori Perangkat</option>
              <option value="Modul Ajar (RPP Merdeka)">Modul Ajar (RPP)</option>
              <option value="Alur Tujuan Pembelajaran (ATP)">ATP</option>
              <option value="Capaian Pembelajaran (CP)">Capaian Pembelajaran (CP)</option>
              <option value="Program Tahunan (Prota)">Prota & Promes</option>
              <option value="Kriteria Ketercapaian TP (KKTP)">KKTP & Rubrik</option>
              <option value="Lembar Kerja Siswa (LKPD)">LKPD Siswa</option>
              <option value="Kisi-Kisi / Bank Soal">Kisi-Kisi / Soal</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 cursor-pointer"
            >
              <option value="Semua">Semua Status Verifikasi</option>
              <option value="Disetujui">Disetujui (Valid)</option>
              <option value="Meninjau">Meninjau (Antrean)</option>
              <option value="Perlu Revisi">Perlu Revisi</option>
            </select>

            <select
              value={filterTeacher}
              onChange={(e) => setFilterTeacher(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-[#164e63]/30 text-[#164e63] rounded-none text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-600 cursor-pointer bg-cyan-50/50"
            >
              <option value="Semua">🔍 Semua Guru Pengampu</option>
              {uniqueTeachers.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Documents Table */}
        <div className="overflow-x-auto border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-3">Judul Perangkat Ajar</th>
                <th className="p-3">Guru Pengampu</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Mapel & Kelas</th>
                <th className="p-3">File Dokumen</th>
                <th className="p-3">Tgl Upload</th>
                <th className="p-3 text-center">Status Verifikasi</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length > 0 ? (
                filteredList.map((item) => {
                  const isApproved = item.status === 'Disetujui';
                  const isReview = item.status === 'Meninjau';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      {/* Judul & Detail */}
                      <td className="p-3 max-w-xs">
                        <div className="font-bold text-slate-800 line-clamp-1">{item.title}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-semibold text-cyan-700">{item.fase}</span>
                          <span>•</span>
                          <span>Sem. {item.semester}</span>
                        </div>
                      </td>

                      {/* Guru Pengampu */}
                      <td className="p-3 max-w-[150px]">
                        <div className="font-bold text-[#164e63] truncate">{item.teacherName || 'Guru Pengampu'}</div>
                        {item.teacherNip && item.teacherNip !== '-' && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">NIP {item.teacherNip}</div>
                        )}
                      </td>

                      {/* Kategori Badge */}
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 border border-cyan-200 font-semibold text-[11px] rounded-none">
                          {item.category}
                        </span>
                      </td>

                      {/* Mapel & Kelas */}
                      <td className="p-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{item.subject}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{item.className}</div>
                      </td>

                      {/* File Name & Size */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-slate-100 text-slate-600 rounded-none shrink-0">
                            {item.fileType === 'pdf' ? (
                              <FileText className="w-4 h-4 text-rose-600" />
                            ) : item.fileType === 'xlsx' ? (
                              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                            ) : item.fileType === 'link' ? (
                              <LinkIcon className="w-4 h-4 text-cyan-600" />
                            ) : (
                              <FileText className="w-4 h-4 text-cyan-600" />
                            )}
                          </div>
                          <div className="overflow-hidden max-w-[180px]">
                            <div className="font-mono text-[11px] text-slate-700 truncate font-semibold">{item.fileName}</div>
                            <div className="text-[10px] text-slate-400">{item.fileSize || '1.5 MB'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Tanggal Upload */}
                      <td className="p-3 text-slate-600 whitespace-nowrap font-mono text-[11px]">
                        {item.uploadedAt}
                      </td>

                      {/* Status Verifikasi Badge */}
                      <td className="p-3 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-none border ${
                          isApproved
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : isReview
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-rose-50 text-rose-700 border-rose-300'
                        }`}>
                          {isApproved ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : isReview ? (
                            <Clock className="w-3 h-3 text-amber-600" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                          )}
                          <span>{item.status}</span>
                        </span>
                        {item.verifiedBy && (
                          <div className="text-[9px] text-slate-400 mt-0.5">oleh {item.verifiedBy}</div>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="p-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(item)}
                            title="Lihat Detail & Catatan Verifikasi"
                            className="p-1.5 bg-cyan-50 text-[#164e63] hover:bg-[#164e63] hover:text-white rounded-none border border-cyan-200 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            title="Edit Data Perangkat"
                            className="p-1.5 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white rounded-none border border-amber-200 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteClick(item)}
                            title="Hapus Dokumen"
                            className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white rounded-none border border-rose-200 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 bg-slate-50/50">
                    <FolderUp className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-xs text-slate-700">Tidak ada dokumen perangkat ajar yang cocok</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Klik tombol "Upload Dokumen Baru" untuk menambahkan modul ajar atau ATP.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Pedoman Kurikulum Merdeka Card */}
      <div className="bg-slate-50 p-4 rounded-none border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
        <HelpCircle className="w-5 h-5 text-[#164e63] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-slate-800">Pedoman Pengunggahan Perangkat Ajar Mandiri (Kurikulum Merdeka):</span>
          <p className="text-[11px] leading-relaxed text-slate-600">
            Setiap guru pengampu wajib mengunggah Modul Ajar (RPP Berdiferensiasi), ATP, Capaian Pembelajaran (CP), dan KKTP sebelum dimulainya semester baru. Format file yang didukung mencakup dokumen PDF, Word (.docx), Excel (.xlsx), atau tautan Google Drive terbagi. Seluruh berkas yang diunggah akan ditinjau langsung oleh Wakil Kepala Sekolah Bidang Kurikulum.
          </p>
        </div>
      </div>

      {/* MODAL: Upload / Edit Perangkat Ajar */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-none max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-50 text-[#164e63] rounded-none shrink-0">
                  <FolderUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">
                    {editingModuleId ? 'Edit Perangkat Pembelajaran' : 'Upload Modul Ajar / ATP Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">Unggah berkas resmi Kurikulum Merdeka untuk verifikasi</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveModule} className="space-y-4 overflow-y-auto pr-1 flex-1">
              <div className="space-y-3">
                {/* Judul */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Judul / Topik Perangkat Ajar *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Contoh: Modul Ajar Bab 2: Keanekaragaman Hayati & Ekosistem"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white"
                  />
                </div>

                {/* Guru Pengampu / Pemilik Berkas */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Guru Pengampu / Pemilik Berkas *</label>
                  {uniqueTeachers.length > 0 ? (
                    <select
                      required
                      value={formTeacherName}
                      onChange={(e) => setFormTeacherName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white cursor-pointer text-[#164e63] font-bold"
                    >
                      <option value="">-- Pilih Guru Pengampu --</option>
                      {uniqueTeachers.map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={formTeacherName}
                      onChange={(e) => setFormTeacherName(e.target.value)}
                      placeholder="Contoh: Shahrur Robby, S.Pd."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white text-[#164e63] font-bold"
                    />
                  )}
                </div>

                {/* Jenis Dokumen & Mata Pelajaran */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Perangkat Ajar *</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as ModuleCategory)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white cursor-pointer"
                    >
                      <option value="Modul Ajar (RPP Merdeka)">Modul Ajar (RPP Merdeka)</option>
                      <option value="Alur Tujuan Pembelajaran (ATP)">Alur Tujuan Pembelajaran (ATP)</option>
                      <option value="Capaian Pembelajaran (CP)">Capaian Pembelajaran (CP)</option>
                      <option value="Program Tahunan (Prota)">Program Tahunan (Prota)</option>
                      <option value="Program Semester (Promes)">Program Semester (Promes)</option>
                      <option value="Kriteria Ketercapaian TP (KKTP)">Kriteria Ketercapaian TP (KKTP)</option>
                      <option value="Lembar Kerja Siswa (LKPD)">Lembar Kerja Siswa (LKPD)</option>
                      <option value="Kisi-Kisi / Bank Soal">Kisi-Kisi / Bank Soal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran *</label>
                    <input
                      type="text"
                      required
                      value={formSubject}
                      onChange={(e) => setFormSubject(e.target.value)}
                      placeholder="Contoh: Biologi"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Fase & Kelas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Fase Pembelajaran</label>
                    <select
                      value={formFase}
                      onChange={(e) => setFormFase(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white cursor-pointer"
                    >
                      <option value="Fase A (Kelas 1-2 SD)">Fase A (Kelas 1-2 SD)</option>
                      <option value="Fase B (Kelas 3-4 SD)">Fase B (Kelas 3-4 SD)</option>
                      <option value="Fase C (Kelas 5-6 SD)">Fase C (Kelas 5-6 SD)</option>
                      <option value="Fase D (Kelas VII-IX SMP)">Fase D (Kelas VII-IX SMP)</option>
                      <option value="Fase E (Kelas X)">Fase E (Kelas X SMA/SMK)</option>
                      <option value="Fase F (Kelas XI-XII)">Fase F (Kelas XI-XII SMA/SMK)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Sasaran Kelas</label>
                    <input
                      type="text"
                      value={formClassName}
                      onChange={(e) => setFormClassName(e.target.value)}
                      placeholder="Contoh: X-IPA 1, X-IPA 2 atau Semua Kelas X"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Semester & Tahun Ajaran */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Semester</label>
                    <select
                      value={formSemester}
                      onChange={(e) => setFormSemester(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white cursor-pointer"
                    >
                      <option value="Ganjil">Semester Ganjil</option>
                      <option value="Genap">Semester Genap</option>
                      <option value="Semua Semester">Semua Semester (1 Tahun)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tahun Ajaran</label>
                    <input
                      type="text"
                      value={formAcademicYear}
                      onChange={(e) => setFormAcademicYear(e.target.value)}
                      placeholder="2026/2027"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Upload File Zone */}
                <div className="border-2 border-dashed border-slate-300 p-4 bg-slate-50 rounded-none text-center space-y-2 hover:bg-slate-100/70 transition-colors">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx"
                    className="hidden"
                  />
                  <div className="flex flex-col items-center">
                    <Upload className="w-8 h-8 text-[#164e63] mb-1" />
                    <p className="text-xs font-bold text-slate-800">
                      {formFileName ? formFileName : 'Pilih Berkas Dokumen (PDF, Word, Excel, PPT)'}
                    </p>
                    <p className="text-[11px] text-slate-500">Maksimal ukuran file: 25 MB</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 px-3 py-1.5 bg-[#164e63] hover:bg-cyan-800 text-white font-bold text-xs rounded-none cursor-pointer"
                    >
                      {formFileName ? 'Ganti Berkas' : 'Pilih File Dari Komputer'}
                    </button>
                  </div>
                </div>

                {/* Atau Tautan Drive */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Atau Tautan Google Drive / Cloud URL (Opsional)
                  </label>
                  <div className="relative">
                    <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="url"
                      value={formDriveUrl}
                      onChange={(e) => setFormDriveUrl(e.target.value)}
                      placeholder="https://drive.google.com/file/d/..."
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Catatan Tambahan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Catatan / Deskripsi Tambahan</label>
                  <textarea
                    rows={2}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Contoh: Modul dilengkapi dengan asesmen diagnostik awal dan rubrik portofolio praktikum."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2 shrink-0 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-none transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#164e63] hover:bg-cyan-800 text-white rounded-none text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>{editingModuleId ? 'Simpan Perubahan' : 'Upload Sekarang'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Preview & Detail Verifikasi */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-none max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-50 text-[#164e63] rounded-none">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">{previewDoc.title}</h3>
                  <p className="text-xs text-slate-500">{previewDoc.category} • {previewDoc.subject}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 border border-slate-200">
                <div>
                  <span className="text-slate-500 font-medium">Guru Pengampu:</span>
                  <div className="font-bold text-slate-800">{previewDoc.teacherName}</div>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Sasaran Fase & Kelas:</span>
                  <div className="font-bold text-slate-800">{previewDoc.fase} ({previewDoc.className})</div>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Semester & Tahun:</span>
                  <div className="font-bold text-slate-800">Sem. {previewDoc.semester} ({previewDoc.academicYear})</div>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Nama File & Ukuran:</span>
                  <div className="font-bold text-cyan-700 font-mono">{previewDoc.fileName} ({previewDoc.fileSize})</div>
                </div>
              </div>

              {/* Status Box */}
              <div className={`p-4 border ${
                previewDoc.status === 'Disetujui'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : previewDoc.status === 'Meninjau'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                <div className="flex items-center gap-2 font-bold text-xs mb-1">
                  {previewDoc.status === 'Disetujui' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-600" />
                  )}
                  <span>Status Verifikasi: {previewDoc.status}</span>
                </div>
                <p className="text-[11px] leading-relaxed mt-1 text-slate-700">
                  {previewDoc.verificationNotes || 'Belum ada catatan evaluasi dari tim Kurikulum.'}
                </p>
                {previewDoc.verifiedBy && (
                  <div className="text-[10px] text-slate-500 font-semibold mt-2">
                    Diverifikasi oleh: {previewDoc.verifiedBy} {previewDoc.verifiedAt && `pada ${previewDoc.verifiedAt}`}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-none cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('Mengunduh dokumen perangkat ajar...', 'info');
                  setPreviewDoc(null);
                }}
                className="px-4 py-2 bg-[#164e63] hover:bg-cyan-800 text-white text-xs font-bold rounded-none flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Dokumen</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Konfirmasi Hapus */}
      {showDeleteModal && moduleToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-none max-w-md w-full p-5 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-50 rounded-none">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Hapus Dokumen Perangkat Ajar</h3>
            </div>
            <p className="text-xs text-slate-600">
              Apakah Anda yakin ingin menghapus dokumen <strong className="text-slate-800">"{moduleToDelete.title}"</strong>? Berkas yang dihapus tidak dapat dipulihkan kembali.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-none cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-none shadow-xs cursor-pointer"
              >
                Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-white border border-emerald-200 shadow-2xl rounded-none p-3.5 sm:p-4 flex items-center gap-3.5 animate-in fade-in zoom-in-90 slide-in-from-top-6 duration-300">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow-md text-white ${
            toastMessage.type === 'success' ? 'bg-emerald-500 ring-4 ring-emerald-100' :
            toastMessage.type === 'error' ? 'bg-rose-500 ring-4 ring-rose-100' : 'bg-cyan-600 ring-4 ring-cyan-100'
          }`}>
            {toastMessage.type === 'success' ? (
              <Check className="w-6 h-6 stroke-[3]" />
            ) : toastMessage.type === 'error' ? (
              <AlertCircle className="w-6 h-6" />
            ) : (
              <Sparkles className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span>{toastMessage.type === 'success' ? 'Data Berhasil Disimpan!' : 'Pemberitahuan Sistem'}</span>
              {toastMessage.type === 'success' && <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
            </div>
            <p className="text-[11px] text-slate-600 font-semibold">{toastMessage.text}</p>
          </div>
        </div>
      )}

      {/* Save Success Modal */}
      <SaveSuccessModal
        isOpen={saveSuccessModal}
        onClose={() => setSaveSuccessModal(false)}
        title="Dokumen Berhasil Diunggah"
        message={saveSuccessMsg || "Dokumen perangkat ajar telah tersimpan dan siap diverifikasi oleh kurikulum."}
      />
    </div>
  );
};
