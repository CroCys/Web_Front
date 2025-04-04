// Функция для настройки навигации и обработки открытия/закрытия бургер-меню
export function setupNavigation() {
    // Получаем элементы бургер-меню и навигационных ссылок
    const burgerMenu = document.getElementById('burgerMenu');
    const navLinks = document.getElementById('navLinks');

    // Обработчик события для открытия/закрытия бургер-меню
    burgerMenu.addEventListener('click', () => {
        // Переключаем класс 'show' для отображения или скрытия меню
        navLinks.classList.toggle('show');
    });

    // Функция для закрытия бургер-меню
    function closeBurgerMenu() {
        navLinks.classList.remove('show'); // Убираем класс 'show', чтобы скрыть меню
    }

    // Добавляем обработчики событий для кнопок, которые закрывают бургер-меню
    document.querySelectorAll("#loginBtn, #registerBtn, #profileBtn, #switchToRegister, #switchToLogin")
        .forEach(button => button.addEventListener("click", closeBurgerMenu));
}
