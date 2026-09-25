document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-btn');
    const exportAllBtn = document.getElementById('export-all-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewWrap = document.getElementById('preview-wrap');
    const scale = document.getElementById('scale');
    const status = document.getElementById('status');
    let pdfjsDoc = null;
    let fileName = 'document.pdf';

    scale.addEventListener('input', () => {
        document.getElementById('scale-val').textContent = scale.value;
        if (pdfjsDoc) renderPreview();
    });
    toolBindDrop((files) => handleFile(files[0]));
    clearBtn.addEventListener('click', resetAll);
    exportBtn.addEventListener('click', () => downloadPage(1));
    exportAllBtn.addEventListener('click', downloadAll);

    async function handleFile(file) {
        if (!toolIsPdf(file)) return alert('Choose a PDF.');
        if (file.size > 10 * 1024 * 1024) return alert('Max 10MB.');
        toolShowLoading('Loading PDF...');
        try {
            await ensureToolPdfLibs();
            pdfjsDoc = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
            fileName = file.name;
            exportBtn.disabled = false;
            exportAllBtn.disabled = false;
            clearBtn.disabled = false;
            status.textContent = `${pdfjsDoc.numPages} page(s) ready.`;
            await renderPreview();
        } catch (e) {
            console.error(e);
            alert('Could not open PDF.');
            resetAll();
        } finally {
            toolHideLoading();
        }
    }

    async function renderPage(num) {
        const page = await pdfjsDoc.getPage(num);
        const viewport = page.getViewport({ scale: Number(scale.value) });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        return canvas;
    }

    async function renderPreview() {
        const canvas = await renderPage(1);
        canvas.style.maxWidth = '100%';
        previewWrap.innerHTML = '';
        previewWrap.appendChild(canvas);
    }

    async function downloadPage(num) {
        toolShowLoading(`Exporting page ${num}...`);
        try {
            const canvas = await renderPage(num);
            const a = document.createElement('a');
            a.download = fileName.replace(/\.pdf$/i, '') + `-page-${num}.png`;
            a.href = canvas.toDataURL('image/png');
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
        document.getElementById('file-input').value = '';
        exportBtn.disabled = true;
        exportAllBtn.disabled = true;
        clearBtn.disabled = true;
        status.textContent = '';
        previewWrap.innerHTML = '<p style="color:var(--text-secondary);">Upload a PDF to preview page 1.</p>';
    }
});
