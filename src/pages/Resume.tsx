import { useState, ReactNode } from "react";
import { useConfig } from "../context/ConfigContext";
import "./Resume.css";

const CollapsibleSection = ({ title, children }: { title: string; children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="resume-section">
      <div 
        className="resume-section-header" 
        onClick={() => setIsOpen(!isOpen)}
        data-cursor="disable"
      >
        <h2>{title}</h2>
        <span className="collapse-icon">{isOpen ? "−" : "+"}</span>
      </div>
      {isOpen && <div className="resume-section-content">{children}</div>}
    </div>
  );
};

const Resume = () => {
  const { config } = useConfig();
  return (
    <div className="resume-page">
      <div className="resume-header">
        <a href="/" className="back-button" data-cursor="disable">
          ← Back to Home
        </a>
        <h1>
          My <span>Resume</span>
        </h1>
        <p>A quick overview of my experience and skills</p>
        
        {/* @ts-ignore */}
        {config.resumeDownloadLink && (
          <a 
            /* @ts-ignore */
            href={config.resumeDownloadLink} 
            download 
            className="download-button"
            data-cursor="disable"
          >
            Download PDF
          </a>
        )}
      </div>

      <div className="resume-container">
        <div className="resume-content" data-cursor="disable">
          
          {config.about && (
            <CollapsibleSection title="About Me">
              <div className="resume-about">
                {/* @ts-ignore */}
                {config.about.image && (
                  <div className="resume-about-image">
                     {/* @ts-ignore */}
                     <img src={config.about.image} alt="Profile" />
                  </div>
                )}
                <div className="resume-about-text">
                  <p className="resume-description">{config.about.description}</p>
                  {/* @ts-ignore */}
                  {config.about.links && config.about.links.length > 0 && (
                    <div className="resume-about-links">
                      {/* @ts-ignore */}
                      {config.about.links.map((link: any, i: number) => (
                        <a key={i} href={link.url} target="_blank" rel="noreferrer" className="resume-about-link">
                          {link.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CollapsibleSection>
          )}

          {config.skills && Object.keys(config.skills).length > 0 && (
            <CollapsibleSection title="Skills">
              <div className="resume-skills-categories">
                {Object.values(config.skills).map((skillCategory: any, i: number) => (
                  <div key={i} className="resume-skill-group">
                    <h3>{skillCategory.title}</h3>
                    <div className="resume-skills">
                      {skillCategory.tools.map((skill: string, j: number) => (
                        <span key={j}>{skill}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {config.experiences && config.experiences.length > 0 && (
            <CollapsibleSection title="Experience">
              {config.experiences.map((exp: any, i: number) => (
                <div className="resume-item" key={i}>
                  <h3>{exp.position} - {exp.company}</h3>
                  <span className="resume-date">{exp.period} | {exp.location}</span>
                  <p className="resume-description">{exp.description}</p>
                  {exp.responsibilities && (
                     <ul className="resume-responsibilities">
                        {exp.responsibilities.map((resp: string, j: number) => (
                           <li key={j}>{resp}</li>
                        ))}
                     </ul>
                  )}
                </div>
              ))}
            </CollapsibleSection>
          )}

          {/* @ts-ignore */}
          {config.education && config.education.length > 0 && (
            <CollapsibleSection title="Education">
              {/* @ts-ignore */}
              {config.education.map((edu: any, i: number) => (
                <div className="resume-item" key={i}>
                  <h3>{edu.degree}</h3>
                  <span className="resume-date">{edu.institution} | {edu.period}</span>
                  <p className="resume-description">{edu.description}</p>
                </div>
              ))}
            </CollapsibleSection>
          )}

          {/* @ts-ignore */}
          {config.certifications && config.certifications.length > 0 && (
            <CollapsibleSection title="Certifications">
              <div className="resume-cert-grid">
                {/* @ts-ignore */}
                {config.certifications.map((cert: any, i: number) => (
                  <div className="resume-cert" key={i}>
                    <h3>{cert.title}</h3>
                    <span className="resume-date">{cert.issuer} ({cert.date})</span>
                    {cert.link !== "#" && (
                        <a href={cert.link} target="_blank" rel="noreferrer" className="cert-link">View Credential</a>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* @ts-ignore */}
          {config.languages && config.languages.length > 0 && (
            <CollapsibleSection title="Languages">
              <div className="resume-languages">
                 {/* @ts-ignore */}
                 {config.languages.map((lang: any, i: number) => (
                    <div className="resume-language-item" key={i}>
                       <span className="lang-name">{lang.name}</span>
                       <span className="lang-prof">{lang.proficiency}</span>
                    </div>
                 ))}
              </div>
            </CollapsibleSection>
          )}

          {/* @ts-ignore */}
          {config.awards && config.awards.length > 0 && (
            <CollapsibleSection title="Awards & Honors">
              {/* @ts-ignore */}
              {config.awards.map((award: any, i: number) => (
                <div className="resume-item" key={i}>
                  <h3>
                    {award.title}

                  </h3>
                  <span className="resume-date">{award.issuer} | {award.date}</span>
                  <p className="resume-description">{award.description}</p>
                </div>
              ))}
            </CollapsibleSection>
          )}

          {config.projects && config.projects.length > 0 && (
            <CollapsibleSection title="Projects">
              {config.projects.map((proj: any, i: number) => (
                <div className="resume-item" key={i}>
                  <h3>{proj.title} <span className="proj-cat">({proj.category})</span></h3>
                  <span className="resume-date">Tech: {proj.technologies}</span>
                  <p className="resume-description">{proj.description}</p>
                </div>
              ))}
            </CollapsibleSection>
          )}

          {/* @ts-ignore */}
          {config.references && config.references.length > 0 && (
            <CollapsibleSection title="References">
              <p className="resume-description">Available upon request.</p>
            </CollapsibleSection>
          )}

        </div>
      </div>
    </div>
  );
};

export default Resume;