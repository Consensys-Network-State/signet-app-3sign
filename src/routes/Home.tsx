import React from "react";
import BNDocumentView from "../components/BNDocumentView.tsx";
import Layout from "./Layout.tsx";

const Home: React.FC = () => {
  return (
    <Layout>
      <BNDocumentView />
    </Layout>
  );
}

export default Home;