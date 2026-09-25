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

function toolIsHeic(file) {
    return !!(file && (/image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name)));
}

function toolEnsureZip() {
    if (window.JSZip) return Promise.resolve();
    return toolLoadScript('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js');
}

function toolEnsureHeic() {
    if (window.heic2any) return Promise.resolve();
    return toolLoadScript('https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js');
}

async function toolHeicToJpegBlob(file, quality) {
    await toolEnsureHeic();
    const out = await window.heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: quality == null ? 0.9 : quality
    });
    return Array.isArray(out) ? out[0] : out;
}

function toolCanvasBlob(canvas, type, quality) {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) reject(new Error('Could not encode image.'));
            else resolve(blob);
        }, type || 'image/jpeg', quality);
    });
}

const TOOL_PAGE_SIZES = {
    a4: { width: 595.28, height: 841.89 },
    letter: { width: 612, height: 792 }
};

async function toolFilesToPdf(files, filename, pageKey) {
    await ensureToolPdfLibs();
    const pdfDoc = await PDFLib.PDFDocument.create();
    for (const file of files) {
        const isPng = /png/i.test(file.type) || /\.png$/i.test(file.name);
        let image;
        try {
            const bytes = await file.arrayBuffer();
            image = isPng ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);
        } catch (e) {
            const img = await toolLoadImageFile(file);
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (!isPng) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            ctx.drawImage(img, 0, 0);
            const blob = await toolCanvasBlob(canvas, isPng ? 'image/png' : 'image/jpeg', 0.92);
            const bytes = await blob.arrayBuffer();
            image = isPng ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);
        }
        let pageW = image.width;
        let pageH = image.height;
        let drawW = image.width;
        let drawH = image.height;
        let x = 0;
        let y = 0;
        const paper = TOOL_PAGE_SIZES[pageKey];
        if (paper) {
            pageW = paper.width;
            pageH = paper.height;
            const scale = Math.min(pageW / image.width, pageH / image.height);
            drawW = image.width * scale;
            drawH = image.height * scale;
            x = (pageW - drawW) / 2;
            y = (pageH - drawH) / 2;
        }
        const page = pdfDoc.addPage([pageW, pageH]);
        page.drawImage(image, { x: x, y: y, width: drawW, height: drawH });
    }
    const out = await pdfDoc.save();
    toolDownloadBlob(new Blob([out], { type: 'application/pdf' }), filename);
}

function toolEnhanceDropZone() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input') || document.getElementById('document-upload');
    if (!dropZone || dropZone.querySelector('.drop-select-btn')) return;
    if (!dropZone.classList.contains('tool-drop')) return;
    const btn = document.createElement('span');
    btn.className = 'drop-select-btn';
    const accept = ((fileInput && fileInput.getAttribute('accept')) || '').toLowerCase();
    const multi = !!(fileInput && fileInput.hasAttribute('multiple'));
    const pdfOnly = accept.includes('pdf') && !accept.includes('image') && !accept.includes('png') && !accept.includes('jpeg');
    const imgOnly = (accept.includes('image') || accept.includes('png') || accept.includes('jpeg') || accept.includes('heic')) && !accept.includes('pdf');
    if (pdfOnly) btn.textContent = multi ? 'Select PDF files' : 'Select PDF file';
    else if (imgOnly) btn.textContent = multi ? 'Select images' : 'Select image';
    else btn.textContent = multi ? 'Select files' : 'Select file';
    dropZone.appendChild(btn);
}

function toolBindDrop(onFiles) {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    if (!dropZone || !fileInput) return;
    toolEnhanceDropZone();
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
    { href: 'jpg-to-pdf.html', label: 'JPG to PDF' },
    { href: 'png-to-pdf.html', label: 'PNG to PDF' },
    { href: 'passport-photo.html', label: 'Passport Photo' },
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
    { href: 'webp-to-pdf.html', label: 'WEBP to PDF' },
    { href: 'heic-to-jpg.html', label: 'HEIC to JPG' },
    { href: 'heic-to-pdf.html', label: 'HEIC to PDF' },
    { href: 'extract-pdf-images.html', label: 'Extract Images' },
    { href: 'webp-to-jpg.html', label: 'WEBP to JPG' },
    { href: 'image-to-webp.html', label: 'Image to WEBP' },
    { href: 'crop-image.html', label: 'Crop Image' },
    { href: 'rotate-image.html', label: 'Rotate Image' },
    { href: 'flip-image.html', label: 'Flip Image' },
    { href: 'scan-to-pdf.html', label: 'Scan to PDF' },
    { href: 'split-pdf-pages.html', label: 'PDF to Single Pages' },
    { href: 'redact-pdf.html', label: 'Redact PDF' },
    { href: 'add-text-pdf.html', label: 'Add Text to PDF' },
    { href: 'fill-pdf.html', label: 'Fill PDF Form' },
    { href: 'compress-image-kb.html', label: 'Compress to 20KB' },
    { href: 'watermark-image.html', label: 'Watermark Image' },
    { href: 'avif-to-jpg.html', label: 'AVIF to JPG' }
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
    const others = TOOL_RELATED_LINKS.filter((t) => t.href !== current).slice(0, 10);
    const section = document.createElement('section');
    section.className = 'related-tools';
    section.innerHTML = '<h2>More private tools</h2><div class="related-tools-row">' +
        others.map((t) => `<a href="${t.href}">${t.label}</a>`).join('') +
        '<a href="tools.html">All tools</a>' +
        '</div>';
    after.insertAdjacentElement('afterend', section);
}

function toolInjectAdsLater() {
    /* Ads + consent are handled by ads-consent.js */
}

function toolEnsureSearch() {
    if (window.toolInitSearch) {
        window.toolInitSearch();
        return;
    }
    const s = document.createElement('script');
    s.src = 'tools-search.js';
    s.onload = function () {
        if (window.toolInitSearch) window.toolInitSearch();
    };
    document.body.appendChild(s);
}

document.addEventListener('DOMContentLoaded', () => {
    toolEnhanceDropZone();
    toolInjectRelated();
    toolInjectAdsLater();
    toolEnsureSearch();
});
