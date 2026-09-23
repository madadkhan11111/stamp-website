document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewWrap = document.getElementById('preview-wrap');
    const status = document.getElementById('status');
    const headerText = document.getElementById('header-text');
    const footerText = document.getElementById('footer-text');
    const align = document.getElementById('align');
    const size = document.getElementById('size');

    let pdfBytes = null;
    let pageCount = 0;
    let fileName = 'header-footer.pdf';

    size.addEventListener('input', () => {
        document.getElementById('size-val').textContent = size.value;
        if (pdfBytes) renderPreview();
    });
    [headerText, footerText, align].forEach((el) => el.addEventListener('input', () => { if (pdfBytes) renderPreview(); }));
    align.addEventListener('change', () => { if (pdfBytes) renderPreview(); });

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', () => { if (fileInput.files[0]) handleFile(fileInput.files[0]); });
    clearBtn.addEventListener('click', resetAll);
    exportBtn.addEventListener('click', exportPdf);

    function fillTokens(str, n, total) {
        return String(str || '').replace(/\{n\}/g, String(n)).replace(/\{total\}/g, String(total));
    }

    async function handleFile(file) {
        if (!toolIsPdf(file)) return alert('Choose a PDF.');
        if (file.size > 10 * 1024 * 1024) return alert('Max 10MB.');
        toolShowLoading('Loading PDF...');
        try {
            await ensureToolPdfLibs();
            pdfBytes = await file.arrayBuffer();
            fileName = file.name.replace(/\.pdf$/i, '') + '-header-footer.pdf';
            const doc = await pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise;
            pageCount = doc.numPages;
            exportBtn.disabled = false;
            clearBtn.disabled = false;
            status.textContent = `${pageCount} page(s) ready.`;
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
        const doc = await pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise;
        const page = await doc.getPage(1);
        const viewport = page.getViewport({ scale: 1.2 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.maxWidth = '100%';
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
        const fontSize = Number(size.value) * 1.2;
        ctx.fillStyle = '#222';
        ctx.font = `bold ${fontSize}px Outfit, Arial, sans-serif`;
        ctx.textBaseline = 'middle';
        const mode = align.value;
        ctx.textAlign = mode === 'left' ? 'left' : mode === 'right' ? 'right' : 'center';
        const x = mode === 'left' ? 24 : mode === 'right' ? canvas.width - 24 : canvas.width / 2;
        const header = fillTokens(headerText.value, 1, pageCount);
        const footer = fillTokens(footerText.value, 1, pageCount);
        if (header) ctx.fillText(header, x, 22, canvas.width - 40);
        if (footer) ctx.fillText(footer, x, canvas.height - 22, canvas.width - 40);
        previewWrap.innerHTML = '';
        previewWrap.appendChild(canvas);
    }

    async function exportPdf() {
        const header = headerText.value.trim();
        const footer = footerText.value.trim();
        if (!header && !footer) return alert('Enter header or footer text.');
        toolShowLoading('Adding header and footer...');
        try {
            const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes.slice(0));
            const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
            const fontSize = Number(size.value) || 10;
            const pages = pdfDoc.getPages();
            const total = pages.length;
            pages.forEach((page, i) => {
                const { width, height } = page.getSize();
                const n = i + 1;
                const hText = fillTokens(header, n, total);
                const fText = fillTokens(footer, n, total);
                const draw = (text, y) => {
                    if (!text) return;
                    const tw = font.widthOfTextAtSize(text, fontSize);
                    let x = (width - tw) / 2;
                    if (align.value === 'left') x = 24;
                    if (align.value === 'right') x = Math.max(24, width - 24 - tw);
                    page.drawText(text, { x, y, size: fontSize, font, color: PDFLib.rgb(0.15, 0.15, 0.15) });
                };
                draw(hText, height - 22 - fontSize * 0.2);
                draw(fText, 16);
            });
            const out = await pdfDoc.save();
            toolDownloadBlob(new Blob([out], { type: 'application/pdf' }), fileName);
        } catch (e) {
            console.error(e);
            alert('Could not add header/footer.');
        } finally {
            toolHideLoading();
        }
    }

    function resetAll() {
        pdfBytes = null;
        pageCount = 0;
        fileInput.value = '';
        exportBtn.disabled = true;
        clearBtn.disabled = true;
        status.textContent = '';
        previewWrap.innerHTML = '<p style="color:var(--text-secondary);">Upload a PDF to preview page 1.</p>';
    }
});
