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
    <div className="fixed bottom-4 right-4 z-40 w-full max-w-sm" role="status" aria-live="polite">
      <div
        className="relative flex items-center gap-3 rounded-2xl shadow-lg border border-black/15 px-5 py-4"
        style={{ backgroundColor: '#D9F2A6' }}
      >
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 shrink-0"
          style={{ backgroundColor: '#F4B8C9' }}
        >
          {icon ?? (
            <span className="text-2xl text-black leading-none">★</span>
          )}
        </div>

        <div className="flex flex-col gap-3 pr-6">
          <p className="text-sm font-semibold text-black leading-snug whitespace-pre-line">
            {message}
          </p>
          <div className="flex justify-end">
            <button
              onClick={onAction}
              className="rounded-full border border-black/20 px-3 py-1.5 text-sm font-semibold text-black shadow-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md"
              style={{ backgroundColor: '#F4B8C9' }}
            >
              {actionLabel}
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close level completion message"
          className="absolute right-3 top-2 text-black/70 transition-colors hover:text-black"
        >
          ×
        </button>
      </div>
    </div>
  );
};