export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'bda';
  avatar: string;
  phone: string;
  department: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface Lead {
  _id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  industry: string;
  source: LeadSource;
  estimatedDealValue: number;
  status: LeadStatus;
  assignedTo: User | null;
  notes: string;
  tags: string[];
  address: string;
  website: string;
  aiScore: number | null;
  aiInsights: string;
  aiLastGeneratedAt: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Negotiation' | 'Won' | 'Lost';
export type LeadSource = 'Website' | 'LinkedIn' | 'Referral' | 'Trade Show' | 'Cold Calling' | 'Email Campaign' | 'Social Media' | 'Other';

export interface Activity {
  _id: string;
  leadId: string;
  activityType: ActivityType;
  description: string;
  outcome: string;
  performedBy: User;
  scheduledAt: string | null;
  duration: number | null;
  createdAt: string;
}

export type ActivityType = 'Phone Call' | 'Email' | 'Meeting' | 'Product Demo' | 'Proposal Sent' | 'Follow-Up' | 'Note' | 'Status Change';

export interface FollowUp {
  _id: string;
  leadId: Lead;
  scheduledDate: string;
  purpose: string;
  remarks: string;
  outcome: string;
  status: 'Pending' | 'Completed' | 'Missed' | 'Rescheduled';
  createdBy: User;
  completedAt: string | null;
  createdAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  taskType: string;
  assignedTo: User;
  assignedBy: User;
  leadId: Lead | null;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Completed';
  completedAt: string | null;
  notes: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  relatedId: string | null;
  relatedModel: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalLeads: number;
  activeLeads: number;
  wonLeads: number;
  lostLeads: number;
  revenue: number;
  conversionRate: number;
  totalBDAs: number;
  todayFollowUps: number;
  overdueFollowUps: number;
  pendingTasks: number;
}

export interface AIInsights {
  leadScore: number;
  priority: string;
  conversionProbability: number;
  summary: string;
  strengths: string[];
  risks: string[];
  nextBestAction: string;
  followUpRecommendation: string;
  talkingPoints: string[];
}

export interface PipelineData {
  'New': Lead[];
  'Contacted': Lead[];
  'Qualified': Lead[];
  'Proposal Sent': Lead[];
  'Negotiation': Lead[];
  'Won': Lead[];
  'Lost': Lead[];
}
