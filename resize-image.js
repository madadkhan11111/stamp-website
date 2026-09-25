document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewWrap = document.getElementById('preview-wrap');
    const maxw = document.getElementById('maxw');
    const status = document.getElementById('status');
    let img = null;
    let srcName = 'resized.jpg';

    toolBindDrop((files) => handleFile(files[0]));
    clearBtn.addEventListener('click', resetAll);
    exportBtn.addEventListener('click', exportImage);
    maxw.addEventListener('change', () => { if (img) draw(); });

    async function handleFile(file) {
        if (!toolIsImage(file)) return alert('Choose a JPG, PNG, or WEBP image.');
        if (file.size > 10 * 1024 * 1024) return alert('Max 10MB.');
        try {
            img = await toolLoadImageFile(file);
            srcName = file.name.replace(/\.(jpe?g|png|webp)$/i, '') + '-resized.jpg';
            exportBtn.disabled = false;
            clearBtn.disabled = false;
            status.textContent = `Original ${img.naturalWidth}×${img.naturalHeight}px.`;
            draw();
        } catch (e) {
            alert('Could not read image.');
        }
    }

    function sizedCanvas() {
        const cap = Math.max(100, Number(maxw.value) || 1200);
        const scale = Math.min(1, cap / img.naturalWidth);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.naturalWidth * scale);
        canvas.height = Math.round(img.naturalHeight * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        return canvas;
    }

    function draw() {
        const canvas = sizedCanvas();
        canvas.style.maxWidth = '100%';
        previewWrap.innerHTML = '';
        previewWrap.appendChild(canvas);
        status.textContent = `Will export ${canvas.width}×${canvas.height}px.`;
    }

    function exportImage() {
        const canvas = sizedCanvas();
        canvas.toBlob((blob) => {
            if (!blob) return alert('Resize failed.');
            toolDownloadBlob(blob, srcName);
        }, 'image/jpeg', 0.9);
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
