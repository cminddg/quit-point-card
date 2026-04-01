import { useState } from "react";
import { formatDate } from "../utils/recordHelpers";
import { tagOptions } from "../data/initialRecords";

export default function RecordsPage({ records, emotionOptions }) {
  const [selectedEmotion, setSelectedEmotion] = useState("全部");
  const [selectedTag, setSelectedTag] = useState("全部");

  const allEmotions = [
    ...new Set([
      ...emotionOptions,
      ...records.map((record) => record.emotion).filter(Boolean)
    ])
  ];

  const filteredRecords = records.filter((record) => {
    const matchesEmotion =
      selectedEmotion === "全部" || record.emotion === selectedEmotion;
    const matchesTag = selectedTag === "全部" || record.tags.includes(selectedTag);

    return matchesEmotion && matchesTag;
  });

  return (
    <div className="page-stack">
      <section className="page-card">
        <div className="section-heading">
          <div>
            <p className="page-kicker">紀錄列表頁</p>
            <h2>紀錄列表與篩選</h2>
          </div>
          <p className="section-copy">
            你可以用上方情緒和標籤按鈕，快速縮小成你想看的那一類紀錄。
          </p>
        </div>

        <div className="filter-shell">
          <div className="filter-group">
            <span className="filter-label">情緒</span>
            <div className="chip-row">
              {["全部", ...allEmotions].map((emotion) => (
                <button
                  key={emotion}
                  type="button"
                  className={
                    selectedEmotion === emotion
                      ? "chip-button chip-button-active"
                      : "chip-button"
                  }
                  onClick={() => setSelectedEmotion(emotion)}
                >
                  {emotion}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-label">標籤</span>
            <div className="chip-row">
              <button
                type="button"
                className={
                  selectedTag === "全部"
                    ? "chip-button chip-button-active"
                    : "chip-button chip-button-soft"
                }
                onClick={() => setSelectedTag("全部")}
              >
                全部
              </button>
              {tagOptions.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={
                    selectedTag === tag
                      ? "chip-button chip-button-active"
                      : "chip-button chip-button-soft"
                  }
                  onClick={() => setSelectedTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="record-list">
        <div className="list-summary">
          <strong>目前顯示 {filteredRecords.length} 筆</strong>
          <span>
            情緒：{selectedEmotion} / 標籤：{selectedTag}
          </span>
        </div>

        {filteredRecords.length > 0 ? (
          filteredRecords.map((record) => (
            <article key={record.id} className="page-card record-card">
              <div className="record-card-top">
                <div>
                  <p className="record-date">{formatDate(record.date)}</p>
                  <h3>{record.title}</h3>
                </div>
                <span className="emotion-badge">{record.emotion}</span>
              </div>

              <p className="record-description">{record.description}</p>

              <div className="tag-row">
                {record.tags.length > 0 ? (
                  record.tags.map((tag) => (
                    <span key={tag} className="tag-pill">
                      #{tag}
                    </span>
                  ))
                ) : (
                  <span className="tag-pill">#未分類</span>
                )}
              </div>
            </article>
          ))
        ) : (
          <div className="page-card empty-state">
            <h3>目前沒有符合條件的紀錄</h3>
            <p>你可以換一個情緒或標籤，或者先去新增一筆新的離職紀錄。</p>
          </div>
        )}
      </section>
    </div>
  );
}
