import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  username: string;
  email: string;
}

type SidebarSimpleProps = {
  active: 'profile' | 'strategies';
};

const IconDot: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <circle cx="10" cy="10" r="3" />
  </svg>
);

const IconList: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="4" y="6" width="16" height="2" rx="1" />
    <rect x="4" y="11" width="16" height="2" rx="1" />
    <rect x="4" y="16" width="16" height="2" rx="1" />
  </svg>
);

export const SidebarSimple: React.FC<SidebarSimpleProps> = ({ active }) => {

  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
    

  return (
    <aside className="flex flex-col justify-between" style={{ width: 240, backgroundColor: '#D9F2A6' }}>
      <div>
        <nav className="pt-6 space-y-3 px-4">
          <button 
            onClick={() => {}}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all hover:opacity-80 active:scale-[0.98] cursor-pointer ${active === 'profile' ? 'bg-white/40' : ''}`}
          >
            <IconDot />
            <span className="font-semibold">Profile</span>
            <span className="ml-auto">‹</span>
          </button>
          <button 
            onClick={() => {}}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all hover:opacity-80 active:scale-[0.98] cursor-pointer ${active === 'strategies' ? 'bg-white/40' : ''}`}
          >
            <IconList />
            <span className="font-semibold">Strategies</span>
          </button>
        </nav>
      </div>
      <div className="px-6 pb-6 text-xs">
        <div>Account Holder</div>
        {loading ? (
          <div className="font-semibold">Loading...</div>
        ) : user ? (
          <div className="font-semibold">{user.username}</div>
        ) : (
          <div className="font-semibold">Jane Doe</div>
        )}
      </div>
    </aside>
  );
};

export default SidebarSimple;


