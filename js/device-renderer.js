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
        card.className = 'device-card no-select'; // запрещаем выделение текста
        card.dataset.id = device.id;

        const imageUrl = device.images?.length > 0 && device.images[0]?.url
            ? device.images[0].url
            : this.defaultImageUrl;

        // Создаём IMG вручную, чтобы отключить drag
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = device.name;
        img.className = 'device-card-image no-drag';
        img.onerror = () => img.src = this.defaultImageUrl;
        img.setAttribute('draggable', 'false'); // запрет на drag

        // Заголовок
        const title = document.createElement('h3');
        title.className = 'device-card-title';
        title.textContent = this.escapeHtml(device.name);

        // Инфо-блок
        const info = document.createElement('div');
        info.className = 'device-card-info';
        info.innerHTML = `
        <p>Бренд: ${this.escapeHtml(device.brand || 'Не указан')}</p>
        <p>Релиз: ${this.formatDate(device.releaseDate)}</p>
        <p>Рейтинг: ${this.formatRating(device.averageRating)}</p>
    `;

        // Собираем всё в карточку
        card.appendChild(img);
        card.appendChild(title);
        card.appendChild(info);

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
        return `${formattedRating} / 10.0`;
    }
}

/**
 * Создаёт экземпляр рендерера устройств с настройками по умолчанию
 * @returns {DeviceRenderer} Экземпляр рендерера
 */
export const createDeviceRenderer = () => new DeviceRenderer();
