document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewWrap = document.getElementById('preview-wrap');
    const pageList = document.getElementById('page-list');
    const status = document.getElementById('status');

    let pdfBytes = null;
    let order = [];
    let selected = 0;
    let fileName = 'organized.pdf';

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

    async function handleFile(file) {
        if (!toolIsPdf(file)) return alert('Choose a PDF.');
        if (file.size > 10 * 1024 * 1024) return alert('Max 10MB.');
        toolShowLoading('Loading PDF...');
        try {
            await ensureToolPdfLibs();
            pdfBytes = await file.arrayBuffer();
            fileName = file.name.replace(/\.pdf$/i, '') + '-organized.pdf';
            const doc = await pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise;
            order = Array.from({ length: doc.numPages }, (_, i) => i);
            selected = 0;
            exportBtn.disabled = false;
            clearBtn.disabled = false;
            status.textContent = `${doc.numPages} page(s). Use Up / Down to reorder.`;
            renderList();
            await renderPreview();
        } catch (e) {
            console.error(e);
            alert('Could not open PDF.');
            resetAll();
        } finally {
            toolHideLoading();
        }
    }

    function renderList() {
        pageList.innerHTML = '';
        order.forEach((origIndex, i) => {
            const li = document.createElement('li');
            li.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:0.5rem;padding:0.55rem 0.75rem;border:1px solid rgba(255,255,255,0.1);border-radius:10px;background:rgba(0,0,0,0.2);cursor:pointer;';
            if (i === selected) li.style.borderColor = 'rgba(99,102,241,0.55)';
            const label = document.createElement('span');
            label.innerHTML = `<strong>${i + 1}.</strong> Page ${origIndex + 1}`;
            li.addEventListener('click', async () => {
                selected = i;
                renderList();
                await renderPreview();
            });
            const btns = document.createElement('div');
            btns.className = 'tool-order-btns';
            if (i > 0) {
                const up = document.createElement('button');
                up.type = 'button';
                up.className = 'secondary-btn';
                up.textContent = 'Up';
                up.style.padding = '0.3rem 0.55rem';
                up.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const tmp = order[i - 1];
                    order[i - 1] = order[i];
                    order[i] = tmp;
                    if (selected === i) selected = i - 1;
                    else if (selected === i - 1) selected = i;
                    renderList();
                    renderPreview();
                });
                btns.appendChild(up);
            }
            if (i < order.length - 1) {
                const down = document.createElement('button');
                down.type = 'button';
                down.className = 'secondary-btn';
                down.textContent = 'Down';
                down.style.padding = '0.3rem 0.55rem';
                down.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const tmp = order[i + 1];
                    order[i + 1] = order[i];
                    order[i] = tmp;
                    if (selected === i) selected = i + 1;
                    else if (selected === i + 1) selected = i;
                    renderList();
                    renderPreview();
                });
                btns.appendChild(down);
            }
            li.appendChild(label);
            li.appendChild(btns);
            pageList.appendChild(li);
        });
    }

    async function renderPreview() {
        if (!pdfBytes || !order.length) return;
        const doc = await pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise;
        const page = await doc.getPage(order[selected] + 1);
        const viewport = page.getViewport({ scale: 1.2 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.maxWidth = '100%';
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        previewWrap.innerHTML = '';
        previewWrap.appendChild(canvas);
    }

    async function exportPdf() {
        toolShowLoading('Saving page order...');
        try {
            const src = await PDFLib.PDFDocument.load(pdfBytes.slice(0));
            const outDoc = await PDFLib.PDFDocument.create();
            const copied = await outDoc.copyPages(src, order);
            copied.forEach((p) => outDoc.addPage(p));
            const out = await outDoc.save();
            toolDownloadBlob(new Blob([out], { type: 'application/pdf' }), fileName);
        } catch (e) {
            console.error(e);
            alert('Could not organize PDF.');
        } finally {
            toolHideLoading();
        }
    }

    function resetAll() {
        pdfBytes = null;
        order = [];
        selected = 0;
        fileInput.value = '';
        exportBtn.disabled = true;
        clearBtn.disabled = true;
        status.textContent = '';
        pageList.innerHTML = '';
        previewWrap.innerHTML = '<p style="color:var(--text-secondary);">Upload a PDF, then click a page to preview it.</p>';
    }
});
