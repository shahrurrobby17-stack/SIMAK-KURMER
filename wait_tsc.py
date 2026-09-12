import subprocess
out = subprocess.run(['npx', 'tsc', '--noEmit'], capture_output=True, text=True)
print(out.stdout)
