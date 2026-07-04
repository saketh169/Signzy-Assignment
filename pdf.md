# SIGNZY FLOW - PROJECT SUBMISSION REPORT

## 🔗 GitHub Repository
Repository Link: https://github.com/saketh169/Signzy-Assignment.git

---

## 🛠️ Tech Stack
Frontend: React (Vite), React Router, Axios, Tailwind CSS, Lucide React
Backend: Node.js, Express, Mongoose (MongoDB)
Database: MongoDB (Local Instance)

---

## 📁 Source Code Files

### Backend (backend/)
src/
  db.js: Connects backend to local MongoDB database.
  server.js: Entry point initiating Express gateway server.
  models/
    APIModel.js: Defines mongoose schema for custom dynamic configurations.
    LogModel.js: Schema logging execution latencies and steps logs.
  controllers/
    APIController.js: Contains CRUD logic and step executions runner.
    LogController.js: Compiles metrics stats and execution logs.
  routes/
    APIRoutes.js: Mounts dynamic routers and downstream mock APIs.
  utils/
    APIHelper.js: Utility template parser resolving request variables.

### Frontend (frontend/)
vite.config.js: Vite configuration mapping relative /api proxy target.
index.html: Entry HTML file carrying BookOpen favicon and site title.
src/
  App.jsx: Main routing container wrapping active pages inside a green border layout.
  main.jsx: React bundler DOM entry point file.
  services/
    api.js: Unified Axios HTTP client requesting backend gateway.
  components/
    Header.jsx: Branding navigation header utilizing custom green logo.
    Footer.jsx: Simple status footer bar.
  pages/
    Catalog.jsx: Swagger-style documentation hub that generates testing fields.
    Creator.jsx: API builder form displaying three prefilled reference layout boxes.
    Logs.jsx: Traces log explorer displaying transaction histories.

---

## 📸 Screenshots
(Insert application UI screenshots here)
API Catalog & Documentation Console
Dynamic API Creator Builder Form
Visual Reference Examples (POST, GET, PUT)
Real-time Execution History & Call Stack Logs

---

## 🧪 Test API Verification Examples
Refer to test-api.md for verification examples.
