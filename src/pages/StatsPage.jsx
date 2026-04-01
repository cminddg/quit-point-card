import { useEffect, useMemo, useState } from "react";
import { getTagStats } from "../utils/recordHelpers";
import { listPublicQuitReports } from "../lib/supabaseRest";

const chartColors = [
  "#eeac45",
  "#68be9f",
  "#67acd0",
  "#cf739b",
  "#a682cf",
  "#e28f61",
  "#59b4b6",
  "#e2c541",
  "#b886c9"
];

function buildConicGradient(items) {
  const total = items.reduce((sum, item) => sum + item.count, 0);
  if (total <= 0) {
    return "conic-gradient(#f3f4f6 0deg 360deg)";
  }

  let current = 0;
  const parts = items.map((item, index) => {
    const percent = (item.count / total) * 100;
    const start = current;
    const end = Math.min(100, current + percent);
    current = end;
    return `${chartColors[index % chartColors.length]} ${start}% ${end}%`;
  });

  if (current < 100) {
    parts.push(`#f3f4f6 ${current}% 100%`);
  }

  return `conic-gradient(${parts.join(", ")})`;
}

export default function StatsPage({ records }) {
  const [cloudRecords, setCloudRecords] = useState(null);
  const [chartType, setChartType] = useState("pie");

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
            tags: Array.isArray(item.tags) ? item.tags : []
          }))
          : [];

        setCloudRecords(parsed);
      } catch {
        if (!isActive) {
          return;
        }

        setCloudRecords(null);
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
  const tagCounts = getTagStats(sourceRecords);
  const totalTagCount = tagCounts.reduce((sum, item) => sum + item.count, 0);
  const donutBackground = buildConicGradient(tagCounts);
  const maxCount = Math.max(...tagCounts.map((item) => item.count), 1);

  return (
    <div className="page-stack">
      <section className="page-card stats-overview-card">
        <div className="stats-header">
          <div>
            <p className="page-kicker">📊 離職標籤大數據總覽</p>
            <h2>全站匿名統計</h2>
          </div>

          <div className="stats-toggle" role="tablist" aria-label="圖表類型切換">
            <button
              type="button"
              className={`stats-toggle-button ${chartType === "pie" ? "stats-toggle-button-active" : ""}`}
              onClick={() => setChartType("pie")}
            >
              圓餅圖
            </button>
            <button
              type="button"
              className={`stats-toggle-button ${chartType === "bar" ? "stats-toggle-button-active" : ""}`}
              onClick={() => setChartType("bar")}
            >
              長條圖
            </button>
          </div>
        </div>

        {tagCounts.length === 0 ? (
          <div className="empty-state compact-empty-state">
            <h3>目前還沒有可用統計資料</h3>
            <p>新增幾筆紀錄後，這裡就會開始顯示全站匿名統計圖。</p>
          </div>
        ) : (
          <div className="stats-chart-body">
            {chartType === "pie" ? (
              <div className="donut-layout">
                <div className="donut-wrap">
                  <div className="donut-chart" style={{ backgroundImage: donutBackground }} />
                </div>
                <div className="donut-legend">
                  {tagCounts.map((item, index) => (
                    <div key={item.label} className="donut-legend-item">
                      <span
                        className="donut-legend-dot"
                        style={{ backgroundColor: chartColors[index % chartColors.length] }}
                      />
                      <span>{item.label}</span>
                      <strong>{item.count}</strong>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="stats-tag-bars">
                {tagCounts.map((item, index) => (
                  <div key={item.label} className="stats-tag-row">
                    <span>{item.label}</span>
                    <div className="stats-tag-track">
                      <div
                        className="stats-tag-fill"
                        style={{
                          width: `${(item.count / maxCount) * 100}%`,
                          backgroundColor: chartColors[index % chartColors.length]
                        }}
                      />
                    </div>
                    <strong>{item.count}</strong>
                  </div>
                ))}
              </div>
            )}

            <p className="stats-total-note">累積標籤次數：{totalTagCount} 次</p>
          </div>
        )}
      </section>
    </div>
  );
}
