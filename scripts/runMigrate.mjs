import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '../src');

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    
    if (fullPath.includes('ConfigContext.tsx')) continue;

    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');

      if (content.includes('import { config } from')) {
        let importMatch = content.match(/import\s+\{\s*config\s*\}\s+from\s+[\"'](.*?)config[\"'];?/);
        if(importMatch === null) continue;
        
        let pathPrefix = importMatch[1];
        if (!pathPrefix.endsWith('/')) pathPrefix += '/';
        
        // If the import was from '../config', it means we want to go up one directory to find 'context/ConfigContext'
        // Actually, let's just make it simple. The config is in `src/config.ts`.
        // We know its path relative to `src` is `./config`.
        let relPath = path.relative(path.dirname(fullPath), path.join(srcDir, 'context/ConfigContext'));
        if (!relPath.startsWith('.')) relPath = './' + relPath;
        
        let replacementStr = `import { useConfig } from "${relPath}";`;
        content = content.replace(importMatch[0], replacementStr);
        
        const arrowMatch = content.match(/(const\s+\w+\s*=\s*(?:<[^>]*>)?\s*\([^)]*\)\s*=>\s*\{)/);
        const functionMatch = content.match(/(export\s+(?:default\s+)?function\s+\w+\s*\([^)]*\)\s*\{)/);

        if (arrowMatch) {
            content = content.replace(arrowMatch[1], arrowMatch[1] + '\n  const { config } = useConfig();');
        } else if (functionMatch) {
            content = content.replace(functionMatch[1], functionMatch[1] + '\n  const { config } = useConfig();');
        } else {
            console.log('Could not find injection point: ', fullPath);
        }
        
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

traverse(srcDir);
