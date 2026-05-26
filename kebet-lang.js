// ============================================
//  KEBET — Language Toggle (EN / አማርኛ)
//  Include on every page: <script src="kebet-lang.js"></script>
// ============================================

(function () {
  var LANG_KEY = 'kebet-lang';

  // Apply stored language immediately (before DOM paint)
  var saved = localStorage.getItem(LANG_KEY) || 'en';
  document.documentElement.setAttribute('data-lang', saved);

  document.addEventListener('DOMContentLoaded', function () {
    applyLang(saved, false);
  });

  // Called by buttons: setLang('en') or setLang('am')
  window.setLang = function (lang) {
    saved = lang;
    localStorage.setItem(LANG_KEY, lang);
    applyLang(lang, true);
  };

  function applyLang(lang, animate) {
    // Toggle body class
    document.body.classList.toggle('lang-am', lang === 'am');

    // Update button active states (all lang buttons on the page)
    document.querySelectorAll('#btn-en').forEach(function (btn) {
      btn.classList.toggle('active', lang === 'en');
    });
    document.querySelectorAll('#btn-am').forEach(function (btn) {
      btn.classList.toggle('active', lang === 'am');
    });

    // Optional: set html lang attribute
    document.documentElement.lang = lang === 'am' ? 'am' : 'en';
  }
})();
