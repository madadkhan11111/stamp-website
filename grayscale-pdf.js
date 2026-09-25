document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewWrap = document.getElementById('preview-wrap');
    const quality = document.getElementById('quality');
    const status = document.getElementById('status');
    let pdfjsDoc = null;
    let fileName = 'grayscale.pdf';

    quality.addEventListener('input', () => {
        document.getElementById('quality-val').textContent = Math.round(Number(quality.value) * 100) + '%';
        if (pdfjsDoc) renderPreview();
    });
    toolBindDrop((files) => handleFile(files[0]));
    clearBtn.addEventListener('click', resetAll);
    exportBtn.addEventListener('click', exportPdf);

    function grayCanvas(canvas) {
        const ctx = canvas.getContext('2d');
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = img.data;
        for (let i = 0; i < d.length; i += 4) {
            const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
            d[i] = d[i + 1] = d[i + 2] = g;
        }
        ctx.putImageData(img, 0, 0);
        return canvas;
    }

    async function pageCanvas(num, scale) {
        const page = await pdfjsDoc.getPage(num);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        return grayCanvas(canvas);
    }

    async function handleFile(file) {
        if (!toolIsPdf(file)) return alert('Choose a PDF.');
        if (file.size > 10 * 1024 * 1024) return alert('Max 10MB.');
        toolShowLoading('Loading PDF...');
        try {
            await ensureToolPdfLibs();
            pdfjsDoc = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
            fileName = file.name.replace(/\.pdf$/i, '') + '-grayscale.pdf';
            exportBtn.disabled = false;
            clearBtn.disabled = false;
            status.textContent = `${pdfjsDoc.numPages} page(s) ready.`;
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
        const canvas = await pageCanvas(1, 1.1);
        canvas.style.maxWidth = '100%';
        previewWrap.innerHTML = '';
        previewWrap.appendChild(canvas);
    }

    async function exportPdf() {
        toolShowLoading('Converting to grayscale...');
        try {
            const outDoc = await PDFLib.PDFDocument.create();
            for (let i = 1; i <= pdfjsDoc.numPages; i++) {
                toolShowLoading(`Page ${i} of ${pdfjsDoc.numPages}...`);
                const canvas = await pageCanvas(i, 1.3);
                const res = await fetch(canvas.toDataURL('image/jpeg', Number(quality.value)));
                const img = await outDoc.embedJpg(await res.arrayBuffer());
                const page = outDoc.addPage([img.width, img.height]);
                page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
            }
            toolDownloadBlob(new Blob([await outDoc.save()], { type: 'application/pdf' }), fileName);
        } catch (e) {
            console.error(e);
            alert('Grayscale conversion failed.');
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
        previewWrap.innerHTML = '<p style="color:var(--text-secondary);">Upload a PDF to preview page 1 in grayscale.</p>';
    }
});
