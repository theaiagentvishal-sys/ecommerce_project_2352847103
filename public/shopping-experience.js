/**
 * Shopping Experience Enhancement System
 * Provides personalization, recommendations, and friendly UX features
 */

const ShoppingExperience = {
    // Sample products data
    products: [
        {name:'Premium Running Shoes',price:89.99,rating:5,cat:'footwear',img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop',description:'High-performance running shoes with cushioning'},
        {name:'Casual Comfort Shoes',price:79.99,rating:4,cat:'footwear',img:'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=300&h=300&fit=crop',description:'Comfortable casual footwear for everyday wear'},
        {name:'Classic Cotton T-Shirt',price:29.99,rating:5,cat:'garments',img:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',description:'100% organic cotton basic t-shirt'},
        {name:'Premium Denim Jeans',price:59.99,rating:4,cat:'garments',img:'https://images.unsplash.com/photo-1542272604-787c62d465d1?w=300&h=300&fit=crop',description:'Durable premium denim with perfect fit'},
        {name:'Sport Athletic Shoes',price:99.99,rating:5,cat:'footwear',img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop',description:'Professional athletic shoes for all sports'},
        {name:'Stylish Winter Jacket',price:149.99,rating:4,cat:'garments',img:'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=300&h=300&fit=crop',description:'Warm and stylish winter jacket'},
        {name:'Leather Belt',price:39.99,rating:4,cat:'accessories',img:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop',description:'Genuine leather belt with classic design'},
        {name:'Sports Socks Pack',price:19.99,rating:5,cat:'accessories',img:'https://images.unsplash.com/photo-1586620902629-8919faf4c088?w=300&h=300&fit=crop',description:'Comfortable sports socks pack (3 pairs)'},
        {name:'Summer Dress',price:69.99,rating:5,cat:'garments',img:'https://images.unsplash.com/photo-1595777707802-21b287cecdc3?w=300&h=300&fit=crop',description:'Light and breezy summer dress'},
        {name:'Hiking Boots',price:129.99,rating:4,cat:'footwear',img:'https://images.unsplash.com/photo-1518575658510-7f3f6dc0f0c9?w=300&h=300&fit=crop',description:'Rugged hiking boots for outdoor adventures'},
        {name:'Casual Polo Shirt',price:45.99,rating:4,cat:'garments',img:'https://images.unsplash.com/photo-1597070194924-b86c6e81fa11?w=300&h=300&fit=crop',description:'Versatile polo shirt for any occasion'},
        {name:'Sports Cap',price:24.99,rating:5,cat:'accessories',img:'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=300&h=300&fit=crop',description:'Stylish sports cap with UV protection'}
    ],

    // Track recently viewed products
    trackView(productName) {
        let viewed = JSON.parse(localStorage.getItem(`viewed_${UserSession.getCurrentUser().userId}`) || '[]');
        viewed = viewed.filter(item => item !== productName); // Remove if exists
        viewed.unshift(productName); // Add to front
        viewed = viewed.slice(0, 10); // Keep last 10
        localStorage.setItem(`viewed_${UserSession.getCurrentUser().userId}`, JSON.stringify(viewed));
    },

    // Get recently viewed products
    getRecentlyViewed() {
        const viewed = JSON.parse(localStorage.getItem(`viewed_${UserSession.getCurrentUser().userId}`) || '[]');
        return viewed.map(name => this.products.find(p => p.name === name)).filter(Boolean);
    },

    // Get personalized recommendations based on cart
    getRecommendations(limit = 4) {
        const cart = CartManager.getCart();
        const cartCategories = new Set(cart.map(item => item.category));
        
        if (cartCategories.size === 0) {
            // No items in cart, recommend popular items
            return this.products.filter(p => p.rating >= 4).slice(0, limit);
        }

        // Recommend items from same categories
        const recommendations = this.products
            .filter(p => !cart.find(c => c.name === p.name)) // Exclude cart items
            .filter(p => cartCategories.has(p.cat))
            .sort((a, b) => b.rating - a.rating)
            .slice(0, limit);

        // If not enough, add popular items
        if (recommendations.length < limit) {
            const additional = this.products
                .filter(p => !recommendations.find(r => r.name === p.name))
                .filter(p => !cart.find(c => c.name === p.name))
                .sort((a, b) => b.rating - a.rating)
                .slice(0, limit - recommendations.length);
            recommendations.push(...additional);
        }

        return recommendations;
    },

    // Get featured/best sellers
    getFeaturedProducts(limit = 6) {
        return this.products
            .sort((a, b) => b.rating - a.rating)
            .slice(0, limit);
    },

    // Get deals/special offers
    getDeals(limit = 3) {
        return this.products
            .filter(p => p.price > 50) // High value items
            .sort((a, b) => b.price - a.price)
            .slice(0, limit);
    },

    // Create personalized greeting
    getPersonalizedGreeting() {
        const user = UserSession.getCurrentUser();
        if (!user.isLoggedIn) {
            return { greeting: '👋 Welcome to E-SHOP!', subtitle: 'Sign in to enjoy personalized shopping' };
        }

        const hour = new Date().getHours();
        let timeGreeting = 'Good morning';
        if (hour >= 12 && hour < 18) timeGreeting = 'Good afternoon';
        if (hour >= 18) timeGreeting = 'Good evening';

        const cartItems = CartManager.getCartCount();
        const cartText = cartItems > 0 ? ` (${cartItems} items in cart)` : '';

        return {
            greeting: `${timeGreeting}, ${user.username}! 👋`,
            subtitle: `Welcome back! Continue your shopping${cartText}`
        };
    }
};

// Add search functionality
const SearchManager = {
    search(query) {
        const term = query.toLowerCase().trim();
        if (!term) return [];
        
        return ShoppingExperience.products.filter(p => 
            p.name.toLowerCase().includes(term) ||
            p.description.toLowerCase().includes(term) ||
            p.cat.toLowerCase().includes(term)
        );
    }
};

// Add product comparison
const ComparisonManager = {
    getComparisonKey() {
        return `compare_${UserSession.getCurrentUser().userId}`;
    },

    addToComparison(product) {
        let compare = JSON.parse(localStorage.getItem(this.getComparisonKey()) || '[]');
        if (!compare.find(p => p.name === product.name)) {
            compare.push(product);
            if (compare.length > 4) compare.shift(); // Max 4 items
            localStorage.setItem(this.getComparisonKey(), JSON.stringify(compare));
        }
        return compare;
    },

    getComparison() {
        return JSON.parse(localStorage.getItem(this.getComparisonKey()) || '[]');
    },

    clear() {
        localStorage.removeItem(this.getComparisonKey());
    }
};

// Format price with currency
function formatPrice(price) {
    return '$' + price.toFixed(2);
}

// Format rating stars
function formatRating(rating) {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating) + ' (' + rating + ')';
}

// Create product card HTML
function createProductCard(product, showDescription = false) {
    return `
        <div class="product-card-enhanced">
            <div class="product-card-image">
                <img src="${product.img}" alt="${product.name}" loading="lazy">
                <div class="product-badge">
                    <span class="rating-badge">${product.rating}★</span>
                </div>
                <div class="product-card-actions">
                    <button class="action-btn add-cart-btn" onclick="addProductToCart('${product.name}',${product.price},'${product.cat}')" title="Add to Cart">
                        <i class="fa fa-shopping-cart"></i>
                    </button>
                    <button class="action-btn wishlist-btn" onclick="addToWishlist('${product.name}',${product.price})" title="Add to Wishlist">
                        <i class="fa fa-heart-o"></i>
                    </button>
                    <button class="action-btn compare-btn" onclick="compareProduct('${product.name}',${product.price},'${product.cat}')" title="Compare">
                        <i class="fa fa-exchange"></i>
                    </button>
                </div>
            </div>
            <div class="product-card-content">
                <h4 class="product-card-title">${product.name}</h4>
                ${showDescription ? `<p class="product-card-desc">${product.description}</p>` : ''}
                <div class="product-card-rating">${'★'.repeat(product.rating)}<span class="rating-count">${product.rating}</span></div>
                <div class="product-card-price">${formatPrice(product.price)}</div>
            </div>
        </div>
    `;
}

// Render featured products section
function renderFeaturedProducts() {
    const featured = ShoppingExperience.getFeaturedProducts(6);
    const container = document.getElementById('featuredProductsContainer');
    if (!container) return;

    let html = '<div class="featured-products-grid">';
    featured.forEach(product => {
        html += createProductCard(product);
    });
    html += '</div>';
    container.innerHTML = html;
}

// Render recommendations
function renderRecommendations() {
    const recommendations = ShoppingExperience.getRecommendations(6);
    const container = document.getElementById('recommendationsContainer');
    if (!container) return;

    let html = '<div class="recommendations-grid">';
    recommendations.forEach(product => {
        html += createProductCard(product);
    });
    html += '</div>';
    container.innerHTML = html;
}

// Render recently viewed
function renderRecentlyViewed() {
    const user = UserSession.getCurrentUser();
    if (!user.isLoggedIn) return;

    const viewed = ShoppingExperience.getRecentlyViewed();
    const container = document.getElementById('recentlyViewedContainer');
    if (!container || viewed.length === 0) return;

    let html = '<div class="recently-viewed-grid">';
    viewed.forEach(product => {
        html += createProductCard(product);
    });
    html += '</div>';
    container.innerHTML = html;
}

// Render featured deals
function renderFeaturedDeals() {
    const deals = ShoppingExperience.getDeals(3);
    const container = document.getElementById('featuredDealsContainer');
    if (!container) return;

    let html = '<div class="featured-deals-grid">';
    deals.forEach(product => {
        html += `
            <div class="featured-deal-card">
                <img src="${product.img}" alt="${product.name}">
                <h4>${product.name}</h4>
                <p class="deal-price">${formatPrice(product.price)}</p>
                <button onclick="addProductToCart('${product.name}',${product.price},'${product.cat}')" class="btn-quick-buy">Quick Buy</button>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

// Display personalized greeting
function displayGreeting() {
    const greetingContainer = document.getElementById('personalizedGreeting');
    if (!greetingContainer) return;

    const greeting = ShoppingExperience.getPersonalizedGreeting();
    greetingContainer.innerHTML = `
        <div class="greeting-banner">
            <h2>${greeting.greeting}</h2>
            <p>${greeting.subtitle}</p>
        </div>
    `;
}

// Compare product
function compareProduct(name, price, category) {
    if (!UserSession.isLoggedIn()) {
        alert('⚠️ Please login first to compare products!');
        window.location.href = 'login.html';
        return;
    }
    ComparisonManager.addToComparison({ name, price, category });
    alert('✓ Added to comparison!');
}

// Initialize shopping experience
document.addEventListener('DOMContentLoaded', () => {
    displayGreeting();
    renderFeaturedProducts();
    renderRecommendations();
    renderRecentlyViewed();
    renderFeaturedDeals();
});
