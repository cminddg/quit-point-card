import { Link } from "react-router-dom";
import { formatDate } from "../utils/recordHelpers";

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

export default function HomePage({ records }) {
  const latestRecord = records[0];
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
      <section className="page-card hero-card">
        <div className="hero-copy">
          <p className="page-kicker">首頁</p>
          <h2>先把「我到底多常想離職」變成看得見的畫面</h2>
          <p className="hero-text">
            這一頁是專案入口。你可以從這裡快速前往新增紀錄、看清單、看統計，快速掌握最近的離職念頭。
          </p>
          <div className="hero-actions">
            <Link className="primary-button" to="/add">
              立即記一筆
            </Link>
            <Link className="secondary-button" to="/records">
              看紀錄列表
            </Link>
          </div>
        </div>

        <div className="hero-panel">
          <p className="panel-label">使用重點</p>
          <ul className="bullet-list">
            <li>新增後列表與統計會同步更新</li>
            <li>可用情緒與標籤做快速篩選</li>
            <li>重整頁面後紀錄仍會保留</li>
          </ul>
        </div>
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
            <h2>首頁現在也會顯示最新一筆內容</h2>
          </div>
          <p className="section-copy">這樣你一打開就能知道最近一次想離職是因為什麼。</p>
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
