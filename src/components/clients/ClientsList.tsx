
import React, { useState } from "react";
import { Edit, Trash2, Search, Plus, UploadCloud, Calendar } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { Client } from "../../types/models";
import ClientDialog from "./ClientDialog";
import AppointmentDialog from "../appointments/AppointmentDialog";
import ImportClientsDialog from "./ImportClientsDialog";

const ClientsList: React.FC = () => {
  const { clients, deleteClient } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const filteredClients = searchTerm
    ? clients.filter(
        (client) =>
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.phone.includes(searchTerm)
      )
    : clients;

  const handleAddClient = () => {
    setSelectedClient(null);
    setIsClientDialogOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setIsClientDialogOpen(true);
  };

  const handleDeleteClient = (id: string) => {
    if (window.confirm("Удалить клиента и все его записи?")) {
      deleteClient(id);
    }
  };

  const handleAddAppointment = (client: Client) => {
    setSelectedClient(client);
    setIsAppointmentDialogOpen(true);
  };

  return (
    <div className="bg-card shadow-sm rounded-lg border p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0">
        <h2 className="text-2xl font-semibold">База клиентов</h2>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button
            onClick={() => setIsImportDialogOpen(true)}
            className="flex items-center px-3 py-2 bg-secondary text-secondary-foreground rounded-md"
          >
            <UploadCloud size={16} className="mr-1" />
            Импорт
          </button>
          <button
            onClick={handleAddClient}
            className="flex items-center px-3 py-2 bg-primary text-primary-foreground rounded-md"
          >
            <Plus size={16} className="mr-1" />
            Добавить клиента
          </button>
        </div>
      </div>
      
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
        <input
          type="text"
          placeholder="Поиск по имени или телефону..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 tarot-input"
        />
      </div>

      {clients.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          В базе нет клиентов. Добавьте первого клиента, чтобы начать работу.
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          Нет клиентов, соответствующих поисковому запросу.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Имя</th>
                <th className="text-left py-3 px-4">Телефон</th>
                <th className="text-left py-3 px-4">Мессенджер</th>
                <th className="text-left py-3 px-4">Обращений</th>
                <th className="text-right py-3 px-4">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id} className="border-b hover:bg-secondary/10">
                  <td className="py-3 px-4">{client.name}</td>
                  <td className="py-3 px-4">{client.phone}</td>
                  <td className="py-3 px-4">{client.messenger}</td>
                  <td className="py-3 px-4">{client.appointments.length}</td>
                  <td className="py-3 px-4 text-right space-x-1">
                    <button
                      onClick={() => handleAddAppointment(client)}
                      className="p-1 rounded-full hover:bg-blue-100 text-blue-600 inline-flex items-center justify-center"
                      title="Создать запись"
                    >
                      <Calendar size={16} />
                    </button>
                    <button
                      onClick={() => handleEditClient(client)}
                      className="p-1 rounded-full hover:bg-secondary inline-flex items-center justify-center"
                      title="Редактировать"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client.id)}
                      className="p-1 rounded-full hover:bg-red-100 text-red-600 inline-flex items-center justify-center"
                      title="Удалить"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ClientDialog
        isOpen={isClientDialogOpen}
        onClose={() => setIsClientDialogOpen(false)}
        client={selectedClient}
      />

      <ImportClientsDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
      />

      {selectedClient && (
        <AppointmentDialog
          isOpen={isAppointmentDialogOpen}
          onClose={() => setIsAppointmentDialogOpen(false)}
          initialDate={new Date()}
        />
      )}
    </div>
  );
};

export default ClientsList;
