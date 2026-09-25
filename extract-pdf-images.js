document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewWrap = document.getElementById('preview-wrap');
    const status = document.getElementById('status');
    let images = [];

    toolBindDrop((files) => handleFile(files[0]));
    clearBtn.addEventListener('click', resetAll);
    exportBtn.addEventListener('click', exportZip);

    function getObj(store, name) {
        return new Promise((resolve) => {
            try {
                store.get(name, (obj) => resolve(obj || null));
            } catch (e) {
                resolve(null);
            }
        });
    }

    function imageToCanvas(img) {
        const w = img.width;
        const h = img.height;
        if (!w || !h || w < 24 || h < 24) return null;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (img.bitmap) {
            ctx.drawImage(img.bitmap, 0, 0);
            return canvas;
        }
        const data = img.data;
        if (!data) return null;
        let rgba;
        if (data.length === w * h * 4) {
            rgba = data instanceof Uint8ClampedArray ? data : new Uint8ClampedArray(data);
        } else if (data.length === w * h * 3) {
            rgba = new Uint8ClampedArray(w * h * 4);
            for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
                rgba[j] = data[i];
                rgba[j + 1] = data[i + 1];
                rgba[j + 2] = data[i + 2];
                rgba[j + 3] = 255;
            }
        } else if (data.length === w * h) {
            rgba = new Uint8ClampedArray(w * h * 4);
            for (let i = 0, j = 0; i < data.length; i++, j += 4) {
                rgba[j] = rgba[j + 1] = rgba[j + 2] = data[i];
                rgba[j + 3] = 255;
            }
        } else {
            return null;
        }
        ctx.putImageData(new ImageData(rgba, w, h), 0, 0);
        return canvas;
    }

    async function handleFile(file) {
        if (!toolIsPdf(file)) return alert('Choose a PDF.');
        if (file.size > 10 * 1024 * 1024) return alert('Max 10MB.');
        toolShowLoading('Finding images...');
        try {
            await ensureToolPdfLibs();
            const doc = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
            images = [];
            previewWrap.innerHTML = '';
            const seen = new Set();
            for (let p = 1; p <= doc.numPages; p++) {
                toolShowLoading(`Scanning page ${p} of ${doc.numPages}...`);
                const page = await doc.getPage(p);
                const ops = await page.getOperatorList();
                const paintOps = [
                    pdfjsLib.OPS.paintImageXObject,
                    pdfjsLib.OPS.paintInlineImageXObject,
                    pdfjsLib.OPS.paintImageXObjectRepeat
                ];
                for (let i = 0; i < ops.fnArray.length; i++) {
                    if (paintOps.indexOf(ops.fnArray[i]) === -1) continue;
                    const arg = ops.argsArray[i] && ops.argsArray[i][0];
                    let img = null;
                    if (arg && typeof arg === 'object' && arg.width) img = arg;
                    else if (typeof arg === 'string') {
                        if (seen.has(arg)) continue;
                        seen.add(arg);
                        img = await getObj(page.objs, arg);
                        if (!img) img = await getObj(page.commonObjs, arg);
                    }
                    const canvas = img && imageToCanvas(img);
                    if (!canvas) continue;
                    images.push(canvas);
                    canvas.style.maxWidth = '120px';
                    canvas.style.maxHeight = '120px';
                    canvas.style.objectFit = 'contain';
                    previewWrap.appendChild(canvas);
                }
            }
            exportBtn.disabled = !images.length;
            clearBtn.disabled = false;
            status.textContent = images.length
                ? `Found ${images.length} image(s).`
                : 'No embedded images found. Scanned pages are not separate image files — use PDF to JPG instead.';
        } catch (e) {
            console.error(e);
            alert('Could not read PDF images.');
            resetAll();
        } finally {
            toolHideLoading();
        }
    }

    async function exportZip() {
        if (!images.length) return;
        toolShowLoading('Packing ZIP...');
        try {
            await toolEnsureZip();
            const zip = new JSZip();
            for (let i = 0; i < images.length; i++) {
                const blob = await toolCanvasBlob(images[i], 'image/png');
                zip.file(`image-${String(i + 1).padStart(2, '0')}.png`, blob);
            }
            toolDownloadBlob(await zip.generateAsync({ type: 'blob' }), 'pdf-images.zip');
        } catch (e) {
            console.error(e);
            alert('ZIP export failed.');
        } finally {
            toolHideLoading();
        }
    }

    function resetAll() {
        images = [];
        document.getElementById('file-input').value = '';
        exportBtn.disabled = true;
        clearBtn.disabled = true;
        status.textContent = '';
        previewWrap.innerHTML = '<p style="color:var(--text-secondary);">Upload a PDF to extract its images.</p>';
    }
});
