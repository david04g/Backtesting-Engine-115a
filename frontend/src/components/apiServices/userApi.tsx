const savedEmail = localStorage.getItem("userEmail");
export const get_user_id = async () => {
  const endpoint = "http://localhost:8000/api/get_user_id";
  const payload = { email: savedEmail };
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
        userId: data.data.id,
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

export const get_lesson_by_id = async (lesson_id: number) => {
  const endpoint = "http://localhost:8000/api/get_lesson_by_id";
  const payload = { lesson_id };

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
