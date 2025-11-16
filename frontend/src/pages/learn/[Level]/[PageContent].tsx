import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  get_lesson,
  get_lessons_by_level,
  get_user_progress,
  set_user_learning_progress,
} from "../../../components/apiServices/userApi";
import {
  ProgressBar,
  Slide,
} from "../../../components/lessons/ProgressBar";
import { NavigationButtons } from "../../../components/lessons/NavigationButtons";
import { DragAndDropQuiz, Category } from "../../../components/quiz";

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

const DRAG_AND_DROP_CONFIG: Record<
  number,
  {
    instructions: string;
    helper?: string;
    items: string[];
    categories: Category[];
  }
> = {
  4: {
    instructions:
      "Drag each item into the column that best describes whether it is an investable asset.",
    helper:
      "Investable assets are things you can put money into with the expectation of future value or income.",
    items: [
      "AAPL (Company Shares)",
      "BTC (Crypto Token)",
      "Gold ETF",
      "S&P 500 Index Fund",
      "Gym Membership",
      "Coffee Mug",
      "Gift Card",
      "Crude Oil Futures",
    ],
    categories: [
      {
        id: "investable",
        label: "Investable Asset",
        correctAnswers: [
          "AAPL (Company Shares)",
          "BTC (Crypto Token)",
          "Gold ETF",
          "S&P 500 Index Fund",
          "Crude Oil Futures",
        ],
      },
      {
        id: "not-investable",
        label: "Not an Investable Asset",
        correctAnswers: ["Gym Membership", "Coffee Mug", "Gift Card"],
      },
    ],
  },
};

const PageContent = () => {
  const navigate = useNavigate();
  const { level, lesson } = useParams();
  const [lessonData, setLessonData] = useState<LessonRecord | null>(null);
  const [lessons, setLessons] = useState<LessonRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userProgress, setUserProgress] = useState<{ level: number; lesson: number } | null>(null);
  const [nextLevelInfo, setNextLevelInfo] = useState<{ level: number; firstLesson: number } | null>(null);

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
            setUserProgress({ level: progress.level ?? 0, lesson: progress.lesson ?? 1 });

            if (levelNum > progress.level) {
              navigate(`/learn/${progress.level}/${progress.lesson || 1}`, { replace: true });
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
          if (Array.isArray(lessonsForNextLevel) && lessonsForNextLevel.length > 0) {
            const sortedNext = [...lessonsForNextLevel].sort(
              (a, b) => (a.page_number ?? 0) - (b.page_number ?? 0)
            );
            const firstLessonNumber = sortedNext[0].page_number ?? 1;
            setNextLevelInfo({ level: upcomingLevel, firstLesson: firstLessonNumber });
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
    setIsQuizComplete(false);
  }, [lessonData?.id]);

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

  const headingTitle = lessonData.lesson_title || `Level ${lessonData.level}`;
  const supportingTitle = lessonData.page_title;
  const description = lessonData.page_def;
  const rawImageUrl = lessonData.image_url?.trim();
  const imageUrl = rawImageUrl && rawImageUrl.toLowerCase() !== "none"
    ? rawImageUrl
    : null;
  const dragAndDropConfig = DRAG_AND_DROP_CONFIG[lessonData.page_number];
  const isDragAndDrop = lessonData.content_type === "drag_and_drop" && dragAndDropConfig;
  const isLastLesson = currentIndex >= 0 && currentIndex === lessons.length - 1;
  const baseCanAdvance = !isDragAndDrop || isQuizComplete;
  const canAdvanceWithinLevel = currentIndex >= 0 && currentIndex < lessons.length - 1 && baseCanAdvance;
  const canStartNextLevel = currentIndex >= 0 && isLastLesson && !!nextLevelInfo && baseCanAdvance;
  const canGoNext = canAdvanceWithinLevel || canStartNextLevel;
  const nextButtonLabel = isLastLesson && nextLevelInfo
    ? `Start Level ${nextLevelInfo.level}`
    : "Next";

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full h-[calc(100vh-72px)] flex overflow-hidden">
        <div className="w-64 p-6 bg-white relative">
          <ProgressBar
            slides={slides}
            currentSlideIndex={Math.max(0, currentIndex)}
            completedSlides={completedSlides}
            heading={headingTitle}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-px bg-gray-300"
            style={{ right: "-32px" }}
          />
        </div>

        <div
          className="flex-1 flex flex-col p-8 overflow-hidden"
          style={{ marginLeft: "32px" }}
        >
          <div className="max-w-5xl mx-auto w-full h-full flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              <div className="inline-flex items-center gap-4 rounded-lg px-6 py-3 text-sm font-semibold"
                style={{ backgroundColor: "#D9F2A6", color: "#1f2937", maxWidth: "fit-content" }}
              >
                <span>Level {lessonData.level}</span>
                <span className="opacity-70">Page {lessonData.page_number}</span>
              </div>

              <div className="rounded-xl border border-black/10 bg-white shadow-sm">
                <div className="rounded-t-xl px-6 py-5" style={{ backgroundColor: "#F5C3D2" }}>
                  <h2 className="text-3xl font-bold text-gray-900">{supportingTitle}</h2>
                </div>
                <div className="p-6 flex flex-col gap-6">
                  <p className="text-lg leading-relaxed text-gray-800">{description}</p>
                  {imageUrl && (
                    <div className="flex justify-center">
                      <img
                        src={imageUrl}
                        alt={supportingTitle}
                        className="max-h-96 w-auto rounded-lg border border-black/10 shadow"
                      />
                    </div>
                  )}
                  {isDragAndDrop && (
                    <div className="flex flex-col gap-4">
                      <div className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
                        <p className="font-semibold text-gray-900 text-base">
                          {dragAndDropConfig.instructions}
                        </p>
                        {dragAndDropConfig.helper && (
                          <p className="text-sm text-gray-700 mt-1">
                            {dragAndDropConfig.helper}
                          </p>
                        )}
                      </div>
                      <DragAndDropQuiz
                        items={dragAndDropConfig.items}
                        categories={dragAndDropConfig.categories}
                        onQuizComplete={setIsQuizComplete}
                        containerClassName="max-h-[28rem]"
                        categoryClassName="bg-white"
                      />
                      {!isQuizComplete && (
                        <p className="text-sm text-rose-700 font-medium text-center">
                          Complete the quiz and click “Check Answers” to continue.
                        </p>
                      )}
                      {isQuizComplete && (
                        <p className="text-sm text-green-700 font-medium text-center">
                          Great job! You can move to the next lesson.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6">
              <NavigationButtons
                onPrevious={() => handleNavigate("prev")}
                onNext={async () => {
                  if (!baseCanAdvance) {
                    return;
                  }

                  if (isLastLesson) {
                    if (nextLevelInfo && userId) {
                      await set_user_learning_progress(userId, nextLevelInfo.level, nextLevelInfo.firstLesson);
                      localStorage.setItem("level", String(nextLevelInfo.level));
                      localStorage.setItem("lesson", String(nextLevelInfo.firstLesson));
                      navigate(`/learn/${nextLevelInfo.level}/${nextLevelInfo.firstLesson}`);
                    }
                    return;
                  }

                  handleNavigate("next");

                  if (userId) {
                    await set_user_learning_progress(userId, levelNum, lessonNum + 1);
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
    </div>
  );
};

export default PageContent;

// const SLIDES: Slide[] = [
//   { id: 'what-is-a-market', title: 'What is a Market?' },
//   { id: 'why-prices-move', title: 'Why Prices Move' },
//   { id: 'tickers-bid-ask', title: 'Tickers, Bid/Ask, Market Hours' },
//   { id: 'what-is-a-stock', title: 'What is a stock?' },
//   { id: 'long-vs-short', title: 'Long vs Short' },
//   { id: 'risk-vs-reward', title: 'Risk vs Reward' },
//   { id: 'brokerage-accounts', title: 'Brokerage Accounts' },
//   { id: 'buy-and-hold', title: 'Buy and Hold!' },
// ];

// const SLIDE_COMPONENTS = [
//   WhatIsAMarket,
//   WhyPricesMove,
//   TickersBidAsk,
//   WhatIsAStock,
//   LongVsShort,
//   RiskVsReward,
//   BrokerageAccounts,
//   BuyAndHold,
// ];

// export const PageContent = () => {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const slideId = searchParams.get("slide");

//   const currentSlideIndex = slideId
//     ? SLIDES.findIndex((slide) => slide.id === slideId)
//     : -1;

//   const [currentIndex, setCurrentIndex] = useState(
//     currentSlideIndex >= 0 ? currentSlideIndex : 0
//   );
//   const [completedSlides, setCompletedSlides] = useState<Set<number>>(
//     new Set()
//   );
//   const [quizComplete, setQuizComplete] = useState(false);

//   // Reset quiz completion when leaving the quiz slide
//   useEffect(() => {
//     if (currentIndex !== 3) {
//       // 3 is the index for "What is a stock?" slide
//       setQuizComplete(false);
//     }
//   }, [currentIndex]);

//   useEffect(() => {
//     // If no slide parameter, navigate to first slide
//     if (!slideId) {
//       navigate(`/learn/level0?slide=${SLIDES[0].id}`, { replace: true });
//       return;
//     }

//     const slideIndex = SLIDES.findIndex((slide) => slide.id === slideId);
//     if (slideIndex >= 0) {
//       setCurrentIndex(slideIndex);
//     } else {
//       // Invalid slide ID, redirect to first slide
//       navigate(`/learn/level0?slide=${SLIDES[0].id}`, { replace: true });
//     }
//   }, [slideId, navigate]);

//   useEffect(() => {
//     // Mark current slide and all previous slides as completed
//     const newCompleted = new Set<number>();
//     for (let i = 0; i <= currentIndex; i++) {
//       newCompleted.add(i);
//     }
//     setCompletedSlides(newCompleted);
//   }, [currentIndex]);

//   const handlePrevious = () => {
//     if (currentIndex > 0) {
//       const newIndex = currentIndex - 1;
//       setCurrentIndex(newIndex);
//       navigate(`/learn/level0?slide=${SLIDES[newIndex].id}`, { replace: true });
//     }
//   };

//   const handleNext = () => {
//     if (currentIndex < SLIDES.length - 1) {
//       const newIndex = currentIndex + 1;
//       setCurrentIndex(newIndex);
//       navigate(`/learn/level0?slide=${SLIDES[newIndex].id}`, { replace: true });
//     }
//   };

//   const CurrentSlideComponent = SLIDE_COMPONENTS[currentIndex];

//   // Check if we can proceed to next slide
//   const canProceedNext =
//     currentIndex < SLIDES.length - 1 && (currentIndex !== 3 || quizComplete); // Block if on quiz slide and not complete

//   return (
//     <div className="min-h-screen bg-white">
//       <div className="w-full h-[calc(100vh-72px)] flex overflow-hidden">
//         <div className="w-64 p-6 bg-white relative">
//           <ProgressBar
//             slides={SLIDES}
//             currentSlideIndex={currentIndex}
//             completedSlides={completedSlides}
//           />
//           <div
//             className="absolute right-0 top-0 bottom-0 w-px bg-gray-300"
//             style={{ right: "-32px" }}
//           ></div>
//         </div>

//         <div
//           className="flex-1 flex flex-col p-8 overflow-hidden"
//           style={{ marginLeft: "32px" }}
//         >
//           <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
//             <div className="flex-1 overflow-y-auto">
//               {currentIndex === 3 ? (
//                 <WhatIsAStock onQuizComplete={setQuizComplete} />
//               ) : (
//                 <CurrentSlideComponent />
//               )}
//             </div>
//             <div className="mt-auto pt-8 flex-shrink-0">
//               <NavigationButtons
//                 onPrevious={handlePrevious}
//                 onNext={handleNext}
//                 canGoPrevious={currentIndex > 0}
//                 canGoNext={canProceedNext}
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
