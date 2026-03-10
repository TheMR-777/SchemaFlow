import { useCallback, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  Connection,
  Edge,
  MarkerType,
  NodeChange,
  EdgeChange,
  Panel,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useSchemaStore } from '../store/useSchemaStore';
import { TableNode } from './TableNode';
import { JoinEdge } from './JoinEdge';
import { Network } from 'lucide-react';

const nodeTypes = {
  tableNode: TableNode,
};

const edgeTypes = {
  joinEdge: JoinEdge,
};

export function Canvas() {
  const { nodes, edges, setNodes, setEdges, layoutNodes, addTableToCanvas } = useSchemaStore();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes(applyNodeChanges(changes, nodes)),
    [nodes, setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges(applyEdgeChanges(changes, edges)),
    [edges, setEdges]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: Edge = {
        ...params,
        id: `e_${params.source}_${params.target}`,
        type: 'joinEdge',
        markerEnd: { type: MarkerType.ArrowClosed, color: '#818cf8' },
        style: { strokeWidth: 2, stroke: '#818cf8' },
        animated: true,
        data: {
          joinType: 'INNER JOIN',
          sourceColumn: params.sourceHandle,
          targetColumn: params.targetHandle
        }
      };
      setEdges([...edges, newEdge]);
    },
    [edges, setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const tableName = event.dataTransfer.getData('application/reactflow');
      if (!tableName) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addTableToCanvas(tableName, position);
    },
    [screenToFlowPosition, addTableToCanvas]
  );

  return (
    <div className="flex-1 h-full bg-[#0a0a0a] relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        colorMode="dark"
        className="bg-[#0a0a0a]"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#27272a" gap={16} size={1} />
        <Controls className="bg-zinc-900 border-zinc-800 fill-zinc-400" />
        <MiniMap 
          nodeColor="#3f3f46" 
          maskColor="rgba(24, 24, 27, 0.7)" 
          className="bg-zinc-900 border-zinc-800"
        />
        <Panel position="top-right" className="m-4">
          <button
            onClick={layoutNodes}
            className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 px-3 py-2 rounded-lg text-xs font-medium transition-colors shadow-lg"
          >
            <Network size={14} />
            Auto Layout
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
