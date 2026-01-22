import express from "express";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || "app_user",
  password: process.env.MYSQL_PASSWORD || "app_password",
  database: process.env.MYSQL_DATABASE || "user_greeting",
  connectionLimit: 10
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const countryLanguageMap = {
  Japan: { language: "Japanese", greeting: "こんにちは" },
  France: { language: "French", greeting: "Bonjour" },
  Spain: { language: "Spanish", greeting: "Hola" },
  Germany: { language: "German", greeting: "Hallo" },
  Italy: { language: "Italian", greeting: "Ciao" },
  China: { language: "Chinese", greeting: "你好" },
  Korea: { language: "Korean", greeting: "안녕하세요" },
  Brazil: { language: "Portuguese", greeting: "Olá" },
  India: { language: "Hindi", greeting: "नमस्ते" },
  Canada: { language: "English", greeting: "Hello" },
  "United States": { language: "English", greeting: "Hello" },
  "United Kingdom": { language: "English", greeting: "Hello" }
};

const getGreetingForCountry = (country) => {
  const trimmedCountry = country.trim();
  return (
    countryLanguageMap[trimmedCountry] || {
      language: "English",
      greeting: "Hello"
    }
  );
};

const validateRegistration = (payload) => {
  const errors = [];
  if (!payload.name || payload.name.trim().length < 2) {
    errors.push("Name must be at least 2 characters.");
  }
  if (!payload.address || payload.address.trim().length < 5) {
    errors.push("Address must be at least 5 characters.");
  }
  if (!payload.country || payload.country.trim().length < 2) {
    errors.push("Country must be at least 2 characters.");
  }
  return errors;
};

app.get("/api/registrations", async (req, res) => {
  const [rows] = await pool.query(
    "SELECT id, name, address, country, created_at FROM users ORDER BY created_at DESC"
  );
  res.json(rows);
});

app.post("/api/registrations", async (req, res) => {
  const errors = validateRegistration(req.body);
  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  const { name, address, country } = req.body;
  const [result] = await pool.execute(
    "INSERT INTO users (name, address, country) VALUES (?, ?, ?)",
    [name.trim(), address.trim(), country.trim()]
  );

  const greetingInfo = getGreetingForCountry(country);

  res.status(201).json({
    id: result.insertId,
    name: name.trim(),
    address: address.trim(),
    country: country.trim(),
    greeting: greetingInfo.greeting,
    language: greetingInfo.language
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
