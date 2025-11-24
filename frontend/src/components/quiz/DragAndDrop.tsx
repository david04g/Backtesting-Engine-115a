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

        // Use selections as the single Strategy Box category
        if (
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
        } else if (data.selection1 && Array.isArray(data.selection1)) {
          cats.push({
            id: "category1",
            label: "Category 1",
            correctAnswers: data.selection1,
          });
          if (data.selection2 && Array.isArray(data.selection2)) {
            cats.push({
              id: "category2",
              label: "Category 2",
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

    if (placedCount < 2) {
      setFeedback("Add at least two cards to the Strategy Box to keep going.");
      if (onQuizComplete) {
        onQuizComplete(false);
      }
      return;
    }

    let allCorrect = true;
    categories.forEach((category) => {
      const itemsInCategory = categoryItems[category.id] || [];
      itemsInCategory.forEach((item) => {
        if (!category.correctAnswers.includes(item)) {
          allCorrect = false;
        }
      });
    });

    if (allCorrect && placedCount >= 2) {
      setFeedback("Awesome! Two rules makes a strategy—you can keep moving.");
      if (onQuizComplete) {
        onQuizComplete(true);
      }
    } else {
      setFeedback("Add at least two cards to the Strategy Box to keep going.");
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

  const displayTitle = title || "What is a strategy?";
  const displayInstructions =
    instructions ||
    "A strategy is a small set of rules that decides when to buy or sell. Example rules are shown below. Add at least two to the box.";

  return (
    <div className={`flex flex-col gap-4 ${containerClassName}`}>
      {/* Pink header box */}
      <div
        className="rounded-lg px-6 py-5 shadow-sm"
        style={{ backgroundColor: "#F5C3D2" }}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {displayTitle}
        </h2>
        <p className="text-base text-gray-900">{displayInstructions}</p>
      </div>

      {/* Drag and Drop Area */}
      <div className="grid grid-cols-2 gap-6">
        {/* Rule Cards Column */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl" style={{ color: "#E8B6B6" }}>
              ★
            </span>
            <h3 className="font-semibold text-base text-gray-900">
              Rule Cards
            </h3>
          </div>
          <div
            onDrop={(e) => handleDrop(e, "items")}
            onDragOver={handleDragOver}
            className="space-y-2"
          >
            {availableItems.map((item, index) => (
              <div
                key={index}
                draggable
                data-source="items"
                onDragStart={(e) => handleDragStart(e, item)}
                className="rounded-lg px-4 py-3 text-base font-medium text-gray-900 cursor-move transition-all hover:opacity-80"
                style={{ backgroundColor: "#F5C3D2" }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Strategy Box Column */}
        {categories.map((category) => (
          <div key={category.id} className="flex flex-col">
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
              className="rounded-lg p-4 min-h-[200px] space-y-2"
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
