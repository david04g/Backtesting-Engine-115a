import React, { useState } from "react";
import StockChart from "./StockChart";
import { AuthModal } from "./auth/AuthModal";

const Hero: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");


  const handleSignupClick = () => {
    setAuthMode("signup");
    setShowAuthModal(true);
  };
  return (
    <main className="px-12 py-16">
      <div className="flex items-start justify-between gap-12">
        {/* Left Content */}
        <div className="flex-1 max-w-2xl pt-8">
          <h1 className="text-6xl font-bold text-gray-800 mb-8 leading-tight">
            Test Your Trading Strategies
          </h1>

          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            Backtest your trading strategies with historical data, optimize
            parameters, and make data-driven decisions before risking real
            capital.
          </p>

          <div className="flex gap-6">
            <button
              className="px-8 py-4 bg-white hover:bg-gray-50 border-2 border-gray-800 text-gray-800 rounded-full font-medium text-lg transition-colors"
              onClick={handleSignupClick}
            >
              Get started
            </button>
          </div>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
        />
        {/* Right Content - Stock Chart */}
        <div className="flex-1 max-w-xl">
          <StockChart />
        </div>
      </div>
    </main>
  );
};

export default Hero;
