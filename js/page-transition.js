// ============================================================
//  PAGE TRANSITION — overlay fade in/out tra le pagine
// ============================================================
(function () {
    'use strict';

    function getOverlay() {
        return document.getElementById('page-transition');
    }

    // Rimuove .boot -> fade trasparente all'entrata
    function bootFade() {
        var ov = getOverlay();
        if (!ov) return;
        void ov.offsetWidth; // forza reflow
        ov.classList.remove('boot');
    }

    // Navigazione con fade-out
    window.navigateTo = function (url) {
        var ov = getOverlay();
        if (!ov) { window.location.href = url; return; }
        ov.classList.add('boot');
        setTimeout(function () { window.location.href = url; }, 450);
    };

    // Al boot: fade-in
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootFade);
    } else {
        bootFade();
    }

    // Fallback: intercetta click su <a href> locali (se mai ne aggiungerai)
    document.addEventListener('click', function (e) {
        var a = e.target && e.target.closest && e.target.closest('a[href]');
        if (!a) return;
        var href = a.getAttribute('href');
        if (!href || href.charAt(0) === '#' || href.indexOf('http') === 0) return;
        if (!/\.html(\?|$)/.test(href)) return;
        e.preventDefault();
        window.navigateTo(href);
    }, true);
})();
