import React from "react";

const ResultsModal = ({ results, onClose, onRestart }) => {
  const { correctCount, total, passed, passMark } = results;
  const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;

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
            {passed
              ? "Congratulations, you passed!"
              : "Sorry, you did not pass"}
          </h2>

          <div className="mb-6">
            <div className="text-3xl font-bold mb-2">
              <span className={passed ? "text-green-600" : "text-red-600"}>
                {correctCount}
              </span>
              <span className="text-gray-400">/{total}</span>
            </div>
            <div className="text-lg text-gray-600 mb-2">
              Accuracy: {percentage}%
            </div>
            <div className="text-sm text-gray-500">
              {passed
                ? `Passing score met (${passMark} correct)`
                : `Passing score not met (${passMark} correct)`}
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
                  <div className="font-semibold mb-1">Exam Passed!</div>
                  <div>You have demonstrated the required knowledge.</div>
                </div>
              ) : (
                <div className="text-red-700">
                  <div className="font-semibold mb-1">Exam Failed</div>
                  <div>We recommend further study before re-attempting.</div>
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onRestart}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Restart Exam
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsModal;
