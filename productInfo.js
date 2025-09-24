document.addEventListener("DOMContentLoaded", () => {


// === Constants and global variables === //

const HTML_BODY = document.getElementById("body")
const VAT_BUTTON = document.getElementById("VATButton");
const DROPDOWN_MENU_SORT = document.getElementById("dropDownMenuSort")
let VATRate = 0.25; // 25% VAT
let carTableViewModel = [];


// === State Management === //

const STATE = {
  isVATFree: false,
  sortBy: null,
  allCars: [],
  carType: new URLSearchParams(document.location.search).get("car_type"),
}

// === Configuration for API === //

// Creates headers for the http requests to the Supabase API
const API_KEY = new Headers();
API_KEY.append("apikey", window._env_.SUPABASE_ANON_KEY);

// Creates request options to get information from the database
const REQUEST_OPTIONS = {
  method: "GET",
  headers: API_KEY,
  redirect: "follow",
};

// === Event Listeners === //

VAT_BUTTON.addEventListener("click", () => {
  // Inverses isVATFree when the VAT button is pressed
  STATE.isVATFree = !STATE.isVATFree;
  updateViewModel()
  if (STATE.isVATFree) {
    document.cookie = 'VATFree=True';
  } else {
    document.cookie = 'VATFree=False';
  }
});

DROPDOWN_MENU_SORT.addEventListener("change", (e) => {
  sortTable()
});

// === Initiation === //

function init() {
  removeNoScriptClass()
  checkCookies()
  getData()
  waitForData()
  sortTable()
}

function removeNoScriptClass() {
  HTML_BODY.classList.remove("noScript")
}

// === Data Handling === //

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
      // Loops through every car in the "list" and adds them to the STATE object
      carsObj.forEach(car => {
        STATE.allCars.push(car)
      });
    })
    .catch((error) => console.error(error));
}

// Waits until caravansArray has gotten data from the database and then sorts the table
function waitForData() {
  if (STATE.allCars.length === 0) {
    setTimeout(() => {
      waitForData()
    }, 10);
  } else {
      updateViewModel()
  }
}

// === Cookies === //

// Checks if prices should be shown with or without VAT by using a cookie
function checkCookies() {
  let cookie = document.cookie;
  if (cookie == 'VATFree=True') {
    STATE.isVATFree = true;
    updateViewModel() 
    VAT_BUTTON.checked = true;
  }
}

// === Sorting === //


// Gets called from html with that pages array to then sort the table
function sortTable() {
  const VALUE = document.getElementById("dropDownMenuSort").value;
  if (VALUE === "nameAsc") {
    // Sort array by first element (name) in ascending order
    carTableViewModel.sort((a, b) => a.car_name.localeCompare(b.car_name, 'sv', {'sensitivity': 'base'}));
  } else if (VALUE === "nameDesc") {
    // Sort array by first element (name) in descending order
    carTableViewModel.sort((a, b) => b.car_name.localeCompare(a.car_name, 'sv', {'sensitivity': 'base'}));
  } else if (VALUE === "priceAsc") {
    // Sort array by second element (price) in ascending order
    carTableViewModel.sort((a, b) => a.cost - b.cost);
  } else if (VALUE === "priceDesc") {
    // Sort array by second element (price) in descending order
    carTableViewModel.sort((a, b) => b.cost - a.cost);
  }
  render()
};

// === View Model and Rendering === //
function updateViewModel() {
  carTableViewModel = STATE.allCars.filter(isCorrectCarType)
  carTableViewModel = carTableViewModel.map(car => ({
    ...car,
    display_price: STATE.isVATFree ? Math.round(car.cost/(1 + VATRate)) : car.cost,
  }));
  render()
}

function isCorrectCarType(element) {
  return element.car_type === STATE.carType
}

function render() {
  clearTable()
  addTable()
}

// Creates the actual table with cars and their info
function addTable() {
  let tableDiv = document.getElementById("cars");
  let table = document.createElement('TABLE');
  table.setAttribute("id", "carTable");
  tableDiv.appendChild(table);

  // Loop through each row in the array
  for (let i = 0; i < carTableViewModel.length; i++) {
    let tr = document.createElement('TR');
    table.appendChild(tr);

    // Loop through each element (cell) in the current row
    for (let j = 0; j < 2; j++) {
      let td = document.createElement('TD');
      let cell = null;
      switch(j) {
        case 0:
          cell = carTableViewModel[i].car_name;
          break;

        case 1:
          cell = carTableViewModel[i].display_price.toLocaleString("sv-SE") + " kr/dag";
          break;
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

init();

});