// ============================================
//  KEBET — kebet-fcm.js
//  Push Notification helper (FCM)
//  Include on every page: <script src="kebet-fcm.js"></script>
//
//  SETUP STEPS:
//  1. In Firebase Console → Project Settings → Cloud Messaging →
//     Web Push Certificates → generate a VAPID key pair.
//     Paste the PUBLIC key below.
//  2. Deploy firebase-messaging-sw.js to your site root.
// ============================================

(function () {
  // ⚠️  Replace with your actual VAPID public key from Firebase Console
  var VAPID_KEY = 'BDluVmen0kTJCYu6gl7qS4M5lKAj7xCjn6NT4Bpy2tjsDCYZXCXPyETsDu3tPDzsyvCgqZu31O28zBH5aSCn_xg';

  var firebaseConfig = {
    apiKey: "AIzaSyAuR0ccqos7BFAEXRFMfKp18LtLkmsogF8",
    authDomain: "kebet-6a12b.firebaseapp.com",
    projectId: "kebet-6a12b",
    storageBucket: "kebet-6a12b.firebasestorage.app",
    messagingSenderId: "1098491917554",
    appId: "1:1098491917554:web:94c535d8f52fd3f4d98c6b"
  };

  // Only run in browsers that support service workers + notifications
  if (!('serviceWorker' in navigator) || !('Notification' in window)) return;

  /**
   * Call this after user is signed in.
   * Requests notification permission, gets FCM token, saves to users/{uid}.fcmToken
   *
   * @param {string} uid   - Firebase Auth UID
   * @param {object} db    - Firestore instance (already initialised on the page)
   */
  window.initKeberFCM = async function (uid, db) {
    try {
      // Load Firebase messaging module lazily
      const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
      const { getMessaging, getToken, onMessage } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js');
      const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

      const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
      const messaging = getMessaging(app);

      // Register service worker
      const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

      // Ask for permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('[Kebet FCM] Notification permission denied.');
        return;
      }

      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: swReg
      });

      if (token) {
        // Save token to Firestore user document
        await updateDoc(doc(db, 'users', uid), { fcmToken: token });
        console.log('[Kebet FCM] Token saved:', token.slice(0, 20) + '…');
      }

      // Handle foreground messages (toast notification)
      onMessage(messaging, function (payload) {
        const title = payload.notification?.title || 'Kebet';
        const body  = payload.notification?.body  || '';
        showFCMToast(title, body);
      });

    } catch (err) {
      console.warn('[Kebet FCM] Init failed:', err);
    }
  };

  // Simple foreground toast
  function showFCMToast(title, body) {
    var toast = document.createElement('div');
    toast.style.cssText = [
      'position:fixed;bottom:24px;right:24px;z-index:99999',
      'background:#1a6b3c;color:#fff;border-radius:14px',
      'padding:14px 18px;max-width:320px',
      'box-shadow:0 8px 32px rgba(0,0,0,0.2)',
      'font-family:Inter,sans-serif;font-size:14px',
      'animation:kebet-slide-in 0.3s ease'
    ].join(';');

    // Add keyframe once
    if (!document.getElementById('kebet-fcm-style')) {
      var s = document.createElement('style');
      s.id = 'kebet-fcm-style';
      s.textContent = '@keyframes kebet-slide-in{from{transform:translateY(80px);opacity:0}to{transform:translateY(0);opacity:1}}';
      document.head.appendChild(s);
    }

    toast.innerHTML = '<div style="font-weight:700;margin-bottom:4px;">🔔 ' + title + '</div>' +
                      '<div style="opacity:0.85;font-size:13px;">' + body + '</div>';
    document.body.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 5000);
  }

  /**
   * Convenience: send a push notification by writing to Firestore `notifications`
   * collection.  A Cloud Function (or your backend) reads this and calls FCM.
   * If you don't have a backend yet, this still creates the in-app notification
   * that your existing notifications.html page displays.
   *
   * @param {object} db
   * @param {string} userId   - recipient UID
   * @param {string} type     - 'booking' | 'accepted' | 'cancelled' | 'payment' | etc.
   * @param {string} title
   * @param {string} message
   */
  window.sendKeberNotification = async function (db, userId, type, title, message) {
    try {
      const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      await addDoc(collection(db, 'notifications'), {
        userId,
        type,
        title,
        message,
        read: false,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('[Kebet] sendNotification failed:', e);
    }
  };

})();
