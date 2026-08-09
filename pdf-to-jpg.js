document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const exportBtn = document.getElementById('export-btn');
    const exportAllBtn = document.getElementById('export-all-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewWrap = document.getElementById('preview-wrap');
    const quality = document.getElementById('quality');
    const scale = document.getElementById('scale');
    const status = document.getElementById('status');

    let pdfjsDoc = null;
    let fileName = 'document.pdf';

    quality.addEventListener('input', () => { document.getElementById('quality-val').textContent = quality.value; });
    scale.addEventListener('input', () => { document.getElementById('scale-val').textContent = scale.value; if (pdfjsDoc) renderPreview(); });

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });
    fileInput.addEventListener('change', () => { if (fileInput.files[0]) handleFile(fileInput.files[0]); });
    clearBtn.addEventListener('click', resetAll);
    exportBtn.addEventListener('click', () => downloadPage(1));
    exportAllBtn.addEventListener('click', downloadAll);

    async function handleFile(file) {
        if (!file || file.type !== 'application/pdf') return alert('Choose a PDF file.');
        if (file.size > 10 * 1024 * 1024) return alert('Max 10MB.');
        toolShowLoading('Loading PDF...');
        try {
            await ensureToolPdfLibs();
            const bytes = await file.arrayBuffer();
            fileName = file.name;
            pdfjsDoc = await pdfjsLib.getDocument({ data: bytes }).promise;
            status.textContent = `${pdfjsDoc.numPages} page(s) ready.`;
            exportBtn.disabled = false;
            exportAllBtn.disabled = false;
            clearBtn.disabled = false;
            await renderPreview();
        } catch (e) {
            console.error(e);
            alert('Could not open PDF.');
            resetAll();
        } finally {
            toolHideLoading();
        }
    }

    async function renderPageToCanvas(num) {
        const page = await pdfjsDoc.getPage(num);
        const viewport = page.getViewport({ scale: Number(scale.value) });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        return canvas;
    }

    async function renderPreview() {
        const canvas = await renderPageToCanvas(1);
        canvas.style.maxWidth = '100%';
        previewWrap.innerHTML = '';
        previewWrap.appendChild(canvas);
    }

    async function downloadPage(num) {
        toolShowLoading(`Exporting page ${num}...`);
        try {
            const canvas = await renderPageToCanvas(num);
            const a = document.createElement('a');
            const base = fileName.replace(/\.pdf$/i, '');
            a.download = `${base}-page-${num}.jpg`;
            a.href = canvas.toDataURL('image/jpeg', Number(quality.value));
            a.click();
        } finally {
            toolHideLoading();
        }
    }

    async function downloadAll() {
        for (let i = 1; i <= pdfjsDoc.numPages; i++) {
            await downloadPage(i);
            await new Promise((r) => setTimeout(r, 250));
        }
    }

    function resetAll() {
        pdfjsDoc = null;
        fileInput.value = '';
        exportBtn.disabled = true;
        exportAllBtn.disabled = true;
        clearBtn.disabled = true;
        status.textContent = '';
        previewWrap.innerHTML = '<p style="color:var(--text-secondary);">Upload a PDF to preview page 1.</p>';
    }
});
