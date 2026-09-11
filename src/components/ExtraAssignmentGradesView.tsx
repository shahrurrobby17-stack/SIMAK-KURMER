import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Sparkles, 
  Download, 
  Save, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  XCircle,
  AlertCircle, 
  Clock, 
  FileText, 
  Filter, 
  Printer, 
  Award, 
  X,
  RefreshCw,
  Sliders,
  Calendar,
  Layers,
  ChevronRight,
  BookOpen,
  CheckSquare,
  Check
} from 'lucide-react';
import { 
  Student, 
  Subject, 
  TeacherProfile, 
  StudentTask, 
  StudentTaskGradeItem, 
  StudentTaskCategory 
} from '../types';
import { SaveSuccessModal } from './SaveSuccessModal';

interface ExtraAssignmentGradesViewProps {
  students: Student[];
  subjects: Subject[];
  tasks: StudentTask[];
  selectedClass: string;
  classList: string[];
  onSelectClass: (cls: string) => void;
  selectedSubject: Subject;
  onSelectSubject: (subject: Subject) => void;
  teacher?: TeacherProfile;
  onSaveTask: (task: StudentTask) => void;
  onDeleteTask: (taskId: string) => void;
  onSaveAllTasks?: (tasks: StudentTask[]) => void;
}

const TASK_CATEGORIES: StudentTaskCategory[] = [
  'Remedial',
  'Pengayaan',
  'Proyek/Praktikum',
  'Tugas Mandiri',
  'Portofolio',
  'Latihan Soal'
];

export const ExtraAssignmentGradesView: React.FC<ExtraAssignmentGradesViewProps> = ({
  students,
  subjects,
  tasks,
  selectedClass,
  classList,
  onSelectClass,
  selectedSubject,
  onSelectSubject,
  teacher,
  onSaveTask,
  onDeleteTask,
  onSaveAllTasks
}) => {
  // Active selected task for grading
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(() => {
    if (!selectedClass || selectedClass === 'Semua Kelas' || selectedClass === 'SEMUA' || selectedClass === '') {
      return null;
    }
    const classTasks = tasks.filter(t => t.className === selectedClass);
    return classTasks.length > 0 ? classTasks[0].id : null;
  });

  // Filters & Search
  const [categoryFilter, setCategoryFilter] = useState<string>('SEMUA');
  const [submissionFilter, setSubmissionFilter] = useState<'ALL' | 'SUBMITTED' | 'UNSUBMITTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [studentSearchQuery, setStudentSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'TUNTAS' | 'BELUM'>('ALL');

  // Modals & Feedback
  const [showTaskModal, setShowTaskModal] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<StudentTask | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<StudentTask | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [successModalMessage, setSuccessModalMessage] = useState<string>('Nilai tugas tambahan siswa berhasil disimpan.');
  const [loadingAiStudentId, setLoadingAiStudentId] = useState<string | null>(null);

  // Form State for Create/Edit Task (with keterangan: 'Centang' | 'Nilai')
  const [taskForm, setTaskForm] = useState<{
    title: string;
    category: StudentTaskCategory;
    className: string;
    subjectId: string;
    keterangan: 'Centang' | 'Nilai';
    maxScore: number;
    description: string;
    instructions: string;
  }>({
    title: '',
    category: 'Remedial',
    className: selectedClass && selectedClass !== 'Semua Kelas' && selectedClass !== 'SEMUA' && selectedClass !== '' ? selectedClass : (classList.filter(c => c !== 'Semua Kelas' && c !== 'SEMUA')[0] || 'X-IPA 2'),
    subjectId: selectedSubject?.id || 'SUB-BIO',
    keterangan: 'Nilai',
    maxScore: 100,
    description: '',
    instructions: ''
  });

  // Filter students by selected class
  const classStudents = useMemo(() => {
    if (!selectedClass || selectedClass === 'Semua Kelas' || selectedClass === 'SEMUA' || selectedClass === '') {
      return [];
    }
    return students.filter(s => 
      s.className.trim().toLowerCase() === selectedClass.trim().toLowerCase()
    );
  }, [students, selectedClass]);

  // Filter tasks for class and category
  const filteredTasks = useMemo(() => {
    if (!selectedClass || selectedClass === 'Semua Kelas' || selectedClass === 'SEMUA' || selectedClass === '') {
      return [];
    }
    return tasks.filter(t => {
      const matchClass = t.className === selectedClass;
      const matchCategory = categoryFilter === 'SEMUA' || t.category === categoryFilter;
      const matchSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchClass && matchCategory && matchSearch;
    });
  }, [tasks, selectedClass, categoryFilter, searchQuery]);

  // Auto-select first task when selectedClass changes or filteredTasks change
  useEffect(() => {
    if (filteredTasks.length > 0) {
      const isCurrentInFiltered = filteredTasks.some(t => t.id === selectedTaskId);
      if (!isCurrentInFiltered) {
        setSelectedTaskId(filteredTasks[0].id);
      }
    } else {
      setSelectedTaskId(null);
    }
  }, [selectedClass, filteredTasks, selectedTaskId]);

  // Current active task
  const activeTask = useMemo(() => {
    if (selectedTaskId) {
      const found = filteredTasks.find(t => t.id === selectedTaskId);
      if (found) return found;
    }
    return filteredTasks.length > 0 ? filteredTasks[0] : null;
  }, [selectedTaskId, filteredTasks]);

  // Active Subject & KKTP threshold synchronized with teacher profile settings
  const activeSubjectName = teacher?.subjectRole?.trim() || selectedSubject?.name || 'Mata Pelajaran';
  const kktp = teacher?.kkm !== undefined ? teacher.kkm : (selectedSubject?.kktp || 75);

  // Helper to get grade for student in active task
  const getStudentTaskGrade = (studentId: string): StudentTaskGradeItem => {
    if (activeTask?.grades && activeTask.grades[studentId]) {
      return activeTask.grades[studentId];
    }
    return {
      studentId,
      score: 0,
      status: 'Belum Mengumpulkan',
      submittedDate: '',
      feedback: ''
    };
  };

  // Handle updating grade for single student in active task
  const handleScoreChange = (studentId: string, score: number) => {
    if (!activeTask) return;
    const clampedScore = Math.max(0, Math.min(activeTask.maxScore || 100, isNaN(score) ? 0 : score));
    const currentGrade = getStudentTaskGrade(studentId);
    
    let newStatus: 'Tuntas' | 'Belum Tuntas' | 'Belum Mengumpulkan' = 'Tuntas';
    if (clampedScore === 0) {
      newStatus = 'Belum Mengumpulkan';
    } else if (clampedScore < kktp) {
      newStatus = 'Belum Tuntas';
    } else {
      newStatus = 'Tuntas';
    }

    const updatedGrades: Record<string, StudentTaskGradeItem> = {
      ...(activeTask.grades || {}),
      [studentId]: {
        ...currentGrade,
        score: clampedScore,
        status: newStatus,
        submittedDate: currentGrade.submittedDate || new Date().toISOString().split('T')[0]
      }
    };

    // Calculate submitted count
    const submittedCount = Object.values(updatedGrades).filter(g => g.score > 0 || g.status === 'Tuntas').length;

    const updatedTask: StudentTask = {
      ...activeTask,
      grades: updatedGrades,
      submittedCount
    };

    onSaveTask(updatedTask);
  };

  // Handle updating feedback/catatan
  const handleFeedbackChange = (studentId: string, feedback: string) => {
    if (!activeTask) return;
    const currentGrade = getStudentTaskGrade(studentId);
    const updatedGrades: Record<string, StudentTaskGradeItem> = {
      ...(activeTask.grades || {}),
      [studentId]: {
        ...currentGrade,
        feedback
      }
    };

    const updatedTask: StudentTask = {
      ...activeTask,
      grades: updatedGrades
    };

    onSaveTask(updatedTask);
  };

  // Handle updating submission status
  const handleStatusChange = (studentId: string, status: 'Tuntas' | 'Belum Tuntas' | 'Belum Mengumpulkan') => {
    if (!activeTask) return;
    const currentGrade = getStudentTaskGrade(studentId);
    let newScore = currentGrade.score;

    if (status === 'Tuntas' && newScore < kktp) {
      newScore = kktp;
    } else if (status === 'Belum Mengumpulkan') {
      newScore = 0;
    }

    const updatedGrades: Record<string, StudentTaskGradeItem> = {
      ...(activeTask.grades || {}),
      [studentId]: {
        ...currentGrade,
        status,
        score: newScore,
        submittedDate: status !== 'Belum Mengumpulkan' ? (currentGrade.submittedDate || new Date().toISOString().split('T')[0]) : ''
      }
    };

    const submittedCount = Object.values(updatedGrades).filter(g => g.score > 0 || g.status === 'Tuntas').length;

    const updatedTask: StudentTask = {
      ...activeTask,
      grades: updatedGrades,
      submittedCount
    };

    onSaveTask(updatedTask);
  };

  // Quick preset: Mark all present students as Tuntas with score
  const handleSetAllScore = (targetScore: number) => {
    if (!activeTask) return;
    const updatedGrades: Record<string, StudentTaskGradeItem> = { ...(activeTask.grades || {}) };
    const today = new Date().toISOString().split('T')[0];

    classStudents.forEach(st => {
      updatedGrades[st.id] = {
        studentId: st.id,
        score: targetScore,
        status: targetScore >= kktp ? 'Tuntas' : 'Belum Tuntas',
        submittedDate: today,
        feedback: targetScore >= kktp ? 'Tuntas sesuai capaian tugas tambahan.' : 'Perlu bimbingan lanjutan.'
      };
    });

    const updatedTask: StudentTask = {
      ...activeTask,
      grades: updatedGrades,
      submittedCount: classStudents.length
    };

    onSaveTask(updatedTask);
    setSuccessModalMessage(`Seluruh ${classStudents.length} siswa berhasil diberi nilai tugas ${targetScore}.`);
    setShowSuccessModal(true);
  };

  // Open modal to create new task
  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setTaskForm({
      title: '',
      category: 'Remedial',
      className: selectedClass && selectedClass !== 'Semua Kelas' && selectedClass !== 'SEMUA' ? selectedClass : (classList[0] || 'X-IPA 2'),
      subjectId: selectedSubject?.id || 'SUB-BIO',
      keterangan: 'Nilai',
      maxScore: 100,
      description: '',
      instructions: ''
    });
    setShowTaskModal(true);
  };

  // Open modal to edit existing task
  const handleOpenEditModal = (task: StudentTask, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      category: task.category,
      className: task.className,
      subjectId: task.subjectId || selectedSubject?.id || 'SUB-BIO',
      keterangan: (task.keterangan === 'Centang' || task.evaluationType === 'Centang') ? 'Centang' : 'Nilai',
      maxScore: task.maxScore || 100,
      description: task.description || '',
      instructions: task.instructions || ''
    });
    setShowTaskModal(true);
  };

  // Save new or edited task
  const handleSaveTaskForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;

    if (editingTask) {
      const updated: StudentTask = {
        ...editingTask,
        title: taskForm.title.trim(),
        category: taskForm.category,
        className: taskForm.className,
        subjectId: taskForm.subjectId,
        evaluationType: taskForm.keterangan,
        keterangan: taskForm.keterangan,
        maxScore: taskForm.keterangan === 'Centang' ? 100 : (Number(taskForm.maxScore) || 100),
        description: taskForm.description.trim(),
        instructions: taskForm.instructions.trim()
      };
      onSaveTask(updated);
      setSuccessModalMessage(`Tugas "${updated.title}" berhasil diperbarui.`);
    } else {
      const newId = `TSK-${Date.now().toString().slice(-4)}`;
      const newTask: StudentTask = {
        id: newId,
        title: taskForm.title.trim(),
        category: taskForm.category,
        className: taskForm.className,
        subjectId: taskForm.subjectId,
        targetStudentId: 'SEMUA',
        targetStudentName: `Seluruh Siswa Kelas ${taskForm.className}`,
        dueDate: '',
        assignedDate: '',
        evaluationType: taskForm.keterangan,
        keterangan: taskForm.keterangan,
        maxScore: taskForm.keterangan === 'Centang' ? 100 : (Number(taskForm.maxScore) || 100),
        status: 'Aktif',
        description: taskForm.description.trim(),
        instructions: taskForm.instructions.trim(),
        submittedCount: 0,
        totalStudents: classStudents.length,
        grades: {},
        schoolName: teacher?.schoolName || 'SMA Negeri 1 Indonesia - Sekolah Penggerak'
      };
      onSaveTask(newTask);
      setSelectedTaskId(newId);
      setSuccessModalMessage(`Tugas Tambahan "${newTask.title}" berhasil dibuat.`);
    }

    setShowTaskModal(false);
    setShowSuccessModal(true);
  };

  // Open delete confirmation modal
  const handleOpenDeleteModal = (task: StudentTask, e: React.MouseEvent) => {
    e.stopPropagation();
    setTaskToDelete(task);
  };

  // Confirm delete task
  const handleConfirmDelete = () => {
    if (!taskToDelete) return;
    const taskId = taskToDelete.id;
    const taskTitle = taskToDelete.title;
    onDeleteTask(taskId);
    if (selectedTaskId === taskId) {
      const remaining = tasks.filter(t => t.id !== taskId);
      setSelectedTaskId(remaining.length > 0 ? remaining[0].id : null);
    }
    setTaskToDelete(null);
    setSuccessModalMessage(`Tugas "${taskTitle}" berhasil dihapus.`);
    setShowSuccessModal(true);
  };

  // AI Feedback Generator for a student
  const handleGenerateAiFeedback = async (student: Student) => {
    if (!activeTask) return;
    const grade = getStudentTaskGrade(student.id);
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
            { subject: `${activeTask.category}: ${activeTask.title}`, score: grade.score || 80, predicate: grade.score >= 90 ? 'A' : (grade.score >= 80 ? 'B' : (grade.score >= 70 ? 'C' : 'D')) }
          ]
        })
      });

      const data = await response.json();
      if (data.success && data.result?.catatanAkademik) {
        handleFeedbackChange(student.id, data.result.catatanAkademik);
      } else {
        // Fallback default feedback
        const fallback = grade.score >= kktp 
          ? `Tuntas pada tugas ${activeTask.category} dengan pemahaman konsep yang baik.`
          : `Perlu peningkatan ketelitian dan latihan mandiri pada materi ${activeTask.title}.`;
        handleFeedbackChange(student.id, fallback);
      }
    } catch (err) {
      console.error(err);
      const fallback = grade.score >= kktp 
        ? `Tuntas pada tugas ${activeTask.category} dengan pemahaman konsep yang baik.`
        : `Perlu peningkatan ketelitian dan latihan mandiri pada materi ${activeTask.title}.`;
      handleFeedbackChange(student.id, fallback);
    } finally {
      setLoadingAiStudentId(null);
    }
  };

  // Print/Export table
  const handlePrint = () => {
    window.print();
  };

  // Category badge color helper
  const getCategoryBadgeClass = (category: StudentTaskCategory) => {
    switch (category) {
      case 'Remedial':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Pengayaan':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Proyek/Praktikum':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'Portofolio':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Tugas Mandiri':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'Latihan Soal':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  // Calculate stats for active task
  const stats = useMemo(() => {
    if (!activeTask || classStudents.length === 0) {
      return { total: 0, tuntas: 0, belum: 0, avg: 0, tuntasPct: 0 };
    }
    let totalScore = 0;
    let scoredCount = 0;
    let tuntasCount = 0;

    classStudents.forEach(st => {
      const g = getStudentTaskGrade(st.id);
      if (g.score > 0) {
        totalScore += g.score;
        scoredCount++;
      }
      if (g.score >= kktp || g.status === 'Tuntas') {
        tuntasCount++;
      }
    });

    const avg = scoredCount > 0 ? Math.round(totalScore / scoredCount) : 0;
    const tuntasPct = Math.round((tuntasCount / classStudents.length) * 100);

    return {
      total: classStudents.length,
      tuntas: tuntasCount,
      belum: classStudents.length - tuntasCount,
      avg,
      tuntasPct
    };
  }, [activeTask, classStudents, kktp]);

  // Filter students for table search & status
  const visibleStudents = useMemo(() => {
    return classStudents.filter(st => {
      const matchSearch = !studentSearchQuery || 
        st.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) || 
        st.nisn.includes(studentSearchQuery) ||
        st.nis.includes(studentSearchQuery);

      if (!matchSearch) return false;

      const g = getStudentTaskGrade(st.id);
      const isSubmitted = g.score > 0 || g.status === 'Tuntas';

      // Submission History Filter (Riwayat Pengumpulan)
      if (submissionFilter === 'SUBMITTED' && !isSubmitted) return false;
      if (submissionFilter === 'UNSUBMITTED' && isSubmitted) return false;

      if (statusFilter === 'ALL') return true;
      if (statusFilter === 'TUNTAS') return g.score >= kktp || g.status === 'Tuntas';
      if (statusFilter === 'BELUM') return g.score < kktp || g.status !== 'Tuntas';
      return true;
    });
  }, [classStudents, studentSearchQuery, submissionFilter, statusFilter, activeTask, kktp]);

  return (
    <div className="space-y-4 font-sans text-slate-800 pb-12">
      {/* Toolbar Area: Buttons (Left of Pilih Kelas) & Filter Row */}
      <div className="bg-white border border-slate-200 p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Action Buttons to the left of Pilih Kelas (Stacked: Cetak Rekap under Buat Tugas Baru) */}
        <div className="flex flex-col gap-2 shrink-0 pb-2 md:pb-0 border-b md:border-b-0 border-slate-100 min-w-[160px]">
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="w-full px-3.5 py-2 bg-[#164e63] text-white text-xs font-semibold hover:bg-cyan-900 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs border border-cyan-900"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Buat Tugas Baru</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Cetak Rekap</span>
          </button>
        </div>

        {/* Filter Selectors starting with Pilih Kelas */}
        <div className="space-y-2 grow">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] px-2.5 py-0.5 bg-amber-100 text-amber-900 font-bold border border-amber-300">
              Mapel: {activeSubjectName}
            </span>
            <span className="text-[11px] px-2.5 py-0.5 bg-cyan-50 text-[#164e63] border border-cyan-200 font-bold">
              KKTP: {kktp}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Kelas Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Pilih Kelas</label>
              <select
                value={selectedClass && selectedClass !== 'Semua Kelas' && selectedClass !== 'SEMUA' ? selectedClass : ''}
                onChange={(e) => onSelectClass(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#164e63]"
              >
                <option value="">Pilih Kelas</option>
                {classList.filter(cls => cls !== 'Semua Kelas' && cls !== 'SEMUA').map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            {/* Kategori Tugas Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Kategori Tugas</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#164e63]"
              >
                <option value="SEMUA">Semua Kategori ({tasks.length})</option>
                {TASK_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Left Sidebar Tasks List + Right Detail Grading Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Daftar Tugas Tambahan Card Selector */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white border border-slate-200 shadow-xs">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-[#164e63]" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Daftar Tugas ({filteredTasks.length})
                </span>
              </div>
              <span className="text-[10px] bg-cyan-100 text-[#164e63] px-2 py-0.5 font-bold">
                {selectedClass && selectedClass !== 'Semua Kelas' && selectedClass !== 'SEMUA' ? selectedClass : 'Pilih Kelas'}
              </span>
            </div>

            {/* List of Tasks */}
            <div className="divide-y divide-slate-100 max-h-[560px] overflow-y-auto">
              {filteredTasks.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  {!selectedClass || selectedClass === 'Semua Kelas' || selectedClass === 'SEMUA' || selectedClass === '' ? (
                    <>
                      <p className="font-semibold text-slate-600">Belum Ada Kelas Yang Dipilih</p>
                      <p className="text-[11px] mt-1">Silakan pilih kelas pada dropdown "Pilih Kelas" di atas untuk menampilkan daftar tugas.</p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-slate-600">Belum ada tugas tambahan</p>
                      <p className="text-[11px] mt-1">Klik "Buat Tugas Baru" untuk menambahkan tugas remedial/pengayaan.</p>
                    </>
                  )}
                </div>
              ) : (
                filteredTasks.map((t) => {
                  const isSelected = activeTask?.id === t.id;
                  const totalClassSt = classStudents.length || 1;
                  const submCount = Object.values(t.grades || {}).filter(g => g.score > 0 || g.status === 'Tuntas').length;
                  const progressPct = Math.min(100, Math.round((submCount / totalClassSt) * 100));
                  const isTaskCentang = t.keterangan === 'Centang' || t.evaluationType === 'Centang';

                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTaskId(t.id)}
                      className={`p-3 transition-colors cursor-pointer text-left relative ${
                        isSelected 
                          ? 'bg-cyan-50/80 border-l-4 border-[#164e63]' 
                          : 'hover:bg-slate-50 border-l-4 border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] px-2 py-0.5 font-bold border ${getCategoryBadgeClass(t.category)}`}>
                            {t.category}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 font-bold border ${
                            isTaskCentang 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                              : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          }`}>
                            {isTaskCentang ? '✓ Centang' : 'Nilai'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={(e) => handleOpenEditModal(t, e)}
                            title="Edit Tugas"
                            className="p-1 text-slate-400 hover:text-cyan-700 hover:bg-white transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleOpenDeleteModal(t, e)}
                            title="Hapus Tugas"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                        {t.title}
                      </h3>

                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                        {t.description || 'Tidak ada deskripsi khusus.'}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                        <span className="font-medium text-slate-600">
                          Kemajuan Penilaian
                        </span>
                        <span className="font-bold text-slate-800">
                          {submCount}/{totalClassSt} Siswa ({progressPct}%)
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-200 h-1.5 mt-1.5 overflow-hidden">
                        <div 
                          className="bg-[#164e63] h-full transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Guidance Box */}
          <div className="bg-cyan-50 border border-cyan-200 p-3 text-xs text-cyan-900">
            <div className="flex items-center space-x-2 font-bold mb-1">
              <BookOpen className="w-4 h-4 text-[#164e63]" />
              <span>Petunjuk Nilai Tugas Tambahan</span>
            </div>
            <p className="text-[11px] text-cyan-800 leading-relaxed">
              Nilai tugas tambahan (Remedial/Pengayaan/Proyek) disimpan langsung ke database dan dapat disinkronkan ke rekap nilai formatif siswa. Gunakan tombol preset untuk pengisian massal.
            </p>
          </div>
        </div>

        {/* Right Column: Grading Sheet Table */}
        <div className="lg:col-span-8 space-y-3">
          {activeTask ? (
            <div className="bg-white border border-slate-200 shadow-xs">
              {/* Task Detail Summary Card */}
              <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] px-2 py-0.5 font-bold border ${getCategoryBadgeClass(activeTask.category)}`}>
                        {activeTask.category}
                      </span>
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5">
                        Kelas: {activeTask.className}
                      </span>
                      <span className="text-xs font-bold text-[#164e63] bg-cyan-50 border border-cyan-200 px-2 py-0.5">
                        Mapel: {activeSubjectName}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 font-bold border ${
                        activeTask.keterangan === 'Centang' || activeTask.evaluationType === 'Centang'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                          : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                      }`}>
                        {activeTask.keterangan === 'Centang' || activeTask.evaluationType === 'Centang' ? '✓ Format: Centang' : `Format: Nilai (Maks: ${activeTask.maxScore || 100})`}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900 mt-1">
                      {activeTask.title}
                    </h2>
                    {activeTask.description && (
                      <p className="text-xs text-slate-600 mt-0.5">
                        {activeTask.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={(e) => handleOpenEditModal(activeTask, e)}
                      title="Edit Tugas Ini"
                      className="px-2.5 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center space-x-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleOpenDeleteModal(activeTask, e)}
                      title="Hapus Tugas Ini"
                      className="px-2.5 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition-colors flex items-center space-x-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                    {activeTask.keterangan === 'Centang' || activeTask.evaluationType === 'Centang' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSetAllScore(100)}
                          className="px-2.5 py-1.5 bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors cursor-pointer flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Centang Semua (Tuntas)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetAllScore(0)}
                          className="px-2.5 py-1.5 bg-slate-600 text-white text-xs font-semibold hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          Reset Semua
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSetAllScore(activeTask.maxScore || 100)}
                          className="px-2.5 py-1.5 bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors cursor-pointer"
                        >
                          Semua 100
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetAllScore(kktp)}
                          className="px-2.5 py-1.5 bg-[#164e63] text-white text-xs font-semibold hover:bg-cyan-900 transition-colors cursor-pointer"
                        >
                          Semua KKTP ({kktp})
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* KPI Metrics Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-slate-200 text-center">
                  <div className="bg-white p-2 border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-semibold block">Total Siswa</span>
                    <span className="text-sm font-bold text-slate-800">{stats.total}</span>
                  </div>
                  <div className="bg-white p-2 border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-semibold block">
                      Tuntas {activeTask.keterangan === 'Centang' || activeTask.evaluationType === 'Centang' ? '(✓)' : 'KKTP'}
                    </span>
                    <span className="text-sm font-bold text-emerald-700">{stats.tuntas} ({stats.tuntasPct}%)</span>
                  </div>
                  <div className="bg-white p-2 border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-semibold block">Belum Tuntas</span>
                    <span className="text-sm font-bold text-amber-700">{stats.belum}</span>
                  </div>
                  <div className="bg-white p-2 border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-semibold block">
                      {activeTask.keterangan === 'Centang' || activeTask.evaluationType === 'Centang' ? 'Tingkat Ketuntasan' : 'Rata-rata Nilai'}
                    </span>
                    <span className="text-sm font-bold text-[#164e63]">
                      {activeTask.keterangan === 'Centang' || activeTask.evaluationType === 'Centang' ? `${stats.tuntasPct}%` : stats.avg}
                    </span>
                  </div>
                </div>
              </div>

              {/* Table Sub-Filters (Search Student & Status Filter) */}
              <div className="p-3 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="Cari nama / NISN siswa..."
                      value={studentSearchQuery}
                      onChange={(e) => setStudentSearchQuery(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 pl-7 pr-3 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#164e63]"
                    />
                    <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] font-bold text-slate-500">Filter:</span>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('ALL')}
                    className={`px-2 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                      statusFilter === 'ALL' ? 'bg-[#164e63] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Semua ({classStudents.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('TUNTAS')}
                    className={`px-2 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                      statusFilter === 'TUNTAS' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Tuntas ({stats.tuntas})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('BELUM')}
                    className={`px-2 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                      statusFilter === 'BELUM' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Belum Tuntas ({stats.belum})
                  </button>
                </div>
              </div>

              {/* Grading Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 px-3 w-10 text-center">No</th>
                      <th className="py-2.5 px-3 min-w-[180px]">Nama Peserta Didik</th>
                      <th className="py-2.5 px-3 min-w-[160px] text-center">Riwayat Pengumpulan</th>
                      <th className="py-2.5 px-3 w-36 text-center">
                        {activeTask.keterangan === 'Centang' || activeTask.evaluationType === 'Centang' ? 'Centang Tuntas' : 'Nilai Tugas'}
                      </th>
                      {!(activeTask.keterangan === 'Centang' || activeTask.evaluationType === 'Centang') && (
                        <th className="py-2.5 px-3 w-20 text-center">Predikat</th>
                      )}
                      <th className="py-2.5 px-3 min-w-[200px]">Catatan / Masukan Guru</th>
                      <th className="py-2.5 px-3 w-28 text-center">Aksi Cepat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {visibleStudents.length === 0 ? (
                      <tr>
                        <td colSpan={(activeTask.keterangan === 'Centang' || activeTask.evaluationType === 'Centang') ? 6 : 7} className="text-center py-8 text-slate-400 text-xs">
                          Tidak ada siswa yang sesuai dengan filter pencarian.
                        </td>
                      </tr>
                    ) : (
                      visibleStudents.map((student, idx) => {
                        const grade = getStudentTaskGrade(student.id);
                        const isTaskCentang = activeTask.keterangan === 'Centang' || activeTask.evaluationType === 'Centang';
                        const isTuntas = grade.status === 'Tuntas' || grade.score >= kktp;
                        const isSubmitted = grade.score > 0 || grade.status === 'Tuntas';
                        const score = grade.score || 0;
                        let predicate = 'D';
                        if (score >= 90) predicate = 'A';
                        else if (score >= 80) predicate = 'B';
                        else if (score >= 70) predicate = 'C';

                        return (
                          <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-3 text-center text-slate-500 font-medium">
                              {idx + 1}
                            </td>

                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-900">{student.name}</div>
                              <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <span>NISN: {student.nisn}</span>
                                <span>•</span>
                                <span className={`px-1 py-0.2 font-bold ${student.gender === 'L' ? 'bg-cyan-50 text-cyan-700' : 'bg-pink-50 text-pink-700'}`}>
                                  {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                                </span>
                              </div>
                            </td>

                            {/* Column: Riwayat Pengumpulan */}
                            <td className="py-2.5 px-3 text-center">
                              {isSubmitted ? (
                                <span className="px-2.5 py-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1.5 shadow-2xs">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span>Sudah Mengumpulkan</span>
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 inline-flex items-center gap-1.5 shadow-2xs">
                                  <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                  <span>Belum Mengumpulkan</span>
                                </span>
                              )}
                            </td>

                            <td className="py-2.5 px-3 text-center">
                              {isTaskCentang ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const willBeTuntas = !isTuntas;
                                    handleStatusChange(student.id, willBeTuntas ? 'Tuntas' : 'Belum Mengumpulkan');
                                  }}
                                  className={`px-3.5 py-1.5 text-xs font-bold transition-all inline-flex items-center justify-center space-x-1.5 border cursor-pointer ${
                                    isTuntas
                                      ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700 shadow-xs'
                                      : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100 hover:text-slate-800'
                                  }`}
                                >
                                  {isTuntas ? (
                                    <>
                                      <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                                      <span>Tuntas (✓)</span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="w-3.5 h-3.5 border-2 border-slate-400 bg-white inline-block shrink-0" />
                                      <span>Belum Tuntas</span>
                                    </>
                                  )}
                                </button>
                              ) : (
                                <div className="inline-flex items-center justify-center space-x-1">
                                  <input
                                    type="number"
                                    min={0}
                                    max={activeTask.maxScore || 100}
                                    value={grade.score === 0 ? '' : grade.score}
                                    placeholder="0"
                                    onChange={(e) => handleScoreChange(student.id, parseInt(e.target.value, 10))}
                                    className={`w-16 px-2 py-1 text-center font-bold text-xs border focus:outline-none focus:ring-1 focus:ring-[#164e63] ${
                                      isTuntas 
                                        ? 'border-emerald-300 bg-emerald-50/50 text-emerald-900 font-black' 
                                        : score > 0 
                                        ? 'border-amber-300 bg-amber-50/50 text-amber-900' 
                                        : 'border-slate-300 bg-white text-slate-700'
                                    }`}
                                  />
                                  <span className="text-[10px] text-slate-400">/{activeTask.maxScore || 100}</span>
                                </div>
                              )}
                            </td>

                            {!isTaskCentang && (
                              <td className="py-2.5 px-3 text-center">
                                <span className={`inline-block w-6 h-6 leading-6 text-center font-bold text-xs rounded-none ${
                                  predicate === 'A' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                                  predicate === 'B' ? 'bg-cyan-100 text-cyan-800 border border-cyan-300' :
                                  predicate === 'C' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                                  'bg-rose-100 text-rose-800 border border-rose-300'
                                }`}>
                                  {score > 0 ? predicate : '-'}
                                </span>
                              </td>
                            )}

                            <td className="py-2.5 px-3">
                              <div className="flex items-center space-x-1">
                                <input
                                  type="text"
                                  placeholder="Ketik catatan / apresiasi guru..."
                                  value={grade.feedback || ''}
                                  onChange={(e) => handleFeedbackChange(student.id, e.target.value)}
                                  className="w-full text-xs px-2.5 py-1 bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#164e63] text-slate-800"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleGenerateAiFeedback(student)}
                                  disabled={loadingAiStudentId === student.id}
                                  title="Buat Masukan Otomatis AI Gemini"
                                  className="p-1.5 bg-cyan-50 border border-cyan-200 text-[#164e63] hover:bg-[#164e63] hover:text-white transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                                >
                                  {loadingAiStudentId === student.id ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Sparkles className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>

                            <td className="py-2.5 px-3 text-center">
                              {isTaskCentang ? (
                                <div className="flex items-center justify-center space-x-1">
                                  <button
                                    type="button"
                                    onClick={() => handleStatusChange(student.id, 'Tuntas')}
                                    title="Centang Tuntas"
                                    className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
                                  >
                                    ✓ Tuntas
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleStatusChange(student.id, 'Belum Mengumpulkan')}
                                    title="Reset Belum"
                                    className="px-1.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-300 text-[10px] font-bold hover:bg-slate-300 transition-colors cursor-pointer"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center space-x-1">
                                  <button
                                    type="button"
                                    onClick={() => handleScoreChange(student.id, activeTask.maxScore || 100)}
                                    title="Beri Nilai 100"
                                    className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
                                  >
                                    100
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleScoreChange(student.id, kktp)}
                                    title={`Beri Nilai KKTP (${kktp})`}
                                    className="px-1.5 py-0.5 bg-cyan-50 text-cyan-700 border border-cyan-200 text-[10px] font-bold hover:bg-cyan-600 hover:text-white transition-colors cursor-pointer"
                                  >
                                    {kktp}
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Bottom Action Footer */}
              <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Nilai otomatis tersinkronisasi ke penyimpanan lokal & cloud.</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSuccessModalMessage(`Rekap nilai tugas tambahan untuk ${classStudents.length} siswa berhasil disimpan.`);
                      setShowSuccessModal(true);
                    }}
                    className="px-4 py-2 bg-[#164e63] text-white text-xs font-semibold hover:bg-cyan-900 transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Rekap Nilai</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 p-12 text-center text-slate-400">
              <FileSpreadsheet className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              {!selectedClass || selectedClass === 'Semua Kelas' || selectedClass === 'SEMUA' || selectedClass === '' ? (
                <>
                  <h3 className="text-sm font-bold text-slate-700">Silakan Pilih Kelas Terlebih Dahulu</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Pilih kelas pada dropdown "Pilih Kelas" di atas untuk melihat daftar tugas tambahan dan merekap nilai peserta didik.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-sm font-bold text-slate-700">Pilih atau Buat Tugas Tambahan</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Silakan pilih salah satu tugas di panel kiri atau buat tugas baru untuk mulai menginput dan merekap nilai tugas tambahan peserta didik kelas {selectedClass}.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenCreateModal}
                    className="mt-4 px-4 py-2 bg-[#164e63] text-white text-xs font-semibold hover:bg-cyan-900 transition-colors inline-flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Buat Tugas Tambahan Baru</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Buat / Edit Tugas Tambahan */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-300 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-[#164e63] text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-white" />
                <h3 className="text-sm font-bold">
                  {editingTask ? 'Edit Tugas Tambahan' : 'Buat Tugas Tambahan Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTaskModal(false)}
                className="text-white/80 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTaskForm} className="p-4 space-y-3.5 text-xs">
              {/* Mata Pelajaran & Judul Tugas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Mata Pelajaran (Profil Pengajar)
                  </label>
                  <div className="p-2 bg-slate-100 border border-slate-300 text-slate-800 font-semibold text-xs flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <BookOpen className="w-3.5 h-3.5 text-[#164e63] shrink-0" />
                      <span className="truncate">{activeSubjectName}</span>
                    </div>
                    <span className="text-[10px] bg-cyan-100 text-[#164e63] px-1.5 py-0.5 font-bold shrink-0">
                      KKTP: {kktp}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Kelas Target
                  </label>
                  <select
                    value={taskForm.className}
                    onChange={(e) => setTaskForm({ ...taskForm, className: e.target.value })}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#164e63]"
                  >
                    {classList.filter(c => c !== 'Semua Kelas' && c !== 'SEMUA').map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Judul Tugas */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Judul Tugas / Materi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Remedial Bab 2: Struktur & Fungsi Sel"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#164e63]"
                />
              </div>

              {/* Kategori, Keterangan, Nilai Max */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Kategori Tugas
                  </label>
                  <select
                    value={taskForm.category}
                    onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value as StudentTaskCategory })}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#164e63]"
                  >
                    {TASK_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Keterangan (Format) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={taskForm.keterangan}
                    onChange={(e) => setTaskForm({ ...taskForm, keterangan: e.target.value as 'Centang' | 'Nilai' })}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#164e63] font-bold text-[#164e63]"
                  >
                    <option value="Centang">Centang (Checklist ✓)</option>
                    <option value="Nilai">Nilai (Skor Angka)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Nilai Maksimum {taskForm.keterangan === 'Centang' && <span className="text-[10px] font-normal text-slate-500">(Centang)</span>}
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    disabled={taskForm.keterangan === 'Centang'}
                    value={taskForm.keterangan === 'Centang' ? 100 : taskForm.maxScore}
                    onChange={(e) => setTaskForm({ ...taskForm, maxScore: parseInt(e.target.value, 10) || 100 })}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#164e63] disabled:opacity-60 disabled:bg-slate-100"
                  />
                </div>
              </div>

              {/* Deskripsi & Ringkasan */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Deskripsi Singkat
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pembuatan peta konsep organel sel tumbuhan dan hewan."
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#164e63]"
                />
              </div>

              {/* Petunjuk / Instruksi */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Instruksi / Petunjuk Pengerjaan
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Kerjakan di lembar folio bergaris atau format PDF..."
                  value={taskForm.instructions}
                  onChange={(e) => setTaskForm({ ...taskForm, instructions: e.target.value })}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#164e63]"
                />
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#164e63] text-white font-semibold hover:bg-cyan-900 transition-colors cursor-pointer shadow-xs"
                >
                  {editingTask ? 'Simpan Perubahan' : 'Buat Tugas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-300 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-rose-700 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trash2 className="w-5 h-5 text-white" />
                <h3 className="text-sm font-bold">
                  Hapus Tugas Tambahan?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                className="text-white/80 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800">
                <p className="font-bold text-xs">{taskToDelete.title}</p>
                <p className="text-[11px] mt-0.5 text-rose-700">
                  Kategori: {taskToDelete.category} • Kelas: {taskToDelete.className}
                </p>
              </div>
              <p className="text-slate-600">
                Apakah Anda yakin ingin menghapus tugas ini? Seluruh data rekap nilai dan catatan siswa untuk tugas ini akan dihapus secara permanen.
              </p>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setTaskToDelete(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-colors cursor-pointer shadow-xs flex items-center space-x-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Ya, Hapus Tugas</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Success Feedback Modal */}
      <SaveSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Nilai Tugas Berhasil Disimpan"
        message={successModalMessage}
      />
    </div>
  );
};
