
export interface Goal {
    id: string;
    name: string;
    parentId: string | null;
    childIds: string[];
    isDone: boolean;
    importance: number; // 1〜5 など
    startDate: Date | null; // 日付文字列
    deadline: Date | null; // 日付文字列
    isExpanded: boolean;
  }
  
  // 辞書型のマップ
  export interface GoalMap {
    [id: string]: Goal;
  }
  
  // 並び替えのオプション
  export type SortOption = "none" | "deadline" | "importance" | "progress";