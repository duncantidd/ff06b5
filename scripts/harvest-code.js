import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const targetDir = path.join(__dirname, '../src'); // Your source folder
const outputFile = path.join(__dirname, '../src/lib/code-snippets.json');

function getSnippets(dir, snippets = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getSnippets(fullPath, snippets);
    } else if (file.endsWith('.ts') || file.endsWith('.svelte')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      // Split by lines and filter out imports or empty lines to get "crunchy" logic
      const lines = content.split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 10 && !l.startsWith('import'));
      snippets.push(...lines);
    }
  });
  return snippets;
}

const allSnippets = getSnippets(targetDir);
fs.writeFileSync(outputFile, JSON.stringify(allSnippets, null, 2));