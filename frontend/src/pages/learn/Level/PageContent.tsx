import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../../../components/contexts/UserContext";
import { get_lesson } from "../../../components/apiServices/userApi";
import { DragAndDrop, MultipleChoice } from "../../../components/quiz";

interface CurrentLesson {
  id: number;
  level: number;
  page_number: number;
  page_title: string;
  page_def: string;
  content_type: string;
  image_url: string;
  lesson_title: string;
}

const PageContent = () => {
  const { user } = useUser();
  const { level, lesson } = useParams();
  const [lessonData, setLessonData] = useState<CurrentLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizComplete, setQuizComplete] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      if (level && lesson) {
        setLoading(true);
        const fetchedLesson = await get_lesson(Number(level), Number(lesson));
        console.log("Fetched lesson:", fetchedLesson);
        if (fetchedLesson) {
          setLessonData(fetchedLesson);
        } else {
          console.error("No lesson data received");
        }
        setLoading(false);
      }
    };
    fetchLesson();
  }, [level, lesson]);

  const handleQuizComplete = (isComplete: boolean) => {
    setQuizComplete(isComplete);
    console.log("Quiz complete:", isComplete);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-600">Please log in</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-600">Loading lesson...</p>
      </div>
    );
  }

  if (!lessonData) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-600">Lesson not found</p>
      </div>
    );
  }

  // Render different content based on content_type
  const renderContent = () => {
    switch (lessonData.content_type) {
      case "drag_and_drop":
        return (
          <DragAndDrop
            level={lessonData.level}
            lesson={lessonData.page_number}
            title={lessonData.page_title}
            instructions={lessonData.page_def}
            onQuizComplete={handleQuizComplete}
          />
        );

      case "multiple_choice":
      case "quiz":
        return (
          <MultipleChoice
            level={lessonData.level}
            lesson={lessonData.page_number}
            onQuizComplete={handleQuizComplete}
          />
        );

      default:
        return (
          <div>
            <h3 className="text-xl font-semibold mb-2">
              {lessonData.page_title}
            </h3>
            <p className="text-gray-700 mb-4">{lessonData.page_def}</p>
            {lessonData.image_url && (
              <img
                src={lessonData.image_url}
                alt={lessonData.page_title}
                className="rounded-lg shadow-md"
              />
            )}
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {lessonData.lesson_title}
        </h1>
        <p className="text-gray-600">
          Level {lessonData.level} - Page {lessonData.page_number}
        </p>
      </div>

      {renderContent()}

      {quizComplete && (
        <div
          className="mt-6 rounded-lg px-4 py-3 text-center font-semibold"
          style={{ backgroundColor: "#D9F2A6" }}
        >
          ✓ Lesson Complete! You can continue.
        </div>
      )}
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
