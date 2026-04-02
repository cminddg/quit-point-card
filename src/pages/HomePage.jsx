import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { formatDate } from "../utils/recordHelpers";
import { emotionOptions } from "../data/initialRecords";
import AddRecordPage from "./AddRecordPage";
import AnnouncementMarquee from "../components/AnnouncementMarquee";

const MAX_BASE_POINTS = 10;
const MAX_EXTRA_POINTS = 20;
const PUNCH_PROGRESS_KEY = "quit-point-card-punch-progress-v1";

const emotionEmojiMap = {
  煩躁: "😤",
  委屈: "🥺",
  疲憊: "🥱",
  麻木: "💀",
  "其實還好": "🙂"
};

const hardLifeButtons = ["貸款也要讓你離職 !!", "真的離職了吧!!", "賀!離職!!"];

function getDefaultProgress() {
  return {
    completedCards: [],
    currentTarget: MAX_BASE_POINTS,
    hardLifeStep: 0
  };
}

function loadPunchProgress() {
  if (typeof window === "undefined") {
    return getDefaultProgress();
  }

  try {
    const saved = window.localStorage.getItem(PUNCH_PROGRESS_KEY);
    if (!saved) {
      return getDefaultProgress();
    }

    const parsed = JSON.parse(saved);
    if (
      !parsed ||
      !Array.isArray(parsed.completedCards) ||
      typeof parsed.currentTarget !== "number" ||
      typeof parsed.hardLifeStep !== "number"
    ) {
      return getDefaultProgress();
    }

    return {
      completedCards: parsed.completedCards,
      currentTarget: parsed.currentTarget,
      hardLifeStep: parsed.hardLifeStep
    };
  } catch {
    return getDefaultProgress();
  }
}

function getRecordEmoji(record) {
  if (!record) {
    return "🫠";
  }

  return emotionEmojiMap[record.emotion] || record.emotion || "🫠";
}

export default function HomePage({ records, addRecord }) {
  const latestRecord = records[0];
  const [showInlineAddForm, setShowInlineAddForm] = useState(false);
  const [punchProgress, setPunchProgress] = useState(loadPunchProgress);
  const inlineAddSectionRef = useRef(null);

  useEffect(() => {
    window.localStorage.setItem(PUNCH_PROGRESS_KEY, JSON.stringify(punchProgress));
  }, [punchProgress]);

  useEffect(() => {
    if (!showInlineAddForm || !inlineAddSectionRef.current) {
      return;
    }

    const timer = window.setTimeout(() => {
      inlineAddSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 40);

    return () => {
      window.clearTimeout(timer);
    };
  }, [showInlineAddForm]);

  const consumedPoints = useMemo(
    () =>
      punchProgress.completedCards.reduce(
        (total, card) => total + (typeof card.target === "number" ? card.target : MAX_BASE_POINTS),
        0
      ),
    [punchProgress.completedCards]
  );

  const currentTarget = Math.max(MAX_BASE_POINTS, Math.min(MAX_EXTRA_POINTS, punchProgress.currentTarget));
  const recordsInOrder = useMemo(() => [...records].reverse(), [records]);
  const rawCurrentPoints = Math.max(0, recordsInOrder.length - consumedPoints);
  const filledCount = Math.min(rawCurrentPoints, currentTarget);
  const isCurrentCardFull = rawCurrentPoints >= currentTarget;
  const isMaxTargetCard = currentTarget === MAX_EXTRA_POINTS;
  const currentCardRecords = recordsInOrder.slice(consumedPoints, consumedPoints + filledCount);

  const stampSlots = Array.from({ length: currentTarget }, (_, index) => {
    const isFilled = index < filledCount;
    return {
      index: index + 1,
      isFilled,
      emoji: isFilled ? getRecordEmoji(currentCardRecords[index]) : null
    };
  });

  const currentCardNumber = punchProgress.completedCards.length + 1;
  const hardshipButtonLabel = hardLifeButtons[Math.min(2, punchProgress.hardLifeStep)];

  function completeCurrentCard(stampType) {
    setPunchProgress((current) => {
      const nextCompletedCards = [
        ...current.completedCards,
        {
          target: current.currentTarget,
          stamp: stampType
        }
      ];

      return {
        completedCards: nextCompletedCards,
        currentTarget: MAX_BASE_POINTS,
        hardLifeStep: 0
      };
    });
  }

  function handleKeepTrying() {
    if (!isCurrentCardFull) {
      return;
    }

    setPunchProgress((current) => ({
      ...current,
      currentTarget: Math.min(MAX_EXTRA_POINTS, current.currentTarget + 5),
      hardLifeStep: 0
    }));
  }

  function handleHardLifeFlow() {
    if (!isCurrentCardFull || !isMaxTargetCard) {
      return;
    }

    setPunchProgress((current) => {
      if (current.hardLifeStep >= 2) {
        const nextCompletedCards = [
          ...current.completedCards,
          {
            target: current.currentTarget,
            stamp: "worker"
          }
        ];

        return {
          completedCards: nextCompletedCards,
          currentTarget: MAX_BASE_POINTS,
          hardLifeStep: 0
        };
      }

      return {
        ...current,
        hardLifeStep: current.hardLifeStep + 1
      };
    });
  }

  function handleToggleInlineAdd() {
    const willOpen = !showInlineAddForm;
    setShowInlineAddForm(willOpen);
  }

  return (
    <div className="page-stack">
      <AnnouncementMarquee />

      <section className="page-card punch-card">
        <div className="punch-card-header">
          <div className="punch-title-group">
            <h2>我的療癒離職集點卡</h2>
            <p className="punch-card-subtitle">每新增一筆破事就蓋一格章，辛苦了，每一筆都算數。</p>
          </div>
          <div className="punch-meta-pill">累積破事總數：{records.length} 筆</div>
        </div>

        <div className="stamp-board-wrap">
          <div className="stamp-board">
            <h3>
              <span className="stamp-progress-title">
                已集滿 <span className="stamp-progress-count">{filledCount}</span> / {currentTarget} 點
              </span>
            </h3>
            <p className="stamp-progress-subtitle">
              {isCurrentCardFull
                ? "滿點了，該做決定了。"
                : "再撐一下下，你正在累積自己的離職勇氣。"}
            </p>
            <p className="stamp-board-note">目前是第 {currentCardNumber} 張集點卡。</p>

            <div className="stamp-grid" aria-label="離職集點格">
              {stampSlots.map((slot) => (
                <div
                  key={slot.index}
                  className={slot.isFilled ? "stamp-slot stamp-slot-filled" : "stamp-slot"}
                >
                  {slot.isFilled ? (
                    <span className="stamp-emoji" role="img" aria-label="集點章">
                      {slot.emoji}
                    </span>
                  ) : (
                    <span className="stamp-index">{slot.index}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {isCurrentCardFull ? (
            <div className="stamp-overlay">
              <div className="overlay-inner">
                {!isMaxTargetCard ? (
                  <div className="overlay-buttons">
                    <button
                      type="button"
                      className="overlay-button overlay-button-success"
                      onClick={() => completeCurrentCard("good")}
                    >
                      成功離職
                    </button>
                    <button
                      type="button"
                      className="overlay-button overlay-button-effort"
                      onClick={handleKeepTrying}
                      disabled={currentTarget >= MAX_EXTRA_POINTS}
                    >
                      再努力一下
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="overlay-button overlay-button-hardlife"
                    onClick={handleHardLifeFlow}
                  >
                    {hardshipButtonLabel}
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </div>

        <div className="punch-actions">
          <button
            type="button"
            className="add-trouble-button"
            onClick={handleToggleInlineAdd}
          >
            ＋ 新增一筆破事
          </button>
          <Link className="secondary-button" to="/records">
            看紀錄列表
          </Link>
        </div>

        {punchProgress.completedCards.length > 0 ? (
          <div className="stamp-history">
            {punchProgress.completedCards.map((card, index) => (
              <span key={`${card.target}-${index}`} className="stamp-history-pill">
                第 {index + 1} 張：{card.stamp === "good" ? "好寶寶戳章" : "社畜戳章"}
              </span>
            ))}
          </div>
        ) : null}
      </section>

      {showInlineAddForm ? (
        <section ref={inlineAddSectionRef} className="page-card inline-add-card">
          <h2>新增紀錄</h2>
          <AddRecordPage
            addRecord={addRecord}
            emotionOptions={emotionOptions}
            inlineMode
            onRecordAdded={() => setShowInlineAddForm(true)}
          />
        </section>
      ) : null}

      <section className="page-card">
        <h2>最近一筆紀錄</h2>
        {latestRecord ? (
          <article className="latest-record-card">
            <div className="record-card-top">
              <div>
                <p className="record-date">{formatDate(latestRecord.date)}</p>
                <h3>{latestRecord.title}</h3>
              </div>
            </div>
            <p className="record-description">{latestRecord.description}</p>
            <div className="tag-row">
              {latestRecord.tags.map((tag) => (
                <span key={tag} className="tag-pill">
                  #{tag}
                </span>
              ))}
            </div>
          </article>
        ) : (
          <div className="empty-state">
            <h3>目前還沒有任何紀錄</h3>
            <p>你可以先在上方點「新增一筆破事」輸入第一筆，之後首頁、列表、統計都會一起更新。</p>
          </div>
        )}
      </section>
    </div>
  );
}
