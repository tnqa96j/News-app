import { useState, useEffect } from "react";

/* 判斷裝置寬度 */
export const useDeviceWidth = () => {
  const [device, setDevice] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });

  useEffect(() => {
    const mobileMql = window.matchMedia("(max-width: 767px)"),
      tabletMql = window.matchMedia(
        "(min-width: 768px) and (max-width: 1023px)",
      ),
      desktopMql = window.matchMedia("(min-width: 1024px)");

    const updateDevice = () => {
      setDevice({
        isMobile: mobileMql.matches,
        isTablet: tabletMql.matches,
        isDesktop: desktopMql.matches,
      });
    };

    updateDevice();
    mobileMql.addEventListener("change", updateDevice);
    tabletMql.addEventListener("change", updateDevice);
    desktopMql.addEventListener("change", updateDevice);

    return () => {
      mobileMql.removeEventListener("change", updateDevice);
      tabletMql.removeEventListener("change", updateDevice);
      desktopMql.removeEventListener("change", updateDevice);
    };
  }, []);

  return device;
};





/*
純函式(pure function)
function add(a, b) {
  return a + b;
}
=> 特點：不會影響到外面的變數
副作用(side effect)
一個函式除了「回傳值」以外，還對「外部世界」產生了任何可觀測的改變，那個改變就叫副作用
當函式執行時，動到了不屬於它內部的東西，常見副作用行為包括：
* 修改全域變數：動到了函式外面的資料
* 網路請求 (API Call)：去跟伺服器拿資料（改變了網路狀態）
* 操作 DOM：手動去改網頁上的 HTML 元素
* 計時器：設定 setTimeout 或 setInterval
* 印出 Log：console.log() 其實也是副作用，因為它把資訊輸出了控制台（外部系統）

React & 副作用
React核心是 UI = f(state) => 元件應該和純函式一樣，給它什麼props和state，就渲染出什麼樣的HTML
問題來了：如果我們在組件渲染的過程中，直接去寫一個 fetch 請求或 console.log，會發生什麼事？
A：因為 React 會頻繁地重新渲染（Re-render），如果副作用沒有被妥善管理，你的 API 可能會被重複呼叫幾千次，或者導致畫面跟資料對不起來
這就是為什麼React提供了兩個主要工具來「收容」這些副作用
1. useEffect：告訴 React：「請在畫面渲染完成後，再去執行這段副作用邏輯。」
2. 事件處理函式(Event handler)：使用者點了按鈕才觸發副作用，這也是被允許的
*/

/*
Utility Functions vs Custom Hooks
最核心的差異在於：邏輯是否觸碰到React的生命週期或狀態
1. 只有Hook才能呼叫其他Hook
    => 例如在useCommentInputSubmit中可能會呼叫useDispatch清空全域狀態、useLoading（另一個自定義Hooks）
2. 普通函式應該是「純函式」（給它輸入，它給回傳，不產生額外影響）
    => 但submit方法有會產生副作用的行為，例如：
        * 發送網路請求
        * 彈出Toast（更動DOM）
        * 改動React狀態
*/
