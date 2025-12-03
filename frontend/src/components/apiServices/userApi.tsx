import { API_ENDPOINTS } from '../../config/api';

export const get_user_id = async (email:string) => {
  const endpoint = API_ENDPOINTS.GET_USER_ID;
  const payload = { email };
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    console.log(" user by email :", data);

    if (data.status === "success" && data.data) {
      const userId = data.data.id;

      return userId;
    } else {
      console.error("User not found or invalid response");
      return null;
    }
  } catch (err) {
    console.error("Error getting user by email:", err);
    return;
  }
};

export const add_learning_user = async (uuid: string) => {
  const endpoint = API_ENDPOINTS.ADD_LEARNING_USER;
  const payload = {uid: uuid};
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(payload)
  });

    const data = await res.json();
    console.log("user data:", data);
    if (data.success === "success" && data.data) {
      return {
        userId: data.data.user.id,
        level_progress: data.data.level_progress,
        lesson_progress: data.data.lesson_progress,
        last_updated: data.data.last_updated,
      }
    }
  } catch (err) {
    console.error("error adding learning user:", err);
    return null; 
  }
}


export const get_user_progress = async (uuid: string) => {
  const endpoint = API_ENDPOINTS.GET_USER_LEARNING_PROGRESS;
  const payload = { uid: uuid };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log("user progress:", data);

    if (data.status === "error") {
      console.error("no progress found, creating new progress record");
      const newProgress = await add_learning_user(uuid);
      if (newProgress) {
        return {
          userId: uuid,
          lesson: newProgress.lesson_progress,
          level: newProgress.level_progress,
          currentLessonId: 1,
          completedLessons: [],
        };
      }
      return null;
    }

    if (data.status === "success" && data.data) {
      // Initialize completedLessons as empty array if not present
      const completedLessons = data.data.completed_lessons && Array.isArray(data.data.completed_lessons)
        ? data.data.completed_lessons
            .map((value: unknown) => Number(value))
            .filter((value: number) => !Number.isNaN(value))
        : [];

      return {
        userId: data.data.user?.id || data.data.id, // Fallback to data.data.id if user object is not present
        lesson: data.data.lesson_progress || 1,
        level: data.data.level_progress || 0,
        currentLessonId: data.data.current_lesson_id || 1,
        completedLessons,
      };
    } else {
      console.error("User not found or invalid response");
      return null;
    }
  } catch (err) {
    console.error("Error getting user progress:", err);
    return null;
  }
};

export const set_user_learning_progress = async (
  uuid: string,
  level: number,
  lesson: number,
  completedLessons?: number[]
) => {
  const endpoint = API_ENDPOINTS.SET_USER_LEARNING_PROGRESS;
  const payload: Record<string, unknown> = {
    uid: uuid,
    level_progress: level,
    lesson_progress: lesson,
  };

  if (completedLessons) {
    payload.completed_lessons = completedLessons;
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.status === "success" && data.data) {
      return data.data;
    } else {
      console.error("Failed to update user learning progress");
      return null;
    }
  } catch (err) {
    console.error("Error setting user learning progress:", err);
    return null;
  }
};

export const set_user_completed_lessons = async (
  uuid: string,
  completedLessons: number[],
) => {
  const endpoint = API_ENDPOINTS.SET_USER_COMPLETED_LESSONS;
  const payload = {
    uid: uuid,
    completed_lessons: completedLessons,
  };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.status === "success" && data.data) {
      return data.data;
    }

    console.error("Failed to update completed lessons", data);
    return null;
  } catch (err) {
    console.error("Error updating completed lessons:", err);
    return null;
  }
};

export const get_lessons_by_level = async (level: number) => {
  const endpoint = API_ENDPOINTS.GET_LESSONS_BY_LEVEL(level);

  try {
    const res = await fetch(endpoint);
    const data = await res.json();

    if (data.status === "success" && Array.isArray(data.data)) {
      return data.data;
    } else {
      // No lessons found for this level - return empty array (expected behavior)
      return [];
    }
  } catch (err) {
    console.error("Error fetching lessons for level:", err);
    return [];
  }
};

export const get_all_lessons_by_levels = async (maxLevel: number = 10) => {
  // Fetch lessons for all levels up to maxLevel
  const levelPromises = [];
  for (let level = 0; level <= maxLevel; level++) {
    levelPromises.push(get_lessons_by_level(level));
  }
  
  try {
    const results = await Promise.all(levelPromises);
    const lessonsByLevel: Record<number, any[]> = {};
    
    results.forEach((lessons, index) => {
      if (lessons && lessons.length > 0) {
        lessonsByLevel[index] = lessons.sort((a: any, b: any) => (a.page_number ?? 0) - (b.page_number ?? 0));
      }
    });
    
    return lessonsByLevel;
  } catch (err) {
    console.error("Error fetching all lessons:", err);
    return {};
  }
};

export const get_lesson = async (level: number, lesson: number) => {
  const endpoint = API_ENDPOINTS.GET_LESSON;
  const payload = { level, lesson };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.status === "success" && data.data) {
      return data.data;
    } else {
      console.error("Lesson not found");
      return null;
    }
  } catch (err) {
    console.error("Error fetching lesson by id:", err);
    return null;
  }
};

export const get_quiz_from_db = async (level: number, lesson: number) => {
  const endpoint = "http://localhost:8000/api/get_quiz";
  const payload = { level, lesson };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.status === "success" && data.data) {
      return data.data;
    }
    return null;
  } catch (err) {
    console.error("Error fetching quiz:", err);
    return null;
  }
};

export const get_drag_and_drop_from_db = async (level: number, lesson: number) => {
  const endpoint = "http://localhost:8000/api/get_drag_and_drop";
  const payload = { level, lesson };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.status === "success" && data.data) {
      return data.data;
    }
    return null;
  } catch (err) {
    console.error("Error fetching drag and drop:", err);
    return null;
  }
};

