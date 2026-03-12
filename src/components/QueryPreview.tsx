import { useMemo } from 'react';
import { useSchemaStore } from '../store/useSchemaStore';
import { Terminal, Copy, Check, Download } from 'lucide-react';
import { useState } from 'react';
import { generateSql } from '../lib/sqlGenerator';
import { downloadAsFile } from '../lib/exportUtils';

export function QueryPreview() {
  const { nodes, edges, selectedColumns, columnSettings, filters, querySettings } = useSchemaStore();
  const [copied, setCopied] = useState(false);

  const generatedSql = useMemo(() => {
    return generateSql(nodes, edges, selectedColumns, columnSettings, filters, querySettings);
  }, [nodes, edges, selectedColumns, columnSettings, filters, querySettings]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadAsFile('query.sql', generatedSql, 'application/sql');
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] relative">
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button 
          onClick={handleDownload}
          className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-indigo-300 transition-colors bg-zinc-900/80 hover:bg-zinc-800 px-2.5 py-1.5 rounded-md border border-zinc-700/50 backdrop-blur-sm shadow-lg"
          title="Download SQL"
        >
          <Download size={14} />
          Export
        </button>
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
