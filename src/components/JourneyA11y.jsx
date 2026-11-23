import { PROJECTS } from '../data/projects';
import { POSTS } from '../data/posts';
import { CREDITS } from '../data/credits';
import { ABOUT, TOOLS, SKILLS, VENTURE, SPOTIFY, PERSONAL_TEXT, LINKS } from '../data/site';

// When the 3D flight is on, the real content lives inside the world. This plain, visually hidden copy
// keeps the page readable for screen readers, search engines and keyboard users.
export default function JourneyA11y() {
  const lead = ABOUT.lead.replace(/\{\{|\}\}/g, '');
  return (
    <div className="a11y-only">
      <header id="top"><h1>AbdulRahman Maniar</h1><p>Student, AI and Cybersecurity Engineer based in Dubai, UAE.</p></header>
      <main>
        <section id="about"><h2>About</h2><p>{lead}</p><ul>{ABOUT.stats.map((s) => <li key={s.big}>{s.big}: {s.small}</li>)}</ul></section>
        <section id="work"><h2>Selected projects</h2>
          <ul>{PROJECTS.map((p) => <li key={p.id}><strong>{p.name}</strong> ({p.kind}). {p.text} {p.tags.join(', ')}.</li>)}</ul></section>
        <section id="stack"><h2>Stack</h2>
          <ul>{TOOLS.map((t) => <li key={t.name}><a href={t.href}>{t.name}</a></li>)}</ul>
          <p>{SKILLS.join(', ')}.</p></section>
        <section id="ventures"><h2>Ventures</h2><p><a href={VENTURE.href}>{VENTURE.name}</a>: {VENTURE.text}</p></section>
        <section id="blog"><h2>Blog</h2>
          <ul>{POSTS.map((p) => <li key={p.slug}><a href={`#/blog/${p.slug}`}>{p.title}</a> ({p.date}): {p.summary}</li>)}</ul>
          <p><a href="#/blog">All posts</a></p></section>
        <section id="personal"><h2>Personal</h2><p>{PERSONAL_TEXT}</p><p><a href={SPOTIFY.href}>{SPOTIFY.title}, {SPOTIFY.artist}</a> ({SPOTIFY.note}).</p></section>
        <section id="contact"><h2>Contact</h2>
          <ul>{LINKS.map((l) => <li key={l.label}><a href={l.href}>{l.label}: {l.value}</a></li>)}</ul></section>
      </main>
      <footer><p>3D models: {CREDITS.map((c) => <a key={c.what} href={c.href}>{c.what} by {c.by} ({c.license}). </a>)}</p></footer>
    </div>
  );
}
