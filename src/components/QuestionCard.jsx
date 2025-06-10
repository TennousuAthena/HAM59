import React, { useState } from "react";
import ImageModal from "./ImageModal";

const QuestionCard = ({
  question,
  shuffledOptions,
  selectedAnswer,
  onAnswerSelect,
  showAnswer,
  isCorrect,
  questionNumber,
  totalQuestions,
}) => {
  const { options, correctAnswer } = shuffledOptions;

  const getOptionClass = (optionKey) => {
    let baseClass =
      "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ";

    if (!selectedAnswer) {
      return (
        baseClass + "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
      );
    }

    if (selectedAnswer === optionKey) {
      if (showAnswer) {
        if (isCorrect) {
          return baseClass + "border-green-500 bg-green-50 text-green-800";
        } else {
          return baseClass + "border-red-500 bg-red-50 text-red-800";
        }
      } else {
        return baseClass + "border-indigo-500 bg-indigo-50 text-indigo-800";
      }
    }

    if (showAnswer && optionKey === correctAnswer && !isCorrect) {
      return baseClass + "border-green-500 bg-green-50 text-green-800";
    }

    return baseClass + "border-gray-200 opacity-60";
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleImageClick = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            题目 {questionNumber}
          </h2>
          <span className="text-sm text-gray-500">ID: {question.id}</span>
        </div>

        <div className="text-gray-800 text-base leading-relaxed mb-4">
          {question.question}
        </div>

        {question.image && (
          <div className="mb-4">
            <img
              src={`/assets/images/${question.image}`}
              alt="题目图片"
              className="max-w-full h-auto rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
              onClick={handleImageClick}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        )}
      </div>

      <div className="space-y-3">
        {Object.entries(options).map(([key, value]) => (
          <button
            key={key}
            onClick={() => onAnswerSelect(key)}
            className={getOptionClass(key)}
            disabled={showAnswer}
          >
            <div className="flex items-start">
              <span className="font-semibold mr-3 min-w-[24px]">{key}.</span>
              <span className="flex-1 text-left">{value}</span>
            </div>
          </button>
        ))}
      </div>

      {showAnswer && (
        <div className="mt-4 p-4 rounded-lg bg-gray-50">
          <div className="flex items-center space-x-2">
            {isCorrect ? (
              <>
                <span className="text-green-600 font-semibold">
                  ✓ 回答正确!
                </span>
              </>
            ) : (
              <>
                <span className="text-red-600 font-semibold">✗ 回答错误</span>
                <span className="text-gray-600">
                  正确答案是: {correctAnswer}. {options[correctAnswer]}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      <ImageModal
        src={isModalOpen ? `/assets/images/${question.image}` : null}
        alt="题目图片放大"
        onClose={closeModal}
      />
    </div>
  );
};

export default QuestionCard;
