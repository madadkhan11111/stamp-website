document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewWrap = document.getElementById('preview-wrap');
    const sigPad = document.getElementById('sig-pad');
    const clearSig = document.getElementById('clear-sig');
    const useSig = document.getElementById('use-sig');
    const sigSize = document.getElementById('sig-size');
    const sigSizeVal = document.getElementById('sig-size-val');
    const pageControls = document.getElementById('page-controls');
    const pageLabel = document.getElementById('page-label');
    const prevPage = document.getElementById('prev-page');
    const nextPage = document.getElementById('next-page');

    const sigCtx = sigPad.getContext('2d');
    sigCtx.lineWidth = 2.5;
    sigCtx.lineCap = 'round';
    sigCtx.lineJoin = 'round';
    sigCtx.strokeStyle = '#111';

    let drawing = false;
    let ink = 0;
    let pdfBytes = null;
    let pdfjsDoc = null;
    let pageNum = 1;
    let pageCount = 1;
    let fileName = 'document.pdf';
    let signatureDataUrl = null;
    let placements = {}; // pageNum -> {x,y,w} in canvas pixels
    let pageCanvas = null;
    let pageScale = 1.2;
    let pageViewport = null;

    sigSize.addEventListener('input', () => {
        sigSizeVal.textContent = sigSize.value;
        redrawPreviewOverlay();
    });

    function getPos(e) {
        const rect = sigPad.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: (clientX - rect.left) * (sigPad.width / rect.width),
            y: (clientY - rect.top) * (sigPad.height / rect.height)
        };
    }

    function startDraw(e) {
        e.preventDefault();
        drawing = true;
        const p = getPos(e);
        sigCtx.beginPath();
        sigCtx.moveTo(p.x, p.y);
    }
    function moveDraw(e) {
        if (!drawing) return;
        e.preventDefault();
        const p = getPos(e);
        sigCtx.lineTo(p.x, p.y);
        sigCtx.stroke();
        ink++;
    }
    function endDraw() { drawing = false; }

    sigPad.addEventListener('mousedown', startDraw);
    sigPad.addEventListener('mousemove', moveDraw);
    window.addEventListener('mouseup', endDraw);
    sigPad.addEventListener('touchstart', startDraw, { passive: false });
    sigPad.addEventListener('touchmove', moveDraw, { passive: false });
    sigPad.addEventListener('touchend', endDraw);

    clearSig.addEventListener('click', () => {
        sigCtx.clearRect(0, 0, sigPad.width, sigPad.height);
        ink = 0;
        signatureDataUrl = null;
        delete placements[pageNum];
        redrawPreviewOverlay();
    });

    useSig.addEventListener('click', () => {
        if (ink < 8) {
            alert('Please draw your signature first.');
            return;
        }
        signatureDataUrl = sigPad.toDataURL('image/png');
        alert('Signature ready. Click on the PDF preview to place it.');
    });

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

    prevPage.addEventListener('click', () => changePage(-1));
    nextPage.addEventListener('click', () => changePage(1));
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
            pageCount = pdfjsDoc.numPages;
            pageNum = 1;
            placements = {};
            pageControls.style.display = 'block';
            exportBtn.disabled = false;
            clearBtn.disabled = false;
            updatePageLabel();
            await renderPage();
        } catch (err) {
            console.error(err);
            alert('Could not open that PDF.');
            resetAll();
        } finally {
            toolHideLoading();
        }
    }

    function updatePageLabel() {
        pageLabel.textContent = `${pageNum} / ${pageCount}`;
        prevPage.disabled = pageNum <= 1;
        nextPage.disabled = pageNum >= pageCount;
    }

    async function changePage(delta) {
        const next = pageNum + delta;
        if (next < 1 || next > pageCount) return;
        pageNum = next;
        updatePageLabel();
        await renderPage();
    }

    async function renderPage() {
        const page = await pdfjsDoc.getPage(pageNum);
        pageViewport = page.getViewport({ scale: pageScale });
        pageCanvas = document.createElement('canvas');
        pageCanvas.width = pageViewport.width;
        pageCanvas.height = pageViewport.height;
        const ctx = pageCanvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport: pageViewport }).promise;
        pageCanvas.style.maxWidth = '100%';
        pageCanvas.style.height = 'auto';
        pageCanvas.style.cursor = 'crosshair';
        previewWrap.innerHTML = '';
        previewWrap.appendChild(pageCanvas);
        pageCanvas.addEventListener('click', onPlaceClick);
        redrawPreviewOverlay();
    }

    function onPlaceClick(e) {
        if (!signatureDataUrl) {
            alert('Draw and click “Use Signature” first.');
            return;
        }
        const rect = pageCanvas.getBoundingClientRect();
        const scaleX = pageCanvas.width / rect.width;
        const scaleY = pageCanvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        const w = Number(sigSize.value);
        placements[pageNum] = { x, y, w };
        redrawPreviewOverlay();
    }

    function redrawPreviewOverlay() {
        if (!pageCanvas || !pdfjsDoc) return;
        // Re-render base then overlay — async safe enough for UX
        pdfjsDoc.getPage(pageNum).then(async (page) => {
            const viewport = page.getViewport({ scale: pageScale });
            const ctx = pageCanvas.getContext('2d');
            ctx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
            await page.render({ canvasContext: ctx, viewport }).promise;
            const place = placements[pageNum];
            if (place && signatureDataUrl) {
                const img = new Image();
                img.onload = () => {
                    const w = Number(sigSize.value);
                    const h = (img.height / img.width) * w;
                    ctx.drawImage(img, place.x - w / 2, place.y - h / 2, w, h);
                };
                img.src = signatureDataUrl;
            }
        });
    }

    async function exportPdf() {
        if (!pdfBytes || !signatureDataUrl) {
            alert('Add a PDF and place a signature first.');
            return;
        }
        if (!Object.keys(placements).length) {
            alert('Click the preview to place your signature.');
            return;
        }
        toolShowLoading('Signing PDF...');
        try {
            await ensureToolPdfLibs();
            const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes.slice(0));
            const pngBytes = await fetch(signatureDataUrl).then((r) => r.arrayBuffer());
            const pngImage = await pdfDoc.embedPng(pngBytes);
            const pages = pdfDoc.getPages();

            for (const [pStr, place] of Object.entries(placements)) {
                const pIndex = Number(pStr) - 1;
                const page = pages[pIndex];
                if (!page) continue;
                const { width: pdfW, height: pdfH } = page.getSize();
                const canvasW = pageViewport.width;
                const canvasH = pageViewport.height;
                const scaleX = pdfW / canvasW;
                const scaleY = pdfH / canvasH;
                const w = Number(sigSize.value) * scaleX;
                const aspect = pngImage.height / pngImage.width;
                const h = w * aspect;
                const x = place.x * scaleX - w / 2;
                const y = pdfH - place.y * scaleY - h / 2;
                page.drawImage(pngImage, { x, y, width: w, height: h });
            }

            const out = await pdfDoc.save();
            const base = fileName.replace(/\.pdf$/i, '');
            toolDownloadBlob(new Blob([out], { type: 'application/pdf' }), `${base}_signed.pdf`);
        } catch (err) {
            console.error(err);
            alert('Export failed. Please try again.');
        } finally {
            toolHideLoading();
        }
    }

    function resetAll() {
        pdfBytes = null;
        pdfjsDoc = null;
        placements = {};
        pageCanvas = null;
        fileInput.value = '';
        exportBtn.disabled = true;
        clearBtn.disabled = true;
        pageControls.style.display = 'none';
        previewWrap.innerHTML = '<p style="color:var(--text-secondary);">Upload a PDF, draw your signature, then click where it should go.</p>';
    }
});
