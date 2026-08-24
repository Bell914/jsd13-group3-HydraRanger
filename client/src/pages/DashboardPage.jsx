import React, { useState, useEffect } from 'react';
import { Plus, Search, RefreshCw, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { itemService } from '../services/itemService.js';
import { authService } from '../services/authService.js';
import { Button, Card, LoadingSpinner } from '../components/index.js';

export const DashboardPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Create Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Frontend',
    status: 'Todo',
    priority: 'Medium'
  });
  const [submitting, setSubmitting] = useState(false);

  const currentUser = authService.getCurrentUser();

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await itemService.getItems({
        search: searchTerm,
        category: filterCategory,
        status: filterStatus
      });
      setItems(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch items from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [filterCategory, filterStatus]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      setError('Please fill in both title and description');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await itemService.createItem(formData);
      setSuccessMsg('Item created successfully!');
      setFormData({
        title: '',
        description: '',
        category: 'Frontend',
        status: 'Todo',
        priority: 'Medium'
      });
      setShowForm(false);
      fetchItems();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to create item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await itemService.deleteItem(id);
      setSuccessMsg('Item deleted successfully!');
      fetchItems();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to delete item');
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'done') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          Done
        </span>
      );
    }
    if (s === 'in progress') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
          In Progress
        </span>
      );
    }
    if (s === 'review') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
          Review
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-slate-700/40 text-slate-300 border border-slate-600/40">
        Todo
      </span>
    );
  };

  const getPriorityColor = (priority) => {
    const p = (priority || '').toLowerCase();
    if (p === 'critical') return 'text-rose-400 font-bold';
    if (p === 'high') return 'text-amber-400 font-semibold';
    if (p === 'medium') return 'text-cyan-400 font-medium';
    return 'text-slate-400 font-medium';
  };

  return (
    <div className="flex flex-col gap-8 py-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">
            Hydra<span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Ranger</span> Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Welcome back, <strong className="text-slate-200">{currentUser?.username || 'Hydra User'}</strong>! Manage your Sprint 2 tasks and items.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={fetchItems}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Close Form' : 'Add Item'}
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Create Form Modal / Card */}
      {showForm && (
        <Card
          title="Create New Sprint Item"
          subtitle="Add a new deliverable or task to the dashboard"
          icon={Plus}
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700/70 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  placeholder="e.g. Build User API"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700/70 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Design">Design</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Testing">Testing</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                <select
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700/70 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Review">Review</option>
                  <option value="Done">Done</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                <select
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700/70 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description *</label>
              <textarea
                rows="3"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700/70 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                placeholder="Explain the requirements or scope..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Item'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 flex flex-wrap gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[260px]">
          <input
            type="text"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            placeholder="Search items by title or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="submit" variant="secondary" size="sm" icon={Search}>
            Search
          </Button>
        </form>

        <div className="flex gap-3 flex-wrap">
          <select
            className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700/80 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="Design">Design</option>
            <option value="DevOps">DevOps</option>
            <option value="General">General</option>
          </select>

          <select
            className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700/80 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Review">Review</option>
            <option value="Done">Done</option>
          </select>
        </div>
      </div>

      {/* Items List */}
      {loading ? (
        <LoadingSpinner message="Fetching items from HydraRanger Server..." />
      ) : items.length === 0 ? (
        <Card>
          <div className="text-center py-12 px-4">
            <p className="text-slate-400 text-base mb-4">
              No items found matching your filters.
            </p>
            <Button variant="secondary" onClick={() => setShowForm(true)}>
              Create Your First Item
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <Card
              key={item.id || item._id}
              hoverable
              action={
                <button
                  onClick={() => handleDeleteItem(item.id || item._id)}
                  className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete item"
                >
                  <Trash2 size={16} />
                </button>
              }
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400 tracking-wide uppercase">
                    {item.category || 'General'}
                  </span>
                  <span className={`text-xs ${getPriorityColor(item.priority)}`}>
                    ● {item.priority || 'Medium'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-100 leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {item.description}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400 mt-2">
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-slate-500" />
                    <span>{item.creatorName || 'Hydra Member'}</span>
                  </div>
                  <div>{getStatusBadge(item.status)}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
