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
        if (!/webp$/i.test(file.type) && !/\.webp$/i.test(file.name)) return alert('Choose a WEBP image.');
        if (file.size > 10 * 1024 * 1024) return alert('Max 10MB.');
        try {
            img = await toolLoadImageFile(file);
            exportBtn.disabled = false;
            clearBtn.disabled = false;
            status.textContent = `${img.naturalWidth}×${img.naturalHeight}px WEBP ready.`;
            const el = document.createElement('img');
            el.src = img.src;
            el.style.maxWidth = '100%';
            previewWrap.innerHTML = '';
            previewWrap.appendChild(el);
        } catch (e) {
            alert('Could not read WEBP.');
        }
    }

    async function exportImage() {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        try {
            const blob = await toolCanvasBlob(canvas, 'image/jpeg', Number(quality.value));
            toolDownloadBlob(blob, 'converted.jpg');
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
        previewWrap.innerHTML = '<p style="color:var(--text-secondary);">Upload a WEBP to preview it.</p>';
    }
});
