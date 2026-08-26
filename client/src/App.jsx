import React from "react";
import { Navbar, Footer } from "./components/index.js";
import { AppRoutes } from "./routes/index.js";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />

      <AppRoutes />

      <Footer />
    </div>
  );
}

export default App;
