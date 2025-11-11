import React from "react";
import { Target, Calendar } from "lucide-react";
import type { GoalMap, Goal } from "./types";

type Props = {
  goals: GoalMap;
  toggleDone: (id: string) => void;
};

const LeafGoalsList = (props: Props) => {
  const { goals, toggleDone } = props;
  
  // 末端（子を持たない）の未完了目標を取得
  const leafGoals = Object.values(goals).filter(
    (goal) => goal.childIds.length === 0 && !goal.isDone
  );
  
  if (leafGoals.length === 0) return null;

  // 親の大きな目標でグループ化
  const groupedByRoot: { [rootId: string]: Goal[] } = {};
  
  leafGoals.forEach((leaf) => {
    let current = leaf;
    // ルートまで遡る
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
            <div className="text-sm font-medium text-slate-600 mb-2">
              {rootGoal.name}
            </div>
            <div className="space-y-2 pl-4">
              {leaves
                .sort((a, b) => {
                  if (!a.deadline && !b.deadline) return 0;
                  if (!a.deadline) return 1;
                  if (!b.deadline) return -1;
                  return a.deadline.getTime() - b.deadline.getTime();
                })
                .map((leaf) => (
                  <div
                    key={leaf.id}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                  >
                    <input
                      type="checkbox"
                      checked={leaf.isDone}
                      onChange={() => toggleDone(leaf.id)}
                      className="w-5 h-5 rounded border-slate-300"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-slate-700">
                        {leaf.name}
                      </div>
                      {leaf.deadline && (
                        <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                          <Calendar size={14} />
                          期限: {leaf.deadline.toLocaleDateString("ja-JP")}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < leaf.importance
                              ? "bg-orange-400"
                              : "bg-slate-200"
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

export default LeafGoalsList;