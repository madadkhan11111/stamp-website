document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewWrap = document.getElementById('preview-wrap');
    const pagesInput = document.getElementById('pages');
    const status = document.getElementById('status');

    let pdfBytes = null;
    let pageCount = 0;
    let fileName = 'pages-removed.pdf';

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', () => { if (fileInput.files[0]) handleFile(fileInput.files[0]); });
    clearBtn.addEventListener('click', resetAll);
    exportBtn.addEventListener('click', exportPdf);
    pagesInput.addEventListener('input', updateStatus);

    function parseDeleteSet(str, max) {
        const set = new Set();
        for (const part of String(str || '').split(',')) {
            const token = part.trim();
            if (!token) continue;
            if (token.includes('-')) {
                const [aRaw, bRaw] = token.split('-');
                const a = Number(aRaw);
                const b = Number(bRaw);
                if (!a || !b) continue;
                const from = Math.min(a, b);
                const to = Math.max(a, b);
                for (let i = from; i <= to; i++) {
                    if (i >= 1 && i <= max) set.add(i);
                }
            } else {
                const n = Number(token);
                if (n >= 1 && n <= max) set.add(n);
            }
        }
        return set;
    }

    function updateStatus() {
        if (!pageCount) {
            status.textContent = '';
            return;
        }
        const remove = parseDeleteSet(pagesInput.value, pageCount);
        const keep = pageCount - remove.size;
        if (!remove.size) {
            status.textContent = `${pageCount} page(s). Enter pages to delete, like 2 or 4-6.`;
        } else {
            status.textContent = `Will delete ${remove.size} page(s) and keep ${keep}.`;
        }
    }

    async function handleFile(file) {
        if (!toolIsPdf(file)) return alert('Choose a PDF.');
        if (file.size > 10 * 1024 * 1024) return alert('Max 10MB.');
        toolShowLoading('Loading PDF...');
        try {
            await ensureToolPdfLibs();
            pdfBytes = await file.arrayBuffer();
            fileName = file.name.replace(/\.pdf$/i, '') + '-pages-removed.pdf';
            const doc = await pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise;
            pageCount = doc.numPages;
            pagesInput.disabled = false;
            pagesInput.value = '';
            exportBtn.disabled = false;
            clearBtn.disabled = false;
            updateStatus();
            await renderPreview();
        } catch (e) {
            console.error(e);
            alert('Could not open PDF.');
            resetAll();
        } finally {
            toolHideLoading();
        }
    }

    async function renderPreview() {
        const doc = await pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise;
        const page = await doc.getPage(1);
        const viewport = page.getViewport({ scale: 1.2 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.maxWidth = '100%';
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        previewWrap.innerHTML = '';
        previewWrap.appendChild(canvas);
    }

    async function exportPdf() {
        const remove = parseDeleteSet(pagesInput.value, pageCount);
        if (!remove.size) return alert('Enter at least one page to delete.');
        if (remove.size >= pageCount) return alert('Keep at least one page.');
        toolShowLoading('Removing pages...');
        try {
            const src = await PDFLib.PDFDocument.load(pdfBytes.slice(0));
            const keep = src.getPageIndices().filter((i) => !remove.has(i + 1));
            const outDoc = await PDFLib.PDFDocument.create();
            const copied = await outDoc.copyPages(src, keep);
            copied.forEach((p) => outDoc.addPage(p));
            const out = await outDoc.save();
            toolDownloadBlob(new Blob([out], { type: 'application/pdf' }), fileName);
        } catch (e) {
            console.error(e);
            alert('Could not delete pages.');
        } finally {
            toolHideLoading();
        }
    }

    function resetAll() {
        pdfBytes = null;
        pageCount = 0;
        fileInput.value = '';
        pagesInput.value = '';
        pagesInput.disabled = true;
        exportBtn.disabled = true;
        clearBtn.disabled = true;
        status.textContent = '';
        previewWrap.innerHTML = '<p style="color:var(--text-secondary);">Upload a PDF to preview page 1.</p>';
    }
});
