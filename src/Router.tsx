import React from "react";
import Home from "./routes/Home.tsx";
import Login2 from "./routes/Login.tsx";
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
      <Route path="/login" element={isConnected ? <Navigate to="/" /> : <Login2 />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default Router;