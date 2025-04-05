
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { Reading } from "../../types/models";

interface ReadingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  reading?: Reading | null;
}

const ReadingDialog: React.FC<ReadingDialogProps> = ({
  isOpen,
  onClose,
  categoryId,
  reading,
}) => {
  const { addReading, updateReading } = useAppContext();
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [durationValue, setDurationValue] = useState(1);
  const [durationUnit, setDurationUnit] = useState<"minutes" | "hours" | "days">("days");

  useEffect(() => {
    if (reading) {
      setName(reading.name);
      setPrice(reading.price);
      setDurationValue(reading.duration.value);
      setDurationUnit(reading.duration.unit);
    } else {
      setName("");
      setPrice(0);
      setDurationValue(1);
      setDurationUnit("days");
    }
  }, [reading, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const readingData = {
      name,
      price,
      duration: {
        value: durationValue,
        unit: durationUnit,
      },
    };
    
    if (reading) {
      updateReading(reading.id, readingData);
    } else {
      addReading(categoryId, readingData);
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">
            {reading ? "Редактирование расклада" : "Новый расклад"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-secondary">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Название расклада*
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full tarot-input"
                required
                placeholder="Например: Кельтский крест"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Цена (₽)*
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full tarot-input"
                required
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Длительность*
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={durationValue}
                  onChange={(e) => setDurationValue(Number(e.target.value))}
                  className="tarot-input w-24"
                  required
                  min="1"
                />
                <select
                  value={durationUnit}
                  onChange={(e) => setDurationUnit(e.target.value as "minutes" | "hours" | "days")}
                  className="tarot-input flex-1"
                >
                  <option value="minutes">минут</option>
                  <option value="hours">часов</option>
                  <option value="days">дней</option>
                </select>
              </div>
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
              {reading ? "Сохранить" : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReadingDialog;
