// Функция для показа нашего собственного уведомления
function showMySnackbar(message) {
    // Создаем элемент уведомления
    const snackbar = document.createElement('div');
    snackbar.className = 'my-snackbar';
    snackbar.textContent = message;

    // Добавляем его на страницу
    document.body.appendChild(snackbar);

    // Через мгновение показываем его с анимацией
    setTimeout(() => {
        snackbar.classList.add('show');
    }, 10);

    // Через 3 секунды скрываем и затем удаляем
    setTimeout(() => {
        snackbar.classList.remove('show');
        // Ждем окончания анимации скрытия, прежде чем удалить элемент
        setTimeout(() => {
            if (document.body.contains(snackbar)) {
                document.body.removeChild(snackbar);
            }
        }, 300);
    }, 3000);
}


document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, находимся ли мы на странице товара
    if (!window.location.pathname.includes('/products/item_')) {
        return; // Если нет, ничего не делаем
    }

    // Находим все необходимые контейнеры
    const nameContainer = document.getElementById('product-name-container');
    const descriptionContainer = document.getElementById('product-description-container');
    const gallery = document.getElementById('image-gallery');
    const addToCartButton = document.getElementById('add-to-cart-button');

    // --- 1. Загружаем meta.json ---
    fetch('meta.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(meta => {
            // --- 2. Заполняем страницу данными ---
            if (nameContainer) {
                nameContainer.innerHTML = `<h1>${meta.name}</h1>`;
            }
            if (descriptionContainer) {
                descriptionContainer.innerHTML = `<p>${meta.description}</p>`;
            }

            // --- 3. Настраиваем кнопку "Добавить в список" ---
            if (addToCartButton) {
                const productUrl = window.location.pathname;
                const imageUrl = `${productUrl}${meta.image}`;

                addToCartButton.onclick = function() {
                    myCart.addItem({
                        id: meta.id,
                        name: meta.name,
                        price: meta.price,
                        url: productUrl,
                        image: imageUrl
                    });
                    // Показываем наше собственное уведомление
                    showMySnackbar(`'${meta.name}' добавлен в корзину`);
                    // Обновляем счетчик корзины в UI
                    updateCartCount();
                };
            }
        })
        .catch(error => {
            console.error('Ошибка при загрузке и обработке meta.json:', error);
            if (nameContainer) nameContainer.innerHTML = '<h1>Ошибка загрузки товара</h1>';
        });

    // --- 4. Загружаем галерею ---
    function loadImage(index) {
        const img = new Image();
        const imageName = `image_${index}.jpg`;
        img.onload = function() {
            if (gallery) gallery.appendChild(img);
            loadImage(index + 1);
        };
        img.onerror = function() {
            console.log(`Загрузка изображений завершена. ${imageName} не найден.`);
        };
        img.src = imageName;
    }
    if (gallery) {
        loadImage(1);
    }
});