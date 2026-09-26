import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import './admin.css';

const LINKEDIN = 'https://www.linkedin.com/in/janice-chew-38b26b116/';
const COVER_CHOICES = [
  { label: 'Analytics still life', url: '/covers/analytics-still-life.png' },
  { label: 'Automation system', url: '/covers/automation-system.png' },
  { label: 'Learning with AI', url: '/covers/learning-ai.png' }
];

const seedAbout = {
  eyebrow: 'Analytics • Automation • AI',
  headline: 'Hi, I’m Janice',
  body: `I studied logistics, but the work felt monotonous and I wasn’t sure what I wanted to do next. A book nudged me to pay attention to what I did well in everyday life. At the time, Excel was the skill people around me seemed to value—and I enjoyed using it.\n\nThat small clue led to dashboards, Power BI, VBA, process automation, and a growing curiosity about AI. Agentic AI and vibe coding gave me a way to turn ideas into working prototypes, even while I’m still improving my engineering foundations.\n\nThese days I’m exploring how analytics, automation, and AI can make everyday work better. I learn by building, documenting what I learn, and leaving each project a little clearer than I found it.`
};

const seedProjects = [
  {
    id: 'human-bingo', title: 'Human Bingo', slug: 'human-bingo', content_type: 'project', post_body: '', image_url: '/covers/analytics-still-life.png', summary: 'A phone-friendly team-building game that replaces paper cards with a little more fun.',
    status: 'Deployed', statusTone: 'green', accent: 'peach', icon: '✦', motivation: 'I needed a human bingo activity for a team-building session and wanted to avoid printing, handing out, and keeping paper cards.',
    built: 'A mobile-first bingo app where people can find matching teammates, mark squares, and play together from their phones.', contribution: 'I shaped the interaction, built the prototype end to end, and iterated on the experience with the help of AI coding tools.', tools: ['Vibe coding', 'Responsive web', 'Cloudflare Workers'],
    learned: 'My first vibe-coding project taught me how quickly a clear, small problem can become a useful working prototype—and where I still need to slow down and understand the underlying code.', demo: 'https://janice69-human-bingo.cslj87.workers.dev/', github: 'https://github.com/Janice69/Janice69-human-bingo'
  },
  {
    id: 'pingly', title: 'Pingly', slug: 'pingly', content_type: 'project', post_body: '', image_url: '/covers/automation-system.png', summary: 'A playful polling and appreciation app with music, custom avatars, and a gratitude board.',
    status: 'In development', statusTone: 'purple', accent: 'lavender', icon: '♫', motivation: 'I wanted to create my own polling experience, add music, and go beyond the question limits I had run into elsewhere.',
    built: 'A redesigned polling experience with custom avatars, an original penguin mascot called Pingly, music generated with Suno, and a gratitude board with uploads.', contribution: 'I redesigned the experience, created the visual direction and custom assets, extended the existing app, and guided AI coding tools through the changes.', tools: ['React', 'Supabase', 'Suno', 'GitHub'],
    learned: 'Pingly taught me what it feels like to build on an existing codebase: understanding its database and architecture, making focused GitHub commits, and asking AI tools to work with the system that is already there. I built on the open-source project below rather than creating the original platform from scratch.', demo: 'https://pinglyquiz-vercel.vercel.app/', github: 'https://github.com/Janice69/pinglyquiz', credit: 'Original project: Lawndlwd/quizz', creditUrl: 'https://github.com/Lawndlwd/quizz'
  }
];

function Icon({ name }) {
  const paths = { arrow: <><path d="M5 12h13"/><path d="m13 6 6 6-6 6"/></>, external: <><path d="M14 5h5v5"/><path d="M10 14 19 5"/><path d="M19 14v5H5V5h5"/></>, lock: <><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>, feather: <><path d="M20 4C10 4 5 9 5 17c0 2 1 3 3 3 8 0 13-5 12-16Z"/><path d="M4 20 16 8"/></> };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [hash, setHash] = useState(window.location.hash.replace('#', ''));
  const [about, setAbout] = useState(seedAbout);
  const [projects, setProjects] = useState(seedProjects);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handle = () => { setPath(window.location.pathname); setHash(window.location.hash.replace('#', '')); };
    window.addEventListener('popstate', handle);
    fetch('/api/session').then((response) => response.ok ? response.json() : null).then((session) => setUser(session?.user ?? null)).catch(() => setUser(null));
    return () => window.removeEventListener('popstate', handle);
  }, []);

  useEffect(() => { fetch('/api/content').then((response) => response.ok ? response.json() : null).then((content) => { if (content) { setAbout(content.about); setProjects(content.projects); } }).catch(() => {}); }, [user]);

  const navigate = (to) => { if (to.startsWith('/projects/')) to = `/projects#${to.split('/')[2]}`; window.history.pushState({}, '', to); setPath(window.location.pathname); setHash(window.location.hash.replace('#', '')); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const detailSlug = path === '/projects' && hash ? hash : (path.startsWith('/projects/') ? path.split('/')[2] : null);
  const detail = projects.find((project) => project.slug === detailSlug);

  if (path === '/admin') return <Admin user={user} about={about} projects={projects} setAbout={setAbout} setProjects={setProjects} onNavigate={navigate} />;
  if (path === '/projects' || path.startsWith('/projects/')) return <><SiteHeader onNavigate={navigate} /><main className="projects-page"><ProjectGrid projects={projects.filter((project) => project.published !== false)} onNavigate={navigate} />{detail && <ProjectDetail project={detail} onNavigate={navigate} embedded />}</main><SiteFooter /></>;
  return <><SiteHeader onNavigate={navigate} /><main><About about={about} onNavigate={navigate} /></main><SiteFooter /></>;
}

function SiteHeader({ onNavigate }) {
  return <header className="site-header"><button className="brand" onClick={() => onNavigate('/')}><span className="brand-mark">j</span><span>Janice</span></button><nav><button onClick={() => onNavigate('/')}>About Me</button><button onClick={() => onNavigate('/projects')}>My Projects</button><a href={LINKEDIN} target="_blank" rel="noreferrer">LinkedIn</a><button className="admin-link" onClick={() => onNavigate('/admin')}><Icon name="lock" /> Admin</button></nav></header>;
}

function About({ about, onNavigate }) {
  return <section className="about-section"><div className="about-copy"><p className="eyebrow"><span className="eyebrow-dot" />{about.eyebrow}</p><h1>{about.headline}</h1><div className="body-copy">{about.body.split('\n\n').map((paragraph, i) => <p key={i}>{paragraph}</p>)}</div><div className="about-actions"><a className="button primary" href={LINKEDIN} target="_blank" rel="noreferrer">Let’s connect <Icon name="external" /></a><button className="text-button" onClick={() => onNavigate('/projects')}>See what I’ve built <Icon name="arrow" /></button></div></div><div className="intro-card"><div className="intro-card-top"><span className="intro-label">A little about my work</span><span className="intro-spark">✦</span></div><div className="profile-portrait"><img className="avatar-sticker" src="/janice-avatar-short-hair-glasses.png" alt="Illustrated portrait of Janice with short dark hair and glasses" /></div><div className="intro-bottom"><span>Currently exploring</span><strong>Analytics<br />· automation · AI</strong></div></div></section>;
}

function ProjectGrid({ projects, onNavigate }) {
  return <section id="projects" className="projects-section"><div className="section-heading"><div><p className="eyebrow"><span className="eyebrow-dot purple-dot" />My projects</p><h1>A few useful things<br /><em>made with curiosity.</em></h1></div><p className="section-intro">Small experiments, practical tools, and lessons gathered along the way.</p></div><div className="project-grid">{projects.map((project) => <ProjectCard key={project.id} project={project} onNavigate={onNavigate} />)}</div></section>;
}

function ProjectCard({ project, onNavigate }) {
    return <article className={`project-card ${project.accent}`}><div className="project-art" style={project.image_url ? { backgroundImage: `url(${project.image_url})` } : undefined}>{!project.image_url && <><span className="art-icon">{project.icon}</span><span className="art-label">{project.id === 'human-bingo' ? 'play together' : 'share a little good'}</span><span className="art-scribble">{project.id === 'human-bingo' ? 'B I N G O' : 'pingly!'} </span></>}</div><div className="project-card-content"><div className="project-meta"><span className={`status ${project.statusTone}`}>{project.status}</span><span>{project.tools.slice(0, 2).join(' · ')}</span></div><h3>{project.title}</h3><p>{project.summary}</p><button className="card-link" onClick={() => onNavigate(`/projects#${project.slug}`)}>Read more <Icon name="arrow" /></button></div></article>;
}

function ProjectDetail({ project, onNavigate, embedded = false }) {
  return <section className={`detail-page ${embedded ? 'embedded-detail' : ''}`}><button className="back-link" onClick={() => onNavigate('/projects')}>← Back to all projects</button><div className="detail-hero"><div><span className={`status ${project.statusTone}`}>{project.status}</span><h2>{project.title}</h2><p className="detail-summary">{project.summary}</p><div className="detail-actions">{project.demo && <a className="button primary" href={project.demo} target="_blank" rel="noreferrer">Open live app <Icon name="external" /></a>}{project.github && <a className="button secondary" href={project.github} target="_blank" rel="noreferrer">View GitHub <Icon name="external" /></a>}</div></div>{project.image_url ? <img className="detail-art-image" src={project.image_url} alt="" /> : <div className={`detail-art ${project.accent}`}><span>{project.icon}</span><strong>{project.id === 'human-bingo' ? 'B I N G O' : 'Pingly!'}</strong><small>{project.id === 'human-bingo' ? 'a little team-building magic' : 'polls, music & gratitude'}</small></div>}</div>{project.video_url && <p className="media-link"><a href={project.video_url} target="_blank" rel="noreferrer">Watch project video ↗</a></p>}<div className="detail-grid">{project.post_body && <DetailBlock title="A note from me" text={project.post_body} />}<DetailBlock title="The motivation" text={project.motivation} /><DetailBlock title="What I built" text={project.built} /><DetailBlock title="My contribution" text={project.contribution} /><DetailBlock title="What I learned" text={project.learned} /></div><div className="detail-footer"><div><span className="detail-label">Tools & technologies</span><div className="tag-row">{project.tools.map((tool) => <span className="tag" key={tool}>{tool}</span>)}</div></div>{project.credit && <p className="credit">Built on <a href={project.creditUrl} target="_blank" rel="noreferrer">{project.credit}</a>. The original platform was created by its open-source authors.</p>}</div></section>;
}

function DetailBlock({ title, text }) { return <section className="detail-block"><h2>{title}</h2><p>{text}</p></section>; }

function SiteFooter() { return <footer><span>Made with curiosity, a few spreadsheets, and lots of little experiments.</span><span className="footer-mark">✦</span></footer>; }

function Admin({ user, about, projects, setAbout, setProjects, onNavigate }) {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [message, setMessage] = useState(''); const [active, setActive] = useState('about'); const [draftAbout, setDraftAbout] = useState(about); const [draftProjects, setDraftProjects] = useState(projects);
  const isConfigured = true;
  useEffect(() => setDraftAbout(about), [about]); useEffect(() => setDraftProjects(projects), [projects]);
  const signIn = async (event) => { event.preventDefault(); setMessage(''); try { const response = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }); const result = await response.json(); if (!response.ok) return setMessage(result.error || 'Unable to sign in.'); window.location.reload(); } catch { setMessage('The admin server is not running. Start it with npm start.'); } };
  const saveContent = async (nextAbout, nextProjects) => { setMessage(''); const response = await fetch('/api/content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ about: nextAbout, projects: nextProjects }) }); const result = await response.json(); if (!response.ok) return setMessage(result.error || 'Unable to save changes.'); setAbout(result.about); setProjects(result.projects); setMessage('Changes saved.'); };
  const saveAbout = () => saveContent(draftAbout, draftProjects);
  const saveProjects = () => saveContent(draftAbout, draftProjects);
  const handleImageUpload = async (index, file) => { if (!file) return; const reader = new FileReader(); reader.onload = () => { const next = [...draftProjects]; next[index] = { ...next[index], image_url: reader.result }; setDraftProjects(next); setMessage('Image preview added. Save project edits to keep it.'); }; reader.readAsDataURL(file); };
  const updateProject = (index, changes) => setDraftProjects(draftProjects.map((project, i) => i === index ? { ...project, ...changes } : project));
  const addProject = () => { const id = `project-${Date.now()}`; setDraftProjects([...draftProjects, { id, slug: id, content_type: 'project', post_body: '', title: 'New project or post', summary: 'A short introduction for this project or post.', status: 'In development', statusTone: 'purple', accent: 'lavender', icon: '✦', motivation: '', built: '', contribution: '', tools: [], learned: '', demo: '', github: '', image_url: '', published: false, sort_order: draftProjects.length + 1 }]); };
  const removeProject = async (project, index) => { setDraftProjects(draftProjects.filter((_, i) => i !== index)); setMessage('Project removed from the editor. Save to keep the deletion.'); };
  const moveProject = (index, direction) => { const next = index + direction; if (next < 0 || next >= draftProjects.length) return; const copy = [...draftProjects]; [copy[index], copy[next]] = [copy[next], copy[index]]; setDraftProjects(copy.map((item, i) => ({ ...item, sort_order: i + 1 }))); };
  const signOut = async () => { await fetch('/api/logout', { method: 'POST' }); window.location.reload(); };
  if (!user) return <div className="admin-shell"><div className="admin-login"><button className="back-link" onClick={() => onNavigate('/')}>← Back to site</button><div className="admin-symbol">✦</div><p className="eyebrow">Private studio</p><h1>Welcome back, Janice.</h1><p>Sign in to update your story and projects.</p><form onSubmit={signIn}><label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" /></label><label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" /></label><button className="button primary full" type="submit">Sign in <Icon name="arrow" /></button></form><p className="form-note">Your password is checked on the server and never stored in the browser.</p>{message && <p className="form-message">{message}</p>}</div></div>;
  return <div className="admin-shell"><aside className="admin-sidebar"><button className="brand" onClick={() => onNavigate('/')}><span className="brand-mark">j</span><span>Janice</span></button><p className="sidebar-kicker">Private studio</p><button className={active === 'about' ? 'side-active' : ''} onClick={() => setActive('about')}>About page</button><button className={active === 'projects' ? 'side-active' : ''} onClick={() => setActive('projects')}>Projects & posts</button><div className="sidebar-bottom"><button onClick={signOut}>Sign out</button><button onClick={() => onNavigate('/')}>View site ↗</button></div></aside><section className="admin-content"><div className="admin-top"><div><p className="eyebrow">Content studio</p><h1>{active === 'about' ? 'Shape your story.' : 'Keep building.'}</h1></div><span className="admin-user">{user.email}</span></div>{active === 'about' ? <div className="editor-card"><label>Eyebrow<input value={draftAbout.eyebrow} onChange={(e) => setDraftAbout({ ...draftAbout, eyebrow: e.target.value })} /></label><label>Headline<textarea rows="3" value={draftAbout.headline} onChange={(e) => setDraftAbout({ ...draftAbout, headline: e.target.value })} /></label><label>About copy<textarea rows="12" value={draftAbout.body} onChange={(e) => setDraftAbout({ ...draftAbout, body: e.target.value })} /></label><div className="editor-actions"><button className="button primary" onClick={saveAbout}>Save changes</button><button className="button secondary" onClick={() => { setAbout(draftAbout); onNavigate('/'); }}>Preview page</button></div></div> : <div className="editor-card"><p className="editor-help">Create a project or a personal post. Add a cover image, write your story, preview it, then publish when ready.</p>{draftProjects.map((project, index) => <div className="project-editor" key={project.id}><div className="editor-row"><input value={project.title} aria-label={`Project ${index + 1} title`} onChange={(e) => updateProject(index, { title: e.target.value })} /><select value={project.content_type || 'project'} aria-label="Content type" onChange={(e) => updateProject(index, { content_type: e.target.value })}><option value="project">Project</option><option value="post">Post</option></select></div><textarea rows="3" value={project.summary} aria-label={`${project.title} summary`} placeholder="Short introduction" onChange={(e) => updateProject(index, { summary: e.target.value })} /><textarea rows="7" value={project.post_body || ''} aria-label={`${project.title} post body`} placeholder="Write about what you do, what you learned, or how you made it…" onChange={(e) => updateProject(index, { post_body: e.target.value })} /><div className="upload-row">{project.image_url && <img className="upload-preview" src={project.image_url} alt="Selected cover preview" />}<label className="upload-button">Upload image<input type="file" accept="image/*" onChange={(e) => handleImageUpload(index, e.target.files?.[0])} /></label><span className="upload-hint">or choose a cover</span></div><div className="cover-choices">{COVER_CHOICES.map((cover) => <button type="button" className={project.image_url === cover.url ? 'cover-choice selected' : 'cover-choice'} key={cover.url} onClick={() => updateProject(index, { image_url: cover.url })}><img src={cover.url} alt="" /><span>{cover.label}</span></button>)}</div><div className="editor-row"><input value={project.demo || ''} placeholder="Live demo URL" onChange={(e) => updateProject(index, { demo: e.target.value })} /><input value={project.github || ''} placeholder="GitHub URL" onChange={(e) => updateProject(index, { github: e.target.value })} /></div><div className="editor-row"><input value={project.video_url || ''} placeholder="Video URL (optional)" onChange={(e) => updateProject(index, { video_url: e.target.value })} /><input value={project.tools?.join(', ') || ''} placeholder="Tools, separated by commas" onChange={(e) => updateProject(index, { tools: e.target.value.split(',').map((tool) => tool.trim()).filter(Boolean) })} /></div><div className="project-editor-actions"><label className="publish-toggle"><input type="checkbox" checked={project.published !== false} onChange={(e) => updateProject(index, { published: e.target.checked })} /> Published</label><button onClick={() => moveProject(index, -1)} disabled={index === 0}>↑ Move up</button><button onClick={() => moveProject(index, 1)} disabled={index === draftProjects.length - 1}>↓ Move down</button><button onClick={() => { setProjects(draftProjects); onNavigate(`/projects/${project.slug}`); }}>Preview</button><button className="delete-action" onClick={() => removeProject(project, index)}>Delete</button></div></div>)}<div className="editor-actions"><button className="button secondary" onClick={addProject}>+ Add project or post</button><button className="button primary" onClick={saveProjects}>Save and publish changes</button></div></div>}{message && <p className="form-message">{message}</p>}</section></div>;
}

createRoot(document.getElementById('root')).render(<App />);
