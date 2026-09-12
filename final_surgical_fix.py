import re

with open('src/components/RealtimeAttendance.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    if line.strip().startswith('const isMaster =') or line.strip().startswith('const storageKey =') or line.strip().startswith('const settingsScope ='):
        # Only keep the first occurrence of these
        pass 
