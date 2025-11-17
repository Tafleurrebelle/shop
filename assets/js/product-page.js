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
    const priceContainer = document.getElementById('product-price-container');
    const descriptionContainer = document.getElementById('product-description-container');
    const addToCartButton = document.getElementById('add-to-cart-button');
    const swiperWrapper = document.querySelector('.swiper-wrapper');

    // --- 1. Загружаем meta.json ---
    fetch('meta.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(meta => {
            // --- 2. Заполняем страницу данными ---
            if (nameContainer) nameContainer.innerHTML = `<h1>${meta.name}</h1>`;
            if (priceContainer) priceContainer.innerHTML = `<p class="product-page-price">${meta.price.toFixed(2)} ₽</p>`;
            if (descriptionContainer) descriptionContainer.innerHTML = `<p>${meta.description}</p>`;

            // --- 3. Настраиваем кнопку "Добавить в список" ---
            if (addToCartButton) {
                const productUrl = window.location.pathname;
                const imageUrl = `${productUrl}${meta.image}`;

                addToCartButton.onclick = function() {
                    myCart.addItem({
                        id: meta.id,
                        name: meta.name,
                        price: meta.price,
                        description: meta.description,
                        url: productUrl,
                        image: imageUrl
                    });
                    showMySnackbar(`'${meta.name}' добавлен в корзину`);
                    updateCartCount();
                };
            }
        })
        .catch(error => {
            console.error('Ошибка при загрузке и обработке meta.json:', error);
            if (nameContainer) nameContainer.innerHTML = '<h1>Ошибка загрузки товара</h1>';
        });

    // --- 4. Асинхронно загружаем галерею и инициализируем Swiper ---
    async function loadImagesAndInitSwiper() {
        if (!swiperWrapper) return;

        const imagePromises = [];
        let imageIndex = 1;
        let continueLoading = true;

        while (continueLoading) {
            const imageName = `image_${imageIndex}.jpg`;
            
            const promise = fetch(imageName)
                .then(response => {
                    if (response.ok) {
                        return response.blob();
                    }
                    throw new Error('Image not found');
                })
                .then(blob => {
                    const slide = document.createElement('div');
                    slide.className = 'swiper-slide';
                    
                    const zoomContainer = document.createElement('div');
                    zoomContainer.className = 'swiper-zoom-container';

                    const img = document.createElement('img');
                    img.src = URL.createObjectURL(blob);
                    
                    zoomContainer.appendChild(img);
                    slide.appendChild(zoomContainer);
                    return slide;
                })
                .catch(error => {
                    continueLoading = false;
                    return null;
                });

            imagePromises.push(promise);
            imageIndex++;
            // Ограничитель, чтобы избежать бесконечного цикла в случае ошибки
            if (imageIndex > 50) continueLoading = false; 
        }

        const slides = await Promise.all(imagePromises);
        
        slides.forEach(slide => {
            if (slide) {
                swiperWrapper.appendChild(slide);
            }
        });

        console.log(`[Swiper] Загружено ${swiperWrapper.children.length} изображений. Инициализация...`);

        // Инициализируем Swiper после загрузки всех изображений
        const swiper = new Swiper('.swiper', {
            loop: true,
            zoom: true,
            mousewheel: true,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
        });
    }

    loadImagesAndInitSwiper();
});