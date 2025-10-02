import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));
app.use(express.urlencoded({ extended: true }));

// Supabase client with service role key (backend only)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

function checkIfCaravan(carType) {
  return (carType === "caravan") ? true : false
}

function checkHasDisallowedValues(isCaravan, cargoSpace, bedsAmount) {
  if (isCaravan) {
    if (cargoSpace) {
      return "Husbilar får inte ha lastutrymme";
    } else if (!bedsAmount) {
      return "Husbilar behöver ett värde för sängar";
    } else {
      return;
    }
  } else {
    if (bedsAmount) {
      return "Små och stora bilar får inte ha sängar";
    } else if (!cargoSpace) {
      return "Små och stora bilar behöver ett värde för lastutrymme";
    } else {
      return;
    }
  }
}

// GET / → lista alla bilar
app.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase.from("all_cars").select("*");
    if (error) {
      console.error("Fetch error:", error.message);
      return res.render("index", { cars: [] });
    }
    res.render("index", { cars: data || [] });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.render("index", { cars: [] });
  }
});

// POST /add-car → lägg till ny bil
app.post("/add-car", async (req, res) => {
  let { car_type, car_name, cargo_space, beds, cost } = req.body;

  if (!car_type || !car_name) {
    return res.status(400).send("Biltyp och bilnamn är obligatoriska");
  }

  let isCaravan = checkIfCaravan(car_type)

  let dissalowedInputValues = checkHasDisallowedValues(isCaravan, cargo_space, beds)

  if (dissalowedInputValues) {
    return res.status(400).send(dissalowedInputValues)
  }

  cargo_space = cargo_space ? Number(cargo_space) : null;
  beds = beds ? Number(beds) : null;
  cost = cost ? Number(cost) : null;

  try {
    const { error } = await supabase.from("all_cars").insert([
      { car_type, car_name, cargo_space, beds, cost }
    ]);
    if (error) {
      console.error("Insert error:", error.message);
      return res.status(500).send("Fel vid tillägg av bil");
    }
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Oväntat fel");
  }
});

// POST /edit-car → uppdatera bil
app.post("/edit-car", async (req, res) => {
  const { id, car_type, car_name, cargo_space, beds, cost } = req.body;

  if (!id || !car_type || !car_name) {
    return res.status(400).send("Biltyp och bilnamn är obligatoriska");
  }

  let isCaravan = checkIfCaravan(car_type)

  let dissalowedInputValues = checkHasDisallowedValues(isCaravan, cargo_space, beds)

  if (dissalowedInputValues) {
    return res.status(400).send(dissalowedInputValues)
  }

  const updatedCar = {
    car_type,
    car_name,
    cargo_space: cargo_space ? Number(cargo_space) : null,
    beds: beds ? Number(beds) : null,
    cost: cost ? Number(cost) : null
  };

  try {
    const { error } = await supabase
      .from("all_cars")
      .update(updatedCar)
      .eq("id", Number(id));

    if (error) {
      console.error("Update error:", error.message);
      return res.status(500).send("Fel vid uppdatering av bil");
    }

    res.redirect("/");
  } catch (err) {
    console.error("Unexpected update error:", err);
    res.status(500).send("Oväntat fel");
  }
});

// POST /delete-car → ta bort bil
app.post("/delete-car", async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).send("Bil-ID är obligatoriskt");

  try {
    const { error } = await supabase.from("all_cars")
      .delete()
      .eq("id", Number(id));
    if (error) {
      console.error("Delete error:", error.message);
      return res.status(500).send("Fel vid borttagning av bil");
    }
    res.redirect("/");
  } catch (err) {
    console.error("Unexpected delete error:", err);
    res.status(500).send("Oväntat fel");
  }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Server körs på http://localhost:${PORT}`));