import React, { useState, useEffect, useCallback, useRef } from 'react';

export interface Category {
  id: string;
  label: string;
  correctAnswers: string[];
  placeholder?: string;
}

export interface DragAndDropCompletionConfig {
  /** Require all items to be placed before success (default true). */
  requireAllItemsUsed?: boolean;
  /** Minimum number of items that must be placed across categories. */
  minTotalItemsRequired?: number;
  /** Skip flagging missing answers as incorrect (allows partial completion). */
  skipMissingAnswersValidation?: boolean;
  /** Automatically run validation whenever cards move (no button needed). */
  autoCheckOnDrop?: boolean;
  /** Force showing or hiding the Check Answers button (defaults to hidden when auto-checking). */
  showCheckButton?: boolean;
  /** Custom message to show once requirements satisfied. */
  successMessage?: string;
  /** Custom message when user still needs to add/move cards. */
  incompleteMessage?: string;
}

export interface DragAndDropQuizProps {
  items: string[];
  categories: Category[];
  onQuizComplete?: (isComplete: boolean) => void;
  containerClassName?: string;
  itemClassName?: string;
  categoryClassName?: string;
  completionConfig?: DragAndDropCompletionConfig;
  itemsLabel?: string;
}

export const DragAndDropQuiz: React.FC<DragAndDropQuizProps> = ({
  items,
  categories,
  onQuizComplete,
  containerClassName = '',
  itemClassName = '',
  categoryClassName = '',
  completionConfig,
  itemsLabel = 'Items',
}) => {
  // Initialize state for each category
  const [categoryItems, setCategoryItems] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    categories.forEach(cat => {
      initial[cat.id] = [];
    });
    return initial;
  });
  
  const [availableItems, setAvailableItems] = useState<string[]>(items);
  
  const [feedback, setFeedback] = useState<string | null>(null);
  const [answersChecked, setAnswersChecked] = useState(false);
  const lastCheckedState = useRef<string>('');

  const requireAllItemsUsed = completionConfig?.requireAllItemsUsed ?? true;
  const minTotalItemsRequired = completionConfig?.minTotalItemsRequired ?? 0;
  const skipMissingAnswersValidation = completionConfig?.skipMissingAnswersValidation ?? false;
  const autoCheckOnDrop = completionConfig?.autoCheckOnDrop ?? false;
  const showCheckButton = completionConfig?.showCheckButton ?? !autoCheckOnDrop;
  const successMessage = completionConfig?.successMessage;
  const incompleteMessage = completionConfig?.incompleteMessage;

  // Check answers function
  const checkAnswers = useCallback(() => {
    const wrongItems: string[] = [];
    const placedCount = Object.values(categoryItems).reduce(
      (total, current) => total + current.length,
      0
    );
    const needsMoreItems =
      (requireAllItemsUsed && availableItems.length > 0) ||
      (!requireAllItemsUsed && minTotalItemsRequired > 0 && placedCount < minTotalItemsRequired);

    // Check each category
    categories.forEach(category => {
      const itemsInCategory = categoryItems[category.id] || [];

      // Check if items in category are correct
      itemsInCategory.forEach(item => {
        if (!category.correctAnswers.includes(item)) {
          wrongItems.push(item);
        }
      });

      // Check if correct items are missing from category
      if (!skipMissingAnswersValidation) {
        category.correctAnswers.forEach(item => {
          if (!itemsInCategory.includes(item)) {
            wrongItems.push(item);
          }
        });
      }
    });

    // Remove duplicates
    const uniqueWrongItems = Array.from(new Set(wrongItems));

    // Mark that answers have been checked and save current state
    setAnswersChecked(true);
    lastCheckedState.current = JSON.stringify({ categoryItems, availableItems });
    
    if (uniqueWrongItems.length === 0 && needsMoreItems) {
      const defaultMessage = requireAllItemsUsed
        ? 'Place all cards before checking your answers.'
        : `Add at least ${minTotalItemsRequired} card${minTotalItemsRequired === 1 ? '' : 's'} to continue.`;
      const message = incompleteMessage ?? defaultMessage;
      setFeedback(message);
      if (onQuizComplete) {
        onQuizComplete(false);
      }
      return;
    }

    if (uniqueWrongItems.length === 0) {
      setFeedback(successMessage ?? 'All answers are correct!');
      if (onQuizComplete) {
        onQuizComplete(true);
      }
    } else {
      setFeedback(`The following items are in the wrong place: ${uniqueWrongItems.join(', ')}`);
      if (onQuizComplete) {
        onQuizComplete(false);
      }
    }
  }, [
    categoryItems,
    availableItems,
    categories,
    minTotalItemsRequired,
    onQuizComplete,
    requireAllItemsUsed,
    skipMissingAnswersValidation,
    successMessage,
    incompleteMessage,
  ]);

  // Check if all items are correctly placed
  const checkIfComplete = useCallback((): boolean => {
    // All items must be placed when required
    if (requireAllItemsUsed && availableItems.length > 0) {
      return false;
    }

    const placedCount = Object.values(categoryItems).reduce(
      (total, current) => total + current.length,
      0
    );

    if (!requireAllItemsUsed && minTotalItemsRequired > 0 && placedCount < minTotalItemsRequired) {
      return false;
    }

    // Check each category
    for (const category of categories) {
      const itemsInCategory = categoryItems[category.id] || [];

      // Check if all items in category are correct
      const hasIncorrectItems = itemsInCategory.some(item => !category.correctAnswers.includes(item));
      if (hasIncorrectItems) {
        return false;
      }

      if (!skipMissingAnswersValidation) {
        if (itemsInCategory.length !== category.correctAnswers.length) {
          return false;
        }

        const allCorrect = category.correctAnswers.every(item =>
          itemsInCategory.includes(item)
        );

        if (!allCorrect) {
          return false;
        }
      }
    }

    return true;
  }, [
    availableItems,
    categoryItems,
    categories,
    minTotalItemsRequired,
    requireAllItemsUsed,
    skipMissingAnswersValidation,
  ]);

  // Reset checked state when items change (user moved items, need to re-check)
  useEffect(() => {
    const currentState = JSON.stringify({ categoryItems, availableItems });
    if (answersChecked && lastCheckedState.current !== currentState) {
      setAnswersChecked(false);
      setFeedback(null);
    }
  }, [categoryItems, availableItems, answersChecked]);

  // Auto-run validation whenever cards move if enabled
  useEffect(() => {
    if (autoCheckOnDrop) {
      checkAnswers();
    }
  }, [autoCheckOnDrop, categoryItems, availableItems, checkAnswers]);
  
  // Check completion only after answers have been checked
  useEffect(() => {
    if (answersChecked) {
      const isComplete = checkIfComplete();
      if (onQuizComplete) {
        onQuizComplete(isComplete);
      }
    } else {
      // If answers haven't been checked yet, disable next button
      if (onQuizComplete) {
        onQuizComplete(false);
      }
    }
  }, [answersChecked, checkIfComplete, onQuizComplete]);
  
  const handleDragStart = (e: React.DragEvent, item: string) => {
    e.dataTransfer.setData('text/plain', item);
    e.dataTransfer.setData('source', e.currentTarget.getAttribute('data-source') || 'items');
  };
  
  const handleDrop = (e: React.DragEvent, targetCategory: 'items' | string) => {
    e.preventDefault();
    const item = e.dataTransfer.getData('text/plain');
    const source = e.dataTransfer.getData('source');
    
    // Remove from source
    if (source === 'items') {
      setAvailableItems(prev => prev.filter(i => i !== item));
    } else {
      // Remove from category
      setCategoryItems(prev => ({
        ...prev,
        [source]: (prev[source] || []).filter(i => i !== item)
      }));
    }
    
    // Add to target
    if (targetCategory === 'items') {
      setAvailableItems(prev => [...prev, item]);
    } else {
      // Add to category
      setCategoryItems(prev => ({
        ...prev,
        [targetCategory]: [...(prev[targetCategory] || []), item]
      }));
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  return (
    <div className={`flex flex-col gap-4 h-full ${containerClassName}`}>
      <div className="rounded-md p-4 flex-1 flex flex-col min-h-0" style={{ backgroundColor: '#E8B6B6' }}>
        <div 
          className="grid gap-4 flex-1 min-h-0"
          style={{ gridTemplateColumns: `repeat(${categories.length + 1}, minmax(0, 1fr))` }}
        >
          {/* Available Items Column */}
          <div
            onDrop={(e) => handleDrop(e, 'items')}
            onDragOver={handleDragOver}
            className={`rounded-md p-3 overflow-y-auto ${categoryClassName}`}
            style={{ backgroundColor: '#D9F2A6' }}
          >
            <h3 className="font-semibold mb-2 text-sm">{itemsLabel}</h3>
            <div className="space-y-1.5">
              {availableItems.map((item, index) => (
                <div
                  key={index}
                  draggable
                  data-source="items"
                  onDragStart={(e) => handleDragStart(e, item)}
                  className={`rounded-md px-3 py-1.5 text-sm cursor-move transition-all hover:opacity-80 ${itemClassName}`}
                  style={{ backgroundColor: '#E8B6B6' }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
          
          {/* Category Columns */}
          {categories.map((category) => (
            <div
              key={category.id}
              onDrop={(e) => handleDrop(e, category.id)}
              onDragOver={handleDragOver}
              className={`rounded-md p-3 overflow-y-auto ${categoryClassName}`}
              style={{ backgroundColor: '#D9F2A6' }}
            >
              <h3 className="font-semibold mb-2 text-sm">{category.label}</h3>
              <div className="space-y-1.5">
                {(categoryItems[category.id] || []).map((item, index) => (
                  <div
                    key={index}
                    draggable
                    data-source={category.id}
                    onDragStart={(e) => handleDragStart(e, item)}
                    className={`rounded-md px-3 py-1.5 text-sm cursor-move transition-all hover:opacity-80 ${itemClassName}`}
                    style={{ backgroundColor: '#E8B6B6' }}
                  >
                    {item}
                  </div>
                ))}
                {(!categoryItems[category.id] || categoryItems[category.id].length === 0) && category.placeholder && (
                  <p className="text-xs italic text-gray-600">{category.placeholder}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {(showCheckButton || feedback) && (
          <div className="mt-3 flex flex-col items-center gap-2 flex-shrink-0">
            {showCheckButton && (
              <button
                onClick={checkAnswers}
                className="rounded-md px-6 py-2 text-sm font-bold text-white transition-all hover:opacity-90 shadow-md border-2"
                style={{ backgroundColor: '#8B5A5A', borderColor: '#6B3E3E' }}
              >
                Check Answers
              </button>
            )}
            {feedback && (
              <div className="rounded-md px-3 py-1.5 text-xs text-center" style={{ backgroundColor: '#D9F2A6' }}>
                {feedback}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


