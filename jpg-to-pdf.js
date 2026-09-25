document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewWrap = document.getElementById('preview-wrap');
    const status = document.getElementById('status');
    const pageSize = document.getElementById('page-size');
    let files = [];

    function isJpg(file) {
        return !!(file && (/image\/jpe?g/i.test(file.type) || /\.jpe?g$/i.test(file.name)));
    }

    toolBindDrop((list) => addFiles(list));
    clearBtn.addEventListener('click', resetAll);
    exportBtn.addEventListener('click', exportPdf);

    function addFiles(list) {
        const imgs = list.filter(isJpg);
        if (!imgs.length) return alert('Choose JPG photos.');
        const tooBig = imgs.find((f) => f.size > 10 * 1024 * 1024);
        if (tooBig) return alert('Max 10MB per file.');
        files = files.concat(imgs);
        exportBtn.disabled = false;
        clearBtn.disabled = false;
        status.textContent = files.length + ' JPG photo(s) selected.';
        previewWrap.innerHTML = '';
        files.forEach((f) => {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(f);
            img.style.maxWidth = '140px';
            img.style.maxHeight = '140px';
            img.style.objectFit = 'contain';
            img.style.borderRadius = '8px';
            previewWrap.appendChild(img);
        });
    }

    async function exportPdf() {
        if (!files.length) return;
        toolShowLoading('Building JPG PDF...');
        try {
            const paper = pageSize.value === 'original' ? '' : pageSize.value;
            await toolFilesToPdf(files, 'jpg-to-pdf.pdf', paper);
        } catch (e) {
            console.error(e);
            alert('Could not create PDF. Try a smaller JPG.');
        } finally {
            toolHideLoading();
        }
    }

    function resetAll() {
        files = [];
        document.getElementById('file-input').value = '';
        exportBtn.disabled = true;
        clearBtn.disabled = true;
        status.textContent = '';
        previewWrap.innerHTML = '<p style="color:var(--text-secondary);">Add one or more JPG photos.</p>';
    }
});
