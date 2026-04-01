import { useState } from "react";
import { formatDate } from "../utils/recordHelpers";
import { tagOptions, extraEmojiOptions } from "../data/initialRecords";

function createEditForm(record) {
  return {
    title: record.title || "",
    date: record.date || "",
    emotion: record.emotion || "",
    tags: Array.isArray(record.tags) ? record.tags : [],
    description: record.description || ""
  };
}

export default function RecordsPage({ records, emotionOptions, updateRecord, deleteRecord }) {
  const [selectedEmotion, setSelectedEmotion] = useState("全部");
  const [selectedTag, setSelectedTag] = useState("全部");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [editingRecordId, setEditingRecordId] = useState("");
  const [editingForm, setEditingForm] = useState(createEditForm({}));
  const [showExtraEmojiMenu, setShowExtraEmojiMenu] = useState(false);
  const [message, setMessage] = useState("");

  const allEmotions = [
    ...new Set([
      ...emotionOptions,
      ...records.map((record) => record.emotion).filter(Boolean)
    ])
  ];

  const normalizedKeyword = searchKeyword.trim().toLowerCase();

  const filteredRecords = records.filter((record) => {
    const matchesEmotion =
      selectedEmotion === "全部" || record.emotion === selectedEmotion;
    const matchesTag = selectedTag === "全部" || record.tags.includes(selectedTag);
    const searchSource = [
      record.title,
      record.description,
      record.emotion,
      record.date,
      ...(record.tags || [])
    ]
      .join(" ")
      .toLowerCase();
    const matchesSearch = normalizedKeyword === "" || searchSource.includes(normalizedKeyword);

    return matchesEmotion && matchesTag && matchesSearch;
  });

  function startEdit(record) {
    if (editingRecordId === record.id) {
      setEditingRecordId("");
      setShowExtraEmojiMenu(false);
      return;
    }

    setEditingRecordId(record.id);
    setEditingForm(createEditForm(record));
    setShowExtraEmojiMenu(false);
    setMessage("");
  }

  function handleEditChange(event) {
    const { name, value } = event.target;
    setEditingForm((currentForm) => ({
      ...currentForm,
      [name]: value
    }));
  }

  function handleEditTagToggle(tag) {
    setEditingForm((currentForm) => {
      const hasTag = currentForm.tags.includes(tag);
      return {
        ...currentForm,
        tags: hasTag
          ? currentForm.tags.filter((item) => item !== tag)
          : [...currentForm.tags, tag]
      };
    });
  }

  function handleEditEmojiSelect(emoji) {
    setEditingForm((currentForm) => ({
      ...currentForm,
      emotion: emoji
    }));
    setShowExtraEmojiMenu(false);
  }

  function handleSave(recordId) {
    if (!editingForm.title.trim() || !editingForm.emotion || !editingForm.description.trim()) {
      setMessage("請至少填寫標題、情緒和內容。");
      return;
    }

    updateRecord(recordId, {
      title: editingForm.title.trim(),
      date: editingForm.date,
      emotion: editingForm.emotion,
      tags: editingForm.tags,
      description: editingForm.description.trim()
    });

    setEditingRecordId("");
    setShowExtraEmojiMenu(false);
    setMessage("這筆紀錄已更新。");
  }

  function handleDelete(recordId) {
    const shouldDelete = window.confirm("確定要刪除這筆紀錄嗎？刪除後無法復原。");
    if (!shouldDelete) {
      return;
    }

    deleteRecord(recordId);
    setEditingRecordId("");
    setShowExtraEmojiMenu(false);
    setMessage("這筆紀錄已刪除。");
  }

  return (
    <div className="page-stack">
      <section className="page-card">
        <div className="filter-shell">
          <label className="field-group record-search-group">
            <span>搜尋</span>
            <input
              type="text"
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              placeholder="找尋過往痛苦的記憶？"
            />
          </label>

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

        {message ? <p className="form-message">{message}</p> : null}
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
                  <p className="record-date">
                    {formatDate(record.date)}
                    {record.emotion ? ` · ${record.emotion}` : ""}
                  </p>
                  <h3>{record.title}</h3>
                </div>
                <button
                  type="button"
                  className="record-icon-button"
                  onClick={() => startEdit(record)}
                  aria-label="編輯這筆紀錄"
                >
                  ✏️
                </button>
              </div>

              {editingRecordId === record.id ? (
                <div className="record-edit-shell">
                  <div className="record-form">
                    <label className="field-group">
                      <span>破事標題</span>
                      <input
                        type="text"
                        name="title"
                        value={editingForm.title}
                        onChange={handleEditChange}
                        placeholder="例如：又被臨時改需求，心很累"
                      />
                    </label>

                    <div className="form-two-columns">
                      <label className="field-group">
                        <span>日期</span>
                        <input
                          type="date"
                          name="date"
                          value={editingForm.date}
                          onChange={handleEditChange}
                        />
                      </label>
                    </div>

                    <div className="field-group">
                      <span>主要情緒</span>
                      <div className="emoji-option-row">
                        {emotionOptions.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            className={
                              editingForm.emotion === emoji
                                ? "emoji-option emoji-option-active"
                                : "emoji-option"
                            }
                            onClick={() => handleEditEmojiSelect(emoji)}
                            aria-label={`選擇情緒 ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                        <button
                          type="button"
                          className={
                            showExtraEmojiMenu
                              ? "emoji-option emoji-option-plus emoji-option-active"
                              : "emoji-option emoji-option-plus"
                          }
                          onClick={() => setShowExtraEmojiMenu((isOpen) => !isOpen)}
                          aria-label="開啟其他 emoji 選單"
                        >
                          +
                        </button>
                      </div>

                      {showExtraEmojiMenu ? (
                        <div className="emoji-menu">
                          {extraEmojiOptions.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              className={
                                editingForm.emotion === emoji
                                  ? "emoji-option emoji-option-active"
                                  : "emoji-option"
                              }
                              onClick={() => handleEditEmojiSelect(emoji)}
                              aria-label={`選擇情緒 ${emoji}`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="field-group">
                      <span>標籤</span>
                      <div className="tag-option-grid">
                        {tagOptions.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            className={
                              editingForm.tags.includes(tag)
                                ? "chip-button chip-button-active"
                                : "chip-button"
                            }
                            onClick={() => handleEditTagToggle(tag)}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    <label className="field-group">
                      <span>想多說一點的內容</span>
                      <textarea
                        name="description"
                        value={editingForm.description}
                        onChange={handleEditChange}
                        rows="6"
                        placeholder="今天又發生什麼鳥事了？吐吐苦水吧......"
                      />
                    </label>

                    <div className="form-actions">
                      <button type="button" className="primary-button" onClick={() => handleSave(record.id)}>
                        💾 儲存
                      </button>
                      <button type="button" className="danger-button" onClick={() => handleDelete(record.id)}>
                        🗑️ 刪除
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
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
                </>
              )}
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
