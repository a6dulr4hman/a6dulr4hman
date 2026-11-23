import Hero from './Hero';
import About from './sections/About';
import Projects from './sections/Projects';
import Skills from './sections/Skills';
import Ventures from './sections/Ventures';
import BlogSection from './sections/BlogSection';
import Personal from './sections/Personal';
import Contact from './sections/Contact';
import Footer from './Footer';
import Dock from './Dock';
import JourneyA11y from './JourneyA11y';

export default function Home({ ready, journey }) {
  // With the 3D flight on, every section lives inside the world; only a hidden, plain copy stays in the DOM.
  if (journey) return <JourneyA11y />;
  return (
    <>
      <Hero ready={ready} journey={journey} />
      <main>
        <About />
        <Projects />
        <Skills />
        <Ventures />
        <BlogSection />
        <Personal />
        <Contact />
      </main>
      <Footer />
      <Dock />
    </>
  );
}
