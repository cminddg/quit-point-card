import { useEffect, useMemo, useState } from "react";
import {
  buildCountList,
  getEmotionStats,
  getTagStats,
  getTopItem
} from "../utils/recordHelpers";
import { listPublicQuitReports } from "../lib/supabaseRest";

export default function StatsPage({ records, emotionOptions }) {
  const [cloudRecords, setCloudRecords] = useState(null);
  const [cloudStatus, setCloudStatus] = useState("loading");

  useEffect(() => {
    let isActive = true;

    async function loadCloudStats() {
      try {
        const rows = await listPublicQuitReports();
        if (!isActive) {
          return;
        }

        const parsed = Array.isArray(rows)
          ? rows.map((item) => ({
            emotion: item.emotion || "",
            tags: Array.isArray(item.tags) ? item.tags : []
          }))
          : [];

        setCloudRecords(parsed);
        setCloudStatus("ready");
      } catch {
        if (!isActive) {
          return;
        }

        setCloudRecords(null);
        setCloudStatus("fallback");
      }
    }

    loadCloudStats();

    return () => {
      isActive = false;
    };
  }, []);

  const sourceRecords = useMemo(
    () => (cloudRecords !== null ? cloudRecords : records),
    [cloudRecords, records]
  );

  const emotionCounts = getEmotionStats(sourceRecords, emotionOptions);
  const tagCounts = getTagStats(sourceRecords);
  const topEmotion = getTopItem(buildCountList(sourceRecords.map((record) => record.emotion).filter(Boolean)));
  const topTag = getTopItem(tagCounts);
  const maxEmotionCount = Math.max(...emotionCounts.map((item) => item.count), 1);
  const sourceNote =
    cloudStatus === "ready"
      ? "全站匿名統計（Supabase）"
      : "目前顯示本機統計（雲端尚未啟用）";

  const summaryCards = [
    {
      label: "總紀錄數",
      value: `${sourceRecords.length}`,
      note: cloudStatus === "ready" ? "全站匿名統計總筆數" : "目前保存在本機的總筆數"
    },
    { label: "最常出現情緒", value: topEmotion, note: "依目前所有紀錄自動計算" },
    { label: "最常見標籤", value: topTag, note: "會把每筆紀錄的標籤一起統計" }
  ];

  return (
    <div className="page-stack">
      <section className="page-card">
        <p className="mini-label">資料來源</p>
        <h3>{sourceNote}</h3>
      </section>

      <section className="summary-grid">
        {summaryCards.map((card) => (
          <article key={card.label} className="page-card mini-card">
            <p className="mini-label">{card.label}</p>
            <h3>{card.value}</h3>
            <p>{card.note}</p>
          </article>
        ))}
      </section>

      <section className="stats-layout">
        <article className="page-card chart-card">
          <div className="section-heading compact-heading">
            <div>
              <p className="page-kicker">統計圖表頁</p>
              <h2>各情緒數量</h2>
            </div>
            <p className="section-copy">每次新增紀錄後，這裡都會跟著更新。</p>
          </div>

          <div className="bar-chart">
            {emotionCounts.map((bar) => (
              <div key={bar.label} className="bar-row">
                <span>{bar.label}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${(bar.count / maxEmotionCount) * 100 || 0}%` }}
                  />
                </div>
                <strong className="bar-value">{bar.count} 筆</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="page-card chart-card">
          <div className="section-heading compact-heading">
            <div>
              <p className="page-kicker">標籤觀察</p>
              <h2>各標籤數量</h2>
            </div>
            <p className="section-copy">這裡會統計每個標籤出現幾次，方便你看出常見原因。</p>
          </div>

          <div className="insight-list">
            {tagCounts.length > 0 ? (
              tagCounts.map((item) => (
                <div key={item.label} className="insight-row">
                  <span>{item.label}</span>
                  <strong>{item.count} 次</strong>
                </div>
              ))
            ) : (
              <div className="empty-state compact-empty-state">
                <h3>目前還沒有標籤資料</h3>
                <p>新增紀錄時輸入標籤後，這裡就會出現統計結果。</p>
              </div>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
