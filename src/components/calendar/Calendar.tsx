
import React, { useState } from "react";
import { addDays, subDays, format, startOfWeek, addWeeks, subWeeks, isSameDay } from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { formatDayOfWeek, formatMonthYear } from "../../utils/dateUtils";
import AppointmentDialog from "../appointments/AppointmentDialog";

const Calendar: React.FC = () => {
  const { appointments, getAppointmentsByDate } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{formatMonthYear(currentDate)}</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
            className="p-1 rounded-full hover:bg-secondary"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-2 py-1 text-sm rounded-md bg-primary text-primary-foreground"
          >
            Сегодня
          </button>
          <button
            onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
            className="p-1 rounded-full hover:bg-secondary"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    let startDate = startOfWeek(currentDate, { locale: ru });

    for (let i = 0; i < 7; i++) {
      const day = addDays(startDate, i);
      days.push(
        <div key={i} className="text-center font-medium mb-1">
          {formatDayOfWeek(day).slice(0, 3)}
        </div>
      );
    }

    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const startDate = startOfWeek(currentDate, { locale: ru });
    const rows = [];

    for (let week = 0; week < 6; week++) {
      const days = [];
      for (let day = 0; day < 7; day++) {
        const currentDay = addDays(startDate, week * 7 + day);
        const formattedDate = format(currentDay, "yyyy-MM-dd");
        const dailyAppointments = getAppointmentsByDate(formattedDate);
        
        const isToday = isSameDay(currentDay, new Date());
        const isSelected = isSameDay(currentDay, selectedDate);
        
        days.push(
          <div
            key={day}
            onClick={() => setSelectedDate(currentDay)}
            className={`border p-1 h-24 overflow-y-auto cursor-pointer transition-colors ${
              isToday ? "bg-secondary/50" : ""
            } ${isSelected ? "ring-2 ring-primary" : ""}`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className={`text-sm ${isToday ? "font-bold" : ""}`}>
                {format(currentDay, "d")}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDate(currentDay);
                  setIsDialogOpen(true);
                }}
                className="text-primary hover:bg-primary/10 rounded-full p-1"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="space-y-1">
              {dailyAppointments.slice(0, 3).map((appointment) => (
                <div 
                  key={appointment.id}
                  className={`text-xs p-1 rounded truncate ${
                    appointment.completed ? "bg-green-100 text-green-800" : "bg-primary/10 text-primary"
                  }`}
                >
                  {appointment.readingName} - {appointment.clientName}
                </div>
              ))}
              {dailyAppointments.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{dailyAppointments.length - 3} ещё
                </div>
              )}
            </div>
          </div>
        );
      }
      rows.push(
        <div key={week} className="grid grid-cols-7">
          {days}
        </div>
      );
    }

    return <div className="mb-2">{rows}</div>;
  };

  return (
    <div className="bg-card shadow-sm rounded-lg border p-4">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
      
      <AppointmentDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        initialDate={selectedDate}
      />
    </div>
  );
};

export default Calendar;
