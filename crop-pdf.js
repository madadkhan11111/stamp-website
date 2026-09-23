document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewWrap = document.getElementById('preview-wrap');
    const status = document.getElementById('status');
    const top = document.getElementById('top');
    const bottom = document.getElementById('bottom');
    const left = document.getElementById('left');
    const right = document.getElementById('right');

    let pdfBytes = null;
    let fileName = 'cropped.pdf';

    function bindPct(input, label) {
        const sync = () => { label.textContent = input.value + '%'; if (pdfBytes) renderPreview(); };
        input.addEventListener('input', sync);
        sync();
    }
    bindPct(top, document.getElementById('top-val'));
    bindPct(bottom, document.getElementById('bottom-val'));
    bindPct(left, document.getElementById('left-val'));
    bindPct(right, document.getElementById('right-val'));

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
            pdfBytes = await file.arrayBuffer();
            fileName = file.name.replace(/\.pdf$/i, '') + '-cropped.pdf';
            const doc = await pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise;
            exportBtn.disabled = false;
            clearBtn.disabled = false;
            status.textContent = `${doc.numPages} page(s) ready to crop.`;
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
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
        const t = canvas.height * (Number(top.value) / 100);
        const b = canvas.height * (Number(bottom.value) / 100);
        const l = canvas.width * (Number(left.value) / 100);
        const r = canvas.width * (Number(right.value) / 100);
        ctx.save();
        ctx.fillStyle = 'rgba(10, 10, 20, 0.45)';
        ctx.fillRect(0, 0, canvas.width, t);
        ctx.fillRect(0, canvas.height - b, canvas.width, b);
        ctx.fillRect(0, t, l, canvas.height - t - b);
        ctx.fillRect(canvas.width - r, t, r, canvas.height - t - b);
        ctx.strokeStyle = 'rgba(99,102,241,0.9)';
        ctx.lineWidth = 2;
        ctx.strokeRect(l, t, canvas.width - l - r, canvas.height - t - b);
        ctx.restore();
        previewWrap.innerHTML = '';
        previewWrap.appendChild(canvas);
    }

    async function exportPdf() {
        const tPct = Number(top.value) / 100;
        const bPct = Number(bottom.value) / 100;
        const lPct = Number(left.value) / 100;
        const rPct = Number(right.value) / 100;
        if (tPct + bPct >= 0.9 || lPct + rPct >= 0.9) return alert('Crop is too aggressive. Leave more of the page.');
        toolShowLoading('Cropping PDF...');
        try {
            const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes.slice(0));
            pdfDoc.getPages().forEach((page) => {
                const { width, height } = page.getSize();
                const x = width * lPct;
                const y = height * bPct;
                const w = width * (1 - lPct - rPct);
                const h = height * (1 - tPct - bPct);
                page.setCropBox(x, y, w, h);
            });
            const out = await pdfDoc.save();
            toolDownloadBlob(new Blob([out], { type: 'application/pdf' }), fileName);
        } catch (e) {
            console.error(e);
            alert('Crop failed.');
        } finally {
            toolHideLoading();
        }
    }

    function resetAll() {
        pdfBytes = null;
        fileInput.value = '';
        exportBtn.disabled = true;
        clearBtn.disabled = true;
        status.textContent = '';
        previewWrap.innerHTML = '<p style="color:var(--text-secondary);">Upload a PDF to preview page 1.</p>';
    }
});
