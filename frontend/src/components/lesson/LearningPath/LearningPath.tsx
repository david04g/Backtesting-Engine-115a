"use client";
import React from "react";

interface Step {
  id: number;
  title: string;
  color?: string;
}

const steps: Step[] = [
  { id: 1, title: "What is a strategy?", color: "bg-pink-300" },
  { id: 2, title: "What is backtesting?", color: "bg-lime-200" },
  { id: 3, title: "Read a Chart", color: "bg-lime-200" },
  { id: 4, title: "Mini Quiz", color: "bg-lime-200" },
  { id: 5, title: "Price Trends", color: "bg-lime-200" },
  { id: 6, title: "Moving Averages", color: "bg-lime-200" },
];

const LearningPath: React.FC = (step) => {
    
  return (
    <div className="flex justify-center py-12 bg-white">
      <div className="relative flex flex-col items-center">
        {/* Connecting line */}
        <div className="absolute left-1/2 -translate-x-1/2 top-8 bottom-8 w-[2px] bg-gray-300 z-0" />

        {/* Steps */}
        <div className="flex flex-col gap-10 z-10">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="flex items-center gap-4"
              style={{
                flexDirection: index % 2 === 0 ? "row-reverse" : "row",
              }}
            >
              <div
                className={`w-16 h-16 rounded-full ${step.color} flex-shrink-0 border border-gray-200`}
              />
              <p className="text-gray-700 text-lg font-medium">
                {index === 0 ? <strong>{step.title}</strong> : step.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearningPath;
