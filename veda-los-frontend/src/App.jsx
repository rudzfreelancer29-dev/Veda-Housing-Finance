import React, { useState, useEffect, useCallback } from "react";
import { ToastContainer } from "react-toastify";
import Login from "./Authentication/login";
import Register from "./Authentication/Register";
import ResetPassword from "./Authentication/Reset-Password";
import Admin from "./features/admin/admin";
import Manager from "./features/Manager/Manager";

function getAuthenticatedRole() {
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");
  if (!token) return null;

  const tokenExpiry = sessionStorage.getItem("token_expiry") || localStorage.getItem("token_expiry");
  if (tokenExpiry && Date.now() > Number(tokenExpiry)) {
    sessionStorage.clear();
    localStorage.clear();
    return null;
  }

  try {
    const userStr = sessionStorage.getItem("user") || localStorage.getItem("user") || "{}";
    const user = JSON.parse(userStr);
    const role = (user.role || "").toLowerCase();
    if (role.includes("manager")) return "Manager";
    return "Admin";
  } catch {
    return "Admin";
  }
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  const navigateTo = useCallback((path, replace = false) => {
    if (replace) {
      window.history.replaceState({}, "", path);
    } else {
      window.history.pushState({}, "", path);
    }
    setCurrentPath(path);
  }, []);

  // Handle browser back / forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const authRole = getAuthenticatedRole();
      const path = window.location.pathname.toLowerCase();

      // If authenticated user presses back button to login / root / register
      if (authRole && (path === "/login" || path === "/" || path === "/register")) {
        const dashboardPath = authRole === "Manager" ? "/manager" : "/admin";
        window.history.pushState(null, "", dashboardPath);
        setCurrentPath(dashboardPath);
        return;
      }

      // If unauthenticated user presses forward / back into protected routes
      if (!authRole && (path === "/admin" || path === "/manager")) {
        window.history.replaceState(null, "", "/login");
        setCurrentPath("/login");
        return;
      }

      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    navigateTo("/login", true);
  };

  const renderComponent = () => {
    const authRole = getAuthenticatedRole();
    const path = currentPath.toLowerCase();

    // 1. Reset Password route (always accessible with reset link)
    if (path === "/reset-password" || path.startsWith("/reset-password")) {
      return <ResetPassword onNavigateLogin={() => navigateTo("/login")} />;
    }

    // 2. Register route (accessible if logged out)
    if (path === "/register") {
      if (authRole) {
        const dashboard = authRole === "Manager" ? "/manager" : "/admin";
        return authRole === "Manager" ? (
          <Manager onLogout={handleLogout} />
        ) : (
          <Admin onLogout={handleLogout} />
        );
      }
      return (
        <Register
          onRegister={() => navigateTo("/login")}
          onNavigateLogin={() => navigateTo("/login")}
        />
      );
    }

    // 3. Admin Protected Route
    if (path === "/admin") {
      if (!authRole) {
        return (
          <Login
            onLogin={(credentials) => {
              const target = credentials?.role === "Manager" ? "/manager" : "/admin";
              navigateTo(target, true);
            }}
            onNavigateRegister={() => navigateTo("/register")}
          />
        );
      }
      return <Admin onLogout={handleLogout} />;
    }

    // 4. Manager Protected Route
    if (path === "/manager") {
      if (!authRole) {
        return (
          <Login
            onLogin={(credentials) => {
              const target = credentials?.role === "Manager" ? "/manager" : "/admin";
              navigateTo(target, true);
            }}
            onNavigateRegister={() => navigateTo("/register")}
          />
        );
      }
      return <Manager onLogout={handleLogout} />;
    }

    // 5. Default / Login Route
    // If already authenticated, keep user on their respective dashboard
    if (authRole) {
      if (authRole === "Manager") {
        return <Manager onLogout={handleLogout} />;
      }
      return <Admin onLogout={handleLogout} />;
    }

    return (
      <Login
        onLogin={(credentials) => {
          const target = credentials?.role === "Manager" ? "/manager" : "/admin";
          navigateTo(target, true);
        }}
        onNavigateRegister={() => navigateTo("/register")}
      />
    );
  };

  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 99999 }}
      />
      {renderComponent()}
    </>
  );
}
