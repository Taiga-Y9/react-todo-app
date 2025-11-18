import React from "react";
import { TrendingUp, Target, AlertCircle, Star } from "lucide-react";
import type { Statistics } from "./types";

type Props = {
  statistics: Statistics;
};

const StatisticsDashboard = (props: Props) => {
  const { statistics } = props;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <TrendingUp size={20} />
        統計ダッシュボード
      </h2>

      {/* メインカード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-blue-700">全体の進捗</span>
            <Target className="text-blue-600" size={20} />
          </div>
          <div className="text-3xl font-bold text-blue-900">
            {Math.round(statistics.completionRate)}%
          </div>
          <div className="text-xs text-blue-600 mt-1">
            {statistics.completedGoals} / {statistics.totalGoals} 完了
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-green-700">完了目標</span>
            <Target className="text-green-600" size={20} />
          </div>
          <div className="text-3xl font-bold text-green-900">
            {statistics.completedGoals}
          </div>
          <div className="text-xs text-green-600 mt-1">
            目標達成数
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-orange-700">期限切れ</span>
            <AlertCircle className="text-orange-600" size={20} />
          </div>
          <div className="text-3xl font-bold text-orange-900">
            {statistics.overdueGoals}
          </div>
          <div className="text-xs text-orange-600 mt-1">
            要注意タスク
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-purple-700">進行中</span>
            <Star className="text-purple-600" size={20} />
          </div>
          <div className="text-3xl font-bold text-purple-900">
            {statistics.totalGoals - statistics.completedGoals}
          </div>
          <div className="text-xs text-purple-600 mt-1">
            アクティブ
          </div>
        </div>
      </div>

      {/* 重要度別グラフ */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-slate-700 mb-3">重要度別の目標数</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map(importance => {
            const count = statistics.byImportance[importance] || 0;
            const percentage = statistics.totalGoals > 0 
              ? (count / statistics.totalGoals) * 100 
              : 0;
            
            return (
              <div key={importance} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-20">
                  {[...Array(importance)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-orange-400"
                    />
                  ))}
                </div>
                <div className="flex-1">
                  <div className="h-6 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm text-slate-600 w-16 text-right">
                  {count} 個
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* タグ別統計 */}
      {Object.keys(statistics.byTag).length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-3">タグ別の目標数</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(statistics.byTag)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 10)
              .map(([tag, count]) => (
                <div
                  key={tag}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm"
                >
                  #{tag} <span className="font-semibold">({count})</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticsDashboard;