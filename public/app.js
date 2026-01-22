const form = document.getElementById("registration-form");
const resultsContainer = document.getElementById("results");
const formNote = document.getElementById("form-note");

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
    const card = document.createElement("div");
    card.className = "result-card";
    const labels = row.labels || {
      name: "Name",
      address: "Address",
      country: "Country",
      language: "Language"
    };
    const countryLabel = row.countryLocalized || row.country;
    const languageLabel = row.languageLocalized || row.language;
    const greetingMessage = row.greetingMessage || `${row.greeting}, ${row.name}!`;
    card.innerHTML = `
      <h3>${greetingMessage}</h3>
      <div class="result-meta">${labels.name}: ${row.name}</div>
      <div class="result-meta">${labels.address}: ${row.address}</div>
      <div class="result-meta">${labels.country}: ${countryLabel}</div>
      <div class="result-meta">${labels.language}: ${languageLabel}</div>
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
