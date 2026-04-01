import { useState } from "react";
import { useNavigate } from "react-router-dom";

function getTodayValue() {
  return new Date().toISOString().slice(0, 10);
}

const presetEmojis = ["😤", "😭", "🤬", "😩", "🥲", "🤡", "😶‍🌫️", "🫠"];

const presetTags = [
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

const initialForm = {
  title: "",
  date: getTodayValue(),
  emotion: "",
  tags: [],
  description: ""
};

export default function AddRecordPage({ addRecord }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [customEmoji, setCustomEmoji] = useState("");
  const [message, setMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((currentForm) => ({
      ...currentForm,
      [name]: value
    }));
  }

  function handleSelectEmoji(emoji) {
    setCustomEmoji("");
    setFormData((currentForm) => ({
      ...currentForm,
      emotion: emoji
    }));
  }

  function handleCustomEmojiChange(event) {
    const value = event.target.value;
    setCustomEmoji(value);
    setFormData((currentForm) => ({
      ...currentForm,
      emotion: value.trim()
    }));
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
    setFormData(initialForm);
    setCustomEmoji("");
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

    setFormData(initialForm);
    setCustomEmoji("");
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
            <span>主要情緒（單選）</span>
            <div className="emoji-option-row">
              {presetEmojis.map((emoji) => (
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
            <label className="custom-emoji-wrap">
              <span className="custom-emoji-label">其他 emoji（可自行輸入）</span>
              <input
                type="text"
                value={customEmoji}
                onChange={handleCustomEmojiChange}
                placeholder="例如：😵‍💫"
              />
            </label>
          </div>

          <div className="field-group">
            <span>標籤（可多選）</span>
            <div className="tag-option-grid">
              {presetTags.map((tag) => (
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
