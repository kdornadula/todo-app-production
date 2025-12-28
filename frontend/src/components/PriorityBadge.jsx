export default function PriorityBadge({ priority }) {
  const styles = {
    high: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
    medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    low: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
  };

  const labels = {
    high: '🔴 High',
    medium: '🟡 Medium',
    low: '🟢 Low'
  };

  return (
    <span className={`text-xs px-2 py-1 rounded border font-medium capitalize ${styles[priority] || styles.medium}`}>
      {labels[priority] || labels.medium}
    </span>
  );
}
