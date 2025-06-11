import React from "react";
import { getCategoryName, getModeName } from "../utils/utils";

const ProgressBar = ({ current, total, mode, category }) => {
  const progress = (current / total) * 100;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-600">
            {getModeName(mode)} - {getCategoryName(category)}
          </span>
          <span className="text-sm text-gray-500">
            {current} / {total}
          </span>
        </div>
        <span className="text-sm font-medium text-indigo-600">
          {Math.round(progress)}%
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
