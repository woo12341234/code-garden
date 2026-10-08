// Copies the game (index.html, css, js, assets) into www/ for Capacitor.
const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '..');
const out = path.join(__dirname, 'www');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const f of ['index.html', 'style.css', 'game.js', 'manifest.webmanifest', 'sw.js']) fs.copyFileSync(path.join(src, f), path.join(out, f));
fs.cpSync(path.join(src, 'assets'), path.join(out, 'assets'), { recursive: true, filter: (p) => !p.includes(`${path.sep}android${path.sep}`) && !p.endsWith('.md') });
console.log('web files copied to', out);
