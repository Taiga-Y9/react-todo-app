import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import type { Goal, GoalMap, SortOption, FilterOptions } from "./types";
import { getRootGoals, generateId, getAllTags, calculateStatistics, filterGoals } from "./utils";
import LeafGoalsList from "./LeafGoalsList";
import GoalItem from "./GoalItem";
import GoalEditor from "./GoalEditor";
import SearchFilter from "./SearchFilter";
import StatisticsDashboard from "./StatisticsDashboard";

const App = () => {
  const [goals, setGoals] = useState<GoalMap>({});
  const [sortOptions, setSortOptions] = useState<{ [goalId: string]: SortOption }>({});
  const [showAddRoot, setShowAddRoot] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [draggedGoalId, setDraggedGoalId] = useState<string | null>(null);
  
  // フィルター状態
  const [filter, setFilter] = useState<FilterOptions>({
    searchText: "",
    tags: [],
    isDone: null,
    importance: null,
    overdueOnly: false,
  });

  const localStorageKey = "HierarchicalGoalApp";

  // ローカルストレージから復元
  useEffect(() => {
    const storedData = localStorage.getItem(localStorageKey);
    if (storedData) {
      const parsed = JSON.parse(storedData);
      const converted: GoalMap = {};
      Object.keys(parsed).forEach((id) => {
        converted[id] = {
          ...parsed[id],
          startDate: parsed[id].startDate ? new Date(parsed[id].startDate) : null,
          deadline: parsed[id].deadline ? new Date(parsed[id].deadline) : null,
          tags: parsed[id].tags || [],
          order: parsed[id].order !== undefined ? parsed[id].order : 0,
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

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...updates },
    }));
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => {
      const goal = prev[id];
      if (!goal) return prev;

      const updated = { ...prev };

      // 親から自分を削除
      if (goal.parentId) {
        const parent = updated[goal.parentId];
        if (parent) {
          updated[goal.parentId] = {
            ...parent,
            childIds: parent.childIds.filter((childId) => childId !== id),
          };
        }
      }

      // 子孫を再帰的に削除
      const deleteRecursive = (goalId: string) => {
        const g = updated[goalId];
        if (g) {
          g.childIds.forEach((childId) => deleteRecursive(childId));
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

    setGoals((prev) => {
      const updated = { ...prev };

      // 自分と子孫全てを同じ状態に
      const updateRecursive = (goalId: string, isDone: boolean) => {
        const g = updated[goalId];
        if (g) {
          updated[goalId] = { ...g, isDone };
          g.childIds.forEach((childId) => updateRecursive(childId, isDone));
        }
      };

      updateRecursive(id, newIsDone);
      return updated;
    });
  };

  const toggleExpanded = (id: string) => {
    updateGoal(id, { isExpanded: !goals[id].isExpanded });
  };

  const addGoal = (parentId: string | null, goalData: {
    name: string;
    importance: number;
    startDate: Date | null;
    deadline: Date | null;
    tags: string[];
  }) => {
    const siblings = parentId 
      ? (goals[parentId]?.childIds || [])
      : getRootGoals(goals).map(g => g.id);
    
    const maxOrder = siblings.length > 0
      ? Math.max(...siblings.map(id => goals[id]?.order || 0))
      : -1;

    const newGoal: Goal = {
      id: generateId(),
      name: goalData.name,
      isDone: false,
      importance: goalData.importance,
      startDate: goalData.startDate,
      deadline: goalData.deadline,
      parentId,
      childIds: [],
      isExpanded: true,
      tags: goalData.tags,
      order: maxOrder + 1,
    };

    setGoals((prev) => {
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

  // ドラッグ&ドロップ処理
  const handleDragStart = (e: React.DragEvent, goalId: string) => {
    setDraggedGoalId(goalId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetGoalId: string) => {
    e.preventDefault();
    
    if (!draggedGoalId || draggedGoalId === targetGoalId) {
      setDraggedGoalId(null);
      return;
    }

    const draggedGoal = goals[draggedGoalId];
    const targetGoal = goals[targetGoalId];
    
    if (!draggedGoal || !targetGoal) {
      setDraggedGoalId(null);
      return;
    }

    // 同じ親を持つ場合のみ並び替え
    if (draggedGoal.parentId === targetGoal.parentId) {
      setGoals(prev => {
        const updated = { ...prev };
        const draggedOrder = draggedGoal.order;
        const targetOrder = targetGoal.order;

        // 順序を入れ替え
        updated[draggedGoalId] = { ...draggedGoal, order: targetOrder };
        updated[targetGoalId] = { ...targetGoal, order: draggedOrder };

        return updated;
      });
    }

    setDraggedGoalId(null);
  };

  // 統計計算
  const statistics = calculateStatistics(goals);
  const availableTags = getAllTags(goals);
  
  // フィルタリング適用
  const rootGoals = getRootGoals(goals);
  const filteredRootGoals = filterGoals(rootGoals, filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            目標管理
          </h1>
          <p className="text-slate-600">
            大きな目標を小さなステップに分解して、着実に達成しましょう
          </p>
        </div>

        {/* 統計ダッシュボード */}
        <StatisticsDashboard statistics={statistics} />

        {/* 検索・フィルター */}
        <SearchFilter
          filter={filter}
          onFilterChange={setFilter}
          availableTags={availableTags}
        />

        {/* 末端タスク一覧 */}
        <LeafGoalsList goals={goals} toggleDone={toggleDone} />

        {/* メイン目標リスト */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-800">
              大きな目標
              {filteredRootGoals.length !== rootGoals.length && (
                <span className="ml-2 text-sm text-slate-500">
                  ({filteredRootGoals.length} / {rootGoals.length})
                </span>
              )}
            </h2>
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
              availableTags={availableTags}
              onSave={(name, importance, startDate, deadline, tags) => {
                addGoal(null, { name, importance, startDate, deadline, tags });
                setShowAddRoot(false);
              }}
              onCancel={() => setShowAddRoot(false)}
            />
          )}

          <div className="space-y-3">
            {filteredRootGoals.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                {rootGoals.length === 0 
                  ? "まだ目標がありません。「新しい大きな目標」ボタンから追加してください。"
                  : "フィルター条件に一致する目標がありません。"}
              </div>
            ) : (
              filteredRootGoals
                .sort((a, b) => a.order - b.order)
                .map((goal) => (
                  <GoalItem
                    key={goal.id}
                    goal={goal}
                    goals={goals}
                    availableTags={availableTags}
                    onUpdate={updateGoal}
                    onDelete={deleteGoal}
                    onToggleDone={toggleDone}
                    onToggleExpanded={toggleExpanded}
                    onAddChild={addGoal}
                    sortBy={sortOptions[goal.id] || "order"}
                    onSortChange={(sortBy) =>
                      setSortOptions((prev) => ({ ...prev, [goal.id]: sortBy }))
                    }
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  />
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;