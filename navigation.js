document.addEventListener("DOMContentLoaded", () => {

    // Finds an element with the ID "pageSelect" and if none exist, it returns null
    const PAGE_SELECT = document.getElementById("pageSelect");
    if (!PAGE_SELECT) return;

    // Gets the last index of a list containing all the separate parts of the current pages filepath
    const CURRENT = window.location.pathname.split("/").pop();
    
    // Loops through all options in the dropdown menu until it matches the current pages filename
    for (let i = 0; i < PAGE_SELECT.options.length; i++) {
        if (PAGE_SELECT.options[i].value === CURRENT) {

            // Sets the selected option to the one that matches the current pages filename
            PAGE_SELECT.selectedIndex = i;
            break;
        }
    }

    // Listens if the selected dropdown menu option changes
    PAGE_SELECT.addEventListener("change", (e) => {

        // Redirects the user to the selected page
        const URL = e.target.value;
        if (!URL) return;
        window.location.href = URL;
    });
});