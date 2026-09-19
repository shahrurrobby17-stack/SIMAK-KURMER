import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { SaveSuccessModal } from './SaveSuccessModal';
import { Student, StudentGrade, Subject, AttendanceRecord, TeacherProfile } from '../types';
import { 
  GraduationCap, 
  Search, 
  UserPlus, 
  FileText, 
  CheckCircle2, 
  Printer, 
  User, 
  Calendar,
  X,
  Trash2,
  AlertTriangle,
  FileDown,
  Eye,
  Users,
  Upload,
  FileSpreadsheet
} from 'lucide-react';
import { generatePdfReport } from '../utils/pdfExport';

interface StudentRosterProps {
  students: Student[];
  grades: StudentGrade[];
  subjects: Subject[];
  attendanceRecords: AttendanceRecord[];
  selectedClass: string;
  classList?: string[];
  onSelectClass?: (className: string) => void;
  onAddStudent: (newStudent: Student) => boolean | void;
  onUpdateStudents?: (updatedStudents: Student[]) => boolean | void;
  onDeleteStudent?: (studentId: string) => boolean | void;
  onOpenReportCard: (student: Student) => void;
  teacher?: TeacherProfile;
}

export const StudentRoster: React.FC<StudentRosterProps> = ({
  students,
  grades,
  subjects,
  attendanceRecords,
  selectedClass,
  classList,
  onSelectClass,
  onAddStudent,
  onUpdateStudents,
  onDeleteStudent,
  onOpenReportCard,
  teacher
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [manualClass, setManualClass] = useState<string>('');

  // New Student Form State
  const [newForm, setNewForm] = useState({
    name: '',
    gender: 'L' as 'L' | 'P'
  });

  // Keep targetClass in sync with selectedClass unless user manually selects something else
  const currentActiveFilter = manualClass !== '' ? manualClass : (selectedClass !== 'Semua Kelas' && selectedClass !== 'SEMUA' ? selectedClass : '');
  const targetClass = currentActiveFilter;

  const classStudents = students.filter(s => {
    if (!targetClass || targetClass === 'Semua Kelas' || targetClass === 'SEMUA') {
      return true;
    }
    return s.className.trim().toLowerCase() === targetClass.trim().toLowerCase();
  });
  const filteredStudents = classStudents.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.nis && s.nis.includes(searchQuery))
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name) return;

    const generatedNisn = `00${Math.floor(10000000 + Math.random() * 90000000)}`;
    const generatedNis = `2425${Math.floor(1000 + Math.random() * 9000)}`;

    const fallbackClass = targetClass || (selectedClass !== 'Semua Kelas' && selectedClass !== 'SEMUA' ? selectedClass : (students[0]?.className || 'Kelas 1'));

    const newStudent: Student = {
      id: `STD-${Date.now().toString().slice(-4)}`,
      nis: '',
      nisn: '',
      name: newForm.name,
      gender: newForm.gender,
      className: fallbackClass,
      parentName: '-',
      parentPhone: '-',
      status: 'Aktif'
    };

    const res = onAddStudent(newStudent);
    if (res !== false) {
      setShowAddModal(false);
      setNewForm({ name: '', gender: 'L' });
      setSaveSuccess(true);
    }
  };

  // Student Attendance Stats Calculation
  const getStudentAttendanceStats = (studentId: string) => {
    const studentRecs = attendanceRecords.filter(r => r.studentId === studentId);
    const total = studentRecs.length || 1;
    const hadir = studentRecs.filter(r => r.status === 'HADIR').length;
    const izin = studentRecs.filter(r => r.status === 'IZIN').length;
    const sakit = studentRecs.filter(r => r.status === 'SAKIT').length;
    const alpa = studentRecs.filter(r => r.status === 'ALPA').length;
    const rate = Math.round((hadir / total) * 100);

    return { total, hadir, izin, sakit, alpa, rate };
  };

  // Student GPA / Average calculation
  const getStudentAverageScore = (studentId: string) => {
    const sGrades = grades.filter(g => g.studentId === studentId);
    if (sGrades.length === 0) return 78;
    const sum = sGrades.reduce((acc, g) => acc + g.finalScore, 0);
    return Math.round(sum / sGrades.length);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        if (data.length === 0) {
          alert('Data kosong!');
          return;
        }

        const newStudents: Student[] = data.map((rawRow: any) => {
          // Normalize keys to lowercase without spaces for flexible matching
          const row: Record<string, any> = {};
          Object.keys(rawRow).forEach(key => {
            const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
            row[normalizedKey] = rawRow[key];
          });

          return {
            id: `STU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            nis: (row['nis'] || row['nomorinduk'] || row['nipd'] || '').toString().trim(),
            nisn: (row['nisn'] || '').toString().trim(),
            name: (row['namasiswa'] || row['nama'] || row['name'] || row['namalengkap'] || row['pesertadidik'] || '').toString().trim(),
            gender: ((row['lp'] || row['jk'] || row['gender'] || row['jeniskelamin'] || row['kelamin'] || 'L').toString().toUpperCase().startsWith('P') ? 'P' : 'L') as 'P' | 'L',
            className: selectedClass,
            status: 'Aktif' as const,
            parentName: (row['namaorangtua'] || row['namaayah'] || row['namaibu'] || row['wali'] || row['orangtuasiswa'] || '-').toString().trim(),
            parentPhone: (row['telepon'] || row['nohp'] || row['nohporangtua'] || row['hp'] || '-').toString().trim(),
            schoolName: teacher?.schoolName || 'SD Negeri 1 SIMAK'
          };
        }).filter(s => s.name !== '');

        if (newStudents.length > 0) {
          if (onUpdateStudents) {
            onUpdateStudents([...students, ...newStudents]);
          } else {
            // fallback
            newStudents.forEach(st => onAddStudent(st));
          }
          setSaveSuccess(true);
        }
      } catch (err) {
        console.error('Error importing Excel:', err);
        alert('Gagal mengimpor file Excel. Pastikan format file sesuai.');
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExportPdf = () => {
    const tableHeaders = ['No', 'Nama Lengkap', 'L/P', 'Kelas', 'Status'];
    const exportList = filteredStudents.length > 0 ? filteredStudents : classStudents;
    const tableRows = exportList.map((s, idx) => [
      idx + 1,
      s.name,
      s.gender === 'L' ? 'Laki-laki' : 'Perempuan',
      s.className,
      s.status || 'Aktif'
    ]);

    const maleCount = exportList.filter(s => s.gender === 'L').length;
    const femaleCount = exportList.filter(s => s.gender === 'P').length;

    generatePdfReport({
      title: `Daftar Induk Peserta Didik ${targetClass ? `Kelas ${targetClass}` : 'Semua Kelas'}`,
      subtitle: `Total Siswa: ${exportList.length} Peserta Didik (${maleCount} Laki-laki, ${femaleCount} Perempuan)`,
      teacherName: teacher?.name,
      teacherNip: teacher?.nip,
      schoolName: teacher?.schoolName,
      principalName: teacher?.principalName,
      principalNip: teacher?.principalNip,
      city: teacher?.city || 'Malang',
      academicYear: teacher?.academicYear,
      semester: teacher?.semester,
      kpiCards: [
        { label: 'Total Peserta Didik', value: `${exportList.length} Siswa`, subtext: `${targetClass ? `Kelas ${targetClass}` : 'Semua Kelas'}` },
        { label: 'Laki-laki (L)', value: `${maleCount} Siswa`, subtext: `${exportList.length ? Math.round((maleCount/exportList.length)*100) : 0}%` },
        { label: 'Perempuan (P)', value: `${femaleCount} Siswa`, subtext: `${exportList.length ? Math.round((femaleCount/exportList.length)*100) : 0}%` }
      ],
      tableHeaders,
      tableRows,
      notes: 'Dokumen ini merupakan Daftar Induk resmi Rombongan Belajar berdasarkan data real-time.'
    });
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="bg-white p-4 rounded-none border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari nama siswa..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-xs pl-9 pr-3 py-2 rounded-none focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div className="text-xs font-bold text-slate-500 whitespace-nowrap hidden sm:block">
            Total: <span className="text-cyan-700 font-extrabold">{filteredStudents.length}</span> Siswa
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2 shrink-0 justify-end">
          {/* Filter / Pilih Kelas Dropdown (Di sebelah kiri Unduh PDF) */}
          <div className="inline-flex items-center gap-1.5 h-9 shrink-0">
            <span className="text-xs font-bold text-slate-600 shrink-0">Pilih Kelas:</span>
            <select
              value={targetClass || ''}
              onChange={(e) => {
                const newCls = e.target.value;
                setManualClass(newCls);
                if (onSelectClass) {
                  onSelectClass(newCls || 'Semua Kelas');
                }
              }}
              className="h-9 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-xs px-3 rounded-none focus:outline-none focus:border-cyan-500 text-slate-800 font-semibold cursor-pointer shrink-0"
            >
              <option value="">Semua Kelas</option>
              {Array.from(new Set([...(classList || []), ...students.map(s => s.className)])).filter(c => Boolean(c) && c !== 'Semua Kelas' && c !== 'SEMUA').sort().map(cls => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            ref={fileInputRef}
            onChange={handleImportExcel}
            className="hidden"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-9 px-3.5 inline-flex items-center justify-center space-x-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-none text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs shrink-0"
            title="Impor Data Siswa Excel/CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Impor Xlsx</span>
          </button>

          {/* Unduh PDF Button */}
          <button
            type="button"
            onClick={handleExportPdf}
            className="h-9 px-3.5 inline-flex items-center justify-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-none text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs shrink-0"
            title="Unduh Laporan Data Siswa PDF"
          >
            <FileDown className="w-4 h-4 text-amber-600" />
            <span>Unduh PDF</span>
          </button>

          {/* Tambah Siswa Baru Button */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="h-9 px-4 inline-flex items-center justify-center space-x-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 rounded-none text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4 text-slate-950" />
            <span>Tambah Siswa Baru</span>
          </button>
        </div>
      </div>

      {/* Student Data Table */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-transparent text-slate-500 font-medium border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 text-center w-12">No</th>
                <th className="py-3 px-4 min-w-[200px]">Nama Siswa</th>
                <th className="py-3 px-4 text-center w-16">L/P</th>
                <th className="py-3 px-4 text-center w-24">Kelas</th>
                <th className="py-3 px-4 text-center w-28">Rata-rata Nilai</th>
                <th className="py-3 px-4 text-center w-32">Presensi</th>
                <th className="py-3 px-4 text-center w-24">Status</th>
                <th className="py-3 px-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, idx) => {
                  const attStats = getStudentAttendanceStats(student.id);
                  const avgScore = getStudentAverageScore(student.id);

                  // Validate student data
                  const isNisnValid = Boolean(student.nisn && student.nisn.trim().length >= 10 && !student.nisn.startsWith('0000'));
                  const hasName = Boolean(student.name && student.name.trim());
                  const hasClass = Boolean(student.className && student.className.trim());
                  
                  let studentErrorReason = '';
                  if (!hasName) studentErrorReason = 'Nama siswa kosong';
                  else if (!hasClass) studentErrorReason = 'Kelas belum ditentukan';
                  else if (!student.nisn || !student.nisn.trim()) studentErrorReason = 'NISN belum diisi';
                  else if (student.nisn.trim().length < 10) studentErrorReason = `NISN < 10 digit (${student.nisn.trim().length} digit)`;
                  else if (student.nisn.startsWith('0000')) studentErrorReason = 'NISN format contoh (0000)';

                  const isInvalid = Boolean(studentErrorReason);

                  return (
                    <tr 
                      key={student.id} 
                      className={`transition-colors group ${
                        isInvalid 
                          ? 'bg-rose-50/60 hover:bg-rose-100/60 border-l-4 border-l-rose-600' 
                          : 'hover:bg-slate-50/70 bg-white'
                      }`}
                    >
                      <td className="py-3 px-4 text-center font-medium text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isInvalid ? 'bg-rose-200 text-rose-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span 
                                className={`font-bold text-xs block cursor-pointer transition-colors ${
                                  isInvalid ? 'text-rose-900 hover:text-rose-700' : 'text-slate-800 hover:text-cyan-600'
                                }`} 
                                onClick={() => setSelectedStudentDetail(student)}
                              >
                                {student.name}
                              </span>
                              {isInvalid && (
                                <span 
                                  title={studentErrorReason}
                                  className="px-1.5 py-0.5 text-[9px] font-bold bg-rose-200 text-rose-900 border border-rose-300"
                                >
                                  Error: {studentErrorReason}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                              <span>NISN: {student.nisn || '-'}</span>
                              <span>•</span>
                              <span>ID: {student.id}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-[11px] font-medium text-slate-600">
                          {student.gender === 'L' ? 'L' : 'P'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-slate-600">
                        {student.className}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-semibold text-slate-700">
                          {avgScore}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className={`font-semibold text-xs ${
                            attStats.rate >= 90 ? 'text-emerald-600' : attStats.rate >= 75 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {attStats.rate}%
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {attStats.hadir}/{attStats.total} Ptm
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isInvalid ? (
                          <div className="flex flex-col items-center">
                            <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
                              Error
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-700 rounded-none">
                            {student.status || 'Aktif'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setSelectedStudentDetail(student)}
                            className="text-slate-400 hover:text-cyan-600 transition-colors cursor-pointer"
                            title="Lihat Detail Profil"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {onDeleteStudent && (
                            <button
                              onClick={() => setStudentToDelete(student)}
                              className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                              title="Hapus Data Siswa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <p className="font-bold text-slate-700">Tidak ada data siswa ditemukan</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {searchQuery ? `Tidak ada hasil untuk pencarian "${searchQuery}"` : `Belum ada siswa terdaftar di kelas ${targetClass || selectedClass}`}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Stats Summary */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-semibold">
              Total Ditampilkan: <strong className="text-[#164e63]">{filteredStudents.length}</strong> Siswa
            </span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span>
              Laki-laki: <strong className="text-cyan-700">{filteredStudents.filter(s => s.gender === 'L').length}</strong>
            </span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span>
              Perempuan: <strong className="text-pink-700">{filteredStudents.filter(s => s.gender === 'P').length}</strong>
            </span>
          </div>

          <div className="text-[11px] text-slate-500">
            Daftar Siswa Kelas <strong className="text-slate-800">{targetClass || 'Semua Kelas'}</strong>
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-none max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-base font-bold text-[#164e63] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-cyan-600" />
                Tambah Siswa Kelas {targetClass || selectedClass || 'Baru'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Siswa *</label>
                <input 
                  type="text" required
                  placeholder="Contoh: Muhammad Fajar Kurniawan"
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 p-2 rounded-none focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Jenis Kelamin *</label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input 
                      type="radio" name="gender" value="L" 
                      checked={newForm.gender === 'L'} 
                      onChange={() => setNewForm({ ...newForm, gender: 'L' })}
                      className="accent-blue-600"
                    />
                    <span>Laki-laki</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input 
                      type="radio" name="gender" value="P" 
                      checked={newForm.gender === 'P'} 
                      onChange={() => setNewForm({ ...newForm, gender: 'P' })}
                      className="accent-pink-600"
                    />
                    <span>Perempuan</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full bg-slate-100 text-slate-700 font-bold py-2 rounded-none hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full bg-cyan-600 text-white font-bold py-2 rounded-none hover:bg-cyan-500 transition-colors cursor-pointer"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Detail Drawer */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-none max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-none bg-[#164e63] text-amber-400 font-black text-xl flex items-center justify-center">
                  {selectedStudentDetail.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#164e63]">{selectedStudentDetail.name}</h3>
                  <p className="text-xs text-slate-500">
                    Kelas: {selectedStudentDetail.className} | Status: {selectedStudentDetail.status || 'Aktif'}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedStudentDetail(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Academic Breakdown */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] text-cyan-700">
                Nilai Capaian Mata Pelajaran (Semester Ganjil)
              </h4>
              <div className="border border-slate-200 rounded-none overflow-hidden divide-y divide-slate-100">
                {subjects.map((sub) => {
                  const sGrade = grades.find(g => g.studentId === selectedStudentDetail.id && g.subjectId === sub.id);
                  const score = sGrade?.finalScore || 75;
                  const pred = sGrade?.predicate || 'C';

                  return (
                    <div key={sub.id} className="p-2.5 flex justify-between items-center bg-slate-50/50">
                      <div>
                        <span className="font-bold text-[#164e63]">{sub.name}</span>
                        <div className="text-[10px] text-slate-400">KKTP Min: {sub.kktp}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-cyan-700 text-sm">{score}</span>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-none">
                          Predikat {pred}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center gap-2">
              {onDeleteStudent ? (
                <button
                  onClick={() => {
                    const st = selectedStudentDetail;
                    setSelectedStudentDetail(null);
                    setStudentToDelete(st);
                  }}
                  className="bg-red-50 text-red-600 border border-red-200 font-bold text-xs px-3 py-2 rounded-none hover:bg-red-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Siswa</span>
                </button>
              ) : <div />}

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedStudentDetail(null)}
                  className="bg-slate-100 text-slate-700 font-bold text-xs px-4 py-2 rounded-none hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Student Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-none max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-100 rounded-none">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#164e63]">Hapus Data Siswa</h3>
                <p className="text-xs text-slate-500">Konfirmasi Penghapusan</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus <strong className="text-[#164e63]">{studentToDelete.name}</strong> dari daftar siswa kelas {studentToDelete.className}? Data nilai dan rekap presensi siswa ini juga akan dibersihkan.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setStudentToDelete(null)}
                className="flex-1 bg-slate-100 text-slate-700 font-bold py-2 rounded-none hover:bg-slate-200 transition-colors cursor-pointer text-xs"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (onDeleteStudent && studentToDelete) {
                    onDeleteStudent(studentToDelete.id);
                  }
                  setStudentToDelete(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-none transition-colors cursor-pointer text-xs flex items-center justify-center gap-1.5 shadow-md shadow-red-600/20"
              >
                <Trash2 className="w-3.5 h-3.5 text-white" />
                <span>Hapus Siswa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animated Save Success Modal */}
      <SaveSuccessModal 
        isOpen={saveSuccess} 
        onClose={() => setSaveSuccess(false)} 
        title="Data Berhasil Disimpan"
        message="Data siswa baru telah berhasil disimpan ke daftar rombel dan database."
      />
    </div>
  );
};
