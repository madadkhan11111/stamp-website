/**
 * Builds a clean deployable site/ folder:
 * - excludes madadkhan drafts, deploy scripts, and repo junk
 * - minifies script.js and styles.css for production
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUT = 'site';

const STATIC_FILES = [
    'index.html',
    'about.html',
    'contact.html',
    'privacy.html',
    'terms.html',
    'guide-business-stamps.html',
    'guide-security.html',
    'tools.html',
    'watermark-pdf.html',
    'sign-pdf.html',
    'date-stamp.html',
    'merge-pdf.html',
    'pdf-to-jpg.html',
    'image-to-pdf.html',
    'rotate-pdf.html',
    'page-numbers-pdf.html',
    'split-pdf.html',
    'tools.css',
    'tools-common.js',
    'watermark-pdf.js',
    'sign-pdf.js',
    'date-stamp.js',
    'merge-pdf.js',
    'pdf-to-jpg.js',
    'image-to-pdf.js',
    'rotate-pdf.js',
    'page-numbers-pdf.js',
    'split-pdf.js',
    'favicon.svg',
    'robots.txt',
    'sitemap.xml',
    'ads.txt',
    'CNAME',
    '_headers',
    '_redirects'
];

function ensureExists(file) {
    if (!fs.existsSync(file)) {
        throw new Error(`Missing required file: ${file}`);
    }
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT);

for (const file of STATIC_FILES) {
    ensureExists(file);
    fs.copyFileSync(file, path.join(OUT, file));
}

ensureExists('script.js');
ensureExists('styles.css');

console.log('Minifying script.js...');
execSync(`npx --yes terser script.js -o ${path.join(OUT, 'script.js')} -c -m`, {
    stdio: 'inherit'
});

console.log('Minifying styles.css...');
execSync(`npx --yes clean-css-cli -o ${path.join(OUT, 'styles.css')} styles.css`, {
    stdio: 'inherit'
});

const totalBytes = fs
    .readdirSync(OUT)
    .reduce((sum, name) => sum + fs.statSync(path.join(OUT, name)).size, 0);

fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

console.log(`Build complete: ${OUT}/ (${(totalBytes / 1024).toFixed(1)} KB)`);
