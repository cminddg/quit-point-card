import { useEffect, useMemo, useState } from "react";

const SHEET_ID = "1UEx7VQplf_RB3XxHaBAhsdDCswqQ0nsN";
const ROTATE_INTERVAL_MS = 7000;
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const FALLBACK_MESSAGES = ["公告載入中，請稍候。"];

function parseFirstCell(line) {
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === "\"") {
      if (inQuotes && line[i + 1] === "\"") {
        value += "\"";
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === ",") {
      break;
    }

    value += char;
  }

  return value.trim();
}

function looksLikeHeader(cell) {
  return /^(內容|公告|文案|文字|message|text|title)$/i.test(cell);
}

function parseMessagesFromCsv(csvText) {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [];
  }

  const messages = lines.map(parseFirstCell).map((cell) => cell.trim()).filter(Boolean);
  if (messages.length > 1 && looksLikeHeader(messages[0])) {
    messages.shift();
  }

  return messages;
}

async function fetchSheetMessages() {
  const endpoints = [
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`,
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=0`
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      if (!response.ok) {
        continue;
      }

      const csvText = await response.text();
      const messages = parseMessagesFromCsv(csvText);
      if (messages.length > 0) {
        return messages;
      }
    } catch {
      // Try the next endpoint if this one fails.
    }
  }

  return FALLBACK_MESSAGES;
}

export default function AnnouncementMarquee() {
  const [messages, setMessages] = useState(FALLBACK_MESSAGES);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function loadMessages() {
      const nextMessages = await fetchSheetMessages();
      if (isActive) {
        setMessages(nextMessages);
      }
    }

    loadMessages();
    const refreshTimer = window.setInterval(loadMessages, REFRESH_INTERVAL_MS);

    return () => {
      isActive = false;
      window.clearInterval(refreshTimer);
    };
  }, []);

  useEffect(() => {
    if (messages.length <= 1) {
      return undefined;
    }

    const rotateTimer = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % messages.length);
    }, ROTATE_INTERVAL_MS);

    return () => {
      window.clearInterval(rotateTimer);
    };
  }, [messages]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [messages]);

  const currentMessage = useMemo(
    () => messages[currentIndex] || FALLBACK_MESSAGES[0],
    [messages, currentIndex]
  );

  return (
    <section className="marquee-banner" aria-live="polite">
      <span className="marquee-icon" role="img" aria-label="大聲公告">
        📢
      </span>
      <div className="marquee-viewport">
        <p key={`${currentIndex}-${currentMessage}`} className="marquee-text">
          {currentMessage}
        </p>
      </div>
    </section>
  );
}
