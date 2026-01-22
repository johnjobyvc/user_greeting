const form = document.getElementById("registration-form");
const resultsContainer = document.getElementById("results");
const formNote = document.getElementById("form-note");

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

const setError = (field, message) => {
  const error = document.querySelector(`[data-error-for="${field}"]`);
  if (error) {
    error.textContent = message;
  }
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
    const greetingInfo = getGreetingForCountry(row.country);
    const card = document.createElement("div");
    card.className = "result-card";
    card.innerHTML = `
      <h3>${greetingInfo.greeting}, ${row.name}!</h3>
      <div class="result-meta">Language: ${greetingInfo.language}</div>
      <div class="result-meta">${row.address}</div>
      <div class="result-meta">${row.country}</div>
    `;
    resultsContainer.appendChild(card);
  });
};

const loadRegistrations = async () => {
  const response = await fetch("/api/registrations");
  const rows = await response.json();
  renderResults(rows);
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

  const response = await fetch("/api/registrations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const data = await response.json();
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
    formNote.textContent = "Please fix the highlighted errors.";
    return;
  }

  form.reset();
  formNote.textContent = "Registration stored successfully.";
  await loadRegistrations();
});

loadRegistrations();
