import { useEffect } from "react";
import About from "./About";
import Contact from "./Contact";
import Cursor from "./Cursor";
import Landing from "./Landing";
import Navbar from "./Navbar";
import SocialIcons from "./SocialIcons";
import WhatIDo from "./WhatIDo";
import Work from "./Work";
import TechStackNew from "./TechStackNew";
import setSplitText, { clearSplitText } from "./utils/splitText";
import { clearInitialFX } from "./utils/initialFX";

const MainContainer = () => {
  useEffect(() => {
    let timeoutId: number;
    const resizeHandler = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setSplitText();
      }, 100);
    };
    
    // Initial call
    setSplitText();
    
    window.addEventListener("resize", resizeHandler);
    return () => {
      window.removeEventListener("resize", resizeHandler);
      clearTimeout(timeoutId);
      clearSplitText(); // Clean up triggers on unmount
      clearInitialFX(); // Stop the looping landing page animations
    };
  }, []);

  return (
    <div className="container-main">
      <Cursor />
      <Navbar />
      <SocialIcons />
      <div className="container-main">
        <Landing />
        <About />
        <WhatIDo />
        {/* <Career /> */}
        <Work />
        <TechStackNew />
        {/* <CallToAction /> */}
        <Contact />
      </div>
    </div>
  );
};

export default MainContainer;
