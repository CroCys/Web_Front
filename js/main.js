// Импортирование необходимых модулей
import {closeModal, openModal, setupModalClosing} from "./modal.js";
import {setupNavigation} from "./navigation.js";
import {fetchDevices} from "./api.js";
import {startAutoScroll} from "./carousel.js";

// URL API
const API_BASE_URL = "http://localhost:8081/api"; // Заменить на свой backend url

// Ожидание загрузки DOM
document.addEventListener("DOMContentLoaded", async () => {
    setupNavigation();
    startAutoScroll();

    const loginModal = document.getElementById("loginModal");
    const registerModal = document.getElementById("registerModal");
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    const closeModalButtons = document.querySelectorAll(".close-modal");

    const userProfile = document.getElementById("userProfile");
    const usernameSpan = document.getElementById("username");
    const dropdownMenu = document.getElementById("dropdownMenu");
    const profileBtn = document.getElementById("profileBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    setupModalClosing(loginModal);
    setupModalClosing(registerModal);

    loginBtn.addEventListener("click", () => openModal(loginModal));
    registerBtn.addEventListener("click", () => openModal(registerModal));

    closeModalButtons.forEach(button =>
        button.addEventListener("click", () => closeModal(button.closest(".modal")))
    );

    document.getElementById("switchToRegister").addEventListener("click", () => {
        closeModal(loginModal);
        openModal(registerModal);
    });

    document.getElementById("switchToLogin").addEventListener("click", () => {
        closeModal(registerModal);
        openModal(loginModal);
    });

    document.getElementById("loginForm").addEventListener("submit", async (event) => {
        event.preventDefault();
        const form = event.target;
        const email = form.querySelector('input[type="email"]').value.trim();
        const password = form.querySelector('input[type="password"]').value.trim();

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, password})
            });

            if (!response.ok) throw new Error("Ошибка входа");

            const data = await response.json();
            localStorage.setItem("token", data.token);
            localStorage.setItem("nickname", data.nickname);
            localStorage.setItem("email", data.email)

            updateUIAfterAuth(data.nickname);
            closeModal(loginModal);
        } catch (error) {
            alert("Неверный email или пароль");
            console.error(error);
        }
    });

    document.getElementById("registerForm").addEventListener("submit", async (event) => {
        event.preventDefault();
        const form = event.target;
        const nickname = form.querySelector('input[type="text"]').value.trim();
        const email = form.querySelector('input[type="email"]').value.trim();
        const password = form.querySelector('input[type="password"]').value.trim();

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username: nickname, email, password})
            });

            if (!response.ok) throw new Error("Ошибка регистрации");

            alert("Регистрация успешна! Войдите в аккаунт.");
            closeModal(registerModal);
            openModal(loginModal);
        } catch (error) {
            alert("Ошибка регистрации");
            console.error(error);
        }
    });

    // Восстановление UI, если токен сохранён
    const token = localStorage.getItem("token");
    const savedUsername = localStorage.getItem("username");
    if (token && savedUsername) {
        updateUIAfterAuth(savedUsername);
    }

    document.getElementById("profilePageBtn")?.addEventListener("click", () => {
        window.location.href = "profile.html";
    });


    // Переключение dropdown профиля
    profileBtn?.addEventListener("click", (event) => {
        event.stopPropagation(); // не даём событию уйти вверх

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
        const isClickInside = userProfile.contains(event.target);
        if (!isClickInside) {
            dropdownMenu.style.display = "none";

            const icon = profileBtn.querySelector(".btn-icon");
            if (icon) {
                icon.classList.remove("rotated");
            }
        }
    });

    // Выход
    logoutBtn?.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        userProfile.style.display = "none";
        loginBtn.style.display = "inline-block";
        registerBtn.style.display = "inline-block";
    });

    // Получение устройств
    const devices = await fetchDevices();

    if (devices.length > 0) {
        renderDevices(
            devices.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0)).slice(0, 10),
            document.getElementById("popularDevicesCarousel")
        );

        const sortedLatestDevices = devices.sort((a, b) => b.id - a.id).slice(0, 10);

        renderDevices(
            sortedLatestDevices,
            document.getElementById("latestDevices")
        );
    } else {
        console.warn("Нет устройств для отображения");
    }
});

// Обновление интерфейса после авторизации
function updateUIAfterAuth(username) {
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    const userProfile = document.getElementById("userProfile");
    const usernameSpan = document.getElementById("username");

    loginBtn.style.display = "none";
    registerBtn.style.display = "none";
    userProfile.style.display = "flex";
    usernameSpan.textContent = username;
}

function renderDevices(devices, container) {
    if (!container) {
        console.error("Ошибка: контейнер не найден");
        return;
    }

    container.innerHTML = devices.map(device => `
        <div class="device-card">
            <img src="${device.images?.[0]?.url || '/images/noImage.png'}" class="device-card-no-image">
            <h3>${device.name}</h3>
            <p>Бренд: ${device.brand}</p>
            <p>Релиз: ${device.releaseDate}</p>
            <p>Рейтинг: ${device.averageRating || 'Не указан'}</p>
        </div>
    `).join('');
}

document.addEventListener("DOMContentLoaded", function () {
    const categoryCards = document.querySelectorAll(".category-card");

    categoryCards.forEach(card => {
        card.addEventListener("click", function () {
            const category = this.dataset.category;
            window.location.href = `storage.html?category=${category}`;
        });
    });

    const cards = [
        {id: 1, category: "keyboards", title: "Клавиатура Logitech", description: "Механическая клавиатура"},
        {id: 2, category: "mice", title: "Мышь Razer", description: "Игровая мышь"},
        {id: 3, category: "microphones", title: "Микрофон Blue Yeti", description: "Студийный микрофон"},
        {id: 4, category: "headphones", title: "Наушники Sony", description: "Беспроводные наушники"}
    ];

    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");

    let filteredCards = category ? cards.filter(card => card.category === category) : cards;
    renderCards(filteredCards);
});

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
}
