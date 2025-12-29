import { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area 
} from 'recharts';
import { analyticsAPI } from '../services/api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await analyticsAPI.getSummary();
        setData(response.data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
      <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400 font-medium">Analyzing your tasks...</p>
    </div>
  );

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-dashed border-gray-300 dark:border-gray-700 text-center">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">No Data Yet</h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
          Add some tasks and complete them to see your productivity insights here!
        </p>
      </div>
    );
  }

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const statusData = data.status && data.status.length > 0 ? data.status : [];
  const categoryData = (data.categories || data.category) && (data.categories || data.category).length > 0 
    ? (data.categories || data.category) 
    : [];
  const trendData = data.trend && data.trend.length > 0 ? data.trend : [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Task Status */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-4 dark:text-gray-100">Status Distribution</h3>
          <div className="h-[300px]">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="status"
                    label
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 italic">
                No status data available
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-4 dark:text-gray-100">Tasks by Category</h3>
          <div className="h-[300px]">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="category" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 italic">
                No category data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Completion Trend */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-bold mb-4 dark:text-gray-100">Completion Trend (Last 7 Days)</h3>
        <div className="h-[300px]">
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(str) => {
                    const date = new Date(str);
                    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                  }}
                />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#6366f1" 
                  fillOpacity={1} 
                  fill="url(#colorTrend)" 
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 italic">
              No trend data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
