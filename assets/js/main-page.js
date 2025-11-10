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
                    url: `products/item_${paddedIndex}/`,
                    image: `products/item_${paddedIndex}/${meta.image}`
                });
                fetchProduct(index + 1);
            })
            .catch(error => {
                console.log('Обнаружение товаров завершено.');
                renderProducts();
            });
    }

    function renderProducts() {
        const productsToRender = allProducts.slice(renderedProductCount, renderedProductCount + itemsPerPage);

        productsToRender.forEach(product => {
            const productCard = `
                <div class="product-card" style="border: 1px solid #ccc; border-radius: 5px; padding: 1rem; width: 200px; text-align: center;">
                    <a href="${product.url}">
                        <img src="${product.image}" alt="${product.name}" style="max-width: 100%; height: auto; aspect-ratio: 3/2; object-fit: cover;">
                        <h4 style="margin-top: 0.5rem; margin-bottom: 0;">${product.name}</h4>
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