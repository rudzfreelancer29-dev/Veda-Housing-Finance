import React, { useState, useEffect } from "react";
import Login from "./Authentication/login";
import Admin from "./features/admin/admin";

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
  };

  // If URL path is /login, render Login screen
  if (currentPath === "/login") {
    return (
      <Login
        onLogin={(credentials) => {
          navigateTo("/admin");
        }}
      />
    );
  }

  // Default / /admin route renders Admin Dashboard
  return <Admin />;
}
