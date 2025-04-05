
import React, { useState } from "react";
import { X, Upload, FileSpreadsheet } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { Client } from "../../types/models";
import { v4 as uuidv4 } from "uuid";

interface ImportClientsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ImportClientsDialog: React.FC<ImportClientsDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { addClient, getClientByPhone } = useAppContext();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [importStats, setImportStats] = useState({
    total: 0,
    imported: 0,
    skipped: 0,
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file extension
    const extension = selectedFile.name.split(".").pop()?.toLowerCase();
    if (extension !== "csv" && extension !== "xlsx" && extension !== "xls") {
      setError("Поддерживаются только файлы .csv, .xlsx и .xls");
      return;
    }

    setFile(selectedFile);
    
    // This is a simplified preview since we can't actually parse Excel in the browser
    // In a real app, you'd use a library like xlsx or Papa Parse
    setPreview([
      { name: "Данные будут импортированы из файла", phone: "", messenger: "" },
      { name: "Файл успешно загружен", phone: "", messenger: "" },
      { name: selectedFile.name, phone: "", messenger: "" },
    ]);
  };

  const handleImport = () => {
    if (!file) return;
    
    setImporting(true);
    
    // Simulate import process
    setTimeout(() => {
      // In a real app, you would parse the Excel/CSV file here
      // For this demo, we'll add some fake clients
      const exampleClients = [
        { name: "Анна", phone: "+79001234567", messenger: "WhatsApp" },
        { name: "Елена", phone: "+79001234568", messenger: "Telegram" },
        { name: "Мария", phone: "+79001234569", messenger: "WhatsApp" },
        { name: "Виктория", phone: "+79001234570", messenger: "Другое" },
        { name: "Ольга", phone: "+79001234571", messenger: "WhatsApp" },
      ];
      
      let imported = 0;
      let skipped = 0;
      
      exampleClients.forEach(client => {
        const existingClient = getClientByPhone(client.phone);
        
        if (!existingClient) {
          addClient({
            name: client.name,
            birthdate: null,
            phone: client.phone,
            messenger: client.messenger as "WhatsApp" | "Telegram" | "Другое",
          });
          imported++;
        } else {
          skipped++;
        }
      });
      
      setImportStats({
        total: exampleClients.length,
        imported,
        skipped,
      });
      
      setImporting(false);
    }, 1500);
  };

  const handleClose = () => {
    setFile(null);
    setPreview([]);
    setError("");
    setImportStats({ total: 0, imported: 0, skipped: 0 });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Импорт клиентов</h2>
          <button onClick={handleClose} className="p-1 rounded-full hover:bg-secondary">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          {importStats.total > 0 ? (
            <div className="text-center py-6 space-y-4">
              <div className="flex items-center justify-center text-green-600 mb-4">
                <FileSpreadsheet size={40} />
              </div>
              <h3 className="text-lg font-medium">Импорт завершен</h3>
              <div className="space-y-2">
                <p>Всего обработано: {importStats.total}</p>
                <p>Импортировано: {importStats.imported}</p>
                <p>Пропущено (уже существуют): {importStats.skipped}</p>
              </div>
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md mt-4"
              >
                Закрыть
              </button>
            </div>
          ) : (
            <>
              <p className="mb-4 text-muted-foreground">
                Импортируйте клиентов из Excel (.xlsx, .xls) или CSV файла.
                Файл должен содержать колонки: Имя, Телефон, Мессенджер.
              </p>
              
              <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center mb-4">
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".csv,.xlsx,.xls"
                  disabled={importing}
                />
                
                {file ? (
                  <div className="space-y-2">
                    <FileSpreadsheet size={36} className="mx-auto text-primary" />
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} КБ
                    </p>
                    <button
                      onClick={() => setFile(null)}
                      className="text-sm text-red-600 hover:underline"
                      disabled={importing}
                    >
                      Удалить
                    </button>
                  </div>
                ) : (
                  <label htmlFor="file-upload" className="cursor-pointer space-y-2 block">
                    <Upload size={36} className="mx-auto text-muted-foreground" />
                    <p className="font-medium">Нажмите для выбора файла</p>
                    <p className="text-sm text-muted-foreground">
                      или перетащите файл сюда
                    </p>
                  </label>
                )}
              </div>
              
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
                  {error}
                </div>
              )}
              
              {preview.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Предпросмотр:</h3>
                  <div className="max-h-40 overflow-y-auto border rounded-md">
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-secondary">
                        <tr>
                          <th className="py-2 px-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Имя
                          </th>
                          <th className="py-2 px-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Телефон
                          </th>
                          <th className="py-2 px-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Мессенджер
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {preview.map((row, index) => (
                          <tr key={index}>
                            <td className="py-2 px-3 text-sm">{row.name}</td>
                            <td className="py-2 px-3 text-sm">{row.phone}</td>
                            <td className="py-2 px-3 text-sm">{row.messenger}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border rounded-md hover:bg-secondary"
                  disabled={importing}
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleImport}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center"
                  disabled={!file || importing}
                >
                  {importing ? (
                    <>
                      <span className="inline-block h-4 w-4 border-2 border-t-transparent border-primary-foreground rounded-full animate-spin mr-2"></span>
                      Импорт...
                    </>
                  ) : (
                    "Импортировать"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportClientsDialog;
