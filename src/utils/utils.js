// Utility functions for the amateur radio question bank platform

export const loadQuestions = async () => {
  const questionFiles = [
    "/data/FCC/technician.json",
    "/data/FCC/general.json",
    "/data/FCC/extra.json",
  ];

  const fetcher = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error from ${url}: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch ${url}:`, error);
      return []; // Return empty array on failure to not break Promise.all
    }
  };

  try {
    const allQuestionSets = await Promise.all(questionFiles.map(fetcher));
    const combinedQuestions = [].concat(...allQuestionSets);

    // Transform data to a consistent format if needed
    return combinedQuestions.map((q) => {
      // Assuming old format had options as {A:'', B:'', C:'', D:''}
      // and correct_answer as a letter key.
      // New format has answers as an array and correct as an index.
      if (Array.isArray(q.answers)) {
        const options = {};
        const correctLetter = String.fromCharCode(65 + q.correct); // 0->A, 1->B, ...
        q.answers.forEach((ans, i) => {
          const letter = String.fromCharCode(65 + i);
          options[letter] = ans;
        });

        return {
          id: q.id,
          question: q.question,
          options: options,
          correct_answer: correctLetter,
          refs: q.refs,
          image: q.image || "", // Ensure image property exists
        };
      }
      return q; // Return as-is if format is already correct
    });
  } catch (error) {
    console.error("All question sources failed to load:", error);
    throw new Error("Failed to load any question data.");
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
    Technician: "Technician Class",
    General: "General Class",
    Extra: "Extra Class",
  };
  return names[category] || category;
};

export const getModeName = (mode) => {
  const names = {
    sequential: "Sequential Practice",
    random: "Random Practice",
    exam: "Exam Simulation",
    retry: "Error Log Practice",
  };
  return names[mode] || mode;
};

// Notes import/export functions
export const exportNotes = () => {
  const notes = JSON.parse(localStorage.getItem("questionNotes") || "{}");
  const dataStr = JSON.stringify(notes, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });

  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ham-notes-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importNotesFromFile = (file, options = { mode: "overwrite" }) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const newNotes = JSON.parse(e.target.result);
        if (typeof newNotes !== "object" || newNotes === null) {
          throw new Error("无效的笔记格式");
        }

        let finalNotes;
        if (options.mode === "merge") {
          const currentNotes = JSON.parse(
            localStorage.getItem("questionNotes") || "{}"
          );
          finalNotes = { ...currentNotes };
          for (const key in newNotes) {
            if (Object.prototype.hasOwnProperty.call(newNotes, key)) {
              if (finalNotes[key] && finalNotes[key].trim()) {
                finalNotes[key] = `${finalNotes[key]}\n---n${newNotes[key]}`;
              } else {
                finalNotes[key] = newNotes[key];
              }
            }
          }
        } else {
          finalNotes = newNotes;
        }

        localStorage.setItem("questionNotes", JSON.stringify(finalNotes));
        resolve(Object.keys(newNotes).length);
      } catch (error) {
        reject(new Error("文件格式不正确: " + error.message));
      }
    };
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsText(file);
  });
};

export const importNotesFromUrl = async (
  url,
  options = { mode: "overwrite" }
) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const newNotes = await response.json();
    if (typeof newNotes !== "object" || newNotes === null) {
      throw new Error("无效的笔记格式");
    }

    let finalNotes;
    if (options.mode === "merge") {
      const currentNotes = JSON.parse(
        localStorage.getItem("questionNotes") || "{}"
      );
      finalNotes = { ...currentNotes };
      for (const key in newNotes) {
        if (Object.prototype.hasOwnProperty.call(newNotes, key)) {
          if (finalNotes[key] && finalNotes[key].trim()) {
            finalNotes[key] = `${finalNotes[key]}\n---\n${newNotes[key]}`;
          } else {
            finalNotes[key] = newNotes[key];
          }
        }
      }
    } else {
      finalNotes = newNotes;
    }

    localStorage.setItem("questionNotes", JSON.stringify(finalNotes));
    return Object.keys(newNotes).length;
  } catch (error) {
    throw new Error("URL导入失败: " + error.message);
  }
};

// Temporarily disable preset notes as they are for the wrong question bank
// export const importSimpleNotes = async (options = { mode: 'overwrite' }) => {
//   try {
//     const response = await fetch("/data/simple_note.json");
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
//     const newNotes = await response.json();

//     let finalNotes;
//     if (options.mode === 'merge') {
//       const currentNotes = JSON.parse(localStorage.getItem("questionNotes") || "{}");
//       finalNotes = { ...currentNotes };
//       for (const key in newNotes) {
//         if (Object.prototype.hasOwnProperty.call(newNotes, key)) {
//           if (finalNotes[key] && finalNotes[key].trim()) {
//             finalNotes[key] = `${finalNotes[key]}\n\n---\n\n${newNotes[key]}`;
//           } else {
//             finalNotes[key] = newNotes[key];
//           }
//         }
//       }
//     } else {
//       finalNotes = newNotes;
//     }

//     localStorage.setItem("questionNotes", JSON.stringify(finalNotes));
//     return Object.keys(newNotes).length;
//   } catch (error) {
//     throw new Error("导入精简助记失败: " + error.message);
//   }
// };

// export const importDetailedNotes = (options = { mode: 'overwrite' }) => {
//   // 详细版笔记 - 包含完整解析
//   const detailedNotes = {
//     "LK0001": "我国现行法律体系中专门针对无线电管理的最高法律文件是《中华人民共和国无线电管理条例》，由国务院和中央军委联合颁布。这是因为无线电频谱资源涉及军民两用，需要统一管理。",
//     "LK0002": "《业余无线电台管理办法》是专门针对业余无线电台管理的最高法律文件，由工业和信息化部制定。该办法规定了业余电台的设置、使用、管理等具体要求。",
//     "LK0003": "我国的无线电主管部门是各级无线电管理机构，包括国家无线电管理机构和地方无线电管理机构，负责无线电频率的规划、分配、使用和监督管理。",
//     // 可以添加更多预设的详细笔记
//   };

//   let finalNotes;
//   if (options.mode === 'merge') {
//     const currentNotes = JSON.parse(localStorage.getItem("questionNotes") || "{}");
//     finalNotes = { ...currentNotes };
//     for (const key in detailedNotes) {
//       if (Object.prototype.hasOwnProperty.call(detailedNotes, key)) {
//         if (finalNotes[key] && finalNotes[key].trim()) {
//           finalNotes[key] = `${finalNotes[key]}\n---\n${detailedNotes[key]}`;
//         } else {
//           finalNotes[key] = detailedNotes[key];
//         }
//       }
//     }
//   } else {
//     finalNotes = detailedNotes;
//   }

//   localStorage.setItem("questionNotes", JSON.stringify(finalNotes));
//   return Object.keys(detailedNotes).length;
// };

export const clearAllNotes = () => {
  localStorage.removeItem("questionNotes");
};
