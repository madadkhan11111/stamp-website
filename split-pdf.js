document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewWrap = document.getElementById('preview-wrap');
    const fromPage = document.getElementById('from-page');
    const toPage = document.getElementById('to-page');
    const status = document.getElementById('status');

    let pdfBytes = null;
    let pageCount = 0;
    let fileName = 'split.pdf';

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
    fromPage.addEventListener('change', syncRange);
    toPage.addEventListener('change', syncRange);

    function syncRange() {
        let from = Number(fromPage.value) || 1;
        let to = Number(toPage.value) || 1;
        from = Math.max(1, Math.min(from, pageCount));
        to = Math.max(from, Math.min(to, pageCount));
        fromPage.value = from;
        toPage.value = to;
        status.textContent = `Will extract pages ${from}–${to} of ${pageCount}.`;
        if (pdfBytes) renderPreview(from);
    }

    async function handleFile(file) {
        if (!file || (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name))) return alert('Choose a PDF.');
        if (file.size > 10 * 1024 * 1024) return alert('Max 10MB.');
        toolShowLoading('Loading PDF...');
        try {
            await ensureToolPdfLibs();
            pdfBytes = await file.arrayBuffer();
            fileName = file.name.replace(/\.pdf$/i, '') + '-split.pdf';
            const doc = await pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise;
            pageCount = doc.numPages;
            fromPage.disabled = false;
            toPage.disabled = false;
            fromPage.max = pageCount;
            toPage.max = pageCount;
            fromPage.value = 1;
            toPage.value = pageCount;
            exportBtn.disabled = false;
            clearBtn.disabled = false;
            status.textContent = `${pageCount} page(s) ready.`;
            await renderPreview(1);
        } catch (e) {
            console.error(e);
            alert('Could not open PDF.');
            resetAll();
        } finally {
            toolHideLoading();
        }
    }

    async function renderPreview(num) {
        const doc = await pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise;
        const page = await doc.getPage(num);
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
        const from = Number(fromPage.value) || 1;
        const to = Number(toPage.value) || 1;
        if (from < 1 || to > pageCount || from > to) return alert('Invalid page range.');
        toolShowLoading('Splitting PDF...');
        try {
            const src = await PDFLib.PDFDocument.load(pdfBytes.slice(0));
            const outDoc = await PDFLib.PDFDocument.create();
            const indices = [];
            for (let i = from - 1; i <= to - 1; i++) indices.push(i);
            const pages = await outDoc.copyPages(src, indices);
            pages.forEach((p) => outDoc.addPage(p));
            const out = await outDoc.save();
            toolDownloadBlob(new Blob([out], { type: 'application/pdf' }), fileName);
        } catch (e) {
            console.error(e);
            alert('Split failed.');
        } finally {
            toolHideLoading();
        }
    }

    function resetAll() {
        pdfBytes = null;
        pageCount = 0;
        fileInput.value = '';
        fromPage.value = 1;
        toPage.value = 1;
        fromPage.disabled = true;
        toPage.disabled = true;
        exportBtn.disabled = true;
        clearBtn.disabled = true;
        status.textContent = '';
        previewWrap.innerHTML = '<p style="color:var(--text-secondary);">Upload a PDF to preview page 1.</p>';
    }
});
