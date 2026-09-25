document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewWrap = document.getElementById('preview-wrap');
    const quality = document.getElementById('quality');
    const status = document.getElementById('status');
    let files = [];
    let previews = [];

    quality.addEventListener('input', () => {
        document.getElementById('quality-val').textContent = Math.round(Number(quality.value) * 100) + '%';
    });
    toolBindDrop((list) => addFiles(list));
    clearBtn.addEventListener('click', resetAll);
    exportBtn.addEventListener('click', exportImages);

    function addFiles(list) {
        const heics = list.filter(toolIsHeic);
        if (!heics.length) return alert('Choose HEIC or HEIF photos from an iPhone.');
        const tooBig = heics.find((f) => f.size > 10 * 1024 * 1024);
        if (tooBig) return alert('Max 10MB per file.');
        files = files.concat(heics);
        exportBtn.disabled = false;
        clearBtn.disabled = false;
        status.textContent = `${files.length} HEIC file(s) selected.`;
        previewWrap.innerHTML = '';
        files.forEach((f) => {
            const el = document.createElement('p');
            el.style.color = 'var(--text-secondary)';
            el.textContent = f.name;
            previewWrap.appendChild(el);
        });
        decodePreviews();
    }

    async function decodePreviews() {
        toolShowLoading('Decoding HEIC preview...');
        try {
            previews = [];
            previewWrap.innerHTML = '';
            for (const file of files) {
                const jpeg = await toolHeicToJpegBlob(file, 0.6);
                previews.push(jpeg);
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
            status.textContent = 'Preview failed. You can still try Download — some HEIC files need Safari.';
        } finally {
            toolHideLoading();
        }
    }

    async function exportImages() {
        if (!files.length) return;
        toolShowLoading('Converting HEIC...');
        try {
            const q = Number(quality.value);
            const blobs = [];
            for (let i = 0; i < files.length; i++) {
                toolShowLoading(`Converting ${i + 1} of ${files.length}...`);
                blobs.push(await toolHeicToJpegBlob(files[i], q));
            }
            if (blobs.length === 1) {
                toolDownloadBlob(blobs[0], files[0].name.replace(/\.hei[cf]$/i, '') + '.jpg');
            } else {
                await toolEnsureZip();
                const zip = new JSZip();
                blobs.forEach((blob, i) => {
                    zip.file(files[i].name.replace(/\.hei[cf]$/i, '') + '.jpg', blob);
                });
                toolDownloadBlob(await zip.generateAsync({ type: 'blob' }), 'heic-jpg.zip');
            }
        } catch (e) {
            console.error(e);
            alert('Could not convert HEIC. Try Safari, or export the photo as JPG on the iPhone first.');
        } finally {
            toolHideLoading();
        }
    }

    function resetAll() {
        files = [];
        previews = [];
        document.getElementById('file-input').value = '';
        exportBtn.disabled = true;
        clearBtn.disabled = true;
        status.textContent = '';
        previewWrap.innerHTML = '<p style="color:var(--text-secondary);">Add HEIC photos to preview them.</p>';
    }
});
