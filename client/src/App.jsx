import React from "react";
import { Navbar, Footer } from "./components/index.js";
import { AppRoutes } from "./routes/index.js";

function App() {
  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip bg-background text-occasion-text selection:bg-accent selection:text-white">
      <Navbar />
      <main className="mx-auto box-border w-full min-w-0 max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
}

export default App;
