document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewWrap = document.getElementById('preview-wrap');
    const angle = document.getElementById('angle');
    const status = document.getElementById('status');

    let pdfBytes = null;
    let fileName = 'rotated.pdf';

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });
    fileInput.addEventListener('change', () => { if (fileInput.files[0]) handleFile(fileInput.files[0]); });
    clearBtn.addEventListener('click', resetAll);
    exportBtn.addEventListener('click', exportPdf);
    angle.addEventListener('change', () => { if (pdfBytes) renderPreview(); });

    async function handleFile(file) {
        if (!file || (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name))) return alert('Choose a PDF.');
        if (file.size > 10 * 1024 * 1024) return alert('Max 10MB.');
        toolShowLoading('Loading PDF...');
        try {
            await ensureToolPdfLibs();
            pdfBytes = await file.arrayBuffer();
            fileName = file.name.replace(/\.pdf$/i, '') + '-rotated.pdf';
            const doc = await pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise;
            status.textContent = `${doc.numPages} page(s) ready.`;
            exportBtn.disabled = false;
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

    async function renderPreview() {
        const rot = Number(angle.value);
        const doc = await pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise;
        const page = await doc.getPage(1);
        const viewport = page.getViewport({ scale: 1.2, rotation: (page.rotate || 0) + rot });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.maxWidth = '100%';
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        previewWrap.innerHTML = '';
        previewWrap.appendChild(canvas);
    }

    async function exportPdf() {
        toolShowLoading('Rotating...');
        try {
            const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes.slice(0));
            const rot = Number(angle.value);
            pdfDoc.getPages().forEach((page) => {
                page.setRotation(PDFLib.degrees((page.getRotation().angle + rot) % 360));
            });
            const out = await pdfDoc.save();
            toolDownloadBlob(new Blob([out], { type: 'application/pdf' }), fileName);
        } catch (e) {
            console.error(e);
            alert('Rotate failed.');
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
