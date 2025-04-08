/**
 * Модуль для управления каруселью устройств
 */

// Приватные переменные модуля
let _scrollInterval = null;
let _carouselElement = null;

/**
 * Инициализирует карусель
 * @param {string} carouselId - ID элемента карусели
 * @param {number} scrollInterval - Интервал автоскролла в мс (по умолчанию 3000)
 * @returns {Object} Объект с методами управления каруселью
 */
export function initCarousel(carouselId = "popularDevicesCarousel", scrollInterval = 3000) {
    const carousel = document.getElementById(carouselId);

    if (!carousel) {
        console.error(`Элемент карусели с ID "${carouselId}" не найден`);
        return null;
    }

    _carouselElement = carousel;

    // Запускаем автоскролл
    startAutoScroll(scrollInterval);

    // Настраиваем обработчики событий
    carousel.addEventListener("mouseenter", stopAutoScroll);
    carousel.addEventListener("mouseleave", () => startAutoScroll(scrollInterval));

    // Возвращаем публичный интерфейс
    return {
        start: () => startAutoScroll(scrollInterval),
        stop: stopAutoScroll,
        scrollNext: () => scrollCarousel(true),
        scrollPrev: () => scrollCarousel(false),
        element: carousel
    };
}

/**
 * Запускает автоматическую прокрутку карусели
 * @param {number} interval - Интервал между прокрутками в мс
 */
export function startAutoScroll(interval = 3000) {
    // Остановить предыдущий интервал, если он существует
    stopAutoScroll();

    // Установить новый интервал
    _scrollInterval = setInterval(() => scrollCarousel(true), interval);
}

/**
 * Останавливает автоматическую прокрутку
 */
export function stopAutoScroll() {
    if (_scrollInterval) {
        clearInterval(_scrollInterval);
        _scrollInterval = null;
    }
}

/**
 * Прокручивает карусель
 * @param {boolean} forward - Направление прокрутки (true - вперёд, false - назад)
 */
function scrollCarousel(forward = true) {
    if (!_carouselElement) return;

    const maxScroll = _carouselElement.scrollWidth - _carouselElement.clientWidth;
    const isAtEnd = _carouselElement.scrollLeft >= maxScroll - 10;
    const isAtStart = _carouselElement.scrollLeft <= 10;

    let scrollAmount = 0;

    if (forward) {
        scrollAmount = isAtEnd ? -_carouselElement.scrollLeft : 200;
    } else {
        scrollAmount = isAtStart ? maxScroll - _carouselElement.scrollLeft : -200;
    }

    _carouselElement.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
    });
}
