with open('src/lib/firebaseService.ts', 'r') as f:
    content = f.read()

import re
old_func = r"export const saveClassListsToFirebase = async \(data: any, scope: string = ''\) => \{\n  const docId = 'classLists' \+ scope;\n  const payload = Array.isArray\(data\) \? \{ items: data \} : data;\n  await setDoc\(doc\(db, 'settings', docId\), payload, \{ merge: true \}\);\n\};"
new_func = """export const saveClassListsToFirebase = async (customClasses: any, removedClasses: any, scope: string = '', inactiveClasses: any = []) => {
  const docId = 'classLists' + scope;
  const payload = { customClasses, removedClasses, inactiveClasses };
  await setDoc(doc(db, 'settings', docId), payload, { merge: true });
};"""

content = re.sub(old_func, new_func, content)
with open('src/lib/firebaseService.ts', 'w') as f:
    f.write(content)
