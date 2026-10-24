import { 
  allDefaultStudents, 
  initialStudents,
  school2Students,
  school3Students,
  initialSubjects, 
  initialGrades, 
  initialAttendanceRecords, 
  initialTeachingLogs, 
  initialStudentTasks, 
  initialTeacherProfiles
} from '../data/initialData';
import { db } from './firestore';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  writeBatch, 
  onSnapshot, 
  getDocs 
} from 'firebase/firestore';
import { RegisteredSchool, PpdbRegistration } from '../types';
import { initialPpdbRegistrations } from '../data/initialPpdbData';

/**
 * Normalizes any school name into a valid, safe, unique Firestore document ID
 */
export const normalizeSchoolId = (schoolName: string): string => {
  if (!schoolName) return 'sman_1_indonesia';
  const clean = schoolName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  if (clean.includes('sma_negeri_1_indonesia') || clean.includes('sman_1_indonesia')) {
    return 'sman_1_indonesia';
  }
  if (clean.includes('sma_negeri_2_surabaya') || clean.includes('sman_2_surabaya')) {
    return 'sma_negeri_2_surabaya';
  }
  if (clean.includes('sma_muhammadiyah_1_jakarta')) {
    return 'sma_muhammadiyah_1_jakarta';
  }
  return clean || 'sman_1_indonesia';
};

// Global active school context
let currentActiveSchoolName = 'SMA Negeri 1 Indonesia - Sekolah Penggerak';
let currentActiveSchoolId = 'sman_1_indonesia';

export const setActiveSchoolContext = (schoolName: string) => {
  if (schoolName && schoolName.trim()) {
    currentActiveSchoolName = schoolName.trim();
    currentActiveSchoolId = normalizeSchoolId(schoolName);
  }
};

export const getActiveSchoolContext = () => ({
  schoolName: currentActiveSchoolName,
  schoolId: currentActiveSchoolId
});

export const deduplicateSchools = (schools: RegisteredSchool[]): RegisteredSchool[] => {
  const seen = new Set<string>();
  const result: RegisteredSchool[] = [];
  for (const s of schools) {
    if (!s || !s.name) continue;
    const norm = s.name.trim().toLowerCase().replace(/\s+/g, ' ');
    if (!seen.has(norm)) {
      seen.add(norm);
      result.push(s);
    }
  }
  return result;
};

export const initialRegisteredSchools: RegisteredSchool[] = deduplicateSchools([
  {
    id: 'sma_diponegoro_wagir',
    name: 'SMA Islam Diponegoro Wagir',
    npsn: '20517834',
    principalName: 'H. Moh. Ridwan, S.Pd., M.Si.',
    address: 'Jl. Raya Parangargo No. 1, Wagir',
    city: 'Kab. Malang',
    province: 'Jawa Timur',
    jenjang: 'SMA',
    statusSekolah: 'Swasta',
    akreditasi: 'A (Unggul)',
    academicYear: '2026/2027',
    semester: 'Ganjil'
  },
  {
    id: 'sd_negeri_3_bedalisodo',
    name: 'SD Negeri 3 Bedalisodo',
    npsn: '20500000',
    principalName: 'Drs. Supriyanto, M.Pd.',
    address: 'Jl. Raya Bedalisodo, Kec. Wagir',
    city: 'Kab. Malang',
    province: 'Jawa Timur',
    jenjang: 'SD',
    statusSekolah: 'Negeri',
    akreditasi: 'B (Baik)',
    academicYear: '2026/2027',
    semester: 'Ganjil'
  },
  {
    id: 'sd_negeri_4_bedalisodo',
    name: 'SD Negeri 4 Bedalisodo',
    npsn: '20500000',
    principalName: 'Endang Widyastuti, S.Pd.SD',
    address: 'Dusun Bedali Kidul, Desa Bedalisodo, Kec. Wagir',
    city: 'Kab. Malang',
    province: 'Jawa Timur',
    jenjang: 'SD',
    statusSekolah: 'Negeri',
    akreditasi: 'B (Baik)',
    academicYear: '2026/2027',
    semester: 'Ganjil'
  }
]);

export const getDeletedSchoolKeys = (): Set<string> => {
  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('simak_deleted_school_ids');
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    }
  } catch (e) {}
  return new Set<string>();
};

export const addDeletedSchoolKey = (schoolId: string, schoolName?: string, npsn?: string) => {
  try {
    if (typeof window !== 'undefined') {
      const keys = getDeletedSchoolKeys();
      if (schoolId) keys.add(schoolId.toLowerCase().trim());
      if (schoolName) keys.add(schoolName.toLowerCase().trim());
      if (npsn) keys.add(npsn.toLowerCase().trim());
      localStorage.setItem('simak_deleted_school_ids', JSON.stringify(Array.from(keys)));
    }
  } catch (e) {}
};

export const filterDeletedSchools = (schools: RegisteredSchool[]): RegisteredSchool[] => {
  const deletedKeys = getDeletedSchoolKeys();
  let savedLocalList: RegisteredSchool[] | null = null;
  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('simak_registered_schools');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          savedLocalList = parsed;
        }
      }
    }
  } catch (e) {}

  const deduped = deduplicateSchools(schools || []);

  return deduped.filter(s => {
    const idNorm = (s.id || '').toLowerCase().trim();
    const nameNorm = (s.name || '').toLowerCase().trim();
    const npsnNorm = (s.npsn || '').toLowerCase().trim();

    // Explicitly exclude unwanted schools requested by user
    if (
      nameNorm.includes('sd negeri 1 wagir') ||
      nameNorm.includes('sdn 1 wagir') ||
      nameNorm.includes('mi diponegoro wagir') ||
      nameNorm.includes('sma negeri 2 surabaya') ||
      nameNorm.includes('sman 2 surabaya') ||
      nameNorm.includes('sma muhammadiyah 1 jakarta') ||
      idNorm.includes('sd_negeri_1_wagir') ||
      idNorm.includes('mi_diponegoro_wagir') ||
      idNorm.includes('sma_negeri_2_surabaya') ||
      idNorm.includes('sma_muhammadiyah_1_jakarta') ||
      npsnNorm === '20518001' ||
      npsnNorm === '20518002' ||
      npsnNorm === '20512345' ||
      npsnNorm === '20198765'
    ) {
      return false;
    }

    if (deletedKeys.size > 0) {
      if (idNorm && deletedKeys.has(idNorm)) return false;
      if (nameNorm && deletedKeys.has(nameNorm)) return false;
      if (npsnNorm && deletedKeys.has(npsnNorm)) return false;
    }

    if (savedLocalList && savedLocalList.length > 0) {
      const isInLocal = savedLocalList.some(local => 
        (local.id && local.id.toLowerCase().trim() === idNorm) ||
        (local.name && local.name.toLowerCase().trim() === nameNorm) ||
        (local.npsn && local.npsn.toLowerCase().trim() === npsnNorm)
      );
      if (!isInLocal) return false;
    }

    return true;
  });
};

export const subscribeToRegisteredSchools = (callback: (schools: RegisteredSchool[]) => void) => {
  return onSnapshot(collection(db, 'schools'), (snap) => {
    const list: RegisteredSchool[] = [];
    snap.forEach(d => {
      const data = d.data() as RegisteredSchool;
      if (data && (data.name || data.id)) {
        list.push({ ...data, id: d.id || data.id });
      }
    });
    if (list.length > 0) {
      callback(filterDeletedSchools(list));
    } else {
      callback(filterDeletedSchools(initialRegisteredSchools));
    }
  }, (err) => {
    console.warn('Error subscribing to schools collection:', err);
    callback(filterDeletedSchools(initialRegisteredSchools));
  });
};

export const registerSchoolToFirebase = async (school: Partial<RegisteredSchool> & { name: string }) => {
  const schoolId = school.id || normalizeSchoolId(school.name);
  const docRef = doc(db, 'schools', schoolId);
  const payload: RegisteredSchool = {
    id: schoolId,
    name: school.name.trim(),
    npsn: school.npsn || '20500000',
    principalName: school.principalName || 'Kepala Sekolah',
    academicYear: school.academicYear || '2026/2027',
    semester: school.semester || 'Ganjil',
    createdAt: school.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  await setDoc(docRef, payload, { merge: true });
  return payload;
};

export const deleteSchoolFromFirebase = async (schoolId: string, schoolName?: string) => {
  addDeletedSchoolKey(schoolId, schoolName);
  try {
    const docRef = doc(db, 'schools', schoolId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Error deleting school from Firebase:', err);
    return true;
  }
};

/**
 * Seed initial data for a specific school into its own /schools/{schoolId}/... path
 */
export const seedSchoolDataIfEmpty = async (schoolId: string, schoolName: string) => {
  try {
    const schoolStudentsRef = collection(db, 'schools', schoolId, 'students');
    const snap = await getDocs(schoolStudentsRef);
    if (snap.empty) {
      const batch = writeBatch(db);
      
      // Ensure school document exists in /schools/{schoolId}
      batch.set(doc(db, 'schools', schoolId), {
        id: schoolId,
        name: schoolName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Determine initial students for this school
      let studentsToSeed = initialStudents;
      if (schoolId === 'sma_negeri_2_surabaya') {
        studentsToSeed = school2Students;
      } else if (schoolId === 'sma_muhammadiyah_1_jakarta') {
        studentsToSeed = school3Students;
      } else if (schoolId === 'sman_1_indonesia') {
        studentsToSeed = initialStudents;
      } else {
        studentsToSeed = [];
      }

      studentsToSeed.forEach(s => {
        const sItem = { ...s, schoolName, schoolId };
        batch.set(doc(db, 'schools', schoolId, 'students', s.id), sItem);
      });

      // Seed initial subjects for this school
      batch.set(doc(db, 'schools', schoolId, 'settings', 'subjects'), { items: initialSubjects });

      // Seed initial classes for this school
      let schoolClasses = ['X-IPA 1', 'X-IPA 2', 'XI-IPA 1'];
      if (schoolId === 'sma_negeri_2_surabaya') {
        schoolClasses = ['X-1', 'X-2', 'XI-1'];
      } else if (schoolId === 'sma_muhammadiyah_1_jakarta') {
        schoolClasses = ['XI-A', 'XI-B', 'XII-A'];
      } else if (studentsToSeed.length === 0) {
        schoolClasses = ['X-1', 'X-2', 'XI-1'];
      }
      batch.set(doc(db, 'schools', schoolId, 'settings', 'classLists'), {
        customClasses: schoolClasses,
        removedClasses: [],
        inactiveClasses: []
      });

      // Seed initial grades
      initialGrades.forEach(g => {
        if (studentsToSeed.some(s => s.id === g.studentId)) {
          batch.set(doc(db, 'schools', schoolId, 'grades', `${g.studentId}_${g.subjectId}`), { ...g, schoolName, schoolId });
        }
      });

      // Seed initial attendance
      initialAttendanceRecords.forEach(a => {
        if (studentsToSeed.some(s => s.id === a.studentId)) {
          batch.set(doc(db, 'schools', schoolId, 'attendance', a.id), { ...a, schoolName, schoolId });
        }
      });

      if (schoolId === 'sman_1_indonesia') {
        initialTeachingLogs.forEach(l => {
          batch.set(doc(db, 'schools', schoolId, 'teachingLogs', l.id), { ...l, schoolName, schoolId });
        });
        initialStudentTasks.forEach(t => {
          batch.set(doc(db, 'schools', schoolId, 'studentTasks', t.id), { ...t, schoolName, schoolId });
        });
      }

      await batch.commit();
      console.log(`Seeded dedicated storage for school: ${schoolName} (${schoolId})`);
    }
  } catch (err) {
    console.warn(`Error seeding school data for ${schoolId}:`, err);
  }
};

export const seedInitialDataIfEmpty = async () => {
  try {
    // Seed default schools
    await Promise.all([
      seedSchoolDataIfEmpty('sman_1_indonesia', 'SMA Negeri 1 Indonesia - Sekolah Penggerak'),
      seedSchoolDataIfEmpty('sma_negeri_2_surabaya', 'SMA Negeri 2 Surabaya'),
      seedSchoolDataIfEmpty('sma_muhammadiyah_1_jakarta', 'SMA Muhammadiyah 1 Jakarta')
    ]);

    // Ensure initialRegisteredSchools exist in /schools
    for (const s of initialRegisteredSchools) {
      await setDoc(doc(db, 'schools', s.id), s, { merge: true });
    }

    // Fallback: seed root students if totally empty
    const studentsSnap = await getDocs(collection(db, 'students'));
    if (studentsSnap.empty) {
      const batch = writeBatch(db);
      allDefaultStudents.forEach(s => batch.set(doc(db, 'students', s.id), s));
      initialSubjects.forEach((s: any) => batch.set(doc(db, 'settings', 'subjects'), { items: initialSubjects }));
      initialGrades.forEach(g => batch.set(doc(db, 'grades', `${g.studentId}_${g.subjectId}`), g));
      initialAttendanceRecords.forEach(a => batch.set(doc(db, 'attendance', a.id), a));
      initialTeachingLogs.forEach(l => batch.set(doc(db, 'teachingLogs', l.id), l));
      initialStudentTasks.forEach(t => batch.set(doc(db, 'studentTasks', t.id), t));
      initialTeacherProfiles.forEach((t: any) => batch.set(doc(db, 'settings', 'teacherProfiles'), { items: initialTeacherProfiles }));
      await batch.commit();
    }
  } catch (err) {
    console.warn('Error during seedInitialDataIfEmpty:', err);
  }
};

/* ==================== STUDENTS (PER-SCHOOL STORAGE) ==================== */

export const saveStudentToFirebase = async (item: any, explicitSchoolId?: string) => {
  if (item && item.id) {
    const sId = explicitSchoolId || (item.schoolName ? normalizeSchoolId(item.schoolName) : currentActiveSchoolId);
    const sName = item.schoolName || currentActiveSchoolName;
    const cleanItem = JSON.parse(JSON.stringify({ ...item, schoolId: sId, schoolName: sName }));
    // Dedicated school storage
    await setDoc(doc(db, 'schools', sId, 'students', item.id), cleanItem, { merge: true });
    // Root collection mirror
    await setDoc(doc(db, 'students', item.id), cleanItem, { merge: true });
  }
};

export const clearAllStudentsFromFirebase = async (explicitSchoolId?: string) => {
  try {
    const sId = explicitSchoolId || currentActiveSchoolId;
    const schoolStudentsRef = collection(db, 'schools', sId, 'students');
    const snap = await getDocs(schoolStudentsRef);
    const batch = writeBatch(db);
    snap.forEach(d => {
      batch.delete(doc(db, 'schools', sId, 'students', d.id));
      batch.delete(doc(db, 'students', d.id));
    });
    const rootSnap = await getDocs(collection(db, 'students'));
    rootSnap.forEach(d => {
      batch.delete(doc(db, 'students', d.id));
    });
    await batch.commit();
  } catch (err) {
    console.warn('Error clearing all students from Firebase:', err);
  }
};

export const saveStudentsBatchToFirebase = async (items: any[], explicitSchoolId?: string) => {
  if (!items || items.length === 0) {
    await clearAllStudentsFromFirebase(explicitSchoolId);
    return;
  }
  const sId = explicitSchoolId || (items[0]?.schoolName ? normalizeSchoolId(items[0].schoolName) : currentActiveSchoolId);
  const sName = items[0]?.schoolName || currentActiveSchoolName;
  const batch = writeBatch(db);
  items.forEach(item => {
    if (item.id) {
      const cleanItem = JSON.parse(JSON.stringify({ ...item, schoolId: sId, schoolName: item.schoolName || sName }));
      batch.set(doc(db, 'schools', sId, 'students', item.id), cleanItem, { merge: true });
      batch.set(doc(db, 'students', item.id), cleanItem, { merge: true });
    }
  });
  await batch.commit();
};

export const deleteStudentFromFirebase = async (id: string, explicitSchoolId?: string) => {
  if (id) {
    const sId = explicitSchoolId || currentActiveSchoolId;
    await deleteDoc(doc(db, 'schools', sId, 'students', id));
    await deleteDoc(doc(db, 'students', id));
  }
};

/* ==================== GRADES (PER-SCHOOL STORAGE) ==================== */

export const saveGradeToFirebase = async (item: any, explicitSchoolId?: string) => {
  const docId = item.id || `${item.studentId}_${item.subjectId}`;
  if (item && docId) {
    const sId = explicitSchoolId || (item.schoolName ? normalizeSchoolId(item.schoolName) : currentActiveSchoolId);
    const sName = item.schoolName || currentActiveSchoolName;
    const cleanItem = JSON.parse(JSON.stringify({ ...item, schoolId: sId, schoolName: sName }));
    await setDoc(doc(db, 'schools', sId, 'grades', docId), cleanItem, { merge: true });
    await setDoc(doc(db, 'grades', docId), cleanItem, { merge: true });
  }
};

export const saveGradesBatchToFirebase = async (items: any[], explicitSchoolId?: string) => {
  if (!items || items.length === 0) return;
  const sId = explicitSchoolId || (items[0]?.schoolName ? normalizeSchoolId(items[0].schoolName) : currentActiveSchoolId);
  const sName = items[0]?.schoolName || currentActiveSchoolName;
  const batch = writeBatch(db);
  items.forEach(item => {
    const docId = item.id || `${item.studentId}_${item.subjectId}`;
    if (docId) {
      const cleanItem = JSON.parse(JSON.stringify({ ...item, schoolId: sId, schoolName: item.schoolName || sName }));
      batch.set(doc(db, 'schools', sId, 'grades', docId), cleanItem, { merge: true });
      batch.set(doc(db, 'grades', docId), cleanItem, { merge: true });
    }
  });
  await batch.commit();
};

/* ==================== ATTENDANCE (PER-SCHOOL STORAGE) ==================== */

export const saveAttendanceRecordToFirebase = async (item: any, explicitSchoolId?: string) => {
  if (item && item.id) {
    const sId = explicitSchoolId || (item.schoolName ? normalizeSchoolId(item.schoolName) : currentActiveSchoolId);
    const sName = item.schoolName || currentActiveSchoolName;
    const cleanItem = JSON.parse(JSON.stringify({ ...item, schoolId: sId, schoolName: sName }));
    await setDoc(doc(db, 'schools', sId, 'attendance', item.id), cleanItem, { merge: true });
    await setDoc(doc(db, 'attendance', item.id), cleanItem, { merge: true });
  }
};

export const saveAttendanceRecordsBatchToFirebase = async (items: any[], explicitSchoolId?: string) => {
  if (!items || items.length === 0) return;
  const sId = explicitSchoolId || (items[0]?.schoolName ? normalizeSchoolId(items[0].schoolName) : currentActiveSchoolId);
  const sName = items[0]?.schoolName || currentActiveSchoolName;
  const batch = writeBatch(db);
  items.forEach(item => {
    if (item.id) {
      const cleanItem = JSON.parse(JSON.stringify({ ...item, schoolId: sId, schoolName: item.schoolName || sName }));
      batch.set(doc(db, 'schools', sId, 'attendance', item.id), cleanItem, { merge: true });
      batch.set(doc(db, 'attendance', item.id), cleanItem, { merge: true });
    }
  });
  await batch.commit();
};

export const deleteAttendanceRecordsBatchFromFirebase = async (ids: string[], explicitSchoolId?: string) => {
  const sId = explicitSchoolId || currentActiveSchoolId;
  const batch = writeBatch(db);
  ids.forEach(id => {
    batch.delete(doc(db, 'schools', sId, 'attendance', id));
    batch.delete(doc(db, 'attendance', id));
  });
  await batch.commit();
};

/* ==================== TEACHING LOGS (PER-SCHOOL STORAGE) ==================== */

export const saveTeachingLogToFirebase = async (item: any, explicitSchoolId?: string) => {
  if (item && item.id) {
    const sId = explicitSchoolId || (item.schoolName ? normalizeSchoolId(item.schoolName) : currentActiveSchoolId);
    const sName = item.schoolName || currentActiveSchoolName;
    const cleanItem = JSON.parse(JSON.stringify({ ...item, schoolId: sId, schoolName: sName }));
    await setDoc(doc(db, 'schools', sId, 'teachingLogs', item.id), cleanItem, { merge: true });
    await setDoc(doc(db, 'teachingLogs', item.id), cleanItem, { merge: true });
  }
};

export const deleteTeachingLogFromFirebase = async (id: string, explicitSchoolId?: string) => {
  if (id) {
    const sId = explicitSchoolId || currentActiveSchoolId;
    await deleteDoc(doc(db, 'schools', sId, 'teachingLogs', id));
    await deleteDoc(doc(db, 'teachingLogs', id));
  }
};

/* ==================== STUDENT TASKS (PER-SCHOOL STORAGE) ==================== */

export const saveStudentTaskToFirebase = async (item: any, explicitSchoolId?: string) => {
  if (item && item.id) {
    const sId = explicitSchoolId || (item.schoolName ? normalizeSchoolId(item.schoolName) : currentActiveSchoolId);
    const sName = item.schoolName || currentActiveSchoolName;
    const cleanItem = JSON.parse(JSON.stringify({ ...item, schoolId: sId, schoolName: sName }));
    await setDoc(doc(db, 'schools', sId, 'studentTasks', item.id), cleanItem, { merge: true });
    await setDoc(doc(db, 'studentTasks', item.id), cleanItem, { merge: true });
  }
};

export const deleteStudentTaskFromFirebase = async (id: string, explicitSchoolId?: string) => {
  if (id) {
    const sId = explicitSchoolId || currentActiveSchoolId;
    await deleteDoc(doc(db, 'schools', sId, 'studentTasks', id));
    await deleteDoc(doc(db, 'studentTasks', id));
  }
};

/* ==================== SETTINGS & SUB-SYSTEMS (PER-SCHOOL STORAGE) ==================== */

export const saveBukuIndukPegawaiToFirebase = async (data: any, scope: string = '', explicitSchoolId?: string) => {
  const sId = explicitSchoolId || (scope ? normalizeSchoolId(scope) : currentActiveSchoolId);
  const payload = Array.isArray(data) ? { items: data } : data;
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'schools', sId, 'settings', 'bukuIndukPegawai'), cleanPayload, { merge: true });
  await setDoc(doc(db, 'settings', 'bukuIndukPegawai' + scope), cleanPayload, { merge: true });
};

export const saveClassKkmsToFirebase = async (data: any, scope: string = '', explicitSchoolId?: string) => {
  const sId = explicitSchoolId || (scope ? normalizeSchoolId(scope) : currentActiveSchoolId);
  const payload = Array.isArray(data) ? { items: data } : data;
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'schools', sId, 'settings', 'classKkms'), cleanPayload, { merge: true });
  await setDoc(doc(db, 'settings', 'classKkms' + scope), cleanPayload, { merge: true });
};

export const saveClassListsToFirebase = async (customClasses: any, removedClasses: any, scope: string = '', inactiveClasses: any = [], explicitSchoolId?: string) => {
  const sId = explicitSchoolId || (scope ? normalizeSchoolId(scope) : currentActiveSchoolId);
  const payload = { customClasses, removedClasses, inactiveClasses };
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'schools', sId, 'settings', 'classLists'), cleanPayload, { merge: true });
  await setDoc(doc(db, 'settings', 'classLists' + scope), cleanPayload, { merge: true });
};

export const saveCurriculumEventsToFirebase = async (data: any, scope: string = '', explicitSchoolId?: string) => {
  const sId = explicitSchoolId || (scope ? normalizeSchoolId(scope) : currentActiveSchoolId);
  const payload = Array.isArray(data) ? { items: data } : data;
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'schools', sId, 'settings', 'curriculumEvents'), cleanPayload, { merge: true });
  await setDoc(doc(db, 'settings', 'curriculumEvents' + scope), cleanPayload, { merge: true });
};

export const saveCurriculumJjmToFirebase = async (data: any, scope: string = '', explicitSchoolId?: string) => {
  const sId = explicitSchoolId || (scope ? normalizeSchoolId(scope) : currentActiveSchoolId);
  const payload = Array.isArray(data) ? { items: data } : data;
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'schools', sId, 'settings', 'curriculumJjm'), cleanPayload, { merge: true });
  await setDoc(doc(db, 'settings', 'curriculumJjm' + scope), cleanPayload, { merge: true });
};

export const saveCurriculumP5ToFirebase = async (data: any, scope: string = '', explicitSchoolId?: string) => {
  const sId = explicitSchoolId || (scope ? normalizeSchoolId(scope) : currentActiveSchoolId);
  const payload = Array.isArray(data) ? { items: data } : data;
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'schools', sId, 'settings', 'curriculumP5'), cleanPayload, { merge: true });
  await setDoc(doc(db, 'settings', 'curriculumP5' + scope), cleanPayload, { merge: true });
};

export const saveDataLockConfigToFirebase = async (data: any, scope: string = '', explicitSchoolId?: string) => {
  const sId = explicitSchoolId || (scope ? normalizeSchoolId(scope) : currentActiveSchoolId);
  const payload = Array.isArray(data) ? { items: data } : data;
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'schools', sId, 'settings', 'dataLockConfig'), cleanPayload, { merge: true });
  await setDoc(doc(db, 'settings', 'dataLockConfig' + scope), cleanPayload, { merge: true });
};

export const saveEncryptionCodeToFirebase = async (code: any, previousCode?: string, scope: string = '') => {
  const docId = 'encryptionCode' + scope;
  const newCode = typeof code === 'string' ? code : (code?.code || '');
  const prevCode = previousCode || (typeof code === 'object' ? code?.previousCode : null);
  const payload = { 
    code: newCode, 
    previousCode: prevCode || null,
    updatedAt: new Date().toISOString() 
  };
  await setDoc(doc(db, 'settings', docId), payload, { merge: true });
};

export const saveExtraRecordsToFirebase = async (data: any, scope: string = '', explicitSchoolId?: string) => {
  const sId = explicitSchoolId || (scope ? normalizeSchoolId(scope) : currentActiveSchoolId);
  const payload = Array.isArray(data) ? { items: data } : data;
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'schools', sId, 'settings', 'extraRecords'), cleanPayload, { merge: true });
  await setDoc(doc(db, 'settings', 'extraRecords' + scope), cleanPayload, { merge: true });
};

export const saveExtracurricularSettingsToFirebase = async (data: any, scope: string = '', explicitSchoolId?: string) => {
  const sId = explicitSchoolId || (scope ? normalizeSchoolId(scope) : currentActiveSchoolId);
  const payload = Array.isArray(data) ? { items: data } : data;
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'schools', sId, 'settings', 'extracurricularSettings'), cleanPayload, { merge: true });
  await setDoc(doc(db, 'settings', 'extracurricularSettings' + scope), cleanPayload, { merge: true });
};

export const saveInfoAnnouncementToFirebase = async (data: any, scope: string = '') => {
  const docId = 'infoAnnouncement' + scope;
  const payload = Array.isArray(data) ? { items: data } : data;
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'settings', docId), cleanPayload, { merge: true });
};

export const saveLastSyncedTimeToFirebase = async (data: any, scope: string = '', explicitSchoolId?: string) => {
  const sId = explicitSchoolId || (scope ? normalizeSchoolId(scope) : currentActiveSchoolId);
  const payload = Array.isArray(data) ? { items: data } : data;
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'schools', sId, 'settings', 'lastSyncedTime'), cleanPayload, { merge: true });
  await setDoc(doc(db, 'settings', 'lastSyncedTime' + scope), cleanPayload, { merge: true });
};

export const saveLoginBackgroundConfigToFirebase = async (data: any, scope: string = '') => {
  const docId = 'loginBackgroundConfig' + scope;
  const payload = Array.isArray(data) ? { items: data } : data;
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'settings', docId), cleanPayload, { merge: true });
};

export const saveMutasiSiswaToFirebase = async (data: any, scope: string = '', explicitSchoolId?: string) => {
  const sId = explicitSchoolId || (scope ? normalizeSchoolId(scope) : currentActiveSchoolId);
  const payload = Array.isArray(data) ? { items: data } : data;
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'schools', sId, 'settings', 'mutasiSiswa'), cleanPayload, { merge: true });
  await setDoc(doc(db, 'settings', 'mutasiSiswa' + scope), cleanPayload, { merge: true });
};

export const saveRegisteredUsersToFirebase = async (data: any, scope: string = '') => {
  const docId = 'registeredUsers' + scope;
  const payload = Array.isArray(data) ? { items: data } : data;
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'settings', docId), cleanPayload, { merge: true });
};

export const saveSubjectsToFirebase = async (data: any, scope: string = '', explicitSchoolId?: string) => {
  const sId = explicitSchoolId || (scope ? normalizeSchoolId(scope) : currentActiveSchoolId);
  const payload = Array.isArray(data) ? { items: data } : data;
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'schools', sId, 'settings', 'subjects'), cleanPayload, { merge: true });
  await setDoc(doc(db, 'settings', 'subjects' + scope), cleanPayload, { merge: true });
};

export const saveSyncLogsToFirebase = async (data: any, scope: string = '', explicitSchoolId?: string) => {
  const sId = explicitSchoolId || (scope ? normalizeSchoolId(scope) : currentActiveSchoolId);
  const payload = Array.isArray(data) ? { items: data } : data;
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'schools', sId, 'settings', 'syncLogs'), cleanPayload, { merge: true });
  await setDoc(doc(db, 'settings', 'syncLogs' + scope), cleanPayload, { merge: true });
};

export const saveTeacherProfileToFirebase = async (item: any, explicitSchoolId?: string) => {
  if (item && item.id) {
    const sId = explicitSchoolId || (item.schoolName ? normalizeSchoolId(item.schoolName) : currentActiveSchoolId);
    const cleanItem = JSON.parse(JSON.stringify({ ...item, schoolId: sId }));
    await setDoc(doc(db, 'schools', sId, 'settings', `teacherProfile_${item.id}`), cleanItem, { merge: true });
    await setDoc(doc(db, 'teacherProfiles', item.id), cleanItem, { merge: true });
  }
};

export const saveTeacherProfilesToFirebase = async (data: any, scope: string = '') => {
  const docId = 'teacherProfiles' + scope;
  const payload = Array.isArray(data) ? { items: data } : data;
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'settings', docId), cleanPayload, { merge: true });
};

export const saveTeachingSchedulesToFirebase = async (data: any, scope: string = '', explicitSchoolId?: string) => {
  const sId = explicitSchoolId || (scope ? normalizeSchoolId(scope) : currentActiveSchoolId);
  const payload = Array.isArray(data) ? { items: data } : data;
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'schools', sId, 'settings', 'teachingSchedules'), cleanPayload, { merge: true });
  await setDoc(doc(db, 'settings', 'teachingSchedules' + scope), cleanPayload, { merge: true });
};

export const saveWeeklySchedulesToFirebase = async (data: any, scope: string = '', explicitSchoolId?: string) => {
  const sId = explicitSchoolId || (scope ? normalizeSchoolId(scope) : currentActiveSchoolId);
  const payload = Array.isArray(data) ? { items: data } : data;
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'schools', sId, 'settings', 'weeklyClassSchedules'), cleanPayload, { merge: true });
  await setDoc(doc(db, 'settings', 'weeklyClassSchedules' + scope), cleanPayload, { merge: true });
};

/* ==================== SUBSCRIPTIONS ==================== */

export const subscribeToBukuIndukPegawai = (callback: (data: any) => void, scope: string = '', explicitSchoolId?: string) => {
  const sId = explicitSchoolId || (scope ? normalizeSchoolId(scope) : currentActiveSchoolId);
  return onSnapshot(doc(db, 'schools', sId, 'settings', 'bukuIndukPegawai'), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback(data.items !== undefined ? data.items : data);
    } else {
      // Fallback to legacy global settings doc
      onSnapshot(doc(db, 'settings', 'bukuIndukPegawai' + scope), (legacySnap) => {
        if (legacySnap.exists()) {
          const lData = legacySnap.data();
          callback(lData.items !== undefined ? lData.items : lData);
        } else {
          callback(null);
        }
      });
    }
  });
};

export const subscribeToClassKkms = (callback: (data: any) => void, scope: string = '', explicitSchoolId?: string) => {
  const sId = explicitSchoolId || (scope ? normalizeSchoolId(scope) : currentActiveSchoolId);
  return onSnapshot(doc(db, 'schools', sId, 'settings', 'classKkms'), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback(data.items !== undefined ? data.items : data);
    } else {
      callback(null);
    }
  });
};

export const subscribeToCurriculumEvents = (callback: (data: any) => void, scope: string = '', explicitSchoolId?: string) => {
  const sId = explicitSchoolId || (scope ? normalizeSchoolId(scope) : currentActiveSchoolId);
  return onSnapshot(doc(db, 'schools', sId, 'settings', 'curriculumEvents'), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback(data.items !== undefined ? data.items : data);
    } else {
      callback(null);
    }
  });
};

export const subscribeToCurriculumJjm = (callback: (data: any) => void, scope: string = '', explicitSchoolId?: string) => {
  const sId = explicitSchoolId || (scope ? normalizeSchoolId(scope) : currentActiveSchoolId);
  return onSnapshot(doc(db, 'schools', sId, 'settings', 'curriculumJjm'), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback(data.items !== undefined ? data.items : data);
    } else {
      callback(null);
    }
  });
};

export const subscribeToCurriculumP5 = (callback: (data: any) => void, scope: string = '', explicitSchoolId?: string) => {
  const sId = explicitSchoolId || (scope ? normalizeSchoolId(scope) : currentActiveSchoolId);
  return onSnapshot(doc(db, 'schools', sId, 'settings', 'curriculumP5'), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback(data.items !== undefined ? data.items : data);
    } else {
      callback(null);
    }
  });
};

export const subscribeToDataLockConfig = (callback: (data: any) => void, scope: string = '') => {
  const docId = 'dataLockConfig' + scope;
  return onSnapshot(doc(db, 'settings', docId), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback(data.items !== undefined ? data.items : data);
    } else {
      callback(null);
    }
  });
};

export const subscribeToEncryptionCode = (callback: (data: any) => void, scope: string = '') => {
  const docId = 'encryptionCode' + scope;
  return onSnapshot(doc(db, 'settings', docId), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback(data.items !== undefined ? data.items : data);
    } else {
      callback(null);
    }
  });
};

export const subscribeToInfoAnnouncement = (callback: (data: any) => void, scope: string = '') => {
  const docId = 'infoAnnouncement' + scope;
  return onSnapshot(doc(db, 'settings', docId), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback(data.items !== undefined ? data.items : data);
    } else {
      callback(null);
    }
  });
};

export const subscribeToLastSyncedTime = (callback: (data: any) => void, scope: string = '', explicitSchoolId?: string) => {
  const sId = explicitSchoolId || (scope ? normalizeSchoolId(scope) : currentActiveSchoolId);
  return onSnapshot(doc(db, 'schools', sId, 'settings', 'lastSyncedTime'), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback(data.items !== undefined ? data.items : data);
    } else {
      callback(null);
    }
  });
};

export const subscribeToLoginBackgroundConfig = (callback: (data: any) => void, scope: string = '') => {
  const docId = 'loginBackgroundConfig' + scope;
  return onSnapshot(doc(db, 'settings', docId), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback(data.items !== undefined ? data.items : data);
    } else {
      callback(null);
    }
  });
};

export const subscribeToMutasiSiswa = (callback: (data: any) => void, scope: string = '', explicitSchoolId?: string) => {
  const sId = explicitSchoolId || (scope ? normalizeSchoolId(scope) : currentActiveSchoolId);
  return onSnapshot(doc(db, 'schools', sId, 'settings', 'mutasiSiswa'), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback(data.items !== undefined ? data.items : data);
    } else {
      callback(null);
    }
  });
};

export const subscribeToRegisteredUsers = (callback: (data: any) => void, scope: string = '') => {
  const docId = 'registeredUsers' + scope;
  return onSnapshot(doc(db, 'settings', docId), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback(data.items !== undefined ? data.items : data);
    } else {
      callback(null);
    }
  });
};

export const subscribeToSchedules = (callback: (data: any) => void, scope: string = '', explicitSchoolId?: string) => {
  const sId = explicitSchoolId || (scope ? normalizeSchoolId(scope) : currentActiveSchoolId);
  return onSnapshot(doc(db, 'schools', sId, 'settings', 'teachingSchedules'), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback(data.items !== undefined ? data.items : data);
    } else {
      callback(null);
    }
  });
};

export const subscribeToWeeklySchedules = (callback: (data: any) => void, scope: string = '', explicitSchoolId?: string) => {
  const sId = explicitSchoolId || (scope ? normalizeSchoolId(scope) : currentActiveSchoolId);
  return onSnapshot(doc(db, 'schools', sId, 'settings', 'weeklyClassSchedules'), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback(data.items !== undefined ? data.items : data);
    } else {
      callback(null);
    }
  });
};

export const subscribeToSyncLogs = (callback: (data: any) => void, scope: string = '', explicitSchoolId?: string) => {
  const sId = explicitSchoolId || (scope ? normalizeSchoolId(scope) : currentActiveSchoolId);
  return onSnapshot(doc(db, 'schools', sId, 'settings', 'syncLogs'), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback(data.items !== undefined ? data.items : data);
    } else {
      callback(null);
    }
  });
};

export const subscribeToTeacherProfiles = (callback: (data: any) => void, scope: string = '') => {
  const docId = 'teacherProfiles' + scope;
  return onSnapshot(doc(db, 'settings', docId), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback(data.items !== undefined ? data.items : data);
    } else {
      callback(null);
    }
  });
};

/* ==================== PPDB / SPMB REGISTRATIONS ==================== */

export const savePpdbRegistrationToFirebase = async (item: PpdbRegistration) => {
  if (item && item.id) {
    const sampleIds = ['SPMB-1718290001', 'SPMB-1718290002', 'SPMB-1718290003'];
    try {
      const cleanItem = JSON.parse(JSON.stringify(item));
      await setDoc(doc(db, 'ppdbRegistrations', item.id), cleanItem, { merge: true });
      
      const savedLocal = typeof window !== 'undefined' ? localStorage.getItem('simak_ppdb_registrations') : null;
      let currentList: PpdbRegistration[] = savedLocal ? JSON.parse(savedLocal).filter((r: PpdbRegistration) => !sampleIds.includes(r.id)) : [];
      const existingIdx = currentList.findIndex(r => r.id === item.id);
      if (existingIdx >= 0) {
        currentList[existingIdx] = cleanItem;
      } else {
        currentList = [cleanItem, ...currentList];
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('simak_ppdb_registrations', JSON.stringify(currentList));
      }
      await setDoc(doc(db, 'settings', 'ppdbRegistrations'), { items: currentList }, { merge: true });
    } catch (e) {
      console.warn('savePpdbRegistrationToFirebase error, saving locally:', e);
      if (typeof window !== 'undefined') {
        const savedLocal = localStorage.getItem('simak_ppdb_registrations');
        let currentList: PpdbRegistration[] = savedLocal ? JSON.parse(savedLocal).filter((r: PpdbRegistration) => !sampleIds.includes(r.id)) : [];
        const existingIdx = currentList.findIndex(r => r.id === item.id);
        if (existingIdx >= 0) {
          currentList[existingIdx] = item;
        } else {
          currentList = [item, ...currentList];
        }
        localStorage.setItem('simak_ppdb_registrations', JSON.stringify(currentList));
      }
    }
  }
};

export const savePpdbRegistrationsBatchToFirebase = async (items: PpdbRegistration[]) => {
  try {
    const cleanList = JSON.parse(JSON.stringify(items));
    if (typeof window !== 'undefined') {
      localStorage.setItem('simak_ppdb_registrations', JSON.stringify(cleanList));
    }
    await setDoc(doc(db, 'settings', 'ppdbRegistrations'), { items: cleanList }, { merge: true });
  } catch (e) {
    console.warn('savePpdbRegistrationsBatchToFirebase error:', e);
  }
};

export const deletePpdbRegistrationFromFirebase = async (id: string) => {
  if (id) {
    try {
      await deleteDoc(doc(db, 'ppdbRegistrations', id));
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('simak_ppdb_registrations');
        if (saved) {
          const list: PpdbRegistration[] = JSON.parse(saved).filter((r: PpdbRegistration) => r.id !== id);
          localStorage.setItem('simak_ppdb_registrations', JSON.stringify(list));
          await setDoc(doc(db, 'settings', 'ppdbRegistrations'), { items: list }, { merge: true });
        }
      }
    } catch (e) {
      console.warn('deletePpdbRegistrationFromFirebase error:', e);
    }
  }
};

export const subscribeToPpdbRegistrations = (callback: (data: PpdbRegistration[] | null) => void) => {
  return onSnapshot(doc(db, 'settings', 'ppdbRegistrations'), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback(data.items !== undefined ? data.items : data);
    } else {
      callback(null);
    }
  });
};

export const savePpdbAccessConfigToFirebase = async (isOpen: boolean) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('simak_ppdb_access_open', JSON.stringify(isOpen));
    }
    await setDoc(doc(db, 'settings', 'ppdbAccessConfig'), { isOpen, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (e) {
    console.warn('savePpdbAccessConfigToFirebase error:', e);
  }
};

export const subscribeToPpdbAccessConfig = (callback: (isOpen: boolean) => void) => {
  return onSnapshot(doc(db, 'settings', 'ppdbAccessConfig'), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback(data.isOpen !== undefined ? Boolean(data.isOpen) : true);
    } else {
      callback(true);
    }
  });
};


