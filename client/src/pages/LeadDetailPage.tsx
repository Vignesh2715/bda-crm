import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Lead, Activity, FollowUp, AIInsights } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  formatCurrency, formatDate, formatDateTime, timeAgo,
  statusColors, activityIcons, ACTIVITY_TYPES
} from '../utils/helpers';
import LeadModal from '../components/leads/LeadModal';
import FollowUpModal from '../components/followups/FollowUpModal';
import {
  ArrowLeft, Edit2, Phone, Mail, Globe, MapPin, Building2,
  Plus, Trash2, Loader2, Sparkles, TrendingUp, AlertCircle,
  CheckCircle, Clock, Star, Target, Zap, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [activityForm, setActivityForm] = useState({ activityType: 'Phone Call', description: '', outcome: '' });
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const { data: leadData, isLoading } = useQuery({
    queryKey: ['lead', id],
    queryFn: async () => { const { data } = await api.get(`/leads/${id}`); return data.lead as Lead; },
  });

  const { data: activitiesData, refetch: refetchActivities } = useQuery({
    queryKey: ['activities', id],
    queryFn: async () => { const { data } = await api.get(`/activities?leadId=${id}`); return data.activities as Activity[]; },
  });

  const { data: followupsData } = useQuery({
    queryKey: ['followups', id],
    queryFn: async () => { const { data } = await api.get(`/followups?leadId=${id}`); return data.followups as FollowUp[]; },
  });

  const addActivityMutation = useMutation({
    mutationFn: (payload: any) => api.post('/activities', { ...payload, leadId: id }),
    onSuccess: () => {
      toast.success('Activity added');
      setActivityForm({ activityType: 'Phone Call', description: '', outcome: '' });
      setShowActivityForm(false);
      refetchActivities();
    },
    onError: () => toast.error('Failed to add activity'),
  });

  const deleteActivityMutation = useMutation({
    mutationFn: (actId: string) => api.delete(`/activities/${actId}`),
    onSuccess: () => { toast.success('Activity deleted'); refetchActivities(); },
  });

  const generateAI = async () => {
    setAiLoading(true);
    try {
      const { data } = await api.post(`/ai/insights/${id}`);
      setAiInsights(data.insights);
      qc.invalidateQueries({ queryKey: ['lead', id] });
      toast.success('AI insights generated!');
    } catch {
      toast.error('Failed to generate AI insights');
    } finally {
      setAiLoading(false);
    }
  };

  const lead = leadData;

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={32} className="animate-spin text-primary-500" />
    </div>
  );

  if (!lead) return (
    <div className="text-center py-20">
      <p className="text-slate-400">Lead not found</p>
      <Link to="/leads" className="btn-primary mt-4 inline-flex">Back to Leads</Link>
    </div>
  );

  const scoreColor = (score: number) =>
    score >= 75 ? 'text-green-500' : score >= 50 ? 'text-amber-500' : 'text-red-500';

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/leads')} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-all">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{lead.companyName}</h1>
            <p className="text-sm text-slate-500">{lead.contactPerson} · Added {formatDate(lead.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`badge text-sm px-3 py-1 ${statusColors[lead.status]}`}>{lead.status}</span>
          <button onClick={() => setShowEditModal(true)} className="btn-secondary">
            <Edit2 size={15} /> Edit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lead info */}
          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Lead Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: Mail, label: 'Email', value: lead.email },
                { icon: Phone, label: 'Phone', value: lead.phone },
                { icon: Building2, label: 'Industry', value: lead.industry || '—' },
                { icon: Target, label: 'Source', value: lead.source },
                { icon: Globe, label: 'Website', value: lead.website || '—' },
                { icon: MapPin, label: 'Address', value: lead.address || '—' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                    <Icon size={15} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">{value}</p>
                  </div>
                </div>
              ))}
            </div>
            {lead.notes && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">Notes</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{lead.notes}</p>
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">Communication Timeline</h3>
              <button onClick={() => setShowActivityForm(!showActivityForm)} className="btn-secondary text-sm py-1.5">
                <Plus size={14} /> Add Activity
              </button>
            </div>

            {showActivityForm && (
              <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label text-xs">Activity Type</label>
                    <select className="input text-sm" value={activityForm.activityType}
                      onChange={e => setActivityForm(f => ({ ...f, activityType: e.target.value }))}>
                      {ACTIVITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label text-xs">Outcome</label>
                    <input className="input text-sm" placeholder="Brief outcome..." value={activityForm.outcome}
                      onChange={e => setActivityForm(f => ({ ...f, outcome: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="label text-xs">Description *</label>
                  <textarea className="input text-sm min-h-[70px] resize-none" placeholder="Describe the activity..."
                    value={activityForm.description}
                    onChange={e => setActivityForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowActivityForm(false)} className="btn-secondary py-1.5 text-sm">Cancel</button>
                  <button onClick={() => addActivityMutation.mutate(activityForm)}
                    disabled={!activityForm.description || addActivityMutation.isPending} className="btn-primary py-1.5 text-sm">
                    {addActivityMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    Add
                  </button>
                </div>
              </div>
            )}

            {(activitiesData?.length ?? 0) === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                <Clock size={32} className="mx-auto mb-2 opacity-40" />
                No activities yet. Start by adding a call or note.
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />
                <div className="space-y-4">
                  {activitiesData!.map((act) => (
                    <div key={act._id} className="flex gap-4 pl-10 relative">
                      <div className="absolute left-0 w-8 h-8 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-sm">
                        {activityIcons[act.activityType] || '📌'}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-sm font-medium text-slate-900 dark:text-white">{act.activityType}</span>
                            <span className="text-xs text-slate-400 ml-2">{timeAgo(act.createdAt)}</span>
                          </div>
                          <button onClick={() => deleteActivityMutation.mutate(act._id)}
                            className="p-1 text-slate-300 hover:text-red-500 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{act.description}</p>
                        {act.outcome && <p className="text-xs text-slate-400 mt-1 italic">Outcome: {act.outcome}</p>}
                        <p className="text-xs text-slate-400 mt-1">by {act.performedBy?.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Deal Value */}
          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Deal Summary</h3>
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {formatCurrency(lead.estimatedDealValue)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Estimated Deal Value</p>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-400">Assigned to</p>
              {lead.assignedTo ? (
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-7 h-7 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full flex items-center justify-center text-xs font-bold">
                    {lead.assignedTo.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{lead.assignedTo.name}</p>
                    <p className="text-xs text-slate-400">{lead.assignedTo.email}</p>
                  </div>
                </div>
              ) : <p className="text-sm text-slate-400">Unassigned</p>}
            </div>
          </div>

          {/* Follow-ups */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900 dark:text-white">Follow-Ups</h3>
              <button onClick={() => setShowFollowUpModal(true)} className="p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all">
                <Plus size={16} />
              </button>
            </div>
            {(followupsData?.length ?? 0) === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No follow-ups scheduled</p>
            ) : (
              <div className="space-y-2">
                {followupsData!.slice(0, 4).map(f => (
                  <div key={f._id} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      f.status === 'Completed' ? 'bg-green-400' :
                      f.status === 'Missed' ? 'bg-red-400' : 'bg-amber-400'
                    }`} />
                    <div>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-200">{f.purpose}</p>
                      <p className="text-xs text-slate-400">{formatDate(f.scheduledDate)} · {f.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Insights */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles size={16} className="text-purple-500" /> AI Insights
              </h3>
              <button onClick={generateAI} disabled={aiLoading}
                className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50">
                {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                {aiLoading ? 'Analyzing...' : 'Generate'}
              </button>
            </div>

            {(aiInsights || (lead.aiInsights && lead.aiInsights !== '')) ? (() => {
              const insights: AIInsights = aiInsights || JSON.parse(lead.aiInsights || '{}');
              return (
                <div className="space-y-3">
                  {/* Score */}
                  <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <div>
                      <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Lead Score</p>
                      <p className={`text-3xl font-bold ${scoreColor(insights.leadScore)}`}>{insights.leadScore}<span className="text-sm font-normal text-slate-400">/100</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Priority</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{insights.priority}</p>
                      <p className="text-xs text-slate-400 mt-1">Conv. Probability</p>
                      <p className="text-sm font-semibold text-green-600">{insights.conversionProbability}%</p>
                    </div>
                  </div>

                  {insights.summary && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{insights.summary}</p>
                  )}

                  {insights.nextBestAction && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                      <p className="text-xs font-semibold text-green-700 dark:text-green-400 flex items-center gap-1 mb-1">
                        <CheckCircle size={12} /> Next Best Action
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">{insights.nextBestAction}</p>
                    </div>
                  )}

                  {insights.strengths?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1"><Star size={11} /> Strengths</p>
                      <ul className="space-y-1">
                        {insights.strengths.map((s, i) => (
                          <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                            <span className="text-green-500 mt-0.5">✓</span>{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {insights.risks?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1"><AlertCircle size={11} /> Risks</p>
                      <ul className="space-y-1">
                        {insights.risks.map((r, i) => (
                          <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                            <span className="text-red-400 mt-0.5">!</span>{r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {lead.aiLastGeneratedAt && (
                    <p className="text-xs text-slate-400">Generated {timeAgo(lead.aiLastGeneratedAt)}</p>
                  )}
                </div>
              );
            })() : (
              <div className="text-center py-6 text-slate-400">
                <Sparkles size={28} className="mx-auto mb-2 opacity-40" />
                <p className="text-xs">Click Generate to get AI-powered insights for this lead</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showEditModal && (
        <LeadModal lead={lead} onClose={() => setShowEditModal(false)}
          onSuccess={() => { setShowEditModal(false); qc.invalidateQueries({ queryKey: ['lead', id] }); }} />
      )}
      {showFollowUpModal && (
        <FollowUpModal leadId={id!} onClose={() => setShowFollowUpModal(false)}
          onSuccess={() => { setShowFollowUpModal(false); qc.invalidateQueries({ queryKey: ['followups', id] }); }} />
      )}
    </div>
  );
}
