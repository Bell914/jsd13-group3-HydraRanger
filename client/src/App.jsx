import React from "react";
import { Navbar, Footer } from "./components/index.js";
import { AppRoutes } from "./routes/index.js";

function App() {
  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip bg-background text-occasion-text selection:bg-accent selection:text-white">
      <Navbar />

      <AppRoutes />

      <Footer />
    </div>
  );
}

export default App;
