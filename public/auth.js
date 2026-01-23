/**
 * Authentication & Cart Management System
 * Maintains user sessions and user-specific carts
 */

// User Session Management
const UserSession = {
    // Initialize session on page load
    init() {
        this.restoreSession();
        this.updateHeaderDisplay();
        this.updateCartDisplay();
        this.setupLogoutListener();
    },

    // Save user session to localStorage
    saveSession(username, userId, userType = 'user') {
        localStorage.setItem('userType', userType);
        localStorage.setItem('username', username);
        localStorage.setItem('userId', userId);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('loginTime', new Date().getTime());
        this.updateHeaderDisplay();
    },

    // Restore session from localStorage
    restoreSession() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const username = localStorage.getItem('username');
        const userType = localStorage.getItem('userType');
        
        if (isLoggedIn && username) {
            return { username, userType, isLoggedIn: true };
        }
        return { isLoggedIn: false };
    },

    // Check if user is logged in
    isLoggedIn() {
        return localStorage.getItem('isLoggedIn') === 'true';
    },

    // Get current user info
    getCurrentUser() {
        return {
            username: localStorage.getItem('username'),
            userId: localStorage.getItem('userId'),
            userType: localStorage.getItem('userType'),
            isLoggedIn: this.isLoggedIn()
        };
    },

    // Logout user
    logout() {
        localStorage.removeItem('userType');
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loginTime');
        this.updateHeaderDisplay();
        window.location.href = 'login.html';
    },

    // Update header to show logged-in user
    updateHeaderDisplay() {
        const isLoggedIn = this.isLoggedIn();
        const username = localStorage.getItem('username');
        const userType = localStorage.getItem('userType');
        
        const userStatusDisplay = document.getElementById('userStatusDisplay');
        const guestDisplay = document.getElementById('guestDisplay');
        const userNameDisplay = document.getElementById('userNameDisplay');
        const adminLink = document.getElementById('adminLink');

        if (userStatusDisplay && guestDisplay) {
            if (isLoggedIn) {
                guestDisplay.style.display = 'none';
                userStatusDisplay.style.display = 'block';
                
                if (userNameDisplay) {
                    userNameDisplay.textContent = username || 'User';
                }
                
                // Show admin link if admin user
                if (adminLink && userType === 'admin') {
                    adminLink.style.display = 'inline';
                } else if (adminLink) {
                    adminLink.style.display = 'none';
                }
            } else {
                guestDisplay.style.display = 'block';
                userStatusDisplay.style.display = 'none';
                if (adminLink) {
                    adminLink.style.display = 'none';
                }
            }
        }
    },

    // Setup logout listener
    setupLogoutListener() {
        const logoutLinks = document.querySelectorAll('[onclick="handleLogout()"]');
        logoutLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        });
    }
};

// User-Specific Cart Management
const CartManager = {
    // Get cart key for current user
    getCartKey() {
        const user = UserSession.getCurrentUser();
        return user.isLoggedIn ? `cart_${user.userId}` : 'cart_guest';
    },

    // Get wishlist key for current user
    getWishlistKey() {
        const user = UserSession.getCurrentUser();
        return user.isLoggedIn ? `wishlist_${user.userId}` : 'wishlist_guest';
    },

    // Get user's cart
    getCart() {
        const cartKey = this.getCartKey();
        return JSON.parse(localStorage.getItem(cartKey)) || [];
    },

    // Add item to user's cart
    addToCart(product) {
        const cartKey = this.getCartKey();
        let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        
        const existingItem = cart.find(item => item.name === product.name);
        if (existingItem) {
            existingItem.quantity += product.quantity || 1;
        } else {
            cart.push({
                name: product.name,
                price: product.price,
                quantity: product.quantity || 1,
                category: product.category || 'uncategorized',
                image: product.image || ''
            });
        }
        
        localStorage.setItem(cartKey, JSON.stringify(cart));
        return cart;
    },

    // Remove item from cart
    removeFromCart(productName) {
        const cartKey = this.getCartKey();
        let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        cart = cart.filter(item => item.name !== productName);
        localStorage.setItem(cartKey, JSON.stringify(cart));
        return cart;
    },

    // Update item quantity
    updateQuantity(productName, quantity) {
        const cartKey = this.getCartKey();
        let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        const item = cart.find(i => i.name === productName);
        
        if (item) {
            if (quantity <= 0) {
                return this.removeFromCart(productName);
            }
            item.quantity = quantity;
            localStorage.setItem(cartKey, JSON.stringify(cart));
        }
        
        return cart;
    },

    // Clear cart
    clearCart() {
        const cartKey = this.getCartKey();
        localStorage.removeItem(cartKey);
    },

    // Get cart count
    getCartCount() {
        const cart = this.getCart();
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    },

    // Get cart total
    getCartTotal() {
        const cart = this.getCart();
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
    },

    // Add to wishlist
    addToWishlist(product) {
        const wishlistKey = this.getWishlistKey();
        let wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
        
        if (!wishlist.find(item => item.name === product.name)) {
            wishlist.push({
                name: product.name,
                price: product.price,
                category: product.category || 'uncategorized',
                image: product.image || ''
            });
        }
        
        localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
        return wishlist;
    },

    // Remove from wishlist
    removeFromWishlist(productName) {
        const wishlistKey = this.getWishlistKey();
        let wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
        wishlist = wishlist.filter(item => item.name !== productName);
        localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
        return wishlist;
    },

    // Get wishlist
    getWishlist() {
        const wishlistKey = this.getWishlistKey();
        return JSON.parse(localStorage.getItem(wishlistKey)) || [];
    },

    // Update cart display
    updateCartDisplay() {
        const cartCount = this.getCartCount();
        const cartCountElements = document.querySelectorAll('#cartCount, .cart-count-badge');
        cartCountElements.forEach(el => {
            el.textContent = cartCount;
        });

        const wishlistCount = this.getWishlist().length;
        const wishlistCountElements = document.querySelectorAll('#wishlistCount, .wishlist-count-badge');
        wishlistCountElements.forEach(el => {
            el.textContent = wishlistCount;
        });
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    UserSession.init();
    CartManager.updateCartDisplay();
});

// Expose logout function globally
function handleLogout() {
    UserSession.logout();
}

// Quick login function (for demo purposes)
function quickUserLogin(username) {
    const userId = username === 'user1' ? 'U001' : 'U002';
    UserSession.saveSession(username, userId, 'user');
    window.location.href = 'index.html';
}

// Enhanced login handler
function handleUserLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('userUsername').value.trim();
    const password = document.getElementById('userPassword').value;
    
    document.getElementById('userError').style.display = 'none';
    document.getElementById('userGeneralError').style.display = 'none';
    document.getElementById('userSuccessMsg').style.display = 'none';
    
    if (!username) {
        document.getElementById('userError').textContent = 'Username required';
        document.getElementById('userError').style.display = 'block';
        return;
    }
    
    if ((username === 'user1' || username === 'user2') && password === 'password123') {
        const userId = username === 'user1' ? 'U001' : 'U002';
        UserSession.saveSession(username, userId, 'user');
        
        document.getElementById('userSuccessMsg').textContent = `✓ Welcome back, ${username}!`;
        document.getElementById('userSuccessMsg').style.display = 'block';
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } else {
        document.getElementById('userGeneralError').textContent = 'Invalid credentials';
        document.getElementById('userGeneralError').style.display = 'block';
    }
}

// Enhanced admin login handler
function handleAdminLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value;
    
    document.getElementById('adminError').style.display = 'none';
    document.getElementById('adminGeneralError').style.display = 'none';
    document.getElementById('adminSuccessMsg').style.display = 'none';
    
    if (!username) {
        document.getElementById('adminError').textContent = 'Username required';
        document.getElementById('adminError').style.display = 'block';
        return;
    }
    
    if (username === 'admin' && password === 'admin@123') {
        UserSession.saveSession(username, 'ADMIN001', 'admin');
        
        document.getElementById('adminSuccessMsg').textContent = '✓ Admin login successful!';
        document.getElementById('adminSuccessMsg').style.display = 'block';
        
        setTimeout(() => {
            window.location.href = 'admin-dashboard.html';
        }, 1000);
    } else {
        document.getElementById('adminGeneralError').textContent = 'Invalid admin credentials';
        document.getElementById('adminGeneralError').style.display = 'block';
    }
}
