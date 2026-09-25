/**
 * AdSense + cookie consent for every page.
 * Consent Mode defaults to denied. Ads load only after a choice:
 * personalized (Accept ads) or non-personalized (Essential only).
 */
(function () {
    var PUB = 'ca-pub-2509436669190309';
    var KEY = 'osd_ad_consent';
    try {
        var theme = localStorage.getItem('osd_theme');
        if (theme === 'dark' || theme === 'light') {
            document.documentElement.setAttribute('data-theme', theme);
        }
    } catch (e) {}

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

    function loadAds(nonPersonalized) {
        if (document.getElementById('adsbygoogle-js')) return;
        if (nonPersonalized) {
            window.adsbygoogle = window.adsbygoogle || [];
            window.adsbygoogle.requestNonPersonalizedAds = 1;
        }
        var s = document.createElement('script');
        s.id = 'adsbygoogle-js';
        s.async = true;
        s.crossOrigin = 'anonymous';
        s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + PUB;
        document.head.appendChild(s);
    }

    function applyChoice(choice) {
        if (choice === 'accepted') {
            window.gtag('consent', 'update', {
                ad_storage: 'granted',
                ad_user_data: 'granted',
                ad_personalization: 'granted'
            });
            loadAds(false);
        } else if (choice === 'essential') {
            loadAds(true);
        }
    }

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
                '<p>We use cookies for essential site features and, if you allow it, to show Google AdSense ads. Your documents are still processed only in your browser. Read our <a href="privacy.html">Privacy Policy</a>.</p>' +
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
        if (document.querySelector('.site-legal-bar')) return;
        var bar = document.createElement('nav');
        bar.className = 'site-legal-bar';
        bar.setAttribute('aria-label', 'Legal');
        bar.innerHTML =
            '<a href="privacy.html">Privacy Policy</a>' +
            '<a href="terms.html">Terms of Service</a>' +
            '<a href="contact.html">Contact</a>' +
            '<a href="about.html">About</a>' +
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
        injectLegalBar();
        if (saved === 'accepted' || saved === 'essential') applyChoice(saved);
        else showBanner();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
