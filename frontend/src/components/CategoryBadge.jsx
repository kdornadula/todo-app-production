const CATEGORY_COLORS = {
  Work: 'bg-blue-100 text-blue-700',
  Personal: 'bg-green-100 text-green-700',
  Shopping: 'bg-amber-100 text-amber-700',
  Health: 'bg-red-100 text-red-700',
  Finance: 'bg-purple-100 text-purple-700',
};

export default function CategoryBadge({ category }) {
  const colorClass = CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-700';

  return (
    <span className={`text-xs px-2 py-1 rounded font-medium ${colorClass}`}>
      {category}
    </span>
  );
}
