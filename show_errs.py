errors = [116, 171]
with open('src/components/RealtimeAttendance.tsx', 'r') as f:
    lines = f.readlines()
for e in errors:
    print(f"\n--- Line {e} ---")
    start = max(0, e-3)
    end = min(len(lines), e+10)
    for i in range(start, end):
        prefix = "> " if i == e-1 else "  "
        print(f"{prefix}{i+1}: {lines[i].rstrip()}")
