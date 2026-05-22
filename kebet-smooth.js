// ============================================
//  KEBET — Global Smooth JS
//  Include on every page: <script src="kebet-smooth.js"></script>
// ============================================

(function () {

  // ── 1. Background blobs ──────────────────
  function injectBg() {
    if (document.querySelector('.ks-bg')) return;
    var bg = document.createElement('div');
    bg.className = 'ks-bg';
    bg.innerHTML =
      '<div class="ks-bg-blob b1"></div>' +
      '<div class="ks-bg-blob b2"></div>' +
      '<div class="ks-bg-blob b3"></div>';
    document.body.insertBefore(bg, document.body.firstChild);
  }

  // ── 2. Replace loading spinners ──────────
  function upgradeLoadingText() {
    var loadEl = document.getElementById('loading');
    if (loadEl) {
      loadEl.innerHTML =
        '<div class="ks-loading-wrap">' +
          '<div class="ks-spinner"></div>' +
          '<div class="ks-loading-text">Loading...</div>' +
        '</div>';
    }
  }

  // ── 3. Scroll reveal ─────────────────────
  function initReveal() {
    var els = document.querySelectorAll('.ks-reveal');
    if (!els.length) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('ks-visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { obs.observe(el); });
  }

  // ── 4. Smooth page-exit transitions ──────
  function initPageTransitions() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href]');
      if (!link) return;
      var href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') ||
          href.startsWith('tel') || href.startsWith('mailto') ||
          link.target === '_blank') return;
      e.preventDefault();
      document.body.style.transition = 'opacity 0.25s ease';
      document.body.style.opacity = '0';
      setTimeout(function () { window.location.href = href; }, 240);
    });
  }

  // ── 5. Smooth button onclick exits ───────
  function patchWindowLocation() {
    // Patch inline onclick="window.location.href='...'" calls
    var origDescriptor = Object.getOwnPropertyDescriptor(window.location, 'href');
    // Use a MutationObserver approach instead — intercept all onclick buttons
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('button[onclick]');
      if (!btn) return;
      var onclick = btn.getAttribute('onclick') || '';
      var match = onclick.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/);
      if (!match) return;
      var href = match[1];
      if (href.startsWith('http') || href.startsWith('tel') || href.startsWith('mailto')) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      document.body.style.transition = 'opacity 0.25s ease';
      document.body.style.opacity = '0';
      setTimeout(function () { window.location.href = href; }, 240);
    }, true);
  }

  // ── 6. Smooth modal show/hide ─────────────
  // Already handled by CSS — just ensure modals use display:flex when .show
  function patchModals() {
    var style = document.createElement('style');
    style.textContent =
      '.modal-overlay { display: flex !important; pointer-events: none; }' +
      '.modal-overlay:not(.show) { opacity: 0; pointer-events: none; }' +
      '.modal-overlay:not(.show) .modal { transform: scale(0.93) translateY(10px); opacity: 0; }';
    document.head.appendChild(style);
  }

  // ── 7. Stagger sidebar items on load ─────
  function staggerSidebar() {
    var items = document.querySelectorAll('.sidebar-item');
    items.forEach(function (item, i) {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-10px)';
      item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      setTimeout(function () {
        item.style.opacity = '';
        item.style.transform = '';
      }, 80 + i * 40);
    });
  }

  // ── 8. Stat cards count-up ───────────────
  function initCountUp() {
    var els = document.querySelectorAll('[data-countup]');
    if (!els.length) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var target = parseInt(el.dataset.countup);
        var duration = 1200;
        var start = Date.now();
        obs.unobserve(el);
        (function tick() {
          var elapsed = Date.now() - start;
          var progress = Math.min(elapsed / duration, 1);
          var ease = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(ease * target);
          if (progress < 1) requestAnimationFrame(tick);
          else el.textContent = target;
        })();
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { obs.observe(el); });
  }

  // ── 9. Active sidebar link highlight ─────
  function highlightActiveSidebarLink() {
    var page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.sidebar-item[data-page]').forEach(function (item) {
      if (item.dataset.page === page) item.classList.add('active');
    });
  }

  // ── INIT ─────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    injectBg();
    upgradeLoadingText();
    initReveal();
    initPageTransitions();
    patchWindowLocation();
    patchModals();
    staggerSidebar();
    initCountUp();
    highlightActiveSidebarLink();
  });

})();
