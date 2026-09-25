document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewWrap = document.getElementById('preview-wrap');
    const status = document.getElementById('status');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const undoBtn = document.getElementById('undo-btn');
    const allPages = document.getElementById('all-pages');
    let pdfBytes = null;
    let pdfjsDoc = null;
    let pageNum = 1;
    let boxes = {};
    let drawing = null;
    let fileName = 'redacted.pdf';
    let scale = 1.2;
    let pageBitmap = null;

    toolBindDrop((files) => handleFile(files[0]));
    clearBtn.addEventListener('click', resetAll);
    exportBtn.addEventListener('click', exportPdf);
    prevBtn.addEventListener('click', () => { if (pageNum > 1) { pageNum -= 1; render(); } });
    nextBtn.addEventListener('click', () => { if (pdfjsDoc && pageNum < pdfjsDoc.numPages) { pageNum += 1; render(); } });
    undoBtn.addEventListener('click', () => {
        const list = boxes[pageNum] || [];
        list.pop();
        boxes[pageNum] = list;
        drawBoxes();
    });

    async function handleFile(file) {
        if (!toolIsPdf(file)) return alert('Choose a PDF.');
        if (file.size > 10 * 1024 * 1024) return alert('Max 10MB.');
        toolShowLoading('Loading PDF...');
        try {
            await ensureToolPdfLibs();
            pdfBytes = await file.arrayBuffer();
            pdfjsDoc = await pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise;
            fileName = file.name.replace(/\.pdf$/i, '') + '-redacted.pdf';
            pageNum = 1;
            boxes = {};
            exportBtn.disabled = false;
            clearBtn.disabled = false;
            prevBtn.disabled = false;
            nextBtn.disabled = false;
            undoBtn.disabled = false;
            status.textContent = `${pdfjsDoc.numPages} page(s). Drag on the preview to redact.`;
            await render();
        } catch (e) {
            console.error(e);
            alert('Could not open PDF.');
            resetAll();
        } finally {
            toolHideLoading();
        }
    }

    async function render() {
        const page = await pdfjsDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.id = 'page-canvas';
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.maxWidth = '100%';
        canvas.style.cursor = 'crosshair';
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        pageBitmap = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
        previewWrap.innerHTML = '';
        previewWrap.appendChild(canvas);
        bindDraw(canvas);
        drawBoxes();
        status.textContent = `Page ${pageNum} of ${pdfjsDoc.numPages}. Drag to add a black box.`;
    }

    function canvasPoint(canvas, e) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) / rect.width,
            y: (e.clientY - rect.top) / rect.height
        };
    }

    function bindDraw(canvas) {
        canvas.addEventListener('mousedown', (e) => {
            drawing = { start: canvasPoint(canvas, e), end: null };
        });
        canvas.addEventListener('mousemove', (e) => {
            if (!drawing) return;
            drawing.end = canvasPoint(canvas, e);
            drawBoxes(drawing);
        });
        const finish = (e) => {
            if (!drawing) return;
            drawing.end = canvasPoint(canvas, e);
            const box = normBox(drawing.start, drawing.end);
            drawing = null;
            if (box.w < 0.01 || box.h < 0.01) { drawBoxes(); return; }
            boxes[pageNum] = (boxes[pageNum] || []).concat([box]);
            drawBoxes();
        };
        canvas.addEventListener('mouseup', finish);
        canvas.addEventListener('mouseleave', () => { if (drawing) { drawing = null; drawBoxes(); } });
    }

    function normBox(a, b) {
        const x = Math.max(0, Math.min(a.x, b.x));
        const y = Math.max(0, Math.min(a.y, b.y));
        const x2 = Math.min(1, Math.max(a.x, b.x));
        const y2 = Math.min(1, Math.max(a.y, b.y));
        return { x, y, w: x2 - x, h: y2 - y };
    }

    function drawBoxes(live) {
        const canvas = document.getElementById('page-canvas');
        if (!canvas || !pageBitmap) return;
        const ctx = canvas.getContext('2d');
        ctx.putImageData(pageBitmap, 0, 0);
        const list = (boxes[pageNum] || []).slice();
        if (live && live.end) list.push(normBox(live.start, live.end));
        ctx.fillStyle = '#111';
        list.forEach((b) => {
            ctx.fillRect(b.x * canvas.width, b.y * canvas.height, b.w * canvas.width, b.h * canvas.height);
        });
    }

    async function exportPdf() {
        toolShowLoading('Redacting...');
        try {
            const src = await PDFLib.PDFDocument.load(pdfBytes.slice(0));
            const pages = src.getPages();
            const template = boxes[pageNum] || [];
            pages.forEach((page, i) => {
                const { width, height } = page.getSize();
                const list = allPages.checked ? template : (boxes[i + 1] || []);
                list.forEach((b) => {
                    page.drawRectangle({
                        x: b.x * width,
                        y: height - (b.y + b.h) * height,
                        width: b.w * width,
                        height: b.h * height,
                        color: PDFLib.rgb(0, 0, 0)
                    });
                });
            });
            toolDownloadBlob(new Blob([await src.save()], { type: 'application/pdf' }), fileName);
        } catch (e) {
            console.error(e);
            alert('Redact failed.');
        } finally {
            toolHideLoading();
        }
    }

    function resetAll() {
        pdfBytes = null;
        pdfjsDoc = null;
        boxes = {};
        drawing = null;
        document.getElementById('file-input').value = '';
        exportBtn.disabled = true;
        clearBtn.disabled = true;
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        undoBtn.disabled = true;
        status.textContent = '';
        previewWrap.innerHTML = '<p style="color:var(--text-secondary);">Upload a PDF, then drag to black out areas.</p>';
    }
});
