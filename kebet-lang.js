// Kebet Language Toggle — works on all pages
(function() {
  var lang = localStorage.getItem('kebet-lang') || 'en';

  window.setLang = function(l) {
    lang = l;
    localStorage.setItem('kebet-lang', l);
    document.body.classList.toggle('am-mode', l === 'am');
    var en = document.getElementById('btn-en');
    var am = document.getElementById('btn-am');
    if (en) en.classList.toggle('active', l === 'en');
    if (am) am.classList.toggle('active', l === 'am');
  };

  document.addEventListener('DOMContentLoaded', function() {
    setLang(lang);
  });
})();
