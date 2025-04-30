import * as React from "react";
import Home from "./routes/Home.tsx";
import Login from "./routes/Login.tsx";
import Document from "./routes/Document.tsx";
import Agreements from "./routes/Agreements.tsx";
import { Routes, Route } from 'react-router';
import { useAccount } from "wagmi";
import { Navigate, useLocation } from 'react-router';
import MarkdownDocumentView from "./components/markdown/MarkdownDocumentView.tsx";
import Draft from "./components/markdown/Draft.tsx";

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
      <Route path="/edit" element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      } />
      <Route path="/drafts/:draftId" element={
        <ProtectedRoute>
          <Draft />
        </ProtectedRoute>
      } />
      {/* <Route path="/agreements/:agreementId" element={
        <ProtectedRoute>
          <MarkdownDocumentView />
        </ProtectedRoute>
      } /> */}
      <Route path="/:documentId" element={
        <ProtectedRoute>
            <Document />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default Router;