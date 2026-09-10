import { UserAccount, Student, StudentGrade, AttendanceRecord, TeachingLog } from '../types';

export const syncToGoogleSheets = async (
  token: string,
  data: {
    users: UserAccount[];
    students: Student[];
    grades: StudentGrade[];
    attendance: AttendanceRecord[];
    teachingLogs: TeachingLog[];
  }
) => {
  try {
    // Create a new spreadsheet
    const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title: `SIMAK Backup Data - ${new Date().toLocaleString()}`
        },
        sheets: [
          { properties: { title: 'Master Data Users' } },
          { properties: { title: 'Students' } },
          { properties: { title: 'Grades' } },
          { properties: { title: 'Attendance' } },
          { properties: { title: 'Teaching Logs' } }
        ]
      })
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Failed to create spreadsheet: ${errorText}`);
    }

    const spreadsheet = await createResponse.json();
    const spreadsheetId = spreadsheet.spreadsheetId;

    // Helper to format rows
    const updateSheet = async (sheetName: string, values: any[][]) => {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1:append?valueInputOption=USER_ENTERED`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values
        })
      });
    };

    // Prepare data
    if (data.users.length > 0) {
      const header = ['Name', 'Email', 'Role', 'Status', 'NIP'];
      const rows = data.users.map(u => [u.name, u.email, u.role, u.status || '', u.nip || '']);
      await updateSheet('Master Data Users', [header, ...rows]);
    }

    if (data.students.length > 0) {
      const header = ['NISN', 'Name', 'Class', 'Gender'];
      const rows = data.students.map(s => [s.nisn, s.name, s.className, s.gender]);
      await updateSheet('Students', [header, ...rows]);
    }

    if (data.grades.length > 0) {
      const header = ['Student ID', 'Subject ID', 'PTS', 'PAS', 'Final Score', 'Predicate'];
      const rows = data.grades.map(g => [g.studentId, g.subjectId, g.pts || 0, g.pas || 0, g.finalScore || 0, g.predicate || '']);
      await updateSheet('Grades', [header, ...rows]);
    }

    if (data.attendance.length > 0) {
      const header = ['Date', 'Student ID', 'Status', 'Note'];
      const rows = data.attendance.map(a => [a.date, a.studentId, a.status, a.note || '']);
      await updateSheet('Attendance', [header, ...rows]);
    }

    if (data.teachingLogs.length > 0) {
      const header = ['Date', 'Class', 'Subject ID', 'Material', 'Notes'];
      const rows = data.teachingLogs.map(t => [t.date, t.className, t.subjectId, t.summaryMaterial, t.notes || '']);
      await updateSheet('Teaching Logs', [header, ...rows]);
    }

    return spreadsheetId;
  } catch (err) {
    console.error('Google Sheets Sync Error:', err);
    throw err;
  }
};
