import "./styles/About.css";
import { useConfig } from "../context/ConfigContext";

const About = () => {
  const { config } = useConfig();
  return (
    <div className="about-section" id="about">
      <div className="about-me">
        <h3 className="title">{config.about.title}</h3>
        <p className="para">
          {config.about.description}
        </p>
      </div>
    </div>
  );
};

export default About;
