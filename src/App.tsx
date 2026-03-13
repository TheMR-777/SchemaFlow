/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { BottomPanel } from './components/BottomPanel';
import { ReactFlowProvider } from '@xyflow/react';
import { useSchemaStore } from './store/useSchemaStore';
import { LayoutTemplate, TableProperties, PanelLeftOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './lib/utils';

function MainContent() {
  const { fullscreenView, isSidebarOpen, toggleSidebar, isBottomPanelOpen } = useSchemaStore();

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
      <AnimatePresence>
        {fullscreenView !== 'canvas' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: fullscreenView === 'bottom' ? '100%' : isBottomPanelOpen ? 320 : 48, 
              opacity: 1 
            }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className={cn(
              "flex-shrink-0 z-20 w-full overflow-hidden",
              fullscreenView === 'bottom' ? "absolute inset-0" : "relative"
            )}
          >
            <BottomPanel />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  const { isSidebarOpen, fullscreenView } = useSchemaStore();
  
  return (
    <ReactFlowProvider>
      <div className="flex h-screen w-full bg-[#0a0a0a] text-zinc-100 overflow-hidden">
        <AnimatePresence>
          {isSidebarOpen && fullscreenView === 'none' && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="h-full flex-shrink-0 overflow-hidden border-r border-zinc-800/80 z-30"
            >
              <Sidebar />
            </motion.div>
          )}
        </AnimatePresence>
        <MainContent />
      </div>
    </ReactFlowProvider>
  );
}
