export const STORAGE_KEY = "quit-point-card-records";

export const emotionOptions = ["😤", "😭", "🤬", "😩", "🥲", "🤡", "😶‍🌫️", "🫠"];

export const tagOptions = [
  "老闆畫大餅",
  "同事大雷包",
  "無效冗長會議",
  "下班奪命連環 Call",
  "薪水太委屈",
  "需求朝令夕改",
  "替人背黑鍋",
  "燃燒生命大加班",
  "心好累辦公室政治"
];

export const initialRecords = [
  {
    id: "seed-1",
    title: "需求又臨時大改",
    date: "2026-03-31",
    emotion: "😤",
    tags: ["需求朝令夕改", "燃燒生命大加班"],
    description: "原本排好的工作又被打散，今天花很多時間重排優先順序，心裡很悶。"
  },
  {
    id: "seed-2",
    title: "會議很多但事情沒變少",
    date: "2026-03-29",
    emotion: "😩",
    tags: ["無效冗長會議", "下班奪命連環 Call"],
    description: "開了一整天的會，真正能做事的時間反而變少，晚上還是得自己補進度。"
  },
  {
    id: "seed-3",
    title: "今天是有點委屈的一天",
    date: "2026-03-27",
    emotion: "😭",
    tags: ["替人背黑鍋", "老闆畫大餅"],
    description: "提出的想法被很快否定，沒有太多討論空間，讓人有點失落。"
  },
  {
    id: "seed-4",
    title: "薪水跟付出不太成比例",
    date: "2026-03-25",
    emotion: "😶‍🌫️",
    tags: ["薪水太委屈", "心好累辦公室政治"],
    description: "最近開始覺得做再多也差不多，對工作熱情慢慢降下來。"
  },
  {
    id: "seed-5",
    title: "同事幫忙救火，今天稍微好一點",
    date: "2026-03-24",
    emotion: "🥲",
    tags: ["同事大雷包"],
    description: "雖然事情還是很多，但有人一起處理，情緒比前幾天穩定不少。"
  }
];
