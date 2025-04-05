
import React, { useState } from "react";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { Check, Edit, Trash2 } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { Appointment } from "../../types/models";
import AppointmentDialog from "./AppointmentDialog";
import { formatDateTime } from "../../utils/dateUtils";

interface AppointmentsListProps {
  type: "pending" | "completed";
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({ type }) => {
  const { getPendingAppointments, getCompletedAppointments, markAppointmentAsCompleted, deleteAppointment } = useAppContext();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"view" | "edit">("view");

  const appointments = type === "pending" ? getPendingAppointments() : getCompletedAppointments();

  const handleComplete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    markAppointmentAsCompleted(id);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Удалить запись?")) {
      deleteAppointment(id);
    }
  };

  const handleEdit = (appointment: Appointment, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAppointment(appointment);
    setViewMode("edit");
    setIsDialogOpen(true);
  };

  const handleView = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setViewMode("view");
    setIsDialogOpen(true);
  };

  return (
    <div className="bg-card shadow-sm rounded-lg border p-4 max-h-[500px] overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">
        {type === "pending" ? "Невыполненные расклады" : "Выполненные расклады"}
      </h2>
      
      {appointments.length === 0 ? (
        <div className="text-center text-muted-foreground py-4">
          {type === "pending" ? "Нет невыполненных раскладов" : "Нет выполненных раскладов"}
        </div>
      ) : (
        <div className="space-y-2">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              onClick={() => handleView(appointment)}
              className="border rounded-md p-3 cursor-pointer hover:bg-secondary/20 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{appointment.readingName}</h3>
                  <p className="text-sm text-muted-foreground">{appointment.clientName}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{appointment.price} ₽</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDateTime(appointment.deadline)}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-2 pt-2 border-t">
                <div className="text-xs text-muted-foreground">
                  Запрос: {formatDateTime(appointment.requestDate)}
                </div>
                <div className="flex space-x-1">
                  {type === "pending" && (
                    <button
                      onClick={(e) => handleComplete(appointment.id, e)}
                      className="p-1 rounded-full hover:bg-green-100 text-green-600"
                      title="Отметить как выполненное"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleEdit(appointment, e)}
                    className="p-1 rounded-full hover:bg-blue-100 text-blue-600"
                    title="Редактировать"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={(e) => handleDelete(appointment.id, e)}
                    className="p-1 rounded-full hover:bg-red-100 text-red-600"
                    title="Удалить"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {selectedAppointment && (
        <AppointmentDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          appointment={selectedAppointment}
          mode={viewMode}
        />
      )}
    </div>
  );
};

export default AppointmentsList;
