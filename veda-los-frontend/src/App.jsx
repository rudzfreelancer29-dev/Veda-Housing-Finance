import React, { useState, useEffect } from "react";
import Login from "./Authentication/login";
import Register from "./Authentication/Register";
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

  // If URL path is /register, render Register screen
  if (currentPath === "/register") {
    return (
      <Register
          onRegister={(data) => {
          navigateTo("/login");
        }}
        onNavigateLogin={() => navigateTo("/login")}
      />
    );
  }

  // If URL path is /admin, render Admin Dashboard
  if (currentPath === "/admin") {
    return <Admin />;
  }

  // Default route (root "/" or "/login") renders Login screen
  return (
    <Login
      onLogin={(credentials) => {
        navigateTo("/admin");
      }}
      onNavigateRegister={() => navigateTo("/register")}
    />
  );
}
