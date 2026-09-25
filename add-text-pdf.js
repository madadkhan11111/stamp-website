document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const undoBtn = document.getElementById('undo-btn');
    const prevPage = document.getElementById('prev-page');
    const nextPage = document.getElementById('next-page');
    const previewWrap = document.getElementById('preview-wrap');
    const status = document.getElementById('status');
    const textInput = document.getElementById('add-text');
    const sizeInput = document.getElementById('add-size');
    const colorInput = document.getElementById('add-color');

    let pdfBytes = null;
    let pdfjsDoc = null;
    let pageNum = 1;
    let pageCount = 1;
    let pageCanvas = null;
    let pageScale = 1.2;
    let fileName = 'document.pdf';
    let placements = [];

    sizeInput.addEventListener('input', () => {
        document.getElementById('add-size-val').textContent = sizeInput.value;
        redraw();
    });
    colorInput.addEventListener('input', redraw);
    textInput.addEventListener('input', redraw);
    toolBindDrop((files) => handleFile(files[0]));
    prevPage.addEventListener('click', () => changePage(-1));
    nextPage.addEventListener('click', () => changePage(1));
    undoBtn.addEventListener('click', undoLast);
    clearBtn.addEventListener('click', resetAll);
    exportBtn.addEventListener('click', exportPdf);

    async function handleFile(file) {
        if (!toolIsPdf(file)) return alert('Choose a PDF.');
        if (file.size > 10 * 1024 * 1024) return alert('Max 10MB.');
        toolShowLoading('Loading PDF...');
        try {
            await ensureToolPdfLibs();
            pdfBytes = await file.arrayBuffer();
            fileName = file.name.replace(/\.pdf$/i, '') + '-text.pdf';
            pdfjsDoc = await pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise;
            pageCount = pdfjsDoc.numPages;
            pageNum = 1;
            placements = [];
            exportBtn.disabled = false;
            clearBtn.disabled = false;
            status.textContent = `${pageCount} page(s). Type text, then click the page.`;
            updatePager();
            await renderPage();
        } catch (e) {
            console.error(e);
            alert('Could not open PDF.');
            resetAll();
        } finally {
            toolHideLoading();
        }
    }

    function updatePager() {
        prevPage.disabled = !pdfjsDoc || pageNum <= 1;
        nextPage.disabled = !pdfjsDoc || pageNum >= pageCount;
        undoBtn.disabled = !placements.length;
    }

    async function changePage(delta) {
        const next = pageNum + delta;
        if (next < 1 || next > pageCount) return;
        pageNum = next;
        updatePager();
        await renderPage();
    }

    async function renderPage() {
        const page = await pdfjsDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: pageScale });
        pageCanvas = document.createElement('canvas');
        pageCanvas.width = viewport.width;
        pageCanvas.height = viewport.height;
        pageCanvas.style.maxWidth = '100%';
        pageCanvas.style.cursor = 'crosshair';
        const ctx = pageCanvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
        previewWrap.innerHTML = '';
        previewWrap.appendChild(pageCanvas);
        pageCanvas.addEventListener('click', onPlace);
        drawPlacements(ctx);
        status.textContent = `Page ${pageNum} of ${pageCount} · ${placements.length} text box(es).`;
    }

    function onPlace(e) {
        const text = (textInput.value || '').trim();
        if (!text) return alert('Type the text first, then click the page.');
        const rect = pageCanvas.getBoundingClientRect();
        placements.push({
            page: pageNum,
            x: (e.clientX - rect.left) * (pageCanvas.width / rect.width),
            y: (e.clientY - rect.top) * (pageCanvas.height / rect.height),
            text: text,
            size: Number(sizeInput.value),
            color: colorInput.value
        });
        updatePager();
        redraw();
    }

    function undoLast() {
        placements.pop();
        updatePager();
        redraw();
    }

    function redraw() {
        if (!pdfjsDoc || !pageCanvas) return;
        pdfjsDoc.getPage(pageNum).then(async (page) => {
            const viewport = page.getViewport({ scale: pageScale });
            const ctx = pageCanvas.getContext('2d');
            ctx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
            await page.render({ canvasContext: ctx, viewport }).promise;
            drawPlacements(ctx);
            status.textContent = `Page ${pageNum} of ${pageCount} · ${placements.length} text box(es).`;
        });
    }

    function drawPlacements(ctx) {
        placements.filter((p) => p.page === pageNum).forEach((p) => {
            ctx.save();
            ctx.fillStyle = p.color;
            ctx.font = `bold ${p.size}px Outfit, Arial, sans-serif`;
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'left';
            ctx.fillText(p.text, p.x, p.y, pageCanvas.width - 16);
            ctx.restore();
        });
    }

    function hexToRgb(hex) {
        const h = hex.replace('#', '');
        return {
            r: parseInt(h.slice(0, 2), 16) / 255,
            g: parseInt(h.slice(2, 4), 16) / 255,
            b: parseInt(h.slice(4, 6), 16) / 255
        };
    }

    async function exportPdf() {
        if (!pdfBytes) return;
        if (!placements.length) return alert('Click the preview to place at least one line of text.');
        toolShowLoading('Adding text...');
        try {
            const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes.slice(0));
            const font = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);
            const pages = pdfDoc.getPages();
            for (const p of placements) {
                const page = pages[p.page - 1];
                if (!page) continue;
                const { width, height } = page.getSize();
                const rgb = hexToRgb(p.color);
                const size = p.size * (width / pageCanvas.width);
                const x = (p.x / pageCanvas.width) * width;
                const y = height - (p.y / pageCanvas.height) * height - size * 0.35;
                page.drawText(p.text, {
                    x,
                    y,
                    size,
                    font,
                    color: PDFLib.rgb(rgb.r, rgb.g, rgb.b),
                    maxWidth: width - x - 12
                });
            }
            const out = await pdfDoc.save();
            toolDownloadBlob(new Blob([out], { type: 'application/pdf' }), fileName);
        } catch (e) {
            console.error(e);
            alert('Could not add text. Use English letters and numbers if the PDF font rejects the characters.');
        } finally {
            toolHideLoading();
        }
    }

    function resetAll() {
        pdfBytes = null;
        pdfjsDoc = null;
        pageCanvas = null;
        placements = [];
        document.getElementById('file-input').value = '';
        exportBtn.disabled = true;
        clearBtn.disabled = true;
        updatePager();
        status.textContent = '';
        previewWrap.innerHTML = '<p style="color:var(--text-secondary);">Upload a PDF, then click where the text should go.</p>';
    }
});
