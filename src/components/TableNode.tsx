import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Table, Column } from '../lib/sqlParser';
import { useSchemaStore } from '../store/useSchemaStore';
import { cn } from '../lib/utils';
import { Key, Link2, CheckSquare, Square } from 'lucide-react';

interface TableNodeProps {
  data: {
    table: Table;
    nodeId: string;
  };
  isConnectable: boolean;
}

export const TableNode = memo(({ data, isConnectable }: TableNodeProps) => {
  const { table, nodeId } = data;
  const { selectedColumns, toggleColumnSelection, spawnJoinedTable, removeTableFromCanvas, columnSettings, setColumnSetting } = useSchemaStore();
  
  const selected = selectedColumns[nodeId] || [];
  const settings = columnSettings[nodeId] || {};

  return (
    <div className="bg-[#151619] border border-zinc-800/80 rounded-xl shadow-2xl w-72 overflow-hidden flex flex-col font-sans">
      {/* Header */}
      <div className="bg-zinc-900/80 px-4 py-3 flex items-center justify-between border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
          <h3 className="text-zinc-100 font-semibold text-sm tracking-wide">{table.name}</h3>
        </div>
        <button 
          onClick={() => removeTableFromCanvas(nodeId)}
          className="text-zinc-500 hover:text-red-400 transition-colors text-xs font-medium"
        >
          Remove
        </button>
      </div>
      
      {/* Columns */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden max-h-72 p-1.5 space-y-0.5 custom-scrollbar bg-[#151619]">
        {table.columns.map((col) => {
          const isSelected = selected.includes(col.name);
          const hasRelation = col.isForeignKey && col.references;
          
          return (
            <div key={col.name} className="flex flex-col mb-0.5">
              <div 
                className={cn(
                  "group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-all relative",
                  isSelected ? "bg-indigo-500/10 text-indigo-100 rounded-b-none" : "hover:bg-zinc-800/50 text-zinc-400"
                )}
              >
                {/* Left Handle (Target) */}
              <Handle
                type="target"
                position={Position.Left}
                id={col.name}
                isConnectable={isConnectable}
                className="w-2 h-2 !bg-zinc-600 border-none !-left-1.5"
              />
              
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <button 
                  onClick={() => toggleColumnSelection(nodeId, col.name)}
                  className="text-zinc-500 hover:text-zinc-300 flex-shrink-0 transition-colors"
                >
                  {isSelected ? <CheckSquare size={14} className="text-indigo-400" /> : <Square size={14} />}
                </button>
                
                <span className={cn(
                  "truncate font-mono",
                  isSelected ? "text-indigo-100" : "text-zinc-400"
                )}>
                  {col.name}
                </span>
                
                {col.isPrimaryKey && (
                  <Key size={12} className="text-amber-500/70 ml-auto flex-shrink-0" />
                )}
              </div>
              
              {/* Right side - Relations */}
              <div className="flex items-center gap-2 ml-2">
                <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">
                  {col.type.split('(')[0]}
                </span>
                
                {hasRelation && (
                  <button
                    onClick={() => spawnJoinedTable(nodeId, col.name, col.references!.table, col.references!.column)}
                    className="text-indigo-400 hover:text-indigo-300 transition-colors opacity-0 group-hover:opacity-100"
                    title={`Join with ${col.references!.table}`}
                  >
                    <Link2 size={14} />
                  </button>
                )}
              </div>

              {/* Right Handle (Source) */}
              <Handle
                type="source"
                position={Position.Right}
                id={col.name}
                isConnectable={isConnectable}
                className={cn(
                  "w-2 h-2 border-none !-right-1.5",
                  hasRelation ? "!bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.6)]" : "!bg-zinc-600"
                )}
              />
            </div>
            
            {isSelected && (
              <div className="bg-indigo-500/5 px-2.5 py-2 rounded-b-lg border-t border-indigo-500/10 flex items-center gap-2">
                <select
                  className="bg-[#0a0a0a] border border-zinc-800/80 text-zinc-300 text-[10px] rounded px-1.5 py-1 outline-none focus:border-indigo-500/50 transition-colors cursor-pointer"
                  value={settings[col.name]?.agg || ''}
                  onChange={(e) => setColumnSetting(nodeId, col.name, { agg: e.target.value })}
                >
                  <option value="">No Agg</option>
                  <option value="COUNT">COUNT</option>
                  <option value="SUM">SUM</option>
                  <option value="AVG">AVG</option>
                  <option value="MIN">MIN</option>
                  <option value="MAX">MAX</option>
                </select>
                <input
                  type="text"
                  placeholder="Alias..."
                  className="bg-[#0a0a0a] border border-zinc-800/80 text-zinc-300 text-[10px] rounded px-2 py-1 w-full outline-none focus:border-indigo-500/50 transition-colors placeholder:text-zinc-600"
                  value={settings[col.name]?.alias || ''}
                  onChange={(e) => setColumnSetting(nodeId, col.name, { alias: e.target.value })}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
    </div>
  );
});
