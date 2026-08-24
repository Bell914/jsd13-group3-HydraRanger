import React from 'react';
import { Navbar, Footer } from './components/index.js';
import { AppRoutes } from './routes/index.js';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
}

export default App;
