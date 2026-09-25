document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewWrap = document.getElementById('preview-wrap');
    const mode = document.getElementById('mode');
    const status = document.getElementById('status');
    let img = null;

    toolBindDrop((files) => handleFile(files[0]));
    clearBtn.addEventListener('click', resetAll);
    exportBtn.addEventListener('click', exportImage);
    mode.addEventListener('change', () => { if (img) draw(); });

    async function handleFile(file) {
        if (!toolIsImage(file)) return alert('Choose a JPG, PNG, or WEBP image.');
        if (file.size > 10 * 1024 * 1024) return alert('Max 10MB.');
        try {
            img = await toolLoadImageFile(file);
            exportBtn.disabled = false;
            clearBtn.disabled = false;
            status.textContent = `${img.naturalWidth}×${img.naturalHeight}px ready.`;
            draw();
        } catch (e) {
            alert('Could not read image.');
        }
    }

    function flippedCanvas() {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (mode.value === 'h') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        } else {
            ctx.translate(0, canvas.height);
            ctx.scale(1, -1);
        }
        ctx.drawImage(img, 0, 0);
        return canvas;
    }

    function draw() {
        const canvas = flippedCanvas();
        canvas.style.maxWidth = '100%';
        previewWrap.innerHTML = '';
        previewWrap.appendChild(canvas);
    }

    async function exportImage() {
        try {
            const blob = await toolCanvasBlob(flippedCanvas(), 'image/jpeg', 0.92);
            toolDownloadBlob(blob, 'flipped.jpg');
        } catch (e) {
            alert('Flip failed.');
        }
    }

    function resetAll() {
        img = null;
        document.getElementById('file-input').value = '';
        exportBtn.disabled = true;
        clearBtn.disabled = true;
        status.textContent = '';
        previewWrap.innerHTML = '<p style="color:var(--text-secondary);">Upload an image to flip it.</p>';
    }
});
