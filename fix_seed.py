with open('src/lib/firebaseService.ts', 'r') as f:
    content = f.read()

import_initial = "import { allDefaultStudents, initialSubjects, initialGrades, initialAttendanceRecords, initialTeachingLogs, initialStudentTasks, initialTeacherProfiles, initialAnnouncements } from '../data/initialData';\n"
content = import_initial + content

# Replace seedInitialDataIfEmpty
seed_impl = """
export const seedInitialDataIfEmpty = async () => {
  const { getDocs } = await import('firebase/firestore');
  
  // Only seed if students collection is empty
  const studentsSnap = await getDocs(collection(db, 'students'));
  if (studentsSnap.empty) {
    const batch = writeBatch(db);
    allDefaultStudents.forEach(s => batch.set(doc(db, 'students', s.id), s));
    initialSubjects.forEach((s: any) => batch.set(doc(db, 'settings', 'subjects'), { items: initialSubjects }));
    initialGrades.forEach(g => batch.set(doc(db, 'grades', g.id), g));
    initialAttendanceRecords.forEach(a => batch.set(doc(db, 'attendance', a.id), a));
    initialTeachingLogs.forEach(l => batch.set(doc(db, 'teachingLogs', l.id), l));
    initialStudentTasks.forEach(t => batch.set(doc(db, 'studentTasks', t.id), t));
    initialTeacherProfiles.forEach((t: any) => batch.set(doc(db, 'settings', 'teacherProfiles'), { items: initialTeacherProfiles }));
    await batch.commit();
    console.log('Seeded initial data to Firestore');
  }
};
"""

content = content.replace("export const seedInitialDataIfEmpty = async () => {};", seed_impl)

with open('src/lib/firebaseService.ts', 'w') as f:
    f.write(content)
