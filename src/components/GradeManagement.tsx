import React, { useState } from 'react';
import { SaveSuccessModal } from './SaveSuccessModal';
import { Student, Subject, StudentGrade, WeightingConfig, TeacherProfile } from '../types';
import { 
  BookOpenCheck, 
  Sparkles, 
  Download, 
  Save, 
  Sliders, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  FileSpreadsheet,
  FileDown
} from 'lucide-react';
import { generatePdfReport } from '../utils/pdfExport';

interface GradeManagementProps {
  students: Student[];
  subjects: Subject[];
  grades: StudentGrade[];
  selectedClass: string;
  classList?: string[];
  onSelectClass?: (cls: string) => void;
  selectedSubject: Subject;
  onSelectSubject: (subject: Subject) => void;
  onUpdateGrade: (updatedGrade: StudentGrade) => boolean | void;
  onUpdateGradesBatch?: (updatedGrades: StudentGrade[]) => boolean | void;
  teacher?: TeacherProfile;
  onUpdateKktp?: (newKktp: number) => void;
}

export const GradeManagement: React.FC<GradeManagementProps> = ({
  students,
  subjects,
  grades,
  selectedClass,
  classList,
  onSelectClass,
  selectedSubject,
  onSelectSubject,
  onUpdateGrade,
  onUpdateGradesBatch,
  teacher,
  onUpdateKktp
}) => {
  const [weights, setWeights] = useState<WeightingConfig>({ formatif: 40, pts: 30, pas: 30 });
  const [showWeightModal, setShowWeightModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterKktp, setFilterKktp] = useState<'ALL' | 'TUNTAS' | 'REMEDIAL'>('ALL');
  const [loadingAiStudentId, setLoadingAiStudentId] = useState<string | null>(null);
  const [saveSuccessToast, setSaveSuccessToast] = useState<string | null>(null);

  // Filter students for selected class
  const classStudents = students.filter(s => 
    !selectedClass || 
    selectedClass === 'Semua Kelas' || 
    selectedClass === 'SEMUA' || 
    s.className.trim().toLowerCase() === selectedClass.trim().toLowerCase()
  );

  // Helper to get or fallback grade for student
  const getGradeForStudent = (studentId: string): StudentGrade => {
    const found = grades.find(g => g.studentId === studentId && g.subjectId === selectedSubject.id);
    if (found) return found;

    return {
      studentId,
      subjectId: selectedSubject.id,
      tp1: 0, tp2: 0, tp3: 0, tp4: 0,
      pts: 0, pas: 0,
      finalScore: 0,
      predicate: 'D',
      achievementDescription: 'Belum ada deskripsi capaian.'
    };
  };

  // Recalculate Final Score & Predicate based on weights
  const calculateScoreAndPredicate = (tp1: number, tp2: number, tp3: number, tp4: number, pts: number, pas: number) => {
    const formAvg = (tp1 + tp2 + tp3 + tp4) / 4;
    const wForm = weights.formatif / 100;
    const wPts = weights.pts / 100;
    const wPas = weights.pas / 100;

    const finalScore = Math.round((formAvg * wForm) + (pts * wPts) + (pas * wPas));
    let predicate: 'A' | 'B' | 'C' | 'D' = 'C';
    if (finalScore >= 90) predicate = 'A';
    else if (finalScore >= 80) predicate = 'B';
    else if (finalScore >= 70) predicate = 'C';
    else predicate = 'D';

    return { finalScore, predicate };
  };

  // Handle Input Change
  const handleScoreChange = (studentId: string, field: keyof StudentGrade, value: number) => {
    const current = getGradeForStudent(studentId);
    const updated = { ...current, [field]: value };

    const { finalScore, predicate } = calculateScoreAndPredicate(
      field === 'tp1' ? value : updated.tp1,
      field === 'tp2' ? value : updated.tp2,
      field === 'tp3' ? value : updated.tp3,
      field === 'tp4' ? value : updated.tp4,
      field === 'pts' ? value : updated.pts,
      field === 'pas' ? value : updated.pas
    );

    updated.finalScore = finalScore;
    updated.predicate = predicate;

    onUpdateGrade(updated);
  };

  // Trigger Gemini AI Description Generator for a Single Student
  const handleGenerateAiDescription = async (student: Student) => {
    const gr = getGradeForStudent(student.id);
    setLoadingAiStudentId(student.id);

    try {
      const response = await window.mockFetch('/api/ai/catatan-rapor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: student.name,
          nisn: student.nisn,
          className: student.className,
          gender: student.gender,
          grades: [
            { subject: selectedSubject.name, score: gr.finalScore, predicate: gr.predicate }
          ]
        })
      });

      const data = await response.json();
      if (data.success && data.result?.catatanAkademik) {
        onUpdateGrade({
          ...gr,
          achievementDescription: data.result.catatanAkademik
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAiStudentId(null);
    }
  };

  // Filtered list
  const filteredStudents = classStudents.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.nisn.includes(searchQuery);
    const gr = getGradeForStudent(s.id);
    const isTuntas = gr.finalScore >= selectedSubject.kktp;

    if (filterKktp === 'TUNTAS') return matchesSearch && isTuntas;
    if (filterKktp === 'REMEDIAL') return matchesSearch && !isTuntas;
    return matchesSearch;
  });

  // Export CSV
  const handleExportCSV = () => {
    const csvRows = [
      ['No', 'NISN', 'Nama Siswa', 'Mata Pelajaran', 'TP1', 'TP2', 'TP3', 'TP4', 'PTS', 'PAS', 'Nilai Akhir', 'Predikat', 'Status KKTP', 'Deskripsi Capaian'],
      ...classStudents.map((s, idx) => {
        const gr = getGradeForStudent(s.id);
        const tuntas = gr.finalScore >= selectedSubject.kktp ? 'Tuntas' : 'Belum Tuntas';
        return [
          idx + 1,
          `"${s.nisn}"`,
          `"${s.name}"`,
          `"${selectedSubject.name}"`,
          gr.tp1, gr.tp2, gr.tp3, gr.tp4, gr.pts, gr.pas,
          gr.finalScore,
          gr.predicate,
          tuntas,
          `"${gr.achievementDescription}"`
        ];
      })
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Nilai_${selectedSubject.code}_Kelas_${selectedClass}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPdf = () => {
    const tableHeaders = ['No', 'NISN', 'Nama Siswa', 'TP1', 'TP2', 'TP3', 'TP4', 'PTS', 'PAS', 'Nilai Akhir', 'Predikat', 'Status KKTP'];
    const exportList = filteredStudents.length > 0 ? filteredStudents : classStudents;
    const tableRows = exportList.map((s, idx) => {
      const g = getGradeForStudent(s.id);
      return [
        idx + 1,
        s.nisn,
        s.name,
        g.tp1 ?? '-',
        g.tp2 ?? '-',
        g.tp3 ?? '-',
        g.tp4 ?? '-',
        g.pts ?? '-',
        g.pas ?? '-',
        g.finalScore,
        g.predicate,
        g.finalScore >= selectedSubject.kktp ? 'LULUS KKTP' : 'REMEDIAL'
      ];
    });

    const passedCount = classStudents.filter(s => getGradeForStudent(s.id).finalScore >= selectedSubject.kktp).length;
    const passedPct = classStudents.length > 0 ? Math.round((passedCount / classStudents.length) * 100) : 0;
    const totalScoreSum = classStudents.reduce((sum, s) => sum + getGradeForStudent(s.id).finalScore, 0);
    const avgScore = classStudents.length > 0 ? (totalScoreSum / classStudents.length).toFixed(1) : '0';

    generatePdfReport({
      title: `Leger Nilai Olah Asesmen Kelas ${selectedClass}`,
      subtitle: `Mata Pelajaran: ${selectedSubject.name} (${selectedSubject.code}) | Standar KKTP: ${selectedSubject.kktp}`,
      teacherName: teacher?.name,
      teacherNip: teacher?.nip,
      schoolName: teacher?.schoolName,
      principalName: teacher?.principalName,
      principalNip: teacher?.principalNip,
      city: teacher?.city || 'Malang',
      academicYear: teacher?.academicYear,
      semester: teacher?.semester,
      kpiCards: [
        { label: 'Rata-rata Kelas', value: avgScore, subtext: `KKTP Standard: ${selectedSubject.kktp}` },
        { label: 'Ketuntasan KKTP', value: `${passedPct}%`, subtext: `${passedCount} dari ${classStudents.length} Siswa` },
        { label: 'Bobot Formatif / Sumatif', value: `${weights.formatif}% / ${weights.pts + weights.pas}%`, subtext: `PTS: ${weights.pts}% | PAS: ${weights.pas}%` }
      ],
      tableHeaders,
      tableRows,
      notes: 'Leger nilai ini telah diverifikasi dan di-generate berdasarkan data asesmen real-time Kurikulum Merdeka.'
    });
  };

  // Toast save action
  const handleSaveAll = () => {
    const currentGradesList = classStudents.map(st => getGradeForStudent(st.id));
    if (onUpdateGradesBatch) {
      const res = onUpdateGradesBatch(currentGradesList);
      if (res === false) return;
    }
    setSaveSuccessToast(`Berhasil menyimpan nilai kelas ${selectedClass} mapel ${selectedSubject.name}`);
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="bg-white p-4 rounded-none border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Subject Dropdown */}
            <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-none border border-slate-300 text-xs text-slate-700">
              <span className="font-bold text-[#164e63]">Mata Pelajaran:</span>
              <select
                value={selectedSubject.id}
                onChange={(e) => {
                  const sub = subjects.find(s => s.id === e.target.value);
                  if (sub) onSelectSubject(sub);
                }}
                className="bg-white font-bold text-slate-800 px-2 py-0.5 rounded-none border border-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer text-xs"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name} (KKTP: {sub.kktp})</option>
                ))}
              </select>
            </div>

            {/* Standar KKTP Input */}
            <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-none border border-slate-300 text-xs text-slate-700">
              <span className="font-bold text-slate-700">Standar KKTP:</span>
              <input
                type="number"
                min={0}
                max={100}
                value={selectedSubject.kktp}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  if (onUpdateKktp) onUpdateKktp(val);
                }}
                className="w-14 bg-white font-bold text-slate-800 text-center px-2 py-0.5 rounded-none border border-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer text-xs"
              />
            </div>
          </div>
        </div>

        <SaveSuccessModal 
          isOpen={Boolean(saveSuccessToast)} 
          onClose={() => setSaveSuccessToast(null)} 
          title="Data Berhasil Disimpan"
          message={saveSuccessToast || "Data nilai siswa telah berhasil disimpan ke database."}
        />

        {/* Filter Bar and Action Buttons Below Search Column */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari siswa atau NISN..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-xs pl-9 pr-3 py-2 rounded-none focus:outline-none focus:border-cyan-500 text-slate-800"
              />
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFilterKktp('ALL')}
                className={`px-3 py-1.5 rounded-none text-xs font-bold transition-all cursor-pointer ${
                  filterKktp === 'ALL' ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua Siswa ({classStudents.length})
              </button>
              <button
                onClick={() => setFilterKktp('TUNTAS')}
                className={`px-3 py-1.5 rounded-none text-xs font-bold transition-all cursor-pointer ${
                  filterKktp === 'TUNTAS' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tuntas KKTP
              </button>
              <button
                onClick={() => setFilterKktp('REMEDIAL')}
                className={`px-3 py-1.5 rounded-none text-xs font-bold transition-all cursor-pointer ${
                  filterKktp === 'REMEDIAL' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Belum Tuntas (Remedial)
              </button>
            </div>
          </div>

          {/* Action buttons positioned below search column */}
          <div className="flex items-center flex-wrap gap-2 pt-1 border-t border-slate-100">
            {/* Simpan Nilai Button */}
            <button
              onClick={handleSaveAll}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-none text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Save className="w-4 h-4 text-white" />
              <span>Simpan Nilai</span>
            </button>

            {/* Pilih Kelas Dropdown (disebelah kiri tombol Unduh PDF) */}
            <div className="flex items-center space-x-2 bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-none text-xs text-slate-700">
              <span className="font-semibold text-slate-600">Pilih Kelas:</span>
              <select
                value={selectedClass}
                onChange={(e) => onSelectClass && onSelectClass(e.target.value)}
                className="bg-white font-bold text-slate-800 px-2 py-0.5 rounded-none border border-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer text-xs"
              >
                {Array.from(new Set(
                  classList && classList.length > 0
                    ? classList
                    : ['Semua Kelas', ...Array.from(new Set(students.map(s => s.className))).sort()]
                )).map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            {/* Unduh PDF Button */}
            <button
              onClick={handleExportPdf}
              className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-[#164e63] border border-cyan-200 px-4 py-2 rounded-none text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <FileDown className="w-4 h-4 text-[#164e63]" />
              <span>Unduh PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Weighting Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-none max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <h3 className="text-base font-bold text-[#164e63] border-b pb-2 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-600" />
              Pengaturan Bobot Penilaian Rapor
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Bobot Asesmen Formatif (TP1-TP4): {weights.formatif}%</label>
                <input 
                  type="range" min="10" max="70" value={weights.formatif}
                  onChange={(e) => setWeights({ ...weights, formatif: parseInt(e.target.value) })}
                  className="w-full accent-blue-600"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Bobot Sumatif Tengah Semester (PTS): {weights.pts}%</label>
                <input 
                  type="range" min="10" max="60" value={weights.pts}
                  onChange={(e) => setWeights({ ...weights, pts: parseInt(e.target.value) })}
                  className="w-full accent-blue-600"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Bobot Sumatif Akhir Semester (PAS): {weights.pas}%</label>
                <input 
                  type="range" min="10" max="60" value={weights.pas}
                  onChange={(e) => setWeights({ ...weights, pas: parseInt(e.target.value) })}
                  className="w-full accent-blue-600"
                />
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 font-medium bg-slate-50 p-3 rounded-none border border-slate-200">
              Total Bobot: <span className="font-bold text-[#164e63]">{weights.formatif + weights.pts + weights.pas}%</span> (Formula: Nilai Formatif 40% + PTS 30% + PAS 30%)
            </div>

            <button
              onClick={() => setShowWeightModal(false)}
              className="w-full bg-cyan-600 text-white font-bold text-xs py-2 rounded-none hover:bg-cyan-500 transition-colors cursor-pointer"
            >
              Simpan Pengaturan Bobot
            </button>
          </div>
        </div>
      )}

      {/* Main Grade Spreadsheet Table */}
      <div className="bg-white rounded-none border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#164e63] text-slate-200 uppercase tracking-wider text-[11px] font-bold">
                <th className="p-3 border-b border-slate-800 w-10 text-center">No</th>
                <th className="p-3 border-b border-slate-800 min-w-[180px]">Nama Siswa</th>
                <th className="p-3 border-b border-slate-800 text-center w-16">TP1</th>
                <th className="p-3 border-b border-slate-800 text-center w-16">TP2</th>
                <th className="p-3 border-b border-slate-800 text-center w-16">TP3</th>
                <th className="p-3 border-b border-slate-800 text-center w-16">TP4</th>
                <th className="p-3 border-b border-slate-800 text-center w-16">PTS</th>
                <th className="p-3 border-b border-slate-800 text-center w-16">PAS</th>
                <th className="p-3 border-b border-slate-800 text-center w-20">Nilai Akhir</th>
                <th className="p-3 border-b border-slate-800 text-center w-16">Predikat</th>
                <th className="p-3 border-b border-slate-800 min-w-[240px]">Deskripsi Capaian Pembelajaran</th>
                <th className="p-3 border-b border-slate-800 text-center w-24">Aksi AI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={12} className="p-8 text-center text-slate-400 text-xs">
                    Tidak ada siswa yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, index) => {
                  const gr = getGradeForStudent(student.id);
                  const isTuntas = gr.finalScore >= selectedSubject.kktp;
                  const isLoadingThis = loadingAiStudentId === student.id;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 text-center font-bold text-slate-500">{index + 1}</td>
                      <td className="p-3">
                        <div className="font-bold text-[#164e63]">{student.name}</div>
                        <div className="text-[10px] text-slate-400">NISN: {student.nisn}</div>
                      </td>

                      {/* TP1 - TP4 Formatif Inputs */}
                      {(['tp1', 'tp2', 'tp3', 'tp4'] as const).map((tp) => (
                        <td key={tp} className="p-1.5 text-center">
                          <input
                            type="number"
                            min="0" max="100"
                            value={gr[tp]}
                            onChange={(e) => handleScoreChange(student.id, tp, parseInt(e.target.value) || 0)}
                            className="w-12 bg-slate-50 border border-slate-300 rounded-none text-center text-xs font-semibold p-1 focus:bg-white focus:border-cyan-500 focus:outline-none"
                          />
                        </td>
                      ))}

                      {/* PTS & PAS Inputs */}
                      <td className="p-1.5 text-center">
                        <input
                          type="number"
                          min="0" max="100"
                          value={gr.pts}
                          onChange={(e) => handleScoreChange(student.id, 'pts', parseInt(e.target.value) || 0)}
                          className="w-12 bg-amber-50 border border-amber-300 rounded-none text-center text-xs font-bold text-[#164e63] p-1 focus:bg-white focus:border-amber-500 focus:outline-none"
                        />
                      </td>

                      <td className="p-1.5 text-center">
                        <input
                          type="number"
                          min="0" max="100"
                          value={gr.pas}
                          onChange={(e) => handleScoreChange(student.id, 'pas', parseInt(e.target.value) || 0)}
                          className="w-12 bg-amber-50 border border-amber-300 rounded-none text-center text-xs font-bold text-[#164e63] p-1 focus:bg-white focus:border-amber-500 focus:outline-none"
                        />
                      </td>

                      {/* Final Calculated Score */}
                      <td className="p-3 text-center">
                        <span className={`text-sm font-black ${isTuntas ? 'text-cyan-700' : 'text-red-600'}`}>
                          {gr.finalScore}
                        </span>
                      </td>

                      {/* Predicate Badge */}
                      <td className="p-3 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-none ${
                          gr.predicate === 'A' ? 'bg-emerald-100 text-emerald-800' :
                          gr.predicate === 'B' ? 'bg-cyan-100 text-cyan-800' :
                          gr.predicate === 'C' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {gr.predicate}
                        </span>
                      </td>

                      {/* Achievement Description Input */}
                      <td className="p-2">
                        <textarea
                          rows={2}
                          value={gr.achievementDescription}
                          onChange={(e) => onUpdateGrade({ ...gr, achievementDescription: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 text-[11px] p-1.5 rounded-none focus:bg-white focus:border-cyan-500 text-slate-800 leading-tight resize-none"
                        />
                      </td>

                      {/* AI Description Action Button */}
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleGenerateAiDescription(student)}
                          disabled={isLoadingThis}
                          className="flex items-center space-x-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 border border-amber-300 px-2 py-1 rounded-none text-[10px] font-bold transition-all cursor-pointer disabled:opacity-50"
                          title="Generate Deskripsi Capaian Pembelajaran AI"
                        >
                          {isLoadingThis ? (
                            <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
                          ) : (
                            <Sparkles className="w-3 h-3 text-amber-600" />
                          )}
                          <span>{isLoadingThis ? 'AI...' : 'Deskripsi AI'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
