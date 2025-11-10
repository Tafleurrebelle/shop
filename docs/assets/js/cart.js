class ShoppingCart {
    constructor() {
        this.items = this.loadCart();
    }

    loadCart() {
        const cartData = localStorage.getItem('shoppingCart');
        return cartData ? JSON.parse(cartData) : [];
    }

    saveCart() {
        localStorage.setItem('shoppingCart', JSON.stringify(this.items));
        // Принудительно вызываем обновление счетчика при каждом сохранении
        if (typeof updateCartCount === 'function') {
            updateCartCount();
        }
    }

    addItem(item) {
        const existingItem = this.items.find(i => i.id === item.id);
        if (existingItem) {
            existingItem.quantity += item.quantity || 1;
        } else {
            this.items.push({ ...item, quantity: item.quantity || 1 });
        }
        this.saveCart();
        console.log(`Добавлен товар: ${item.name}. Текущая корзина:`, this.items);
    }

    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.saveCart();
        console.log(`Удален товар с ID: ${itemId}. Текущая корзина:`, this.items);
    }

    clearCart() {
        this.items = [];
        this.saveCart();
        console.log("Корзина очищена.");
    }

    getCartItems() {
        return this.items;
    }

    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }
}

const myCart = new ShoppingCart();