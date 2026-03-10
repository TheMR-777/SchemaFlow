export interface Column {
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  references?: { table: string; column: string };
}

export interface Table {
  name: string;
  columns: Column[];
}

export interface Schema {
  tables: Table[];
}

export function parseSqlDump(sql: string): Schema {
  const tables: Table[] = [];
  
  // Basic regex to find CREATE TABLE blocks
  // Matches: CREATE TABLE `table_name` ( ... );
  const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?`?(\w+)`?\s*\(([\s\S]*?)\)(?:\s*ENGINE.*?)?;/gi;
  
  let match;
  while ((match = createTableRegex.exec(sql)) !== null) {
    const tableName = match[1];
    const body = match[2];
    
    const columns: Column[] = [];
    const lines = body.split(',\n').map(l => l.trim()).filter(Boolean);
    
    const primaryKeys = new Set<string>();
    const foreignKeys: Record<string, { table: string; column: string }> = {};
    
    // First pass: find PKs and FKs explicitly defined
    for (const line of lines) {
      const pkMatch = line.match(/PRIMARY\s+KEY\s*\(`?(\w+)`?\)/i);
      if (pkMatch) {
        primaryKeys.add(pkMatch[1]);
      }
      
      const fkMatch = line.match(/FOREIGN\s+KEY\s*\(`?(\w+)`?\)\s*REFERENCES\s*`?(\w+)`?\s*\(`?(\w+)`?\)/i);
      if (fkMatch) {
        foreignKeys[fkMatch[1]] = { table: fkMatch[2], column: fkMatch[3] };
      }
    }
    
    // Second pass: parse columns
    for (const line of lines) {
      // Skip constraints
      if (line.toUpperCase().startsWith('PRIMARY KEY') || 
          line.toUpperCase().startsWith('FOREIGN KEY') || 
          line.toUpperCase().startsWith('KEY') || 
          line.toUpperCase().startsWith('UNIQUE KEY') ||
          line.toUpperCase().startsWith('CONSTRAINT')) {
        continue;
      }
      
      // Match column definition: `col_name` type ...
      const colMatch = line.match(/^`?(\w+)`?\s+(\w+(?:\([^)]+\))?)/);
      if (colMatch) {
        const colName = colMatch[1];
        const colType = colMatch[2];
        
        columns.push({
          name: colName,
          type: colType,
          isPrimaryKey: primaryKeys.has(colName),
          isForeignKey: !!foreignKeys[colName],
          references: foreignKeys[colName]
        });
      }
    }
    
    tables.push({ name: tableName, columns });
  }
  
  // Third pass: Apply heuristics for missing foreign keys
  for (const table of tables) {
    for (const col of table.columns) {
      if (!col.isForeignKey && col.name.endsWith('_id')) {
        // Heuristic: user_id -> users.id, or company_id -> companies.id
        const possibleBaseName = col.name.replace(/_id$/, '');
        
        // Try exact match + 's' or exact match
        const possibleTableNames = [
          `${possibleBaseName}s`,
          possibleBaseName,
          // basic pluralization
          possibleBaseName.endsWith('y') ? possibleBaseName.slice(0, -1) + 'ies' : `${possibleBaseName}es`
        ];
        
        for (const ptn of possibleTableNames) {
          const targetTable = tables.find(t => t.name.toLowerCase() === ptn.toLowerCase());
          if (targetTable) {
            const targetCol = targetTable.columns.find(c => c.name === 'id' || c.name === col.name);
            if (targetCol) {
              col.isForeignKey = true;
              col.references = { table: targetTable.name, column: targetCol.name };
              break;
            }
          }
        }
      }
    }
  }
  
  return { tables };
}
