document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewWrap = document.getElementById('preview-wrap');
    const status = document.getElementById('status');
    const where = document.getElementById('where');
    const afterPage = document.getElementById('after-page');
    const count = document.getElementById('count');
    let pdfBytes = null;
    let pageCount = 0;
    let fileName = 'blank-pages.pdf';

    where.addEventListener('change', () => {
        afterPage.disabled = where.value !== 'after';
    });
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
            fileName = file.name.replace(/\.pdf$/i, '') + '-blank.pdf';
            const doc = await pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise;
            pageCount = doc.numPages;
            afterPage.max = pageCount;
            exportBtn.disabled = false;
            clearBtn.disabled = false;
            status.textContent = `${pageCount} page(s) ready.`;
            const page = await doc.getPage(1);
            const viewport = page.getViewport({ scale: 1.2 });
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
        const n = Math.max(1, Math.min(20, Number(count.value) || 1));
        toolShowLoading('Inserting blank pages...');
        try {
            const src = await PDFLib.PDFDocument.load(pdfBytes.slice(0));
            const out = await PDFLib.PDFDocument.create();
            const copied = await out.copyPages(src, src.getPageIndices());
            const size = copied[0].getSize();
            const insertBlanks = () => {
                for (let i = 0; i < n; i++) out.addPage([size.width, size.height]);
            };
            if (where.value === 'start') {
                insertBlanks();
                copied.forEach((p) => out.addPage(p));
            } else if (where.value === 'after') {
                const after = Math.max(1, Math.min(pageCount, Number(afterPage.value) || 1));
                copied.forEach((p, i) => {
                    out.addPage(p);
                    if (i + 1 === after) insertBlanks();
                });
            } else {
                copied.forEach((p) => out.addPage(p));
                insertBlanks();
            }
            toolDownloadBlob(new Blob([await out.save()], { type: 'application/pdf' }), fileName);
        } catch (e) {
            console.error(e);
            alert('Could not add blank pages.');
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
