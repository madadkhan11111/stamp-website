document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewWrap = document.getElementById('preview-wrap');
    const status = document.getElementById('status');
    const wmText = document.getElementById('wm-text');
    const wmOpacity = document.getElementById('wm-opacity');
    const wmSize = document.getElementById('wm-size');
    const wmAngle = document.getElementById('wm-angle');
    const wmColor = document.getElementById('wm-color');
    let img = null;
    let timer = null;

    function bind(input, label, fmt) {
        const sync = () => { label.textContent = fmt(input.value); schedule(); };
        input.addEventListener('input', sync);
        sync();
    }
    bind(wmOpacity, document.getElementById('wm-opacity-val'), (v) => Math.round(Number(v) * 100) + '%');
    bind(wmSize, document.getElementById('wm-size-val'), (v) => v);
    bind(wmAngle, document.getElementById('wm-angle-val'), (v) => v + '°');
    wmText.addEventListener('input', schedule);
    wmColor.addEventListener('input', schedule);

    toolBindDrop((files) => handleFile(files[0]));
    clearBtn.addEventListener('click', resetAll);
    exportBtn.addEventListener('click', exportImage);

    function schedule() {
        clearTimeout(timer);
        timer = setTimeout(draw, 80);
    }

    async function handleFile(file) {
        if (!toolIsImage(file)) return alert('Choose a JPG, PNG, or WEBP image.');
        if (file.size > 10 * 1024 * 1024) return alert('Max 10MB.');
        try {
            img = await toolLoadImageFile(file);
            exportBtn.disabled = false;
            clearBtn.disabled = false;
            status.textContent = img.naturalWidth + '×' + img.naturalHeight + 'px ready.';
            draw();
        } catch (e) {
            alert('Could not read image.');
        }
    }

    function draw() {
        if (!img) return;
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.style.maxWidth = '100%';
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const text = (wmText.value || 'WATERMARK').trim();
        if (text) {
            ctx.save();
            ctx.globalAlpha = Number(wmOpacity.value);
            ctx.fillStyle = wmColor.value;
            ctx.font = 'bold ' + wmSize.value + 'px Outfit, Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((Number(wmAngle.value) * Math.PI) / 180);
            ctx.fillText(text, 0, 0, canvas.width * 0.9);
            ctx.restore();
        }
        previewWrap.innerHTML = '';
        previewWrap.appendChild(canvas);
    }

    async function exportImage() {
        const canvas = previewWrap.querySelector('canvas');
        if (!canvas) return;
        try {
            const blob = await toolCanvasBlob(canvas, 'image/jpeg', 0.92);
            toolDownloadBlob(blob, 'watermarked.jpg');
        } catch (e) {
            alert('Download failed.');
        }
    }

    function resetAll() {
        img = null;
        document.getElementById('file-input').value = '';
        exportBtn.disabled = true;
        clearBtn.disabled = true;
        status.textContent = '';
        previewWrap.innerHTML = '<p style="color:var(--text-secondary);">Upload a photo to watermark it.</p>';
    }
});
