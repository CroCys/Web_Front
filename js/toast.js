export function showToast(message, type = "info", duration = 4000) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.className = "toast";
    toast.classList.add("show", `toast-${type}`);

    setTimeout(() => {
        toast.classList.remove("show");
    }, duration);
}
