// src/components/common/CommandPalette.jsx

import React, { useState, useEffect, useRef } from 'react';

const CommandPalette = ({ navigate, user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const commands = [
    // Navigation
    { id: 1, name: 'Go to Dashboard', icon: '📊', action: () => navigate('/dashboard'), category: 'Navigation' },
    { id: 2, name: 'Go to Users', icon: '👥', action: () => navigate('/users'), category: 'Navigation' },
    { id: 3, name: 'Go to Analytics', icon: '📈', action: () => navigate('/analytics'), category: 'Navigation' },
    { id: 4, name: 'Go to Activity Log', icon: '📋', action: () => navigate('/activity'), category: 'Navigation' },
    { id: 5, name: 'Go to API Keys', icon: '🔑', action: () => navigate('/api-keys'), category: 'Navigation' },
    { id: 6, name: 'Go to Webhooks', icon: '🔗', action: () => navigate('/webhooks'), category: 'Navigation' },
    { id: 7, name: 'Go to Subscription', icon: '💳', action: () => navigate('/subscription'), category: 'Navigation' },
    { id: 8, name: 'Go to Settings', icon: '⚙️', action: () => navigate('/settings'), category: 'Navigation' },
    
    // Actions
    { id: 9, name: 'Create New User', icon: '➕', action: () => navigate('/users?action=create'), category: 'Actions' },
    { id: 10, name: 'Create API Key', icon: '🔑', action: () => navigate('/api-keys?action=create'), category: 'Actions' },
    { id: 11, name: 'Create Webhook', icon: '🔗', action: () => navigate('/webhooks?action=create'), category: 'Actions' },
    { id: 12, name: 'Export Data', icon: '📥', action: () => console.log('Export'), category: 'Actions' },
    
    // Quick Actions
    { id: 13, name: 'Logout', icon: '🚪', action: () => { localStorage.clear(); window.location.href = '/login'; }, category: 'Quick Actions' },
    { id: 14, name: 'Change Theme', icon: '🎨', action: () => console.log('Theme'), category: 'Quick Actions' },
    { id: 15, name: 'View Profile', icon: '👤', action: () => navigate('/settings?tab=profile'), category: 'Quick Actions' },
    
    // Help
    { id: 16, name: 'Documentation', icon: '📚', action: () => window.open('https://docs.platform.com', '_blank'), category: 'Help' },
    { id: 17, name: 'Contact Support', icon: '💬', action: () => console.log('Support'), category: 'Help' },
    { id: 18, name: 'Keyboard Shortcuts', icon: '⌨️', action: () => console.log('Shortcuts'), category: 'Help' },
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.name.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) {
      acc[cmd.category] = [];
    }
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K or Ctrl+K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      
      // Escape to close
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearch('');
      }

      // Arrow navigation
      if (isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            executeCommand(filteredCommands[selectedIndex]);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const executeCommand = (command) => {
    command.action();
    setIsOpen(false);
    setSearch('');
    setSelectedIndex(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Command Palette */}
      <div className="flex items-start justify-center min-h-screen pt-16 px-4">
        <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center px-4 py-3 border-b border-gray-200">
            <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Type a command or search..."
              className="flex-1 outline-none text-gray-900 placeholder-gray-400"
            />
            <kbd className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded">
              ESC
            </kbd>
          </div>

          {/* Commands List */}
          <div className="max-h-96 overflow-y-auto">
            {Object.keys(groupedCommands).length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <p>No commands found</p>
              </div>
            ) : (
              Object.entries(groupedCommands).map(([category, cmds]) => (
                <div key={category}>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase bg-gray-50">
                    {category}
                  </div>
                  {cmds.map((command, idx) => {
                    const globalIndex = filteredCommands.indexOf(command);
                    return (
                      <button
                        key={command.id}
                        onClick={() => executeCommand(command)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        className={`w-full flex items-center px-4 py-3 hover:bg-gray-50 transition ${
                          selectedIndex === globalIndex ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                        }`}
                      >
                        <span className="text-2xl mr-3">{command.icon}</span>
                        <span className="flex-1 text-left text-gray-900">{command.name}</span>
                        {selectedIndex === globalIndex && (
                          <kbd className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded">
                            ↵
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded mr-1">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded mr-1">↓</kbd>
                Navigate
              </span>
              <span className="flex items-center">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded mr-1">↵</kbd>
                Select
              </span>
              <span className="flex items-center">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded mr-1">ESC</kbd>
                Close
              </span>
            </div>
            <span>{filteredCommands.length} results</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;