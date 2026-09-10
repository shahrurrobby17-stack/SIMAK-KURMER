import re

exports_str = """
export const deleteAttendanceRecordsBatchFromFirebase = (...args: any[]): any => { return () => {}; };
export const deleteStudentFromFirebase = (...args: any[]): any => { return () => {}; };
export const deleteStudentTaskFromFirebase = (...args: any[]): any => { return () => {}; };
export const deleteTeachingLogFromFirebase = (...args: any[]): any => { return () => {}; };
export const saveAttendanceRecordToFirebase = (...args: any[]): any => { return () => {}; };
export const saveAttendanceRecordsBatchToFirebase = (...args: any[]): any => { return () => {}; };
export const saveBukuIndukPegawaiToFirebase = (...args: any[]): any => { return () => {}; };
export const saveClassKkmsToFirebase = (...args: any[]): any => { return () => {}; };
export const saveClassListsToFirebase = (...args: any[]): any => { return () => {}; };
export const saveCurriculumEventsToFirebase = (...args: any[]): any => { return () => {}; };
export const saveCurriculumJjmToFirebase = (...args: any[]): any => { return () => {}; };
export const saveCurriculumP5ToFirebase = (...args: any[]): any => { return () => {}; };
export const saveDataLockConfigToFirebase = (...args: any[]): any => { return () => {}; };
export const saveEncryptionCodeToFirebase = (...args: any[]): any => { return () => {}; };
export const saveExtraRecordsToFirebase = (...args: any[]): any => { return () => {}; };
export const saveExtracurricularSettingsToFirebase = (...args: any[]): any => { return () => {}; };
export const saveGradeToFirebase = (...args: any[]): any => { return () => {}; };
export const saveGradesBatchToFirebase = (...args: any[]): any => { return () => {}; };
export const saveInfoAnnouncementToFirebase = (...args: any[]): any => { return () => {}; };
export const saveLastSyncedTimeToFirebase = (...args: any[]): any => { return () => {}; };
export const saveLoginBackgroundConfigToFirebase = (...args: any[]): any => { return () => {}; };
export const saveMutasiSiswaToFirebase = (...args: any[]): any => { return () => {}; };
export const saveRegisteredUsersToFirebase = (...args: any[]): any => { return () => {}; };
export const saveStudentTaskToFirebase = (...args: any[]): any => { return () => {}; };
export const saveStudentToFirebase = (...args: any[]): any => { return () => {}; };
export const saveStudentsBatchToFirebase = (...args: any[]): any => { return () => {}; };
export const saveSubjectsToFirebase = (...args: any[]): any => { return () => {}; };
export const saveSyncLogsToFirebase = (...args: any[]): any => { return () => {}; };
export const saveTeacherProfileToFirebase = (...args: any[]): any => { return () => {}; };
export const saveTeacherProfilesToFirebase = (...args: any[]): any => { return () => {}; };
export const saveTeachingLogToFirebase = (...args: any[]): any => { return () => {}; };
export const saveTeachingSchedulesToFirebase = (...args: any[]): any => { return () => {}; };
export const seedInitialDataIfEmpty = (...args: any[]): any => { return () => {}; };
export const subscribeToBukuIndukPegawai = (...args: any[]): any => { return () => {}; };
export const subscribeToClassKkms = (...args: any[]): any => { return () => {}; };
export const subscribeToCurriculumEvents = (...args: any[]): any => { return () => {}; };
export const subscribeToCurriculumJjm = (...args: any[]): any => { return () => {}; };
export const subscribeToCurriculumP5 = (...args: any[]): any => { return () => {}; };
export const subscribeToDataLockConfig = (...args: any[]): any => { return () => {}; };
export const subscribeToEncryptionCode = (...args: any[]): any => { return () => {}; };
export const subscribeToInfoAnnouncement = (...args: any[]): any => { return () => {}; };
export const subscribeToLastSyncedTime = (...args: any[]): any => { return () => {}; };
export const subscribeToLoginBackgroundConfig = (...args: any[]): any => { return () => {}; };
export const subscribeToMutasiSiswa = (...args: any[]): any => { return () => {}; };
export const subscribeToRegisteredUsers = (...args: any[]): any => { return () => {}; };
export const subscribeToSchedules = (...args: any[]): any => { return () => {}; };
export const subscribeToSyncLogs = (...args: any[]): any => { return () => {}; };
export const subscribeToTeacherProfiles = (...args: any[]): any => { return () => {}; };
"""

# Let's write a generic implementation for everything.
# For save*:
# if it's a batch, use writeBatch
# if it's a list, save as { items: list } in a document.
# if it's a single item, save to its collection.

impl = """
import { db } from './firestore';
import { collection, doc, setDoc, deleteDoc, writeBatch, onSnapshot } from 'firebase/firestore';

export const seedInitialDataIfEmpty = async () => {};

"""

for line in exports_str.strip().split('\n'):
    func = line.split(' ')[2]
    if func == 'seedInitialDataIfEmpty': continue

    if func.startswith('save'):
        if 'Batch' in func:
            impl += f"export const {func} = async (items: any[]) => {{\n  const batch = writeBatch(db);\n  items.forEach(item => {{\n    if (item.id) batch.set(doc(db, '{func.replace('save', '').replace('BatchToFirebase', '').lower()}', item.id), item, {{ merge: true }});\n  }});\n  await batch.commit();\n}};\n"
        elif 'ToFirebase' in func:
            col = func.replace('save', '').replace('ToFirebase', '')
            col_lower = col[0].lower() + col[1:]
            
            # Singular entity vs plural/settings
            if col in ['Student', 'StudentTask', 'TeachingLog', 'AttendanceRecord', 'TeacherProfile', 'Grade']:
                coll_name = col_lower + 's'
                if col == 'AttendanceRecord': coll_name = 'attendance'
                if col == 'TeacherProfile': coll_name = 'teacherProfiles'
                if col == 'TeachingLog': coll_name = 'teachingLogs'
                impl += f"export const {func} = async (item: any) => {{\n  if (item && item.id) await setDoc(doc(db, '{coll_name}', item.id), item, {{ merge: true }});\n}};\n"
            else:
                # E.g. Subjects, RegisteredUsers
                impl += f"export const {func} = async (data: any, scope: string = '') => {{\n  const docId = '{col_lower}' + scope;\n  const payload = Array.isArray(data) ? {{ items: data }} : data;\n  await setDoc(doc(db, 'settings', docId), payload, {{ merge: true }});\n}};\n"
    elif func.startswith('delete'):
        if 'Batch' in func:
            impl += f"export const {func} = async (ids: string[]) => {{\n  const batch = writeBatch(db);\n  ids.forEach(id => {{\n    batch.delete(doc(db, '{func.replace('delete', '').replace('BatchFromFirebase', '').lower()}', id));\n  }});\n  await batch.commit();\n}};\n"
        else:
            col = func.replace('delete', '').replace('FromFirebase', '')
            col_lower = col[0].lower() + col[1:]
            coll_name = col_lower + 's'
            if col == 'AttendanceRecord': coll_name = 'attendance'
            if col == 'TeacherProfile': coll_name = 'teacherProfiles'
            if col == 'TeachingLog': coll_name = 'teachingLogs'
            impl += f"export const {func} = async (id: string) => {{\n  if (id) await deleteDoc(doc(db, '{coll_name}', id));\n}};\n"
    elif func.startswith('subscribeTo'):
        col = func.replace('subscribeTo', '')
        col_lower = col[0].lower() + col[1:]
        impl += f"export const {func} = (callback: (data: any) => void, scope: string = '') => {{\n  const docId = '{col_lower}' + scope;\n  return onSnapshot(doc(db, 'settings', docId), (snap) => {{\n    if (snap.exists()) {{\n      const data = snap.data();\n      callback(data.items !== undefined ? data.items : data);\n    }} else {{\n      callback(null);\n    }}\n  }});\n}};\n"

with open('src/lib/firebaseService.ts', 'w') as f:
    f.write(impl)

