import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarSimple from '../../components/SidebarSimple';
import { get_user_progress } from '../../components/apiServices/userApi';
import { UserProps } from '../../types';
import EditProfileModal from '../../components/auth/EditProfileModal';
import { API_ENDPOINTS } from '../../config/api';

const Card: React.FC<{ title?: string; children?: React.ReactNode; bg?: string; className?: string }> = ({ title, children, bg = '#D9F2A6', className }) => (
  <div className={`rounded-md p-6 border border-black/10 ${className || ''}`} style={{ backgroundColor: bg }}>
    {title && <div className="text-sm font-bold uppercase tracking-wide text-gray-700">{title}</div>}
    {children}
  </div>
);



export const ProfileContent: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState<number>(0);
  const [lesson, setLesson] = useState<number>(0);
  const [showCreateLockedPopup, setShowCreateLockedPopup] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const userId = localStorage.getItem("user_id");

        if (!userId || userId === "null" || userId === "undefined") {
          console.log("no valid user id, redirecting");
          navigate("/");
          return;
        }
        const res = await fetch(API_ENDPOINTS.GET_USER(userId));
        const json = await res.json();
        if (json.status === "success" && json.data) {
          console.log("data:", json.data);
          setUser({
            ...json.data,
            name: json.data.username,
            profileImage: json.data.profile_image
          });
          // also fetch progress
          const progress = await get_user_progress(userId);
          if (progress) {
            setLevel(progress.level ?? 0);
            setLesson(progress.lesson ?? 0);
          }
        } else {
          console.error("api error: ", json.message);
          navigate("/");
        }
      } catch (err) {
        console.error("error fetching user: ", err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [navigate]);
  
  const handleLearnClick = () => {
    const safeLevel = typeof level === 'number' ? level : 0;
    const safeLesson = lesson && lesson > 0 ? lesson : 1;
    navigate(`/learn/${safeLevel}/${safeLesson}`);
  };

  const shakeAnimation = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
      20%, 40%, 60%, 80% { transform: translateX(2px); }
    }
    .shake {
      animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    }
  `;

  const [isShaking, setIsShaking] = useState(false);

  const handleCreateClick = () => {
    const safeLevel = typeof level === 'number' ? level : 0;
    if (safeLevel < 1) {
      setIsShaking(true);
      setShowCreateLockedPopup(true);
      const timer = setTimeout(() => {
        setIsShaking(false);
        setShowCreateLockedPopup(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
    navigate('/create');
  };

  const handleUpdateProfile = async (updates: { name?: string; profileImage?: string }) => {
    try {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;

      const response = await fetch(API_ENDPOINTS.UPDATE_PROFILE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          name: updates.name,
          profileImage: updates.profileImage
        }),
      });

      const data = await response.json();
      if (data.status === "success" && data.data) {
        setUser(prev => prev ? { 
          ...prev, 
          name: data.data.username || prev.name,
          profileImage: data.data.profile_image || prev.profileImage
        } : null);
        return data;
      } else {
        console.error("Error updating profile:", data.message);
        throw new Error(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      throw err;
    }
  };
  
  return (
    <div className="w-full min-h-[calc(100vh-72px)] bg-white flex flex-col md:flex-row">
      <SidebarSimple active="strategies" />
      <div className="flex-1 flex flex-col w-full md:w-auto">
        <div className="px-4 sm:px-6 md:px-12 pt-6 md:pt-10 pb-6 md:pb-8 border-b border-black/10">
          <div className="text-2xl md:text-3xl font-bold text-center">Profile Overview</div>
          {loading ? (
            <div className="mt-6 md:mt-8 text-center text-gray-500">Loading profile...</div>
          ) : user ? (
            <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
              {user.profileImage ? (
                <img 
                  src={`${user.profileImage}?t=${new Date().getTime()}`}
                  alt="Profile"
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-[110px] md:h-[110px] rounded-full object-cover"
                />
              ) : (
                <div 
                  className="rounded-full" 
                  style={{ width: 110, height: 110, backgroundColor: '#D9F2A6' }} 
                />
              )}
              <div className="flex-1 text-center sm:text-left">
                <div className="font-semibold text-base md:text-lg">{user.name}</div>
                <div className="text-xs md:text-sm text-gray-700">{user.email}</div>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 md:px-6 py-2 md:py-3 rounded-full bg-black text-white text-xs md:text-sm"
              >
                Edit
              </button>
            </div>
          ) : (
            <div className="mt-6 md:mt-8 text-center text-red-500">User not found</div>
          )}
        </div>

        <div className="px-4 sm:px-6 md:px-12 py-6 md:py-8 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 flex-1 items-start">
          <div className="col-span-1 md:col-span-8">
            <Card title="Learn">
              <button 
                onClick={handleLearnClick}
                className="mt-4 w-full flex items-center gap-4 rounded-md px-6 py-4 transition-all hover:opacity-90 active:scale-[0.98] cursor-pointer" 
                style={{ backgroundColor: '#E8B6B6' }}
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">▶</span>
                <span className="text-base font-semibold">Grow your market mastery</span>
              </button>
            </Card>
            <div className="mt-6">
              <Card title="Create">
                <button 
                  onClick={handleCreateClick} 
                  className={`mt-4 w-full flex items-center gap-4 rounded-md px-6 py-4 transition-all hover:opacity-90 active:scale-[0.98] cursor-pointer relative ${
                    isShaking ? 'animate-shake' : ''
                  }`} 
                  style={{ backgroundColor: '#E8B6B6' }}
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-white text-black font-bold">
                    {level < 1 ? '🔒' : '＋'}
                  </span>
                  <span className="text-base font-semibold">Create new strategy</span>
                </button>
              </Card>
            </div>
          </div>
          <div className="col-span-1 md:col-span-4">
            <Card>
              <div className="text-xs font-bold uppercase text-center mb-3">Current Level</div>
              <div className="mx-auto rounded-md p-6 md:p-8 text-center" style={{ backgroundColor: '#F0B3BD' }}>
                <div className="mx-auto mb-4 flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full" style={{ backgroundColor: '#D9F2A6' }}>
                  <span className="text-2xl md:text-3xl">⤴</span>
                </div>
                <div className="font-extrabold text-lg md:text-xl">Level {typeof level === 'number' ? level : 0}</div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      {showCreateLockedPopup && (
        <div className="fixed bottom-6 right-6 transform z-50">
          <div 
            className="px-6 py-3 rounded-full bg-gray-800 text-white text-sm font-medium shadow-lg transition-opacity duration-500"
          >
            Creating a strategy will be unlocked after completing Level 0. With each level completed, another strategy can be unlocked!
          </div>
        </div>
      )}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onUpdate={handleUpdateProfile}
      />
      {/* {showCreateLockedPopup && (
        <div className="fixed bottom-6 right-6 z-50" role="status" aria-live="polite">
          <div
            className="relative rounded-3xl border border-black/20 px-6 py-5 shadow-lg"
            style={{ backgroundColor: '#D9F2A6', minWidth: '320px' }}
          >
            <button
              onClick={() => setShowCreateLockedPopup(false)}
              aria-label="Close create strategy lock message"
              className="absolute right-4 top-3 text-black/70 transition-colors hover:text-black"
            >
              ×
            </button>
            <div
              className="rounded-2xl px-4 py-4 text-center font-semibold text-black"
              style={{ backgroundColor: '#E8B6B6' }}
            >
              Creating a strategy will be unlocked after completing Level 0. With each level completed, another strategy can be unlocked!
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default ProfileContent;




