import re

with open('src/components/RealtimeAttendance.tsx', 'r') as f:
    content = f.read()

# Fix 649
content = content.replace("""                  const record = getRecordForStudent(student.id);
                  const currentStatus: AttendanceStatus = (record?.status || 'HADIR') as AttendanceStatus;
                  const currentNote = record?.note || '';
                  const currentMeeting = selectedMeetingNo;""", """                  const rec = getRecordForStudent(student.id);
                  const currentStatus: AttendanceStatus = (rec?.status || 'HADIR') as AttendanceStatus;
                  const currentNote = rec?.note || '';
                  const currentMeeting = selectedMeetingNo;""")

with open('src/components/RealtimeAttendance.tsx', 'w') as f:
    f.write(content)

