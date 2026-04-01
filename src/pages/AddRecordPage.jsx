import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { tagOptions } from "../data/initialRecords";

function getTodayValue() {
  return new Date().toISOString().slice(0, 10);
}

const extraEmojiOptions = ["😵‍💫", "🙄", "🥴", "🤯", "😮‍💨", "🤢", "🤮", "😬", "👹", "👺"];

function createInitialForm() {
  return {
    title: "",
    date: getTodayValue(),
    emotion: "",
    tags: [],
    description: ""
  };
}

export default function AddRecordPage({ addRecord, emotionOptions }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(createInitialForm);
  const [showExtraEmojiMenu, setShowExtraEmojiMenu] = useState(false);
  const [message, setMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((currentForm) => ({
      ...currentForm,
      [name]: value
    }));
  }

  function handleSelectEmoji(emoji) {
    setFormData((currentForm) => ({
      ...currentForm,
      emotion: emoji
    }));
    setShowExtraEmojiMenu(false);
  }

  function toggleEmojiMenu() {
    setShowExtraEmojiMenu((isOpen) => !isOpen);
  }

  function toggleTag(tag) {
    setFormData((currentForm) => {
      const hasTag = currentForm.tags.includes(tag);
      return {
        ...currentForm,
        tags: hasTag
          ? currentForm.tags.filter((item) => item !== tag)
          : [...currentForm.tags, tag]
      };
    });
  }

  function handleReset() {
    setFormData(createInitialForm());
    setShowExtraEmojiMenu(false);
    setMessage("已清空輸入內容。");
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!formData.title.trim() || !formData.emotion || !formData.description.trim()) {
      setMessage("請至少填寫標題、情緒和內容。");
      return;
    }

    addRecord({
      title: formData.title.trim(),
      date: formData.date,
      emotion: formData.emotion,
      tags: formData.tags,
      description: formData.description.trim()
    });

    setFormData(createInitialForm());
    setShowExtraEmojiMenu(false);
    setMessage("新增成功，正在帶你前往紀錄列表。");

    window.setTimeout(() => {
      navigate("/records");
    }, 600);
  }

  return (
    <div className="page-stack">
      <section className="page-card">
        <form className="record-form" onSubmit={handleSubmit}>
          <label className="field-group">
            <span>破事標題</span>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="例如：又被臨時改需求，心很累"
            />
          </label>

          <div className="form-two-columns">
            <label className="field-group">
              <span>日期</span>
              <input type="date" name="date" value={formData.date} onChange={handleChange} />
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
                    formData.emotion === emoji ? "emoji-option emoji-option-active" : "emoji-option"
                  }
                  onClick={() => handleSelectEmoji(emoji)}
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
                onClick={toggleEmojiMenu}
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
                      formData.emotion === emoji ? "emoji-option emoji-option-active" : "emoji-option"
                    }
                    onClick={() => handleSelectEmoji(emoji)}
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
                  className={formData.tags.includes(tag) ? "chip-button chip-button-active" : "chip-button"}
                  onClick={() => toggleTag(tag)}
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
              value={formData.description}
              onChange={handleChange}
              rows="6"
              placeholder="今天又發生什麼鳥事了？吐吐苦水吧......"
            />
          </label>

          {message ? <p className="form-message">{message}</p> : null}

          <div className="form-actions">
            <button type="submit" className="primary-button">
              蓋章確認
            </button>
            <button type="button" className="secondary-button" onClick={handleReset}>
              算了不說了/清空
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
