import { LeadStatus, LeadSource } from '../types';

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export const formatDateTime = (date: string | Date) =>
  new Date(date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const timeAgo = (date: string | Date) => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const intervals = [
    [31536000, 'year'], [2592000, 'month'], [86400, 'day'],
    [3600, 'hour'], [60, 'minute'],
  ] as [number, string][];
  for (const [secs, label] of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`;
  }
  return 'just now';
};

export const statusColors: Record<LeadStatus, string> = {
  'New': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  'Contacted': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'Qualified': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  'Proposal Sent': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  'Negotiation': 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  'Won': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  'Lost': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

export const priorityColors = {
  Low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  High: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

export const followUpStatusColors = {
  Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Completed: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Missed: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  Rescheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
};

export const taskStatusColors = {
  Pending: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Completed: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
};

export const activityIcons: Record<string, string> = {
  'Phone Call': '📞',
  'Email': '✉️',
  'Meeting': '🤝',
  'Product Demo': '💻',
  'Proposal Sent': '📄',
  'Follow-Up': '🔔',
  'Note': '📝',
  'Status Change': '🔄',
};

export const LEAD_STATUSES: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];
export const LEAD_SOURCES: LeadSource[] = ['Website', 'LinkedIn', 'Referral', 'Trade Show', 'Cold Calling', 'Email Campaign', 'Social Media', 'Other'];
export const ACTIVITY_TYPES = ['Phone Call', 'Email', 'Meeting', 'Product Demo', 'Proposal Sent', 'Follow-Up', 'Note'];
export const TASK_TYPES = ['Call Client', 'Schedule Demo', 'Send Quotation', 'Follow-Up', 'Documentation', 'Other'];
export const INDUSTRIES = ['Manufacturing', 'Technology', 'Healthcare', 'Finance', 'Retail', 'Education', 'Construction', 'Automotive', 'Pharma', 'FMCG', 'Other'];
