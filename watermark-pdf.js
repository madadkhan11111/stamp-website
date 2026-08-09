document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewWrap = document.getElementById('preview-wrap');
    const wmText = document.getElementById('wm-text');
    const wmColor = document.getElementById('wm-color');
    const wmOpacity = document.getElementById('wm-opacity');
    const wmSize = document.getElementById('wm-size');
    const wmAngle = document.getElementById('wm-angle');

    let pdfBytes = null;
    let pdfjsDoc = null;
    let fileName = 'document.pdf';
    let previewTimer = null;

    function bindRange(input, label, fmt) {
        const sync = () => { label.textContent = fmt(input.value); schedulePreview(); };
        input.addEventListener('input', sync);
        sync();
    }

    bindRange(wmOpacity, document.getElementById('wm-opacity-val'), (v) => Math.round(Number(v) * 100) + '%');
    bindRange(wmSize, document.getElementById('wm-size-val'), (v) => v);
    bindRange(wmAngle, document.getElementById('wm-angle-val'), (v) => v + '°');
    wmText.addEventListener('input', schedulePreview);
    wmColor.addEventListener('input', schedulePreview);

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', () => {
        if (fileInput.files[0]) handleFile(fileInput.files[0]);
    });

    clearBtn.addEventListener('click', resetAll);
    exportBtn.addEventListener('click', exportPdf);

    async function handleFile(file) {
        if (!file || file.type !== 'application/pdf') {
            alert('Please choose a PDF file.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            alert('File must be 10MB or smaller.');
            return;
        }
        toolShowLoading('Loading PDF...');
        try {
            await ensureToolPdfLibs();
            pdfBytes = await file.arrayBuffer();
            fileName = file.name;
            pdfjsDoc = await pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise;
            exportBtn.disabled = false;
            clearBtn.disabled = false;
            await renderPreview();
        } catch (err) {
            console.error(err);
            alert('Could not open that PDF. Try another file.');
            resetAll();
        } finally {
            toolHideLoading();
        }
    }

    function schedulePreview() {
        clearTimeout(previewTimer);
        previewTimer = setTimeout(() => {
            if (pdfjsDoc) renderPreview();
        }, 120);
    }

    async function renderPreview() {
        const page = await pdfjsDoc.getPage(1);
        const viewport = page.getViewport({ scale: 1.2 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
        drawWatermarkOnCanvas(ctx, canvas.width, canvas.height);
        previewWrap.innerHTML = '';
        previewWrap.appendChild(canvas);
    }

    function drawWatermarkOnCanvas(ctx, w, h) {
        const text = (wmText.value || 'WATERMARK').trim();
        if (!text) return;
        ctx.save();
        ctx.globalAlpha = Number(wmOpacity.value);
        ctx.fillStyle = wmColor.value;
        ctx.font = `bold ${wmSize.value}px Outfit, Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.translate(w / 2, h / 2);
        ctx.rotate((Number(wmAngle.value) * Math.PI) / 180);
        ctx.fillText(text.toUpperCase(), 0, 0);
        ctx.restore();
    }

    async function exportPdf() {
        if (!pdfBytes) return;
        toolShowLoading('Adding watermark...');
        try {
            await ensureToolPdfLibs();
            const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes.slice(0));
            const pages = pdfDoc.getPages();
            const text = (wmText.value || 'WATERMARK').trim().toUpperCase();
            const size = Number(wmSize.value);
            const angle = Number(wmAngle.value);
            const opacity = Number(wmOpacity.value);
            const rgb = hexToRgb(wmColor.value);

            for (const page of pages) {
                const { width, height } = page.getSize();
                page.drawText(text, {
                    x: width / 2 - (text.length * size * 0.28),
                    y: height / 2,
                    size,
                    rotate: PDFLib.degrees(angle),
                    color: PDFLib.rgb(rgb.r / 255, rgb.g / 255, rgb.b / 255),
                    opacity
                });
            }

            const out = await pdfDoc.save();
            const base = fileName.replace(/\.pdf$/i, '');
            toolDownloadBlob(new Blob([out], { type: 'application/pdf' }), `${base}_watermarked.pdf`);
        } catch (err) {
            console.error(err);
            alert('Export failed. Please try again.');
        } finally {
            toolHideLoading();
        }
    }

    function hexToRgb(hex) {
        const h = hex.replace('#', '');
        return {
            r: parseInt(h.slice(0, 2), 16),
            g: parseInt(h.slice(2, 4), 16),
            b: parseInt(h.slice(4, 6), 16)
        };
    }

    function resetAll() {
        pdfBytes = null;
        pdfjsDoc = null;
        fileInput.value = '';
        exportBtn.disabled = true;
        clearBtn.disabled = true;
        previewWrap.innerHTML = '<p style="color:var(--text-secondary);">Upload a PDF to preview page 1 with watermark.</p>';
    }
});
