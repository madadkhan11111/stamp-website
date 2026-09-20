document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewWrap = document.getElementById('preview-wrap');
    const quality = document.getElementById('quality');
    const scale = document.getElementById('scale');
    const status = document.getElementById('status');

    let pdfjsDoc = null;
    let originalBytes = 0;
    let fileName = 'compressed.pdf';

    quality.addEventListener('input', () => {
        document.getElementById('quality-val').textContent = Math.round(Number(quality.value) * 100) + '%';
    });
    scale.addEventListener('input', () => {
        document.getElementById('scale-val').textContent = scale.value;
        if (pdfjsDoc) renderPreview();
    });

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

    async function handleFile(file) {
        if (!toolIsPdf(file)) return alert('Choose a PDF.');
        if (file.size > 10 * 1024 * 1024) return alert('Max 10MB.');
        toolShowLoading('Loading PDF...');
        try {
            await ensureToolPdfLibs();
            originalBytes = file.size;
            fileName = file.name.replace(/\.pdf$/i, '') + '-compressed.pdf';
            const bytes = await file.arrayBuffer();
            pdfjsDoc = await pdfjsLib.getDocument({ data: bytes }).promise;
            exportBtn.disabled = false;
            clearBtn.disabled = false;
            status.textContent = `${pdfjsDoc.numPages} page(s) · original ${toolFormatBytes(originalBytes)}.`;
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
        const page = await pdfjsDoc.getPage(1);
        const viewport = page.getViewport({ scale: Number(scale.value) });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.maxWidth = '100%';
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        previewWrap.innerHTML = '';
        previewWrap.appendChild(canvas);
    }

    async function pageToJpegBytes(num) {
        const page = await pdfjsDoc.getPage(num);
        const viewport = page.getViewport({ scale: Number(scale.value) });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        const dataUrl = canvas.toDataURL('image/jpeg', Number(quality.value));
        const res = await fetch(dataUrl);
        return res.arrayBuffer();
    }

    async function exportPdf() {
        toolShowLoading('Compressing PDF...');
        try {
            await ensureToolPdfLibs();
            const outDoc = await PDFLib.PDFDocument.create();
            for (let i = 1; i <= pdfjsDoc.numPages; i++) {
                toolShowLoading(`Compressing page ${i} of ${pdfjsDoc.numPages}...`);
                const jpegBytes = await pageToJpegBytes(i);
                const img = await outDoc.embedJpg(jpegBytes);
                const pg = outDoc.addPage([img.width, img.height]);
                pg.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
            }
            const out = await outDoc.save();
            const blob = new Blob([out], { type: 'application/pdf' });
            status.textContent = `Original ${toolFormatBytes(originalBytes)} → compressed ${toolFormatBytes(blob.size)}.`;
            toolDownloadBlob(blob, fileName);
        } catch (e) {
            console.error(e);
            alert('Compress failed. Try a smaller PDF or lower quality.');
        } finally {
            toolHideLoading();
        }
    }

    function resetAll() {
        pdfjsDoc = null;
        originalBytes = 0;
        fileInput.value = '';
        exportBtn.disabled = true;
        clearBtn.disabled = true;
        status.textContent = '';
        previewWrap.innerHTML = '<p style="color:var(--text-secondary);">Upload a PDF to preview page 1.</p>';
    }
});
