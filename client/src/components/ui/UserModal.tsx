import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../../services/api';
import { User } from '../../types';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props { user?: User | null; onClose: () => void; onSuccess: () => void; }

export default function UserModal({ user, onClose, onSuccess }: Props) {
  const isEdit = !!user;
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'bda', phone: '', department: '' });

  useEffect(() => {
    if (user) setForm({ name: user.name, email: user.email, password: '', role: user.role, phone: user.phone || '', department: user.department || '' });
  }, [user]);

  const mutation = useMutation({
    mutationFn: (data: any) => isEdit ? api.put(`/users/${user!._id}`, data) : api.post('/users', data),
    onSuccess: () => { toast.success(isEdit ? 'User updated' : 'User created'); onSuccess(); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to save user'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { ...form };
    if (!isEdit) payload.password = form.password;
    if (isEdit) delete payload.password;
    mutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{isEdit ? 'Edit User' : 'Add User'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Full Name *</label>
            <input className="input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Smith" />
          </div>
          <div>
            <label className="label">Email *</label>
            <input className="input" type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@company.com" disabled={isEdit} />
          </div>
          {!isEdit && (
            <div>
              <label className="label">Password *</label>
              <input className="input" type="password" required minLength={6} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 6 characters" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Role *</label>
              <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="bda">BDA Executive</option>
                <option value="manager">Sales Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" />
            </div>
          </div>
          <div>
            <label className="label">Department</label>
            <input className="input" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="Sales, BD, etc." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary">
              {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : null}
              {isEdit ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
