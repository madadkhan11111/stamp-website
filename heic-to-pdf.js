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
        const heics = list.filter(toolIsHeic);
        if (!heics.length) return alert('Choose HEIC or HEIF photos from an iPhone.');
        if (heics.some((f) => f.size > 10 * 1024 * 1024)) return alert('Max 10MB per file.');
        files = files.concat(heics);
        exportBtn.disabled = false;
        clearBtn.disabled = false;
        status.textContent = `${files.length} HEIC file(s) selected.`;
        previewWrap.innerHTML = '';
        decodePreviews();
    }

    async function decodePreviews() {
        toolShowLoading('Decoding HEIC preview...');
        try {
            previewWrap.innerHTML = '';
            for (const file of files) {
                const jpeg = await toolHeicToJpegBlob(file, 0.55);
                const img = document.createElement('img');
                img.src = URL.createObjectURL(jpeg);
                img.style.maxWidth = '140px';
                img.style.maxHeight = '140px';
                img.style.objectFit = 'contain';
                img.style.borderRadius = '8px';
                previewWrap.appendChild(img);
            }
        } catch (e) {
            console.error(e);
            status.textContent = 'Preview failed. You can still try Download.';
        } finally {
            toolHideLoading();
        }
    }

    async function exportPdf() {
        if (!files.length) return;
        toolShowLoading('Building PDF...');
        try {
            await ensureToolPdfLibs();
            const pdfDoc = await PDFLib.PDFDocument.create();
            for (let i = 0; i < files.length; i++) {
                toolShowLoading(`Adding page ${i + 1} of ${files.length}...`);
                const jpeg = await toolHeicToJpegBlob(files[i], 0.9);
                const image = await pdfDoc.embedJpg(await jpeg.arrayBuffer());
                const page = pdfDoc.addPage([image.width, image.height]);
                page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
            }
            toolDownloadBlob(new Blob([await pdfDoc.save()], { type: 'application/pdf' }), 'heic.pdf');
        } catch (e) {
            console.error(e);
            alert('Could not convert HEIC to PDF. Try Safari, or export as JPG on the iPhone first.');
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
        previewWrap.innerHTML = '<p style="color:var(--text-secondary);">Add HEIC photos to preview them.</p>';
    }
});
