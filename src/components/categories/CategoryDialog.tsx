
import React, { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import { Category } from "../../types/models";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
}

const CategoryDialog: React.FC<CategoryDialogProps> = ({
  isOpen,
  onClose,
  category,
}) => {
  const { addCategory, updateCategory } = useAppContext();
  const [name, setName] = useState("");

  useEffect(() => {
    if (category) {
      setName(category.name);
    } else {
      setName("");
    }
  }, [category, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (category) {
      updateCategory(category.id, { name });
    } else {
      addCategory({ name });
    }
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {category ? "Редактирование категории" : "Новая категория"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="py-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Название категории*
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full tarot-input"
              required
              placeholder="Например: Личные отношения"
            />
          </div>
          
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Отмена
              </Button>
            </DialogClose>
            <Button type="submit">
              {category ? "Сохранить" : "Создать"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDialog;
