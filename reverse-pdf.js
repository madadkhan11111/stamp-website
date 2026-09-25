document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewWrap = document.getElementById('preview-wrap');
    const status = document.getElementById('status');
    let pdfBytes = null;
    let pageCount = 0;
    let fileName = 'reversed.pdf';

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
            fileName = file.name.replace(/\.pdf$/i, '') + '-reversed.pdf';
            const doc = await pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise;
            pageCount = doc.numPages;
            exportBtn.disabled = false;
            clearBtn.disabled = false;
            status.textContent = `${pageCount} page(s). Download will reverse 1→${pageCount} to ${pageCount}→1.`;
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
        toolShowLoading('Reversing pages...');
        try {
            const src = await PDFLib.PDFDocument.load(pdfBytes.slice(0));
            const out = await PDFLib.PDFDocument.create();
            const order = src.getPageIndices().slice().reverse();
            const pages = await out.copyPages(src, order);
            pages.forEach((p) => out.addPage(p));
            toolDownloadBlob(new Blob([await out.save()], { type: 'application/pdf' }), fileName);
        } catch (e) {
            console.error(e);
            alert('Reverse failed.');
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
        previewWrap.innerHTML = '<p style="color:var(--text-secondary);">Upload a PDF to preview the current first page.</p>';
    }
});
