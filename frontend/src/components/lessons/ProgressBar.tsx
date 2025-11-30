import React from 'react';

export interface Slide {
  id: string;
  title: string;
  lessonId?: number;
}

interface ProgressBarProps {
  slides: Slide[];
  currentSlideIndex: number;
  completedSlides: Set<number>;
  heading?: string;
  completedLessonIds?: Set<number>;
  unlockedLessonIds?: Set<number>;
  onLessonClick?: (index: number) => void;
  visitedSlideIndices?: Set<number>;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  slides, 
  currentSlideIndex, 
  completedSlides, 
  heading,
  completedLessonIds,
  unlockedLessonIds,
  onLessonClick,
  visitedSlideIndices
}) => {
  const title = heading && heading.trim().length > 0 ? heading : 'Lesson Overview';
  
  const isLessonCompleted = (slide: Slide) => {
    if (completedLessonIds && slide.lessonId) {
      return completedLessonIds.has(slide.lessonId);
    }
    return false;
  };
  
  const isLessonUnlocked = (index: number, slide: Slide) => {
    // First lesson is always unlocked
    if (index === 0) return true;
    
    // If unlockedLessonIds is provided, use it
    if (unlockedLessonIds && slide.lessonId) {
      return unlockedLessonIds.has(slide.lessonId);
    }
    
    // Fallback: unlock if previous lesson is completed or current
    const prevIndex = index - 1;
    if (prevIndex >= 0 && prevIndex < slides.length) {
      const prevSlide = slides[prevIndex];
      return isLessonCompleted(prevSlide) || prevIndex === currentSlideIndex;
    }
    
    return false;
  };
  
  return (
    <div className="w-64 flex flex-col">
      <div className="rounded-md px-4 py-3 mb-6" style={{ backgroundColor: '#D9F2A6' }}>
        <div className="text-lg font-bold italic text-black">{title}</div>
      </div>
      
      <div className="relative flex flex-col">
        <svg width="200" height={slides.length * 60 + (slides.length - 1) * 8} className="absolute left-0" style={{ zIndex: 0, top: '30px' }}>
          {slides.map((_, index) => {
            const slide = slides[index];
            const isCompleted = isLessonCompleted(slide);
            const lineColor = isCompleted ? '#E8B6B6' : '#808080';
            
            // Each item is 60px tall, with 8px margin between (mb-2 = 0.5rem = 8px)
            // Circle is centered in each item at 30px from top of each item
            // SVG starts at top: 30px, so first circle is at 0 in SVG coordinates
            const circleY = index * (60 + 8);
            const circleX = 12;
            
            // Draw line to next circle (including the last one)
            if (index < slides.length - 1) {
              const nextCircleY = (index + 1) * (60 + 8);
              // Straight vertical line from center of current circle to center of next circle
              return (
                <line
                  key={`line-${index}`}
                  x1={circleX}
                  y1={circleY}
                  x2={circleX}
                  y2={nextCircleY}
                  stroke={lineColor}
                  strokeWidth="2"
                />
              );
            }
            return null;
          })}
        </svg>
        
        <div className="relative" style={{ zIndex: 1 }}>
          {slides.map((slide, index) => {
            const isCompleted = isLessonCompleted(slide);
            const isCurrent = index === currentSlideIndex;
            const isUnlocked = isLessonUnlocked(index, slide);
            const isVisited = visitedSlideIndices ? visitedSlideIndices.has(index) : completedSlides.has(index);
            
            // Circle is filled if completed OR visited (user has gone through it)
            const shouldFillCircle = isCompleted || isVisited;
            const circleColor = shouldFillCircle ? '#E8B6B6' : (isCurrent ? '#E8B6B6' : '#D9F2A6');
            const textStyle = isCurrent ? 'font-bold' : '';
            const textColor = isCurrent ? '#000' : (isUnlocked ? '#000' : '#999');
            const cursorStyle = isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed';
            const opacity = isUnlocked ? 1 : 0.5;
            
            return (
              <div 
                key={slide.id} 
                className={`flex items-center gap-3 mb-2 ${cursorStyle}`}
                style={{ minHeight: '60px', opacity }}
                onClick={() => {
                  if (onLessonClick) {
                    // Always call onLessonClick - let the parent component decide if navigation is allowed
                    onLessonClick(index);
                  }
                }}
              >
                <div
                  className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ 
                    backgroundColor: circleColor, 
                    border: '2px solid black'
                  }}
                >
                  {shouldFillCircle && (
                    <div className="w-3 h-3 rounded-full bg-black" />
                  )}
                </div>
                <span className={`text-sm ${textStyle}`} style={{ color: textColor }}>
                  {slide.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

