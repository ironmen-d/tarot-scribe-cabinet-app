
import React, { useState } from "react";
import { 
  addMonths, 
  subMonths, 
  format, 
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  getDate,
  addDays,
  isWithinInterval
} from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import AppointmentDialog from "../appointments/AppointmentDialog";

const Calendar: React.FC = () => {
  const { appointments, getAppointmentsByDate, getReading } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDayAppointments, setSelectedDayAppointments] = useState<any[]>([]);
  const [isDayDialogOpen, setIsDayDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"view" | "edit">("view");

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{format(currentDate, 'LLLL yyyy', { locale: ru })}</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
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
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-1 rounded-full hover:bg-secondary"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const weekDays = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
    
    return (
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day, index) => (
          <div key={index} className="text-center font-medium mb-1">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const getReadingColor = (readingId: string, completed: boolean) => {
    if (completed) {
      return "bg-gray-100 text-gray-600"; // Default color for completed readings
    }
    
    const reading = getReading(readingId);
    if (reading?.color) {
      // If the reading has a color, use it with appropriate text contrast
      return `bg-[${reading.color}] text-white`;
    }
    
    return "bg-primary/10 text-primary"; // Default color for uncompleted readings without a color
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = monthStart;
    const endDate = monthEnd;

    const dateFormat = "d";
    const rows = [];

    let days = eachDayOfInterval({
      start: startDate,
      end: endDate
    });

    // Create blank cells for days before the first day of month
    const firstDayOfMonth = getDay(monthStart);
    const blankDaysBefore = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    
    const daysWithBlanks = [];
    
    // Add blank days before
    for (let i = 0; i < blankDaysBefore; i++) {
      daysWithBlanks.push(null);
    }
    
    // Add actual days
    daysWithBlanks.push(...days);
    
    // Add blank days after to complete the grid
    const totalCells = Math.ceil(daysWithBlanks.length / 7) * 7;
    const blankDaysAfter = totalCells - daysWithBlanks.length;
    
    for (let i = 0; i < blankDaysAfter; i++) {
      daysWithBlanks.push(null);
    }

    // Split into weeks
    const weeks = [];
    let week = [];

    daysWithBlanks.forEach((day, i) => {
      if (i % 7 === 0 && i > 0) {
        weeks.push(week);
        week = [];
      }
      week.push(day);
      if (i === daysWithBlanks.length - 1) {
        weeks.push(week);
      }
    });

    const handleDayClick = (day: Date) => {
      setSelectedDate(day);
      const formattedDate = format(day, "yyyy-MM-dd");
      const dailyAppointments = getAppointmentsByDate(formattedDate);
      
      if (dailyAppointments.length > 0) {
        setSelectedDayAppointments(dailyAppointments);
        setIsDayDialogOpen(true);
      } else {
        setIsDialogOpen(true);
      }
    };

    const handleAppointmentClick = (appointment: any, e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedAppointment(appointment);
      setViewMode("view");
      setIsAppointmentDialogOpen(true);
    };

    return (
      <div className="mb-2">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7">
            {week.map((day, dayIndex) => {
              if (day === null) {
                return (
                  <div key={dayIndex} className="border p-1 h-24 bg-gray-50/30"></div>
                );
              }
              
              const formattedDate = format(day, "yyyy-MM-dd");
              const dailyAppointments = getAppointmentsByDate(formattedDate);
              const isToday = isSameDay(day, new Date());
              const isSelected = isSameDay(day, selectedDate);
              
              return (
                <div
                  key={dayIndex}
                  onClick={() => handleDayClick(day)}
                  className={`border p-1 h-24 overflow-y-auto cursor-pointer transition-colors ${
                    isToday ? "bg-secondary/50" : ""
                  } ${isSelected ? "ring-2 ring-primary" : ""}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm ${isToday ? "font-bold" : ""}`}>
                      {format(day, dateFormat)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDate(day);
                        setIsDialogOpen(true);
                      }}
                      className="text-primary hover:bg-primary/10 rounded-full p-1"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {dailyAppointments.slice(0, 3).map((appointment) => {
                      const reading = getReading(appointment.readingId);
                      const bgColor = appointment.completed 
                        ? "bg-gray-100" 
                        : reading?.color 
                          ? `bg-[${reading.color}]` 
                          : "bg-primary/10";
                          
                      const textColor = appointment.completed 
                        ? "text-gray-600" 
                        : reading?.color 
                          ? "text-white" 
                          : "text-primary";
                          
                      return (
                        <div 
                          key={appointment.id}
                          onClick={(e) => handleAppointmentClick(appointment, e)}
                          className={`text-xs p-1 rounded truncate ${bgColor} ${textColor}`}
                          style={reading?.color && !appointment.completed ? {backgroundColor: reading.color} : {}}
                        >
                          {appointment.readingName} - {appointment.clientName}
                        </div>
                      );
                    })}
                    {dailyAppointments.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{dailyAppointments.length - 3} ещё
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
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

      {selectedAppointment && (
        <AppointmentDialog
          isOpen={isAppointmentDialogOpen}
          onClose={() => setIsAppointmentDialogOpen(false)}
          appointment={selectedAppointment}
          mode={viewMode}
        />
      )}

      {/* Day Appointments Dialog */}
      {isDayDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">
                Записи на {format(selectedDate, "d MMMM yyyy", { locale: ru })}
              </h2>
              <button 
                onClick={() => setIsDayDialogOpen(false)} 
                className="p-1 rounded-full hover:bg-secondary"
              >
                <span className="sr-only">Закрыть</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <div className="p-4 space-y-2">
              {selectedDayAppointments.map((appointment) => {
                const reading = getReading(appointment.readingId);
                return (
                  <div 
                    key={appointment.id}
                    onClick={() => {
                      setSelectedAppointment(appointment);
                      setViewMode("view");
                      setIsAppointmentDialogOpen(true);
                      setIsDayDialogOpen(false);
                    }}
                    className={`p-3 border rounded-md cursor-pointer hover:bg-secondary/20`}
                    style={reading?.color && !appointment.completed ? 
                      {borderLeft: `4px solid ${reading.color}`} : 
                      appointment.completed ? {borderLeft: "4px solid #9ca3af"} : {}
                    }
                  >
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">{appointment.readingName}</h3>
                        <p className="text-sm">{appointment.clientName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{appointment.price} ₽</p>
                        <p className="text-xs text-muted-foreground">
                          {appointment.completed ? "Выполнено" : "Не выполнено"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between p-4 border-t">
              <button
                onClick={() => {
                  setIsDialogOpen(true);
                  setIsDayDialogOpen(false);
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
              >
                Добавить запись
              </button>
              <button
                onClick={() => setIsDayDialogOpen(false)}
                className="px-4 py-2 border rounded-md hover:bg-secondary"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
