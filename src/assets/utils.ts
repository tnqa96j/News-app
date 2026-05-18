import type { INews } from "@/types/news";
import { toast } from "sonner";
/* 手機號碼會用到的區域碼 */
const countryCodes = [
  { name: "Taiwan", code: "+886", iso: "TW", flag: "🇹🇼" },
  { name: "China", code: "+86", iso: "CN", flag: "🇨🇳" },
  { name: "Hong Kong", code: "+852", iso: "HK", flag: "🇭🇰" },
  { name: "Macau", code: "+853", iso: "MO", flag: "🇲🇴" },
  { name: "Japan", code: "+81", iso: "JP", flag: "🇯🇵" },
  { name: "Korea", code: "+82", iso: "KR", flag: "🇰🇷" },
  { name: "United States", code: "+1", iso: "US", flag: "🇺🇸" },
  { name: "United Kingdom", code: "+44", iso: "GB", flag: "🇬🇧" },
  { name: "Singapore", code: "+65", iso: "SG", flag: "🇸🇬" },
  { name: "Malaysia", code: "+60", iso: "MY", flag: "🇲🇾" },
  { name: "Vietnam", code: "+84", iso: "VN", flag: "🇻🇳" },
  { name: "Australia", code: "+61", iso: "AU", flag: "🇦🇺" },
  { name: "Canada", code: "+1", iso: "CA", flag: "🇨🇦" },
];

/* 處理錯誤訊息 */
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "There is an unknown error occurred";
};

// 設定具備有效期的localStorage儲存方案
interface StorageData<T> {
  time: number;
  value: T;
}
const storage = {
  /**
   * 儲存資料
   * @param key 鍵名
   * @param value 儲存的值（自動轉為JSON）
   */
  set<T>(key: string, value: T): void {
    const data: StorageData<T> = {
      time: Date.now(),
      value,
    };
    localStorage.setItem(key, JSON.stringify(data));
  },
  /**
   * 取得資料
   * @param key 鍵名
   * @param cycle 有效期(毫秒)，預設30天
   */
  get<T>(key: string, cycle: number = 2592000000): T | null {
    const dataStr = localStorage.getItem(key);
    if (!dataStr) return null;

    try {
      const { time, value }: StorageData<T> = JSON.parse(dataStr);

      // 檢查是否超過有效期
      if (Date.now() - time > cycle) {
        this.remove(key);
        return null;
      }
      return value;
    } catch (error) {
      console.log(getErrorMessage(error));
      return null;
    }
  },
  /**
   * 移除資料
   * @param key 鍵名
   */
  remove(key: string): void {
    localStorage.removeItem(key);
  },
  /**
   * 清空所有儲存
   */
  clear(): void {
    localStorage.clear();
  },
};

/**
 * 日期格式化
 * @param time 輸入時間(ISO字串，yyyyMMdd字串，或Date物件)
 * @param template 格式模板，預設為"{0}年{1}月{2}日 {3}:{4}:{5}"
 */
const formatTime = (
  time: string | Date,
  template: string = "{0}年{1}月{2}日 {3}:{4}:{5}",
): string => {
  let timeStr: string = "";

  if (time instanceof Date) {
    // 將Date物件轉換為本地時間字串
    timeStr = time.toLocaleString("zh-TW", { hour12: false });
  } else if (typeof time === "string") {
    if (time.includes("T") || !isNaN(Date.parse(time))) {
      // 將ISO字串或標準日期字串轉換為本地時間字串
      timeStr = new Date(time).toLocaleString("zh-TW", { hour12: false });
    } else {
      // 一些已經預處理過的字串，例如:"20230826","2022#03#25"，先原封不動
      timeStr = time;
    }
  }

  let arr: string[] = [];
  const yyyyMMddReg = /^(\d{4})(\d{2})(\d{2})$/;
  if (yyyyMMddReg.test(timeStr)) {
    // 處理 8 位數格式字串(如：20260328)
    const match = yyyyMMddReg.exec(timeStr);
    if (match) {
      const [, y, m, d] = match;
      arr.push(y, m, d);
    }
  } else {
    // 提取所有數字部分(如: "2026/3/28 14:30:05" -> ["2026", "3", "28", "14", "30", "05"])
    arr = timeStr.match(/\d+/g) || [];
  }

  // 3. 模板替換
  return template.replace(/\{(\d+)\}/g, (_, indexStr: string) => {
    const index = parseInt(indexStr);
    let item = arr[index] || "00";
    // 補足兩位數(如"3" => "03")
    if (item.length < 2) item = "0" + item;

    return item;
  });
};

/* 計算相對時間 */
type RelativeUnit = "year" | "month" | "day" | "hour" | "minute" | "second";
interface Interval {
  unit: RelativeUnit;
  seconds: number;
}
const rtf = new Intl.RelativeTimeFormat("en", { numeric: "always" });
/**
 * 計算相對時間
 * @param dateStr 日期字串、時間戳或Date物件
 * @returns "xxx ago"字串
 */
const formatRelativeTime = (dateStr: string | number | Date): string => {
  const date = new Date(dateStr);
  const now = new Date();

  // 在TS中，Date相減需要轉為數字(使用.getTime()或Number()轉型)
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
  const absDiff = Math.abs(diffInSeconds);

  // 小於60秒
  if (absDiff < 60) return rtf.format(diffInSeconds, "second");

  const intervals: Interval[] = [
    { unit: "year", seconds: 31536000 },
    { unit: "month", seconds: 2592000 },
    { unit: "day", seconds: 86400 },
    { unit: "hour", seconds: 3600 },
    { unit: "minute", seconds: 60 },
  ];

  for (const { unit, seconds } of intervals) {
    const count = Math.trunc(diffInSeconds / seconds);
    if (Math.abs(count) >= 1) {
      return rtf.format(count, unit);
    }
  }
  return "just now";
};

/* 檢查是否為純物件 */
const isPlainObject = (obj: unknown): obj is Record<string, unknown> => {
  return Object.prototype.toString.call(obj) === "[object Object]";
};

/* 顯示錯誤訊息 */
const toastError = (title: string, description?: string) => {
  toast.warning(title, {
    description,
    position: "top-center",
    classNames: {
      description: "text-destructive!",
      title: "text-destructive!",
      icon: "text-destructive!",
    },
  });
};

/* 按照日期將News分組 */
interface StoryGroup {
  date: string;
  stories: INews[];
}

/**
 * 將INews扁平陣列中所有news依照date分類
 *
 * @param {INews[]} stories 扁平新聞陣列
 * @returns {StoryGroup[]} 以date分組的新聞陣列
 */
const groupStoriesByDate = (stories: INews[]): StoryGroup[] => {
  const map = new Map<string, INews[]>(); // key: date string, value: INews(那一天的所有新聞)

  stories.forEach((story) => {
    let dateKey = story.publishedAt.slice(0, 10);
    dateKey = formatTime(dateKey, "{0}{1}{2}");

    if (!map.has(dateKey)) map.set(dateKey, []);
    map.get(dateKey)!.push(story);
  });

  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, stories]) => ({ date, stories }));
};

/**
 *
 *
 * @param {string} str
 * @returns {string}
 */
const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]]/g, "\\$&");
};

const MONTH_NAME: string[] = [
  "Empty",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
interface TimeObject {
  year: string | number;
  month: string;
  day: string | number;
}
/**
 * 取得具有特定格式的時間物件
 * @param time 時間
 * @returns TimeObject(特定格式的時間物件）
 */
const getformatTimeObject = (time: string | Date): TimeObject => {
  const TIME = formatTime(time, "{0}{1}{2}");
  const [, YEAR, MONTH, DAY] = TIME.match(/^(\d{4})(\d{2})(\d{2})$/) ?? [];
  return {
    year: YEAR,
    month: MONTH_NAME[+(MONTH ?? 0)],
    day: DAY,
  };
};

/**
 * 將純文字轉換成具有段落感的文字
 *
 * @param {(string | undefined)} text
 * @returns {string}
 */
const formatPlainTextBody = (text: string | undefined): string => {
  if (!text) return "";

  // 有換行就用換行斷段
  if (/\n{2,}/.test(text)) {
    return text
      .split(/\n{2,}/)
      .filter((p) => p.trim().length > 0)
      .map((p) => `<p>${p.trim().replace(/\n/g, "<br />")}</p>`)
      .join("");
  }

  // 沒有換行：用句號 + 空格斷句，每 4 句合成一段
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
  const SENTENCES_PER_PARAGRAPH = 4;
  const paragraphs: string[] = [];

  for (let i = 0; i < sentences.length; i += SENTENCES_PER_PARAGRAPH) {
    const chunk = sentences
      .slice(i, i + SENTENCES_PER_PARAGRAPH)
      .join(" ")
      .trim();
    if (chunk) paragraphs.push(`<p>${chunk}</p>`);
  }

  return paragraphs.join("") || `<p>${text}</p>`;
};

const getDateRange = (
  tag: string,
): { publishedAfter?: string; publishedBefore?: string } => {
  const now = new Date();

  if (tag.toLowerCase() === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return { publishedAfter: start.toISOString() };
  }

  if (tag.toLowerCase() === "yesterday") {
    const start = new Date(now);
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(0, 0, 0, 0);
    return {
      publishedAfter: start.toISOString(),
      publishedBefore: end.toISOString(),
    };
  }

  return {}; // All：不傳時間
};

export {
  countryCodes,
  getErrorMessage,
  storage,
  formatTime,
  formatRelativeTime,
  isPlainObject,
  toastError,
  groupStoriesByDate,
  escapeRegex,
  getformatTimeObject,
  formatPlainTextBody,
  getDateRange,
};
