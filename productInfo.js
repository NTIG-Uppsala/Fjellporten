// === Constants and global variables === //

const HTML_BODY = document.getElementById("body")
const VAT_BUTTON = document.getElementById("VATButton");
const DROPDOWN_MENU_SORT = document.getElementById("dropDownMenuSort")
let VATRate = 0.25; // 25% VAT
let carTableViewModel = [];


// === State Management === //

const STATE = {
  isVATFree: false,
  sortBy: "nameAsc",
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

document.addEventListener("DOMContentLoaded", () => {
  init();
});

VAT_BUTTON.addEventListener("click", () => {
  // Inverses isVATFree when the VAT button is pressed and updates localStorage
  STATE.isVATFree = !STATE.isVATFree;
  localStorage.setItem("VATFree", STATE.isVATFree ? "true" : "false");
  updateViewModel()
});

DROPDOWN_MENU_SORT.addEventListener("change", () => {
  // Updates the sortBy state and then updates localStorage
  STATE.sortBy = DROPDOWN_MENU_SORT.value;
  localStorage.setItem("SortOption", STATE.sortBy);
  syncHeaderState()
  sortTable()
});

// === Initiation === //

function init() {
  removeNoScriptClass()
  loadVATPreference()
  loadSortPreference()
  getData()
  waitForData()
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
      sortTable()
  }
}

// === LocalStorage === //

// Checks if prices should be shown with or without VAT by using localStorage
function loadVATPreference() {
  STATE.isVATFree = localStorage.getItem("VATFree") === "true";
  VAT_BUTTON.checked = STATE.isVATFree;
  updateViewModel() 
}

// Checks what sorting method should be used using localStorage
function loadSortPreference() {
  let sortOption = localStorage.getItem("SortOption");
  if (sortOption) {
    STATE.sortBy = sortOption;
    DROPDOWN_MENU_SORT.value = sortOption;

    // Restore the header sort state
    syncHeaderState()

    sortTable()
  }
}

// === Sorting === //

let lastSortColumn = null;
let lastSortDirection = "asc";

function handleHeaderClick(column) {

  // Inverses sorting direction if the already selected header is clicked, 
  // otherwise it sets the sortDirection to ascending
  if (lastSortColumn === column) {
    lastSortDirection = (lastSortDirection === "asc") ? "desc" : "asc";
  } else {
    lastSortDirection = "asc";
  }

  // Updates lastSortColumn to the current one
  lastSortColumn = column;

  // Checks which column the table should be sorted by depending on the selected header
  // and updates the sortBy state and localStorage
  let newSortBy = "";
  switch (column) {
    case "name":
      newSortBy = (lastSortDirection === "asc") ? "nameAsc" : "nameDesc";
      break;
    case "price":
      newSortBy = (lastSortDirection === "asc") ? "priceAsc" : "priceDesc";
      break;
    case "cargo/beds":
      newSortBy = (lastSortDirection === "asc") ? "cargo/bedsAsc" : "cargo/bedsDesc";
      break;
  }

  STATE.sortBy = newSortBy;
  DROPDOWN_MENU_SORT.value = STATE.sortBy;
  localStorage.setItem("SortOption", STATE.sortBy);

  // Sorts the table
  sortTable();
}

function updateHeaderIndicators() {
  document.querySelectorAll("th.sortable").forEach(th => {
    th.classList.remove("sortedAsc", "sortedDesc");
    
    // Reset aria-sort
    th.removeAttribute("aria-sort");

    if (th.dataset.sort === lastSortColumn) {
      
      th.classList.add((lastSortDirection === "asc") ? "sortedAsc" : "sortedDesc");

      // Add accessible hint
      th.setAttribute("aria-sort", lastSortDirection === "asc" ? "ascending" : "descending");
    } else {
      th.setAttribute("aria-sort", "none");
    }
  });
}

function syncHeaderState() {
  
  // Synchronises the header indicators with the sort dropdown menu
  if (STATE.sortBy.startsWith("name")) {
    lastSortColumn = "name";
    lastSortDirection = STATE.sortBy.endsWith("Asc") ? "asc" : "desc";
  } else if (STATE.sortBy.startsWith("price")) {
    lastSortColumn = "price";
    lastSortDirection = STATE.sortBy.endsWith("Asc") ? "asc" : "desc";
  } else if (STATE.sortBy.startsWith("cargo/beds")) {
    lastSortColumn = "cargo/beds";
    lastSortDirection = STATE.sortBy.endsWith("Asc") ? "asc" : "desc";
  }
}

function sortTable() {
  const SORT_BY_VALUE = STATE.sortBy;
  switch(SORT_BY_VALUE) {
    
    case "nameAsc":
      // Sort array by name in ascending order
      carTableViewModel.sort((a, b) => a.car_name.localeCompare(b.car_name, 'sv', {'sensitivity': 'base'}));
      break;
    
    case "nameDesc":
      // Sort array by name in descending order
      carTableViewModel.sort((a, b) => b.car_name.localeCompare(a.car_name, 'sv', {'sensitivity': 'base'}));
      break;
    
    case "priceAsc":
      // Sort array by price in ascending order
      carTableViewModel.sort((a, b) => a.cost - b.cost);
      break;
    
    case "priceDesc":
      // Sort array by price in descending order
      carTableViewModel.sort((a, b) => b.cost - a.cost);
      break;
    
    case "cargo/bedsAsc":
      // Sort array by cargo/beds in ascending order
      if (STATE.carType == "caravan") {
        carTableViewModel.sort((a, b) => a.beds - b.beds)
      } else {
        carTableViewModel.sort((a, b) => a.cargo_space - b.cargo_space)
      }
      break;
    
    case "cargo/bedsDesc":
      // Sort array by cargo/beds in ascending order
      if (STATE.carType == "caravan") {
        carTableViewModel.sort((a, b) => b.beds - a.beds)
      } else {
        carTableViewModel.sort((a, b) => b.cargo_space - a.cargo_space)
      }
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
  sortTable()
}

function isCorrectCarType(element) {
  return element.car_type === STATE.carType
}

function render() {
  clearTable()
  addTable()
}

// Completely clears the table into a clean state
function clearTable() {
  var table = document.getElementById('carTable');
  if (table) table.parentNode.removeChild(table);
}

// Creates the actual table with cars and their info
function addTable() {

  // Gets the cargo/beds sort option so it can later change the text depending on STATE.carType
  let sortCargoBedsAsc = document.querySelector("#dropDownMenuSort option[value='cargo/bedsAsc']")
  let sortCargoBedsDesc = document.querySelector("#dropDownMenuSort option[value='cargo/bedsDesc']")

  // Gets the tableDiv from html and creates a table to be in said div
  let tableDiv = document.getElementById("cars");
  let table = document.createElement('TABLE');

  // Sets the amount of columns that should be present in the table
  const AMOUNT_OF_COLUMNS = 3

  // Changes the textContent of the cargo/beds sort option depending on STATE.carType
  if (STATE.carType === "caravan") {
    sortCargoBedsAsc.textContent = "Antal sängar stigande"
    sortCargoBedsDesc.textContent = "Antal sängar fallande"
  } else {
    sortCargoBedsAsc.textContent = "Lastutrymme stigande"
    sortCargoBedsDesc.textContent = "Lastutrymme fallande"
  }

  // Adds the carTable id to the actual car table and appends it as a child to the tableDiv
  table.setAttribute("id", "carTable");
  tableDiv.appendChild(table);

  // Creates the table headers and gives them their respective sort methods
  let headerRow = document.createElement('TR');
  headerRow.setAttribute("id", "headerRow")
  table.appendChild(headerRow);

  for (let i = 0; i < AMOUNT_OF_COLUMNS; i++) {
    let th = document.createElement('TH');
    th.classList.add("sortable");

    switch(i) {
      case 0:
        th.textContent = "Bilmodell"
        th.dataset.sort = "name";
        break;
      
      case 1:
        if (STATE.carType === "caravan") {
          th.textContent = "Antal sängar"
        } else {
          th.textContent = "Lastutrymme"
        }
        th.dataset.sort = "cargo/beds";
        break;

      case 2:
        th.textContent = "Kostnad"
        th.dataset.sort = "price";
    }

    // Creates an event listener for every table header so that they can later be clicked to be sorted by
    // and then appends the header to the headerRow
    th.addEventListener("click", () => handleHeaderClick(th.dataset.sort));
    headerRow.appendChild(th);
  }

  // Loop through each row in the array
  for (let i = 0; i < carTableViewModel.length; i++) {
    let tr = document.createElement('TR');
    table.appendChild(tr);

    // Loop through each element (cell) in the current row
    for (let j = 0; j < AMOUNT_OF_COLUMNS; j++) {
      let td = document.createElement('TD');
      let cell = null;
      switch(j) {
        case 0:
          cell = carTableViewModel[i].car_name;
          td.className = "car"
          break;

        case 1:
          if (STATE.carType === "caravan") {
            cell = carTableViewModel[i].beds.toLocaleString("sv-SE") + "st";
            td.className = "beds"
          } else {
            cell = carTableViewModel[i].cargo_space.toLocaleString("sv-SE") + "L";
            td.className = "cargoSpace"
          }
          break;

        case 2:
          cell = carTableViewModel[i].display_price.toLocaleString("sv-SE") + " kr/dag";
          td.className = "price"
          break;
        }
      td.appendChild(document.createTextNode(cell));
      tr.appendChild(td);
      updateHeaderIndicators();
    }
  }
}