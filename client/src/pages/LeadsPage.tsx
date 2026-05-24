import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Lead, LeadStatus, LeadSource } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, statusColors, LEAD_STATUSES, LEAD_SOURCES } from '../utils/helpers';
import LeadModal from '../components/leads/LeadModal';
import AssignModal from '../components/leads/AssignModal';
import { Plus, Search, Filter, Eye, Edit2, UserCheck, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LeadsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', source: '', assignedTo: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [assignLead, setAssignLead] = useState<Lead | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['leads', page, search, filters],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '15', ...filters });
      if (search) params.set('search', search);
      const { data } = await api.get(`/leads?${params}`);
      return data;
    },
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/leads/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['leads'] }); toast.success('Lead archived'); },
    onError: () => toast.error('Failed to delete lead'),
  });

  const leads: Lead[] = data?.leads || [];
  const totalPages: number = data?.pages || 1;

  const handleDelete = (lead: Lead) => {
    if (confirm(`Archive lead "${lead.companyName}"?`)) deleteMutation.mutate(lead._id);
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Leads</h1>
          <p className="text-sm text-slate-500">{data?.total ?? 0} total leads</p>
        </div>
        <button onClick={() => { setEditLead(null); setShowModal(true); }} className="btn-primary">
          <Plus size={16} /> Add Lead
        </button>
      </div>

      {/* Search & Filters */}
      <div className="card p-4">
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search leads..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="input pl-9" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary">
            <Filter size={16} /> Filters
            {(filters.status || filters.source) && <span className="w-2 h-2 bg-primary-500 rounded-full ml-1" />}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <select value={filters.status} onChange={e => { setFilters({ ...filters, status: e.target.value }); setPage(1); }} className="input">
              <option value="">All Statuses</option>
              {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filters.source} onChange={e => { setFilters({ ...filters, source: e.target.value }); setPage(1); }} className="input">
              <option value="">All Sources</option>
              {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={() => { setFilters({ status: '', source: '', assignedTo: '' }); setPage(1); }}
              className="btn-secondary text-sm">Clear Filters</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 size={28} className="animate-spin text-primary-500" />
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400 text-sm">No leads found</p>
            <button onClick={() => setShowModal(true)} className="btn-primary mt-4 mx-auto">
              <Plus size={16} /> Add your first lead
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Contact</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Source</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Value</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Assigned</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden xl:table-cell">Created</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{lead.companyName}</p>
                        <p className="text-xs text-slate-500">{lead.industry}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div>
                        <p className="text-slate-700 dark:text-slate-200">{lead.contactPerson}</p>
                        <p className="text-xs text-slate-500">{lead.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-slate-600 dark:text-slate-300">{lead.source}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${statusColors[lead.status as LeadStatus]}`}>{lead.status}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-slate-700 dark:text-slate-200 font-mono text-xs">
                      {formatCurrency(lead.estimatedDealValue)}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {lead.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full flex items-center justify-center text-xs font-bold">
                            {lead.assignedTo.name.charAt(0)}
                          </div>
                          <span className="text-sm text-slate-600 dark:text-slate-300">{lead.assignedTo.name}</span>
                        </div>
                      ) : <span className="text-slate-400 text-xs">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell text-xs text-slate-500">{formatDate(lead.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link to={`/leads/${lead._id}`} className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all">
                          <Eye size={15} />
                        </Link>
                        <button onClick={() => { setEditLead(lead); setShowModal(true); }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all">
                          <Edit2 size={15} />
                        </button>
                        {(user?.role === 'admin' || user?.role === 'manager') && (
                          <>
                            <button onClick={() => setAssignLead(lead)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all">
                              <UserCheck size={15} />
                            </button>
                            <button onClick={() => handleDelete(lead)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary py-1 px-3 disabled:opacity-40">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary py-1 px-3 disabled:opacity-40">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <LeadModal lead={editLead} onClose={() => { setShowModal(false); setEditLead(null); }}
          onSuccess={() => { setShowModal(false); setEditLead(null); qc.invalidateQueries({ queryKey: ['leads'] }); }} />
      )}
      {assignLead && (
        <AssignModal lead={assignLead} onClose={() => setAssignLead(null)}
          onSuccess={() => { setAssignLead(null); qc.invalidateQueries({ queryKey: ['leads'] }); }} />
      )}
    </div>
  );
}
