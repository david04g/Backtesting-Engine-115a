import React from 'react';

interface NavigationButtonsProps {
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
}) => {
  return (
    <div className="flex justify-center gap-8 mt-8">
      <button
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all ${
          canGoPrevious
            ? 'hover:opacity-80 active:scale-[0.98] cursor-pointer'
            : 'opacity-50 cursor-not-allowed'
        }`}
        style={{ backgroundColor: '#E8B6B6' }}
      >
        <span className="text-lg">←</span>
        <span className="font-semibold">Previous</span>
      </button>
      
      <button
        onClick={onNext}
        disabled={!canGoNext}
        className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all ${
          canGoNext
            ? 'hover:opacity-80 active:scale-[0.98] cursor-pointer'
            : 'opacity-50 cursor-not-allowed'
        }`}
        style={{ backgroundColor: '#E8B6B6' }}
      >
        <span className="font-semibold">Next</span>
        <span className="text-lg">→</span>
      </button>
    </div>
  );
};

