import re
with open('src/App.tsx', 'r') as f:
    content = f.read()

content = re.sub(
    r"u\.email\.toLowerCase\(\)",
    r"u.email?.toLowerCase()",
    content
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
