import re
with open('src/lib/firebaseService.ts', 'r') as f:
    content = f.read()

# Replace all occurrences of:
# const payload = Array.isArray(data) ? { items: data } : data;
# await setDoc(doc(db, 'settings', docId), payload, { merge: true });

# with the cleaned payload.

content = re.sub(
    r"const payload = Array.isArray\(data\) \? \{ items: data \} : data;\s*await setDoc\(doc\(db, 'settings', docId\), payload, \{ merge: true \}\);",
    r"const payload = Array.isArray(data) ? { items: data } : data;\n  const cleanPayload = JSON.parse(JSON.stringify(payload));\n  await setDoc(doc(db, 'settings', docId), cleanPayload, { merge: true });",
    content
)

with open('src/lib/firebaseService.ts', 'w') as f:
    f.write(content)
