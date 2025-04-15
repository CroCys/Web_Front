/**
 * Модуль для управления навигацией и мобильным меню
 */

/**
 * Класс для управления навигацией
 */
export class Navigation {
    /**
     * @param {Object} options - Опции навигации
     * @param {string} options.burgerMenuId - ID элемента бургер-меню
     * @param {string} options.navLinksId - ID элемента с навигационными ссылками
     * @param {string[]} options.closeButtonIds - Массив ID элементов, закрывающих меню при клике
     */
    constructor({
                    burgerMenuId = 'burgerMenu',
                    navLinksId = 'navLinks',
                    closeButtonIds = ["loginBtn", "registerBtn", "switchToRegister", "switchToLogin"]
                } = {}) {
        this.burgerMenu = document.getElementById(burgerMenuId);
        this.navLinks = document.getElementById(navLinksId);
        this.closeButtons = closeButtonIds.map(id => document.getElementById(id)).filter(Boolean);

        if (!this.burgerMenu || !this.navLinks) {
            console.error('Элементы навигации не найдены');
            return;
        }

        this.init();
    }

    /**
     * Инициализирует навигацию
     */
    init() {
        // Настраиваем переключение бургер-меню
        this.burgerMenu.addEventListener('click', () => this.toggleMenu());

        // Добавляем обработчики для кнопок закрытия меню
        this.closeButtons.forEach(button => {
            button.addEventListener('click', () => this.closeMenu());
        });

        // Закрываем меню при изменении размера окна (адаптивность)
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) { // Для десктопных экранов
                this.closeMenu();
            }
        });
    }

    /**
     * Переключает состояние меню
     */
    toggleMenu() {
        this.navLinks.classList.toggle('show');
        this.burgerMenu.classList.toggle('active');
    }

    /**
     * Закрывает меню
     */
    closeMenu() {
        this.navLinks.classList.remove('show');
        this.burgerMenu.classList.remove('active');
    }

    /**
     * Открывает меню
     */
    openMenu() {
        this.navLinks.classList.add('show');
        this.burgerMenu.classList.add('active');
    }
}

/**
 * Настраивает навигацию (совместимость со старым кодом)
 */
export function setupNavigation() {
    return new Navigation();
}
