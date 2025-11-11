import React, { useState } from "react";
import type { Goal } from "./types";

type Props = {
  goal: Goal | null;
  onSave: (
    name: string,
    importance: number,
    startDate: Date | null,
    deadline: Date | null
  ) => void;
  onCancel: () => void;
};

const GoalEditor = (props: Props) => {
  const { goal, onSave, onCancel } = props;
  
  const [name, setName] = useState(goal?.name || "");
  const [importance, setImportance] = useState(goal?.importance || 3);
  const [startDate, setStartDate] = useState(
    goal?.startDate ? goal.startDate.toISOString().slice(0, 16) : ""
  );
  const [deadline, setDeadline] = useState(
    goal?.deadline ? goal.deadline.toISOString().slice(0, 16) : ""
  );

  const handleSubmit = () => {
    if (!name.trim()) return;
    
    onSave(
      name,
      importance,
      startDate ? new Date(startDate) : null,
      deadline ? new Date(deadline) : null
    );
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