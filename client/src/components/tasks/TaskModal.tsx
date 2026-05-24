import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Task } from '../../types';
import { TASK_TYPES } from '../../utils/helpers';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props { task?: Task | null; onClose: () => void; onSuccess: () => void; }

export default function TaskModal({ task, onClose, onSuccess }: Props) {
  const isEdit = !!task;
  const [form, setForm] = useState({
    title: '', description: '', taskType: 'Other', assignedTo: '',
    dueDate: '', priority: 'Medium', status: 'Pending', notes: '',
  });

  const { data: usersData } = useQuery({
    queryKey: ['bdas'],
    queryFn: async () => { const { data } = await api.get('/users/bdas'); return data; }
  });

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title, description: task.description, taskType: task.taskType,
        assignedTo: (task.assignedTo as any)?._id || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '',
        priority: task.priority, status: task.status, notes: task.notes,
      });
    }
  }, [task]);

  const mutation = useMutation({
    mutationFn: (data: any) => isEdit ? api.put(`/tasks/${task!._id}`, data) : api.post('/tasks', data),
    onSuccess: () => { toast.success(isEdit ? 'Task updated' : 'Task assigned'); onSuccess(); },
    onError: () => toast.error('Failed to save task'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{isEdit ? 'Edit Task' : 'Assign New Task'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="label">Title *</label>
            <input className="input" required placeholder="Task title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Task Type</label>
              <select className="input" value={form.taskType} onChange={e => setForm(f => ({ ...f, taskType: e.target.value }))}>
                {TASK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                {['Low', 'Medium', 'High'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Assign To *</label>
              <select className="input" required value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}>
                <option value="">Select BDA</option>
                {usersData?.users?.map((u: any) => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Due Date *</label>
              <input type="date" className="input" required value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
          </div>
          {isEdit && (
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {['Pending', 'In Progress', 'Completed'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="label">Description</label>
            <textarea className="input min-h-[70px] resize-none" placeholder="Task description..."
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary">
              {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : null}
              {isEdit ? 'Update Task' : 'Assign Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
