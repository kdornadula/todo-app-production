export default function ShortcutsHelp({ onClose }) {
  const shortcuts = [
    { key: 'N', action: 'New Task' },
    { key: '/', action: 'Focus search' },
    { key: '?', action: 'Toggle this help' },
    { key: 'Esc', action: 'Close modals / menus' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            ⌨️ Keyboard Shortcuts
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            ✕
          </button>
        </div>
        
        <div className="space-y-3">
          {shortcuts.map(s => (
            <div key={s.key} className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">{s.action}</span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm font-mono text-gray-800 dark:text-gray-200 shadow-sm">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
