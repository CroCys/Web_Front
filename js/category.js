// 📁 category.js
import {renderPagination} from './pagination.js';

const PAGE_SIZE = 10;

async function loadCategoryItems(category, page = 0) {
    const container = document.getElementById("cards-container");
    const pagination = document.getElementById("pagination-container");
    if (!container || !pagination) return;

    container.innerHTML = "<p>Загрузка...</p>";
    pagination.innerHTML = "";

    try {
        const response = await fetch(`http://localhost:8080/api/devices/search?category=${category}&page=${page}&size=10`);
        if (!response.ok) throw new Error("Ошибка загрузки данных");

        const data = await response.json();
        const cards = data.content;
        const totalPages = data.page.totalPages;

        container.innerHTML = "";

        if (cards.length === 0) {
            container.innerHTML = "<p>Устройств в этой категории пока нет.</p>";
            return;
        }

        cards.forEach(card => {
            const cardElement = document.createElement("div");
            cardElement.className = "card";
            cardElement.innerHTML = `
                <div class="device-card">
                    <h3>${card.name}</h3>
                    <p><strong>Бренд:</strong> ${card.brand}</p>
                    <p>${card.description}</p>
                    <p><strong>Оценка:</strong> ${card.averageRating ?? 'Нет данных'}</p>
                    <p><strong>Дата выхода:</strong> ${new Date(card.releaseDate).toLocaleDateString()}</p>
                </div>
            `;
            container.appendChild(cardElement);
        });

        renderPagination(pagination, totalPages, page, category, loadCategoryItems);
    } catch (error) {
        console.error("Ошибка при загрузке карточек:", error);
        container.innerHTML = "<p>Произошла ошибка при загрузке устройств. Попробуйте позже.</p>";
    }
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
    }
}
