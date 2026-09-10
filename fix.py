import re

with open('src/components/ExtracurricularAttendanceView.tsx', 'r') as f:
    content = f.read()

# I will just replace the whole useEffect block that has unsubSettings
pattern = re.compile(r'  // Listen to Firestore real-time updates for extracurricular settings and records\n  useEffect\(\(\) => \{\n.*?  \}, \[\]\);', re.DOTALL)
replacement = """  // Listen to Firestore real-time updates for extracurricular settings and records
  useEffect(() => {
    // Firebase removed for Supabase migration
    const unsubSettings = () => {};
    const unsubRecords = () => {};
    return () => {
      unsubSettings();
      unsubRecords();
    };
  }, []);"""

content = pattern.sub(replacement, content)

with open('src/components/ExtracurricularAttendanceView.tsx', 'w') as f:
    f.write(content)
