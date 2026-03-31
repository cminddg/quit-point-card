export function formatDate(dateString) {
  if (!dateString) {
    return "未填日期";
  }

  const [year, month, day] = dateString.split("-");
  return `${year}/${month}/${day}`;
}

export function parseTags(tagInput) {
  return tagInput
    .split(/[,\s、，]+/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function getTopItem(items) {
  if (items.length === 0) {
    return "尚無資料";
  }

  return items.reduce((topItem, item) => {
    if (item.count > topItem.count) {
      return item;
    }

    return topItem;
  }, items[0]).label;
}

export function buildCountList(values) {
  const counts = values.reduce((result, value) => {
    result[value] = (result[value] || 0) + 1;
    return result;
  }, {});

  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "zh-Hant"));
}

export function getEmotionStats(records, emotionOptions) {
  return emotionOptions.map((emotion) => ({
    label: emotion,
    count: records.filter((record) => record.emotion === emotion).length
  }));
}

export function getTagStats(records) {
  return buildCountList(records.flatMap((record) => record.tags));
}
