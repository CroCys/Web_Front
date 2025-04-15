export function renderPagination(container, totalPages, currentPage, category, onPageChange) {
    container.innerHTML = "";

    const maxButtons = 5;
    let startPage, endPage;

    if (totalPages <= maxButtons) {
        startPage = 1;
        endPage = totalPages;
    } else {
        const mid = Math.ceil(maxButtons / 2);

        if (currentPage <= mid) {
            startPage = 1;
            endPage = maxButtons;
        } else if (currentPage + mid >= totalPages) {
            startPage = totalPages - maxButtons + 1;
            endPage = totalPages;
        } else {
            startPage = currentPage - mid;
            endPage = currentPage + mid;
        }
    }

    function createButton(page, text, isActive = false, isDisabled = false) {
        const button = document.createElement("button");
        button.innerText = text;
        button.disabled = isDisabled;

        button.classList.add("page-btn"); // 💥 ДОБАВЛЯЕМ
        if (isActive) {
            button.classList.add("active");
        }

        button.addEventListener("click", () => onPageChange(category, page));
        container.appendChild(button);
    }


    if (currentPage > 0) {
        createButton(currentPage - 1, "←", false, false);
    } else {
        createButton(null, "←", false, true);
    }

    for (let i = startPage; i <= endPage; i++) {
        createButton(i - 1, i, i - 1 === currentPage, false);
    }

    if (currentPage < totalPages - 1) {
        createButton(currentPage + 1, "→", false, false);
    } else {
        createButton(null, "→", false, true);
    }
}
