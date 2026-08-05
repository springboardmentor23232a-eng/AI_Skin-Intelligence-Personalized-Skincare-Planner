import React, { useState } from 'react';
import adminData from '../data/adminData.json';
import Breadcrumb from '../components/common/Breadcrumb';
import EmptyState from '../components/common/EmptyState';
import { Search, Filter, Plus, Edit2, Trash2, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserManagementPage() {
  const [users, setUsers] = useState(adminData.usersList);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('User');
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error('Please enter name and email.');
      return;
    }

    if (editingId) {
      // Edit
      const updated = users.map(u => {
        if (u.id === editingId) {
          return { ...u, name, email, role };
        }
        return u;
      });
      setUsers(updated);
      toast.success('User details updated successfully! ✏️');
      setEditingId(null);
    } else {
      // Add
      const newUser = {
        id: `USR-${users.length + 1001}`,
        name,
        email,
        role,
        joined: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'Active'
      };
      setUsers([...users, newUser]);
      toast.success('New user account added! 👤');
    }

    // Reset
    setName('');
    setEmail('');
    setRole('User');
    setShowForm(false);
  };

  const handleEdit = (u) => {
    setEditingId(u.id);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setShowForm(true);
    toast.success(`Editing details for ${u.name}`);
  };

  const handleDelete = (id) => {
    setUsers(users.filter(u => u.id !== id));
    toast.error('User account deleted.');
  };

  const filtered = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const crumbs = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'User Management', path: '/admin/users' }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
      <Breadcrumb crumbs={crumbs} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-brand-950 tracking-tight">
            User Management
          </h1>
          <p className="text-sm text-brand-850">
            Control platform role directories, register accounts, and edit credentials.
          </p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setName('');
            setEmail('');
            setRole('User');
            setShowForm(!showForm);
          }}
          className="btn-primary px-4 py-2.5 rounded-xl text-xs font-display flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'Close Editor' : 'Add New Account'}
        </button>
      </div>

      {showForm && (
        <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-4 max-w-xl animate-fade-in">
          <h3 className="font-display text-base font-bold text-slate-900">
            {editingId ? 'Edit Account Credentials' : 'Add New User Account'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-display font-semibold uppercase tracking-wider text-brand-800 mb-1">
                  Full Name
                </label>
                <input 
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-brand-200 text-xs font-sans text-brand-950 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-display font-semibold uppercase tracking-wider text-brand-800 mb-1">
                  Email Address
                </label>
                <input 
                  type="email"
                  placeholder="e.g. john@demo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-brand-200 text-xs font-sans text-brand-950 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-display font-semibold uppercase tracking-wider text-brand-800 mb-1">
                Access Permission Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-brand-200 text-xs font-sans text-brand-950 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
              >
                <option value="User">User (Patient)</option>
                <option value="Consultant">Skincare Consultant</option>
                <option value="Dermatologist">Clinical Dermatologist</option>
                <option value="Admin">Platform Administrator</option>
              </select>
            </div>

            <div className="flex gap-2 justify-end font-display pt-2">
              <button 
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-brand-250 hover:bg-brand-50 text-brand-850 rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="btn-primary px-5 py-2.5 rounded-xl text-xs"
              >
                {editingId ? 'Save Changes' : 'Register Account'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Directory Table */}
      <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-4">
        
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-100">
          <div className="relative">
            <Search className="w-4 h-4 text-brand-400 absolute left-3 top-3" />
            <input 
              type="text"
              placeholder="Search directory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-brand-200 rounded-xl text-xs font-sans text-brand-950 focus:outline-none focus:ring-1 focus:ring-brand-500 w-full sm:w-64"
            />
          </div>

          <div className="flex items-center gap-1.5 border border-brand-200 px-3 py-1.5 rounded-xl bg-brand-50/20 text-xs text-brand-900 font-display">
            <Filter className="w-3.5 h-3.5 text-brand-500" />
            <span className="font-semibold mr-1">Filter Role:</span>
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent focus:outline-none font-bold cursor-pointer"
            >
              <option value="All">All Roles</option>
              <option value="User">User</option>
              <option value="Consultant">Consultant</option>
              <option value="Dermatologist">Dermatologist</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto min-w-full">
          {filtered.length > 0 ? (
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-brand-100 font-display font-semibold text-brand-850 uppercase tracking-widest text-[9px]">
                  <th className="py-2.5 px-2">Account ID</th>
                  <th className="py-2.5 px-2">User Details</th>
                  <th className="py-2.5 px-2">Role Assigned</th>
                  <th className="py-2.5 px-2">Registered On</th>
                  <th className="py-2.5 px-2">Status</th>
                  <th className="py-2.5 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100/50">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-brand-50/20 transition-colors">
                    <td className="py-3 px-2 font-semibold text-slate-900">{u.id}</td>
                    <td className="py-3 px-2">
                      <div className="font-medium text-slate-900">{u.name}</div>
                      <div className="text-[10px] text-brand-800">{u.email}</div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="font-semibold text-brand-900">{u.role}</span>
                    </td>
                    <td className="py-3 px-2 text-brand-800">{u.joined}</td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-bold ${
                        u.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex gap-2 justify-end">
                        <button 
                          onClick={() => handleEdit(u)}
                          className="p-1 border border-brand-200 hover:bg-brand-50 rounded-lg text-brand-805 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(u.id)}
                          className="p-1 border border-red-200 hover:bg-red-50 text-red-650 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

    </div>
  );
}
