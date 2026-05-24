import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  DndContext, DragEndEvent, DragOverEvent, DragStartEvent,
  closestCorners, DragOverlay, useSensor, useSensors, PointerSensor
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../services/api';
import { Lead, LeadStatus, PipelineData } from '../types';
import { formatCurrency, statusColors } from '../utils/helpers';
import { Loader2, Eye, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

const COLUMNS: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];

const columnColors: Record<LeadStatus, string> = {
  'New': 'border-t-slate-400',
  'Contacted': 'border-t-blue-400',
  'Qualified': 'border-t-indigo-400',
  'Proposal Sent': 'border-t-purple-400',
  'Negotiation': 'border-t-orange-400',
  'Won': 'border-t-green-400',
  'Lost': 'border-t-red-400',
};

function KanbanCard({ lead }: { lead: Lead }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead._id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      className="kanban-card bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 cursor-grab active:cursor-grabbing select-none">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{lead.companyName}</p>
          <p className="text-xs text-slate-500 truncate">{lead.contactPerson}</p>
        </div>
        <Link to={`/leads/${lead._id}`} onClick={e => e.stopPropagation()}
          className="ml-2 p-1 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-all shrink-0">
          <Eye size={13} />
        </Link>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300 font-mono">
          {formatCurrency(lead.estimatedDealValue)}
        </span>
        {lead.assignedTo && (
          <div className="w-5 h-5 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full flex items-center justify-center text-xs font-bold">
            {lead.assignedTo.name.charAt(0)}
          </div>
        )}
      </div>
      {lead.industry && (
        <div className="flex items-center gap-1 mt-1.5">
          <Building2 size={10} className="text-slate-400" />
          <span className="text-xs text-slate-400">{lead.industry}</span>
        </div>
      )}
    </div>
  );
}

function KanbanColumn({ status, leads }: { status: LeadStatus; leads: Lead[] }) {
  const totalValue = leads.reduce((s, l) => s + (l.estimatedDealValue || 0), 0);
  return (
    <div className={`card border-t-4 ${columnColors[status]} min-w-[250px] flex flex-col h-[calc(100vh-220px)]`}>
      <div className="p-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{status}</span>
            <span className="badge bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs">{leads.length}</span>
          </div>
        </div>
        {leads.length > 0 && (
          <p className="text-xs text-slate-400 mt-0.5">{formatCurrency(totalValue)}</p>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <SortableContext items={leads.map(l => l._id)} strategy={verticalListSortingStrategy}>
          {leads.map(lead => <KanbanCard key={lead._id} lead={lead} />)}
        </SortableContext>
        {leads.length === 0 && (
          <div className="text-center py-8 text-slate-300 dark:text-slate-600 text-xs">Drop leads here</div>
        )}
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const qc = useQueryClient();
  const [pipeline, setPipeline] = useState<PipelineData | null>(null);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  const { isLoading } = useQuery({
    queryKey: ['pipeline'],
    queryFn: async () => {
      const { data } = await api.get('/leads/pipeline');
      setPipeline(data.pipeline);
      return data.pipeline as PipelineData;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.put(`/leads/${id}`, { status }),
    onError: () => { toast.error('Failed to update status'); qc.invalidateQueries({ queryKey: ['pipeline'] }); },
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const findContainer = (id: string): LeadStatus | null => {
    if (!pipeline) return null;
    for (const col of COLUMNS) {
      if (pipeline[col].find(l => l._id === id)) return col;
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (!pipeline) return;
    const col = findContainer(String(event.active.id));
    if (col) setActiveLead(pipeline[col].find(l => l._id === event.active.id) || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveLead(null);
    if (!over || !pipeline) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const activeCol = findContainer(activeId);
    const overCol = COLUMNS.includes(overId as LeadStatus) ? overId as LeadStatus : findContainer(overId);

    if (!activeCol || !overCol || activeCol === overCol) return;

    const lead = pipeline[activeCol].find(l => l._id === activeId);
    if (!lead) return;

    setPipeline(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [activeCol]: prev[activeCol].filter(l => l._id !== activeId),
        [overCol]: [...prev[overCol], { ...lead, status: overCol }],
      };
    });

    updateStatusMutation.mutate({ id: activeId, status: overCol });
    toast.success(`Moved to ${overCol}`);
  };

  const totalStats = pipeline ? COLUMNS.reduce((acc, col) => {
    acc.total += pipeline[col].length;
    acc.value += pipeline[col].reduce((s, l) => s + (l.estimatedDealValue || 0), 0);
    return acc;
  }, { total: 0, value: 0 }) : { total: 0, value: 0 };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={32} className="animate-spin text-primary-500" />
    </div>
  );

  return (
    <div className="animate-slide-up">
      <div className="page-header mb-4">
        <div>
          <h1 className="page-title">Sales Pipeline</h1>
          <p className="text-sm text-slate-500">{totalStats.total} leads · {formatCurrency(totalStats.value)} total value</p>
        </div>
        <p className="text-xs text-slate-400 hidden md:block">Drag cards to update status</p>
      </div>

      <div className="overflow-x-auto pb-4">
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
            {COLUMNS.map(col => (
              <KanbanColumn key={col} status={col} leads={pipeline?.[col] || []} />
            ))}
          </div>
          <DragOverlay>
            {activeLead && (
              <div className="kanban-card dragging bg-white dark:bg-slate-800 rounded-xl border-2 border-primary-400 p-3 shadow-2xl w-[240px]">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{activeLead.companyName}</p>
                <p className="text-xs text-slate-500">{activeLead.contactPerson}</p>
                <p className="text-xs font-medium text-primary-600 mt-1">{formatCurrency(activeLead.estimatedDealValue)}</p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
