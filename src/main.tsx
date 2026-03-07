import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Login from "./Login.tsx";
import Home from "./Home";
import { Toaster } from "./components/ui/sonner";
import type { User } from "./utils/interfaces";
import { logout, getStoredUser, isAuthenticated } from "./services/authService";

export function App() {
  const [user, setUser] = useState<User | null>(getStoredUser);

  function handleLogout() {
    logout();
    setUser(null);
  }

  return user && isAuthenticated() ? (
    <Home onLogout={handleLogout} />
  ) : (
    <Login onAuth={(u) => setUser(u)} />
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <Toaster position="top-right" richColors closeButton />
  </StrictMode>,
);
