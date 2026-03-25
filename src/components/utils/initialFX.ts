import { TextSplitter } from "../../utils/textSplitter";
import gsap from "gsap";
import { lenis } from "../Navbar";

let ctx: gsap.Context | null = null;
let splitters: TextSplitter[] = [];

export function clearInitialFX() {
  if (ctx) {
    ctx.revert();
    ctx = null;
  }
  splitters.forEach(s => s.revert());
  splitters = [];
}

export function initialFX() {
  clearInitialFX(); // Clean up previous first
  document.body.style.overflowY = "auto";
  if (lenis) {
    lenis.start();
  }
  document.getElementsByTagName("main")[0].classList.add("main-active");
  
  ctx = gsap.context(() => {
    gsap.to("body", {
      backgroundColor: "#0b080c",
      duration: 0.5,
      delay: 1,
    });

    const selectors = [".landing-info h3", ".landing-intro h2", ".landing-intro h1"];
    const elements = selectors.flatMap(selector => Array.from(document.querySelectorAll(selector)));
    var landingText = new TextSplitter(elements, {
      type: "chars,lines",
      linesClass: "split-line",
    });
    splitters.push(landingText);
    
    gsap.fromTo(
      landingText.chars,
      { opacity: 0, y: 80, filter: "blur(5px)" },
      {
        opacity: 1,
        duration: 1.2,
        filter: "blur(0px)",
        ease: "power3.inOut",
        y: 0,
        stagger: 0.025,
        delay: 0.3,
      }
    );

    let TextProps = { type: "chars,lines", linesClass: "split-h2" };

    var landingText2 = new TextSplitter(".landing-h2-info", TextProps);
    splitters.push(landingText2);
    
    gsap.fromTo(
      landingText2.chars,
      { opacity: 0, y: 80, filter: "blur(5px)" },
      {
        opacity: 1,
        duration: 1.2,
        filter: "blur(0px)",
        ease: "power3.inOut",
        y: 0,
        stagger: 0.025,
        delay: 0.3,
      }
    );

    gsap.fromTo(
      ".landing-info-h2",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        duration: 1.2,
        ease: "power1.inOut",
        y: 0,
        delay: 0.8,
      }
    );

    var landingText3 = new TextSplitter(".landing-h2-info-1", TextProps);
    var landingText4 = new TextSplitter(".landing-h2-1", TextProps);
    var landingText5 = new TextSplitter(".landing-h2-2", TextProps);
    splitters.push(landingText3, landingText4, landingText5);

    LoopText(landingText2, landingText3);
    LoopText(landingText4, landingText5);
  });
}

function LoopText(Text1: TextSplitter, Text2: TextSplitter) {
  var tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
  const delay = 4;
  const delay2 = delay * 2 + 1;

  tl.fromTo(
    Text2.chars,
    { opacity: 0, y: 80 },
    {
      opacity: 1,
      duration: 1.2,
      ease: "power3.inOut",
      y: 0,
      stagger: 0.1,
      delay: delay,
    },
    0
  )
    .fromTo(
      Text1.chars,
      { y: 80 },
      {
        duration: 1.2,
        ease: "power3.inOut",
        y: 0,
        stagger: 0.1,
        delay: delay2,
      },
      1
    )
    .fromTo(
      Text1.chars,
      { y: 0 },
      {
        y: -80,
        duration: 1.2,
        ease: "power3.inOut",
        stagger: 0.1,
        delay: delay,
      },
      0
    )
    .to(
      Text2.chars,
      {
        y: -80,
        duration: 1.2,
        ease: "power3.inOut",
        stagger: 0.1,
        delay: delay2,
      },
      1
    );
}
