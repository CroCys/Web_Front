// Базовый URL для API, откуда будем загружать данные устройств
const apiUrl = "http://localhost:8080/api/devices/getAll";

// Асинхронная функция для получения устройств с сервера
export async function fetchDevices() {
    try {
        // Выполняем запрос к API для получения данных
        const response = await fetch(apiUrl);

        // Проверяем успешность запроса (status 200-299)
        if (!response.ok) throw new Error("Ошибка загрузки данных");

        // Преобразуем ответ в JSON
        const data = await response.json();

        // Возвращаем данные устройств (если они есть), иначе возвращаем пустой массив
        return data.content || [];
    } catch (error) {
        // Логируем ошибку, если что-то пошло не так
        console.error("Ошибка:", error);

        // Возвращаем пустой массив в случае ошибки
        return [];
    }
}
