import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getProgress } from "../utils/utils";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getCurrentCategory = () => {
    const pathSegments = location.pathname.split("/");
    const categoryIndex = pathSegments.findIndex((segment) =>
      ["A", "B", "C"].includes(segment)
    );
    return categoryIndex !== -1 ? pathSegments[categoryIndex] : "A";
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

  const isActive = (path) => location.pathname.includes(path);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Link
            to="/"
            className="text-xl font-bold text-indigo-600 hover:text-indigo-800"
          >
            📡 HAM59+ 练习平台
          </Link>

          <nav className="flex items-center space-x-4 flex-wrap">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">练习模式:</span>
              <Link
                to={generateModeUrl("sequential")}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  isActive("/practice/sequential")
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                顺序练习
              </Link>
              <Link
                to={generateModeUrl("random")}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  isActive("/practice/random")
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                随机练习
              </Link>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">题库:</span>
              <Link
                to={generateCategoryUrl("A")}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  location.pathname.includes("/A/")
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                A类
              </Link>
              <Link
                to={generateCategoryUrl("B")}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  location.pathname.includes("/B/")
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                B类
              </Link>
              <Link
                to={generateCategoryUrl("C")}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  location.pathname.includes("/C/")
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                C类
              </Link>
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
                模拟考试
              </Link>
              <Link
                to="/errors"
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  isActive("/errors")
                    ? "bg-orange-600 text-white"
                    : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                }`}
              >
                错题记录
              </Link>
            </div>

            <Link
              to="/settings"
              className={`px-3 py-1 rounded text-sm transition-colors ${
                isActive("/settings")
                  ? "bg-gray-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              ⚙️ 设置
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
