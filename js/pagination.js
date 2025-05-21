export function renderPagination(container, totalPages, currentPage, onPageChange) {
    container.innerHTML = "";

    const maxButtons = 5;
    let startPage, endPage;

    if (totalPages <= maxButtons) {
        startPage = 1;
        endPage = totalPages;
    } else {
        const mid = Math.floor(maxButtons / 2);
        if (currentPage <= mid) {
            startPage = 1;
            endPage = maxButtons;
        } else if (currentPage >= totalPages - mid) {
            startPage = totalPages - maxButtons + 1;
            endPage = totalPages;
        } else {
            startPage = currentPage - mid;
            endPage = currentPage + mid;
        }
    }

    // Функция для создания кнопки
    function createButton(page, text, isActive = false, isDisabled = false) {
        const button = document.createElement("button");

        // Заменяем текст на иконку, если это стрелка
        if (text === "←") {
            button.innerHTML = '<i class="fas fa-chevron-left"></i>'; // Иконка стрелки влево
        } else if (text === "→") {
            button.innerHTML = '<i class="fas fa-chevron-right"></i>'; // Иконка стрелки вправо
        } else if (text === "« First") {
            button.innerHTML = '<i class="fas fa-angle-double-left"></i>'; // Иконка первой страницы
        } else if (text === "Last »") {
            button.innerHTML = '<i class="fas fa-angle-double-right"></i>'; // Иконка последней страницы
        } else {
            button.innerText = text; // Для обычных номеров страниц
        }

        button.disabled = isDisabled;
        button.classList.add("page-btn");
        if (isActive) {
            button.classList.add("active");
        }

        if (!isDisabled) {
            button.addEventListener("click", () => {
                // Плавный скролл наверх с небольшой задержкой
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                
                // Даем время на завершение прокрутки перед изменением страницы
                setTimeout(() => {
                    onPageChange(page);
                }, 300);  // задержка в 300 мс для плавности
            });
        }

        container.appendChild(button);
    }

    // Кнопка на первую страницу
    if (currentPage > 0) {
        createButton(0, "« First", false, false);
    } else {
        createButton(null, "« First", false, true);
    }

    // Кнопка на предыдущую страницу
    if (currentPage > 0) {
        createButton(currentPage - 1, "←");
    } else {
        createButton(null, "←", false, true);
    }

    // Отображаем кнопки страниц
    for (let i = startPage; i <= endPage; i++) {
        createButton(i - 1, i, i - 1 === currentPage);
    }

    // Кнопка на следующую страницу
    if (currentPage < totalPages - 1) {
        createButton(currentPage + 1, "→");
    } else {
        createButton(null, "→", false, true);
    }

    // Кнопка на последнюю страницу
    if (currentPage < totalPages - 1) {
        createButton(totalPages - 1, "Last »", false, false);
    } else {
        createButton(null, "Last »", false, true);
    }
}
