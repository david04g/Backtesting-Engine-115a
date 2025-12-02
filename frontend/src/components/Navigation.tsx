import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthModal } from "./auth/AuthModal";
import { Menu, X } from "lucide-react";

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const syncAuth = () => {
      const loggedIn = localStorage.getItem("isLoggedIn") === "true";
      setIsLoggedIn(loggedIn);
    };

    syncAuth();
    window.addEventListener("auth-changed", syncAuth);
    return () => window.removeEventListener("auth-changed", syncAuth);
  }, [location]);

  const handleLoginClick = () => {
    setAuthMode("login");
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    // localStorage.clear();
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user_id");
    setIsLoggedIn(false);
    navigate("/");
  };


  const isPublicPage = location.pathname === "/";

  return (
    <nav className="flex items-center justify-between px-12 py-4 bg-white shadow-sm">
      {/* Logo */}
      <Link to="/" className="text-2xl font-semibold">
        <span className="text-pink-500 italic">Simple</span>
        <span className="text-gray-800"> Strategies</span>
      </Link>

      
      {isLoggedIn ? (
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className={`px-6 py-3 rounded-full font-medium transition-colors ${
              location.pathname === "/"
                ? "bg-lime-300 hover:bg-lime-400 text-gray-800"
                : "text-gray-700 hover:text-gray-900"
            }`}
          >
            Home
          </Link>
          <Link to="/profile"
            className={`px-6 py-3 rounded-full font-medium transition-colors ${
              location.pathname === "/profile"
                ? "bg-lime-300 hover:bg-lime-400 text-gray-800"
                : "text-gray-700 hover:text-gray-900"
            }`}
          >
            Profile
          </Link>
          <Link
            to="/learn/0/1"
            className={`px-6 py-3 rounded-full font-medium transition-colors ${
              location.pathname.startsWith("/learn")
                ? "bg-lime-300 hover:bg-lime-400 text-gray-800"
                : "text-gray-700 hover:text-gray-900"
            }`}
          >
            Learn
          </Link>
          <Link
            to="/market-news"
            className={`px-6 py-3 rounded-full font-medium transition-colors ${
              location.pathname.startsWith("/market-news")
                ? "bg-lime-300 hover:bg-lime-400 text-gray-800"
                : "text-gray-700 hover:text-gray-900"
            }`}
          >
            News
          </Link>
          <button
            onClick={handleLogout}
            className="px-6 py-3 rounded-full bg-gray-800 text-white font-medium hover:bg-gray-700 transition-colors"
          >
            Logout
          </button>
          <Link
            to="/about"
            className={`px-6 py-3 rounded-full font-medium transition-colors ${
              location.pathname === "/about"
                ? "bg-lime-300 hover:bg-lime-400 text-gray-800"
                : "text-gray-700 hover:text-gray-900"
            }`}
          >
            About
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className={`px-8 py-3 rounded-full font-medium transition-colors ${
              location.pathname === "/"
                ? "bg-lime-300 hover:bg-lime-400 text-gray-800"
                : "text-gray-700 hover:text-gray-900"
            }`}
          >
            Home
          </Link>
          <button
            onClick={handleLoginClick}
            className="px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors"
          >
            Login
          </button>
          <Link
            to="/about"
            className={`px-6 py-3 rounded-full font-medium transition-colors ${
              location.pathname === "/about"
                ? "bg-lime-300 hover:bg-lime-400 text-gray-800"
                : "text-gray-700 hover:text-gray-900"
            }`}
          >
            About
          </Link>
        </div>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </nav>
  );
};

export default Navigation;
