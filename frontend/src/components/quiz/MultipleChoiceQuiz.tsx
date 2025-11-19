import React, { useEffect, useState } from "react";

export interface MultipleChoiceOption {
  id: string;
  label: string;
  isCorrect?: boolean;
}

export interface MultipleChoiceQuizProps {
  question: string;
  helperText?: string;
  options: MultipleChoiceOption[];
  onQuizComplete?: (isComplete: boolean) => void;
  className?: string;
}

export const MultipleChoiceQuiz: React.FC<MultipleChoiceQuizProps> = ({
  question,
  helperText,
  options,
  onQuizComplete,
  className = "",
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);

  useEffect(() => {
    setSelectedOptionId(null);
    setFeedback(null);
    onQuizComplete?.(false);
  }, [question, onQuizComplete]);

  const handleSelect = (optionId: string) => {
    if (feedback === "correct") {
      return;
    }
    setSelectedOptionId(optionId);
    if (feedback) {
      setFeedback(null);
      onQuizComplete?.(false);
    }
  };

  const handleCheckAnswer = () => {
    if (!selectedOptionId) {
      return;
    }

    const selectedOption = options.find((option) => option.id === selectedOptionId);
    const isCorrect = !!selectedOption?.isCorrect;

    setFeedback(isCorrect ? "correct" : "incorrect");
    onQuizComplete?.(isCorrect);
  };

  const isInteractionLocked = feedback === "correct";

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="rounded-3xl px-6 py-5 shadow-sm" style={{ backgroundColor: "#F5C3D2" }}>
        <p className="text-2xl font-bold text-gray-900">{question}</p>
        {helperText && (
          <p className="mt-2 text-sm text-gray-700">{helperText}</p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const showsCorrect = feedback === "correct" && option.isCorrect;
          const showsIncorrect = feedback === "incorrect" && isSelected;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option.id)}
              disabled={isInteractionLocked}
              className={`w-full rounded-full px-6 py-3 text-left text-lg font-medium text-gray-900 shadow-sm transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                isInteractionLocked ? "cursor-not-allowed opacity-70" : "hover:-translate-y-0.5"
              } ${isSelected ? "ring-2 ring-offset-1 ring-black/40" : ""}`}
              style={{
                backgroundColor: showsCorrect
                  ? "#B7E081"
                  : showsIncorrect
                  ? "#F7C0CF"
                  : "#D9F2A6",
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleCheckAnswer}
          disabled={!selectedOptionId || isInteractionLocked}
          className={`inline-flex items-center justify-center rounded-full px-8 py-3 text-base font-semibold text-gray-900 shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
            !selectedOptionId || isInteractionLocked
              ? "cursor-not-allowed opacity-70"
              : "hover:-translate-y-0.5"
          }`}
          style={{ backgroundColor: "#F4B8C9" }}
        >
          Check Answer
        </button>

        {feedback === "incorrect" && (
          <p className="text-sm font-medium text-rose-700 text-center">
            Not quite right. Pick another option!
          </p>
        )}

        {feedback === "correct" && (
          <p className="text-sm font-medium text-green-700 text-center">
            Great job! That&apos;s the right answer.
          </p>
        )}
      </div>
    </div>
  );
};
