document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-btn');
    const title = document.getElementById('pdf-title');
    const body = document.getElementById('body-text');
    const pageSize = document.getElementById('page-size');
    const status = document.getElementById('status');

    exportBtn.addEventListener('click', exportPdf);

    function wrap(text, font, size, maxWidth) {
        const latin = String(text || '')
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .replace(/[^\x20-\x7E\n\t\xA0-\xFF]/g, '?');
        const paragraphs = latin.split('\n');
        const lines = [];
        for (const para of paragraphs) {
            if (!para) {
                lines.push('');
                continue;
            }
            const words = para.split(/(\s+)/);
            let line = '';
            for (const word of words) {
                const next = line + word;
                if (font.widthOfTextAtSize(next, size) > maxWidth && line.trim()) {
                    lines.push(line);
                    line = word.trimStart();
                } else {
                    line = next;
                }
            }
            if (line) lines.push(line);
        }
        return lines.length ? lines : [''];
    }

    async function exportPdf() {
        const text = body.value.trim();
        if (!text) return alert('Enter some text first.');
        toolShowLoading('Building PDF...');
        try {
            await ensureToolPdfLibs();
            const pdfDoc = await PDFLib.PDFDocument.create();
            const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
            const size = 12;
            const dims = pageSize.value === 'letter' ? [612, 792] : [595.28, 841.89];
            const margin = 54;
            const maxWidth = dims[0] - margin * 2;
            const lines = wrap(text, font, size, maxWidth);
            let page = pdfDoc.addPage(dims);
            let y = dims[1] - margin;
            const heading = String(title.value || '')
                .trim()
                .replace(/[^\x20-\x7E\xA0-\xFF]/g, '?');
            if (heading) {
                page.drawText(heading, { x: margin, y, size: 18, font, color: PDFLib.rgb(0.1, 0.1, 0.1) });
                y -= 28;
            }
            const lineH = size + 6;
            for (const line of lines) {
                if (y < margin + lineH) {
                    page = pdfDoc.addPage(dims);
                    y = dims[1] - margin;
                }
                page.drawText(line.replace(/\t/g, '    '), {
                    x: margin,
                    y,
                    size,
                    font,
                    color: PDFLib.rgb(0.15, 0.15, 0.15),
                    maxWidth
                });
                y -= lineH;
            }
            const name = (heading || 'notes').replace(/[^\w\-]+/g, '-').slice(0, 40) + '.pdf';
            toolDownloadBlob(new Blob([await pdfDoc.save()], { type: 'application/pdf' }), name);
            status.textContent = 'PDF ready.';
        } catch (e) {
            console.error(e);
            alert('Could not create PDF.');
        } finally {
            toolHideLoading();
        }
    }
});
