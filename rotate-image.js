document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const rotLeft = document.getElementById('rot-left');
    const rotRight = document.getElementById('rot-right');
    const previewWrap = document.getElementById('preview-wrap');
    const status = document.getElementById('status');
    let img = null;
    let turns = 0;

    toolBindDrop((files) => handleFile(files[0]));
    clearBtn.addEventListener('click', resetAll);
    exportBtn.addEventListener('click', exportImage);
    rotLeft.addEventListener('click', () => { turns = (turns + 3) % 4; draw(); });
    rotRight.addEventListener('click', () => { turns = (turns + 1) % 4; draw(); });

    async function handleFile(file) {
        if (!toolIsImage(file)) return alert('Choose a JPG, PNG, or WEBP image.');
        if (file.size > 10 * 1024 * 1024) return alert('Max 10MB.');
        try {
            img = await toolLoadImageFile(file);
            turns = 0;
            exportBtn.disabled = false;
            clearBtn.disabled = false;
            rotLeft.disabled = false;
            rotRight.disabled = false;
            status.textContent = `${img.naturalWidth}×${img.naturalHeight}px ready.`;
            draw();
        } catch (e) {
            alert('Could not read image.');
        }
    }

    function rotatedCanvas() {
        const srcW = img.naturalWidth;
        const srcH = img.naturalHeight;
        const swap = turns % 2 === 1;
        const canvas = document.createElement('canvas');
        canvas.width = swap ? srcH : srcW;
        canvas.height = swap ? srcW : srcH;
        const ctx = canvas.getContext('2d');
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((turns * 90) * Math.PI / 180);
        ctx.drawImage(img, -srcW / 2, -srcH / 2);
        return canvas;
    }

    function draw() {
        const canvas = rotatedCanvas();
        canvas.style.maxWidth = '100%';
        previewWrap.innerHTML = '';
        previewWrap.appendChild(canvas);
        status.textContent = `Rotated ${turns * 90}°. ${canvas.width}×${canvas.height}px.`;
    }

    async function exportImage() {
        try {
            const blob = await toolCanvasBlob(rotatedCanvas(), 'image/jpeg', 0.92);
            toolDownloadBlob(blob, 'rotated.jpg');
        } catch (e) {
            alert('Rotate failed.');
        }
    }

    function resetAll() {
        img = null;
        turns = 0;
        document.getElementById('file-input').value = '';
        exportBtn.disabled = true;
        clearBtn.disabled = true;
        rotLeft.disabled = true;
        rotRight.disabled = true;
        status.textContent = '';
        previewWrap.innerHTML = '<p style="color:var(--text-secondary);">Upload an image to rotate it.</p>';
    }
});
