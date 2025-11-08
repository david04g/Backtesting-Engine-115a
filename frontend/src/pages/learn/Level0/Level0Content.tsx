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
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      navigate(`/learn/level0?slide=${SLIDES[newIndex].id}`, { replace: true });
    }
  };
  
  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      navigate(`/learn/level0?slide=${SLIDES[newIndex].id}`, { replace: true });
    }
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
    </div>
  );
};

