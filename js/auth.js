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
    // Private storage helper
    static #getStorageItem(key) {
        return localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS[key]);
    }

    static #setStorageItem(key, value) {
        if (value === null || value === undefined) {
            return this.#removeStorageItem(key);
        }
        return localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS[key], value);
    }

    static #removeStorageItem(key) {
        return localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS[key]);
    }

    static #dispatchAuthEvent(type, data = {}) {
        const event = new CustomEvent(`auth_change`, {
            detail: { type, ...data }
        });
        window.dispatchEvent(event);
    }

    /**
     * Проверяет, авторизован ли пользователь
     * @returns {boolean} Статус авторизации
     */
    static isAuthenticated() {
        return !!this.#getStorageItem('TOKEN');
    }

    /**
     * Получает данные текущего пользователя из хранилища
     * @returns {Object|null} Данные пользователя или null
     */
    static getCurrentUser() {
        if (!this.isAuthenticated()) return null;

        return {
            token: this.#getStorageItem('TOKEN'),
            refreshToken: this.#getStorageItem('REFRESH_TOKEN'),
            nickname: this.#getStorageItem('NICKNAME'),
            email: this.#getStorageItem('EMAIL'),
            avatar: this.#getStorageItem('AVATAR')
        };
    }

    /**
     * Обновляет данные пользователя в хранилище
     * @param {Object} userData - Данные пользователя для обновления
     */
    static updateUserData(userData) {
        if (userData?.token) {
            this.#setStorageItem('TOKEN', userData.token);
        }
        if (userData?.refreshToken) {
            this.#setStorageItem('REFRESH_TOKEN', userData.refreshToken);
        }
        if (userData?.nickname) {
            this.#setStorageItem('NICKNAME', userData.nickname);
        }
        if (userData?.email) {
            this.#setStorageItem('EMAIL', userData.email);
        }
        if (userData?.avatar) {
            this.#setStorageItem('AVATAR', userData.avatar);
        }
        
        this.#dispatchAuthEvent('update', { user: this.getCurrentUser() });
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
            this.updateUserData(userData);
            this.#dispatchAuthEvent('login', { user: this.getCurrentUser() });

            return userData;
        } catch (error) {
            console.error("Ошибка авторизации:", error);
            this.#dispatchAuthEvent('login_error', { error: error.message });
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

            const userData = await response.json();
            
            // Сохраняем данные в localStorage
            this.updateUserData(userData);
            this.#dispatchAuthEvent('register', { user: this.getCurrentUser() });

            return userData;
        } catch (error) {
            console.error("Ошибка регистрации:", error);
            this.#dispatchAuthEvent('register_error', { error: error.message });
            throw error;
        }
    }

    /**
     * Выход пользователя
     * @param {Function} callback - Функция обратного вызова после выхода
     */
    static logout(callback) {
        // Очищаем данные аутентификации
        this.#removeStorageItem('TOKEN');
        this.#removeStorageItem('REFRESH_TOKEN');
        this.#removeStorageItem('NICKNAME');
        this.#removeStorageItem('EMAIL');
        
        this.#dispatchAuthEvent('logout');

        if (typeof callback === 'function') {
            callback();
        }
    }

    /**
     * Обновляет никнейм пользователя
     * @param {string} nickname - Новый никнейм
     */
    static updateNickname(nickname) {
        this.#setStorageItem('NICKNAME', nickname);
        this.#dispatchAuthEvent('nickname_update', { nickname });
    }

    /**
     * Обновляет аватар пользователя
     * @param {string} avatarDataUrl - URL данных аватара (base64)
     */
    static updateAvatar(avatarDataUrl) {
        this.#setStorageItem('AVATAR', avatarDataUrl);
        this.#dispatchAuthEvent('avatar_update', { avatar: avatarDataUrl });
    }

    /**
     * Обновляет данные профиля пользователя на сервере
     * @param {Object} profileData - Данные для обновления профиля
     * @returns {Promise<Object>} Результат обновления
     */
    static async updateProfile(profileData) {
        const token = this.#getStorageItem('TOKEN');
        if (!token) {
            throw new Error('Пользователь не авторизован');
        }

        try {
            const response = await fetch(`${AUTH_CONFIG.BASE_URL}/update`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Ошибка обновления профиля");
            }

            const updatedData = await response.json();
            this.updateUserData(updatedData);
            
            return updatedData;
        } catch (error) {
            console.error("Ошибка обновления профиля:", error);
            throw error;
        }
    }

    /**
     * Обновляет токен доступа с использованием refresh token
     * @returns {Promise<string|null>} Новый токен доступа или null
     */
    static async refreshAccessToken() {
        const refreshToken = this.#getStorageItem('REFRESH_TOKEN');
        if (!refreshToken) {
            return null;
        }

        try {
            const response = await fetch(`${AUTH_CONFIG.BASE_URL}/refresh`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${refreshToken}`
                }
            });

            if (!response.ok) {
                throw new Error("Не удалось обновить токен");
            }

            const data = await response.json();
            this.updateUserData(data);
            
            this.#dispatchAuthEvent('token_refresh', { 
                newToken: data.token 
            });
                
            return data.token;
        } catch (error) {
            console.error("Ошибка обновления токена:", error);
            return null;
        }
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
