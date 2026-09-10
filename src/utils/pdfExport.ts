export interface PdfReportData {
  title: string;
  subtitle?: string;
  teacherName?: string;
  teacherNip?: string;
  schoolName?: string;
  principalName?: string;
  principalNip?: string;
  academicYear?: string;
  semester?: string;
  dateStr?: string;
  kpiCards?: Array<{ label: string; value: string | number; subtext?: string }>;
  city?: string;
  tableHeaders: string[];
  tableRows: (string | number)[][];
  additionalSection?: {
    title: string;
    content: string;
  };
  notes?: string;
}

export function generatePdfReport(data: PdfReportData) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up terblokir. Harap izinkan pop-up browser untuk mengunduh/mencetak dokumen PDF.');
    return;
  }

  const currentDate = data.dateStr || new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const kpiHtml = data.kpiCards && data.kpiCards.length > 0 ? `
    <div style="display: grid; grid-template-columns: repeat(${Math.min(data.kpiCards.length, 4)}, 1fr); gap: 10px; margin-bottom: 16px;">
      ${data.kpiCards.map(kpi => `
        <div style="border: 1px solid #cbd5e1; background-color: #f8fafc; border-radius: 6px; padding: 8px 10px; text-align: center;">
          <div style="font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: bold;">${kpi.label}</div>
          <div style="font-size: 15px; font-weight: bold; color: #003366; margin-top: 2px;">${kpi.value}</div>
          ${kpi.subtext ? `<div style="font-size: 8.5px; color: #475569; margin-top: 2px;">${kpi.subtext}</div>` : ''}
        </div>
      `).join('')}
    </div>
  ` : '';

  const additionalHtml = data.additionalSection ? `
    <div style="margin-top: 16px; padding: 10px 12px; background-color: #f1f5f9; border-left: 4px solid #003366; border-radius: 4px;">
      <h4 style="margin: 0 0 4px 0; font-size: 11px; color: #003366;">${data.additionalSection.title}</h4>
      <div style="font-size: 10px; color: #334155; white-space: pre-line; leading: 1.4;">${data.additionalSection.content}</div>
    </div>
  ` : '';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>${data.title} - ${data.schoolName || 'SIMAK Guru'}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 12mm 15mm;
        }
        body {
          font-family: 'Arial', 'Helvetica', sans-serif;
          color: #1e293b;
          margin: 0;
          padding: 0;
          font-size: 10.5px;
          line-height: 1.4;
        }
        .header {
          border-bottom: 2px solid #003366;
          padding-bottom: 10px;
          margin-bottom: 14px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .header-title {
          font-size: 16px;
          font-weight: bold;
          color: #003366;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .header-subtitle {
          font-size: 11px;
          color: #475569;
          margin-top: 3px;
          font-weight: 600;
        }
        .meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 8px 12px;
          margin-bottom: 14px;
          font-size: 10px;
        }
        .meta-item strong {
          color: #0f172a;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
          font-size: 9.5px;
        }
        th {
          background-color: #003366;
          color: #ffffff;
          font-weight: bold;
          text-align: left;
          padding: 7px 8px;
          border: 1px solid #002244;
          text-transform: uppercase;
          font-size: 9px;
        }
        td {
          padding: 5.5px 8px;
          border: 1px solid #cbd5e1;
        }
        tr:nth-child(even) {
          background-color: #f8fafc;
        }
        .footer-signatures {
          margin-top: 30px;
          display: flex;
          justify-content: space-between;
          page-break-inside: avoid;
        }
        .signature-box {
          text-align: center;
          width: 200px;
        }
        .signature-space {
          height: 50px;
        }
        .print-btn {
          position: fixed;
          top: 12px;
          right: 12px;
          background-color: #003366;
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          border: none;
          font-weight: bold;
          font-size: 12px;
          cursor: pointer;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);
          z-index: 9999;
        }
        .print-btn:hover {
          background-color: #002244;
        }
        @media print {
          .print-btn {
            display: none !important;
          }
        }
      </style>
    </head>
    <body>
      <button class="print-btn" onclick="window.print()">🖨️ Cetak / Simpan PDF</button>

      <div class="header">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div>
            <div class="header-title">${data.title}</div>
            ${data.subtitle ? `<div class="header-subtitle">${data.subtitle}</div>` : ''}
          </div>
        </div>
        <div style="text-align: right; font-size: 9.5px; color: #64748b;">
          <strong style="color: #003366;">${data.schoolName || 'SIMAK GURU BIOLOGI'}</strong><br/>
          Sistem Akademik & Presensi Real-time
        </div>
      </div>

      <div class="meta-grid">
        <div>
          <div class="meta-item"><strong>Sekolah:</strong> ${data.schoolName || 'SMA Negeri 1 Jakarta'}</div>
          <div class="meta-item"><strong>Guru Pengampu:</strong> ${data.teacherName || 'Dra. Hj. Siti Aminah, M.Pd.'}</div>
          ${data.teacherNip ? `<div class="meta-item"><strong>NIP:</strong> ${data.teacherNip}</div>` : ''}
        </div>
        <div style="text-align: right;">
          <div class="meta-item"><strong>Tahun Ajaran:</strong> ${data.academicYear || '2026/2027'} (${data.semester || 'Semester Ganjil'})</div>
          <div class="meta-item"><strong>Tanggal Dokumen:</strong> ${currentDate}</div>
        </div>
      </div>

      ${kpiHtml}

      <table>
        <thead>
          <tr>
            ${data.tableHeaders.map(h => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.tableRows.map(row => `
            <tr>
              ${row.map(cell => `<td>${cell !== undefined && cell !== null ? cell : '-'}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>

      ${additionalHtml}

      ${data.notes ? `<div style="margin-top: 12px; font-size: 9px; color: #64748b; font-style: italic;">* ${data.notes}</div>` : ''}

      <div class="footer-signatures">
        <div class="signature-box">
          <div>Mengetahui,</div>
          <div>Kepala Sekolah</div>
          <div class="signature-space"></div>
          <div style="font-weight: bold; text-decoration: underline;">${data.principalName || 'Dr. H. Ahmad Dahlan, M.Pd.'}</div>
          <div style="font-size: 9px; color: #64748b;">NIP. ${data.principalNip || '19680512 199403 1 004'}</div>
        </div>
        <div class="signature-box">
          <div>${data.city || 'Malang'}, ${currentDate}</div>
          <div>Guru Mata Pelajaran</div>
          <div class="signature-space"></div>
          <div style="font-weight: bold; text-decoration: underline;">${data.teacherName || 'Dra. Hj. Siti Aminah, M.Pd.'}</div>
          <div style="font-size: 9px; color: #64748b;">NIP. ${data.teacherNip || '19750817 200212 2 001'}</div>
        </div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
