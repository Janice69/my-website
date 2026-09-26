-- Run this once in Supabase SQL Editor.
create table if not exists public.about_content (
  id integer primary key default 1 check (id = 1),
  eyebrow text not null,
  headline text not null,
  body text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id text primary key,
  content_type text not null default 'project',
  title text not null,
  slug text unique not null,
  summary text not null,
  post_body text not null default '',
  status text not null default 'In development',
  status_tone text not null default 'purple',
  accent text not null default 'lavender',
  icon text not null default '✦',
  motivation text not null default '',
  built text not null default '',
  contribution text not null default '',
  tools text[] not null default '{}',
  learned text not null default '',
  demo text,
  github text,
  image_url text,
  video_url text,
  credit text,
  credit_url text,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects add column if not exists content_type text not null default 'project';
alter table public.projects add column if not exists post_body text not null default '';

alter table public.about_content enable row level security;
alter table public.projects enable row level security;

create policy "public can read about" on public.about_content for select using (true);
create policy "authenticated can edit about" on public.about_content for all to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "public can read published projects" on public.projects for select using (published = true or auth.uid() is not null);
create policy "authenticated can edit projects" on public.projects for all to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);

insert into public.about_content (id, eyebrow, headline, body) values (1, 'About Janice', 'Finding the “there has to be a better way” moment—and making something useful from it.', 'I studied logistics, but the work felt monotonous and I wasn’t sure what I wanted to do next. A book nudged me to pay attention to what I did well in everyday life. At the time, Excel was the skill people around me seemed to value—and I enjoyed using it.\n\nThat small clue led to dashboards, Power BI, VBA, process automation, and a growing curiosity about AI. Agentic AI and vibe coding gave me a way to turn ideas into working prototypes, even while I’m still improving my engineering foundations.\n\nThese days I’m exploring how analytics, automation, and AI can make everyday work better. I learn by building, documenting what I learn, and leaving each project a little clearer than I found it.') on conflict (id) do nothing;

insert into public.projects (id, title, slug, summary, status, status_tone, accent, icon, motivation, built, contribution, tools, learned, demo, github, credit, credit_url, published, sort_order) values
('human-bingo', 'Human Bingo', 'human-bingo', 'A phone-friendly team-building game that replaces paper cards with a little more fun.', 'Deployed', 'green', 'peach', '✦', 'I needed a human bingo activity for a team-building session and wanted to avoid printing, handing out, and keeping paper cards.', 'A mobile-first bingo app where people can find matching teammates, mark squares, and play together from their phones.', 'I shaped the interaction, built the prototype end to end, and iterated on the experience with the help of AI coding tools.', ARRAY['Vibe coding','Responsive web','Cloudflare Workers'], 'My first vibe-coding project taught me how quickly a clear, small problem can become a useful working prototype—and where I still need to slow down and understand the underlying code.', 'https://janice69-human-bingo.cslj87.workers.dev/', 'https://github.com/Janice69/Janice69-human-bingo', null, null, true, 1),
('pingly', 'Pingly', 'pingly', 'A playful polling and appreciation app with music, custom avatars, and a gratitude board.', 'In development', 'purple', 'lavender', '♫', 'I wanted to create my own polling experience, add music, and go beyond the question limits I had run into elsewhere.', 'A redesigned polling experience with custom avatars, an original penguin mascot called Pingly, music generated with Suno, and a gratitude board with uploads.', 'I redesigned the experience, created the visual direction and custom assets, extended the existing app, and guided AI coding tools through the changes.', ARRAY['React','Supabase','Suno','GitHub'], 'Pingly taught me what it feels like to build on an existing codebase: understanding its database and architecture, making focused GitHub commits, and asking AI tools to work with the system that is already there. I built on the open-source project below rather than creating the original platform from scratch.', 'https://pinglyquiz-vercel.vercel.app/', 'https://github.com/Janice69/pinglyquiz', 'Lawndlwd/quizz', 'https://github.com/Lawndlwd/quizz', true, 2)
on conflict (id) do nothing;

-- Image uploads used by the admin editor.
insert into storage.buckets (id, name, public)
values ('project-media', 'project-media', true)
on conflict (id) do nothing;

create policy "public can read project media" on storage.objects
for select using (bucket_id = 'project-media');

create policy "authenticated can upload project media" on storage.objects
for insert to authenticated with check (bucket_id = 'project-media');

create policy "authenticated can update project media" on storage.objects
for update to authenticated using (bucket_id = 'project-media') with check (bucket_id = 'project-media');
