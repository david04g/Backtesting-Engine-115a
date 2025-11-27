import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./components/contexts/UserContext";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import { AboutContent } from "./pages/about";
import { ProfileContent } from "./pages/profile";
import { CreatePage } from "./pages/create";
import MarketNewsPage from "./pages/market-news/MarketNewsPage";
import PageContent from "./pages/learn/[Level]/[PageContent]";
import TradingComponentsDemo from "./pages/temp/TradingComponentsDemo";

const App: React.FC = () => {
  return (
    <Router>
      <UserProvider>
        <Routes>
          <Route
            path="/"
            element={
              <div className="min-h-screen bg-gray-50">
                <Navigation />
                <Hero />
              </div>
            }
          />
          <Route
            path="/about"
            element={
              <div className="min-h-screen bg-gray-50">
                <Navigation />
                <AboutContent />
              </div>
            }
          />
          <Route
            path="/profile"
            element={
              <>
                <Navigation />
                <ProfileContent />
              </>
            }
          />
          <Route
            path="/create"
            element={
              <div className="min-h-screen bg-gray-50">
                <Navigation />
                <CreatePage />
              </div>
            }
          />
          <Route
            path="/market-news"
            element={
              <div className="min-h-screen bg-gray-50">
                <Navigation />
                <MarketNewsPage />
              </div>
            }
          />
          <Route
            path="/trading-demo"
            element={
              <div className="min-h-screen bg-gray-50">
                <Navigation />
                <TradingComponentsDemo />
              </div>
            }
          />
          <Route
            path="/learn/:level/:page"
            element={
              <div className="min-h-screen bg-gray-50">
                <Navigation />
                <PageContent />
              </div>
            }
          />
          <Route
            path="/learn/:level/:lesson"
            element={
              <>
                <Navigation />
                <PageContent />
              </>
            }
          />
        </Routes>
      </UserProvider>
    </Router>
  );
};

export default App;
