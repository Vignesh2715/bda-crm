import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Lead } from '../../types';
import { LEAD_STATUSES, LEAD_SOURCES, INDUSTRIES } from '../../utils/helpers';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  lead: Lead | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LeadModal({ lead, onClose, onSuccess }: Props) {
  const isEdit = !!lead;
  const [form, setForm] = useState({
    companyName: '', contactPerson: '', email: '', phone: '',
    industry: '', source: 'Website', estimatedDealValue: '', status: 'New',
    notes: '', website: '', address: '', assignedTo: '',
  });

  const { data: usersData } = useQuery({
    queryKey: ['bdas'],
    queryFn: async () => { const { data } = await api.get('/users/bdas'); return data; }
  });

  useEffect(() => {
    if (lead) {
      setForm({
        companyName: lead.companyName, contactPerson: lead.contactPerson,
        email: lead.email, phone: lead.phone, industry: lead.industry,
        source: lead.source, estimatedDealValue: String(lead.estimatedDealValue),
        status: lead.status, notes: lead.notes, website: lead.website,
        address: lead.address, assignedTo: (lead.assignedTo as any)?._id || '',
      });
    }
  }, [lead]);

  const mutation = useMutation({
    mutationFn: (payload: any) => isEdit ? api.put(`/leads/${lead!._id}`, payload) : api.post('/leads', payload),
    onSuccess: () => { toast.success(isEdit ? 'Lead updated' : 'Lead created'); onSuccess(); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to save lead'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ ...form, estimatedDealValue: Number(form.estimatedDealValue) || 0 });
  };

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{isEdit ? 'Edit Lead' : 'Add New Lead'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Company Name *</label>
              <input className="input" required value={form.companyName} onChange={e => set('companyName', e.target.value)} placeholder="Acme Corp" />
            </div>
            <div>
              <label className="label">Contact Person *</label>
              <input className="input" required value={form.contactPerson} onChange={e => set('contactPerson', e.target.value)} placeholder="John Doe" />
            </div>
            <div>
              <label className="label">Email *</label>
              <input className="input" type="email" required value={form.email} onChange={e => set('email', e.target.value)} placeholder="john@acme.com" />
            </div>
            <div>
              <label className="label">Phone *</label>
              <input className="input" required value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="label">Industry</label>
              <select className="input" value={form.industry} onChange={e => set('industry', e.target.value)}>
                <option value="">Select Industry</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Source</label>
              <select className="input" value={form.source} onChange={e => set('source', e.target.value)}>
                {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Estimated Deal Value (₹)</label>
              <input className="input" type="number" min="0" value={form.estimatedDealValue} onChange={e => set('estimatedDealValue', e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Website</label>
              <input className="input" value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://example.com" />
            </div>
            <div>
              <label className="label">Assign To</label>
              <select className="input" value={form.assignedTo} onChange={e => set('assignedTo', e.target.value)}>
                <option value="">Unassigned</option>
                {usersData?.users?.map((u: any) => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Address</label>
              <input className="input" value={form.address} onChange={e => set('address', e.target.value)} placeholder="City, State, Country" />
            </div>
            <div className="md:col-span-2">
              <label className="label">Notes</label>
              <textarea className="input min-h-[80px] resize-none" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Add any relevant notes..." />
            </div>
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary">
              {mutation.isPending ? <><Loader2 size={16} className="animate-spin" />Saving...</> : isEdit ? 'Update Lead' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
