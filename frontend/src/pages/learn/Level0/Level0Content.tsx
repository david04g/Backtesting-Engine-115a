import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ProgressBar, Slide } from './components/ProgressBar';
import { NavigationButtons } from './components/NavigationButtons';
import { WhatIsAMarket } from './slides/WhatIsAMarket';
import { WhyPricesMove } from './slides/WhyPricesMove';
import { TickersBidAsk } from './slides/TickersBidAsk';
import { WhatIsAStock } from './slides/WhatIsAStock';
import { LongVsShort } from './slides/LongVsShort';
import { RiskVsReward } from './slides/RiskVsReward';
import { BrokerageAccounts } from './slides/BrokerageAccounts';
import { BuyAndHold } from './slides/BuyAndHold';

const SLIDES: Slide[] = [
  { id: 'what-is-a-market', title: 'What is a Market?' },
  { id: 'why-prices-move', title: 'Why Prices Move' },
  { id: 'tickers-bid-ask', title: 'Tickers, Bid/Ask, Market Hours' },
  { id: 'what-is-a-stock', title: 'What is a stock?' },
  { id: 'long-vs-short', title: 'Long vs Short' },
  { id: 'risk-vs-reward', title: 'Risk vs Reward' },
  { id: 'brokerage-accounts', title: 'Brokerage Accounts' },
  { id: 'buy-and-hold', title: 'Buy and Hold!' },
];

const SLIDE_COMPONENTS = [
  WhatIsAMarket,
  WhyPricesMove,
  TickersBidAsk,
  WhatIsAStock,
  LongVsShort,
  RiskVsReward,
  BrokerageAccounts,
  BuyAndHold,
];

export const Level0Content: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const slideId = searchParams.get('slide');
  
  const currentSlideIndex = slideId 
    ? SLIDES.findIndex(slide => slide.id === slideId)
    : -1;
  
  const [currentIndex, setCurrentIndex] = useState(currentSlideIndex >= 0 ? currentSlideIndex : 0);
  const [completedSlides, setCompletedSlides] = useState<Set<number>>(new Set());
  const [quizComplete, setQuizComplete] = useState(false);
  const [levelUpComplete, setLevelUpComplete] = useState(false);
  const [showCongratsModal, setShowCongratsModal] = useState(false);
  
  // Reset quiz completion when leaving the quiz slide
  useEffect(() => {
    if (currentIndex !== 3) { // 3 is the index for "What is a stock?" slide
      setQuizComplete(false);
    }
  }, [currentIndex]);
  
  useEffect(() => {
    // If no slide parameter, navigate to first slide
    if (!slideId) {
      navigate(`/learn/level0?slide=${SLIDES[0].id}`, { replace: true });
      return;
    }
    
    const slideIndex = SLIDES.findIndex(slide => slide.id === slideId);
    if (slideIndex >= 0) {
      setCurrentIndex(slideIndex);
    } else {
      // Invalid slide ID, redirect to first slide
      navigate(`/learn/level0?slide=${SLIDES[0].id}`, { replace: true });
    }
  }, [slideId, navigate]);
  
  useEffect(() => {
    // Mark current slide and all previous slides as completed
    const newCompleted = new Set<number>();
    for (let i = 0; i <= currentIndex; i++) {
      newCompleted.add(i);
    }
    setCompletedSlides(newCompleted);
  }, [currentIndex]);

  useEffect(() => {
    const incrementLevel = async () => {
      const uid = localStorage.getItem("user_id");
      if (!uid) return;

      console.log("🎉 Level 0 complete — incrementing user level...");
      try {
        const res = await fetch("http://localhost:8000/api/increment_user_level", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid }),
        });
        const data = await res.json();
        if (data.status === "success") {
          // alert("🎉 Congratulations! You've completed Level 0!");
          setShowCongratsModal(true);
          setLevelUpComplete(true);
          navigate("/profile");
        } else {
          console.error("Failed to level up:", data);
        }
      } catch (err) {
        console.error("Error incrementing level:", err);
      }
    };
    if (currentIndex === SLIDES.length - 1 && !levelUpComplete) {
      setLevelUpComplete(true);
      incrementLevel();
    }
  }, [currentIndex, levelUpComplete, navigate]);
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      navigate(`/learn/level0?slide=${SLIDES[newIndex].id}`, { replace: true });
    }
  };
  
  const handleNext = async () => {
    console.log("handleNext called at slide", currentIndex, "of", SLIDES.length);
    if (currentIndex < SLIDES.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      navigate(`/learn/level0?slide=${SLIDES[newIndex].id}`, { replace: true });
    }
    // } else {
    //   // end of level 0
    //   if (!levelUpComplete) {
    //     setLevelUpComplete(true);
    //     const uid = localStorage.getItem("user_id");
    //     try {
    //       const res = await fetch(`http://localhost:8000/api/increment_user_level`, {
    //         method: "POST",
    //         headers: {"Content-Type": "application/json"},
    //         body: JSON.stringify({uid}),
    //       });
    //       const data = await res.json();
    //       if (data.status === "success") {
    //         alert("congratulations ! you've completed level 0 !");
    //         navigate("/profile");
    //       } else {
    //         console.error("couldn't level up: ", data);
    //       }
    //     } catch (err) {
    //       console.error("error incrementing level:", err);
    //     }
    //   }
    // }
  };
  
  const CurrentSlideComponent = SLIDE_COMPONENTS[currentIndex];
  
  // Check if we can proceed to next slide
  const canProceedNext = currentIndex < SLIDES.length - 1 && 
    (currentIndex !== 3 || quizComplete); // Block if on quiz slide and not complete
  
  return (
    <div className="min-h-screen bg-white">
      <div className="w-full h-[calc(100vh-72px)] flex overflow-hidden">
        <div className="w-64 p-6 bg-white relative">
          <ProgressBar
            slides={SLIDES}
            currentSlideIndex={currentIndex}
            completedSlides={completedSlides}
          />
          <div className="absolute right-0 top-0 bottom-0 w-px bg-gray-300" style={{ right: '-32px' }}></div>
        </div>
        
        <div className="flex-1 flex flex-col p-8 overflow-hidden" style={{ marginLeft: '32px' }}>
          <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
              {currentIndex === 3 ? (
                <WhatIsAStock onQuizComplete={setQuizComplete} />
              ) : (
                <CurrentSlideComponent />
              )}
            </div>
            <div className="mt-auto pt-8 flex-shrink-0">
              <NavigationButtons
                onPrevious={handlePrevious}
                onNext={handleNext}
                canGoPrevious={currentIndex > 0}
                canGoNext={canProceedNext}
              />
            </div>
          </div>
        </div>
      </div>
      {showCongratsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
          <div
            className="rounded-2xl p-10 text-center shadow-xl border border-black/20"
            style={{ backgroundColor: "#D9F2A6", width: "420px" }}
          >
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">Level Complete!</h2>
            <p className="text-gray-700 mb-6">
              You’ve finished Level 0 — excellent work!  
              Keep going to build your trading mastery.
            </p>
            <button
              onClick={() => navigate("/profile")}
              className="w-full py-3 rounded-full font-semibold transition-all"
              style={{
                backgroundColor: "#E8B6B6",
                color: "black",
                border: "1px solid rgba(0,0,0,0.2)",
              }}
            >
              Back to Profile
            </button>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.35s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

