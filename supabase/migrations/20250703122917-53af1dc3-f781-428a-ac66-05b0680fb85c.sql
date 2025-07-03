
-- Create projects table
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  website_url text not null,
  status text default 'pending',
  seo_score integer default 0,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Create seo_analysis table
create table public.seo_analysis (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects not null,
  analysis_data jsonb not null,
  issues_found integer default 0,
  recommendations jsonb not null,
  created_at timestamp default now()
);

-- Enable Row Level Security
alter table public.projects enable row level security;
alter table public.seo_analysis enable row level security;

-- Create RLS policies for projects table
create policy "Users can view their own projects" 
  on public.projects 
  for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own projects" 
  on public.projects 
  for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own projects" 
  on public.projects 
  for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own projects" 
  on public.projects 
  for delete 
  using (auth.uid() = user_id);

-- Create RLS policies for seo_analysis table
create policy "Users can view analysis for their projects" 
  on public.seo_analysis 
  for select 
  using (
    exists (
      select 1 from public.projects 
      where projects.id = seo_analysis.project_id 
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can insert analysis for their projects" 
  on public.seo_analysis 
  for insert 
  with check (
    exists (
      select 1 from public.projects 
      where projects.id = seo_analysis.project_id 
      and projects.user_id = auth.uid()
    )
  );

-- Enable real-time subscriptions
alter table public.projects replica identity full;
alter table public.seo_analysis replica identity full;

-- Add tables to realtime publication
alter publication supabase_realtime add table public.projects;
alter publication supabase_realtime add table public.seo_analysis;

-- Create indexes for better performance
create index projects_user_id_idx on public.projects(user_id);
create index seo_analysis_project_id_idx on public.seo_analysis(project_id);

-- Add trigger to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.handle_updated_at();
