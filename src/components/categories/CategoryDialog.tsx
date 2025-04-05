
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { Category } from "../../types/models";

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">
            {category ? "Редактирование категории" : "Новая категория"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-secondary">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
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
          
          <div className="flex justify-end space-x-2">
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
              {category ? "Сохранить" : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryDialog;
