import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Notification } from '../types';
import { timeAgo } from '../utils/helpers';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications-full'],
    queryFn: async () => { const { data } = await api.get('/notifications'); return data; },
  });

  const markAllMutation = useMutation({
    mutationFn: () => api.put('/notifications/mark-all-read'),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications-full'] }); qc.invalidateQueries({ queryKey: ['notifications'] }); toast.success('All marked as read'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/notifications/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications-full'] }); qc.invalidateQueries({ queryKey: ['notifications'] }); },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.put(`/notifications/${id}/read`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications-full'] }); qc.invalidateQueries({ queryKey: ['notifications'] }); },
  });

  const notifications: Notification[] = data?.notifications || [];
  const unread: number = data?.unreadCount || 0;

  const typeIcon = (type: string) => {
    const map: Record<string, string> = {
      lead_assigned: '🎯', task_assigned: '✅', followup_reminder: '📅', followup_overdue: '⚠️', general: '🔔'
    };
    return map[type] || '🔔';
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-2xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="text-sm text-slate-500">{unread} unread</p>
        </div>
        {unread > 0 && (
          <button onClick={() => markAllMutation.mutate()} className="btn-secondary text-sm">
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="h-40 flex items-center justify-center text-slate-400">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Bell size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.map(n => (
              <div key={n._id}
                className={`flex gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!n.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}>
                <span className="text-xl shrink-0 mt-0.5">{typeIcon(n.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${!n.isRead ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>{n.title}</p>
                    {!n.isRead && <div className="w-2 h-2 bg-primary-500 rounded-full shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {!n.isRead && (
                    <button onClick={() => markReadMutation.mutate(n._id)}
                      className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all" title="Mark read">
                      <CheckCheck size={14} />
                    </button>
                  )}
                  <button onClick={() => deleteMutation.mutate(n._id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
