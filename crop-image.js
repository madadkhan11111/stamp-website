document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewWrap = document.getElementById('preview-wrap');
    const status = document.getElementById('status');
    const sliders = ['top', 'bottom', 'left', 'right'].map((id) => document.getElementById(id));
    let img = null;

    sliders.forEach((el) => {
        el.addEventListener('input', () => {
            document.getElementById(el.id + '-val').textContent = el.value + '%';
            if (img) draw();
        });
    });
    toolBindDrop((files) => handleFile(files[0]));
    clearBtn.addEventListener('click', resetAll);
    exportBtn.addEventListener('click', exportImage);

    async function handleFile(file) {
        if (!toolIsImage(file)) return alert('Choose a JPG, PNG, or WEBP image.');
        if (file.size > 10 * 1024 * 1024) return alert('Max 10MB.');
        try {
            img = await toolLoadImageFile(file);
            exportBtn.disabled = false;
            clearBtn.disabled = false;
            status.textContent = `Original ${img.naturalWidth}×${img.naturalHeight}px.`;
            draw();
        } catch (e) {
            alert('Could not read image.');
        }
    }

    function cropBox() {
        const t = Number(document.getElementById('top').value) / 100;
        const b = Number(document.getElementById('bottom').value) / 100;
        const l = Number(document.getElementById('left').value) / 100;
        const r = Number(document.getElementById('right').value) / 100;
        const sx = Math.round(img.naturalWidth * l);
        const sy = Math.round(img.naturalHeight * t);
        const sw = Math.max(1, Math.round(img.naturalWidth * (1 - l - r)));
        const sh = Math.max(1, Math.round(img.naturalHeight * (1 - t - b)));
        return { sx, sy, sw, sh };
    }

    function draw() {
        const { sx, sy, sw, sh } = cropBox();
        const canvas = document.createElement('canvas');
        canvas.width = sw;
        canvas.height = sh;
        canvas.style.maxWidth = '100%';
        canvas.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
        previewWrap.innerHTML = '';
        previewWrap.appendChild(canvas);
        status.textContent = `Will export ${sw}×${sh}px.`;
    }

    async function exportImage() {
        draw();
        const canvas = previewWrap.querySelector('canvas');
        if (!canvas) return;
        try {
            const blob = await toolCanvasBlob(canvas, 'image/jpeg', 0.92);
            toolDownloadBlob(blob, 'cropped.jpg');
        } catch (e) {
            alert('Crop failed.');
        }
    }

    function resetAll() {
        img = null;
        document.getElementById('file-input').value = '';
        exportBtn.disabled = true;
        clearBtn.disabled = true;
        status.textContent = '';
        previewWrap.innerHTML = '<p style="color:var(--text-secondary);">Upload an image to crop it.</p>';
    }
});
