
import React from "react";
import MainLayout from "../components/layout/MainLayout";
import ClientsList from "../components/clients/ClientsList";
import { useAppContext } from "../context/AppContext";

const ClientsPage = () => {
  const { isLoading } = useAppContext();

  return (
    <MainLayout>
      <div className="mt-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ClientsList />
        )}
      </div>
    </MainLayout>
  );
};

export default ClientsPage;
