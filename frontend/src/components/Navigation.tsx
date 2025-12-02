import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthModal } from "./auth/AuthModal";

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

  const navLinks = isLoggedIn ? (
    <>
      <Link
        to="/market-news"
        onClick={() => setMobileMenuOpen(false)}
        className={`px-4 py-2 sm:px-6 sm:py-3 rounded-full font-medium transition-colors text-sm sm:text-base ${
          location.pathname === "/market-news"
            ? "bg-lime-300 hover:bg-lime-400 text-gray-800"
            : "text-gray-700 hover:text-gray-900"
        }`}
      >
        News
      </Link>
      <Link
        to="/profile"
        onClick={() => setMobileMenuOpen(false)}
        className={`px-4 py-2 sm:px-6 sm:py-3 rounded-full font-medium transition-colors text-sm sm:text-base ${
          location.pathname === "/profile"
            ? "bg-lime-300 hover:bg-lime-400 text-gray-800"
            : "text-gray-700 hover:text-gray-900"
        }`}
      >
        Profile
      </Link>
      <button
        onClick={() => {
          handleLogout();
          setMobileMenuOpen(false);
        }}
        className="px-4 py-2 sm:px-6 sm:py-3 rounded-full bg-gray-800 text-white font-medium hover:bg-gray-700 transition-colors text-sm sm:text-base"
      >
        Logout
      </button>
    </>
  ) : (
    <>
      <Link
        to="/"
        onClick={() => setMobileMenuOpen(false)}
        className={`px-4 py-2 sm:px-8 sm:py-3 rounded-full font-medium transition-colors text-sm sm:text-base ${
          location.pathname === "/"
            ? "bg-lime-300 hover:bg-lime-400 text-gray-800"
            : "text-gray-700 hover:text-gray-900"
        }`}
      >
        Home
      </Link>
      <Link
        to="/market-news"
        onClick={() => setMobileMenuOpen(false)}
        className={`px-4 py-2 sm:px-6 sm:py-3 rounded-full font-medium transition-colors text-sm sm:text-base ${
          location.pathname === "/market-news"
            ? "bg-lime-300 hover:bg-lime-400 text-gray-800"
            : "text-gray-700 hover:text-gray-900"
        }`}
      >
        News
      </Link>
      <button
        onClick={() => {
          handleLoginClick();
          setMobileMenuOpen(false);
        }}
        className="px-4 py-2 sm:px-6 sm:py-3 rounded-full font-medium hover:bg-gray-100 transition-colors text-sm sm:text-base"
      >
        Login
      </button>
      <Link
        to="/about"
        onClick={() => setMobileMenuOpen(false)}
        className={`px-4 py-2 sm:px-6 sm:py-3 rounded-full font-medium transition-colors text-sm sm:text-base ${
          location.pathname === "/about"
            ? "bg-lime-300 hover:bg-lime-400 text-gray-800"
            : "text-gray-700 hover:text-gray-900"
        }`}
      >
        About
      </Link>
    </>
  );

  return (
    <nav className="flex items-center justify-between px-4 sm:px-6 lg:px-12 py-4 bg-white shadow-sm relative">
      {/* Logo */}
      <Link to="/" className="text-xl sm:text-2xl font-semibold">
        <span className="text-pink-500 italic">Simple</span>
        <span className="text-gray-800"> Strategies</span>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-4 lg:gap-6">
        {navLinks}
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden p-2 text-gray-700 hover:text-gray-900"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200 md:hidden z-50">
          <div className="flex flex-col p-4 gap-2">
            {navLinks}
          </div>
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
