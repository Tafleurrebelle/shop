document.addEventListener('DOMContentLoaded', function() {
    const catalogDiv = document.getElementById('product-catalog');
    const loadMoreBtn = document.getElementById('load-more-btn');

    // Если на странице нет каталога, прекращаем выполнение скрипта
    if (!catalogDiv) {
        return;
    }

    let allProducts = [];
    let renderedProductCount = 0;
    const itemsPerPage = 10;

    function fetchProduct(index) {
        const paddedIndex = String(index).padStart(5, '0');
        const metaUrl = `products/item_${paddedIndex}/meta.json`;

        fetch(metaUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Product not found');
                }
                return response.json();
            })
            .then(meta => {
                allProducts.push({
                    id: paddedIndex,
                    name: meta.name,
                    price: meta.price, // Цена добавлена
                    url: `products/item_${paddedIndex}/`,
                    image: `products/item_${paddedIndex}/${meta.image}`
                });
                fetchProduct(index + 1);
            })
            .catch(error => {
                console.log('Обнаружение товаров завершено.');
                // Сортируем товары по имени перед отрисовкой
                allProducts.sort((a, b) => a.name.localeCompare(b.name));
                renderProducts();
            });
    }

    function renderProducts() {
        const productsToRender = allProducts.slice(renderedProductCount, renderedProductCount + itemsPerPage);

        productsToRender.forEach(product => {
            const productCard = `
                <div class="product-card" style="border: 1px solid #ccc; border-radius: 5px; padding: 1rem; width: 200px; text-align: center; display: flex; flex-direction: column; justify-content: space-between;">
                    <a href="${product.url}" style="text-decoration: none; color: inherit; display: flex; flex-direction: column; flex-grow: 1;">
                        <img src="${product.image}" alt="${product.name}" style="max-width: 100%; height: auto; aspect-ratio: 3/2; object-fit: cover; margin-bottom: 0.5rem;">
                        <h4 style="margin: 0.5rem 0 0.25rem 0;">${product.name}</h4>
                        <p class="product-price" style="margin: 0.25rem 0 0.5rem 0; font-size: 1.1em; font-weight: bold;">${product.price.toFixed(2)} ₽</p>
                    </a>
                </div>
            `;
            catalogDiv.innerHTML += productCard;
        });

        renderedProductCount += productsToRender.length;

        if (renderedProductCount >= allProducts.length && loadMoreBtn) {
            loadMoreBtn.style.display = 'none';
        }
    }
    
    fetchProduct(1);

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', renderProducts);
    }
});