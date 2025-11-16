export const get_user_id = async (email:string) => {
  const endpoint = "http://localhost:8000/api/get_user_id";
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
  const endpoint = `http://localhost:8000/api/add_learning_user`;
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
  const endpoint = "http://localhost:8000/api/get_user_learning_progress";
  const payload = { uid: uuid };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log("user progress:", data);

    if (data.status === "success" && data.data) {
      return {
        userId: data.data.user.id,
        lesson: data.data.lesson_progress,
        level: data.data.level_progress,
        currentLessonId: data.data.current_lesson_id,
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
  lesson: number
) => {
  const endpoint = "http://localhost:8000/api/set_user_learning_progress";
  const payload = {
    uid: uuid,
    level_progress: level,
    lesson_progress: lesson,
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
    } else {
      console.error("Failed to update user learning progress");
      return null;
    }
  } catch (err) {
    console.error("Error setting user learning progress:", err);
    return null;
  }
};

export const get_lessons_by_level = async (level: number) => {
  const endpoint = `http://localhost:8000/api/lessons/${level}`;

  try {
    const res = await fetch(endpoint);
    const data = await res.json();

    if (data.status === "success" && Array.isArray(data.data)) {
      return data.data;
    } else {
      console.error("Lessons not found for level", level);
      return [];
    }
  } catch (err) {
    console.error("Error fetching lessons for level:", err);
    return [];
  }
};

export const get_lesson = async (level: number, lesson: number) => {
  const endpoint = "http://localhost:8000/api/get_lesson";
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

