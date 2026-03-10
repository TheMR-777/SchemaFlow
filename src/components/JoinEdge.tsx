import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from '@xyflow/react';
import { useSchemaStore } from '../store/useSchemaStore';
import { X } from 'lucide-react';

export function JoinEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const { edges, setEdges } = useSchemaStore();

  const toggleJoinType = () => {
    setEdges(edges.map(e => {
      if (e.id === id) {
        const currentType = e.data?.joinType as string || 'LEFT JOIN';
        const nextType = currentType === 'LEFT JOIN' ? 'INNER JOIN' : currentType === 'INNER JOIN' ? 'RIGHT JOIN' : 'LEFT JOIN';
        return {
          ...e,
          data: { ...e.data, joinType: nextType }
        };
      }
      return e;
    }));
  };

  const removeEdge = () => {
    setEdges(edges.filter(e => e.id !== id));
  };

  const joinType = data?.joinType as string || 'LEFT JOIN';

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan flex items-center gap-1"
        >
          <button
            onClick={toggleJoinType}
            className="bg-zinc-950 border border-zinc-700 hover:border-indigo-500 text-zinc-300 hover:text-indigo-300 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider shadow-lg transition-colors cursor-pointer"
          >
            {joinType}
          </button>
          <button
            onClick={removeEdge}
            className="bg-zinc-950 border border-zinc-700 hover:border-red-500 text-zinc-500 hover:text-red-400 p-1 rounded-md shadow-lg transition-colors cursor-pointer flex items-center justify-center"
            title="Remove connection"
          >
            <X size={12} />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
