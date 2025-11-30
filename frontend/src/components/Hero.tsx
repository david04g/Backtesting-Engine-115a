import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthModal } from "./auth/AuthModal";

const Hero: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const navigate = useNavigate();

  const handleGetStartedClick = () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (isLoggedIn) {
      navigate("/profile");
      return;
    }

    setAuthMode("signup");
    setShowAuthModal(true);
  };
  return (
    <main className="px-6 py-16">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="mb-8 text-4xl font-bold leading-tight text-gray-800 sm:text-5xl lg:text-6xl">
            Test Your Trading Strategies
          </h1>

          <p className="mb-12 text-lg leading-relaxed text-gray-600 sm:text-xl">
            Backtest your trading strategies with historical data, optimize
            parameters, and make data-driven decisions before risking real
            capital.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              className="rounded-full border-2 border-gray-800 bg-white px-8 py-4 text-lg font-medium text-gray-800 transition-colors hover:bg-gray-50"
              onClick={handleGetStartedClick}
            >
              Get started
            </button>
          </div>
        </div>
      </div>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </main>
  );
};

export default Hero;
