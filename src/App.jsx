import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import QuestionBank from "./components/QuestionBank";
import ErrorLog from "./components/ErrorLog";
import Header from "./components/Header";
import ErrorBoundary from "./components/ErrorBoundary";
import { loadQuestions, initializeRandomSeed } from "./utils/utils";

function App() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const data = await loadQuestions();
        setQuestions(data);
        initializeRandomSeed();
      } catch (err) {
        setError("Failed to load questions: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="text-red-500 text-xl mb-4">⚠️ Load Failed</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <ErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <Header />
          <Routes>
            <Route
              path="/"
              element={
                <Navigate to="/practice/sequential/Technician/1" replace />
              }
            />
            <Route
              path="/practice/:mode/:category/:questionId"
              element={<QuestionBank questions={questions} />}
            />
            <Route
              path="/exam/:category/:questionId"
              element={<QuestionBank questions={questions} />}
            />
            <Route path="/errors" element={<ErrorLog />} />
          </Routes>
        </div>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
