document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewWrap = document.getElementById('preview-wrap');
    const quality = document.getElementById('quality');
    const status = document.getElementById('status');
    let img = null;

    quality.addEventListener('input', () => {
        document.getElementById('quality-val').textContent = Math.round(Number(quality.value) * 100) + '%';
    });
    toolBindDrop((files) => handleFile(files[0]));
    clearBtn.addEventListener('click', resetAll);
    exportBtn.addEventListener('click', exportImage);

    async function handleFile(file) {
        if (!toolIsImage(file, 'jpeg|jpg|png')) return alert('Choose a JPG or PNG image.');
        if (file.size > 10 * 1024 * 1024) return alert('Max 10MB.');
        try {
            img = await toolLoadImageFile(file);
            exportBtn.disabled = false;
            clearBtn.disabled = false;
            status.textContent = `${img.naturalWidth}×${img.naturalHeight}px ready.`;
            const el = document.createElement('img');
            el.src = img.src;
            el.style.maxWidth = '100%';
            previewWrap.innerHTML = '';
            previewWrap.appendChild(el);
        } catch (e) {
            alert('Could not read image.');
        }
    }

    async function exportImage() {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext('2d').drawImage(img, 0, 0);
        try {
            const blob = await toolCanvasBlob(canvas, 'image/webp', Number(quality.value));
            if (blob.type !== 'image/webp') {
                return alert('This browser cannot encode WEBP. Try Chrome, Edge, or Firefox.');
            }
            toolDownloadBlob(blob, 'converted.webp');
        } catch (e) {
            alert('Convert failed.');
        }
    }

    function resetAll() {
        img = null;
        document.getElementById('file-input').value = '';
        exportBtn.disabled = true;
        clearBtn.disabled = true;
        status.textContent = '';
        previewWrap.innerHTML = '<p style="color:var(--text-secondary);">Upload a JPG or PNG to preview it.</p>';
    }
});
