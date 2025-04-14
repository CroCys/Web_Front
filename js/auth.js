/**
 * Модуль для управления аутентификацией пользователей
 */

// Конфигурация API
const AUTH_CONFIG = {
    BASE_URL: "http://localhost:8081/api/auth",
    ENDPOINTS: {
        LOGIN: "/login",
        REGISTER: "/register",
    },
    STORAGE_KEYS: {
        TOKEN: "token",
        NICKNAME: "nickname",
        EMAIL: "email",
        AVATAR: "avatar"
    }
};

/**
 * Класс для управления аутентификацией
 */
export class Auth {
    /**
     * Проверяет, авторизован ли пользователь
     * @returns {boolean} Статус авторизации
     */
    static isAuthenticated() {
        return !!localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN);
    }

    /**
     * Получает данные текущего пользователя из хранилища
     * @returns {Object|null} Данные пользователя или null
     */
    static getCurrentUser() {
        if (!this.isAuthenticated()) return null;

        return {
            token: localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN),
            nickname: localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.NICKNAME),
            email: localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.EMAIL),
            avatar: localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.AVATAR)
        };
    }

    /**
     * Выполняет вход пользователя
     * @param {string} email - Email пользователя
     * @param {string} password - Пароль пользователя
     * @returns {Promise<Object>} Данные пользователя
     */
    static async login(email, password) {
        try {
            const response = await fetch(`${AUTH_CONFIG.BASE_URL}${AUTH_CONFIG.ENDPOINTS.LOGIN}`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, password})
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Ошибка входа");
            }

            const userData = await response.json();

            // Сохраняем данные в localStorage
            localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN, userData.token);
            localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.NICKNAME, userData.nickname);
            localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.EMAIL, userData.email);

            return userData;
        } catch (error) {
            console.error("Ошибка авторизации:", error);
            throw error;
        }
    }

    /**
     * Регистрирует нового пользователя
     * @param {string} nickname - Никнейм пользователя
     * @param {string} email - Email пользователя
     * @param {string} password - Пароль пользователя
     * @returns {Promise<Object>} Результат регистрации
     */
    static async register(nickname, email, password) {
        try {
            const response = await fetch(`${AUTH_CONFIG.BASE_URL}${AUTH_CONFIG.ENDPOINTS.REGISTER}`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({nickname, email, password})
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Ошибка регистрации");
            }

            return await response.json();
        } catch (error) {
            console.error("Ошибка регистрации:", error);
            throw error;
        }
    }

    /**
     * Выход пользователя
     * @param {Function} callback - Функция обратного вызова после выхода
     */
    static logout(callback) {
        // Удаляем данные из localStorage
        localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN);
        localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.NICKNAME);
        localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.EMAIL);

        // Сохраняем аватар (опционально)
        // localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.AVATAR);

        if (typeof callback === 'function') {
            callback();
        }
    }

    /**
     * Обновляет никнейм пользователя
     * @param {string} nickname - Новый никнейм
     */
    static updateNickname(nickname) {
        localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.NICKNAME, nickname);
    }

    /**
     * Обновляет аватар пользователя
     * @param {string} avatarDataUrl - URL данных аватара (base64)
     */
    static updateAvatar(avatarDataUrl) {
        localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.AVATAR, avatarDataUrl);
    }
}

/**
 * Обновляет элементы интерфейса после авторизации
 * @param {string} username - Имя пользователя для отображения
 */
export function updateUIAfterAuth(username) {
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    const userProfile = document.getElementById("userProfile");
    const usernameSpan = document.getElementById("username");

    if (loginBtn) loginBtn.style.display = "none";
    if (registerBtn) registerBtn.style.display = "none";
    if (userProfile) userProfile.style.display = "flex";
    if (usernameSpan) usernameSpan.textContent = username;
}
