import { allDefaultStudents, initialSubjects, initialGrades, initialAttendanceRecords, initialTeachingLogs, initialStudentTasks, initialTeacherProfiles, initialAnnouncements } from '../data/initialData';

import { db } from './firestore';
import { collection, doc, setDoc, deleteDoc, writeBatch, onSnapshot, getDocs } from 'firebase/firestore';


export const seedInitialDataIfEmpty = async () => {
  // Only seed if students collection is empty
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
    console.log('Seeded initial data to Firestore');
  }
};


export const deleteAttendanceRecordsBatchFromFirebase = async (ids: string[]) => {
  const batch = writeBatch(db);
  ids.forEach(id => {
    batch.delete(doc(db, 'attendance', id));
  });
  await batch.commit();
};
export const deleteStudentFromFirebase = async (id: string) => {
  if (id) await deleteDoc(doc(db, 'students', id));
};
export const deleteStudentTaskFromFirebase = async (id: string) => {
  if (id) await deleteDoc(doc(db, 'studentTasks', id));
};
export const deleteTeachingLogFromFirebase = async (id: string) => {
  if (id) await deleteDoc(doc(db, 'teachingLogs', id));
};
export const saveAttendanceRecordToFirebase = async (item: any) => {
  if (item && item.id) {
    const cleanItem = JSON.parse(JSON.stringify(item));
    await setDoc(doc(db, 'attendance', item.id), cleanItem, { merge: true });
  }
};
export const saveAttendanceRecordsBatchToFirebase = async (items: any[]) => {
  const batch = writeBatch(db);
  items.forEach(item => {
    if (item.id) {
      const cleanItem = JSON.parse(JSON.stringify(item));
      batch.set(doc(db, 'attendance', item.id), cleanItem, { merge: true });
    }
  });
  await batch.commit();
};
export const saveBukuIndukPegawaiToFirebase = async (data: any, scope: string = '') => {
  const docId = 'bukuIndukPegawai' + scope;
  const payload = Array.isArray(data) ? { items: data } : data;
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'settings', docId), cleanPayload, { merge: true });
};
export const saveClassKkmsToFirebase = async (data: any, scope: string = '') => {
  const docId = 'classKkms' + scope;
  const payload = Array.isArray(data) ? { items: data } : data;
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'settings', docId), cleanPayload, { merge: true });
};
export const saveClassListsToFirebase = async (customClasses: any, removedClasses: any, scope: string = '', inactiveClasses: any = []) => {
  const docId = 'classLists' + scope;
  const payload = { customClasses, removedClasses, inactiveClasses };
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'settings', docId), cleanPayload, { merge: true });
};
export const saveCurriculumEventsToFirebase = async (data: any, scope: string = '') => {
  const docId = 'curriculumEvents' + scope;
  const payload = Array.isArray(data) ? { items: data } : data;
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'settings', docId), cleanPayload, { merge: true });
};
export const saveCurriculumJjmToFirebase = async (data: any, scope: string = '') => {
  const docId = 'curriculumJjm' + scope;
  const payload = Array.isArray(data) ? { items: data } : data;
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'settings', docId), cleanPayload, { merge: true });
};
export const saveCurriculumP5ToFirebase = async (data: any, scope: string = '') => {
  const docId = 'curriculumP5' + scope;
  const payload = Array.isArray(data) ? { items: data } : data;
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'settings', docId), cleanPayload, { merge: true });
};
export const saveDataLockConfigToFirebase = async (data: any, scope: string = '') => {
  const docId = 'dataLockConfig' + scope;
  const payload = Array.isArray(data) ? { items: data } : data;
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'settings', docId), cleanPayload, { merge: true });
};
export const saveEncryptionCodeToFirebase = async (data: any, scope: string = '') => {
  const docId = 'encryptionCode' + scope;
  const payload = Array.isArray(data) ? { items: data } : data;
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'settings', docId), cleanPayload, { merge: true });
};
export const saveExtraRecordsToFirebase = async (data: any, scope: string = '') => {
  const docId = 'extraRecords' + scope;
  const payload = Array.isArray(data) ? { items: data } : data;
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'settings', docId), cleanPayload, { merge: true });
};
export const saveExtracurricularSettingsToFirebase = async (data: any, scope: string = '') => {
  const docId = 'extracurricularSettings' + scope;
  const payload = Array.isArray(data) ? { items: data } : data;
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'settings', docId), cleanPayload, { merge: true });
};
export const saveGradeToFirebase = async (item: any) => {
  const docId = item.id || `${item.studentId}_${item.subjectId}`;
  if (item && docId) {
    const cleanItem = JSON.parse(JSON.stringify(item));
    await setDoc(doc(db, 'grades', docId), cleanItem, { merge: true });
  }
};
export const saveGradesBatchToFirebase = async (items: any[]) => {
  const batch = writeBatch(db);
  items.forEach(item => {
    const docId = item.id || `${item.studentId}_${item.subjectId}`;
    if (docId) {
      const cleanItem = JSON.parse(JSON.stringify(item));
      batch.set(doc(db, 'grades', docId), cleanItem, { merge: true });
    }
  });
  await batch.commit();
};
export const saveInfoAnnouncementToFirebase = async (data: any, scope: string = '') => {
  const docId = 'infoAnnouncement' + scope;
  const payload = Array.isArray(data) ? { items: data } : data;
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'settings', docId), cleanPayload, { merge: true });
};
export const saveLastSyncedTimeToFirebase = async (data: any, scope: string = '') => {
  const docId = 'lastSyncedTime' + scope;
  const payload = Array.isArray(data) ? { items: data } : data;
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'settings', docId), cleanPayload, { merge: true });
};
export const saveLoginBackgroundConfigToFirebase = async (data: any, scope: string = '') => {
  const docId = 'loginBackgroundConfig' + scope;
  const payload = Array.isArray(data) ? { items: data } : data;
  // Strip undefined values to prevent Firebase setDoc errors
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'settings', docId), cleanPayload, { merge: true });
};
export const saveMutasiSiswaToFirebase = async (data: any, scope: string = '') => {
  const docId = 'mutasiSiswa' + scope;
  const payload = Array.isArray(data) ? { items: data } : data;
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'settings', docId), cleanPayload, { merge: true });
};
export const saveRegisteredUsersToFirebase = async (data: any, scope: string = '') => {
  const docId = 'registeredUsers' + scope;
  const payload = Array.isArray(data) ? { items: data } : data;
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'settings', docId), cleanPayload, { merge: true });
};
export const saveStudentTaskToFirebase = async (item: any) => {
  if (item && item.id) {
    const cleanItem = JSON.parse(JSON.stringify(item));
    await setDoc(doc(db, 'studentTasks', item.id), cleanItem, { merge: true });
  }
};
export const saveStudentToFirebase = async (item: any) => {
  if (item && item.id) {
    const cleanItem = JSON.parse(JSON.stringify(item));
    await setDoc(doc(db, 'students', item.id), cleanItem, { merge: true });
  }
};
export const saveStudentsBatchToFirebase = async (items: any[]) => {
  const batch = writeBatch(db);
  items.forEach(item => {
    if (item.id) {
      const cleanItem = JSON.parse(JSON.stringify(item));
      batch.set(doc(db, 'students', item.id), cleanItem, { merge: true });
    }
  });
  await batch.commit();
};
export const saveSubjectsToFirebase = async (data: any, scope: string = '') => {
  const docId = 'subjects' + scope;
  const payload = Array.isArray(data) ? { items: data } : data;
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'settings', docId), cleanPayload, { merge: true });
};
export const saveSyncLogsToFirebase = async (data: any, scope: string = '') => {
  const docId = 'syncLogs' + scope;
  const payload = Array.isArray(data) ? { items: data } : data;
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'settings', docId), cleanPayload, { merge: true });
};
export const saveTeacherProfileToFirebase = async (item: any) => {
  if (item && item.id) {
    const cleanItem = JSON.parse(JSON.stringify(item));
    await setDoc(doc(db, 'teacherProfiles', item.id), cleanItem, { merge: true });
  }
};
export const saveTeacherProfilesToFirebase = async (data: any, scope: string = '') => {
  const docId = 'teacherProfiles' + scope;
  const payload = Array.isArray(data) ? { items: data } : data;
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'settings', docId), cleanPayload, { merge: true });
};
export const saveTeachingLogToFirebase = async (item: any) => {
  if (item && item.id) {
    const cleanItem = JSON.parse(JSON.stringify(item));
    await setDoc(doc(db, 'teachingLogs', item.id), cleanItem, { merge: true });
  }
};
export const saveTeachingSchedulesToFirebase = async (data: any, scope: string = '') => {
  const docId = 'teachingSchedules' + scope;
  const payload = Array.isArray(data) ? { items: data } : data;
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'settings', docId), cleanPayload, { merge: true });
};
export const saveWeeklySchedulesToFirebase = async (data: any, scope: string = '') => {
  const docId = 'weeklyClassSchedules' + scope;
  const payload = Array.isArray(data) ? { items: data } : data;
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(doc(db, 'settings', docId), cleanPayload, { merge: true });
};
export const subscribeToBukuIndukPegawai = (callback: (data: any) => void, scope: string = '') => {
  const docId = 'bukuIndukPegawai' + scope;
  return onSnapshot(doc(db, 'settings', docId), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback(data.items !== undefined ? data.items : data);
    } else {
      callback(null);
    }
  });
};
export const subscribeToClassKkms = (callback: (data: any) => void, scope: string = '') => {
  const docId = 'classKkms' + scope;
  return onSnapshot(doc(db, 'settings', docId), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback(data.items !== undefined ? data.items : data);
    } else {
      callback(null);
    }
  });
};
export const subscribeToCurriculumEvents = (callback: (data: any) => void, scope: string = '') => {
  const docId = 'curriculumEvents' + scope;
  return onSnapshot(doc(db, 'settings', docId), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback(data.items !== undefined ? data.items : data);
    } else {
      callback(null);
    }
  });
};
export const subscribeToCurriculumJjm = (callback: (data: any) => void, scope: string = '') => {
  const docId = 'curriculumJjm' + scope;
  return onSnapshot(doc(db, 'settings', docId), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback(data.items !== undefined ? data.items : data);
    } else {
      callback(null);
    }
  });
};
export const subscribeToCurriculumP5 = (callback: (data: any) => void, scope: string = '') => {
  const docId = 'curriculumP5' + scope;
  return onSnapshot(doc(db, 'settings', docId), (snap) => {
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
export const subscribeToLastSyncedTime = (callback: (data: any) => void, scope: string = '') => {
  const docId = 'lastSyncedTime' + scope;
  return onSnapshot(doc(db, 'settings', docId), (snap) => {
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
export const subscribeToMutasiSiswa = (callback: (data: any) => void, scope: string = '') => {
  const docId = 'mutasiSiswa' + scope;
  return onSnapshot(doc(db, 'settings', docId), (snap) => {
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
export const subscribeToSchedules = (callback: (data: any) => void, scope: string = '') => {
  const docId = 'schedules' + scope;
  return onSnapshot(doc(db, 'settings', docId), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback(data.items !== undefined ? data.items : data);
    } else {
      callback(null);
    }
  });
};
export const subscribeToWeeklySchedules = (callback: (data: any) => void, scope: string = '') => {
  const docId = 'weeklyClassSchedules' + scope;
  return onSnapshot(doc(db, 'settings', docId), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback(data.items !== undefined ? data.items : data);
    } else {
      callback(null);
    }
  });
};
export const subscribeToSyncLogs = (callback: (data: any) => void, scope: string = '') => {
  const docId = 'syncLogs' + scope;
  return onSnapshot(doc(db, 'settings', docId), (snap) => {
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
