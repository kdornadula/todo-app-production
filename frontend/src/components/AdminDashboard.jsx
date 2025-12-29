import { useState, useEffect } from 'react';
import api from '../services/api';

export default function AdminDashboard() {
  const [adminKey, setAdminKey] = useState(localStorage.getItem('adminKey') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (adminKey) {
      fetchUsers();
    }
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      // Direct axios call with custom header since this is separate from regular user auth
      const response = await api.get('/admin/users', {
        headers: { 'x-admin-key': adminKey }
      });
      setUsers(response.data);
      setIsAuthenticated(true);
      localStorage.setItem('adminKey', adminKey);
    } catch (err) {
      console.error(err);
      setError('Invalid Admin Key or Server Error');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId) => {
    if (!window.confirm('Are you sure you want to reset this user\'s password to "12345678"?')) return;

    try {
      const response = await api.patch(`/admin/users/${userId}/reset-password`, {}, {
        headers: { 'x-admin-key': adminKey }
      });
      alert(response.data.message);
    } catch (err) {
      alert('Failed to reset password');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure? This will delete the user and ALL their tasks permanently.')) return;

    try {
      await api.delete(`/admin/users/${userId}`, {
        headers: { 'x-admin-key': adminKey }
      });
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">🛡️ Super Admin Access</h1>
          <form onSubmit={(e) => { e.preventDefault(); fetchUsers(); }}>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Enter Admin Key"
              className="w-full px-4 py-2 border rounded-lg mb-4 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-bold transition-colors"
            >
              {loading ? 'Verifying...' : 'Access Dashboard'}
            </button>
            {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">👥 User Management</h1>
          <button 
            onClick={() => {
              setAdminKey('');
              localStorage.removeItem('adminKey');
              setIsAuthenticated(false);
            }}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            Logout
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Joined</th>
                <th className="p-4">Tasks</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300">
                  <td className="p-4 text-gray-400">#{user.id}</td>
                  <td className="p-4 font-medium">{user.name || 'Unknown'}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4 text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full dark:bg-blue-900 dark:text-blue-200">
                      {user.task_count}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleResetPassword(user.id)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:underline mr-4"
                    >
                      Reset Pwd
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="p-8 text-center text-gray-500">No users found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
