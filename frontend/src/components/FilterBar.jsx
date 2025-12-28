import { useState, useEffect, useRef } from 'react';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';

const CATEGORIES = ['Work', 'Personal', 'Shopping', 'Health', 'Finance'];

export default function FilterBar({ filters, onFilterChange }) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  // Debouncing search
  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange('search', searchTerm);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, onFilterChange]);

  const inputRef = useRef(null);

  useKeyboardShortcuts({
    '/': () => inputRef.current?.focus(),
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
      <div className="flex flex-wrap gap-6">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              🔍
            </span>
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks... (/)"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <div className="flex gap-2">
            {['all', 'active', 'completed'].map(status => (
              <button
                key={status}
                onClick={() => onFilterChange('status', status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  filters.status === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => onFilterChange('category', e.target.value || null)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Priority
          </label>
          <select
            value={filters.priority || ''}
            onChange={(e) => onFilterChange('priority', e.target.value || null)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Priorities</option>
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
        </div>
        </div>
      </div>
    </div>
  );
}
