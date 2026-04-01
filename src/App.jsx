import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import AppShell from "./components/AppShell";
import { initialRecords, STORAGE_KEY, emotionOptions, tagOptions, extraEmojiOptions } from "./data/initialRecords";
import HomePage from "./pages/HomePage";
import RecordsPage from "./pages/RecordsPage";
import StatsPage from "./pages/StatsPage";

const legacyTagMap = {
  需求變動: "需求朝令夕改",
  加班: "燃燒生命大加班",
  溝通: "無效冗長會議",
  主管: "老闆畫大餅",
  薪水: "薪水太委屈",
  工時: "燃燒生命大加班",
  同事: "同事大雷包",
  制度: "心好累辦公室政治",
  背鍋: "替人背黑鍋",
  會議: "無效冗長會議",
  call: "下班奪命連環 Call",
  "下班 call": "下班奪命連環 Call"
};
const validEmotions = new Set([...emotionOptions, ...extraEmojiOptions]);

function normalizeTag(tag) {
  const value = String(tag ?? "").trim().replace(/^#+/, "");
  const mappedTag = legacyTagMap[value] || legacyTagMap[value.toLowerCase()] || value;
  return tagOptions.includes(mappedTag) ? mappedTag : "";
}

function normalizeRecord(record, index) {
  const rawTags = Array.isArray(record?.tags) ? record.tags : [];
  const normalizedTags = [...new Set(rawTags.map(normalizeTag).filter(Boolean))];
  const normalizedEmotion = String(record?.emotion || "").trim();

  return {
    id: String(record?.id || `legacy-${index}-${Date.now()}`),
    title: String(record?.title || "").trim(),
    date: String(record?.date || "").trim(),
    emotion: validEmotions.has(normalizedEmotion) ? normalizedEmotion : "",
    tags: normalizedTags,
    description: String(record?.description || "").trim()
  };
}

function normalizeRecords(records) {
  if (!Array.isArray(records)) {
    return [];
  }

  return records.map(normalizeRecord).filter((record) => record.title || record.description);
}

function loadRecords() {
  const savedValue = window.localStorage.getItem(STORAGE_KEY);

  if (!savedValue) {
    return initialRecords;
  }

  try {
    const parsedRecords = JSON.parse(savedValue);
    const normalizedRecords = normalizeRecords(parsedRecords);

    return normalizedRecords.length > 0
      ? normalizedRecords
      : initialRecords;
  } catch {
    return initialRecords;
  }
}

export default function App() {
  const [records, setRecords] = useState(loadRecords);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  function addRecord(recordInput) {
    const normalizedInput = normalizeRecord(recordInput, 0);
    const newRecord = {
      ...normalizedInput,
      id: crypto.randomUUID()
    };

    setRecords((currentRecords) => [newRecord, ...currentRecords]);
  }

  function updateRecord(recordId, recordInput) {
    setRecords((currentRecords) =>
      currentRecords.map((record) =>
        record.id === recordId
          ? {
            ...record,
            ...normalizeRecord(recordInput, 0),
            id: record.id
          }
          : record
      )
    );
  }

  function deleteRecord(recordId) {
    setRecords((currentRecords) => currentRecords.filter((record) => record.id !== recordId));
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route
          path="/"
          element={<HomePage records={records} addRecord={addRecord} />}
        />
        <Route
          path="/records"
          element={
            <RecordsPage
              records={records}
              emotionOptions={emotionOptions}
              updateRecord={updateRecord}
              deleteRecord={deleteRecord}
            />
          }
        />
        <Route
          path="/stats"
          element={<StatsPage records={records} emotionOptions={emotionOptions} />}
        />
      </Route>
    </Routes>
  );
}
