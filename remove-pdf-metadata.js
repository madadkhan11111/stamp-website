document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewWrap = document.getElementById('preview-wrap');
    const status = document.getElementById('status');
    let pdfBytes = null;
    let fileName = 'clean.pdf';

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
            fileName = file.name.replace(/\.pdf$/i, '') + '-clean.pdf';
            const src = await PDFLib.PDFDocument.load(pdfBytes.slice(0));
            const info = [
                src.getTitle && src.getTitle(),
                src.getAuthor && src.getAuthor(),
                src.getSubject && src.getSubject()
            ].filter(Boolean);
            const doc = await pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise;
            exportBtn.disabled = false;
            clearBtn.disabled = false;
            status.textContent = info.length
                ? `Found metadata: ${info.join(' · ')}`
                : `${doc.numPages} page(s). A clean copy will still strip hidden tags.`;
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
        toolShowLoading('Removing metadata...');
        try {
            const src = await PDFLib.PDFDocument.load(pdfBytes.slice(0));
            const out = await PDFLib.PDFDocument.create();
            const pages = await out.copyPages(src, src.getPageIndices());
            pages.forEach((p) => out.addPage(p));
            out.setTitle('');
            out.setAuthor('');
            out.setSubject('');
            out.setKeywords([]);
            out.setProducer('');
            out.setCreator('Online Stamp Doc');
            toolDownloadBlob(new Blob([await out.save()], { type: 'application/pdf' }), fileName);
        } catch (e) {
            console.error(e);
            alert('Could not strip metadata.');
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
