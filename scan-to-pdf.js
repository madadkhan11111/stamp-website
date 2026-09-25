document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewWrap = document.getElementById('preview-wrap');
    const status = document.getElementById('status');
    const cameraBtn = document.getElementById('camera-btn');
    const snapBtn = document.getElementById('snap-btn');
    const stopCamBtn = document.getElementById('stop-cam-btn');
    const video = document.getElementById('cam');
    let files = [];
    let stream = null;

    toolBindDrop((list) => addFiles(list));
    clearBtn.addEventListener('click', resetAll);
    exportBtn.addEventListener('click', exportPdf);
    cameraBtn.addEventListener('click', startCam);
    snapBtn.addEventListener('click', snap);
    stopCamBtn.addEventListener('click', stopCam);

    async function fileFromAnything(file) {
        if (toolIsHeic(file)) return new File([await toolHeicToJpegBlob(file, 0.9)], file.name.replace(/\.hei[cf]$/i, '.jpg'), { type: 'image/jpeg' });
        return file;
    }

    async function addFiles(list) {
        const incoming = [];
        for (const f of list) {
            if (f.size > 10 * 1024 * 1024) continue;
            if (toolIsHeic(f) || toolIsImage(f) || /^image\//i.test(f.type)) incoming.push(f);
        }
        if (!incoming.length) return alert('Choose photos, or capture with the camera.');
        toolShowLoading('Adding pages...');
        try {
            for (const f of incoming) files.push(await fileFromAnything(f));
            exportBtn.disabled = false;
            clearBtn.disabled = false;
            renderThumbs();
        } catch (e) {
            console.error(e);
            alert('Could not read one of the photos.');
        } finally {
            toolHideLoading();
        }
    }

    function renderThumbs() {
        status.textContent = `${files.length} page(s) ready.`;
        previewWrap.innerHTML = '';
        const wrap = document.createElement('div');
        wrap.className = 'scan-thumbs';
        files.forEach((f) => {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(f);
            wrap.appendChild(img);
        });
        previewWrap.appendChild(wrap);
    }

    async function startCam() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
            video.srcObject = stream;
            video.style.display = 'block';
            snapBtn.style.display = 'block';
            stopCamBtn.style.display = 'block';
        } catch (e) {
            console.error(e);
            alert('Camera not available. On a phone, use Browse and pick the camera. This page must be HTTPS.');
        }
    }

    function stopCam() {
        if (stream) stream.getTracks().forEach((t) => t.stop());
        stream = null;
        video.srcObject = null;
        video.style.display = 'none';
        snapBtn.style.display = 'none';
        stopCamBtn.style.display = 'none';
    }

    function snap() {
        if (!video.videoWidth) return;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
            if (!blob) return;
            files.push(new File([blob], `scan-${Date.now()}.jpg`, { type: 'image/jpeg' }));
            exportBtn.disabled = false;
            clearBtn.disabled = false;
            renderThumbs();
        }, 'image/jpeg', 0.9);
    }

    async function jpegBytes(file) {
        const img = await toolLoadImageFile(file);
        const max = 1600;
        const scale = Math.min(1, max / img.naturalWidth);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.naturalWidth * scale);
        canvas.height = Math.round(img.naturalHeight * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        const blob = await toolCanvasBlob(canvas, 'image/jpeg', 0.85);
        return blob.arrayBuffer();
    }

    async function exportPdf() {
        if (!files.length) return;
        toolShowLoading('Building PDF...');
        try {
            await ensureToolPdfLibs();
            const pdfDoc = await PDFLib.PDFDocument.create();
            const pageW = 595.28;
            const pageH = 841.89;
            const margin = 24;
            for (let i = 0; i < files.length; i++) {
                toolShowLoading(`Adding page ${i + 1} of ${files.length}...`);
                const image = await pdfDoc.embedJpg(await jpegBytes(files[i]));
                const page = pdfDoc.addPage([pageW, pageH]);
                const maxW = pageW - margin * 2;
                const maxH = pageH - margin * 2;
                const scale = Math.min(maxW / image.width, maxH / image.height);
                const w = image.width * scale;
                const h = image.height * scale;
                page.drawImage(image, { x: (pageW - w) / 2, y: (pageH - h) / 2, width: w, height: h });
            }
            stopCam();
            toolDownloadBlob(new Blob([await pdfDoc.save()], { type: 'application/pdf' }), 'scan.pdf');
        } catch (e) {
            console.error(e);
            alert('Could not build PDF from scans.');
        } finally {
            toolHideLoading();
        }
    }

    function resetAll() {
        stopCam();
        files = [];
        document.getElementById('file-input').value = '';
        exportBtn.disabled = true;
        clearBtn.disabled = true;
        status.textContent = '';
        previewWrap.innerHTML = '<p style="color:var(--text-secondary);">Add photos or capture pages to build a PDF.</p>';
    }
});
