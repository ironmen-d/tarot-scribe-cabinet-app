
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
};

export type Category = {
  id: string;
  name: string;
  readings: Reading[];
};

export type Client = {
  id: string;
  name: string;
  birthdate: string | null;
  phone: string;
  messenger: "WhatsApp" | "Telegram" | "Другое";
  appointments: string[];
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
};
