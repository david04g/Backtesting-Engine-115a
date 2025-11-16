import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarSimple from '../../components/SidebarSimple';
import { get_user_progress } from '../../components/apiServices/userApi';
import { UserProps } from '../../types';

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

  useEffect(() => {
    async function fetchUser() {
      try {
        const userId = localStorage.getItem("user_id");

        if (!userId || userId === "null" || userId === "undefined") {
          console.log("no valid user id, redirecting");
          navigate("/");
          return;
        }
        const res = await fetch(`http://localhost:8000/api/user/${userId}`);
        const json = await res.json();
        if (json.status === "success" && json.data) {
          setUser(json.data);
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
  
  return (
    <div className="w-full h-[calc(100vh-72px)] bg-white flex">
      <SidebarSimple active="profile" />
      <div className="flex-1 flex flex-col">
        <div className="px-12 pt-10 pb-8 border-b border-black/10">
          <div className="text-3xl font-bold text-center">Profile Overview</div>
          {loading ? (
            <div className="mt-8 text-center text-gray-500">Loading profile...</div>
          ) : user ? (
            <div className="mt-8 flex items-center gap-8">
              <div className="rounded-full" style={{ width: 110, height: 110, backgroundColor: '#D9F2A6' }} />
              <div className="flex-1">
                <div className="font-semibold text-lg">{user.name}</div>
                <div className="text-sm text-gray-700">{user.email}</div>
              </div>
              <button className="px-6 py-3 rounded-full bg-black text-white text-sm">Edit</button>
            </div>
          ) : (
            <div className="mt-8 text-center text-red-500">User not found</div>
          )}
        </div>

        <div className="px-12 py-8 grid grid-cols-12 gap-8 flex-1 items-start">
          <div className="col-span-8">
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
                  onClick={() => navigate('/create')} 
                  className="mt-4 w-full flex items-center gap-4 rounded-md px-6 py-4 transition-all hover:opacity-90 active:scale-[0.98] cursor-pointer" 
                  style={{ backgroundColor: '#E8B6B6' }}
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-white text-black font-bold">＋</span>
                  <span className="text-base font-semibold">Create new strategy</span>
                </button>
              </Card>
            </div>
          </div>
          <div className="col-span-4">
            <Card>
              <div className="text-xs font-bold uppercase text-center mb-3">Current Level</div>
              <div className="mx-auto rounded-md p-8 text-center" style={{ backgroundColor: '#F0B3BD' }}>
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: '#D9F2A6' }}>
                  <span className="text-3xl">⤴</span>
                </div>
                <div className="font-extrabold">Level 0</div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileContent;




