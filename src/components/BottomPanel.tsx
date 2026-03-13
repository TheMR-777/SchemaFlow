import { useSchemaStore } from '../store/useSchemaStore';
import { QueryPreview } from './QueryPreview';
import { ReportView } from './ReportView';
import { Maximize2, Minimize2, ChevronDown, ChevronUp, Code2, TableProperties } from 'lucide-react';
import { cn } from '../lib/utils';

export function BottomPanel() {
  const { 
    bottomPanelTab, 
    setBottomPanelTab, 
    isBottomPanelOpen, 
    toggleBottomPanel, 
    fullscreenView, 
    setFullscreenView 
  } = useSchemaStore();

  const isFullscreen = fullscreenView === 'bottom';

  return (
    <div className="bg-[#151619] border-t border-zinc-800/80 flex flex-col h-full w-full shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="h-12 border-b border-zinc-800/80 flex items-center justify-between px-4 shrink-0 bg-[#151619]">
        <div className="flex items-center gap-1 bg-[#0a0a0a] p-1 rounded-lg border border-zinc-800/80">
          <button 
            onClick={() => { setBottomPanelTab('sql'); if (!isBottomPanelOpen) toggleBottomPanel(); }} 
            className={cn("flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all", bottomPanelTab === 'sql' ? "bg-zinc-800 text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50")}
          >
            <Code2 size={14} /> SQL
          </button>
          <button 
            onClick={() => { setBottomPanelTab('report'); if (!isBottomPanelOpen) toggleBottomPanel(); }} 
            className={cn("flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all", bottomPanelTab === 'report' ? "bg-zinc-800 text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50")}
          >
            <TableProperties size={14} /> Report
          </button>
        </div>
        <div className="flex items-center gap-2">
          {isBottomPanelOpen && (
            <button 
              onClick={() => setFullscreenView(isFullscreen ? 'none' : 'bottom')} 
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          )}
          {!isFullscreen && (
            <button 
              onClick={toggleBottomPanel} 
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors"
              title={isBottomPanelOpen ? "Collapse panel" : "Expand panel"}
            >
              {isBottomPanelOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-hidden relative bg-[#0a0a0a]">
        {bottomPanelTab === 'sql' ? <QueryPreview /> : <ReportView />}
      </div>
    </div>
  );
}
