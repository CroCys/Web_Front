// 📁 category.js
import {renderPagination} from './pagination.js';

const PAGE_SIZE = 10;

async function loadCategoryItems(category, page = 0) {
    const container = document.getElementById("cards-container");
    const pagination = document.getElementById("pagination-container");
    const categoryTitle = document.getElementById("categoryTitle");

    if (!container || !pagination) return;

    // Update category title
    if (categoryTitle) {
        const categoryName = getCategoryDisplayName(category);
        categoryTitle.textContent = categoryName;
    }

    // Show loading state
    container.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Загрузка устройств...</p>
        </div>
    `;
    pagination.innerHTML = "";

    // Update select in the filters panel
    if (category) {
        const categorySelect = document.getElementById("categorySelect");
        if (categorySelect) {
            categorySelect.value = category;
        }
    }

    try {
        const response = await fetch(`http://localhost:8080/api/devices/search?category=${category}&page=${page}&size=${PAGE_SIZE}`);
        if (!response.ok) throw new Error("Ошибка загрузки данных");

        const data = await response.json();
        const cards = data.content;
        const totalPages = data.page.totalPages;

        container.innerHTML = "";

        if (cards.length === 0) {
            container.innerHTML = `
        <div class="empty-results">
            <i class="fas fa-search"></i>
            <p>Устройств в этой категории пока нет.</p>
        </div>
    `;

            // Скрываем пагинацию
            const paginationElement = document.querySelector('.pagination');
            if (paginationElement) {
                paginationElement.style.display = 'none';
            }

            return;
        }

        cards.forEach(card => {
            const cardElement = document.createElement("div");
            cardElement.className = "card";

            // Format release date
            const releaseDate = new Date(card.releaseDate);
            const formattedDate = releaseDate.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            // Convert 10-point rating to 5-point scale and format with stars
            const originalRating = card.averageRating ?? 0;
            const convertedRating = originalRating / 2; // Convert from 10-point to 5-point scale

            const fullStars = Math.floor(convertedRating);
            const halfStar = convertedRating % 1 >= 0.5;
            const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

            let stars = '';
            for (let i = 0; i < fullStars; i++) {
                stars += '<i class="fas fa-star"></i>';
            }
            if (halfStar) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            }
            for (let i = 0; i < emptyStars; i++) {
                stars += '<i class="far fa-star"></i>';
            }

            cardElement.innerHTML = `
        <div class="category-device-card">
            <h3>${card.name}</h3>
            <p><strong>Бренд:</strong> ${card.brand}</p>
            <p>${card.description}</p>
            <p><strong>Дата выхода:</strong> ${formattedDate}</p>
            <p class="device-rating">
                <strong>Оценка:</strong> 
                ${originalRating ? `<span>${convertedRating.toFixed(1)}</span> <span class="rating-stars">${stars}</span>` : 'Нет данных'}
            </p>
        </div>
    `;

            cardElement.addEventListener("click", () => {
                // Navigate to device details page
                window.location.href = `device.html?id=${card.id}`;
            });

            container.appendChild(cardElement);
        });

        renderPagination(pagination, totalPages, page, category, loadCategoryItems);
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

// Helper function to get user-friendly category name
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
        loadCategoryItems(category);
    } else {
        // If no category specified, load all devices
        loadCategoryItems('');
    }

    // Setup filter and sort functionality
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

            // Create query params
            const params = new URLSearchParams();
            if (category) params.append('category', category);
            if (brand) params.append('brand', brand);
            if (minRating) params.append('minRating', minRating);
            if (maxRating) params.append('maxRating', maxRating);
            if (minDate) params.append('minDate', minDate);
            if (maxDate) params.append('maxDate', maxDate);

            // Apply filters (in real application, you would fetch filtered results)
            // For now, we'll just update the URL
            window.location.href = `category.html?${params.toString()}`;
        });
    }

    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            // Reset all filter inputs
            document.getElementById('categorySelect').value = initialCategory || '';
            document.getElementById('brandInput').value = '';
            document.getElementById('minRating').value = '';
            document.getElementById('maxRating').value = '';
            document.getElementById('minDate').value = '';
            document.getElementById('maxDate').value = '';
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            const params = new URLSearchParams(window.location.search);
            params.set('sort', sortSelect.value);

            // Apply sorting (in real application, you would fetch sorted results)
            // For now, we'll just update the URL
            window.location.href = `category.html?${params.toString()}`;
        });
    }
}