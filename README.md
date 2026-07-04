# SIGNZY FLOW - API CREATOR & DOCUMENTATION PORTAL

This project consists of a backend gateway engine and a frontend Swagger console portal. The backend is a Node.js-based server, while the frontend is a React application.

---

## Project Structure

This project consists of a backend and frontend setup:

- **`backend/`**: Root directory for the backend.
  - **`node_modules/`**: Contains backend dependencies.
  - **`package-lock.json`**: Locks dependency versions.
  - **`package.json`**: Manages dependencies and scripts.
  - **`src/`**: Contains backend source code.
    - **`controllers/`**: Houses controller logic for API requests and dynamic step integration runs.
    - **`models/`**: Holds Mongoose database schemas for API configurations and telemetry logs.
    - **`routes/`**: Defines dynamic gateway routing paths and downstream method-aware mock APIs.
    - **`utils/`**: Utility template parser resolving request placeholders.
    - **`db.js`**: Database configuration establishing connection to local MongoDB.
    - **`server.js`**: Entry point initiating the Express gateway server on Port 5000.

- **`frontend/`**: Root directory for the frontend.
  - **`node_modules/`**: Contains frontend dependencies.
  - **`public/`**: Holds static files and assets.
  - **`eslint.config.js`**: ESLint configuration for linting.
  - **`index.html`**: Main HTML entry carrying the BookOpen emerald green favicon and site title.
  - **`package-lock.json`**: Locks dependency versions.
  - **`package.json`**: Manages dependencies and scripts.
  - **`vite.config.js`**: Vite configuration mapping the relative /api proxy target to bypass CORS.
  - **`src/`**: Contains React source code.
    - **`App.jsx`**: Main routing container wrapping active pages inside a green border layout.
    - **`main.jsx`**: React bundler DOM entry point file.
    - **`components/`**: Houses site layout components.
      - **`Header.jsx`**: Branding navigation header utilizing custom green logo.
      - **`Footer.jsx`**: Simple status footer bar.
    - **`pages/`**: Modular page components.
      - **`Catalog.jsx`**: Swagger-style documentation hub that generates input fields for dynamic testing.
      - **`Creator.jsx`**: API builder form displaying three prefilled reference layout boxes.
      - **`Logs.jsx`**: Traces log explorer displaying transaction histories.
    - **`services/`**: Contains API request wrappers.
      - **`api.js`**: Unified Axios HTTP client requesting backend gateway routes.

---

## Color Scheme

- **Primary Accent**: Emerald Green (`#059669`) for status indicators, brand logos, and main page borders.
- **Secondary Highlight**: Slate-Grey (`#cbd5e1`) for card outlines and inputs.
- **Status Colors**: Blue for GET method badges, light green for POST, and rose-pink for failed execution logs.

---

## 🚀 How to Run Locally

### 1. Launch the Backend
```bash
cd backend
npm run dev
```

### 2. Launch the Frontend
```bash
cd frontend
npm run dev
```

Explore the dashboard interface at `http://localhost:5173`.
