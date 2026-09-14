import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import EmptyState from '../components/common/EmptyState';
import { Search, Filter, Plus, Edit2, Trash2, ShieldAlert, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import * as adminService from '../services/adminService';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Edit role modal/inline state
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedRole, setSelectedRole] = useState('USER');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers(searchTerm, roleFilter);
      setUsers(data || []);
    } catch (err) {
      toast.error('Failed to load user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchUsers();
    }, 250);
    return () => clearTimeout(timeout);
  }, [searchTerm, roleFilter]);

  const handleUpdateRole = async (userId) => {
    setActionLoading(true);
    try {
      await adminService.updateUserRole(userId, selectedRole);
      toast.success(`Updated user role to ${selectedRole} successfully! 🛡️`);
      setEditingUserId(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update user role.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete user ${user.name} (${user.email})? This action cannot be undone.`)) {
      return;
    }
    setActionLoading(true);
    try {
      await adminService.deleteUser(user.id);
      toast.success(`Deleted user ${user.name} from platform.`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete user.');
    } finally {
      setActionLoading(false);
    }
  };

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
            Control platform user directories, change role clearances, and manage account access.
          </p>
        </div>
      </div>

      <div className="glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-4">
        
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-100">
          <div className="relative">
            <Search className="w-4 h-4 text-brand-400 absolute left-3 top-3" />
            <input 
              type="text"
              placeholder="Search user name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-brand-200 rounded-xl text-xs font-sans text-brand-950 focus:outline-none focus:ring-1 focus:ring-brand-500 w-full sm:w-72"
            />
          </div>

          <div className="flex items-center gap-1.5 border border-brand-200 px-3 py-1.5 rounded-xl bg-brand-50/20 text-xs text-brand-900 font-display">
            <Filter className="w-3.5 h-3.5 text-brand-500" />
            <span className="font-semibold mr-1">Role Clearance:</span>
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent focus:outline-none font-bold cursor-pointer"
            >
              <option value="All">All Roles</option>
              <option value="USER">User / Patient</option>
              <option value="CONSULTANT">Skincare Consultant</option>
              <option value="DOCTOR">Dermatologist / Doctor</option>
              <option value="ADMIN">System Administrator</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-brand-850 font-semibold">Loading platform users...</span>
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto min-w-full">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-brand-100 font-display font-semibold text-brand-850 uppercase tracking-widest text-[9px]">
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Role Clearance</th>
                  <th className="py-2.5 px-3">Joined Date</th>
                  <th className="py-2.5 px-3">Account Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100/50">
                {users.map(u => (
                  <tr key={u.id} className="text-brand-900 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{u.name}</div>
                      <span className="text-[10px] text-slate-500 block font-normal">{u.email}</span>
                    </td>
                    <td className="py-3 px-3">
                      {editingUserId === u.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="border border-brand-300 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none"
                          >
                            <option value="USER">USER</option>
                            <option value="CONSULTANT">CONSULTANT</option>
                            <option value="DOCTOR">DOCTOR</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                          <button
                            onClick={() => handleUpdateRole(u.id)}
                            disabled={actionLoading}
                            className="p-1 bg-brand-600 hover:bg-brand-700 text-white rounded-md"
                            title="Save Role"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="p-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                          u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                          u.role === 'DOCTOR' || u.role === 'DERMATOLOGIST' ? 'bg-blue-100 text-blue-800' :
                          u.role === 'CONSULTANT' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {u.role}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">
                      {new Date(u.created_at || u.joined || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[9px]">
                        Active
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingUserId(u.id);
                            setSelectedRole(u.role);
                          }}
                          className="p-1.5 hover:bg-brand-50 border border-brand-200 text-brand-800 rounded-lg transition-colors"
                          title="Edit Role"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 hover:bg-red-50 border border-red-200 text-red-600 rounded-lg transition-colors"
                          title="Delete Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState 
            title="No Users Found" 
            message="No user accounts match the specified search keywords or role filters." 
          />
        )}
      </div>
    </div>
  );
}
