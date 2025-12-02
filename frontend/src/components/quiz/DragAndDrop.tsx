import React, { useState, useEffect, useCallback } from "react";
import { get_drag_and_drop_from_db } from "../apiServices/userApi";

interface Category {
  id: string;
  label: string;
  placeholder?: string;
  correctAnswers: string[];
}

export interface DragAndDropFromDBProps {
  level: number;
  lesson: number;
  title?: string;
  instructions?: string;
  onQuizComplete?: (isComplete: boolean) => void;
  containerClassName?: string;
}

export const DragAndDrop: React.FC<DragAndDropFromDBProps> = ({
  level,
  lesson,
  title,
  instructions,
  onQuizComplete,
  containerClassName = "",
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryItems, setCategoryItems] = useState<Record<string, string[]>>(
    {}
  );
  const [availableItems, setAvailableItems] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log(
          "Fetching drag and drop data for level:",
          level,
          "lesson:",
          lesson
        );
        const data = await get_drag_and_drop_from_db(level, lesson);
        console.log("Drag and drop data received:", data);

        if (!data) {
          console.error("No drag and drop data returned from API");
          setError("No drag and drop data found");
          setLoading(false);
          return;
        }

        const dbItems = data.options || [];
        setItems(dbItems);
        setAvailableItems(dbItems);

        const cats: Category[] = [];

        
        let selectionTitles = data.selections_titles || data.selection_titles;
        
        
        if (selectionTitles === null || selectionTitles === undefined || selectionTitles === '') {
          console.warn("selections_titles is null/undefined/empty, will use fallback");
          selectionTitles = null;
        } else if (typeof selectionTitles === 'string') {
          try {
          
            selectionTitles = selectionTitles.trim();
          
            selectionTitles = JSON.parse(selectionTitles);
          } catch (e) {
            console.error("Failed to parse selections_titles:", e, "Raw value:", selectionTitles);
            selectionTitles = null;
          }
        }

      
        if (selectionTitles && Array.isArray(selectionTitles) && selectionTitles.length > 0) {
          console.log("✓ Using selections_titles to create categories");
          
          selectionTitles.forEach((title: string, index: number) => {
            const selectionKey = `selection${index + 1}` as keyof typeof data;
            const selectionKeyStr = String(selectionKey); 
            let correctAnswers = data[selectionKey];
            
           
            if (typeof correctAnswers === 'string') {
              try {
                correctAnswers = JSON.parse(correctAnswers);
              } catch (e) {
                console.error(`Failed to parse ${selectionKeyStr}:`, e);
              }
            }
            
            if (correctAnswers && Array.isArray(correctAnswers) && correctAnswers.length > 0) {
              cats.push({
                id: `category${index + 1}`,
                label: title,
                placeholder: `Drop items here...`,
                correctAnswers: correctAnswers,
              });
              console.log(`Created category: ${title} with ${correctAnswers.length} correct answers`);
            }
          });
        }
        
        else if (
          data.selections &&
          Array.isArray(data.selections) &&
          data.selections.length > 0
        ) {
          cats.push({
            id: "strategy-box",
            label: "Strategy Box",
            placeholder: "Drop rules here..",
            correctAnswers: data.selections,
          });
        }
        
        else if (data.selection1 && Array.isArray(data.selection1)) {
         
          
          const label1 = (selectionTitles && Array.isArray(selectionTitles) && selectionTitles[0]) 
            ? selectionTitles[0] 
            : "Category 1";
          const label2 = (selectionTitles && Array.isArray(selectionTitles) && selectionTitles[1]) 
            ? selectionTitles[1] 
            : "Category 2";
          
          cats.push({
            id: "category1",
            label: label1,
            correctAnswers: data.selection1,
          });
          if (data.selection2 && Array.isArray(data.selection2)) {
            cats.push({
              id: "category2",
              label: label2,
              correctAnswers: data.selection2,
            });
          }
        }

        

        setCategories(cats);
        setCategoryItems(() => {
          const initial: Record<string, string[]> = {};
          cats.forEach((cat) => {
            initial[cat.id] = [];
          });
          return initial;
        });
      } catch (err) {
        console.error("Error fetching drag and drop data:", err);
        setError("Failed to load drag and drop data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [level, lesson]);

  const checkAnswers = useCallback(() => {
    const placedCount = Object.values(categoryItems).reduce(
      (total, current) => total + current.length,
      0
    );


    if (placedCount === 0) {
      setFeedback("Drag items from the left to the dropzones on the right.");
      if (onQuizComplete) {
        onQuizComplete(false);
      }
      return;
    }

   
    let allCorrect = true;
    let allItemsPlaced = true;
    
    categories.forEach((category) => {
      const itemsInCategory = categoryItems[category.id] || [];
      
      
      itemsInCategory.forEach((item) => {
        if (!category.correctAnswers.includes(item)) {
          allCorrect = false;
        }
      });
      
      
      const correctAnswersInCategory = category.correctAnswers.filter(answer => 
        itemsInCategory.includes(answer)
      );
      if (correctAnswersInCategory.length < category.correctAnswers.length) {
        allItemsPlaced = false;
      }
    });

   
    const allCorrectAnswers = categories.flatMap(cat => cat.correctAnswers);
    const allPlacedItems = Object.values(categoryItems).flat();
    const missingItems = allCorrectAnswers.filter(answer => !allPlacedItems.includes(answer));
    
    if (missingItems.length > 0) {
      allItemsPlaced = false;
    }

    if (allCorrect && allItemsPlaced && placedCount > 0) {
      setFeedback("Perfect! All items are correctly categorized.");
      if (onQuizComplete) {
        onQuizComplete(true);
      }
    } else if (!allCorrect) {
      setFeedback("Some items are in the wrong category. Try again!");
      if (onQuizComplete) {
        onQuizComplete(false);
      }
    } else {
      setFeedback("Place all items in their correct categories to continue.");
      if (onQuizComplete) {
        onQuizComplete(false);
      }
    }
  }, [categoryItems, categories, onQuizComplete]);

  useEffect(() => {
    checkAnswers();
  }, [categoryItems, availableItems, checkAnswers]);

  const handleDragStart = (e: React.DragEvent, item: string) => {
    e.dataTransfer.setData("text/plain", item);
    e.dataTransfer.setData(
      "source",
      e.currentTarget.getAttribute("data-source") || "items"
    );
  };

  const handleDrop = (e: React.DragEvent, targetCategory: "items" | string) => {
    e.preventDefault();
    const item = e.dataTransfer.getData("text/plain");
    const source = e.dataTransfer.getData("source");

    if (source === "items") {
      setAvailableItems((prev) => prev.filter((i) => i !== item));
    } else {
      setCategoryItems((prev) => ({
        ...prev,
        [source]: (prev[source] || []).filter((i) => i !== item),
      }));
    }

    if (targetCategory === "items") {
      setAvailableItems((prev) => [...prev, item]);
    } else {
      setCategoryItems((prev) => ({
        ...prev,
        [targetCategory]: [...(prev[targetCategory] || []), item],
      }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-600">Loading drag and drop quiz...</p>
      </div>
    );
  }

  if (error || items.length === 0 || categories.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-600">
          {error || "No drag and drop data available for this lesson"}
        </p>
      </div>
    );
  }


  const displayTitle = title;
  const displayInstructions = instructions;
  const showHeader = displayTitle || displayInstructions;

  return (
    <div className={`flex flex-col gap-4 ${containerClassName}`}>
      {/* Pink header box - only show if title or instructions are provided */}
      {showHeader && (
        <div
          className="rounded-lg px-4 py-4 md:px-6 md:py-5 shadow-sm"
          style={{ backgroundColor: "#F5C3D2" }}
        >
          {displayTitle && (
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              {displayTitle}
            </h2>
          )}
          {displayInstructions && (
            <p className="text-sm md:text-base text-gray-900">{displayInstructions}</p>
          )}
        </div>
      )}

      {/* Drag and Drop Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 min-h-0">
        {/* Items Column */}
        <div className="flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl" style={{ color: "#E8B6B6" }}>
              ★
            </span>
            <h3 className="font-semibold text-sm md:text-base text-gray-900">
              Items
            </h3>
          </div>
          <div
            onDrop={(e) => handleDrop(e, "items")}
            onDragOver={handleDragOver}
            className="space-y-2 overflow-y-auto max-h-[300px] md:max-h-[500px] pr-2"
          >
            {availableItems.map((item, index) => (
              <div
                key={index}
                draggable
                data-source="items"
                onDragStart={(e) => handleDragStart(e, item)}
                className="rounded-lg px-3 py-2 md:px-4 md:py-3 text-sm md:text-base font-medium text-gray-900 cursor-move transition-all hover:opacity-80 flex-shrink-0"
                style={{ backgroundColor: "#F5C3D2" }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Dropzones Column - Stack multiple dropzones vertically */}
        <div className="flex flex-col gap-4 min-h-0 overflow-y-auto max-h-[300px] md:max-h-[500px]">
          {categories.map((category) => (
            <div key={category.id} className="flex flex-col flex-shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg md:text-xl" style={{ color: "#D9F2A6" }}>
                  ★
                </span>
                <h3 className="font-semibold text-sm md:text-base text-gray-900">
                  {category.label}
                </h3>
              </div>
              <div
                onDrop={(e) => handleDrop(e, category.id)}
                onDragOver={handleDragOver}
                className="rounded-lg p-3 md:p-4 min-h-[150px] md:min-h-[200px] max-h-[200px] md:max-h-[300px] space-y-2 overflow-y-auto"
                style={{ backgroundColor: "#D9F2A6" }}
              >
                {(categoryItems[category.id] || []).length === 0 &&
                  category.placeholder && (
                    <p className="text-sm text-gray-600 italic">
                      {category.placeholder}
                    </p>
                  )}
                {(categoryItems[category.id] || []).map((item, index) => (
                  <div
                    key={index}
                    draggable
                    data-source={category.id}
                    onDragStart={(e) => handleDragStart(e, item)}
                  className="rounded-lg px-3 py-2 md:px-4 md:py-3 text-sm md:text-base font-medium text-gray-900 cursor-move transition-all hover:opacity-80"
                  style={{ backgroundColor: "#F5C3D2" }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      </div>

   
      {feedback && (
        <div
          className="rounded-lg px-4 py-2 text-sm text-center"
          style={{ backgroundColor: "#D9F2A6" }}
        >
          {feedback}
        </div>
      )}
    </div>
  );
};
