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
  japan: {
    language: "Japanese",
    languageLocalized: "日本語",
    greeting: "こんにちは",
    greetingTemplate: "{greeting}、{name}さん！",
    locale: "ja-JP",
    countryLocalized: "日本",
    labels: { name: "名前", address: "住所", country: "国", language: "言語" }
  },
  france: {
    language: "French",
    languageLocalized: "Français",
    greeting: "Bonjour",
    greetingTemplate: "{greeting}, {name} !",
    locale: "fr-FR",
    countryLocalized: "France",
    labels: { name: "Nom", address: "Adresse", country: "Pays", language: "Langue" }
  },
  spain: {
    language: "Spanish",
    languageLocalized: "Español",
    greeting: "Hola",
    greetingTemplate: "¡{greeting}, {name}!",
    locale: "es-ES",
    countryLocalized: "España",
    labels: { name: "Nombre", address: "Dirección", country: "País", language: "Idioma" }
  },
  germany: {
    language: "German",
    languageLocalized: "Deutsch",
    greeting: "Hallo",
    greetingTemplate: "{greeting}, {name}!",
    locale: "de-DE",
    countryLocalized: "Deutschland",
    labels: { name: "Name", address: "Adresse", country: "Land", language: "Sprache" }
  },
  italy: {
    language: "Italian",
    languageLocalized: "Italiano",
    greeting: "Ciao",
    greetingTemplate: "{greeting}, {name}!",
    locale: "it-IT",
    countryLocalized: "Italia",
    labels: { name: "Nome", address: "Indirizzo", country: "Paese", language: "Lingua" }
  },
  china: {
    language: "Chinese",
    languageLocalized: "中文",
    greeting: "你好",
    greetingTemplate: "{greeting}，{name}！",
    locale: "zh-CN",
    countryLocalized: "中国",
    labels: { name: "姓名", address: "地址", country: "国家", language: "语言" }
  },
  korea: {
    language: "Korean",
    languageLocalized: "한국어",
    greeting: "안녕하세요",
    greetingTemplate: "{greeting}, {name}님!",
    locale: "ko-KR",
    countryLocalized: "대한민국",
    labels: { name: "이름", address: "주소", country: "국가", language: "언어" }
  },
  brazil: {
    language: "Portuguese",
    languageLocalized: "Português",
    greeting: "Olá",
    greetingTemplate: "{greeting}, {name}!",
    locale: "pt-BR",
    countryLocalized: "Brasil",
    labels: { name: "Nome", address: "Endereço", country: "País", language: "Idioma" }
  },
  india: {
    language: "Hindi",
    languageLocalized: "हिन्दी",
    greeting: "नमस्ते",
    greetingTemplate: "{greeting} {name}!",
    locale: "hi-IN",
    countryLocalized: "भारत",
    labels: { name: "नाम", address: "पता", country: "देश", language: "भाषा" }
  },
  canada: {
    language: "English",
    languageLocalized: "English",
    greeting: "Hello",
    greetingTemplate: "{greeting}, {name}!",
    locale: "en-CA",
    countryLocalized: "Canada",
    labels: { name: "Name", address: "Address", country: "Country", language: "Language" }
  },
  "united states": {
    language: "English",
    languageLocalized: "English",
    greeting: "Hello",
    greetingTemplate: "{greeting}, {name}!",
    locale: "en-US",
    countryLocalized: "United States",
    labels: { name: "Name", address: "Address", country: "Country", language: "Language" }
  },
  "united kingdom": {
    language: "English",
    languageLocalized: "English",
    greeting: "Hello",
    greetingTemplate: "{greeting}, {name}!",
    locale: "en-GB",
    countryLocalized: "United Kingdom",
    labels: { name: "Name", address: "Address", country: "Country", language: "Language" }
  }
};

const normalizeCountry = (country) => country.trim().toLowerCase();

const getGreetingForCountry = (country) => {
  const normalized = normalizeCountry(country);
  return (
    countryLanguageMap[normalized] || {
      language: "English",
      languageLocalized: "English",
      greeting: "Hello",
      greetingTemplate: "{greeting}, {name}!",
      locale: "en-US",
      countryLocalized: country.trim(),
      labels: { name: "Name", address: "Address", country: "Country", language: "Language" }
    }
  );
};

const formatGreetingMessage = (greetingInfo, name) => {
  const template = greetingInfo.greetingTemplate || "{greeting}, {name}!";
  return template
    .replace("{greeting}", greetingInfo.greeting)
    .replace("{name}", name.trim());
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
        greetingMessage: formatGreetingMessage(greetingInfo, row.name),
        language: greetingInfo.language,
        languageLocalized: greetingInfo.languageLocalized,
        locale: greetingInfo.locale,
        countryLocalized: greetingInfo.countryLocalized,
        labels: greetingInfo.labels
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
      greetingMessage: formatGreetingMessage(greetingInfo, name),
      language: greetingInfo.language,
      languageLocalized: greetingInfo.languageLocalized,
      locale: greetingInfo.locale,
      countryLocalized: greetingInfo.countryLocalized,
      labels: greetingInfo.labels
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
