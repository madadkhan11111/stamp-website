document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewWrap = document.getElementById('preview-wrap');
    const quality = document.getElementById('quality');
    const status = document.getElementById('status');
    let pdfjsDoc = null;
    let fileName = 'pages.zip';

    quality.addEventListener('input', () => {
        document.getElementById('quality-val').textContent = quality.value;
    });
    toolBindDrop((files) => handleFile(files[0]));
    clearBtn.addEventListener('click', resetAll);
    exportBtn.addEventListener('click', exportZip);

    async function handleFile(file) {
        if (!toolIsPdf(file)) return alert('Choose a PDF.');
        if (file.size > 10 * 1024 * 1024) return alert('Max 10MB.');
        toolShowLoading('Loading PDF...');
        try {
            await ensureToolPdfLibs();
            pdfjsDoc = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
            fileName = file.name.replace(/\.pdf$/i, '') + '-pages.zip';
            exportBtn.disabled = false;
            clearBtn.disabled = false;
            status.textContent = `${pdfjsDoc.numPages} page(s) will be packed as JPGs.`;
            const page = await pdfjsDoc.getPage(1);
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

    function canvasToJpeg(canvas, q) {
        return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/jpeg', q));
    }

    async function exportZip() {
        toolShowLoading('Building ZIP...');
        try {
            await toolLoadScript('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js');
            const zip = new JSZip();
            for (let i = 1; i <= pdfjsDoc.numPages; i++) {
                toolShowLoading(`Adding page ${i} of ${pdfjsDoc.numPages}...`);
                const page = await pdfjsDoc.getPage(i);
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
                const blob = await canvasToJpeg(canvas, Number(quality.value));
                zip.file(`page-${String(i).padStart(2, '0')}.jpg`, blob);
            }
            const out = await zip.generateAsync({ type: 'blob' });
            toolDownloadBlob(out, fileName);
        } catch (e) {
            console.error(e);
            alert('ZIP export failed.');
        } finally {
            toolHideLoading();
        }
    }

    function resetAll() {
        pdfjsDoc = null;
        document.getElementById('file-input').value = '';
        exportBtn.disabled = true;
        clearBtn.disabled = true;
        status.textContent = '';
        previewWrap.innerHTML = '<p style="color:var(--text-secondary);">Upload a PDF to preview page 1.</p>';
    }
});
