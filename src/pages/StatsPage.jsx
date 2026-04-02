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

function buildPieSlices(items) {
  const total = items.reduce((sum, item) => sum + item.count, 0);
  let cursor = 0;

  return items.map((item, index) => {
    const percent = total > 0 ? (item.count / total) * 100 : 0;
    const slice = {
      ...item,
      color: chartColors[index % chartColors.length],
      percent,
      start: cursor
    };
    cursor += percent;
    return slice;
  });
}

export default function StatsPage({ records }) {
  const [cloudRecords, setCloudRecords] = useState(null);
  const [chartType, setChartType] = useState("pie");
  const [hoveredItem, setHoveredItem] = useState(null);

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
  const chartItems = useMemo(() => buildPieSlices(tagCounts), [tagCounts]);
  const totalTagCount = tagCounts.reduce((sum, item) => sum + item.count, 0);
  const maxCount = Math.max(...tagCounts.map((item) => item.count), 1);
  const getPercent = (count) => (totalTagCount > 0 ? Math.round((count / totalTagCount) * 100) : 0);
  const hoverHint = hoveredItem
    ? `${hoveredItem.label} ${hoveredItem.count}票 / ${hoveredItem.percent}%`
    : "滑鼠移到圖表或圖例即可查看票數";

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
                <div className="donut-wrap" onMouseLeave={() => setHoveredItem(null)}>
                  <svg
                    className="donut-svg"
                    viewBox="0 0 120 120"
                    role="img"
                    aria-label="離職標籤圓餅統計圖"
                  >
                    <g transform="rotate(-90 60 60)">
                      {chartItems.map((item) => (
                        <circle
                          key={item.label}
                          cx="60"
                          cy="60"
                          r="36"
                          fill="none"
                          stroke={item.color}
                          strokeWidth="20"
                          pathLength="100"
                          strokeDasharray={`${item.percent} ${100 - item.percent}`}
                          strokeDashoffset={-item.start}
                          onMouseEnter={() =>
                            setHoveredItem({
                              label: item.label,
                              count: item.count,
                              percent: getPercent(item.count)
                            })}
                        />
                      ))}
                    </g>
                  </svg>

                  <div className="donut-center-label">
                    <strong>{hoveredItem ? hoveredItem.label : "總票數"}</strong>
                    <span>
                      {hoveredItem
                        ? `${hoveredItem.count}票 / ${hoveredItem.percent}%`
                        : `${totalTagCount} 票`}
                    </span>
                  </div>
                </div>

                <div className="donut-legend">
                  {chartItems.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      className="donut-legend-item"
                      onMouseEnter={() =>
                        setHoveredItem({
                          label: item.label,
                          count: item.count,
                          percent: getPercent(item.count)
                        })}
                      onFocus={() =>
                        setHoveredItem({
                          label: item.label,
                          count: item.count,
                          percent: getPercent(item.count)
                        })}
                    >
                      <span
                        className="donut-legend-dot"
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.label}</span>
                      <strong>{item.count}票 / {getPercent(item.count)}%</strong>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="stats-tag-bars" onMouseLeave={() => setHoveredItem(null)}>
                {chartItems.map((item) => (
                  <div
                    key={item.label}
                    className="stats-tag-row"
                    onMouseEnter={() =>
                      setHoveredItem({
                        label: item.label,
                        count: item.count,
                        percent: getPercent(item.count)
                      })}
                    title={`${item.label}：${item.count}票 / ${getPercent(item.count)}%`}
                  >
                    <span>{item.label}</span>
                    <div className="stats-tag-track">
                      <div
                        className="stats-tag-fill"
                        style={{
                          width: `${(item.count / maxCount) * 100}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>
                    <strong>{item.count}票 / {getPercent(item.count)}%</strong>
                  </div>
                ))}
              </div>
            )}

            <div className="stats-info-block">
              <p className="stats-hover-note">{hoverHint}</p>
              <p className="stats-total-note">累積標籤次數：{totalTagCount} 次</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
