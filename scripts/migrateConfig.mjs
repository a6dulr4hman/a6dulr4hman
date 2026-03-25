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
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');

      // Skip the config context file itself to avoid circular loops
      if (fullPath.includes('ConfigContext.tsx')) continue;

      if (content.includes('import { config } from')) {
        // Change the import path
        content = content.replace(/import\s+{\s*config\s*}\s+from\s+["'](.*?)config["'];?/, 'import { useConfig } from "$1context/ConfigC        content = content.replace(/import\s+{\s*config\s*}nction start. Usually `const Component = () => {` or `export default function`
        // Since we know these are React components, we can look for `return (` and inject `const { config } = useConfig();` before it?
        // Actually, it's safer to look for the first React component definition.
        
        // Regex to match arrow function or normal function:
        // const Name = (...) => {
        // function Name(...) {
        content = content.replace(/(const\s+\w+\s*=\s*(?:<[^>]*>)?\s*\([^)]*\)\s*=>\s*{)/, '$1\n  const { config } = useConfig();');
        content = content.replace(/(export\s+(?:default\s+)?function\s+\w+\s*\([^)]*\)\s*{)/, '$1\n  const { config } = useConfig();');

        // Note: For one-liner arrow functions without braces: const X = () => <div/>
        // we might need to expand them, but let's see if that regex covers most.

        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

traverse(srcDir);
