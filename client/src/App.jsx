import React from "react";
import { ApiSwitcher, Footer, Navbar } from "./components/index.js";
import ScrollToTop from "./components/ScrollToTop.jsx";
import { AppRoutes } from "./routes/index.js";

function App() {
  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip bg-background text-occasion-text selection:bg-accent selection:text-white">
      <ScrollToTop />
      <Navbar />
      <AppRoutes />
      <Footer />
      <ApiSwitcher />
    </div>
  );
}

export default App;
