"use client";
import React, { useEffect, useState } from "react";
import {
  get_user_id,
  get_lesson_by_id,
  get_user_progress,
} from "../../../components/apiServices/userApi";
import LearningPath from "../../../components/lesson/LearningPath/LearningPath";

interface Lesson {
  id: number;
  page_title: string;
  page_def: string;
  content_type: string;
  image_url?: string;
  lesson_title?: string;
}

const LessonPage = () => {
  const [lessonData, setLessonData] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLesson = async () => {
      const uuid = await get_user_id();
      if (!uuid) return;

      const progress = await get_user_progress(uuid);
      if (!progress) return;

      const lesson = await get_lesson_by_id(progress.currentLessonId);
      if (lesson) setLessonData(lesson);

      setLoading(false);
    };

    loadLesson();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Lesson title */}
      <div className="bg-lime-200 p-4 rounded-xl font-bold text-gray-800 text-lg">
        {lessonData?.lesson_title}
        <LearningPath />
      </div>

      {/* Page content */}
      <div className="bg-pink-200 p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-2">{lessonData?.page_title}</h2>
        <p className="text-gray-700">{lessonData?.page_def}</p>
      </div>

      {/* Optional image */}
      {lessonData?.image_url && (
        <div className="flex justify-center">
          <img
            src={lessonData.image_url}
            alt={lessonData.page_title}
            className="rounded-xl shadow-md w-[80%] max-w-2xl"
          />
        </div>
      )}

      {/*check what type of content_type it is*/}
      {lessonData?.content_type === "quiz" && (
        <div className="bg-white border rounded-lg p-4 mt-4 shadow">
          <p>Quiz Component goes here</p>
        </div>
      )}
      {lessonData?.content_type === "information" && (
        <div className="bg-white border rounded-lg p-4 mt-4 shadow">
          <p>information Component goes here</p>
        </div>
      )}
      {lessonData?.content_type === "drag_and_drop" && (
        <div className="bg-white border rounded-lg p-4 mt-4 shadow">
          <p>drag_and_drop Component goes here</p>
        </div>
      )}
      {lessonData?.content_type === "mini_backtesting" && (
        <div className="bg-white border rounded-lg p-4 mt-4 shadow">
          <p>mini_backtesting Component goes here</p>
        </div>
      )}
    </div>
  );
};

export default LessonPage;
