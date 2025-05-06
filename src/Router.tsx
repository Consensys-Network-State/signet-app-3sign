import * as React from "react";
import Login from "./routes/Login.tsx";
import Agreements from "./routes/Agreements.tsx";
import { Routes, Route } from 'react-router';
import { useAccount } from "wagmi";
import { Navigate, useLocation } from 'react-router';
import DocumentView from "./routes/Document.tsx";

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
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Agreements />
        </ProtectedRoute>
      } />
      <Route path="/drafts/:draftId" element={
        <ProtectedRoute>
          <DocumentView type="draft" />
        </ProtectedRoute>
      } />
      <Route path="/agreements/:agreementId" element={
        <ProtectedRoute>
          <DocumentView type="agreement" />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default Router;