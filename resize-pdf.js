document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewWrap = document.getElementById('preview-wrap');
    const paper = document.getElementById('paper');
    const status = document.getElementById('status');
    let pdfBytes = null;
    let fileName = 'resized.pdf';
    const SIZES = { a4: [595.28, 841.89], letter: [612, 792], legal: [612, 1008] };

    toolBindDrop((files) => handleFile(files[0]));
    clearBtn.addEventListener('click', resetAll);
    exportBtn.addEventListener('click', exportPdf);

    async function handleFile(file) {
        if (!toolIsPdf(file)) return alert('Choose a PDF.');
        if (file.size > 10 * 1024 * 1024) return alert('Max 10MB.');
        toolShowLoading('Loading PDF...');
        try {
            await ensureToolPdfLibs();
            pdfBytes = await file.arrayBuffer();
            fileName = file.name.replace(/\.pdf$/i, '') + '-resized.pdf';
            const doc = await pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise;
            exportBtn.disabled = false;
            clearBtn.disabled = false;
            status.textContent = `${doc.numPages} page(s) ready.`;
            const page = await doc.getPage(1);
            const viewport = page.getViewport({ scale: 1.1 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            canvas.style.maxWidth = '100%';
            await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
            previewWrap.innerHTML = '';
            previewWrap.appendChild(canvas);
        } catch (e) {
            console.error(e);
            alert('Could not open PDF.');
            resetAll();
        } finally {
            toolHideLoading();
        }
    }

    async function exportPdf() {
        const [tw, th] = SIZES[paper.value] || SIZES.a4;
        toolShowLoading('Resizing pages...');
        try {
            const src = await PDFLib.PDFDocument.load(pdfBytes.slice(0));
            const out = await PDFLib.PDFDocument.create();
            const embedded = await out.embedPages(src.getPages());
            embedded.forEach((emb) => {
                const page = out.addPage([tw, th]);
                const scale = Math.min(tw / emb.width, th / emb.height);
                const w = emb.width * scale;
                const h = emb.height * scale;
                page.drawPage(emb, { x: (tw - w) / 2, y: (th - h) / 2, width: w, height: h });
            });
            toolDownloadBlob(new Blob([await out.save()], { type: 'application/pdf' }), fileName);
        } catch (e) {
            console.error(e);
            alert('Resize failed.');
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
