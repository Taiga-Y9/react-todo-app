import type { Goal, GoalMap } from "./types";

// UUID生成（簡易版）
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// 進捗率を計算（再帰的）
export const calculateProgress = (goalId: string, goals: GoalMap): number => {
  const goal = goals[goalId];
  if (!goal) return 0;
  
  // 子がいない場合は完了/未完了で0%か100%
  if (goal.childIds.length === 0) {
    return goal.isDone ? 100 : 0;
  }
  
  // 子がいる場合は子の進捗の平均
  const childProgresses = goal.childIds.map(childId => 
    calculateProgress(childId, goals)
  );
  return childProgresses.reduce((sum, progress) => sum + progress, 0) / goal.childIds.length;
};

// 末端（子を持たない）の未完了目標を取得
export const getLeafGoals = (goals: GoalMap): Goal[] => {
  return Object.values(goals).filter(goal => 
    goal.childIds.length === 0 && !goal.isDone
  );
};

// ルート（親を持たない）目標を取得
export const getRootGoals = (goals: GoalMap): Goal[] => {
  return Object.values(goals).filter(goal => goal.parentId === null);
};

// 目標をソート
export const sortGoals = (
  goals: Goal[], 
  goalsMap: GoalMap, 
  sortBy: string
): Goal[] => {
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