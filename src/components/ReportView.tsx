import { useMemo } from 'react';
import { useSchemaStore } from '../store/useSchemaStore';
import { Table } from '../lib/sqlParser';
import { FileSpreadsheet, Clock, Database } from 'lucide-react';

export function ReportView() {
  const { nodes, selectedColumns, columnSettings } = useSchemaStore();

  const columns = useMemo(() => {
    const cols: { id: string, label: string, type: string }[] = [];
    nodes.forEach(node => {
      const table = (node.data as { table: Table }).table;
      const selected = selectedColumns[node.id] || [];
      const settings = columnSettings[node.id] || {};

      selected.forEach(colName => {
        const colDef = table.columns.find(c => c.name === colName);
        const { alias, agg } = settings[colName] || {};
        let label = alias || (agg ? `${agg}(${colName})` : colName);
        cols.push({
          id: `${node.id}_${colName}`,
          label,
          type: colDef?.type || 'VARCHAR'
        });
      });
    });
    return cols;
  }, [nodes, selectedColumns, columnSettings]);

  const mockData = useMemo(() => {
    if (columns.length === 0) return [];
    return Array.from({ length: 25 }).map((_, i) => {
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
  }, [columns]);

  if (columns.length === 0) {
    return (
      <div className="h-full bg-[#0a0a0a] flex flex-col items-center justify-center text-zinc-500 font-sans">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900/50 flex items-center justify-center border border-zinc-800/80 mb-4 shadow-xl">
          <FileSpreadsheet size={24} className="text-zinc-600" />
        </div>
        <h3 className="text-zinc-300 font-medium mb-1">No Data to Display</h3>
        <p className="text-xs text-zinc-500">Select columns in the builder to generate a report.</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#0a0a0a] overflow-auto p-5 custom-scrollbar font-sans">
      <div className="max-w-full mx-auto space-y-4">
        {/* Header Stats */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">Query Results</h2>
            <p className="text-xs text-zinc-500 mt-1">Simulated data based on your schema</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-zinc-400 bg-[#151619] px-4 py-2 rounded-lg border border-zinc-800/80 shadow-sm">
            <div className="flex items-center gap-1.5">
              <Database size={14} className="text-indigo-400" />
              <span>{mockData.length} rows</span>
            </div>
            <div className="w-px h-4 bg-zinc-800"></div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-emerald-400" />
              <span>42ms</span>
            </div>
          </div>
        </div>

        {/* Data Grid */}
        <div className="bg-[#151619] border border-zinc-800/80 rounded-xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th 
                      key={c.id} 
                      className="px-5 py-3.5 border-b border-zinc-800/80 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest bg-zinc-900/50 whitespace-nowrap"
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {mockData.map((row) => (
                  <tr 
                    key={row._id} 
                    className="hover:bg-indigo-500/5 transition-colors group"
                  >
                    {columns.map(c => (
                      <td 
                        key={c.id} 
                        className="px-5 py-3 text-[13px] font-mono text-zinc-300 group-hover:text-indigo-200 transition-colors whitespace-nowrap"
                      >
                        {row[c.id]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
