// Импортирование необходимых модулей
import {closeModal, openModal, setupModalClosing} from "./modal.js";
import {setupNavigation} from "./navigation.js";
import {fetchDevices} from "./api.js";
import {startAutoScroll} from "./carousel.js";

// Ожидание загрузки DOM
document.addEventListener("DOMContentLoaded", async () => {
    // Инициализация навигации и автопрокрутки
    setupNavigation();
    startAutoScroll();

    // Получение модальных окон и кнопок
    const loginModal = document.getElementById("loginModal");
    const registerModal = document.getElementById("registerModal");
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    const closeModalButtons = document.querySelectorAll(".close-modal");

    // Настройка закрытия модальных окон
    setupModalClosing(loginModal);
    setupModalClosing(registerModal);

    // Открытие модальных окон
    loginBtn.addEventListener("click", () => openModal(loginModal));
    registerBtn.addEventListener("click", () => openModal(registerModal));

    // Закрытие модальных окон по клику на кнопки закрытия
    closeModalButtons.forEach(button =>
        button.addEventListener("click", () => closeModal(button.closest(".modal")))
    );

    // Переключение между окнами авторизации и регистрации
    document.getElementById("switchToRegister").addEventListener("click", () => {
        closeModal(loginModal);
        openModal(registerModal);
    });

    document.getElementById("switchToLogin").addEventListener("click", () => {
        closeModal(registerModal);
        openModal(loginModal);
    });

    // Обработчики для форм входа и регистрации
    document.getElementById("loginForm").addEventListener("submit", (event) => handleLogin(event, closeModal, loginModal));
    document.getElementById("registerForm").addEventListener("submit", (event) => handleRegister(event, closeModal, registerModal));

    // Получение данных об устройствах
    const devices = await fetchDevices();

    if (devices.length > 0) {
        // Рендер популярных устройств, отсортированных по рейтингу
        renderDevices(
            devices.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0)).slice(0, 10),
            document.getElementById("popularDevicesCarousel")
        );

        // Сортировка последних устройств по ID (от большего к меньшему)
        const sortedLatestDevices = devices.sort((a, b) => b.id - a.id).slice(0, 10);

        // Рендер последних устройств
        renderDevices(
            sortedLatestDevices,
            document.getElementById("latestDevices")
        );
    } else {
        // Если устройств нет, выводим предупреждение в консоль
        console.warn("Нет устройств для отображения");
    }
});

// Функция для рендеринга карточек устройств
function renderDevices(devices, container) {
    if (!container) {
        console.error("Ошибка: контейнер не найден");
        return;
    }

    // Генерация HTML для каждой карточки устройства
    container.innerHTML = devices.map(device => `
        <div class="device-card">
            <img src="${device.images?.[0]?.url || '/images/noImage.png'}" alt="${device.name}" class="device-card-no-image">
            <h3>${device.name}</h3>
            <p>Бренд: ${device.brand}</p>
            <p>Релиз: ${device.releaseDate}</p>
            <p>Рейтинг: ${device.averageRating || 'Не указан'}</p>
        </div>
    `).join('');
}

document.addEventListener("DOMContentLoaded", function () {
    // Обработчик клика на категории
    const categoryCards = document.querySelectorAll(".category-card");

    categoryCards.forEach(card => {
        card.addEventListener("click", function () {
            const category = this.dataset.category;
            window.location.href = `storage.html?category=${category}`;
        });
    });

    // Данные карточек
    const cards = [
        { id: 1, category: "keyboards", title: "Клавиатура Logitech", description: "Механическая клавиатура" },
        { id: 2, category: "mice", title: "Мышь Razer", description: "Игровая мышь" },
        { id: 3, category: "microphones", title: "Микрофон Blue Yeti", description: "Студийный микрофон" },
        { id: 4, category: "headphones", title: "Наушники Sony", description: "Беспроводные наушники" }
    ];

    // Фильтрация карточек
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");

    console.log("Категория из URL:", category);

    let filteredCards = [];
    if (category) {
        filteredCards = cards.filter(card => card.category === category);
    } else {
        filteredCards = cards;
    }

    console.log("Отфильтрованные карточки:", filteredCards);

    // Отрисовка карточек
    renderCards(filteredCards);
});

// Функция отрисовки карточек
function renderCards(filteredCards) {
    const container = document.getElementById("cards-container");

    if (!container) {
        console.error("Ошибка: контейнер cards-container не найден!");
        return;
    }

    container.innerHTML = "";

    filteredCards.forEach(card => {
        const cardElement = document.createElement("div");
        cardElement.className = "card";
        cardElement.innerHTML = `
            <div class="device-card">
                <h3>${card.title}</h3>
                <p>${card.description}</p>
            </div>
        `;
        container.appendChild(cardElement);
    });

    console.log("Карточки успешно отрисованы!");
}


