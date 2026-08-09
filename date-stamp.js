document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('stamp-canvas');
    const ctx = canvas.getContext('2d');
    const labelText = document.getElementById('label-text');
    const dateText = document.getElementById('date-text');
    const ringText = document.getElementById('ring-text');
    const stampColor = document.getElementById('stamp-color');
    const downloadBtn = document.getElementById('download-btn');

    function todayLabel() {
        const d = new Date();
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const dd = String(d.getDate()).padStart(2, '0');
        return `${dd} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }

    dateText.value = todayLabel();

    document.querySelectorAll('[data-label]').forEach((btn) => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-label]').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            labelText.value = btn.dataset.label;
            render();
        });
    });

    [labelText, dateText, ringText, stampColor].forEach((el) => {
        el.addEventListener('input', render);
    });

    downloadBtn.addEventListener('click', () => {
        render();
        const a = document.createElement('a');
        a.download = `date-stamp-${labelText.value || 'stamp'}.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
    });

    function render() {
        const size = canvas.width;
        const center = size / 2;
        const color = stampColor.value || '#E63946';
        const outer = (ringText.value || 'OFFICIAL • DATE STAMP •').trim();
        const mid = (labelText.value || 'RECEIVED').trim().toUpperCase();
        const date = (dateText.value || todayLabel()).trim().toUpperCase();

        ctx.clearRect(0, 0, size, size);
        ctx.save();
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(center, center, 170, 0, Math.PI * 2);
        ctx.stroke();

        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(center, center, 160, 0, Math.PI * 2);
        ctx.stroke();

        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(center, center, 118, 0, Math.PI * 2);
        ctx.stroke();

        // Outer curved text (simple repeated along circle)
        if (outer) {
            const radius = 140;
            const chars = (outer + ' ').toUpperCase().split('');
            ctx.font = 'bold 18px Outfit, Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const angleStep = (Math.PI * 2) / chars.length;
            for (let i = 0; i < chars.length; i++) {
                const angle = -Math.PI / 2 + i * angleStep;
                const x = center + radius * Math.cos(angle);
                const y = center + radius * Math.sin(angle);
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(angle + Math.PI / 2);
                ctx.fillText(chars[i], 0, 0);
                ctx.restore();
            }
        }

        ctx.font = 'bold 42px Outfit, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(mid, center, center - 12, 200);

        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(center - 70, center + 18);
        ctx.lineTo(center + 70, center + 18);
        ctx.stroke();

        ctx.font = 'bold 20px Outfit, Arial, sans-serif';
        ctx.fillText(date, center, center + 42, 180);

        ctx.restore();
    }

    render();
});
