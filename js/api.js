/**
 * API модуль для работы с серверными данными
 */

// Константы
const API_CONFIG = {
    BASE_URL: "http://localhost:8080/api",
    ENDPOINTS: {
        ALL_DEVICES: "/devices/getAll",
        GET_DEVICE_BY_ID: "/devices/getById",
    }
};

/**
 * Выполняет запрос к API
 * @param {string} endpoint - Конечная точка API
 * @param {Object} options - Опции запроса
 * @param {boolean} isAuth - Требуется ли аутентификация для запроса
 * @returns {Promise<any>} Результат запроса в формате JSON
 * @throws {Error} Ошибка при неудачном запросе
 */
async function fetchAPI(endpoint, options = {}, isAuth = false) {
    try {
        const headers = {
            "Content-Type": "application/json",
            ...options.headers
        };

        if (isAuth) {
            const token = localStorage.getItem("token");
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }
        }

        const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        // Добавляем обработку 401 ошибки
        if (response.status === 401) {
            const authEvent = new CustomEvent("auth_required");
            window.dispatchEvent(authEvent);
            throw new Error("Требуется авторизация");
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `Ошибка запроса: ${response.status} ${response.statusText}`);
        }

        return data;
    } catch (error) {
        console.error(`Ошибка API (${endpoint}):`, error);
        throw error;
    }
}

/**
 * Получает список всех устройств
 * @returns {Promise<Array>} Массив устройств
 */
export async function fetchDevices() {
    try {
        const data = await fetchAPI(API_CONFIG.ENDPOINTS.ALL_DEVICES);
        return data.content || [];
    } catch (error) {
        throw error;
    }
}

/**
 * Получает устройство по ID
 * @param {number} id - ID устройства
 * @returns {Promise<Object|null>} Данные устройства или null при ошибке
 */
export async function fetchDeviceById(id) {
    try {
        const endpoint = `${API_CONFIG.ENDPOINTS.GET_DEVICE_BY_ID}/${id}`;
        return await fetchAPI(endpoint);
    } catch (error) {
        throw error;
    }
}

/**
 * Получает устройства с поддержкой фильтров
 * @param {Object} filters - Объект с фильтрами для запроса
 * @returns {Promise<Array>} Массив устройств
 */
export async function fetchDevicesWithFilters(filters = {}) {
    try {
        const searchParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, value);
            }
        });

        const endpoint = `${API_CONFIG.ENDPOINTS.ALL_DEVICES}?${searchParams.toString()}`;
        const data = await fetchAPI(endpoint);
        return data.content || [];
    } catch (error) {
        throw error;
    }
}
