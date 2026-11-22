import SpotlightCard from '../reactbits/SpotlightCard';
import SectionHead from '../ui/SectionHead';
import Reveal from '../ui/Reveal';
import Icon from '../ui/Icon';
import { POSTS } from '../../data/posts';

export function PostCard({ post }) {
  return (
    <SpotlightCard className="post-card" spotlightColor="rgba(185,196,255,0.4)" intensity={0.15} style={{ padding: 0 }}>
      <a className="post-in cursor-target" href={`#/blog/${post.slug}`}>
        <p className="mono muted">{post.date}</p>
        <h3 className="h4">{post.title}</h3>
        <p className="muted">{post.summary}</p>
        <span className="more-go">Read <Icon name="arrow" size={18} /></span>
      </a>
    </SpotlightCard>
  );
}

export default function BlogSection() {
  return (
    <section className="block wrap" id="blog">
      <SectionHead num="05" label="Blog" title={<>Notes &amp; <span className="outline">writing.</span></>} sub="On building, AI and security." />
      <div className="posts">
        {POSTS.slice(0, 2).map((p, i) => <Reveal key={p.slug} delay={i * 0.08} distance={24}><PostCard post={p} /></Reveal>)}
      </div>
      <Reveal><a className="btn btn--ghost cursor-target all-posts" href="#/blog">All posts <Icon name="arrow" size={20} /></a></Reveal>
    </section>
  );
}
