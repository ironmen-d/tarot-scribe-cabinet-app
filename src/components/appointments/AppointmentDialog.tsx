import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { Appointment, Client } from "../../types/models";
import { v4 as uuidv4 } from "uuid";
import { calculateDeadline, extractNameAndBirthdate, formatDate } from "../../utils/dateUtils";
import { format } from "date-fns";

interface AppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: Appointment;
  initialDate?: Date;
  mode?: "view" | "edit";
}

const AppointmentDialog: React.FC<AppointmentDialogProps> = ({
  isOpen,
  onClose,
  appointment,
  initialDate,
  mode = "edit",
}) => {
  const {
    categories,
    clients,
    addAppointment,
    updateAppointment,
    getReadingsByCategoryId,
    addClient,
    getClientByPhone,
    getClient,
  } = useAppContext();

  const [viewMode, setViewMode] = useState<"view" | "edit">(mode);
  const [formData, setFormData] = useState({
    clientId: "",
    clientName: "",
    clientBirthdate: "",
    clientPhone: "",
    clientMessenger: "WhatsApp" as "WhatsApp" | "Telegram" | "Другое",
    requestDate: new Date().toISOString().split("T")[0],
    request: "",
    categoryId: "",
    readingId: "",
    readingName: "",
    price: 0,
    deadline: "",
    manualDeadline: false,
    completed: false,
  });

  const [availableReadings, setAvailableReadings] = useState<any[]>([]);
  const [confirmClose, setConfirmClose] = useState(false);
  const [showAutoFill, setShowAutoFill] = useState(false);
  const [autoFillText, setAutoFillText] = useState("");

  const MALE_NAMES = [
    'александр', 'сергей', 'андрей', 'дмитрий', 'алексей', 
    'михаил', 'евгений', 'иван', 'максим', 'артем',
    'владимир', 'павел', 'николай', 'константин', 'игорь',
    'виктор', 'роман', 'денис', 'антон', 'тимур', 'олег',
    'никита', 'кирилл', 'вадим', 'валерий', 'василий'
  ];

  useEffect(() => {
    if (appointment) {
      const client = clients.find(c => c.id === appointment.clientId);
      
      setFormData({
        clientId: appointment.clientId,
        clientName: appointment.clientName,
        clientBirthdate: client?.birthdate || "",
        clientPhone: appointment.clientPhone,
        clientMessenger: appointment.clientMessenger,
        requestDate: appointment.requestDate.split("T")[0],
        request: appointment.request,
        categoryId: appointment.categoryId,
        readingId: appointment.readingId,
        readingName: appointment.readingName,
        price: appointment.price,
        deadline: appointment.deadline,
        manualDeadline: false,
        completed: appointment.completed,
      });
      
      if (appointment.categoryId) {
        setAvailableReadings(getReadingsByCategoryId(appointment.categoryId));
      }
    } else if (initialDate) {
      setFormData(prev => ({
        ...prev,
        requestDate: format(initialDate, "yyyy-MM-dd"),
      }));
    }
  }, [appointment, initialDate, clients, getReadingsByCategoryId]);

  useEffect(() => {
    if (formData.clientId) {
      const client = getClient(formData.clientId);
      if (client) {
        setFormData(prev => ({
          ...prev,
          clientName: client.name,
          clientBirthdate: client.birthdate || "",
          clientPhone: client.phone,
          clientMessenger: client.messenger
        }));
      }
    }
  }, [formData.clientId, getClient]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "categoryId" && value) {
      const readings = getReadingsByCategoryId(value);
      setAvailableReadings(readings);
      setFormData(prev => ({
        ...prev,
        readingId: "",
        readingName: "",
        price: 0,
      }));
    }

    if (name === "readingId" && value) {
      const reading = availableReadings.find(r => r.id === value);
      if (reading) {
        const deadlineDate = calculateDeadline(
          new Date(formData.requestDate),
          reading.duration
        );
        
        setFormData(prev => ({
          ...prev,
          readingName: reading.name,
          price: reading.price,
          deadline: deadlineDate.toISOString(),
        }));
      }
    }

    if (name === "clientPhone") {
      const client = getClientByPhone(value);
      if (client) {
        setFormData(prev => ({
          ...prev,
          clientId: client.id,
          clientName: client.name,
          clientBirthdate: client.birthdate || "",
          clientMessenger: client.messenger,
        }));
      }
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let clientId = formData.clientId;
    
    if (!clientId && formData.clientName && formData.clientPhone) {
      const existingClient = getClientByPhone(formData.clientPhone);
      
      if (existingClient) {
        clientId = existingClient.id;
      } else {
        const newClient = addClient({
          name: formData.clientName,
          birthdate: formData.clientBirthdate || null,
          phone: formData.clientPhone,
          messenger: formData.clientMessenger,
        });
        clientId = newClient.id;
      }
    }
    
    const appointmentData = {
      clientId,
      clientName: formData.clientName,
      clientPhone: formData.clientPhone,
      clientMessenger: formData.clientMessenger,
      requestDate: formData.requestDate,
      request: formData.request,
      categoryId: formData.categoryId,
      readingId: formData.readingId,
      readingName: formData.readingName,
      price: formData.price,
      deadline: formData.deadline,
      completed: formData.completed,
    };
    
    if (appointment) {
      updateAppointment(appointment.id, appointmentData);
    } else {
      addAppointment(appointmentData);
    }
    
    onClose();
  };

  const handleDeadlineToggle = () => {
    setFormData(prev => ({
      ...prev,
      manualDeadline: !prev.manualDeadline,
    }));
  };

  const isMale = (text: string, name: string | null): boolean => {
    const maleKeywords = /(мужчин|парень|сын|папа|муж\b|отец|брат|дед)/i;
    if (maleKeywords.test(text)) return true;
    
    if (name) {
      const firstName = name.split(' ')[0].toLowerCase();
      return MALE_NAMES.includes(firstName);
    }
    
    return false;
  };

  const extractName = (text: string): string | null => {
    const cleanedText = text.replace(/^(Здравствуйте|Привет|Добрый день|Добрый вечер)[,!.\s]+/i, '');
    
    const nameMatch = cleanedText.match(/^([А-ЯЁ][а-яё]+)(?:\s+[А-ЯЁ][а-яё]+)?/);
    return nameMatch ? nameMatch[0] : null;
  };

  const extractBirthdate = (text: string): string | null => {
    let dateMatch = text.match(/(\d{1,2})[./](\d{1,2})[./](\d{2,4})/);
    
    if (!dateMatch) {
      dateMatch = text.match(/(\d{2})(\d{2})(\d{4})/);
    }
    
    if (!dateMatch) {
      dateMatch = text.match(/(\d{1,2})\s+(января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)\s+(\d{4})/i);
    }
    
    if (!dateMatch) return null;
    
    let day, month, year;
    
    if (dateMatch[2].length > 2) {
      const months: {[key: string]: string} = {
        'января': '01', 'февраля': '02', 'марта': '03', 'апреля': '04',
        'мая': '05', 'июня': '06', 'июля': '07', 'августа': '08',
        'сентября': '09', 'октября': '10', 'ноября': '11', 'декабря': '12'
      };
      day = dateMatch[1].padStart(2, '0');
      month = months[dateMatch[2].toLowerCase()];
      year = dateMatch[3];
    } else {
      day = dateMatch[1].padStart(2, '0');
      month = dateMatch[2].padStart(2, '0');
      year = dateMatch[3].length === 2 ? `20${dateMatch[3]}` : dateMatch[3];
    }
    
    const date = new Date(`${year}-${month}-${day}`);
    if (isNaN(date.getTime())) return null;
    
    return `${year}-${month}-${day}`;
  };

  const handleAutoFill = () => {
    if (!autoFillText) return;
    
    const name = extractName(autoFillText);
    
    let birthdate = null;
    if (name && !isMale(autoFillText, name)) {
      birthdate = extractBirthdate(autoFillText);
    }
    
    setFormData(prev => ({
      ...prev,
      clientName: name || prev.clientName,
      clientBirthdate: birthdate || prev.clientBirthdate,
      request: autoFillText,
    }));
    
    setShowAutoFill(false);
  };

  const handleClose = () => {
    const isFormEmpty = !formData.clientName && !formData.request && !formData.readingId;
    const isUnchanged = appointment && 
      formData.clientName === appointment.clientName &&
      formData.clientPhone === appointment.clientPhone &&
      formData.request === appointment.request &&
      formData.readingId === appointment.readingId &&
      formData.price === appointment.price;
      
    if (isFormEmpty || isUnchanged || confirmClose) {
      onClose();
    } else {
      setConfirmClose(true);
    }
  };

  const handleCancelClose = () => {
    setConfirmClose(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {confirmClose ? (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Закрыть без сохранения?</h2>
            <p className="mb-6">Все несохраненные данные будут потеряны.</p>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={handleCancelClose}
                className="px-4 py-2 border rounded-md hover:bg-secondary"
              >
                Отмена
              </button>
              <button 
                onClick={onClose}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
              >
                Закрыть
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">
                {appointment
                  ? viewMode === "view"
                    ? "Просмотр записи"
                    : "Редактирование записи"
                  : "Новая запись"}
              </h2>
              <button onClick={handleClose} className="p-1 rounded-full hover:bg-secondary">
                <X size={20} />
              </button>
            </div>

            {viewMode === "view" && appointment ? (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Клиент</h3>
                    <p className="font-medium">{appointment.clientName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Телефон</h3>
                    <p>{appointment.clientPhone}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Мессенджер</h3>
                    <p>{appointment.clientMessenger}</p>
                    {(appointment.clientMessenger === "WhatsApp" || appointment.clientMessenger === "Telegram") && (
                      <a 
                        href={appointment.clientMessenger === "WhatsApp" 
                          ? `https://wa.me/${appointment.clientPhone.replace(/\D/g, '')}` 
                          : `https://t.me/${appointment.clientPhone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Открыть чат
                      </a>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Статус</h3>
                    <p>{appointment.completed ? "Выполнено" : "Не выполнено"}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Запрос клиента</h3>
                  <p className="whitespace-pre-wrap">{appointment.request}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Расклад</h3>
                    <p>{appointment.readingName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Цена</h3>
                    <p>{appointment.price} ₽</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Дата запроса</h3>
                    <p>{formatDate(new Date(appointment.requestDate))}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Крайний срок</h3>
                    <p>{formatDate(new Date(appointment.deadline))}</p>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setViewMode("edit")}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                  >
                    Редактировать
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {!showAutoFill && (
                  <button
                    type="button"
                    onClick={() => setShowAutoFill(true)}
                    className="w-full px-4 py-2 text-sm border border-dashed rounded-md hover:bg-secondary mb-4"
                  >
                    Автоматически ввести данные
                  </button>
                )}
                
                {showAutoFill && (
                  <div className="border rounded-md p-4 mb-4 space-y-2">
                    <label className="block text-sm font-medium">
                      Вставьте сообщение клиента
                    </label>
                    <textarea
                      value={autoFillText}
                      onChange={(e) => setAutoFillText(e.target.value)}
                      className="w-full border rounded-md p-2 min-h-[100px]"
                      placeholder="Вставьте сообщение от клиента..."
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowAutoFill(false)}
                        className="px-3 py-1 text-sm rounded-md border"
                      >
                        Отмена
                      </button>
                      <button
                        type="button"
                        onClick={handleAutoFill}
                        className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md"
                      >
                        Анализировать
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Имя клиента*
                    </label>
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleInputChange}
                      className="w-full tarot-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Дата рождения
                    </label>
                    <input
                      type="date"
                      name="clientBirthdate"
                      value={formData.clientBirthdate}
                      onChange={handleInputChange}
                      className="w-full tarot-input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Номер телефона*
                    </label>
                    <input
                      type="tel"
                      name="clientPhone"
                      value={formData.clientPhone}
                      onChange={handleInputChange}
                      className="w-full tarot-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Мессенджер
                    </label>
                    <select
                      name="clientMessenger"
                      value={formData.clientMessenger}
                      onChange={handleInputChange}
                      className="w-full tarot-input"
                    >
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Telegram">Telegram</option>
                      <option value="Другое">Другое</option>
                    </select>
                    
                    {(formData.clientMessenger === "WhatsApp" || formData.clientMessenger === "Telegram") && formData.clientPhone && (
                      <a 
                        href={formData.clientMessenger === "WhatsApp" 
                          ? `https://wa.me/${formData.clientPhone.replace(/\D/g, '')}` 
                          : `https://t.me/${formData.clientPhone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Открыть чат
                      </a>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Дата обращения
                  </label>
                  <input
                    type="date"
                    name="requestDate"
                    value={formData.requestDate}
                    onChange={handleInputChange}
                    className="w-full tarot-input"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Запрос клиента*
                  </label>
                  <textarea
                    name="request"
                    value={formData.request}
                    onChange={handleInputChange}
                    className="w-full tarot-input min-h-[100px]"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Категория расклада*
                    </label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className="w-full tarot-input"
                      required
                    >
                      <option value="">Выберите категорию</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Вид расклада*
                    </label>
                    <select
                      name="readingId"
                      value={formData.readingId}
                      onChange={handleInputChange}
                      className="w-full tarot-input"
                      disabled={!formData.categoryId}
                      required
                    >
                      <option value="">Выберите расклад</option>
                      {availableReadings.map(reading => (
                        <option key={reading.id} value={reading.id}>
                          {reading.name} - {reading.price} ₽
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Цена расклада (₽)*
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full tarot-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium">
                        Крайний срок
                      </label>
                      <button
                        type="button"
                        onClick={handleDeadlineToggle}
                        className="text-xs text-primary hover:underline"
                      >
                        {formData.manualDeadline ? "Сохранить" : "Ввести вручную"}
                      </button>
                    </div>
                    <input
                      type={formData.manualDeadline ? "datetime-local" : "text"}
                      name="deadline"
                      value={formData.manualDeadline 
                        ? formData.deadline.split(".")[0] 
                        : formData.deadline ? formatDate(new Date(formData.deadline)) : ""}
                      onChange={handleInputChange}
                      className="w-full tarot-input"
                      readOnly={!formData.manualDeadline}
                    />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="completed"
                    name="completed"
                    checked={formData.completed}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <label htmlFor="completed" className="text-sm">
                    Отметить как выполненный
                  </label>
                </div>
                
                <div className="pt-4 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 border rounded-md hover:bg-secondary"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                  >
                    {appointment ? "Сохранить" : "Создать"}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AppointmentDialog;
