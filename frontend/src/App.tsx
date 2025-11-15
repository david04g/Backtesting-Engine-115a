import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import { AboutContent } from "./pages/about";
import Profile from "./Private/profile/ProfileContent";
import LessonPage from "./Private/lessons/index";
import { UserProvider } from "./context/UserContext";

const App: React.FC = () => {
  return (
    <UserProvider>
      <Router>
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
          <Route path="/profile" element={<Profile />} />
          <Route path="/lessons/:level/:pageNumber" element={<LessonPage />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
