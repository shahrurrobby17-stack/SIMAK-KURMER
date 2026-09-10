import re

with open('src/lib/firebaseService.ts', 'r') as f:
    content = f.read()

# Replace saveGradeToFirebase and saveGradesBatchToFirebase

old_save_grade = r"export const saveGradeToFirebase = async \(item: any\) => \{\n  if \(item && item.id\) await setDoc\(doc\(db, 'grades', item.id\), item, \{ merge: true \}\);\n\};"
new_save_grade = """export const saveGradeToFirebase = async (item: any) => {
  const docId = item.id || `${item.studentId}_${item.subjectId}`;
  if (item && docId) await setDoc(doc(db, 'grades', docId), item, { merge: true });
};"""

old_save_grades_batch = r"export const saveGradesBatchToFirebase = async \(items: any\[\]\) => \{\n  const batch = writeBatch\(db\);\n  items\.forEach\(item => \{\n    if \(item\.id\) batch\.set\(doc\(db, 'grades', item\.id\), item, \{ merge: true \}\);\n  \}\);\n  await batch\.commit\(\);\n\};"
new_save_grades_batch = """export const saveGradesBatchToFirebase = async (items: any[]) => {
  const batch = writeBatch(db);
  items.forEach(item => {
    const docId = item.id || `${item.studentId}_${item.subjectId}`;
    if (docId) batch.set(doc(db, 'grades', docId), item, { merge: true });
  });
  await batch.commit();
};"""

content = re.sub(old_save_grade, new_save_grade, content)
content = re.sub(old_save_grades_batch, new_save_grades_batch, content)

with open('src/lib/firebaseService.ts', 'w') as f:
    f.write(content)
