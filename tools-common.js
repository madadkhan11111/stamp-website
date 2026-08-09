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

document.addEventListener('DOMContentLoaded', toolInjectAdsLater);
