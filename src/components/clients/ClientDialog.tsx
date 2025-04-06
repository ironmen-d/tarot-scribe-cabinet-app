
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { Client } from "../../types/models";

interface ClientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
}

const ClientDialog: React.FC<ClientDialogProps> = ({
  isOpen,
  onClose,
  client,
}) => {
  const { addClient, updateClient } = useAppContext();
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [phone, setPhone] = useState("");
  const [messenger, setMessenger] = useState<"WhatsApp" | "Telegram" | "Другое">("WhatsApp");

  useEffect(() => {
    if (client) {
      setName(client.name);
      setBirthdate(client.birthdate || "");
      setPhone(client.phone);
      setMessenger(client.messenger);
    } else {
      setName("");
      setBirthdate("");
      setPhone("");
      setMessenger("WhatsApp");
    }
  }, [client, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const clientData = {
      name,
      birthdate: birthdate || null,
      phone,
      messenger,
    };
    
    try {
      if (client) {
        await updateClient(client.id, clientData);
      } else {
        await addClient(clientData);
      }
      onClose();
    } catch (error) {
      console.error("Error saving client:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">
            {client ? "Редактирование клиента" : "Новый клиент"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-secondary">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Имя клиента*
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                className="w-full tarot-input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Номер телефона*
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full tarot-input"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Мессенджер
              </label>
              <select
                value={messenger}
                onChange={(e) => setMessenger(e.target.value as "WhatsApp" | "Telegram" | "Другое")}
                className="w-full tarot-input"
              >
                <option value="WhatsApp">WhatsApp</option>
                <option value="Telegram">Telegram</option>
                <option value="Другое">Другое</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-secondary"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              {client ? "Сохранить" : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientDialog;
