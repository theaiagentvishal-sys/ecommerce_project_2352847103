/**
 * Optimized Shopping Flow for Maximum Conversions
 * Focus: Smooth buying, minimal friction, increased sales
 */

const ShoppingFlow = {
    // Quick add to cart with instant visual feedback
    quickAddToCart(productName, price, category = 'accessories', productImg = '') {
        // Check login
        if (!UserSession.isLoggedIn()) {
            this.showLoginPrompt();
            return false;
        }

        // Add to cart
        CartManager.addToCart({
            name: productName,
            price: price,
            quantity: 1,
            category: category,
            image: productImg
        });

        // Show success with animation
        this.showCartNotification(productName, price);
        
        // Update all displays
        CartManager.updateCartDisplay();
        
        return true;
    },

    // Smooth login prompt with minimal friction
    showLoginPrompt() {
        // Redirect to login page
        window.location.href = 'login.html';
    },

    // Beautiful cart notification
    showCartNotification(productName, price) {
        // Remove old notification if exists
        const oldNotif = document.querySelector('.cart-notification');
        if (oldNotif) oldNotif.remove();

        // Create notification
        const notif = document.createElement('div');
        notif.className = 'cart-notification';
        notif.innerHTML = `
            <div class="cart-notification-content">
                <i class="fa fa-check-circle"></i>
                <div>
                    <strong>${productName}</strong>
                    <p>Added to cart - $${price.toFixed(2)}</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 20px; cursor: pointer;">×</button>
            </div>
        `;
        
        document.body.appendChild(notif);
        
        // Auto remove after 3 seconds
        setTimeout(() => notif.remove(), 3000);
    },

    // One-click checkout (minimal steps)
    oneClickCheckout() {
        const user = UserSession.getCurrentUser();
        if (!user.isLoggedIn) {
            this.showLoginPrompt();
            return;
        }

        const cart = CartManager.getCart();
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        // Go to checkout
        window.location.href = 'checkout.html';
    },

    // Cart recovery - suggest items based on browse history
    getCartRecoveryItems() {
        const cart = CartManager.getCart();
        if (cart.length > 0) return null; // Cart not empty
        
        const viewed = ShoppingExperience.getRecentlyViewed();
        return viewed.length > 0 ? viewed.slice(0, 3) : ShoppingExperience.getFeaturedProducts(3);
    },

    // Express checkout (guest or saved address)
    expressCheckout() {
        const user = UserSession.getCurrentUser();
        if (!user.isLoggedIn) {
            this.showLoginPrompt();
            return;
        }

        // Simulate express checkout
        const cart = CartManager.getCart();
        const total = CartManager.getCartTotal();
        
        if (confirm(`Complete purchase for $${total}? This will be processed to your saved address.`)) {
            this.processOrder(cart, total);
        }
    },

    // Process order
    processOrder(cart, total) {
        const user = UserSession.getCurrentUser();
        const orderId = 'ORD-' + Date.now();
        
        // Save order
        const order = {
            orderId: orderId,
            userId: user.userId,
            username: user.username,
            items: cart,
            total: total,
            date: new Date().toISOString(),
            status: 'completed',
            deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()
        };

        let orders = JSON.parse(localStorage.getItem(`orders_${user.userId}`) || '[]');
        orders.push(order);
        localStorage.setItem(`orders_${user.userId}`, JSON.stringify(orders));

        // Clear cart
        CartManager.clearCart();
        CartManager.updateCartDisplay();

        // Show success
        alert(`✓ Order confirmed!\n\nOrder ID: ${orderId}\nTotal: $${total}\n\nDelivery: ${order.deliveryDate}\n\nCheck your profile for order details.`);
        
        // Redirect to order confirmation
        window.location.href = `order-confirmation.html?orderId=${orderId}`;
    }
};

// Enhanced product rendering for quick purchase
function renderProductsForQuickBuy(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let html = '<div class="products-quick-buy-grid">';
    products.forEach(product => {
        html += `
            <div class="product-quick-buy-card">
                <div class="product-img-wrapper">
                    <img src="${product.img}" alt="${product.name}" loading="lazy">
                    <div class="quick-buy-overlay">
                        <button class="btn-quick-add" onclick="ShoppingFlow.quickAddToCart('${product.name.replace(/'/g, "\\'")}', ${product.price}, '${product.cat}', '${product.img}')">
                            🛒 ADD TO CART
                        </button>
                        <button class="btn-quick-view" onclick="viewProduct('${product.name.replace(/'/g, "\\'")}')" style="margin-top: 8px;">
                            👁️ QUICK VIEW
                        </button>
                    </div>
                </div>
                <div class="product-info-quick">
                    <h4>${product.name}</h4>
                    <p class="product-desc">${product.description || ''}</p>
                    <div class="product-footer">
                        <span class="price">$${product.price}</span>
                        <span class="rating">★${product.rating}</span>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

// Quick view modal
function viewProduct(productName) {
    const product = ShoppingExperience.products.find(p => p.name === productName);
    if (!product) return;

    const modal = document.createElement('div');
    modal.className = 'quick-view-modal';
    modal.innerHTML = `
        <div class="quick-view-content">
            <button class="close-modal" onclick="this.parentElement.parentElement.remove()">×</button>
            <div class="quick-view-body">
                <div class="qv-image">
                    <img src="${product.img}" alt="${product.name}">
                </div>
                <div class="qv-details">
                    <h2>${product.name}</h2>
                    <p class="qv-category">Category: ${product.cat}</p>
                    <p class="qv-description">${product.description}</p>
                    <div class="qv-rating">⭐ ${product.rating}/5 Stars</div>
                    <h3 class="qv-price">$${product.price}</h3>
                    <div style="display: grid; gap: 10px; margin-top: 20px;">
                        <button class="btn-qv-add" onclick="ShoppingFlow.quickAddToCart('${product.name.replace(/'/g, "\\'")}', ${product.price}, '${product.cat}'); this.parentElement.parentElement.parentElement.remove();">
                            🛒 Add to Cart
                        </button>
                        <button class="btn-qv-wishlist" onclick="addToWishlist('${product.name.replace(/'/g, "\\'")}', ${product.price})">
                            ❤️ Add to Wishlist
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Shopping cart summary widget (mini cart)
function renderMiniCart() {
    const cart = CartManager.getCart();
    const total = CartManager.getCartTotal();
    
    if (cart.length === 0) return '';

    return `
        <div class="mini-cart-summary">
            <h4>🛒 Your Cart (${CartManager.getCartCount()} items)</h4>
            <div class="mini-cart-items">
                ${cart.map(item => `
                    <div class="mini-cart-item">
                        <span>${item.name}</span>
                        <span>$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="mini-cart-total">
                <strong>Total: $${total}</strong>
            </div>
            <div style="display: grid; gap: 8px; margin-top: 15px;">
                <button onclick="window.location.href = 'cart.html'" class="btn-view-cart">View Cart</button>
                <button onclick="ShoppingFlow.oneClickCheckout()" class="btn-checkout-now">Checkout</button>
            </div>
        </div>
    `;
}

// Floating cart button
function initFloatingCart() {
    const user = UserSession.getCurrentUser();
    if (!user.isLoggedIn) return;

    const cart = CartManager.getCart();
    if (cart.length === 0) return;

    let floating = document.querySelector('.floating-cart-btn');
    if (floating) floating.remove();

    const btn = document.createElement('button');
    btn.className = 'floating-cart-btn';
    btn.innerHTML = `
        🛒 ${CartManager.getCartCount()} 
        <span class="cart-total">$${CartManager.getCartTotal()}</span>
    `;
    btn.onclick = () => {
        window.location.href = 'cart.html';
    };
    document.body.appendChild(btn);
}

// Track product view for recommendations
function trackProductView(productName) {
    if (UserSession.isLoggedIn()) {
        ShoppingExperience.trackView(productName);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initFloatingCart();
});

// Update floating cart when cart changes
window.addEventListener('storage', () => {
    initFloatingCart();
});
