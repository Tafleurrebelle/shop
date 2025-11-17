document.addEventListener('DOMContentLoaded', function() {
    const catalogDiv = document.getElementById('product-catalog');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const filterInput = document.getElementById('product-filter-input');
    const filterButton = document.getElementById('product-filter-button');

    if (!catalogDiv || !filterInput || !filterButton) {
        return; // Прекращаем выполнение, если нет ключевых элементов
    }

    let allProducts = [];
    let renderedProductCount = 0;
    const itemsPerPage = 10;

    // --- ОСНОВНАЯ ЛОГИКА ---

    // 1. Загружаем все товары
    fetchAllProducts().then(products => {
        allProducts = products;
        // Изначально рендерим первую страницу
        renderPaginatedProducts();
        // Настраиваем обработчики событий фильтра
        setupFilterListeners();
    });

    // 2. Настраиваем кнопку "Загрузить еще"
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', renderPaginatedProducts);
    }

    // --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

    function fetchAllProducts() {
        return new Promise(resolve => {
            const products = [];
            let index = 1;
            let continueFetching = true;

            function fetchProduct() {
                if (!continueFetching) {
                    // Сортируем и резолвим промис, когда все найдено
                    products.sort((a, b) => a.name.localeCompare(b.name));
                    console.log(`[fetchAllProducts] Загружено и отсортировано ${products.length} товаров.`);
                    resolve(products);
                    return;
                }

                const paddedIndex = String(index).padStart(5, '0');
                const metaUrl = `products/item_${paddedIndex}/meta.json`;

                fetch(metaUrl)
                    .then(response => {
                        if (!response.ok) throw new Error('Product not found');
                        return response.json();
                    })
                    .then(meta => {
                        products.push({
                            id: paddedIndex,
                            name: meta.name,
                            price: meta.price,
                            url: `products/item_${paddedIndex}/`,
                            image: `products/item_${paddedIndex}/${meta.image}`
                        });
                        index++;
                        fetchProduct(); // Рекурсивно вызываем следующую
                    })
                    .catch(error => {
                        continueFetching = false;
                        fetchProduct(); // Вызываем еще раз, чтобы завершить процесс
                    });
            }
            fetchProduct();
        });
    }

    function renderCard(product) {
        return `
            <div class="product-card" style="border: 1px solid #ccc; border-radius: 5px; padding: 1rem; width: 200px; text-align: center; display: flex; flex-direction: column; justify-content: space-between;">
                <a href="${product.url}" style="text-decoration: none; color: inherit; display: flex; flex-direction: column; flex-grow: 1;">
                    <img src="${product.image}" alt="${product.name}" style="max-width: 100%; height: auto; aspect-ratio: 3/2; object-fit: cover; margin-bottom: 0.5rem;">
                    <h4 style="margin: 0.5rem 0 0.25rem 0;">${product.name}</h4>
                    <p class="product-price" style="margin: 0.25rem 0 0.5rem 0; font-size: 1.1em; font-weight: bold;">${product.price.toFixed(2)} ₽</p>
                </a>
            </div>
        `;
    }

    function renderPaginatedProducts() {
        const productsToRender = allProducts.slice(renderedProductCount, renderedProductCount + itemsPerPage);
        productsToRender.forEach(product => {
            catalogDiv.innerHTML += renderCard(product);
        });
        renderedProductCount += productsToRender.length;

        if (loadMoreBtn) {
            loadMoreBtn.style.display = renderedProductCount >= allProducts.length ? 'none' : 'inline-block';
        }
    }

    function renderAllProducts(products) {
        catalogDiv.innerHTML = '';
        if (products.length === 0) {
            catalogDiv.innerHTML = '<p>Товары не найдены.</p>';
        } else {
            products.forEach(product => {
                catalogDiv.innerHTML += renderCard(product);
            });
        }
    }

    function applyFilter() {
        const searchTerm = filterInput.value.trim().toLowerCase();

        if (!searchTerm) {
            // Если фильтр пуст, сбрасываем к постраничному виду
            catalogDiv.innerHTML = '';
            renderedProductCount = 0;
            renderPaginatedProducts();
            return;
        }

        const filteredProducts = allProducts.filter(product => {
            const nameMatch = product.name.toLowerCase().includes(searchTerm);
            const idMatch = product.id.includes(searchTerm);
            const priceMatch = product.price.toString() === searchTerm;
            return nameMatch || idMatch || priceMatch;
        });

        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        renderAllProducts(filteredProducts);
    }

    function setupFilterListeners() {
        const isMobile = window.matchMedia('(max-width: 768px)').matches;

        if (isMobile) {
            console.log('[Filter] Настроен мобильный режим (по кнопке).');
            filterButton.addEventListener('click', applyFilter);
        } else {
            console.log('[Filter] Настроен десктопный режим (живой поиск).');
            filterInput.addEventListener('input', applyFilter);
        }
    }
});