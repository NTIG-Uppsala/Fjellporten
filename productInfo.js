const BODY = document.getElementById("body")
const BUTTON = document.getElementById("VATButton");

var prices = []

let isVATFree = false;
let VATRate = 0.25; // 25% VAT

carDictionary = {
  "smallCarsArray": [],
  "bigCarsArray": [],
  "caravansArray": [],
}

// Creates headers for the http requests to the Supabase API
const MY_HEADERS = new Headers();
MY_HEADERS.append("apikey", window._env_.SUPABASE_ANON_KEY);

// Creates request options to get information from the database
const REQUEST_OPTIONS = {
  method: "GET",
  headers: MY_HEADERS,
  redirect: "follow"
};

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

// Runs as soon as the page loads
function init(currentPageArray) {
  removeNoScriptClass()
  getData()
  waitForData(currentPageArray)
}

function removeNoScriptClass() {
  BODY.classList.remove("noScript")
}

// Gets data from the database
function getData() {

  data = [];

  fetch(window._env_.SUPABASE_URL, REQUEST_OPTIONS)
    
    // Gets a response from the fetch
    .then((response) => response.text())
    .then((result) => {
      data = result;

      // Formats the data into a "list" of all cars and their info
      carsObj = JSON.parse(data);

      // Loops through every car in the "list"
      carsObj.forEach(car => {
        outputArray = getOutputArray(car);
        carInfo = getCarInfo(car);

        // Adds the car and its info to the correct car array
        carDictionary[outputArray].push(carInfo);
      });
    })
    .catch((error) => console.error(error));
}

// Checks the car type of a specified car and returns where said car should be listed
function getOutputArray(car) {
  switch (car.car_type){
    case "small_car":
      return ("smallCarsArray");
    case "big_car":
      return ("bigCarsArray");
    case "caravan":
      return ("caravansArray");
  }
}

// Gets info about a specified car
function getCarInfo(car) {
  return [car.car_name, car.cost]
}

// Waits until caravansArray has gotten data from the database and then sorts the table
function waitForData(currentPageArray) {
  if (carDictionary["caravansArray"].length === 0) {
    setTimeout(() => {
      waitForData(currentPageArray)
    }, 10);
  } else {
    sortTable(currentPageArray)
  }
}

// Checks if prices should be shown with or without VAT by using a cookie
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
  const VALUE = document.getElementById("dropDownMenu").value;
  if (VALUE === "nameAsc") {
    // Sort array by first element (name) in ascending order
    currentPageArray.sort();
  } else if (VALUE === "nameDesc") {
    // Sort array by first element (name) in descending order
    currentPageArray.sort().reverse();
  } else if (VALUE === "priceAsc") {
    // Sort array by second element (price) in ascending order
    currentPageArray.sort((a, b) => a[1] - b[1]);
  } else if (VALUE === "priceDesc") {
    // Sort array by second element (price) in descending order
    currentPageArray.sort((a, b) => b[1] - a[1]);
  }

  clearTable();
  addTable(currentPageArray);
  originalPrices();
  updatePrices();
};