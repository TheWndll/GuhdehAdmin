import React from "react";
import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import AuthLayout from "./layouts/AuthLayout";
import UnauthLayout from "./layouts/UnauthLayout";
// Splash & Auth screens
import SplashOne from "./pages/(unauth)/splash/SplashOne";
import SplashTwo from "./pages/(unauth)/splash/SplashTwo";
import GetStarted from "./pages/(unauth)/get-started";
import Login from "./pages/(unauth)/login";
import Signup from "./pages/(unauth)/signup";
// Requester/Runner
import RequesterWallet from "./pages/requester/Wallet";
import RunnerWallet from "./pages/runner/Wallet";
import MyErrands from "./pages/requester/MyErrands";
import NotFound from "@/pages/not-found";

// Optional: Reusable wrapper for protected + auth layout
function ProtectedAuthRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AuthLayout>{children}</AuthLayout>
    </ProtectedRoute>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public (Unauth) layout for splash/auth screens */}
      <Route path="/">
        <UnauthLayout>
          <SplashOne />
        </UnauthLayout>
      </Route>
      <Route path="/splash-two">
        <UnauthLayout>
          <SplashTwo />
        </UnauthLayout>
      </Route>
      <Route path="/get-started">
        <UnauthLayout>
          <GetStarted />
        </UnauthLayout>
      </Route>
      <Route path="/login">
        <UnauthLayout>
          <Login />
        </UnauthLayout>
      </Route>
      <Route path="/signup">
        <UnauthLayout>
          <Signup />
        </UnauthLayout>
      </Route>

      {/* Authenticated routes for requester/runner */}
      <Route path="/requester/wallet">
        <ProtectedAuthRoute>
          <RequesterWallet />
        </ProtectedAuthRoute>
      </Route>
      <Route path="/runner/wallet">
        <ProtectedAuthRoute>
          <RunnerWallet />
        </ProtectedAuthRoute>
      </Route>
      <Route path="/requester/my-errands">
        <ProtectedAuthRoute>
          <MyErrands />
        </ProtectedAuthRoute>
      </Route>
      {/* Add more requester/runner routes as needed */}

      {/* Admin route (no :rest* wildcard) */}
      <Route path="/admin">
        <ProtectedRoute requiredRole="admin">
          <AuthLayout>
            <AdminLayout />
          </AuthLayout>
        </ProtectedRoute>
      </Route>

      {/* Fallback route for unknown paths */}
      <Route path="*">
        <Redirect to="/" />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
