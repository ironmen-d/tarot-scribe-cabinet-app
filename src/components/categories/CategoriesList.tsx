
import React, { useState } from "react";
import { Edit, Trash2, Plus } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { Category, Reading } from "../../types/models";
import CategoryDialog from "./CategoryDialog";
import ReadingDialog from "./ReadingDialog";

const CategoriesList: React.FC = () => {
  const { categories, deleteCategory, deleteReading } = useAppContext();
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isReadingDialogOpen, setIsReadingDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedReading, setSelectedReading] = useState<Reading | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategoryExpand = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsCategoryDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsCategoryDialogOpen(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (window.confirm("Удалить категорию и все связанные расклады?")) {
      deleteCategory(categoryId);
    }
  };

  const handleAddReading = (category: Category) => {
    setSelectedCategory(category);
    setSelectedReading(null);
    setIsReadingDialogOpen(true);
  };

  const handleEditReading = (reading: Reading) => {
    setSelectedReading(reading);
    setIsReadingDialogOpen(true);
  };

  const handleDeleteReading = (readingId: string) => {
    if (window.confirm("Удалить расклад?")) {
      deleteReading(readingId);
    }
  };

  return (
    <div className="bg-card shadow-sm rounded-lg border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Категории и расклады</h2>
        <button
          onClick={handleAddCategory}
          className="flex items-center px-3 py-2 bg-primary text-primary-foreground rounded-md"
        >
          <Plus size={16} className="mr-1" />
          Добавить категорию
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          Нет категорий. Создайте первую категорию, чтобы начать работу.
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.id} className="border rounded-lg overflow-hidden">
              <div
                className="flex justify-between items-center p-4 bg-secondary/50 cursor-pointer"
                onClick={() => toggleCategoryExpand(category.id)}
              >
                <h3 className="text-lg font-medium">{category.name}</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCategory(category);
                    }}
                    className="p-1 rounded-full hover:bg-secondary"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(category.id);
                    }}
                    className="p-1 rounded-full hover:bg-red-100 text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {expandedCategories[category.id] && (
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Расклады в категории</h4>
                    <button
                      onClick={() => handleAddReading(category)}
                      className="flex items-center text-sm px-2 py-1 bg-secondary rounded"
                    >
                      <Plus size={14} className="mr-1" />
                      Добавить расклад
                    </button>
                  </div>

                  {category.readings.length === 0 ? (
                    <div className="text-center text-muted-foreground py-2">
                      В этой категории нет раскладов
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {category.readings.map((reading) => (
                        <div
                          key={reading.id}
                          className="flex justify-between items-center p-3 bg-background rounded border"
                        >
                          <div>
                            <div className="font-medium">{reading.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {reading.price} ₽ • {reading.duration.value} {
                                reading.duration.unit === "minutes" ? "мин." :
                                reading.duration.unit === "hours" ? "ч." : "дн."
                              }
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditReading(reading)}
                              className="p-1 rounded-full hover:bg-secondary"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteReading(reading.id)}
                              className="p-1 rounded-full hover:bg-red-100 text-red-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <CategoryDialog
        isOpen={isCategoryDialogOpen}
        onClose={() => setIsCategoryDialogOpen(false)}
        category={selectedCategory}
      />

      <ReadingDialog
        isOpen={isReadingDialogOpen}
        onClose={() => setIsReadingDialogOpen(false)}
        categoryId={selectedCategory?.id || ""}
        reading={selectedReading}
      />
    </div>
  );
};

export default CategoriesList;
