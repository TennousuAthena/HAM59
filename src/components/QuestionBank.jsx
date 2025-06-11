import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import QuestionCard from "./QuestionCard";
import ProgressBar from "./ProgressBar";
import ResultsModal from "./ResultsModal";
import NotesSection from "./NotesSection";
import {
  shuffleArray,
  shuffleOptions,
  getRandomSeed,
  saveAnswer,
  getWrongAnswers,
  saveWrongAnswer,
  clearWrongAnswers,
  saveProgress,
  clearAllNotes,
} from "../utils/utils";

const EXAM_CONFIG = {
  Technician: {
    totalQuestions: 35,
    passMark: 26,
    timeLimit: 40 * 60, // 40 minutes
    timeLimitMinutes: 40,
  },
  General: {
    totalQuestions: 35,
    passMark: 26,
    timeLimit: 50 * 60, // 50 minutes
    timeLimitMinutes: 50,
  },
  Extra: {
    totalQuestions: 50,
    passMark: 37,
    timeLimit: 60 * 60, // 60 minutes
    timeLimitMinutes: 60,
  },
};

const QuestionBank = ({ questions }) => {
  const { mode, category = "Technician", questionId } = useParams();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [forceNoteExpansion, setForceNoteExpansion] = useState(false);

  const isExamMode = window.location.pathname.includes("/exam/");
  const isPracticeMode = !isExamMode;
  const examConfig = EXAM_CONFIG[category] || EXAM_CONFIG.Technician;

  // Filter and shuffle questions based on mode
  const filteredQuestions = useMemo(() => {
    if (!questions || !Array.isArray(questions)) return [];

    let filtered;
    if (mode === "retry") {
      const wrongAnswerIds = getWrongAnswers();
      filtered = questions.filter((q) => wrongAnswerIds.includes(q.id));
    } else {
      filtered = questions.filter((q) => {
        if (!q.id || typeof q.id !== "string") return false;
        const licenseMap = { T: "Technician", G: "General", E: "Extra" };
        const questionClass = licenseMap[q.id.charAt(0)];
        return questionClass === category;
      });
    }

    const seed = getRandomSeed(isExamMode ? "exam" : "practice");

    if (mode === "random" || isExamMode) {
      filtered = shuffleArray([...filtered], seed);
    }

    if (isExamMode) {
      filtered = filtered.slice(0, examConfig.totalQuestions);
    }

    return filtered;
  }, [questions, category, mode, isExamMode]);

  const currentQuestion = filteredQuestions[currentQuestionIndex];
  const shuffledOptions = useMemo(() => {
    if (!currentQuestion) return {};
    const seed = getRandomSeed(isExamMode ? "exam" : "practice");
    const questionSpecificSeed = `${seed}_${currentQuestion.id}`;
    return shuffleOptions(
      currentQuestion.options,
      currentQuestion.correct_answer,
      questionSpecificSeed
    );
  }, [currentQuestion, isExamMode]);

  useEffect(() => {
    saveProgress(mode, category, questionId);
  }, [mode, category, questionId]);

  useEffect(() => {
    // Reset state when mode or category changes
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSelectedAnswer("");
    setShowAnswer(false);
    setIsCorrect(null);
  }, [mode, category]);

  useEffect(() => {
    const qId = parseInt(questionId);
    if (!isNaN(qId) && qId > 0 && qId <= filteredQuestions.length) {
      setCurrentQuestionIndex(qId - 1);
    }
    setForceNoteExpansion(false);
  }, [questionId, filteredQuestions.length]);

  useEffect(() => {
    setSelectedAnswer("");
    setShowAnswer(false);
    setIsCorrect(null);
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (isExamMode && examStarted) {
      setTimeLeft(examConfig.timeLimit);
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            calculateResults();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isExamMode, examStarted, category]);

  const calculateResults = useCallback(() => {
    let correctCount = 0;
    const examSeed = getRandomSeed("exam");
    filteredQuestions.forEach((question, index) => {
      const userAnswer = answers[index];
      const questionSpecificSeed = `${examSeed}_${question.id}`;
      const shuffledOpts = shuffleOptions(
        question.options,
        question.correct_answer,
        questionSpecificSeed
      );
      if (userAnswer === shuffledOpts.correctAnswer) {
        correctCount++;
      }
    });

    const passed = correctCount >= examConfig.passMark;
    setShowResults({
      correctCount,
      total: filteredQuestions.length,
      passed,
      passMark: examConfig.passMark,
    });

    // Save wrong answers from the exam
    if (isExamMode) {
      filteredQuestions.forEach((question, index) => {
        const userAnswer = answers[index];
        if (userAnswer === undefined) return; // Skip unanswered

        const examSeed = getRandomSeed("exam");
        const questionSpecificSeed = `${examSeed}_${question.id}`;
        const shuffledOpts = shuffleOptions(
          question.options,
          question.correct_answer,
          questionSpecificSeed
        );
        if (userAnswer !== shuffledOpts.correctAnswer) {
          saveWrongAnswer(question.id);
        }
      });
    }
  }, [answers, filteredQuestions, category, isExamMode]);

  const navigateToQuestion = useCallback(
    (index) => {
      const newQuestionId = index + 1;
      const basePath = isExamMode ? "/exam" : `/practice/${mode}`;
      navigate(`${basePath}/${category}/${newQuestionId}`);
    },
    [isExamMode, mode, category, navigate]
  );

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      navigateToQuestion(currentQuestionIndex + 1);
    } else if (isExamMode) {
      calculateResults();
    }
  }, [
    currentQuestionIndex,
    filteredQuestions.length,
    isExamMode,
    navigateToQuestion,
    calculateResults,
  ]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0 && isPracticeMode) {
      navigateToQuestion(currentQuestionIndex - 1);
    }
  }, [currentQuestionIndex, navigateToQuestion, isPracticeMode]);

  const handleAnswerSelect = useCallback(
    (answer) => {
      if (showAnswer && isPracticeMode) return;

      setSelectedAnswer(answer);

      if (isPracticeMode) {
        const correct = shuffledOptions.correctAnswer === answer;
        setIsCorrect(correct);
        setShowAnswer(true);

        if (!correct) {
          saveWrongAnswer(currentQuestion.id);
          setForceNoteExpansion(true);
        }
      }

      setAnswers((prev) => ({
        ...prev,
        [currentQuestionIndex]: answer,
      }));
    },
    [
      showAnswer,
      isPracticeMode,
      shuffledOptions,
      currentQuestion,
      currentQuestionIndex,
    ]
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (["TEXTAREA", "INPUT"].includes(event.target.tagName)) {
        return;
      }

      switch (event.code) {
        case "ArrowRight":
          handleNext();
          break;
        case "ArrowLeft":
          handlePrevious();
          break;
        case "Digit1":
        case "Digit2":
        case "Digit3":
        case "Digit4":
          const optionKeys = Object.keys(shuffledOptions.options || {});
          const keyIndex = parseInt(event.code.replace("Digit", ""), 10) - 1;
          if (keyIndex >= 0 && keyIndex < optionKeys.length) {
            handleAnswerSelect(optionKeys[keyIndex]);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrevious, handleAnswerSelect, shuffledOptions.options]);

  const startExam = () => {
    setExamStarted(true);
    setAnswers({});
  };

  if (!currentQuestion) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">No questions found</p>
        </div>
      </div>
    );
  }

  if (isExamMode && !examStarted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Exam Simulation</h2>
          <p className="text-gray-600 mb-2">• License Class: {category}</p>
          <p className="text-gray-600 mb-2">
            • Total Questions: {examConfig.totalQuestions}
          </p>
          <p className="text-gray-600 mb-2">
            • Passing Score: {examConfig.passMark} correct
          </p>
          <p className="text-gray-600 mb-6">
            • Time Limit: {examConfig.timeLimitMinutes} minutes
          </p>
          <button
            onClick={startExam}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Start Exam
          </button>
        </div>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {isExamMode && timeLeft !== null && (
        <div className="fixed bottom-4 left-4 bg-white shadow-lg rounded-full px-4 py-2 text-lg font-bold text-gray-800">
          ⏳ {formatTime(timeLeft)}
        </div>
      )}
      <ProgressBar
        current={currentQuestionIndex + 1}
        total={filteredQuestions.length}
        mode={isExamMode ? "exam" : mode}
        category={category}
      />

      <div className="max-w-4xl mx-auto">
        <QuestionCard
          question={currentQuestion}
          selectedAnswer={selectedAnswer}
          onAnswerSelect={handleAnswerSelect}
          showAnswer={showAnswer}
          isCorrect={isCorrect}
          shuffledOptions={shuffledOptions}
          questionId={currentQuestion.id}
          refs={currentQuestion.refs}
        />

        <div className="flex justify-between mt-6">
          {isPracticeMode && (
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 bg-gray-500 text-white rounded disabled:bg-gray-300 hover:bg-gray-600 transition-colors"
            >
              上一题
            </button>
          )}

          <div className="flex-1"></div>

          <button
            onClick={handleNext}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            {currentQuestionIndex === filteredQuestions.length - 1 && isExamMode
              ? "提交答案"
              : "下一题"}
          </button>
        </div>

        {isPracticeMode && (
          <NotesSection
            questionId={currentQuestion.id}
            forceExpand={forceNoteExpansion}
          />
        )}
      </div>

      {showResults && (
        <ResultsModal
          results={showResults}
          onClose={() => {
            setShowResults(false);
            navigate("/");
          }}
          onRestart={() => {
            setShowResults(false);
            setAnswers({});
            setCurrentQuestionIndex(0);
            navigateToQuestion(0);
          }}
        />
      )}
    </div>
  );
};

export default QuestionBank;
