import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../../services/api';
import { FollowUp } from '../../types';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  leadId?: string;
  followup?: FollowUp;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FollowUpModal({ leadId, followup, onClose, onSuccess }: Props) {
  const isEdit = !!followup;
  const [form, setForm] = useState({
    leadId: leadId || (followup?.leadId as any)?._id || '',
    scheduledDate: followup ? new Date(followup.scheduledDate).toISOString().slice(0, 16) : '',
    purpose: followup?.purpose || '',
    remarks: followup?.remarks || '',
    outcome: followup?.outcome || '',
    status: followup?.status || 'Pending',
  });

  const mutation = useMutation({
    mutationFn: (data: any) => isEdit ? api.put(`/followups/${followup!._id}`, data) : api.post('/followups', data),
    onSuccess: () => { toast.success(isEdit ? 'Follow-up updated' : 'Follow-up scheduled'); onSuccess(); },
    onError: () => toast.error('Failed to save follow-up'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {isEdit ? 'Edit Follow-Up' : 'Schedule Follow-Up'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Date & Time *</label>
            <input type="datetime-local" className="input" required
              value={form.scheduledDate} onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))} />
          </div>
          <div>
            <label className="label">Purpose *</label>
            <input className="input" required placeholder="e.g. Follow-up on proposal"
              value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} />
          </div>
          <div>
            <label className="label">Remarks</label>
            <textarea className="input min-h-[70px] resize-none" placeholder="Additional remarks..."
              value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} />
          </div>
          {isEdit && (
            <>
              <div>
                <label className="label">Status</label>
                <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  {['Pending', 'Completed', 'Missed', 'Rescheduled'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Outcome</label>
                <textarea className="input min-h-[60px] resize-none" placeholder="What was the outcome?"
                  value={form.outcome} onChange={e => setForm(f => ({ ...f, outcome: e.target.value }))} />
              </div>
            </>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary">
              {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : null}
              {isEdit ? 'Update' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
