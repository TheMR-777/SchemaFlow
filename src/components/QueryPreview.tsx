import { useMemo, useState } from 'react';
import { useSchemaStore } from '../store/useSchemaStore';
import { Copy, Check, Download, Play, Database, Sparkles, Code2, AlignLeft } from 'lucide-react';
import { generateSql } from '../lib/sqlGenerator';
import { downloadAsFile } from '../lib/exportUtils';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

export function QueryPreview() {
  const { nodes, edges, selectedColumns, columnSettings, filters, querySettings } = useSchemaStore();
  const [copied, setCopied] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isFormatted, setIsFormatted] = useState(true);

  const generatedSql = useMemo(() => {
    return generateSql(nodes, edges, selectedColumns, columnSettings, filters, querySettings, isFormatted);
  }, [nodes, edges, selectedColumns, columnSettings, filters, querySettings, isFormatted]);

  const isEmpty = nodes.length === 0;

  const handleCopy = () => {
    if (isEmpty) return;
    navigator.clipboard.writeText(generatedSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (isEmpty) return;
    downloadAsFile('query.sql', generatedSql, 'application/sql');
  };

  const handleRunQuery = () => {
    if (isEmpty) return;
    setIsExecuting(true);
    // Simulate execution time
    setTimeout(() => {
      setIsExecuting(false);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] relative overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80 bg-[#0a0a0a] z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
            <Code2 size={16} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-zinc-200">Generated SQL</h3>
            <p className="text-[10px] text-zinc-500 font-mono">
              {nodes.length} tables • {edges.length} joins
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsFormatted(!isFormatted)}
            disabled={isEmpty}
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              isFormatted 
                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20" 
                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-300"
            )}
            title="Toggle Formatting"
          >
            <AlignLeft size={14} />
            Format
          </button>
          <div className="w-px h-4 bg-zinc-800 mx-1" />
          <button 
            onClick={handleDownload}
            disabled={isEmpty}
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-indigo-300 transition-colors bg-zinc-900 hover:bg-zinc-800 px-3 py-1.5 rounded-md border border-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download SQL"
          >
            <Download size={14} />
            Export
          </button>
          <button 
            onClick={handleCopy}
            disabled={isEmpty}
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-indigo-300 transition-colors bg-zinc-900 hover:bg-zinc-800 px-3 py-1.5 rounded-md border border-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed w-20 justify-center"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <div className="w-px h-4 bg-zinc-800 mx-1" />
          <button 
            onClick={handleRunQuery}
            disabled={isEmpty || isExecuting}
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium px-4 py-1.5 rounded-md border transition-all shadow-lg",
              isEmpty 
                ? "bg-zinc-900 border-zinc-800 text-zinc-500 cursor-not-allowed" 
                : "bg-indigo-500 hover:bg-indigo-600 border-indigo-400/50 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]"
            )}
          >
            {isExecuting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <Database size={14} />
              </motion.div>
            ) : (
              <Play size={14} className="fill-current" />
            )}
            {isExecuting ? 'Running...' : 'Run Query'}
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative bg-[#0a0a0a] overflow-hidden">
        <AnimatePresence mode="wait">
          {isEmpty ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10 bg-[#0a0a0a]"
            >
              <div className="w-16 h-16 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-center mb-4 shadow-2xl relative">
                <Sparkles className="text-indigo-400 absolute -top-2 -right-2" size={16} />
                <Database size={24} className="text-zinc-500" />
              </div>
              <h3 className="text-zinc-300 font-medium mb-2">No Tables Selected</h3>
              <p className="text-zinc-500 text-sm max-w-sm leading-relaxed">
                Drag and drop tables from the sidebar onto the canvas to start generating your SQL query automatically.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <CodeMirror
                value={generatedSql}
                height="100%"
                theme={vscodeDark}
                extensions={[sql()]}
                editable={false}
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLineGutter: true,
                  highlightSpecialChars: true,
                  history: false,
                  foldGutter: true,
                  drawSelection: true,
                  dropCursor: true,
                  allowMultipleSelections: true,
                  indentOnInput: false,
                  syntaxHighlighting: true,
                  bracketMatching: true,
                  closeBrackets: false,
                  autocompletion: false,
                  rectangularSelection: true,
                  crosshairCursor: true,
                  highlightActiveLine: true,
                  highlightSelectionMatches: true,
                  closeBracketsKeymap: false,
                  defaultKeymap: false,
                  searchKeymap: true,
                  historyKeymap: false,
                  foldKeymap: true,
                  completionKeymap: false,
                  lintKeymap: false,
                }}
                className="h-full text-[13px] font-mono [&_.cm-editor]:h-full [&_.cm-scroller]:font-mono [&_.cm-editor]:!bg-[#0a0a0a] [&_.cm-gutters]:!bg-[#0a0a0a] [&_.cm-gutters]:!border-r-zinc-800/50 [&_.cm-activeLine]:!bg-zinc-900/50 [&_.cm-activeLineGutter]:!bg-zinc-900/50"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
