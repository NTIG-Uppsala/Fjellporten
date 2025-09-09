const buttonText = document.getElementById("tax-container").querySelector("p");
const button = document.getElementById("tax-button");
const prices = document.querySelectorAll(".price");
let isTaxFree = false;
let taxAmount = 1.25; // 25% tax

prices.forEach(cell => {
  cell.setAttribute("original-price", cell.textContent);
});

button.addEventListener("click", () => {
  isTaxFree = !isTaxFree;
  updatePrices();
});

function checkCookies() {
  let cookie = document.cookie;
  if (cookie == 'taxFree=True') {
    isTaxFree = true;
    updatePrices();
    document.getElementById("tax-button").checked = true;
  }
}

function updatePrices() {
  prices.forEach(cell => {
    let text = cell.textContent;
    let amount = parseInt(text.replaceAll(" ", ""));

    if (isTaxFree) {
      let newPrice = amount / taxAmount;
      newPrice = newPrice.toFixed(2);
      // Format number with spaces as thousands separator
      let newPriceFormatted = newPrice.toLocaleString("sv-SE");
      cell.textContent = newPriceFormatted + " kr/dag";
      document.cookie = 'taxFree=True';
    } else {
      let original = cell.getAttribute("original-price");
      cell.textContent = original;
      document.cookie = 'taxFree=False';
    }
  })
};