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

        // Debug: Log all keys in data to see what we're getting
        console.log("All data keys:", Object.keys(data));
        // Check both possible field names (selections_titles vs selection_titles)
        console.log("Raw data.selections_titles:", data.selections_titles);
        console.log("Raw data.selection_titles:", data.selection_titles);
        console.log("Raw data.selection1:", data.selection1);
        console.log("Raw data.selection2:", data.selection2);

        // Parse selections_titles (note: database uses 'selections_titles' with 's')
        // Also check for 'selection_titles' for backward compatibility
        let selectionTitles = data.selections_titles || data.selection_titles;
        
        // Handle null, undefined, or empty string
        if (selectionTitles === null || selectionTitles === undefined || selectionTitles === '') {
          console.warn("selections_titles is null/undefined/empty, will use fallback");
          selectionTitles = null;
        } else if (typeof selectionTitles === 'string') {
          try {
            // Remove any extra whitespace
            selectionTitles = selectionTitles.trim();
            // Parse JSON string
            selectionTitles = JSON.parse(selectionTitles);
          } catch (e) {
            console.error("Failed to parse selections_titles:", e, "Raw value:", selectionTitles);
            selectionTitles = null;
          }
        }

        console.log("Parsed selections_titles:", selectionTitles);
        console.log("Is array?", Array.isArray(selectionTitles));
        console.log("Length?", selectionTitles?.length);

        // Check if we have selections_titles (for multiple dropzones)
        if (selectionTitles && Array.isArray(selectionTitles) && selectionTitles.length > 0) {
          console.log("✓ Using selections_titles to create categories");
          // Create categories based on selection_titles
          selectionTitles.forEach((title: string, index: number) => {
            const selectionKey = `selection${index + 1}` as keyof typeof data;
            let correctAnswers = data[selectionKey];
            
            // Parse if it's a string
            if (typeof correctAnswers === 'string') {
              try {
                correctAnswers = JSON.parse(correctAnswers);
              } catch (e) {
                console.error(`Failed to parse ${selectionKey}:`, e);
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
        // Fallback: Use selections as the single Strategy Box category (for backward compatibility)
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
        // Fallback: Use selection1 and selection2 - create categories even without titles
        // If we have selection1 and selection2, create categories with generic names
        else if (data.selection1 && Array.isArray(data.selection1)) {
          console.log("Using fallback: selection1 and selection2");
          // Try to use selections_titles if available, otherwise use generic names
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

        console.log("Final categories:", cats);

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

    // Check if all items are placed
    if (placedCount === 0) {
      setFeedback("Drag items from the left to the dropzones on the right.");
      if (onQuizComplete) {
        onQuizComplete(false);
      }
      return;
    }

    // For multiple dropzones, check if items are in correct categories
    let allCorrect = true;
    let allItemsPlaced = true;
    
    categories.forEach((category) => {
      const itemsInCategory = categoryItems[category.id] || [];
      
      // Check if items in this category are correct
      itemsInCategory.forEach((item) => {
        if (!category.correctAnswers.includes(item)) {
          allCorrect = false;
        }
      });
      
      // Check if all correct answers for this category are placed
      const correctAnswersInCategory = category.correctAnswers.filter(answer => 
        itemsInCategory.includes(answer)
      );
      if (correctAnswersInCategory.length < category.correctAnswers.length) {
        allItemsPlaced = false;
      }
    });

    // Check if there are any items that should be in a category but aren't
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

  // Only show title/instructions if they're provided (don't use defaults for drag-and-drop)
  const displayTitle = title;
  const displayInstructions = instructions;
  const showHeader = displayTitle || displayInstructions;

  return (
    <div className={`flex flex-col gap-4 ${containerClassName}`}>
      {/* Pink header box - only show if title or instructions are provided */}
      {showHeader && (
        <div
          className="rounded-lg px-6 py-5 shadow-sm"
          style={{ backgroundColor: "#F5C3D2" }}
        >
          {displayTitle && (
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {displayTitle}
            </h2>
          )}
          {displayInstructions && (
            <p className="text-base text-gray-900">{displayInstructions}</p>
          )}
        </div>
      )}

      {/* Drag and Drop Area */}
      <div className="grid grid-cols-2 gap-6 min-h-0">
        {/* Items Column */}
        <div className="flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl" style={{ color: "#E8B6B6" }}>
              ★
            </span>
            <h3 className="font-semibold text-base text-gray-900">
              Items
            </h3>
          </div>
          <div
            onDrop={(e) => handleDrop(e, "items")}
            onDragOver={handleDragOver}
            className="space-y-2 overflow-y-auto max-h-[500px] pr-2"
          >
            {availableItems.map((item, index) => (
              <div
                key={index}
                draggable
                data-source="items"
                onDragStart={(e) => handleDragStart(e, item)}
                className="rounded-lg px-4 py-3 text-base font-medium text-gray-900 cursor-move transition-all hover:opacity-80 flex-shrink-0"
                style={{ backgroundColor: "#F5C3D2" }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Dropzones Column - Stack multiple dropzones vertically */}
        <div className="flex flex-col gap-4 min-h-0 overflow-y-auto max-h-[500px]">
          {categories.map((category) => (
            <div key={category.id} className="flex flex-col flex-shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl" style={{ color: "#D9F2A6" }}>
                  ★
                </span>
                <h3 className="font-semibold text-base text-gray-900">
                  {category.label}
                </h3>
              </div>
              <div
                onDrop={(e) => handleDrop(e, category.id)}
                onDragOver={handleDragOver}
                className="rounded-lg p-4 min-h-[200px] max-h-[300px] space-y-2 overflow-y-auto"
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
                    className="rounded-lg px-4 py-3 text-base font-medium text-gray-900 cursor-move transition-all hover:opacity-80"
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

      {/* Feedback message */}
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
