import { useState } from "react";
import type { Todo } from "./types";
import { initTodos } from "./initTodos";
import WelcomeMessage from "./WelcomeMessage";
import TodoList from "./TodoList";

const App = () => {
  const [todos, setTodos] = useState<Todo[]>(initTodos);
  const uncompletedCount = initTodos.filter(
    (todo: Todo) => !todo.isDone
  ).length; // 未完了タスクの数え上げ
  console.log(JSON.stringify(todos, null, 2));

  return (
    <div className="mx-4 mt-10 max-w-2xl md:mx-auto">
      <h1 className="mb-4 text-2xl font-bold">TodoApp</h1>
      <div className="mb-4">
        <WelcomeMessage
          name="寝屋川タヌキ"
          uncompletedCount={uncompletedCount}
        />
      </div>
      <h3 className="text-lg font-semibold text-black">タスク一覧</h3>
      <TodoList todos={todos} />
    </div>
  );
};

export default App;