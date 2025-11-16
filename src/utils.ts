import type { Goal, GoalMap, FilterOptions, Statistics } from "./types";

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
      case 'order':
        return a.order - b.order;
      
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

// フィルタリング
export const filterGoals = (goals: Goal[], filter: FilterOptions): Goal[] => {
  return goals.filter(goal => {
    // 検索テキスト
    if (filter.searchText && !goal.name.toLowerCase().includes(filter.searchText.toLowerCase())) {
      return false;
    }
    
    // タグ
    if (filter.tags.length > 0 && !filter.tags.some(tag => goal.tags.includes(tag))) {
      return false;
    }
    
    // 完了状態
    if (filter.isDone !== null && goal.isDone !== filter.isDone) {
      return false;
    }
    
    // 重要度
    if (filter.importance !== null && goal.importance !== filter.importance) {
      return false;
    }
    
    // 期限切れ
    if (filter.overdueOnly) {
      if (!goal.deadline || goal.isDone || goal.deadline.getTime() > Date.now()) {
        return false;
      }
    }
    
    return true;
  });
};

// 全てのタグを取得
export const getAllTags = (goals: GoalMap): string[] => {
  const tagSet = new Set<string>();
  Object.values(goals).forEach(goal => {
    goal.tags.forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
};

// 統計情報を計算
export const calculateStatistics = (goals: GoalMap): Statistics => {
  const allGoals = Object.values(goals);
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const totalGoals = allGoals.length;
  const completedGoals = allGoals.filter(g => g.isDone).length;
  const overdueGoals = allGoals.filter(
    g => !g.isDone && g.deadline && g.deadline.getTime() < now.getTime()
  ).length;
  
  const byImportance: { [key: number]: number } = {};
  for (let i = 1; i <= 5; i++) {
    byImportance[i] = allGoals.filter(g => g.importance === i).length;
  }
  
  const byTag: { [key: string]: number } = {};
  allGoals.forEach(goal => {
    goal.tags.forEach(tag => {
      byTag[tag] = (byTag[tag] || 0) + 1;
    });
  });
  
  // 簡易的に完了時刻を推定（実際にはGoalに完了日時フィールドを追加すべき）
  const weeklyCompleted = 0; // 実装には完了日時が必要
  const monthlyCompleted = 0;
  
  return {
    totalGoals,
    completedGoals,
    overdueGoals,
    completionRate: totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0,
    byImportance,
    byTag,
    weeklyCompleted,
    monthlyCompleted,
  };
};

// 期限切れかチェック
export const isOverdue = (goal: Goal): boolean => {
  if (!goal.deadline || goal.isDone) return false;
  return goal.deadline.getTime() < Date.now();
};