import React, { useState } from 'react';
import { Student, StudentGrade, Subject, TeacherProfile, AttendanceRecord } from '../types';
import { 
  Printer, 
  Sparkles, 
  X, 
  CheckCircle2, 
  Download, 
  RefreshCw,
  Award,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';

interface ReportCardModalProps {
  student: Student;
  teacher: TeacherProfile;
  subjects: Subject[];
  grades: StudentGrade[];
  attendanceRecords: AttendanceRecord[];
  onClose: () => void;
  onUpdateGrade: (grade: StudentGrade) => void;
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({
  student,
  teacher,
  subjects,
  grades,
  attendanceRecords,
  onClose,
  onUpdateGrade
}) => {
  const [guardianNote, setGuardianNote] = useState<string>(
    `${student.name} menunjukkan perkembangan karakter dan keaktifan yang sangat memuaskan di kelas. Pertahankan motivasi belajar dan tingkatkan terus prestasi di semester mendatang.`
  );
  const [characterPredicate, setCharacterPredicate] = useState<string>('Sangat Baik');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  // Student Attendance Stats
  const studentRecs = attendanceRecords.filter(r => r.studentId === student.id);
  const sakit = studentRecs.filter(r => r.status === 'SAKIT').length;
  const izin = studentRecs.filter(r => r.status === 'IZIN').length;
  const alpa = studentRecs.filter(r => r.status === 'ALPA').length;

  // Grades list for student
  const studentGrades = subjects.map(subject => {
    const gr = grades.find(g => g.studentId === student.id && g.subjectId === subject.id);
    return {
      subject,
      grade: gr || {
        studentId: student.id,
        subjectId: subject.id,
        tp1: 80, tp2: 80, tp3: 80, tp4: 80, pts: 80, pas: 80,
        finalScore: 80,
        predicate: 'B' as const,
        achievementDescription: `Menunjukkan penguasaan yang baik dalam tujuan pembelajaran ${subject.name}.`
      }
    };
  });

  // Trigger Gemini AI Catatan Wali Kelas Generator
  const handleGenerateAiGuardianNote = async () => {
    setLoadingAi(true);
    try {
      const response = await window.mockFetch('/api/ai/catatan-rapor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: student.name,
          nisn: student.nisn,
          className: student.className,
          gender: student.gender,
          attendance: { hadir: 15, sakit, izin, alpa },
          grades: studentGrades.map(sg => ({
            subject: sg.subject.name,
            score: sg.grade.finalScore,
            predicate: sg.grade.predicate
          }))
        })
      });

      const data = await response.json();
      if (data.success && data.result) {
        if (data.result.catatanWaliKelas) {
          setGuardianNote(data.result.catatanWaliKelas);
        }
        if (data.result.predikatKarakter) {
          setCharacterPredicate(data.result.predikatKarakter);
        }
      }
    } catch (err) {
      console.error("AI Error:", err);
    } finally {
      setLoadingAi(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-none max-w-4xl w-full shadow-2xl border border-slate-300 my-auto overflow-hidden print:shadow-none print:border-none print:max-w-none print:w-full">
        {/* Top Floating Control Bar (Hidden on Print) */}
        <div className="bg-[#004b87] text-white p-4 flex justify-between items-center print:hidden border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="bg-amber-400 text-slate-950 font-black text-xs px-2 py-0.5 rounded-none">
              RAPOR KURIKULUM MERDEKA
            </span>
            <span className="text-xs text-slate-300 font-medium">Siswa: {student.name}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleGenerateAiGuardianNote}
              disabled={loadingAi}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-none shadow cursor-pointer disabled:opacity-50"
            >
              {loadingAi ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 fill-slate-950" />}
              <span>{loadingAi ? 'AI Memproses...' : 'Buat Catatan AI'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-none shadow cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak PDF / Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-[#003d6d] rounded-none transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE RAPOR CONTENT BODY */}
        <div id="printable-rapor" className="p-8 sm:p-10 space-y-6 text-[#004b87] text-xs bg-white">
          {/* Header Kop Surat Sekolah */}
          <div className="border-b-4 border-slate-900 pb-4 text-center space-y-1 relative">
            <div className="flex justify-between items-center mb-2">
              <div className="w-14 h-14 bg-white flex items-center justify-center p-1">
                <img src="/kemdikbud_logo.svg" alt="Kemdikbud" className="w-full h-full object-contain" />
              </div>
              <div className="text-center flex-1 px-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-700">
                  LAPORAN HASIL BELAJAR PESERTA DIDIK
                </h2>
                <h1 className="text-lg font-black uppercase text-[#004b87] tracking-tight mt-0.5">
                  {teacher.schoolName}
                </h1>
                <p className="text-[10px] text-slate-600">
                  NPSN: {teacher.npsn} | Terakreditasi A (Unggul) | Sekolah Penggerak
                </p>
                <p className="text-[10px] text-slate-500 italic">
                  Jalan Pendidikan No. 1, Kompleks Edukasi Nasional - Kode Pos 10110
                </p>
              </div>
              <div className="w-12 h-12 bg-slate-100 text-[#004b87] font-bold text-xs rounded-full flex items-center justify-center border border-slate-300">
                SMA
              </div>
            </div>
            <div className="h-0.5 bg-amber-400 w-full mt-2"></div>
          </div>

          <div className="text-center">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#004b87] border-b border-slate-300 inline-block pb-1">
              LAPORAN HASIL BELAJAR (RAPOR SISWA)
            </h2>
            <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
              KURIKULUM MERDEKA — TAHUN AJARAN {teacher.academicYear} ({teacher.semester.toUpperCase()})
            </p>
          </div>

          {/* Student & School Identity Table */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-xs bg-slate-50 p-4 rounded-none border border-slate-200">
            <div className="flex">
              <span className="w-32 text-slate-500 font-medium">Nama Peserta Didik</span>
              <span className="font-bold text-[#004b87]">: {student.name}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-500 font-medium">Kelas / Fase</span>
              <span className="font-bold text-[#004b87]">: {student.className} / Fase E</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-500 font-medium">NIS</span>
              <span className="font-bold text-[#004b87]">: {student.nis}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-500 font-medium">Semester</span>
              <span className="font-bold text-[#004b87]">: {teacher.semester} (Satu)</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-500 font-medium">Sekolah</span>
              <span className="font-bold text-[#004b87]">: {teacher.schoolName}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-500 font-medium">Wali Kelas</span>
              <span className="font-bold text-[#004b87]">: {teacher.name}</span>
            </div>
          </div>

          {/* Main Grades & Competency Description Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <span>A. CAPAIAN HABILITAS & PENILAIAN MATA PELAJARAN</span>
            </h3>

            <table className="w-full text-left text-xs border-collapse border border-slate-400">
              <thead>
                <tr className="bg-slate-100 text-[#004b87] font-bold border-b border-slate-400 uppercase text-[10px]">
                  <th className="p-2 border-r border-slate-400 text-center w-8">No</th>
                  <th className="p-2 border-r border-slate-400 w-44">Mata Pelajaran</th>
                  <th className="p-2 border-r border-slate-400 text-center w-16">Nilai Akhir</th>
                  <th className="p-2 border-r border-slate-400 text-center w-14">Predikat</th>
                  <th className="p-2 border-slate-400">Capaian Pembelajaran (Deskripsi Deskriptif)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {studentGrades.map((item, index) => (
                  <tr key={item.subject.id} className="align-top">
                    <td className="p-2 border-r border-slate-300 text-center font-bold">{index + 1}</td>
                    <td className="p-2 border-r border-slate-300 font-bold text-[#004b87]">{item.subject.name}</td>
                    <td className="p-2 border-r border-slate-300 text-center font-black text-blue-900">{item.grade.finalScore}</td>
                    <td className="p-2 border-r border-slate-300 text-center font-bold">
                      <span className="px-1.5 py-0.5 rounded-none bg-slate-100 border border-slate-300 text-[10px]">
                        {item.grade.predicate}
                      </span>
                    </td>
                    <td className="p-2 leading-tight text-slate-800 text-[11px]">
                      {item.grade.achievementDescription}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Ekstrakurikuler & Character Predicate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                B. KEGIATAN EKSTRAKURIKULER
              </h3>
              <table className="w-full text-xs border border-slate-400">
                <thead>
                  <tr className="bg-slate-100 font-bold text-[10px] border-b border-slate-400">
                    <th className="p-1.5 border-r border-slate-400 text-center w-8">No</th>
                    <th className="p-1.5 border-r border-slate-400">Kegiatan</th>
                    <th className="p-1.5 border-r border-slate-400 text-center">Predikat</th>
                    <th className="p-1.5">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  <tr>
                    <td className="p-1.5 text-center">1</td>
                    <td className="p-1.5 font-bold">Pramuka (Wajib)</td>
                    <td className="p-1.5 text-center font-bold">Sangat Baik</td>
                    <td className="p-1.5 text-[10px]">Aktif dan disiplin dalam krida pramuka.</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 text-center">2</td>
                    <td className="p-1.5 font-bold">Karya Ilmiah Remaja (KIR)</td>
                    <td className="p-1.5 text-center font-bold">Baik</td>
                    <td className="p-1.5 text-[10px]">Menunjukkan ketertarikan penelitian.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Attendance Record Summary */}
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                C. KETIDAKHADIRAN (PRESENSI)
              </h3>
              <table className="w-full text-xs border border-slate-400">
                <tbody className="divide-y divide-slate-300">
                  <tr>
                    <td className="p-2 font-medium bg-slate-50 border-r border-slate-400 w-32">Sakit</td>
                    <td className="p-2 font-bold">{sakit} hari</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium bg-slate-50 border-r border-slate-400">Izin</td>
                    <td className="p-2 font-bold">{izin} hari</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium bg-slate-50 border-r border-slate-400">Tanpa Keterangan (Alpa)</td>
                    <td className="p-2 font-bold">{alpa} hari</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Catatan Wali Kelas Section */}
          <div className="space-y-1 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              D. CATATAN WALI KELAS & KARAKTER PROFIL PELAJAR PANCASILA
            </h3>
            <div className="bg-slate-50 p-3 rounded-none border border-slate-400 space-y-2">
              <div className="flex justify-between items-center text-[10px] border-b border-slate-300 pb-1">
                <span className="font-bold text-slate-700">Predikat Perkembangan Karakter P5:</span>
                <span className="font-black text-blue-900 uppercase bg-blue-100 px-2 py-0.5 rounded-none border border-blue-300">
                  {characterPredicate}
                </span>
              </div>
              <textarea
                rows={3}
                value={guardianNote}
                onChange={(e) => setGuardianNote(e.target.value)}
                className="w-full bg-white border border-slate-300 p-2 text-xs rounded-none focus:outline-none focus:border-blue-500 font-serif leading-relaxed"
                placeholder="Tulis catatan wali kelas..."
              />
            </div>
          </div>

          {/* Signatures Section */}
          <div className="pt-8 grid grid-cols-3 gap-4 text-center text-xs text-[#004b87] border-t border-slate-200">
            <div>
              <p className="text-slate-500">Mengetahui,</p>
              <p className="font-medium mt-0.5">Orang Tua / Wali Siswa</p>
              <div className="h-20 flex items-end justify-center">
                <p className="border-b border-slate-900 w-36 pb-0.5 font-bold">{student.parentName}</p>
              </div>
            </div>

            <div>
              <p className="text-slate-500">{teacher.city || 'Malang'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-medium mt-0.5">Wali Kelas {student.className}</p>
              <div className="h-20 flex flex-col items-center justify-end">
                <div className="text-[9px] text-emerald-700 font-mono font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-none border border-emerald-300 mb-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Tanda Tangan Digital Tersertifikasi</span>
                </div>
                <p className="border-b border-slate-900 w-44 pb-0.5 font-bold">{teacher.name}</p>
                <p className="text-[10px] text-slate-500">NIP: {teacher.nip}</p>
              </div>
            </div>

            <div>
              <p className="text-slate-500">Mengetahui,</p>
              <p className="font-medium mt-0.5">Kepala Sekolah</p>
              <div className="h-20 flex flex-col items-center justify-end">
                <p className="border-b border-slate-900 w-44 pb-0.5 font-bold">{teacher.principalName}</p>
                <p className="text-[10px] text-slate-500">NIP: {teacher.principalNip}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
