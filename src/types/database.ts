export type UserRole = 'admin' | 'sales_rep';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface PipelineStage {
  id: number;
  name: string;
  order_num: number;
  created_at: string;
}

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';

export interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  location: string | null;
  source: string | null;
  status: LeadStatus;
  assigned_rep: string | null;
  expected_value: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  pipeline_stage_id: number | null;
  ai_score?: number;
  ai_score_reason?: string;
}

export interface LeadActivity {
  id: number;
  lead_id: string;
  user_id: string;
  type: 'Call' | 'Email' | 'WhatsApp' | 'Meeting';
  note: string | null;
  created_at: string;
}

export interface LeadFollowup {
  id: number;
  lead_id: string;
  user_id: string;
  followup_at: string;
  completed: boolean;
  created_at: string;
}

export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  created_by: string;
  created_at: string;
}

export interface EmailLog {
  id: number;
  lead_id: string;
  user_id: string;
  template_id: number;
  sent_at: string;
  status: string | null;
}
