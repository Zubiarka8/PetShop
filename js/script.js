// Funcionalidades principales de PetShop
document.addEventListener('DOMContentLoaded', function() {
    updateYear();
    initCart();
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
                window.location.href = 'carrito.html';
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

document.addEventListener('DOMContentLoaded', function() {
    updatePremiumStatusDisplay();
});

