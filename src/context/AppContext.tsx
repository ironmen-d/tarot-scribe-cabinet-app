
import React, { createContext, useContext, useState, useEffect } from "react";
import { Category, Client, Appointment, Reading } from "../types/models";
import { v4 as uuidv4 } from "uuid";

type AppContextType = {
  categories: Category[];
  clients: Client[];
  appointments: Appointment[];
  addCategory: (category: Omit<Category, "id" | "readings">) => Category;
  updateCategory: (id: string, category: Partial<Omit<Category, "id" | "readings">>) => void;
  deleteCategory: (id: string) => void;
  addReading: (categoryId: string, reading: Omit<Reading, "id" | "categoryId">) => Reading;
  updateReading: (id: string, reading: Partial<Omit<Reading, "id" | "categoryId">>) => void;
  deleteReading: (id: string) => void;
  addClient: (client: Omit<Client, "id" | "appointments">) => Client;
  updateClient: (id: string, client: Partial<Omit<Client, "id" | "appointments">>) => void;
  deleteClient: (id: string) => void;
  addAppointment: (appointment: Omit<Appointment, "id">) => Appointment;
  updateAppointment: (id: string, appointment: Partial<Omit<Appointment, "id">>) => void;
  deleteAppointment: (id: string) => void;
  getCategory: (id: string) => Category | undefined;
  getReading: (id: string) => Reading | undefined;
  getClient: (id: string) => Client | undefined;
  getAppointment: (id: string) => Appointment | undefined;
  getReadingsByCategoryId: (categoryId: string) => Reading[];
  getClientByPhone: (phone: string) => Client | undefined;
  getCompletedAppointments: () => Appointment[];
  getPendingAppointments: () => Appointment[];
  getAppointmentsByDate: (date: string) => Appointment[];
  getAppointmentsByClientId: (clientId: string) => Appointment[];
  markAppointmentAsCompleted: (id: string) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

const STORAGE_KEY = "tarot-cabinet-data";

type AppState = {
  categories: Category[];
  clients: Client[];
  appointments: Appointment[];
};

const defaultState: AppState = {
  categories: [],
  clients: [],
  appointments: [],
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    return savedState ? JSON.parse(savedState) : defaultState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Category operations
  const addCategory = (category: Omit<Category, "id" | "readings">) => {
    const newCategory: Category = {
      id: uuidv4(),
      name: category.name,
      readings: [],
    };
    setState((prev) => ({
      ...prev,
      categories: [...prev.categories, newCategory],
    }));
    return newCategory;
  };

  const updateCategory = (id: string, category: Partial<Omit<Category, "id" | "readings">>) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === id ? { ...c, ...category } : c
      ),
    }));
  };

  const deleteCategory = (id: string) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== id),
      appointments: prev.appointments.filter((a) => a.categoryId !== id),
    }));
  };

  // Reading operations
  const addReading = (categoryId: string, reading: Omit<Reading, "id" | "categoryId">) => {
    const newReading: Reading = {
      id: uuidv4(),
      name: reading.name,
      price: reading.price,
      duration: reading.duration,
      categoryId,
    };
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === categoryId
          ? { ...c, readings: [...c.readings, newReading] }
          : c
      ),
    }));
    return newReading;
  };

  const updateReading = (id: string, reading: Partial<Omit<Reading, "id" | "categoryId">>) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => ({
        ...c,
        readings: c.readings.map((r) =>
          r.id === id ? { ...r, ...reading } : r
        ),
      })),
      appointments: prev.appointments.map((a) => {
        const category = prev.categories.find((c) => c.id === a.categoryId);
        const readingToUpdate = category?.readings.find((r) => r.id === id);
        
        if (a.readingId === id && readingToUpdate) {
          return {
            ...a,
            readingName: reading.name || a.readingName,
            price: reading.price !== undefined ? reading.price : a.price,
          };
        }
        return a;
      }),
    }));
  };

  const deleteReading = (id: string) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => ({
        ...c,
        readings: c.readings.filter((r) => r.id !== id),
      })),
      appointments: prev.appointments.filter((a) => a.readingId !== id),
    }));
  };

  // Client operations
  const addClient = (client: Omit<Client, "id" | "appointments">) => {
    const newClient: Client = {
      id: uuidv4(),
      name: client.name,
      birthdate: client.birthdate,
      phone: client.phone,
      messenger: client.messenger,
      appointments: [],
    };
    setState((prev) => ({
      ...prev,
      clients: [...prev.clients, newClient],
    }));
    return newClient;
  };

  const updateClient = (id: string, client: Partial<Omit<Client, "id" | "appointments">>) => {
    setState((prev) => ({
      ...prev,
      clients: prev.clients.map((c) =>
        c.id === id ? { ...c, ...client } : c
      ),
      appointments: prev.appointments.map((a) =>
        a.clientId === id
          ? {
              ...a,
              clientName: client.name || a.clientName,
              clientPhone: client.phone || a.clientPhone,
              clientMessenger: client.messenger || a.clientMessenger,
            }
          : a
      ),
    }));
  };

  const deleteClient = (id: string) => {
    setState((prev) => ({
      ...prev,
      clients: prev.clients.filter((c) => c.id !== id),
      appointments: prev.appointments.filter((a) => a.clientId !== id),
    }));
  };

  // Appointment operations
  const addAppointment = (appointment: Omit<Appointment, "id">) => {
    const newAppointment: Appointment = {
      id: uuidv4(),
      ...appointment,
    };
    
    setState((prev) => {
      // Check if client exists
      const clientExists = prev.clients.some((c) => c.id === appointment.clientId);
      
      if (!clientExists && appointment.clientId) {
        // Create new client
        const newClient: Client = {
          id: appointment.clientId,
          name: appointment.clientName,
          birthdate: null,
          phone: appointment.clientPhone,
          messenger: appointment.clientMessenger,
          appointments: [newAppointment.id],
        };
        
        return {
          ...prev,
          clients: [...prev.clients, newClient],
          appointments: [...prev.appointments, newAppointment],
        };
      } else if (clientExists) {
        // Update client's appointments list
        return {
          ...prev,
          clients: prev.clients.map(c => 
            c.id === appointment.clientId
              ? { ...c, appointments: [...c.appointments, newAppointment.id] }
              : c
          ),
          appointments: [...prev.appointments, newAppointment],
        };
      }
      
      return {
        ...prev,
        appointments: [...prev.appointments, newAppointment],
      };
    });
    
    return newAppointment;
  };

  const updateAppointment = (id: string, appointment: Partial<Omit<Appointment, "id">>) => {
    setState((prev) => {
      const updatedAppointments = prev.appointments.map((a) =>
        a.id === id ? { ...a, ...appointment } : a
      );

      // If the status changed from pending to completed, update client's appointments
      const oldAppointment = prev.appointments.find(a => a.id === id);
      const newAppointment = updatedAppointments.find(a => a.id === id);
      
      if (oldAppointment && newAppointment && 
          !oldAppointment.completed && newAppointment.completed &&
          newAppointment.clientId) {
        
        // Update the client's appointments array
        const updatedClients = prev.clients.map(c => {
          if (c.id === newAppointment.clientId) {
            // Make sure the appointment ID is only added once
            if (!c.appointments.includes(id)) {
              return {
                ...c,
                appointments: [...c.appointments, id]
              };
            }
          }
          return c;
        });
        
        return {
          ...prev,
          appointments: updatedAppointments,
          clients: updatedClients
        };
      }

      return {
        ...prev,
        appointments: updatedAppointments
      };
    });
  };

  const deleteAppointment = (id: string) => {
    setState((prev) => {
      const appointmentToDelete = prev.appointments.find(a => a.id === id);
      
      if (appointmentToDelete && appointmentToDelete.clientId) {
        return {
          ...prev,
          appointments: prev.appointments.filter((a) => a.id !== id),
          clients: prev.clients.map(c => 
            c.id === appointmentToDelete.clientId
              ? { ...c, appointments: c.appointments.filter(appId => appId !== id) }
              : c
          )
        };
      }
      
      return {
        ...prev,
        appointments: prev.appointments.filter((a) => a.id !== id)
      };
    });
  };

  // Helper functions
  const getCategory = (id: string) => {
    return state.categories.find((c) => c.id === id);
  };

  const getReading = (id: string) => {
    for (const category of state.categories) {
      const reading = category.readings.find((r) => r.id === id);
      if (reading) return reading;
    }
    return undefined;
  };

  const getClient = (id: string) => {
    return state.clients.find((c) => c.id === id);
  };

  const getAppointment = (id: string) => {
    return state.appointments.find((a) => a.id === id);
  };

  const getReadingsByCategoryId = (categoryId: string) => {
    const category = state.categories.find((c) => c.id === categoryId);
    return category ? category.readings : [];
  };

  const getClientByPhone = (phone: string) => {
    return state.clients.find((c) => c.phone === phone);
  };

  const getCompletedAppointments = () => {
    return state.appointments.filter((a) => a.completed);
  };

  const getPendingAppointments = () => {
    return state.appointments.filter((a) => !a.completed);
  };

  const getAppointmentsByDate = (date: string) => {
    return state.appointments.filter((a) => a.requestDate.startsWith(date));
  };

  const getAppointmentsByClientId = (clientId: string) => {
    return state.appointments.filter((a) => a.clientId === clientId);
  };

  const markAppointmentAsCompleted = (id: string) => {
    updateAppointment(id, { completed: true });
  };

  const contextValue: AppContextType = {
    categories: state.categories,
    clients: state.clients,
    appointments: state.appointments,
    addCategory,
    updateCategory,
    deleteCategory,
    addReading,
    updateReading,
    deleteReading,
    addClient,
    updateClient,
    deleteClient,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    getCategory,
    getReading,
    getClient,
    getAppointment,
    getReadingsByCategoryId,
    getClientByPhone,
    getCompletedAppointments,
    getPendingAppointments,
    getAppointmentsByDate,
    getAppointmentsByClientId,
    markAppointmentAsCompleted,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
