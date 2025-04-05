
import React, { useState, useMemo } from "react";
import { useAppContext } from "../../context/AppContext";
import { differenceInMonths, isBefore, format, subMonths, getYear, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { Calendar, Calendar as CalendarIcon, Coins, Users, UserCheck, UserMinus } from "lucide-react";
import { formatDate } from "../../utils/dateUtils";

type Period = "month" | "quarter" | "year" | "all";

const AnalyticsPanel: React.FC = () => {
  const { appointments, clients } = useAppContext();
  const [period, setPeriod] = useState<Period>("month");
  const [customDate, setCustomDate] = useState<string>(format(new Date(), "yyyy-MM"));

  // Calculate date range based on selected period
  const dateRange = useMemo(() => {
    const endDate = new Date();
    let startDate: Date;
    
    if (period === "month") {
      if (customDate) {
        const [year, month] = customDate.split("-");
        startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const nextMonth = new Date(parseInt(year), parseInt(month), 0);
        return { startDate, endDate: nextMonth };
      }
      startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    } else if (period === "quarter") {
      const currentMonth = endDate.getMonth();
      const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
      startDate = new Date(endDate.getFullYear(), quarterStartMonth, 1);
    } else if (period === "year") {
      startDate = new Date(endDate.getFullYear(), 0, 1);
    } else {
      // All time
      startDate = new Date(2000, 0, 1);
    }
    
    return { startDate, endDate };
  }, [period, customDate]);

  // Filter appointments based on date range
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      const appointmentDate = parseISO(appointment.requestDate);
      return (
        appointmentDate >= dateRange.startDate &&
        appointmentDate <= dateRange.endDate &&
        appointment.completed
      );
    });
  }, [appointments, dateRange]);

  // Calculate total revenue
  const totalRevenue = useMemo(() => {
    return filteredAppointments.reduce((sum, appointment) => sum + appointment.price, 0);
  }, [filteredAppointments]);

  // Count unique clients
  const uniqueClients = useMemo(() => {
    const clientIds = new Set(filteredAppointments.map(a => a.clientId));
    return clientIds.size;
  }, [filteredAppointments]);

  // Count returning clients (more than 1 appointment)
  const returningClients = useMemo(() => {
    const clientAppointmentCount: Record<string, number> = {};
    
    filteredAppointments.forEach(appointment => {
      const { clientId } = appointment;
      clientAppointmentCount[clientId] = (clientAppointmentCount[clientId] || 0) + 1;
    });
    
    return Object.values(clientAppointmentCount).filter(count => count > 1).length;
  }, [filteredAppointments]);

  // Find inactive clients (no appointments in last 6 months)
  const inactiveClients = useMemo(() => {
    const sixMonthsAgo = subMonths(new Date(), 6);
    
    return clients.filter(client => {
      const clientAppointments = appointments.filter(a => a.clientId === client.id);
      
      if (clientAppointments.length === 0) return false;
      
      const lastAppointmentDate = clientAppointments
        .map(a => new Date(a.requestDate))
        .sort((a, b) => b.getTime() - a.getTime())[0];
      
      return isBefore(lastAppointmentDate, sixMonthsAgo);
    });
  }, [clients, appointments]);

  // Period selector
  const renderPeriodSelector = () => (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => setPeriod("month")}
        className={`px-4 py-2 rounded-md ${
          period === "month" ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"
        }`}
      >
        Месяц
      </button>
      <button
        onClick={() => setPeriod("quarter")}
        className={`px-4 py-2 rounded-md ${
          period === "quarter" ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"
        }`}
      >
        Квартал
      </button>
      <button
        onClick={() => setPeriod("year")}
        className={`px-4 py-2 rounded-md ${
          period === "year" ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"
        }`}
      >
        Год
      </button>
      <button
        onClick={() => setPeriod("all")}
        className={`px-4 py-2 rounded-md ${
          period === "all" ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"
        }`}
      >
        Все время
      </button>
      
      {period === "month" && (
        <div className="flex items-center ml-auto">
          <CalendarIcon size={16} className="mr-2 text-muted-foreground" />
          <input
            type="month"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            className="tarot-input py-1"
          />
        </div>
      )}
    </div>
  );

  // Stat cards
  const renderStatCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-secondary p-4 rounded-lg shadow-sm">
        <div className="flex items-center">
          <Coins className="h-8 w-8 text-primary mr-3" />
          <div>
            <p className="text-sm text-muted-foreground">Доход</p>
            <h3 className="text-2xl font-bold">{totalRevenue} ₽</h3>
          </div>
        </div>
      </div>
      
      <div className="bg-secondary p-4 rounded-lg shadow-sm">
        <div className="flex items-center">
          <Users className="h-8 w-8 text-primary mr-3" />
          <div>
            <p className="text-sm text-muted-foreground">Клиентов</p>
            <h3 className="text-2xl font-bold">{uniqueClients}</h3>
          </div>
        </div>
      </div>
      
      <div className="bg-secondary p-4 rounded-lg shadow-sm">
        <div className="flex items-center">
          <UserCheck className="h-8 w-8 text-primary mr-3" />
          <div>
            <p className="text-sm text-muted-foreground">Постоянных</p>
            <h3 className="text-2xl font-bold">{returningClients}</h3>
          </div>
        </div>
      </div>
      
      <div className="bg-secondary p-4 rounded-lg shadow-sm">
        <div className="flex items-center">
          <UserMinus className="h-8 w-8 text-primary mr-3" />
          <div>
            <p className="text-sm text-muted-foreground">Неактивных &gt; 6 мес.</p>
            <h3 className="text-2xl font-bold">{inactiveClients.length}</h3>
          </div>
        </div>
      </div>
    </div>
  );

  // Inactive clients list
  const renderInactiveClients = () => (
    <div className="bg-card rounded-lg border shadow-sm p-4">
      <h3 className="text-lg font-medium mb-4">Клиенты, неактивные более 6 месяцев</h3>
      
      {inactiveClients.length === 0 ? (
        <p className="text-center text-muted-foreground py-4">
          Нет неактивных клиентов более 6 месяцев
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">Имя</th>
                <th className="text-left py-2 px-4">Телефон</th>
                <th className="text-left py-2 px-4">Последнее обращение</th>
              </tr>
            </thead>
            <tbody>
              {inactiveClients.map(client => {
                const clientAppointments = appointments.filter(a => a.clientId === client.id);
                const lastAppointmentDate = clientAppointments
                  .map(a => new Date(a.requestDate))
                  .sort((a, b) => b.getTime() - a.getTime())[0];
                
                return (
                  <tr key={client.id} className="border-b hover:bg-secondary/10">
                    <td className="py-2 px-4">{client.name}</td>
                    <td className="py-2 px-4">{client.phone}</td>
                    <td className="py-2 px-4">{formatDate(lastAppointmentDate)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-6">Аналитика</h2>
      
      {renderPeriodSelector()}
      {renderStatCards()}
      
      <div className="bg-card rounded-lg border shadow-sm p-4 mb-6">
        <h3 className="text-lg font-medium mb-4">Период анализа</h3>
        <p>
          {period === "all" ? "Все время" : `${formatDate(dateRange.startDate)} — ${formatDate(dateRange.endDate)}`}
        </p>
      </div>
      
      {renderInactiveClients()}
    </div>
  );
};

export default AnalyticsPanel;
