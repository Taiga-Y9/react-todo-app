import React from "react";

type Props = {
  name: string;
  uncompletedCount: number; // 追加
};

const WelcomeMessage = (props: Props) => {
  const currentTime = new Date();
  const greeting =
    currentTime.getHours() < 12 ? "おはようございます" : "こんにちは";

  return (
    <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-blue-100">
    <h2 className="text-xl font-semibold text-gray-800 mb-2">
      {greeting}、{props.name}さん！
    </h2>
    <p className="text-gray-600">
      未完了のタスクが<span className="font-bold text-indigo-600 text-lg mx-1">{props.uncompletedCount}</span>件あります
    </p>
  </div>
);
};

export default WelcomeMessage;