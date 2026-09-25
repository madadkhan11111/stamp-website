(function () {
    const TOOL_SEARCH_ALIASES = {
        '/': 'stamp maker seal address company rubber ink',
        'watermark-pdf.html': 'watermark confidential draft stamp text overlay',
        'sign-pdf.html': 'sign signature draw autograph',
        'date-stamp.html': 'date received paid stamp seal',
        'merge-pdf.html': 'merge combine join files together',
        'split-pdf.html': 'split extract pages range',
        'compress-pdf.html': 'compress shrink reduce size smaller',
        'delete-pdf-pages.html': 'delete remove pages',
        'organize-pdf.html': 'organize reorder arrange pages',
        'extract-pdf-text.html': 'extract text copy txt',
        'crop-pdf.html': 'crop trim margins',
        'header-footer-pdf.html': 'header footer page label',
        'pdf-to-jpg.html': 'pdf to jpg jpeg image convert',
        'image-to-pdf.html': 'image to pdf jpg png photos pictures',
        'jpg-to-pdf.html': 'jpg jpeg to pdf convert photo pictures',
        'png-to-pdf.html': 'png to pdf convert screenshot graphic',
        'passport-photo.html': 'passport size photo id visa 35x45 2x2 inch nadra photo',
        'rotate-pdf.html': 'rotate turn 90 180',
        'page-numbers-pdf.html': 'page numbers numbering',
        'pdf-to-png.html': 'pdf to png convert image',
        'grayscale-pdf.html': 'grayscale grey black white color',
        'reverse-pdf.html': 'reverse flip page order',
        'text-to-pdf.html': 'text to pdf notes write',
        'add-blank-pages.html': 'blank empty insert pages',
        'resize-pdf.html': 'resize a4 letter legal paper',
        'pdf-to-zip.html': 'zip pages jpg download',
        'remove-pdf-metadata.html': 'metadata author title strip privacy',
        'nup-pdf.html': '2-up n-up two pages sheet',
        'flip-pdf.html': 'flip mirror horizontal vertical',
        'compress-image.html': 'compress image photo shrink quality',
        'resize-image.html': 'resize image scale width height',
        'png-to-jpg.html': 'png to jpg jpeg convert',
        'jpg-to-png.html': 'jpg jpeg to png convert',
        'webp-to-pdf.html': 'webp to pdf convert',
        'heic-to-jpg.html': 'heic heif iphone to jpg jpeg',
        'heic-to-pdf.html': 'heic heif iphone to pdf',
        'extract-pdf-images.html': 'extract images photos pictures from pdf',
        'webp-to-jpg.html': 'webp to jpg jpeg convert',
        'image-to-webp.html': 'image to webp convert jpg png',
        'crop-image.html': 'crop image photo trim',
        'rotate-image.html': 'rotate image photo turn',
        'flip-image.html': 'flip image mirror',
        'scan-to-pdf.html': 'scan camera photo to pdf',
        'split-pdf-pages.html': 'single pages split every page zip',
        'redact-pdf.html': 'redact black out hide private',
        'add-text-pdf.html': 'add text type write annotate note',
        'fill-pdf.html': 'fill form fields pdf acroform',
        'compress-image-kb.html': '20kb 50kb 100kb 200kb compress photo visa job',
        'watermark-image.html': 'watermark image photo text overlay',
        'avif-to-jpg.html': 'avif to jpg jpeg convert photo'
    };

    function norm(s) {
        return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    }

    function hrefKey(href) {
        if (!href) return '';
        let name = String(href).split('?')[0].split('#')[0];
        name = name.split('/').pop() || '';
        if (!name || name === 'index.html') return '/';
        return name.toLowerCase();
    }

    function catalog() {
        const seen = {};
        const list = [];
        const fromLinks = (typeof TOOL_RELATED_LINKS !== 'undefined' ? TOOL_RELATED_LINKS : []).map(function (t) {
            return { href: t.href, label: t.label };
        });
        const fallback = Object.keys(TOOL_SEARCH_ALIASES).map(function (href) {
            const pretty = href === '/' ? 'Stamp Maker' : href.replace('.html', '').replace(/-/g, ' ');
            return { href: href, label: pretty.replace(/\b[a-z]/g, function (c) { return c.toUpperCase(); }) };
        });
        fromLinks.concat(fallback).forEach(function (t) {
            const key = hrefKey(t.href);
            if (!key || seen[key]) return;
            seen[key] = true;
            list.push({
                href: t.href,
                label: t.label,
                aliases: TOOL_SEARCH_ALIASES[key] || TOOL_SEARCH_ALIASES[t.href] || ''
            });
        });
        return list;
    }

    function matches(item, query) {
        if (!query) return true;
        const hay = norm(item.label + ' ' + item.href + ' ' + (item.aliases || '') + ' ' + (item.extra || ''));
        return norm(query).split(' ').every(function (w) { return w && hay.indexOf(w) !== -1; });
    }

    function ranked(query) {
        const q = norm(query);
        if (!q) return [];
        return catalog().filter(function (item) { return matches(item, q); }).sort(function (a, b) {
            const an = norm(a.label);
            const bn = norm(b.label);
            const aExact = an === q ? 0 : (an.indexOf(q) === 0 ? 1 : 2);
            const bExact = bn === q ? 0 : (bn.indexOf(q) === 0 ? 1 : 2);
            return aExact - bExact || an.localeCompare(bn);
        });
    }

    function go(href) {
        if (!href) return;
        location.href = href;
    }

    function toolsUrl(query) {
        const q = String(query || '').trim();
        return q ? ('tools.html?q=' + encodeURIComponent(q)) : 'tools.html';
    }

    function renderDropdown(box, items, query) {
        if (!box) return;
        if (!query || !items.length) {
            box.hidden = true;
            box.innerHTML = '';
            return;
        }
        box.hidden = false;
        box.innerHTML = items.slice(0, 8).map(function (item) {
            return '<a class="tool-search-hit" href="' + item.href + '">' + item.label + '</a>';
        }).join('') + (items.length > 8
            ? '<a class="tool-search-hit tool-search-more" href="' + toolsUrl(query) + '">See all ' + items.length + ' tools</a>'
            : '');
    }

    function bindForm(form, opts) {
        if (!form || form.dataset.bound === '1') return;
        form.dataset.bound = '1';
        const input = form.querySelector('input[type="search"], input[name="q"]');
        const box = form.querySelector('.tool-search-results');
        if (!input) return;

        function currentHits() {
            return ranked(input.value);
        }

        function applyLive() {
            if (!form.classList.contains('tool-search-header')) {
                filterPage(input.value);
            }
            renderDropdown(box, currentHits(), norm(input.value));
        }

        input.addEventListener('input', applyLive);
        input.addEventListener('focus', applyLive);
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                input.value = '';
                applyLive();
                if (box) box.hidden = true;
            }
            if (e.key === 'ArrowDown' && box && !box.hidden) {
                const first = box.querySelector('a');
                if (first) { e.preventDefault(); first.focus(); }
            }
        });
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const q = input.value.trim();
            const isHeader = form.classList.contains('tool-search-header');
            if (!q) {
                if (isHeader) {
                    go('tools.html');
                    return;
                }
                const hero = document.getElementById('tool-search-form');
                if (hero && hero !== form) {
                    const hi = hero.querySelector('input');
                    if (hi) hi.focus();
                    hero.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    return;
                }
                input.focus();
                return;
            }
            const hits = ranked(q);
            if (hits.length === 1) {
                go(hits[0].href);
                return;
            }
            if (!isHeader && document.querySelector('.tools-grid')) {
                filterPage(q);
                if (box) box.hidden = true;
                return;
            }
            go(toolsUrl(q));
        });
        document.addEventListener('click', function (e) {
            if (box && !form.contains(e.target)) box.hidden = true;
        });
    }

    function filterPage(query) {
        const q = norm(query);
        const catBtn = document.querySelector('.tool-cat.active');
        const cat = catBtn ? catBtn.getAttribute('data-filter') : 'all';
        const toolCards = document.querySelectorAll('.tools-grid .tool-card');
        const homeCards = document.querySelectorAll('.home-tools-grid .home-tool-card');
        let shown = 0;

        function cardItem(card) {
            const href = card.getAttribute('href') || '';
            const key = hrefKey(href);
            return {
                href: href,
                label: (card.querySelector('h3, span') || card).textContent,
                extra: card.textContent,
                aliases: TOOL_SEARCH_ALIASES[key] || ''
            };
        }

        toolCards.forEach(function (card) {
            const catOk = cat === 'all' || card.getAttribute('data-cat') === cat;
            const qOk = !q || matches(cardItem(card), q);
            card.hidden = !(catOk && qOk);
            if (!card.hidden) shown += 1;
        });
        homeCards.forEach(function (card) {
            const qOk = !q || matches(cardItem(card), q);
            card.hidden = !qOk;
            if (!card.hidden) shown += 1;
        });

        const empty = document.getElementById('tool-search-empty');
        if (empty) {
            empty.hidden = !q || shown > 0;
            const allLink = empty.querySelector('[data-all-link]');
            if (allLink) allLink.href = toolsUrl(query);
        }
        const count = document.getElementById('tool-search-count');
        if (count) {
            count.hidden = !q;
            count.textContent = q ? (shown + ' tool' + (shown === 1 ? '' : 's') + ' found') : '';
        }
    }

    function injectHeaderSearch() {
        if (document.getElementById('tool-search-header-q')) return;
        const header = document.querySelector('.app-header');
        if (!header) return;
        const form = document.createElement('form');
        form.className = 'tool-search tool-search-header';
        form.setAttribute('role', 'search');
        form.setAttribute('action', 'tools.html');
        form.setAttribute('method', 'get');
        form.innerHTML =
            '<label class="tool-search-sr" for="tool-search-header-q">Search tools</label>' +
            '<input type="search" name="q" id="tool-search-header-q" placeholder="Search tools" autocomplete="off">' +
            '<button type="submit"><i class="fa-solid fa-magnifying-glass"></i><span>Search</span></button>' +
            '<div class="tool-search-results" hidden></div>';
        const actions = header.querySelector('.header-actions');
        if (actions) actions.insertBefore(form, actions.firstChild);
        else header.appendChild(form);
        bindForm(form, { compact: true });
    }

    function bindHeroSearch() {
        const form = document.getElementById('tool-search-form');
        if (!form) return;
        bindForm(form, { onPage: true });
        const params = new URLSearchParams(location.search);
        const q = params.get('q');
        const input = form.querySelector('input[type="search"], input[name="q"]');
        if (q && input) {
            input.value = q;
            filterPage(q);
        }
    }

    function bindCategoryButtons() {
        const cats = document.querySelectorAll('.tool-cat');
        if (!cats.length) return;
        cats.forEach(function (btn) {
            btn.addEventListener('click', function () {
                cats.forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                const form = document.getElementById('tool-search-form');
                const input = form && form.querySelector('input[type="search"], input[name="q"]');
                filterPage(input ? input.value : '');
            });
        });
    }

    window.toolInitSearch = function () {
        if (window.__toolSearchReady) return;
        window.__toolSearchReady = true;
        injectHeaderSearch();
        bindHeroSearch();
        bindCategoryButtons();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.toolInitSearch);
    } else {
        window.toolInitSearch();
    }
})();
