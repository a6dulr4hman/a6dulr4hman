import DecryptedText from './reactbits/DecryptedText';
import Reveal from './ui/Reveal';
import SectionHead from './ui/SectionHead';
import Icon from './ui/Icon';
import Footer from './Footer';
import { PostCard } from './sections/BlogSection';
import { POSTS } from '../data/posts';
import { prefersReducedMotion } from '../lib';

function Back({ href, children }) {
  return <a className="back mono cursor-target" href={href}><Icon name="arrow" size={16} className="back-icon" />{children}</a>;
}

export function BlogList() {
  return (
    <>
      <main className="wrap subpage">
        <Back href="#/">Home</Back>
        <SectionHead num="05" label="Blog" title={<>Notes &amp; <span className="outline">writing.</span></>} sub="On building, AI and security." />
        <div className="posts posts--page">
          {POSTS.map((p, i) => <Reveal key={p.slug} delay={i * 0.06} distance={20}><PostCard post={p} /></Reveal>)}
        </div>
      </main>
      <Footer signature={false} />
    </>
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
    <>
      <main className="wrap subpage">
        <Back href="#/blog">All posts</Back>
        <article className="article">
          <p className="mono muted">{post.date}</p>
          <h1 className="h2 article-title">
            {prefersReducedMotion() ? post.title : <DecryptedText text={post.title} animateOn="view" speed={30} maxIterations={10} sequential revealDirection="start" />}
          </h1>
          <div className="prose">{post.body.map((b, i) => <Block key={i} b={b} />)}</div>
          <div className="article-foot"><Back href="#/blog">All posts</Back></div>
        </article>
      </main>
      <Footer signature={false} />
    </>
  );
}

export function NotFound() {
  return (
    <>
      <main className="wrap subpage">
        <Back href="#/">Home</Back>
        <p className="mono muted" style={{ marginTop: 48 }}>404</p>
        <h1 className="h2">Lost in the <span className="outline">shell.</span></h1>
        <p className="sub" style={{ marginTop: 16 }}>That page doesn't exist. Head <a className="inline-link" href="#/">home</a> or press <span className="kbd">/</span> for the terminal.</p>
      </main>
      <Footer signature={false} />
    </>
  );
}
