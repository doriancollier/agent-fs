'use client';

import { useEffect, useState } from 'react';

interface SQLViewerPaneProps {
  rows: any[];
  highlightedCommand?: string;
}

export default function SQLViewerPane({ rows, highlightedCommand }: SQLViewerPaneProps) {
  const [highlightedRow, setHighlightedRow] = useState<number | null>(null);

  useEffect(() => {
    // Highlight the newest row briefly
    if (rows.length > 0) {
      setHighlightedRow(rows.length - 1);
      const timer = setTimeout(() => setHighlightedRow(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [rows.length]);

  return (
    <div className="flex flex-col h-[600px] bg-slate-900">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-800 border-b border-slate-700">
        <h3 className="text-white font-semibold">SQLite Database</h3>
        <p className="text-slate-400 text-sm mt-1">
          Table: <code className="text-green-400">files</code> ({rows.length} rows)
        </p>
      </div>

      {/* SQL Query Display */}
      <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
        <div className="text-xs text-slate-400 mb-1">Current Query:</div>
        <code className="text-sm text-blue-300 font-mono">
          SELECT * FROM files WHERE user_id = 'demo_user'
        </code>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-800 border-b border-slate-700">
            <tr>
              <th className="px-3 py-2 text-left text-slate-400 font-semibold">user_id</th>
              <th className="px-3 py-2 text-left text-slate-400 font-semibold">path</th>
              <th className="px-3 py-2 text-left text-slate-400 font-semibold">type</th>
              <th className="px-3 py-2 text-left text-slate-400 font-semibold">content</th>
              <th className="px-3 py-2 text-left text-slate-400 font-semibold">mode</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {rows.map((row, i) => (
              <tr
                key={i}
                className={`
                  transition-colors duration-300
                  ${highlightedRow === i ? 'bg-green-500/20' : 'hover:bg-slate-800/50'}
                `}
              >
                <td className="px-3 py-2 text-slate-300 font-mono text-xs">
                  {row.user_id}
                </td>
                <td className="px-3 py-2 text-blue-300 font-mono text-xs">
                  {row.path}
                </td>
                <td className="px-3 py-2 font-mono text-xs">
                  <span className={`
                    px-2 py-0.5 rounded text-xs
                    ${row.type === 'file' ? 'bg-blue-500/20 text-blue-300' : 
                      row.type === 'directory' ? 'bg-purple-500/20 text-purple-300' :
                      'bg-yellow-500/20 text-yellow-300'}
                  `}>
                    {row.type}
                  </span>
                </td>
                <td className="px-3 py-2 text-slate-300 font-mono text-xs max-w-xs truncate">
                  {row.content ? (
                    <span className="text-green-300">"{row.content}"</span>
                  ) : (
                    <span className="text-slate-500">NULL</span>
                  )}
                </td>
                <td className="px-3 py-2 text-slate-400 font-mono text-xs">
                  {row.mode.toString(8)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div className="flex items-center justify-center h-64 text-slate-500">
            No records yet. Try creating a file!
          </div>
        )}
      </div>

      {/* Footer with stats */}
      <div className="px-4 py-2 bg-slate-800 border-t border-slate-700 text-xs text-slate-400">
        {rows.length} row{rows.length !== 1 ? 's' : ''} in table
      </div>
    </div>
  );
}
