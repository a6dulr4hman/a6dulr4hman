// @ts-nocheck
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { Client } from "@notionhq/client";
import dotenv from "dotenv";

dotenv.config();

function notionApiPlugin() {
  return {
    name: "notion-api-mock",
    configureServer(server) {
      server.middlewares.use("/api/config", async (req, res, next) => {
        if (req.url === "/") { // It matches '/api/config/' or just '/api/config'
          try {
            const apiKey = process.env.NOTION_API_KEY;
            const blockId = process.env.NOTION_BLOCK_ID;
            
            if (!apiKey || !blockId) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: "Missing Notion credentials in environment variables." }));
              return;
            }

            const notion = new Client({ auth: apiKey });
            const block = await notion.blocks.retrieve({ block_id: blockId });

            if (block.type === "code" && block.code.language === "json") {
              const content = block.code.rich_text.map(t => t.plain_text).join("");
              res.setHeader("Content-Type", "application/json");
              res.end(content);
            } else {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "Notion block is not a JSON code block" }));
            }
          } catch (e) {
            console.error("Local Notion API Error:", e);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: e.message }));
          }
        } else {
          next();
        }
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), notionApiPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three', 'three-stdlib'],
          'react-three': ['@react-three/fiber', '@react-three/drei'],
          'gsap': ['gsap'],
          'vendor': ['react', 'react-dom', 'react-router-dom']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  optimizeDeps: {
    include: ['three', 'gsap', 'lenis']
  }
});
