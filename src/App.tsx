import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import type { Goal, GoalMap, SortOption } from "./types";
import { getRootGoals, generateId } from "./utils";
import LeafGoalsList from "./LeafGoalsList";
import GoalItem from "./GoalItem";
import GoalEditor from "./GoalEditor";

const App = () => {
  const [goals, setGoals] = useState<GoalMap>({});
  const [sortOptions, setSortOptions] = useState<{ [goalId: string]: SortOption }>({});
  const [showAddRoot, setShowAddRoot] = useState(false);
  const [initialized, setInitialized] = useState(false);

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
          startDate: parsed[id].startDate ? new Date(parsed[id].startDate) : null, // Date型に変換
          deadline: parsed[id].deadline ? new Date(parsed[id].deadline) : null, // Date型に変換
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
  }) => {
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

        {/* 末端タスク一覧 */}
        <LeafGoalsList goals={goals} toggleDone={toggleDone} />

        {/* メイン目標リスト */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-800">
              大きな目標
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
              onSave={(name, importance, startDate, deadline) => {
                addGoal(null, { name, importance, startDate, deadline });
                setShowAddRoot(false);
              }}
              onCancel={() => setShowAddRoot(false)}
            />
          )}

          <div className="space-y-3">
            {getRootGoals(goals).map((goal) => (
              <GoalItem
                key={goal.id}
                goal={goal}
                goals={goals}
                onUpdate={updateGoal}
                onDelete={deleteGoal}
                onToggleDone={toggleDone}
                onToggleExpanded={toggleExpanded}
                sortBy={sortOptions[goal.id] || "none"}
                onSortChange={(sortBy) =>
                  setSortOptions((prev) => ({ ...prev, [goal.id]: sortBy }))
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;