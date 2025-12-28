import TaskItem from './TaskItem';

export default function TaskList({ tasks, loading, onToggleComplete, onDelete, onEdit }) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">Loading tasks...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No tasks found</h3>
        <p className="text-gray-500">Add a new task to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
