document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewWrap = document.getElementById('preview-wrap');
    const fieldsWrap = document.getElementById('form-fields');
    const status = document.getElementById('status');
    const flattenBox = document.getElementById('flatten');

    let pdfBytes = null;
    let fileName = 'filled.pdf';
    let fieldMeta = [];

    toolBindDrop((files) => handleFile(files[0]));
    clearBtn.addEventListener('click', resetAll);
    exportBtn.addEventListener('click', exportPdf);

    async function handleFile(file) {
        if (!toolIsPdf(file)) return alert('Choose a PDF.');
        if (file.size > 10 * 1024 * 1024) return alert('Max 10MB.');
        toolShowLoading('Reading form fields...');
        try {
            await ensureToolPdfLibs();
            pdfBytes = await file.arrayBuffer();
            fileName = file.name.replace(/\.pdf$/i, '') + '-filled.pdf';
            const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes.slice(0));
            const form = pdfDoc.getForm();
            const fields = form.getFields();
            if (!fields.length) {
                status.textContent = 'This PDF has no fillable fields. Use Add Text to write on a scanned page.';
                fieldsWrap.innerHTML = '';
                exportBtn.disabled = true;
                clearBtn.disabled = false;
                await renderPreview();
                return;
            }
            fieldMeta = fields.map((field, i) => describeField(field, i));
            renderFieldEditors();
            exportBtn.disabled = false;
            clearBtn.disabled = false;
            status.textContent = `${fieldMeta.length} form field(s) found.`;
            await renderPreview();
        } catch (e) {
            console.error(e);
            alert('Could not read this PDF form. Some scanned or XFA forms are not fillable here.');
            resetAll();
        } finally {
            toolHideLoading();
        }
    }

    function describeField(field, i) {
        const name = field.getName() || ('Field ' + (i + 1));
        const kind = field.constructor && field.constructor.name ? field.constructor.name : '';
        if (kind.indexOf('CheckBox') !== -1) {
            return { name: name, type: 'checkbox', checked: field.isChecked() };
        }
        if (kind.indexOf('Dropdown') !== -1 || kind.indexOf('OptionList') !== -1 || kind.indexOf('RadioGroup') !== -1) {
            let options = [];
            try { options = field.getOptions() || []; } catch (e) { options = []; }
            let selected = '';
            try {
                const sel = field.getSelected && field.getSelected();
                selected = Array.isArray(sel) ? (sel[0] || '') : (sel || '');
            } catch (e) { selected = ''; }
            return { name: name, type: 'choice', options: options, selected: selected };
        }
        let value = '';
        try { value = field.getText ? (field.getText() || '') : ''; } catch (e) { value = ''; }
        return { name: name, type: 'text', value: value };
    }

    function renderFieldEditors() {
        fieldsWrap.innerHTML = '';
        fieldMeta.forEach((meta, i) => {
            const group = document.createElement('div');
            group.className = 'control-group';
            const label = document.createElement('label');
            label.setAttribute('for', 'ff-' + i);
            label.textContent = meta.name;
            group.appendChild(label);
            if (meta.type === 'checkbox') {
                const row = document.createElement('label');
                row.style.display = 'flex';
                row.style.gap = '0.5rem';
                row.style.alignItems = 'center';
                const box = document.createElement('input');
                box.type = 'checkbox';
                box.id = 'ff-' + i;
                box.checked = !!meta.checked;
                row.appendChild(box);
                row.appendChild(document.createTextNode(' Checked'));
                group.appendChild(row);
            } else if (meta.type === 'choice') {
                const sel = document.createElement('select');
                sel.id = 'ff-' + i;
                sel.className = 'glass-input';
                const empty = document.createElement('option');
                empty.value = '';
                empty.textContent = '(leave empty)';
                sel.appendChild(empty);
                (meta.options || []).forEach((opt) => {
                    const o = document.createElement('option');
                    o.value = opt;
                    o.textContent = opt;
                    if (opt === meta.selected) o.selected = true;
                    sel.appendChild(o);
                });
                group.appendChild(sel);
            } else {
                const input = document.createElement('input');
                input.type = 'text';
                input.id = 'ff-' + i;
                input.className = 'glass-input';
                input.value = meta.value || '';
                group.appendChild(input);
            }
            fieldsWrap.appendChild(group);
        });
    }

    async function renderPreview() {
        const doc = await pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise;
        const page = await doc.getPage(1);
        const viewport = page.getViewport({ scale: 1.15 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.maxWidth = '100%';
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        previewWrap.innerHTML = '';
        previewWrap.appendChild(canvas);
    }

    async function exportPdf() {
        if (!pdfBytes || !fieldMeta.length) return;
        toolShowLoading('Filling form...');
        try {
            const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes.slice(0));
            const form = pdfDoc.getForm();
            const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
            fieldMeta.forEach((meta, i) => {
                const el = document.getElementById('ff-' + i);
                if (!el) return;
                let field;
                try { field = form.getField(meta.name); } catch (e) { return; }
                const kind = field.constructor && field.constructor.name ? field.constructor.name : '';
                try {
                    if (kind.indexOf('CheckBox') !== -1) {
                        if (el.checked) field.check();
                        else field.uncheck();
                    } else if (kind.indexOf('Dropdown') !== -1 || kind.indexOf('OptionList') !== -1 || kind.indexOf('RadioGroup') !== -1) {
                        if (el.value) field.select(el.value);
                    } else if (field.setText) {
                        field.setText(el.value || '');
                    }
                } catch (err) {
                    console.warn('Skip field', meta.name, err);
                }
            });
            try { form.updateFieldAppearances(font); } catch (e) {}
            if (flattenBox.checked) {
                try { form.flatten(); } catch (e) {}
            }
            const out = await pdfDoc.save();
            toolDownloadBlob(new Blob([out], { type: 'application/pdf' }), fileName);
        } catch (e) {
            console.error(e);
            alert('Could not fill this form. Try Add Text if the PDF is a scan.');
        } finally {
            toolHideLoading();
        }
    }

    function resetAll() {
        pdfBytes = null;
        fieldMeta = [];
        document.getElementById('file-input').value = '';
        exportBtn.disabled = true;
        clearBtn.disabled = true;
        status.textContent = '';
        fieldsWrap.innerHTML = '';
        previewWrap.innerHTML = '<p style="color:var(--text-secondary);">Upload a fillable PDF to list its fields.</p>';
    }
});
