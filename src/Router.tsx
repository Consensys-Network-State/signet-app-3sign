import React from "react";
import Home from "./routes/Home.tsx";
import Login from "./routes/Login.tsx";
import Document from "./routes/Document.tsx";
import { Routes, Route } from 'react-router';
import { useAccount } from "wagmi";
import { Navigate } from 'react-router';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const Router: React.FC = () => {
  const { isConnected } = useAccount();

  return (
    <Routes>
        <Route path="/login" element={isConnected ? <Navigate to="/" /> : <Login />} />
        <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
        } />
        <Route path="/:documentId" element={
            <ProtectedRoute>
                <Document />
            </ProtectedRoute>
        } />
    </Routes>
  );
}

export default Router;