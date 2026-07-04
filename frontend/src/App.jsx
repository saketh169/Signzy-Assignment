
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Catalog from './pages/Catalog';
import Creator from './pages/Creator';
import Logs from './pages/Logs';

// Main application component setting up browser-based React routing paths
export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
        <Header />
        
        <main className="max-w-6xl mx-auto w-full px-6 py-8 flex-1 flex flex-col">
          <div className="border border-emerald-200 bg-white rounded-2xl p-6 md:p-8 shadow-xs">
            <Routes>
              {/* Swagger API Docs & testing catalog */}
              <Route path="/" element={<Catalog />} />
              
              {/* Visual configuration builder endpoints */}
              <Route path="/create" element={<Creator />} />
              <Route path="/edit/:id" element={<Creator />} />
              
              {/* Telemetry execution logs view */}
              <Route path="/logs" element={<Logs />} />
            </Routes>
          </div>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
