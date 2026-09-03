import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import Login from "./Authentication/login";
import Register from "./Authentication/Register";
import Admin from "./features/admin/admin";
import Manager from "./features/Manager/Manager";

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

  const renderComponent = () => {
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

    if (currentPath === "/admin") {
      return <Admin onLogout={() => navigateTo("/login")} />;
    }

    if (currentPath === "/manager") {
      return <Manager onLogout={() => navigateTo("/login")} />;
    }

    return (
      <Login
        onLogin={(credentials) => {
          if (credentials?.role === "Manager") {
            navigateTo("/manager");
          } else {
            navigateTo("/admin");
          }
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
