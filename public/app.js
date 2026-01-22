const form = document.getElementById("registration-form");
const resultsContainer = document.getElementById("results");
const formNote = document.getElementById("form-note");

const setError = (field, message) => {
  const error = document.querySelector(`[data-error-for="${field}"]`);
  if (error) {
    error.textContent = message;
  }
};

const localizedLabels = {
  en: {
    name: "Name",
    address: "Address",
    country: "Country",
    language: "Language"
  },
  fr: {
    name: "Nom",
    address: "Adresse",
    country: "Pays",
    language: "Langue"
  },
  es: {
    name: "Nombre",
    address: "Dirección",
    country: "País",
    language: "Idioma"
  },
  de: {
    name: "Name",
    address: "Adresse",
    country: "Land",
    language: "Sprache"
  },
  it: {
    name: "Nome",
    address: "Indirizzo",
    country: "Paese",
    language: "Lingua"
  },
  ja: {
    name: "お名前",
    address: "住所",
    country: "国",
    language: "言語"
  },
  zh: {
    name: "姓名",
    address: "地址",
    country: "国家",
    language: "语言"
  },
  ko: {
    name: "이름",
    address: "주소",
    country: "국가",
    language: "언어"
  },
  pt: {
    name: "Nome",
    address: "Endereço",
    country: "País",
    language: "Idioma"
  },
  hi: {
    name: "नाम",
    address: "पता",
    country: "देश",
    language: "भाषा"
  }
};

const getLabels = (languageCode = "en") =>
  localizedLabels[languageCode] || localizedLabels.en;

const getDisplayName = (type, code, locale) => {
  if (!code) {
    return "";
  }
  if (typeof Intl !== "undefined" && Intl.DisplayNames) {
    const display = new Intl.DisplayNames([locale], { type });
    return display.of(code) || code;
  }
  return code;
};

const clearErrors = () => {
  document.querySelectorAll(".error").forEach((node) => {
    node.textContent = "";
  });
};

const renderResults = (rows) => {
  resultsContainer.innerHTML = "";
  if (!rows.length) {
    resultsContainer.innerHTML = "<p class=\"subtitle\">No registrations yet.</p>";
    return;
  }

  rows.forEach((row) => {
    const card = document.createElement("div");
    card.className = "result-card";
    const locale = row.locale || "en-US";
    const languageCode = row.languageCode || "en";
    const labels = getLabels(languageCode);
    const localizedCountry =
      getDisplayName("region", row.countryCode, locale) || row.country;
    const localizedLanguage =
      getDisplayName("language", languageCode, locale) || row.language;
    card.innerHTML = `
      <h3>${row.greeting}, ${row.name}!</h3>
      <div class="result-meta">${labels.language}: ${localizedLanguage}</div>
      <div class="result-meta">${labels.name}: ${row.name}</div>
      <div class="result-meta">${labels.address}: ${row.address}</div>
      <div class="result-meta">${labels.country}: ${localizedCountry}</div>
    `;
    resultsContainer.appendChild(card);
  });
};

const loadRegistrations = async () => {
  try {
    const response = await fetch("/api/registrations");
    if (!response.ok) {
      throw new Error("Unable to load registrations.");
    }
    const rows = await response.json();
    renderResults(rows);
  } catch (error) {
    resultsContainer.innerHTML = `<p class="subtitle">${error.message}</p>`;
  }
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearErrors();
  formNote.textContent = "";

  const payload = {
    name: form.name.value.trim(),
    address: form.address.value.trim(),
    country: form.country.value.trim()
  };

  const errors = [];
  if (payload.name.length < 2) {
    errors.push({ field: "name", message: "Name must be at least 2 characters." });
  }
  if (payload.address.length < 5) {
    errors.push({
      field: "address",
      message: "Address must be at least 5 characters."
    });
  }
  if (payload.country.length < 2) {
    errors.push({
      field: "country",
      message: "Country must be at least 2 characters."
    });
  }

  if (errors.length) {
    errors.forEach((error) => setError(error.field, error.message));
    return;
  }

  try {
    const response = await fetch("/api/registrations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      if (data.errors) {
        data.errors.forEach((message) => {
          if (message.toLowerCase().includes("name")) {
            setError("name", message);
          } else if (message.toLowerCase().includes("address")) {
            setError("address", message);
          } else if (message.toLowerCase().includes("country")) {
            setError("country", message);
          }
        });
      }
      formNote.textContent = data.error || "Please fix the highlighted errors.";
      return;
    }

    form.reset();
    formNote.textContent = "Registration stored successfully.";
    await loadRegistrations();
  } catch (error) {
    formNote.textContent = "Unable to save registration.";
  }
});

loadRegistrations();
