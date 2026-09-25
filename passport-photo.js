document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewWrap = document.getElementById('preview-wrap');
    const status = document.getElementById('status');
    const photoSize = document.getElementById('photo-size');
    const zoom = document.getElementById('zoom');
    const panX = document.getElementById('pan-x');
    const panY = document.getElementById('pan-y');
    const maxKb = document.getElementById('max-kb');
    let img = null;
    let timer = null;

    zoom.addEventListener('input', () => {
        document.getElementById('zoom-val').textContent = zoom.value + '%';
        schedule();
    });
    [photoSize, panX, panY, maxKb].forEach((el) => el.addEventListener('input', schedule));
    photoSize.addEventListener('change', schedule);
    maxKb.addEventListener('change', schedule);
    toolBindDrop((files) => handleFile(files[0]));
    clearBtn.addEventListener('click', resetAll);
    exportBtn.addEventListener('click', exportJpg);

    function schedule() {
        clearTimeout(timer);
        timer = setTimeout(draw, 60);
    }

    function dims() {
        if (photoSize.value === '2x2') return { w: 600, h: 600, label: '2×2 inch' };
        return { w: 413, h: 531, label: '35×45 mm' };
    }

    async function handleFile(file) {
        if (!toolIsImage(file)) return alert('Choose a JPG, PNG, or WEBP photo.');
        if (file.size > 10 * 1024 * 1024) return alert('Max 10MB.');
        try {
            img = await toolLoadImageFile(file);
            exportBtn.disabled = false;
            clearBtn.disabled = false;
            draw();
        } catch (e) {
            alert('Could not read photo.');
        }
    }

    function paint(canvas) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (!img) return;
        const z = Number(zoom.value) / 100;
        const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight) * z;
        const dw = img.naturalWidth * scale;
        const dh = img.naturalHeight * scale;
        const x = (canvas.width - dw) / 2 + (Number(panX.value) / 100) * canvas.width;
        const y = (canvas.height - dh) / 2 + (Number(panY.value) / 100) * canvas.height;
        ctx.drawImage(img, x, y, dw, dh);
    }

    function draw() {
        const d = dims();
        const canvas = document.createElement('canvas');
        canvas.width = d.w;
        canvas.height = d.h;
        canvas.style.maxWidth = '280px';
        canvas.style.border = '1px solid #d1d5db';
        canvas.style.background = '#fff';
        paint(canvas);
        previewWrap.innerHTML = '';
        previewWrap.appendChild(canvas);
        if (img) status.textContent = d.label + ' at 300 DPI (' + d.w + '×' + d.h + ' px).';
    }

    async function compressToMax(source, maxBytes) {
        if (!maxBytes) return toolCanvasBlob(source, 'image/jpeg', 0.92);
        let lo = 0.08;
        let hi = 0.92;
        let best = null;
        for (let i = 0; i < 8; i++) {
            const mid = (lo + hi) / 2;
            const blob = await toolCanvasBlob(source, 'image/jpeg', mid);
            if (blob.size <= maxBytes) {
                best = blob;
                lo = mid;
            } else {
                hi = mid;
                if (!best || blob.size < best.size) best = blob;
            }
        }
        return best || toolCanvasBlob(source, 'image/jpeg', 0.08);
    }

    async function exportJpg() {
        if (!img) return;
        const d = dims();
        const canvas = document.createElement('canvas');
        canvas.width = d.w;
        canvas.height = d.h;
        paint(canvas);
        toolShowLoading('Making passport photo...');
        try {
            const limit = Number(maxKb.value) * 1024;
            const blob = await compressToMax(canvas, limit);
            const hit = !limit || blob.size <= limit;
            status.textContent = d.label + ' · ' + toolFormatBytes(blob.size) +
                (hit ? '.' : ' (closest we could get).');
            toolDownloadBlob(blob, 'passport-photo.jpg');
        } catch (e) {
            alert('Download failed.');
        } finally {
            toolHideLoading();
        }
    }

    function resetAll() {
        img = null;
        document.getElementById('file-input').value = '';
        exportBtn.disabled = true;
        clearBtn.disabled = true;
        status.textContent = '';
        previewWrap.innerHTML = '<p style="color:var(--text-secondary);">Upload a photo, then zoom until the face fits.</p>';
    }
});
