import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const assetsDir = path.join(distDir, 'assets');

const htmlPath = path.join(distDir, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf-8');

const assetFiles = fs.readdirSync(assetsDir);
const jsFile = assetFiles.find(f => f.endsWith('.js'));
const cssFile = assetFiles.find(f => f.endsWith('.css'));

if (!jsFile || !cssFile) {
  console.error('Build assets not found in dist/assets!');
  process.exit(1);
}

let jsContent = fs.readFileSync(path.join(assetsDir, jsFile), 'utf-8');
const cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf-8');

// Escape any closing script tag inside JS strings
jsContent = jsContent.replace(/<\/script>/gi, '<\\/script>');

// Replace CSS link with inlined <style> safely using a function to avoid '$' replacement patterns
let inlined = html.replace(/<link rel="stylesheet"[^>]*>/, () => `<style>\n${cssContent}\n</style>`);

// Replace external script with inlined <script type="module"> safely using a function
inlined = inlined.replace(/<script type="module"[^>]*><\/script>/, () => `<script type="module">\n${jsContent}\n</script>`);

// Write both inside dist, in frontend root, and in project root
const outDist = path.join(distDir, 'IntelliDesk-Direct.html');
const outRoot = path.join(rootDir, 'IntelliDesk-Direct.html');
const outProject = path.resolve(rootDir, '..', 'IntelliDesk-Direct.html');

fs.writeFileSync(outDist, inlined, 'utf-8');
fs.writeFileSync(outRoot, inlined, 'utf-8');
fs.writeFileSync(outProject, inlined, 'utf-8');

console.log('Successfully generated standalone single-file builds:');
console.log(' -', outDist);
console.log(' -', outRoot);
console.log(' -', outProject);
console.log(`Size: ${(inlined.length / 1024).toFixed(1)} KB`);
