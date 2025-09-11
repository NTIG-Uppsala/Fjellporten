const buttonText = document.getElementById("tax-container").querySelector("p");
const button = document.getElementById("tax-button");
var prices = []

let isTaxFree = false;
let taxAmount = 1.25; // 25% tax

let småBilarArray = [
  ["Toyota Yaris 1.5 Hybrid", "520 kr/dag"],
  ["Volkswagen Polo TSI", "480 kr/dag"],
  ["Kia Picanto", "360 kr/dag"],
  ["Renault Clio", "400 kr/dag"],
  ["Ford Fiesta EcoBoost", "450 kr/dag"],
  ["Peugeot 208", "430 kr/dag"]
];
let småBilarArraysorted = småBilarArray.sort();

let storaBilarArray = [
  ["Volvo XC60 D4 AWD", "1 050 kr/dag"],
  ["Volkswagen Passat Variant", "900 kr/dag"],
  ["Skoda Kodiaq 7-sits", "1 100 kr/dag"],
  ["BMW 320d Touring", "1 000 kr/dag"],
  ["Audi A4 Avant", "980 kr/dag"],
  ["Mercedes-Benz GLC", "1 200 kr/dag"],
];

let storaBilarArraysorted = storaBilarArray.sort();

let husbilarArray = [
  ["Adria Coral XL (4 bäddar)", "1 800 kr/dag"],
  ["Hymer B-Class Modern Comfort (5 bäddar)", "2 200 kr/dag"],
  ["Knaus BoxStar Camper Van (2 bäddar)", "1 400 kr/dag"],
  ["Bürstner Lyseo TD (4 bäddar)", "1 900 kr/dag"],
  ["Sunlight A72 (6 bäddar)", "2 400 kr/dag"],
  ["Dethleffs Globebus (3 bäddar)", "1 600 kr/dag"],
]
let husbilarArraysorted = husbilarArray.sort();

button.addEventListener("click", () => {
  isTaxFree = !isTaxFree;
  updatePrices();
});

function originalPrices() {
  prices = document.querySelectorAll(".price");
  prices.forEach(cell => {
    cell.setAttribute("original-price", cell.textContent);
  });
}
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

function addTable(array) {
  // Get the table from HTML by its id "car-table"
  let table = document.getElementById("car-table");

  // Loop through each row in småBilarArray
  for (let i = 0; i < array.length; i++) {
    // Create a new table row
    let tr = document.createElement('TR');
    // Add the row to the table
    table.appendChild(tr);

    // Loop through each element (cell) in the current row
    for (let j = 0; j < array[i].length; j++) {
      // Create a new table cell
      let td = document.createElement('TD');
      // Create a text node with the array value and add it to the cell
      td.appendChild(document.createTextNode(array[i][j]));
      td.className = (j === 0 ? 'car' : 'price'); // Assign class based on column index
      // Add the cell to the row
      tr.appendChild(td);
    }
  }
}