import { Node, Edge } from '@xyflow/react';
import { Table } from './sqlParser';
import { format } from 'sql-formatter';

export interface ColumnSetting {
  alias?: string;
  agg?: string;
}

export interface FilterSetting {
  id: string;
  column: string;
  operator: string;
  value: string;
}

export interface QuerySettings {
  limit?: number;
  orderBy?: { column: string; direction: 'ASC' | 'DESC' }[];
}

export function generateSql(
  nodes: Node[],
  edges: Edge[],
  selectedColumns: Record<string, string[]>,
  columnSettings: Record<string, Record<string, ColumnSetting>>,
  filters: Record<string, FilterSetting[]>,
  querySettings: QuerySettings,
  shouldFormat: boolean = true
): string {
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
        expr += ` AS \`${alias}\``;
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

  // Build WHERE
  const whereParts: string[] = [];
  nodes.forEach(node => {
    const tableName = (node.data as { table: Table }).table.name;
    const nodeFilters = filters[node.id] || [];
    nodeFilters.forEach(f => {
      const isNum = !isNaN(Number(f.value));
      const val = isNum ? f.value : `'${f.value}'`;
      whereParts.push(`${tableName}.${f.column} ${f.operator} ${val}`);
    });
  });

  let rawSql = `SELECT ${selectParts.join(', ')} \n${fromPart} \n${joins.join('\n')}`;
  
  if (whereParts.length > 0) {
    rawSql += ` \nWHERE ${whereParts.join(' AND ')}`;
  }
  
  if (hasAgg && groupByParts.length > 0) {
    rawSql += ` \nGROUP BY ${groupByParts.join(', ')}`;
  }

  if (querySettings.orderBy && querySettings.orderBy.length > 0) {
    const orderParts = querySettings.orderBy.map(o => `${o.column} ${o.direction}`);
    rawSql += ` \nORDER BY ${orderParts.join(', ')}`;
  }

  if (querySettings.limit) {
    rawSql += ` \nLIMIT ${querySettings.limit}`;
  }
  
  if (!shouldFormat) {
    return rawSql;
  }
  
  try {
    return format(rawSql, { language: 'mysql', keywordCase: 'upper' });
  } catch (e) {
    return rawSql;
  }
}
