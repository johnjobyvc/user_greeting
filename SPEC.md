# Specification: User Greeting Registration App

## Goal
Build a web application using **HTML, CSS, and JavaScript** for the UI that lets users register with their name, address, and country, stores the data in MySQL, and displays a localized greeting message in the user's country's official language along with the stored data.

## Functional requirements
- **Registration form**
  - Fields: user name, address, country.
  - All fields are required.
  - Validate inputs (non-empty, reasonable length, and sanitized for storage).
- **Localization**
  - Determine the official language for the submitted country.
  - Display the greeting message in that official language.
  - Example: Japan → Japanese greeting; France → French greeting.
- **Persistence**
  - Store registration data in a MySQL database.
- **Display**
  - Show the stored data on screen together with the localized greeting message.

## Data model
- **users** table
  - `id` (primary key)
  - `name`
  - `address`
  - `country`
  - `created_at`

## UI/UX requirements
- Simple, clean registration form layout in HTML/CSS.
- After submission, show the greeting message and stored record details in a results section.

## Non-functional requirements
- Must run in GitHub Codespaces on Ubuntu 24.04.3 LTS.
- Provide a test server command to start the application.
