document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewWrap = document.getElementById('preview-wrap');
    const status = document.getElementById('status');
    let files = [];

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        addFiles([...e.dataTransfer.files]);
    });
    fileInput.addEventListener('change', () => addFiles([...fileInput.files]));
    clearBtn.addEventListener('click', resetAll);
    exportBtn.addEventListener('click', exportPdf);

    function addFiles(list) {
        const imgs = list.filter((f) => /^image\/(jpeg|jpg|png)$/i.test(f.type));
        if (!imgs.length) return alert('Choose JPG or PNG images.');
        files = files.concat(imgs);
        status.textContent = `${files.length} image(s) selected.`;
        exportBtn.disabled = false;
        clearBtn.disabled = false;
        previewWrap.innerHTML = '';
        files.forEach((f) => {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(f);
            img.style.maxWidth = '140px';
            img.style.maxHeight = '140px';
            img.style.objectFit = 'contain';
            img.style.borderRadius = '8px';
            previewWrap.appendChild(img);
        });
    }

    async function exportPdf() {
        if (!files.length) return;
        toolShowLoading('Building PDF...');
        try {
            await ensureToolPdfLibs();
            const pdfDoc = await PDFLib.PDFDocument.create();
            for (const file of files) {
                const bytes = await file.arrayBuffer();
                const isPng = /png$/i.test(file.type) || /\.png$/i.test(file.name);
                const image = isPng ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);
                const page = pdfDoc.addPage([image.width, image.height]);
                page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
            }
            const out = await pdfDoc.save();
            toolDownloadBlob(new Blob([out], { type: 'application/pdf' }), 'images.pdf');
        } catch (e) {
            console.error(e);
            alert('Could not create PDF. Try smaller images.');
        } finally {
            toolHideLoading();
        }
    }

    function resetAll() {
        files = [];
        fileInput.value = '';
        exportBtn.disabled = true;
        clearBtn.disabled = true;
        status.textContent = '';
        previewWrap.innerHTML = '<p style="color:var(--text-secondary);">Add one or more images.</p>';
    }
});
