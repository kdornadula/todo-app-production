import { useState, useEffect, useCallback } from 'react';
import { taskAPI } from '../services/api';

export const CATEGORY_COLORS = {
  Work: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  Personal: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  Shopping: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  Health: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  Finance: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
};
export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    category: null,
    priority: null,
    search: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await taskAPI.getTasks(filters);
      setTasks(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Auto-fetch on mount and filter changes
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Create task
  const addTask = async (taskData) => {
    try {
      const response = await taskAPI.createTask(taskData);
      setTasks(prev => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Update task
  const updateTask = async (id, updates) => {
    try {
      const response = await taskAPI.updateTask(id, updates);
      setTasks(prev => prev.map(task => task.id === id ? response.data : task));
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Toggle completion
  const toggleComplete = async (id) => {
    try {
      const response = await taskAPI.toggleComplete(id);
      setTasks(prev => prev.map(task => task.id === id ? response.data : task));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    try {
      await taskAPI.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Update filters
  const updateFilter = useCallback((filterType, value) => {
    setFilters(prev => {
      if (prev[filterType] === value) return prev;
      return { ...prev, [filterType]: value };
    });
  }, []);

  // Export tasks
  const exportTasks = async (format) => {
    try {
      const response = await taskAPI.exportTasks(format);
      
      if (format === 'csv') {
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tasks.csv';
        a.click();
      } else {
        const dataStr = JSON.stringify(response.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tasks.json';
        a.click();
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    tasks,
    filters,
    loading,
    error,
    addTask,
    updateTask,
    toggleComplete,
    deleteTask,
    updateFilter,
    exportTasks,
    refetch: fetchTasks,
  };
};
