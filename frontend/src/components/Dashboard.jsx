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

  if (loading) return <div className="text-center py-10 dark:text-gray-400">Loading charts...</div>;
  if (!data) return <div className="text-center py-10 text-red-500">Failed to load dashboard data.</div>;

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Task Status */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold mb-4 dark:text-gray-100">Status Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.status}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="status"
                  label
                >
                  {data.status.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold mb-4 dark:text-gray-100">Tasks by Category</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.categories}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="category" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Completion Trend */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-bold mb-4 dark:text-gray-100">Completion Trend (Last 7 Days)</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.trend}>
              <defs>
                <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} />
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
        </div>
      </div>
    </div>
  );
}
