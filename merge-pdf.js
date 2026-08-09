document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const fileList = document.getElementById('file-list');
    const status = document.getElementById('status');
    let files = [];

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        addFiles([...e.dataTransfer.files]);
    });
    fileInput.addEventListener('change', () => addFiles([...fileInput.files]));
    clearBtn.addEventListener('click', resetAll);
    exportBtn.addEventListener('click', mergePdf);

    function addFiles(list) {
        const pdfs = list.filter((f) => f.type === 'application/pdf' || /\.pdf$/i.test(f.name));
        if (!pdfs.length) return alert('Choose PDF files.');
        for (const f of pdfs) {
            if (f.size > 10 * 1024 * 1024) return alert(`${f.name} is over 10MB.`);
        }
        files = files.concat(pdfs);
        renderList();
    }

    function renderList() {
        fileList.innerHTML = '';
        if (!files.length) {
            fileList.innerHTML = '<li style="color:var(--text-secondary);">Add two or more PDFs to merge.</li>';
            exportBtn.disabled = true;
            clearBtn.disabled = true;
            status.textContent = '';
            return;
        }
        files.forEach((f, i) => {
            const li = document.createElement('li');
            li.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:0.5rem;padding:0.65rem 0.85rem;border:1px solid rgba(255,255,255,0.1);border-radius:10px;background:rgba(0,0,0,0.2);';
            li.innerHTML = `<span><strong>${i + 1}.</strong> ${f.name}</span>`;
            const rm = document.createElement('button');
            rm.type = 'button';
            rm.className = 'secondary-btn';
            rm.textContent = 'Remove';
            rm.style.padding = '0.35rem 0.65rem';
            rm.addEventListener('click', () => { files.splice(i, 1); renderList(); });
            li.appendChild(rm);
            fileList.appendChild(li);
        });
        status.textContent = `${files.length} PDF(s) ready.`;
        exportBtn.disabled = files.length < 2;
        clearBtn.disabled = false;
    }

    async function mergePdf() {
        if (files.length < 2) return alert('Add at least two PDFs.');
        toolShowLoading('Merging PDFs...');
        try {
            await ensureToolPdfLibs();
            const merged = await PDFLib.PDFDocument.create();
            for (const file of files) {
                const bytes = await file.arrayBuffer();
                const src = await PDFLib.PDFDocument.load(bytes);
                const pages = await merged.copyPages(src, src.getPageIndices());
                pages.forEach((p) => merged.addPage(p));
            }
            const out = await merged.save();
            toolDownloadBlob(new Blob([out], { type: 'application/pdf' }), 'merged.pdf');
        } catch (e) {
            console.error(e);
            alert('Merge failed. Try different PDFs.');
        } finally {
            toolHideLoading();
        }
    }

    function resetAll() {
        files = [];
        fileInput.value = '';
        renderList();
    }
});
