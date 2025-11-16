export interface Goal {
  id: string;
  name: string;
  parentId: string | null;
  childIds: string[];
  isDone: boolean;
  importance: number; // 1〜5 など
  startDate: Date | null;
  deadline: Date | null;
  isExpanded: boolean;
  tags: string[]; // 追加: タグ機能
  order: number; // 追加: 並び順
}

// 辞書型のマップ
export interface GoalMap {
  [id: string]: Goal;
}

// 並び替えのオプション
export type SortOption = "none" | "deadline" | "importance" | "progress" | "order";

// フィルター条件
export interface FilterOptions {
  searchText: string;
  tags: string[];
  isDone: boolean | null; // null=全て、true=完了のみ、false=未完了のみ
  importance: number | null; // null=全て、1-5=その重要度
  overdueOnly: boolean; // 期限切れのみ
}

// 統計データ
export interface Statistics {
  totalGoals: number;
  completedGoals: number;
  overdueGoals: number;
  completionRate: number;
  byImportance: { [importance: number]: number };
  byTag: { [tag: string]: number };
  weeklyCompleted: number;
  monthlyCompleted: number;
}