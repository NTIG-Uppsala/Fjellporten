// === Constants and global variables === //

const HTML_BODY = document.getElementById("body");
const VAT_BUTTON = document.getElementById("VATButton");
const DROPDOWN_MENU_SORT = document.getElementById("dropDownMenuSort");
let VATRate = 0.25; // 25% VAT
let carTableViewModel = [];

// === State Management === //

const STATE = {
  isVATFree: false,
  sortBy: "nameAsc",
  allCars: [],
  carType: new URLSearchParams(document.location.search).get("car_type"),
  minPrice: 0,
  maxPrice: Infinity,
};

// === Configuration for API === //

const API_KEY = new Headers();
API_KEY.append("apikey", window._env_.SUPABASE_ANON_KEY);

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
  updateViewModel();
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
  removeNoScriptClass();
  loadVATPreference();
  loadSortPreference();
  getData();
  attachPriceInputListener();
  waitForData();
}

function removeNoScriptClass() {
  HTML_BODY.classList.remove("noScript");
}

// === Data Handling === //

function getData() {
  fetch(window._env_.SUPABASE_URL, REQUEST_OPTIONS)
    .then((response) => response.text())
    .then((result) => {
      const CARS_OBJ = JSON.parse(result);
      CARS_OBJ.forEach(car => STATE.allCars.push(car));
    })
    .catch((error) => console.error(error));
}

function waitForData() {
  if (STATE.allCars.length === 0) {
    setTimeout(waitForData, 10);
  } else {
    setPriceDefaults();
    updateViewModel();
    sortTable();
  }
}

// === LocalStorage === //

// Checks if prices should be shown with or without VAT by using localStorage
function loadVATPreference() {
  STATE.isVATFree = localStorage.getItem("VATFree") === "true";
  VAT_BUTTON.checked = STATE.isVATFree;
  updateViewModel();
}

// Checks what sorting method should be used using localStorage
function loadSortPreference() {
  const SORT_OPTION = localStorage.getItem("SortOption");
  if (SORT_OPTION) {
    STATE.sortBy = SORT_OPTION;
    DROPDOWN_MENU_SORT.value = SORT_OPTION;

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
      carTableViewModel.sort((a, b) => a.car_name.localeCompare(b.car_name, 'sv', {'sensitivity': 'base'}));
      break;
    case "nameDesc":
      carTableViewModel.sort((a, b) => b.car_name.localeCompare(a.car_name, 'sv', {'sensitivity': 'base'}));
      break;
    case "priceAsc":
      carTableViewModel.sort((a, b) => a.cost - b.cost);
      break;
    case "priceDesc":
      carTableViewModel.sort((a, b) => b.cost - a.cost);
      break;
    case "cargo/bedsAsc":
      if (STATE.carType === "caravan") carTableViewModel.sort((a, b) => a.beds - b.beds);
      else carTableViewModel.sort((a, b) => a.cargo_space - b.cargo_space);
      break;
    case "cargo/bedsDesc":
      if (STATE.carType === "caravan") carTableViewModel.sort((a, b) => b.beds - a.beds);
      else carTableViewModel.sort((a, b) => b.cargo_space - a.cargo_space);
      break;
  }
  render();
}

// === Price Range Dropdown === //

function attachPriceInputListener() {
  const PRICE_INPUT = document.querySelectorAll(".priceInput input");

  // Update STATE and trigger updateViewModel
  PRICE_INPUT.forEach(input => {
    input.addEventListener("input", () => {
      STATE.minPrice = parseInt(PRICE_INPUT[0].value) || 0;
      STATE.maxPrice = parseInt(PRICE_INPUT[1].value) || Infinity;
      updateViewModel(); 
    });
  });
}

// Sets the default minimum and maximum prices in the price range
function setPriceDefaults() {
  if (STATE.allCars.length === 0) return;

  const MAX_CAR_PRICE = Math.max(...STATE.allCars.map(car => car.cost));
  const PRICE_INPUTS = document.querySelectorAll(".priceInput input");

  PRICE_INPUTS[0].value = 0;
  PRICE_INPUTS[1].value = MAX_CAR_PRICE;

  STATE.minPrice = 0;
  STATE.maxPrice = MAX_CAR_PRICE;
}

// === View Model and Rendering === //

function updateViewModel() {
  carTableViewModel = STATE.allCars

    // Filters based on if the car is the correct type or not
    .filter(isCorrectCarType)

    // Adds display_price to every filtered car
    .map(car => ({
      ...car,
      display_price: STATE.isVATFree ? Math.round(car.cost / (1 + VATRate)) : car.cost,
    }))

    // Filters based on if the car is within the price range or not
    .filter(car => car.display_price >= STATE.minPrice && car.display_price <= STATE.maxPrice)
    
  sortTable();
}

function isCorrectCarType(element) {
  return element.car_type === STATE.carType;
}

function render() {
  clearTable();
  addTable();
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
    sortCargoBedsAsc.textContent = "Antal sängar stigande";
    sortCargoBedsDesc.textContent = "Antal sängar fallande";
  } else {
    sortCargoBedsAsc.textContent = "Lastutrymme stigande";
    sortCargoBedsDesc.textContent = "Lastutrymme fallande";
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
        th.textContent = STATE.carType === "caravan" ? "Antal sängar" : "Lastutrymme";
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

  carTableViewModel.forEach(car => {
    const TR = document.createElement('TR');
    table.appendChild(TR);

    for (let j = 0; j < AMOUNT_OF_COLUMNS; j++) {
      const TD = document.createElement('TD');
      let cell;
      switch(j) {
        case 0: cell = car.car_name; TD.className = "car"; break;
        case 1:
          if (STATE.carType === "caravan") {
            cell = car.beds.toLocaleString("sv-SE") + "st";
            TD.className = "beds";
          } else {
            cell = car.cargo_space.toLocaleString("sv-SE") + "L";
            TD.className = "cargoSpace";
          }
          break;
        case 2: cell = car.display_price.toLocaleString("sv-SE") + " kr/dag"; 
        TD.className = "price"; 
        break;
      }
      TD.appendChild(document.createTextNode(cell));
      TR.appendChild(TD);
      updateHeaderIndicators();
    }
  });
}

function clearTable() {
  const TABLE = document.getElementById('carTable');
  if (TABLE) TABLE.parentNode.removeChild(TABLE);
}