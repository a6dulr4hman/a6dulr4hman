import Label from './ui/Label';
import Reveal from './ui/Reveal';
import Icon from './ui/Icon';
import { POSTS } from '../data/posts';

export function PostRow({ post }) {
  return (
    <a className="row row--post cursor-target" href={`#/blog/${post.slug}`}>
      <span className="row-text">
        <span className="row-title">{post.title}</span>
        <span className="muted row-desc">{post.date} · {post.summary}</span>
      </span>
      <Icon name="arrow" size={24} className="arrow" />
    </a>
  );
}

export default function BlogSection() {
  return (
    <section className="section indent" id="blog">
      <Reveal><Label>Blog</Label></Reveal>
      <Reveal delay={0.05}><p className="muted">Notes on building, AI and security.</p></Reveal>
      <Reveal delay={0.1}>
        <div className="rows rows--posts">
          {POSTS.slice(0, 3).map((p) => <PostRow key={p.slug} post={p} />)}
          <a className="row row--all cursor-target" href="#/blog">
            <span className="row-label">All posts</span>
            <Icon name="arrow" size={20} className="arrow" />
          </a>
        </div>
      </Reveal>
    </section>
  );
}
