/**
 * Shared helpers for Online Stamp Doc extra tools (watermark, sign, date stamp).
 */
const TOOL_PDF_JS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const TOOL_PDF_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
const TOOL_PDF_LIB = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';

let toolPdfLibsPromise = null;

function toolLoadScript(src) {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[data-tool-src="${src}"]`);
        if (existing) {
            if (existing.dataset.loaded === 'true') resolve();
            else existing.addEventListener('load', () => resolve(), { once: true });
            return;
        }
        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.dataset.toolSrc = src;
        s.onload = () => { s.dataset.loaded = 'true'; resolve(); };
        s.onerror = () => reject(new Error('Failed to load ' + src));
        document.head.appendChild(s);
    });
}

function ensureToolPdfLibs() {
    if (window.pdfjsLib && window.PDFLib) return Promise.resolve();
    if (!toolPdfLibsPromise) {
        toolPdfLibsPromise = Promise.all([
            toolLoadScript(TOOL_PDF_JS),
            toolLoadScript(TOOL_PDF_LIB)
        ]).then(() => {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = TOOL_PDF_WORKER;
        }).catch((err) => {
            toolPdfLibsPromise = null;
            throw err;
        });
    }
    return toolPdfLibsPromise;
}

function toolShowLoading(msg) {
    const overlay = document.getElementById('loading-overlay');
    const text = document.getElementById('loading-text');
    if (text) text.textContent = msg || 'Processing...';
    if (overlay) overlay.classList.remove('hidden');
}

function toolHideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.add('hidden');
}

function toolDownloadBlob(blob, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

function toolIsPdf(file) {
    return !!(file && (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)));
}

function toolIsImage(file, extra) {
    const ok = extra || 'jpeg|jpg|png|webp';
    if (!file) return false;
    const typeRe = new RegExp('^image/(' + ok + ')$', 'i');
    const nameRe = new RegExp('\\.(' + ok.replace(/jpeg\|jpg/, 'jpe?g') + ')$', 'i');
    return typeRe.test(file.type) || nameRe.test(file.name);
}

function toolBindDrop(onFiles) {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    if (!dropZone || !fileInput) return;
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const list = [...e.dataTransfer.files];
        if (list.length) onFiles(list);
    });
    fileInput.addEventListener('change', () => {
        const list = [...fileInput.files];
        if (list.length) onFiles(list);
    });
}

function toolLoadImageFile(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Could not read image.'));
        img.src = URL.createObjectURL(file);
    });
}

function toolFormatBytes(n) {
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
    return (n / (1024 * 1024)).toFixed(2) + ' MB';
}

const TOOL_RELATED_LINKS = [
    { href: '/', label: 'Stamp Maker' },
    { href: 'watermark-pdf.html', label: 'Watermark' },
    { href: 'sign-pdf.html', label: 'Sign PDF' },
    { href: 'date-stamp.html', label: 'Date Stamp' },
    { href: 'merge-pdf.html', label: 'Merge PDF' },
    { href: 'split-pdf.html', label: 'Split PDF' },
    { href: 'compress-pdf.html', label: 'Compress PDF' },
    { href: 'delete-pdf-pages.html', label: 'Delete Pages' },
    { href: 'organize-pdf.html', label: 'Organize PDF' },
    { href: 'extract-pdf-text.html', label: 'Extract Text' },
    { href: 'crop-pdf.html', label: 'Crop PDF' },
    { href: 'header-footer-pdf.html', label: 'Header Footer' },
    { href: 'pdf-to-jpg.html', label: 'PDF to JPG' },
    { href: 'image-to-pdf.html', label: 'Image to PDF' },
    { href: 'rotate-pdf.html', label: 'Rotate PDF' },
    { href: 'page-numbers-pdf.html', label: 'Page Numbers' },
    { href: 'pdf-to-png.html', label: 'PDF to PNG' },
    { href: 'grayscale-pdf.html', label: 'Grayscale PDF' },
    { href: 'reverse-pdf.html', label: 'Reverse PDF' },
    { href: 'text-to-pdf.html', label: 'Text to PDF' },
    { href: 'add-blank-pages.html', label: 'Blank Pages' },
    { href: 'resize-pdf.html', label: 'Resize PDF' },
    { href: 'pdf-to-zip.html', label: 'PDF to ZIP' },
    { href: 'remove-pdf-metadata.html', label: 'Remove Metadata' },
    { href: 'nup-pdf.html', label: '2-Up PDF' },
    { href: 'flip-pdf.html', label: 'Flip PDF' },
    { href: 'compress-image.html', label: 'Compress Image' },
    { href: 'resize-image.html', label: 'Resize Image' },
    { href: 'png-to-jpg.html', label: 'PNG to JPG' },
    { href: 'jpg-to-png.html', label: 'JPG to PNG' },
    { href: 'webp-to-pdf.html', label: 'WEBP to PDF' }
];

function toolCurrentPage() {
    const name = (location.pathname.split('/').pop() || '').toLowerCase();
    if (!name || name === 'index.html') return '/';
    return name;
}

function toolInjectRelated() {
    if (document.querySelector('.related-tools')) return;
    const current = toolCurrentPage();
    if (current === 'tools.html') return;
    const after = document.querySelector('.tool-layout');
    if (!after) return;
    const others = TOOL_RELATED_LINKS.filter((t) => t.href !== current);
    const section = document.createElement('section');
    section.className = 'related-tools';
    section.innerHTML = '<h2>More private tools</h2><div class="related-tools-row">' +
        others.map((t) => `<a href="${t.href}">${t.label}</a>`).join('') +
        '</div>';
    after.insertAdjacentElement('afterend', section);
}

function toolInjectAdsLater() {
    const inject = () => {
        if (document.getElementById('adsbygoogle-js')) return;
        const s = document.createElement('script');
        s.id = 'adsbygoogle-js';
        s.async = true;
        s.crossOrigin = 'anonymous';
        s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2509436669190309';
        document.body.appendChild(s);
    };
    if ('requestIdleCallback' in window) requestIdleCallback(inject, { timeout: 5000 });
    else setTimeout(inject, 2500);
}

document.addEventListener('DOMContentLoaded', () => {
    toolInjectRelated();
    toolInjectAdsLater();
});
