/**
 * Модуль для работы с модальными окнами
 */

const ANIMATION_DURATION = 300; // мс

/**
 * Класс для управления модальными окнами
 */
export class Modal {
    /**
     * @param {HTMLElement|string} modal - Элемент модального окна или его ID
     */
    constructor(modal) {
        this.modal = typeof modal === 'string' ? document.getElementById(modal) : modal;
        this.content = this.modal?.querySelector('.modal-content');

        if (!this.modal || !this.content) {
            console.error('Модальное окно или его содержимое не найдено');
            return;
        }

        // Автоматически настраиваем закрытие при клике вне контента
        this.setupOutsideClickHandling();
    }

    /**
     * Открывает модальное окно
     * @param {Function} callback - Функция обратного вызова после открытия
     */
    open(callback) {
        if (!this.modal) return;

        this.modal.style.display = 'flex';

        // Запускаем анимацию с небольшой задержкой
        setTimeout(() => {
            this.modal.style.opacity = '1';
            this.content.style.transform = 'scale(1)';

            if (typeof callback === 'function') {
                setTimeout(callback, ANIMATION_DURATION);
            }
        }, 10);
    }

    /**
     * Закрывает модальное окно
     * @param {Function} callback - Функция обратного вызова после закрытия
     */
    close(callback) {
        if (!this.modal) return;

        // Запускаем анимацию закрытия
        this.modal.style.opacity = '0';
        this.content.style.transform = 'scale(0.8)';

        // Скрываем модальное окно после завершения анимации
        setTimeout(() => {
            this.modal.style.display = 'none';

            if (typeof callback === 'function') {
                callback();
            }
        }, ANIMATION_DURATION);
    }

    /**
     * Настраивает закрытие при клике вне контента модального окна
     */
    setupOutsideClickHandling() {
        if (!this.modal) return;

        this.modal.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.close();
            }
        });
    }
}

/**
 * Открывает модальное окно (совместимость со старым кодом)
 * @param {HTMLElement} modal - Элемент модального окна
 */
export function openModal(modal) {
    new Modal(modal).open();
}

/**
 * Закрывает модальное окно (совместимость со старым кодом)
 * @param {HTMLElement} modal - Элемент модального окна
 */
export function closeModal(modal) {
    new Modal(modal).close();
}

/**
 * Настраивает закрытие модального окна при клике вне содержимого
 * @param {HTMLElement} modal - Элемент модального окна
 */
export function setupModalClosing(modal) {
    new Modal(modal).setupOutsideClickHandling();
}
