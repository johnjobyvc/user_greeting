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
  japan: { language: "Japanese", greeting: "こんにちは" },
  france: { language: "French", greeting: "Bonjour" },
  spain: { language: "Spanish", greeting: "Hola" },
  germany: { language: "German", greeting: "Hallo" },
  italy: { language: "Italian", greeting: "Ciao" },
  china: { language: "Chinese", greeting: "你好" },
  korea: { language: "Korean", greeting: "안녕하세요" },
  brazil: { language: "Portuguese", greeting: "Olá" },
  india: { language: "Hindi", greeting: "नमस्ते" },
  canada: { language: "English", greeting: "Hello" },
  "united states": { language: "English", greeting: "Hello" },
  "united kingdom": { language: "English", greeting: "Hello" }
};

const normalizeCountry = (country) => country.trim().toLowerCase();

const getGreetingForCountry = (country) => {
  const normalized = normalizeCountry(country);
  return (
    countryLanguageMap[normalized] || {
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

const ensureSchema = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      address VARCHAR(255) NOT NULL,
      country VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

app.get("/api/registrations", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, address, country, created_at FROM users ORDER BY created_at DESC"
    );
    const withGreetings = rows.map((row) => {
      const greetingInfo = getGreetingForCountry(row.country);
      return {
        ...row,
        greeting: greetingInfo.greeting,
        language: greetingInfo.language
      };
    });
    res.json(withGreetings);
  } catch (error) {
    res.status(500).json({
      error: "Unable to load registrations.",
      detail: error.message
    });
  }
});

app.post("/api/registrations", async (req, res) => {
  const errors = validateRegistration(req.body);
  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  const { name, address, country } = req.body;
  try {
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
  } catch (error) {
    res.status(500).json({
      error: "Unable to save registration.",
      detail: error.message
    });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

ensureSchema()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database schema:", error.message);
    process.exit(1);
  });
