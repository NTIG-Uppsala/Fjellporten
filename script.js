const button = document.getElementById("tax-button");
var prices = []

let isTaxFree = false;
let taxAmount = 1.25; // 25% Moms

let småBilarArray = [
  ["Toyota Yaris 1.5 Hybrid", 520],
  ["Volkswagen Polo TSI", 480],
  ["Kia Picanto", 360],
  ["Renault Clio", 400],
  ["Ford Fiesta EcoBoost", 450],
  ["Peugeot 208", 430]
];

let storaBilarArray = [
  ["Volvo XC60 D4 AWD", 1050],
  ["Volkswagen Passat Variant", 900],
  ["Skoda Kodiaq 7-sits", 1100],
  ["BMW 320d Touring", 1000],
  ["Audi A4 Avant", 980],
  ["Mercedes-Benz GLC", 1200],
];

let husbilarArray = [
  ["Adria Coral XL (4 bäddar)", 1800],
  ["Hymer B-Class Modern Comfort (5 bäddar)", 2200],
  ["Knaus BoxStar Camper Van (2 bäddar)", 1400],
  ["Bürstner Lyseo TD (4 bäddar)", 1900],
  ["Sunlight A72 (6 bäddar)", 2400],
  ["Dethleffs Globebus (3 bäddar)", 1600],
];

button.addEventListener("click", () => {
  isTaxFree = !isTaxFree;
  updatePrices();
  if (isTaxFree) {
    document.cookie = 'taxFree=True';
  } else {
    document.cookie = 'taxFree=False';
  }
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
    if (isTaxFree) {
      let text = cell.innerHTML;
      let amount = parseInt(text.replaceAll("&nbsp;", ""));
      let newPrice = amount / taxAmount;
      // Format number with spaces as thousands separator
      let newPriceFormatted = newPrice.toLocaleString("sv-SE");
      cell.textContent = newPriceFormatted + " kr/dag";
    } else {
      let original = cell.getAttribute("original-price");
      cell.textContent = original;
    }
  })
};

function addTable(array) {
  let tableDiv = document.getElementById("cars");
  let table = document.createElement('TABLE');
  table.setAttribute("id", "car-table");
  tableDiv.appendChild(table);

  // Loop through each row in array
  for (let i = 0; i < array.length; i++) {
    let tr = document.createElement('TR');
    table.appendChild(tr);

    // Loop through each element (cell) in the current row
    for (let j = 0; j < array[i].length; j++) {
      let td = document.createElement('TD');
      let cell = array[i][j];
      // If it's the price column, format the number
      if (j === 1) {
        cell = cell.toLocaleString("sv-SE");
        cell = cell + " kr/dag";
      }
      td.appendChild(document.createTextNode(cell));
      td.className = (j === 0 ? 'car' : 'price'); // Assign class based on column index
      tr.appendChild(td);
    }
  }
}

function clearTable() {
  var tbl = document.getElementById('car-table');
  if (tbl) tbl.parentNode.removeChild(tbl);
}

function sortTable(array) {
  const value = document.getElementById("drop-down-menu").value;
  if (value === "name-asc") {
    array.sort();
  } else if (value === "name-desc") {
    array.sort().reverse();
  } else if (value === "price-asc") {
    // Sort array by second element (price) in ascending order
    array.sort((a, b) => a[1] - b[1]);
  } else if (value === "price-desc") {
    // Sort array by second element (price) in descending order
    array.sort((a, b) => b[1] - a[1]);
  }
  clearTable();
  addTable(array);
  originalPrices();
  updatePrices();
};