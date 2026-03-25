import { createContext, useContext, useEffect, useState, ReactNode } from "react";

const emptyConfig: any = {
  developer: { name: "", fullName: "", title: "", description: "" },
  social: { github: "", email: "", location: "" },
  about: { title: "", description: "", image: "", links: [] },
  experiences: [],
  resumeDownloadLink: "",
  education: [],
  certifications: [],
  languages: [],
  references: [],
  projects: [],
  contact: { email: "", github: "", linkedin: "" },
  skills: {
    design: { title: "", description: "", details: "", tools: [] },
    develop: { title: "", description: "", details: "", tools: [] }
  }
};

const ConfigContext = createContext<{config: any; loading: boolean}>({
  config: emptyConfig,
  loading: true,
});

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const [activeConfig, setActiveConfig] = useState(emptyConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (!data.error && data.developer) {
          setActiveConfig(data);
        } else {
          console.warn("Failed to fetch Notion config, using empty fallback.", data.error);
        }
      })
      .catch(err => console.error("Could not reach Notion config endpoint:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{
        width: '100vw', height: '100vh', 
        backgroundColor: '#111', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        color: '#fff', fontSize: '20px', fontFamily: 'sans-serif'
      }}>
        Loading Configuration...
      </div>
    );
  }

  return (
    <ConfigContext.Provider value={{ config: activeConfig, loading }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);
