document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewWrap = document.getElementById('preview-wrap');
    const quality = document.getElementById('quality');
    const status = document.getElementById('status');
    let img = null;
    let originalBytes = 0;

    quality.addEventListener('input', () => {
        document.getElementById('quality-val').textContent = Math.round(Number(quality.value) * 100) + '%';
        if (img) draw();
    });
    toolBindDrop((files) => handleFile(files[0]));
    clearBtn.addEventListener('click', resetAll);
    exportBtn.addEventListener('click', exportImage);

    async function handleFile(file) {
        if (!toolIsImage(file)) return alert('Choose a JPG, PNG, or WEBP image.');
        if (file.size > 10 * 1024 * 1024) return alert('Max 10MB.');
        try {
            img = await toolLoadImageFile(file);
            originalBytes = file.size;
            exportBtn.disabled = false;
            clearBtn.disabled = false;
            status.textContent = `Original ${toolFormatBytes(originalBytes)}.`;
            draw();
        } catch (e) {
            alert('Could not read image.');
        }
    }

    function draw() {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.style.maxWidth = '100%';
        canvas.getContext('2d').drawImage(img, 0, 0);
        previewWrap.innerHTML = '';
        previewWrap.appendChild(canvas);
    }

    function exportImage() {
        const canvas = previewWrap.querySelector('canvas');
        if (!canvas) return;
        canvas.toBlob((blob) => {
            if (!blob) return alert('Compress failed.');
            status.textContent = `Original ${toolFormatBytes(originalBytes)} → ${toolFormatBytes(blob.size)}.`;
            toolDownloadBlob(blob, 'compressed.jpg');
        }, 'image/jpeg', Number(quality.value));
    }

    function resetAll() {
        img = null;
        document.getElementById('file-input').value = '';
        exportBtn.disabled = true;
        clearBtn.disabled = true;
        status.textContent = '';
        previewWrap.innerHTML = '<p style="color:var(--text-secondary);">Upload an image to preview it.</p>';
    }
});
