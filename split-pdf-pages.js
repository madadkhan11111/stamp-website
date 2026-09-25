document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewWrap = document.getElementById('preview-wrap');
    const status = document.getElementById('status');
    let pdfBytes = null;
    let fileName = 'pages.zip';

    toolBindDrop((files) => handleFile(files[0]));
    clearBtn.addEventListener('click', resetAll);
    exportBtn.addEventListener('click', exportZip);

    async function handleFile(file) {
        if (!toolIsPdf(file)) return alert('Choose a PDF.');
        if (file.size > 10 * 1024 * 1024) return alert('Max 10MB.');
        toolShowLoading('Loading PDF...');
        try {
            await ensureToolPdfLibs();
            pdfBytes = await file.arrayBuffer();
            fileName = file.name.replace(/\.pdf$/i, '') + '-pages.zip';
            const doc = await pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise;
            exportBtn.disabled = false;
            clearBtn.disabled = false;
            status.textContent = `${doc.numPages} page(s) will become separate PDF files.`;
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

    async function exportZip() {
        toolShowLoading('Splitting pages...');
        try {
            await toolEnsureZip();
            const src = await PDFLib.PDFDocument.load(pdfBytes.slice(0));
            const zip = new JSZip();
            const n = src.getPageCount();
            for (let i = 0; i < n; i++) {
                toolShowLoading(`Saving page ${i + 1} of ${n}...`);
                const one = await PDFLib.PDFDocument.create();
                const [copied] = await one.copyPages(src, [i]);
                one.addPage(copied);
                zip.file(`page-${String(i + 1).padStart(2, '0')}.pdf`, await one.save());
            }
            toolDownloadBlob(await zip.generateAsync({ type: 'blob' }), fileName);
        } catch (e) {
            console.error(e);
            alert('Split to ZIP failed.');
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
