import React from 'react';

interface NavigationButtonsProps {
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  nextLabel?: string;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  nextLabel = "Next",
}) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
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
        <span className="font-semibold">{nextLabel}</span>
        <span className="text-lg">→</span>
      </button>
    </div>
  );
};
