
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
import { toast } from "@/hooks/use-toast";

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
  const [durationValue, setDurationValue] = useState(0);
  const [durationUnit, setDurationUnit] = useState<"minutes" | "hours" | "days">("minutes");
  const [color, setColor] = useState("");

  const predefinedColors = [
    "#e57373", // Light Red
    "#f06292", // Light Pink
    "#ba68c8", // Light Purple
    "#9575cd", // Light Deep Purple
    "#7986cb", // Light Indigo
    "#64b5f6", // Light Blue
    "#4fc3f7", // Light Light Blue
    "#4dd0e1", // Light Cyan
    "#4db6ac", // Light Teal
    "#81c784", // Light Green
    "#aed581", // Light Light Green
    "#dce775", // Light Lime
    "#fff176", // Light Yellow
    "#ffd54f", // Light Amber
    "#ffb74d", // Light Orange
    "#ff8a65", // Light Deep Orange
  ];

  useEffect(() => {
    if (reading) {
      setName(reading.name);
      setPrice(reading.price);
      setDurationValue(reading.duration.value);
      setDurationUnit(reading.duration.unit);
      setColor(reading.color || "");
    } else {
      setName("");
      setPrice(0);
      setDurationValue(0);
      setDurationUnit("minutes");
      setColor("");
    }
  }, [reading, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const readingData = {
      name,
      price,
      duration: {
        value: durationValue,
        unit: durationUnit,
      },
      color
    };
    
    try {
      if (reading) {
        await updateReading(reading.id, readingData);
      } else {
        await addReading(categoryId, readingData);
      }
      
      toast({
        title: reading ? "Расклад обновлен" : "Расклад создан",
        description: `Расклад "${name}" успешно ${reading ? "обновлен" : "создан"}.`,
      });
      
      onClose();
    } catch (error) {
      console.error("Ошибка при сохранении расклада:", error);
      toast({
        title: "Ошибка при сохранении расклада",
        description: "Пожалуйста, проверьте соединение и попробуйте снова.",
        variant: "destructive",
      });
    }
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
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Длительность*
                </label>
                <input
                  type="number"
                  value={durationValue}
                  onChange={(e) => setDurationValue(Number(e.target.value))}
                  className="w-full tarot-input"
                  required
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Единица времени*
                </label>
                <select
                  value={durationUnit}
                  onChange={(e) => setDurationUnit(e.target.value as "minutes" | "hours" | "days")}
                  className="w-full tarot-input"
                  required
                >
                  <option value="minutes">минут</option>
                  <option value="hours">часов</option>
                  <option value="days">дней</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Цвет расклада
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {predefinedColors.map((clr) => (
                  <div
                    key={clr}
                    onClick={() => setColor(clr)}
                    className={`w-6 h-6 rounded-full cursor-pointer ${
                      color === clr ? "ring-2 ring-primary ring-offset-2" : ""
                    }`}
                    style={{ backgroundColor: clr }}
                  />
                ))}
                <div
                  onClick={() => setColor("")}
                  className={`w-6 h-6 rounded-full cursor-pointer border ${
                    color === "" ? "ring-2 ring-primary ring-offset-2" : ""
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-gray-400"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </div>
              </div>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full tarot-input h-10"
              />
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
