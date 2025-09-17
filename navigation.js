document.addEventListener("DOMContentLoaded", () => {
    const pageSelect = document.getElementById("pageSelect");
    if (!pageSelect) return;

    const current = window.location.pathname.split("/").pop();
    for (let i = 0; i < pageSelect.options.length; i++) {
        if (pageSelect.options[i].value === current) {
            pageSelect.selectedIndex = i;
            break;
        }
    }

    pageSelect.addEventListener("change", (e) => {
        const url = e.target.value;
        if (!url) return;
        window.location.href = url;
    });
});
