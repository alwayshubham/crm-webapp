-- Supabase CRM Database Schema

-- Users table
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  role text not null check (role in ('admin', 'sales_rep')),
  created_at timestamp with time zone default now()
);

-- Pipeline stages
create table if not exists pipeline_stages (
  id serial primary key,
  name text not null,
  order_num int not null,
  created_at timestamp with time zone default now()
);

-- Leads table
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  company text,
  location text,
  source text,
  status text not null check (status in ('New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost')),
  assigned_rep uuid references users(id),
  expected_value numeric,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  pipeline_stage_id int references pipeline_stages(id)
);

-- Lead tags
create table if not exists lead_tags (
  id serial primary key,
  lead_id uuid references leads(id) on delete cascade,
  tag text not null
);

-- Lead activities
create table if not exists lead_activities (
  id serial primary key,
  lead_id uuid references leads(id) on delete cascade,
  user_id uuid references users(id),
  type text not null check (type in ('Call', 'Email', 'WhatsApp', 'Meeting')),
  note text,
  created_at timestamp with time zone default now()
);

-- Lead followups
create table if not exists lead_followups (
  id serial primary key,
  lead_id uuid references leads(id) on delete cascade,
  user_id uuid references users(id),
  followup_at timestamp with time zone not null,
  completed boolean default false,
  created_at timestamp with time zone default now()
);

-- Email templates
create table if not exists email_templates (
  id serial primary key,
  name text not null,
  subject text not null,
  body text not null,
  created_by uuid references users(id),
  created_at timestamp with time zone default now()
);

-- Email logs
create table if not exists email_logs (
  id serial primary key,
  lead_id uuid references leads(id) on delete cascade,
  user_id uuid references users(id),
  template_id int references email_templates(id),
  sent_at timestamp with time zone default now(),
  status text
);

-- Files (optional)
create table if not exists files (
  id serial primary key,
  lead_id uuid references leads(id) on delete cascade,
  file_url text not null,
  uploaded_by uuid references users(id),
  uploaded_at timestamp with time zone default now()
);
