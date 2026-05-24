// ============================================
//  KEBET — Fast Response System
//  Handles: instant UI feedback, optimistic updates,
//  skeleton loading, button states, toast notifications
// ============================================
(function () {

  // ── TOAST NOTIFICATIONS ──────────────────────────────
  // Usage: KebetFast.toast('Message', 'success'|'error'|'info'|'warning')
  var toastContainer;

  function createToastContainer() {
    if (toastContainer) return;
    toastContainer = document.createElement('div');
    toastContainer.id = 'ks-toast-container';
    toastContainer.style.cssText =
      'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);' +
      'z-index:9999;display:flex;flex-direction:column;gap:10px;' +
      'align-items:center;pointer-events:none;';
    document.body.appendChild(toastContainer);
  }

  function toast(msg, type, duration) {
    createToastContainer();
    type = type || 'success';
    duration = duration || 2800;
    var colors = {
      success: 'linear-gradient(135deg,#1a6b3c,#2d8a56)',
      error:   'linear-gradient(135deg,#cc2222,#e03333)',
      info:    'linear-gradient(135deg,#2255cc,#4477ee)',
      warning: 'linear-gradient(135deg,#c87800,#f0a500)'
    };
    var icons = { success:'✅', error:'❌', info:'ℹ️', warning:'⚠️' };
    var el = document.createElement('div');
    el.style.cssText =
      'background:' + (colors[type] || colors.success) + ';' +
      'color:#fff;padding:12px 22px;border-radius:28px;' +
      'font-size:14px;font-weight:700;' +
      'font-family:Inter,Segoe UI,sans-serif;' +
      'box-shadow:0 8px 28px rgba(0,0,0,0.22);' +
      'display:flex;align-items:center;gap:8px;' +
      'pointer-events:all;cursor:default;' +
      'opacity:0;transform:translateY(16px) scale(0.95);' +
      'transition:all 0.28s cubic-bezier(0.34,1.56,0.64,1);' +
      'white-space:nowrap;max-width:90vw;';
    el.innerHTML = '<span>' + icons[type] + '</span><span>' + msg + '</span>';
    toastContainer.appendChild(el);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0) scale(1)';
      });
    });
    setTimeout(function () {
      el.style.opacity = '0';
      el.style.transform = 'translateY(8px) scale(0.96)';
      setTimeout(function () { el.remove(); }, 300);
    }, duration);
  }

  // ── BUTTON LOADING STATE ─────────────────────────────
  // Usage: var restore = KebetFast.btnLoad(btn, 'Saving...')
  // Call restore() when done
  function btnLoad(btn, loadingText) {
    var original = btn.innerHTML;
    var originalDisabled = btn.disabled;
    btn.disabled = true;
    btn.style.opacity = '0.75';
    btn.style.cursor = 'not-allowed';
    btn.innerHTML =
      '<span style="display:inline-flex;align-items:center;gap:8px;">' +
      '<span style="width:14px;height:14px;border:2px solid rgba(255,255,255,0.4);' +
      'border-top-color:#fff;border-radius:50%;' +
      'animation:ks-spin 0.6s linear infinite;display:inline-block;"></span>' +
      (loadingText || 'Loading...') +
      '</span>';
    return function () {
      btn.innerHTML = original;
      btn.disabled = originalDisabled;
      btn.style.opacity = '';
      btn.style.cursor = '';
    };
  }

  // ── INSTANT BUTTON RIPPLE ────────────────────────────
  function addRipple(e) {
    var btn = e.currentTarget;
    var existing = btn.querySelector('.ks-ripple');
    if (existing) existing.remove();
    var rect = btn.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height) * 2;
    var x = e.clientX - rect.left - size / 2;
    var y = e.clientY - rect.top - size / 2;
    var ripple = document.createElement('span');
    ripple.className = 'ks-ripple';
    ripple.style.cssText =
      'position:absolute;width:' + size + 'px;height:' + size + 'px;' +
      'left:' + x + 'px;top:' + y + 'px;' +
      'border-radius:50%;background:rgba(255,255,255,0.25);' +
      'transform:scale(0);animation:ks-ripple 0.5s ease-out forwards;' +
      'pointer-events:none;';
    var prevPos = getComputedStyle(btn).position;
    if (prevPos === 'static') btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);
    setTimeout(function () { ripple.remove(); }, 600);
  }

  function initRipples() {
    var style = document.createElement('style');
    style.textContent =
      '@keyframes ks-ripple{to{transform:scale(1);opacity:0;}}' +
      '@keyframes ks-spin{to{transform:rotate(360deg);}}' +
      '.ks-skeleton{background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);' +
      'background-size:200% 100%;animation:ks-shimmer 1.4s ease infinite;border-radius:8px;}' +
      '@keyframes ks-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}';
    document.head.appendChild(style);

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('button, .btn-sm-green, .btn-sm-outline, .btn-sm-red, .hire-btn, .submit-btn, .find-btn, .edit-btn');
      if (btn && btn.tagName === 'BUTTON') {
        addRipple.call({ currentTarget: btn }, e);
      }
    });
  }

  // ── SKELETON SCREENS ─────────────────────────────────
  // Replace loading div with skeleton cards
  function showSkeleton(containerId, type) {
    var el = document.getElementById(containerId);
    if (!el) return;
    var html = '';
    if (type === 'cards') {
      for (var i = 0; i < 3; i++) {
        html +=
          '<div style="background:#fff;border-radius:16px;padding:20px;border:1px solid #eee;margin-bottom:14px;">' +
          '<div style="display:flex;gap:14px;align-items:center;margin-bottom:16px;">' +
          '<div class="ks-skeleton" style="width:52px;height:52px;border-radius:14px;flex-shrink:0;"></div>' +
          '<div style="flex:1;">' +
          '<div class="ks-skeleton" style="height:14px;width:60%;margin-bottom:8px;"></div>' +
          '<div class="ks-skeleton" style="height:11px;width:40%;"></div>' +
          '</div></div>' +
          '<div class="ks-skeleton" style="height:11px;width:80%;margin-bottom:6px;"></div>' +
          '<div class="ks-skeleton" style="height:11px;width:55%;"></div>' +
          '</div>';
      }
    } else if (type === 'stats') {
      html = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;">';
      for (var j = 0; j < 4; j++) {
        html +=
          '<div style="background:#fff;border-radius:16px;padding:20px;border:1px solid #eee;">' +
          '<div class="ks-skeleton" style="width:42px;height:42px;border-radius:12px;margin-bottom:12px;"></div>' +
          '<div class="ks-skeleton" style="height:22px;width:50%;margin-bottom:6px;"></div>' +
          '<div class="ks-skeleton" style="height:11px;width:70%;"></div>' +
          '</div>';
      }
      html += '</div>';
    }
    el.innerHTML = html;
  }

  // ── OPTIMISTIC UI HELPERS ────────────────────────────
  // Instantly update UI before Firebase confirms

  // Mark booking as active instantly
  function optimisticActivate(bookingCardEl) {
    var badge = bookingCardEl.querySelector('.status-badge');
    if (badge) {
      badge.className = 'status-badge status-active';
      badge.textContent = '✓ Active';
    }
  }

  // Mark booking as cancelled instantly
  function optimisticCancel(bookingCardEl) {
    var badge = bookingCardEl.querySelector('.status-badge');
    if (badge) {
      badge.className = 'status-badge status-ended';
      badge.textContent = 'Ended';
    }
    bookingCardEl.style.opacity = '0.5';
  }

  // ── CONFIRM DIALOG (replaces alert/confirm) ──────────
  // Usage: KebetFast.confirm('Title','Message','Confirm','danger').then(ok => { if(ok) ... })
  function confirmDialog(title, message, confirmText, type) {
    return new Promise(function (resolve) {
      var overlay = document.createElement('div');
      overlay.style.cssText =
        'position:fixed;inset:0;background:rgba(0,0,0,0.5);' +
        'display:flex;align-items:center;justify-content:center;' +
        'z-index:9998;opacity:0;transition:opacity 0.2s ease;';
      var colors = { danger: '#cc2222', success: '#1a6b3c', info: '#2255cc' };
      var color = colors[type] || colors.success;
      overlay.innerHTML =
        '<div style="background:#fff;border-radius:24px;padding:32px;max-width:360px;' +
        'width:90%;text-align:center;transform:scale(0.9);transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1);">' +
        '<div style="font-size:42px;margin-bottom:12px;">' +
        (type === 'danger' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️') + '</div>' +
        '<div style="font-size:18px;font-weight:700;color:#111;margin-bottom:8px;">' + title + '</div>' +
        '<div style="font-size:13px;color:#888;margin-bottom:24px;line-height:1.6;">' + message + '</div>' +
        '<div style="display:flex;gap:10px;">' +
        '<button id="ks-dlg-cancel" style="flex:1;background:#f5f5f0;color:#555;border:none;' +
        'padding:12px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;">Cancel</button>' +
        '<button id="ks-dlg-confirm" style="flex:1;background:' + color + ';color:#fff;border:none;' +
        'padding:12px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;">' +
        (confirmText || 'Confirm') + '</button>' +
        '</div></div>';
      document.body.appendChild(overlay);

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          overlay.style.opacity = '1';
          overlay.querySelector('div').style.transform = 'scale(1)';
        });
      });

      function close(result) {
        overlay.style.opacity = '0';
        overlay.querySelector('div').style.transform = 'scale(0.9)';
        setTimeout(function () { overlay.remove(); resolve(result); }, 220);
      }

      overlay.querySelector('#ks-dlg-cancel').onclick = function () { close(false); };
      overlay.querySelector('#ks-dlg-confirm').onclick = function () { close(true); };
      overlay.onclick = function (e) { if (e.target === overlay) close(false); };
    });
  }

  // ── FAST FIREBASE WRAPPERS ───────────────────────────
  // These patch common patterns for instant feedback

  // Replace window.alert with toast
  var _origAlert = window.alert;
  window.alert = function (msg) {
    if (typeof msg === 'string') {
      var type = msg.startsWith('✅') ? 'success' :
                 msg.startsWith('❌') ? 'error' :
                 msg.startsWith('⚠️') ? 'warning' : 'info';
      toast(msg.replace(/^[✅❌⚠️ℹ️]\s*/, ''), type);
    } else {
      _origAlert(msg);
    }
  };

  // ── FAST CLICK FEEDBACK ──────────────────────────────
  // All buttons get instant visual feedback
  function initInstantFeedback() {
    document.addEventListener('mousedown', function (e) {
      var btn = e.target.closest('button');
      if (!btn || btn.disabled) return;
      btn.style.transform = (btn.style.transform || '') + ' scale(0.97)';
      btn.style.transition = 'transform 0.08s ease';
    });
    document.addEventListener('mouseup', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      setTimeout(function () {
        btn.style.transform = btn.style.transform.replace(' scale(0.97)', '').replace('scale(0.97)', '');
      }, 80);
    });
  }

  // ── PRELOAD NEXT PAGES ───────────────────────────────
  function preloadLinks() {
    var seen = {};
    document.querySelectorAll('a[href$=".html"], [onclick*=".html"]').forEach(function (el) {
      var href = '';
      if (el.href) href = el.getAttribute('href');
      else {
        var m = (el.getAttribute('onclick') || '').match(/['"]([^'"]+\.html)['"]/);
        if (m) href = m[1];
      }
      if (!href || seen[href] || href.startsWith('http')) return;
      seen[href] = true;
      var link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
    });
  }

  // ── EXPOSE PUBLIC API ────────────────────────────────
  window.KebetFast = {
    toast: toast,
    btnLoad: btnLoad,
    showSkeleton: showSkeleton,
    optimisticActivate: optimisticActivate,
    optimisticCancel: optimisticCancel,
    confirm: confirmDialog
  };

  // ── INIT ─────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    initRipples();
    initInstantFeedback();
    setTimeout(preloadLinks, 1000);
  });

})();
