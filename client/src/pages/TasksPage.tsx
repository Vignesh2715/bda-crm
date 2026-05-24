import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Task } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatDate, priorityColors, taskStatusColors, TASK_TYPES } from '../utils/helpers';
import { Plus, Edit2, Trash2, CheckCircle, Loader2, ClipboardList, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import TaskModal from '../components/tasks/TaskModal';

const STATUS_TABS = ['All', 'Pending', 'In Progress', 'Completed'];
const PRIORITY_TABS = ['All', 'High', 'Medium', 'Low'];

export default function TasksPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', statusFilter, priorityFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.set('status', statusFilter);
      if (priorityFilter !== 'All') params.set('priority', priorityFilter);
      const { data } = await api.get(`/tasks?${params}`);
      return data.tasks as Task[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/tasks/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); toast.success('Task deleted'); },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.put(`/tasks/${id}`, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); toast.success('Task updated'); },
  });

  const tasks = data || [];
  const pendingCount = tasks.filter(t => t.status === 'Pending').length;
  const overdueCount = tasks.filter(t => t.status !== 'Completed' && new Date(t.dueDate) < new Date()).length;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="text-sm text-slate-500">{tasks.length} tasks</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <button onClick={() => { setEditTask(null); setShowModal(true); }} className="btn-primary">
            <Plus size={16} /> Assign Task
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: tasks.length, color: 'text-slate-700 dark:text-slate-200' },
          { label: 'Pending', value: pendingCount, color: 'text-amber-600' },
          { label: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length, color: 'text-blue-600' },
          { label: 'Overdue', value: overdueCount, color: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1">
          {STATUS_TABS.map(tab => (
            <button key={tab} onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === tab ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}>
              {tab}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {PRIORITY_TABS.map(tab => (
            <button key={tab} onClick={() => setPriorityFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${priorityFilter === tab ? 'bg-slate-700 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-40"><Loader2 size={28} className="animate-spin text-primary-500" /></div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <ClipboardList size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No tasks found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {tasks.map(task => {
              const isOverdue = task.status !== 'Completed' && new Date(task.dueDate) < new Date();
              return (
                <div key={task._id} className={`flex items-start gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isOverdue ? 'bg-red-50/40 dark:bg-red-900/5' : ''}`}>
                  <div className="shrink-0 mt-0.5">
                    {task.status === 'Completed' ? (
                      <CheckCircle size={20} className="text-green-500" />
                    ) : isOverdue ? (
                      <AlertCircle size={20} className="text-red-500" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`text-sm font-medium ${task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                          {task.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{task.taskType}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`badge ${priorityColors[task.priority]}`}>{task.priority}</span>
                        <span className={`badge ${taskStatusColors[task.status]}`}>{task.status}</span>
                      </div>
                    </div>
                    {task.description && <p className="text-xs text-slate-500 mt-1">{task.description}</p>}
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full flex items-center justify-center text-xs font-bold">
                          {task.assignedTo?.name?.charAt(0)}
                        </div>
                        <span className="text-xs text-slate-500">{task.assignedTo?.name}</span>
                      </div>
                      <span className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                        Due {formatDate(task.dueDate)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {task.status === 'Pending' && (
                      <button onClick={() => updateStatusMutation.mutate({ id: task._id, status: 'In Progress' })}
                        className="px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-100 transition-all">
                        Start
                      </button>
                    )}
                    {task.status === 'In Progress' && (
                      <button onClick={() => updateStatusMutation.mutate({ id: task._id, status: 'Completed' })}
                        className="px-2 py-1 text-xs bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg hover:bg-green-100 transition-all">
                        Done
                      </button>
                    )}
                    <button onClick={() => { setEditTask(task); setShowModal(true); }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all">
                      <Edit2 size={14} />
                    </button>
                    {(user?.role === 'admin' || user?.role === 'manager') && (
                      <button onClick={() => { if (confirm('Delete this task?')) deleteMutation.mutate(task._id); }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <TaskModal task={editTask} onClose={() => { setShowModal(false); setEditTask(null); }}
          onSuccess={() => { setShowModal(false); setEditTask(null); qc.invalidateQueries({ queryKey: ['tasks'] }); }} />
      )}
    </div>
  );
}
