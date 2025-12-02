import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { X } from "lucide-react";
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
import { EntryExitActivity } from "../../../components/lessons/EntryExitActivity";

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
    completedLessons?: number[];
  } | null>(null);
  const [nextLevelInfo, setNextLevelInfo] = useState<{
    level: number;
    firstLesson: number;
  } | null>(null);

  // popup + level-up state
  const [showLevelCompletionPopup, setShowLevelCompletionPopup] =
    useState(false);
  const [levelUpComplete, setLevelUpComplete] = useState(false);
  const [showLockedLessonPopup, setShowLockedLessonPopup] = useState(false);

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
              completedLessons: progress.completedLessons || [],
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
          
          // Check if current lesson is unlocked
          const currentLesson = sortedLessons.find(l => l.page_number === lessonNum);
          if (currentLesson && savedUserId) {
            const progress = await get_user_progress(savedUserId);
            if (progress) {
              const completedLessons = progress.completedLessons || [];
              const completedSet = new Set(completedLessons);
              
              // Update local progress to include current lesson if it's further than current progress
              // This ensures visited pages are tracked even when navigating back
              const currentProgressLevel = progress.level ?? 0;
              const currentProgressLesson = progress.lesson ?? 1;
              
              if (levelNum > currentProgressLevel || 
                  (levelNum === currentProgressLevel && lessonNum > currentProgressLesson)) {
                // Update local state to reflect the furthest reached lesson
                setUserProgress({
                  level: levelNum,
                  lesson: lessonNum,
                  completedLessons: completedLessons,
                });
              } else {
                // Keep existing progress but ensure state is set
                setUserProgress({
                  level: currentProgressLevel,
                  lesson: currentProgressLesson,
                  completedLessons: completedLessons,
                });
              }
              
              // Find current lesson index
              const currentIndex = sortedLessons.findIndex(l => l.page_number === lessonNum);
              
              // Check if lesson is unlocked
              let isUnlocked = false;
              if (currentIndex === 0) {
                // First lesson is always unlocked
                isUnlocked = true;
              } else if (currentIndex > 0) {
                // Check if previous lesson is completed
                const prevLesson = sortedLessons[currentIndex - 1];
                if (prevLesson && completedSet.has(prevLesson.id)) {
                  isUnlocked = true;
                }
                // Only allow access if user is currently viewing this exact lesson (to prevent redirect loops)
                // But don't allow access to future lessons even if they match progress
                else if (currentLesson.level === levelNum && 
                         currentLesson.page_number === lessonNum) {
                  // They're already on this page, allow them to stay
                  isUnlocked = true;
                }
              }
              
              // Redirect if lesson is locked (unless they're already on it)
              if (!isUnlocked) {
                // Find the last completed lesson index
                let lastCompletedIndex = -1;
                for (let i = sortedLessons.length - 1; i >= 0; i--) {
                  if (sortedLessons[i]?.id && completedSet.has(sortedLessons[i].id)) {
                    lastCompletedIndex = i;
                    break;
                  }
                }
                
                if (lastCompletedIndex >= 0 && lastCompletedIndex < sortedLessons.length - 1) {
                  // Go to the next lesson after the last completed one
                  const targetLesson = sortedLessons[lastCompletedIndex + 1];
                  navigate(`/learn/${targetLesson.level}/${targetLesson.page_number}`, { replace: true });
                  return;
                } else if (lastCompletedIndex >= 0) {
                  // Last lesson is completed, stay on it (don't redirect)
                  // This handles the case where user is on the last page
                  return;
                } else {
                  // No completed lessons, go to first lesson
                  navigate(`/learn/${sortedLessons[0].level}/${sortedLessons[0].page_number}`, { replace: true });
                  return;
                }
              }
            }
          }
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
    async (complete: boolean) => {
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
        
        // Add lesson to completed lessons and save to backend
        if (userId) {
          const currentCompleted = userProgress?.completedLessons || [];
          if (!currentCompleted.includes(lessonId)) {
            const updatedCompleted = [...currentCompleted, lessonId];
            setUserProgress((prev) => ({
              ...(prev || { level: 0, lesson: 1 }),
              completedLessons: updatedCompleted,
            }));
            
            // Save to backend
            await set_user_learning_progress(
              userId,
              levelNum,
              lessonNum,
              updatedCompleted
            );
          }
        }
      } else if (!quizCompletionState[lessonId]) {
        setIsQuizComplete(false);
        setHasAttemptedQuiz(true);
      }
    },
    [lessonData?.id, quizCompletionState, userId, userProgress, levelNum, lessonNum]
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
        lessonId: entry.id,
      })),
    [lessons]
  );

  const completedLessonIds = useMemo(() => {
    const completed = new Set<number>();
    if (userProgress?.completedLessons) {
      userProgress.completedLessons.forEach((id) => completed.add(id));
    }
    return completed;
  }, [userProgress?.completedLessons]);

  const unlockedLessonIds = useMemo(() => {
    const unlocked = new Set<number>();
    if (lessons.length === 0 || !userProgress) return unlocked;
    
    const currentLevel = userProgress.level;
    const currentLesson = userProgress.lesson;
    
    // Unlock all lessons that the user has already gone through
    lessons.forEach(lesson => {
      // Unlock if:
      // 1. It's on a previous level (user has progressed past it)
      // 2. It's on the same level and page_number <= user's current lesson (they've already been there)
      if (lesson.level < currentLevel) {
        unlocked.add(lesson.id);
      } else if (lesson.level === currentLevel && lesson.page_number <= currentLesson) {
        unlocked.add(lesson.id);
      }
    });
    
    return unlocked;
  }, [lessons, userProgress]);

  const completedSlides = useMemo(() => {
    const completed = new Set<number>();
    lessons.forEach((lesson, index) => {
      // Fill circle if lesson is completed OR if user has reached this lesson
      const isCompleted = lesson.id && completedLessonIds.has(lesson.id);
      const hasReached = userProgress && 
                        lesson.level === userProgress.level && 
                        lesson.page_number <= userProgress.lesson;
      // Also include the current lesson being viewed (even if navigating back)
      const isCurrentLesson = index === currentIndex;
      
      if (isCompleted || hasReached || isCurrentLesson) {
        completed.add(index);
      }
    });
    return completed;
  }, [lessons, completedLessonIds, userProgress, currentIndex]);

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
  const isEntryExitActivityLesson =
    lessonData?.level === 2 && lessonData?.page_number === 3;

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
      <div className="w-full h-[calc(100vh-72px)] flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar - Hidden on mobile, visible on desktop */}
        <div className="hidden md:block w-64 p-6 bg-white relative flex-shrink-0">
          <ProgressBar
            slides={slides}
            currentSlideIndex={Math.max(0, currentIndex)}
            completedSlides={completedSlides}
            heading={finalHeadingTitle}
            completedLessonIds={completedLessonIds}
            unlockedLessonIds={unlockedLessonIds}
            visitedSlideIndices={completedSlides}
            onLessonClick={(index) => {
              const targetLesson = lessons[index];
              if (!targetLesson?.id) return;
              
              // Check if lesson is unlocked
              const isUnlocked = unlockedLessonIds.has(targetLesson.id);
              
              console.log('Lesson click:', {
                targetLesson: { id: targetLesson.id, level: targetLesson.level, page: targetLesson.page_number },
                isUnlocked,
                unlockedIds: Array.from(unlockedLessonIds),
                completedIds: Array.from(completedLessonIds)
              });
              
              // Only allow navigation if lesson is unlocked
              if (isUnlocked) {
                navigate(`/learn/${targetLesson.level}/${targetLesson.page_number}`);
              } else {
                // Show popup if lesson is locked
                console.log('Lesson locked - showing popup');
                setShowLockedLessonPopup(true);
              }
            }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-px bg-gray-300"
            style={{ right: "-32px" }}
          />
        </div>

        <div
          className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto"
          style={{ marginLeft: "0px" }}
        >
          <div className="max-w-5xl mx-auto w-full flex flex-col h-full">
            <div className="flex-1 overflow-y-auto pr-1">
              <div className="flex flex-col gap-6 pb-8">
                <div className="flex items-center justify-between gap-4">
                  <div
                    className="inline-flex items-center gap-2 md:gap-4 rounded-lg px-4 md:px-6 py-2 md:py-3 text-xs md:text-sm font-semibold"
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
                  <button
                    onClick={() => navigate('/learn')}
                    className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors text-sm md:text-base"
                    aria-label="Exit to learn page"
                  >
                    <X size={18} />
                    <span className="hidden sm:inline">Exit</span>
                  </button>
                </div>

                <div className="rounded-xl border border-black/10 bg-white shadow-sm">
                  <div
                    className="rounded-t-xl px-4 py-4 md:px-6 md:py-5"
                    style={{ backgroundColor: "#F5C3D2" }}
                  >
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                      {finalSupportingTitle}
                    </h2>
                  </div>
                  <div className="p-4 md:p-6 flex flex-col gap-4 md:gap-6">
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

                    {isEntryExitActivityLesson && <EntryExitActivity />}

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

      {/* Locked Lesson Popup */}
      {showLockedLessonPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full p-6">
            <button
              onClick={() => setShowLockedLessonPopup(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X size={24} />
            </button>
            <div className="flex flex-col items-center gap-4 pt-4">
              <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center">
                Lesson Not Available Yet
              </h3>
              <p className="text-gray-600 text-center">
                This lesson hasn't been activated yet. Please complete the previous lesson first.
              </p>
              <button
                onClick={() => setShowLockedLessonPopup(false)}
                className="mt-2 px-6 py-2 bg-lime-300 hover:bg-lime-400 text-gray-800 font-semibold rounded-full transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageContent;
