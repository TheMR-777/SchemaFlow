import { create } from 'zustand';
import { Schema, Table } from '../lib/sqlParser';
import { Node, Edge, MarkerType } from '@xyflow/react';
import dagre from 'dagre';

export interface AppState {
  bottomPanelTab: 'sql' | 'report';
  setBottomPanelTab: (tab: 'sql' | 'report') => void;
  
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  
  isBottomPanelOpen: boolean;
  toggleBottomPanel: () => void;
  
  fullscreenView: 'none' | 'canvas' | 'bottom';
  setFullscreenView: (view: 'none' | 'canvas' | 'bottom') => void;

  schema: Schema | null;
  setSchema: (schema: Schema) => void;
  
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  
  addTableToCanvas: (tableName: string, position?: { x: number, y: number }) => void;
  removeTableFromCanvas: (nodeId: string) => void;
  
  selectedColumns: Record<string, string[]>; // nodeId -> column names
  toggleColumnSelection: (nodeId: string, columnName: string) => void;
  
  columnSettings: Record<string, Record<string, { alias?: string, agg?: string }>>;
  setColumnSetting: (nodeId: string, columnName: string, setting: { alias?: string, agg?: string }) => void;
  
  spawnJoinedTable: (sourceNodeId: string, sourceColumn: string, targetTableName: string, targetColumn: string) => void;
  
  layoutNodes: () => void;
}

const nodeWidth = 250;
const nodeHeight = 300; // approximate

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });
  
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });
  
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });
  
  dagre.layout(dagreGraph);
  
  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
    return newNode as Node;
  });
  
  return { nodes: newNodes, edges };
};

export const useSchemaStore = create<AppState>((set, get) => ({
  bottomPanelTab: 'sql',
  setBottomPanelTab: (tab) => set({ bottomPanelTab: tab }),
  
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  
  isBottomPanelOpen: true,
  toggleBottomPanel: () => set((state) => ({ isBottomPanelOpen: !state.isBottomPanelOpen })),
  
  fullscreenView: 'none',
  setFullscreenView: (view) => set({ fullscreenView: view }),

  schema: null,
  setSchema: (schema) => set({ schema }),
  
  nodes: [],
  edges: [],
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  
  selectedColumns: {},
  columnSettings: {},
  
  setColumnSetting: (nodeId, columnName, setting) => set((state) => {
    const nodeSettings = state.columnSettings[nodeId] || {};
    const currentSetting = nodeSettings[columnName] || {};
    return {
      columnSettings: {
        ...state.columnSettings,
        [nodeId]: {
          ...nodeSettings,
          [columnName]: { ...currentSetting, ...setting }
        }
      }
    };
  }),
  
  addTableToCanvas: (tableName, position = { x: 100, y: 100 }) => {
    const { schema, nodes } = get();
    if (!schema) return;
    
    const table = schema.tables.find(t => t.name === tableName);
    if (!table) return;
    
    const nodeId = `${tableName}_${Date.now()}`;
    
    const newNode: Node = {
      id: nodeId,
      type: 'tableNode',
      position,
      data: { table, nodeId },
    };
    
    // Select all columns by default initially, or maybe just non-id ones? Let's select all.
    const initialSelectedCols = table.columns.map(c => c.name);
    
    set((state) => ({
      nodes: [...state.nodes, newNode],
      selectedColumns: { ...state.selectedColumns, [nodeId]: initialSelectedCols }
    }));
  },
  
  removeTableFromCanvas: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.filter(n => n.id !== nodeId),
      edges: state.edges.filter(e => e.source !== nodeId && e.target !== nodeId),
      selectedColumns: { ...state.selectedColumns, [nodeId]: undefined }
    }));
  },
  
  toggleColumnSelection: (nodeId, columnName) => {
    set((state) => {
      const selected = state.selectedColumns[nodeId] || [];
      const isSelected = selected.includes(columnName);
      
      return {
        selectedColumns: {
          ...state.selectedColumns,
          [nodeId]: isSelected 
            ? selected.filter(c => c !== columnName)
            : [...selected, columnName]
        }
      };
    });
  },
  
  spawnJoinedTable: (sourceNodeId, sourceColumn, targetTableName, targetColumn) => {
    const { schema, nodes, edges } = get();
    if (!schema) return;
    
    const targetTable = schema.tables.find(t => t.name === targetTableName);
    if (!targetTable) return;
    
    const targetNodeId = `${targetTableName}_${Date.now()}`;
    
    const newNode: Node = {
      id: targetNodeId,
      type: 'tableNode',
      position: { x: 0, y: 0 }, // Will be layouted
      data: { table: targetTable, nodeId: targetNodeId },
    };
    
    const newEdge: Edge = {
      id: `e_${sourceNodeId}_${targetNodeId}`,
      source: sourceNodeId,
      target: targetNodeId,
      sourceHandle: sourceColumn,
      targetHandle: targetColumn,
      type: 'joinEdge',
      markerEnd: { type: MarkerType.ArrowClosed, color: '#818cf8' },
      style: { strokeWidth: 2, stroke: '#818cf8' },
      animated: true,
      data: {
        joinType: 'LEFT JOIN',
        sourceColumn,
        targetColumn
      }
    };
    
    const initialSelectedCols = targetTable.columns.map(c => c.name);
    
    set((state) => {
      const newNodes = [...state.nodes, newNode];
      const newEdges = [...state.edges, newEdge];
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(newNodes, newEdges, 'TB');
      
      return {
        nodes: layoutedNodes,
        edges: layoutedEdges,
        selectedColumns: { ...state.selectedColumns, [targetNodeId]: initialSelectedCols }
      };
    });
  },
  
  layoutNodes: () => {
    set((state) => {
      const { nodes, edges } = getLayoutedElements(state.nodes, state.edges, 'TB');
      return { nodes, edges };
    });
  }
}));
