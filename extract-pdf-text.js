document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const copyBtn = document.getElementById('copy-btn');
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const output = document.getElementById('output');
    const status = document.getElementById('status');

    let fileName = 'extracted.txt';

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', () => { if (fileInput.files[0]) handleFile(fileInput.files[0]); });
    clearBtn.addEventListener('click', resetAll);
    copyBtn.addEventListener('click', copyText);
    exportBtn.addEventListener('click', downloadText);

    async function handleFile(file) {
        if (!toolIsPdf(file)) return alert('Choose a PDF.');
        if (file.size > 10 * 1024 * 1024) return alert('Max 10MB.');
        toolShowLoading('Extracting text...');
        try {
            await ensureToolPdfLibs();
            fileName = file.name.replace(/\.pdf$/i, '') + '.txt';
            const bytes = await file.arrayBuffer();
            const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
            const parts = [];
            for (let i = 1; i <= doc.numPages; i++) {
                const page = await doc.getPage(i);
                const content = await page.getTextContent();
                const line = content.items.map((item) => item.str).join(' ').replace(/\s+/g, ' ').trim();
                parts.push(line ? `--- Page ${i} ---\n${line}` : `--- Page ${i} ---\n`);
            }
            const text = parts.join('\n\n').trim();
            output.value = text || '(No selectable text found. Scanned PDFs need OCR.)';
            copyBtn.disabled = !text;
            exportBtn.disabled = !text;
            clearBtn.disabled = false;
            status.textContent = text
                ? `${doc.numPages} page(s) · ${text.length.toLocaleString()} characters.`
                : `${doc.numPages} page(s), but no selectable text.`;
        } catch (e) {
            console.error(e);
            alert('Could not extract text.');
            resetAll();
        } finally {
            toolHideLoading();
        }
    }

    async function copyText() {
        try {
            await navigator.clipboard.writeText(output.value);
            status.textContent = 'Copied to clipboard.';
        } catch (e) {
            output.select();
            document.execCommand('copy');
            status.textContent = 'Copied to clipboard.';
        }
    }

    function downloadText() {
        toolDownloadBlob(new Blob([output.value], { type: 'text/plain' }), fileName);
    }

    function resetAll() {
        fileInput.value = '';
        output.value = '';
        copyBtn.disabled = true;
        exportBtn.disabled = true;
        clearBtn.disabled = true;
        status.textContent = '';
    }
});
