/**
 * Модуль для управления каруселями устройств с настраиваемыми опциями
 */

// Приватные переменные модуля
let _carousels = new Map(); // Для хранения всех инициализированных каруселей

/**
 * Инициализирует карусель с гибкими настройками
 * @param {string} carouselId - ID элемента карусели
 * @param {Object} options - Опции карусели
 * @returns {Object} Объект с методами управления каруселью
 */
export function initCarousel(carouselId, options = {}) {
    const defaultOptions = {
        autoScroll: true,
        scrollInterval: 3000,
        enableDrag: true,
        enableWheel: true
    };

    // Объединяем дефолтные настройки с переданными
    const finalOptions = {...defaultOptions, ...options};

    const carousel = document.getElementById(carouselId);

    if (!carousel) {
        console.error(`Элемент карусели с ID "${carouselId}" не найден`);
        return null;
    }

    // Сохраняем состояние этой конкретной карусели
    const carouselState = {
        element: carousel,
        options: finalOptions,
        scrollInterval: null,
        isDragging: false,
        startX: 0,
        scrollLeft: 0,
        wheelTimeout: null
    };

    _carousels.set(carouselId, carouselState);

    // Запускаем автоскролл, если опция включена
    if (finalOptions.autoScroll) {
        startAutoScroll(carouselId);

        // Настраиваем обработчики событий для автоскролла
        carousel.addEventListener("mouseenter", () => stopAutoScroll(carouselId));
        carousel.addEventListener("mouseleave", () => {
            if (carouselState.options.autoScroll) {
                startAutoScroll(carouselId);
            }
        });
    }

    // Настраиваем обработчики событий для перетаскивания, если опция включена
    if (finalOptions.enableDrag) {
        carousel.addEventListener("mousedown", (e) => startDrag(e, carouselId));
        // Следующие обработчики применяем к документу, но с проверкой активной карусели
        document.addEventListener("mouseup", () => endDrag(carouselId));
        document.addEventListener("mousemove", (e) => drag(e, carouselId));

        // Отключаем стандартное поведение drag на изображениях внутри карусели
        carousel.querySelectorAll('img').forEach(img => {
            img.addEventListener('dragstart', (e) => e.preventDefault());
        });
    }

    // Настраиваем обработчик колесика мыши, если опция включена
    if (finalOptions.enableWheel) {
        carousel.addEventListener("wheel", (e) => handleWheel(e, carouselId));
    }

    // Добавляем класс для стилизации
    carousel.classList.add('draggable-carousel');

    // Возвращаем публичный интерфейс
    return {
        start: () => {
            if (carouselState.options.autoScroll) {
                startAutoScroll(carouselId);
            }
        },
        stop: () => stopAutoScroll(carouselId),
        scrollNext: () => scrollCarousel(carouselId, true),
        scrollPrev: () => scrollCarousel(carouselId, false),
        element: carousel,
        // Метод для обновления опций
        updateOptions: (newOptions) => {
            carouselState.options = {...carouselState.options, ...newOptions};
            // Если автоскролл отключен, останавливаем его
            if (!carouselState.options.autoScroll) {
                stopAutoScroll(carouselId);
            } else if (!carouselState.scrollInterval) {
                // Если автоскролл включен, но интервал не установлен, запускаем
                startAutoScroll(carouselId);
            }
            return carouselState.options;
        }
    };
}

/**
 * Запускает автоматическую прокрутку карусели
 * @param {string} carouselId - ID элемента карусели
 */
export function startAutoScroll(carouselId) {
    const carouselState = _carousels.get(carouselId);
    if (!carouselState || !carouselState.options.autoScroll) return;

    // Остановить предыдущий интервал, если он существует
    stopAutoScroll(carouselId);

    // Установить новый интервал
    carouselState.scrollInterval = setInterval(
        () => scrollCarousel(carouselId, true),
        carouselState.options.scrollInterval
    );
}

/**
 * Останавливает автоматическую прокрутку
 * @param {string} carouselId - ID элемента карусели
 */
export function stopAutoScroll(carouselId) {
    const carouselState = _carousels.get(carouselId);
    if (!carouselState) return;

    if (carouselState.scrollInterval) {
        clearInterval(carouselState.scrollInterval);
        carouselState.scrollInterval = null;
    }
}

/**
 * Прокручивает карусель
 * @param {string} carouselId - ID элемента карусели
 * @param {boolean} forward - Направление прокрутки (true - вперёд, false - назад)
 */
function scrollCarousel(carouselId, forward = true) {
    const carouselState = _carousels.get(carouselId);
    if (!carouselState) return;

    const carousel = carouselState.element;
    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    const isAtEnd = carousel.scrollLeft >= maxScroll - 10;
    const isAtStart = carousel.scrollLeft <= 10;

    let scrollAmount = 0;

    if (forward) {
        scrollAmount = isAtEnd ? -carousel.scrollLeft : 200;
    } else {
        scrollAmount = isAtStart ? maxScroll - carousel.scrollLeft : -200;
    }

    carousel.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
    });
}

/**
 * Обработчик события начала перетаскивания
 * @param {MouseEvent} e - Событие мыши
 * @param {string} carouselId - ID элемента карусели
 */
function startDrag(e, carouselId) {
    const carouselState = _carousels.get(carouselId);
    if (!carouselState || !carouselState.options.enableDrag) return;

    const carousel = carouselState.element;
    carouselState.isDragging = true;
    carouselState.startX = e.pageX - carousel.offsetLeft;
    carouselState.scrollLeft = carousel.scrollLeft;

    // Добавляем класс для изменения курсора
    carousel.classList.add('grabbing');

    // Если есть автоскролл, останавливаем его на время перетаскивания
    if (carouselState.options.autoScroll) {
        stopAutoScroll(carouselId);
    }
}

/**
 * Обработчик события окончания перетаскивания
 * @param {string} carouselId - ID элемента карусели
 */
function endDrag(carouselId) {
    const carouselState = _carousels.get(carouselId);
    if (!carouselState || !carouselState.isDragging) return;

    carouselState.isDragging = false;

    // Удаляем класс для возврата обычного курсора
    carouselState.element.classList.remove('grabbing');

    // Если карусель находится под курсором, не возобновляем автоскролл
    const isHovered = carouselState.element.matches(':hover');

    // Если есть автоскролл и карусель не под курсором, возобновляем автоскролл
    if (carouselState.options.autoScroll && !isHovered) {
        startAutoScroll(carouselId);
    }
}

/**
 * Обработчик события перетаскивания
 * @param {MouseEvent} e - Событие мыши
 * @param {string} carouselId - ID элемента карусели
 */
function drag(e, carouselId) {
    const carouselState = _carousels.get(carouselId);
    if (!carouselState || !carouselState.isDragging || !carouselState.options.enableDrag) return;

    e.preventDefault();
    const carousel = carouselState.element;
    const x = e.pageX - carousel.offsetLeft;
    const walk = (x - carouselState.startX) * 2; // Увеличенный коэффициент скорости
    carousel.scrollLeft = carouselState.scrollLeft - walk;
}

/**
 * Улучшенный обработчик события прокрутки колесиком мыши
 * @param {WheelEvent} e - Событие колесика мыши
 * @param {string} carouselId - ID элемента карусели
 */
/**
 * Улучшенный обработчик события прокрутки колесиком мыши
 * @param {WheelEvent} e - Событие колесика мыши
 * @param {string} carouselId - ID элемента карусели
 */
function handleWheel(e, carouselId) {
    const carouselState = _carousels.get(carouselId);
    if (!carouselState || !carouselState.options.enableWheel) return;

    e.preventDefault(); // Предотвращаем прокрутку страницы

    const carousel = carouselState.element;
    const now = Date.now();

    if (!carouselState.lastWheelTime) {
        carouselState.lastWheelTime = now;
    }

    const delta = now - carouselState.lastWheelTime;
    carouselState.lastWheelTime = now;

    // Определяем, плавно прокручивать или мгновенно
    const behavior = delta < 100 ? 'auto' : 'smooth';

    const scrollAmount = e.deltaY > 0 ? 300 : -300;

    carousel.scrollBy({
        left: scrollAmount,
        behavior
    });

    // Очищаем таймер восстановления автоскролла
    if (carouselState.wheelTimeout) {
        clearTimeout(carouselState.wheelTimeout);
    }

    if (carouselState.options.autoScroll) {
        stopAutoScroll(carouselId);
        carouselState.wheelTimeout = setTimeout(() => {
            if (!carousel.matches(':hover')) {
                startAutoScroll(carouselId);
            }
        }, 1500);
    }
}


/**
 * Инициализирует все карусели на странице с разными настройками
 */
export function initAllCarousels() {
    // Популярные устройства - полный функционал
    initCarousel("popularDevicesCarousel", {
        autoScroll: true,      // С автопрокруткой
        scrollInterval: 3000,  // Интервал 3 секунды
        enableDrag: true,      // С перетаскиванием
        enableWheel: true      // С прокруткой колесом
    });

    // Последние добавленные - без автопрокрутки
    initCarousel("latestDevices", {
        autoScroll: false,     // Без автопрокрутки
        enableDrag: true,      // С перетаскиванием
        enableWheel: true      // С прокруткой колесом
    });

    console.log("Все карусели инициализированы с разными настройками");
}