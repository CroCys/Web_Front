document.addEventListener("DOMContentLoaded", function () {
    const avatarInput = document.getElementById("avatar-input");
    const avatarImg = document.getElementById("avatar-img");
    const nicknameInput = document.getElementById("nickname");

    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    const userProfile = document.getElementById("userProfile");
    const usernameSpan = document.getElementById("username");
    const profileBtn = document.getElementById("profileBtn");
    const dropdownMenu = document.getElementById("dropdownMenu");
    const logoutBtn = document.getElementById("logoutBtn");

    // ✅ Проверка авторизации
    const token = localStorage.getItem("token");
    const nickname = localStorage.getItem("nickname");

    if (token && nickname) {
        userProfile.style.display = "flex";
        loginBtn.style.display = "none";
        registerBtn.style.display = "none";
        usernameSpan.textContent = nickname;
    } else {
        // ❌ Если не авторизован — редирект на главную
        window.location.href = "index.html";
        return;
    }

    // 🔄 Dropdown поведение
    profileBtn?.addEventListener("click", () => {
        const isOpen = dropdownMenu.style.display === "block";
        dropdownMenu.style.display = isOpen ? "none" : "block";
        profileBtn.classList.toggle("open", !isOpen); // Для анимации ▼
    });

    // ⛔ Клик вне dropdown — закрытие
    document.addEventListener("click", (event) => {
        if (!profileBtn.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.style.display = "none";
            profileBtn.classList.remove("open");
        }
    });

    // 🚪 Выход
    logoutBtn?.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("avatar");
        localStorage.removeItem("nickname");
        window.location.href = "index.html";
    });

    // 🖼️ Аватарка из localStorage
    const savedAvatar = localStorage.getItem("avatar");
    if (savedAvatar) {
        avatarImg.src = savedAvatar;
    }

    // 🧑‍💼 Никнейм из localStorage
    const savedNickname = localStorage.getItem("nickname");
    if (savedNickname) {
        nicknameInput.value = savedNickname;
    } else {
        nicknameInput.value = nickname; // если нет кастомного — от бэка
    }

    // 📤 Загрузка аватарки
    avatarInput.addEventListener("change", function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                avatarImg.src = e.target.result;
                localStorage.setItem("avatar", e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    // ✍️ Изменение никнейма + запрет русского
    nicknameInput.addEventListener("input", function () {
        this.value = this.value.replace(/[а-яА-ЯёЁ]/g, '');
        localStorage.setItem("nickname", this.value);
    });
});
