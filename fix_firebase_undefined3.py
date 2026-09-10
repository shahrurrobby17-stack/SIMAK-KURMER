import re
with open('src/lib/firebaseService.ts', 'r') as f:
    content = f.read()

content = re.sub(
    r"if \(item\.id\) batch\.set\(doc\(db, '([^']+)', item\.id\), item, \{ merge: true \}\);",
    r"if (item.id) {\n      const cleanItem = JSON.parse(JSON.stringify(item));\n      batch.set(doc(db, '\g<1>', item.id), cleanItem, { merge: true });\n    }",
    content
)

with open('src/lib/firebaseService.ts', 'w') as f:
    f.write(content)
