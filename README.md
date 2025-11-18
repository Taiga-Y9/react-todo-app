# SmallStep Todo - 階層的目標管理アプリ
<img width="927" height="891" alt="Image" src="https://github.com/user-attachments/assets/f027b4b6-9aa8-4b8a-8e3b-6d82665617a6" />

## コンセプト
「やるべきことはあるが、何をしたらいいかわからない、どこから手を付ければいいかわからない」　——そんな経験はありませんか?
SmallStep Todoは、大きな目標を着実に達成するための階層的目標管理アプリです。「〇〇企業に就職したい」という大きな夢を、「面接の練習をする」「受け答えの想定問答を作る」「目を見て話す練習をする」といった具体的なタスクに細分化。一歩ずつ進んでいる実感を得ながら、確実にゴールへ近づけます。
　
## なぜ作ったのか
従来のTodoアプリには大きく2つの課題がありました：

フラットなタスク管理の限界: 単純なチェックリストでは、チベーションの維持が困難
進捗の可視化不足: 「今どれくらい目標に近づいているのか」が実感しにくい

これらを解決するため、階層構造による目標の分解と視覚的な進捗管理を組み合わせたアプリを開発しました。

# 主な機能
## 階層的な目標管理

- 大きな目標から小さなタスクまで、無制限の階層で自由に分解
- 各階層で複数の目標を並列管理可能
親目標の完了は自動的に子目標にも反映

## リアルタイム進捗可視化

- 各目標の達成率をプログレスバーで表示
- 子タスクの完了状況から自動計算される進捗率
- ダッシュボードで全体の統計を一目で把握

## 「今やるべきこと」を明確化

- 末端タスク（子を持たない具体的なアクション）を自動抽出
- 大きな目標ごとにグループ化して表示
- 期限順で優先度を自動判定

## 直感的なUI/UX

- 折りたたみ可能な階層表示
- レスポンシブデザイン対応

# スクリーンショット

1. メイン画面 - 階層的な目標管理
<img width="921" height="909" alt="Image" src="https://github.com/user-attachments/assets/dbc18f79-eb69-408d-a68c-14d163add8d4" />
大きな目標から細かいタスクまで、階層構造で一覧表示。各目標の進捗率がプログレスバーで可視化されています。
2. 今やるべきタスク
<img width="913" height="506" alt="Image" src="https://github.com/user-attachments/assets/13900395-f8f7-47ef-8429-e53c41380280" />
階層の末端にある具体的なアクションを自動抽出。大きな目標ごとにグループ化され、期限順で表示されます。

## 特に工夫したポイント
1. 進捗の自動計算アルゴリズム
子タスクの完了状況から親タスクの進捗率を再帰的に計算。「全体の中で今どれくらい進んでいるか」を常に把握できる設計にしました。

// 再帰的に子の進捗から親の進捗を算出
export const calculateProgress = (goalId: string, goals: GoalMap): number => {
  const goal = goals[goalId];
  if (goal.childIds.length === 0) return goal.isDone ? 100 : 0;
  
  const childProgresses = goal.childIds.map(childId => 
    calculateProgress(childId, goals)
  );
  return childProgresses.reduce((sum, p) => sum + p, 0) / goal.childIds.length;
};

2. 「今やるべきこと」の自動抽出
階層構造の中から**末端タスク（leaf nodes）**を検出し、実際にアクションが必要なものだけを表示。ユーザーは「次に何をすべきか」を迷わず把握できます。

3. 柔軟なソート・フィルター機能

各階層ごとに異なるソート条件を適用可能
条件でのフィルタリング（期限, 重要度,進捗）
フィルター適用時も階層構造を維持

## Todo アプリをホストしている GitHub Pages の URL
https://taiga-y9.github.io/react-todo-app/

## 開発履歴

開発期間: 2025.11.1 ~ 2025.11.18 (約22時間)

## ライセンス

MIT License

Copyright (c) 2025 Yamazoe Taiga

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.