
import React, { createContext, useContext, useState, useEffect } from "react";
import { Category, Client, Appointment, Reading } from "../types/models";
import { toast } from "@/components/ui/use-toast";

const API_URL = "https://sheetdb.io/api/v1/dszmok4d10hja";

type AppContextType = {
  categories: Category[];
  clients: Client[];
  appointments: Appointment[];
  readings: Reading[];
  addCategory: (category: Omit<Category, "id" | "readings">) => Promise<Category>;
  updateCategory: (id: string, category: Partial<Omit<Category, "id" | "readings">>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addReading: (categoryId: string, reading: Omit<Reading, "id" | "categoryId">) => Promise<Reading>;
  updateReading: (id: string, reading: Partial<Omit<Reading, "id" | "categoryId">>) => Promise<void>;
  deleteReading: (id: string) => Promise<void>;
  addClient: (client: Omit<Client, "id" | "appointments">) => Promise<Client>;
  updateClient: (id: string, client: Partial<Omit<Client, "id" | "appointments">>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addAppointment: (appointment: Omit<Appointment, "id">) => Promise<Appointment>;
  updateAppointment: (id: string, appointment: Partial<Omit<Appointment, "id">>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
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
  markAppointmentAsCompleted: (id: string) => Promise<void>;
  isLoading: boolean;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

// Функции для преобразования данных между форматами
const mapSheetClientToClient = (sheetClient: any): Client => ({
  id: sheetClient.ID || "",
  name: sheetClient.Имя || "",
  birthdate: sheetClient["Дата рождения"] || null,
  phone: sheetClient.Телефон || "",
  messenger: sheetClient.Мессенджер || "Другое",
  appointments: [],
  // Сохраняем оригинальные поля для совместимости
  ID: sheetClient.ID,
  Имя: sheetClient.Имя,
  "Дата рождения": sheetClient["Дата рождения"],
  Телефон: sheetClient.Телефон,
  Мессенджер: sheetClient.Мессенджер
});

const mapClientToSheetClient = (client: Omit<Client, "id" | "appointments">): any => ({
  Имя: client.name,
  "Дата рождения": client.birthdate,
  Телефон: client.phone,
  Мессенджер: client.messenger
});

const mapSheetAppointmentToAppointment = (sheetAppointment: any): Appointment => ({
  id: sheetAppointment.ID || "",
  clientId: sheetAppointment["ID клиента"] || "",
  clientName: sheetAppointment["Имя клиента"] || "",
  clientPhone: sheetAppointment["Телефон клиента"] || "",
  clientMessenger: sheetAppointment["Мессенджер клиента"] || "Другое",
  requestDate: sheetAppointment["Дата запроса"] || "",
  request: sheetAppointment.Запрос || "",
  categoryId: sheetAppointment["ID категории"] || "",
  readingId: sheetAppointment["ID расклада"] || "",
  readingName: sheetAppointment["Название расклада"] || "",
  price: parseFloat(sheetAppointment.Цена) || 0,
  deadline: sheetAppointment["Крайний срок"] || "",
  completed: sheetAppointment.Выполнено === true || sheetAppointment.Выполнено === "true",
  // Сохраняем оригинальные поля для совместимости
  ID: sheetAppointment.ID,
  "ID клиента": sheetAppointment["ID клиента"],
  "Имя клиента": sheetAppointment["Имя клиента"],
  "Телефон клиента": sheetAppointment["Телефон клиента"],
  "Мессенджер клиента": sheetAppointment["Мессенджер клиента"],
  "Дата запроса": sheetAppointment["Дата запроса"],
  Запрос: sheetAppointment.Запрос,
  "ID категории": sheetAppointment["ID категории"],
  "ID расклада": sheetAppointment["ID расклада"],
  "Название расклада": sheetAppointment["Название расклада"],
  Цена: sheetAppointment.Цена,
  "Крайний срок": sheetAppointment["Крайний срок"],
  Выполнено: sheetAppointment.Выполнено
});

const mapAppointmentToSheetAppointment = (appointment: Omit<Appointment, "id">): any => ({
  "ID клиента": appointment.clientId,
  "Имя клиента": appointment.clientName,
  "Телефон клиента": appointment.clientPhone,
  "Мессенджер клиента": appointment.clientMessenger,
  "Дата запроса": appointment.requestDate,
  Запрос: appointment.request,
  "ID категории": appointment.categoryId,
  "ID расклада": appointment.readingId,
  "Название расклада": appointment.readingName,
  Цена: appointment.price,
  "Крайний срок": appointment.deadline,
  Выполнено: appointment.completed
});

const mapSheetCategoryToCategory = (sheetCategory: any): Category => ({
  id: sheetCategory.ID || "",
  name: sheetCategory.Название || "",
  readings: [],
  // Сохраняем оригинальные поля для совместимости
  ID: sheetCategory.ID,
  Тип: sheetCategory.Тип,
  Название: sheetCategory.Название
});

const mapCategoryToSheetCategory = (category: Omit<Category, "id" | "readings">): any => ({
  Тип: "категория",
  Название: category.name
});

const mapSheetReadingToReading = (sheetReading: any): Reading => {
  // Разбираем строку длительности в формат объекта
  const durationParts = sheetReading.Длительность?.split(' ') || [];
  let duration = { value: 30, unit: "minutes" as "minutes" | "hours" | "days" };
  
  if (durationParts.length >= 2) {
    const value = parseInt(durationParts[0], 10);
    const unit = durationParts[1].toLowerCase();
    
    if (!isNaN(value)) {
      duration.value = value;
      
      if (unit.includes('мин')) {
        duration.unit = "minutes";
      } else if (unit.includes('час')) {
        duration.unit = "hours";
      } else if (unit.includes('дн')) {
        duration.unit = "days";
      }
    }
  }

  return {
    id: sheetReading.ID || "",
    name: sheetReading.Название || "",
    price: parseFloat(sheetReading.Цена) || 0,
    duration,
    categoryId: sheetReading["ID родителя"] || "",
    // Сохраняем оригинальные поля для совместимости
    ID: sheetReading.ID,
    Тип: sheetReading.Тип,
    Название: sheetReading.Название,
    "ID родителя": sheetReading["ID родителя"],
    Цена: sheetReading.Цена,
    Длительность: sheetReading.Длительность
  };
};

const mapReadingToSheetReading = (reading: Omit<Reading, "id" | "categoryId">, categoryId: string): any => {
  // Преобразуем объект длительности в строку
  let durationString = `${reading.duration.value} `;
  
  if (reading.duration.unit === "minutes") {
    durationString += "минут";
  } else if (reading.duration.unit === "hours") {
    durationString += "часов";
  } else if (reading.duration.unit === "days") {
    durationString += "дней";
  }
  
  return {
    Тип: "расклад",
    Название: reading.name,
    "ID родителя": categoryId,
    Цена: reading.price,
    Длительность: durationString
  };
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Загрузка клиентов
        const clientsResponse = await fetch(`${API_URL}?sheet=Клиенты`);
        const clientsData = await clientsResponse.json();
        const mappedClients = clientsData.map(mapSheetClientToClient);
        setClients(mappedClients);

        // Загрузка категорий и раскладов
        const catReadingsResponse = await fetch(`${API_URL}?sheet=Категории и расклады`);
        const catReadingsData = await catReadingsResponse.json();
        
        const categoriesData = catReadingsData.filter((item: any) => item.Тип === "категория");
        const readingsData = catReadingsData.filter((item: any) => item.Тип === "расклад");
        
        const mappedCategories = categoriesData.map(mapSheetCategoryToCategory);
        const mappedReadings = readingsData.map(mapSheetReadingToReading);
        
        setCategories(mappedCategories);
        setReadings(mappedReadings);

        // Загрузка записей
        const appointmentsResponse = await fetch(`${API_URL}?sheet=Записи`);
        const appointmentsData = await appointmentsResponse.json();
        const mappedAppointments = appointmentsData.map(mapSheetAppointmentToAppointment);
        setAppointments(mappedAppointments);
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
        toast({
          variant: "destructive",
          title: "Ошибка при загрузке данных",
          description: "Пожалуйста, проверьте соединение и попробуйте снова."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Функции для работы с категориями
  const addCategory = async (category: Omit<Category, "id" | "readings">) => {
    const id = `cat_${Date.now()}`;
    const newCategory = { 
      ...mapCategoryToSheetCategory(category),
      ID: id
    };

    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheet: "Категории и расклады", data: [newCategory] })
      });

      const mappedCategory: Category = {
        id,
        name: category.name,
        readings: [],
        ...newCategory
      };
      
      setCategories(prev => [...prev, mappedCategory]);
      return mappedCategory;
    } catch (error) {
      console.error("Ошибка при добавлении категории:", error);
      toast({
        variant: "destructive",
        title: "Ошибка при добавлении категории",
        description: "Пожалуйста, проверьте соединение и попробуйте снова."
      });
      throw error;
    }
  };

  const updateCategory = async (id: string, category: Partial<Omit<Category, "id" | "readings">>) => {
    const updateData = category.name ? { Название: category.name } : {};
    
    try {
      await fetch(`${API_URL}/ID/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheet: "Категории и расклады", data: updateData })
      });

      setCategories(prev => prev.map(c => 
        c.id === id ? { ...c, name: category.name || c.name, ...updateData } : c
      ));
    } catch (error) {
      console.error("Ошибка при обновлении категории:", error);
      toast({
        variant: "destructive",
        title: "Ошибка при обновлении категории",
        description: "Пожалуйста, проверьте соединение и попробуйте снова."
      });
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await fetch(`${API_URL}/ID/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheet: "Категории и расклады" })
      });

      // Удаляем все расклады этой категории
      const categoryReadings = readings.filter(r => r.categoryId === id);
      for (const reading of categoryReadings) {
        if (reading.id) {
          await deleteReading(reading.id);
        }
      }

      setCategories(prev => prev.filter(c => c.id !== id));
      
      // Удаляем все связанные записи
      const relatedAppointments = appointments.filter(a => a.categoryId === id);
      for (const appointment of relatedAppointments) {
        if (appointment.id) {
          await deleteAppointment(appointment.id);
        }
      }
    } catch (error) {
      console.error("Ошибка при удалении категории:", error);
      toast({
        variant: "destructive",
        title: "Ошибка при удалении категории",
        description: "Пожалуйста, проверьте соединение и попробуйте снова."
      });
      throw error;
    }
  };

  // Функции для работы с раскладами
  const addReading = async (categoryId: string, reading: Omit<Reading, "id" | "categoryId">) => {
    const id = `read_${Date.now()}`;
    const newReading = {
      ...mapReadingToSheetReading(reading, categoryId),
      ID: id
    };

    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheet: "Категории и расклады", data: [newReading] })
      });

      const mappedReading: Reading = {
        id,
        name: reading.name,
        price: reading.price,
        duration: reading.duration,
        categoryId,
        ...newReading
      };
      
      setReadings(prev => [...prev, mappedReading]);
      return mappedReading;
    } catch (error) {
      console.error("Ошибка при добавлении расклада:", error);
      toast({
        variant: "destructive",
        title: "Ошибка при добавлении расклада",
        description: "Пожалуйста, проверьте соединение и попробуйте снова."
      });
      throw error;
    }
  };

  const updateReading = async (id: string, reading: Partial<Omit<Reading, "id" | "categoryId">>) => {
    const updateData: any = {};
    
    if (reading.name) updateData.Название = reading.name;
    if (reading.price !== undefined) updateData.Цена = reading.price;
    
    if (reading.duration) {
      let durationString = `${reading.duration.value} `;
      if (reading.duration.unit === "minutes") {
        durationString += "минут";
      } else if (reading.duration.unit === "hours") {
        durationString += "часов";
      } else if (reading.duration.unit === "days") {
        durationString += "дней";
      }
      updateData.Длительность = durationString;
    }

    try {
      await fetch(`${API_URL}/ID/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheet: "Категории и расклады", data: updateData })
      });

      setReadings(prev => prev.map(r => r.id === id ? { ...r, ...reading, ...updateData } : r));
      
      // Обновляем информацию во всех связанных записях
      if (reading.name || reading.price !== undefined) {
        const relatedAppointments = appointments.filter(a => a.readingId === id);
        
        for (const appointment of relatedAppointments) {
          const updateAppointmentData: any = {};
          
          if (reading.name) updateAppointmentData["Название расклада"] = reading.name;
          if (reading.price !== undefined) updateAppointmentData.Цена = reading.price;
          
          if (Object.keys(updateAppointmentData).length > 0 && appointment.id) {
            await updateAppointment(appointment.id, {
              readingName: reading.name,
              price: reading.price
            });
          }
        }
      }
    } catch (error) {
      console.error("Ошибка при обновлении расклада:", error);
      toast({
        variant: "destructive",
        title: "Ошибка при обновлении расклада",
        description: "Пожалуйста, проверьте соединение и попробуйте снова."
      });
      throw error;
    }
  };

  const deleteReading = async (id: string) => {
    try {
      await fetch(`${API_URL}/ID/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheet: "Категории и расклады" })
      });

      setReadings(prev => prev.filter(r => r.id !== id));
      
      // Удаляем все связанные записи
      const relatedAppointments = appointments.filter(a => a.readingId === id);
      for (const appointment of relatedAppointments) {
        if (appointment.id) {
          await deleteAppointment(appointment.id);
        }
      }
    } catch (error) {
      console.error("Ошибка при удалении расклада:", error);
      toast({
        variant: "destructive",
        title: "Ошибка при удалении расклада",
        description: "Пожалуйста, проверьте соединение и попробуйте снова."
      });
      throw error;
    }
  };

  // Функции для работы с клиентами
  const addClient = async (client: Omit<Client, "id" | "appointments">) => {
    const id = `client_${Date.now()}`;
    const newClient = {
      ...mapClientToSheetClient(client),
      ID: id
    };

    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheet: "Клиенты", data: [newClient] })
      });

      const mappedClient: Client = {
        id,
        name: client.name,
        birthdate: client.birthdate,
        phone: client.phone,
        messenger: client.messenger,
        appointments: [],
        ...newClient
      };
      
      setClients(prev => [...prev, mappedClient]);
      return mappedClient;
    } catch (error) {
      console.error("Ошибка при добавлении клиента:", error);
      toast({
        variant: "destructive",
        title: "Ошибка при добавлении клиента",
        description: "Пожалуйста, проверьте соединение и попробуйте снова."
      });
      throw error;
    }
  };

  const updateClient = async (id: string, client: Partial<Omit<Client, "id" | "appointments">>) => {
    const updateData: any = {};
    
    if (client.name) updateData.Имя = client.name;
    if (client.birthdate !== undefined) updateData["Дата рождения"] = client.birthdate;
    if (client.phone) updateData.Телефон = client.phone;
    if (client.messenger) updateData.Мессенджер = client.messenger;

    try {
      await fetch(`${API_URL}/ID/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheet: "Клиенты", data: updateData })
      });

      setClients(prev => prev.map(c => c.id === id ? { ...c, ...client, ...updateData } : c));
      
      // Обновляем информацию о клиенте во всех его записях
      const clientAppointments = appointments.filter(a => a.clientId === id);
      
      for (const appointment of clientAppointments) {
        const updateAppointmentData: any = {};
        
        if (client.name) updateAppointmentData["Имя клиента"] = client.name;
        if (client.phone) updateAppointmentData["Телефон клиента"] = client.phone;
        if (client.messenger) updateAppointmentData["Мессенджер клиента"] = client.messenger;
        
        if (Object.keys(updateAppointmentData).length > 0 && appointment.id) {
          await updateAppointment(appointment.id, {
            clientName: client.name,
            clientPhone: client.phone,
            clientMessenger: client.messenger
          });
        }
      }
    } catch (error) {
      console.error("Ошибка при обновлении клиента:", error);
      toast({
        variant: "destructive",
        title: "Ошибка при обновлении клиента",
        description: "Пожалуйста, проверьте соединение и попробуйте снова."
      });
      throw error;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      await fetch(`${API_URL}/ID/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheet: "Клиенты" })
      });

      setClients(prev => prev.filter(c => c.id !== id));
      
      // Удаляем все записи клиента
      const clientAppointments = appointments.filter(a => a.clientId === id);
      for (const appointment of clientAppointments) {
        if (appointment.id) {
          await deleteAppointment(appointment.id);
        }
      }
    } catch (error) {
      console.error("Ошибка при удалении клиента:", error);
      toast({
        variant: "destructive",
        title: "Ошибка при удалении клиента",
        description: "Пожалуйста, проверьте соединение и попробуйте снова."
      });
      throw error;
    }
  };

  // Функции для работы с записями
  const addAppointment = async (appointment: Omit<Appointment, "id">) => {
    const id = `appt_${Date.now()}`;
    const newAppointment = {
      ...mapAppointmentToSheetAppointment(appointment),
      ID: id
    };

    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheet: "Записи", data: [newAppointment] })
      });

      const mappedAppointment: Appointment = {
        id,
        ...appointment,
        ...newAppointment
      };
      
      setAppointments(prev => [...prev, mappedAppointment]);
      
      // Добавляем ID записи в список записей клиента
      const client = clients.find(c => c.id === appointment.clientId);
      if (client) {
        const updatedAppointments = [...(client.appointments || []), id];
        // Обновление в состоянии
        setClients(prev => prev.map(c => 
          c.id === appointment.clientId ? { ...c, appointments: updatedAppointments } : c
        ));
      }
      
      return mappedAppointment;
    } catch (error) {
      console.error("Ошибка при добавлении записи:", error);
      toast({
        variant: "destructive",
        title: "Ошибка при добавлении записи",
        description: "Пожалуйста, проверьте соединение и попробуйте снова."
      });
      throw error;
    }
  };

  const updateAppointment = async (id: string, appointment: Partial<Omit<Appointment, "id">>) => {
    const updateData = mapAppointmentToSheetAppointment({
      clientId: "",
      clientName: "",
      clientPhone: "",
      clientMessenger: "Другое",
      requestDate: "",
      request: "",
      categoryId: "",
      readingId: "",
      readingName: "",
      price: 0,
      deadline: "",
      completed: false,
      ...appointment
    });
    
    // Удаляем пустые поля
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === "" || updateData[key] === null || updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    try {
      await fetch(`${API_URL}/ID/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheet: "Записи", data: updateData })
      });

      setAppointments(prev => prev.map(a => 
        a.id === id ? { ...a, ...appointment, ...updateData } : a
      ));
    } catch (error) {
      console.error("Ошибка при обновлении записи:", error);
      toast({
        variant: "destructive",
        title: "Ошибка при обновлении записи",
        description: "Пожалуйста, проверьте соединение и попробуйте снова."
      });
      throw error;
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      await fetch(`${API_URL}/ID/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheet: "Записи" })
      });

      const appointmentToDelete = appointments.find(a => a.id === id);
      
      setAppointments(prev => prev.filter(a => a.id !== id));
      
      // Удаляем ID записи из списка записей клиента
      if (appointmentToDelete) {
        const client = clients.find(c => c.id === appointmentToDelete.clientId);
        if (client && client.appointments) {
          const updatedAppointments = client.appointments.filter(appId => appId !== id);
          // Обновление в состоянии
          setClients(prev => prev.map(c => 
            c.id === appointmentToDelete.clientId ? { ...c, appointments: updatedAppointments } : c
          ));
        }
      }
    } catch (error) {
      console.error("Ошибка при удалении записи:", error);
      toast({
        variant: "destructive",
        title: "Ошибка при удалении записи",
        description: "Пожалуйста, проверьте соединение и попробуйте снова."
      });
      throw error;
    }
  };

  // Helper функции
  const getCategory = (id: string) => {
    return categories.find((c) => c.id === id);
  };

  const getReading = (id: string) => {
    return readings.find((r) => r.id === id);
  };

  const getClient = (id: string) => {
    return clients.find((c) => c.id === id);
  };

  const getAppointment = (id: string) => {
    return appointments.find((a) => a.id === id);
  };

  const getReadingsByCategoryId = (categoryId: string) => {
    return readings.filter((r) => r.categoryId === categoryId);
  };

  const getClientByPhone = (phone: string) => {
    return clients.find((c) => c.phone === phone);
  };

  const getCompletedAppointments = () => {
    return appointments.filter((a) => a.completed);
  };

  const getPendingAppointments = () => {
    return appointments.filter((a) => !a.completed);
  };

  const getAppointmentsByDate = (date: string) => {
    return appointments.filter((a) => a.requestDate.startsWith(date));
  };

  const getAppointmentsByClientId = (clientId: string) => {
    return appointments.filter((a) => a.clientId === clientId);
  };

  const markAppointmentAsCompleted = async (id: string) => {
    await updateAppointment(id, { completed: true });
  };

  const contextValue: AppContextType = {
    categories,
    clients,
    appointments,
    readings,
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
    isLoading
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
