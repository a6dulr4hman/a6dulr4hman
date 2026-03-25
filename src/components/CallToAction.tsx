import { useConfig } from "../context/ConfigContext";
import "./styles/CallToAction.css";

const CallToAction = () => {
  const { config } = useConfig();
  return (
    <div className="cta-section">
      <div className="cta-buttons">
        <a 
          href={config.contact.linkedin} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="cta-btn cta-btn-hire"
          data-cursor="disable"
        >
          Hire Me →
        </a>
      </div>
    </div>
  );
};

export default CallToAction;
