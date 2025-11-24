import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  get_lesson,
  get_lessons_by_level,
  get_user_progress,
  set_user_learning_progress,
} from "../../../components/apiServices/userApi";
import { ProgressBar, Slide } from "../../../components/lessons/ProgressBar";
import { NavigationButtons } from "../../../components/lessons/NavigationButtons";
import { LevelCompletionPopup } from "../../../components/LevelCompletionPopup";
// Import the new DB-driven components
import { DragAndDrop, MultipleChoice } from "../../../components/quiz";

interface LessonRecord {
  id: number;
  level: number;
  page_number: number;
  page_title: string;
  page_def: string;
  content_type: string;
  image_url: string | null;
  lesson_title: string;
  theme?: string | null;
}

const PageContent = () => {
  const navigate = useNavigate();
  const { level, lesson } = useParams();
  const [lessonData, setLessonData] = useState<LessonRecord | null>(null);
  const [lessons, setLessons] = useState<LessonRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [hasAttemptedQuiz, setHasAttemptedQuiz] = useState(false);
  const [quizCompletionState, setQuizCompletionState] = useState<
    Record<number, boolean>
  >({});
  const [userId, setUserId] = useState<string | null>(null);
  const [userProgress, setUserProgress] = useState<{
    level: number;
    lesson: number;
  } | null>(null);
  const [nextLevelInfo, setNextLevelInfo] = useState<{
    level: number;
    firstLesson: number;
  } | null>(null);

  // popup + level-up state
  const [showLevelCompletionPopup, setShowLevelCompletionPopup] =
    useState(false);
  const [levelUpComplete, setLevelUpComplete] = useState(false);

  const levelNum = Number(level);
  const lessonNum = Number(lesson);

  useEffect(() => {
    const fetchProgressAndLesson = async () => {
      if (Number.isNaN(levelNum) || Number.isNaN(lessonNum)) {
        return;
      }

      setLoading(true);

      try {
        const savedUserId = localStorage.getItem("user_id");
        if (savedUserId) {
          setUserId(savedUserId);
          const progress = await get_user_progress(savedUserId);
          if (progress) {
            setUserProgress({
              level: progress.level ?? 0,
              lesson: progress.lesson ?? 1,
            });

            if (levelNum > progress.level) {
              navigate(`/learn/${progress.level}/${progress.lesson || 1}`, {
                replace: true,
              });
              return;
            }
          }
        }

        const [lessonResponse, lessonsForLevel] = await Promise.all([
          get_lesson(levelNum, lessonNum),
          get_lessons_by_level(levelNum),
        ]);

        if (lessonResponse) {
          setLessonData(lessonResponse as LessonRecord);
        } else {
          setLessonData(null);
        }

        if (Array.isArray(lessonsForLevel)) {
          const sortedLessons = [...lessonsForLevel].sort(
            (a, b) => (a.page_number ?? 0) - (b.page_number ?? 0)
          );
          setLessons(sortedLessons as LessonRecord[]);
        } else {
          setLessons([]);
        }

        const upcomingLevel = levelNum + 1;
        try {
          const lessonsForNextLevel = await get_lessons_by_level(upcomingLevel);
          if (
            Array.isArray(lessonsForNextLevel) &&
            lessonsForNextLevel.length > 0
          ) {
            const sortedNext = [...lessonsForNextLevel].sort(
              (a, b) => (a.page_number ?? 0) - (b.page_number ?? 0)
            );
            const firstLessonNumber = sortedNext[0].page_number ?? 1;
            setNextLevelInfo({
              level: upcomingLevel,
              firstLesson: firstLessonNumber,
            });
          } else {
            setNextLevelInfo(null);
          }
        } catch (err) {
          console.error("Error loading next level info", err);
          setNextLevelInfo(null);
        }
      } catch (err) {
        console.error("Error loading lesson context", err);
        setLessonData(null);
        setLessons([]);
        setNextLevelInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressAndLesson();
  }, [levelNum, lessonNum, navigate]);

  useEffect(() => {
    setHasAttemptedQuiz(false);
    if (!lessonData?.id) {
      setIsQuizComplete(false);
      return;
    }

    const lessonId = lessonData.id;
    const previouslyCompleted = quizCompletionState[lessonId] ?? false;

    let derivedComplete = previouslyCompleted;

    if (!derivedComplete && userProgress) {
      const hasSavedProgress =
        lessonData.level < (userProgress?.level ?? 0) ||
        (lessonData.level === (userProgress?.level ?? 0) &&
          lessonData.page_number < (userProgress?.lesson ?? 1));

      if (hasSavedProgress) {
        derivedComplete = true;
        setQuizCompletionState((prev) =>
          prev[lessonId] ? prev : { ...prev, [lessonId]: true }
        );
      }
    }

    setIsQuizComplete(derivedComplete);
  }, [lessonData, quizCompletionState, userProgress]);

  const handleQuizCompletion = useCallback(
    (complete: boolean) => {
      const lessonId = lessonData?.id;
      if (!lessonId) {
        setIsQuizComplete(complete);
        setHasAttemptedQuiz(complete);
        return;
      }

      if (complete) {
        setQuizCompletionState((prev) =>
          prev[lessonId] ? prev : { ...prev, [lessonId]: true }
        );
        setIsQuizComplete(true);
        setHasAttemptedQuiz(true);
      } else if (!quizCompletionState[lessonId]) {
        setIsQuizComplete(false);
        setHasAttemptedQuiz(true);
      }
    },
    [lessonData?.id, quizCompletionState]
  );

  const currentIndex = useMemo(() => {
    if (!lessons.length) {
      return -1;
    }
    return lessons.findIndex((entry) => entry.page_number === lessonNum);
  }, [lessons, lessonNum]);

  const slides: Slide[] = useMemo(
    () =>
      lessons.map((entry) => ({
        id: `lesson-${entry.page_number}`,
        title: entry.page_title,
      })),
    [lessons]
  );

  const completedSlides = useMemo(() => {
    const completed = new Set<number>();
    if (currentIndex < 0) {
      return completed;
    }
    for (let i = 0; i <= currentIndex; i += 1) {
      completed.add(i);
    }
    return completed;
  }, [currentIndex]);

  const handleNavigate = (direction: "prev" | "next") => {
    if (currentIndex < 0 || !lessons.length) {
      return;
    }

    const newIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= lessons.length) {
      return;
    }

    const targetLesson = lessons[newIndex];
    navigate(`/learn/${levelNum}/${targetLesson.page_number}`);
  };

  const headingTitle =
    lessonData?.lesson_title || `Level ${lessonData?.level ?? levelNum}`;
  const supportingTitle = lessonData?.page_title ?? "";
  const description = lessonData?.page_def ?? "";
  const rawImageUrl = lessonData?.image_url?.trim();
  const imageUrl =
    rawImageUrl && rawImageUrl.toLowerCase() !== "none" ? rawImageUrl : null;

  // Check content type from database
  const isDragAndDrop = lessonData?.content_type === "drag_and_drop";
  const isMultipleChoice =
    lessonData?.content_type === "quiz" ||
    lessonData?.content_type === "multiple_choice";

  const hasPersistedCompletion = lessonData?.id
    ? !!quizCompletionState[lessonData.id]
    : false;
  const isLessonComplete = isQuizComplete || hasPersistedCompletion;
  const isLastLesson = currentIndex >= 0 && currentIndex === lessons.length - 1;
  const requiresQuiz = isDragAndDrop || isMultipleChoice;
  const baseCanAdvance = !requiresQuiz || isLessonComplete;
  const canAdvanceWithinLevel =
    currentIndex >= 0 && currentIndex < lessons.length - 1 && baseCanAdvance;
  const canStartNextLevel =
    currentIndex >= 0 && isLastLesson && !!nextLevelInfo && baseCanAdvance;
  const canGoNext = canAdvanceWithinLevel || canStartNextLevel;
  const nextButtonLabel = "Next";

  useEffect(() => {
    if (!isLastLesson || !baseCanAdvance || levelUpComplete) return;
    if (!userId || !nextLevelInfo) return;

    const doIncrement = async () => {
      try {
        await set_user_learning_progress(
          userId,
          nextLevelInfo.level,
          nextLevelInfo.firstLesson
        );
        localStorage.setItem("level", String(nextLevelInfo.level));
        localStorage.setItem("lesson", String(nextLevelInfo.firstLesson));
        setUserProgress({
          level: nextLevelInfo.level,
          lesson: nextLevelInfo.firstLesson,
        });
        setShowLevelCompletionPopup(true);
      } catch (err) {
        console.error("Error incrementing level:", err);
      }
    };

    setLevelUpComplete(true);
    doIncrement();
  }, [isLastLesson, baseCanAdvance, userId, levelUpComplete, nextLevelInfo]);

  useEffect(() => {
    setLevelUpComplete(false);
  }, [levelNum, lessonNum]);

  useEffect(() => {
    if (!isLastLesson && showLevelCompletionPopup) {
      setShowLevelCompletionPopup(false);
    }
  }, [isLastLesson, showLevelCompletionPopup]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-gray-600">
        Loading lesson...
      </div>
    );
  }

  if (!lessonData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-gray-600">
        Lesson not found
      </div>
    );
  }

  const finalHeadingTitle = headingTitle;
  const finalSupportingTitle = supportingTitle;
  const finalDescription = description;
  const finalImageUrl = imageUrl;

  // Check if we should pair image with quiz
  const shouldPairImageWithQuiz = isMultipleChoice && !!finalImageUrl;

  const imageElement = finalImageUrl ? (
    <div className="flex justify-center">
      <img
        src={finalImageUrl}
        alt={finalSupportingTitle}
        className="max-h-96 w-full max-w-md rounded-lg border border-black/10 shadow"
      />
    </div>
  ) : null;

  // Render drag and drop from database
  const dragAndDropSection = isDragAndDrop ? (
    <DragAndDrop
      level={lessonData.level}
      lesson={lessonData.page_number}
      onQuizComplete={handleQuizCompletion}
      containerClassName="max-h-[28rem]"
    />
  ) : null;

  // Render multiple choice from database
  const multipleChoiceSection = isMultipleChoice ? (
    <MultipleChoice
      level={lessonData.level}
      lesson={lessonData.page_number}
      onQuizComplete={handleQuizCompletion}
    />
  ) : null;

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full h-[calc(100vh-72px)] flex overflow-hidden">
        <div className="w-64 p-6 bg-white relative">
          <ProgressBar
            slides={slides}
            currentSlideIndex={Math.max(0, currentIndex)}
            completedSlides={completedSlides}
            heading={finalHeadingTitle}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-px bg-gray-300"
            style={{ right: "-32px" }}
          />
        </div>

        <div
          className="flex-1 flex flex-col p-8"
          style={{ marginLeft: "32px" }}
        >
          <div className="max-w-5xl mx-auto w-full flex flex-col h-full">
            <div className="flex-1 overflow-y-auto pr-1">
              <div className="flex flex-col gap-6 pb-8">
                <div
                  className="inline-flex items-center gap-4 rounded-lg px-6 py-3 text-sm font-semibold"
                  style={{
                    backgroundColor: "#D9F2A6",
                    color: "#1f2937",
                    maxWidth: "fit-content",
                  }}
                >
                  <span>Level {lessonData.level}</span>
                  <span className="opacity-70">
                    Page {lessonData.page_number}
                  </span>
                </div>

                <div className="rounded-xl border border-black/10 bg-white shadow-sm">
                  <div
                    className="rounded-t-xl px-6 py-5"
                    style={{ backgroundColor: "#F5C3D2" }}
                  >
                    <h2 className="text-3xl font-bold text-gray-900">
                      {finalSupportingTitle}
                    </h2>
                  </div>
                  <div className="p-6 flex flex-col gap-6">
                    <p className="text-lg leading-relaxed text-gray-800">
                      {finalDescription}
                    </p>

                    {/* If quiz with image, show side by side */}
                    {shouldPairImageWithQuiz ? (
                      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start">
                        {imageElement}
                        {multipleChoiceSection}
                      </div>
                    ) : (
                      <>
                        {/* If quiz without image, show quiz only */}
                        {isMultipleChoice &&
                          !finalImageUrl &&
                          multipleChoiceSection}

                        {/* If not a quiz, show image separately if exists */}
                        {!isMultipleChoice && imageElement}
                      </>
                    )}

                    {/* Drag and drop always renders separately */}
                    {dragAndDropSection}

                    {requiresQuiz && !isLessonComplete && hasAttemptedQuiz && (
                      <p className="text-sm text-rose-700 font-medium text-center">
                        Complete the quiz to continue.
                      </p>
                    )}
                    {requiresQuiz && isLessonComplete && (
                      <p className="text-sm text-green-700 font-medium text-center">
                        ✓ Lesson Complete! You can continue.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <NavigationButtons
                onPrevious={() => handleNavigate("prev")}
                onNext={async () => {
                  if (!baseCanAdvance) {
                    return;
                  }

                  if (isLastLesson) {
                    if (nextLevelInfo) {
                      navigate(
                        `/learn/${nextLevelInfo.level}/${nextLevelInfo.firstLesson}`
                      );
                    }
                    return;
                  }

                  handleNavigate("next");

                  if (userId) {
                    await set_user_learning_progress(
                      userId,
                      levelNum,
                      lessonNum + 1
                    );
                    localStorage.setItem("level", String(levelNum));
                    localStorage.setItem("lesson", String(lessonNum + 1));
                  }
                }}
                canGoPrevious={currentIndex > 0}
                canGoNext={canGoNext}
                nextLabel={nextButtonLabel}
              />
            </div>
          </div>
        </div>
      </div>

      <LevelCompletionPopup
        isOpen={showLevelCompletionPopup}
        message={`Congratulations on completing Level ${levelNum}! You've unlocked new content.`}
        actionLabel="Back to Profile"
        onAction={() => {
          setShowLevelCompletionPopup(false);
          navigate("/profile");
        }}
        onClose={() => setShowLevelCompletionPopup(false)}
      />
    </div>
  );
};

export default PageContent;
