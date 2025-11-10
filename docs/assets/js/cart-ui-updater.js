// Эта переменная будет хранить найденную ссылку, чтобы не искать ее каждый раз
let cartLinkElement = null;

function findCartLink() {
    // Если мы уже нашли ссылку, просто возвращаем ее
    if (cartLinkElement && document.body.contains(cartLinkElement)) {
        return cartLinkElement;
    }

    console.log("[findCartLink] Ищу ссылку на корзину...");
    const links = document.querySelectorAll('a');
    for (let i = 0; i < links.length; i++) {
        // Проверяем полный, разрешенный браузером href
        if (links[i].href.endsWith('/cart/') || links[i].href.endsWith('/cart.md')) {
            console.log(`%c[findCartLink] НАШЕЛ! Ссылка: ${links[i].href}`, 'color: green; font-weight: bold;');
            // Добавляем ID для будущих быстрых поисков
            links[i].id = 'cart-nav-link';
            cartLinkElement = links[i];
            return cartLinkElement;
        }
    }
    console.log("[findCartLink] Ссылка на корзину пока не найдена в DOM.");
    return null;
}

function updateCartCount() {
    const cartLink = findCartLink();
    if (cartLink) {
        if (typeof myCart !== 'undefined') {
            const totalItems = myCart.getTotalItems();
            const baseText = 'Корзина';
            
            // Управляем текстом и спаном для счетчика
            let countSpan = cartLink.querySelector('.cart-count');
            if (!countSpan) {
                cartLink.textContent = baseText; 
                countSpan = document.createElement('span');
                countSpan.className = 'cart-count';
                cartLink.appendChild(document.createTextNode(' '));
                cartLink.appendChild(countSpan);
            }
            
            if (totalItems > 0) {
                countSpan.textContent = `(${totalItems})`;
            } else {
                cartLink.textContent = baseText;
            }
        }
        return true; // Успех
    }
    return false; // Провал
}

// --- "Упрямый" Ползунок, который запускается на каждой странице ---
let attempts = 0;
const maxAttempts = 50; // 5 секунд
const poller = setInterval(() => {
    attempts++;
    if (updateCartCount() || attempts > maxAttempts) {
        clearInterval(poller);
    }
}, 100);

// Обновляем счетчик при изменении localStorage в других вкладках
window.addEventListener('storage', function(e) {
    if (e.key === 'shoppingCart' && typeof myCart !== 'undefined') {
        myCart.items = myCart.loadCart();
        updateCartCount();
    }
});