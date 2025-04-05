
import React, { useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import Calendar from "../components/calendar/Calendar";
import AppointmentsList from "../components/appointments/AppointmentsList";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending");

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Calendar />
        </div>
        
        <div className="space-y-4">
          <div className="flex border-b">
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === "pending"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("pending")}
            >
              Невыполненные
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === "completed"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("completed")}
            >
              Выполненные
            </button>
          </div>
          
          <AppointmentsList type={activeTab} />
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
