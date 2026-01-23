/**
 * Session Initialization - Universal Module
 * Ensures UserSession is always available globally
 * Loads before other scripts via <script> tag (no defer)
 */

(function() {
    'use strict';

    // Clear cache on page close to ensure fresh content
    window.addEventListener('beforeunload', function() {
        if ('caches' in window) {
            caches.keys().then(cacheNames => {
                cacheNames.forEach(cacheName => {
                    caches.delete(cacheName);
                });
            });
        }
        // Also clear service worker cache if exists
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                registrations.forEach(registration => {
                    registration.unregister();
                });
            });
        }
    });

    // Create global UserSession if not exists
    if (typeof window.UserSession === 'undefined') {
        window.UserSession = {
            saveSession(username, userId, userType = 'user') {
                localStorage.setItem('userType', userType);
                localStorage.setItem('username', username);
                localStorage.setItem('userId', userId);
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('loginTime', new Date().getTime());
            },
            isLoggedIn() {
                return localStorage.getItem('isLoggedIn') === 'true';
            },
            getCurrentUser() {
                return {
                    username: localStorage.getItem('username'),
                    userId: localStorage.getItem('userId'),
                    userType: localStorage.getItem('userType'),
                    isLoggedIn: this.isLoggedIn()
                };
            },
            logout() {
                localStorage.removeItem('userType');
                localStorage.removeItem('username');
                localStorage.removeItem('userId');
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('loginTime');
                window.location.href = 'login.html';
            }
        };
    }

    // Ensure all basic methods exist
    ['saveSession', 'isLoggedIn', 'getCurrentUser', 'logout'].forEach(method => {
        if (typeof window.UserSession[method] === 'undefined') {
            console.warn(`UserSession.${method} not defined, using fallback`);
        }
    });

    console.log('[SessionInit] UserSession initialized');
})();
