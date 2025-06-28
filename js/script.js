// Funcionalidades principales de PetShop
document.addEventListener('DOMContentLoaded', function() {
    updateYear();
    initCart();
    initCartPage();
    updatePremiumStatusDisplay();
});

// Función para actualizar el año
function updateYear() {
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Sistema de Carrito con localStorage
class CartManager {
    constructor() {
        this.cartKey = 'petshop_cart';
        this.userKey = 'petshop_user';
        this.cart = this.loadCart();
        this.user = this.loadUser();
        this.init();
    }

    loadCart() {
        const savedCart = localStorage.getItem(this.cartKey);
        return savedCart ? JSON.parse(savedCart) : [];
    }

    loadUser() {
        const savedUser = localStorage.getItem(this.userKey);
        return savedUser ? JSON.parse(savedUser) : {
            isPremium: false,
            name: 'Usuario',
            email: '',
            joinDate: new Date().toISOString()
        };
    }

    saveCart() {
        localStorage.setItem(this.cartKey, JSON.stringify(this.cart));
    }

    saveUser() {
        localStorage.setItem(this.userKey, JSON.stringify(this.user));
    }

    togglePremium() {
        this.user.isPremium = !this.user.isPremium;
        this.saveUser();
        this.updateCartDisplay();
        this.showNotification(
            this.user.isPremium ? '¡Ahora eres usuario Premium! Envíos gratuitos activados.' : 'Usuario Premium desactivado.',
            this.user.isPremium ? 'success' : 'info'
        );
    }

    isUserPremium() {
        return this.user.isPremium;
    }

    calculateShipping() {
        const subtotal = this.getTotalPrice();
        
        if (this.isUserPremium()) {
            return {
                cost: 0,
                description: 'Gratis (Usuario Premium)',
                isFree: true
            };
        }
        
        if (subtotal < 50) {
            return {
                cost: 4.99,
                description: '4.99€ (Pedido < 50€)',
                isFree: false
            };
        }
        
        return {
            cost: 0,
            description: 'Gratis (Pedido ≥ 50€)',
            isFree: true
        };
    }

    getFinalTotal() {
        const subtotal = this.getTotalPrice();
        const shipping = this.calculateShipping();
        return subtotal + shipping.cost;
    }

    addToCart(product) {
        const existingProduct = this.cart.find(item => item.id === product.id);
        
        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            this.cart.push({
                ...product,
                quantity: 1,
                addedAt: new Date().toISOString()
            });
        }
        
        this.saveCart();
        this.updateCartDisplay();
        this.showNotification(`¡${product.name} agregado al carrito!`, 'success');
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartDisplay();
        this.showNotification('Producto removido del carrito', 'info');
    }

    updateQuantity(productId, quantity) {
        const product = this.cart.find(item => item.id === productId);
        if (product) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                product.quantity = quantity;
                this.saveCart();
                this.updateCartDisplay();
            }
        }
    }

    getTotalItems() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    getTotalPrice() {
        return this.cart.reduce((total, item) => {
            const price = parseFloat(item.price.replace('€', '').replace(',', '.'));
            return total + (price * item.quantity);
        }, 0);
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartDisplay();
        this.showNotification('Carrito vaciado', 'info');
    }

    updateCartDisplay() {
        const cartBadge = document.querySelector('.cart-badge');
        const cartStatus = document.getElementById('cartStatus');
        const totalItems = this.getTotalItems();
        
        if (cartBadge) {
            cartBadge.textContent = totalItems;
            cartBadge.style.animation = 'pulse 0.5s ease';
            setTimeout(() => {
                cartBadge.style.animation = '';
            }, 500);
            
            if (totalItems > 0) {
                cartBadge.style.display = 'block';
            } else {
                cartBadge.style.display = 'none';
            }
        }
        
        if (cartStatus) {
            cartStatus.textContent = totalItems;
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            border: none;
            border-radius: 10px;
        `;
        
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    init() {
        this.updateCartDisplay();
        this.bindEvents();
    }

    bindEvents() {
        document.querySelectorAll('.btn-primary').forEach(button => {
            if (button.textContent.includes('Agregar al carrito')) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleAddToCart(button);
                });
            }
        });

        const cartButton = document.getElementById('cartButton');
        if (cartButton) {
            cartButton.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = '../html/nav/carrito.html';
            });
        }
    }

    handleAddToCart(button) {
        const card = button.closest('.card');
        const productName = card.querySelector('.card-title').textContent;
        const productPrice = card.querySelector('.price-new').textContent;
        const productImage = card.querySelector('.card-img-top').src;
        
        const productId = this.generateProductId(productName);
        
        const product = {
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            originalPrice: card.querySelector('.price-old')?.textContent || productPrice
        };
        
        this.addToCart(product);
        
        button.innerHTML = '<i class="bi bi-check-circle me-2"></i>Agregado';
        button.classList.add('btn-success');
        
        setTimeout(() => {
            button.innerHTML = '<i class="bi bi-cart-plus me-2"></i>Agregar al carrito';
            button.classList.remove('btn-success');
        }, 2000);
    }

    generateProductId(name) {
        return name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }

    getCartItems() {
        return this.cart;
    }

    isEmpty() {
        return this.cart.length === 0;
    }
}

// Inicializar el gestor del carrito
let cartManager;

function initCart() {
    cartManager = new CartManager();
}

// Exportar funciones para uso global
window.CartUtils = {
    getCart: () => cartManager,
    addProduct: (product) => cartManager?.addToCart(product),
    removeProduct: (productId) => cartManager?.removeFromCart(productId),
    clearCart: () => cartManager?.clearCart(),
    getTotalItems: () => cartManager?.getTotalItems() || 0,
    getTotalPrice: () => cartManager?.getTotalPrice() || 0,
    getFinalTotal: () => cartManager?.getFinalTotal() || 0,
    getShipping: () => cartManager?.calculateShipping() || { cost: 0, description: 'Gratis', isFree: true },
    isEmpty: () => cartManager?.isEmpty() || true,
    isPremium: () => cartManager?.isUserPremium() || false,
    togglePremium: () => cartManager?.togglePremium(),
    getUser: () => cartManager?.user || { isPremium: false, name: 'Usuario' }
};

// Funciones globales
window.clearCartFromMain = function() {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        const cartManager = window.CartUtils.getCart();
        if (cartManager) {
            cartManager.clearCart();
        }
    }
};

window.togglePremiumStatus = function() {
    const cartManager = window.CartUtils.getCart();
    if (cartManager) {
        cartManager.togglePremium();
        updatePremiumStatusDisplay();
    }
};

function updatePremiumStatusDisplay() {
    const premiumStatus = document.getElementById('premiumStatus');
    const isPremium = window.CartUtils.isPremium();
    
    if (premiumStatus) {
        if (isPremium) {
            premiumStatus.innerHTML = '<i class="bi bi-star-fill text-warning me-2"></i>Desactivar Premium';
            premiumStatus.parentElement.classList.add('text-warning');
        } else {
            premiumStatus.innerHTML = '<i class="bi bi-star me-2"></i>Activar Premium';
            premiumStatus.parentElement.classList.remove('text-warning');
        }
    }
}

// Funciones específicas para la página del carrito
function renderCart() {
    const cartManager = window.CartUtils.getCart();
    const cartItems = cartManager.getCartItems();
    const cartContainer = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    
    if (!cartContainer || !emptyCart) return;
    
    if (cartItems.length === 0) {
        cartContainer.innerHTML = '';
        emptyCart.style.display = 'block';
        updateSummary(0, 0, 0, false);
        return;
    }
    
    emptyCart.style.display = 'none';
    cartContainer.innerHTML = cartItems.map((item, idx) => `
        <div class="card mb-3 fade-in-up" style="animation-delay:${idx * 0.1}s">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-3 col-md-2 text-center">
                        <img src="${item.image}" alt="${item.name}" class="img-fluid rounded">
                    </div>
                    <div class="col-9 col-md-4">
                        <h5 class="card-title mb-2">${item.name}</h5>
                        <p class="text-muted mb-1"><i class="bi bi-tag me-1"></i>Precio: ${item.price}</p>
                        <p class="text-success mb-0 fw-bold"><i class="bi bi-calculator me-1"></i>Total: ${(parseFloat(item.price.replace('€', '').replace(',', '.')) * item.quantity).toFixed(2)}€</p>
                    </div>
                    <div class="col-12 col-md-3 mt-2 mt-md-0">
                        <div class="d-flex justify-content-center align-items-center">
                            <button class="btn btn-outline-secondary btn-sm" onclick="updateQuantity('${item.id}', ${item.quantity - 1})">
                                <i class="bi bi-dash"></i>
                            </button>
                            <input type="number" class="form-control mx-2" style="width: 60px;" value="${item.quantity}" min="1" onchange="updateQuantity('${item.id}', this.value)">
                            <button class="btn btn-outline-secondary btn-sm" onclick="updateQuantity('${item.id}', ${item.quantity + 1})">
                                <i class="bi bi-plus"></i>
                            </button>
                        </div>
                    </div>
                    <div class="col-6 col-md-2 text-center mt-2 mt-md-0">
                        <h6 class="mb-0 fw-bold text-primary">${(parseFloat(item.price.replace('€', '').replace(',', '.')) * item.quantity).toFixed(2)}€</h6>
                        <small class="text-muted">${item.quantity} ${item.quantity === 1 ? 'unidad' : 'unidades'}</small>
                    </div>
                    <div class="col-6 col-md-1 text-center mt-2 mt-md-0">
                        <button class="btn btn-outline-danger btn-sm" onclick="removeItem('${item.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    updateSummary(cartManager.getTotalItems(), cartManager.getTotalPrice(), cartManager.getFinalTotal(), cartManager.isUserPremium());
}

function updateQuantity(productId, newQuantity) {
    window.CartUtils.getCart().updateQuantity(productId, parseInt(newQuantity));
    renderCart();
}

function removeItem(productId) {
    window.CartUtils.getCart().removeFromCart(productId);
    renderCart();
}

function updateSummary(totalItems, subtotal, finalTotal, isPremium) {
    const totalItemsEl = document.getElementById('totalItems');
    const subtotalEl = document.getElementById('subtotal');
    const totalPriceEl = document.getElementById('totalPrice');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const shippingEl = document.getElementById('shipping');
    const shippingInfo = document.getElementById('shippingInfo');
    
    if (!totalItemsEl || !subtotalEl || !totalPriceEl || !checkoutBtn || !shippingEl || !shippingInfo) return;
    
    totalItemsEl.textContent = totalItems;
    subtotalEl.textContent = subtotal.toFixed(2) + '€';
    totalPriceEl.textContent = finalTotal.toFixed(2) + '€';
    checkoutBtn.disabled = totalItems === 0;
    
    const shipping = subtotal >= 50 || isPremium ? 'Gratis' : '4.99€';
    shippingEl.textContent = shipping;
    
    if (isPremium) {
        shippingInfo.innerHTML = '<small class="text-warning"><i class="bi bi-star-fill me-2"></i>Usuario Premium - Envío gratuito</small>';
    } else if (subtotal >= 50) {
        shippingInfo.innerHTML = '<small class="text-success"><i class="bi bi-check-circle me-2"></i>¡Envío gratuito! Pedido ≥ 50€</small>';
    } else {
        const remaining = (50 - subtotal).toFixed(2);
        shippingInfo.innerHTML = `<small class="text-info"><i class="bi bi-info-circle me-2"></i>Agrega ${remaining}€ más para envío gratuito</small>`;
    }
}

function initCartPage() {
    // Verificar si estamos en la página del carrito
    if (window.location.pathname.includes('carrito.html')) {
        renderCart();
        
        // Event listeners para botones del carrito
        const clearCartBtn = document.getElementById('clearCartBtn');
        const checkoutBtn = document.getElementById('checkoutBtn');
        
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', function() {
                if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
                    window.CartUtils.getCart().clearCart();
                    renderCart();
                }
            });
        }
        
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', function() {
                alert('Procediendo el pago...');
            });
        }
    }
}

// Exportar funciones para uso global
window.renderCart = renderCart;
window.updateQuantity = updateQuantity;
window.removeItem = removeItem;
window.updateSummary = updateSummary;

