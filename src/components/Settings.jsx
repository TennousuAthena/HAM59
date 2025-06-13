import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  refreshRandomSeed,
  exportAllData,
  importAllDataFromFile,
  clearAllData,
  getDataStatistics,
  exportNotes,
  importNotesFromFile,
  clearAllNotes,
  importSimpleNotes,
  importDetailedNotes,
} from "../utils/utils";

const Settings = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const notesFileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [importMode, setImportMode] = useState("overwrite");
  const [stats, setStats] = useState(getDataStatistics());

  const handleRefreshSeed = () => {
    refreshRandomSeed();
    setImportMessage("随机种子已重新生成，页面将自动刷新");
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleExportAllData = () => {
    try {
      exportAllData();
      setImportMessage("全部数据导出成功！");
      setTimeout(() => setImportMessage(""), 3000);
    } catch (error) {
      setImportMessage(`导出失败：${error.message}`);
      setTimeout(() => setImportMessage(""), 3000);
    }
  };

  const handleImportAllData = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImporting(true);
    setImportMessage("");

    try {
      const result = await importAllDataFromFile(file, { mode: importMode });
      setImportMessage(
        `导入成功！共导入 ${result.importCount} 类数据。` +
          (result.exportDate
            ? ` (导出时间: ${new Date(result.exportDate).toLocaleString()})`
            : "")
      );
      setStats(getDataStatistics());
      setTimeout(() => setImportMessage(""), 5000);
    } catch (error) {
      setImportMessage(`导入失败：${error.message}`);
      setTimeout(() => setImportMessage(""), 5000);
    } finally {
      setImporting(false);
      event.target.value = "";
    }
  };

  const handleClearAllData = () => {
    setConfirmAction(() => () => {
      clearAllData();
      setImportMessage("所有数据已清除！");
      setStats(getDataStatistics());
      setTimeout(() => setImportMessage(""), 3000);
      setShowConfirm(false);
    });
    setShowConfirm(true);
  };

  const handleExportNotes = () => {
    try {
      exportNotes();
      setImportMessage("笔记导出成功！");
      setTimeout(() => setImportMessage(""), 3000);
    } catch (error) {
      setImportMessage(`笔记导出失败：${error.message}`);
      setTimeout(() => setImportMessage(""), 3000);
    }
  };

  const handleImportNotes = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImporting(true);
    try {
      const count = await importNotesFromFile(file, { mode: importMode });
      setImportMessage(`笔记导入成功！共导入 ${count} 条笔记。`);
      setStats(getDataStatistics());
      setTimeout(() => setImportMessage(""), 3000);
    } catch (error) {
      setImportMessage(`笔记导入失败：${error.message}`);
      setTimeout(() => setImportMessage(""), 3000);
    } finally {
      setImporting(false);
      event.target.value = "";
    }
  };

  const handleImportSimpleNotes = async () => {
    setImporting(true);
    try {
      const count = await importSimpleNotes({ mode: importMode });
      setImportMessage(`精简助记导入成功！共导入 ${count} 条笔记。`);
      setStats(getDataStatistics());
      setTimeout(() => setImportMessage(""), 3000);
    } catch (error) {
      setImportMessage(`精简助记导入失败：${error.message}`);
      setTimeout(() => setImportMessage(""), 3000);
    } finally {
      setImporting(false);
    }
  };

  const handleImportDetailedNotes = () => {
    setImporting(true);
    try {
      const count = importDetailedNotes({ mode: importMode });
      setImportMessage(`详细助记导入成功！共导入 ${count} 条笔记。`);
      setStats(getDataStatistics());
      setTimeout(() => setImportMessage(""), 3000);
    } catch (error) {
      setImportMessage(`详细助记导入失败：${error.message}`);
      setTimeout(() => setImportMessage(""), 3000);
    } finally {
      setImporting(false);
    }
  };

  const handleClearNotes = () => {
    setConfirmAction(() => () => {
      clearAllNotes();
      setImportMessage("所有笔记已清除！");
      setStats(getDataStatistics());
      setTimeout(() => setImportMessage(""), 3000);
      setShowConfirm(false);
    });
    setShowConfirm(true);
  };

  const ConfirmModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
        <h3 className="text-lg font-bold mb-4">确认操作</h3>
        <p className="text-gray-600 mb-6">此操作不可撤销，确定要继续吗？</p>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowConfirm(false)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            取消
          </button>
          <button
            onClick={confirmAction}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">⚙️ 设置</h1>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            返回
          </button>
        </div>

        {importMessage && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              importMessage.includes("失败")
                ? "bg-red-100 text-red-700 border border-red-300"
                : "bg-green-100 text-green-700 border border-green-300"
            }`}
          >
            {importMessage}
          </div>
        )}

        {/* 数据统计 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">📊 数据统计</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded">
              <div className="font-semibold text-blue-800">答题记录</div>
              <div className="text-blue-600">{stats.userAnswers} 条</div>
            </div>
            <div className="bg-red-50 p-3 rounded">
              <div className="font-semibold text-red-800">错题记录</div>
              <div className="text-red-600">{stats.wrongAnswers} 条</div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="font-semibold text-green-800">笔记记录</div>
              <div className="text-green-600">{stats.questionNotes} 条</div>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <div className="font-semibold text-purple-800">练习进度</div>
              <div className="text-purple-600">{stats.practiceProgress} 条</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded">
              <div className="font-semibold text-yellow-800">随机种子</div>
              <div className="text-yellow-600">
                {stats.hasRandomSeed ? "已设置" : "未设置"}
              </div>
            </div>
            <div className="bg-orange-50 p-3 rounded">
              <div className="font-semibold text-orange-800">考试种子</div>
              <div className="text-orange-600">
                {stats.hasExamRandomSeed ? "已设置" : "未设置"}
              </div>
            </div>
          </div>
        </div>

        {/* 随机顺序设置 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">🎲 随机顺序设置</h2>
          <p className="text-gray-600 mb-4">
            重新生成随机种子会改变题目和选项的显示顺序，用于获得不同的练习体验。
          </p>
          <button
            onClick={handleRefreshSeed}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            🎲 重新打乱顺序
          </button>
        </div>

        {/* 导入模式设置 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">📥 导入模式设置</h2>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="radio"
                name="importMode"
                value="overwrite"
                checked={importMode === "overwrite"}
                onChange={(e) => setImportMode(e.target.value)}
                className="mr-2"
              />
              <span className="font-semibold">覆盖模式</span>
              <span className="text-gray-600 ml-2">- 完全替换现有数据</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="importMode"
                value="merge"
                checked={importMode === "merge"}
                onChange={(e) => setImportMode(e.target.value)}
                className="mr-2"
              />
              <span className="font-semibold">合并模式</span>
              <span className="text-gray-600 ml-2">- 与现有数据合并</span>
            </label>
          </div>
        </div>

        {/* 全部数据管理 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">💾 全部数据管理</h2>
          <p className="text-gray-600 mb-4">
            包含所有答题记录、错题记录、笔记、练习进度和随机种子。
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleExportAllData}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              📤 导出全部数据
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-400"
            >
              📥 导入全部数据
            </button>
            <button
              onClick={handleClearAllData}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              🗑️ 清除全部数据
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportAllData}
            className="hidden"
          />
        </div>

        {/* 笔记管理 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">📝 笔记管理</h2>
          <p className="text-gray-600 mb-4">专门管理题目笔记和助记内容。</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-3">笔记导入/导出</h3>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={handleExportNotes}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  📤 导出笔记
                </button>
                <button
                  onClick={() => notesFileInputRef.current?.click()}
                  disabled={importing}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:bg-gray-400"
                >
                  📥 导入笔记文件
                </button>
                <input
                  ref={notesFileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportNotes}
                  className="hidden"
                />
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">笔记管理</h3>
              <div className="flex flex-col space-y-2">
                {/* <button
                  onClick={handleImportSimpleNotes}
                  disabled={importing}
                  className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors disabled:bg-gray-400"
                >
                  📋 导入精简助记
                </button>
                <button
                  onClick={handleImportDetailedNotes}
                  disabled={importing}
                  className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors disabled:bg-gray-400"
                >
                  📚 导入详细助记
                </button> */}
                <button
                  onClick={handleClearNotes}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  🗑️ 清除所有笔记
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showConfirm && <ConfirmModal />}
    </div>
  );
};

export default Settings;
