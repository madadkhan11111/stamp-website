document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewWrap = document.getElementById('preview-wrap');
    const mode = document.getElementById('mode');
    const status = document.getElementById('status');
    let pdfBytes = null;
    let fileName = 'flipped.pdf';

    toolBindDrop((files) => handleFile(files[0]));
    clearBtn.addEventListener('click', resetAll);
    exportBtn.addEventListener('click', exportPdf);
    mode.addEventListener('change', () => { if (pdfBytes) renderPreview(); });

    async function handleFile(file) {
        if (!toolIsPdf(file)) return alert('Choose a PDF.');
        if (file.size > 10 * 1024 * 1024) return alert('Max 10MB.');
        toolShowLoading('Loading PDF...');
        try {
            await ensureToolPdfLibs();
            pdfBytes = await file.arrayBuffer();
            fileName = file.name.replace(/\.pdf$/i, '') + '-flipped.pdf';
            const doc = await pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise;
            exportBtn.disabled = false;
            clearBtn.disabled = false;
            status.textContent = `${doc.numPages} page(s) ready.`;
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
        if (mode.value === 'h') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        } else {
            ctx.translate(0, canvas.height);
            ctx.scale(1, -1);
        }
        await page.render({ canvasContext: ctx, viewport }).promise;
        previewWrap.innerHTML = '';
        previewWrap.appendChild(canvas);
    }

    async function exportPdf() {
        toolShowLoading('Flipping pages...');
        try {
            const src = await PDFLib.PDFDocument.load(pdfBytes.slice(0));
            const out = await PDFLib.PDFDocument.create();
            const embedded = await out.embedPages(src.getPages());
            embedded.forEach((emb) => {
                const page = out.addPage([emb.width, emb.height]);
                if (mode.value === 'h') {
                    page.drawPage(emb, { x: emb.width, y: 0, width: -emb.width, height: emb.height });
                } else {
                    page.drawPage(emb, { x: 0, y: emb.height, width: emb.width, height: -emb.height });
                }
            });
            toolDownloadBlob(new Blob([await out.save()], { type: 'application/pdf' }), fileName);
        } catch (e) {
            console.error(e);
            alert('Flip failed.');
        } finally {
            toolHideLoading();
        }
    }

    function resetAll() {
        pdfBytes = null;
        document.getElementById('file-input').value = '';
        exportBtn.disabled = true;
        clearBtn.disabled = true;
        status.textContent = '';
        previewWrap.innerHTML = '<p style="color:var(--text-secondary);">Upload a PDF to preview page 1.</p>';
    }
});
