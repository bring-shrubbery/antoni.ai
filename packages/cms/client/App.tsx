import React from "react";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Setup } from "./pages/Setup";

type SetupStatus = {
  isSetupComplete: boolean;
  hasSuperadmin: boolean;
  error?: string;
};

type AuthStatus = {
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export function App() {
  const [currentPath, setCurrentPath] = React.useState(
    window.location.pathname
  );
  const [setupStatus, setSetupStatus] = React.useState<SetupStatus | null>(
    null
  );
  const [authStatus, setAuthStatus] = React.useState<AuthStatus | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Check setup status and auth status on mount
  React.useEffect(() => {
    const checkStatus = async () => {
      try {
        // Check setup status
        const setupResponse = await fetch("/admin/api/trpc/setup.getStatus", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const setupData = await setupResponse.json();

        // Handle superjson format: result.data.json
        const data = setupData.result?.data?.json ?? setupData.result?.data;
        if (data) {
          setSetupStatus(data);
        } else {
          setSetupStatus({
            isSetupComplete: false,
            hasSuperadmin: false,
          });
        }

        // Check auth status (session)
        const sessionResponse = await fetch("/admin/api/auth/get-session", {
          method: "GET",
          credentials: "include",
        });

        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          if (sessionData?.user) {
            setAuthStatus({
              isAuthenticated: true,
              user: sessionData.user,
            });
          } else {
            setAuthStatus({
              isAuthenticated: false,
              user: null,
            });
          }
        } else {
          setAuthStatus({
            isAuthenticated: false,
            user: null,
          });
        }
      } catch (error) {
        console.error("Failed to check status:", error);
        setSetupStatus({
          isSetupComplete: false,
          hasSuperadmin: false,
          error: "Failed to connect to server",
        });
        setAuthStatus({
          isAuthenticated: false,
          user: null,
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, []);

  React.useEffect(() => {
    // Listen for navigation changes
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Handle setup completion
  const handleSetupComplete = () => {
    setSetupStatus({
      isSetupComplete: true,
      hasSuperadmin: true,
    });
    // Navigate to login
    window.history.pushState({}, "", "/admin/login");
    setCurrentPath("/admin/login");
  };

  // Handle successful login
  const handleLoginSuccess = (user: AuthStatus["user"]) => {
    setAuthStatus({
      isAuthenticated: true,
      user,
    });
    // Navigate to dashboard
    window.history.pushState({}, "", "/admin/dashboard");
    setCurrentPath("/admin/dashboard");
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch("/admin/api/auth/sign-out", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
    setAuthStatus({
      isAuthenticated: false,
      user: null,
    });
    window.history.pushState({}, "", "/admin/login");
    setCurrentPath("/admin/login");
  };

  // Loading state
  if (isLoading) {
    return (
      <div id="cms-app">
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <svg
              className="animate-spin h-8 w-8 text-blue-600 mx-auto"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="mt-4 text-gray-600">Loading CMS...</p>
          </div>
        </div>
      </div>
    );
  }

  // Simple client-side routing
  const renderPage = () => {
    // If setup is not complete, show setup page
    if (!setupStatus?.isSetupComplete) {
      return <Setup onComplete={handleSetupComplete} />;
    }

    // If user is authenticated, show dashboard (unless explicitly on login page after logout)
    if (authStatus?.isAuthenticated) {
      return <Dashboard user={authStatus.user} onLogout={handleLogout} />;
    }

    // Not authenticated, show login
    return <Login onLoginSuccess={handleLoginSuccess} />;
  };

  return <div id="cms-app">{renderPage()}</div>;
}
