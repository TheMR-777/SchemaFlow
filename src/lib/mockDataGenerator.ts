export function generateMockData(columns: { id: string, label: string, type: string }[], count: number = 25) {
  if (columns.length === 0) return [];
  
  return Array.from({ length: count }).map((_, i) => {
    const row: Record<string, any> = { _id: i };
    columns.forEach(c => {
      const type = c.type.toUpperCase();
      if (type.includes('INT') || type.includes('NUM') || type.includes('FLOAT')) {
        row[c.id] = Math.floor(Math.random() * 10000);
      } else if (type.includes('DATE') || type.includes('TIME')) {
        const d = new Date(Date.now() - Math.random() * 10000000000);
        row[c.id] = d.toISOString().split('T')[0];
      } else if (type.includes('BOOL')) {
        row[c.id] = Math.random() > 0.5 ? 'true' : 'false';
      } else {
        row[c.id] = `val_${Math.random().toString(36).substring(2, 8)}`;
      }
    });
    return row;
  });
}
