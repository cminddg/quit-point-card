import { Link } from "react-router-dom";
import { formatDate } from "../utils/recordHelpers";

const MAX_STAMPS = 10;

const emotionEmojiMap = {
  煩躁: "😤",
  委屈: "🥺",
  疲憊: "🥱",
  麻木: "💀",
  "其實還好": "🙂"
};

const quickLinks = [
  {
    title: "新增一筆離職紀錄",
    description: "用一個簡單表單快速記下今天的情緒、原因與標籤。",
    to: "/add",
    action: "前往新增頁"
  },
  {
    title: "看全部紀錄",
    description: "把之後的每一筆紀錄整理成清楚卡片，方便回頭看。",
    to: "/records",
    action: "前往列表頁"
  },
  {
    title: "看基本統計",
    description: "查看情緒與標籤的統計結果，快速掌握近期狀態。",
    to: "/stats",
    action: "前往統計頁"
  }
];

function getRecordEmoji(record) {
  if (!record) {
    return "🫠";
  }

  return emotionEmojiMap[record.emotion] || "🫠";
}

export default function HomePage({ records }) {
  const latestRecord = records[0];
  const stampRemainder = records.length % MAX_STAMPS;
  const filledCount =
    records.length === 0 ? 0 : stampRemainder === 0 ? MAX_STAMPS : stampRemainder;
  const currentCardNumber = Math.floor(records.length / MAX_STAMPS) + 1;
  const activeRecords = records.slice(0, filledCount);
  const stampSlots = Array.from({ length: MAX_STAMPS }, (_, index) => {
    const isFilled = index < filledCount;

    return {
      index: index + 1,
      isFilled,
      emoji: isFilled ? getRecordEmoji(activeRecords[index]) : null
    };
  });

  const overviewCards = [
    {
      label: "總紀錄數",
      value: `${records.length} 筆`,
      hint: "這是目前保存在本機的離職紀錄總數"
    },
    {
      label: "最近一次情緒",
      value: latestRecord?.emotion || "尚無資料",
      hint: latestRecord ? `最近紀錄日期：${formatDate(latestRecord.date)}` : "還沒新增任何紀錄"
    },
    {
      label: "最近標題",
      value: latestRecord?.title || "先去新增第一筆",
      hint: "首頁會直接帶你看到最近那一筆"
    }
  ];

  return (
    <div className="page-stack">
      <section className="page-card punch-card">
        <div className="punch-card-header">
          <h2>我的療癒離職集點卡</h2>
          <p className="punch-card-subtitle">
            每新增一筆破事就蓋一格章，辛苦了，每一筆都算數。
          </p>
          <div className="punch-meta-pill">累積破事總數：{records.length} 筆</div>
        </div>

        <div className="stamp-board">
          <h3>
            已集滿 <span>{filledCount}</span> / {MAX_STAMPS} 點
          </h3>
          <p>
            {filledCount === MAX_STAMPS
              ? "這張卡已集滿，真的很辛苦。"
              : "再撐一下下，你正在累積自己的離職勇氣。"}
          </p>

          <div className="stamp-grid" aria-label="離職集點格">
            {stampSlots.map((slot) => (
              <div
                key={slot.index}
                className={slot.isFilled ? "stamp-slot stamp-slot-filled" : "stamp-slot"}
              >
                {slot.isFilled ? (
                  <span className="stamp-emoji" role="img" aria-label="集點章">
                    {slot.emoji}
                  </span>
                ) : (
                  <span className="stamp-index">{slot.index}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="punch-actions">
          <Link className="add-trouble-button" to="/add">
            ＋ 新增一筆破事
          </Link>
          <Link className="secondary-button" to="/records">
            看紀錄列表
          </Link>
        </div>

        <p className="punch-card-note">目前是第 {currentCardNumber} 張集點卡。</p>
      </section>

      <section className="overview-grid">
        {overviewCards.map((card) => (
          <article key={card.label} className="page-card mini-card">
            <p className="mini-label">{card.label}</p>
            <h3>{card.value}</h3>
            <p>{card.hint}</p>
          </article>
        ))}
      </section>

      <section className="page-card">
        <div className="section-heading">
          <div>
            <p className="page-kicker">最近紀錄</p>
            <h2>最新一筆紀錄</h2>
          </div>
          <p className="section-copy">打開首頁就能快速回顧最近一次紀錄內容。</p>
        </div>
        {latestRecord ? (
          <article className="latest-record-card">
            <div className="record-card-top">
              <div>
                <p className="record-date">{formatDate(latestRecord.date)}</p>
                <h3>{latestRecord.title}</h3>
              </div>
              <span className="emotion-badge">{latestRecord.emotion}</span>
            </div>
            <p className="record-description">{latestRecord.description}</p>
            <div className="tag-row">
              {latestRecord.tags.map((tag) => (
                <span key={tag} className="tag-pill">
                  #{tag}
                </span>
              ))}
            </div>
          </article>
        ) : (
          <div className="empty-state">
            <h3>目前還沒有任何紀錄</h3>
            <p>你可以先去新增紀錄頁輸入第一筆，之後首頁、列表、統計都會一起更新。</p>
          </div>
        )}
      </section>

      <section className="page-card">
        <div className="section-heading">
          <div>
            <p className="page-kicker">快速入口</p>
            <h2>接下來你最常用到的三個區塊</h2>
          </div>
          <p className="section-copy">用最短路徑進到新增、列表與統計，減少操作步驟。</p>
        </div>

        <div className="action-grid">
          {quickLinks.map((item) => (
            <article key={item.to} className="action-card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <Link className="text-link" to={item.to}>
                {item.action}
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
