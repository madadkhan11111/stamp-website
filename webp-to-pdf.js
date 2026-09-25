document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewWrap = document.getElementById('preview-wrap');
    const status = document.getElementById('status');
    let files = [];

    toolBindDrop((list) => addFiles(list));
    clearBtn.addEventListener('click', resetAll);
    exportBtn.addEventListener('click', exportPdf);

    function addFiles(list) {
        const imgs = list.filter((f) => /webp$/i.test(f.type) || /\.webp$/i.test(f.name));
        if (!imgs.length) return alert('Choose WEBP images.');
        files = files.concat(imgs);
        exportBtn.disabled = false;
        clearBtn.disabled = false;
        status.textContent = `${files.length} WEBP image(s) selected.`;
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

    function webpToPngBytes(file) {
        return new Promise(async (resolve, reject) => {
            try {
                const img = await toolLoadImageFile(file);
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                canvas.getContext('2d').drawImage(img, 0, 0);
                canvas.toBlob(async (blob) => {
                    if (!blob) return reject(new Error('convert'));
                    resolve(await blob.arrayBuffer());
                }, 'image/png');
            } catch (e) {
                reject(e);
            }
        });
    }

    async function exportPdf() {
        if (!files.length) return;
        toolShowLoading('Building PDF...');
        try {
            await ensureToolPdfLibs();
            const pdfDoc = await PDFLib.PDFDocument.create();
            for (const file of files) {
                const png = await webpToPngBytes(file);
                const image = await pdfDoc.embedPng(png);
                const page = pdfDoc.addPage([image.width, image.height]);
                page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
            }
            toolDownloadBlob(new Blob([await pdfDoc.save()], { type: 'application/pdf' }), 'webp.pdf');
        } catch (e) {
            console.error(e);
            alert('Could not create PDF from WEBP.');
        } finally {
            toolHideLoading();
        }
    }

    function resetAll() {
        files = [];
        document.getElementById('file-input').value = '';
        exportBtn.disabled = true;
        clearBtn.disabled = true;
        status.textContent = '';
        previewWrap.innerHTML = '<p style="color:var(--text-secondary);">Add WEBP images to preview them.</p>';
    }
});
