import React, { useState, useEffect } from 'react';
import { saveNote, getNote } from '../utils/utils';

const NotesSection = ({ questionId }) => {
  const [note, setNote] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const savedNote = getNote(questionId);
    setNote(savedNote);
    setIsExpanded(!!savedNote);
  }, [questionId]);

  const handleSaveNote = () => {
    saveNote(questionId, note);
  };

  const handleClearNote = () => {
    setNote('');
    saveNote(questionId, '');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 transition-colors"
        >
          <span className="text-lg">📝</span>
          <span className="font-medium">我的笔记</span>
          <span className="text-sm text-gray-500">
            {isExpanded ? '收起' : '展开'}
          </span>
        </button>
        
        {note && (
          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
            已保存
          </span>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-3">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="在此记录你的学习笔记、解题思路或重点知识..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={4}
          />
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleClearNote}
              className="px-3 py-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
            >
              清空
            </button>
            <button
              onClick={handleSaveNote}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
            >
              保存笔记
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesSection;