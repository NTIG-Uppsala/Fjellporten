import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();

// __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use("/admin", express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 30 }, // 30 min
  })
);

// Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// --- Helpers ---
function requireLogin(req, res, next) {
  if (req.session.loggedIn) return next();
  res.redirect("/admin/login");
}

function checkIfCaravan(carType) {
  return carType === "caravan";
}

function checkHasDisallowedValues(isCaravan, cargoSpace, bedsAmount) {
  if (isCaravan) {
    if (cargoSpace) return "Husbilar får inte ha lastutrymme";
    if (!bedsAmount) return "Husbilar behöver ett värde för sängar";
  } else {
    if (bedsAmount) return "Små och stora bilar får inte ha sängar";
    if (!cargoSpace) return "Små och stora bilar behöver ett värde för lastutrymme";
  }
  return null;
}

// Centralized error handler for admin page
async function sendError(res, errorMessage) {
  try {
    const { data, error } = await supabase.from("all_cars").select("*");
    if (error) console.error("Fetch error:", error.message);
    res.status(400).render("admin", { cars: data || [], errorMessage });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).render("admin", { cars: [], errorMessage: "Oväntat fel" });
  }
}

// --- Auth routes ---
app.get("/admin/login", (req, res) => {
  res.render("login", { error: "", username: "", focus: "username" });
});

app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_NAME && password === process.env.ADMIN_PASS) {
    req.session.loggedIn = true;
    res.redirect("/admin");
  } else {
    res.render("login", { error: "Fel användarnamn eller lösenord.", username, focus: "password" });
  }
});

app.get("/admin/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/admin/login"));
});

// --- Admin dashboard ---
app.get("/admin", requireLogin, async (req, res) => {
  try {
    const { data, error } = await supabase.from("all_cars").select("*");
    if (error) console.error("Fetch error:", error.message);
    res.render("admin", { cars: data || [], errorMessage: null });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.render("admin", { cars: [], errorMessage: "Oväntat fel" });
  }
});

// --- Car management ---
app.post("/add-car", requireLogin, async (req, res) => {
  let { car_type, car_name, cargo_space, beds, cost } = req.body;

  // Validate
  if (!car_type || !car_name) return sendError(res, "Biltyp och bilnamn är obligatoriska");

  const isCaravan = checkIfCaravan(car_type);
  const disallowed = checkHasDisallowedValues(isCaravan, cargo_space, beds);
  if (disallowed) return sendError(res, disallowed);

  cargo_space = cargo_space ? Number(cargo_space) : null;
  beds = beds ? Number(beds) : null;
  cost = cost ? Number(cost) : null;

  try {
    const { error } = await supabase.from("all_cars").insert([{ car_type, car_name, cargo_space, beds, cost }]);
    if (error) return sendError(res, "Fel vid tillägg av bil");

    // Instead of redirect, re-render admin page with updated list
    const { data } = await supabase.from("all_cars").select("*");
    return res.render("admin", { cars: data || [], errorMessage: null });
  } catch (err) {
    console.error(err);
    return sendError(res, "Oväntat fel");
  }
});

app.post("/edit-car", requireLogin, async (req, res) => {
  const { id, car_type, car_name, cargo_space, beds, cost } = req.body;

  if (!id || !car_type || !car_name) return sendError(res, "Biltyp och bilnamn är obligatoriska");

  const isCaravan = checkIfCaravan(car_type);
  const disallowed = checkHasDisallowedValues(isCaravan, cargo_space, beds);
  if (disallowed) return sendError(res, disallowed);

  const updatedCar = {
    car_type,
    car_name,
    cargo_space: cargo_space ? Number(cargo_space) : null,
    beds: beds ? Number(beds) : null,
    cost: cost ? Number(cost) : null,
  };

  try {
    const { error } = await supabase.from("all_cars").update(updatedCar).eq("id", Number(id));
    if (error) return sendError(res, "Fel vid uppdatering av bil");

    const { data } = await supabase.from("all_cars").select("*");
    return res.render("admin", { cars: data || [], errorMessage: null });
  } catch (err) {
    console.error(err);
    return sendError(res, "Oväntat fel");
  }
});


app.post("/delete-car", requireLogin, async (req, res) => {
  const { id } = req.body;
  if (!id) return sendError(res, "Bil-ID är obligatoriskt");

  try {
    const { error } = await supabase.from("all_cars").delete().eq("id", Number(id));
    if (error) return sendError(res, "Fel vid borttagning av bil");
    res.redirect("/admin");
  } catch (err) {
    console.error("Unexpected delete error:", err);
    return sendError(res, "Oväntat fel");
  }
});

// --- Root redirect ---
app.get("/", (req, res) => res.redirect("/admin"));

// --- Start server ---
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Server körs på http://localhost:${PORT}`));
