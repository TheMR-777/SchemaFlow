import { useMemo } from 'react';
import { useSchemaStore } from '../store/useSchemaStore';
import { format } from 'sql-formatter';
import { Terminal, Copy, Check } from 'lucide-react';
import { Table } from '../lib/sqlParser';
import { useState } from 'react';

export function QueryPreview() {
  const { nodes, edges, selectedColumns, columnSettings } = useSchemaStore();
  const [copied, setCopied] = useState(false);

  const generatedSql = useMemo(() => {
    if (nodes.length === 0) return '-- No tables selected';

    // Find the root node (node with no incoming edges)
    const targetIds = new Set(edges.map(e => e.target));
    const rootNodes = nodes.filter(n => !targetIds.has(n.id));
    
    if (rootNodes.length === 0) return '-- Circular dependency detected or no root';

    const rootNode = rootNodes[0];
    const rootTable = (rootNode.data as { table: Table }).table.name;

    // Collect SELECT columns
    const selectParts: string[] = [];
    const groupByParts: string[] = [];
    let hasAgg = false;

    nodes.forEach(node => {
      const tableName = (node.data as { table: Table }).table.name;
      const cols = selectedColumns[node.id] || [];
      const settings = columnSettings[node.id] || {};

      cols.forEach(col => {
        const { alias, agg } = settings[col] || {};
        let expr = `${tableName}.${col}`;
        
        if (agg) {
          expr = `${agg}(${expr})`;
          hasAgg = true;
        } else {
          groupByParts.push(`${tableName}.${col}`);
        }

        if (alias) {
          expr += ` AS ${alias}`;
        }
        
        selectParts.push(expr);
      });
    });

    if (selectParts.length === 0) {
      selectParts.push('*');
    }

    // Build FROM and JOINs
    let fromPart = `FROM ${rootTable}`;
    
    // Simple BFS to build joins
    const visited = new Set<string>([rootNode.id]);
    const queue = [rootNode.id];
    const joins: string[] = [];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      
      // Find all outgoing edges from current node
      const outgoingEdges = edges.filter(e => e.source === currentId);
      
      for (const edge of outgoingEdges) {
        if (!visited.has(edge.target)) {
          visited.add(edge.target);
          queue.push(edge.target);
          
          const targetNode = nodes.find(n => n.id === edge.target);
          const sourceNode = nodes.find(n => n.id === edge.source);
          
          if (targetNode && sourceNode) {
            const joinType = edge.data?.joinType || 'LEFT JOIN';
            const sourceCol = edge.sourceHandle;
            const targetCol = edge.targetHandle;
            
            const targetTableName = (targetNode.data as { table: Table }).table.name;
            const sourceTableName = (sourceNode.data as { table: Table }).table.name;
            
            joins.push(`${joinType} ${targetTableName} ON ${sourceTableName}.${sourceCol} = ${targetTableName}.${targetCol}`);
          }
        }
      }
    }

    let rawSql = `SELECT ${selectParts.join(', ')} ${fromPart} ${joins.join(' ')}`;
    
    if (hasAgg && groupByParts.length > 0) {
      rawSql += ` GROUP BY ${groupByParts.join(', ')}`;
    }
    
    try {
      return format(rawSql, { language: 'mysql', keywordCase: 'upper' });
    } catch (e) {
      return rawSql;
    }
  }, [nodes, edges, selectedColumns]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] relative">
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-indigo-300 transition-colors bg-zinc-900/80 hover:bg-zinc-800 px-2.5 py-1.5 rounded-md border border-zinc-700/50 backdrop-blur-sm shadow-lg"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="flex-1 overflow-auto p-5 custom-scrollbar bg-[#0a0a0a]">
        <pre className="text-[13px] leading-relaxed font-mono text-zinc-300">
          <code>{generatedSql}</code>
        </pre>
      </div>
    </div>
  );
}
