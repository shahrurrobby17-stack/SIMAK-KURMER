import re
import os

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Replace localStorage.setItem(...) with nothing
content = re.sub(r'localStorage\.setItem\([^)]+\);?', '', content)

# Replace localStorage.removeItem(...) with nothing
content = re.sub(r'localStorage\.removeItem\([^)]+\);?', '', content)

# For initial states like:
# const saved = localStorage.getItem('simak_user_account');
# if (saved) { return JSON.parse(saved); }
# return null;
# We can just match the useState pattern or replace localStorage.getItem with null.
content = re.sub(r'localStorage\.getItem\([^)]+\)', 'null', content)

with open(filepath, 'w') as f:
    f.write(content)

filepath = 'src/components/RealtimeAttendance.tsx'
if os.path.exists(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    content = re.sub(r'localStorage\.setItem\([^)]+\);?', '', content)
    content = re.sub(r'localStorage\.removeItem\([^)]+\);?', '', content)
    content = re.sub(r'localStorage\.getItem\([^)]+\)', 'null', content)
    with open(filepath, 'w') as f:
        f.write(content)

