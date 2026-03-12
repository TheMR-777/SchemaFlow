import { useState, useMemo } from 'react';
import { useSchemaStore } from '../store/useSchemaStore';
import { parseSqlDump } from '../lib/sqlParser';
import { Database, FileCode2, Plus, Trash2, GripVertical, PanelLeftClose, Save, FolderOpen, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export function Sidebar() {
  const { schema, setSchema, addTableToCanvas, toggleSidebar, saveWorkspace, loadWorkspace } = useSchemaStore();
  const [sqlInput, setSqlInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});

  const toggleTableExpand = (tableName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTables(prev => ({ ...prev, [tableName]: !prev[tableName] }));
  };

  const filteredTables = useMemo(() => {
    if (!schema) return [];
    if (!searchQuery.trim()) return schema.tables;

    const query = searchQuery.toLowerCase();
    
    return schema.tables.map(table => {
      let score = 0;
      const tableNameLower = table.name.toLowerCase();
      
      if (tableNameLower === query) score += 100;
      else if (tableNameLower.includes(query)) score += 50;
      
      const matchingColumns = table.columns.filter(c => {
        const colNameLower = c.name.toLowerCase();
        if (colNameLower === query) {
          score += 30;
          return true;
        }
        if (colNameLower.includes(query)) {
          score += 10;
          return true;
        }
        return false;
      });
      
      return { table, score, matchingColumns };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.table);
  }, [schema, searchQuery]);

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
    <div className="w-80 bg-[#151619] flex flex-col h-full font-sans text-zinc-300 shadow-2xl">
      <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between bg-[#151619] shrink-0">
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
          <div className="p-4 border-b border-zinc-800/80 flex flex-col gap-3 bg-[#151619] shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Available Tables</h2>
              <span className="text-[10px] font-mono bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full text-indigo-400">{filteredTables.length}</span>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="text"
                placeholder="Search tables & fields..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-zinc-800/80 text-zinc-300 text-xs rounded-lg pl-8 pr-3 py-2 outline-none focus:border-indigo-500/50 transition-colors placeholder:text-zinc-600"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {filteredTables.map((table) => (
              <div key={table.name} className="flex flex-col bg-[#151619] border border-zinc-800/80 rounded-xl overflow-hidden hover:border-indigo-500/30 transition-colors">
                <div
                  draggable
                  onDragStart={(e) => onDragStart(e, table.name)}
                  className="group flex items-center justify-between p-2.5 hover:bg-indigo-500/5 transition-all cursor-grab active:cursor-grabbing"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <button 
                      onClick={(e) => toggleTableExpand(table.name, e)}
                      className="p-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded transition-colors shrink-0"
                    >
                      {expandedTables[table.name] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                    <GripVertical size={14} className="text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 group-hover:bg-emerald-400 transition-colors shadow-[0_0_8px_rgba(16,185,129,0.4)] shrink-0" />
                    <span className="text-xs font-medium text-zinc-200 group-hover:text-indigo-100 transition-colors truncate">{table.name}</span>
                  </div>
                  <button 
                    onClick={() => addTableToCanvas(table.name)}
                    className="text-zinc-500 group-hover:text-indigo-400 transition-colors bg-zinc-800/50 group-hover:bg-indigo-500/20 p-1.5 rounded-md hover:bg-indigo-500/30 shrink-0 ml-2"
                    title="Add to canvas"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                
                {expandedTables[table.name] && (
                  <div className="px-3 pb-2 pt-1 border-t border-zinc-800/50 bg-[#0a0a0a]/50">
                    <div className="max-h-32 overflow-y-auto custom-scrollbar pr-1 space-y-1">
                      {table.columns.map(col => {
                        const isMatch = searchQuery && col.name.toLowerCase().includes(searchQuery.toLowerCase());
                        return (
                          <div key={col.name} className="flex items-center justify-between py-1">
                            <span className={cn("text-[10px] font-mono truncate", isMatch ? "text-indigo-300" : "text-zinc-500")}>
                              {col.name}
                            </span>
                            <span className="text-[9px] text-zinc-600 font-mono uppercase shrink-0 ml-2">
                              {col.type.split('(')[0]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {filteredTables.length === 0 && (
              <div className="text-center py-8 text-zinc-500 text-xs">
                No tables or fields found matching "{searchQuery}"
              </div>
            )}
          </div>
          <div className="p-4 border-t border-zinc-800/80 bg-[#151619] flex flex-col gap-2 shrink-0">
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
