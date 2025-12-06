import React from "react";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";

export function App() {
  const [currentPath, setCurrentPath] = React.useState(
    window.location.pathname
  );

  React.useEffect(() => {
    // Listen for navigation changes
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Simple client-side routing
  const renderPage = () => {
    if (currentPath.includes("/login")) {
      return <Login />;
    } else if (currentPath.includes("/dashboard")) {
      return <Dashboard />;
    } else {
      // Default to login if no specific route
      return <Login />;
    }
  };

  return <div id="cms-app">{renderPage()}</div>;
}
