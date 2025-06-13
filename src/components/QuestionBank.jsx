import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  saveAutoNextQuestion,
  getAutoNextQuestion,
  refreshRandomSeed,
} from "../utils/utils";

const EXAM_CONFIG = {
  A: {
    totalQuestions: 30,
    passMark: 25,
    timeLimit: 40 * 60,
    timeLimitMinutes: 40,
  },
  B: {
    totalQuestions: 50,
    passMark: 40,
    timeLimit: 60 * 60,
    timeLimitMinutes: 60,
  },
  C: {
    totalQuestions: 80,
    passMark: 60,
    timeLimit: 90 * 60,
    timeLimitMinutes: 90,
  },
};

const QuestionBank = ({ questions }) => {
  const { mode, category, questionId } = useParams();
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
  const [autoNextQuestion, setAutoNextQuestion] = useState(
    getAutoNextQuestion()
  );
  const [examSeedTrigger, setExamSeedTrigger] = useState(0);

  const isExamMode = window.location.pathname.includes("/exam/");
  const isPracticeMode = !isExamMode;
  const examConfig = EXAM_CONFIG[category] || EXAM_CONFIG.B;

  // Filter and shuffle questions based on mode
  const filteredQuestions = useMemo(() => {
    if (!questions || !Array.isArray(questions)) return [];

    let filtered;
    if (mode === "retry") {
      const wrongAnswerIds = getWrongAnswers();
      filtered = questions.filter((q) => wrongAnswerIds.includes(q.id));
    } else {
      filtered = questions.filter((q) => {
        if (!q.category || !Array.isArray(q.category)) return false;
        return q.category.includes(category);
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
  }, [questions, category, mode, isExamMode, examSeedTrigger]);

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
  }, [currentQuestion, isExamMode, examSeedTrigger]);

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

  const handleAutoNextToggle = (enabled) => {
    setAutoNextQuestion(enabled);
    saveAutoNextQuestion(enabled);
  };

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

      // 在考试模式下，如果开启了自动下一题，则自动进入下一题
      if (isExamMode && autoNextQuestion) {
        setTimeout(() => {
          if (currentQuestionIndex < filteredQuestions.length - 1) {
            navigateToQuestion(currentQuestionIndex + 1);
          } else {
            calculateResults();
          }
        }, 500); // 延迟500ms，让用户看到选择的答案
      }
    },
    [
      showAnswer,
      isPracticeMode,
      shuffledOptions,
      currentQuestion,
      currentQuestionIndex,
      isExamMode,
      autoNextQuestion,
      filteredQuestions.length,
      navigateToQuestion,
      calculateResults,
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
    // 自动打乱顺序 - 重新生成随机种子
    refreshRandomSeed();

    // 触发重新计算filteredQuestions
    setExamSeedTrigger((prev) => prev + 1);

    setExamStarted(true);
    setAnswers({});
    setCurrentQuestionIndex(0);
  };

  if (!currentQuestion) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">没有找到题目</p>
        </div>
      </div>
    );
  }

  if (isExamMode && !examStarted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">模拟考试</h2>
          <p className="text-gray-600 mb-2">• 题库类别：{category}类</p>
          <p className="text-gray-600 mb-2">
            • 总题数：{examConfig.totalQuestions}题
          </p>
          <p className="text-gray-600 mb-2">
            • 及格线：{examConfig.passMark}题
          </p>
          <p className="text-gray-600 mb-2">
            • 考试时间：{examConfig.timeLimitMinutes}分钟
          </p>
          <p className="text-indigo-600 mb-6 font-medium">
            • 开始考试时将自动打乱题目和选项顺序
          </p>

          {/* 自动下一题设置 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <label className="flex items-center justify-center space-x-3">
              <input
                type="checkbox"
                checked={autoNextQuestion}
                onChange={(e) => handleAutoNextToggle(e.target.checked)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-gray-700 font-medium">
                选择答案后自动下一题
              </span>
            </label>
            <p className="text-sm text-gray-500 mt-2">
              开启后，点击答案选项会自动进入下一题，无需手动点击"下一题"按钮
            </p>
          </div>

          <button
            onClick={startExam}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            开始考试
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

      {/* 考试模式下的自动下一题控制 */}
      {isExamMode && examStarted && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg px-4 py-2">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={autoNextQuestion}
              onChange={(e) => handleAutoNextToggle(e.target.checked)}
              className="h-3 w-3 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="text-gray-700">自动下一题</span>
          </label>
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
          shuffledOptions={shuffledOptions}
          selectedAnswer={selectedAnswer}
          onAnswerSelect={handleAnswerSelect}
          showAnswer={showAnswer && isPracticeMode}
          isCorrect={isCorrect}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={filteredQuestions.length}
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
