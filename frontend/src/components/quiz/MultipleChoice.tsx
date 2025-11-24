import React, { useState, useEffect } from "react";
import { get_quiz_from_db } from "../apiServices/userApi";

export interface MultipleChoiceOption {
  id: string;
  label: string;
  isCorrect: boolean;
}

export interface QuizFromDBProps {
  level: number;
  lesson: number;
  onQuizComplete?: (isComplete: boolean) => void;
  className?: string;
  questionData?: {
    question: string;
    options: string[];
    answer: string;
  };
}

export const MultipleChoice: React.FC<QuizFromDBProps> = ({
  level,
  lesson,
  onQuizComplete,
  className = "",
  questionData,
}) => {
  const [loading, setLoading] = useState(!questionData);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState<string>(
    questionData?.question || ""
  );
  const [options, setOptions] = useState<MultipleChoiceOption[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(
    null
  );

  useEffect(() => {
    // If questionData is provided, use it directly
    if (questionData) {
      setQuestion(questionData.question);
      const formattedOptions: MultipleChoiceOption[] = questionData.options.map(
        (option: string, index: number) => ({
          id: `option-${index}`,
          label: option,
          isCorrect: option === questionData.answer,
        })
      );
      setOptions(formattedOptions);
      setLoading(false);
      return;
    }

    // Otherwise fetch from API
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching quiz data for level:", level, "lesson:", lesson);
        const data = await get_quiz_from_db(level, lesson);
        console.log("Quiz data received:", data);

        if (!data) {
          console.error("No quiz data returned from API");
          setError("No quiz data found");
          setLoading(false);
          return;
        }

        if (!data.question || !data.options || !data.answer) {
          console.error("Quiz data missing required fields:", data);
          setError("Invalid quiz data structure");
          setLoading(false);
          return;
        }

        setQuestion(data.question || "");
        const dbOptions = data.options || [];
        const formattedOptions: MultipleChoiceOption[] = dbOptions.map(
          (option: string, index: number) => ({
            id: `option-${index}`,
            label: option,
            isCorrect: option === data.answer,
          })
        );
        setOptions(formattedOptions);
      } catch (err) {
        console.error("Error fetching quiz data:", err);
        setError("Failed to load quiz data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [level, lesson, questionData]);

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
    // Clear feedback when selecting a new option after an incorrect attempt
    if (feedback === "incorrect") {
      setFeedback(null);
      onQuizComplete?.(false);
    }
  };

  const handleCheckAnswer = () => {
    if (!selectedOptionId) {
      return;
    }
    const selectedOption = options.find(
      (option) => option.id === selectedOptionId
    );
    const isCorrect = !!selectedOption?.isCorrect;
    setFeedback(isCorrect ? "correct" : "incorrect");
    onQuizComplete?.(isCorrect);
  };

  const isInteractionLocked = feedback === "correct";

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-600">Loading quiz...</p>
      </div>
    );
  }

  if (error || !question || options.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-600">
          {error || "No quiz data available for this lesson"}
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Question header */}
      <div
        className="rounded-lg px-6 py-5 shadow-sm"
        style={{ backgroundColor: "#F5C3D2" }}
      >
        <h2 className="text-2xl font-bold text-gray-900">{question}</h2>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            disabled={isInteractionLocked}
            className={`w-full rounded-lg px-4 py-3 text-left text-base font-medium text-gray-900 transition-all ${
              selectedOptionId === option.id
                ? "ring-2 ring-blue-500"
                : "hover:opacity-80"
            } ${
              isInteractionLocked
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer"
            }`}
            style={{ backgroundColor: "#F5C3D2" }}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Check Answer Button */}
      <button
        onClick={handleCheckAnswer}
        disabled={!selectedOptionId || isInteractionLocked}
        className="rounded-lg px-6 py-3 font-semibold text-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: "#D9F2A6" }}
      >
        Check Answer
      </button>

      {/* Feedback */}
      {feedback && (
        <div
          className="rounded-lg px-4 py-2 text-sm text-center font-medium"
          style={{
            backgroundColor: feedback === "correct" ? "#D9F2A6" : "#F5C3D2",
          }}
        >
          {feedback === "correct"
            ? "✓ Correct! Great job!"
            : "✗ Not quite. Try again!"}
        </div>
      )}
    </div>
  );
};
