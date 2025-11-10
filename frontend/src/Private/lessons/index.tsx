"use client";
import React from "react";

import { useNavigate } from "react-router-dom";
import { get_uid_by_email } from "../../components/apiServices/userApi";
import { get_user_progress } from "../../components/apiServices/userApi";

const LessonPage = () => {
  const navigate = useNavigate();
  const handleStart = async () => {
    const uuid = await get_uid_by_email();
    if (uuid) {
      const progress = await get_user_progress(uuid);
      if (progress) {
        const lesson = progress.lesson;
        const pageNumber = progress.level;
        navigate(`/${lesson}/${pageNumber}`);
      }
    }
  };

  return (
    <div>
      Lessons to go over
      <button onClick={handleStart}>Start</button>
    </div>
  );
};

export default LessonPage;
