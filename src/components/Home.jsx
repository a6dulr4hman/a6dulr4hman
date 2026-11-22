import Clock from './Clock';
import Intro from './Intro';
import Work from './Work';
import Education from './Education';
import Stack from './Stack';
import Ventures from './Ventures';
import BlogSection from './BlogSection';
import Personal from './Personal';
import Contact from './Contact';
import Footer from './Footer';
import Dock from './Dock';
import Hero from './Hero';

export default function Home({ onTerminal, ready }) {
  return (
    <>
      <Hero ready={ready} />
      <main className="page">
        <header className="topbar indent">
          <p className="mono cursor-target" title="Est. 2008">Est. 2008</p>
          <Clock />
        </header>
        <Intro onTerminal={onTerminal} />
        <Work />
        <Education />
        <Stack />
        <Ventures />
        <BlogSection />
        <Personal />
        <Contact />
        <Footer />
      </main>
      <Dock onTerminal={onTerminal} />
    </>
  );
}
