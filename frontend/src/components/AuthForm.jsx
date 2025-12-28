import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = isLogin
      ? await login(formData.email, formData.password)
      : await signup(formData.email, formData.password, formData.name);

    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 text-center">
          📝 TODO Manager
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          {isLogin ? 'Welcome back!' : 'Create your account'}
        </p>

        {/* Tab Switch */}
        <div className="flex mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              setIsLogin(true);
              setError('');
            }}
            className={`flex-1 py-2 text-center font-medium transition-colors ${
              isLogin
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setError('');
            }}
            className={`flex-1 py-2 text-center font-medium transition-colors ${
              !isLogin
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Your name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Min. 8 characters"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-indigo-600 hover:underline font-medium"
          >
            {isLogin ? 'Sign up here' : 'Login here'}
          </button>
        </p>
      </div>
    </div>
  );
}
