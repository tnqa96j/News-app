import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const scrollMap = new Map<string, number>();

export function useScrollRestoration() {
  const location = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    if (navType === 'POP') {
      // 還原上次位置
      const saved = scrollMap.get(location.key);
      window.scrollTo(0, saved ?? 0);
    } else {
      // PUSH / REPLACE 捲到頂部
      window.scrollTo(0, 0);
    }

    // 離開前記錄當前位置
    return () => {
      scrollMap.set(location.key, window.scrollY);
    };
  }, [location.key, navType]);
}