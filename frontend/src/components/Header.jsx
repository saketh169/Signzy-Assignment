import { Link, useLocation } from 'react-router-dom';
import { BookOpen, PlusCircle, History } from 'lucide-react';

// Platform top navigation header using clean emerald green styling with react-router links
export default function Header() {
  const location = useLocation();
  const currentPath = location.pathname;

  const tabs = [
    { path: '/', label: 'API Catalog & Docs', icon: BookOpen },
    { path: '/create', label: 'API Creator', icon: PlusCircle },
    { path: '/logs', label: 'Execution History', icon: History }
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand identity */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-95 transition-opacity">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
            <BookOpen className="text-white" size={20} />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-lg font-bold text-slate-800 leading-tight">Signzy Assignment</h1>
            <p className="text-[10px] text-emerald-600 font-bold tracking-wider uppercase">API Creator & Documentation Portal</p>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-lg border border-slate-200/40">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentPath === tab.path || (tab.path === '/create' && currentPath.startsWith('/edit'));
            
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-emerald-600 shadow-sm border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-emerald-500' : 'text-slate-400'} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
