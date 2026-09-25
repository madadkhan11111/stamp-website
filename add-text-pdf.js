document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const undoBtn = document.getElementById('undo-btn');
    const addAnotherBtn = document.getElementById('add-another-btn');
    const deleteBtn = document.getElementById('delete-btn');
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
    let pageSnapshot = null;
    let pageScale = 1.2;
    let fileName = 'document.pdf';
    let placements = [];
    let selectedIndex = -1;
    let placeMode = true;
    let drag = null;
    let didDrag = false;

    sizeInput.addEventListener('input', () => {
        document.getElementById('add-size-val').textContent = sizeInput.value;
        applyPanelToSelected();
        redrawFast();
    });
    colorInput.addEventListener('input', () => {
        applyPanelToSelected();
        redrawFast();
    });
    textInput.addEventListener('input', () => {
        applyPanelToSelected();
        redrawFast();
    });
    toolBindDrop((files) => handleFile(files[0]));
    prevPage.addEventListener('click', () => changePage(-1));
    nextPage.addEventListener('click', () => changePage(1));
    undoBtn.addEventListener('click', undoLast);
    clearBtn.addEventListener('click', resetAll);
    exportBtn.addEventListener('click', exportPdf);
    addAnotherBtn.addEventListener('click', startPlaceMode);
    deleteBtn.addEventListener('click', deleteSelected);

    document.querySelectorAll('[data-nudge]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const [dx, dy] = btn.getAttribute('data-nudge').split(',').map(Number);
            nudgeSelected(dx, dy);
        });
    });

    window.addEventListener('keydown', onKeyMove);

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
            selectedIndex = -1;
            placeMode = true;
            exportBtn.disabled = false;
            clearBtn.disabled = false;
            updatePager();
            await renderPage();
            setStatus('Type your text, then click once on the page to place it.');
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
        addAnotherBtn.disabled = !pdfjsDoc;
        deleteBtn.disabled = selectedIndex < 0;
        addAnotherBtn.classList.toggle('is-active', placeMode);
    }

    async function changePage(delta) {
        const next = pageNum + delta;
        if (next < 1 || next > pageCount) return;
        pageNum = next;
        selectedIndex = -1;
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
        pageCanvas.tabIndex = 0;
        pageCanvas.setAttribute('role', 'img');
        pageCanvas.setAttribute('aria-label', 'PDF page. Click to place text, then drag or use arrow keys to move it.');
        const ctx = pageCanvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
        pageSnapshot = document.createElement('canvas');
        pageSnapshot.width = pageCanvas.width;
        pageSnapshot.height = pageCanvas.height;
        pageSnapshot.getContext('2d').drawImage(pageCanvas, 0, 0);
        previewWrap.innerHTML = '';
        previewWrap.appendChild(pageCanvas);
        pageCanvas.addEventListener('pointerdown', onPointerDown);
        pageCanvas.addEventListener('pointermove', onPointerMove);
        pageCanvas.addEventListener('pointerup', onPointerUp);
        pageCanvas.addEventListener('pointercancel', onPointerUp);
        pageCanvas.addEventListener('lostpointercapture', onPointerUp);
        redrawFast();
        updateCursor();
    }

    function canvasPoint(e) {
        const rect = pageCanvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (pageCanvas.width / rect.width),
            y: (e.clientY - rect.top) * (pageCanvas.height / rect.height)
        };
    }

    function measureBox(p) {
        const ctx = pageCanvas.getContext('2d');
        ctx.font = `bold ${p.size}px Outfit, Arial, sans-serif`;
        const w = Math.max(ctx.measureText(p.text || ' ').width, 12);
        const h = p.size;
        return {
            x: p.x - 6,
            y: p.y - h / 2 - 6,
            w: w + 12,
            h: h + 12
        };
    }

    function hitIndex(x, y) {
        for (let i = placements.length - 1; i >= 0; i--) {
            const p = placements[i];
            if (p.page !== pageNum) continue;
            const b = measureBox(p);
            if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return i;
        }
        return -1;
    }

    function onPointerDown(e) {
        if (!pageCanvas) return;
        e.preventDefault();
        pageCanvas.setPointerCapture(e.pointerId);
        pageCanvas.focus();
        const pt = canvasPoint(e);
        const hit = hitIndex(pt.x, pt.y);
        didDrag = false;

        if (hit >= 0) {
            selectPlacement(hit);
            placeMode = false;
            drag = { index: hit, dx: pt.x - placements[hit].x, dy: pt.y - placements[hit].y };
            updatePager();
            redrawFast();
            return;
        }

        if (placeMode) {
            const text = (textInput.value || '').trim();
            if (!text) {
                alert('Type the text first, then click the page once to place it.');
                return;
            }
            placements.push({
                page: pageNum,
                x: pt.x,
                y: pt.y,
                text: text,
                size: Number(sizeInput.value),
                color: colorInput.value
            });
            selectedIndex = placements.length - 1;
            placeMode = false;
            drag = { index: selectedIndex, dx: 0, dy: 0 };
            updatePager();
            redrawFast();
            setStatus('Text placed. Drag it, or use the arrow buttons / keyboard arrows to move it. Click “Add another” for a new line.');
            return;
        }

        selectedIndex = -1;
        updatePager();
        redrawFast();
        setStatus('Select a text box to move it, or click “Add another” to place a new line.');
    }

    function onPointerMove(e) {
        if (!pageCanvas) return;
        const pt = canvasPoint(e);
        if (drag) {
            const p = placements[drag.index];
            p.x = clamp(pt.x - drag.dx, 8, pageCanvas.width - 8);
            p.y = clamp(pt.y - drag.dy, 8, pageCanvas.height - 8);
            didDrag = true;
            redrawFast();
            return;
        }
        updateCursor(pt);
    }

    function onPointerUp(e) {
        if (drag && pageCanvas) {
            try {
                pageCanvas.releasePointerCapture(e.pointerId);
            } catch (err) { /* already released */ }
        }
        drag = null;
        updateCursor();
    }

    function updateCursor(pt) {
        if (!pageCanvas) return;
        if (drag) {
            pageCanvas.style.cursor = 'grabbing';
            return;
        }
        if (placeMode) {
            pageCanvas.style.cursor = 'crosshair';
            return;
        }
        if (pt && hitIndex(pt.x, pt.y) >= 0) {
            pageCanvas.style.cursor = 'grab';
            return;
        }
        pageCanvas.style.cursor = 'default';
    }

    function startPlaceMode() {
        if (!pdfjsDoc) return;
        placeMode = true;
        selectedIndex = -1;
        updatePager();
        redrawFast();
        if (pageCanvas) pageCanvas.focus();
        const text = (textInput.value || '').trim();
        setStatus(text
            ? 'Click once on the page to place a new line. It will not add extra copies after that.'
            : 'Type the text first, then click once on the page.');
    }

    function selectPlacement(index) {
        selectedIndex = index;
        const p = placements[index];
        textInput.value = p.text;
        sizeInput.value = p.size;
        document.getElementById('add-size-val').textContent = p.size;
        colorInput.value = p.color;
        updatePager();
        setStatus('Selected. Drag with the mouse, or move with arrow keys / the arrow buttons.');
    }

    function applyPanelToSelected() {
        if (selectedIndex < 0) return;
        const p = placements[selectedIndex];
        const text = (textInput.value || '').trim();
        if (text) p.text = text;
        p.size = Number(sizeInput.value);
        p.color = colorInput.value;
    }

    function nudgeSelected(dx, dy) {
        if (selectedIndex < 0 || !pageCanvas) return;
        const p = placements[selectedIndex];
        p.x = clamp(p.x + dx, 8, pageCanvas.width - 8);
        p.y = clamp(p.y + dy, 8, pageCanvas.height - 8);
        redrawFast();
        if (pageCanvas) pageCanvas.focus();
    }

    function onKeyMove(e) {
        if (selectedIndex < 0) return;
        const tag = (e.target && e.target.tagName) || '';
        if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
        const step = e.shiftKey ? 12 : 4;
        const map = {
            ArrowLeft: [-step, 0],
            ArrowRight: [step, 0],
            ArrowUp: [0, -step],
            ArrowDown: [0, step]
        };
        if (!map[e.key]) {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (!/^(INPUT|TEXTAREA)$/.test(tag)) {
                    e.preventDefault();
                    deleteSelected();
                }
            }
            return;
        }
        e.preventDefault();
        nudgeSelected(map[e.key][0], map[e.key][1]);
    }

    function deleteSelected() {
        if (selectedIndex < 0) return;
        placements.splice(selectedIndex, 1);
        selectedIndex = -1;
        placeMode = false;
        updatePager();
        redrawFast();
        setStatus(placements.length ? 'Text removed. Select another box, or click “Add another”.' : 'All text removed. Click “Add another” to place a new line.');
    }

    function undoLast() {
        placements.pop();
        if (selectedIndex >= placements.length) selectedIndex = placements.length - 1;
        updatePager();
        redrawFast();
    }

    function redrawFast() {
        if (!pageCanvas || !pageSnapshot) return;
        const ctx = pageCanvas.getContext('2d');
        ctx.drawImage(pageSnapshot, 0, 0);
        drawPlacements(ctx);
    }

    function drawPlacements(ctx) {
        placements.forEach((p, i) => {
            if (p.page !== pageNum) return;
            ctx.save();
            ctx.fillStyle = p.color;
            ctx.font = `bold ${p.size}px Outfit, Arial, sans-serif`;
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'left';
            ctx.fillText(p.text, p.x, p.y, pageCanvas.width - 16);
            if (i === selectedIndex) {
                const b = measureBox(p);
                ctx.strokeStyle = '#e5322d';
                ctx.lineWidth = 2;
                ctx.setLineDash([6, 4]);
                ctx.strokeRect(b.x, b.y, b.w, b.h);
                ctx.setLineDash([]);
                ctx.fillStyle = '#e5322d';
                const handles = [
                    [b.x, b.y],
                    [b.x + b.w, b.y],
                    [b.x, b.y + b.h],
                    [b.x + b.w, b.y + b.h]
                ];
                handles.forEach(([hx, hy]) => {
                    ctx.fillRect(hx - 3, hy - 3, 6, 6);
                });
            }
            ctx.restore();
        });
    }

    function setStatus(message) {
        const count = placements.length;
        const pageLabel = pdfjsDoc ? `Page ${pageNum} of ${pageCount}` : '';
        const mode = placeMode ? 'Click once to place' : (selectedIndex >= 0 ? 'Drag or use arrows to move' : 'Select a box or add another');
        status.textContent = message || `${pageLabel} · ${count} text box(es) · ${mode}.`;
    }

    function clamp(n, min, max) {
        return Math.max(min, Math.min(max, n));
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
        if (!placements.length) return alert('Place at least one line of text first.');
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
        pageSnapshot = null;
        placements = [];
        selectedIndex = -1;
        placeMode = true;
        drag = null;
        document.getElementById('file-input').value = '';
        exportBtn.disabled = true;
        clearBtn.disabled = true;
        updatePager();
        status.textContent = '';
        previewWrap.innerHTML = '<p style="color:var(--text-secondary);">Upload a PDF, then click once where the text should go. You can drag it after that.</p>';
    }
});
