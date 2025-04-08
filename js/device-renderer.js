/**
 * Модуль для рендеринга устройств и карточек
 */

/**
 * Класс для рендеринга устройств
 */
export class DeviceRenderer {
    /**
     * @param {Object} options - Опции рендерера
     * @param {string} options.defaultImageUrl - URL изображения по умолчанию
     */
    constructor({defaultImageUrl = '/images/noImage.png'} = {}) {
        this.defaultImageUrl = defaultImageUrl;
    }

    /**
     * Рендерит устройства в указанный контейнер
     * @param {Array} devices - Массив устройств для отображения
     * @param {HTMLElement|string} container - Контейнер или его ID
     * @param {Function} onClick - Обработчик клика по карточке (опционально)
     */
    renderDevices(devices, container, onClick = null) {
        const containerElement = typeof container === 'string'
            ? document.getElementById(container)
            : container;

        if (!containerElement) {
            console.error("Контейнер для рендеринга устройств не найден");
            return;
        }

        // Очищаем контейнер перед рендерингом
        containerElement.innerHTML = '';

        // Проверяем наличие устройств
        if (!devices || devices.length === 0) {
            containerElement.innerHTML = '<div class="no-devices">Устройства не найдены</div>';
            return;
        }

        // Создаём карточки для каждого устройства
        devices.forEach(device => {
            const card = this.createDeviceCard(device);

            // Добавляем обработчик клика, если он предоставлен
            if (typeof onClick === 'function') {
                card.addEventListener('click', () => onClick(device));
            }

            containerElement.appendChild(card);
        });
    }

    /**
     * Создаёт HTML-элемент карточки устройства
     * @param {Object} device - Данные устройства
     * @returns {HTMLElement} Элемент карточки
     */
    createDeviceCard(device) {
        const card = document.createElement('div');
        card.className = 'device-card';
        card.dataset.id = device.id;

        // Получаем URL изображения
        const imageUrl = device.images?.length > 0 && device.images[0]?.url
            ? device.images[0].url
            : this.defaultImageUrl;

        // Формируем HTML содержимое карточки
        card.innerHTML = `
      <img src="${imageUrl}" class="device-card-image" alt="${device.name}" 
           onerror="this.src='${this.defaultImageUrl}'">
      <h3 class="device-card-title">${this.escapeHtml(device.name)}</h3>
      <div class="device-card-info">
        <p>Бренд: ${this.escapeHtml(device.brand || 'Не указан')}</p>
        <p>Релиз: ${this.formatDate(device.releaseDate)}</p>
        <p>Рейтинг: ${this.formatRating(device.averageRating)}</p>
      </div>
    `;

        return card;
    }

    /**
     * Рендерит список категорий
     * @param {Array} categories - Массив категорий
     * @param {HTMLElement|string} container - Контейнер или его ID
     * @param {Function} onClick - Обработчик клика по категории
     */
    renderCategories(categories, container, onClick) {
        const containerElement = typeof container === 'string'
            ? document.getElementById(container)
            : container;

        if (!containerElement) {
            console.error("Контейнер для рендеринга категорий не найден");
            return;
        }

        containerElement.innerHTML = '';

        categories.forEach(category => {
            const card = document.createElement('div');
            card.className = 'category-card';
            card.dataset.category = category.id;

            card.innerHTML = `
        <div class="category-icon">${category.icon || ''}</div>
        <h3>${this.escapeHtml(category.name)}</h3>
        <p>${this.escapeHtml(category.description || '')}</p>
      `;

            if (typeof onClick === 'function') {
                card.addEventListener('click', () => onClick(category));
            }

            containerElement.appendChild(card);
        });
    }

    /**
     * Экранирует HTML-специальные символы
     * @param {string} text - Исходный текст
     * @returns {string} Экранированный текст
     */
    escapeHtml(text) {
        if (!text) return '';

        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };

        return text.toString().replace(/[&<>"']/g, m => map[m]);
    }

    /**
     * Форматирует дату
     * @param {string} dateString - Строка с датой
     * @returns {string} Отформатированная дата
     */
    formatDate(dateString) {
        if (!dateString) return 'Не указана';

        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    }

    /**
     * Форматирует рейтинг
     * @param {number} rating - Значение рейтинга
     * @returns {string} Отформатированный рейтинг
     */
    formatRating(rating) {
        if (!rating && rating !== 0) return 'Не указан';

        // Округляем до одного десятичного знака
        const formattedRating = parseFloat(rating).toFixed(1);
        return `${formattedRating} / 5.0`;
    }
}

/**
 * Создаёт экземпляр рендерера устройств с настройками по умолчанию
 * @returns {DeviceRenderer} Экземпляр рендерера
 */
export const createDeviceRenderer = () => new DeviceRenderer();
