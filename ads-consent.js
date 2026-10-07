/**
 * AdSense + cookie consent for every page.
 * Consent Mode defaults to denied. Ads load only after a choice
 * AND only when real publisher content is on screen — never on the
 * cookie bar, loading overlay, or empty tool chrome.
 * Vignette (full-screen) ads are opted out in HTML so Google is not
 * served a screen with no publisher content between page clicks.
 */
(function () {
    var PUB = 'ca-pub-2509436669190309';
    var KEY = 'osd_ad_consent';
    var pendingNonPersonalized = null;

    try {
        var theme = localStorage.getItem('osd_theme');
        if (theme === 'dark' || theme === 'light') {
            document.documentElement.setAttribute('data-theme', theme);
        }
    } catch (e) {}

    document.documentElement.setAttribute('data-google-vignette', 'false');

    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.pauseAdRequests = 1;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
        wait_for_update: 500
    });

    if (!document.querySelector('meta[name="google-adsense-account"]')) {
        var meta = document.createElement('meta');
        meta.name = 'google-adsense-account';
        meta.content = PUB;
        document.head.appendChild(meta);
    }

    function markLinksNoVignette() {
        var links = document.querySelectorAll('a[href]');
        for (var i = 0; i < links.length; i++) {
            links[i].setAttribute('data-google-vignette', 'false');
        }
        if (document.body) document.body.setAttribute('data-google-vignette', 'false');
    }

    function cookieBannerVisible() {
        return !!(document.body && document.body.classList.contains('cookie-visible'));
    }

    function loadingVisible() {
        var overlay = document.getElementById('loading-overlay');
        return !!(overlay && !overlay.classList.contains('hidden'));
    }

    function hasPublisherContent() {
        if (!document.body) return false;
        if (document.body.getAttribute('data-publisher-content') === 'ready') return true;
        if (document.querySelector('.tool-guide')) return true;
        if (document.querySelector('.tools-guide')) return true;
        if (document.querySelector('.page-content')) return true;
        if (document.querySelector('.designer-body') || document.getElementById('stamp-canvas')) return true;
        return false;
    }

    function waitingForToolGuide() {
        return !!(document.querySelector('.tool-layout') && !document.querySelector('.tool-guide'));
    }

    function adsDisabledOnPage() {
        return !!(document.body && document.body.getAttribute('data-ads') === 'off');
    }

    function ensureAdSenseScript() {
        if (adsDisabledOnPage()) return;
        if (document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) return;
        var s = document.createElement('script');
        s.id = 'adsbygoogle-js';
        s.async = true;
        s.crossOrigin = 'anonymous';
        s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + PUB;
        document.head.appendChild(s);
    }

    function loadAds(nonPersonalized) {
        if (adsDisabledOnPage()) return;
        if (cookieBannerVisible() || loadingVisible()) {
            pendingNonPersonalized = nonPersonalized;
            return;
        }
        if (waitingForToolGuide() || !hasPublisherContent()) {
            pendingNonPersonalized = nonPersonalized;
            return;
        }
        window.adsbygoogle = window.adsbygoogle || [];
        if (nonPersonalized) window.adsbygoogle.requestNonPersonalizedAds = 1;
        try {
            window.adsbygoogle.push({
                google_ad_client: PUB,
                enable_page_level_ads: true,
                overlays: { bottom: false }
            });
        } catch (err) { /* Auto ads config is best-effort */ }
        ensureAdSenseScript();
        window.adsbygoogle.pauseAdRequests = 0;
        pendingNonPersonalized = null;
    }

    function tryLoadPending() {
        if (pendingNonPersonalized === null || pendingNonPersonalized === 'flush') return;
        if (cookieBannerVisible() || loadingVisible()) return;
        if (waitingForToolGuide() || !hasPublisherContent()) return;
        var np = pendingNonPersonalized;
        pendingNonPersonalized = 'flush';
        loadAds(np === true);
    }

    function applyChoice(choice) {
        if (choice === 'accepted') {
            window.gtag('consent', 'update', {
                ad_storage: 'granted',
                ad_user_data: 'granted',
                ad_personalization: 'granted'
            });
            pendingNonPersonalized = false;
            tryLoadPending();
        } else if (choice === 'essential') {
            pendingNonPersonalized = true;
            tryLoadPending();
        }
    }

    window.osdNotifyPublisherContent = function () {
        if (document.body) document.body.setAttribute('data-publisher-content', 'ready');
        markLinksNoVignette();
        tryLoadPending();
    };

    function hideBanner() {
        var banner = document.getElementById('cookie-banner');
        if (banner) banner.classList.remove('show');
        document.body.classList.remove('cookie-visible');
    }

    function showBanner() {
        var existing = document.getElementById('cookie-banner');
        if (!existing) {
            existing = document.createElement('div');
            existing.id = 'cookie-banner';
            existing.className = 'cookie-banner';
            existing.setAttribute('role', 'dialog');
            existing.setAttribute('aria-label', 'Cookie consent');
            existing.innerHTML =
                '<div class="cookie-content">' +
                '<p>We use cookies for essential site features and, if you allow it, to show Google AdSense ads. Your documents are still processed only in your browser. Read our <a href="privacy.html" data-google-vignette="false">Privacy Policy</a>.</p>' +
                '<div class="cookie-actions">' +
                '<button type="button" class="secondary-btn" id="reject-cookies">Essential only</button>' +
                '<button type="button" class="primary-btn" id="accept-cookies">Accept ads</button>' +
                '</div></div>';
            document.body.appendChild(existing);
        }
        setTimeout(function () {
            existing.classList.add('show');
            document.body.classList.add('cookie-visible');
        }, 400);
        var accept = document.getElementById('accept-cookies');
        var reject = document.getElementById('reject-cookies');
        if (accept) accept.onclick = function () {
            try { localStorage.setItem(KEY, 'accepted'); } catch (e) {}
            hideBanner();
            applyChoice('accepted');
        };
        if (reject) reject.onclick = function () {
            try { localStorage.setItem(KEY, 'essential'); } catch (e) {}
            hideBanner();
            applyChoice('essential');
        };
    }

    function injectLegalBar() {
        if (document.querySelector('.app-footer')) {
            var footerSettings = document.getElementById('footer-cookie-settings');
            if (footerSettings) {
                footerSettings.addEventListener('click', function () {
                    try { localStorage.removeItem(KEY); } catch (e) {}
                    showBanner();
                });
            }
            return;
        }
        if (document.querySelector('.site-legal-bar')) return;
        var bar = document.createElement('nav');
        bar.className = 'site-legal-bar';
        bar.setAttribute('aria-label', 'Legal');
        bar.innerHTML =
            '<a href="privacy.html" data-google-vignette="false">Privacy Policy</a>' +
            '<a href="terms.html" data-google-vignette="false">Terms of Service</a>' +
            '<a href="contact.html" data-google-vignette="false">Contact</a>' +
            '<a href="about.html" data-google-vignette="false">About</a>' +
            '<button type="button" class="cookie-settings-link" id="cookie-settings-btn">Cookie settings</button>';
        document.body.appendChild(bar);
        var settings = document.getElementById('cookie-settings-btn');
        if (settings) {
            settings.addEventListener('click', function () {
                try { localStorage.removeItem(KEY); } catch (e) {}
                showBanner();
            });
        }
    }

    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) { saved = null; }

    function boot() {
        markLinksNoVignette();
        injectLegalBar();
        if (document.querySelector('.page-content') || document.querySelector('.designer-body') || document.querySelector('.tools-guide')) {
            document.body.setAttribute('data-publisher-content', 'ready');
        }
        if (saved === 'accepted' || saved === 'essential') applyChoice(saved);
        else showBanner();
        setTimeout(markLinksNoVignette, 800);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
