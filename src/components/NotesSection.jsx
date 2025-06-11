import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import {
  saveNote,
  getNote,
  exportNotes,
  importNotesFromFile,
  importNotesFromUrl,
  // importSimpleNotes,
  // importDetailedNotes,
  clearAllNotes,
} from "../utils/utils";

const NotesSection = ({ questionId, forceExpand }) => {
  const [note, setNote] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [showUrlDialog, setShowUrlDialog] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [message, setMessage] = useState("");
  const [importConfirmation, setImportConfirmation] = useState({
    isOpen: false,
    onConfirm: () => {},
  });
  const [clearConfirmation, setClearConfirmation] = useState(false);
  const fileInputRef = useRef();
  const importMenuRef = useRef();

  useEffect(() => {
    const savedNote = getNote(questionId);
    setNote(savedNote);

    if (savedNote) {
      const expansionMemory = localStorage.getItem("notesExpansionState");
      setIsExpanded(expansionMemory === "expanded");
      setIsEditing(false);
    } else {
      setIsExpanded(false);
      setIsEditing(true);
    }
  }, [questionId]);

  useEffect(() => {
    if (forceExpand) {
      setIsExpanded(true);
    }
  }, [forceExpand]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        importMenuRef.current &&
        !importMenuRef.current.contains(event.target)
      ) {
        setShowImportMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleExpansion = () => {
    const newExpansionState = !isExpanded;
    setIsExpanded(newExpansionState);
    if (getNote(questionId)) {
      localStorage.setItem(
        "notesExpansionState",
        newExpansionState ? "expanded" : "collapsed"
      );
    }
  };

  const handleSaveNote = () => {
    saveNote(questionId, note);
    setIsEditing(false);
    showMessage("Note saved!", "success");
  };

  const onRequestImport = (importAction) => {
    const allNotes = localStorage.getItem("questionNotes");
    if (allNotes && allNotes !== "{}" && allNotes !== "[]") {
      setImportConfirmation({
        isOpen: true,
        onConfirm: importAction,
      });
    } else {
      importAction({ mode: "overwrite" });
    }
  };

  const handleClearNote = () => {
    setNote("");
    saveNote(questionId, "");
  };

  const handleExportNotes = () => {
    try {
      exportNotes();
      showMessage("Notes exported successfully!", "success");
    } catch (error) {
      showMessage("Export failed: " + error.message, "error");
    }
  };

  const handleFileImport = () => {
    setShowImportMenu(false);
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const importAction = async (options) => {
      try {
        const count = await importNotesFromFile(file, options);
        const message =
          options.mode === "merge"
            ? `Successfully merged ${count} notes!`
            : `Successfully overwrote with ${count} notes!`;
        showMessage(message, "success");
        const updatedNote = getNote(questionId);
        setNote(updatedNote);
      } catch (error) {
        showMessage("Import failed: " + error.message, "error");
      }
    };

    onRequestImport(importAction);
    event.target.value = "";
  };

  const handleUrlImport = () => {
    setShowImportMenu(false);
    setShowUrlDialog(true);
  };

  const handleUrlImportConfirm = async () => {
    if (!importUrl.trim()) {
      showMessage("Please enter a valid URL", "error");
      return;
    }
    const urlToImport = importUrl.trim();

    const importAction = async (options) => {
      try {
        const count = await importNotesFromUrl(urlToImport, options);
        const message =
          options.mode === "merge"
            ? `Successfully merged ${count} notes from URL!`
            : `Successfully overwrote with ${count} notes from URL!`;
        showMessage(message, "success");
        const updatedNote = getNote(questionId);
        setNote(updatedNote);
      } catch (error) {
        showMessage("URL import failed: " + error.message, "error");
      }
    };

    setShowUrlDialog(false);
    setImportUrl("");
    onRequestImport(importAction);
  };

  const handleClearAllNotesRequest = () => {
    setShowImportMenu(false);
    setClearConfirmation(true);
  };

  const handleClearAllNotesConfirm = () => {
    clearAllNotes();
    setNote("");
    setIsEditing(true);
    setIsExpanded(true);
    setClearConfirmation(false);
    showMessage("All notes have been cleared!", "success");
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={toggleExpansion}
          className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 transition-colors"
        >
          <span className="text-lg">📝</span>
          <span className="font-medium">My Notes</span>
          <span className="text-sm text-gray-500">
            {isExpanded ? "Collapse" : "Expand"}
          </span>
        </button>

        {note && !isEditing && (
          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
            Saved
          </span>
        )}
      </div>

      {message && (
        <div
          className={`mb-3 p-2 rounded text-sm ${
            message.type === "success"
              ? "bg-green-100 text-green-700 border border-green-200"
              : "bg-red-100 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {isExpanded && (
        <div className="space-y-3">
          {isEditing ? (
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter your notes here... Supports Markdown and LaTeX (e.g., $E=mc^2$)."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={6}
            />
          ) : (
            <div
              className="prose prose-indigo max-w-none p-3 border border-gray-200 rounded-lg bg-gray-50 min-h-[10rem] cursor-text"
              onDoubleClick={() => setIsEditing(true)}
              title="Double-click to edit"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  a: ({ node, ...props }) => (
                    <a {...props} target="_blank" rel="noopener noreferrer" />
                  ),
                }}
              >
                {note || "*No notes yet. Click 'Edit' to get started!*"}
              </ReactMarkdown>
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <div className="relative" ref={importMenuRef}>
                <button
                  onClick={() => setShowImportMenu(!showImportMenu)}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-1"
                >
                  <span>📥</span>
                  <span>Import</span>
                  <span className="text-xs">▼</span>
                </button>

                {showImportMenu && (
                  <div className="absolute bottom-full left-0 mb-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <button
                      onClick={handleFileImport}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg"
                    >
                      📁 From File...
                    </button>
                    <button
                      onClick={handleUrlImport}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      🌐 From URL...
                    </button>
                    {/* <button
                      onClick={handleSimpleNotesImport}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      📄 Import Simple Notes
                    </button> */}
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleClearAllNotesRequest}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 last:rounded-b-lg"
                    >
                      🗑️ Clear All Notes
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleExportNotes}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-1"
              >
                <span>📤</span>
                <span>Export</span>
              </button>
            </div>

            <div className="flex space-x-2 items-center">
              {isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setNote(getNote(questionId));
                    }}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNote}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Save Note
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleClearNote}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Import Confirmation Dialog */}
      {importConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Import Options</h3>
            <p className="text-gray-600 mb-6">
              Existing notes detected. Please choose an import mode, or export
              your current notes for backup.
            </p>
            <div className="flex justify-between items-center">
              <button
                onClick={handleExportNotes}
                className="px-4 py-2 text-sm text-indigo-600 font-semibold hover:bg-indigo-50 rounded-lg transition-colors"
              >
                Export Notes
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={() =>
                    setImportConfirmation({
                      isOpen: false,
                      onConfirm: () => {},
                    })
                  }
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    importConfirmation.onConfirm({ mode: "merge" });
                    setImportConfirmation({
                      isOpen: false,
                      onConfirm: () => {},
                    });
                  }}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  Import & Merge
                </button>
                <button
                  onClick={() => {
                    importConfirmation.onConfirm({ mode: "overwrite" });
                    setImportConfirmation({
                      isOpen: false,
                      onConfirm: () => {},
                    });
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Import & Overwrite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Notes Confirmation Dialog */}
      {clearConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4 text-red-600">
              ⚠️ Clear All Notes?
            </h3>
            <p className="text-gray-600 mb-6">
              This will <b>permanently delete</b> all notes for all questions
              and cannot be undone. Are you sure?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setClearConfirmation(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAllNotesConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirm & Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* URL导入对话框 */}
      {showUrlDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              Import Notes from URL
            </h3>
            <input
              type="url"
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              placeholder="Enter the URL of the notes file"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowUrlDialog(false);
                  setImportUrl("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUrlImportConfirm}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesSection;
