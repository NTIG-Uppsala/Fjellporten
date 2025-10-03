import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();

// Create __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use("/admin", express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 30 }, // 0.5h
  })
);

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// --- Helpers ---
function requireLogin(req, res, next) {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/admin/login");
  }
}

function checkIfCaravan(carType) {
  return carType === "caravan";
}

function checkHasDisallowedValues(isCaravan, cargoSpace, bedsAmount) {
  if (isCaravan) {
    if (cargoSpace) {
      return "Husbilar får inte ha lastutrymme";
    } else if (!bedsAmount) {
      return "Husbilar behöver ett värde för sängar";
    }
  } else {
    if (bedsAmount) {
      return "Små och stora bilar får inte ha sängar";
    } else if (!cargoSpace) {
      return "Små och stora bilar behöver ett värde för lastutrymme";
    }
  }
  return null;
}

function sendError(res, statusCode, message) {
  return res.status(statusCode).render("error", { message });
}

function sendUnknownError(res) {
  sendError(res, 500, "Oväntat fel");
}

function redirectAdmin(res) {
  res.redirect("/admin");
}

// --- Auth routes ---
app.get("/admin/login", (req, res) => {
  res.render("login", { error: "", username: "", focus: "username" });
});

app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (
    username === process.env.ADMIN_NAME &&
    password === process.env.ADMIN_PASS
  ) {
    req.session.loggedIn = true;
    redirectAdmin(res)
  } else {
    res.render("login", {
      error: "Fel användarnamn eller lösenord.",
      username,
      focus: "password",
    });
  }
});

app.get("/admin/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/admin/login"));
});

// --- Admin dashboard (protected) ---
app.get("/admin", requireLogin, async (req, res) => {
  try {
    const { data, error } = await supabase.from("all_cars").select("*");
    if (error) {
      console.error("Fetch error:", error.message);
      return res.render("admin", { cars: [] });
    }
    res.render("admin", { cars: data || [] });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.render("admin", { cars: [] });
  }
});

// --- Car management ---
app.post("/add-car", requireLogin, async (req, res) => {
  let { car_type, car_name, cargo_space, beds, cost } = req.body;

  if (!car_type || !car_name || !cost) {
    return sendError(res, 400, "Biltyp, bilnamn och kostnad är obligatoriska")
  }

  let isCaravan = checkIfCaravan(car_type);
  let disallowed = checkHasDisallowedValues(isCaravan, cargo_space, beds);

  if (disallowed) return sendError(res, 400, disallowed);

  cargo_space = cargo_space ? Number(cargo_space) : null;
  beds = beds ? Number(beds) : null;

  try {
    const { error } = await supabase
      .from("all_cars")
      .insert([{ car_type, car_name, cargo_space, beds, cost }]);
    if (error) {
      console.error("Insert error:", error.message);
      return sendError(res, 500, "Fel vid tillägg av bil")
    }
    redirectAdmin(res);
  } catch (err) {
    console.error(err);
    sendUnknownError(res);
  }
});

app.post("/edit-car", requireLogin, async (req, res) => {
  const { id, car_type, car_name, cargo_space, beds, cost } = req.body;

  if (!id || !car_type || !car_name || !cost) {
    return sendError(res, 400, "Biltyp, bilnamn och kostnad är obligatoriska")
  }

  let isCaravan = checkIfCaravan(car_type);
  let disallowed = checkHasDisallowedValues(isCaravan, cargo_space, beds);
  if (disallowed) return sendError(res, 400, disallowed);

  const updatedCar = {
    car_type,
    car_name,
    cargo_space: cargo_space ? Number(cargo_space) : null,
    beds: beds ? Number(beds) : null,
    cost,
  };

  try {
    const { error } = await supabase
      .from("all_cars")
      .update(updatedCar)
      .eq("id", Number(id));

    if (error) {
      console.error("Update error:", error.message);
      return sendError(res, 500, "Fel vid uppdatering av bil")
    }

    redirectAdmin(res);
  } catch (err) {
    console.error("Unexpected update error:", err);
    sendUnknownError(res);
  }
});

app.post("/delete-car", requireLogin, async (req, res) => {
  const { id } = req.body;
  if (!id) return sendError(res, 400, "Bil-ID är obligatoriskt")

  try {
    const { error } = await supabase.from("all_cars").delete().eq("id", Number(id));
    if (error) {
      console.error("Delete error:", error.message);
      return sendError(res, 500, "Fel vid borttagning av bil")
    }
    redirectAdmin(res);
  } catch (err) {
    console.error("Unexpected delete error:", err);
    sendUnknownError(res);
  }
});

// --- Root redirect ---
app.get("/", (req, res) => res.redirect("/admin"));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () =>
  console.log(`Server körs på http://localhost:${PORT}`)
);
