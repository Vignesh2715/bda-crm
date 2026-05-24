import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FollowUp } from '../types';
import { formatDateTime, followUpStatusColors } from '../utils/helpers';
import FollowUpModal from '../components/followups/FollowUpModal';
import { Plus, Edit2, Trash2, CheckCircle, Loader2, Clock, AlertTriangle, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_TABS = ['All', 'Pending', 'Completed', 'Missed', 'Rescheduled'];

export default function FollowUpsPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editFollowUp, setEditFollowUp] = useState<FollowUp | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['followups', statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.set('status', statusFilter);
      const { data } = await api.get(`/followups?${params}`);
      return data.followups as FollowUp[];
    },
  });

  const { data: todayData } = useQuery({
    queryKey: ['followups-today'],
    queryFn: async () => { const { data } = await api.get('/followups/today'); return data.followups as FollowUp[]; },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/followups/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['followups'] }); toast.success('Follow-up deleted'); },
    onError: () => toast.error('Failed to delete'),
  });

  const markCompletedMutation = useMutation({
    mutationFn: (id: string) => api.put(`/followups/${id}`, { status: 'Completed' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['followups'] }); toast.success('Marked as completed'); },
  });

  const followups = data || [];
  const today = todayData || [];

  const overdue = followups.filter(f =>
    f.status === 'Pending' && new Date(f.scheduledDate) < new Date()
  );

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Follow-Ups</h1>
          <p className="text-sm text-slate-500">{followups.length} follow-ups</p>
        </div>
        <button onClick={() => { setEditFollowUp(null); setShowModal(true); }} className="btn-primary">
          <Plus size={16} /> Schedule Follow-Up
        </button>
      </div>

      {/* Summary widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
            <Calendar size={20} className="text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{today.length}</p>
            <p className="text-xs text-slate-500">Today's Follow-Ups</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center">
            <Clock size={20} className="text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {followups.filter(f => f.status === 'Pending').length}
            </p>
            <p className="text-xs text-slate-500">Pending</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">{overdue.length}</p>
            <p className="text-xs text-slate-500">Overdue</p>
          </div>
        </div>
      </div>

      {/* Today's Follow-Ups banner */}
      {today.length > 0 && (
        <div className="card p-4 border-l-4 border-l-blue-500">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
            <Calendar size={16} className="text-blue-500" /> Today's Schedule
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {today.map(f => (
              <div key={f._id} className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{f.purpose}</p>
                  <Link to={`/leads/${(f.leadId as any)?._id}`} className="text-xs text-blue-600 hover:underline">
                    {(f.leadId as any)?.companyName}
                  </Link>
                  <p className="text-xs text-slate-400">{(f.leadId as any)?.phone}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map(tab => (
          <button key={tab} onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              statusFilter === tab
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary-300'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Follow-ups list */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-40"><Loader2 size={28} className="animate-spin text-primary-500" /></div>
        ) : followups.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Clock size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No follow-ups found</p>
            <button onClick={() => setShowModal(true)} className="btn-primary mt-4 mx-auto">
              <Plus size={16} /> Schedule one
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {followups.map(f => {
              const isOverdue = f.status === 'Pending' && new Date(f.scheduledDate) < new Date();
              return (
                <div key={f._id} className={`flex items-start gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isOverdue ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                  <div className="shrink-0 mt-0.5">
                    {f.status === 'Completed' ? (
                      <CheckCircle size={20} className="text-green-500" />
                    ) : isOverdue ? (
                      <AlertTriangle size={20} className="text-red-500" />
                    ) : (
                      <Clock size={20} className="text-amber-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{f.purpose}</p>
                        <Link to={`/leads/${(f.leadId as any)?._id}`} className="text-xs text-primary-600 hover:underline">
                          {(f.leadId as any)?.companyName} — {(f.leadId as any)?.contactPerson}
                        </Link>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`badge ${followUpStatusColors[f.status]}`}>{f.status}</span>
                        {isOverdue && <span className="badge bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">Overdue</span>}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{formatDateTime(f.scheduledDate)}</p>
                    {f.remarks && <p className="text-xs text-slate-400 mt-1 italic">{f.remarks}</p>}
                    {f.outcome && <p className="text-xs text-green-600 dark:text-green-400 mt-1">Outcome: {f.outcome}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {f.status === 'Pending' && (
                      <button onClick={() => markCompletedMutation.mutate(f._id)}
                        className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all" title="Mark Complete">
                        <CheckCircle size={15} />
                      </button>
                    )}
                    <button onClick={() => { setEditFollowUp(f); setShowModal(true); }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => { if (confirm('Delete this follow-up?')) deleteMutation.mutate(f._id); }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <FollowUpModal
          followup={editFollowUp || undefined}
          onClose={() => { setShowModal(false); setEditFollowUp(null); }}
          onSuccess={() => { setShowModal(false); setEditFollowUp(null); qc.invalidateQueries({ queryKey: ['followups'] }); qc.invalidateQueries({ queryKey: ['followups-today'] }); }}
        />
      )}
    </div>
  );
}
