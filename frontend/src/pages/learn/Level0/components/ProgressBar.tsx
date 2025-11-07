import React from 'react';

export interface Slide {
  id: string;
  title: string;
}

interface ProgressBarProps {
  slides: Slide[];
  currentSlideIndex: number;
  completedSlides: Set<number>;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ slides, currentSlideIndex, completedSlides }) => {
  return (
    <div className="w-64 flex flex-col">
      <div className="rounded-md px-4 py-3 mb-6" style={{ backgroundColor: '#D9F2A6' }}>
        <div className="text-lg font-bold italic text-black">Level 0 Basics</div>
      </div>
      
      <div className="relative flex flex-col">
        <svg width="200" height={slides.length * 60 + (slides.length - 1) * 8} className="absolute left-0" style={{ zIndex: 0, top: '30px' }}>
          {slides.map((_, index) => {
            const isCompleted = completedSlides.has(index);
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
            const isCompleted = completedSlides.has(index);
            const isCurrent = index === currentSlideIndex;
            const isPast = index < currentSlideIndex;
            
            const circleColor = isCompleted || isCurrent || isPast ? '#E8B6B6' : '#D9F2A6';
            const textStyle = isCurrent ? 'font-bold' : '';
            
            return (
              <div key={slide.id} className="flex items-center gap-3 mb-2" style={{ minHeight: '60px' }}>
                <div
                  className="w-6 h-6 rounded-full flex-shrink-0"
                  style={{ backgroundColor: circleColor, border: '2px solid black' }}
                />
                <span className={`text-sm ${textStyle}`} style={{ color: isCurrent || isPast ? '#000' : '#666' }}>
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

