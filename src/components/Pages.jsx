import DecryptedText from './reactbits/DecryptedText';
import Reveal from './ui/Reveal';
import Label from './ui/Label';
import Icon from './ui/Icon';
import Footer from './Footer';
import { PostRow } from './BlogSection';
import { POSTS } from '../data/posts';
import { prefersReducedMotion } from '../lib';

function Back({ href, children }) {
  return <a className="back mono cursor-target" href={href}><Icon name="arrow" size={16} className="back-icon" />{children}</a>;
}

export function BlogList() {
  return (
    <main className="page">
      <header className="topbar"><Back href="#/">Home</Back></header>
      <section className="section wide page-head">
        <Label>Blog</Label>
        <p className="muted">Notes on building, AI and security.</p>
        <div className="rows rows--posts">
          {POSTS.map((p, i) => <Reveal key={p.slug} delay={i * 0.06} distance={16}><PostRow post={p} /></Reveal>)}
        </div>
      </section>
      <Footer signature={false} />
    </main>
  );
}

function Block({ b }) {
  if (b.type === 'h2') return <h2>{b.text}</h2>;
  if (b.type === 'ul') return <ul>{b.items.map((i) => <li key={i}>{i}</li>)}</ul>;
  if (b.type === 'code') return <pre><code>{b.text}</code></pre>;
  return <p>{b.text}</p>;
}

export function Post({ slug }) {
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) return <NotFound />;
  return (
    <main className="page">
      <header className="topbar"><Back href="#/blog">All posts</Back></header>
      <article className="section wide page-head">
        <h2 className="label mono">{post.date}</h2>
        <h1 className="post-title">
          {prefersReducedMotion() ? post.title : <DecryptedText text={post.title} animateOn="view" speed={30} maxIterations={10} sequential revealDirection="start" />}
        </h1>
        <div className="prose">{post.body.map((b, i) => <Block key={i} b={b} />)}</div>
      </article>
      <nav className="post-nav"><Back href="#/blog">All posts</Back></nav>
      <Footer signature={false} />
    </main>
  );
}

export function NotFound() {
  return (
    <main className="page">
      <header className="topbar"><Back href="#/">Home</Back></header>
      <section className="section wide page-head">
        <h2 className="label mono">404</h2>
        <h1 className="post-title">Lost in the shell</h1>
        <p className="muted" style={{ marginTop: 16 }}>That page doesn't exist. Try the <a className="inline-link" href="#/">home page</a> or press <span className="kbd">/</span> for the terminal.</p>
      </section>
      <Footer signature={false} />
    </main>
  );
}
