'use client';

import { useState, useRef, useEffect } from 'react';

interface TerminalPaneProps {
  onCommand: (command: string) => void;
}

interface HistoryEntry {
  command: string;
  output: string;
  timestamp: number;
}

export default function TerminalPane({ onCommand }: TerminalPaneProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const command = input.trim();
    
    // Simulate command execution
    let output = '';
    
    if (command === 'help') {
      output = `Available commands:
  echo "text" > /path/file.txt  - Create a file
  mkdir /path/directory         - Create a directory
  cat /path/file.txt           - Read a file
  ls /path                     - List directory
  rm /path/file.txt            - Delete a file
  
Try: echo "Hello!" > /workspace/hello.txt`;
    } else if (command.startsWith('echo') && command.includes('>')) {
      const match = command.match(/echo\s+"([^"]+)"\s+>\s+(\S+)/);
      if (match) {
        const [, , path] = match;
        output = `✓ Created ${path}`;
      } else {
        output = 'Error: Invalid echo syntax. Use: echo "text" > /path/file.txt';
      }
    } else if (command.startsWith('mkdir')) {
      const path = command.split(' ')[1];
      if (path) {
        output = `✓ Created directory ${path}`;
      } else {
        output = 'Error: Missing directory path';
      }
    } else if (command.startsWith('ls')) {
      // Simulate ls command
      const path = command.split(' ')[1] || '/';
      // This is a placeholder - in real implementation would query the database
      output = `Contents of ${path}:
  (This will show files from the database in real implementation)
  Try creating some files first with: echo "text" > /path/file.txt`;
    } else if (command.startsWith('cat')) {
      const path = command.split(' ')[1];
      if (path) {
        output = `Reading ${path}...
  (This will show file contents in real implementation)`;
      } else {
        output = 'Error: Missing file path';
    } else if (command.startsWith('rm')) {
      output = 'Feature coming soon!';
    } else {
      output = `Command not recognized: ${command}
Type 'help' for available commands`;
    }

    // Add to history
    setHistory(prev => [...prev, { command, output, timestamp: Date.now() }]);
    
    // Notify parent
    onCommand(command);
    
    // Clear input
    setInput('');
  };

  return (
    <div className="flex flex-col h-[600px] bg-slate-900">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border-b border-slate-700">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <span className="text-slate-400 text-sm font-mono ml-2">bash</span>
      </div>

      {/* Output */}
      <div 
        ref={outputRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm"
      >
        {/* Welcome message */}
        {history.length === 0 && (
          <div className="text-slate-400 mb-4">
            <p>Welcome to the SQLite VFS Interactive Demo!</p>
            <p className="mt-2">Type <span className="text-green-400">help</span> to see available commands.</p>
            <p className="mt-1">Try: <span className="text-green-400">echo "Hello!" &gt; /workspace/hello.txt</span></p>
          </div>
        )}

        {/* Command history */}
        {history.map((entry, i) => (
          <div key={i} className="mb-3">
            <div className="flex items-center gap-2">
              <span className="text-green-400">$</span>
              <span className="text-white">{entry.command}</span>
            </div>
            {entry.output && (
              <div className="ml-4 text-slate-300 whitespace-pre-wrap">
                {entry.output}
              </div>
            )}
          </div>
        ))}

        {/* Current input (shown for visual consistency) */}
        {input && (
          <div className="flex items-center gap-2 text-white">
            <span className="text-green-400">$</span>
            <span>{input}</span>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-slate-700 p-4">
        <div className="flex items-center gap-2 font-mono text-sm">
          <span className="text-green-400">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent text-white outline-none"
            placeholder="Type a command..."
            autoFocus
          />
        </div>
      </form>
    </div>
  );
}
