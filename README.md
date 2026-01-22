# User Greeting Registration App

## Project overview
The User Greeting Registration App is a lightweight web application that collects a user's name, address, and country, stores the registration data in a MySQL database, and displays a localized greeting message in the user's country's official language alongside the stored data. The UI is built with plain HTML, CSS, and JavaScript, while a Node.js server provides validation and persistence.

## Installation
These steps assume GitHub Codespaces on **Ubuntu 24.04.3 LTS**.

1. Clone the repository in your Codespace:
   ```bash
   git clone <your-repo-url>
   cd user_greeting
   ```
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your MySQL connection settings:
   ```env
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USER=app_user
   MYSQL_PASSWORD=app_password
   MYSQL_DATABASE=user_greeting
   ```
4. Ensure a MySQL server is available in Codespaces (local or remote), create the database, and apply the schema:
   ```sql
   CREATE DATABASE user_greeting;
   ```
   ```bash
   mysql -u app_user -p user_greeting < db/schema.sql
   ```

## Running the app
### Start the test server
1. Start the Node.js server:
   ```bash
   npm run dev
   ```
2. Open the forwarded port in Codespaces to view the UI (default port is `3000`).

## Design checks
If you make a UI change, run the app and take a screenshot in the browser to verify layout and styling.
