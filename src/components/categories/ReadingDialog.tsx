
import React, { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import { Reading } from "../../types/models";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {reading ? "Редактирование расклада" : "Новый расклад"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="py-4">
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
          
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Отмена
              </Button>
            </DialogClose>
            <Button type="submit">
              {reading ? "Сохранить" : "Создать"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReadingDialog;
