import re
with open('src/App.tsx', 'r') as f:
    content = f.read()

content = re.sub(
    r"currentUser\.email\.toLowerCase\(\)",
    r"currentUser.email?.toLowerCase()",
    content
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
