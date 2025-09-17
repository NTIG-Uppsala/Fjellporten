document.addEventListener("DOMContentLoaded", () => {
    const dropdown = document.getElementById("DropdwonMenu");

    dropdown.addEventListener("change", (event) => {
        const url = event.target.value;
        window.location.href = url;
    });
});
