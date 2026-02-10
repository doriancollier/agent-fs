'use client';

import { useState, useEffect } from 'react';
import TerminalPane from './TerminalPane';
import SQLViewerPane from './SQLViewerPane';

export default function InteractiveDemo() {
  const [dbRows, setDbRows] = useState<any[]>([]);
  const [lastCommand, setLastCommand] = useState<string>('');

  // Initialize demo database
  useEffect(() => {
    // Initial empty state
    setDbRows([
      {
        user_id: 'demo_user',
        path: '/',
        type: 'directory',
        content: null,
        mode: 493,
        mtime: Date.now(),
      }
    ]);
  }, []);

  const handleCommand = async (command: string) => {
    setLastCommand(command);
    
    // Parse and simulate command execution
    // In a real implementation, this would run against actual AgentFs
    
    if (command.includes('echo') && command.includes('>')) {
      // Simulate file write
      const match = command.match(/echo\s+"([^"]+)"\s+>\s+(\S+)/);
      if (match) {
        const [, content, path] = match;
        const newRow = {
          user_id: 'demo_user',
          path: path.startsWith('/') ? path : `/${path}`,
          type: 'file',
          content: content,
          mode: 420,
          mtime: Date.now(),
        };
        setDbRows(prev => [...prev, newRow]);
      }
    } else if (command.startsWith('mkdir')) {
      // Simulate directory creation
      const path = command.split(' ')[1];
      if (path) {
        const newRow = {
          user_id: 'demo_user',
          path: path.startsWith('/') ? path : `/${path}`,
          type: 'directory',
          content: null,
          mode: 493,
          mtime: Date.now(),
        };
        setDbRows(prev => [...prev, newRow]);
      }
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <div className="grid lg:grid-cols-2 gap-0 divide-x divide-slate-700">
        {/* Left: Terminal */}
        <TerminalPane onCommand={handleCommand} />
        
        {/* Right: SQL Viewer */}
        <SQLViewerPane rows={dbRows} highlightedCommand={lastCommand} />
      </div>
    </div>
  );
}
