import React, { useState } from "react";
import { X } from "lucide-react";
import type { Goal } from "./types";

type Props = {
  goal: Goal | null;
  availableTags: string[];
  onSave: (
    name: string,
    importance: number,
    startDate: Date | null,
    deadline: Date | null,
    tags: string[]
  ) => void;
  onCancel: () => void;
};

const GoalEditor = (props: Props) => {
  const { goal, availableTags, onSave, onCancel } = props;
  
  const [name, setName] = useState(goal?.name || "");
  const [importance, setImportance] = useState(goal?.importance || 3);
  const [startDate, setStartDate] = useState(
    goal?.startDate ? goal.startDate.toISOString().slice(0, 16) : ""
  );
  const [deadline, setDeadline] = useState(
    goal?.deadline ? goal.deadline.toISOString().slice(0, 16) : ""
  );
  const [tags, setTags] = useState<string[]>(goal?.tags || []);
  const [newTag, setNewTag] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) return;
    
    onSave(
      name,
      importance,
      startDate ? new Date(startDate) : null,
      deadline ? new Date(deadline) : null,
      tags
    );
  };

  const addTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const toggleExistingTag = (tag: string) => {
    if (tags.includes(tag)) {
      removeTag(tag);
    } else {
      setTags([...tags, tag]);
    }
  };

  return (
    <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="目標名を入力..."
        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        autoFocus
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            開始日（任意）
          </label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            期限
          </label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          重要度: {importance}
        </label>
        <input
          type="range"
          min="1"
          max="5"
          value={importance}
          onChange={(e) => setImportance(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>低</span>
          <span>高</span>
        </div>
      </div>

      {/* タグ入力 */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          タグ
        </label>
        
        {/* 選択済みタグ */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map(tag => (
              <div
                key={tag}
                className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                #{tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="hover:text-blue-900"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 新しいタグ入力 */}
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTag()}
            placeholder="新しいタグを追加..."
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
          <button
            onClick={addTag}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 text-sm"
          >
            追加
          </button>
        </div>

        {/* 既存タグから選択 */}
        {availableTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {availableTags
              .filter(tag => !tags.includes(tag))
              .slice(0, 8)
              .map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleExistingTag(tag)}
                  className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs hover:bg-slate-200"
                >
                  #{tag}
                </button>
              ))}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          保存
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
};

export default GoalEditor;