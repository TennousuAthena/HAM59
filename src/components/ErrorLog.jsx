import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getWrongAnswers,
  clearWrongAnswers,
  loadQuestions,
} from "../utils/utils";

const ErrorLog = () => {
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [questionsData, wrongIds] = await Promise.all([
          loadQuestions(),
          Promise.resolve(getWrongAnswers()),
        ]);

        setQuestions(questionsData);

        // Filter questions that are in wrong answers list
        const wrongQuestions = questionsData.filter((q) =>
          wrongIds.includes(q.id)
        );
        setWrongAnswers(wrongQuestions);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleRetryAll = () => {
    if (wrongAnswers.length > 0) {
      navigate("/practice/retry/all/1");
    } else {
      alert("没有错题可以重答！");
    }
  };

  const handleClearAll = () => {
    if (window.confirm("确定要清空所有错题记录吗？")) {
      clearWrongAnswers();
      setWrongAnswers([]);
    }
  };

  const filteredWrongAnswers =
    selectedCategory === "all"
      ? wrongAnswers
      : wrongAnswers.filter(
          (q) => q.category && q.category.includes(selectedCategory)
        );

  const getCategoryStats = () => {
    const stats = { A: 0, B: 0, C: 0 };
    wrongAnswers.forEach((q) => {
      if (q.category && Array.isArray(q.category)) {
        q.category.forEach((cat) => {
          if (stats.hasOwnProperty(cat)) {
            stats[cat]++;
          }
        });
      }
    });
    return stats;
  };

  const stats = getCategoryStats();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载错题记录...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">错题记录</h1>
            <div className="flex space-x-2">
              {wrongAnswers.length > 0 && (
                <>
                  <button
                    onClick={handleRetryAll}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    重练所有
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    清空所有
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-800">
                {wrongAnswers.length}
              </div>
              <div className="text-sm text-gray-600">总错题数</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{stats.A}</div>
              <div className="text-sm text-gray-600">A类错题</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.B}</div>
              <div className="text-sm text-gray-600">B类错题</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.C}
              </div>
              <div className="text-sm text-gray-600">C类错题</div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-4 mb-6">
            <span className="text-sm font-medium text-gray-700">筛选类别:</span>
            <div className="flex space-x-2">
              {["all", "A", "B", "C"].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    selectedCategory === category
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category === "all" ? "全部" : `${category}类`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Questions List */}
        {filteredWrongAnswers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-400 text-4xl mb-4">🎉</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {wrongAnswers.length === 0 ? "暂无错题记录" : "该类别暂无错题"}
            </h3>
            <p className="text-gray-500 mb-4">
              {wrongAnswers.length === 0
                ? "继续练习，错题会自动记录在这里"
                : "切换其他类别查看错题记录"}
            </p>
            <Link
              to="/practice/sequential/A/1"
              className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              开始练习
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWrongAnswers.map((question, index) => (
              <div
                key={question.id}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-sm font-medium text-gray-500">
                        #{index + 1}
                      </span>
                      <span className="text-sm text-gray-500">
                        ID: {question.id}
                      </span>
                      <div className="flex space-x-1">
                        {question.category &&
                          question.category.map((cat) => (
                            <span
                              key={cat}
                              className={`px-2 py-1 text-xs rounded ${
                                cat === "A"
                                  ? "bg-green-100 text-green-700"
                                  : cat === "B"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {cat}类
                            </span>
                          ))}
                      </div>
                    </div>
                    <h3 className="text-base font-medium text-gray-800 mb-3">
                      {question.question}
                    </h3>

                    {question.image && (
                      <div className="mb-3">
                        <img
                          src={`/assets/images/${question.image}`}
                          alt="题目图片"
                          className="max-w-xs h-auto rounded border border-gray-200"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {Object.entries(question.options).map(([key, value]) => (
                        <div
                          key={key}
                          className={`p-2 rounded border ${
                            key === question.correct_answer
                              ? "border-green-500 bg-green-50 text-green-800"
                              : "border-gray-200 bg-gray-50"
                          }`}
                        >
                          <span className="font-semibold">{key}.</span> {value}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="ml-4 flex flex-col space-y-2">
                    <Link
                      to={`/practice/sequential/${question.category[0]}/1`}
                      className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
                    >
                      重新练习
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorLog;
