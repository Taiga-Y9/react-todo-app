import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Calendar,
  GripVertical,
} from "lucide-react";
import type { Goal, GoalMap, SortOption } from "./types";
import { calculateProgress, sortGoals, isOverdue } from "./utils";
import GoalEditor from "./GoalEditor";

type Props = {
  goal: Goal;
  goals: GoalMap;
  availableTags: string[];
  onUpdate: (id: string, updates: Partial<Goal>) => void;
  onDelete: (id: string) => void;
  onToggleDone: (id: string) => void;
  onToggleExpanded: (id: string) => void;
  onAddChild: (parentId: string, goalData: {
    name: string;
    importance: number;
    startDate: Date | null;
    deadline: Date | null;
    tags: string[];
  }) => void;
  sortBy: SortOption;
  onSortChange: (sortBy: SortOption) => void;
  onDragStart?: (e: React.DragEvent, goalId: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetGoalId: string) => void;
  depth?: number;
};

const GoalItem = (props: Props) => {
  const {
    goal,
    goals,
    availableTags,
    onUpdate,
    onDelete,
    onToggleDone,
    onToggleExpanded,
    onAddChild,
    sortBy,
    onSortChange,
    onDragStart,
    onDragOver,
    onDrop,
    depth = 0,
  } = props;

  const [isEditing, setIsEditing] = useState(!goal.name);
  const [showAddChild, setShowAddChild] = useState(false);

  const progress = calculateProgress(goal.id, goals);
  const hasChildren = goal.childIds.length > 0;
  const overdue = isOverdue(goal);

  const childGoals = goal.childIds.map((id) => goals[id]).filter(Boolean);
  const sortedChildren = sortGoals(childGoals, goals, sortBy);

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <div 
        className="p-4 bg-white hover:bg-slate-50 transition-colors"
        draggable={!isEditing}
        onDragStart={(e) => onDragStart?.(e, goal.id)}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop?.(e, goal.id)}
      >
        <div className="flex items-start gap-3">
          {/* ドラッグハンドル */}
          <div className="mt-1 text-slate-300 hover:text-slate-500 cursor-move">
            <GripVertical size={20} />
          </div>

          {/* 展開/折りたたみボタン */}
          {hasChildren && (
            <button
              onClick={() => onToggleExpanded(goal.id)}
              className="mt-1 text-slate-400 hover:text-slate-600"
            >
              {goal.isExpanded ? (
                <ChevronDown size={20} />
              ) : (
                <ChevronRight size={20} />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-5" />}

          {/* チェックボックス */}
          <input
            type="checkbox"
            checked={goal.isDone}
            onChange={() => onToggleDone(goal.id)}
            className="mt-1 w-5 h-5 rounded border-slate-300"
          />

          {/* メインコンテンツ */}
          <div className="flex-1">
            {isEditing ? (
              <GoalEditor
                goal={goal}
                availableTags={availableTags}
                onSave={(name, importance, startDate, deadline, tags) => {
                  onUpdate(goal.id, { name, importance, startDate, deadline, tags });
                  setIsEditing(false);
                }}
                onCancel={() => {
                  if (!goal.name) {
                    onDelete(goal.id);
                  } else {
                    setIsEditing(false);
                  }
                }}
              />
            ) : (
              <>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3
                      className={`text-lg font-medium ${
                        goal.isDone
                          ? "text-slate-400 line-through"
                          : overdue
                          ? "text-red-600"
                          : "text-slate-800"
                      }`}
                    >
                      {goal.name}
                      {overdue && (
                        <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                          期限切れ
                        </span>
                      )}
                    </h3>
                    
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                      {goal.deadline && (
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {goal.deadline.toLocaleDateString("ja-JP")}
                        </span>
                      )}
                      <div className="flex items-center gap-1">
                        重要度:
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < goal.importance
                                ? "bg-orange-400"
                                : "bg-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* タグ表示 */}
                    {goal.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {goal.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1 text-sm text-slate-600 hover:bg-slate-100 rounded transition-colors"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => onDelete(goal.id)}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* プログレスバー */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>進捗</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* アクションボタン */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddChild(true)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors"
                  >
                    <Plus size={14} />
                    サブ目標を追加
                  </button>

                  {hasChildren && (
                    <select
                      value={sortBy}
                      onChange={(e) =>
                        onSortChange(e.target.value as SortOption)
                      }
                      className="px-2 py-1.5 text-sm border border-slate-300 rounded"
                    >
                      <option value="order">並び順</option>
                      <option value="deadline">期限順</option>
                      <option value="importance">重要度順</option>
                      <option value="progress">進捗順</option>
                    </select>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 子目標追加フォーム */}
        {showAddChild && !isEditing && (
          <div className="mt-4 ml-8">
            <GoalEditor
              goal={null}
              availableTags={availableTags}
              onSave={(name, importance, startDate, deadline, tags) => {
                onAddChild(goal.id, { name, importance, startDate, deadline, tags });
                setShowAddChild(false);
              }}
              onCancel={() => setShowAddChild(false)}
            />
          </div>
        )}
      </div>

      {/* 子目標リスト */}
      {hasChildren && goal.isExpanded && (
        <div className="bg-slate-50 border-t border-slate-200">
          <div className="pl-8 pr-4 py-3 space-y-3">
            {sortedChildren.map((child) => (
              <GoalItem
                key={child.id}
                goal={child}
                goals={goals}
                availableTags={availableTags}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onToggleDone={onToggleDone}
                onToggleExpanded={onToggleExpanded}
                onAddChild={onAddChild}
                sortBy={sortBy}
                onSortChange={onSortChange}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDrop={onDrop}
                depth={depth + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalItem;