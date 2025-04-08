/**
 * API модуль для работы с серверными данными
 */

// Константы
const API_CONFIG = {
    BASE_URL: "http://localhost:8080/api",
    ENDPOINTS: {
        DEVICES: "/devices/getAll"
    }
};

/**
 * Выполняет запрос к API
 * @param {string} endpoint - Конечная точка API
 * @param {Object} options - Опции запроса
 * @returns {Promise<any>} Результат запроса в формате JSON
 * @throws {Error} Ошибка при неудачном запросе
 */
async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, options);

        if (!response.ok) {
            throw new Error(`Ошибка запроса: ${response.status} ${response.statusText}`);
        }

        return await response.json();
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
        const data = await fetchAPI(API_CONFIG.ENDPOINTS.DEVICES);
        return data.content || [];
    } catch (error) {
        console.error("Не удалось получить устройства:", error);
        return [];
    }
}

/**
 * Получает устройство по ID
 * @param {number} id - ID устройства
 * @returns {Promise<Object|null>} Данные устройства или null при ошибке
 */
export async function fetchDeviceById(id) {
    try {
        const endpoint = `${API_CONFIG.ENDPOINTS.DEVICES}/${id}`;
        return await fetchAPI(endpoint);
    } catch (error) {
        console.error(`Не удалось получить устройство (ID: ${id}):`, error);
        return null;
    }
}
