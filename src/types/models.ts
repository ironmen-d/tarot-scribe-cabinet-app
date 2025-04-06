
export type Reading = {
  id: string;
  name: string;
  price: number;
  duration: {
    value: number;
    unit: "minutes" | "hours" | "days";
  };
  categoryId: string;
  color?: string;
  
  // SheetDB mapping fields
  ID?: string;
  Тип?: string;
  Название?: string;
  "ID родителя"?: string;
  Цена?: number;
  Длительность?: string;
};

export type Category = {
  id: string;
  name: string;
  readings: Reading[];
  
  // SheetDB mapping fields
  ID?: string;
  Тип?: string;
  Название?: string;
};

export type Client = {
  id: string;
  name: string;
  birthdate: string | null;
  phone: string;
  messenger: "WhatsApp" | "Telegram" | "Другое";
  appointments: string[];
  
  // SheetDB mapping fields
  ID?: string;
  Имя?: string;
  "Дата рождения"?: string;
  Телефон?: string;
  Мессенджер?: "WhatsApp" | "Telegram" | "Другое";
};

export type Appointment = {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientMessenger: "WhatsApp" | "Telegram" | "Другое";
  requestDate: string;
  request: string;
  categoryId: string;
  readingId: string;
  readingName: string;
  price: number;
  deadline: string;
  completed: boolean;
  
  // SheetDB mapping fields
  ID?: string;
  "ID клиента"?: string;
  "Имя клиента"?: string;
  "Телефон клиента"?: string;
  "Мессенджер клиента"?: "WhatsApp" | "Telegram" | "Другое";
  "Дата запроса"?: string;
  Запрос?: string;
  "ID категории"?: string;
  "ID расклада"?: string;
  "Название расклада"?: string;
  Цена?: number;
  "Крайний срок"?: string;
  Выполнено?: boolean;
};
