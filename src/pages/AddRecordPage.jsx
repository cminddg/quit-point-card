import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { parseTags } from "../utils/recordHelpers";

function getTodayValue() {
  return new Date().toISOString().slice(0, 10);
}

const initialForm = {
  title: "",
  date: getTodayValue(),
  emotion: "",
  tags: "",
  description: ""
};

export default function AddRecordPage({ addRecord, emotionOptions }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [message, setMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((currentForm) => ({
      ...currentForm,
      [name]: value
    }));
  }

  function handleReset() {
    setFormData(initialForm);
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
      tags: parseTags(formData.tags),
      description: formData.description.trim()
    });

    setFormData(initialForm);
    setMessage("新增成功，正在帶你前往紀錄列表。");

    window.setTimeout(() => {
      navigate("/records");
    }, 600);
  }

  return (
    <div className="page-stack">
      <section className="page-card">
        <div className="section-heading">
          <div>
            <p className="page-kicker">新增紀錄頁</p>
            <h2>新增一筆離職紀錄</h2>
          </div>
          <p className="section-copy">
            請輸入標題、情緒與內容；儲存後會立即出現在列表與統計頁。
          </p>
        </div>

        <form className="record-form" onSubmit={handleSubmit}>
          <label className="field-group">
            <span>今天這筆紀錄的標題</span>
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

            <label className="field-group">
              <span>主要情緒</span>
              <select name="emotion" value={formData.emotion} onChange={handleChange}>
                <option value="" disabled>
                  請先選一個情緒
                </option>
                {emotionOptions.map((emotion) => (
                  <option key={emotion} value={emotion}>
                    {emotion}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="field-group">
            <span>標籤</span>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="例如：主管、薪水、工時、同事、制度"
            />
          </label>

          <label className="field-group">
            <span>想多說一點的內容</span>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="6"
              placeholder="把今天發生的事寫下來，之後才看得出哪些原因最常讓你想離職。"
            />
          </label>

          {message ? <p className="form-message">{message}</p> : null}

          <div className="form-actions">
            <button type="submit" className="primary-button">
              儲存這筆紀錄
            </button>
            <button type="button" className="secondary-button" onClick={handleReset}>
              清空內容
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
