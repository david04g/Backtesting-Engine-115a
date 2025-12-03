import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { get_all_lessons_by_levels, get_user_progress } from '../../components/apiServices/userApi';
import { BookOpen, ChevronDown, ChevronRight, CheckCircle2, Circle, X } from 'lucide-react';

interface Lesson {
  id: number;
  level: number;
  page_number: number;
  page_title: string;
  lesson_title: string;
}

interface UserProgress {
  level: number;
  lesson: number;
  completedLessons?: number[];
}

export const LearnPage: React.FC = () => {
  const navigate = useNavigate();
  const [lessonsByLevel, setLessonsByLevel] = useState<Record<number, Lesson[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set([0]));
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [showLockedLessonPopup, setShowLockedLessonPopup] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [allLessons, userId] = await Promise.all([
          get_all_lessons_by_levels(10),
          Promise.resolve(localStorage.getItem('user_id'))
        ]);
        
        setLessonsByLevel(allLessons);
        
        // Fetch user progress if logged in
        if (userId && userId !== 'null' && userId !== 'undefined') {
          const progress = await get_user_progress(userId);
          if (progress) {
            setUserProgress({
              level: progress.level ?? 0,
              lesson: progress.lesson ?? 1,
              completedLessons: progress.completedLessons || []
            });
            
            // Auto-expand levels up to user's current level
            const levelsToExpand = new Set<number>();
            for (let i = 0; i <= progress.level; i++) {
              levelsToExpand.add(i);
            }
            setExpandedLevels(levelsToExpand);
          }
        }
      } catch (err) {
        console.error('Error fetching lessons:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const toggleLevel = (level: number) => {
    setExpandedLevels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(level)) {
        newSet.delete(level);
      } else {
        newSet.add(level);
      }
      return newSet;
    });
  };

  const isLessonUnlocked = useMemo(() => {
    const unlocked = new Map<string, boolean>(); // key: "level-page_number"
    
    if (!userProgress) return unlocked;
    
    const currentLevel = userProgress.level;
    const currentLesson = userProgress.lesson;
    
    // For each level, determine which lessons are unlocked
    Object.keys(lessonsByLevel).forEach(levelStr => {
      const level = Number(levelStr);
      const lessons = lessonsByLevel[level] || [];
      
      if (lessons.length === 0) return;
      
      lessons.forEach(lesson => {
        // Unlock if:
        // 1. It's on a previous level (user has progressed past it)
        // 2. It's on the same level and page_number <= user's current lesson (they've already been there)
        // 3. It's the current lesson they're on
        if (level < currentLevel) {
          unlocked.set(`${lesson.level}-${lesson.page_number}`, true);
        } else if (level === currentLevel && lesson.page_number <= currentLesson) {
          unlocked.set(`${lesson.level}-${lesson.page_number}`, true);
        }
      });
    });
    
    return unlocked;
  }, [lessonsByLevel, userProgress]);

  const handleLessonClick = (level: number, lesson: number) => {
    const key = `${level}-${lesson}`;
    const isUnlocked = isLessonUnlocked.get(key) ?? false;
    
    if (isUnlocked) {
      navigate(`/learn/${level}/${lesson}`);
    } else {
      // Show popup if lesson is locked
      setShowLockedLessonPopup(true);
    }
  };

  const isLessonCompleted = (lessonId: number) => {
    return userProgress?.completedLessons?.includes(lessonId) ?? false;
  };

  const isLessonVisited = (level: number, lesson: number) => {
    if (!userProgress) {
      console.log('No user progress available');
      return false;
    }
    // A lesson is visited if:
    // 1. It's on a previous level (user has progressed past it)
    // 2. It's on the same level and page_number <= user's current lesson
    if (level < userProgress.level) {
      return true; // All lessons in previous levels are visited
    }
    if (level === userProgress.level) {
      const visited = lesson <= userProgress.lesson;
      console.log(`Lesson Level ${level} Page ${lesson}: visited=${visited} (user at Level ${userProgress.level} Page ${userProgress.lesson})`);
      return visited; // Lessons up to current are visited
    }
    return false; // Future levels are not visited
  };

  const isLessonCurrent = (level: number, lesson: number) => {
    return userProgress?.level === level && userProgress?.lesson === lesson;
  };

  const sortedLevels = Object.keys(lessonsByLevel)
    .map(Number)
    .sort((a, b) => a - b);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lessons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Learning Path
          </h1>
          <p className="text-gray-600">
            Explore all lessons and track your progress
          </p>
        </div>

        {/* Tree Structure */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          {sortedLevels.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="mx-auto h-12 w-12 mb-4 text-gray-400" />
              <p>No lessons available yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedLevels.map((level, levelIndex) => {
                const lessons = lessonsByLevel[level] || [];
                const isExpanded = expandedLevels.has(level);
                const levelCompleted = lessons.every(lesson => 
                  isLessonCompleted(lesson.id)
                );
                
                return (
                  <div key={level} className="relative">
                    {/* Level Card */}
                    <div
                      className={`relative rounded-lg border-2 transition-all cursor-pointer ${
                        levelCompleted
                          ? 'border-green-300 bg-green-50'
                          : isExpanded
                          ? 'border-lime-400 bg-lime-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      onClick={() => toggleLevel(level)}
                    >
                      <div className="p-4 sm:p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3 sm:gap-4 flex-1">
                          <div className="flex-shrink-0">
                            {isExpanded ? (
                              <ChevronDown className="h-5 w-5 text-gray-600" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-gray-600" />
                            )}
                          </div>
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div
                              className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${
                                levelCompleted
                                  ? 'bg-green-500 text-white'
                                  : 'bg-lime-400 text-gray-900'
                              }`}
                            >
                              {level}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base sm:text-lg text-gray-900 truncate">
                                Level {level}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-600">
                                {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
                              </p>
                            </div>
                          </div>
                          {levelCompleted && (
                            <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                      </div>

                      {/* Lessons Tree */}
                      {isExpanded && (
                        <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-2">
                          <div className="ml-6 sm:ml-8 space-y-2 border-l-2 border-gray-200 pl-4 sm:pl-6">
                            {lessons.map((lesson, lessonIndex) => {
                              const isCompleted = isLessonCompleted(lesson.id);
                              const isVisited = isLessonVisited(lesson.level, lesson.page_number);
                              const isCurrent = isLessonCurrent(lesson.level, lesson.page_number);
                              
                              return (
                                <div
                                  key={lesson.id}
                                  className="relative"
                                >
                                  {/* Connector line */}
                                  {lessonIndex < lessons.length - 1 && (
                                    <div className="absolute left-[-1.5rem] sm:left-[-1.75rem] top-6 w-0.5 h-full bg-gray-200"></div>
                                  )}
                                  
                                  {/* Lesson Card */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleLessonClick(lesson.level, lesson.page_number);
                                    }}
                                    className={`w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                                      isCurrent
                                        ? 'border-lime-500 bg-lime-100 shadow-md'
                                        : isCompleted
                                        ? 'border-green-200 bg-green-50 hover:border-green-300'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                                  >
                                    <div className="flex items-start gap-3 sm:gap-4">
                                      {/* Status Icon */}
                                      <div className="flex-shrink-0 mt-0.5">
                                        {isCompleted ? (
                                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        ) : isVisited || isCurrent ? (
                                          <div className="h-5 w-5 rounded-full bg-lime-400 border-2 border-black flex items-center justify-center">
                                            <div className="h-2.5 w-2.5 rounded-full bg-black"></div>
                                          </div>
                                        ) : (
                                          <Circle className="h-5 w-5 text-gray-300" />
                                        )}
                                      </div>
                                      
                                      {/* Lesson Content */}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                                            Page {lesson.page_number}
                                          </span>
                                          {isCurrent && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-lime-500 text-white font-medium">
                                              Current
                                            </span>
                                          )}
                                        </div>
                                        <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-1">
                                          {lesson.page_title || `Lesson ${lesson.page_number}`}
                                        </h4>
                                        {lesson.lesson_title && (
                                          <p className="text-xs sm:text-sm text-gray-600 truncate">
                                            {lesson.lesson_title}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        </div>
      </div>

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

export default LearnPage;
