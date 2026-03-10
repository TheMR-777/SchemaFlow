/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { QueryPreview } from './components/QueryPreview';
import { ReactFlowProvider } from '@xyflow/react';

export default function App() {
  return (
    <ReactFlowProvider>
      <div className="flex h-screen w-full bg-[#0a0a0a] text-zinc-100 overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 h-full relative">
          <Canvas />
          <QueryPreview />
        </div>
      </div>
    </ReactFlowProvider>
  );
}
