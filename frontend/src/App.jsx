import { useState } from 'react';
import { useAuth, AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useTasks } from './hooks/useTasks';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import FilterBar from './components/FilterBar';
import AuthForm from './components/AuthForm';
import ShortcutsHelp from './components/ShortcutsHelp';
import Dashboard from './components/Dashboard';

function MainApp() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { 
    tasks, 
    filters, 
    loading, 
    error,
    addTask, 
    updateTask, 
    toggleComplete, 
    deleteTask,
    updateFilter,
    exportTasks
  } = useTasks();

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [view, setView] = useState('list'); // 'list' or 'dashboard'

  useKeyboardShortcuts({
    'n': () => !showForm && !editingTask && setShowForm(true),
    'Escape': () => {
      setShowForm(false);
      setEditingTask(null);
      setShowShortcuts(false);
    },
    '?': () => setShowShortcuts(prev => !prev),
  });

  const handleAddTask = async (taskData) => {
    await addTask(taskData);
    setShowForm(false);
  };

  const handleEditTask = async (taskData) => {
    await updateTask(editingTask.id, taskData);
    setEditingTask(null);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
  };

  const handleExport = async (format) => {
    try {
      await exportTasks(format);
    } catch (err) {
      alert('Export failed: ' + err.message);
    }
  };

  const activeTasks = tasks.filter(t => t.status === 'active').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                📝 TODO Manager
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Welcome back, {user?.name || user?.email}! 
                <span className="ml-2 text-xs opacity-50 hidden sm:inline">(Press ? for shortcuts)</span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={toggleTheme}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                title="Toggle theme"
              >
                {isDark ? '☀️' : '🌙'}
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
              {activeTasks} Active
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
              {completedTasks} Completed
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
              {tasks.length} Total
            </span>
          </div>
        </header>

        {/* Actions & View Toggle */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowForm(true)}
              className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm hover:shadow-md"
            >
              ✚ New Task
            </button>
            <div className="flex bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
              <button
                onClick={() => setView('list')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  view === 'list' 
                    ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-gray-100 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setView('dashboard')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  view === 'dashboard' 
                    ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-gray-100 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
                }`}
              >
                Insights
              </button>
            </div>
          </div>
          
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => handleExport('json')}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
            >
              Export JSON
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Main Content */}
        {view === 'list' ? (
          <>
            <FilterBar 
              filters={filters}
              onFilterChange={updateFilter}
            />
            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            <TaskList
              tasks={tasks}
              loading={loading}
              onToggleComplete={toggleComplete}
              onDelete={deleteTask}
              onEdit={handleEdit}
            />
          </>
        ) : (
          <Dashboard />
        )}

        {/* Task Form Modal */}
        {(showForm || editingTask) && (
          <TaskForm
            task={editingTask}
            onSubmit={editingTask ? handleEditTask : handleAddTask}
            onClose={() => {
              setShowForm(false);
              setEditingTask(null);
            }}
          />
        )}

        {/* Shortcuts Help Modal */}
        {showShortcuts && (
          <ShortcutsHelp onClose={() => setShowShortcuts(false)} />
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <MainApp /> : <AuthForm />;
}

export default App;
