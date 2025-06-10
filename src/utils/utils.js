// Utility functions for the amateur radio question bank platform

export const loadQuestions = async () => {
  try {
    const response = await fetch("/data/processed_questions.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error loading questions:", error);
    throw error;
  }
};

export const getRandomSeed = (mode = "practice") => {
  const seedKey = mode === "exam" ? "examRandomSeed" : "randomSeed";
  let seed = localStorage.getItem(seedKey);
  if (!seed) {
    seed = Date.now().toString() + "_" + mode;
    localStorage.setItem(seedKey, seed);
  }
  return seed;
};

export const initializeRandomSeed = () => {
  if (!localStorage.getItem("randomSeed")) {
    localStorage.setItem("randomSeed", Date.now().toString());
  }
};

export const refreshRandomSeed = () => {
  const newSeed = Date.now().toString();
  localStorage.setItem("randomSeed", newSeed);
  localStorage.setItem("examRandomSeed", newSeed + "_exam");
  return newSeed;
};

// Simple seeded random number generator
const stringToSeed = (str) => {
  let hash = 0;
  if (typeof str !== "string" || str.length === 0) return 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

const seededRandom = (seed) => {
  const seedNum = stringToSeed(seed.toString());
  const x = Math.sin(seedNum) * 10000;
  return x - Math.floor(x);
};

export const shuffleArray = (array, seed) => {
  if (!Array.isArray(array)) return array;

  const shuffled = [...array];
  const rng = seededRandom(seed + "array");

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const shuffleOptions = (options, correctAnswer, seed) => {
  if (!options || typeof options !== "object")
    return { options: {}, correctAnswer: "A" };

  const optionKeys = ["A", "B", "C", "D"];
  const optionValues = optionKeys.map((key) => options[key]).filter(Boolean);

  if (optionValues.length === 0) return { options: {}, correctAnswer: "A" };

  // Create a seeded shuffle for options
  const shuffledValues = [...optionValues];
  for (let i = shuffledValues.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + "options" + i) * (i + 1));
    [shuffledValues[i], shuffledValues[j]] = [
      shuffledValues[j],
      shuffledValues[i],
    ];
  }

  const shuffledOptions = {};
  optionKeys.forEach((key, index) => {
    if (index < shuffledValues.length) {
      shuffledOptions[key] = shuffledValues[index];
    }
  });

  // Find which option key now contains the correct answer
  const correctAnswerText = options[correctAnswer];
  const newCorrectKey =
    optionKeys.find((key) => shuffledOptions[key] === correctAnswerText) || "A";

  return {
    options: shuffledOptions,
    correctAnswer: newCorrectKey,
  };
};

export const saveAnswer = (questionId, answer) => {
  const answers = JSON.parse(localStorage.getItem("userAnswers") || "{}");
  answers[questionId] = answer;
  localStorage.setItem("userAnswers", JSON.stringify(answers));
};

export const getAnswer = (questionId) => {
  const answers = JSON.parse(localStorage.getItem("userAnswers") || "{}");
  return answers[questionId];
};

export const saveWrongAnswer = (questionId) => {
  const wrongAnswers = JSON.parse(localStorage.getItem("wrongAnswers") || "[]");
  if (!wrongAnswers.includes(questionId)) {
    wrongAnswers.push(questionId);
    localStorage.setItem("wrongAnswers", JSON.stringify(wrongAnswers));
  }
};

export const getWrongAnswers = () => {
  return JSON.parse(localStorage.getItem("wrongAnswers") || "[]");
};

export const clearWrongAnswers = () => {
  localStorage.removeItem("wrongAnswers");
};

export const saveProgress = (mode, category, questionId) => {
  // Do not save progress for special modes
  if (mode === "retry" || mode === "exam") return;

  const progress = JSON.parse(localStorage.getItem("practiceProgress") || "{}");
  if (!progress[mode]) {
    progress[mode] = {};
  }
  progress[mode][category] = questionId;
  localStorage.setItem("practiceProgress", JSON.stringify(progress));
};

export const getProgress = (mode, category) => {
  const progress = JSON.parse(localStorage.getItem("practiceProgress") || "{}");
  return progress[mode]?.[category] || 1;
};

export const saveNote = (questionId, note) => {
  const notes = JSON.parse(localStorage.getItem("questionNotes") || "{}");
  notes[questionId] = note;
  localStorage.setItem("questionNotes", JSON.stringify(notes));
};

export const getNote = (questionId) => {
  const notes = JSON.parse(localStorage.getItem("questionNotes") || "{}");
  return notes[questionId] || "";
};

export const formatQuestionNumber = (num, total) => {
  return `${num}/${total}`;
};

export const getCategoryName = (category) => {
  const names = {
    A: "A类",
    B: "B类",
    C: "C类",
  };
  return names[category] || category;
};

export const getModeName = (mode) => {
  const names = {
    sequential: "顺序练习",
    random: "随机练习",
    exam: "模拟考试",
  };
  return names[mode] || mode;
};
