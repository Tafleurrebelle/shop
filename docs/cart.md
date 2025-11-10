# Корзина

Здесь отображены все выбранные вами товары.

<br>
<button id="clear-wishlist" class="md-button md-button--primary">Очистить список</button>
<button id="copy-wishlist" class="md-button">Скопировать список</button>
<hr>

<div id="wishlist-container" style="display: flex; flex-wrap: wrap; gap: 1rem;">
    <!-- Карточки товаров будут загружены сюда -->
</div>

<script>
    const wishlistContainer = document.getElementById('wishlist-container');
    const clearBtn = document.getElementById('clear-wishlist');
    const copyBtn = document.getElementById('copy-wishlist');

    function renderWishlist() {
        if (typeof myCart === 'undefined') {
            console.error('myCart is not defined. Make sure cart.js is loaded.');
            wishlistContainer.innerHTML = '<p>Ошибка загрузки корзины.</p>';
            return;
        }
        // --- ДИАГНОСТИЧЕСКИЙ ЛОГ ---
        console.log(`%cНа странице корзины, в myCart ${myCart.getTotalItems()} товаров`, 'color: purple; font-weight: bold;');

        const items = myCart.getCartItems();
        wishlistContainer.innerHTML = '';

        if (items.length === 0) {
            wishlistContainer.innerHTML = '<p>Ваш список пока пуст.</p>';
            return;
        }

        items.forEach(item => {
            if (!item.url || !item.image) {
                wishlistContainer.innerHTML += `<p style='color: red;'>В корзине найден товар старого формата ('${item.name}'). Пожалуйста, очистите корзину и добавьте товары заново.</p>`;
                return;
            }

            const productCard = `
                <div class="product-card" style="border: 1px solid #ccc; border-radius: 5px; padding: 1rem; width: 200px; text-align: center; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <a href="${item.url}">
                            <img src="${item.image}" alt="${item.name}" style="max-width: 100%; height: auto; aspect-ratio: 3/2; object-fit: cover;">
                            <h4 style="margin-top: 0.5rem; margin-bottom: 0;">${item.name}</h4>
                        </a>
                        <p>Количество: ${item.quantity}</p>
                    </div>
                    <button class="md-button remove-item-btn" data-item-id="${item.id}">Удалить</button>
                </div>
            `;
            wishlistContainer.innerHTML += productCard;
        });

        // Перепривязываем события к новым кнопкам
        document.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = this.getAttribute('data-item-id');
                myCart.removeItem(itemId);
                renderWishlist(); 
                showMySnackbar('Товар удален из корзины');
                updateCartCount();
            });
        });
    }

    function copyWishlistToClipboard() {
        const items = myCart.getCartItems();
        if (items.length === 0) {
            alert('Список пуст, нечего копировать!');
            return;
        }
        let textToCopy = 'Мой список товаров:\n';
        items.forEach(item => {
            textToCopy += `${item.name} (ID: ${item.id}) - Количество: ${item.quantity}\n`;
        });
        navigator.clipboard.writeText(textToCopy)
            .then(() => showMySnackbar('Список скопирован в буфер обмена!'))
            .catch(err => {
                console.error('Не удалось скопировать текст: ', err);
                alert('Не удалось скопировать список. Пожалуйста, скопируйте вручную.');
            });
    }

    function showMySnackbar(message) {
        const snackbar = document.createElement('div');
        snackbar.className = 'my-snackbar';
        snackbar.textContent = message;
        document.body.appendChild(snackbar);
        setTimeout(() => { snackbar.classList.add('show'); }, 10);
        setTimeout(() => {
            snackbar.classList.remove('show');
            setTimeout(() => { if (document.body.contains(snackbar)) { document.body.removeChild(snackbar); } }, 300);
        }, 3000);
    }

    clearBtn.addEventListener('click', () => {
        myCart.clearCart();
        renderWishlist();
        showMySnackbar('Корзина очищена');
        updateCartCount();
    });

    copyBtn.addEventListener('click', copyWishlistToClipboard);

    document.addEventListener('DOMContentLoaded', renderWishlist);

    window.addEventListener('storage', function(e) {
        if (e.key === 'shoppingCart') {
            renderWishlist();
            updateCartCount();
        }
    });
</script>