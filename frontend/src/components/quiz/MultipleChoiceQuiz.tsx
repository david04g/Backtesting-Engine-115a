import React, { useEffect, useState } from "react";

export interface MultipleChoiceOption {
  id: string;
  label: string;
  helper?: string;
}

export interface MultipleChoiceQuizProps {
  question: string;
  options: MultipleChoiceOption[];
  correctOptionId: string;
  onQuizComplete?: (isComplete: boolean) => void;
  helperText?: string;
  containerClassName?: string;
  optionClassName?: string;
  isComplete?: boolean;
}

export const MultipleChoiceQuiz: React.FC<MultipleChoiceQuizProps> = ({
  question,
  options,
  correctOptionId,
  onQuizComplete,
  helperText,
  containerClassName = "",
  optionClassName = "",
  isComplete = false,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle");

  useEffect(() => {
    if (!isComplete) {
      setSelectedOptionId(null);
      setFeedback(null);
      setStatus("idle");
      if (onQuizComplete) {
        onQuizComplete(false);
      }
    }
  }, [question, options, correctOptionId, isComplete, onQuizComplete]);

  useEffect(() => {
    if (isComplete) {
      setSelectedOptionId(correctOptionId);
      setStatus("correct");
      setFeedback("Great job! That's correct.");
    }
  }, [isComplete, correctOptionId]);

  const handleSelect = (optionId: string) => {
    if (status === "correct") {
      return;
    }
    setSelectedOptionId(optionId);
    setFeedback(null);
    if (status !== "idle") {
      setStatus("idle");
    }
  };

  const handleCheckAnswer = () => {
    if (!selectedOptionId) {
      return;
    }

    if (selectedOptionId === correctOptionId) {
      setStatus("correct");
      setFeedback("Great job! That's correct.");
      if (onQuizComplete) {
        onQuizComplete(true);
      }
    } else {
      setStatus("incorrect");
      setFeedback("Not quite. Try again.");
      if (onQuizComplete) {
        onQuizComplete(false);
      }
    }
  };

  const isCheckDisabled = status === "correct" || !selectedOptionId;

  return (
    <div
      className={`rounded-xl border border-black/10 bg-white shadow-sm p-4 flex flex-col gap-4 ${containerClassName}`}
    >
      <div className="space-y-2">
        <p className="font-semibold text-base text-gray-900">{question}</p>
        {helperText && (
          <p className="text-sm text-gray-700" data-testid="multiple-choice-helper">
            {helperText}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-3">
        {options.map((option) => {
          const isSelected = option.id === selectedOptionId;
          const isCorrectOption = option.id === correctOptionId;
          const isIncorrectSelection = status === "incorrect" && isSelected;
          const isCorrectSelection = status === "correct" && isCorrectOption;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option.id)}
              disabled={status === "correct" && !isCorrectSelection}
              className={`rounded-lg border-2 px-4 py-3 text-left text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                isCorrectSelection
                  ? "bg-lime-200 border-lime-500 text-gray-900"
                  : isIncorrectSelection
                  ? "bg-rose-100 border-rose-400 text-rose-700"
                  : isSelected
                  ? "bg-rose-50 border-rose-300 text-gray-900"
                  : "bg-white border-transparent text-gray-900"
              } ${status === "correct" && !isCorrectSelection ? "opacity-70" : ""} ${
                optionClassName
              }`}
            >
              <span className="font-medium block">{option.label}</span>
              {option.helper && (
                <span className="mt-1 block text-xs text-gray-600">{option.helper}</span>
              )}
            </button>
          );
        })}
      </div>
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleCheckAnswer}
          disabled={isCheckDisabled}
          className={`rounded-md px-6 py-2 text-sm font-bold text-white transition-all hover:opacity-90 shadow-md border-2 ${
            isCheckDisabled
              ? "cursor-not-allowed opacity-70 bg-rose-300 border-rose-300"
              : "bg-rose-600 border-rose-700"
          }`}
        >
          Check Answer
        </button>
        {feedback && (
          <div
            className={`rounded-md px-3 py-1.5 text-xs text-center ${
              status === "correct"
                ? "bg-lime-200 text-gray-900"
                : "bg-rose-100 text-rose-700"
            }`}
          >
            {feedback}
          </div>
        )}
      </div>
    </div>
  );
};
