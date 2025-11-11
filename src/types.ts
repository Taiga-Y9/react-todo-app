import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, Check, Target, Calendar, TrendingUp } from 'lucide-react';

// 型定義
type Goal = {
  id: string;
  name: string;
  isDone: boolean;
  importance: number;
  startDate: Date | null;
  deadline: Date | null;
  parentId: string | null;
  childIds: string[];
  isExpanded: boolean;
};

type GoalMap = { [id: string]: Goal };

type SortOption = 'deadline' | 'importance' | 'progress' | 'none';

// ユーティリティ関数
const generateId = () => Math.random().toString(36).substr(2, 9);

const calculateProgress = (goalId: string, goals: GoalMap): number => {
  const goal = goals[goalId];
  if (!goal) return 0;
  
  if (goal.childIds.length === 0) {
    return goal.isDone ? 100 : 0;
  }
  
  const childProgresses = goal.childIds.map(childId => calculateProgress(childId, goals));
  return childProgresses.reduce((sum, progress) => sum + progress, 0) / goal.childIds.length;
};

const getLeafGoals = (goals: GoalMap): Goal[] => {
  return Object.values(goals).filter(goal => 
    goal.childIds.length === 0 && !goal.isDone
  );
};

const getRootGoals = (goals: GoalMap): Goal[] => {
  return Object.values(goals).filter(goal => goal.parentId === null);
};

const sortGoals = (goals: Goal[], goalsMap: GoalMap, sortBy: SortOption): Goal[] => {
  if (sortBy === 'none') return goals;
  
  return [...goals].sort((a, b) => {
    switch (sortBy) {
      case 'deadline':
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return a.deadline.getTime() - b.deadline.getTime();
      
      case 'importance':
        return b.importance - a.importance;
      
      case 'progress':
        const progressA = calculateProgress(a.id, goalsMap);
        const progressB = calculateProgress(b.id, goalsMap);
        return progressA - progressB;
      
      default:
        return 0;
    }
  });
};

const App = () => {
  const [goals, setGoals] = useState<GoalMap>({});
  const [sortOptions, setSortOptions] = useState<{ [goalId: string]: SortOption }>({});
  const [showAddRoot, setShowAddRoot] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const localStorageKey = 'HierarchicalGoalApp';

  // ローカルストレージから復元
  useEffect(() => {
    const storedData = localStorage.getItem(localStorageKey);
    if (storedData) {
      const parsed = JSON.parse(storedData);
      const converted: GoalMap = {};
      Object.keys(parsed).forEach(id => {
        converted[id] = {
          ...parsed[id],
          startDate: parsed[id].startDate ? new Date(parsed[id].startDate) : null,
          deadline: parsed[id].deadline ? new Date(parsed[id].deadline) : null,
        };
      });
      setGoals(converted);
    }
    setInitialized(true);
  }, []);

  // ローカルストレージに保存
  useEffect(() => {
    if (initialized) {
      localStorage.setItem(localStorageKey, JSON.stringify(goals));
    }
  }, [goals, initialized]);

  const addGoal = (parentId: string | null) => {
    const newGoal: Goal = {
      id: generateId(),
      name: '',
      isDone: false,
      importance: 3,
      startDate: null,
      deadline: null,
      parentId,
      childIds: [],
      isExpanded: true,
    };

    setGoals(prev => {
      const updated = { ...prev, [newGoal.id]: newGoal };
      
      if (parentId) {
        const parent = updated[parentId];
        if (parent) {
          updated[parentId] = {
            ...parent,
            childIds: [...parent.childIds, newGoal.id],
          };
        }
      }
      
      return updated;
    });
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates },
    }));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => {
      const goal = prev[id];
      if (!goal) return prev;

      const updated = { ...prev };
      
      // 親から自分を削除
      if (goal.parentId) {
        const parent = updated[goal.parentId];
        if (parent) {
          updated[goal.parentId] = {
            ...parent,
            childIds: parent.childIds.filter(childId => childId !== id),
          };
        }
      }

      // 子孫を再帰的に削除
      const deleteRecursive = (goalId: string) => {
        const g = updated[goalId];
        if (g) {
          g.childIds.forEach(childId => deleteRecursive(childId));
          delete updated[goalId];
        }
      };

      deleteRecursive(id);
      return updated;
    });
  };

  const toggleDone = (id: string) => {
    const goal = goals[id];
    if (!goal) return;

    const newIsDone = !goal.isDone;
    
    setGoals(prev => {
      const updated = { ...prev };
      
      // 自分と子孫全てを同じ状態に
      const updateRecursive = (goalId: string, isDone: boolean) => {
        const g = updated[goalId];
        if (g) {
          updated[goalId] = { ...g, isDone };
          g.childIds.forEach(childId => updateRecursive(childId, isDone));
        }
      };
      
      updateRecursive(id, newIsDone);
      return updated;
    });
  };

  const toggleExpanded = (id: string) => {
    updateGoal(id, { isExpanded: !goals[id].isExpanded });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">目標管理</h1>
          <p className="text-slate-600">大きな目標を小さなステップに分解して、着実に達成しましょう</p>
        </div>

        {/* 末端タスク一覧 */}
        <LeafGoalsList goals={goals} toggleDone={toggleDone} />

        {/* メイン目標リスト */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-800">大きな目標</h2>
            <button
              onClick={() => setShowAddRoot(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus size={18} />
              新しい大きな目標
            </button>
          </div>

          {showAddRoot && (
            <GoalEditor
              goal={null}
              onSave={(name, importance, startDate, deadline) => {
                const newGoal: Goal = {
                  id: generateId(),
                  name,
                  isDone: false,
                  importance,
                  startDate,
                  deadline,
                  parentId: null,
                  childIds: [],
                  isExpanded: true,
                };
                setGoals(prev => ({ ...prev, [newGoal.id]: newGoal }));
                setShowAddRoot(false);
              }}
              onCancel={() => setShowAddRoot(false)}
            />
          )}

          <div className="space-y-3">
            {sortGoals(getRootGoals(goals), goals, 'none').map(goal => (
              <GoalItem
                key={goal.id}
                goal={goal}
                goals={goals}
                onUpdate={updateGoal}
                onDelete={deleteGoal}
                onToggleDone={toggleDone}
                onToggleExpanded={toggleExpanded}
                onAddChild={() => addGoal(goal.id)}
                sortBy={sortOptions[goal.id] || 'none'}
                onSortChange={(sortBy) => setSortOptions(prev => ({ ...prev, [goal.id]: sortBy }))}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 末端タスク一覧コンポーネント
const LeafGoalsList: React.FC<{
  goals: GoalMap;
  toggleDone: (id: string) => void;
}> = ({ goals, toggleDone }) => {
  const leafGoals = getLeafGoals(goals);
  
  if (leafGoals.length === 0) return null;

  // 親の目標でグループ化
  const groupedByRoot: { [rootId: string]: Goal[] } = {};
  
  leafGoals.forEach(leaf => {
    let current = leaf;
    while (current.parentId) {
      current = goals[current.parentId];
    }
    if (!groupedByRoot[current.id]) {
      groupedByRoot[current.id] = [];
    }
    groupedByRoot[current.id].push(leaf);
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Target size={20} />
        今取り組むべきタスク
      </h2>
      
      {Object.entries(groupedByRoot).map(([rootId, leaves]) => {
        const rootGoal = goals[rootId];
        if (!rootGoal) return null;
        
        return (
          <div key={rootId} className="mb-4 last:mb-0">
            <div className="text-sm font-medium text-slate-600 mb-2">{rootGoal.name}</div>
            <div className="space-y-2 pl-4">
              {leaves
                .sort((a, b) => {
                  if (!a.deadline && !b.deadline) return 0;
                  if (!a.deadline) return 1;
                  if (!b.deadline) return -1;
                  return a.deadline.getTime() - b.deadline.getTime();
                })
                .map(leaf => (
                  <div key={leaf.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={leaf.isDone}
                      onChange={() => toggleDone(leaf.id)}
                      className="w-5 h-5 rounded border-slate-300"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-slate-700">{leaf.name}</div>
                      {leaf.deadline && (
                        <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                          <Calendar size={14} />
                          期限: {leaf.deadline.toLocaleDateString('ja-JP')}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < leaf.importance ? 'bg-orange-400' : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// 目標アイテムコンポーネント
const GoalItem: React.FC<{
  goal: Goal;
  goals: GoalMap;
  onUpdate: (id: string, updates: Partial<Goal>) => void;
  onDelete: (id: string) => void;
  onToggleDone: (id: string) => void;
  onToggleExpanded: (id: string) => void;
  onAddChild: () => void;
  sortBy: SortOption;
  onSortChange: (sortBy: SortOption) => void;
  depth?: number;
}> = ({ goal, goals, onUpdate, onDelete, onToggleDone, onToggleExpanded, onAddChild, sortBy, onSortChange, depth = 0 }) => {
  const [isEditing, setIsEditing] = useState(!goal.name);
  const [showAddChild, setShowAddChild] = useState(false);
  
  const progress = calculateProgress(goal.id, goals);
  const hasChildren = goal.childIds.length > 0;

  const childGoals = goal.childIds.map(id => goals[id]).filter(Boolean);
  const sortedChildren = sortGoals(childGoals, goals, sortBy);

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <div className="p-4 bg-white hover:bg-slate-50 transition-colors">
        <div className="flex items-start gap-3">
          {/* 展開/折りたたみボタン */}
          {hasChildren && (
            <button
              onClick={() => onToggleExpanded(goal.id)}
              className="mt-1 text-slate-400 hover:text-slate-600"
            >
              {goal.isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
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
                onSave={(name, importance, startDate, deadline) => {
                  onUpdate(goal.id, { name, importance, startDate, deadline });
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
                        goal.isDone ? 'text-slate-400 line-through' : 'text-slate-800'
                      }`}
                    >
                      {goal.name}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                      {goal.deadline && (
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {goal.deadline.toLocaleDateString('ja-JP')}
                        </span>
                      )}
                      <div className="flex items-center gap-1">
                        重要度:
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < goal.importance ? 'bg-orange-400' : 'bg-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
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
                      onChange={(e) => onSortChange(e.target.value as SortOption)}
                      className="px-2 py-1.5 text-sm border border-slate-300 rounded"
                    >
                      <option value="none">並び替え</option>
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
              onSave={(name, importance, startDate, deadline) => {
                const newGoal: Goal = {
                  id: generateId(),
                  name,
                  isDone: false,
                  importance,
                  startDate,
                  deadline,
                  parentId: goal.id,
                  childIds: [],
                  isExpanded: true,
                };
                onUpdate(goal.id, {
                  childIds: [...goal.childIds, newGoal.id],
                });
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
            {sortedChildren.map(child => (
              <GoalItem
                key={child.id}
                goal={child}
                goals={goals}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onToggleDone={onToggleDone}
                onToggleExpanded={onToggleExpanded}
                onAddChild={onAddChild}
                sortBy={sortBy}
                onSortChange={onSortChange}
                depth={depth + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// 目標編集フォームコンポーネント
const GoalEditor: React.FC<{
  goal: Goal | null;
  onSave: (name: string, importance: number, startDate: Date | null, deadline: Date | null) => void;
  onCancel: () => void;
}> = ({ goal, onSave, onCancel }) => {
  const [name, setName] = useState(goal?.name || '');
  const [importance, setImportance] = useState(goal?.importance || 3);
  const [startDate, setStartDate] = useState(
    goal?.startDate ? goal.startDate.toISOString().slice(0, 16) : ''
  );
  const [deadline, setDeadline] = useState(
    goal?.deadline ? goal.deadline.toISOString().slice(0, 16) : ''
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

export default App;