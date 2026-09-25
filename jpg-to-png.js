document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewWrap = document.getElementById('preview-wrap');
    const status = document.getElementById('status');
    let img = null;

    toolBindDrop((files) => handleFile(files[0]));
    clearBtn.addEventListener('click', resetAll);
    exportBtn.addEventListener('click', exportImage);

    async function handleFile(file) {
        if (!/\.jpe?g$/i.test(file.name) && !/^image\/jpeg$/i.test(file.type)) return alert('Choose a JPG image.');
        if (file.size > 10 * 1024 * 1024) return alert('Max 10MB.');
        try {
            img = await toolLoadImageFile(file);
            exportBtn.disabled = false;
            clearBtn.disabled = false;
            status.textContent = `${img.naturalWidth}×${img.naturalHeight}px JPG ready.`;
            const el = document.createElement('img');
            el.src = img.src;
            el.style.maxWidth = '100%';
            previewWrap.innerHTML = '';
            previewWrap.appendChild(el);
        } catch (e) {
            alert('Could not read JPG.');
        }
    }

    function exportImage() {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext('2d').drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
            if (!blob) return alert('Convert failed.');
            toolDownloadBlob(blob, 'converted.png');
        }, 'image/png');
    }

    function resetAll() {
        img = null;
        document.getElementById('file-input').value = '';
        exportBtn.disabled = true;
        clearBtn.disabled = true;
        status.textContent = '';
        previewWrap.innerHTML = '<p style="color:var(--text-secondary);">Upload a JPG to preview it.</p>';
    }
});
