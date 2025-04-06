
import React from "react";
import MainLayout from "../components/layout/MainLayout";
import ClientsList from "../components/clients/ClientsList";

const ClientsPage = () => {
  return (
    <MainLayout>
      <div className="mt-8">
        <ClientsList />
      </div>
    </MainLayout>
  );
};

export default ClientsPage;
