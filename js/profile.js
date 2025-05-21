/**
 * Модуль для управления профилем пользователя
 */
import {Auth, updateUIAfterAuth} from './auth.js';
import {showToast} from './toast.js';

/**
 * Класс для управления профилем пользователя
 */
export class UserProfile {
    /**
     * @param {Object} options - Опции профиля
     * @param {string} options.avatarInputId - ID элемента ввода аватара
     * @param {string} options.avatarImgId - ID элемента изображения аватара
     * @param {string} options.nicknameInputId - ID элемента ввода никнейма
     * @param {string} options.profileBtnId - ID кнопки профиля
     * @param {string} options.dropdownMenuId - ID выпадающего меню
     * @param {string} options.logoutBtnId - ID кнопки выхода
     */
    constructor({
                    avatarInputId = 'avatar-input',
                    avatarImgId = 'avatar-img',
                    nicknameInputId = 'nickname',
                    profileBtnId = 'profileBtn',
                    dropdownMenuId = 'dropdownMenu',
                    logoutBtnId = 'logoutBtn'
                } = {}) {
        // Получаем DOM элементы
        this.avatarInput = document.getElementById(avatarInputId);
        this.avatarImg = document.getElementById(avatarImgId);
        this.nicknameInput = document.getElementById(nicknameInputId);
        this.profileBtn = document.getElementById(profileBtnId);
        this.dropdownMenu = document.getElementById(dropdownMenuId);
        this.logoutBtn = document.getElementById(logoutBtnId);

        // Проверяем наличие основных элементов
        if (!this.avatarInput || !this.avatarImg || !this.nicknameInput) {
            console.error('Элементы профиля не найдены');
            return;
        }

        // Инициализация
        this.init();
    }

    /**
     * Инициализирует профиль пользователя
     */
    init() {
        // Проверяем авторизацию
        if (!Auth.isAuthenticated()) {
            // Перенаправляем на главную, если пользователь не авторизован
            window.location.href = 'index.html';
            return;
        }

        // Загружаем данные пользователя из хранилища
        const userData = Auth.getCurrentUser();

        // Обновляем UI
        updateUIAfterAuth(userData.nickname);

        // Загружаем аватар из localStorage
        if (userData.avatar && this.avatarImg) {
            this.avatarImg.src = userData.avatar;
        }

        // Устанавливаем никнейм
        if (this.nicknameInput) {
            this.nicknameInput.value = userData.nickname || '';
        }

        // Настраиваем обработчики событий
        this.setupEventListeners();
    }

    /**
     * Настраивает обработчики событий
     */
    setupEventListeners() {
        // Обработчик загрузки аватара
        if (this.avatarInput && this.avatarImg) {
            this.avatarInput.addEventListener('change', this.handleAvatarChange.bind(this));
        }

        // Обработчик изменения никнейма
        if (this.nicknameInput) {
            this.nicknameInput.addEventListener('input', this.handleNicknameChange.bind(this));
        }

        // Обработчик кнопки выпадающего меню
        if (this.profileBtn && this.dropdownMenu) {
            this.profileBtn.addEventListener('click', this.toggleDropdown.bind(this));

            // Закрытие dropdown при клике вне
            document.addEventListener('click', this.handleOutsideClick.bind(this));
        }

        // Обработчик кнопки выхода
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        }
    }

    /**
     * Обрабатывает изменение аватара
     * @param {Event} event - Событие изменения
     */
    handleAvatarChange(event) {
        const file = event.target.files[0];

        if (file) {
            // Проверяем тип файла
            if (!file.type.match('image.*')) {
                showToast("Пожалуйста, выберите изображение", "info");
                return;
            }

            // Проверяем размер файла (макс. 5 МБ)
            if (file.size > 5 * 1024 * 1024) {
                showToast("Размер файла не должен превышать 5 МБ", "warn");
                return;
            }

            const reader = new FileReader();

            reader.onload = (e) => {
                // Обновляем изображение аватара
                this.avatarImg.src = e.target.result;

                // Сохраняем аватар в хранилище
                Auth.updateAvatar(e.target.result);
            };

            reader.readAsDataURL(file);
        }
    }

    /**
     * Обрабатывает изменение никнейма
     * @param {Event} event - Событие изменения
     */
    handleNicknameChange(event) {
        // Удаляем кириллические символы
        event.target.value = event.target.value.replace(/[а-яА-ЯёЁ]/g, '');

        // Сохраняем никнейм в хранилище
        Auth.updateNickname(event.target.value);

        // Обновляем отображение никнейма в интерфейсе
        const usernameSpan = document.getElementById('username');
        if (usernameSpan) {
            usernameSpan.textContent = event.target.value;
        }
    }

    /**
     * Переключает отображение выпадающего меню
     * @param {Event} event - Событие клика
     */
    toggleDropdown(event) {
        event.stopPropagation();

        const isOpen = this.dropdownMenu.style.display === 'block';
        this.dropdownMenu.style.display = isOpen ? 'none' : 'block';

        // Анимация иконки
        this.profileBtn.classList.toggle('open', !isOpen);
    }

    /**
     * Обрабатывает клик вне выпадающего меню
     * @param {Event} event - Событие клика
     */
    handleOutsideClick(event) {
        if (this.profileBtn && this.dropdownMenu) {
            if (!this.profileBtn.contains(event.target) && !this.dropdownMenu.contains(event.target)) {
                this.dropdownMenu.style.display = 'none';
                this.profileBtn.classList.remove('open');
            }
        }
    }

    /**
     * Обрабатывает выход из аккаунта
     */
    handleLogout() {
        // Очищаем данные аутентификации и хранилища
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userNickname');
        localStorage.removeItem('userAvatar');

        // Выполняем логаут через Auth
        Auth.logout(() => {
            // Перенаправляем на главную страницу
            window.location.href = 'index.html';
        });
    }
}

/**
 * Инициализирует профиль пользователя с настройками по умолчанию
 */
export function initUserProfile() {
    document.addEventListener('DOMContentLoaded', () => {
        new UserProfile();
    });
}

// Автоматически инициализируем профиль при загрузке страницы
initUserProfile();
