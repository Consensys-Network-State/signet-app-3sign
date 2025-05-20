import * as React from "react";
import Login from "./routes/Login.tsx";
import Agreements from "./routes/Agreements.tsx";
import { Routes, Route } from 'react-router';
import { useAccount } from "wagmi";
import { Navigate, useLocation } from 'react-router';
import DocumentView from "./routes/Document.tsx";
import ErrorBoundary from "./components/ErrorBoundary";
import ErrorCard from "./components/ErrorCard";

const RouteErrorFallback = ({ routeName }: { routeName: string }) => (
  <div className="h-full flex flex-col items-center justify-center p-4">
    <ErrorCard
      title={`Error in ${routeName}`}
      message="There was a problem loading this page."
      retryText="Retry"
      onRetry={() => window.location.reload()}
      className="max-w-md w-full"
    />
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isConnected } = useAccount();
  const location = useLocation();
  if (!isConnected) {
    return <Navigate to="/login" state={{ redirect: location.pathname }} />;
  }

  return <>{children}</>;
};

const Router: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={
        <ErrorBoundary fallback={<RouteErrorFallback routeName="Login" />}>
          <Login />
        </ErrorBoundary>
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <ErrorBoundary fallback={<RouteErrorFallback routeName="Agreements" />}>
            <Agreements />
          </ErrorBoundary>
        </ProtectedRoute>
      } />
      <Route path="/drafts/:draftId" element={
        <ProtectedRoute>
          <ErrorBoundary fallback={<RouteErrorFallback routeName="Draft Document" />}>
            <DocumentView type="draft" />
          </ErrorBoundary>
        </ProtectedRoute>
      } />
      <Route path="/agreements/:agreementId" element={
        <ProtectedRoute>
          <ErrorBoundary fallback={<RouteErrorFallback routeName="Agreement" />}>
            <DocumentView type="agreement" />
          </ErrorBoundary>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default Router;