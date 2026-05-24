import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatDateTime } from '../utils/helpers';
import { User, Shield, Briefcase, Save, Key, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '', phone: user?.phone || '', department: user?.department || '',
  });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const profileMutation = useMutation({
    mutationFn: (data: any) => api.put('/auth/profile', data),
    onSuccess: (res) => { updateUser(res.data.user); toast.success('Profile updated'); },
    onError: () => toast.error('Failed to update profile'),
  });

  const passMutation = useMutation({
    mutationFn: (data: any) => api.put('/auth/change-password', data),
    onSuccess: () => { toast.success('Password changed!'); setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to change password'),
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (passForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    passMutation.mutate({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
  };

  const roleLabel = user?.role === 'admin' ? 'Administrator' : user?.role === 'manager' ? 'Sales Manager' : 'BDA Executive';
  const roleColor = user?.role === 'admin' ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' :
    user?.role === 'manager' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' :
    'text-green-600 bg-green-50 dark:bg-green-900/20';

  return (
    <div className="space-y-6 animate-slide-up max-w-2xl">
      <div>
        <h1 className="page-title">My Profile</h1>
        <p className="text-sm text-slate-500">Manage your account settings</p>
      </div>

      {/* Profile header */}
      <div className="card p-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-700 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
            <p className="text-slate-500 text-sm">{user?.email}</p>
            <span className={`badge mt-1 ${roleColor} flex items-center gap-1 w-fit`}>
              {user?.role === 'admin' ? <Shield size={10} /> : <Briefcase size={10} />}
              {roleLabel}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 text-sm">
          <div>
            <p className="text-xs text-slate-400">Member Since</p>
            <p className="text-slate-700 dark:text-slate-200 font-medium">{user?.createdAt ? formatDate(user.createdAt) : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Last Login</p>
            <p className="text-slate-700 dark:text-slate-200 font-medium">{user?.lastLogin ? formatDateTime(user.lastLogin) : '—'}</p>
          </div>
        </div>
      </div>

      {/* Edit profile */}
      <div className="card p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <User size={16} /> Edit Profile
        </h3>
        <form onSubmit={e => { e.preventDefault(); profileMutation.mutate(profileForm); }} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Phone</label>
              <input className="input" value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="label">Department</label>
              <input className="input" value={profileForm.department} onChange={e => setProfileForm(f => ({ ...f, department: e.target.value }))} placeholder="Sales" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={profileMutation.isPending} className="btn-primary">
              {profileMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Change password */}
      <div className="card p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Key size={16} /> Change Password
        </h3>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input type="password" className="input" required value={passForm.currentPassword}
              onChange={e => setPassForm(f => ({ ...f, currentPassword: e.target.value }))} />
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input" required minLength={6} value={passForm.newPassword}
              onChange={e => setPassForm(f => ({ ...f, newPassword: e.target.value }))} />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" className="input" required value={passForm.confirmPassword}
              onChange={e => setPassForm(f => ({ ...f, confirmPassword: e.target.value }))} />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={passMutation.isPending} className="btn-primary">
              {passMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
              Change Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
