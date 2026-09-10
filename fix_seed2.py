import re
with open('src/lib/firebaseService.ts', 'r') as f:
    content = f.read()

content = content.replace("g.id", "`${g.studentId}_${g.subjectId}`")

with open('src/lib/firebaseService.ts', 'w') as f:
    f.write(content)
