import React from 'react';

interface LevelCompletionPopupProps {
  isOpen: boolean;
  message: string;
  actionLabel: string;
  onAction: () => void;
  onClose: () => void;
  icon?: React.ReactNode;
}

export const LevelCompletionPopup: React.FC<LevelCompletionPopupProps> = ({
  isOpen,
  message,
  actionLabel,
  onAction,
  onClose,
  icon,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50" role="status" aria-live="polite">
      <div
        className="relative flex items-start gap-4 rounded-3xl shadow-lg border border-black/20 px-6 py-5"
        style={{ backgroundColor: '#D9F2A6', minWidth: '340px' }}
      >
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full border border-black/10"
          style={{ backgroundColor: '#F4B8C9' }}
        >
          {icon ?? (
            <span className="text-3xl text-black leading-none">★</span>
          )}
        </div>

        <div className="flex flex-col gap-4 pr-6">
          <p className="text-sm font-semibold text-black leading-snug whitespace-pre-line">
            {message}
          </p>
          <div className="flex justify-end">
            <button
              onClick={onAction}
              className="rounded-full border border-black/20 px-4 py-2 font-semibold text-black shadow-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md"
              style={{ backgroundColor: '#F4B8C9' }}
            >
              {actionLabel}
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close level completion message"
          className="absolute right-4 top-3 text-black/70 transition-colors hover:text-black"
        >
          ×
        </button>
      </div>
    </div>
  );
};