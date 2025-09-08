const buttonText = document.getElementById("tax-container").querySelector("p");
const button = document.getElementById("tax-button");
const prices = document.querySelectorAll(".price");
let isTaxFree = false;
let taxAmount = 0.7;

prices.forEach(cell => {
  cell.setAttribute("original-price", cell.textContent);
});

button.addEventListener("click", () => {
  prices.forEach(cell => {
    let text = cell.textContent;
    let amount = parseInt(text.replaceAll(" ", ""));

    if (!isTaxFree) {
      let newPrice = Math.round(amount * taxAmount);
      let newPriceFormatted = newPrice.toLocaleString("sv-SE");
      cell.textContent = newPriceFormatted + " kr/dag";
    } else {
      let original = cell.getAttribute("original-price");
      cell.textContent = original;
    }
  });

  isTaxFree = !isTaxFree;
});
