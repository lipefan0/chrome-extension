import { MemoryRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { storage } from "./lib/storage";

function App() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const token = await storage.get("token");
      if (token) {
        setInitialRoute("/dashboard");
      } else {
        setInitialRoute("/");
      }
    }
    checkAuth();
  }, []);

  if (!initialRoute) return null;

  return (
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </MemoryRouter>
  );
}

export default App;
