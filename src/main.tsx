import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Login from "./Login.tsx";
import Home from "./Home";
import { Toaster } from "./components/ui/sonner";
import ErrorBoundary from "./components/ErrorBoundary";
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

const container = document.getElementById("root")! as HTMLElement & {
  __root?: ReturnType<typeof createRoot>;
};
const root = container.__root ?? createRoot(container);
container.__root = root;

root.render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
    <Toaster position="top-right" richColors closeButton />
  </StrictMode>,
);
