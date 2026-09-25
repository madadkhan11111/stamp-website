document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewWrap = document.getElementById('preview-wrap');
    const status = document.getElementById('status');
    const targetKb = document.getElementById('target-kb');
    let img = null;
    let originalBytes = 0;
    let lastBlob = null;

    toolBindDrop((files) => handleFile(files[0]));
    targetKb.addEventListener('change', () => { if (img) compressPreview(); });
    clearBtn.addEventListener('click', resetAll);
    exportBtn.addEventListener('click', () => {
        if (lastBlob) toolDownloadBlob(lastBlob, 'compressed-' + targetKb.value + 'kb.jpg');
    });

    async function handleFile(file) {
        if (!toolIsImage(file)) return alert('Choose a JPG, PNG, or WEBP image.');
        if (file.size > 10 * 1024 * 1024) return alert('Max 10MB.');
        try {
            img = await toolLoadImageFile(file);
            originalBytes = file.size;
            exportBtn.disabled = false;
            clearBtn.disabled = false;
            await compressPreview();
        } catch (e) {
            alert('Could not read image.');
        }
    }

    async function compressPreview() {
        if (!img) return;
        const maxBytes = Number(targetKb.value) * 1024;
        toolShowLoading('Compressing to ' + targetKb.value + 'KB...');
        try {
            lastBlob = await compressToMaxBytes(img, maxBytes);
            const url = URL.createObjectURL(lastBlob);
            const el = document.createElement('img');
            el.src = url;
            el.style.maxWidth = '100%';
            previewWrap.innerHTML = '';
            previewWrap.appendChild(el);
            const hit = lastBlob.size <= maxBytes;
            status.textContent = 'Original ' + toolFormatBytes(originalBytes) + ' → ' +
                toolFormatBytes(lastBlob.size) +
                (hit ? ' (under ' + targetKb.value + 'KB).' : ' (closest we could get).');
        } catch (e) {
            console.error(e);
            alert('Compress failed.');
        } finally {
            toolHideLoading();
        }
    }

    async function compressToMaxBytes(image, maxBytes) {
        const encode = (quality, scale) => {
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
            canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            return toolCanvasBlob(canvas, 'image/jpeg', quality);
        };
        let scale = 1;
        let best = null;
        for (let round = 0; round < 10; round++) {
            let lo = 0.08;
            let hi = 0.92;
            for (let i = 0; i < 7; i++) {
                const mid = (lo + hi) / 2;
                const blob = await encode(mid, scale);
                if (blob.size <= maxBytes) {
                    best = blob;
                    lo = mid;
                } else {
                    hi = mid;
                    if (!best || blob.size < best.size) best = blob;
                }
            }
            if (best && best.size <= maxBytes) return best;
            scale *= 0.82;
            if (scale < 0.12) break;
        }
        return best || encode(0.08, Math.max(0.12, scale));
    }

    function resetAll() {
        img = null;
        lastBlob = null;
        document.getElementById('file-input').value = '';
        exportBtn.disabled = true;
        clearBtn.disabled = true;
        status.textContent = '';
        previewWrap.innerHTML = '<p style="color:var(--text-secondary);">Upload an image, pick 20KB or 50KB, then download.</p>';
    }
});
