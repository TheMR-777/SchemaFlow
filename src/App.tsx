/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { BottomPanel } from './components/BottomPanel';
import { ReactFlowProvider } from '@xyflow/react';
import { useSchemaStore } from './store/useSchemaStore';
import { PanelLeftOpen } from 'lucide-react';

function MainContent() {
  const { fullscreenView, isSidebarOpen, toggleSidebar } = useSchemaStore();

  return (
    <div className="flex flex-col flex-1 h-full relative bg-[#0a0a0a] overflow-hidden">
      {/* Floating Sidebar Toggle */}
      {!isSidebarOpen && fullscreenView === 'none' && (
        <button 
          onClick={toggleSidebar}
          className="absolute top-4 left-4 z-50 p-2 bg-[#151619] border border-zinc-800/80 rounded-md text-zinc-400 hover:text-zinc-200 shadow-lg transition-colors"
          title="Open Sidebar"
        >
          <PanelLeftOpen size={16} />
        </button>
      )}

      {fullscreenView !== 'bottom' && <Canvas />}
      {fullscreenView !== 'canvas' && <BottomPanel />}
    </div>
  );
}

export default function App() {
  const { isSidebarOpen, fullscreenView } = useSchemaStore();
  
  return (
    <ReactFlowProvider>
      <div className="flex h-screen w-full bg-[#0a0a0a] text-zinc-100 overflow-hidden">
        {isSidebarOpen && fullscreenView === 'none' && (
          <Sidebar />
        )}
        <MainContent />
      </div>
    </ReactFlowProvider>
  );
}
