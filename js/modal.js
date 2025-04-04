// Функция для открытия модального окна
export function openModal(modal) {
    // Устанавливаем стиль для отображения модального окна
    modal.style.display = "flex";

    // Добавляем анимацию для плавного появления
    setTimeout(() => {
        modal.style.opacity = 1; // Устанавливаем непрозрачность на 1
        modal.querySelector(".modal-content").style.transform = "scale(1)"; // Снимаем масштабирование
    }, 10); // Задержка перед анимацией для обеспечения плавности
}

// Функция для закрытия модального окна
export function closeModal(modal) {
    // Устанавливаем анимацию скрытия модального окна
    modal.style.opacity = 0; // Делаем окно прозрачным
    modal.querySelector(".modal-content").style.transform = "scale(0.8)"; // Уменьшаем размер контента

    // Закрываем модальное окно после завершения анимации
    setTimeout(() => {
        modal.style.display = "none"; // Скрываем окно
    }, 300); // Задержка для окончания анимации
}

// Функция для настройки закрытия модального окна при клике за его пределами
export function setupModalClosing(modal) {
    modal.addEventListener("click", (e) => {
        // Закрываем модальное окно, если клик был вне содержимого окна
        if (e.target === modal) {
            closeModal(modal);
        }
    });
}
