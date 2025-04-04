document.addEventListener("DOMContentLoaded", function () {
    const avatarInput = document.getElementById("avatar-input");
    const avatarImg = document.getElementById("avatar-img");
    const nicknameInput = document.getElementById("nickname");
    
    // Загрузка сохраненных данных
    const savedAvatar = localStorage.getItem("avatar");
    if (savedAvatar) {
        avatarImg.src = savedAvatar;
    }

    const savedNickname = localStorage.getItem("nickname");
    if (savedNickname) {
        nicknameInput.value = savedNickname;
    }

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

    // Запрет русского языка и сохранение никнейма
    nicknameInput.addEventListener("input", function () {
        this.value = this.value.replace(/[а-яА-ЯёЁ]/g, '');
        localStorage.setItem("nickname", this.value);
    });
});

