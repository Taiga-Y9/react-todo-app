import React from "react";
import { Search, Filter, X } from "lucide-react";
import type { FilterOptions } from "./types";

type Props = {
  filter: FilterOptions;
  onFilterChange: (filter: FilterOptions) => void;
  availableTags: string[];
};

const SearchFilter = (props: Props) => {
  const { filter, onFilterChange, availableTags } = props;

  const updateFilter = (updates: Partial<FilterOptions>) => {
    onFilterChange({ ...filter, ...updates });
  };

  const toggleTag = (tag: string) => {
    const newTags = filter.tags.includes(tag)
      ? filter.tags.filter(t => t !== tag)
      : [...filter.tags, tag];
    updateFilter({ tags: newTags });
  };

  const clearFilters = () => {
    onFilterChange({
      searchText: "",
      tags: [],
      isDone: null,
      importance: null,
      overdueOnly: false,
    });
  };

  const hasActiveFilters = 
    filter.searchText !== "" ||
    filter.tags.length > 0 ||
    filter.isDone !== null ||
    filter.importance !== null ||
    filter.overdueOnly;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter size={20} className="text-slate-600" />
        <h3 className="text-lg font-semibold text-slate-800">検索・フィルター</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="ml-auto flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
          >
            <X size={16} />
            クリア
          </button>
        )}
      </div>

      {/* 検索バー */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          value={filter.searchText}
          onChange={(e) => updateFilter({ searchText: e.target.value })}
          placeholder="目標名で検索..."
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 完了状態 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            状態
          </label>
          <select
            value={filter.isDone === null ? "all" : filter.isDone ? "done" : "undone"}
            onChange={(e) => {
              const val = e.target.value;
              updateFilter({
                isDone: val === "all" ? null : val === "done"
              });
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          >
            <option value="all">すべて</option>
            <option value="undone">未完了</option>
            <option value="done">完了済み</option>
          </select>
        </div>

        {/* 重要度 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            重要度
          </label>
          <select
            value={filter.importance === null ? "all" : filter.importance}
            onChange={(e) => {
              const val = e.target.value;
              updateFilter({
                importance: val === "all" ? null : Number(val)
              });
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          >
            <option value="all">すべて</option>
            <option value="5">★★★★★</option>
            <option value="4">★★★★</option>
            <option value="3">★★★</option>
            <option value="2">★★</option>
            <option value="1">★</option>
          </select>
        </div>

        {/* 期限切れ */}
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filter.overdueOnly}
              onChange={(e) => updateFilter({ overdueOnly: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300"
            />
            <span className="text-sm text-slate-700">期限切れのみ</span>
          </label>
        </div>
      </div>

      {/* タグフィルター */}
      {availableTags.length > 0 && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            タグ
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filter.tags.includes(tag)
                    ? "bg-blue-500 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;