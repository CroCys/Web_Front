/**
 * Основной модуль приложения
 */
import {closeModal, openModal, setupModalClosing} from './modal.js';
import {setupNavigation} from './navigation.js';
import {fetchDevices} from './api.js';
import {initCarousel} from './carousel.js';
import {Auth, updateUIAfterAuth} from './auth.js';
import {DeviceRenderer} from './device-renderer.js';
import {showToast} from "./toast.js";

// Конфигурация приложения
const APP_CONFIG = {
    API_BASE_URL: "http://localhost:8081/api"
};

/**
 * Класс приложения
 */
class App {
    constructor() {
        this.deviceRenderer = new DeviceRenderer();
        this.init();
    }

    /**
     * Инициализирует приложение
     */
    async init() {
        // Настраиваем навигацию
        setupNavigation();

        // Инициализируем карусель
        initCarousel("popularDevicesCarousel", {
            autoScroll: true,
            scrollInterval: 3000,
            enableDrag: true,
            enableWheel: true
        });

        initCarousel("latestDevices", {
            autoScroll: false,
            enableDrag: true,
            enableWheel: true
        });

        // Настраиваем работу с модальными окнами
        this.setupModals();

        // Настраиваем аутентификацию
        this.setupAuth();

        // Загружаем данные устройств
        await this.loadDevices();

        // Настраиваем категории
        this.setupCategories();
    }

    /**
     * Настраивает модальные окна
     */
    setupModals() {
        const loginModal = document.getElementById("loginModal");
        const registerModal = document.getElementById("registerModal");
        const loginBtn = document.getElementById("loginBtn");
        const registerBtn = document.getElementById("registerBtn");
        const closeModalButtons = document.querySelectorAll(".close-modal");

        if (loginModal && registerModal) {
            setupModalClosing(loginModal);
            setupModalClosing(registerModal);

            if (loginBtn) loginBtn.addEventListener("click", () => openModal(loginModal));
            if (registerBtn) registerBtn.addEventListener("click", () => openModal(registerModal));

            closeModalButtons.forEach(button => {
                button.addEventListener("click", () => closeModal(button.closest(".modal")));
            });

            // Переключение между модальными окнами
            const switchToRegister = document.getElementById("switchToRegister");
            const switchToLogin = document.getElementById("switchToLogin");

            if (switchToRegister) {
                switchToRegister.addEventListener("click", () => {
                    closeModal(loginModal);
                    openModal(registerModal);
                });
            }

            if (switchToLogin) {
                switchToLogin.addEventListener("click", () => {
                    closeModal(registerModal);
                    openModal(loginModal);
                });
            }
        }
    }

    /**
     * Настраивает аутентификацию
     */
    setupAuth() {
        // Восстанавливаем состояние авторизации
        const userData = Auth.getCurrentUser();
        if (userData) {
            updateUIAfterAuth(userData.nickname);
        }

        // Настраиваем форму входа
        const loginForm = document.getElementById("loginForm");
        if (loginForm) {
            loginForm.addEventListener("submit", this.handleLogin.bind(this));
        }

        // Настраиваем форму регистрации
        const registerForm = document.getElementById("registerForm");
        if (registerForm) {
            registerForm.addEventListener("submit", this.handleRegister.bind(this));
        }

        // Настраиваем профиль пользователя
        this.setupUserProfile();
    }

    /**
     * Обрабатывает отправку формы входа
     * @param {Event} event - Событие отправки формы
     */
    async handleLogin(event) {
        event.preventDefault();

        const form = event.target;
        const email = form.querySelector('input[type="email"]').value.trim();
        const password = form.querySelector('input[type="password"]').value.trim();

        try {
            const userData = await Auth.login(email, password);
            updateUIAfterAuth(userData.nickname);
            closeModal(document.getElementById("loginModal"));
            showToast("Вы успешно вошли", "success")
        } catch (error) {
            showToast("Неверный email или пароль", "error");
            console.error("Ошибка входа:", error);
        }
    }

    /**
     * Обрабатывает отправку формы регистрации
     * @param {Event} event - Событие отправки формы
     */
    async handleRegister(event) {
        event.preventDefault();

        const form = event.target;
        const nickname = form.querySelector('input[name="nickname"]').value.trim();  // Получаем никнейм
        const email = form.querySelector('input[name="email"]').value.trim();        // Получаем email
        const password = form.querySelector('input[name="password"]').value.trim();  // Получаем пароль

        try {
            await Auth.register(nickname, email, password);  // Передаем значения в функцию регистрации
            showToast("Регистрация успешна", "success")
            closeModal(document.getElementById("registerModal"));
            openModal(document.getElementById("loginModal"));

            const loginForm = document.querySelector("#loginModal form");
            loginForm.querySelector('input[type="email"]').value = email;
            loginForm.querySelector('input[type="password"]').value = password;
        } catch (error) {
            showToast("Ошибка регистрации", "error")
            console.error("Ошибка регистрации:", error);
        }
    }

    /**
     * Настраивает работу с профилем пользователя
     */
    setupUserProfile() {
        const userProfile = document.getElementById("userProfile");
        const profileBtn = document.getElementById("profileBtn");
        const dropdownMenu = document.getElementById("dropdownMenu");
        const logoutBtn = document.getElementById("logoutBtn");
        const profilePageBtn = document.getElementById("profilePageBtn");

        if (profileBtn && dropdownMenu) {
            // Переключение dropdown профиля
            profileBtn.addEventListener("click", (event) => {
                event.stopPropagation();

                const isVisible = dropdownMenu.style.display === "block";
                dropdownMenu.style.display = isVisible ? "none" : "block";

                // Поворачиваем иконку
                const icon = profileBtn.querySelector(".btn-icon");
                if (icon) {
                    icon.classList.toggle("rotated", !isVisible);
                }
            });

            // Закрытие при клике вне
            document.addEventListener("click", (event) => {
                if (userProfile && !userProfile.contains(event.target)) {
                    dropdownMenu.style.display = "none";

                    const icon = profileBtn.querySelector(".btn-icon");
                    if (icon) {
                        icon.classList.remove("rotated");
                    }
                }
            });
        }

        if (logoutBtn) {
            // Выход из аккаунта
            logoutBtn.addEventListener("click", () => {
                Auth.logout(() => {
                    const loginBtn = document.getElementById("loginBtn");
                    const registerBtn = document.getElementById("registerBtn");

                    if (userProfile) userProfile.style.display = "none";
                    if (loginBtn) loginBtn.style.display = "inline-block";
                    if (registerBtn) registerBtn.style.display = "inline-block";

                    // Добавляем редирект после выхода
                    window.location.href = "index.html"; // Перенаправление на главную страницу
                });
            });
        }

        if (profilePageBtn) {
            // Переход на страницу профиля
            profilePageBtn.addEventListener("click", () => {
                window.location.href = "profile.html";
            });
        }
    }

    /**
     * Загружает и отображает устройства
     */
    async loadDevices() {
        try {
            const devices = await fetchDevices();

            if (devices.length > 0) {
                // Отображаем популярные устройства (сортировка по рейтингу)
                const popularDevices = [...devices]
                    .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
                    .slice(0, 10);

                const popularCarousel = document.getElementById("popularDevicesCarousel");
                if (popularCarousel) {
                    this.deviceRenderer.renderDevices(popularDevices, popularCarousel, (device) => {
                        // Обработчик клика по устройству
                        window.location.href = `device.html?id=${device.id}`; 
                    });
                }

                // Отображаем последние добавленные устройства
                const latestDevices = [...devices]
                    .sort((a, b) => b.id - a.id)
                    .slice(0, 10);

                const latestContainer = document.getElementById("latestDevices");
                if (latestContainer) {
                    this.deviceRenderer.renderDevices(latestDevices, latestContainer, (device) => {
                        window.location.href = `device.html?id=${device.id}`;
                    });
                }
            } else {
                console.warn("Нет устройств для отображения");
            }
        } catch (error) {
            console.error("Ошибка при загрузке устройств:", error);
        }
    }

    /**
     * Настраивает работу с категориями
     */
    setupCategories() {
        const categoryCards = document.querySelectorAll(".category-card");

        categoryCards.forEach(card => {
            card.addEventListener("click", function () {
                const category = this.dataset.category;
                window.location.href = `storage.html?category=${category}`;
            });
        });

        // Обработка параметров URL для фильтрации по категории
        const params = new URLSearchParams(window.location.search);
        const category = params.get("category");

        if (category) {
            this.loadCategoryItems(category);
        }
    }

    /**
     * Загружает элементы выбранной категории
     * @param {string} category - Идентификатор категории
     */
    loadCategoryItems(category) {
        // Пример данных карточек
        const cards = [
            {id: 1, category: "keyboards", title: "Клавиатура Logitech", description: "Механическая клавиатура"},
            {id: 2, category: "mice", title: "Мышь Razer", description: "Игровая мышь"},
            {id: 3, category: "microphones", title: "Микрофон Blue Yeti", description: "Студийный микрофон"},
            {id: 4, category: "headphones", title: "Наушники Sony", description: "Беспроводные наушники"}
        ];

        // Фильтрация карточек по категории
        const filteredCards = category ? cards.filter(card => card.category === category) : cards;

        // Рендеринг карточек
        const container = document.getElementById("cards-container");
        if (container) {
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
        }
    }
}

// Инициализация приложения при загрузке DOM
document.addEventListener("DOMContentLoaded", () => {
    new App();
});
