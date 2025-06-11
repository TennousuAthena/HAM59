import React from "react";

const RefLink = ({ refText }) => {
  const sectionPart = refText.split("(")[0].trim();
  const ecfrUrl = `https://www.ecfr.gov/current/title-47/chapter-I/subchapter-D/part-97/subpart-D/section-${sectionPart}#p-${refText}`;
  return (
    <a
      href={ecfrUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-indigo-600 hover:text-indigo-800 hover:underline"
      title={`View §${refText} on eCFR.gov`}
    >
      §{refText}
    </a>
  );
};

const QuestionCard = ({
  question,
  selectedAnswer,
  onAnswerSelect,
  showAnswer,
  isCorrect,
  shuffledOptions,
  questionId,
  refs,
}) => {
  if (!question) {
    return <div>Question not available.</div>;
  }

  const { options, correctAnswer } = shuffledOptions;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {question.question}
      </h3>
      <div className="space-y-3">
        {Object.entries(options).map(([key, value]) => {
          const isSelected = selectedAnswer === key;
          const isCorrectAnswer = key === correctAnswer;

          let buttonClass =
            "w-full text-left p-4 rounded-lg border transition-colors duration-150 ";
          if (showAnswer) {
            if (isCorrectAnswer) {
              buttonClass += "bg-green-100 border-green-300 text-green-800";
            } else if (isSelected && !isCorrect) {
              buttonClass += "bg-red-100 border-red-300 text-red-800";
            } else {
              buttonClass += "bg-gray-50 border-gray-200 text-gray-700";
            }
          } else {
            if (isSelected) {
              buttonClass +=
                "bg-indigo-100 border-indigo-300 ring-2 ring-indigo-400";
            } else {
              buttonClass += "bg-white border-gray-300 hover:bg-indigo-50";
            }
          }

          return (
            <button
              key={key}
              onClick={() => onAnswerSelect(key)}
              disabled={showAnswer}
              className={buttonClass}
            >
              <span className="font-bold mr-2">{key}.</span>
              {value}
            </button>
          );
        })}
      </div>
      {showAnswer && (
        <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-blue-800 font-semibold">
            {isCorrect ? "Correct!" : "Incorrect."} The correct answer is{" "}
            {correctAnswer}.
          </p>
          {refs && (
            <p className="text-sm text-gray-600 mt-2">
              Reference(s):{" "}
              {refs
                .replace(/\[|\]/g, "")
                .split(", ")
                .map((ref, index) => (
                  <span key={index}>
                    {index > 0 && ", "}
                    <RefLink refText={ref} />
                  </span>
                ))}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
