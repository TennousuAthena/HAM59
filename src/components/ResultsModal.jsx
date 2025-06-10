import React from "react";

const ResultsModal = ({ results, onClose, onRestart }) => {
  const { correctCount, total, passed, passMark } = results;
  const percentage = Math.round((correctCount / total) * 100);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="text-center">
          <div
            className={`text-6xl mb-4 ${
              passed ? "text-green-500" : "text-red-500"
            }`}
          >
            {passed ? "🎉" : "😔"}
          </div>

          <h2 className="text-2xl font-bold mb-2">
            {passed ? "恭喜通过！" : "很遗憾，未通过"}
          </h2>

          <div className="mb-6">
            <div className="text-3xl font-bold mb-2">
              <span className={passed ? "text-green-600" : "text-red-600"}>
                {correctCount}
              </span>
              <span className="text-gray-400">/{total}</span>
            </div>
            <div className="text-lg text-gray-600 mb-2">
              正确率: {percentage}%
            </div>
            <div className="text-sm text-gray-500">
              {passed
                ? `达到及格线 (${passMark}题)`
                : `未达到及格线 (${passMark}题)`}
            </div>
          </div>

          <div
            className={`p-4 rounded-lg mb-6 ${
              passed
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <div className="text-sm">
              {passed ? (
                <div className="text-green-700">
                  <div className="font-semibold mb-1">考试通过！</div>
                  <div>您已具备相应的业余无线电操作技能水平</div>
                </div>
              ) : (
                <div className="text-red-700">
                  <div className="font-semibold mb-1">考试未通过</div>
                  <div>建议继续学习，再次尝试考试</div>
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onRestart}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              重新考试
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              返回主页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsModal;
