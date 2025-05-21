// 📁 category.js
import { renderPagination } from './pagination.js';

const PAGE_SIZE = 10;

async function loadCategoryItems(page = 0) {
    const container = document.getElementById("cards-container");
    const pagination = document.getElementById("pagination-container");
    const categoryTitle = document.getElementById("categoryTitle");

    if (!container || !pagination) return;

    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('page', page);
    urlParams.set('size', PAGE_SIZE);

    const category = urlParams.get('category');
    if (categoryTitle && category) {
        categoryTitle.textContent = getCategoryDisplayName(category);
    }

    const categorySelect = document.getElementById("categorySelect");
    if (categorySelect && category) {
        categorySelect.value = category;
    }

    container.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Загрузка устройств...</p>
        </div>
    `;
    pagination.innerHTML = "";

    try {
        const response = await fetch(`http://localhost:8080/api/devices/search?${urlParams.toString()}`);
        if (!response.ok) throw new Error("Ошибка загрузки данных");

        const data = await response.json();
        const cards = data.content;
        const totalPages = data.page.totalPages;

        container.innerHTML = "";

        if (cards.length === 0) {
            container.innerHTML = `
                <div class="empty-results">
                    <i class="fas fa-search"></i>
                    <p>Устройств по заданным параметрам не найдено.</p>
                </div>
            `;
            pagination.style.display = 'none';
            return;
        }

        cards.forEach(card => {
            const cardElement = document.createElement("div");
            cardElement.className = "card";

            const releaseDate = new Date(card.releaseDate);
            const formattedDate = releaseDate.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            const rating = card.averageRating ?? 0;
            const fullStars = Math.floor(rating);
            const halfStar = rating % 1 >= 0.5;
            const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

            let stars = "";
            stars += '<i class="fas fa-star"></i>'.repeat(fullStars);
            if (halfStar) stars += '<i class="fas fa-star-half-alt"></i>';
            stars += '<i class="far fa-star"></i>'.repeat(emptyStars);

            cardElement.innerHTML = `
                <div class="category-device-card">
                    <h3>${card.name}</h3>
                    <p><strong>Бренд:</strong> ${card.brand}</p>
                    <p>${card.description}</p>
                    <p><strong>Дата выхода:</strong> ${formattedDate}</p>
                    <p class="device-rating">
                        <strong>Оценка:&nbsp;&nbsp;</strong> 
                        ${rating ? `<span>${rating.toFixed(1)}</span> <span class="rating-stars">${stars}</span>` : 'Нет данных'}
                    </p>
                </div>
            `;

            cardElement.addEventListener("click", () => {
                window.location.href = `device.html?id=${card.id}`;
            });

            container.appendChild(cardElement);
        });

        renderPagination(pagination, totalPages, page, (newPage) => {
            loadCategoryItems(newPage);
        });

    } catch (error) {
        console.error("Ошибка при загрузке карточек:", error);
        container.innerHTML = `
            <div class="error-container">
                <i class="fas fa-exclamation-circle"></i>
                <p>Произошла ошибка при загрузке устройств. Попробуйте позже.</p>
            </div>
        `;
    }
}

function getCategoryDisplayName(category) {
    const categoryMap = {
        'MOUSE': 'Мыши',
        'KEYBOARD': 'Клавиатуры',
        'HEADPHONES': 'Гарнитуры',
        'MICROPHONE': 'Микрофоны'
    };
    return categoryMap[category] || null;
}

export function setupCategories() {
    const categoryCards = document.querySelectorAll(".category-card");

    categoryCards.forEach(card => {
        card.addEventListener("click", function () {
            const category = this.dataset.category;
            window.location.href = `category.html?category=${category}`;
        });
    });

    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");

    if (category) {
        loadCategoryItems(Number(params.get("page")) || 0);
    } else {
        loadCategoryItems(0);
    }

    setupFilters(category);
}

function setupFilters(initialCategory) {
    const applyFiltersBtn = document.getElementById('applyFilters');
    const resetFiltersBtn = document.getElementById('resetFilters');
    const sortSelect = document.getElementById('sortSelect');

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            const category = document.getElementById('categorySelect').value;
            const brand = document.getElementById('brandInput').value;
            const minRating = document.getElementById('minRating').value;
            const maxRating = document.getElementById('maxRating').value;
            const minDate = document.getElementById('minDate').value;
            const maxDate = document.getElementById('maxDate').value;
            const sort = document.getElementById('sortSelect').value;

            const params = new URLSearchParams();
            if (category) params.append('category', category);
            if (brand) params.append('brand', brand);
            if (minRating) params.append('minRating', minRating);
            if (maxRating) params.append('maxRating', maxRating);
            if (minDate) params.append('minDate', minDate);
            if (maxDate) params.append('maxDate', maxDate);
            if (sort) params.append('sort', sort);

            params.set('page', 0);

            window.location.href = `category.html?${params.toString()}`;
        });
    }

    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            const params = new URLSearchParams();
            if (initialCategory) params.set('category', initialCategory);
            params.set('page', 0);
            window.location.href = `category.html?${params.toString()}`;
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            const params = new URLSearchParams(window.location.search);
            params.set('sort', sortSelect.value);
            params.set('page', 0);
            window.location.href = `category.html?${params.toString()}`;
        });
    }

    populateFiltersFromURL();
}

function populateFiltersFromURL() {
    const params = new URLSearchParams(window.location.search);
    const map = {
        categorySelect: 'category',
        brandInput: 'brand',
        minRating: 'minRating',
        maxRating: 'maxRating',
        minDate: 'minDate',
        maxDate: 'maxDate',
        sortSelect: 'sort'
    };

    for (const [inputId, paramName] of Object.entries(map)) {
        const input = document.getElementById(inputId);
        if (input && params.has(paramName)) {
            input.value = params.get(paramName);
        }
    }
}
