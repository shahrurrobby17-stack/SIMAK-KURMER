const fs = require('fs');

const files = [
  'src/components/ReportCardModal.tsx',
  'src/components/ExtraAssignmentGradesView.tsx',
  'src/components/GeminiAssistantView.tsx',
  'src/components/AIAssistantModal.tsx',
  'src/components/DashboardAnalytics.tsx',
  'src/components/GradeManagement.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/fetch\('\/api\/ai\//g, "window.mockFetch('/api/ai/");
    fs.writeFileSync(file, content);
  }
});
