import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Lead } from '../../types';
import { X, UserCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props { lead: Lead; onClose: () => void; onSuccess: () => void; }

export default function AssignModal({ lead, onClose, onSuccess }: Props) {
  const [selectedBDA, setSelectedBDA] = useState((lead.assignedTo as any)?._id || '');

  const { data } = useQuery({
    queryKey: ['bdas'],
    queryFn: async () => { const { data } = await api.get('/users/bdas'); return data; }
  });

  const mutation = useMutation({
    mutationFn: () => api.put(`/leads/${lead._id}/assign`, { assignedTo: selectedBDA || null }),
    onSuccess: () => { toast.success('Lead assigned successfully'); onSuccess(); },
    onError: () => toast.error('Failed to assign lead'),
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Assign Lead</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-sm font-medium text-slate-900 dark:text-white">{lead.companyName}</p>
            <p className="text-xs text-slate-500">{lead.contactPerson} · {lead.status}</p>
          </div>
          <div>
            <label className="label">Assign to BDA</label>
            <select className="input" value={selectedBDA} onChange={e => setSelectedBDA(e.target.value)}>
              <option value="">Unassigned</option>
              {data?.users?.map((u: any) => <option key={u._id} value={u._id}>{u.name} — {u.email}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="btn-primary">
            {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={16} />}
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}
