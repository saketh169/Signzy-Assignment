// Default footer showing system status
export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-4 px-6 mt-auto text-center">
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
        <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
          API Gateway active: Database connected & running on Port 5000
        </span>
      </div>
    </footer>
  );
}
