"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { get_uid_by_email, get_user_progress } from  "../../apiServices/userApi"

interface Progress {
  userId: string;
  lesson: string;
  level: string;
  currentLessonId: string;
}

interface ProgressContextType {
  progress: Progress | null;
  refreshProgress: () => Promise<void>;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider = ({ children }: { children: React.ReactNode }) => {
  const [progress, setProgress] = useState<Progress | null>(null);

  const refreshProgress = async () => {
    const uuid = await get_uid_by_email();
    if (!uuid) return;

    const userProgress = await get_user_progress(uuid);
    if (userProgress) {
      setProgress(userProgress);
      localStorage.setItem("userProgress", JSON.stringify(userProgress));
    }
  };

  useEffect(() => {
    const cached = localStorage.getItem("userProgress");
    if (cached) setProgress(JSON.parse(cached));
    else refreshProgress();
  }, []);

  return (
    <ProgressContext.Provider value={{ progress, refreshProgress }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used inside ProgressProvider");
  return ctx;
};
