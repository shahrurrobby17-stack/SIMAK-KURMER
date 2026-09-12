import subprocess
out = subprocess.run(['npx', 'eslint', 'src/components/RealtimeAttendance.tsx'], capture_output=True, text=True).stdout
print(out)
