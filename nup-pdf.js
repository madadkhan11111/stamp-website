document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewWrap = document.getElementById('preview-wrap');
    const status = document.getElementById('status');
    let pdfBytes = null;
    let fileName = '2up.pdf';

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
            fileName = file.name.replace(/\.pdf$/i, '') + '-2up.pdf';
            const doc = await pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise;
            exportBtn.disabled = false;
            clearBtn.disabled = false;
            status.textContent = `${doc.numPages} page(s) will be placed two per sheet.`;
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
        toolShowLoading('Building 2-up PDF...');
        try {
            const src = await PDFLib.PDFDocument.load(pdfBytes.slice(0));
            const out = await PDFLib.PDFDocument.create();
            const embedded = await out.embedPages(src.getPages());
            const sheetW = 841.89;
            const sheetH = 595.28;
            const gap = 12;
            const cellW = (sheetW - gap * 3) / 2;
            const cellH = sheetH - gap * 2;
            for (let i = 0; i < embedded.length; i += 2) {
                const page = out.addPage([sheetW, sheetH]);
                [0, 1].forEach((slot) => {
                    const emb = embedded[i + slot];
                    if (!emb) return;
                    const scale = Math.min(cellW / emb.width, cellH / emb.height);
                    const w = emb.width * scale;
                    const h = emb.height * scale;
                    const x = gap + slot * (cellW + gap) + (cellW - w) / 2;
                    const y = gap + (cellH - h) / 2;
                    page.drawPage(emb, { x, y, width: w, height: h });
                });
            }
            toolDownloadBlob(new Blob([await out.save()], { type: 'application/pdf' }), fileName);
        } catch (e) {
            console.error(e);
            alert('2-up layout failed.');
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
