const BUTTON = document.getElementById("VATButton");

var prices = []

let isVATFree = false;
let VATRate = 0.25; // 25% VAT

let smallCarsArray = [
  ["Toyota Yaris 1.5 Hybrid", 520],
  ["Volkswagen Polo TSI", 480],
  ["Kia Picanto", 360],
  ["Renault Clio", 400],
  ["Ford Fiesta EcoBoost", 450],
  ["Peugeot 208", 430]
];

let bigCarsArray = [
  ["Volvo XC60 D4 AWD", 1050],
  ["Volkswagen Passat Variant", 900],
  ["Skoda Kodiaq 7-sits", 1100],
  ["BMW 320d Touring", 1000],
  ["Audi A4 Avant", 980],
  ["Mercedes-Benz GLC", 1200],
];

let caravansArray = [
  ["Adria Coral XL (4 bäddar)", 1800],
  ["Hymer B-Class Modern Comfort (5 bäddar)", 2200],
  ["Knaus BoxStar Camper Van (2 bäddar)", 1400],
  ["Bürstner Lyseo TD (4 bäddar)", 1900],
  ["Sunlight A72 (6 bäddar)", 2400],
  ["Dethleffs Globebus (3 bäddar)", 1600],
];

BUTTON.addEventListener("click", () => {
  // Inverses isVATFree when the VAT button is pressed
  isVATFree = !isVATFree;
  updatePrices();
  if (isVATFree) {
    document.cookie = 'VATFree=True';
  } else {
    document.cookie = 'VATFree=False';
  }
});

function checkCookies() {
  let cookie = document.cookie;
  if (cookie == 'VATFree=True') {
    isVATFree = true;
    updatePrices();
    BUTTON.checked = true;
  }
}

// Creates the actual table with cars and their info
function addTable(currentPageArray) {
  let tableDiv = document.getElementById("cars");
  let table = document.createElement('TABLE');
  table.setAttribute("id", "carTable");
  tableDiv.appendChild(table);

  // Loop through each row in the array
  for (let i = 0; i < currentPageArray.length; i++) {
    let tr = document.createElement('TR');
    table.appendChild(tr);

    // Loop through each element (cell) in the current row
    for (let j = 0; j < currentPageArray[i].length; j++) {
      let td = document.createElement('TD');
      let cell = currentPageArray[i][j];
      // If it's the price column, format the number accordingly
      if (j === 1) {
        cell = cell.toLocaleString("sv-SE");
        cell += " kr/dag";
      }
      td.appendChild(document.createTextNode(cell));
      td.className = (j === 0 ? 'car' : 'price'); // Assign class based on column index
      tr.appendChild(td);
    }
  }
}

// Completely clears the table into a clean state
function clearTable() {
  var table = document.getElementById('carTable');
  if (table) table.parentNode.removeChild(table);
}

// Gets the original price for every separate product and sets it as an attribute for said products element
function originalPrices() {
  prices = document.querySelectorAll(".price");
  prices.forEach(cell => {
    cell.setAttribute("originalPrice", cell.textContent);
  });
}

// Updates the prices to show the correct prices
function updatePrices() {
  prices.forEach(cell => {
    if (isVATFree) {
      // Show prices without VAT
      let text = cell.innerHTML;
      let oldPrice = parseInt(text.replaceAll("&nbsp;", ""));
      let newPrice = oldPrice / (VATRate + 1);
      // Format number with spaces as thousands separator
      let newPriceFormatted = newPrice.toLocaleString("sv-SE");
      cell.textContent = newPriceFormatted + " kr/dag";
    } else {
      // Show prices with VAT
      let original = cell.getAttribute("originalPrice");
      cell.textContent = original;
    }
  })
};

// Gets called from html with that pages array to then sort the table
function sortTable(currentPageArray) {
  const value = document.getElementById("dropDownMenu").value;
  if (value === "nameAsc") {
    // Sort array by first element (name) in ascending order
    currentPageArray.sort();
  } else if (value === "nameDesc") {
    // Sort array by first element (name) in descending order
    currentPageArray.sort().reverse();
  } else if (value === "priceAsc") {
    // Sort array by second element (price) in ascending order
    currentPageArray.sort((a, b) => a[1] - b[1]);
  } else if (value === "priceDesc") {
    // Sort array by second element (price) in descending order
    currentPageArray.sort((a, b) => b[1] - a[1]);
  }

  clearTable();
  addTable(currentPageArray);
  originalPrices();
  updatePrices();
};