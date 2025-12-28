import { format } from 'date-fns';
import CategoryBadge from './CategoryBadge';
import PriorityBadge from './PriorityBadge';

export default function TaskItem({ task, onToggleComplete, onDelete, onEdit }) {
  const isCompleted = task.status === 'completed';
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isCompleted;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border-l-4 transition-all hover:shadow-md ${
      isCompleted ? 'border-green-500 opacity-75' : 
      isOverdue ? 'border-red-500' : 
      'border-indigo-500'
    }`}>
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggleComplete(task.id)}
          className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            isCompleted 
              ? 'bg-green-500 border-green-500' 
              : 'border-gray-300 dark:border-gray-600 hover:border-indigo-500'
          }`}
        >
          {isCompleted && (
            <svg className="w-3 h-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M5 13l4 4L19 7"></path>
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-grow">
          <h3 className={`font-semibold text-gray-800 dark:text-gray-100 mb-1 ${isCompleted ? 'line-through opacity-50' : ''}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className={`text-sm text-gray-600 dark:text-gray-400 mb-2 ${isCompleted ? 'line-through opacity-50' : ''}`}>
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <PriorityBadge priority={task.priority} />
            <CategoryBadge category={task.category} />
            {task.due_date && (
              <span className={`text-xs px-2 py-1 rounded ${
                isOverdue 
                  ? 'bg-red-100 text-red-700 font-medium' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                📅 {format(new Date(task.due_date), 'MMM dd, yyyy')}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(task)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          </button>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this task?')) {
                onDelete(task.id);
              }
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
