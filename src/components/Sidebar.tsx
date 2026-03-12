import { useState } from 'react';
import { useSchemaStore } from '../store/useSchemaStore';
import { parseSqlDump } from '../lib/sqlParser';
import { Database, FileCode2, Plus, Trash2, GripVertical, PanelLeftClose, Save, FolderOpen } from 'lucide-react';

export function Sidebar() {
  const { schema, setSchema, addTableToCanvas, toggleSidebar, saveWorkspace, loadWorkspace } = useSchemaStore();
  const [sqlInput, setSqlInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const handleParse = () => {
    setIsParsing(true);
    try {
      const parsed = parseSqlDump(sqlInput);
      setSchema(parsed);
    } catch (e) {
      console.error("Failed to parse SQL", e);
      alert("Failed to parse SQL. Please check the console.");
    } finally {
      setIsParsing(false);
    }
  };

  const onDragStart = (event: React.DragEvent, tableName: string) => {
    event.dataTransfer.setData('application/reactflow', tableName);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-80 bg-[#151619] border-r border-zinc-800/80 flex flex-col h-full font-sans text-zinc-300 shadow-2xl z-20">
      <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between bg-[#151619]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
            <Database className="text-indigo-400" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-zinc-100 tracking-tight">SchemaFlow</h1>
            <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-medium mt-0.5">Visual Query Builder</p>
          </div>
        </div>
        <button 
          onClick={toggleSidebar}
          className="text-zinc-500 hover:text-zinc-300 transition-colors p-1.5 hover:bg-zinc-800 rounded-md"
          title="Close Sidebar"
        >
          <PanelLeftClose size={16} />
        </button>
      </div>

      {!schema ? (
        <div className="p-6 flex flex-col gap-4 flex-1 bg-[#0a0a0a]">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
            <FileCode2 size={16} className="text-indigo-400" />
            <span>Paste SQL Dump</span>
          </div>
          <textarea
            className="flex-1 w-full bg-[#151619] border border-zinc-800/80 rounded-xl p-4 text-[13px] font-mono text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none shadow-inner custom-scrollbar"
            placeholder="CREATE TABLE users ( ... );"
            value={sqlInput}
            onChange={(e) => setSqlInput(e.target.value)}
          />
          <button
            onClick={handleParse}
            disabled={!sqlInput.trim() || isParsing}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)]"
          >
            {isParsing ? 'Parsing...' : 'Parse Schema'}
          </button>
        </div>
      ) : (
        <div className="flex flex-col h-full overflow-hidden bg-[#0a0a0a]">
          <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between bg-[#151619]">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Available Tables</h2>
            <span className="text-[10px] font-mono bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full text-indigo-400">{schema.tables.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
            {schema.tables.map((table) => (
              <div
                key={table.name}
                draggable
                onDragStart={(e) => onDragStart(e, table.name)}
                className="group flex items-center justify-between p-3.5 rounded-xl bg-[#151619] border border-zinc-800/80 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all cursor-grab active:cursor-grabbing shadow-sm hover:shadow-[0_0_15px_rgba(99,102,241,0.1)]"
              >
                <div className="flex items-center gap-3">
                  <GripVertical size={14} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500/50 group-hover:bg-emerald-400 transition-colors shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                  <span className="text-sm font-medium text-zinc-200 group-hover:text-indigo-100 transition-colors">{table.name}</span>
                </div>
                <button 
                  onClick={() => addTableToCanvas(table.name)}
                  className="text-zinc-500 group-hover:text-indigo-400 transition-colors bg-zinc-800/50 group-hover:bg-indigo-500/20 p-1.5 rounded-md hover:bg-indigo-500/30"
                  title="Add to canvas"
                >
                  <Plus size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="p-5 border-t border-zinc-800/80 bg-[#151619] flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <button 
                onClick={loadWorkspace}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-900 border border-zinc-800/80 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                title="Load Workspace"
              >
                <FolderOpen size={14} />
                Load
              </button>
              <button 
                onClick={saveWorkspace}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600/10 border border-indigo-500/30 rounded-lg text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/20 transition-colors"
                title="Save Workspace"
              >
                <Save size={14} />
                Save
              </button>
            </div>
            <button
              onClick={() => setSchema(null)}
              className="w-full flex items-center justify-center gap-2 text-xs font-medium text-zinc-400 hover:text-red-400 transition-colors py-2 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
            >
              <Trash2 size={14} />
              Reset Schema
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
