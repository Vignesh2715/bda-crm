import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { User } from '../types';
import { formatDate, timeAgo } from '../utils/helpers';
import { Plus, Edit2, UserX, Loader2, Users, Shield, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import UserModal from '../components/ui/UserModal';

export default function UsersPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [roleFilter, setRoleFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['users', roleFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (roleFilter) params.set('role', roleFilter);
      const { data } = await api.get(`/users?${params}`);
      return data.users as User[];
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('User deactivated'); },
    onError: () => toast.error('Failed to deactivate user'),
  });

  const users = data || [];
  const roleIcon = (role: string) => role === 'admin' ? Shield : role === 'manager' ? Users : Briefcase;
  const roleColor = (role: string) =>
    role === 'admin' ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-300' :
    role === 'manager' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300' :
    'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-300';

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Team Management</h1>
          <p className="text-sm text-slate-500">{users.length} users</p>
        </div>
        <button onClick={() => { setEditUser(null); setShowModal(true); }} className="btn-primary">
          <Plus size={16} /> Add User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Admins', count: users.filter(u => u.role === 'admin').length, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Managers', count: users.filter(u => u.role === 'manager').length, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'BDA Executives', count: users.filter(u => u.role === 'bda').length, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Role filter */}
      <div className="flex gap-2">
        {['', 'admin', 'manager', 'bda'].map(role => (
          <button key={role} onClick={() => setRoleFilter(role)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${roleFilter === role ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}>
            {role || 'All'}
          </button>
        ))}
      </div>

      {/* Users grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40"><Loader2 size={28} className="animate-spin text-primary-500" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map(user => {
            const RoleIcon = roleIcon(user.role);
            return (
              <div key={user._id} className={`card p-5 ${!user.isActive ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  {!user.isActive && <span className="badge bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300">Inactive</span>}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className={`badge ${roleColor(user.role)} flex items-center gap-1`}>
                    <RoleIcon size={11} />
                    <span className="capitalize">{user.role === 'bda' ? 'BDA Executive' : user.role}</span>
                  </span>
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  {user.phone && <p>📞 {user.phone}</p>}
                  {user.department && <p>🏢 {user.department}</p>}
                  <p>Joined {formatDate(user.createdAt)}</p>
                  {user.lastLogin && <p>Last login {timeAgo(user.lastLogin)}</p>}
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button onClick={() => { setEditUser(user); setShowModal(true); }}
                    className="flex-1 btn-secondary text-xs py-1.5 justify-center">
                    <Edit2 size={13} /> Edit
                  </button>
                  {user.isActive && (
                    <button onClick={() => { if (confirm(`Deactivate ${user.name}?`)) deactivateMutation.mutate(user._id); }}
                      className="flex-1 btn-secondary text-xs py-1.5 justify-center text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                      <UserX size={13} /> Deactivate
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <UserModal user={editUser} onClose={() => { setShowModal(false); setEditUser(null); }}
          onSuccess={() => { setShowModal(false); setEditUser(null); qc.invalidateQueries({ queryKey: ['users'] }); }} />
      )}
    </div>
  );
}
