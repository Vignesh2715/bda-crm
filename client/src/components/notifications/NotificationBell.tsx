import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Notification } from '../../types';
import { timeAgo } from '../../utils/helpers';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => { const { data } = await api.get('/notifications'); return data; },
    refetchInterval: 30000,
  });

  const markAllMutation = useMutation({
    mutationFn: () => api.put('/notifications/mark-all-read'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.put(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const notifications: Notification[] = data?.notifications || [];
  const unread: number = data?.unreadCount || 0;

  const typeIcon = (type: string) => {
    if (type === 'lead_assigned') return '🎯';
    if (type === 'task_assigned') return '✅';
    if (type === 'followup_reminder') return '📅';
    if (type === 'followup_overdue') return '⚠️';
    return '🔔';
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Notifications</h3>
              {unread > 0 && <span className="badge bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300">{unread} new</span>}
            </div>
            {unread > 0 && (
              <button onClick={() => markAllMutation.mutate()} className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
                <CheckCheck size={12} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800">
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                <Bell size={24} className="mx-auto mb-2 opacity-40" />
                No notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n._id} onClick={() => !n.isRead && markReadMutation.mutate(n._id)}
                  className={`flex gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${!n.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}>
                  <span className="text-lg shrink-0">{typeIcon(n.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${n.isRead ? 'text-slate-600 dark:text-slate-300' : 'text-slate-900 dark:text-white font-medium'}`}>{n.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{n.message}</p>
                    <p className="text-xs text-slate-300 dark:text-slate-500 mt-0.5">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && <div className="w-2 h-2 bg-primary-500 rounded-full shrink-0 mt-1.5" />}
                </div>
              ))
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2">
            <Link to="/notifications" onClick={() => setOpen(false)}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium">View all notifications →</Link>
          </div>
        </div>
      )}
    </div>
  );
}
