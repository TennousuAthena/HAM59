import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { refreshRandomSeed, getProgress } from "../utils/utils";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const LICENSE_CLASSES = ["Technician", "General", "Extra"];

  const getCurrentCategory = () => {
    const pathSegments = location.pathname.split("/");
    const category = pathSegments.find((segment) =>
      LICENSE_CLASSES.includes(segment)
    );
    return category || "Technician";
  };

  const getCurrentMode = () => {
    const pathSegments = location.pathname.split("/");
    if (pathSegments.includes("exam")) return "exam";
    if (pathSegments.includes("random")) return "random";
    return "sequential";
  };

  const generateCategoryUrl = (category) => {
    const currentMode = getCurrentMode();
    if (currentMode === "exam") {
      return `/exam/${category}/1`;
    }
    const lastQuestionId = getProgress(currentMode, category);
    return `/practice/${currentMode}/${category}/${lastQuestionId}`;
  };

  const generateModeUrl = (mode) => {
    const currentCategory = getCurrentCategory();
    const lastQuestionId = getProgress(mode, currentCategory);
    return `/practice/${mode}/${currentCategory}/${lastQuestionId}`;
  };

  const handleRefreshSeed = () => {
    refreshRandomSeed();
    window.location.reload();
  };

  const isActive = (path) => location.pathname.includes(path);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Link
            to="/"
            className="text-xl font-bold text-indigo-600 hover:text-indigo-800"
          >
            📡 HAM59@FCC
          </Link>

          <nav className="flex items-center space-x-4 flex-wrap">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Practice Mode:</span>
              <Link
                to={generateModeUrl("sequential")}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  isActive("/practice/sequential")
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Sequential
              </Link>
              <Link
                to={generateModeUrl("random")}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  isActive("/practice/random")
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Random
              </Link>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">License Class:</span>
              {LICENSE_CLASSES.map((level) => (
                <Link
                  key={level}
                  to={generateCategoryUrl(level)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    location.pathname.includes(`/${level}/`)
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {level}
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <Link
                to={`/exam/${getCurrentCategory()}/1`}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  isActive("/exam")
                    ? "bg-red-600 text-white"
                    : "bg-red-100 text-red-700 hover:bg-red-200"
                }`}
              >
                Exam
              </Link>
              <Link
                to="/errors"
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  isActive("/errors")
                    ? "bg-orange-600 text-white"
                    : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                }`}
              >
                Error Log
              </Link>
            </div>

            <button
              onClick={handleRefreshSeed}
              className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200 transition-colors"
              title="Reshuffle random questions"
            >
              🎲 Reshuffle
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
