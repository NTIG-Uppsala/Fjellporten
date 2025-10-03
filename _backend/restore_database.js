import express from "express";
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

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const originalDatabase = 
[
  {id: 22, car_name: 'åäö', cost: 2222, cargo_space: 3, beds: null, car_type: 'small_car'},
  {id: 1, car_name: 'Ford Fiesta EcoBoost', cost: 450, cargo_space: 290, beds: null, car_type: 'small_car'},
  {id: 21, car_name: 'testCar', cost: 321, cargo_space: null, beds: 2, car_type: 'caravan'},
  {id: 2, car_name: 'Kia Picanto', cost: 360, cargo_space: 255, beds: null, car_type: 'small_car'},
  {id: 3, car_name: 'Peugeot 208', cost: 430, cargo_space: 310, beds: null, car_type: 'small_car'},
  {id: 4, car_name: 'Renault Clio', cost: 400, cargo_space: 320, beds: null, car_type: 'small_car'},
  {id: 5, car_name: 'Toyota Yaris 1.5 Hybrid', cost: 520, cargo_space: 286, beds: null, car_type: 'small_car'},
  {id: 6, car_name: 'Volkswagen Polo TSI', cost: 480, cargo_space: 351, beds: null, car_type: 'small_car'},
  {id: 7, car_name: 'Audi A4 Avant', cost: 980, cargo_space: 495, beds: null, car_type: 'big_car'},
  {id: 8, car_name: 'BMW 320d Touring', cost: 1000, cargo_space: 500, beds: null, car_type: 'big_car'},
  {id: 9, car_name: 'Mercedes-Benz GLC', cost: 1200, cargo_space: 550, beds: null, car_type: 'big_car'},
  {id: 10, car_name: 'Skoda Kodiaq 7-sits', cost: 1100, cargo_space: 770, beds: null, car_type: 'big_car'},
  {id: 11, car_name: 'Volkswagen Passat Variant', cost: 900, cargo_space: 650, beds: null, car_type: 'big_car'},
  {id: 12, car_name: 'Volvo XC60 D4 AWD', cost: 1050, cargo_space: 505, beds: null, car_type: 'big_car'},
  {id: 13, car_name: 'Adria Coral XL', cost: 1800, cargo_space: null, beds: 4, car_type: 'caravan'},
  {id: 14, car_name: 'Bürstner Lyseo TD', cost: 1900, cargo_space: null, beds: 4, car_type: 'caravan'},
  {id: 15, car_name: 'Dethleffs Globebus', cost: 1600, cargo_space: null, beds: 3, car_type: 'caravan'},
  {id: 16, car_name: 'Hymer B-Class Modern Comfort', cost: 2200, cargo_space: null, beds: 5, car_type: 'caravan'},
  {id: 17, car_name: 'Knaus BoxStar Camper Van', cost: 1400, cargo_space: null, beds: 2, car_type: 'caravan'},
  {id: 18, car_name: 'Sunlight A72', cost: 2400, cargo_space: null, beds: 6, car_type: 'caravan'},
  {id: 20, car_name: 'testCar', cost: 321, cargo_space: 3, beds: null, car_type: 'big_car'},
  {id: 19, car_name: 'testCar', cost: 321, cargo_space: 123, beds: null, car_type: 'small_car'},
  {id: 23, car_name: 'äää', cost: 1, cargo_space: null, beds: 2, car_type: 'caravan'}
]

let isDevServer = process.env.IS_DEV_SERVER === "true"

if(isDevServer) {
    await supabase.from("all_cars").delete().neq("cost", 0);

    await supabase.from("all_cars").insert(originalDatabase);
}