export function downloadAsFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToCsv(filename: string, columns: { id: string, label: string }[], data: any[]) {
  if (!data || !data.length) return;
  
  const headers = columns.map(c => `"${c.label.replace(/"/g, '""')}"`).join(',');
  const rows = data.map(row => 
    columns.map(c => {
      const val = row[c.id] === null || row[c.id] === undefined ? '' : String(row[c.id]);
      return `"${val.replace(/"/g, '""')}"`;
    }).join(',')
  );
  
  const csvContent = [headers, ...rows].join('\n');
  downloadAsFile(filename, csvContent, 'text/csv;charset=utf-8;');
}
