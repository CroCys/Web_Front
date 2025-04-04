let scrollInterval; // Переменная для хранения идентификатора интервала автопрокрутки

// Функция для запуска автопрокрутки карусели
export function startAutoScroll() {
    // Получаем элемент карусели
    const carousel = document.getElementById("popularDevicesCarousel");

    // Функция для автопрокрутки карусели
    function autoScrollCarousel() {
        // Вычисляем максимальную возможную прокрутку
        const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;

        // Прокручиваем карусель влево. Если достигнут конец, возвращаем прокрутку в начало, иначе прокручиваем на 200 пикселей
        carousel.scrollBy({
            left: carousel.scrollLeft >= maxScrollLeft ? -carousel.scrollLeft : 200,
            behavior: 'smooth' // Плавная анимация прокрутки
        });
    }

    // Устанавливаем интервал автопрокрутки (каждые 3 секунды)
    scrollInterval = setInterval(autoScrollCarousel, 3000);

    // Останавливаем автопрокрутку при наведении мыши на карусель
    carousel.addEventListener("mouseenter", () => clearInterval(scrollInterval));

    // Возобновляем автопрокрутку, когда мышь покидает область карусели
    carousel.addEventListener("mouseleave", startAutoScroll);
}
