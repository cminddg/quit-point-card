import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import AppShell from "./components/AppShell";
import { initialRecords, STORAGE_KEY, emotionOptions } from "./data/initialRecords";
import HomePage from "./pages/HomePage";
import AddRecordPage from "./pages/AddRecordPage";
import RecordsPage from "./pages/RecordsPage";
import StatsPage from "./pages/StatsPage";

function loadRecords() {
  const savedValue = window.localStorage.getItem(STORAGE_KEY);

  if (!savedValue) {
    return initialRecords;
  }

  try {
    const parsedRecords = JSON.parse(savedValue);
    return Array.isArray(parsedRecords) && parsedRecords.length > 0
      ? parsedRecords
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
    const newRecord = {
      id: crypto.randomUUID(),
      ...recordInput
    };

    setRecords((currentRecords) => [newRecord, ...currentRecords]);
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route
          path="/"
          element={<HomePage records={records} />}
        />
        <Route
          path="/add"
          element={<AddRecordPage addRecord={addRecord} emotionOptions={emotionOptions} />}
        />
        <Route
          path="/records"
          element={<RecordsPage records={records} emotionOptions={emotionOptions} />}
        />
        <Route
          path="/stats"
          element={<StatsPage records={records} emotionOptions={emotionOptions} />}
        />
      </Route>
    </Routes>
  );
}
